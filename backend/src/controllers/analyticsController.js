const db = require('../config/db');
const { calculateSafeSpend } = require('../utils/safeSpend');

/**
 * Validate YYYY-MM month format
 */
function isValidMonth(monthStr) {
  return /^\d{4}-\d{2}$/.test(monthStr);
}

/**
 * Validate YYYY-MM-DD date format
 */
function isValidDate(dateStr) {
  const regEx = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateStr || !dateStr.match(regEx)) return false;
  const d = new Date(dateStr);
  const dNum = d.getTime();
  if (!dNum && dNum !== 0) return false;
  return d.toISOString().slice(0, 10) === dateStr;
}

/**
 * Monthly income, expenses, net balance, and category breakdown
 * GET /api/analytics/summary
 */
async function getSummary(req, res) {
  const userId = req.user.id;
  const currentMonth = new Date().toISOString().slice(0, 7);
  const targetMonth = req.query.month || currentMonth;

  if (!isValidMonth(targetMonth)) {
    return res.status(400).json({
      success: false,
      message: 'Month must be in YYYY-MM format.',
    });
  }

  try {
    // 1. Fetch totals grouped by type for the requested month
    const totals = await db.query(
      `SELECT 
        type, 
        CAST(COALESCE(SUM(amount), 0) AS DOUBLE) AS total 
      FROM transactions 
      WHERE user_id = ? AND DATE_FORMAT(transaction_date, '%Y-%m') = ? 
      GROUP BY type`,
      [userId, targetMonth]
    );

    let totalIncome = 0;
    let totalExpenses = 0;

    if (Array.isArray(totals)) {
      for (const row of totals) {
        if (row.type === 'income') {
          totalIncome = Number(row.total);
        } else if (row.type === 'expense') {
          totalExpenses = Number(row.total);
        }
      }
    }

    const netBalance = Number((totalIncome - totalExpenses).toFixed(2));

    // 2. Fetch category breakdown for this month
    const categoryBreakdown = await db.query(
      `SELECT 
        c.id AS category_id, 
        c.name AS category_name, 
        c.type AS category_type, 
        c.icon AS category_icon, 
        c.color_hex AS category_color, 
        CAST(COALESCE(SUM(t.amount), 0) AS DOUBLE) AS total_amount, 
        COUNT(t.id) AS transaction_count 
      FROM transactions t 
      JOIN categories c ON t.category_id = c.id 
      WHERE t.user_id = ? AND DATE_FORMAT(t.transaction_date, '%Y-%m') = ? 
      GROUP BY c.id, c.name, c.type, c.icon, c.color_hex 
      ORDER BY total_amount DESC`,
      [userId, targetMonth]
    );

    return res.status(200).json({
      success: true,
      data: {
        month: targetMonth,
        total_income: Number(totalIncome.toFixed(2)),
        total_expenses: Number(totalExpenses.toFixed(2)),
        net_balance: netBalance,
        category_breakdown: categoryBreakdown || [],
      },
    });
  } catch (error) {
    console.error('Error fetching analytics summary:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while generating analytics summary.',
    });
  }
}

/**
 * Execute Safe-to-Spend burn calculation based on AGENT.md rules
 * GET /api/analytics/safe-to-spend
 */
async function getSafeToSpend(req, res) {
  const userId = req.user.id;
  const now = new Date();
  const currentMonth = now.toISOString().slice(0, 7);
  const targetMonth = req.query.month || currentMonth;

  if (!isValidMonth(targetMonth)) {
    return res.status(400).json({
      success: false,
      message: 'Month must be in YYYY-MM format.',
    });
  }

  // Optional custom reference date for testing or historical calculations
  let evalDate = now;
  if (req.query.date) {
    if (!isValidDate(req.query.date)) {
      return res.status(400).json({
        success: false,
        message: 'Date must be in YYYY-MM-DD format.',
      });
    }
    evalDate = new Date(`${req.query.date}T00:00:00Z`);
  }

  try {
    // 1. Fetch total income and expenses recorded this month
    const totals = await db.query(
      `SELECT 
        type, 
        CAST(COALESCE(SUM(amount), 0) AS DOUBLE) AS total 
      FROM transactions 
      WHERE user_id = ? AND DATE_FORMAT(transaction_date, '%Y-%m') = ? 
      GROUP BY type`,
      [userId, targetMonth]
    );

    let recordedIncome = 0;
    let recordedExpenses = 0;

    if (Array.isArray(totals)) {
      for (const row of totals) {
        if (row.type === 'income') {
          recordedIncome = Number(row.total);
        } else if (row.type === 'expense') {
          recordedExpenses = Number(row.total);
        }
      }
    }

    // 2. Fetch budget to retrieve reserved fixed bills and allowance
    const budgets = await db.query(
      `SELECT 
        CAST(total_allowance AS DOUBLE) AS total_allowance, 
        CAST(fixed_bills AS DOUBLE) AS fixed_bills 
      FROM budgets 
      WHERE user_id = ? AND month_year = ? 
      LIMIT 1`,
      [userId, targetMonth]
    );

    let fixedBills = 0;
    let allowance = 0;

    if (budgets && budgets.length > 0) {
      fixedBills = Number(budgets[0].fixed_bills) || 0;
      allowance = Number(budgets[0].total_allowance) || 0;
    }

    // If custom fixed_bills is explicitly passed via query parameter, override budget
    if (req.query.fixed_bills !== undefined) {
      const parsedFixed = parseFloat(req.query.fixed_bills);
      if (!isNaN(parsedFixed) && parsedFixed >= 0) {
        fixedBills = parsedFixed;
      }
    }

    // Effective income considers recorded transactions first; if 0, falls back to budget allowance
    const effectiveIncome = recordedIncome > 0 ? recordedIncome : allowance;

    // 3. Execute core algorithm from AGENT.md
    const result = calculateSafeSpend(effectiveIncome, recordedExpenses, fixedBills, evalDate);

    return res.status(200).json({
      success: true,
      data: {
        month: targetMonth,
        calculation_date: evalDate.toISOString().slice(0, 10),
        total_income: Number(effectiveIncome.toFixed(2)),
        total_expenses: Number(recordedExpenses.toFixed(2)),
        fixed_bills: Number(fixedBills.toFixed(2)),
        current_balance: result.currentBalance,
        discretionary_pool: result.discretionaryPool,
        days_remaining: result.daysRemaining,
        daily_safe_spend: result.dailySafeSpend,
        health_status: result.healthStatus,
      },
    });
  } catch (error) {
    console.error('Error calculating safe-to-spend:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while calculating safe-to-spend limit.',
    });
  }
}

module.exports = {
  getSummary,
  getSafeToSpend,
};

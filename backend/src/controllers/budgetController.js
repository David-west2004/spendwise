const db = require('../config/db');

/**
 * Validate YYYY-MM month format
 */
function isValidMonth(monthStr) {
  return /^\d{4}-\d{2}$/.test(monthStr);
}

/**
 * Fetch budget for authenticated user for target month (defaults to current month)
 * GET /api/budgets
 */
async function getBudget(req, res) {
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
    const budgets = await db.query(
      `SELECT 
        id, 
        user_id, 
        month_year, 
        CAST(total_allowance AS DOUBLE) AS total_allowance, 
        CAST(fixed_bills AS DOUBLE) AS fixed_bills, 
        created_at 
      FROM budgets 
      WHERE user_id = ? AND month_year = ? 
      LIMIT 1`,
      [userId, targetMonth]
    );

    if (budgets && budgets.length > 0) {
      return res.status(200).json({
        success: true,
        data: {
          budget: budgets[0],
        },
      });
    }

    // If no budget record exists yet for this month, return default 0 structure
    return res.status(200).json({
      success: true,
      data: {
        budget: {
          month_year: targetMonth,
          total_allowance: 0,
          fixed_bills: 0,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching budget:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while fetching budget.',
    });
  }
}

/**
 * Upsert budget for target month
 * POST /api/budgets
 */
async function setBudget(req, res) {
  const userId = req.user.id;
  const currentMonth = new Date().toISOString().slice(0, 7);
  const { month_year = currentMonth, total_allowance = 0, fixed_bills = 0 } = req.body;

  if (!isValidMonth(month_year)) {
    return res.status(400).json({
      success: false,
      message: 'Month must be in YYYY-MM format.',
    });
  }

  const allowanceNum = parseFloat(total_allowance);
  const billsNum = parseFloat(fixed_bills);

  if (isNaN(allowanceNum) || allowanceNum < 0) {
    return res.status(400).json({
      success: false,
      message: 'total_allowance must be a non-negative number.',
    });
  }

  if (isNaN(billsNum) || billsNum < 0) {
    return res.status(400).json({
      success: false,
      message: 'fixed_bills must be a non-negative number.',
    });
  }

  try {
    // Insert or update on duplicate key (user_id, month_year)
    await db.query(
      `INSERT INTO budgets (user_id, month_year, total_allowance, fixed_bills)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
         total_allowance = VALUES(total_allowance), 
         fixed_bills = VALUES(fixed_bills)`,
      [userId, month_year, allowanceNum, billsNum]
    );

    const [budget] = await db.query(
      `SELECT 
        id, 
        user_id, 
        month_year, 
        CAST(total_allowance AS DOUBLE) AS total_allowance, 
        CAST(fixed_bills AS DOUBLE) AS fixed_bills, 
        created_at 
      FROM budgets 
      WHERE user_id = ? AND month_year = ? 
      LIMIT 1`,
      [userId, month_year]
    );

    return res.status(200).json({
      success: true,
      data: {
        budget,
      },
      message: 'Budget updated successfully.',
    });
  } catch (error) {
    console.error('Error updating budget:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while updating budget.',
    });
  }
}

module.exports = {
  getBudget,
  setBudget,
};

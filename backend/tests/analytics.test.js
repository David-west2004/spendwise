const assert = require('assert');
const { getSummary, getSafeToSpend } = require('../src/controllers/analyticsController');
const { calculateSafeSpend } = require('../src/utils/safeSpend');
const db = require('../src/config/db');

// Mock response creator
function createMockRes() {
  const res = {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    },
  };
  return res;
}

async function runTests() {
  console.log('--- Running Analytics & Safe-to-Spend Tests ---');

  const originalQuery = db.query;

  try {
    // 1. Direct unit test of Safe-to-Spend algorithm rules from AGENT.md
    console.log('Testing Safe-to-Spend formula logic directly...');

    // Scenario A: High income, healthy surplus -> ON_TRACK
    // 30-day month (e.g. Sept), Sept 20 -> 11 days remaining (30 - 20 + 1)
    // Balance: 100,000 - 20,000 = 80,000; Fixed bills: 10,000 -> Pool: 70,000
    // Daily safe spend: 70,000 / 11 = 6363.64 >= 1000 -> ON_TRACK
    const testDateSept20 = new Date(2026, 8, 20); // Sept is month index 8
    const onTrack = calculateSafeSpend(100000, 20000, 10000, testDateSept20);
    assert.strictEqual(onTrack.currentBalance, 80000);
    assert.strictEqual(onTrack.discretionaryPool, 70000);
    assert.strictEqual(onTrack.daysRemaining, 11);
    assert.strictEqual(onTrack.dailySafeSpend, 6363.64);
    assert.strictEqual(onTrack.healthStatus, 'ON_TRACK');
    console.log('✔ Scenario A: High income produces ON_TRACK status');

    // Scenario B: Low discretionary pool -> CAUTION (dailySafeSpend < 1000)
    // Balance: 20,000 - 15,000 = 5,000; Fixed bills: 0 -> Pool: 5,000
    // Daily safe spend: 5,000 / 11 = 454.55 (< 1000) -> CAUTION
    const caution = calculateSafeSpend(20000, 15000, 0, testDateSept20);
    assert.strictEqual(caution.currentBalance, 5000);
    assert.strictEqual(caution.discretionaryPool, 5000);
    assert.strictEqual(caution.dailySafeSpend, 454.55);
    assert.strictEqual(caution.healthStatus, 'CAUTION');
    console.log('✔ Scenario B: Low discretionary spend (<1000 NGN) produces CAUTION status');

    // Scenario C: Expenses exceed income -> DEFICIT
    // Balance: 20,000 - 25,000 = -5,000 <= 0 -> DEFICIT
    const deficit1 = calculateSafeSpend(20000, 25000, 0, testDateSept20);
    assert.strictEqual(deficit1.currentBalance, -5000);
    assert.strictEqual(deficit1.dailySafeSpend, 0);
    assert.strictEqual(deficit1.healthStatus, 'DEFICIT');
    console.log('✔ Scenario C: Negative balance produces DEFICIT status');

    // Scenario D: Fixed bills exceed balance -> DEFICIT
    // Balance: 30,000 - 20,000 = 10,000; Fixed bills: 15,000 -> Pool: -5,000 <= 0 -> DEFICIT
    const deficit2 = calculateSafeSpend(30000, 20000, 15000, testDateSept20);
    assert.strictEqual(deficit2.currentBalance, 10000);
    assert.strictEqual(deficit2.discretionaryPool, -5000);
    assert.strictEqual(deficit2.dailySafeSpend, 0);
    assert.strictEqual(deficit2.healthStatus, 'DEFICIT');
    console.log('✔ Scenario D: Discretionary pool <= 0 produces DEFICIT status');

    // 2. Controller Test: getSummary
    console.log('Testing getSummary controller endpoint...');
    let summaryUserChecked = null;
    db.query = async (sql, params) => {
      summaryUserChecked = params[0];
      if (sql.includes('GROUP BY type')) {
        return [
          { type: 'income', total: 120000.0 },
          { type: 'expense', total: 45000.0 },
        ];
      }
      if (sql.includes('GROUP BY c.id')) {
        return [
          {
            category_id: 1,
            category_name: 'Food & Cafeteria',
            category_type: 'expense',
            icon: 'utensils',
            color_hex: '#ef4444',
            total_amount: 30000.0,
            transaction_count: 5,
          },
        ];
      }
      return [];
    };

    const reqSummary = {
      user: { id: 'tenant-user-123' },
      query: { month: '2026-09' },
    };
    const resSummary = createMockRes();

    await getSummary(reqSummary, resSummary);

    assert.strictEqual(resSummary.statusCode, 200);
    assert.strictEqual(resSummary.body.success, true);
    assert.strictEqual(resSummary.body.data.total_income, 120000.0);
    assert.strictEqual(resSummary.body.data.total_expenses, 45000.0);
    assert.strictEqual(resSummary.body.data.net_balance, 75000.0);
    assert.strictEqual(resSummary.body.data.category_breakdown.length, 1);
    assert.strictEqual(summaryUserChecked, 'tenant-user-123', 'Tenant isolation must be maintained');
    console.log('✔ getSummary correctly aggregates income, expenses, net balance, and breakdown');

    // 3. Controller Test: getSafeToSpend
    console.log('Testing getSafeToSpend controller endpoint...');
    db.query = async (sql, params) => {
      if (sql.includes('GROUP BY type')) {
        return [
          { type: 'income', total: 90000.0 },
          { type: 'expense', total: 20000.0 },
        ];
      }
      if (sql.includes('FROM budgets')) {
        return [
          { total_allowance: 90000.0, fixed_bills: 15000.0 },
        ];
      }
      return [];
    };

    const reqSafeSpend = {
      user: { id: 'tenant-user-123' },
      query: { month: '2026-09', date: '2026-09-20' },
    };
    const resSafeSpend = createMockRes();

    await getSafeToSpend(reqSafeSpend, resSafeSpend);

    assert.strictEqual(resSafeSpend.statusCode, 200);
    assert.strictEqual(resSafeSpend.body.success, true);
    // Income: 90,000, Expense: 20,000 -> Balance: 70,000; Fixed: 15,000 -> Pool: 55,000
    // Sept 20 -> 11 days remaining -> 55,000 / 11 = 5,000
    assert.strictEqual(resSafeSpend.body.data.total_income, 90000.0);
    assert.strictEqual(resSafeSpend.body.data.total_expenses, 20000.0);
    assert.strictEqual(resSafeSpend.body.data.fixed_bills, 15000.0);
    assert.strictEqual(resSafeSpend.body.data.current_balance, 70000.0);
    assert.strictEqual(resSafeSpend.body.data.discretionary_pool, 55000.0);
    assert.strictEqual(resSafeSpend.body.data.days_remaining, 11);
    assert.strictEqual(resSafeSpend.body.data.daily_safe_spend, 5000.0);
    assert.strictEqual(resSafeSpend.body.data.health_status, 'ON_TRACK');
    console.log('✔ getSafeToSpend controller produces accurate payload and health status');

    console.log('--- All Analytics Tests Passed Successfully! ---');
  } finally {
    db.query = originalQuery;
  }
}

runTests().catch((err) => {
  console.error('Analytics test failed:', err);
  process.exit(1);
});

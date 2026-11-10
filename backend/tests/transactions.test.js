const assert = require('assert');
const {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
} = require('../src/controllers/transactionController');
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
  console.log('--- Running Transaction Controller & Tenant Isolation Tests ---');

  // Save original db.query
  const originalQuery = db.query;

  try {
    // 1. Test Tenant Isolation in getTransactions
    let lastQuerySql = '';
    let lastQueryParams = [];

    db.query = async (sql, params) => {
      lastQuerySql = sql;
      lastQueryParams = params;
      if (sql.includes('COUNT(*)')) {
        return [{ total: 1 }];
      }
      return [
        {
          id: 1,
          user_id: 'user-tenant-A',
          category_id: 10,
          amount: 5000.0,
          type: 'expense',
          description: 'Books',
          transaction_date: '2026-09-15',
          category_name: 'Course Handouts & Books',
        },
      ];
    };

    const reqUserA = {
      user: { id: 'user-tenant-A' },
      query: { month: '2026-09', type: 'expense', page: '1', limit: '10' },
    };
    const resA = createMockRes();

    await getTransactions(reqUserA, resA);

    assert.strictEqual(resA.statusCode, 200);
    assert.strictEqual(resA.body.success, true);
    assert.strictEqual(resA.body.data.transactions.length, 1);
    assert(lastQuerySql.includes('t.user_id = ?'), 'SQL must strictly filter by t.user_id = ?');
    assert.strictEqual(lastQueryParams[0], 'user-tenant-A', 'First param must be req.user.id');
    console.log('✔ getTransactions strictly filters by req.user.id');

    // 2. Test Tenant Isolation in getTransactionById
    db.query = async (sql, params) => {
      // Simulate transaction owned by tenant A when tenant B requests it
      const [txId, userId] = params;
      if (userId === 'user-tenant-B') {
        return []; // Not found for tenant B
      }
      return [{ id: txId, user_id: 'user-tenant-A', amount: 2500 }];
    };

    const reqUserB = {
      user: { id: 'user-tenant-B' },
      params: { id: '1' },
    };
    const resB = createMockRes();

    await getTransactionById(reqUserB, resB);

    assert.strictEqual(resB.statusCode, 404, 'Tenant B should receive 404 for Tenant A transaction');
    assert.strictEqual(resB.body.success, false);
    assert.strictEqual(resB.body.message, 'Transaction not found.');
    console.log('✔ getTransactionById prevents cross-tenant access');

    // 3. Test Validation: Negative Amount
    const reqNegative = {
      user: { id: 'user-tenant-A' },
      body: { amount: -500, category_id: 1, type: 'expense' },
    };
    const resNegative = createMockRes();
    await createTransaction(reqNegative, resNegative);
    assert.strictEqual(resNegative.statusCode, 400);
    assert.strictEqual(resNegative.body.success, false);
    console.log('✔ createTransaction rejects negative amount');

    // 4. Test Validation: Invalid Type
    const reqInvalidType = {
      user: { id: 'user-tenant-A' },
      body: { amount: 1500, category_id: 1, type: 'crypto' },
    };
    const resInvalidType = createMockRes();
    await createTransaction(reqInvalidType, resInvalidType);
    assert.strictEqual(resInvalidType.statusCode, 400);
    assert.strictEqual(resInvalidType.body.success, false);
    console.log('✔ createTransaction rejects invalid type');

    // 5. Test Tenant Isolation in deleteTransaction
    db.query = async (sql, params) => {
      // If user is tenant B trying to delete tenant A's transaction
      if (params[1] === 'user-tenant-B') {
        return { affectedRows: 0 };
      }
      return { affectedRows: 1 };
    };

    const reqDeleteB = {
      user: { id: 'user-tenant-B' },
      params: { id: '1' },
    };
    const resDeleteB = createMockRes();
    await deleteTransaction(reqDeleteB, resDeleteB);
    assert.strictEqual(resDeleteB.statusCode, 404, 'Cannot delete other tenant transaction');
    assert.strictEqual(resDeleteB.body.success, false);

    const reqDeleteA = {
      user: { id: 'user-tenant-A' },
      params: { id: '1' },
    };
    const resDeleteA = createMockRes();
    await deleteTransaction(reqDeleteA, resDeleteA);
    assert.strictEqual(resDeleteA.statusCode, 200);
    assert.strictEqual(resDeleteA.body.success, true);
    console.log('✔ deleteTransaction guards tenant boundary');

    console.log('--- All Transaction Tests Passed Successfully! ---');
  } finally {
    // Restore original db.query
    db.query = originalQuery;
  }
}

runTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});

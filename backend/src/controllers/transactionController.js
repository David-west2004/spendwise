const db = require('../config/db');

/**
 * Validate YYYY-MM-DD date format
 */
function isValidDate(dateString) {
  const regEx = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateString || !dateString.match(regEx)) return false;
  const d = new Date(dateString);
  const dNum = d.getTime();
  if (!dNum && dNum !== 0) return false;
  return d.toISOString().slice(0, 10) === dateString;
}

/**
 * Create a new transaction
 * POST /api/transactions
 */
async function createTransaction(req, res) {
  const userId = req.user.id;
  const { amount, category_id, type, description, date, transaction_date } = req.body;

  // 1. Amount validation
  const parsedAmount = parseFloat(amount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Amount must be a positive number greater than 0.',
    });
  }
  const formattedAmount = Number(parsedAmount.toFixed(2));

  // 2. Type validation
  if (!type || !['income', 'expense'].includes(type.toLowerCase())) {
    return res.status(400).json({
      success: false,
      message: "Transaction type must be either 'income' or 'expense'.",
    });
  }
  const normalizedType = type.toLowerCase();

  // 3. Category validation
  const parsedCategoryId = parseInt(category_id, 10);
  if (isNaN(parsedCategoryId)) {
    return res.status(400).json({
      success: false,
      message: 'Valid category_id is required.',
    });
  }

  // Ensure category belongs to current tenant or is a system-wide default
  const categories = await db.query(
    'SELECT id, name, type FROM categories WHERE id = ? AND (user_id = ? OR user_id IS NULL) LIMIT 1',
    [parsedCategoryId, userId]
  );

  if (categories.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Category not found or inaccessible.',
    });
  }

  // Check category type matches transaction type
  if (categories[0].type !== normalizedType) {
    return res.status(400).json({
      success: false,
      message: `Category "${categories[0].name}" is configured for ${categories[0].type}, but transaction is ${normalizedType}.`,
    });
  }

  // 4. Date validation
  const txDate = transaction_date || date || new Date().toISOString().slice(0, 10);
  if (!isValidDate(txDate)) {
    return res.status(400).json({
      success: false,
      message: 'Transaction date must be in YYYY-MM-DD format.',
    });
  }

  // 5. Description handling
  const cleanDescription = description && typeof description === 'string' ? description.trim() : null;

  try {
    const insertResult = await db.query(
      'INSERT INTO transactions (user_id, category_id, amount, type, description, transaction_date) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, parsedCategoryId, formattedAmount, normalizedType, cleanDescription, txDate]
    );

    // Fetch the newly created record with category metadata
    const [newTransaction] = await db.query(
      `SELECT 
        t.id, 
        t.user_id, 
        t.category_id, 
        CAST(t.amount AS DOUBLE) AS amount, 
        t.type, 
        t.description, 
        DATE_FORMAT(t.transaction_date, '%Y-%m-%d') AS transaction_date, 
        t.created_at, 
        c.name AS category_name, 
        c.icon AS category_icon, 
        c.color_hex AS category_color 
      FROM transactions t 
      JOIN categories c ON t.category_id = c.id 
      WHERE t.id = ? AND t.user_id = ?`,
      [insertResult.insertId, userId]
    );

    return res.status(201).json({
      success: true,
      data: {
        transaction: newTransaction,
      },
    });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while creating transaction.',
    });
  }
}

/**
 * List transactions for the authenticated user with optional filtering and pagination
 * GET /api/transactions
 */
async function getTransactions(req, res) {
  const userId = req.user.id;
  const { month, category_id, type, page = 1, limit = 20 } = req.query;

  const parsedPage = Math.max(parseInt(page, 10) || 1, 1);
  const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
  const offset = (parsedPage - 1) * parsedLimit;

  // Build filtered query strictly scoping to tenant user_id
  const whereClauses = ['t.user_id = ?'];
  const queryParams = [userId];

  // Month filter (YYYY-MM)
  if (month) {
    if (!/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({
        success: false,
        message: 'Month filter must be in YYYY-MM format.',
      });
    }
    whereClauses.push("DATE_FORMAT(t.transaction_date, '%Y-%m') = ?");
    queryParams.push(month);
  }

  // Category filter
  if (category_id) {
    const parsedCatId = parseInt(category_id, 10);
    if (!isNaN(parsedCatId)) {
      whereClauses.push('t.category_id = ?');
      queryParams.push(parsedCatId);
    }
  }

  // Type filter
  if (type) {
    const normalizedType = type.toLowerCase();
    if (['income', 'expense'].includes(normalizedType)) {
      whereClauses.push('t.type = ?');
      queryParams.push(normalizedType);
    }
  }

  const whereSql = whereClauses.join(' AND ');

  try {
    // 1. Get total count matching criteria
    const countResults = await db.query(
      `SELECT COUNT(*) AS total FROM transactions t WHERE ${whereSql}`,
      queryParams
    );
    const total = countResults && countResults[0] ? countResults[0].total : 0;

    // 2. Fetch paginated transactions with category metadata
    const selectParams = [...queryParams, parsedLimit, offset];
    const transactions = await db.query(
      `SELECT 
        t.id, 
        t.user_id, 
        t.category_id, 
        CAST(t.amount AS DOUBLE) AS amount, 
        t.type, 
        t.description, 
        DATE_FORMAT(t.transaction_date, '%Y-%m-%d') AS transaction_date, 
        t.created_at, 
        c.name AS category_name, 
        c.icon AS category_icon, 
        c.color_hex AS category_color 
      FROM transactions t 
      JOIN categories c ON t.category_id = c.id 
      WHERE ${whereSql} 
      ORDER BY t.transaction_date DESC, t.id DESC 
      LIMIT ? OFFSET ?`,
      selectParams
    );

    return res.status(200).json({
      success: true,
      data: {
        transactions: transactions || [],
        pagination: {
          total,
          page: parsedPage,
          limit: parsedLimit,
          totalPages: Math.ceil(total / parsedLimit),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while fetching transactions.',
    });
  }
}

/**
 * Get single transaction by ID for the authenticated user
 * GET /api/transactions/:id
 */
async function getTransactionById(req, res) {
  const userId = req.user.id;
  const transactionId = parseInt(req.params.id, 10);

  if (isNaN(transactionId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid transaction ID.',
    });
  }

  try {
    const transactions = await db.query(
      `SELECT 
        t.id, 
        t.user_id, 
        t.category_id, 
        CAST(t.amount AS DOUBLE) AS amount, 
        t.type, 
        t.description, 
        DATE_FORMAT(t.transaction_date, '%Y-%m-%d') AS transaction_date, 
        t.created_at, 
        c.name AS category_name, 
        c.icon AS category_icon, 
        c.color_hex AS category_color 
      FROM transactions t 
      JOIN categories c ON t.category_id = c.id 
      WHERE t.id = ? AND t.user_id = ? 
      LIMIT 1`,
      [transactionId, userId]
    );

    if (!transactions || transactions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found.',
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        transaction: transactions[0],
      },
    });
  } catch (error) {
    console.error('Error fetching transaction by ID:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while fetching transaction.',
    });
  }
}

/**
 * Update a transaction for the authenticated user
 * PUT /api/transactions/:id
 */
async function updateTransaction(req, res) {
  const userId = req.user.id;
  const transactionId = parseInt(req.params.id, 10);

  if (isNaN(transactionId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid transaction ID.',
    });
  }

  try {
    // 1. Check if transaction exists and belongs to this user
    const existing = await db.query(
      'SELECT id, category_id, amount, type, description, DATE_FORMAT(transaction_date, "%Y-%m-%d") AS transaction_date FROM transactions WHERE id = ? AND user_id = ? LIMIT 1',
      [transactionId, userId]
    );

    if (!existing || existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found.',
      });
    }

    const current = existing[0];
    const { amount, category_id, type, description, date, transaction_date } = req.body;

    // Validate updates
    let updatedAmount = current.amount;
    if (amount !== undefined) {
      const parsed = parseFloat(amount);
      if (isNaN(parsed) || parsed <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Amount must be a positive number greater than 0.',
        });
      }
      updatedAmount = Number(parsed.toFixed(2));
    }

    let updatedType = current.type;
    if (type !== undefined) {
      const normType = type.toLowerCase();
      if (!['income', 'expense'].includes(normType)) {
        return res.status(400).json({
          success: false,
          message: "Transaction type must be 'income' or 'expense'.",
        });
      }
      updatedType = normType;
    }

    let updatedCategoryId = current.category_id;
    if (category_id !== undefined) {
      const parsedCatId = parseInt(category_id, 10);
      if (isNaN(parsedCatId)) {
        return res.status(400).json({
          success: false,
          message: 'Valid category_id is required.',
        });
      }

      // Check category ownership
      const categories = await db.query(
        'SELECT id, name, type FROM categories WHERE id = ? AND (user_id = ? OR user_id IS NULL) LIMIT 1',
        [parsedCatId, userId]
      );

      if (!categories || categories.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Category not found or inaccessible.',
        });
      }

      if (categories[0].type !== updatedType) {
        return res.status(400).json({
          success: false,
          message: `Category "${categories[0].name}" is ${categories[0].type}, but transaction is ${updatedType}.`,
        });
      }

      updatedCategoryId = parsedCatId;
    }

    let updatedDate = current.transaction_date;
    const inputDate = transaction_date || date;
    if (inputDate !== undefined) {
      if (!isValidDate(inputDate)) {
        return res.status(400).json({
          success: false,
          message: 'Transaction date must be in YYYY-MM-DD format.',
        });
      }
      updatedDate = inputDate;
    }

    let updatedDescription = current.description;
    if (description !== undefined) {
      updatedDescription = description && typeof description === 'string' ? description.trim() : null;
    }

    // 2. Perform update strictly with WHERE id = ? AND user_id = ?
    await db.query(
      `UPDATE transactions 
       SET amount = ?, category_id = ?, type = ?, description = ?, transaction_date = ? 
       WHERE id = ? AND user_id = ?`,
      [updatedAmount, updatedCategoryId, updatedType, updatedDescription, updatedDate, transactionId, userId]
    );

    // 3. Return updated transaction with category metadata
    const [updatedTransaction] = await db.query(
      `SELECT 
        t.id, 
        t.user_id, 
        t.category_id, 
        CAST(t.amount AS DOUBLE) AS amount, 
        t.type, 
        t.description, 
        DATE_FORMAT(t.transaction_date, '%Y-%m-%d') AS transaction_date, 
        t.created_at, 
        c.name AS category_name, 
        c.icon AS category_icon, 
        c.color_hex AS category_color 
      FROM transactions t 
      JOIN categories c ON t.category_id = c.id 
      WHERE t.id = ? AND t.user_id = ?`,
      [transactionId, userId]
    );

    return res.status(200).json({
      success: true,
      data: {
        transaction: updatedTransaction,
      },
    });
  } catch (error) {
    console.error('Error updating transaction:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while updating transaction.',
    });
  }
}

/**
 * Delete a transaction strictly for the authenticated tenant
 * DELETE /api/transactions/:id
 */
async function deleteTransaction(req, res) {
  const userId = req.user.id;
  const transactionId = parseInt(req.params.id, 10);

  if (isNaN(transactionId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid transaction ID.',
    });
  }

  try {
    const result = await db.query(
      'DELETE FROM transactions WHERE id = ? AND user_id = ?',
      [transactionId, userId]
    );

    if (!result || result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Transaction deleted successfully.',
    });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while deleting transaction.',
    });
  }
}

module.exports = {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
};

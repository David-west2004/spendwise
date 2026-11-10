const db = require('../config/db');

/**
 * Fetch all categories (system defaults with user_id NULL + user-specific custom categories)
 * GET /api/categories
 */
async function getCategories(req, res) {
  const userId = req.user.id;
  const { type } = req.query;

  try {
    let sql = 'SELECT id, user_id, name, type, icon, color_hex FROM categories WHERE user_id = ? OR user_id IS NULL';
    const params = [userId];

    if (type && ['income', 'expense'].includes(type.toLowerCase())) {
      sql += ' AND type = ?';
      params.push(type.toLowerCase());
    }

    sql += ' ORDER BY name ASC';

    const categories = await db.query(sql, params);

    return res.status(200).json({
      success: true,
      data: {
        categories: categories || [],
      },
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while fetching categories.',
    });
  }
}

/**
 * Create a user custom category
 * POST /api/categories
 */
async function createCategory(req, res) {
  const userId = req.user.id;
  const { name, type, icon = 'tag', color_hex = '#157347' } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Category name is required.',
    });
  }

  if (!type || !['income', 'expense'].includes(type.toLowerCase())) {
    return res.status(400).json({
      success: false,
      message: "Category type must be 'income' or 'expense'.",
    });
  }

  const cleanName = name.trim();
  const normalizedType = type.toLowerCase();

  try {
    // Check if category with same name and type already exists for this user
    const existing = await db.query(
      'SELECT id, name, type FROM categories WHERE (user_id = ? OR user_id IS NULL) AND LOWER(name) = LOWER(?) AND type = ? LIMIT 1',
      [userId, cleanName, normalizedType]
    );

    if (existing && existing.length > 0) {
      return res.status(200).json({
        success: true,
        data: {
          category: existing[0],
        },
        message: 'Category already exists.',
      });
    }

    const result = await db.query(
      'INSERT INTO categories (user_id, name, type, icon, color_hex) VALUES (?, ?, ?, ?, ?)',
      [userId, cleanName, normalizedType, icon, color_hex]
    );

    const [newCategory] = await db.query(
      'SELECT id, user_id, name, type, icon, color_hex FROM categories WHERE id = ?',
      [result.insertId]
    );

    return res.status(201).json({
      success: true,
      data: {
        category: newCategory,
      },
    });
  } catch (error) {
    console.error('Error creating custom category:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while creating category.',
    });
  }
}

module.exports = {
  getCategories,
  createCategory,
};

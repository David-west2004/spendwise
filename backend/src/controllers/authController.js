const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool, query } = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'spendwise-dev-jwt-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const DEFAULT_CATEGORIES = [
  // Expense categories
  { name: 'Food & Cafeteria', type: 'expense', icon: 'utensils', color_hex: '#ef4444' },
  { name: 'Hostel & Rent', type: 'expense', icon: 'home', color_hex: '#f97316' },
  { name: 'Course Handouts & Books', type: 'expense', icon: 'book-open', color_hex: '#eab308' },
  { name: 'Transport & Shuttle', type: 'expense', icon: 'bus', color_hex: '#3b82f6' },
  { name: 'Data & Airtime', type: 'expense', icon: 'wifi', color_hex: '#8b5cf6' },
  { name: 'Entertainment & Snacks', type: 'expense', icon: 'film', color_hex: '#ec4899' },
  // Income categories
  { name: 'Monthly Allowance', type: 'income', icon: 'wallet', color_hex: '#10b981' },
  { name: 'Side Hustle', type: 'income', icon: 'briefcase', color_hex: '#14b8a6' },
  { name: 'Scholarship/Stipend', type: 'income', icon: 'award', color_hex: '#06b6d4' },
  { name: 'Gift', type: 'income', icon: 'gift', color_hex: '#84cc16' },
];

/**
 * Generate a signed JWT token
 */
function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      fullname: user.fullname,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/**
 * Register a new user
 * POST /api/auth/register
 */
async function register(req, res) {
  const { fullname, email, password, school, currency = 'NGN' } = req.body;

  // Validation
  if (!fullname || !fullname.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Full name is required.',
    });
  }

  if (!school || !school.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Institution / School is required.',
    });
  }

  if (!email || !email.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Email address is required.',
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid email address.',
    });
  }

  if (!password || password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters long.',
    });
  }

  const normalizedEmail = email.trim().toLowerCase();
  let connection;

  try {
    // Check if email already exists
    const existingUsers = await query(
      'SELECT id FROM users WHERE email = ? LIMIT 1',
      [normalizedEmail]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    // Encrypt password using bcryptjs
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Generate unique UUID v4 for the user
    const userId = crypto.randomUUID();
    const userCurrency = (currency || 'NGN').toUpperCase();

    // Use a transaction to create user and auto-seed default categories atomically
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // 1. Insert user
    await connection.query(
      'INSERT INTO users (id, fullname, email, password_hash, school, currency) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, fullname.trim(), normalizedEmail, passwordHash, school.trim(), userCurrency]
    );

    // 2. Auto-seed default categories for this user
    const categoryValues = DEFAULT_CATEGORIES.map((cat) => [
      userId,
      cat.name,
      cat.type,
      cat.icon,
      cat.color_hex,
    ]);

    await connection.query(
      'INSERT INTO categories (user_id, name, type, icon, color_hex) VALUES ?',
      [categoryValues]
    );

    await connection.commit();

    // Generate JWT token
    const newUser = {
      id: userId,
      fullname: fullname.trim(),
      email: normalizedEmail,
      school: school.trim(),
      currency: userCurrency,
    };
    const token = generateToken(newUser);

    return res.status(201).json({
      success: true,
      data: {
        user: newUser,
        token,
      },
    });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during registration.',
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

/**
 * Log in an existing user
 * POST /api/auth/login
 */
async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required.',
    });
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {
    // Query user by email
    const users = await query(
      'SELECT id, fullname, email, password_hash, school, currency FROM users WHERE email = ? LIMIT 1',
      [normalizedEmail]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const user = users[0];

    // Verify password with bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Generate JWT token
    const authenticatedUser = {
      id: user.id,
      fullname: user.fullname,
      email: user.email,
      school: user.school || 'Lagos State University',
      currency: user.currency,
    };
    const token = generateToken(authenticatedUser);

    return res.status(200).json({
      success: true,
      data: {
        user: authenticatedUser,
        token,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during login.',
    });
  }
}

/**
 * Get current authenticated user profile
 * GET /api/auth/me
 */
async function getMe(req, res) {
  try {
    const users = await query(
      'SELECT id, fullname, email, school, currency, created_at FROM users WHERE id = ? LIMIT 1',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        user: users[0],
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error fetching profile.',
    });
  }
}

module.exports = {
  register,
  login,
  getMe,
};

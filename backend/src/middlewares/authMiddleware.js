const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'spendwise-dev-jwt-secret-key-change-in-production';

/**
 * Authentication Middleware
 * Validates JWT Bearer tokens and attaches the authenticated user to req.user
 */
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided.',
    });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Malformed authorization header.',
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = {
      id: decoded.id,
      email: decoded.email,
      fullname: decoded.fullname,
    };
    next();
  } catch (error) {
    let message = 'Invalid or expired token.';
    if (error.name === 'TokenExpiredError') {
      message = 'Token has expired. Please log in again.';
    }

    return res.status(401).json({
      success: false,
      message,
    });
  }
}

module.exports = authMiddleware;

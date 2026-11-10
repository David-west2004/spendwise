const mysql = require('mysql2/promise');
require('dotenv').config();

// Construct pool configuration with fallback defaults
const poolConfig = process.env.DATABASE_URL
  ? { uri: process.env.DATABASE_URL }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'spendwise',
      waitForConnections: true,
      connectionLimit: Number(process.env.DB_CONNECTION_LIMIT) || 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
    };

const pool = mysql.createPool(poolConfig);

/**
 * Execute a SQL query with parameters using the connection pool
 * @param {string} sql - SQL query string with ? placeholders
 * @param {Array} [params] - Query parameters
 * @returns {Promise<Array>} Query result rows
 */
async function query(sql, params = []) {
  try {
    const [results] = await pool.query(sql, params);
    return results;
  } catch (error) {
    console.error('Database query error:', {
      message: error.message,
      code: error.code,
      sql: sql.trim(),
    });
    throw error;
  }
}

/**
 * Test the database connection to verify credentials and connectivity
 */
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Database connected successfully.');
    connection.release();
    return true;
  } catch (error) {
    console.error('Database connection failed:', error.message);
    throw error;
  }
}

module.exports = {
  pool,
  query,
  testConnection,
};

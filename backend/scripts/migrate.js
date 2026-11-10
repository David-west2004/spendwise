const { pool } = require('../src/config/db');

const TABLE_SCHEMAS = [
  {
    name: 'users',
    sql: `
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        fullname VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        school VARCHAR(150) NULL DEFAULT 'Lagos State University',
        currency VARCHAR(5) DEFAULT 'NGN',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `,
  },
  {
    name: 'categories',
    sql: `
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(36) NULL,
        name VARCHAR(50) NOT NULL,
        type ENUM('income', 'expense') NOT NULL,
        icon VARCHAR(50) DEFAULT 'wallet',
        color_hex VARCHAR(7) DEFAULT '#0284c7',
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `,
  },
  {
    name: 'budgets',
    sql: `
      CREATE TABLE IF NOT EXISTS budgets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        month_year VARCHAR(7) NOT NULL,
        total_allowance DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
        fixed_bills DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY uq_user_month (user_id, month_year)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `,
  },
  {
    name: 'transactions',
    sql: `
      CREATE TABLE IF NOT EXISTS transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        category_id INT NOT NULL,
        amount DECIMAL(12, 2) NOT NULL,
        type ENUM('income', 'expense') NOT NULL,
        description VARCHAR(255) NULL,
        transaction_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `,
  },
];

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

async function runMigrations() {
  console.log('--- Starting SpendWise Database Migration ---');
  let connection;

  try {
    connection = await pool.getConnection();
    console.log('Connected to database successfully.');

    // 1. Create tables in relational dependency order
    for (const table of TABLE_SCHEMAS) {
      console.log(`Creating table "${table.name}" if not exists...`);
      await connection.query(table.sql);
      console.log(`Table "${table.name}" is ready.`);
    }

    // Ensure school column exists on existing users table
    const [userCols] = await connection.query("SHOW COLUMNS FROM users LIKE 'school'");
    if (userCols.length === 0) {
      console.log('Adding "school" column to "users" table...');
      await connection.query("ALTER TABLE users ADD COLUMN school VARCHAR(150) NULL DEFAULT 'Lagos State University'");
      console.log('Column "school" successfully added to "users" table.');
    }

    // 2. Seed default global categories (where user_id IS NULL)
    console.log('Seeding system default categories...');
    for (const category of DEFAULT_CATEGORIES) {
      const [existing] = await connection.query(
        'SELECT id FROM categories WHERE user_id IS NULL AND name = ? AND type = ? LIMIT 1',
        [category.name, category.type]
      );

      if (existing.length === 0) {
        await connection.query(
          'INSERT INTO categories (user_id, name, type, icon, color_hex) VALUES (NULL, ?, ?, ?, ?)',
          [category.name, category.type, category.icon, category.color_hex]
        );
        console.log(`  + Seeded default category: ${category.name} (${category.type})`);
      }
    }

    console.log('All default categories checked and seeded.');
    console.log('--- Migration completed successfully! ---');
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exitCode = 1;
  } finally {
    if (connection) {
      connection.release();
    }
    // Close the connection pool to allow Node process to exit cleanly
    await pool.end();
  }
}

// Execute migration directly when run via CLI
if (require.main === module) {
  runMigrations();
}

module.exports = {
  runMigrations,
};

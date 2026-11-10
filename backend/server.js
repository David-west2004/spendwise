require('dotenv').config();
const app = require('./src/app');
const { testConnection } = require('./src/config/db');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Optionally check DB connection on startup (non-fatal if DB is pending setup)
    try {
      await testConnection();
    } catch (dbErr) {
      console.warn(' Database connection warning on startup:', dbErr.message);
      console.warn('  Ensure your database server is running and credentials in environment are correct.');
    }

    app.listen(PORT, () => {
      console.log(` SpendWise API server running on port ${PORT}`);
      console.log(` Health check available at: http://localhost:${PORT}/api/health`);
    //   console.log(` Auth endpoints available at: http://localhost:${PORT}/api/auth`);
    });
  } catch (error) {
    console.error('Fatal error starting server:', error);
    process.exit(1);
  }
}

startServer();

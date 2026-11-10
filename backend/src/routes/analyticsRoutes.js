const express = require('express');
const { getSummary, getSafeToSpend } = require('../controllers/analyticsController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Enforce authentication on all analytics queries
router.use(authMiddleware);

// Analytics endpoints
router.get('/summary', getSummary);
router.get('/dashboard', getSummary);
router.get('/safe-to-spend', getSafeToSpend);
// Alias matching AGENT.md checklist
router.get('/safe-spend', getSafeToSpend);

module.exports = router;

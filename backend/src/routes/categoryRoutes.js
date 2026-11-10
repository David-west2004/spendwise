const express = require('express');
const { getCategories, createCategory } = require('../controllers/categoryController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Enforce authentication on categories routes
router.use(authMiddleware);

// GET /api/categories
router.get('/', getCategories);

// POST /api/categories
router.post('/', createCategory);

module.exports = router;

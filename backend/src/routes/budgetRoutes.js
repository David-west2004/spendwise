const express = require('express');
const { getBudget, setBudget } = require('../controllers/budgetController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/', getBudget);
router.post('/', setBudget);
router.put('/', setBudget);

module.exports = router;

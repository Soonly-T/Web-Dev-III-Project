const express = require('express');
const expensesRoutes = require('./expenses/expenses');
const usersRoutes = require('./users/users');

const router = express.Router();

router.use('/expenses', expensesRoutes);
router.use('/', usersRoutes);

module.exports = router;
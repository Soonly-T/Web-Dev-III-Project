const express = require('express');
const dbOperations = require('../../../database/dbOperations');
const { authenticateToken } = require('../../middleware/jwt');
const router = express.Router();

router.get('/get-expenses', authenticateToken, async (req, res) => {
    const userId = req.user.id; // Get user ID from the JWT
    try {
        const expenses = await dbOperations.getExpenses(userId);
        console.log(expenses);
        res.status(200).json({ expenses: expenses, message: "Success" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Error in getting expenses" });
    }
});

router.delete('/remove-expense/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        const expense = await dbOperations.getExpenseByIdAndUserId(id, userId); // Implement this function in dbOperations
        if (!expense) {
            return res.status(403).json({ message: "Unauthorized to remove this expense" });
        }
        await dbOperations.removeExpense(id);
        res.status(200).json({ message: "Expense removed successfully" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Error in removing expense" });
    }
});

router.post('/add-expense', authenticateToken, async (req, res) => {
    const userId = req.user.id; // Get user ID from the JWT
    const { amount, category, date, notes } = req.body;
    console.log(userId);

    try {
        await dbOperations.addExpense(userId, amount, category, date, notes);
        res.status(200).json({ message: "Expense added successfully" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Error in adding expense" });
    }
});

router.put('/modify-expense', authenticateToken, async (req, res) => {
    const userId = req.user.id; // Get user ID from the JWT
    const { id, amount, category, notes } = req.body;

    try {
        const expense = await dbOperations.getExpenseByIdAndUserId(id, userId); // Verify ownership before modifying
        if (!expense) {
            return res.status(403).json({ message: "Unauthorized to modify this expense" });
        }
        await dbOperations.modifyExpense(id, userId, amount, category, notes);
        res.status(200).json({ message: "Expense modified successfully" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Error in modifying expense" });
    }
});

module.exports = router;
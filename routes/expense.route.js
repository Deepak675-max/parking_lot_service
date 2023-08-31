const express = require("express");

const expenseRouter = express.Router();

const expenseController = require("../controllers/expense.controller");

expenseRouter.post("/expense/create-expense", expenseController.createExpense);

expenseRouter.post("/expense/get-expense", expenseController.getExpense);

expenseRouter.put("/expense/update-expense", expenseController.updateExpense);

expenseRouter.put("/expense/delete-expense", expenseController.deleteExpense);

module.exports = expenseRouter;

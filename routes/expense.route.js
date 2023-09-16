const express = require("express");

const expenseRouter = express.Router();

const expenseController = require("../controllers/expense.controller");

expenseRouter.post("/create-expense", expenseController.createExpense);

expenseRouter.post("/get-expense", expenseController.getExpense);

expenseRouter.put("/update-expense", expenseController.updateExpense);

expenseRouter.put("/delete-expense", expenseController.deleteExpense);

module.exports = expenseRouter;

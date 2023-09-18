const express = require("express");

const expenseRouter = express.Router();

const verifyAccessToken = require('../middlewares/auth.middlewares');

const expenseController = require("../controllers/expense.controller");

expenseRouter.post("/create-expense", verifyAccessToken.verifyAccessToken, expenseController.createExpense);

expenseRouter.get("/get-expense", verifyAccessToken.verifyAccessToken, expenseController.getExpense);

expenseRouter.put("/update-expense", verifyAccessToken.verifyAccessToken, expenseController.updateExpense);

expenseRouter.put("/delete-expense", verifyAccessToken.verifyAccessToken, expenseController.deleteExpense);

module.exports = expenseRouter;

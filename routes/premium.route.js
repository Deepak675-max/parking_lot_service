const express = require("express");

const premiumRouter = express.Router();

const verifyAccessToken = require('../middlewares/auth.middlewares');

const expenseController = require("../controllers/expense.controller");

premiumRouter.get("/get-leaderboard", verifyAccessToken.verifyAccessToken, expenseController.getLeaderboard);

module.exports = premiumRouter;

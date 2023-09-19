const express = require("express");

const orderRouter = express.Router();

const verifyAccessToken = require('../middlewares/auth.middlewares');

const paymentController = require('../controllers/payment.controller');

orderRouter.get('/purchase-premium-membership', verifyAccessToken.verifyAccessToken, paymentController.purchasePremiumMembership);
orderRouter.post('/update-transaction-status', verifyAccessToken.verifyAccessToken, paymentController.updateTransactionStatus);


module.exports = orderRouter;
require('dotenv').config();
const User = require('../models/user.model');
const httpErrors = require('http-errors');
const bcrypt = require('bcrypt');
const JWT = require('jsonwebtoken');
const razorpay = require('razorpay');

const jwtModule = require('../middlewares/auth.middlewares')

const joiUser = require('../helper/joi/auth.joi_validation');
const Order = require('../models/order.model');

const purchasePremiumMembership = async (req, res, next) => {
    try {
        const rzp = new razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_SECRET_KEY
        })
        const amount = 50000;

        const order = await rzp.orders.create({ amount, currency: "INR" });

        await req.user.createOrder({
            razorpayOrderId: order.id,
            status: "PENDING"
        })

        if (res.headersSent === false) {
            res.status(200).send({
                error: false,
                data: {
                    order: order,
                    key_id: rzp.key_id,
                    message: "Order request created successfully",
                },
            });
        }


    } catch (error) {
        console.log(error);
        next(error);
    }
}

const updateTransactionStatus = async (req, res, next) => {
    try {
        const razorpayOrderId = req.body.orderId;
        const paymentId = req.body.paymentId;
        const status = req.body.status;

        const order = await Order.findOne({
            where: {
                razorpayOrderId: razorpayOrderId
            }
        })

        await order.update({ paymentId: paymentId, status: status });

        if (status === "SUCCESSFUL")
            await req.user.update({ isPremiumUser: true });

        if (res.headersSent === false) {
            res.status(200).send({
                error: false,
                data: {
                    message: "Transaction Successful",
                },
            });
        }

    } catch (error) {
        console.log(error);
        next(error);
    }
}

module.exports = {
    purchasePremiumMembership,
    updateTransactionStatus
}

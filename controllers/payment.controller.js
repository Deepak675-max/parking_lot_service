const razorpay = require('razorpay');
const Order = require('../models/order.model');

const purchasePremiumMembership = async (req, res, next) => {
    try {
        const rzp = new razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_SECRET_KEY
        });

        const amount = 50000;

        const order = await rzp.orders.create({ amount, currency: "INR" });

        await Order.create({
            razorpayOrderId: order.id,
            user: req.user._id,
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
        next(error);
    }
}

const updateTransactionStatus = async (req, res, next) => {
    try {
        const razorpayOrderId = req.body.orderId;
        const paymentId = req.body.paymentId;
        const status = req.body.status;

        const order = await Order.findOne({
            razorpayOrderId: razorpayOrderId,
            isDeleted: false
        })

        order.paymentId = paymentId;
        order.status = status;
        await order.save();

        if (status === "SUCCESSFUL") {
            req.user.isPremiumUser = true;
            await req.user.save();
        }

        if (res.headersSent === false) {
            res.status(200).send({
                error: false,
                data: {
                    message: "Transaction Successful",
                },
            });
        }

    } catch (error) {
        next(error);
    }
}

module.exports = {
    purchasePremiumMembership,
    updateTransactionStatus
}

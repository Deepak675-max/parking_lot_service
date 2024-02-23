const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    razorpayOrderId: {
        type: String,
        required: true
    },
    paymentId: {
        type: String,
    },
    status: {
        type: String,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
},
    {
        timestamps: true
    }
)

module.exports = mongoose.model('order', orderSchema);
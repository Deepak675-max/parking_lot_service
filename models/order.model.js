const sequelize = require("../helper/common/init_mysql")

const DataTypes = require("sequelize");

const Order = sequelize.define('Order', {
    // Model attributes are defined here
    razorpayOrderId: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    paymentId: {
        type: DataTypes.STRING,
        allowNull: true, // This makes paymentId optional
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}, {
    timestamps: true
});

module.exports = Order;
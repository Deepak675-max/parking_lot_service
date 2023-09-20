const sequelize = require("../helper/common/init_mysql")

const DataTypes = require("sequelize");

const Expense = sequelize.define('Expense', {
    // Model attributes are defined here
    amount: {
        type: DataTypes.BIGINT,
        allowNull: false
    },
    description: {
        type: DataTypes.STRING,
    },
    category: {
        type: DataTypes.STRING,
        allowNull: false
    },
}, {
    timestamps: true
});

module.exports = Expense;
const sequelize = require("../helper/common/init_mysql")

const DataTypes = require("sequelize");

const Expense = sequelize.define('Expense', {
    // Model attributes are defined here
    amount: {
        type: DataTypes.STRING,
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

Expense.sync({ alter: true })
    .then(() => {
        console.log('Expense table is synchronized.');
    })
    .catch((error) => {
        console.error('Error synchronizing Expense table:', error);
    });

module.exports = Expense;
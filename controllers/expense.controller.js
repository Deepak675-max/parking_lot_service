const Expense = require('../models/expense.model');
const User = require('../models/user.model');

const httpErros = require('http-errors');

const joiExpense = require("../helper/joi/expense.joi_validation");

const createExpense = async (req, res, next) => {
    try {
        const expenseDetails = await joiExpense.createExpenseSchema.validateAsync(req.body);

        const user = await User.findOne({
            where: {
                id: expenseDetails.userId
            }
        })

        if (!user)
            throw httpErros.NotFound(`User with id: ${expenseDetails.userId} does not exist`);

        await user.createExpense(expenseDetails);

        if (res.headersSent === false) {
            res.status(200).send({
                error: false,
                data: {
                    message: "Expense created successfully",
                },
            });
        }

    } catch (error) {
        console.log(error);
        if (error?.isJoi === true) error.status = 422;
        next(error);
    }
}

const getExpense = async (req, res, next) => {
    try {
        const expenseSchema = await joiExpense.getExpenseSchema.validateAsync(req.body);

        const user = await User.findOne({
            where: {
                id: expenseSchema.userId
            }
        })

        if (!user)
            throw httpErros.NotFound(`User with id: ${expenseSchema.userId} does not exist`);

        const query = { where: {} };

        if (expenseSchema.ExpenseId) {
            query.where.id = expenseSchema.ExpenseId
        }
        const expenses = await user.getExpenses(query);

        await Promise.all(
            expenses.map(expense => {
                delete expense.createdAt;
                delete expense.updatedAt;
            })
        )

        if (res.headersSent === false) {
            res.status(200).send({
                error: false,
                data: {
                    expenses: expenses,
                    message: "Expense fetched successfully",
                },
            });
        }

    } catch (error) {
        console.log(error);
        if (error?.isJoi === true) error.status = 422;
        next(error);
    }
}

const updateExpense = async (req, res, next) => {
    try {
        const expenseDetails = await joiExpense.updateExpenseSchema.validateAsync(req.body);

        const user = await User.findOne({
            where: {
                id: expenseDetails.userId
            }
        })

        if (!user)
            throw httpErros.NotFound(`User with id: ${expenseDetails.userId} does not exist`);

        const expense = await user.getExpenses({
            where: {
                id: expenseDetails.expenseId,
            }
        })

        if (!expense) {

            throw httpErros.NotFound(`Expense with id: ${expenseDetails.expenseId} not exist.`);
        }

        await user.updateExpense(
            {
                id: expenseDetails.expenseId,
                amount: expenseDetails.amount,
                description: expenseDetails.description,
                category: expenseDetails.category
            },
            {
                where: {
                    id: expenseDetails.expenseId
                }
            }
        )

        if (res.headersSent === false) {
            res.status(200).send({
                error: false,
                data: {
                    message: "Expense updated successfully",
                },
            });
        }
    } catch (error) {
        console.log(error.message);
        if (error?.isJoi === true) error.status = 422;
        next(error);
    }
}

const deleteExpense = async (req, res, next) => {
    try {
        const expenseDetails = await joiExpense.deleteExpenseSchema.validateAsync(req.body);

        const user = await User.findOne({
            where: {
                id: expenseDetails.userId
            }
        })

        if (!user)
            throw httpErros.NotFound(`User with id: ${expenseDetails.userId} does not exist`);

        const expense = await user.getExpenses({
            where: {
                id: expenseDetails.expenseId,
            }
        })

        if (!expense) {

            throw httpErros.NotFound(`Expense with id: ${expenseDetails.expenseId} not exist.`);
        }

        await user.deleteExpense(
            {
                where: {
                    id: expenseDetails.expenseId
                }
            }
        )

        if (res.headersSent === false) {
            res.status(200).send({
                error: false,
                data: {
                    message: "Expense deleted successfully",
                },
            });
        }

    } catch (error) {
        console.log(error);
        if (error?.isJoi === true) error.status = 422;
        next(error);
    }
}


module.exports = {
    createExpense,
    getExpense,
    updateExpense,
    deleteExpense
}
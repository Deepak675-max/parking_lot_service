const Expense = require('../models/expense.model');
const httpErrors = require('http-errors');

const joiExpense = require("../helper/joi/expense.joi_validation");

const createExpense = async (req, res, next) => {
    try {
        const expenseDetails = await joiExpense.createExpenseSchema.validateAsync(req.body);

        await req.user.createExpense(expenseDetails);

        if (res.headersSent === false) {
            res.status(200).send({
                error: false,
                data: {
                    message: "Expense created successfully",
                },
            });
        }

    } catch (error) {
        if (error?.isJoi === true) error.status = 422;
        next(error);
    }
}

const getExpense = async (req, res, next) => {
    try {
        const expenseSchema = await joiExpense.getExpenseSchema.validateAsync(req.body);

        const query = { where: {} };

        if (expenseSchema.ExpenseId) {
            query.where.id = expenseSchema.ExpenseId
        }
        const expenses = await req.user.getExpenses(query);

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
        if (error?.isJoi === true) error.status = 422;
        next(error);
    }
}

const updateExpense = async (req, res, next) => {
    try {
        const expenseDetails = await joiExpense.updateExpenseSchema.validateAsync(req.body);

        const expense = await req.user.getExpenses({
            where: {
                id: expenseDetails.expenseId,
            }
        })

        if (!expense) {
            throw httpErrors.NotFound(`Expense with id: ${expenseDetails.expenseId} not exist.`);
        }

        await Expense.update(
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

        const expense = await req.user.getExpenses({
            where: {
                id: expenseDetails.expenseId,
            }
        })

        if (!expense) {
            throw httpErrors.NotFound(`Expense with id: ${expenseDetails.expenseId} not exist.`);
        }

        await Expense.destroy(
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
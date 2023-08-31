const Expense = require('../models/expense.model');
const httpErros = require('http-errors');

const joiExpense = require("../helper/joi/expense.joi_validation");

const createExpense = async (req, res, next) => {
    try {
        const expenseDetails = await joiExpense.createExpenseSchema.validateAsync(req.body);
        const newExpense = new Expense({
            amount: expenseDetails.amount,
            description: expenseDetails.description,
            category: expenseDetails.category
        })

        await newExpense.save();

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
        next(error);
    }
}

const getExpense = async (req, res, next) => {
    try {
        const expenseSchema = await joiExpense.getExpenseSchema.validateAsync(req.body);

        const query = {};

        if (expenseSchema.ExpenseId) {
            query.where.id = expenseSchema.ExpenseId
        }

        const expenses = await Expense.findAll(query);

        await Promise.all(
            expenses.map(expense => {
                delete expenses.createdAt;
                delete expenses.updatedAt;
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
        next(error);
    }
}

const updateExpense = async (req, res, next) => {
    try {
        const expenseDetails = await joiExpense.updateExpenseSchema.validateAsync(req.body);

        console.log(expenseDetails);

        const expense = await Expense.findOne({
            where: {
                id: expenseDetails.expenseId,
            }
        })

        if (!expense) {

            throw httpErros[500](`Expense with id: ${expenseDetails.expenseId} not exist.`);
        }

        const updatedExpense = await Expense.update(
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
            })


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
        next(error);
    }
}

const deleteExpense = async (req, res, next) => {
    try {
        const expenseDetails = await joiExpense.deleteExpenseSchema.validateAsync(req.body);

        const expense = await Expense.findOne({
            where: {
                id: expenseDetails.expenseId,
            }
        })

        if (!expense) {
            throw httpErros.NotFound(`Expense with id: ${expenseDetails.expenseId} not exist.`);
        }

        const updatedExpense = await Expense.destroy(
            {
                where: {
                    id: expenseDetails.expenseId
                }
            }
        );

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
        next(error);
    }
}


module.exports = {
    createExpense,
    getExpense,
    updateExpense,
    deleteExpense
}
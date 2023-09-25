const Expense = require('../models/expense.model');
const User = require('../models/user.model');
const httpErrors = require('http-errors');
const sequelize = require('../helper/common/init_mysql');
const { Op } = require('sequelize');
const joiExpense = require("../helper/joi/expense.joi_validation");


const createExpense = async (req, res, next) => {
    const transaction = await sequelize.transaction();
    try {
        const expenseDetails = await joiExpense.createExpenseSchema.validateAsync(req.body);

        console.log(expenseDetails);

        await req.user.createExpense(expenseDetails, { transaction });

        const totalExpense = req.user.totalExpense + expenseDetails.amount;

        await req.user.update({ totalExpense: totalExpense }, { transaction });

        await transaction.commit();

        if (res.headersSent === false) {
            res.status(200).send({
                error: false,
                data: {
                    message: "Expense created successfully",
                },
            });
        }

    } catch (error) {
        await transaction.rollback();
        console.log(error);
        if (error?.isJoi === true) error.status = 422;
        next(error);
    }
}

// const getExpense = async (req, res, next) => {
//     try {
//         const expenseSchema = await joiExpense.getExpenseSchema.validateAsync(req.body);

//         const query = { where: {} };

//         if (expenseSchema.ExpenseId) {
//             query.where.id = expenseSchema.ExpenseId
//         }

//         query.order = [['id', 'DESC']];

//         const expenses = await req.user.getExpenses(query);

//         await Promise.all(
//             expenses.map(expense => {
//                 delete expense.createdAt;
//                 delete expense.updatedAt;
//             })
//         )
//         if (res.headersSent === false) {
//             res.status(200).send({
//                 error: false,
//                 data: {
//                     expenses: expenses,
//                     message: "Expense fetched successfully",
//                 },
//             });
//         }

//     } catch (error) {
//         if (error?.isJoi === true) error.status = 422;
//         next(error);
//     }
// }

const getExpense = async (req, res, next) => {
    try {
        const { draw, start, length, columns, order, search } = req.body;

        // Define Sequelize options for pagination, sorting, and searching
        const query = {
            offset: parseInt(start),
            limit: parseInt(length),
            order: [], // You'll build this dynamically
            where: {},
        };

        // Build sorting options based on DataTables order parameter
        if (order && order.length) {
            const orderColumnIndex = order[0].column;
            const orderDirection = order[0].dir;
            const orderColumnName = columns[orderColumnIndex].data;

            query.order.push([orderColumnName, orderDirection]);
        }

        // Build search condition if search value is provided
        if (search && search.value) {
            query.where = {
                [Op.or]: [
                    { description: { [Op.like]: `%${search.value}%` } },
                    { category: { [Op.like]: `%${search.value}%` } },
                ],
            };
        }

        query.where.userId = req.user.id;

        // Fetch data using Sequelize based on options
        const { count, rows: expenses } = await Expense.findAndCountAll(query);

        if (res.headersSent === false) {
            res.json({
                draw: draw,
                recordsTotal: count, // Total records in the dataset
                recordsFiltered: count, // Total records after filtering (if applicable)
                data: expenses,
            });
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: true, message: 'Internal Server Error' });
    }
}

const updateExpense = async (req, res, next) => {
    const transaction = await sequelize.transaction();

    try {
        const expenseDetails = await joiExpense.updateExpenseSchema.validateAsync(req.body);

        const expense = await req.user.getExpenses({
            where: {
                id: expenseDetails.expenseId,
            }
        })

        if (expense?.length <= 0) {
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
                },
                transaction
            },
        )

        const totalExpense = req.user.totalExpense - expense[0].amount + expenseDetails.amount;

        await req.user.update({ totalExpense: totalExpense }, { transaction });

        await transaction.commit();

        if (res.headersSent === false) {
            res.status(200).send({
                error: false,
                data: {
                    message: "Expense updated successfully",
                },
            });
        }
    } catch (error) {
        await transaction.rollback();
        console.log(error.message);
        if (error?.isJoi === true) error.status = 422;
        next(error);
    }
}

const deleteExpense = async (req, res, next) => {
    const transaction = await sequelize.transaction();

    try {
        const expenseDetails = await joiExpense.deleteExpenseSchema.validateAsync(req.body);

        const expense = await req.user.getExpenses({
            where: {
                id: expenseDetails.expenseId,
            }
        })

        if (expense?.length <= 0) {
            throw httpErrors.NotFound(`Expense with id: ${expenseDetails.expenseId} not exist.`);
        }

        await Expense.destroy(
            {
                where: {
                    id: expenseDetails.expenseId
                },
                transaction
            }
        )

        const totalExpense = req.user.totalExpense - expense[0].amount;

        await req.user.update({ totalExpense: totalExpense }, { transaction });

        await transaction.commit();


        if (res.headersSent === false) {
            res.status(200).send({
                error: false,
                data: {
                    message: "Expense deleted successfully",
                },
            });
        }

    } catch (error) {
        await transaction.rollback();
        if (error?.isJoi === true) error.status = 422;
        next(error);
    }
}

const getLeaderboard = async (req, res, next) => {
    try {
        const leaderboard = await User.findAll({
            order: [['totalExpense', 'DESC']],
        });

        const leaderboardData = await Promise.all(
            leaderboard.map(user => {
                const userObject = user.toJSON();
                delete userObject.id;
                delete userObject.password;
                delete userObject.email;
                delete userObject.createdAt;
                delete userObject.updatedAt;
                delete userObject.isPremiumUser;
                return userObject;
            })
        )

        if (res.headersSent === false) {
            res.status(200).send({
                error: false,
                data: {
                    leaderboardData: leaderboardData,
                    message: "Leaderboard fetched successfully",
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
    deleteExpense,
    getLeaderboard
}
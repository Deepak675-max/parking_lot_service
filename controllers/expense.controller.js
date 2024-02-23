const Expense = require('../models/expense.model');
const User = require('../models/user.model');
const httpErrors = require('http-errors');
const joiExpense = require("../helper/joi/expense.joi_validation");

const createExpense = async (req, res, next) => {
    const session = await Expense.startSession();
    session.startTransaction();
    try {
        const expenseDetails = await joiExpense.createExpenseSchema.validateAsync(req.body);

        expenseDetails.user = req.user._id;

        const newExpense = new Expense(expenseDetails);

        await newExpense.save({ session });

        req.user.totalExpense = req.user.totalExpense + expenseDetails.amount;

        await req.user.save({ session });

        await session.commitTransaction();

        session.endSession();

        if (res.headersSent === false) {
            res.status(200).send({
                error: false,
                data: {
                    message: "Expense created successfully",
                },
            });
        }

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.log(error);
        if (error?.isJoi === true) error.status = 422;
        next(error);
    }
}

const getUserExpense = async (req, res, next) => {
    try {
        const expenseSchema = await joiExpense.getExpenseSchema.validateAsync(req.body);

        const query = { where: {} };

        if (expenseSchema.ExpenseId) {
            query.where.id = expenseSchema.ExpenseId
        }

        query.order = [['id', 'DESC']];

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

// const getExpense = async (req, res, next) => {
//     try {
//         const { draw, start, length, columns, order, search } = req.body;

//         // Define Sequelize options for pagination, sorting, and searching
//         const query = {
//             order: [], // You'll build this dynamically
//             where: {},
//         };

//         if (length != -1) {
//             query.offset = parseInt(start);
//             query.limit = parseInt(length);
//         }

//         // Build sorting options based on DataTables order parameter
//         if (order && order.length) {
//             const orderColumnIndex = order[0].column;
//             const orderDirection = order[0].dir;
//             const orderColumnName = columns[orderColumnIndex].data;

//             query.order.push([orderColumnName, orderDirection]);
//         }

//         // Build search condition if search value is provided
//         if (search && search.value) {
//             query.where = {
//                 [Op.or]: [
//                     { description: { [Op.like]: `%${search.value}%` } },
//                     { category: { [Op.like]: `%${search.value}%` } },
//                 ],
//             };
//         }

//         query.where.userId = req.user.id;

//         // Fetch data using Sequelize based on options
//         const { count, rows: expenses } = await Expense.findAndCountAll(query);

//         if (res.headersSent === false) {
//             res.json({
//                 draw: draw,
//                 recordsTotal: count, // Total records in the dataset
//                 recordsFiltered: count, // Total records after filtering (if applicable)
//                 data: expenses,
//             });
//         }
//     } catch (error) {
//         next(error);
//     }
// }

const getExpense = async (req, res, next) => {
    try {
        const { draw, start, length, columns, order, search } = req.body;

        // Define Mongoose options for pagination, sorting, and searching
        const query = {
            skip: parseInt(start) || 0,
            limit: parseInt(length) || 10,
            sort: {},
            where: { user: req.user._id, isDeleted: false }
        };

        // Build sorting options based on DataTables order parameter
        if (order && order.length) {
            const orderColumnIndex = order[0].column;
            const orderDirection = order[0].dir;
            const orderColumnName = columns[orderColumnIndex].data;

            query.sort[orderColumnName] = orderDirection === 'asc' ? 1 : -1;
        }

        // Build search condition if search value is provided
        if (search && search.value) {
            const searchValue = new RegExp(search.value, 'i'); // Case-insensitive search
            query.where.$or = [
                { description: { $regex: searchValue } },
                { category: { $regex: searchValue } }
            ];
        }

        // Fetch data using Mongoose based on options
        const expenses = await Expense
            .find(query.where)
            .skip(query.skip)
            .limit(query.limit)
            .sort(query.sort);

        const count = await Expense.countDocuments(query.where);

        if (!res.headersSent) {
            res.json({
                draw: draw,
                recordsTotal: count, // Total records in the dataset
                recordsFiltered: count, // Total records after filtering (if applicable)
                data: expenses
            });
        }
    } catch (error) {
        console.log(error);
        next(error);
    }
}

const updateExpense = async (req, res, next) => {
    const session = await Expense.startSession();
    session.startTransaction();
    try {
        const expenseDetails = await joiExpense.updateExpenseSchema.validateAsync(req.body);

        const expense = await Expense.findOne({
            _id: expenseDetails.expenseId,
            isDeleted: false
        })

        if (!expense) {
            throw httpErrors.NotFound(`Expense with id: ${expenseDetails.expenseId} not exist.`);
        }

        await expense.updateOne(
            expenseDetails,
            {
                new: true
            },
        )

        // const totalExpense = req.user.totalExpense - expense[0].amount + expenseDetails.amount;

        req.user.totalExpense = req.user.totalExpense - expense.amount + expenseDetails.amount;

        await req.user.save({ session });

        // await req.user.update({ totalExpense: totalExpense }, { transaction });

        await session.commitTransaction();

        session.endSession();

        if (res.headersSent === false) {
            res.status(200).send({
                error: false,
                data: {
                    message: "Expense updated successfully",
                },
            });
        }
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        if (error?.isJoi === true) error.status = 422;
        next(error);
    }
}

const deleteExpense = async (req, res, next) => {
    try {
        const expenseDetails = await joiExpense.deleteExpenseSchema.validateAsync(req.body);

        const expense = await Expense.findOne({
            _id: expenseDetails.expenseId,
            isDeleted: false
        })

        if (!expense) {
            throw httpErrors.NotFound(`Expense with id: ${expenseDetails.expenseId} not exist.`);
        }

        expense.isDeleted = true;

        await expense.save();

        // const totalExpense = req.user.totalExpense - expense[0].amount;

        // await req.user.update({ totalExpense: totalExpense }, { transaction });

        req.user.totalExpense = req.user.totalExpense - expense.amount;

        await req.user.save();

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
        next(error);
    }
}


module.exports = {
    createExpense,
    getExpense,
    updateExpense,
    deleteExpense,
    getLeaderboard,
    getUserExpense
}
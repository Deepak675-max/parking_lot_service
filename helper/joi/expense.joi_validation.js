const joi = require('joi');

const createExpenseSchema = joi.object({
    amount: joi.string().trim().required(),
    description: joi.string().trim().required(),
    category: joi.string().trim().valid('Food', 'Electricity', 'Movie', 'Fuel').required()
})

const getExpenseSchema = joi.object({
    expenseId: joi.number().allow(null).default(null)
})


const updateExpenseSchema = joi.object({
    expenseId: joi.number().required(),
    amount: joi.string().trim().required(),
    description: joi.string().trim().required(),
    category: joi.string().trim().valid('Food', 'Electricity', 'Movie', 'Fuel').required()
})


const deleteExpenseSchema = joi.object({
    expenseId: joi.number().required()
})

module.exports = {
    createExpenseSchema,
    getExpenseSchema,
    updateExpenseSchema,
    deleteExpenseSchema
}


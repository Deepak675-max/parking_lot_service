const joi = require('joi');

const createExpenseSchema = joi.object({
    amount: joi.number().required(),
    description: joi.string().trim().required(),
    category: joi.string().trim().valid('Food', 'Electricity', 'Movie', 'Fuel').required()
})

const getExpenseSchema = joi.object({
    expenseId: joi.number().allow(null).default(null),
    start: joi.number().required(),
    length: joi.number().required(),
    column: joi.number().required(),
    order: joi.array().items(),
    draw: joi.boolean().required()
})


const updateExpenseSchema = joi.object({
    expenseId: joi.number().required(),
    amount: joi.number().required(),
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


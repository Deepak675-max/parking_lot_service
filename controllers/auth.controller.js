const User = require('../models/user.model');
const httpErros = require('http-errors');
const bcrypt = require('bcrypt');

const joiUser = require('../helper/joi/auth.joi_validation')

const signupUser = async (req, res, next) => {
    try {
        const userDetails = await joiUser.signupUserSchema.validateAsync(req.body);

        const doesUserExist = await User.findOne({
            where: {
                email: userDetails.email
            }
        })

        if (doesUserExist)
            throw httpErros.Conflict(`User with email: ${userDetails.email} already exist`);

        userDetails.password = await bcrypt.hash(userDetails.password, 10);

        const newUser = new User(userDetails);

        const user = await newUser.save();

        if (res.headersSent === false) {
            res.status(200).send({
                error: false,
                data: {
                    user: user,
                    message: "User SignUp successfully",
                },
            });
        }

    } catch (error) {
        console.log(error);
        if (error?.isJoi === true) error.status = 422;
        next(error);
    }
}

const loginUser = async (req, res, next) => {
    try {
        const userDetails = await joiUser.loginUserSchema.validateAsync(req.body);

        const doesUserExist = await User.findOne({
            where: {
                email: userDetails.email,
            }
        })

        if (!doesUserExist)
            throw httpErros.NotFound(`User with email: ${userDetails.email} does not exist`);

        const isPasswordMatch = await bcrypt.compare(userDetails.password, doesUserExist.password);

        if (!isPasswordMatch)
            throw httpErros.NotFound('Incorrect password.');

        console.log(doesUserExist);

        if (res.headersSent === false) {
            res.status(200).send({
                error: false,
                data: {
                    user: doesUserExist,
                    message: "User login successfully",
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
    loginUser,
    signupUser
}

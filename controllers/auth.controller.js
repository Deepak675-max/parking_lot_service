const User = require('../models/user.model');
const httpErros = require('http-errors');

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
                password: userDetails.password
            }
        })

        if (!doesUserExist)
            throw httpErros.NotFound(`User with email: ${userDetails.email} and password: ${userDetails.password} does not exist`);

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

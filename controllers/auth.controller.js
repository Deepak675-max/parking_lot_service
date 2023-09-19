require('dotenv').config();
const User = require('../models/user.model');
const httpErrors = require('http-errors');
const bcrypt = require('bcrypt');
const JWT = require('jsonwebtoken');

const jwtModule = require('../middlewares/auth.middlewares')

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
            throw httpErrors.Conflict(`User with email: ${userDetails.email} already exist`);

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
            throw httpErrors.NotFound('invalid credentials');

        const isPasswordMatch = await bcrypt.compare(userDetails.password, doesUserExist.password);

        if (!isPasswordMatch)
            throw httpErrors.NotFound('invalid credentials.');

        const jwtAccessToken = await jwtModule.signAccessToken({
            userId: doesUserExist.id,
            email: doesUserExist.email
        });

        if (res.headersSent === false) {
            res.status(200).send({
                error: false,
                data: {
                    user: {
                        userId: doesUserExist.id,
                        userName: doesUserExist.userName,
                        email: doesUserExist.email
                    },
                    token: jwtAccessToken,
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

const getUserFromToken = async (req, res, next) => {
    try {
        const userDetails = {
            userName: req.user.userName,
            email: req.user.email,
            isPremiumUser: req.user.isPremiumUser
        };
        if (res.headersSent === false) {
            res.status(200).send({
                error: false,
                data: {
                    user: userDetails,
                    message: "User fetched successfully",
                },
            });
        }
    } catch (error) {
        console.log(error);
        if (error?.isJoi === true) error.status = 422;
        next(error);
    }
}

const logoutUser = async (req, res, next) => {
    try {
        // Check if Payload contains appAgentId
        if (!req.user.id) {
            throw httpErrors.UnprocessableEntity(
                `JWT Refresh Token error : Missing Payload Data`
            );
        }
        // Delete Refresh Token from Redis DB
        await jwtModule
            .removeToken({
                userId: req.user.id,
            })
            .catch((error) => {
                throw httpErrors.InternalServerError(
                    `JWT Access Token error : ${error.message}`
                );
            });

        res.status(200).send({
            error: false,
            data: {
                message: "Agent logged out successfully.",
            },
        });
    } catch (error) {
        console.log(error.message);
        next(error);
    }
}

module.exports = {
    loginUser,
    signupUser,
    getUserFromToken,
    logoutUser
}

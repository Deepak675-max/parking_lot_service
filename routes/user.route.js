const express = require("express");

const authRouter = express.Router();

const authController = require('../controllers/auth.controller');

authRouter.post('/signup', authController.signupUser);

authRouter.post('/login', authController.loginUser);

module.exports = authRouter;
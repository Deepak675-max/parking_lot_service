const express = require("express");

const authRouter = express.Router();

const verifyAccessToken = require('../middlewares/auth.middlewares');

const authController = require('../controllers/auth.controller');

authRouter.post('/signup', authController.signupUser);

authRouter.post('/login', authController.loginUser);

authRouter.get('/get-user', verifyAccessToken.verifyAccessToken, authController.getUserFromToken);

authRouter.get('/logout', verifyAccessToken.verifyAccessToken, authController.logoutUser);


module.exports = authRouter;
const User = require('../models/user.model');
const httpErrors = require('http-errors');

const verifyUser = async (req, res, next) => {
    try {
        const userId = req.headers.userid;
        const userDetails = await User.findOne({
            where: {
                id: userId
            }
        })
        if (!userDetails)
            throw httpErrors.NotFound(`User not found`);


        req.user = userDetails;
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = verifyUser;
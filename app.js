require('dotenv').config();
const express = require('express');
const httpErrors = require("http-errors");

const cors = require("cors");

const expesneRoutes = require("./routes/expense.route");
const authRoutes = require("./routes/user.route");
const orderRoutes = require("./routes/order.route");
const premiumRoutes = require("./routes/premium.route");

const User = require('./models/user.model');
const Expense = require('./models/expense.model');
const Order = require('./models/order.model');
const ForgotPasswordRequests = require('./models/forgetPasswordRequests.model');

expenseTrackerBackendApp.use(cors());

const sequelize = require('./helper/common/init_mysql');

const expenseTrackerBackendApp = express();

expenseTrackerBackendApp.use(express.json());
expenseTrackerBackendApp.use(express.urlencoded({ extended: true }));



expenseTrackerBackendApp.use("/api/expense", expesneRoutes);
expenseTrackerBackendApp.use("/api/auth", authRoutes);
expenseTrackerBackendApp.use("/api/order", orderRoutes);
expenseTrackerBackendApp.use("/api/premium", premiumRoutes);


expenseTrackerBackendApp.use(async (req, _res, next) => {
    console.log(req, _res);
    next(httpErrors.NotFound(`Route not Found for [${req.method}] ${req.url}`));
});

// Common Error Handler
expenseTrackerBackendApp.use((error, req, res, next) => {
    const responseStatus = error.status || 500;
    const responseMessage =
        error.message || `Cannot resolve request [${req.method}] ${req.url}`;
    if (res.headersSent === false) {
        res.status(responseStatus);
        res.send({
            error: {
                status: responseStatus,
                message: responseMessage,
            },
        });
    }
    next();
});

//models associtaions.
User.hasMany(Expense, { foreignKey: 'userId' });
Expense.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Order, { foreignKey: 'userId' });
Order.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(ForgotPasswordRequests, { foreignKey: 'userId' });
ForgotPasswordRequests.belongsTo(User, { foreignKey: 'userId' });

const port = process.env.APP_PORT;

sequelize.sync({ alter: true })
    .then(() => {
        expenseTrackerBackendApp.listen(port, () => {
            console.log(`server is listening on the port of ${port}`);
        })
    })
    .catch(error => {
        console.log(error);
        process.exit(0);
    })

process.on('SIGINT', () => {
    // Perform cleanup operations here
    console.log('Received SIGINT signal. application terminated successfully.');

    // Exit the application
    process.exit(0);
});





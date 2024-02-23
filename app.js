require('dotenv').config();
const express = require('express');
const httpErrors = require("http-errors");

const cors = require("cors");

const expesneRoutes = require("./routes/expense.route");
const authRoutes = require("./routes/user.route");
const orderRoutes = require("./routes/order.route");
const premiumRoutes = require("./routes/premium.route");
const expenseTrackerBackendApp = express();

expenseTrackerBackendApp.use(cors());

require("./helper/common/init_mongodb");


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


const port = process.env.APP_PORT;

expenseTrackerBackendApp.listen(port, () => {
    console.log(`server is listening on the port of ${port}`);
})

process.on('SIGINT', () => {
    // Perform cleanup operations here
    console.log('Received SIGINT signal. application terminated successfully.');

    // Exit the application
    process.exit(0);
});





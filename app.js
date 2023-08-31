require('dotenv').config();
const express = require('express');

const httpErrors = require("http-errors");

const cors = require("cors");

const expesneRoutes = require("./routes/expense.route");

const expenseTrackerBackendApp = express();

expenseTrackerBackendApp.use(express.json());

expenseTrackerBackendApp.use(cors());


expenseTrackerBackendApp.use("/api", expesneRoutes);

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


const port = 3000;

expenseTrackerBackendApp.listen(port, () => {
    console.log(`server is listening on the port of ${port}`);
})


require('dotenv').config();
const express = require('express');
const httpErrors = require("http-errors");
const cors = require("cors");
require("./helper/common/init_mongodb");

const parkingLotRoutes = require("./routes/parkingLot.route");
const parkingRoutes = require("./routes/parking.route");

const parkingLotBackend = express();

parkingLotBackend.use(cors());
parkingLotBackend.use(express.json());
parkingLotBackend.use(express.urlencoded({ extended: true }));

parkingLotBackend.use("/api", parkingLotRoutes);
parkingLotBackend.use("/api", parkingRoutes);

parkingLotBackend.use(async (req, _res, next) => {
    console.log(req, _res);
    next(httpErrors.NotFound(`Route not Found for [${req.method}] ${req.url}`));
});

// Common Error Handler
parkingLotBackend.use((error, req, res, next) => {
    const responseStatus = error.status || 500;
    const errorReason =
        error.message || `Cannot resolve request [${req.method}] ${req.url}`;
    if (res.headersSent === false) {
        res.status(responseStatus);
        res.send({
            isSuccess: false,
            error: {
                reason: errorReason
            }
        });
    }
    next();
});


const port = process.env.APP_PORT;

parkingLotBackend.listen(port, () => {
    console.log(`server is listening on the port of ${port}`);
})

process.on('SIGINT', () => {
    // Perform cleanup operations here
    console.log('Received SIGINT signal. application terminated successfully.');

    // Exit the application
    process.exit(0);
});





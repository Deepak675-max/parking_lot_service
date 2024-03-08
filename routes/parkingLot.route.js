const express = require('express');
const ParkingLotRouter = express.Router();
const ParkingLotService = require('../services/parkingLot.service');
const ParkingService = require('../services/parking.service');

const parkingLotService = new ParkingLotService();
const parkingService = new ParkingService();

const isValidCapacity = (capacity) => {
    return capacity >= 1 && capacity <= 2000;
}


// API endpoints
ParkingLotRouter.post('/ParkingLots', async (req, res, next) => {
    try {
        const { capacity } = req.body;
        if (!isValidCapacity(capacity)) {
            throw new Error('Capacity should be between 0 and 2000');
        }
        const newParkingLot = await parkingLotService.createParkingLot(capacity);
        if (res.headersSent === false) {
            res.status(201).send({
                isSuccess: true,
                response: newParkingLot
            })
        }
    } catch (error) {

    }
});


module.exports = ParkingLotRouter
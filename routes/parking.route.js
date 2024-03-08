const express = require('express');
const mongoose = require('mongoose');
const ParkingRouter = express.Router();
const ParkingService = require('../services/parking.service');

const parkingService = new ParkingService();

const validateParkingLotId = (parkingLotId) => {
    return mongoose.isValidObjectId(parkingLotId);
}

const validateRegistrationNumber = (registrationNumber) => {
    // Check if the length of the registration number is 9
    if (registrationNumber.length !== 9) {
        return false;
    }

    // Extract state code, district code, leading alphabet, and registration number
    var stateCode = registrationNumber.substring(0, 2);
    var districtCode = registrationNumber.substring(2, 4);
    var leadingAlphabet = registrationNumber.charAt(4);
    var registrationNum = registrationNumber.substring(5);

    // Check if the state code is alphanumeric and has a length of 2
    if (!stateCode.match(/^[A-Z]+$/) || stateCode.length !== 2) {
        return false;
    }

    // Check if the district code is alphanumeric and has a length of 2
    if (!districtCode.match(/^[0-9]+$/) || districtCode.length !== 2 || (parseInt(districtCode) < 1 || parseInt(districtCode) > 20)) {
        return false;
    }

    // Check if the leading alphabet is a single character
    if (!leadingAlphabet.match(/^[A-Z]$/) || leadingAlphabet.length !== 1) {
        return false;
    }

    // Check if the registration number is numeric
    if (!registrationNum.match(/^\d+$/)) {
        return false;
    }

    // All checks passed, the registration number is valid
    return true;
}

const validateColor = (color) => {
    const allowedColors = ['RED', 'GREEN', 'BLUE', 'BLACK', 'WHITE', 'YELLOW', 'ORANGE'];
    return !allowedColors.includes(color) ? false : true
}

ParkingRouter.post('/Parkings', async (req, res, next) => {
    try {
        const { parkingLotId, registrationNumber, color } = req.body;

        if (!validateParkingLotId(parkingLotId)) throw new Error('Invalid parking lot ID');

        if (!validateRegistrationNumber(registrationNumber)) throw new Error('Invalid Registration Number');

        if (!validateColor(color)) throw new Error('Color Not Allowed');

        const serviceResponse = await parkingService.parkCar(parkingLotId, registrationNumber, color);

        if (res.headersSent === false) {
            res.status(201).send({
                isSuccess: true,
                response: serviceResponse
            })
        }
    } catch (error) {
        next(error);
    }
});

ParkingRouter.delete('/Parkings', async (req, res, next) => {
    try {
        const { parkingLotId, registrationNumber } = req.body;

        if (!validateParkingLotId(parkingLotId)) throw new Error('Invalid parking lot ID');

        if (!validateRegistrationNumber(registrationNumber)) throw new Error('Invalid Registration Number');

        const serviceResponse = await parkingService.unParkCar(parkingLotId, registrationNumber);

        if (res.headersSent === false) {
            res.status(201).send({
                isSuccess: true,
                response: serviceResponse
            })
        }
    } catch (error) {
        next(error);
    }
});

ParkingRouter.get('/Parkings', async (req, res, next) => {
    try {
        const { color, parkingLotId } = req.query;

        if (!validateParkingLotId(parkingLotId)) throw new Error('Invalid parking lot ID');

        if (!validateColor(color)) throw new Error('Color Not Allowed');

        const serviceResponse = await parkingService.getRegistrationsByColor(color, parkingLotId);

        if (res.headersSent === false) {
            res.status(201).send({
                isSuccess: true,
                response: serviceResponse
            })
        }
    } catch (error) {
        next(error);
    }
});

ParkingRouter.get('/Slots', async (req, res, next) => {
    try {
        const { color, parkingLotId } = req.query;

        if (!validateParkingLotId(parkingLotId)) throw new Error('Invalid parking lot ID');

        if (!validateColor(color)) throw new Error('Color Not Allowed');

        const serviceResponse = await parkingService.getSlotsByColor(color, parkingLotId);

        if (res.headersSent === false) {
            res.status(201).send({
                isSuccess: true,
                response: serviceResponse
            })
        }
    } catch (error) {
        next(error);
    }
});

module.exports = ParkingRouter;



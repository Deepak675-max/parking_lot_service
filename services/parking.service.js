const mongoose = require('mongoose');
const Parking = require('../models/parking.model');
const ParkingLot = require('../models/parkingLot.model');
const ParkingLotService = require('./parkingLot.service');

class ParkingService extends ParkingLotService {
    constructor() {
        super();
    }
    async parkCar(parkingLotId, registrationNumber, color) {
        try {
            if (!this.isParkingLotExist(parkingLotId))
                throw new Error(`Parking lot not found`);

            const existingParking = await Parking.findOne({ parkingLotId: parkingLotId, registrationNumber: registrationNumber, status: 'PARKED' });

            if (existingParking) {
                throw new Error('Car already parked');
            }

            const nearestEmptySlot = await this.findNearestEmptySlots(parkingLotId);

            const parkedCar = new Parking({
                parkingLotId,
                registrationNumber,
                color,
                slotNumber: nearestEmptySlot,
                status: 'PARKED',
            });

            await parkedCar.save();

            await this.markSlotParked(parkingLotId, parkedCar.slotNumber);

            return {
                slotNumber: parkedCar.slotNumber,
                status: 'PARKED',
            };
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async unParkCar(parkingLotId, registrationNumber) {
        try {
            if (!this.isParkingLotExist(parkingLotId))
                throw new Error(`Parking lot not found`);

            const parking = await Parking.findOne({
                parkingLotId: parkingLotId,
                registrationNumber: registrationNumber,
                status: 'PARKED'
            });

            if (!parking) {
                throw new Error(`No parking found with registration number: ${registrationNumber} and parkinglot ID: ${parkingLotId}`);
            }

            parking.status = 'LEFT';

            parking.save();

            await this.markSlotUnparked(parkingLotId, parking.slotNumber);

            return {
                slotNumber: parking.slotNumber,
                registrationNumber: parking.registrationNumber,
                status: parking.status,
            };
        } catch (error) {
            throw error;
        }
    }

    async getRegistrationsByColor(color, parkingLotId) {
        try {
            if (!this.isParkingLotExist(parkingLotId))
                throw new Error(`Parking lot not found`);

            const parkings = await Parking.find({ parkingLotId: parkingLotId, color: color, status: 'PARKED' });

            if (parkings.length <= 0) throw new Error(`No car found with color ${color}`);

            return parkings.map((car) => ({
                registrationNumber: car.registrationNumber,
                color: car.color
            }));
        } catch (error) {
            throw error;
        }
    }

    async getSlotsByColor(color, parkingLotId) {
        try {
            if (!this.isParkingLotExist(parkingLotId))
                throw new Error(`Parking lot not found`);

            const parkings = await Parking.find({ parkingLotId: parkingLotId, color: color, status: 'PARKED' });

            if (parkings.length <= 0) throw new Error(`No car found with color ${color}`);

            return parkings.map((car) => ({
                slotNumber: car.slotNumber,
                color: car.color
            }));
        } catch (error) {
            throw error;
        }
    }

}

module.exports = ParkingService;

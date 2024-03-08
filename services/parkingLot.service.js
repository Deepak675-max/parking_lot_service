const ParkingLot = require('../models/parkingLot.model');

class ParkingLotService {
    async createParkingLot(capacity) {
        try {
            const slots = Array.from({ length: capacity }, (x) => 0);

            const parkingLot = new ParkingLot({ capacity, slots });

            await parkingLot.save();

            return {
                id: parkingLot._id,
                capacity: parkingLot.capacity,
                isActive: parkingLot.isActive,
            };
        } catch (error) {
            throw error;
        }
    }

    async isParkingLotExist(parkingLotId) {
        try {
            const parkingLot = await ParkingLot.findById(parkingLotId);
            return parkingLot && parkingLot.isActive ? true : false;
        } catch (error) {
            throw error;
        }
    }

    async findNearestEmptySlots(parkingLotId) {
        const parkingLot = await this.getParkingLotById(parkingLotId);
        return parkingLot.slots.findIndex(slot => slot === 0) + 1;
    }

    async markSlotUnparked(parkingLotId, slotNumber) {
        const parkingLot = await this.getParkingLotById(parkingLotId);
        parkingLot.slots[slotNumber - 1] = 0;
        await parkingLot.save();
    }

    async markSlotParked(parkingLotId, slotNumber) {
        const parkingLot = await this.getParkingLotById(parkingLotId);
        parkingLot.slots[slotNumber - 1] = 1;
        await parkingLot.save();
    }

    async getParkingLotById(parkingLotId) {
        try {
            const parkingLot = await ParkingLot.findById(parkingLotId);

            if (!parkingLot) {
                throw new Error('Parking lot not found');
            }

            return parkingLot;
        } catch (error) {
            throw error;
        }
    }

}

module.exports = ParkingLotService;

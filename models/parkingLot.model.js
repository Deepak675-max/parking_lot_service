const mongoose = require('mongoose');

const ParkingLotSchema = new mongoose.Schema({
    capacity: {
        type: Number,
        min: 0,
        max: 2000,
    },
    slots: {
        type: [Number],
        required: true
    },
    isActive: {
        type: Boolean,
        default: true,
    },
});

const ParkingLot = mongoose.model('ParkingLot', ParkingLotSchema);

module.exports = ParkingLot;

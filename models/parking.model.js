const mongoose = require('mongoose');

const ParkingSchema = new mongoose.Schema({
    parkingLotId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ParkingLot',
        required: true
    },
    registrationNumber: {
        type: String,
        required: true
    },
    slotNumber: {
        type: Number,
        required: true
    },
    color: {
        type: String,
        enum: ['RED', 'GREEN', 'BLUE', 'BLACK', 'WHITE', 'YELLOW', 'ORANGE'],
        required: true
    },
    status: {
        type: String,
        enum: ['PARKED', 'LEFT'],
        required: true
    },
});

const Parking = mongoose.model('Parking', ParkingSchema);

module.exports = Parking;

const mongoose = require("mongoose");

const forgotPasswordRequestsSchema = new mongoose.Schema({
    isActive: {
        type: Boolean,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
},
    {
        timestamps: true
    }
)

module.exports = mongoose.model('forgotPasswordRequest', forgotPasswordRequestsSchema);
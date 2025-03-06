const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PetOwner",
        required: true
    },
    sitterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PetSitter",
        required: true
    },
    petId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    startDate: {
        type: Date,
        // required: true
    },
    endDate: {
        type: Date,
        // required: true
    },
    status: {
        type: String,
        enum: ["pending", "confirmed", "completed", "cancelled"],
        default: "pending"
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Booking", bookingSchema);

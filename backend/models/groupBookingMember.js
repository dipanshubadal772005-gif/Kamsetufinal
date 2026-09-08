const mongoose = require("mongoose");

const groupBookingMemberSchema = new mongoose.Schema({
    groupBooking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "GroupBooking",
        required: true,
        index: true
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    flatNumber: {
        type: String,
        required: true,
        trim: true
    },
    building: {
        type: String,
        trim: true
    },
    requirement: {
        type: String,
        required: true,
        trim: true,
        maxlength: 2000
    },
    finalPrice: {
        type: Number,
        min: 0,
        default: 0
    },
    status: {
        type: String,
        enum: ["joined", "confirmed", "in_progress", "completed", "cancelled"],
        default: "joined"
    },
    booking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Booking",
        default: null
    }
}, {
    timestamps: true
});

groupBookingMemberSchema.index({ groupBooking: 1, customer: 1 }, { unique: true });

module.exports = mongoose.model("GroupBookingMember", groupBookingMemberSchema);

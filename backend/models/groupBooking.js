const mongoose = require("mongoose");

const groupQuoteSchema = new mongoose.Schema({
    provider: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    totalAmount: {
        type: Number,
        required: true,
        min: 0
    },
    perHouseholdAmount: {
        type: Number,
        required: true,
        min: 0
    },
    message: {
        type: String,
        trim: true,
        maxlength: 1000
    },
    status: {
        type: String,
        enum: ["pending", "accepted", "rejected"],
        default: "pending"
    }
}, { timestamps: true });

const groupBookingSchema = new mongoose.Schema({
    groupCode: {
        type: String,
        unique: true,
        required: true,
        index: true
    },
    inviteCode: {
        type: String,
        unique: true,
        required: true,
        index: true
    },
    organizer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    serviceName: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    serviceType: {
        type: String,
        trim: true
    },
    provider: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    location: {
        societyName: { type: String, required: true, trim: true },
        address: { type: String, required: true, trim: true },
        latitude: { type: Number, min: -90, max: 90, default: null },
        longitude: { type: Number, min: -180, max: 180, default: null }
    },
    bookingDate: {
        type: Date,
        required: true
    },
    bookingTime: {
        type: String,
        required: true,
        trim: true
    },
    maxMembers: {
        type: Number,
        min: 2,
        max: 20,
        default: 5
    },
    status: {
        type: String,
        enum: [
            "open",
            "full",
            "provider_requested",
            "quoted",
            "accepted",
            "in_progress",
            "completed",
            "cancelled"
        ],
        default: "open",
        index: true
    },
    quotes: [groupQuoteSchema]
}, {
    timestamps: true
});

groupBookingSchema.index({ serviceName: 1, status: 1, bookingDate: 1 });

groupBookingSchema.index({ "location.societyName": 1, serviceName: 1 });

module.exports = mongoose.model("GroupBooking", groupBookingSchema);

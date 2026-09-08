const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
    {
        bookingCode: {
            type: String,
            unique: true,
            required: true
        },

        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        provider: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        service: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Service",
            default: null
        },

        groupBooking: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "GroupBooking",
            default: null,
            index: true
        },

        serviceName: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            trim: true,
            maxlength: 2000
        },

        bookingDate: {
            type: Date,
            required: true
        },

        bookingTime: {
            type: String,
            required: true
        },

        location: {
            type: String,
            required: true,
            trim: true
        },

        locationCoordinates: {
            latitude: { type: Number, min: -90, max: 90, default: null },
            longitude: { type: Number, min: -180, max: 180, default: null }
        },

        agreedPrice: {
            type: Number,
            min: 0
        },

        // ==========================================
        // POST-COMPLETION PAYMENT
        // ==========================================

        paymentStatus: {
            type: String,
            enum: ["pending", "paid"],
            default: "pending"
        },

        paymentMethod: {
            type: String,
            enum: ["upi", "cash"],
            default: null
        },

        paymentReference: {
            type: String,
            trim: true,
            maxlength: 100,
            default: null
        },

        paymentRequestedAt: {
            type: Date,
            default: null
        },

        paidAt: {
            type: Date,
            default: null
        },

        status: {
            type: String,
            enum: [
                "pending",
                "accepted",
                "rejected",
                "ongoing",
                "completed",
                "cancelled"
            ],
            default: "pending"
        },

        isEmergency: {
            type: Boolean,
            default: false
        },

        // ==========================================
        // LIVE LOCATION TRACKING
        // ==========================================

        trackingEnabled: {
            type: Boolean,
            default: false
        },

        trackingStartedAt: {
            type: Date,
            default: null
        },

        trackingStoppedAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "Booking",
    bookingSchema
);
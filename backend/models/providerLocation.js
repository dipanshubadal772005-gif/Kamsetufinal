const mongoose = require("mongoose");

const providerLocationSchema = new mongoose.Schema(
    {
        provider: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },

        booking: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Booking",
            default: null
        },

        latitude: {
            type: Number,
            required: true,
            min: -90,
            max: 90
        },

        longitude: {
            type: Number,
            required: true,
            min: -180,
            max: 180
        },

        isSharing: {
            type: Boolean,
            default: true
        },

        lastUpdated: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "ProviderLocation",
    providerLocationSchema
);
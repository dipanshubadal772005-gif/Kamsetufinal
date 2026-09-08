const mongoose = require("mongoose");

const providerProfileSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },

        professionalType: {
            type: String,
            required: true,
            trim: true
        },

        experience: {
            type: Number,
            default: 0,
            min: 0
        },

        city: {
            type: String,
            required: true,
            trim: true
        },

        serviceArea: {
            type: String,
            trim: true
        },

        bio: {
            type: String,
            trim: true,
            maxlength: 1000
        },

        verified: {
            type: Boolean,
            default: false
        },

        rating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },

        totalJobs: {
            type: Number,
            default: 0,
            min: 0
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "ProviderProfile",
    providerProfileSchema
);
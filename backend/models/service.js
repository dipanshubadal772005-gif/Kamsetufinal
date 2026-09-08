const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
    {
        provider: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        serviceName: {
            type: String,
            required: true,
            trim: true
        },

        serviceType: {
            type: String,
            trim: true
        },

        description: {
            type: String,
            trim: true,
            maxlength: 2000
        },

        startingPrice: {
            type: Number,
            required: true,
            min: 0
        },

        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Service", serviceSchema);
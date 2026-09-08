const mongoose = require("mongoose");

const negotiationSchema = new mongoose.Schema(
    {
        booking: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Booking",
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

        proposedPrice: {
            type: Number,
            required: true,
            min: 0
        },

        proposedBy: {
            type: String,
            enum: ["customer", "provider"],
            required: true
        },

        status: {
            type: String,
            enum: [
                "pending",
                "accepted",
                "rejected",
                "countered"
            ],
            default: "pending"
        },

        message: {
            type: String,
            trim: true,
            maxlength: 1000
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Negotiation", negotiationSchema);
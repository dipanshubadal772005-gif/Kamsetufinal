const mongoose = require("mongoose");

const workHistorySchema = new mongoose.Schema(
    {
        provider: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        title: {
            type: String,
            required: true,
            trim: true
        },

        category: {
            type: String,
            trim: true
        },

        description: {
            type: String,
            trim: true,
            maxlength: 2000
        },

        completionDate: {
            type: Date
        },

        location: {
            type: String,
            trim: true
        },

        finalPrice: {
            type: Number,
            min: 0
        },

        customerRating: {
            type: Number,
            min: 0,
            max: 5
        },

        beforeImage: {
            type: String,
            default: ""
        },

        afterImage: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("WorkHistory", workHistorySchema);
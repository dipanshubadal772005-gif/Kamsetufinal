const express = require("express");

const {
    updateProviderLocation,
    getProviderLocation
} = require("../controllers/locationController");

const {
    protect,
    authorize
} = require("../middleware/authMiddleware");

const router = express.Router();

// Provider updates their live location
router.post(
    "/update",
    protect,
    authorize("provider"),
    updateProviderLocation
);

// Customer gets provider's live location
router.get(
    "/booking/:bookingId",
    protect,
    authorize("customer"),
    getProviderLocation
);

module.exports = router;
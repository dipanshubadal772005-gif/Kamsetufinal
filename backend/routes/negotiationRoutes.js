const express = require("express");

const {
    createNegotiation,
    getProviderNegotiations,
    getBookingNegotiations,
    updateNegotiation
} = require("../controllers/negotiationController");

const {
    protect
} = require("../middleware/authMiddleware");

const router = express.Router();


// Create a price proposal
router.post(
    "/",
    protect,
    createNegotiation
);


// Get all negotiations for logged-in provider
router.get(
    "/provider",
    protect,
    getProviderNegotiations
);


// Get all negotiations for a booking
router.get(
    "/booking/:bookingId",
    protect,
    getBookingNegotiations
);


// Accept, reject or counter an offer
router.patch(
    "/:id",
    protect,
    updateNegotiation
);


module.exports = router;
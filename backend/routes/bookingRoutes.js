const express = require("express");

const {
    createBooking,
    getAvailability,
    getEmergencyProviders,
    createEmergencyBooking,
    getCustomerBookings,
    getProviderBookings,
    getBookingById,
    rescheduleBooking,
    updateBookingStatus,
    requestPayment,
    confirmPayment
} = require("../controllers/bookingController");

const {
    protect,
    authorize
} = require("../middleware/authMiddleware");

const router = express.Router();


// Scheduling: available hourly slots for a provider/date
router.get(
    "/availability",
    getAvailability
);

// Emergency: find nearby service providers
router.get(
    "/emergency/providers",
    protect,
    authorize("customer"),
    getEmergencyProviders
);

// Emergency: create an immediate booking
router.post(
    "/emergency",
    protect,
    authorize("customer"),
    createEmergencyBooking
);

// Customer creates a booking
router.post(
    "/",
    protect,
    authorize("customer"),
    createBooking
);

// Customer gets their bookings
router.get(
    "/customer",
    protect,
    authorize("customer"),
    getCustomerBookings
);

// Provider gets incoming bookings
router.get(
    "/provider",
    protect,
    authorize("provider"),
    getProviderBookings
);

// Get a booking for a customer/provider
router.get(
    "/:id",
    protect,
    authorize("customer", "provider"),
    getBookingById
);

// Customer reschedules a pending/accepted booking
router.patch(
    "/:id/reschedule",
    protect,
    authorize("customer"),
    rescheduleBooking
);

// Provider accepts or rejects a booking
router.patch(
    "/:id/status",
    protect,
    authorize("provider"),
    updateBookingStatus
);

// Provider requests payment after completing the job
router.patch(
    "/:id/request-payment",
    protect,
    authorize("provider"),
    requestPayment
);

// Customer confirms payment after the job is completed
router.patch(
    "/:id/payment",
    protect,
    authorize("customer"),
    confirmPayment
);

module.exports = router;
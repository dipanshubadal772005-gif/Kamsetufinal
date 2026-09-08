const express = require("express");

const {
    createGroupBooking,
    getGroupBooking,
    getGroupByInviteCode,
    joinGroupBooking,
    getCustomerGroups,
    requestProvider,
    getProviderGroups,
    submitGroupQuote,
    acceptGroupQuote,
    cancelGroupBooking
} = require("../controllers/groupBookingController");

const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
    "/",
    protect,
    authorize("customer"),
    createGroupBooking
);

router.get(
    "/customer",
    protect,
    authorize("customer"),
    getCustomerGroups
);

router.get(
    "/invite/:code",
    protect,
    authorize("customer"),
    getGroupByInviteCode
);

router.post(
    "/:id/join",
    protect,
    authorize("customer"),
    joinGroupBooking
);

router.post(
    "/:id/request-provider",
    protect,
    authorize("customer"),
    requestProvider
);

router.post(
    "/:id/accept-quote",
    protect,
    authorize("customer"),
    acceptGroupQuote
);

router.post(
    "/:id/cancel",
    protect,
    authorize("customer"),
    cancelGroupBooking
);

router.get(
    "/provider",
    protect,
    authorize("provider"),
    getProviderGroups
);

router.post(
    "/:id/quote",
    protect,
    authorize("provider"),
    submitGroupQuote
);

router.get(
    "/:id",
    protect,
    getGroupBooking
);

module.exports = router;

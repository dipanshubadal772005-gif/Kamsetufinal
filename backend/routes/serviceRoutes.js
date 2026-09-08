const express = require("express");

const {
    createService,
    getMyServices,
    getAllServices
} = require("../controllers/serviceController");

const {
    protect,
    authorize
} = require("../middleware/authMiddleware");

const router = express.Router();

// Get all active services
router.get(
    "/",
    getAllServices
);

// Provider creates a service
router.post(
    "/",
    protect,
    authorize("provider"),
    createService
);

// Provider gets own services
router.get(
    "/my",
    protect,
    authorize("provider"),
    getMyServices
);

module.exports = router;
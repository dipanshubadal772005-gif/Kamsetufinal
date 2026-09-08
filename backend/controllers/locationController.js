const ProviderLocation = require("../models/providerLocation");
const Booking = require("../models/booking");

// UPDATE PROVIDER LOCATION
const updateProviderLocation = async (req, res) => {
    try {
        const {
            booking,
            latitude,
            longitude
        } = req.body;

        if (
            !booking ||
            latitude === undefined ||
            longitude === undefined
        ) {
            return res.status(400).json({
                success: false,
                message: "Booking, latitude and longitude are required"
            });
        }

        // Validate coordinates
        if (
            latitude < -90 ||
            latitude > 90 ||
            longitude < -180 ||
            longitude > 180
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid latitude or longitude"
            });
        }

        // Find booking
        const existingBooking = await Booking.findById(booking);

        if (!existingBooking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found"
            });
        }

        // Make sure logged-in provider belongs to booking
        if (existingBooking.provider.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "You are not the provider for this booking"
            });
        }

        // Update or create provider location
        const location = await ProviderLocation.findOneAndUpdate(
            {
                provider: req.user.id
            },
            {
                provider: req.user.id,
                booking: existingBooking._id,
                latitude: Number(latitude),
                longitude: Number(longitude),
                isSharing: true,
                lastUpdated: new Date()
            },
            {
                new: true,
                upsert: true
            }
        );

        res.json({
            success: true,
            message: "Provider location updated successfully",
            location
        });

    } catch (error) {
        console.error("Update provider location error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while updating provider location"
        });
    }
};

// GET PROVIDER LOCATION FOR A BOOKING
const getProviderLocation = async (req, res) => {
    try {
        const { bookingId } = req.params;

        // Find booking
        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found"
            });
        }

        // Make sure logged-in customer belongs to this booking
        if (booking.customer.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "You are not the customer for this booking"
            });
        }

        // Find provider's latest location
        const location = await ProviderLocation.findOne({
            provider: booking.provider,
            booking: booking._id,
            isSharing: true
        });

        if (!location) {
            return res.status(404).json({
                success: false,
                message: "Provider location is not available"
            });
        }

        res.json({
            success: true,
            location
        });

    } catch (error) {
        console.error("Get provider location error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while getting provider location"
        });
    }
};

module.exports = {
    updateProviderLocation,
    getProviderLocation
};
const Booking = require("../models/booking");
const Service = require("../models/service");
const User = require("../models/user");
const ProviderLocation = require("../models/providerLocation");


const SLOT_START_HOUR = 9;
const SLOT_END_HOUR = 18;
const SLOT_STEP_MINUTES = 60;

function normalizeTimeToMinutes(value) {
    const text = String(value || "").trim().toUpperCase();
    if (!text) return null;

    const match = text.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?$/);
    if (!match) return null;

    let hour = Number(match[1]);
    const minute = Number(match[2] || 0);
    const meridiem = match[3];

    if (minute > 59) return null;

    if (meridiem) {
        if (hour < 1 || hour > 12) return null;
        if (meridiem === "AM" && hour === 12) hour = 0;
        if (meridiem === "PM" && hour !== 12) hour += 12;
    }

    if (hour > 23) return null;
    return hour * 60 + minute;
}

function formatSlot(minutes) {
    const hour24 = Math.floor(minutes / 60);
    const minute = minutes % 60;
    const suffix = hour24 >= 12 ? "PM" : "AM";
    const hour12 = hour24 % 12 || 12;
    return `${hour12}:${String(minute).padStart(2, "0")} ${suffix}`;
}

function validDateOnly(value) {
    const date = new Date(`${value}T00:00:00`);
    return !Number.isNaN(date.getTime()) && /^\d{4}-\d{2}-\d{2}$/.test(String(value));
}

const getAvailability = async (req, res) => {
    try {
        const { provider, date } = req.query;

        if (!provider || !date || !validDateOnly(date)) {
            return res.status(400).json({
                success: false,
                message: "Provider and a valid date (YYYY-MM-DD) are required"
            });
        }

        const start = new Date(`${date}T00:00:00`);
        const end = new Date(start);
        end.setDate(end.getDate() + 1);

        const bookings = await Booking.find({
            provider,
            bookingDate: { $gte: start, $lt: end },
            status: { $in: ["pending", "accepted", "ongoing"] }
        }).select("bookingTime status");

        const bookedMinutes = new Set(
            bookings
                .map(b => normalizeTimeToMinutes(b.bookingTime))
                .filter(v => v !== null)
        );

        const slots = [];
        for (let minutes = SLOT_START_HOUR * 60; minutes <= SLOT_END_HOUR * 60; minutes += SLOT_STEP_MINUTES) {
            slots.push({
                value: formatSlot(minutes),
                label: formatSlot(minutes),
                available: !bookedMinutes.has(minutes)
            });
        }

        res.json({ success: true, date, provider, slots });
    } catch (error) {
        console.error("Availability error:", error);
        res.status(500).json({
            success: false,
            message: "Server error while checking availability"
        });
    }
};

const getEmergencyProviders = async (req, res) => {
    try {
        const latitude = Number(req.query.latitude);
        const longitude = Number(req.query.longitude);
        const serviceName = String(req.query.service || "").trim().toLowerCase();

        if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
            return res.status(400).json({
                success: false,
                message: "Valid latitude and longitude are required"
            });
        }

        const services = await Service.find({ isActive: true })
            .populate("provider", "name email phone role");

        const locations = await ProviderLocation.find({ isSharing: true })
            .select("provider latitude longitude lastUpdated");

        const locationMap = new Map(
            locations.map(location => [String(location.provider), location])
        );

        const providers = new Map();

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const tomorrowStart = new Date(todayStart);
        tomorrowStart.setDate(tomorrowStart.getDate() + 1);

        const busyBookings = await Booking.find({
            status: { $in: ["pending", "accepted", "ongoing"] },
            bookingDate: { $gte: todayStart, $lt: tomorrowStart }
        }).select("provider");
        const busyProviderIds = new Set(busyBookings.map(b => String(b.provider)));

        for (const service of services) {
            if (!service.provider) continue;

            const providerId = String(service.provider._id);
            if (busyProviderIds.has(providerId)) continue;
            const serviceMatches = !serviceName ||
                String(service.serviceName || "").toLowerCase().includes(serviceName) ||
                String(service.serviceType || "").toLowerCase().includes(serviceName);

            if (!serviceMatches) continue;

            const location = locationMap.get(providerId);
            let distanceKm = null;

            if (location) {
                const toRad = value => value * Math.PI / 180;
                const earthRadius = 6371;
                const dLat = toRad(location.latitude - latitude);
                const dLon = toRad(location.longitude - longitude);
                const a = Math.sin(dLat / 2) ** 2 +
                    Math.cos(toRad(latitude)) * Math.cos(toRad(location.latitude)) *
                    Math.sin(dLon / 2) ** 2;
                distanceKm = earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            }

            const current = providers.get(providerId);
            if (!current || (distanceKm !== null && (current.distanceKm === null || distanceKm < current.distanceKm))) {
                providers.set(providerId, {
                    providerId,
                    providerName: service.provider.name,
                    serviceId: service._id,
                    serviceName: service.serviceName,
                    serviceType: service.serviceType || "",
                    startingPrice: service.startingPrice,
                    distanceKm: distanceKm === null ? null : Number(distanceKm.toFixed(2)),
                    locationAvailable: Boolean(location)
                });
            }
        }

        const result = Array.from(providers.values())
            .sort((a, b) => {
                if (a.distanceKm === null && b.distanceKm === null) return 0;
                if (a.distanceKm === null) return 1;
                if (b.distanceKm === null) return -1;
                return a.distanceKm - b.distanceKm;
            })
            .slice(0, 10);

        res.json({ success: true, providers: result });
    } catch (error) {
        console.error("Emergency providers error:", error);
        res.status(500).json({
            success: false,
            message: "Server error while finding emergency providers"
        });
    }
};

const createEmergencyBooking = async (req, res) => {
    try {
        const {
            provider,
            service,
            serviceName,
            description,
            location,
            locationCoordinates,
            agreedPrice
        } = req.body || {};

        const latitude = Number(locationCoordinates?.latitude);
        const longitude = Number(locationCoordinates?.longitude);

        if (!provider || !serviceName || !location || !Number.isFinite(latitude) || !Number.isFinite(longitude)) {
            return res.status(400).json({
                success: false,
                message: "Provider, service, location and valid coordinates are required"
            });
        }

        const providerUser = await User.findOne({ _id: provider, role: "provider" });
        if (!providerUser) {
            return res.status(404).json({ success: false, message: "Provider not found" });
        }

        const providerService = service ? await Service.findOne({ _id: service, provider, isActive: true }) : null;
        if (service && !providerService) {
            return res.status(404).json({ success: false, message: "Selected provider service not found" });
        }

        const now = new Date();
        const bookingCode = "KM-EM" + Date.now().toString().slice(-8);
        const bookingTime = now.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
        });

        const booking = await Booking.create({
            bookingCode,
            customer: req.user.id,
            provider,
            service: service || null,
            serviceName,
            description: description || "Emergency service request",
            bookingDate: now,
            bookingTime,
            location,
            locationCoordinates: { latitude, longitude },
            agreedPrice: agreedPrice !== undefined ? Number(agreedPrice) : undefined,
            isEmergency: true,
            status: "pending"
        });

        res.status(201).json({
            success: true,
            message: "Emergency booking created successfully",
            booking
        });
    } catch (error) {
        console.error("Emergency booking error:", error);
        res.status(500).json({
            success: false,
            message: "Server error while creating emergency booking"
        });
    }
};

const createBooking = async (req, res) => {
    try {
        const {
            provider,
            service,
            serviceName,
            description,
            bookingDate,
            bookingTime,
            location,
            locationCoordinates,
            agreedPrice,
            isEmergency
        } = req.body;

        if (
            !provider ||
            !serviceName ||
            !bookingDate ||
            !bookingTime ||
            !location
        ) {
            return res.status(400).json({
                success: false,
                message: "Provider, service name, date, time and location are required"
            });
        }

        const providerService = service
            ? await Service.findById(service)
            : null;

        if (service && !providerService) {
            return res.status(404).json({
                success: false,
                message: "Service not found"
            });
        }

        if (
            providerService &&
            providerService.provider.toString() !== provider
        ) {
            return res.status(400).json({
                success: false,
                message: "Service does not belong to this provider"
            });
        }

        const bookingCode =
            "KM-" +
            Date.now().toString().slice(-8);

        const booking = await Booking.create({
            bookingCode,
            customer: req.user.id,
            provider,
            service: service || null,
            serviceName,
            description,
            bookingDate,
            bookingTime,
            location,
            locationCoordinates: locationCoordinates || undefined,
            agreedPrice:
                agreedPrice !== undefined
                    ? Number(agreedPrice)
                    : undefined,
            isEmergency: Boolean(isEmergency),
            status: "pending"
        });

        res.status(201).json({
            success: true,
            message: "Booking created successfully",
            booking
        });

    } catch (error) {
        console.error("Create booking error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while creating booking"
        });
    }
};

const getCustomerBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({
            customer: req.user.id
        })
            .populate("provider", "name email phone")
            .populate("service", "serviceName serviceType startingPrice")
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: bookings.length,
            bookings
        });

    } catch (error) {
        console.error("Get customer bookings error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while fetching bookings"
        });
    }
};

const getProviderBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({
            provider: req.user.id
        })
            .populate("customer", "name email phone")
            .populate("service", "serviceName serviceType startingPrice")
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: bookings.length,
            bookings
        });

    } catch (error) {
        console.error("Get provider bookings error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while fetching bookings"
        });
    }
};
const getBookingById = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate("customer", "name email phone")
            .populate("provider", "name email phone")
            .populate("service", "serviceName serviceType startingPrice");

        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }

        const customerId = booking.customer?._id?.toString();
        const providerId = booking.provider?._id?.toString();
        if (customerId !== req.user.id && providerId !== req.user.id) {
            return res.status(403).json({ success: false, message: "You are not part of this booking" });
        }

        res.json({ success: true, booking });
    } catch (error) {
        console.error("Get booking error:", error);
        res.status(500).json({ success: false, message: "Server error while fetching booking" });
    }
};


const rescheduleBooking = async (req, res) => {
    try {
        const { bookingDate, bookingTime } = req.body || {};
        if (!bookingDate || !bookingTime || !validDateOnly(bookingDate) || normalizeTimeToMinutes(bookingTime) === null) {
            return res.status(400).json({ success: false, message: "Valid booking date and time are required" });
        }

        const requestedDate = new Date(`${bookingDate}T00:00:00`);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (requestedDate < today) {
            return res.status(400).json({ success: false, message: "Booking date cannot be in the past" });
        }

        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });
        if (booking.customer.toString() !== req.user.id) return res.status(403).json({ success: false, message: "Only the customer can reschedule this booking" });
        if (!["pending", "accepted"].includes(booking.status)) return res.status(400).json({ success: false, message: "Only pending or accepted bookings can be rescheduled" });

        const start = requestedDate;
        const end = new Date(requestedDate);
        end.setDate(end.getDate() + 1);
        const requestedMinutes = normalizeTimeToMinutes(bookingTime);

        const conflicts = await Booking.find({
            _id: { $ne: booking._id },
            provider: booking.provider,
            bookingDate: { $gte: start, $lt: end },
            status: { $in: ["pending", "accepted", "ongoing"] }
        }).select("bookingTime");

        if (conflicts.some(item => normalizeTimeToMinutes(item.bookingTime) === requestedMinutes)) {
            return res.status(409).json({ success: false, message: "That time slot is no longer available" });
        }

        booking.bookingDate = requestedDate;
        booking.bookingTime = bookingTime;
        await booking.save();

        res.json({ success: true, message: "Booking rescheduled successfully", booking });
    } catch (error) {
        console.error("Reschedule booking error:", error);
        res.status(500).json({ success: false, message: "Server error while rescheduling booking" });
    }
};

const updateBookingStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!["accepted", "rejected", "cancelled", "completed", "ongoing"].includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid booking status" });
        }

        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found"
            });
        }

        const isProvider = booking.provider.toString() === req.user.id;
        const isCustomer = booking.customer.toString() === req.user.id;
        if (!isProvider && !isCustomer) {
            return res.status(403).json({ success:false, message:"You are not part of this booking" });
        }
        if (status === "accepted" && !isProvider) {
            return res.status(403).json({ success:false, message:"Only the provider can accept a booking" });
        }
        if (status === "rejected" && !isProvider) {
            return res.status(403).json({ success:false, message:"Only the provider can reject a booking" });
        }
        booking.status = status;
        if (["cancelled","completed","rejected"].includes(status)) {
            booking.trackingEnabled = false;
            booking.trackingStoppedAt = new Date();
        }
        if (status === "accepted") {
            booking.trackingEnabled = true;
            booking.trackingStartedAt = booking.trackingStartedAt || new Date();
            booking.trackingStoppedAt = null;
        }
        await booking.save();

        // Keep group-booking progress in sync with the existing individual booking flow.
        if (booking.groupBooking) {
            const GroupBookingMember = require("../models/groupBookingMember");
            const GroupBooking = require("../models/groupBooking");

            const memberStatus = {
                accepted: "confirmed",
                ongoing: "in_progress",
                completed: "completed",
                cancelled: "cancelled",
                rejected: "cancelled"
            }[status];

            if (memberStatus) {
                await GroupBookingMember.updateOne(
                    { booking: booking._id },
                    { $set: { status: memberStatus } }
                );
            }

            if (status === "ongoing") {
                await GroupBooking.findByIdAndUpdate(booking.groupBooking, { status: "in_progress" });
            } else if (status === "completed") {
                const remaining = await GroupBookingMember.countDocuments({
                    groupBooking: booking.groupBooking,
                    status: { $ne: "completed" }
                });
                if (remaining === 0) {
                    await GroupBooking.findByIdAndUpdate(booking.groupBooking, { status: "completed" });
                }
            } else if (status === "cancelled" || status === "rejected") {
                const active = await GroupBookingMember.countDocuments({
                    groupBooking: booking.groupBooking,
                    status: { $nin: ["completed", "cancelled"] }
                });
                if (active === 0) {
                    await GroupBooking.findByIdAndUpdate(booking.groupBooking, { status: "cancelled" });
                }
            }
        }

        res.json({
            success: true,
            message: `Booking ${status} successfully`,
            booking
        });

    } catch (error) {
        console.error("Update booking status error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while updating booking"
        });
    }
};

const requestPayment = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found"
            });
        }

        if (booking.provider.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "Only the provider can request payment"
            });
        }

        if (booking.status !== "completed") {
            return res.status(400).json({
                success: false,
                message: "Payment can be requested only after the work is completed"
            });
        }

        if (!booking.agreedPrice || booking.agreedPrice <= 0) {
            return res.status(400).json({
                success: false,
                message: "A valid agreed price is required before requesting payment"
            });
        }

        if (booking.paymentStatus === "paid") {
            return res.status(400).json({
                success: false,
                message: "This booking has already been paid"
            });
        }

        booking.paymentRequestedAt = new Date();
        await booking.save();

        res.json({
            success: true,
            message: "Payment request sent to the customer",
            booking
        });
    } catch (error) {
        console.error("Request payment error:", error);
        res.status(500).json({
            success: false,
            message: "Server error while requesting payment"
        });
    }
};

const confirmPayment = async (req, res) => {
    try {
        const { paymentMethod, paymentReference } = req.body || {};

        if (!["upi", "cash"].includes(paymentMethod)) {
            return res.status(400).json({
                success: false,
                message: "Select UPI or Cash as the payment method"
            });
        }

        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found"
            });
        }

        if (booking.customer.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "Only the customer can confirm this payment"
            });
        }

        if (booking.status !== "completed") {
            return res.status(400).json({
                success: false,
                message: "Payment is available only after the work is completed"
            });
        }

        if (!booking.agreedPrice || booking.agreedPrice <= 0) {
            return res.status(400).json({
                success: false,
                message: "This booking has no valid payment amount"
            });
        }

        if (booking.paymentStatus === "paid") {
            return res.status(400).json({
                success: false,
                message: "This booking has already been paid"
            });
        }

        booking.paymentStatus = "paid";
        booking.paymentMethod = paymentMethod;
        booking.paymentReference = String(paymentReference || "").trim().slice(0, 100) || null;
        booking.paidAt = new Date();

        await booking.save();

        res.json({
            success: true,
            message: "Payment recorded successfully",
            booking
        });
    } catch (error) {
        console.error("Confirm payment error:", error);
        res.status(500).json({
            success: false,
            message: "Server error while confirming payment"
        });
    }
};

module.exports = {
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
};
const mongoose = require("mongoose");
const crypto = require("crypto");

const GroupBooking = require("../models/groupBooking");
const GroupBookingMember = require("../models/groupBookingMember");
const Booking = require("../models/booking");
const Service = require("../models/service");
const User = require("../models/user");

const makeCode = (prefix, bytes = 4) =>
    `${prefix}-${crypto.randomBytes(bytes).toString("hex").toUpperCase()}`;

const makeInviteCode = () =>
    crypto.randomBytes(5).toString("hex").toUpperCase();

const normalizeServiceName = (value) => String(value || "").trim();

const getMemberCount = async (groupId) =>
    GroupBookingMember.countDocuments({ groupBooking: groupId });

const populateGroup = async (group) => {
    await group.populate([
        { path: "organizer", select: "name email phone" },
        { path: "provider", select: "name email phone" }
    ]);

    return group;
};

const getGroupWithMembers = async (groupId) => {
    const group = await GroupBooking.findById(groupId)
        .populate("organizer", "name email phone")
        .populate("provider", "name email phone")
        .populate("quotes.provider", "name email phone")
        .lean();

    if (!group) return null;

    group.members = await GroupBookingMember.find({ groupBooking: groupId })
        .populate("customer", "name email phone")
        .populate("booking", "bookingCode status agreedPrice")
        .sort({ createdAt: 1 })
        .lean();

    return group;
};

const createGroupBooking = async (req, res) => {
    try {
        const {
            serviceName,
            serviceType,
            societyName,
            address,
            latitude,
            longitude,
            bookingDate,
            bookingTime,
            maxMembers,
            flatNumber,
            building,
            requirement
        } = req.body;

        const normalizedService = normalizeServiceName(serviceName);
        const parsedDate = new Date(bookingDate);
        const max = Number(maxMembers || 5);

        if (!normalizedService || !societyName || !address || !bookingDate || !bookingTime || !flatNumber || !requirement) {
            return res.status(400).json({
                success: false,
                message: "Service, society, address, date, time, flat number and requirement are required"
            });
        }

        if (Number.isNaN(parsedDate.getTime()) || parsedDate <= new Date()) {
            return res.status(400).json({
                success: false,
                message: "Group booking date must be a valid future date"
            });
        }

        if (!Number.isInteger(max) || max < 2 || max > 20) {
            return res.status(400).json({
                success: false,
                message: "Maximum members must be between 2 and 20"
            });
        }

        const group = await GroupBooking.create({
            groupCode: makeCode("GB"),
            inviteCode: makeInviteCode(),
            organizer: req.user.id,
            serviceName: normalizedService,
            serviceType,
            location: {
                societyName,
                address,
                latitude: latitude === "" || latitude === undefined ? null : Number(latitude),
                longitude: longitude === "" || longitude === undefined ? null : Number(longitude)
            },
            bookingDate: parsedDate,
            bookingTime,
            maxMembers,
            status: "open"
        });

        await GroupBookingMember.create({
            groupBooking: group._id,
            customer: req.user.id,
            flatNumber,
            building,
            requirement
        });

        const result = await getGroupWithMembers(group._id);

        res.status(201).json({
            success: true,
            message: "Group booking created successfully",
            group: result
        });
    } catch (error) {
        console.error("Create group booking error:", error);
        res.status(500).json({ success: false, message: "Server error while creating group booking" });
    }
};

const getGroupBooking = async (req, res) => {
    try {
        const group = await getGroupWithMembers(req.params.id);

        if (!group) {
            return res.status(404).json({ success: false, message: "Group booking not found" });
        }

        const member = group.members.some(
            (item) => item.customer?._id?.toString() === req.user.id
        );

        if (group.organizer?._id?.toString() !== req.user.id && !member) {
            return res.status(403).json({ success: false, message: "Join this group to view its details" });
        }

        res.json({ success: true, group });
    } catch (error) {
        console.error("Get group booking error:", error);
        res.status(500).json({ success: false, message: "Server error while fetching group booking" });
    }
};

const getGroupByInviteCode = async (req, res) => {
    try {
        const group = await GroupBooking.findOne({
            inviteCode: String(req.params.code).toUpperCase()
        })
            .populate("organizer", "name")
            .lean();

        if (!group) {
            return res.status(404).json({ success: false, message: "Invalid or expired group invite" });
        }

        const memberCount = await getMemberCount(group._id);

        res.json({
            success: true,
            group: {
                _id: group._id,
                groupCode: group.groupCode,
                serviceName: group.serviceName,
                serviceType: group.serviceType,
                societyName: group.location.societyName,
                address: group.location.address,
                bookingDate: group.bookingDate,
                bookingTime: group.bookingTime,
                maxMembers: group.maxMembers,
                memberCount,
                status: group.status,
                organizer: group.organizer
            }
        });
    } catch (error) {
        console.error("Get group invite error:", error);
        res.status(500).json({ success: false, message: "Server error while loading invite" });
    }
};

const joinGroupBooking = async (req, res) => {
    try {
        const {
            flatNumber,
            building,
            requirement
        } = req.body;

        if (!flatNumber || !requirement) {
            return res.status(400).json({
                success: false,
                message: "Flat number and service requirement are required"
            });
        }

        const group = await GroupBooking.findById(req.params.id);

        if (!group) {
            return res.status(404).json({ success: false, message: "Group booking not found" });
        }

        if (!["open", "full"].includes(group.status)) {
            return res.status(400).json({ success: false, message: "This group is no longer accepting members" });
        }

        const existing = await GroupBookingMember.findOne({
            groupBooking: group._id,
            customer: req.user.id
        });

        if (existing) {
            return res.status(409).json({ success: false, message: "You are already a member of this group" });
        }

        const memberCount = await getMemberCount(group._id);

        if (memberCount >= group.maxMembers) {
            group.status = "full";
            await group.save();
            return res.status(409).json({ success: false, message: "This group is already full" });
        }

        await GroupBookingMember.create({
            groupBooking: group._id,
            customer: req.user.id,
            flatNumber,
            building,
            requirement
        });

        const newCount = memberCount + 1;
        group.status = newCount >= group.maxMembers ? "full" : "open";
        await group.save();

        res.json({
            success: true,
            message: "You joined the group booking",
            group: await getGroupWithMembers(group._id)
        });
    } catch (error) {
        console.error("Join group booking error:", error);
        res.status(500).json({ success: false, message: "Server error while joining group booking" });
    }
};

const getCustomerGroups = async (req, res) => {
    try {
        const memberships = await GroupBookingMember.find({ customer: req.user.id })
            .select("groupBooking")
            .lean();

        const ids = memberships.map((item) => item.groupBooking);
        const groups = await GroupBooking.find({
            $or: [
                { organizer: req.user.id },
                { _id: { $in: ids } }
            ]
        })
            .populate("organizer", "name")
            .populate("provider", "name")
            .sort({ createdAt: -1 })
            .lean();

        const counts = await Promise.all(
            groups.map((group) => getMemberCount(group._id))
        );

        groups.forEach((group, index) => {
            group.memberCount = counts[index];
        });

        res.json({ success: true, count: groups.length, groups });
    } catch (error) {
        console.error("Get customer groups error:", error);
        res.status(500).json({ success: false, message: "Server error while fetching group bookings" });
    }
};

const requestProvider = async (req, res) => {
    try {
        const group = await GroupBooking.findById(req.params.id);

        if (!group) {
            return res.status(404).json({ success: false, message: "Group booking not found" });
        }

        if (group.organizer.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: "Only the organizer can request a provider" });
        }

        if (!["open", "full"].includes(group.status)) {
            return res.status(400).json({ success: false, message: "Provider request cannot be sent in the current group state" });
        }

        const count = await getMemberCount(group._id);

        if (count < 2) {
            return res.status(400).json({ success: false, message: "At least 2 households must join before requesting a provider" });
        }

        group.status = "provider_requested";
        await group.save();

        res.json({
            success: true,
            message: "Group request is now visible to matching providers",
            group: await getGroupWithMembers(group._id)
        });
    } catch (error) {
        console.error("Request provider error:", error);
        res.status(500).json({ success: false, message: "Server error while requesting provider" });
    }
};

const getProviderGroups = async (req, res) => {
    try {
        const services = await Service.find({
            provider: req.user.id,
            isActive: true
        }).select("serviceName serviceType").lean();

        if (!services.length) {
            return res.json({ success: true, count: 0, groups: [] });
        }

        const serviceNames = services.map((service) => service.serviceName);
        const serviceMatchers = serviceNames.map((name) => ({
            serviceName: { $regex: `^${String(name).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" }
        }));
        const groups = await GroupBooking.find({
            $or: serviceMatchers,
            status: { $in: ["provider_requested", "quoted"] },
            bookingDate: { $gte: new Date() }
        })
            .populate("organizer", "name phone")
            .sort({ bookingDate: 1, createdAt: -1 })
            .lean();

        const result = [];

        for (const group of groups) {
            const members = await GroupBookingMember.find({ groupBooking: group._id })
                .populate("customer", "name phone")
                .sort({ createdAt: 1 })
                .lean();

            const providerQuote = group.quotes?.find(
                (quote) => quote.provider?.toString() === req.user.id
            );

            result.push({
                ...group,
                members,
                memberCount: members.length,
                providerQuote: providerQuote || null
            });
        }

        res.json({ success: true, count: result.length, groups: result });
    } catch (error) {
        console.error("Get provider groups error:", error);
        res.status(500).json({ success: false, message: "Server error while fetching group requests" });
    }
};

const submitGroupQuote = async (req, res) => {
    try {
        const { totalAmount, message } = req.body;
        const amount = Number(totalAmount);

        if (!Number.isFinite(amount) || amount < 0) {
            return res.status(400).json({ success: false, message: "Enter a valid total quote amount" });
        }

        const group = await GroupBooking.findById(req.params.id);

        if (!group) {
            return res.status(404).json({ success: false, message: "Group booking not found" });
        }

        if (!["provider_requested", "quoted", "full"].includes(group.status)) {
            return res.status(400).json({ success: false, message: "This group is not accepting provider quotes" });
        }

        const providerService = await Service.findOne({
            provider: req.user.id,
            serviceName: { $regex: `^${String(group.serviceName).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" },
            isActive: true
        });

        if (!providerService) {
            return res.status(403).json({ success: false, message: "You do not provide this service" });
        }

        const memberCount = await getMemberCount(group._id);

        if (memberCount < 2) {
            return res.status(400).json({ success: false, message: "The group needs at least 2 households" });
        }

        const existing = group.quotes.find(
            (quote) => quote.provider.toString() === req.user.id && quote.status === "pending"
        );

        const perHousehold = Number((amount / memberCount).toFixed(2));

        if (existing) {
            existing.totalAmount = amount;
            existing.perHouseholdAmount = perHousehold;
            existing.message = message || "";
        } else {
            group.quotes.push({
                provider: req.user.id,
                totalAmount: amount,
                perHouseholdAmount: perHousehold,
                message: message || ""
            });
        }

        group.status = "quoted";
        await group.save();

        res.json({
            success: true,
            message: "Group quote submitted",
            group: await getGroupWithMembers(group._id)
        });
    } catch (error) {
        console.error("Submit group quote error:", error);
        res.status(500).json({ success: false, message: "Server error while submitting group quote" });
    }
};

const acceptGroupQuote = async (req, res) => {
    try {
        const { quoteId } = req.body;

        if (!mongoose.Types.ObjectId.isValid(quoteId)) {
            return res.status(400).json({ success: false, message: "Invalid quote" });
        }

        const group = await GroupBooking.findById(req.params.id);

        if (!group) {
            return res.status(404).json({ success: false, message: "Group booking not found" });
        }

        if (group.organizer.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: "Only the organizer can accept a group quote" });
        }

        if (!["quoted", "provider_requested", "full"].includes(group.status)) {
            return res.status(400).json({ success: false, message: "This group cannot accept a quote now" });
        }

        const quote = group.quotes.id(quoteId);

        if (!quote || quote.status !== "pending") {
            return res.status(404).json({ success: false, message: "Pending quote not found" });
        }

        const members = await GroupBookingMember.find({ groupBooking: group._id }).sort({ createdAt: 1 });

        if (members.length < 2) {
            return res.status(400).json({ success: false, message: "At least 2 households are required" });
        }

        const providerService = await Service.findOne({
            provider: quote.provider,
            serviceName: { $regex: `^${String(group.serviceName).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" },
            isActive: true
        });

        if (!providerService) {
            return res.status(400).json({ success: false, message: "The selected provider no longer offers this service" });
        }

        const perHousehold = Number((quote.totalAmount / members.length).toFixed(2));
        const bookingsToCreate = [];

        for (const member of members) {
            bookingsToCreate.push({
                bookingCode: makeCode("KM", 5),
                customer: member.customer,
                provider: quote.provider,
                service: providerService._id,
                serviceName: group.serviceName,
                groupBooking: group._id,
                description: member.requirement,
                bookingDate: group.bookingDate,
                bookingTime: group.bookingTime,
                location: `${group.location.societyName}, ${group.location.address}${member.building ? `, ${member.building}` : ""}, ${member.flatNumber}`,
                locationCoordinates: {
                    latitude: group.location.latitude,
                    longitude: group.location.longitude
                },
                agreedPrice: perHousehold,
                isEmergency: false,
                status: "pending"
            });
        }

        const createdBookings = await Booking.insertMany(bookingsToCreate, { ordered: true });

        for (let index = 0; index < members.length; index += 1) {
            members[index].booking = createdBookings[index]._id;
            members[index].finalPrice = perHousehold;
            members[index].status = "confirmed";
            await members[index].save();
        }

        group.provider = quote.provider;
        group.status = "accepted";
        group.quotes.forEach((item) => {
            item.status = item._id.toString() === quoteId ? "accepted" : "rejected";
        });
        await group.save();

        res.json({
            success: true,
            message: "Group quote accepted and individual bookings created",
            group: await getGroupWithMembers(group._id),
            bookings: createdBookings
        });
    } catch (error) {
        console.error("Accept group quote error:", error);
        res.status(500).json({ success: false, message: "Server error while accepting group quote" });
    }
};

const cancelGroupBooking = async (req, res) => {
    try {
        const group = await GroupBooking.findById(req.params.id);

        if (!group) {
            return res.status(404).json({ success: false, message: "Group booking not found" });
        }

        if (group.organizer.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: "Only the organizer can cancel this group" });
        }

        if (["completed", "cancelled"].includes(group.status)) {
            return res.status(400).json({ success: false, message: "Group is already closed" });
        }

        group.status = "cancelled";
        await group.save();

        await Booking.updateMany(
            { _id: { $in: await GroupBookingMember.find({ groupBooking: group._id }).distinct("booking") }, status: { $in: ["pending", "accepted"] } },
            { $set: { status: "cancelled", trackingEnabled: false, trackingStoppedAt: new Date() } }
        );

        await GroupBookingMember.updateMany(
            { groupBooking: group._id, status: { $nin: ["completed", "cancelled"] } },
            { $set: { status: "cancelled" } }
        );

        res.json({ success: true, message: "Group booking cancelled", group: await getGroupWithMembers(group._id) });
    } catch (error) {
        console.error("Cancel group booking error:", error);
        res.status(500).json({ success: false, message: "Server error while cancelling group booking" });
    }
};

module.exports = {
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
};

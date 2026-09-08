const Negotiation = require("../models/negotiation");
const Booking = require("../models/booking");


// =====================================================
// CUSTOMER / PROVIDER CREATES AN OFFER
// =====================================================

const createNegotiation = async (req, res) => {
    try {

        const {
            booking,
            proposedPrice,
            message
        } = req.body;


        if (!booking || proposedPrice === undefined) {

            return res.status(400).json({
                success: false,
                message:
                    "Booking and proposed price are required"
            });

        }


        if (!Number.isFinite(Number(proposedPrice)) || Number(proposedPrice) < 0) {

            return res.status(400).json({
                success: false,
                message:
                    "Proposed price cannot be negative"
            });

        }


        const existingBooking =
            await Booking.findById(booking);


        if (!existingBooking) {

            return res.status(404).json({
                success: false,
                message:
                    "Booking not found"
            });

        }


        const isCustomer =
            existingBooking.customer.toString() ===
            req.user.id;


        const isProvider =
            existingBooking.provider.toString() ===
            req.user.id;


        if (!isCustomer && !isProvider) {

            return res.status(403).json({
                success: false,
                message:
                    "You are not part of this booking"
            });

        }


        if (
            !["pending", "accepted"].includes(
                existingBooking.status
            )
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Negotiation is not available for this booking"
            });

        }


        const proposedBy =
            isCustomer
                ? "customer"
                : "provider";


        const negotiation =
            await Negotiation.create({

                booking:
                    existingBooking._id,

                customer:
                    existingBooking.customer,

                provider:
                    existingBooking.provider,

                proposedPrice,

                proposedBy,

                status:
                    "pending",

                message:
                    message || ""

            });


        res.status(201).json({

            success: true,

            message:
                "Price proposal created successfully",

            negotiation

        });


    } catch (error) {

        console.error(
            "Create negotiation error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Server error while creating negotiation"

        });

    }
};



// =====================================================
// GET ALL NEGOTIATIONS FOR LOGGED-IN PROVIDER
// =====================================================

const getProviderNegotiations = async (req, res) => {

    try {

        const negotiations =
            await Negotiation.find({

                provider: req.user.id,

                status: {
                    $in: [
                        "pending",
                        "countered"
                    ]
                }

            })
            .populate(
                "customer",
                "name email phone"
            )
            .populate(
                "booking",
                "bookingCode serviceName description bookingDate bookingTime location agreedPrice status trackingEnabled"
            )
            .sort({
                createdAt: -1
            });


        res.json({

            success: true,

            count:
                negotiations.length,

            negotiations

        });


    } catch (error) {

        console.error(
            "Get provider negotiations error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Server error while getting provider negotiations"

        });

    }
};



// =====================================================
// GET NEGOTIATIONS FOR A BOOKING
// =====================================================

const getBookingNegotiations = async (req, res) => {

    try {

        const booking =
            await Booking.findById(
                req.params.bookingId
            );


        if (!booking) {

            return res.status(404).json({

                success: false,

                message:
                    "Booking not found"

            });

        }


        const isCustomer =
            booking.customer.toString() ===
            req.user.id;


        const isProvider =
            booking.provider.toString() ===
            req.user.id;


        if (!isCustomer && !isProvider) {

            return res.status(403).json({

                success: false,

                message:
                    "You are not part of this booking"

            });

        }


        const negotiations =
            await Negotiation.find({

                booking:
                    booking._id

            }).sort({
                createdAt: 1
            });


        res.json({

            success: true,

            count:
                negotiations.length,

            negotiations

        });


    } catch (error) {

        console.error(
            "Get negotiations error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Server error while getting negotiations"

        });

    }
};



// =====================================================
// ACCEPT / REJECT / COUNTER AN OFFER
// =====================================================

const updateNegotiation = async (req, res) => {

    try {

        const {
            status,
            proposedPrice,
            message
        } = req.body;


        const negotiation =
            await Negotiation.findById(
                req.params.id
            );


        if (!negotiation) {

            return res.status(404).json({

                success: false,

                message:
                    "Negotiation not found"

            });

        }


        const booking =
            await Booking.findById(
                negotiation.booking
            );


        if (!booking) {

            return res.status(404).json({

                success: false,

                message:
                    "Booking not found"

            });

        }


        const isCustomer =
            booking.customer.toString() ===
            req.user.id;


        const isProvider =
            booking.provider.toString() ===
            req.user.id;


        if (!isCustomer && !isProvider) {

            return res.status(403).json({

                success: false,

                message:
                    "You are not part of this booking"

            });

        }



        // =================================================
        // ACCEPT OFFER
        // =================================================

        if (status === "accepted") {

            negotiation.status =
                "accepted";


            booking.agreedPrice =
                negotiation.proposedPrice;


            /*
             * Deal accepted.
             * Enable live tracking.
             */

            booking.status =
                "accepted";


            booking.trackingEnabled =
                true;


            booking.trackingStartedAt =
                new Date();


            booking.trackingStoppedAt =
                null;


            await negotiation.save();

            await booking.save();


            console.log(
                "Deal accepted. Live tracking enabled:",
                booking._id.toString()
            );

        }



        // =================================================
        // REJECT OFFER
        // =================================================

        else if (status === "rejected") {

            negotiation.status =
                "rejected";


            await negotiation.save();

        }



        // =================================================
        // COUNTER OFFER
        // =================================================

        else if (status === "countered") {

            if (proposedPrice === undefined) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Counter price is required"

                });

            }


            const counter =
                await Negotiation.create({

                    booking:
                        booking._id,

                    customer:
                        booking.customer,

                    provider:
                        booking.provider,

                    proposedPrice,

                    proposedBy:
                        isCustomer
                            ? "customer"
                            : "provider",

                    status:
                        "pending",

                    message:
                        message || ""

                });


            negotiation.status =
                "countered";


            await negotiation.save();


            return res.status(201).json({

                success: true,

                message:
                    "Counter offer created successfully",

                negotiation:
                    counter

            });

        }



        // =================================================
        // INVALID STATUS
        // =================================================

        else {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid negotiation status"

            });

        }



        // =================================================
        // RESPONSE
        // =================================================

        res.json({

            success: true,

            message:
                `Negotiation ${status} successfully`,

            negotiation,

            booking

        });


    } catch (error) {

        console.error(
            "Update negotiation error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Server error while updating negotiation"

        });

    }
};



module.exports = {

    createNegotiation,

    getProviderNegotiations,

    getBookingNegotiations,

    updateNegotiation

};
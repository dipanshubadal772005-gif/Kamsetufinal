const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");

dotenv.config();

// Environment check: keep secrets in backend/.env.
if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET is missing. Add it as a Render environment variable or in backend/.env locally.");
    process.exit(1);
}
if (!process.env.MONGO_URI) {
    console.error("MONGO_URI is missing. Add it as a Render environment variable or in backend/.env locally.");
    process.exit(1);
}

const connectDB = require("./config/db");

const Booking = require("./models/booking");

const authRoutes = require("./routes/authRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const negotiationRoutes = require("./routes/negotiationRoutes");
const locationRoutes = require("./routes/locationRoutes");
const aiRoutes = require("./routes/aiRoutes");
const groupBookingRoutes = require("./routes/groupBookingRoutes");

const app = express();

/* =====================================================
   CREATE HTTP SERVER
===================================================== */

const server = http.createServer(app);


/* =====================================================
   CREATE SOCKET.IO SERVER
===================================================== */

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "PATCH"]
    }
});


/* =====================================================
   CONNECT MONGODB
===================================================== */

connectDB();


/* =====================================================
   MIDDLEWARE
===================================================== */

app.use(cors());

app.use(express.json());

app.use(
    express.urlencoded({
        extended: true
    })
);


/* =====================================================
   API ROUTES
===================================================== */

app.use(
    "/api/auth",
    authRoutes
);

app.use(
    "/api/services",
    serviceRoutes
);

app.use(
    "/api/bookings",
    bookingRoutes
);

app.use(
    "/api/negotiations",
    negotiationRoutes
);

app.use(
    "/api/location",
    locationRoutes
);

app.use(
    "/api/ai",
    aiRoutes
);

app.use(
    "/api/group-bookings",
    groupBookingRoutes
);


/* =====================================================
   SOCKET.IO
===================================================== */

io.on("connection", (socket) => {

    console.log(
        "Socket connected:",
        socket.id
    );


    /* =================================================
       JOIN BOOKING ROOM
    ================================================= */

    socket.on(
        "join-booking",
        async (bookingId) => {

            try {

                if (!bookingId) {

                    console.log(
                        "Booking ID missing."
                    );

                    return;

                }


                /*
                 * Check that booking exists.
                 */

                const booking =
                    await Booking.findById(
                        bookingId
                    );


                if (!booking) {

                    console.log(
                        "Booking not found:",
                        bookingId
                    );

                    socket.emit(
                        "tracking-error",
                        {
                            message:
                                "Booking not found."
                        }
                    );

                    return;

                }


                /*
                 * Only allow tracking room
                 * after deal acceptance.
                 */

                const trackingAllowed =
                    booking.trackingEnabled === true &&
                    ["accepted", "ongoing"].includes(booking.status);


                if (!trackingAllowed) {

                    console.log(
                        "Tracking not enabled for booking:",
                        bookingId
                    );

                    socket.emit(
                        "tracking-error",
                        {
                            message:
                                "Live tracking is available only after the deal is accepted."
                        }
                    );

                    return;

                }


                /*
                 * Join booking-specific room.
                 */

                const roomName =
                    `booking-${bookingId}`;


                socket.join(
                    roomName
                );


                /*
                 * Store booking information
                 * on socket for later validation.
                 */

                socket.bookingId =
                    bookingId;


                socket.userRole =
                    socket.userRole ||
                    null;


                console.log(
                    `Socket ${socket.id} joined ${roomName}`
                );


                socket.emit(
                    "tracking-enabled",
                    {
                        bookingId,
                        status:
                            booking.status,
                        trackingEnabled:
                            true
                    }
                );

            }
            catch (error) {

                console.error(
                    "Join booking error:",
                    error
                );

                socket.emit(
                    "tracking-error",
                    {
                        message:
                            "Unable to join tracking."
                    }
                );

            }

        }
    );


    /* =================================================
       PROVIDER LOCATION
    ================================================= */

    socket.on(
        "provider-location",
        async (data) => {

            try {

                const {
                    bookingId,
                    latitude,
                    longitude
                } = data || {};


                /*
                 * Validate data.
                 */

                if (
                    !bookingId ||
                    latitude === undefined ||
                    longitude === undefined
                ) {

                    console.log(
                        "Invalid provider location data."
                    );

                    return;

                }


                /*
                 * Find booking.
                 */

                const booking =
                    await Booking.findById(
                        bookingId
                    );


                if (!booking) {

                    socket.emit(
                        "tracking-error",
                        {
                            message:
                                "Booking not found."
                        }
                    );

                    return;

                }


                /*
                 * Tracking must be active.
                 */

                const trackingAllowed =
                    booking.trackingEnabled === true &&
                    ["accepted", "ongoing"].includes(booking.status);


                if (!trackingAllowed) {

                    socket.emit(
                        "tracking-error",
                        {
                            message:
                                "Live tracking is not active."
                        }
                    );

                    return;

                }


                /*
                 * Validate coordinates.
                 */

                if (
                    latitude < -90 ||
                    latitude > 90 ||
                    longitude < -180 ||
                    longitude > 180
                ) {

                    console.log(
                        "Invalid provider coordinates."
                    );

                    return;

                }


                /*
                 * Send provider location
                 * to the booking room.
                 */

                io.to(
                    `booking-${bookingId}`
                ).emit(
                    "provider-location-update",
                    {
                        bookingId,

                        latitude:
                            Number(latitude),

                        longitude:
                            Number(longitude)
                    }
                );


                console.log(
                    "Provider location sent:",
                    {
                        bookingId,
                        latitude,
                        longitude
                    }
                );

            }
            catch (error) {

                console.error(
                    "Provider location socket error:",
                    error
                );

            }

        }
    );


    /* =================================================
       CUSTOMER LOCATION
    ================================================= */

    socket.on(
        "customer-location",
        async (data) => {

            try {

                const {
                    bookingId,
                    latitude,
                    longitude
                } = data || {};


                /*
                 * Validate data.
                 */

                if (
                    !bookingId ||
                    latitude === undefined ||
                    longitude === undefined
                ) {

                    console.log(
                        "Invalid customer location data."
                    );

                    return;

                }


                /*
                 * Find booking.
                 */

                const booking =
                    await Booking.findById(
                        bookingId
                    );


                if (!booking) {

                    socket.emit(
                        "tracking-error",
                        {
                            message:
                                "Booking not found."
                        }
                    );

                    return;

                }


                /*
                 * Tracking must be active.
                 */

                const trackingAllowed =
                    booking.trackingEnabled === true &&
                    ["accepted", "ongoing"].includes(booking.status);


                if (!trackingAllowed) {

                    socket.emit(
                        "tracking-error",
                        {
                            message:
                                "Live tracking is not active."
                        }
                    );

                    return;

                }


                /*
                 * Validate coordinates.
                 */

                if (
                    latitude < -90 ||
                    latitude > 90 ||
                    longitude < -180 ||
                    longitude > 180
                ) {

                    console.log(
                        "Invalid customer coordinates."
                    );

                    return;

                }


                /*
                 * Send customer location
                 * to the booking room.
                 */

                io.to(
                    `booking-${bookingId}`
                ).emit(
                    "customer-location-update",
                    {
                        bookingId,

                        latitude:
                            Number(latitude),

                        longitude:
                            Number(longitude)
                    }
                );


                console.log(
                    "Customer location sent:",
                    {
                        bookingId,
                        latitude,
                        longitude
                    }
                );

            }
            catch (error) {

                console.error(
                    "Customer location socket error:",
                    error
                );

            }

        }
    );


    /* =================================================
       DISCONNECT
    ================================================= */

    socket.on(
        "disconnect",
        () => {

            console.log(
                "Socket disconnected:",
                socket.id
            );

        }
    );

});


/* =====================================================
   HOME ROUTE
===================================================== */

app.get(
    "/",
    (req, res) => {

        res.json({
            success: true,
            message:
                "KAMSETU backend is running"
        });

    }
);


/* =====================================================
   DATABASE TEST
===================================================== */

app.get(
    "/api/test-db",
    (req, res) => {

        res.json({
            success: true,
            message:
                "MongoDB API is working"
        });

    }
);


/* =====================================================
   UNKNOWN ROUTES
===================================================== */

app.use(
    (req, res) => {

        res.status(404).json({
            success: false,
            message:
                "Route not found"
        });

    }
);


/* =====================================================
   START SERVER
===================================================== */

const PORT =
    process.env.PORT || 5000;


server.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log(
            `KAMSETU backend running on port ${PORT}`
        );

    }
);
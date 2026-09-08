/* =====================================================
   KAMSETU PROVIDER DASHBOARD
   STATIC DEMO LOCATION + ROAD ROUTING VERSION
===================================================== */


/* =====================================================
   LOAD LOGGED-IN PROVIDER
===================================================== */

function loadLoggedInProvider() {

    let userData =
        localStorage.getItem("KAMSETUUser");


    if (!userData) {

        userData =
            sessionStorage.getItem("KAMSETUUser");

    }


    if (!userData) {

        console.log(
            "No logged-in provider found."
        );

        return;

    }


    try {

        const user =
            JSON.parse(userData);


        const cleanName =
            String(
                user.name || "User"
            ).trim();


        const firstLetter =
            cleanName
                .charAt(0)
                .toUpperCase();


        /* =========================================
           TOP-RIGHT NAME
        ========================================= */

        const topUserName =
            document.getElementById(
                "topUserName"
            );


        if (topUserName) {

            topUserName.textContent =
                cleanName;

        }


        /* =========================================
           TOP-RIGHT AVATAR
        ========================================= */

        const topUserAvatar =
            document.getElementById(
                "topUserAvatar"
            );


        if (topUserAvatar) {

            topUserAvatar.textContent =
                firstLetter;

        }


        /* =========================================
           SIDEBAR NAME
        ========================================= */

        const providerSidebarName =
            document.getElementById(
                "providerSidebarName"
            );


        if (providerSidebarName) {

            providerSidebarName.textContent =
                cleanName;

        }


        /* =========================================
           SIDEBAR AVATAR
        ========================================= */

        const providerSidebarAvatar =
            document.getElementById(
                "providerSidebarAvatar"
            );


        if (providerSidebarAvatar) {

            providerSidebarAvatar.textContent =
                firstLetter;

        }


        /* =========================================
           WELCOME MESSAGE
        ========================================= */

        const welcomeProviderName =
            document.getElementById(
                "welcomeProviderName"
            );


        if (welcomeProviderName) {

            const firstName =
                cleanName
                    .split(/\s+/)[0] ||
                "User";


            welcomeProviderName.textContent =
                firstName;

        }


        console.log(
            "Logged-in provider loaded:",
            cleanName
        );

    }


    catch (error) {

        console.error(
            "Could not load logged-in provider:",
            error
        );

    }

}


/* =====================================================
   SIDEBAR
===================================================== */

function toggleSidebar() {

    const sidebar =
        document.querySelector(
            ".sidebar"
        );


    const overlay =
        document.getElementById(
            "sidebarOverlay"
        );


    if (
        !sidebar ||
        !overlay
    ) {

        return;

    }


    sidebar.classList.toggle(
        "open"
    );


    overlay.classList.toggle(
        "show"
    );

}


/* =====================================================
   TOAST
===================================================== */

let toastTimer =
    null;


function showToast(message) {

    const toast =
        document.getElementById(
            "toast"
        );


    if (!toast) {

        return;

    }


    toast.textContent =
        message;


    toast.classList.add(
        "show"
    );


    clearTimeout(
        toastTimer
    );


    toastTimer =
        setTimeout(
            function () {

                toast.classList.remove(
                    "show"
                );

            },
            2500
        );

}


/* =====================================================
   AVAILABILITY
===================================================== */

let isAvailable =
    true;


function toggleAvailability() {

    const button =
        document.getElementById(
            "availabilityButton"
        );


    if (!button) {

        return;

    }


    isAvailable =
        !isAvailable;


    const text =
        button.querySelector(
            "span"
        );


    if (isAvailable) {

        button.classList.remove(
            "offline"
        );


        if (text) {

            text.textContent =
                "Available";

        }


        showToast(
            "You are now available for requests"
        );

    }


    else {

        button.classList.add(
            "offline"
        );


        if (text) {

            text.textContent =
                "Unavailable";

        }


        showToast(
            "You are now unavailable"
        );

    }

}


/* =====================================================
   SERVICE REQUESTS
===================================================== */

function acceptRequest(button) {

    const request =
        button.closest(
            ".request-item"
        );


    if (!request) {

        return;

    }


    showToast(
        "Opening service requests..."
    );


    setTimeout(
        function () {

            window.location.href =
                "provider-requests.html";

        },
        500
    );

}


function declineRequest(button) {

    const request =
        button.closest(
            ".request-item"
        );


    if (!request) {

        return;

    }


    request.style.opacity =
        "0.4";


    setTimeout(
        function () {

            request.remove();

        },
        300
    );


    showToast(
        "Request declined"
    );

}


/* =====================================================
   NAVIGATION
===================================================== */

function addService() {

    window.location.href =
        "provider-services.html";

}


function openRequests() {

    window.location.href =
        "provider-requests.html";

}


function openMessages() {

    window.location.href =
        "provider-message.html";

}


function openProfile() {

    window.location.href =
        "provider-profile.html";

}


function openNegotiations() {

    window.location.href =
        "provider-negotiations.html";

}


function openBookings() {

    window.location.href =
        "provider-bookings.html";

}


function openEarnings() {

    window.location.href =
        "provider-earnings.html";

}


/* =====================================================
   NOTIFICATIONS
===================================================== */

function showNotifications() {

    showToast(
        "You have 3 new notifications"
    );

}


/* =====================================================
   SETTINGS
===================================================== */

function showComingSoon(event) {

    if (event) {

        event.preventDefault();

    }


    showToast(
        "Settings coming soon"
    );

}


/* =====================================================
   LOGOUT
===================================================== */

function logoutProvider() {

    const confirmation =
        confirm(
            "Are you sure you want to logout?"
        );


    if (!confirmation) {

        return;

    }


    localStorage.removeItem(
        "KAMSETUUser"
    );


    localStorage.removeItem(
        "KAMSETUToken"
    );


    localStorage.removeItem(
        "KAMSETUCustomer"
    );


    localStorage.removeItem(
        "KAMSETUProvider"
    );


    localStorage.removeItem(
        "servioUser"
    );


    localStorage.removeItem(
        "servioToken"
    );


    sessionStorage.removeItem(
        "KAMSETUUser"
    );


    sessionStorage.removeItem(
        "KAMSETUToken"
    );


    sessionStorage.removeItem(
        "KAMSETUProvider"
    );


    sessionStorage.removeItem(
        "KAMSETUCustomer"
    );


    showToast(
        "Logged out successfully."
    );


    setTimeout(
        function () {

            window.location.href =
                "../login.html";

        },
        700
    );

}


/* =====================================================
   DEMO LOCATION DATA
===================================================== */

/*
   Provider location
   Sector 52, Gurgaon
*/

const DEMO_PROVIDER = {

    name:
        "Amit Sharma",

    location:
        "Sector 52, Gurgaon",

    latitude:
        28.4426,

    longitude:
        77.1010

};


/*
   Customer location
   Sector 45, Gurgaon
*/

const DEMO_CUSTOMER = {

    name:
        "Rahul Kumar",

    location:
        "Sector 45, Gurgaon",

    latitude:
        28.4370,

    longitude:
        77.0500

};


/*
   Current service
*/

const DEMO_SERVICE = {

    name:
        "Electrical Repair",

    location:
        "Sector 45, Gurgaon"

};


/* =====================================================
   MAP VARIABLES
===================================================== */

let providerDashboardMap =
    null;


let providerMarker =
    null;


let customerMarker =
    null;


let routeLine =
    null;


/* =====================================================
   INITIALIZE MAP
===================================================== */

function initializeProviderDashboardMap() {

    const mapElement =
        document.getElementById(
            "providerDashboardMap"
        );


    if (!mapElement) {

        return;

    }


    if (
        typeof L ===
        "undefined"
    ) {

        console.error(
            "Leaflet is not loaded."
        );

        return;

    }


    if (providerDashboardMap) {

        return;

    }


    /* ================================================
       PROVIDER POSITION
    ================================================= */

    const providerPosition = [

        DEMO_PROVIDER.latitude,

        DEMO_PROVIDER.longitude

    ];


    /* ================================================
       CUSTOMER POSITION
    ================================================= */

    const customerPosition = [

        DEMO_CUSTOMER.latitude,

        DEMO_CUSTOMER.longitude

    ];


    /* ================================================
       CREATE MAP
    ================================================= */

    providerDashboardMap =
        L.map(
            "providerDashboardMap"
        );


    /* ================================================
       OPENSTREETMAP TILES
    ================================================= */

    L.tileLayer(

        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",

        {

            maxZoom:
                19,

            attribution:
                "&copy; OpenStreetMap contributors"

        }

    ).addTo(
        providerDashboardMap
    );


    /* ================================================
       PROVIDER MARKER
    ================================================= */

    providerMarker =
        L.marker(
            providerPosition
        )
            .addTo(
                providerDashboardMap
            )
            .bindPopup(

                `
                <div class="map-popup">

                    <strong>
                        Provider
                    </strong>

                    <br>

                    ${DEMO_PROVIDER.name}

                    <br>

                    <span>
                        📍 ${DEMO_PROVIDER.location}
                    </span>

                </div>
                `

            );


    /* ================================================
       CUSTOMER MARKER
    ================================================= */

    customerMarker =
        L.marker(
            customerPosition
        )
            .addTo(
                providerDashboardMap
            )
            .bindPopup(

                `
                <div class="map-popup">

                    <strong>
                        Customer
                    </strong>

                    <br>

                    ${DEMO_CUSTOMER.name}

                    <br>

                    <span>
                        📍 ${DEMO_CUSTOMER.location}
                    </span>

                </div>
                `

            );


    /* ================================================
       MAP BOUNDS
    ================================================= */

    const bounds =
        L.latLngBounds(

            [

                providerPosition,

                customerPosition

            ]

        );


    providerDashboardMap.fitBounds(

        bounds,

        {

            padding: [

                45,

                45

            ]

        }

    );


    /* ================================================
       UPDATE SERVICE INFORMATION
    ================================================= */

    const serviceElement =
        document.getElementById(
            "mapServiceName"
        );


    const locationElement =
        document.getElementById(
            "mapLocationText"
        );


    if (serviceElement) {

        serviceElement.textContent =
            DEMO_SERVICE.name;

    }


    if (locationElement) {

        locationElement.textContent =
            DEMO_SERVICE.location;

    }


    /* ================================================
       GET ACTUAL ROAD ROUTE
    ================================================= */

    getRoadRoute(

        providerPosition,

        customerPosition

    );


    /* ================================================
       OPEN PROVIDER POPUP
    ================================================= */

    setTimeout(
        function () {

            if (providerMarker) {

                providerMarker.openPopup();

            }

        },
        700
    );

}


/* =====================================================
   OSRM ROAD ROUTING
===================================================== */

/*
   OSRM returns an actual road route.

   Format:

   longitude,latitude

   not

   latitude,longitude
*/

async function getRoadRoute(
    providerPosition,
    customerPosition
) {

    try {

        const providerLatitude =
            providerPosition[0];


        const providerLongitude =
            providerPosition[1];


        const customerLatitude =
            customerPosition[0];


        const customerLongitude =
            customerPosition[1];


        /* ============================================
           OSRM API URL
        ============================================ */

        const routeURL =
            "https://router.project-osrm.org/route/v1/driving/" +

            providerLongitude +

            "," +

            providerLatitude +

            ";" +

            customerLongitude +

            "," +

            customerLatitude +

            "?overview=full&geometries=geojson";


        console.log(
            "Requesting road route..."
        );


        /* ============================================
           FETCH ROUTE
        ============================================ */

        const response =
            await fetch(
                routeURL
            );


        if (!response.ok) {

            throw new Error(
                "Routing service returned an error."
            );

        }


        const data =
            await response.json();


        console.log(
            "OSRM route response:",
            data
        );


        /* ============================================
           CHECK ROUTE
        ============================================ */

        if (
            data.code !== "Ok" ||
            !data.routes ||
            !data.routes.length
        ) {

            throw new Error(
                "No road route found."
            );

        }


        const route =
            data.routes[0];


        /* ============================================
           GET ROAD GEOMETRY
        ============================================ */

        const coordinates =
            route.geometry.coordinates;


        /*
            OSRM returns:

            [
                [longitude, latitude],
                [longitude, latitude],
                ...
            ]

            Leaflet requires:

            [
                [latitude, longitude],
                [latitude, longitude],
                ...
            ]
        */

        const leafletCoordinates =
            coordinates.map(
                function (coordinate) {

                    return [

                        coordinate[1],

                        coordinate[0]

                    ];

                }
            );


        /* ============================================
           REMOVE OLD ROUTE
        ============================================ */

        if (routeLine) {

            providerDashboardMap.removeLayer(
                routeLine
            );

        }


        /* ============================================
           DRAW ACTUAL ROAD ROUTE
        ============================================ */

        routeLine =
            L.polyline(

                leafletCoordinates,

                {

                    color:
                        "#ff5b16",

                    weight:
                        5,

                    opacity:
                        0.9,

                    lineCap:
                        "round",

                    lineJoin:
                        "round"

                }

            ).addTo(
                providerDashboardMap
            );


        /* ============================================
           ROUTE DISTANCE
        ================================================= */

        const distanceInMeters =
            route.distance;


        const distanceInKilometers =
            distanceInMeters /
            1000;


        /* ============================================
           ROUTE DURATION
        ================================================= */

        const durationInSeconds =
            route.duration;


        const durationInMinutes =
            Math.ceil(
                durationInSeconds /
                60
            );


        /* ============================================
           UPDATE DISTANCE
        ================================================= */

        updateDistance(
            distanceInKilometers
        );


        /* ============================================
           UPDATE ETA
        ================================================= */

        updateETA(
            durationInMinutes
        );


        /* ============================================
           FIT MAP TO ROAD ROUTE
        ================================================= */

        const routeBounds =
            routeLine.getBounds();


        providerDashboardMap.fitBounds(

            routeBounds,

            {

                padding: [

                    45,

                    45

                ]

            }

        );


        console.log(
            "Road route loaded successfully."
        );


        console.log(
            "Road distance:",
            distanceInKilometers.toFixed(2),
            "km"
        );


        console.log(
            "Estimated travel time:",
            durationInMinutes,
            "minutes"
        );

    }


    catch (error) {

        console.error(
            "Road routing failed:",
            error
        );


        /*
            If OSRM is unavailable,
            show a fallback route.

            This prevents the map from
            becoming completely empty.
        */

        createFallbackRoute(

            providerPosition,

            customerPosition

        );


        updateDistanceUsingStraightLine(

            providerPosition,

            customerPosition

        );

    }

}


/* =====================================================
   FALLBACK ROUTE
===================================================== */

function createFallbackRoute(
    providerPosition,
    customerPosition
) {

    if (!providerDashboardMap) {

        return;

    }


    if (routeLine) {

        providerDashboardMap.removeLayer(
            routeLine
        );

    }


    routeLine =
        L.polyline(

            [

                providerPosition,

                customerPosition

            ],

            {

                color:
                    "#ff5b16",

                weight:
                    5,

                opacity:
                    0.7,

                dashArray:
                    "10, 8",

                lineCap:
                    "round"

            }

        ).addTo(
            providerDashboardMap
        );


    console.warn(
        "Fallback route displayed because OSRM routing was unavailable."
    );

}


/* =====================================================
   UPDATE DISTANCE
===================================================== */

function updateDistance(
    distanceInKilometers
) {

    const distanceElement =
        document.getElementById(
            "providerDashboardDistance"
        );


    if (!distanceElement) {

        return;

    }


    if (
        distanceInKilometers <
        1
    ) {

        distanceElement.textContent =

            Math.round(

                distanceInKilometers *
                1000

            ) +

            " m away";

    }


    else {

        distanceElement.textContent =

            distanceInKilometers.toFixed(
                1
            ) +

            " km away";

    }

}


/* =====================================================
   UPDATE ETA
===================================================== */

function updateETA(
    durationInMinutes
) {

    const etaElement =
        document.getElementById(
            "providerDashboardETA"
        );


    if (!etaElement) {

        return;

    }


    const safeETA =
        Math.max(

            1,

            durationInMinutes

        );


    etaElement.textContent =

        "ETA: " +

        safeETA +

        " min";

}


/* =====================================================
   FALLBACK DISTANCE CALCULATION
===================================================== */

function updateDistanceUsingStraightLine(
    providerPosition,
    customerPosition
) {

    const earthRadius =
        6371;


    const latitude1 =
        providerPosition[0] *
        Math.PI /
        180;


    const latitude2 =
        customerPosition[0] *
        Math.PI /
        180;


    const deltaLatitude =

        (
            customerPosition[0] -
            providerPosition[0]
        ) *

        Math.PI /
        180;


    const deltaLongitude =

        (
            customerPosition[1] -
            providerPosition[1]
        ) *

        Math.PI /
        180;


    const a =

        Math.sin(
            deltaLatitude /
            2
        ) *

        Math.sin(
            deltaLatitude /
            2
        )

        +

        Math.cos(
            latitude1
        ) *

        Math.cos(
            latitude2
        ) *

        Math.sin(
            deltaLongitude /
            2
        ) *

        Math.sin(
            deltaLongitude /
            2
        );


    const c =

        2 *

        Math.atan2(

            Math.sqrt(a),

            Math.sqrt(
                1 - a
            )

        );


    const distance =

        earthRadius *
        c;


    updateDistance(
        distance
    );


    /*
        Approximate ETA for fallback only.
        Average speed = 30 km/h.
    */

    const eta =

        Math.max(

            5,

            Math.ceil(

                (
                    distance /
                    30
                ) *
                60

            )

        );


    updateETA(
        eta
    );

}


/* =====================================================
   MAP RESIZE FIX
===================================================== */

function refreshProviderDashboardMap() {

    if (!providerDashboardMap) {

        return;

    }


    setTimeout(
        function () {

            providerDashboardMap.invalidateSize();

        },
        300
    );

}


/* =====================================================
   PAGE LOAD
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {


        /* ============================================
           LOAD LOGGED-IN PROVIDER
        ============================================ */

        loadLoggedInProvider();


        /* ============================================
           AVAILABILITY BUTTON
        ============================================ */

        const availabilityButton =
            document.getElementById(
                "availabilityButton"
            );


        if (availabilityButton) {

            availabilityButton.classList.remove(
                "offline"
            );

        }


        /* ============================================
           INITIALIZE MAP
        ============================================ */

        initializeProviderDashboardMap();


        /* ============================================
           MAP RESIZE
        ============================================ */

        refreshProviderDashboardMap();

    }
);


/* =====================================================
   WINDOW RESIZE
===================================================== */

window.addEventListener(
    "resize",
    function () {

        refreshProviderDashboardMap();

    }
);
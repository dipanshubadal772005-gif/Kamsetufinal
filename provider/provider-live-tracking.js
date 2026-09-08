/* =====================================================
   KAMSETU PROVIDER LIVE TRACKING - DEMO
   Provider: Sector 52, Gurgaon
   Customer: Sector 45, Gurgaon
===================================================== */

const DEMO_BOOKING = {
    bookingCode: "KM-DEMO001",
    service: "Electrical Repair",
    customer: {
        name: "Rahul Kumar",
        sector: "Sector 45, Gurgaon",
        latitude: 28.4370,
        longitude: 77.0500
    },
    provider: {
        name: "Amit Sharma",
        sector: "Sector 52, Gurgaon",
        latitude: 28.4426,
        longitude: 77.1010
    }
};

let trackingMap = null;
let providerMarker = null;
let customerMarker = null;
let routeLine = null;


document.addEventListener("DOMContentLoaded", function () {
    initializeProviderTracking();
});


function initializeProviderTracking() {
    setBookingDetails();
    initializeMap();

    if (!trackingMap) {
        return;
    }

    showProviderLocation();
    showCustomerLocation();
    drawFallbackRoute();
    calculateDistanceAndETA();

    requestRoadRoute();

    console.log("KAMSETU provider demo tracking initialized.");
    console.log("Provider:", DEMO_BOOKING.provider);
    console.log("Customer:", DEMO_BOOKING.customer);
}


function setBookingDetails() {
    const customerName = document.getElementById("customerName");
    const serviceName = document.getElementById("serviceName");
    const bookingCode = document.getElementById("bookingCode");
    const bookingService = document.getElementById("bookingService");
    const trackingMessage = document.getElementById("trackingMessage");

    if (customerName) {
        customerName.textContent = DEMO_BOOKING.customer.name;
    }

    if (serviceName) {
        serviceName.textContent = DEMO_BOOKING.service;
    }

    if (bookingCode) {
        bookingCode.textContent = DEMO_BOOKING.bookingCode;
    }

    if (bookingService) {
        bookingService.textContent = DEMO_BOOKING.service;
    }

    if (trackingMessage) {
        trackingMessage.textContent =
            "Customer is waiting in Sector 45, Gurgaon";
    }
}


function initializeMap() {
    const mapElement = document.getElementById("trackingMap");

    if (!mapElement) {
        console.error("Provider tracking map element not found.");
        return;
    }

    if (typeof L === "undefined") {
        console.error("Leaflet is not loaded.");
        return;
    }

    trackingMap = L.map("trackingMap", {
        zoomControl: true
    }).setView([28.4398, 77.0755], 13);

    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            maxZoom: 19,
            attribution: "&copy; OpenStreetMap contributors"
        }
    ).addTo(trackingMap);

    setTimeout(function () {
        trackingMap.invalidateSize();
    }, 200);
}


function showProviderLocation() {
    const location = [
        DEMO_BOOKING.provider.latitude,
        DEMO_BOOKING.provider.longitude
    ];

    providerMarker = L.marker(location)
        .addTo(trackingMap)
        .bindPopup(
            "<strong>Provider</strong><br>Amit Sharma<br>Sector 52, Gurgaon"
        );

    providerMarker.openPopup();
}


function showCustomerLocation() {
    const location = [
        DEMO_BOOKING.customer.latitude,
        DEMO_BOOKING.customer.longitude
    ];

    customerMarker = L.marker(location)
        .addTo(trackingMap)
        .bindPopup(
            "<strong>Customer</strong><br>Rahul Kumar<br>Sector 45, Gurgaon"
        );
}


function drawFallbackRoute() {
    routeLine = L.polyline(
        [
            [DEMO_BOOKING.provider.latitude, DEMO_BOOKING.provider.longitude],
            [DEMO_BOOKING.customer.latitude, DEMO_BOOKING.customer.longitude]
        ],
        {
            weight: 5,
            opacity: 0.65,
            dashArray: "10 8"
        }
    ).addTo(trackingMap);

    fitMapToLocations();
}


function fitMapToLocations() {
    if (!trackingMap || !customerMarker || !providerMarker) {
        return;
    }

    const bounds = L.latLngBounds([
        customerMarker.getLatLng(),
        providerMarker.getLatLng()
    ]);

    trackingMap.fitBounds(bounds, {
        padding: [55, 55]
    });
}


function calculateDistanceAndETA() {
    const provider = DEMO_BOOKING.provider;
    const customer = DEMO_BOOKING.customer;

    const distanceKm = calculateDistance(
        provider.latitude,
        provider.longitude,
        customer.latitude,
        customer.longitude
    );

    const etaMinutes = Math.max(
        1,
        Math.ceil((distanceKm / 30) * 60)
    );

    updateDistanceAndETA(distanceKm, etaMinutes);
}


function updateDistanceAndETA(distanceKm, etaMinutes) {
    const distanceElement =
        document.getElementById("customerDistance");

    const etaElement =
        document.getElementById("customerETA");

    if (distanceElement) {
        distanceElement.textContent =
            distanceKm.toFixed(1) + " km away";
    }

    if (etaElement) {
        etaElement.textContent =
            "ETA: " + etaMinutes + " min";
    }
}


async function requestRoadRoute() {
    const provider = DEMO_BOOKING.provider;
    const customer = DEMO_BOOKING.customer;

    const url =
        "https://router.project-osrm.org/route/v1/driving/" +
        provider.longitude + "," + provider.latitude + ";" +
        customer.longitude + "," + customer.latitude +
        "?overview=full&geometries=geojson";

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("Routing service unavailable");
        }

        const data = await response.json();

        if (!data.routes || !data.routes.length) {
            throw new Error("No road route found");
        }

        const route = data.routes[0];
        const distanceKm = route.distance / 1000;
        const etaMinutes = Math.max(
            1,
            Math.ceil(route.duration / 60)
        );

        updateDistanceAndETA(distanceKm, etaMinutes);
        drawRoadRoute(route);
    }
    catch (error) {
        console.warn("Using demo route fallback:", error.message);
        calculateDistanceAndETA();
    }
}


function drawRoadRoute(route) {
    if (!trackingMap || !route.geometry) {
        return;
    }

    const coordinates = route.geometry.coordinates || [];

    if (!coordinates.length) {
        return;
    }

    const latLngs = coordinates.map(function (coordinate) {
        return [coordinate[1], coordinate[0]];
    });

    if (routeLine) {
        trackingMap.removeLayer(routeLine);
    }

    routeLine = L.polyline(latLngs, {
        weight: 5,
        opacity: 0.85
    }).addTo(trackingMap);

    fitMapToLocations();
}


function calculateDistance(lat1, lon1, lat2, lon2) {
    const earthRadius = 6371;
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRadians(lat1)) *
        Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) ** 2;

    return earthRadius * 2 * Math.atan2(
        Math.sqrt(a),
        Math.sqrt(1 - a)
    );
}


function toRadians(value) {
    return value * Math.PI / 180;
}


function goBack() {
    window.location.href = "provider-dashboard.html";
}

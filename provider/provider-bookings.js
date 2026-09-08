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
        console.log("No logged-in provider found.");
        return;
    }

    try {

        const user =
            JSON.parse(userData);

        const cleanName =
            String(user.name || "User").trim();

        const firstLetter =
            cleanName.charAt(0).toUpperCase();


        /* =========================================
           TOP-RIGHT PROVIDER NAME
        ========================================= */

        const topUserName =
            document.getElementById("topUserName");

        if (topUserName) {
            topUserName.textContent =
                cleanName;
        }


        /* =========================================
           TOP-RIGHT PROVIDER AVATAR
        ========================================= */

        const topUserAvatar =
            document.getElementById("topUserAvatar");

        if (topUserAvatar) {
            topUserAvatar.textContent =
                firstLetter;
        }


        /* =========================================
           SIDEBAR PROVIDER NAME
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
           SIDEBAR PROVIDER AVATAR
        ========================================= */

        const providerSidebarAvatar =
            document.getElementById(
                "providerSidebarAvatar"
            );

        if (providerSidebarAvatar) {
            providerSidebarAvatar.textContent =
                firstLetter;
        }


        console.log(
            "Logged-in provider loaded:",
            cleanName
        );

    } catch (error) {

        console.error(
            "Could not load logged-in provider:",
            error
        );

    }
}


/* =====================================================
   TOAST
===================================================== */

function showToast(message) {

    const toast =
        document.getElementById("toast");

    if (!toast) {
        return;
    }

    toast.textContent =
        message;

    toast.classList.add("show");

    clearTimeout(
        window.providerBookingsToastTimer
    );

    window.providerBookingsToastTimer =
        setTimeout(function () {

            toast.classList.remove("show");

        }, 2500);
}


/* =====================================================
   SIDEBAR
===================================================== */

function toggleSidebar() {

    const sidebar =
        document.querySelector(".sidebar");

    const overlay =
        document.getElementById("overlay");

    if (!sidebar || !overlay) {
        return;
    }

    sidebar.classList.toggle("open");

    overlay.classList.toggle("show");
}


/* =====================================================
   FILTER BOOKINGS
===================================================== */

function filterBookings(type, button) {

    document
        .querySelectorAll(".tab")
        .forEach(function(tab) {

            tab.classList.remove("active");

        });


    if (button) {

        button.classList.add("active");

    }


    const bookings =
        document.querySelectorAll(
            ".booking-card"
        );


    let visible =
        0;


    bookings.forEach(function(booking) {

        if (
            type === "all" ||
            booking.dataset.status === type
        ) {

            booking.style.display =
                "grid";

            visible++;

        } else {

            booking.style.display =
                "none";

        }

    });


    const empty =
        document.getElementById("empty");


    if (empty) {

        empty.style.display =
            visible === 0
                ? "block"
                : "none";

    }
}


/* =====================================================
   COMPLETE BOOKING
===================================================== */

function completeBooking(button) {

    if (!button) {
        return;
    }


    const booking =
        button.closest(
            ".booking-card"
        );


    if (!booking) {
        return;
    }


    if (
        !confirm(
            "Mark this booking as completed?"
        )
    ) {

        return;

    }


    booking.dataset.status =
        "completed";


    button.textContent =
        "Completed";


    button.disabled =
        true;


    button.style.opacity =
        "0.5";


    const status =
        booking.querySelector(
            ".status"
        );


    if (status) {

        status.textContent =
            "COMPLETED";

        status.className =
            "status completed";

    }


    const priceLabel =
        booking.querySelector(
            ".booking-price > span"
        );


    if (priceLabel) {

        priceLabel.textContent =
            "EARNED";

    }


    showToast(
        "Job completed successfully"
    );
}


/* =====================================================
   VIEW BOOKING
===================================================== */

function viewBooking(button) {

    const booking =
        button
            ? button.closest(
                ".booking-card"
            )
            : null;


    if (!booking) {

        showToast(
            "Booking details will open here"
        );

        return;
    }


    const title =
        booking.querySelector(
            ".booking-title h3"
        );


    if (title) {

        showToast(
            "Opening " +
            title.textContent.trim()
        );

    } else {

        showToast(
            "Booking details will open here"
        );

    }
}


/* =====================================================
   PROFILE
===================================================== */

function openProfile() {

    window.location.href =
        "provider-profile.html";
}


/* =====================================================
   LOGOUT
===================================================== */

function logoutProvider() {

    if (
        !confirm(
            "Are you sure you want to logout?"
        )
    ) {

        return;

    }


    /* =========================================
       REMOVE CURRENT KAMSETU SESSION
    ========================================= */

    localStorage.removeItem(
        "KAMSETUUser"
    );

    localStorage.removeItem(
        "KAMSETUToken"
    );

    localStorage.removeItem(
        "KAMSETUProvider"
    );

    localStorage.removeItem(
        "KAMSETUCustomer"
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


    /* =========================================
       CURRENT PAGE:
       project/provider/provider-bookings.html

       LOGIN PAGE:
       project/login.html
    ========================================= */

    setTimeout(function() {

        window.location.href =
            "../login.html";

    }, 700);
}


/* =====================================================
   PAGE LOAD
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        /* Load actual logged-in provider */

        loadLoggedInProvider();


        /* Check empty booking state */

        const bookings =
            document.querySelectorAll(
                ".booking-card"
            );


        const empty =
            document.getElementById(
                "empty"
            );


        if (
            empty &&
            bookings.length === 0
        ) {

            empty.style.display =
                "block";

        }

    }
);
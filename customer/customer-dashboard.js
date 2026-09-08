/* =========================================================
   KAMSETU CUSTOMER DASHBOARD JAVASCRIPT
========================================================= */


/* =========================================================
   GLOBAL ELEMENTS
========================================================= */

const sidebar =
    document.querySelector(".sidebar");

const overlay =
    document.getElementById("sidebarOverlay");

const toast =
    document.getElementById("toast");


/* =========================================================
   TOAST
========================================================= */

function showToast(message) {

    if (!toast) {
        return;
    }

    toast.innerText = message;

    toast.classList.add("show");

    clearTimeout(window.toastTimer);

    window.toastTimer = setTimeout(function () {

        toast.classList.remove("show");

    }, 2500);
}


/* =========================================================
   MOBILE SIDEBAR
========================================================= */

function openSidebar() {

    if (!sidebar || !overlay) {
        return;
    }

    sidebar.classList.add("open");

    overlay.classList.add("show");
}


function closeSidebar() {

    if (!sidebar || !overlay) {
        return;
    }

    sidebar.classList.remove("open");

    overlay.classList.remove("show");
}


function toggleSidebar() {

    if (!sidebar || !overlay) {
        return;
    }

    if (sidebar.classList.contains("open")) {

        closeSidebar();

    } else {

        openSidebar();

    }
}


/* =========================================================
   SIDEBAR NAVIGATION
========================================================= */

/*
   IMPORTANT:

   Navigation is handled by HTML href.

   Do NOT use preventDefault() here.

   Example:

   service.html
   customer-bookings.html
   customer-messages.html
   customer-favorites.html
*/

const navItems =
    document.querySelectorAll(
        ".sidebar-nav .nav-item"
    );


navItems.forEach(function (item) {

    item.addEventListener(
        "click",
        function () {

            navItems.forEach(
                function (nav) {

                    nav.classList.remove("active");

                }
            );

            this.classList.add("active");

            closeSidebar();

        }
    );

});


/* =========================================================
   SERVICE SEARCH
========================================================= */

function searchServices() {

    const serviceInput =
        document.getElementById(
            "dashboardService"
        );

    const locationInput =
        document.getElementById(
            "dashboardLocation"
        );


    if (!serviceInput || !locationInput) {
        return;
    }


    const service =
        serviceInput.value.trim();

    const location =
        locationInput.value.trim();


    if (service === "") {

        showToast(
            "Please enter a service."
        );

        serviceInput.focus();

        return;
    }


    if (location === "") {

        showToast(
            "Please enter your location."
        );

        locationInput.focus();

        return;
    }


    /*
       Save search values so service.html
       can use them.
    */

    localStorage.setItem(
        "KAMSETUSearchService",
        service
    );

    localStorage.setItem(
        "KAMSETUSearchLocation",
        location
    );


    window.location.href =
        "../service.html";

}


/* =========================================================
   OPEN SERVICE SEARCH
========================================================= */

function openServiceSearch() {

    const search =
        document.querySelector(
            ".dashboard-search"
        );


    if (search) {

        search.scrollIntoView({

            behavior: "smooth",

            block: "center"

        });

    }


    setTimeout(function () {

        const input =
            document.getElementById(
                "dashboardService"
            );


        if (input) {

            input.focus();

        }

    }, 500);

}


/* =========================================================
   SELECT SERVICE
========================================================= */

function selectDashboardService(service) {

    const serviceInput =
        document.getElementById(
            "dashboardService"
        );


    if (!serviceInput) {
        return;
    }


    serviceInput.value =
        service;


    openServiceSearch();


    showToast(
        service + " selected."
    );

}


/* =========================================================
   VIEW ALL SERVICES
========================================================= */

function showAllServices() {

    window.location.href =
        "../service.html";

}


/* =========================================================
   VIEW BOOKINGS
========================================================= */

function viewAllBookings() {

    window.location.href =
        "customer-bookings.html";

}


/* =========================================================
   OPEN BOOKING
========================================================= */

function openBooking() {

    window.location.href =
        "customer-bookings.html";

}


/* =========================================================
   GROUP BOOKING
========================================================= */

function openGroupBooking() {

    window.location.href =
        "group-booking.html";

}


/* =========================================================
   OPEN CHAT
========================================================= */

function openChat() {

    window.location.href =
        "customer-messages.html";

}


/* =========================================================
   NOTIFICATIONS
========================================================= */

function showNotifications() {

    showToast(
        "You have 3 new notifications."
    );

}


/* =========================================================
   PROFILE
========================================================= */

function openProfile() {

    window.location.href =
        "customer-profile.html";

}


/* =========================================================
   SETTINGS
========================================================= */

function showComingSoon(event) {

    if (event) {

        event.preventDefault();

    }

    showToast(
        "Settings will be available soon."
    );

}


/* =========================================================
   LOGOUT
========================================================= */

function logoutUser() {

    const confirmed =
        confirm(
            "Are you sure you want to logout?"
        );


    if (!confirmed) {
        return;
    }


    localStorage.removeItem(
        "KAMSETUUser"
    );

    sessionStorage.removeItem(
        "KAMSETUUser"
    );


    showToast(
        "Logged out successfully."
    );


    setTimeout(function () {

        window.location.href =
            "../login.html";

    }, 800);

}


/* =========================================================
   LOAD USER DATA
========================================================= */

function loadUserData() {

    let savedUser =
        localStorage.getItem(
            "KAMSETUUser"
        );


    if (!savedUser) {

        savedUser =
            sessionStorage.getItem(
                "KAMSETUUser"
            );

    }


    if (!savedUser) {

        console.log(
            "No KAMSETU user session found."
        );

        return;

    }


    try {

        const user =
            JSON.parse(savedUser);


        /* =========================================
           USER NAME
        ========================================= */

        const userName =
            document.getElementById(
                "userName"
            );


        if (
            userName &&
            user.name
        ) {

            userName.innerText =
                user.name;

        }


        /* =========================================
           USER AVATAR
        ========================================= */

        const avatar =
            document.getElementById(
                "topUserAvatar"
            ) ||
            document.querySelector(
                ".profile-avatar"
            );


        if (
            avatar &&
            user.name
        ) {

            avatar.innerText =
                user.name
                    .charAt(0)
                    .toUpperCase();

        }

    }


    catch (error) {

        console.log(
            "Invalid KAMSETU user data."
        );

    }

}


/* =========================================================
   SEARCH ENTER KEY
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const serviceInput =
            document.getElementById(
                "dashboardService"
            );


        const locationInput =
            document.getElementById(
                "dashboardLocation"
            );


        if (serviceInput) {

            serviceInput.addEventListener(
                "keydown",
                function (event) {

                    if (
                        event.key === "Enter"
                    ) {

                        searchServices();

                    }

                }
            );

        }


        if (locationInput) {

            locationInput.addEventListener(
                "keydown",
                function (event) {

                    if (
                        event.key === "Enter"
                    ) {

                        searchServices();

                    }

                }
            );

        }

    }
);


/* =========================================================
   SERVICE SEARCH INPUT FOCUS
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const inputs =
            document.querySelectorAll(
                ".dashboard-search-field input"
            );


        inputs.forEach(function (input) {

            input.addEventListener(
                "focus",
                function () {

                    this.parentElement
                        .parentElement
                        .style.borderColor =
                        "rgba(255,91,22,.4)";

                }
            );


            input.addEventListener(
                "blur",
                function () {

                    this.parentElement
                        .parentElement
                        .style.borderColor =
                        "";

                }
            );

        });

    }
);


/* =========================================================
   ESCAPE KEY
========================================================= */

document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Escape"
        ) {

            closeSidebar();

        }

    }
);


/* =========================================================
   INITIALIZE DASHBOARD
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadUserData();

    }
);
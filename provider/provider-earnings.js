/* =====================================================
   KAMSETU PROVIDER EARNINGS
   Dynamic Logged-In Provider + Earnings Controls
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


        /* ================================
           SIDEBAR PROFILE
        ================================= */

        const sidebarName =
            document.getElementById(
                "providerSidebarName"
            );


        const sidebarAvatar =
            document.getElementById(
                "providerSidebarAvatar"
            );


        /* ================================
           TOP RIGHT PROFILE
        ================================= */

        const topUserName =
            document.getElementById(
                "topUserName"
            );


        const topUserAvatar =
            document.getElementById(
                "topUserAvatar"
            );


        if (sidebarName) {

            sidebarName.textContent =
                cleanName;

        }


        if (sidebarAvatar) {

            sidebarAvatar.textContent =
                firstLetter;

        }


        if (topUserName) {

            topUserName.textContent =
                cleanName;

        }


        if (topUserAvatar) {

            topUserAvatar.textContent =
                firstLetter;

        }


    } catch (error) {

        console.error(
            "Could not load provider profile:",
            error
        );

    }

}



/* =====================================================
   TOAST
===================================================== */

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


    setTimeout(function () {

        toast.classList.remove(
            "show"
        );

    }, 2500);

}



/* =====================================================
   MOBILE SIDEBAR
===================================================== */

function toggleSidebar() {

    const sidebar =
        document.querySelector(
            ".sidebar"
        );


    const overlay =
        document.getElementById(
            "overlay"
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
   OPEN PROFILE
===================================================== */

function openProfile() {

    window.location.href =
        "provider-profile.html";

}



/* =====================================================
   CHANGE EARNING PERIOD
===================================================== */

function changePeriod() {

    const period =
        document.getElementById(
            "period"
        );


    const earnings =
        document.getElementById(
            "totalEarnings"
        );


    if (
        !period ||
        !earnings
    ) {

        return;

    }


    if (
        period.value ===
        "month"
    ) {

        earnings.textContent =
            "₹18,450";


        showToast(
            "Showing this month's earnings"
        );

    }


    else if (
        period.value ===
        "last"
    ) {

        earnings.textContent =
            "₹15,570";


        showToast(
            "Showing last month's earnings"
        );

    }


    else if (
        period.value ===
        "year"
    ) {

        earnings.textContent =
            "₹1,42,800";


        showToast(
            "Showing yearly earnings"
        );

    }

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


    /* =================================
       CLEAR AUTH DATA
    ================================= */

    localStorage.removeItem(
        "KAMSETUToken"
    );

    localStorage.removeItem(
        "KAMSETUUser"
    );

    localStorage.removeItem(
        "KAMSETUProvider"
    );

    localStorage.removeItem(
        "KAMSETUCustomer"
    );


    sessionStorage.removeItem(
        "KAMSETUToken"
    );

    sessionStorage.removeItem(
        "KAMSETUUser"
    );

    sessionStorage.removeItem(
        "KAMSETUProvider"
    );

    sessionStorage.removeItem(
        "KAMSETUCustomer"
    );


    showToast(
        "Logged out successfully"
    );


    setTimeout(
        function () {

            /*
                Current page:

                provider/provider-earnings.html

                Login page:

                login.html

                Therefore:

                ../login.html
            */

            window.location.href =
                "../login.html";

        },
        700
    );

}



/* =====================================================
   PAGE LOAD
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {


        /* ================================
           LOAD PROVIDER PROFILE
        ================================= */

        loadLoggedInProvider();


        /* ================================
           SET DEFAULT PERIOD
        ================================= */

        const period =
            document.getElementById(
                "period"
            );


        if (period) {

            period.value =
                "month";

        }

    }
);
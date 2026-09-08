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
           TOP-RIGHT NAME
        ========================================= */

        const topUserName =
            document.getElementById("topUserName");

        if (topUserName) {
            topUserName.textContent = cleanName;
        }


        /* =========================================
           TOP-RIGHT AVATAR
        ========================================= */

        const topUserAvatar =
            document.getElementById("topUserAvatar");

        if (topUserAvatar) {
            topUserAvatar.textContent = firstLetter;
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

    toast.classList.add(
        "show"
    );

    clearTimeout(
        window.providerToastTimer
    );

    window.providerToastTimer =
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
   SIDEBAR
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
   FILTER REQUESTS
===================================================== */

function filterRequests(
    type,
    button
) {

    document
        .querySelectorAll(".filter")
        .forEach(
            function (item) {

                item.classList.remove(
                    "active"
                );

            }
        );


    if (button) {

        button.classList.add(
            "active"
        );

    }


    const cards =
        document.querySelectorAll(
            ".request-card"
        );


    let visible =
        0;


    cards.forEach(
        function (card) {

            if (
                type === "all" ||
                card.dataset.type === type
            ) {

                card.style.display =
                    "grid";

                visible++;

            }

            else {

                card.style.display =
                    "none";

            }

        }
    );


    const empty =
        document.getElementById(
            "empty"
        );


    if (empty) {

        empty.style.display =
            visible === 0
                ? "block"
                : "none";

    }

}


/* =====================================================
   ACCEPT REQUEST
===================================================== */

function acceptRequest(button) {

    if (!button) {
        return;
    }


    const card =
        button.closest(
            ".request-card"
        );


    if (!card) {
        return;
    }


    card.remove();


    updateEmptyState();


    showToast(
        "Request accepted successfully"
    );
}


/* =====================================================
   DECLINE REQUEST
===================================================== */

function declineRequest(button) {

    if (!button) {
        return;
    }


    const card =
        button.closest(
            ".request-card"
        );


    if (!card) {
        return;
    }


    card.remove();


    updateEmptyState();


    showToast(
        "Request declined"
    );
}


/* =====================================================
   UPDATE EMPTY STATE
===================================================== */

function updateEmptyState() {

    const cards =
        document.querySelectorAll(
            ".request-card"
        );


    const empty =
        document.getElementById(
            "empty"
        );


    if (!empty) {
        return;
    }


    empty.style.display =
        cards.length === 0
            ? "block"
            : "none";
}


/* =====================================================
   NEGOTIATION
===================================================== */

function negotiateRequest() {

    window.location.href =
        "provider-negotiations.html";
}


/* =====================================================
   OPEN PROFILE
===================================================== */

function openProfile() {

    window.location.href =
        "provider-profile.html";
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


    /* =========================================
       REMOVE KAMSETU SESSION DATA
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
        "Logged out successfully"
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
   PAGE INITIALIZATION
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadLoggedInProvider();

        updateEmptyState();

    }
);
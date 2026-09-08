/* =====================================================
   LOAD LOGGED-IN CUSTOMER
===================================================== */

function loadLoggedInCustomer() {

    let userData =
        localStorage.getItem("KAMSETUUser");

    if (!userData) {

        userData =
            sessionStorage.getItem("KAMSETUUser");

    }


    if (!userData) {

        console.log(
            "No logged-in customer found."
        );

        return;
    }


    try {

        const user =
            JSON.parse(userData);


        const topUserName =
            document.getElementById(
                "topUserName"
            );


        const topUserAvatar =
            document.getElementById(
                "topUserAvatar"
            );


        /* =========================================
           USER NAME
        ========================================= */

        if (topUserName) {

            topUserName.textContent =
                user.name || "User";

        }


        /* =========================================
           USER AVATAR
        ========================================= */

        if (topUserAvatar) {

            topUserAvatar.textContent =
                (user.name || "U")
                    .charAt(0)
                    .toUpperCase();

        }

    }


    catch (error) {

        console.error(
            "Could not load logged-in customer:",
            error
        );

    }

}


/* =====================================================
   SIDEBAR
===================================================== */

function toggleSidebar() {

    if (typeof window.toggleCustomerSidebar === "function") {
        window.toggleCustomerSidebar();
        return;
    }

    const sidebar = document.querySelector(".sidebar, .customer-sidebar");
    if (sidebar) sidebar.classList.toggle("open");
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


    clearTimeout(
        window.toastTimer
    );


    window.toastTimer =
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
   FILTER NOTIFICATIONS
===================================================== */

function filterNotifications(
    type,
    button
) {

    const cards =
        document.querySelectorAll(
            ".notification-card"
        );


    const labels =
        document.querySelectorAll(
            ".section-label"
        );


    document
        .querySelectorAll(".tab")
        .forEach(function(tab) {

            tab.classList.remove(
                "active"
            );

        });


    if (button) {

        button.classList.add(
            "active"
        );

    }


    let visibleCount = 0;


    cards.forEach(function(card) {

        const cardType =
            card.dataset.type;


        if (
            type === "all" ||
            cardType === type
        ) {

            card.style.display =
                "flex";

            visibleCount++;

        }
        else {

            card.style.display =
                "none";

        }

    });


    labels.forEach(function(label) {

        label.style.display =
            "block";

    });


    const empty =
        document.getElementById(
            "emptyState"
        );


    if (empty) {

        if (visibleCount === 0) {

            empty.style.display =
                "block";

        }
        else {

            empty.style.display =
                "none";

        }

    }

}


/* =====================================================
   MARK SINGLE NOTIFICATION READ
===================================================== */

function markRead(button) {

    const card =
        button.closest(
            ".notification-card"
        );


    if (!card) {

        return;

    }


    card.classList.remove(
        "unread"
    );


    const dot =
        card.querySelector(
            ".unread-dot"
        );


    if (dot) {

        dot.remove();

    }


    button.remove();


    updateNotificationCount();


    showToast(
        "Notification marked as read"
    );

}


/* =====================================================
   MARK ALL READ
===================================================== */

function markAllRead() {

    const cards =
        document.querySelectorAll(
            ".notification-card"
        );


    cards.forEach(function(card) {

        card.classList.remove(
            "unread"
        );


        const dot =
            card.querySelector(
                ".unread-dot"
            );


        if (dot) {

            dot.remove();

        }


        const dismiss =
            card.querySelector(
                ".dismiss"
            );


        if (dismiss) {

            dismiss.remove();

        }

    });


    updateNotificationCount();


    showToast(
        "All notifications marked as read"
    );

}


/* =====================================================
   UPDATE COUNT
===================================================== */

function updateNotificationCount() {

    const unread =
        document.querySelectorAll(
            ".notification-card.unread"
        ).length;


    const count =
        document.getElementById(
            "notificationCount"
        );


    if (count) {

        count.textContent =
            unread;

    }

}


/* =====================================================
   MESSAGES
===================================================== */

function openMessages() {

    window.location.href =
        "customer/customer-messages.html";

}


/* =====================================================
   BOOKINGS
===================================================== */

function openBookings() {

    window.location.href =
        "customer/customer-bookings.html";

}


/* =====================================================
   RATE SERVICE
===================================================== */

function rateService() {

    showToast(
        "Rating system will open here"
    );

}


/* =====================================================
   OFFER
===================================================== */

function showOffer() {

    showToast(
        "₹200 KAMSETU discount applied"
    );

}


/* =====================================================
   NOTIFICATION BUTTON
===================================================== */

function showNotifications() {

    showToast(
        "You are already on Notifications"
    );

}


/* =====================================================
   PROFILE
===================================================== */

function openProfile() {

    window.location.href =
        "customer/customer-profile.html";

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

function logoutUser() {

    const confirmation =
        confirm(
            "Are you sure you want to logout?"
        );


    if (!confirmation) {

        return;

    }


    localStorage.removeItem(
        "KAMSETUToken"
    );

    localStorage.removeItem(
        "KAMSETUUser"
    );

    localStorage.removeItem(
        "KAMSETUCustomer"
    );

    localStorage.removeItem(
        "KAMSETUProvider"
    );

    sessionStorage.removeItem(
        "KAMSETUUser"
    );

    sessionStorage.removeItem(
        "KAMSETUCustomer"
    );

    sessionStorage.removeItem(
        "KAMSETUProvider"
    );


    window.location.href =
        "login.html";

}


/* =====================================================
   PAGE INITIALIZATION
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        /* Load actual logged-in customer */

        loadLoggedInCustomer();


        /* Update notification count */

        updateNotificationCount();

    }
);
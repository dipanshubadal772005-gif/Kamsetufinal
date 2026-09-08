const API_BASE_URL = window.KAMSETU_API_URL;

let allBookings = [];


/* =====================================================
   LOAD LOGGED-IN USER
===================================================== */

function loadLoggedInUser() {

    let userData =
        localStorage.getItem("KAMSETUUser");

    if (!userData) {
        userData =
            sessionStorage.getItem("KAMSETUUser");
    }

    if (!userData) {
        console.log("No logged-in user found.");
        return;
    }

    try {

        const user =
            JSON.parse(userData);

        const topUserName =
            document.getElementById("topUserName");

        const topUserAvatar =
            document.getElementById("topUserAvatar");


        /* TOP-RIGHT USER NAME */

        if (topUserName) {

            topUserName.textContent =
                user.name || "User";

        }


        /* TOP-RIGHT USER AVATAR */

        if (topUserAvatar) {

            topUserAvatar.textContent =
                (user.name || "U")
                    .charAt(0)
                    .toUpperCase();

        }

    } catch (error) {

        console.error(
            "Could not load logged-in user:",
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

    if (!toast) return;

    toast.textContent = message;

    toast.classList.add("show");

    clearTimeout(window.toastTimer);

    window.toastTimer =
        setTimeout(
            () => toast.classList.remove("show"),
            2500
        );
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
   NAVIGATION
===================================================== */

function findService() {

    window.location.href =
        "../service.html";
}


function openProfile() {

    window.location.href =
        "customer-profile.html";
}


function showNotifications() {

    showToast(
        "You have 3 notifications."
    );
}


function showComingSoon(event) {

    event?.preventDefault();

    showToast(
        "This section is coming soon."
    );
}


/* =====================================================
   LOGOUT
===================================================== */

function logoutUser() {

    if (
        !confirm(
            "Are you sure you want to logout?"
        )
    ) {
        return;
    }

    [
        "KAMSETUToken",
        "KAMSETUUser",
        "KAMSETUCustomer",
        "KAMSETUProvider",
        "KAMSETUSelectedBooking"
    ].forEach(
        key =>
            localStorage.removeItem(key)
    );

    sessionStorage.clear();

    window.location.href =
        "../login.html";
}


/* =====================================================
   FORMAT DATE
===================================================== */

function formatDate(value) {

    if (!value) {
        return "Date not set";
    }

    return new Date(value)
        .toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );
}


function statusLabel(status) {

    return (
        status || "pending"
    ).replace(
        /^./,
        c => c.toUpperCase()
    );
}


/* =====================================================
   RENDER BOOKINGS
===================================================== */

function renderBookings() {

    const list =
        document.getElementById(
            "bookingList"
        );

    const empty =
        document.getElementById(
            "noBookings"
        );

    if (!list) return;

    list.innerHTML = "";


    if (!allBookings.length) {

        list.innerHTML = `
            <div class="no-bookings" id="noBookings">

                <h3>No bookings found</h3>

                <p>
                    Book a service to see it here.
                </p>

                <button onclick="findService()">
                    Find a Service
                </button>

            </div>
        `;

        updateStats();

        return;
    }


    allBookings.forEach(
        booking => {

            const providerName =
                booking.provider?.name ||
                "Service Provider";

            const status =
                booking.status ||
                "pending";


            const card =
                document.createElement(
                    "article"
                );

            card.className =
                "booking-card";

            card.dataset.status =
                status;

            card.dataset.bookingId =
                booking._id;


            card.innerHTML = `

                <div class="booking-top">

                    <div class="booking-info">

                        <span class="booking-label">
                            SERVICE
                        </span>

                        <h3>
                            ${escapeHtml(
                                booking.serviceName ||
                                "Home Service"
                            )}
                        </h3>

                        <p>
                            Provider:
                            ${escapeHtml(
                                providerName
                            )}
                        </p>

                    </div>

                    <span class="status ${status}">
                        ${statusLabel(status)}
                    </span>
                    ${booking.isEmergency ? '<span class="status emergency">🚨 Emergency</span>' : ''}

                </div>


                <div class="booking-details">

                    <div>
                        <span>DATE</span>

                        <strong>
                            ${formatDate(
                                booking.bookingDate
                            )}
                        </strong>
                    </div>


                    <div>
                        <span>TIME</span>

                        <strong>
                            ${escapeHtml(
                                booking.bookingTime ||
                                "-"
                            )}
                        </strong>
                    </div>


                    <div>
                        <span>LOCATION</span>

                        <strong>
                            ${escapeHtml(
                                booking.location ||
                                "-"
                            )}
                        </strong>
                    </div>


                    <div>
                        <span>PRICE</span>

                        <strong>
                            ${
                                booking.agreedPrice != null
                                    ? "₹" +
                                      booking.agreedPrice
                                    : "Negotiating"
                            }
                        </strong>

                    </div>

                </div>


                <div class="booking-footer">

                    <span class="booking-id">

                        Booking ID:

                        <strong>
                            ${escapeHtml(
                                booking.bookingCode ||
                                booking._id
                            )}
                        </strong>

                    </span>


                    <div class="booking-actions">

                        <button
                            class="outline-btn"
                            onclick="openBooking('${booking._id}')"
                        >
                            View
                        </button>


                        ${
                            ["pending", "accepted"].includes(status)
                                ? `
                                    <button
                                        class="outline-btn"
                                        onclick="rescheduleBooking('${booking._id}')"
                                    >
                                        Reschedule
                                    </button>
                                  `
                                : ""
                        }

                        ${
                            [
                                "pending",
                                "accepted",
                                "ongoing"
                            ].includes(status)
                                ? `
                                    <button
                                        class="cancel-btn"
                                        onclick="cancelBooking('${booking._id}')"
                                    >
                                        Cancel
                                    </button>
                                  `
                                : ""
                        }


                        ${
                            status === "pending"
                                ? `
                                    <button
                                        class="review-btn"
                                        onclick="openNegotiation('${booking._id}')"
                                    >
                                        Negotiate
                                    </button>
                                  `
                                : ""
                        }


                        ${
                            status === "completed" &&
                            booking.paymentStatus !== "paid"
                                ? `
                                    <button
                                        class="payment-btn"
                                        onclick="openPayment(
                                            '${booking._id}',
                                            ${Number(
                                                booking.agreedPrice ||
                                                0
                                            )}
                                        )"
                                    >
                                        Pay Provider
                                    </button>
                                  `
                                : ""
                        }


                        ${
                            status === "completed" &&
                            booking.paymentStatus === "paid"
                                ? `
                                    <button
                                        class="paid-btn"
                                        disabled
                                    >
                                        Payment Completed
                                    </button>
                                  `
                                : ""
                        }

                    </div>

                </div>
            `;


            list.appendChild(card);

        }
    );


    updateStats();
}


/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeHtml(value) {

    return String(
        value ?? ""
    ).replace(
        /[&<>'"]/g,
        c =>
            ({
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                "'": "&#39;",
                '"': "&quot;"
            })[c]
    );
}


/* =====================================================
   UPDATE STATS
===================================================== */

function updateStats() {

    const active =
        allBookings.filter(
            booking =>
                [
                    "pending",
                    "accepted",
                    "ongoing"
                ].includes(
                    booking.status
                )
        ).length;


    const upcoming =
        allBookings.filter(
            booking =>
                [
                    "pending",
                    "accepted",
                    "ongoing"
                ].includes(
                    booking.status
                )
        ).length;


    const activeCount =
        document.getElementById(
            "activeCount"
        );

    const upcomingCount =
        document.getElementById(
            "upcomingCount"
        );


    if (activeCount) {

        activeCount.textContent =
            active;

    }


    if (upcomingCount) {

        upcomingCount.textContent =
            upcoming;

    }
}


/* =====================================================
   FILTER BOOKINGS
===================================================== */

function filterBookings(
    status,
    button
) {

    document
        .querySelectorAll(".tab")
        .forEach(
            tab =>
                tab.classList.remove(
                    "active"
                )
        );


    button?.classList.add(
        "active"
    );


    document
        .querySelectorAll(
            ".booking-card"
        )
        .forEach(
            card => {

                card.style.display =
                    status === "all" ||
                    card.dataset.status ===
                        status
                        ? ""
                        : "none";

            }
        );
}


/* =====================================================
   OPEN BOOKING
===================================================== */

function openBooking(id) {

    localStorage.setItem(
        "KAMSETUSelectedBooking",
        id
    );

    window.location.href =
        "customer-live-tracking.html";
}


/* =====================================================
   OPEN NEGOTIATION
===================================================== */

function openNegotiation(id) {

    localStorage.setItem(
        "KAMSETUSelectedBooking",
        id
    );

    window.location.href =
        "customer-negotiation.html";
}


/* =====================================================
   CANCEL BOOKING
===================================================== */


async function rescheduleBooking(id) {
    const date = prompt("Enter new date (YYYY-MM-DD):");
    if (!date) return;
    const time = prompt("Enter new time (for example 10:00 AM):");
    if (!time) return;

    const token = localStorage.getItem("KAMSETUToken") || sessionStorage.getItem("KAMSETUToken");
    try {
        const response = await fetch(`${API_BASE_URL}/api/bookings/${id}/reschedule`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ bookingDate: date, bookingTime: time })
        });
        const data = await response.json();
        if (!response.ok || !data.success) throw new Error(data.message || "Unable to reschedule");
        showToast("Booking rescheduled successfully.");
        await loadBookings();
    } catch (error) {
        console.error("Reschedule error:", error);
        showToast(error.message || "Unable to reschedule");
    }
}

async function cancelBooking(id) {

    if (
        !confirm(
            "Cancel this booking?"
        )
    ) {
        return;
    }


    const token =
        localStorage.getItem(
            "KAMSETUToken"
        );


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/api/bookings/${id}/status`,
                {
                    method: "PATCH",

                    headers: {
                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`
                    },

                    body: JSON.stringify({
                        status: "cancelled"
                    })
                }
            );


        const data =
            await response.json();


        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.message ||
                "Unable to cancel"
            );

        }


        showToast(
            "Booking cancelled."
        );


        await loadBookings();

    } catch (error) {

        showToast(
            error.message
        );

    }
}


/* =====================================================
   LOAD BOOKINGS
===================================================== */

async function loadBookings() {

    const token =
        localStorage.getItem(
            "KAMSETUToken"
        );


    if (!token) {

        window.location.href =
            "../login.html";

        return;
    }


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/api/bookings/customer`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );


        const data =
            await response.json();


        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.message ||
                "Unable to load bookings"
            );

        }


        allBookings =
            data.bookings || [];


        renderBookings();

    } catch (error) {

        console.error(
            error
        );


        document.getElementById(
            "bookingList"
        ).innerHTML = `

            <div class="no-bookings">

                <h3>
                    Unable to load bookings
                </h3>

                <p>
                    ${escapeHtml(
                        error.message
                    )}
                </p>

            </div>

        `;
    }
}


/* =====================================================
   OPEN PAYMENT
===================================================== */

function openPayment(
    bookingId,
    amount
) {

    const modal =
        document.getElementById(
            "paymentModal"
        );


    const bookingCard =
        document.querySelector(
            `.booking-card[data-booking-id="${CSS.escape(
                String(bookingId)
            )}"]`
        );


    const providerName =
        bookingCard
            ?.querySelector(
                ".booking-info p"
            )
            ?.textContent
            ?.replace(
                /^Provider:\s*/i,
                ""
            ) ||
        "Service Provider";


    const amountEl =
        document.getElementById(
            "paymentAmount"
        );


    const providerEl =
        document.getElementById(
            "paymentProvider"
        );


    const bookingEl =
        document.getElementById(
            "paymentBookingId"
        );


    if (
        !modal ||
        !amountEl ||
        !providerEl ||
        !bookingEl
    ) {

        showToast(
            "Payment window is unavailable."
        );

        return;
    }


    bookingEl.value =
        bookingId;


    amountEl.textContent =
        "₹" +
        Number(
            amount || 0
        ).toLocaleString(
            "en-IN"
        );


    providerEl.textContent =
        providerName ||
        "Service Provider";


    const method =
        document.getElementById(
            "paymentMethod"
        );


    const reference =
        document.getElementById(
            "paymentReference"
        );


    if (method) {
        method.value = "upi";
    }


    if (reference) {
        reference.value = "";
    }


    modal.classList.add(
        "show"
    );


    document.body.classList.add(
        "payment-modal-open"
    );
}


/* =====================================================
   CLOSE PAYMENT
===================================================== */

function closePayment() {

    const modal =
        document.getElementById(
            "paymentModal"
        );


    if (modal) {

        modal.classList.remove(
            "show"
        );

    }


    document.body.classList.remove(
        "payment-modal-open"
    );
}


/* =====================================================
   CONFIRM PAYMENT
===================================================== */

async function confirmPayment() {

    const bookingId =
        document.getElementById(
            "paymentBookingId"
        )?.value;


    const paymentMethod =
        document.getElementById(
            "paymentMethod"
        )?.value;


    const paymentReference =
        document.getElementById(
            "paymentReference"
        )?.value
        .trim() || "";


    if (!bookingId) {

        showToast(
            "Booking information is missing."
        );

        return;
    }


    if (
        paymentMethod === "upi" &&
        !paymentReference
    ) {

        showToast(
            "Enter the UPI transaction/reference ID after payment."
        );

        return;
    }


    const token =
        localStorage.getItem(
            "KAMSETUToken"
        );


    const button =
        document.getElementById(
            "confirmPaymentBtn"
        );


    if (!token) {

        window.location.href =
            "../login.html";

        return;
    }


    if (button) {

        button.disabled =
            true;

        button.textContent =
            "Confirming...";

    }


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/api/bookings/${bookingId}/payment`,
                {
                    method: "PATCH",

                    headers: {

                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`

                    },

                    body:
                        JSON.stringify({

                            paymentMethod,

                            paymentReference

                        })
                }
            );


        const data =
            await response.json();


        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.message ||
                "Unable to confirm payment"
            );

        }


        closePayment();


        showToast(
            "Payment recorded successfully."
        );


        await loadBookings();


    } catch (error) {

        console.error(
            "Payment error:",
            error
        );


        showToast(
            error.message
        );


    } finally {

        if (button) {

            button.disabled =
                false;

            button.textContent =
                "Confirm Payment";

        }
    }
}


/* =====================================================
   PAYMENT OVERLAY
===================================================== */

function handlePaymentOverlay(
    event
) {

    if (
        event.target.id ===
        "paymentModal"
    ) {

        closePayment();

    }
}


/* =====================================================
   LEAVE REVIEW
===================================================== */

function leaveReview(
    provider
) {

    showToast(
        "Review for " +
        provider +
        " will be available after completion."
    );
}


/* =====================================================
   PAGE LOAD
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        /* Load actual logged-in user */

        loadLoggedInUser();


        /* Load customer's bookings */

        loadBookings();

    }
);
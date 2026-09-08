/* =====================================================
   KAMSETU PROVIDER NEGOTIATIONS
===================================================== */


/* =====================================================
   API CONFIGURATION
===================================================== */

const API_BASE_URL =
    window.KAMSETU_API_URL || "";


/* =====================================================
   AUTH TOKEN
===================================================== */

function getAuthToken() {

    let token =
        localStorage.getItem(
            "KAMSETUToken"
        );


    if (!token) {

        token =
            sessionStorage.getItem(
                "KAMSETUToken"
            );

    }


    return token;

}


/* =====================================================
   PROVIDER PROFILE
===================================================== */

function loadLoggedInProvider() {

    let userData =
        localStorage.getItem(
            "KAMSETUUser"
        );


    if (!userData) {

        userData =
            sessionStorage.getItem(
                "KAMSETUUser"
            );

    }


    if (!userData) {

        console.log(
            "No logged-in provider profile found."
        );

        return;

    }


    try {

        const user =
            JSON.parse(
                userData
            );


        const name =
            String(
                user.name || "User"
            ).trim();


        const firstLetter =
            name
                .charAt(0)
                .toUpperCase();


        const sidebarName =
            document.getElementById(
                "providerSidebarName"
            );


        const sidebarAvatar =
            document.getElementById(
                "providerSidebarAvatar"
            );


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
                name;

        }


        if (sidebarAvatar) {

            sidebarAvatar.textContent =
                firstLetter;

        }


        if (topUserName) {

            topUserName.textContent =
                name;

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

let toastTimer = null;


function showToast(message) {

    const toast =
        document.getElementById(
            "toast"
        );


    if (!toast) {

        return;

    }


    toast.textContent =
        String(message || "");


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


    if (!sidebar) {

        return;

    }


    sidebar.classList.toggle(
        "open"
    );


    if (overlay) {

        overlay.classList.toggle(
            "show"
        );

    }

}


/* =====================================================
   ESCAPE HTML
===================================================== */

function esc(value) {

    return String(
        value ?? ""
    ).replace(
        /[&<>'"]/g,
        function (character) {

            const map = {

                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                "'": "&#39;",
                '"': "&quot;"

            };


            return map[
                character
            ];

        }
    );

}


/* =====================================================
   FORMAT DATE
===================================================== */

function formatDate(value) {

    if (!value) {

        return "-";

    }


    const date =
        new Date(
            value
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "-";

    }


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


/* =====================================================
   FORMAT PRICE
===================================================== */

function formatPrice(value) {

    const amount =
        Number(value);


    if (
        !Number.isFinite(
            amount
        )
    ) {

        return "0";

    }


    return amount.toLocaleString(
        "en-IN"
    );

}


/* =====================================================
   LOAD NEGOTIATIONS
===================================================== */

async function loadNegotiations() {

    const token =
        getAuthToken();


    if (!token) {

        window.location.href =
            "../login.html";

        return;

    }


    const list =
        document.getElementById(
            "negotiationList"
        );


    if (list) {

        list.innerHTML =
            `
                <div class="loading-negotiations">
                    Loading negotiations...
                </div>
            `;

    }


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/api/negotiations/provider`,
                {
                    method: "GET",

                    headers: {

                        "Authorization":
                            `Bearer ${token}`,

                        "Content-Type":
                            "application/json"

                    }
                }
            );


        let data = null;


        try {

            data =
                await response.json();

        } catch (error) {

            data = null;

        }


        if (
            response.status === 401 ||
            response.status === 403
        ) {

            logoutProvider(
                false
            );

            return;

        }


        if (
            !response.ok ||
            !data ||
            !data.success
        ) {

            throw new Error(
                data?.message ||
                `Unable to load negotiations (${response.status})`
            );

        }


        renderNegotiations(
            Array.isArray(
                data.negotiations
            )
                ? data.negotiations
                : []
        );

    } catch (error) {

        console.error(
            "Negotiation loading error:",
            error
        );


        if (list) {

            list.innerHTML =
                `
                    <div class="loading-negotiations">
                        <h3>
                            Unable to load negotiations
                        </h3>

                        <p>
                            ${esc(
                                error.message ||
                                "Please try again later."
                            )}
                        </p>

                        <button
                            type="button"
                            class="retry-btn"
                            onclick="loadNegotiations()"
                        >
                            Retry
                        </button>
                    </div>
                `;

        }

    }

}


/* =====================================================
   RENDER NEGOTIATIONS
===================================================== */

function renderNegotiations(
    items
) {

    const list =
        document.getElementById(
            "negotiationList"
        );


    const activeCount =
        document.getElementById(
            "activeCount"
        );


    if (!list) {

        return;

    }


    const negotiations =
        Array.isArray(items)
            ? items
            : [];


    if (activeCount) {

        activeCount.textContent =
            negotiations.length;

    }


    if (!negotiations.length) {

        list.innerHTML =
            `
                <div class="loading-negotiations">

                    <h3>
                        No active negotiations
                    </h3>

                    <p>
                        New customer offers will appear here.
                    </p>

                </div>
            `;

        return;

    }


    list.innerHTML =
        negotiations
            .map(
                createNegotiationCard
            )
            .join("");

}


/* =====================================================
   CREATE NEGOTIATION CARD
===================================================== */

function createNegotiationCard(
    negotiation
) {

    const n =
        negotiation || {};


    const booking =
        n.booking || {};


    const customer =
        n.customer || {};


    const id =
        esc(
            n._id || ""
        );


    const bookingId =
        esc(
            booking._id || ""
        );


    const customerName =
        esc(
            customer.name ||
            "Customer"
        );


    const serviceName =
        esc(
            booking.serviceName ||
            "Service"
        );


    const proposedPrice =
        Number(
            n.proposedPrice
        ) || 0;


    const bookingCode =
        esc(
            booking.bookingCode ||
            booking._id ||
            "-"
        );


    const bookingDate =
        formatDate(
            booking.bookingDate
        );


    const bookingTime =
        esc(
            booking.bookingTime ||
            "-"
        );


    const location =
        esc(
            booking.location ||
            "-"
        );


    const message =
        esc(
            n.message ||
            "No message"
        );


    return `

        <article
            class="negotiation-card"
            data-negotiation-id="${id}"
            data-booking-id="${bookingId}"
        >


            <div class="negotiation-top">


                <div>

                    <span>
                        CUSTOMER OFFER
                    </span>

                    <h3>
                        ${customerName}
                    </h3>

                    <p>
                        ${serviceName}
                    </p>

                </div>


                <strong class="customer-price">
                    ₹${formatPrice(
                        proposedPrice
                    )}
                </strong>


            </div>



            <div class="negotiation-details">


                <div>

                    <small>
                        BOOKING
                    </small>

                    <b>
                        ${bookingCode}
                    </b>

                </div>


                <div>

                    <small>
                        DATE
                    </small>

                    <b>
                        ${bookingDate}
                    </b>

                </div>


                <div>

                    <small>
                        TIME
                    </small>

                    <b>
                        ${bookingTime}
                    </b>

                </div>


                <div>

                    <small>
                        LOCATION
                    </small>

                    <b>
                        ${location}
                    </b>

                </div>


            </div>



            <p class="negotiation-message">
                ${message}
            </p>



            <div class="negotiation-actions">


                <button
                    type="button"
                    onclick="acceptOffer(this)"
                >
                    Accept ₹${formatPrice(
                        proposedPrice
                    )}
                </button>


                <button
                    type="button"
                    onclick="counterOffer(this)"
                >
                    Counter Offer
                </button>


            </div>


        </article>

    `;

}


/* =====================================================
   ACCEPT OFFER
===================================================== */

async function acceptOffer(
    button
) {

    if (!button) {

        return;

    }


    const card =
        button.closest(
            ".negotiation-card"
        );


    if (!card) {

        showToast(
            "Negotiation not found."
        );

        return;

    }


    const id =
        card.dataset.negotiationId;


    if (!id) {

        showToast(
            "Invalid negotiation."
        );

        return;

    }


    const confirmed =
        confirm(
            "Accept this offer?"
        );


    if (!confirmed) {

        return;

    }


    const token =
        getAuthToken();


    if (!token) {

        window.location.href =
            "../login.html";

        return;

    }


    const originalText =
        button.textContent;


    button.disabled =
        true;


    button.textContent =
        "Accepting...";


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/api/negotiations/${encodeURIComponent(id)}`,
                {
                    method: "PATCH",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${token}`

                    },

                    body: JSON.stringify(
                        {
                            status:
                                "accepted"
                        }
                    )

                }
            );


        let data = null;


        try {

            data =
                await response.json();

        } catch (error) {

            data = null;

        }


        if (
            response.status === 401 ||
            response.status === 403
        ) {

            logoutProvider(
                false
            );

            return;

        }


        if (
            !response.ok ||
            !data ||
            !data.success
        ) {

            throw new Error(
                data?.message ||
                "Unable to accept offer."
            );

        }


        showToast(
            "Offer accepted. Tracking is enabled for this booking."
        );


        card.remove();


        updateActiveCount();


    } catch (error) {

        console.error(
            "Accept offer error:",
            error
        );


        button.disabled =
            false;


        button.textContent =
            originalText;


        showToast(
            error.message ||
            "Unable to accept offer."
        );

    }

}


/* =====================================================
   COUNTER OFFER
===================================================== */

async function counterOffer(
    button
) {

    if (!button) {

        return;

    }


    const card =
        button.closest(
            ".negotiation-card"
        );


    if (!card) {

        showToast(
            "Negotiation not found."
        );

        return;

    }


    const id =
        card.dataset.negotiationId;


    if (!id) {

        showToast(
            "Invalid negotiation."
        );

        return;

    }


    const priceInput =
        prompt(
            "Enter counter offer price:",
            "550"
        );


    if (
        priceInput === null
    ) {

        return;

    }


    const price =
        Number(
            String(
                priceInput
            ).trim()
        );


    if (
        !Number.isFinite(price) ||
        price <= 0
    ) {

        showToast(
            "Enter a valid price greater than ₹0."
        );

        return;

    }


    const token =
        getAuthToken();


    if (!token) {

        window.location.href =
            "../login.html";

        return;

    }


    const originalText =
        button.textContent;


    button.disabled =
        true;


    button.textContent =
        "Sending...";


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/api/negotiations/${encodeURIComponent(id)}`,
                {
                    method: "PATCH",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${token}`

                    },

                    body: JSON.stringify(
                        {
                            status:
                                "countered",

                            proposedPrice:
                                price,

                            message:
                                "Provider counter offer"
                        }
                    )

                }
            );


        let data = null;


        try {

            data =
                await response.json();

        } catch (error) {

            data = null;

        }


        if (
            response.status === 401 ||
            response.status === 403
        ) {

            logoutProvider(
                false
            );

            return;

        }


        if (
            !response.ok ||
            !data ||
            !data.success
        ) {

            throw new Error(
                data?.message ||
                "Unable to send counter offer."
            );

        }


        showToast(
            "Counter offer sent successfully."
        );


        await loadNegotiations();


    } catch (error) {

        console.error(
            "Counter offer error:",
            error
        );


        button.disabled =
            false;


        button.textContent =
            originalText;


        showToast(
            error.message ||
            "Unable to send counter offer."
        );

    }

}


/* =====================================================
   UPDATE ACTIVE COUNT
===================================================== */

function updateActiveCount() {

    const activeCount =
        document.getElementById(
            "activeCount"
        );


    const cards =
        document.querySelectorAll(
            ".negotiation-card"
        );


    if (activeCount) {

        activeCount.textContent =
            cards.length;

    }


    if (
        cards.length === 0
    ) {

        const list =
            document.getElementById(
                "negotiationList"
            );


        if (list) {

            list.innerHTML =
                `
                    <div class="loading-negotiations">

                        <h3>
                            No active negotiations
                        </h3>

                        <p>
                            New customer offers will appear here.
                        </p>

                    </div>
                `;

        }

    }

}


/* =====================================================
   OPEN PROVIDER PROFILE
===================================================== */

function openProfile() {

    window.location.href =
        "provider-profile.html";

}


/* =====================================================
   LOGOUT
===================================================== */

function logoutProvider(
    askConfirmation = true
) {

    if (
        askConfirmation &&
        !confirm(
            "Are you sure you want to logout?"
        )
    ) {

        return;

    }


    /* ---------------------------------
       Clear KAMSETU authentication data
    --------------------------------- */

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


    if (askConfirmation) {

        showToast(
            "Logged out successfully"
        );

    }


    setTimeout(
        function () {

            window.location.href =
                "../login.html";

        },
        askConfirmation
            ? 500
            : 0
    );

}


/* =====================================================
   PAGE INITIALIZATION
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadLoggedInProvider();

        loadNegotiations();

    }
);
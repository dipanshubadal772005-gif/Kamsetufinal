/* =====================================================
   KAMSETU CUSTOMER NEGOTIATION
   FIXED VERSION
===================================================== */

const API_BASE_URL =
    window.KAMSETU_API_URL;

const token =
    localStorage.getItem("KAMSETUToken") ||
    sessionStorage.getItem("KAMSETUToken") ||
    "";

const bookingId =
    localStorage.getItem("KAMSETUSelectedBooking") ||
    sessionStorage.getItem("KAMSETUSelectedBooking") ||
    "";

let booking = null;


/* =====================================================
   AUTH
===================================================== */

const auth = {
    Authorization: `Bearer ${token}`
};


/* =====================================================
   ESCAPE HTML
===================================================== */

function esc(value) {

    return String(value ?? "")
        .replace(
            /[&<>'"]/g,
            function (character) {

                return {
                    "&": "&amp;",
                    "<": "&lt;",
                    ">": "&gt;",
                    "'": "&#39;",
                    '"': "&quot;"
                }[character];

            }
        );

}


/* =====================================================
   REDIRECT HELPERS
===================================================== */

function goToLogin() {

    window.location.href =
        "../login.html";

}


function goToBookings() {

    window.location.href =
        "customer-bookings.html";

}


/* =====================================================
   LOAD NEGOTIATION
===================================================== */

async function load() {

    /*
     * A missing token means the customer is genuinely
     * not authenticated.
     *
     * This is the ONLY condition that should send the
     * user to login.
     */

    if (!token) {

        console.warn(
            "Negotiation: authentication token missing."
        );

        goToLogin();

        return;
    }


    /*
     * A missing booking ID is NOT a login problem.
     *
     * The customer may be logged in but has reached
     * negotiation directly from the Service page.
     *
     * Send them to their bookings instead.
     */

    if (!bookingId) {

        console.warn(
            "Negotiation: KAMSETUSelectedBooking is missing."
        );

        const provider =
            localStorage.getItem(
                "KAMSETUNegotiationProvider"
            );

        if (provider) {

            console.log(
                "Selected provider preserved:",
                provider
            );

        }

        const card =
            document.getElementById(
                "bookingCard"
            );

        if (card) {

            card.innerHTML = `
                <h2>Booking required</h2>
                <p>
                    Please create or select a booking
                    before starting a negotiation.
                </p>
                <button
                    type="button"
                    class="primary"
                    onclick="goToBookings()"
                >
                    Go to Bookings →
                </button>
            `;

        }

        return;
    }


    /*
     * A valid token and booking ID are now available.
     */

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/api/bookings/${encodeURIComponent(bookingId)}`,
                {
                    headers: auth
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
                "Unable to load booking."
            );

        }


        booking =
            data.booking;


        const bookingCard =
            document.getElementById(
                "bookingCard"
            );


        if (bookingCard) {

            bookingCard.innerHTML = `
                <span>BOOKING</span>

                <h2>
                    ${esc(
                booking.serviceName ||
                booking.service?.name ||
                "Service"
            )}
                </h2>

                <p>
                    Provider:
                    <b>
                        ${esc(
                booking.provider?.name ||
                booking.providerName ||
                "Provider"
            )}
                    </b>
                </p>

                <p>
                    Location:
                    <b>
                        ${esc(
                booking.location ||
                "-"
            )}
                    </b>
                </p>

                <p>
                    Date:
                    <b>
                        ${booking.bookingDate
                    ? new Date(
                        booking.bookingDate
                    ).toLocaleDateString(
                        "en-IN"
                    )
                    : "-"
                }
                    </b>

                    at

                    <b>
                        ${esc(
                    booking.bookingTime ||
                    "-"
                )}
                    </b>
                </p>

                <p>
                    Starting price:
                    <b>
                        ₹${booking.service?.startingPrice ??
                booking.agreedPrice ??
                "-"
                }
                    </b>
                </p>
            `;

        }


        await history();

    }
    catch (error) {

        console.error(
            "Negotiation load error:",
            error
        );


        const card =
            document.getElementById(
                "bookingCard"
            );


        if (card) {

            card.innerHTML = `
                <b>
                    ${esc(
                error.message ||
                "Unable to load booking."
            )}
                </b>
            `;

        }

    }

}


/* =====================================================
   NEGOTIATION HISTORY
===================================================== */

async function history() {

    if (!bookingId) {

        return;

    }


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/api/negotiations/booking/${encodeURIComponent(bookingId)}`,
                {
                    headers: auth
                }
            );


        const data =
            await response.json();


        const box =
            document.getElementById(
                "history"
            );


        if (!box) {

            return;

        }


        if (
            !response.ok ||
            !data.success ||
            !data.negotiations?.length
        ) {

            box.innerHTML =
                "<p>No offers yet.</p>";

            return;

        }


        box.innerHTML =
            data.negotiations
                .map(function (negotiation) {

                    return `
                        <div class="offer">

                            <div>

                                <b>
                                    ${esc(
                        negotiation.proposedBy
                    )}
                                </b>

                                <div>
                                    ${esc(
                        negotiation.message ||
                        ""
                    )}
                                </div>

                            </div>

                            <div>

                                <strong>
                                    ₹${esc(
                        negotiation.proposedPrice
                    )}
                                </strong>

                                <div class="pill">
                                    ${esc(
                        negotiation.status
                    )}
                                </div>

                            </div>

                        </div>
                    `;

                })
                .join("");

    }
    catch (error) {

        console.error(
            "Negotiation history error:",
            error
        );

        const box =
            document.getElementById(
                "history"
            );

        if (box) {

            box.innerHTML =
                "<p>Unable to load negotiation history.</p>";

        }

    }

}


/* =====================================================
   SEND OFFER
===================================================== */

const sendOfferButton =
    document.getElementById(
        "sendOffer"
    );


if (sendOfferButton) {

    sendOfferButton.addEventListener(
        "click",
        async function () {

            const priceInput =
                document.getElementById(
                    "offerPrice"
                );

            const messageInput =
                document.getElementById(
                    "offerMessage"
                );

            const result =
                document.getElementById(
                    "result"
                );


            const price =
                Number(
                    priceInput?.value
                );


            const message =
                messageInput?.value
                    .trim() ||
                "";


            /* AUTH */

            if (!token) {

                if (result) {

                    result.textContent =
                        "Please login first.";

                }

                setTimeout(
                    goToLogin,
                    500
                );

                return;

            }


            /* BOOKING */

            if (!bookingId) {

                if (result) {

                    result.textContent =
                        "Please create or select a booking first.";

                }

                setTimeout(
                    goToBookings,
                    500
                );

                return;

            }


            /* PRICE */

            if (
                !Number.isFinite(price) ||
                price < 0
            ) {

                if (result) {

                    result.textContent =
                        "Enter a valid price.";

                }

                return;

            }


            try {

                sendOfferButton.disabled =
                    true;


                const response =
                    await fetch(
                        `${API_BASE_URL}/api/negotiations`,
                        {
                            method: "POST",

                            headers: {
                                ...auth,
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                booking:
                                    bookingId,

                                proposedPrice:
                                    price,

                                message:
                                    message

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
                        "Unable to send offer."
                    );

                }


                if (result) {

                    result.textContent =
                        "Offer sent successfully.";

                }


                if (priceInput) {

                    priceInput.value =
                        "";

                }


                if (messageInput) {

                    messageInput.value =
                        "";

                }


                await history();

            }
            catch (error) {

                console.error(
                    "Send offer error:",
                    error
                );


                if (result) {

                    result.textContent =
                        error.message ||
                        "Unable to send offer.";

                }

            }
            finally {

                sendOfferButton.disabled =
                    false;

            }

        }
    );

}


/* =====================================================
   START
===================================================== */

load();

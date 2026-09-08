const WORK_STORAGE_KEY =
    "servioProviderWorkHistory";

const REVIEWS_STORAGE_KEY =
    "servioProviderReviews";

const SELECTED_PROVIDER_KEY =
    "servioSelectedProviderProfile";


/* =========================================
   GET SELECTED PROVIDER
========================================= */

function getSelectedProvider() {

    const saved =
        localStorage.getItem(
            SELECTED_PROVIDER_KEY
        );

    if (saved) {

        try {

            return JSON.parse(saved);

        } catch (error) {

            console.log(
                "Invalid provider profile data."
            );

        }

    }


    const name =
        localStorage.getItem(
            "selectedProvider"
        );


    return {

        name: name || "Provider",

        service: "Service Provider",

        location: "Gurgaon",

        experience: "5",

        rating: "4.8",

        jobs: "120",

        price: "400",

        verified: true

    };

}


/* =========================================
   LOAD PROVIDER
========================================= */

function loadProvider() {

    const provider =
        getSelectedProvider();


    document.getElementById(
        "providerName"
    ).innerText =
        provider.name || "Provider";


    document.getElementById(
        "bottomProviderName"
    ).innerText =
        provider.name || "this provider";


    document.getElementById(
        "providerService"
    ).innerText =
        provider.service ||
        "Service Provider";


    document.getElementById(
        "providerLocation"
    ).innerText =
        "📍 " +
        (provider.location || "Gurgaon");


    const rating =
        provider.rating || "0";


    document.getElementById(
        "providerRating"
    ).innerText =
        "★ " + rating;


    document.getElementById(
        "ratingStat"
    ).innerText =
        rating;


    document.getElementById(
        "jobsCompleted"
    ).innerText =
        provider.jobs || "0";


    document.getElementById(
        "experience"
    ).innerText =
        (provider.experience || "0") +
        " Years";


    document.getElementById(
        "startingPrice"
    ).innerText =
        "₹" +
        (provider.price || "0");


    const initials =
        getInitials(
            provider.name || "Provider"
        );


    document.getElementById(
        "providerAvatar"
    ).innerText =
        initials;


    if (provider.verified === false) {

        document.getElementById(
            "verifiedBadge"
        ).style.display =
            "none";

    }


    const service =
        provider.service ||
        "professional";


    document.getElementById(
        "aboutText"
    ).innerText =
        (provider.name || "This provider") +
        " provides " +
        service +
        " services and has " +
        (provider.experience || "0") +
        " years of experience. " +
        "Customers can review completed work " +
        "before booking the provider.";

}


/* =========================================
   INITIALS
========================================= */

function getInitials(name) {

    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map(function(word) {
            return word.charAt(0).toUpperCase();
        })
        .join("");

}


/* =========================================
   LOAD WORK HISTORY
========================================= */

function loadWorkHistory() {

    const container =
        document.getElementById(
            "workHistory"
        );


    let workHistory = [];


    try {

        workHistory =
            JSON.parse(
                localStorage.getItem(
                    WORK_STORAGE_KEY
                )
            ) || [];

    } catch (error) {

        workHistory = [];

    }


    const provider =
        getSelectedProvider();


    const providerName =
        (provider.name || "")
            .trim()
            .toLowerCase();


    const providerWorks =
        workHistory.filter(function(work) {

            const workProvider =
                (
                    work.providerName ||
                    work.provider ||
                    ""
                )
                .trim()
                .toLowerCase();


            return (
                workProvider === providerName
            );

        });


    if (providerWorks.length === 0) {

        container.innerHTML = `

            <div class="empty-work">

                <div>▣</div>

                <h3>
                    No work history yet
                </h3>

                <p>
                    This provider has not posted
                    completed work yet.
                </p>

            </div>

        `;

        return;

    }


    container.innerHTML =
        providerWorks
            .sort(function(a, b) {

                return (
                    new Date(
                        b.date ||
                        b.createdAt ||
                        0
                    ) -
                    new Date(
                        a.date ||
                        a.createdAt ||
                        0
                    )
                );

            })
            .map(function(work) {

                return createWorkCard(work);

            })
            .join("");

}


/* =========================================
   WORK CARD
========================================= */

function createWorkCard(work) {

    const before =
        work.beforeImage || "";

    const after =
        work.afterImage || "";


    let images = "";


    if (before || after) {

        images = `

            ${
                before
                    ? `<img
                        src="${before}"
                        alt="Before work"
                    >`
                    : `<div class="work-no-image">
                        Before
                    </div>`
            }

            ${
                after
                    ? `<img
                        src="${after}"
                        alt="After work"
                    >`
                    : `<div class="work-no-image">
                        After
                    </div>`
            }

        `;

    } else {

        images = `

            <div class="work-no-image">
                ▣
            </div>

            <div class="work-no-image">
                ✓
            </div>

        `;

    }


    return `

        <article class="work-card">

            <div class="work-images">

                ${images}

            </div>


            <div class="work-info">

                <h3>
                    ${escapeHTML(
                        work.title ||
                        "Completed Work"
                    )}
                </h3>


                <div class="work-category">

                    ${escapeHTML(
                        work.category ||
                        "Service"
                    )}

                </div>


                <p class="work-description">

                    ${escapeHTML(
                        work.description ||
                        "Completed service work."
                    )}

                </p>


                <div class="work-meta">

                    ${
                        work.date
                            ? "Completed: " +
                              formatDate(work.date)
                            : ""
                    }

                    ${
                        work.location
                            ? " · " +
                              escapeHTML(
                                  work.location
                              )
                            : ""
                    }

                </div>


                <button
                    class="work-view"
                    onclick='viewWork(${JSON.stringify(work)})'
                >
                    View Details
                </button>

            </div>

        </article>

    `;

}


/* =========================================
   VIEW WORK
========================================= */

function viewWork(work) {

    const modal =
        document.getElementById(
            "workModal"
        );


    const content =
        document.getElementById(
            "workModalContent"
        );


    content.innerHTML = `

        <h2>
            ${escapeHTML(
                work.title ||
                "Completed Work"
            )}
        </h2>

        <p style="
            color:#ff5b16;
            margin-top:8px;
        ">
            ${escapeHTML(
                work.category ||
                "Service"
            )}
        </p>

        <p style="
            color:#aaa;
            margin-top:18px;
            line-height:1.7;
        ">
            ${escapeHTML(
                work.description ||
                "No description available."
            )}
        </p>

        <p style="
            color:#777;
            margin-top:15px;
        ">
            ${
                work.date
                    ? "Completed: " +
                      formatDate(work.date)
                    : ""
            }

            ${
                work.location
                    ? "<br>Location: " +
                      escapeHTML(
                          work.location
                      )
                    : ""
            }

            ${
                work.price
                    ? "<br>Final Price: ₹" +
                      escapeHTML(
                          String(work.price)
                      )
                    : ""
            }

            ${
                work.rating
                    ? "<br>Customer Rating: ★" +
                      escapeHTML(
                          String(work.rating)
                      )
                    : ""
            }

        </p>

    `;


    modal.classList.add("show");

}


/* =========================================
   CLOSE MODAL
========================================= */

function closeWorkModal() {

    document
        .getElementById("workModal")
        .classList.remove("show");

}


/* =========================================
   REVIEWS
========================================= */

function loadReviews() {

    const container =
        document.getElementById(
            "reviewsList"
        );


    let reviews = [];


    try {

        reviews =
            JSON.parse(
                localStorage.getItem(
                    REVIEWS_STORAGE_KEY
                )
            ) || [];

    } catch (error) {

        reviews = [];

    }


    const provider =
        getSelectedProvider();


    const providerName =
        (provider.name || "")
            .trim()
            .toLowerCase();


    const providerReviews =
        reviews.filter(function(review) {

            const reviewProvider =
                (
                    review.providerName ||
                    review.provider ||
                    ""
                )
                .trim()
                .toLowerCase();


            return (
                reviewProvider ===
                providerName
            );

        });


    if (providerReviews.length === 0) {

        container.innerHTML = `

            <div class="empty-review">
                No reviews yet.
            </div>

        `;

        return;

    }


    container.innerHTML =
        providerReviews
            .map(function(review) {

                return `

                    <article class="review-card">

                        <div class="review-top">

                            <span class="review-user">

                                ${escapeHTML(
                                    review.customer ||
                                    "Customer"
                                )}

                            </span>

                            <span class="review-stars">

                                ★ ${
                                    review.rating ||
                                    5
                                }

                            </span>

                        </div>


                        <p class="review-text">

                            ${escapeHTML(
                                review.comment ||
                                "Great service."
                            )}

                        </p>

                    </article>

                `;

            })
            .join("");

}


/* =========================================
   BOOK PROVIDER
========================================= */

function bookProvider() {

    const provider =
        getSelectedProvider();


    localStorage.setItem(
        "servioSelectedProvider",
        provider.name || "Provider"
    );


    localStorage.setItem(
        "servioSelectedProviderProfile",
        JSON.stringify(provider)
    );


    window.location.href =
        "customer-bookings.html";

}


/* =========================================
   MESSAGE PROVIDER
========================================= */

function messageProvider() {

    const provider =
        getSelectedProvider();


    localStorage.setItem(
        "servioSelectedProvider",
        provider.name || "Provider"
    );


    window.location.href =
        "customer-messages.html";

}


/* =========================================
   BACK
========================================= */

function goBack() {

    window.location.href =
        "../service.html";

}


/* =========================================
   SIDEBAR
========================================= */

function toggleSidebar() {

    const sidebar =
        document.querySelector(
            ".sidebar"
        );


    if (sidebar) {

        sidebar.classList.toggle(
            "open"
        );

    }

}


/* =========================================
   DATE
========================================= */

function formatDate(date) {

    const parsed =
        new Date(date);


    if (isNaN(parsed.getTime())) {

        return date;

    }


    return parsed.toLocaleDateString(
        "en-IN",
        {
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    );

}


/* =========================================
   ESCAPE HTML
========================================= */

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================================
   INITIALIZE
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        loadProvider();

        loadWorkHistory();

        loadReviews();

    }
);
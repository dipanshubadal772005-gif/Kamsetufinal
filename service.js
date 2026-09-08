/* =====================================================
   KAMSETU SERVICE SEARCH
===================================================== */


/* =====================================================
   API CONFIGURATION
===================================================== */

const API_BASE_URL =
    window.KAMSETU_API_URL;


/* =====================================================
   ELEMENTS
===================================================== */

const serviceSearch =
    document.getElementById("serviceSearch");

const locationSearch =
    document.getElementById("locationSearch");

const serviceFilter =
    document.getElementById("serviceFilter");

const priceFilter =
    document.getElementById("priceFilter");

const priceValue =
    document.getElementById("priceValue");

const availableToday =
    document.getElementById("availableToday");

const verifiedOnly =
    document.getElementById("verifiedOnly");

const resultCount =
    document.getElementById("resultCount");

const noResults =
    document.getElementById("noResults");

const sortSelect =
    document.getElementById("sortSelect");

const providerCards =
    Array.from(
        document.querySelectorAll(".provider-card")
    );


/* =====================================================
   TOAST
===================================================== */

function showToast(message) {

    const toast =
        document.getElementById("toast");

    if (!toast) {
        return;
    }

    toast.textContent = message;

    toast.classList.add("show");

    clearTimeout(window.toastTimer);

    window.toastTimer =
        setTimeout(function () {

            toast.classList.remove("show");

        }, 2500);
}


/* =====================================================
   LOAD LOGGED-IN CUSTOMER
===================================================== */

function loadUser() {

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

        const userName =
            document.getElementById("userName");

        const topUserAvatar =
            document.getElementById("topUserAvatar");

        const cleanName =
            String(
                user.name || "User"
            ).trim();

        if (userName) {

            userName.textContent =
                cleanName;

        }

        if (topUserAvatar) {

            topUserAvatar.textContent =
                cleanName
                    .charAt(0)
                    .toUpperCase();

        }

        console.log(
            "Customer loaded:",
            cleanName
        );

    }
    catch (error) {

        console.error(
            "Invalid KAMSETU user data:",
            error
        );

    }
}


/* =====================================================
   SEARCH
===================================================== */

function performSearch() {

    if (
        !serviceSearch ||
        !locationSearch
    ) {

        return;
    }

    const service =
        serviceSearch.value
            .trim()
            .toLowerCase();

    const location =
        locationSearch.value
            .trim()
            .toLowerCase();

    if (!service) {

        showToast(
            "Please enter a service."
        );

        serviceSearch.focus();

        return;
    }

    if (!location) {

        showToast(
            "Please enter your location."
        );

        locationSearch.focus();

        return;
    }

    let matched = 0;

    providerCards.forEach(function (card) {

        const cardService =
            String(
                card.dataset.service || ""
            ).toLowerCase();

        const cardLocation =
            String(
                card.dataset.location || ""
            ).toLowerCase();

        const serviceMatch =
            cardService.includes(service) ||
            service.includes(cardService);

        const locationMatch =
            !cardLocation ||
            cardLocation.includes(location) ||
            location.includes(cardLocation);

        if (
            serviceMatch &&
            locationMatch
        ) {

            card.style.display = "block";

            matched++;

        }
        else {

            card.style.display = "none";

        }

    });

    updateResults();

    if (matched === 0) {

        showToast(
            "No professionals found for your search."
        );

    }
    else {

        showToast(
            matched +
            " professional" +
            (matched > 1 ? "s" : "") +
            " found."
        );

    }
}


/* =====================================================
   FILTERS
===================================================== */

function applyFilters() {

    if (
        !serviceFilter ||
        !priceFilter
    ) {

        return;
    }

    const selectedService =
        serviceFilter.value;

    const selectedRating =
        document.querySelector(
            'input[name="rating"]:checked'
        );

    const minimumRating =
        selectedRating
            ? parseFloat(selectedRating.value)
            : 0;

    const maximumPrice =
        parseInt(
            priceFilter.value,
            10
        ) || 0;

    const onlyAvailable =
        availableToday
            ? availableToday.checked
            : false;

    const onlyVerified =
        verifiedOnly
            ? verifiedOnly.checked
            : false;

    let visibleCount = 0;

    providerCards.forEach(function (card) {

        const cardService =
            String(
                card.dataset.service || ""
            ).toLowerCase();

        const cardRating =
            parseFloat(
                card.dataset.rating || "0"
            );

        const cardPrice =
            parseInt(
                card.dataset.price || "0",
                10
            );

        const cardAvailable =
            card.dataset.available === "true";

        const cardVerified =
            card.dataset.verified === "true";

        let visible = true;


        /* SERVICE */

        if (
            selectedService !== "all" &&
            cardService !==
                selectedService.toLowerCase()
        ) {

            visible = false;

        }


        /* RATING */

        if (
            cardRating < minimumRating
        ) {

            visible = false;

        }


        /* PRICE */

        if (
            cardPrice > maximumPrice
        ) {

            visible = false;

        }


        /* AVAILABILITY */

        if (
            onlyAvailable &&
            !cardAvailable
        ) {

            visible = false;

        }


        /* VERIFIED */

        if (
            onlyVerified &&
            !cardVerified
        ) {

            visible = false;

        }


        if (visible) {

            card.style.display =
                "block";

            visibleCount++;

        }
        else {

            card.style.display =
                "none";

        }

    });


    if (resultCount) {

        resultCount.textContent =
            visibleCount;

    }


    if (noResults) {

        noResults.style.display =
            visibleCount === 0
                ? "block"
                : "none";

    }


    showToast(
        visibleCount +
        " professional" +
        (visibleCount !== 1 ? "s" : "") +
        " found."
    );
}


/* =====================================================
   UPDATE RESULTS COUNT
===================================================== */

function updateResults() {

    let visibleCount = 0;

    providerCards.forEach(function (card) {

        if (
            card.style.display !== "none"
        ) {

            visibleCount++;

        }

    });


    if (resultCount) {

        resultCount.textContent =
            visibleCount;

    }


    if (noResults) {

        noResults.style.display =
            visibleCount === 0
                ? "block"
                : "none";

    }
}


/* =====================================================
   CLEAR FILTERS
===================================================== */

function clearFilters() {

    if (serviceFilter) {

        serviceFilter.value =
            "all";

    }


    document
        .querySelectorAll(
            'input[name="rating"]'
        )
        .forEach(function (input) {

            input.checked = false;

        });


    if (priceFilter) {

        priceFilter.value =
            "1500";

    }


    if (priceValue) {

        priceValue.textContent =
            "₹1500";

    }


    if (availableToday) {

        availableToday.checked =
            false;

    }


    if (verifiedOnly) {

        verifiedOnly.checked =
            false;

    }


    providerCards.forEach(function (card) {

        card.style.display =
            "block";

    });


    if (resultCount) {

        resultCount.textContent =
            providerCards.length;

    }


    if (noResults) {

        noResults.style.display =
            "none";

    }


    showToast(
        "Filters cleared."
    );
}


/* =====================================================
   PRICE RANGE
===================================================== */

if (priceFilter) {

    priceFilter.addEventListener(
        "input",
        function () {

            if (priceValue) {

                priceValue.textContent =
                    "₹" + this.value;

            }

        }
    );

}


/* =====================================================
   SORT PROVIDERS
===================================================== */

if (sortSelect) {

    sortSelect.addEventListener(
        "change",
        function () {

            const value =
                this.value;

            const providerContainer =
                document.querySelector(
                    ".providers-section"
                );

            if (!providerContainer) {

                return;

            }


            const cards =
                Array.from(
                    providerContainer.querySelectorAll(
                        ".provider-card"
                    )
                );


            cards.sort(
                function (a, b) {

                    const ratingA =
                        parseFloat(
                            a.dataset.rating || "0"
                        );

                    const ratingB =
                        parseFloat(
                            b.dataset.rating || "0"
                        );

                    const priceA =
                        parseInt(
                            a.dataset.price || "0",
                            10
                        );

                    const priceB =
                        parseInt(
                            b.dataset.price || "0",
                            10
                        );


                    /* HIGHEST RATING */

                    if (
                        value === "rating"
                    ) {

                        return (
                            ratingB -
                            ratingA
                        );

                    }


                    /* LOWEST PRICE */

                    if (
                        value === "price-low"
                    ) {

                        return (
                            priceA -
                            priceB
                        );

                    }


                    /* HIGHEST PRICE */

                    if (
                        value === "price-high"
                    ) {

                        return (
                            priceB -
                            priceA
                        );

                    }


                    /* RECOMMENDED */

                    return 0;

                }
            );


            cards.forEach(function (card) {

                providerContainer.appendChild(
                    card
                );

            });


            if (noResults) {

                providerContainer.appendChild(
                    noResults
                );

            }


            showToast(
                "Results sorted."
            );

        }
    );

}


/* =====================================================
   VIEW PROVIDER
===================================================== */

function viewProvider(
    name,
    service,
    location,
    experience,
    rating,
    jobs,
    price,
    verified
) {

    const provider = {

        name:
            name,

        service:
            service ||
            "Service Provider",

        location:
            location ||
            "Gurgaon",

        experience:
            experience ||
            "0",

        rating:
            rating ||
            "0",

        jobs:
            jobs ||
            "0",

        price:
            price ||
            "0",

        verified:
            verified !== false

    };


    localStorage.setItem(
        "selectedProvider",
        name
    );


    localStorage.setItem(
        "servioSelectedProviderProfile",
        JSON.stringify(provider)
    );


    showToast(
        "Opening " +
        name +
        "'s profile..."
    );


    setTimeout(function () {

        window.location.href =
            "customer-provider-profile.html";

    }, 500);
}


/* =====================================================
   BOOK PROVIDER
===================================================== */

function bookProviderFromCard(
    name,
    service,
    location,
    experience,
    rating,
    jobs,
    price,
    verified
) {

    const provider = {

        name:
            name,

        service:
            service ||
            "Service Provider",

        location:
            location ||
            "Gurgaon",

        experience:
            experience ||
            "0",

        rating:
            rating ||
            "0",

        jobs:
            jobs ||
            "0",

        price:
            price ||
            "0",

        verified:
            verified !== false

    };


    localStorage.setItem(
        "selectedProvider",
        name
    );


    localStorage.setItem(
        "servioSelectedProvider",
        name
    );


    localStorage.setItem(
        "servioSelectedProviderProfile",
        JSON.stringify(provider)
    );


    showToast(
        "Opening booking for " +
        name +
        "..."
    );


    setTimeout(function () {

        window.location.href =
            "customer-bookings.html";

    }, 500);
}


/* =====================================================
   NEGOTIATION
   FIXED:
   - Removed duplicate startNegotiation() definitions.
   - Supports all user-storage keys used by the project.
   - Accepts Customer/customer role casing.
   - Does not redirect a valid logged-in customer to login.
   - Saves the selected provider before opening negotiation.
===================================================== */

/**
 * Get the currently logged-in user from the storage keys used
 * across the KAMSETU/Servio pages.
 */
function getLoggedInUser() {

    const storageKeys = [
        "KAMSETUUser",
        "KAMSETUCustomer",
        "servioUser",
        "servioCustomer"
    ];

    const storages = [
        localStorage,
        sessionStorage
    ];

    for (const storage of storages) {

        for (const key of storageKeys) {

            const raw = storage.getItem(key);

            if (!raw) {
                continue;
            }

            try {

                const parsed = JSON.parse(raw);

                if (parsed && typeof parsed === "object") {
                    return parsed;
                }

            } catch (error) {

                console.warn(
                    "Invalid user data in " + key + ":",
                    error
                );

            }
        }
    }

    return null;
}


/**
 * Start negotiation with a provider.
 */
function startNegotiation(name) {

    console.log(
        "Starting negotiation with:",
        name
    );

    /* ---------- GET LOGGED-IN CUSTOMER ---------- */

    const user = getLoggedInUser();
    const token =
        localStorage.getItem("KAMSETUToken") ||
        sessionStorage.getItem("KAMSETUToken") ||
        "";

    /*
     * Treat a valid KAMSETU auth token as the primary proof that
     * the customer is logged in. Some pages store the profile
     * separately, so do not send a token-authenticated customer
     * back to login just because KAMSETUUser is missing.
     */
    const normalizedRole =
        user && user.role
            ? String(user.role).trim().toLowerCase()
            : "";

    if (
        (!user && !token) ||
        (
            user &&
            normalizedRole &&
            normalizedRole !== "customer" &&
            !token
        )
    ) {

        showToast(
            "Please login as a customer first."
        );

        setTimeout(function () {

            window.location.href =
                "login.html";

        }, 700);

        return;
    }


    const effectiveUser = user || { role: "customer" };

    /* ---------- FIND PROVIDER CARD ---------- */

    const card =
        providerCards.find(function (c) {

            const providerHeading =
                c.querySelector(
                    ".provider-name h3"
                );

            if (!providerHeading) {
                return false;
            }

            const providerName =
                providerHeading.textContent.trim();

            return providerName === name;

        });


    if (!card) {

        console.error(
            "Provider card not found:",
            name
        );

        showToast(
            "Provider information not found."
        );

        return;
    }


    /* ---------- GET PROVIDER INFORMATION ---------- */

    const providerData = {

        name: name,

        service:
            card.dataset.service ||
            "Home Service",

        location:
            card.dataset.location ||
            "Gurgaon",

        rating:
            card.dataset.rating ||
            "0",

        price:
            card.dataset.price ||
            "0",

        verified:
            card.dataset.verified === "true"

    };


    /* ---------- SAVE SELECTED PROVIDER ---------- */

    localStorage.setItem(
        "selectedProvider",
        name
    );

    localStorage.setItem(
        "KAMSETUNegotiationProvider",
        JSON.stringify(providerData)
    );

    localStorage.setItem(
        "servioSelectedProviderProfile",
        JSON.stringify(providerData)
    );


    /* ---------- KEEP USER DATA IN COMMON FORMAT ---------- */

    localStorage.setItem(
        "KAMSETUUser",
        JSON.stringify(effectiveUser)
    );


    /* ---------- OPEN NEGOTIATION ---------- */

    showToast(
        "Opening negotiation with " +
        name +
        "..."
    );

    setTimeout(function () {

        window.location.href =
            "customer/customer-negotiation.html";

    }, 300);

}

/* =====================================================
   PROFILE
===================================================== */

function openProfile() {

    showToast(
        "Opening your profile..."
    );


    setTimeout(function () {

        window.location.href =
            "customer-profile.html";

    }, 500);
}


/* =====================================================
   NOTIFICATIONS
===================================================== */

function showNotifications() {

    showToast(
        "You have 3 notifications."
    );

}


/* =====================================================
   SETTINGS
===================================================== */

function showComingSoon(event) {

    if (event) {

        event.preventDefault();

    }


    showToast(
        "This section is coming soon."
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
            "sidebarOverlay"
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
   LOGOUT
===================================================== */

function logoutUser() {

    const confirmLogout =
        confirm(
            "Are you sure you want to logout?"
        );


    if (!confirmLogout) {

        return;

    }


    /* LOCAL STORAGE */

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

    localStorage.removeItem(
        "selectedProvider"
    );

    localStorage.removeItem(
        "KAMSETUNegotiationProvider"
    );

    localStorage.removeItem(
        "servioSelectedProvider"
    );

    localStorage.removeItem(
        "servioSelectedProviderProfile"
    );


    /* SESSION STORAGE */

    sessionStorage.removeItem(
        "KAMSETUUser"
    );

    sessionStorage.removeItem(
        "KAMSETUCustomer"
    );

    sessionStorage.removeItem(
        "KAMSETUProvider"
    );


    showToast(
        "Logged out successfully."
    );


    setTimeout(function () {

        window.location.href =
            "login.html";

    }, 700);

}


/* =====================================================
   ENTER KEY SEARCH
===================================================== */

if (serviceSearch) {

    serviceSearch.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Enter"
            ) {

                performSearch();

            }

        }
    );

}


if (locationSearch) {

    locationSearch.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Enter"
            ) {

                performSearch();

            }

        }
    );

}


/* =====================================================
   INITIALIZE
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadUser();

        updateResults();

    }
);
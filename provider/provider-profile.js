/* =====================================================
   KAMSETU PROVIDER PROFILE
===================================================== */


/* =====================================================
   TOAST
===================================================== */

let toastTimer = null;


function showToast(message) {

    const toast =
        document.getElementById("toast");


    if (!toast) {
        return;
    }


    toast.textContent =
        String(message || "");


    toast.classList.add("show");


    clearTimeout(toastTimer);


    toastTimer = setTimeout(
        function () {

            toast.classList.remove("show");

        },
        2500
    );

}


/* =====================================================
   GET LOGGED-IN PROVIDER
===================================================== */

function getLoggedInProvider() {

    /*
     * Provider registration stores the entered provider details
     * in "servioProvider".
     *
     * Use it FIRST so the actual provider name entered during
     * registration is displayed.
     *
     * Other storage keys are kept as fallbacks.
     */

    const storageKeys = [
        "servioProvider",
        "servioUser",
        "KAMSETUUser"
    ];


    for (const key of storageKeys) {

        let userData =
            localStorage.getItem(key);


        if (!userData) {

            userData =
                sessionStorage.getItem(key);

        }


        if (!userData) {

            continue;

        }


        try {

            const user =
                JSON.parse(userData);


            if (
                user &&
                (
                    user.role === "provider" ||
                    key === "KAMSETUUser"
                )
            ) {

                return user;

            }

        } catch (error) {

            console.warn(
                "Unable to read provider data from " +
                key +
                ":",
                error
            );

        }

    }


    return null;

}


/* =====================================================
   LOAD LOGGED-IN PROVIDER
===================================================== */

function loadLoggedInProvider() {

    const user =
        getLoggedInProvider();


    if (!user) {

        console.log(
            "No logged-in provider found."
        );

        return;

    }


    const name =
        String(
            user.name || "User"
        ).trim();


    const firstLetter =
        name
            .charAt(0)
            .toUpperCase();


    const service =
        String(
            user.service ||
            user.profession ||
            "Service Provider"
        ).trim();


    /* =================================================
       SIDEBAR
    ================================================= */

    const sidebarName =
        document.getElementById(
            "providerSidebarName"
        );


    const sidebarService =
        document.getElementById(
            "providerSidebarService"
        );


    const sidebarAvatar =
        document.getElementById(
            "providerSidebarAvatar"
        );


    /* =================================================
       TOP PROFILE
    ================================================= */

    const topUserName =
        document.getElementById(
            "topUserName"
        );


    const topUserAvatar =
        document.getElementById(
            "topUserAvatar"
        );


    /* =================================================
       LARGE PROFILE
    ================================================= */

    const largeAvatar =
        document.getElementById(
            "largeUserAvatar"
        );


    const displayName =
        document.getElementById(
            "displayName"
        );


    /* =================================================
       UPDATE SIDEBAR
    ================================================= */

    if (sidebarName) {

        sidebarName.textContent =
            name;

    }


    if (sidebarService) {

        sidebarService.textContent =
            service;

    }


    if (sidebarAvatar) {

        sidebarAvatar.textContent =
            firstLetter;

    }


    /* =================================================
       UPDATE TOP PROFILE
    ================================================= */

    if (topUserName) {

        topUserName.textContent =
            name;

    }


    if (topUserAvatar) {

        topUserAvatar.textContent =
            firstLetter;

    }


    /* =================================================
       UPDATE LARGE PROFILE
    ================================================= */

    if (largeAvatar) {

        largeAvatar.textContent =
            firstLetter;

    }


    if (displayName) {

        displayName.textContent =
            name;

    }

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
   AVAILABILITY
===================================================== */

function toggleAvailability() {

    const button =
        document.getElementById(
            "availability"
        );


    if (!button) {

        return;

    }


    const isOffline =
        button.classList.toggle(
            "offline"
        );


    if (isOffline) {

        button.innerHTML =
            "<i></i> Unavailable";


        showToast(
            "You are now unavailable"
        );

    } else {

        button.innerHTML =
            "<i></i> Available";


        showToast(
            "You are now available"
        );

    }

}


/* =====================================================
   SAVE PROFILE
===================================================== */

function saveProfile() {

    const nameInput =
        document.getElementById(
            "name"
        );


    const bioInput =
        document.getElementById(
            "bio"
        );


    const displayName =
        document.getElementById(
            "displayName"
        );


    if (
        !nameInput ||
        !bioInput
    ) {

        return;

    }


    const name =
        nameInput.value.trim();


    const bio =
        bioInput.value.trim();


    if (
        !name ||
        !bio
    ) {

        showToast(
            "Please complete your profile"
        );

        return;

    }


    /* =================================================
       COLLECT PROFILE
    ================================================== */

    const profileData = {

        name:
            name,


        phone:
            document
                .getElementById("phone")
                ?.value
                .trim() || "",


        email:
            document
                .getElementById("email")
                ?.value
                .trim() || "",


        profession:
            document
                .getElementById("profession")
                ?.value || "",


        city:
            document
                .getElementById("city")
                ?.value
                .trim() || "",


        serviceArea:
            document
                .getElementById("serviceArea")
                ?.value
                .trim() || "",


        bio:
            bio,


        experience:
            document
                .getElementById("experience")
                ?.value || "",


        hourlyRate:
            document
                .getElementById("hourlyRate")
                ?.value || ""

    };


    /* =================================================
       SAVE PROFILE DATA
    ================================================== */

    localStorage.setItem(
        "KAMSETUProviderProfile",
        JSON.stringify(
            profileData
        )
    );


    sessionStorage.setItem(
        "KAMSETUProviderProfile",
        JSON.stringify(
            profileData
        )
    );


    /* =================================================
       UPDATE LOGGED-IN KAMSETU USER
       So other pages immediately use the new name.
    ================================================== */

    updateKAMSETUUser(
        profileData
    );


    /* =================================================
       UPDATE PROVIDER ACCOUNT STORAGE
       Registration uses servioProvider.
    ================================================== */

    updateServioProvider(
        profileData
    );


    /* =================================================
       UPDATE CURRENT PAGE
    ================================================= */

    if (displayName) {

        displayName.textContent =
            name;

    }


    updateProfileIdentity(
        name
    );


    showToast(
        "Profile changes saved successfully"
    );

}


/* =====================================================
   UPDATE SERVIO PROVIDER
===================================================== */

function updateServioProvider(profileData) {

    const storageKeys = [
        "servioProvider",
        "servioUser"
    ];


    storageKeys.forEach(
        function (key) {

            let userData =
                localStorage.getItem(key);


            let storage =
                localStorage;


            if (!userData) {

                userData =
                    sessionStorage.getItem(key);


                storage =
                    sessionStorage;

            }


            if (!userData) {

                return;

            }


            try {

                const currentUser =
                    JSON.parse(userData);


                if (
                    currentUser &&
                    currentUser.role === "provider"
                ) {

                    const updatedUser = {

                        ...currentUser,


                        name:
                            profileData.name,


                        phone:
                            profileData.phone,


                        email:
                            profileData.email,


                        service:
                            profileData.profession,


                        profession:
                            profileData.profession,


                        city:
                            profileData.city,


                        location:
                            profileData.city,


                        serviceArea:
                            profileData.serviceArea,


                        bio:
                            profileData.bio,


                        experience:
                            profileData.experience,


                        hourlyRate:
                            profileData.hourlyRate

                    };


                    storage.setItem(
                        key,
                        JSON.stringify(
                            updatedUser
                        )
                    );

                }

            } catch (error) {

                console.error(
                    "Could not update " +
                    key +
                    ":",
                    error
                );

            }

        }
    );

}


/* =====================================================
   UPDATE KAMSETU USER
===================================================== */

function updateKAMSETUUser(
    profileData
) {

    let userData =
        localStorage.getItem(
            "KAMSETUUser"
        );


    let storageType =
        "local";


    if (!userData) {

        userData =
            sessionStorage.getItem(
                "KAMSETUUser"
            );


        storageType =
            "session";

    }


    let currentUser = {};


    if (userData) {

        try {

            currentUser =
                JSON.parse(
                    userData
                );

        } catch (error) {

            console.error(
                "Could not parse current user:",
                error
            );

        }

    }


    const updatedUser = {

        ...currentUser,


        name:
            profileData.name,


        phone:
            profileData.phone,


        email:
            profileData.email,


        profession:
            profileData.profession,


        service:
            profileData.profession,


        city:
            profileData.city,


        location:
            profileData.city,


        serviceArea:
            profileData.serviceArea,


        bio:
            profileData.bio,


        experience:
            profileData.experience,


        hourlyRate:
            profileData.hourlyRate

    };


    const serialized =
        JSON.stringify(
            updatedUser
        );


    if (
        storageType ===
        "session"
    ) {

        sessionStorage.setItem(
            "KAMSETUUser",
            serialized
        );

    } else {

        localStorage.setItem(
            "KAMSETUUser",
            serialized
        );

    }

}


/* =====================================================
   UPDATE PAGE IDENTITY
===================================================== */

function updateProfileIdentity(
    name
) {

    const cleanName =
        String(
            name || "User"
        ).trim();


    const firstLetter =
        cleanName
            .charAt(0)
            .toUpperCase();


    const sidebarName =
        document.getElementById(
            "providerSidebarName"
        );


    const sidebarService =
        document.getElementById(
            "providerSidebarService"
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


    const largeAvatar =
        document.getElementById(
            "largeUserAvatar"
        );


    const displayName =
        document.getElementById(
            "displayName"
        );


    if (sidebarName) {

        sidebarName.textContent =
            cleanName;

    }


    if (sidebarService) {

        const provider =
            getLoggedInProvider();


        sidebarService.textContent =
            provider?.service ||
            provider?.profession ||
            "Service Provider";

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


    if (largeAvatar) {

        largeAvatar.textContent =
            firstLetter;

    }


    if (displayName) {

        displayName.textContent =
            cleanName;

    }

}


/* =====================================================
   LOAD SAVED PROFILE
===================================================== */

function loadProfile() {

    let savedProfile =
        localStorage.getItem(
            "KAMSETUProviderProfile"
        );


    if (!savedProfile) {

        savedProfile =
            sessionStorage.getItem(
                "KAMSETUProviderProfile"
            );

    }


    const loggedInUser =
        getLoggedInProvider();


    let profile = {};


    if (savedProfile) {

        try {

            profile =
                JSON.parse(
                    savedProfile
                );

        } catch (error) {

            console.error(
                "Unable to parse saved profile:",
                error
            );

        }

    }


    /*
     * Logged-in account data gets priority
     * for name, phone, email and service.
     */

    if (loggedInUser) {

        profile = {

            ...profile,


            name:
                loggedInUser.name ||
                profile.name ||
                "",


            phone:
                loggedInUser.phone ??
                profile.phone ??
                "",


            email:
                loggedInUser.email ??
                profile.email ??
                "",


            profession:
                loggedInUser.profession ||
                loggedInUser.service ||
                profile.profession ||
                "",


            city:
                loggedInUser.city ||
                loggedInUser.location ||
                profile.city ||
                "",


            serviceArea:
                loggedInUser.serviceArea ||
                profile.serviceArea ||
                "",


            bio:
                loggedInUser.bio ||
                profile.bio ||
                "",


            experience:
                loggedInUser.experience ??
                profile.experience ??
                "",


            hourlyRate:
                loggedInUser.hourlyRate ??
                profile.hourlyRate ??
                ""

        };

    }


    /* =================================================
       NAME
    ================================================== */

    const nameInput =
        document.getElementById(
            "name"
        );


    const displayName =
        document.getElementById(
            "displayName"
        );


    if (profile.name) {

        if (nameInput) {

            nameInput.value =
                profile.name;

        }


        if (displayName) {

            displayName.textContent =
                profile.name;

        }

    }


    /* =================================================
       OTHER FIELDS
    ================================================== */

    const fields = {

        phone:
            "phone",


        email:
            "email",


        profession:
            "profession",


        city:
            "city",


        serviceArea:
            "serviceArea",


        bio:
            "bio",


        experience:
            "experience",


        hourlyRate:
            "hourlyRate"

    };


    Object.keys(fields).forEach(
        function (key) {

            const element =
                document.getElementById(
                    fields[key]
                );


            if (
                element &&
                profile[key] !==
                undefined &&
                profile[key] !==
                null &&
                profile[key] !== ""
            ) {

                element.value =
                    profile[key];

            }

        }
    );


    /* =================================================
       UPDATE IDENTITY
    ================================================== */

    if (profile.name) {

        updateProfileIdentity(
            profile.name
        );

    }

}


/* =====================================================
   CHANGE PHOTO
===================================================== */

function changePhoto() {

    showToast(
        "Photo upload will be connected later"
    );

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


    /* =================================================
       CLEAR KAMSETU AUTH DATA
    ================================================== */

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


    localStorage.removeItem(
        "KAMSETUProviderProfile"
    );


    localStorage.removeItem(
        "servioProvider"
    );


    localStorage.removeItem(
        "servioUser"
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


    sessionStorage.removeItem(
        "KAMSETUProviderProfile"
    );


    sessionStorage.removeItem(
        "servioProvider"
    );


    sessionStorage.removeItem(
        "servioUser"
    );


    showToast(
        "Logged out successfully"
    );


    setTimeout(
        function () {

            window.location.href =
                "../login.html";

        },
        600
    );

}


/* =====================================================
   PROVIDER PROFILE MAP
===================================================== */

async function loadProviderProfileMap() {

    const mapElement =
        document.getElementById(
            "providerProfileMap"
        );


    if (
        !mapElement ||
        typeof L === "undefined"
    ) {

        return;

    }


    let latitude =
        28.4370;


    let longitude =
        77.0500;


    let locationName =
        "Sector 45, Gurgaon";


    try {

        const token =
            localStorage.getItem(
                "KAMSETUToken"
            ) ||
            sessionStorage.getItem(
                "KAMSETUToken"
            );


        if (token) {

            const response =
                await fetch(
                    `${window.KAMSETU_API_URL}/api/bookings/provider`,
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


            if (response.ok) {

                const data =
                    await response.json();


                const bookings =
                    Array.isArray(
                        data.bookings
                    )
                        ? data.bookings
                        : [];


                const booking =
                    bookings[0];


                if (booking) {

                    locationName =
                        booking.location ||
                        locationName;


                    const bookingLat =
                        Number(
                            booking
                                .locationCoordinates
                                ?.latitude
                        );


                    const bookingLng =
                        Number(
                            booking
                                .locationCoordinates
                                ?.longitude
                        );


                    if (
                        Number.isFinite(
                            bookingLat
                        )
                    ) {

                        latitude =
                            bookingLat;

                    }


                    if (
                        Number.isFinite(
                            bookingLng
                        )
                    ) {

                        longitude =
                            bookingLng;

                    }

                }

            }

        }

    } catch (error) {

        console.warn(
            "Could not load provider map location:",
            error
        );

    }


    const locationText =
        document.getElementById(
            "profileMapLocation"
        );


    if (locationText) {

        locationText.textContent =
            locationName;

    }


    /*
     * Avoid creating duplicate maps
     * if this function is called again.
     */

    if (
        mapElement._leaflet_id
    ) {

        return;

    }


    const map =
        L.map(
            mapElement
        ).setView(
            [
                latitude,
                longitude
            ],
            15
        );


    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            maxZoom: 19,

            attribution:
                "&copy; OpenStreetMap contributors"
        }
    ).addTo(
        map
    );


    L.marker(
        [
            latitude,
            longitude
        ]
    )
    .addTo(
        map
    )
    .bindPopup(
        locationName
    )
    .openPopup();

}


/* =====================================================
   PAGE LOAD
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadLoggedInProvider();

        loadProfile();

        loadProviderProfileMap();

    }
);


/* =====================================================
   ESCAPE KEY
===================================================== */

document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Escape"
        ) {

            const sidebar =
                document.querySelector(
                    ".sidebar"
                );


            const overlay =
                document.getElementById(
                    "overlay"
                );


            if (
                sidebar &&
                sidebar.classList.contains(
                    "open"
                )
            ) {

                sidebar.classList.remove(
                    "open"
                );

            }


            if (overlay) {

                overlay.classList.remove(
                    "show"
                );

            }

        }

    }
);
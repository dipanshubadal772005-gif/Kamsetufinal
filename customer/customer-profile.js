/* =====================================================
   KAMSETU - CUSTOMER PROFILE
===================================================== */


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
        document.getElementById("toast");

    if (!toast) {
        return;
    }

    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(function () {
        toast.classList.remove("show");
    }, 2500);
}


/* =====================================================
   LOAD LOGGED-IN USER
===================================================== */

function loadUserProfile() {

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

        const name =
            document.getElementById("fullName");

        const email =
            document.getElementById("email");

        const phone =
            document.getElementById("phone");

        const city =
            document.getElementById("city");

        const displayName =
            document.getElementById("displayName");

        const topUserName =
            document.getElementById("topUserName");

        const topUserAvatar =
            document.getElementById("topUserAvatar");

        const largeUserAvatar =
            document.getElementById("largeUserAvatar");


        /* =========================================
           NAME
        ========================================= */

        if (name && user.name) {
            name.value = user.name;
        }


        /* =========================================
           EMAIL
        ========================================= */

        if (email && user.email) {
            email.value = user.email;
        }


        /* =========================================
           PHONE
        ========================================= */

        if (phone && user.phone) {
            phone.value = user.phone;
        }


        /* =========================================
           CITY
        ========================================= */

        if (city && user.city) {
            city.value = user.city;
        }


        /* =========================================
           MAIN DISPLAY NAME
        ========================================= */

        if (displayName) {
            displayName.textContent =
                user.name || "User";
        }


        /* =========================================
           TOP-RIGHT USER NAME
        ========================================= */

        if (topUserName) {
            topUserName.textContent =
                user.name || "User";
        }


        /* =========================================
           USER AVATARS
           Get first letter of customer's name
        ========================================= */

        const firstLetter =
            (user.name || "User")
                .trim()
                .charAt(0)
                .toUpperCase();


        /* TOP-RIGHT AVATAR */

        if (topUserAvatar) {
            topUserAvatar.textContent =
                firstLetter;
        }


        /* LARGE PROFILE AVATAR */

        if (largeUserAvatar) {
            largeUserAvatar.textContent =
                firstLetter;
        }


        console.log(
            "Customer profile loaded:",
            user.name
        );

    } catch (error) {

        console.error(
            "Invalid KAMSETU user data:",
            error
        );

    }
}


/* =====================================================
   EDIT PROFILE
===================================================== */

function enableEditing() {

    const fields =
        document.querySelectorAll(
            ".form-group input, .form-group select, .form-group textarea"
        );

    const saveArea =
        document.getElementById("saveArea");

    fields.forEach(function (field) {

        field.disabled = false;
        field.classList.add("editing");

    });

    if (saveArea) {
        saveArea.classList.add("show");
    }

    showToast(
        "You can now edit your profile"
    );
}


/* =====================================================
   SAVE PROFILE
===================================================== */

function saveProfile() {

    const name =
        document.getElementById("fullName");

    const email =
        document.getElementById("email");

    const phone =
        document.getElementById("phone");

    const city =
        document.getElementById("city");


    /* =========================================
       CHECK FIELDS
    ========================================= */

    if (!name || !email || !phone || !city) {

        showToast(
            "Profile fields not found"
        );

        return;
    }


    /* =========================================
       VALIDATE NAME
    ========================================= */

    if (!name.value.trim()) {

        showToast(
            "Please enter your name"
        );

        name.focus();

        return;
    }


    /* =========================================
       VALIDATE EMAIL
    ========================================= */

    if (!email.value.trim()) {

        showToast(
            "Please enter your email"
        );

        email.focus();

        return;
    }


    /* =========================================
       VALIDATE PHONE
    ========================================= */

    if (!phone.value.trim()) {

        showToast(
            "Please enter your phone number"
        );

        phone.focus();

        return;
    }


    /* =========================================
       VALIDATE CITY
    ========================================= */

    if (!city.value.trim()) {

        showToast(
            "Please enter your city"
        );

        city.focus();

        return;
    }


    /* =========================================
       GET CURRENT USER
    ========================================= */

    let userData =
        localStorage.getItem("KAMSETUUser");

    if (!userData) {
        userData =
            sessionStorage.getItem("KAMSETUUser");
    }


    let user = {};


    if (userData) {

        try {

            user =
                JSON.parse(userData);

        } catch (error) {

            console.error(
                "Could not read current user:",
                error
            );

        }

    }


    /* =========================================
       UPDATE USER DATA
    ========================================= */

    user.name =
        name.value.trim();

    user.email =
        email.value.trim();

    user.phone =
        phone.value.trim();

    user.city =
        city.value.trim();


    /* =========================================
       SAVE UPDATED USER
    ========================================= */

    localStorage.setItem(
        "KAMSETUUser",
        JSON.stringify(user)
    );


    /* =========================================
       UPDATE MAIN DISPLAY NAME
    ========================================= */

    const displayName =
        document.getElementById("displayName");

    if (displayName) {

        displayName.textContent =
            user.name;

    }


    /* =========================================
       UPDATE TOP-RIGHT USER NAME
    ========================================= */

    const topUserName =
        document.getElementById("topUserName");

    if (topUserName) {

        topUserName.textContent =
            user.name;

    }


    /* =========================================
       UPDATE BOTH USER AVATARS
    ========================================= */

    const firstLetter =
        (user.name || "User")
            .trim()
            .charAt(0)
            .toUpperCase();


    const topUserAvatar =
        document.getElementById("topUserAvatar");

    const largeUserAvatar =
        document.getElementById("largeUserAvatar");


    if (topUserAvatar) {
        topUserAvatar.textContent =
            firstLetter;
    }


    if (largeUserAvatar) {
        largeUserAvatar.textContent =
            firstLetter;
    }


    /* =========================================
       DISABLE FIELDS
    ========================================= */

    const fields =
        document.querySelectorAll(
            ".form-group input, .form-group select, .form-group textarea"
        );

    fields.forEach(function (field) {

        field.disabled = true;
        field.classList.remove("editing");

    });


    /* =========================================
       HIDE SAVE AREA
    ========================================= */

    const saveArea =
        document.getElementById("saveArea");

    if (saveArea) {

        saveArea.classList.remove("show");

    }


    showToast(
        "Profile updated successfully"
    );
}


/* =====================================================
   ADD ADDRESS
===================================================== */

function addAddress() {

    const address =
        prompt(
            "Enter your new address:"
        );

    if (!address || !address.trim()) {
        return;
    }

    showToast(
        "Address added successfully"
    );
}


/* =====================================================
   EDIT ADDRESS
===================================================== */

function editAddress(type) {

    const newAddress =
        prompt(
            "Enter new " +
            type +
            " address:"
        );

    if (!newAddress || !newAddress.trim()) {
        return;
    }

    showToast(
        type +
        " address updated successfully"
    );
}


/* =====================================================
   PREFERENCES
===================================================== */

function updatePreference() {

    showToast(
        "Preference updated"
    );
}


/* =====================================================
   PASSWORD
===================================================== */

function changePassword() {

    showToast(
        "Password change screen coming soon"
    );
}


/* =====================================================
   LOGIN ACTIVITY
===================================================== */

function manageDevices() {

    showToast(
        "Login activity coming soon"
    );
}


/* =====================================================
   DELETE ACCOUNT
===================================================== */

function deleteAccount() {

    const confirmation =
        confirm(
            "Are you sure you want to delete your KAMSETU account?"
        );

    if (!confirmation) {
        return;
    }


    const secondConfirmation =
        confirm(
            "This action cannot be undone. Continue?"
        );

    if (!secondConfirmation) {
        return;
    }


    localStorage.removeItem(
        "KAMSETUUser"
    );

    sessionStorage.removeItem(
        "KAMSETUUser"
    );


    showToast(
        "Account deletion request submitted"
    );
}


/* =====================================================
   NOTIFICATIONS
===================================================== */

function showNotifications() {

    showToast(
        "You have 3 new notifications"
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
        "Settings will be available soon"
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
        "KAMSETUUser"
    );

    sessionStorage.removeItem(
        "KAMSETUUser"
    );


    window.location.href =
        "../login.html";
}


/* =====================================================
   PAGE LOAD
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        /* Load actual logged-in user */

        loadUserProfile();


        /* Keep fields locked initially */

        const fields =
            document.querySelectorAll(
                ".form-group input, .form-group select, .form-group textarea"
            );

        fields.forEach(function (field) {

            field.disabled = true;

        });

    }
);
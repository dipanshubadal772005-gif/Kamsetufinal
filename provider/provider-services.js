/* =====================================================
   KAMSETU PROVIDER SERVICES
   Dynamic Logged-In Provider Profile
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


        /* TOP RIGHT PROFILE */

        const topUserName =
            document.getElementById("topUserName");

        const topUserAvatar =
            document.getElementById("topUserAvatar");


        /* SIDEBAR PROFILE */

        const providerSidebarName =
            document.getElementById(
                "providerSidebarName"
            );

        const providerSidebarAvatar =
            document.getElementById(
                "providerSidebarAvatar"
            );


        if (topUserName) {

            topUserName.textContent =
                cleanName;

        }


        if (topUserAvatar) {

            topUserAvatar.textContent =
                firstLetter;

        }


        if (providerSidebarName) {

            providerSidebarName.textContent =
                cleanName;

        }


        if (providerSidebarAvatar) {

            providerSidebarAvatar.textContent =
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
        document.getElementById("toast");

    if (!toast) {
        return;
    }

    toast.textContent =
        message;

    toast.classList.add("show");

    setTimeout(function () {

        toast.classList.remove("show");

    }, 2500);

}



/* =====================================================
   SIDEBAR
===================================================== */

function toggleSidebar() {

    const sidebar =
        document.querySelector(".sidebar");

    const overlay =
        document.getElementById("overlay");

    if (!sidebar || !overlay) {
        return;
    }

    sidebar.classList.toggle("open");

    overlay.classList.toggle("show");

}



/* =====================================================
   SERVICE MODAL
===================================================== */

function openServiceForm() {

    const modal =
        document.getElementById("serviceModal");

    if (!modal) {
        return;
    }

    modal.classList.add("show");

}



/* =====================================================
   CLOSE SERVICE MODAL
===================================================== */

function closeServiceForm() {

    const modal =
        document.getElementById("serviceModal");

    if (!modal) {
        return;
    }

    modal.classList.remove("show");

}



/* =====================================================
   CREATE SERVICE
===================================================== */

function createService() {

    const nameInput =
        document.getElementById("serviceName");

    const priceInput =
        document.getElementById("servicePrice");

    const descriptionInput =
        document.getElementById(
            "serviceDescription"
        );


    if (
        !nameInput ||
        !priceInput ||
        !descriptionInput
    ) {
        return;
    }


    const name =
        nameInput.value.trim();

    const price =
        priceInput.value.trim();

    const description =
        descriptionInput.value.trim();


    if (
        !name ||
        !price ||
        !description
    ) {

        showToast(
            "Please complete all fields"
        );

        return;
    }


    const serviceGrid =
        document.getElementById(
            "serviceGrid"
        );

    const emptyState =
        document.getElementById(
            "emptyState"
        );


    if (!serviceGrid) {
        return;
    }


    const card =
        document.createElement(
            "article"
        );


    card.className =
        "service-card";


    /*
        Escape user-entered values before
        placing them inside HTML.
    */

    const safeName =
        escapeHTML(name);

    const safePrice =
        escapeHTML(price);

    const safeDescription =
        escapeHTML(description);


    card.innerHTML = `

        <div class="service-icon">
            ⚒
        </div>


        <div class="service-top">

            <div>

                <span>
                    ACTIVE SERVICE
                </span>

                <h3>
                    ${safeName}
                </h3>

            </div>


            <button
                type="button"
                onclick="toggleService(this)"
            >
                ● Active
            </button>

        </div>


        <p>
            ${safeDescription}
        </p>


        <div class="service-meta">

            <span>
                ★ New
            </span>

            <span>
                0 Jobs
            </span>

            <span>
                ₹${safePrice} starting
            </span>

        </div>


        <div class="service-footer">

            <span>
                Created just now
            </span>


            <div>

                <button
                    type="button"
                    onclick="editService()"
                >
                    Edit
                </button>


                <button
                    type="button"
                    onclick="deleteService(this)"
                >
                    Delete
                </button>

            </div>

        </div>

    `;


    serviceGrid.appendChild(card);


    if (emptyState) {

        emptyState.style.display =
            "none";

    }


    nameInput.value = "";

    priceInput.value = "";

    descriptionInput.value = "";


    closeServiceForm();


    showToast(
        "Service created successfully"
    );

}



/* =====================================================
   ACTIVATE / DEACTIVATE SERVICE
===================================================== */

function toggleService(button) {

    if (!button) {
        return;
    }


    button.classList.toggle(
        "inactive"
    );


    if (
        button.classList.contains(
            "inactive"
        )
    ) {

        button.textContent =
            "○ Inactive";


        showToast(
            "Service disabled"
        );

    } else {

        button.textContent =
            "● Active";


        showToast(
            "Service activated"
        );

    }

}



/* =====================================================
   EDIT SERVICE
===================================================== */

function editService() {

    showToast(
        "Edit service panel coming next"
    );

}



/* =====================================================
   DELETE SERVICE
===================================================== */

function deleteService(button) {

    if (!button) {
        return;
    }


    const confirmation =
        confirm(
            "Delete this service?"
        );


    if (!confirmation) {
        return;
    }


    const card =
        button.closest(
            ".service-card"
        );


    if (!card) {
        return;
    }


    card.remove();


    const cards =
        document.querySelectorAll(
            ".service-card"
        );


    if (cards.length === 0) {

        const emptyState =
            document.getElementById(
                "emptyState"
            );


        if (emptyState) {

            emptyState.style.display =
                "block";

        }

    }


    showToast(
        "Service deleted"
    );

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

function logoutProvider() {

    const confirmation =
        confirm(
            "Are you sure you want to logout?"
        );


    if (!confirmation) {
        return;
    }


    /*
        Clear all KAMSETU authentication
        and profile data.
    */

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


    setTimeout(function () {

        /*
            Current page:
            provider/provider-services.html

            Login page:
            login.html

            Therefore:
            ../login.html
        */

        window.location.href =
            "../login.html";

    }, 700);

}



/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent =
        text;

    return div.innerHTML;

}



/* =====================================================
   MODAL BACKGROUND CLICK
===================================================== */

document.addEventListener(
    "click",
    function (event) {

        const modal =
            document.getElementById(
                "serviceModal"
            );


        if (!modal) {
            return;
        }


        if (
            event.target === modal
        ) {

            closeServiceForm();

        }

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

            closeServiceForm();

        }

    }
);



/* =====================================================
   PAGE INITIALIZATION
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadLoggedInProvider();

    }
);
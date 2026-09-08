/* =========================================================
   KAMSETU - MAIN JAVASCRIPT
========================================================= */


/* =========================================================
   TOAST
========================================================= */

function showMessage(message) {

    const toast = document.getElementById("toast");

    if (!toast) {
        return;
    }

    toast.innerText = message;

    toast.style.display = "block";

    clearTimeout(window.toastTimer);

    window.toastTimer = setTimeout(function () {

        toast.style.display = "none";

    }, 2500);
}


/* =========================================================
   SEARCH PROFESSIONAL
========================================================= */

function findProfessional() {

    const serviceInput =
        document.getElementById("service");

    const locationInput =
        document.getElementById("location");


    if (!serviceInput || !locationInput) {
        return;
    }


    const service =
        serviceInput.value.trim();

    const location =
        locationInput.value.trim();


    if (service === "") {

        showMessage(
            "Please enter the service you need."
        );

        serviceInput.focus();

        return;
    }


    if (location === "") {

        showMessage(
            "Please enter your location."
        );

        locationInput.focus();

        return;
    }


    /*
       Save search information so the
       customer page can use it later.
    */

    localStorage.setItem(
        "KAMSETUSearchService",
        service
    );

    localStorage.setItem(
        "KAMSETUSearchLocation",
        location
    );


    showMessage(
        "Finding professionals near you..."
    );


    setTimeout(function () {

        window.location.href =
            "service.html";

    }, 500);

}


/* =========================================================
   CHOOSE SERVICE
========================================================= */

function chooseService(service) {

    localStorage.setItem(
        "KAMSETUSearchService",
        service
    );


    const location =
        document.getElementById("location");


    if (location && location.value.trim() !== "") {

        localStorage.setItem(
            "KAMSETUSearchLocation",
            location.value.trim()
        );

    }


    window.location.href =
        "service.html";

}


/* =========================================================
   REQUEST CALL
========================================================= */

function requestCall() {
    window.location.href = "tel:+919876543210";
}


/* =========================================================
   SIGN IN
========================================================= */

function signIn() {

    window.location.href =
        "login.html";

}


/* =========================================================
   START NEGOTIATION
========================================================= */

function startNegotiation() {

    window.location.href =
        "service.html";

}


/* =========================================================
   BECOME A PROVIDER
========================================================= */

function becomeProvider() {

    localStorage.setItem(
        "KAMSETUUserType",
        "provider"
    );


    window.location.href =
        "provider/provider-profile.html";

}


/* =========================================================
   FINAL CTA
========================================================= */

function goToSearch() {

    const home =
        document.getElementById("home");


    if (home) {

        home.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }


    setTimeout(function () {

        const serviceInput =
            document.getElementById("service");


        if (serviceInput) {

            serviceInput.focus();

        }

    }, 700);

}


/* =========================================================
   NAVBAR ACTIVE STATE
========================================================= */

const sections =
    document.querySelectorAll("section[id]");

const navLinks =
    document.querySelectorAll(".nav-menu a");


function updateActiveNavigation() {

    let currentSection = "";


    sections.forEach(function (section) {

        const sectionTop =
            section.offsetTop - 180;

        const sectionHeight =
            section.offsetHeight;


        if (
            window.scrollY >= sectionTop &&
            window.scrollY <
            sectionTop + sectionHeight
        ) {

            currentSection =
                section.getAttribute("id");

        }

    });


    navLinks.forEach(function (link) {

        link.classList.remove("active");


        const href =
            link.getAttribute("href");


        if (
            href === "#" + currentSection
        ) {

            link.classList.add("active");

        }

    });

}


window.addEventListener(
    "scroll",
    updateActiveNavigation
);


/* =========================================================
   NAVIGATION CLICK
========================================================= */

navLinks.forEach(function (link) {

    link.addEventListener(
        "click",
        function (event) {

            const targetId =
                this.getAttribute("href");


            /*
               Allow real pages such as:
               service.html
               provider/provider-profile.html
            */

            if (
                !targetId ||
                targetId === "#" ||
                !targetId.startsWith("#")
            ) {

                return;

            }


            const target =
                document.querySelector(targetId);


            if (!target) {
                return;
            }


            event.preventDefault();


            target.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });


            navLinks.forEach(function (item) {

                item.classList.remove("active");

            });


            this.classList.add("active");

        }
    );

});


/* =========================================================
   CHAT DEMO
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const chatInput =
            document.querySelector(
                ".chat-box input"
            );


        const chatButton =
            document.querySelector(
                ".chat-box button"
            );


        const messages =
            document.querySelector(
                ".messages"
            );


        if (
            !chatInput ||
            !chatButton ||
            !messages
        ) {

            return;

        }


        function sendMessage() {

            const text =
                chatInput.value.trim();


            if (text === "") {
                return;
            }


            const message =
                document.createElement("div");


            message.className =
                "message customer";


            message.innerText =
                text;


            messages.appendChild(
                message
            );


            chatInput.value = "";


            messages.scrollTop =
                messages.scrollHeight;


            showMessage(
                "Message sent."
            );

        }


        chatButton.addEventListener(
            "click",
            sendMessage
        );


        chatInput.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key === "Enter"
                ) {

                    event.preventDefault();

                    sendMessage();

                }

            }
        );

    }
);


/* =========================================================
   SEARCH ENTER KEY
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const serviceInput =
            document.getElementById("service");


        const locationInput =
            document.getElementById("location");


        if (serviceInput) {

            serviceInput.addEventListener(
                "keydown",
                function (event) {

                    if (
                        event.key === "Enter"
                    ) {

                        findProfessional();

                    }

                }
            );

        }


        if (locationInput) {

            locationInput.addEventListener(
                "keydown",
                function (event) {

                    if (
                        event.key === "Enter"
                    ) {

                        findProfessional();

                    }

                }
            );

        }

    }
);


/* =========================================================
   LOAD SAVED SEARCH
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const serviceInput =
            document.getElementById("service");

        const locationInput =
            document.getElementById("location");


        const savedService =
            localStorage.getItem(
                "KAMSETUSearchService"
            );

        const savedLocation =
            localStorage.getItem(
                "KAMSETUSearchLocation"
            );


        if (
            serviceInput &&
            savedService
        ) {

            serviceInput.value =
                savedService;

        }


        if (
            locationInput &&
            savedLocation
        ) {

            locationInput.value =
                savedLocation;

        }


        updateActiveNavigation();

    }
);


/* =========================================================
   SEARCH INPUT FOCUS
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const inputs =
            document.querySelectorAll(
                ".search-container input"
            );


        inputs.forEach(function (input) {

            input.addEventListener(
                "focus",
                function () {

                    this.parentElement
                        .parentElement
                        .classList.add("focused");

                }
            );


            input.addEventListener(
                "blur",
                function () {

                    this.parentElement
                        .parentElement
                        .classList.remove("focused");

                }
            );

        });

    }
);


/* =========================================================
   PREVENT EMPTY FOOTER LINKS
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const emptyLinks =
            document.querySelectorAll(
                'a[href="#"]'
            );


        emptyLinks.forEach(function (link) {

            link.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();

                    showMessage(
                        "This feature will be available soon."
                    );

                }
            );

        });

    }
);


/* =========================================================
   BUTTON HOVER
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const buttons =
            document.querySelectorAll(
                "button"
            );


        buttons.forEach(function (button) {

            button.addEventListener(
                "mouseenter",
                function () {

                    this.style.transition =
                        "transform 0.2s ease";

                }
            );

        });

    }
);


/* =========================================================
   ESCAPE KEY
========================================================= */

document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Escape"
        ) {

            const toast =
                document.getElementById(
                    "toast"
                );


            if (toast) {

                toast.style.display =
                    "none";

            }

        }

    }
);
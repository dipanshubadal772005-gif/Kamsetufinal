let currentUserType = "customer";

const API_BASE_URL = window.KAMSETU_API_URL;


/* =====================================================
   SELECT USER TYPE
===================================================== */

function selectUserType(type) {

    currentUserType = type;

    const customerBtn =
        document.getElementById("customerBtn");

    const providerBtn =
        document.getElementById("providerBtn");

    if (customerBtn) {
        customerBtn.classList.remove("active");
    }

    if (providerBtn) {
        providerBtn.classList.remove("active");
    }

    if (type === "customer") {

        if (customerBtn) {
            customerBtn.classList.add("active");
        }

    } else {

        if (providerBtn) {
            providerBtn.classList.add("active");
        }
    }
}


/* =====================================================
   SHOW LOGIN
===================================================== */

function showLogin() {

    const loginForm =
        document.getElementById("loginForm");

    const signupForm =
        document.getElementById("signupForm");

    const loginTab =
        document.getElementById("loginTab");

    const signupTab =
        document.getElementById("signupTab");

    if (loginForm) {
        loginForm.classList.add("active");
    }

    if (signupForm) {
        signupForm.classList.remove("active");
    }

    if (loginTab) {
        loginTab.classList.add("active");
    }

    if (signupTab) {
        signupTab.classList.remove("active");
    }

    clearErrors();
}


/* =====================================================
   SHOW SIGNUP
===================================================== */

function showSignup() {

    const loginForm =
        document.getElementById("loginForm");

    const signupForm =
        document.getElementById("signupForm");

    const loginTab =
        document.getElementById("loginTab");

    const signupTab =
        document.getElementById("signupTab");

    if (loginForm) {
        loginForm.classList.remove("active");
    }

    if (signupForm) {
        signupForm.classList.add("active");
    }

    if (loginTab) {
        loginTab.classList.remove("active");
    }

    if (signupTab) {
        signupTab.classList.add("active");
    }

    clearErrors();
}


/* =====================================================
   PASSWORD TOGGLE
===================================================== */

function togglePassword(inputId, button) {

    const input =
        document.getElementById(inputId);

    if (!input) {
        return;
    }

    if (input.type === "password") {

        input.type = "text";

        button.textContent = "Hide";

    } else {

        input.type = "password";

        button.textContent = "Show";
    }
}


/* =====================================================
   LOGIN
===================================================== */

async function loginUser() {

    clearErrors();

    const emailInput =
        document.getElementById("loginEmail");

    const passwordInput =
        document.getElementById("loginPassword");

    const email =
        emailInput.value.trim();

    const password =
        passwordInput.value;

    let valid = true;


    /* EMAIL */

    if (!email) {

        showError(
            "loginEmailError",
            "Email is required."
        );

        valid = false;

    } else if (!validateEmail(email)) {

        showError(
            "loginEmailError",
            "Enter a valid email address."
        );

        valid = false;
    }


    /* PASSWORD */

    if (!password) {

        showError(
            "loginPasswordError",
            "Password is required."
        );

        valid = false;
    }


    if (!valid) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/api/auth/login`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        email,
                        password,
                        role: currentUserType
                    })
                }
            );


        const data =
            await response.json();


        if (!response.ok || !data.success) {

            showError(
                "loginEmailError",
                data.message ||
                "Login failed."
            );

            return;
        }


        /* =================================================
           SAVE AUTHENTICATION DATA
        ================================================= */

        localStorage.setItem(
            "KAMSETUToken",
            data.token
        );

        localStorage.setItem(
            "KAMSETUUser",
            JSON.stringify(data.user)
        );


        if (data.user.role === "customer") {

            localStorage.setItem(
                "KAMSETUCustomer",
                JSON.stringify(data.user)
            );

        }


        if (data.user.role === "provider") {

            localStorage.setItem(
                "KAMSETUProvider",
                JSON.stringify(data.user)
            );

            if (data.profile) {

                localStorage.setItem(
                    "KAMSETUProviderProfile",
                    JSON.stringify(data.profile)
                );
            }
        }


        showToast(
            "Login successful!"
        );


        setTimeout(() => {

            if (data.user.role === "customer") {

                window.location.href =
                    "./customer/customer-dashboard.html";

            } else {

                window.location.href =
                    "./provider/provider-dashboard.html";
            }

        }, 700);


    } catch (error) {

        console.error(
            "Login error:",
            error
        );

        showError(
            "loginEmailError",
            "Cannot connect to KAMSETU backend. Make sure the server is running."
        );
    }
}


/* =====================================================
   SIGNUP
===================================================== */

async function signupUser() {

    clearErrors();

    const name =
        document
            .getElementById("signupName")
            .value
            .trim();

    const email =
        document
            .getElementById("signupEmail")
            .value
            .trim();

    const phone =
        document
            .getElementById("signupPhone")
            .value
            .trim();

    const password =
        document
            .getElementById("signupPassword")
            .value;

    const confirmPassword =
        document
            .getElementById("confirmPassword")
            .value;

    const terms =
        document
            .getElementById("terms")
            .checked;

    let valid = true;


    /* NAME */

    if (!name) {

        showError(
            "signupNameError",
            "Full name is required."
        );

        valid = false;
    }


    /* EMAIL */

    if (!email) {

        showError(
            "signupEmailError",
            "Email is required."
        );

        valid = false;

    } else if (!validateEmail(email)) {

        showError(
            "signupEmailError",
            "Enter a valid email address."
        );

        valid = false;
    }


    /* PHONE */

    if (!phone) {

        showError(
            "signupPhoneError",
            "Phone number is required."
        );

        valid = false;

    } else if (!/^[0-9]{10}$/.test(phone)) {

        showError(
            "signupPhoneError",
            "Enter a valid 10-digit phone number."
        );

        valid = false;
    }


    /* PASSWORD */

    if (!password) {

        showError(
            "signupPasswordError",
            "Password is required."
        );

        valid = false;

    } else if (password.length < 6) {

        showError(
            "signupPasswordError",
            "Password must contain at least 6 characters."
        );

        valid = false;
    }


    /* CONFIRM PASSWORD */

    if (!confirmPassword) {

        showError(
            "confirmPasswordError",
            "Please confirm your password."
        );

        valid = false;

    } else if (password !== confirmPassword) {

        showError(
            "confirmPasswordError",
            "Passwords do not match."
        );

        valid = false;
    }


    /* TERMS */

    if (!terms) {

        showError(
            "termsError",
            "Please accept the Terms & Conditions."
        );

        valid = false;
    }


    if (!valid) {
        return;
    }


    try {

        let endpoint = "";

        let body = {};


        /* =================================================
           CUSTOMER SIGNUP
        ================================================= */

        if (currentUserType === "customer") {

            endpoint =
                "/api/auth/customer/signup";

            body = {
                name,
                email,
                phone,
                password
            };

        }


        /* =================================================
           PROVIDER SIGNUP
        ================================================= */

        else {

            endpoint =
                "/api/auth/provider/signup";

            body = {
                name,
                email,
                phone,
                password,

                professionalType:
                    "Household Service Provider",

                experience: 0,

                city: "Gurgaon",

                serviceArea: "Gurgaon",

                bio:
                    "Professional household service provider",

                serviceName:
                    "Household Services",

                serviceType:
                    "Household",

                serviceDescription:
                    "Professional household services",

                price: 0
            };
        }


        const response =
            await fetch(
                `${API_BASE_URL}${endpoint}`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify(body)
                }
            );


        const data =
            await response.json();


        if (!response.ok || !data.success) {

            showError(
                "signupEmailError",
                data.message ||
                "Registration failed."
            );

            return;
        }


        /* =================================================
           SAVE AUTH DATA
        ================================================= */

        localStorage.setItem(
            "KAMSETUToken",
            data.token
        );

        localStorage.setItem(
            "KAMSETUUser",
            JSON.stringify(data.user)
        );


        if (data.user.role === "customer") {

            localStorage.setItem(
                "KAMSETUCustomer",
                JSON.stringify(data.user)
            );

        } else {

            localStorage.setItem(
                "KAMSETUProvider",
                JSON.stringify(data.user)
            );

            if (data.profile) {

                localStorage.setItem(
                    "KAMSETUProviderProfile",
                    JSON.stringify(data.profile)
                );
            }
        }


        showToast(
            "Account created successfully!"
        );


        setTimeout(() => {

            if (data.user.role === "customer") {

                window.location.href =
                    "./customer/customer-dashboard.html";

            } else {

                window.location.href =
                    "./provider/provider-dashboard.html";
            }

        }, 700);


    } catch (error) {

        console.error(
            "Signup error:",
            error
        );

        showError(
            "signupEmailError",
            "Cannot connect to KAMSETU backend. Make sure the server is running."
        );
    }
}


/* =====================================================
   DEMO LOGIN
===================================================== */

function demoLogin() {

    showToast(
        "Demo login is disabled. Please use your account."
    );
}


/* =====================================================
   LOGOUT
===================================================== */

function logout() {

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
        "KAMSETUProviderProfile"
    );

    window.location.href =
        "./login.html";
}


/* =====================================================
   EMAIL VALIDATION
===================================================== */

function validateEmail(email) {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        .test(email);
}


/* =====================================================
   SHOW ERROR
===================================================== */

function showError(
    elementId,
    message
) {

    const element =
        document.getElementById(
            elementId
        );

    if (!element) {
        return;
    }

    element.textContent =
        message;

    element.classList.add(
        "show"
    );
}


/* =====================================================
   CLEAR ERRORS
===================================================== */

function clearErrors() {

    const errors =
        document.querySelectorAll(
            ".error-message"
        );

    errors.forEach(
        (error) => {

            error.textContent = "";

            error.classList.remove(
                "show"
            );

        }
    );
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

    setTimeout(() => {

        toast.classList.remove(
            "show"
        );

    }, 2500);
}


/* =====================================================
   INITIALIZE
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        selectUserType(
            "customer"
        );

    }
);
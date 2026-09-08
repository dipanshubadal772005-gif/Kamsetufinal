/* =====================================================
   CURRENT STEP
===================================================== */

let currentStep = 1;


/* =====================================================
   STEP NAVIGATION
===================================================== */

function nextStep(step) {

    if (!validateStep(currentStep)) {

        return;

    }


    currentStep = step;

    updateSteps();

}


function previousStep(step) {

    currentStep = step;

    updateSteps();

}


/* =====================================================
   UPDATE UI
===================================================== */

function updateSteps() {

    document
        .querySelectorAll(".form-step")
        .forEach(function(step) {

            step.classList.remove("active");

        });


    document
        .getElementById("step" + currentStep)
        .classList.add("active");


    const progressSteps =
        document.querySelectorAll(
            ".progress-step"
        );


    progressSteps.forEach(function(step, index) {

        step.classList.remove("active");


        if (index < currentStep) {

            step.classList.add("active");

        }

    });


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* =====================================================
   VALIDATE STEP
===================================================== */

function validateStep(step) {

    if (step === 1) {

        const name =
            document.getElementById("fullName").value.trim();

        const email =
            document.getElementById("email").value.trim();

        const phone =
            document.getElementById("phone").value.trim();

        const password =
            document.getElementById("password").value;

        const confirmPassword =
            document.getElementById("confirmPassword").value;


        if (!name || !email || !phone ||
            !password || !confirmPassword) {

            showToast(
                "Please complete all fields"
            );

            return false;

        }


        if (password.length < 6) {

            showToast(
                "Password must contain at least 6 characters"
            );

            return false;

        }


        if (password !== confirmPassword) {

            showToast(
                "Passwords do not match"
            );

            return false;

        }

    }


    if (step === 2) {

        const type =
            document.getElementById(
                "professionalType"
            ).value;

        const experience =
            document.getElementById(
                "experience"
            ).value;

        const city =
            document.getElementById(
                "city"
            ).value.trim();

        const area =
            document.getElementById(
                "serviceArea"
            ).value.trim();

        const bio =
            document.getElementById(
                "bio"
            ).value.trim();


        if (
            !type ||
            !experience ||
            !city ||
            !area ||
            !bio
        ) {

            showToast(
                "Please complete all professional details"
            );

            return false;

        }

    }


    return true;

}


/* =====================================================
   SUBMIT
===================================================== */

function submitProvider(event) {

    event.preventDefault();


    if (!validateStep(3)) {

        return;

    }


    const serviceName =
        document.getElementById(
            "serviceName"
        ).value.trim();

    const price =
        document.getElementById(
            "price"
        ).value;

    const serviceType =
        document.getElementById(
            "serviceType"
        ).value;

    const description =
        document.getElementById(
            "serviceDescription"
        ).value.trim();

    const terms =
        document.getElementById(
            "terms"
        ).checked;


    if (
        !serviceName ||
        !price ||
        !serviceType ||
        !description
    ) {

        showToast(
            "Please complete your service details"
        );

        return;

    }


    if (!terms) {

        showToast(
            "Please accept the terms"
        );

        return;

    }


    document
        .getElementById("successModal")
        .classList.add("show");

}


/* =====================================================
   DASHBOARD
===================================================== */

function goToDashboard() {

    window.location.href =
        "provider-dashboard.html";

}


/* =====================================================
   TOAST
===================================================== */

function showToast(message) {

    const toast =
        document.getElementById("toast");


    toast.textContent =
        message;


    toast.classList.add("show");


    setTimeout(function() {

        toast.classList.remove("show");

    }, 2500);

}
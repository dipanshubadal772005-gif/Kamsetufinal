const WORK_STORAGE_KEY = "servioProviderWorkHistory";

let toastTimer = null;


/* =========================
   PAGE LOAD
========================= */

document.addEventListener("DOMContentLoaded", function () {

    setActiveNavigation();
    setDefaultDate();

    renderWorks();

    updateStats();

});


/* =========================
   ACTIVE SIDEBAR
========================= */

function setActiveNavigation() {

    const navItems = document.querySelectorAll(
        ".sidebar-nav .nav-item"
    );

    navItems.forEach(function (item) {
        item.classList.remove("active");
    });

    const currentPage = "provider-history.html";

    navItems.forEach(function (item) {

        const href = item.getAttribute("href");

        if (!href) return;

        const pageName = href
            .split("/")
            .pop()
            .split("?")[0]
            .split("#")[0]
            .toLowerCase();

        if (pageName === currentPage) {
            item.classList.add("active");
        }

    });
}


/* =========================
   LOCAL STORAGE
========================= */

function getWorks() {

    try {

        const data =
            JSON.parse(
                localStorage.getItem(WORK_STORAGE_KEY)
            );

        return Array.isArray(data) ? data : [];

    } catch (error) {

        return [];

    }

}


function saveWorks(works) {

    try {

        localStorage.setItem(
            WORK_STORAGE_KEY,
            JSON.stringify(works)
        );

        return true;

    } catch (error) {

        showToast(
            "Storage limit reached. Try smaller images."
        );

        return false;

    }

}


/* =========================
   PROVIDER NAME
========================= */

function getProviderName() {

    try {

        const profile =
            JSON.parse(
                localStorage.getItem(
                    "servioProviderProfile"
                )
            );

        return profile?.name || "Rahul Kumar";

    } catch (error) {

        return "Rahul Kumar";

    }

}


/* =========================
   MODAL
========================= */

function openWorkModal() {

    document
        .getElementById("workModal")
        .classList.add("show");

    document.body.style.overflow = "hidden";

    setDefaultDate();

}


function closeWorkModal() {

    document
        .getElementById("workModal")
        .classList.remove("show");

    document.body.style.overflow = "";

}


function handleModalClick(event) {

    if (
        event.target.id === "workModal"
    ) {

        closeWorkModal();

    }

}


/* =========================
   DEFAULT DATE
========================= */

function setDefaultDate() {

    const dateInput =
        document.getElementById("workDate");

    if (
        dateInput &&
        !dateInput.value
    ) {

        dateInput.value =
            new Date()
                .toISOString()
                .split("T")[0];

    }

}


/* =========================
   IMAGE PREVIEW
========================= */

function previewImage(
    input,
    previewId
) {

    const preview =
        document.getElementById(previewId);

    const uploadBox =
        input.closest(".upload-box");

    const inputBox =
        uploadBox?.querySelector(
            ".image-input"
        );


    if (
        !input.files ||
        !input.files[0]
    ) {

        preview.removeAttribute("src");

        preview.classList.remove("show");

        if (inputBox) {

            inputBox.style.display = "";

        }

        return;

    }


    const reader =
        new FileReader();


    reader.onload =
        function (event) {

            preview.src =
                event.target.result;

            preview.classList.add("show");

            if (inputBox) {

                inputBox.style.display =
                    "none";

            }

        };


    reader.readAsDataURL(
        input.files[0]
    );

}


/* =========================
   FILE TO BASE64
========================= */

function fileToBase64(file) {

    return new Promise(
        function (resolve, reject) {

            if (!file) {

                resolve("");

                return;

            }


            const reader =
                new FileReader();


            reader.onload =
                function () {

                    resolve(
                        reader.result
                    );

                };


            reader.onerror =
                reject;


            reader.readAsDataURL(file);

        }
    );

}


/* =========================
   SAVE WORK
========================= */

async function saveWork(event) {

    event.preventDefault();


    const title =
        document
            .getElementById("workTitle")
            .value
            .trim();


    const category =
        document
            .getElementById("workCategory")
            .value;


    const date =
        document
            .getElementById("workDate")
            .value;


    const location =
        document
            .getElementById("workLocation")
            .value
            .trim();


    const description =
        document
            .getElementById("workDescription")
            .value
            .trim();


    const price =
        Number(
            document
                .getElementById("workPrice")
                .value
        ) || 0;


    const rating =
        Number(
            document
                .getElementById("workRating")
                .value
        ) || 0;


    const beforeFile =
        document
            .getElementById("beforeImage")
            .files[0];


    const afterFile =
        document
            .getElementById("afterImage")
            .files[0];


    if (
        !title ||
        !category ||
        !date ||
        !description
    ) {

        showToast(
            "Please fill all required fields."
        );

        return;

    }


    const submitButton =
        document.querySelector(
            ".publish-btn"
        );


    submitButton.disabled = true;

    submitButton.textContent =
        "Publishing...";


    try {

        const [
            beforeImage,
            afterImage
        ] = await Promise.all([

            fileToBase64(
                beforeFile
            ),

            fileToBase64(
                afterFile
            )

        ]);


        const works =
            getWorks();


        const providerName =
    getProviderName();

const newWork = {

    id: Date.now(),

    provider: providerName,

    providerName: providerName,

    title: title,

    category: category,

    date: date,

    location: location,

    description: description,

    price: price,

    rating: rating,

    beforeImage: beforeImage,

    afterImage: afterImage,

    createdAt:
        new Date().toISOString()

};


        works.unshift(
            newWork
        );


        if (
            saveWorks(works)
        ) {

            document
                .getElementById("workForm")
                .reset();


            resetImagePreviews();


            closeWorkModal();


            renderWorks();

            updateStats();


            showToast(
                "Completed work published successfully."
            );

        }

    } catch (error) {

        showToast(
            "Could not add the work. Please try again."
        );

    } finally {

        submitButton.disabled = false;

        submitButton.textContent =
            "Publish Work";

    }

}


/* =========================
   RENDER WORKS
========================= */

function renderWorks() {

    const grid =
        document.getElementById(
            "workGrid"
        );


    const emptyState =
        document.getElementById(
            "emptyState"
        );


    const workCount =
        document.getElementById(
            "workCount"
        );


    const search =
        document
            .getElementById("searchWork")
            .value
            .trim()
            .toLowerCase();


    const category =
        document
            .getElementById(
                "categoryFilter"
            )
            .value;


    const works =
        getWorks();


    const filtered =
        works.filter(
            function (work) {

                const searchableText = (

                    String(
                        work.title || ""
                    ) +

                    " " +

                    String(
                        work.description || ""
                    ) +

                    " " +

                    String(
                        work.location || ""
                    ) +

                    " " +

                    String(
                        work.category || ""
                    )

                ).toLowerCase();


                const matchesSearch =
                    !search ||
                    searchableText.includes(
                        search
                    );


                const matchesCategory =
                    category === "all" ||
                    work.category === category;


                return (
                    matchesSearch &&
                    matchesCategory
                );

            }
        );


    workCount.textContent =
        `${filtered.length} ${
            filtered.length === 1
                ? "work"
                : "works"
        }`;


    if (!filtered.length) {

        grid.innerHTML = "";

        emptyState.style.display =
            "flex";


        const title =
            emptyState.querySelector("h3");


        const paragraph =
            emptyState.querySelector("p");


        const button =
            emptyState.querySelector("button");


        if (works.length > 0) {

            title.textContent =
                "No matching work";

            paragraph.textContent =
                "Try another search term or category.";

            button.style.display =
                "none";

        } else {

            title.textContent =
                "No work added yet";

            paragraph.textContent =
                "Add your completed projects to showcase your experience to customers.";

            button.style.display =
                "inline-flex";

        }


        return;

    }


    emptyState.style.display =
        "none";


    grid.innerHTML =
        filtered
            .map(createWorkCard)
            .join("");

}


/* =========================
   CREATE CARD
========================= */

function createWorkCard(work) {

    const before =
        safeImage(
            work.beforeImage
        );


    const after =
        safeImage(
            work.afterImage
        );


    let imageArea = "";


    if (
        before &&
        after
    ) {

        imageArea = `

            <div class="work-images">

                <img
                    class="work-image"
                    src="${before}"
                    alt="Before work"
                >

                <img
                    class="work-image"
                    src="${after}"
                    alt="After work"
                >

            </div>

        `;

    }

    else if (
        after ||
        before
    ) {

        imageArea = `

            <div class="work-images">

                <img
                    class="work-image single"
                    src="${after || before}"
                    alt="Completed work"
                >

            </div>

        `;

    }

    else {

        imageArea = `

            <div class="work-placeholder">
                ▣
            </div>

        `;

    }


    const rating =
        Number(work.rating) || 0;


    const price =
        Number(work.price) || 0;


    return `

        <article class="work-card">

            ${imageArea}


            <div class="work-body">

                <div class="work-top">

                    <div>

                        <span class="work-category">
                            ${escapeHTML(
                                work.category ||
                                "Other"
                            )}
                        </span>

                        <h3>
                            ${escapeHTML(
                                work.title ||
                                "Completed Work"
                            )}
                        </h3>

                    </div>


                    <span class="work-date">
                        ${formatDate(
                            work.date
                        )}
                    </span>

                </div>


                <p class="work-description">
                    ${escapeHTML(
                        work.description ||
                        "No description available."
                    )}
                </p>


                <div class="work-meta">

                    <span class="work-location">

                        ${
                            work.location
                                ? "⌖ " +
                                  escapeHTML(
                                      work.location
                                  )
                                : "Completed project"
                        }

                    </span>


                    <span class="work-rating">

                        ${
                            rating
                                ? "★ " +
                                  rating.toFixed(1)
                                : "No rating"
                        }

                    </span>


                    <span class="work-price">

                        ${
                            price
                                ? "₹" +
                                  formatNumber(
                                      price
                                  )
                                : "—"
                        }

                    </span>

                </div>


                <div class="work-footer">

                    <button
                        class="delete-work"
                        onclick="deleteWork(${Number(work.id)})"
                    >
                        Delete work
                    </button>

                </div>

            </div>

        </article>

    `;

}


/* =========================
   DELETE
========================= */

function deleteWork(id) {

    const works =
        getWorks();


    const work =
        works.find(
            function (item) {

                return Number(
                    item.id
                ) === Number(id);

            }
        );


    if (!work) return;


    const confirmed =
        confirm(
            `Delete "${work.title}" from your work history?`
        );


    if (!confirmed) return;


    const updated =
        works.filter(
            function (item) {

                return Number(
                    item.id
                ) !== Number(id);

            }
        );


    if (
        saveWorks(updated)
    ) {

        renderWorks();

        updateStats();

        showToast(
            "Work removed."
        );

    }

}


/* =========================
   STATS
========================= */

function updateStats() {

    const works =
        getWorks();


    document
        .getElementById("totalWorks")
        .textContent =
        works.length;


    const ratedWorks =
        works.filter(
            function (work) {

                return Number(
                    work.rating
                ) > 0;

            }
        );


    const average =
        ratedWorks.length

            ? ratedWorks.reduce(
                function (
                    sum,
                    work
                ) {

                    return (
                        sum +
                        Number(
                            work.rating
                        )
                    );

                },
                0
            ) / ratedWorks.length

            : 0;


    document
        .getElementById(
            "averageRating"
        )
        .textContent =
        average.toFixed(1);


    const totalValue =
        works.reduce(
            function (
                sum,
                work
            ) {

                return (
                    sum +
                    (
                        Number(
                            work.price
                        ) || 0
                    )
                );

            },
            0
        );


    document
        .getElementById(
            "totalValue"
        )
        .textContent =
        "₹" +
        formatNumber(
            totalValue
        );

}


/* =========================
   RESET IMAGES
========================= */

function resetImagePreviews() {

    [
        "beforePreview",
        "afterPreview"
    ].forEach(
        function (id) {

            const preview =
                document.getElementById(
                    id
                );


            preview.removeAttribute(
                "src"
            );


            preview.classList.remove(
                "show"
            );


            const box =
                preview
                    .closest(
                        ".upload-box"
                    )
                    ?.querySelector(
                        ".image-input"
                    );


            if (box) {

                box.style.display =
                    "";

            }

        }
    );

}


/* =========================
   IMAGE SECURITY
========================= */

function safeImage(value) {

    if (
        !value ||
        typeof value !== "string"
    ) {

        return "";

    }


    if (

        value.startsWith(
            "data:image/"
        ) ||

        value.startsWith(
            "https://"
        ) ||

        value.startsWith(
            "http://"
        )

    ) {

        return value;

    }


    return "";

}


/* =========================
   DATE
========================= */

function formatDate(value) {

    if (!value) {

        return "No date";

    }


    const date =
        new Date(
            value + "T00:00:00"
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return value;

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


/* =========================
   NUMBER
========================= */

function formatNumber(value) {

    return Number(
        value || 0
    ).toLocaleString(
        "en-IN"
    );

}


/* =========================
   ESCAPE HTML
========================= */

function escapeHTML(value) {

    return String(
        value ?? ""
    )
    .replace(
        /&/g,
        "&amp;"
    )
    .replace(
        /</g,
        "&lt;"
    )
    .replace(
        />/g,
        "&gt;"
    )
    .replace(
        /"/g,
        "&quot;"
    )
    .replace(
        /'/g,
        "&#039;"
    );

}


/* =========================
   TOAST
========================= */

function showToast(message) {

    const toast =
        document.getElementById(
            "toast"
        );


    const toastMessage =
        document.getElementById(
            "toastMessage"
        );


    toastMessage.textContent =
        message;


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


/* =========================
   MOBILE SIDEBAR
========================= */

function toggleSidebar() {

    document
        .getElementById(
            "sidebar"
        )
        .classList.toggle(
            "open"
        );

}


/* =========================
   PROFILE
========================= */

function openProfile() {

    window.location.href =
        "provider-profile.html";

}


/* =========================
   LOGOUT
========================= */

function logoutProvider() {

    const confirmed =
        confirm(
            "Are you sure you want to logout?"
        );


    if (!confirmed) {

        return;

    }


    showToast(
        "Logging out..."
    );


    setTimeout(
        function () {

            window.location.href =
                "../login.html";

        },
        600
    );

}


/* =========================
   ESCAPE KEY
========================= */

document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Escape"
        ) {

            closeWorkModal();

        }

    }
);
/* =========================
   AUTOMATIC ACTIVE SIDEBAR
========================= */

function setActiveNavigation() {

    const currentPage =
        window.location.pathname
            .split("/")
            .pop()
            .toLowerCase();

    const navItems =
        document.querySelectorAll(
            ".sidebar-nav .nav-item"
        );

    navItems.forEach(function (item) {

        item.classList.remove("active");

        const link =
            item.getAttribute("href");

        if (!link || link === "#") {
            return;
        }

        const linkPage =
            link.split("/")
                .pop()
                .toLowerCase();

        if (
            linkPage === currentPage
        ) {
            item.classList.add("active");
        }

    });

}

document.addEventListener(
    "DOMContentLoaded",
    setActiveNavigation
);
/* =====================================================
   KAMSETU PROVIDER MESSAGES
===================================================== */


/* =====================================================
   GLOBAL STATE
===================================================== */

let currentConversation =
    "amit";

let toastTimer =
    null;


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


        const topUserName =
            document.getElementById(
                "topUserName"
            );

        const topUserAvatar =
            document.getElementById(
                "topUserAvatar"
            );

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
   OPEN CONVERSATION
===================================================== */

function openConversation(person) {

    currentConversation =
        person;


    document
        .querySelectorAll(
            ".conversation"
        )
        .forEach(
            function (item) {

                item.classList.remove(
                    "active"
                );

            }
        );


    const selected =
        document.querySelector(
            `.conversation[onclick="openConversation('${person}')"]`
        );


    if (selected) {

        selected.classList.add(
            "active"
        );

        const unread =
            selected.querySelector(
                ".unread"
            );

        if (unread) {

            unread.style.display =
                "none";

        }

    }


    const customerName =
        document.getElementById(
            "customerName"
        );

    const customerService =
        document.getElementById(
            "customerService"
        );

    const chatAvatar =
        document.getElementById(
            "chatAvatar"
        );


    const conversations = {

        amit: {

            name:
                "Amit Sharma",

            service:
                "Plumbing Service",

            avatar:
                "AS"

        },

        priya: {

            name:
                "Priya Singh",

            service:
                "AC Repair",

            avatar:
                "PS"

        },

        vikash: {

            name:
                "Vikash Mehta",

            service:
                "Electrical Work",

            avatar:
                "VM"

        },

        neha: {

            name:
                "Neha Kapoor",

            service:
                "Carpenter Service",

            avatar:
                "NK"

        }

    };


    const conversation =
        conversations[person] ||
        conversations.amit;


    if (customerName) {

        customerName.textContent =
            conversation.name;

    }


    if (customerService) {

        customerService.textContent =
            conversation.service;

    }


    if (chatAvatar) {

        chatAvatar.textContent =
            conversation.avatar;

    }


    showToast(
        "Conversation opened"
    );

}


/* =====================================================
   SEARCH CONVERSATIONS
===================================================== */

function searchConversations() {

    const input =
        document.getElementById(
            "conversationSearch"
        );

    if (!input) {
        return;
    }


    const search =
        input.value
            .trim()
            .toLowerCase();


    document
        .querySelectorAll(
            ".conversation"
        )
        .forEach(
            function (conversation) {

                const name =
                    (
                        conversation.dataset.name ||
                        ""
                    ).toLowerCase();


                conversation.style.display =
                    !search ||
                    name.includes(search)
                        ? ""
                        : "none";

            }
        );

}


/* =====================================================
   MARK ALL READ
===================================================== */

function markAllRead() {

    document
        .querySelectorAll(
            ".conversation .unread"
        )
        .forEach(
            function (badge) {

                badge.style.display =
                    "none";

            }
        );


    showToast(
        "All messages marked as read"
    );

}


/* =====================================================
   SEND MESSAGE
===================================================== */

function sendMessage() {

    const input =
        document.getElementById(
            "messageInput"
        );

    const chat =
        document.getElementById(
            "chatMessages"
        );


    if (
        !input ||
        !chat
    ) {
        return;
    }


    const message =
        input.value.trim();


    if (!message) {

        showToast(
            "Please type a message"
        );

        input.focus();

        return;

    }


    const item =
        document.createElement(
            "div"
        );


    item.className =
        "message sent";


    item.innerHTML = `

        <div class="message-bubble">

            ${escapeHTML(message)}

        </div>

        <time>

            Just now · Seen

        </time>

    `;


    chat.appendChild(
        item
    );


    input.value =
        "";


    chat.scrollTop =
        chat.scrollHeight;

}


/* =====================================================
   ENTER TO SEND
===================================================== */

function handleMessageKey(event) {

    if (
        event.key === "Enter" &&
        !event.shiftKey
    ) {

        event.preventDefault();

        sendMessage();

    }

}


/* =====================================================
   COUNTER OFFER
===================================================== */

function openCounterOffer() {

    const form =
        document.getElementById(
            "counterForm"
        );

    const input =
        document.getElementById(
            "counterPrice"
        );


    if (form) {

        form.classList.add(
            "show"
        );

    }


    if (input) {

        input.focus();

    }

}


function closeCounterOffer() {

    const form =
        document.getElementById(
            "counterForm"
        );


    if (form) {

        form.classList.remove(
            "show"
        );

    }

}


/* =====================================================
   SEND COUNTER OFFER
===================================================== */

function sendCounterOffer() {

    const input =
        document.getElementById(
            "counterPrice"
        );

    const currentPrice =
        document.getElementById(
            "currentPrice"
        );

    const customerOffer =
        document.getElementById(
            "customerOffer"
        );


    const amount =
        input
            ? Number(
                input.value
            )
            : 0;


    if (
        !amount ||
        amount <= 0
    ) {

        showToast(
            "Enter a valid counter offer"
        );

        return;

    }


    if (currentPrice) {

        currentPrice.textContent =
            "₹" +
            amount;

    }


    if (customerOffer) {

        customerOffer.textContent =
            "₹" +
            amount;

    }


    const chat =
        document.getElementById(
            "chatMessages"
        );


    if (chat) {

        const message =
            document.createElement(
                "div"
            );


        message.className =
            "message sent";


        message.innerHTML = `

            <div class="message-bubble">

                My counter offer is ₹${amount}.

            </div>

            <time>

                Just now · Sent

            </time>

        `;


        chat.appendChild(
            message
        );


        chat.scrollTop =
            chat.scrollHeight;

    }


    closeCounterOffer();


    if (input) {

        input.value =
            "";

    }


    showToast(
        "Counter offer sent successfully"
    );

}


/* =====================================================
   ACCEPT DEAL
===================================================== */

function acceptDeal() {

    const currentPrice =
        document.getElementById(
            "currentPrice"
        );


    const price =
        currentPrice
            ? currentPrice.textContent.trim()
            : "the current offer";


    const confirmed =
        confirm(
            "Accept the deal at " +
            price +
            "?"
        );


    if (!confirmed) {

        return;

    }


    showToast(
        "Deal accepted successfully"
    );


    const status =
        document.querySelector(
            ".request-status"
        );


    if (status) {

        status.textContent =
            "ACCEPTED";

    }


    setTimeout(
        function () {

            window.location.href =
                "provider-bookings.html";

        },
        900
    );

}


/* =====================================================
   PROFILE
===================================================== */

function openProfile() {

    window.location.href =
        "provider-profile.html";

}


/* =====================================================
   LOGOUT
===================================================== */

function logoutProvider() {

    const confirmed =
        confirm(
            "Are you sure you want to logout?"
        );


    if (!confirmed) {

        return;

    }


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


    setTimeout(
        function () {

            window.location.href =
                "../login.html";

        },
        700
    );

}


/* =====================================================
   HTML ESCAPE
===================================================== */

function escapeHTML(text) {

    const div =
        document.createElement(
            "div"
        );

    div.textContent =
        text;

    return div.innerHTML;

}


/* =====================================================
   PAGE INITIALIZATION
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadLoggedInProvider();


        openConversation(
            "amit"
        );


        const chat =
            document.getElementById(
                "chatMessages"
            );


        if (chat) {

            chat.scrollTop =
                chat.scrollHeight;

        }

    }
);
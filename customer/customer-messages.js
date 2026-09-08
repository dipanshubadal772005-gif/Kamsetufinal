let currentChat = "rahul";


/* =====================================================
   LOAD LOGGED-IN CUSTOMER
===================================================== */

function loadLoggedInCustomer() {

    let userData =
        localStorage.getItem("KAMSETUUser");

    if (!userData) {
        userData =
            sessionStorage.getItem("KAMSETUUser");
    }

    if (!userData) {
        console.log("No logged-in customer found.");
        return;
    }

    try {

        const user =
            JSON.parse(userData);

        const topUserName =
            document.getElementById("topUserName");

        const topUserAvatar =
            document.getElementById("topUserAvatar");


        if (topUserName) {

            topUserName.textContent =
                user.name || "User";

        }


        if (topUserAvatar) {

            topUserAvatar.textContent =
                (user.name || "U")
                    .charAt(0)
                    .toUpperCase();

        }

    } catch (error) {

        console.error(
            "Could not load logged-in customer:",
            error
        );

    }
}


/* =====================================================
   SIDEBAR
===================================================== */

function toggleSidebar() {

    const sidebar =
        document.querySelector(".sidebar");

    const overlay =
        document.getElementById("sidebarOverlay");

    if (!sidebar || !overlay) {
        return;
    }

    sidebar.classList.toggle("open");
    overlay.classList.toggle("show");
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
   OPEN CHAT
===================================================== */

function openChat(person) {

    currentChat = person;


    const conversations =
        document.querySelectorAll(".conversation");


    conversations.forEach(function (item) {

        item.classList.remove("active");

    });


    const selected =
        document.querySelector(
            `.conversation[onclick="openChat('${person}')"]`
        );


    if (selected) {

        selected.classList.add("active");

        const unread =
            selected.querySelector(".unread");

        if (unread) {
            unread.style.display = "none";
        }
    }


    const chatName =
        document.getElementById("chatName");

    const chatService =
        document.getElementById("chatService");

    const chatAvatar =
        document.querySelector(".chat-avatar");


    if (person === "rahul") {

        chatName.textContent =
            "Rahul Kumar";

        chatService.textContent =
            "Electrician · Online";

        if (chatAvatar) {
            chatAvatar.textContent = "RK";
        }
    }


    else if (person === "amit") {

        chatName.textContent =
            "Amit Sharma";

        chatService.textContent =
            "Plumber · Online";

        if (chatAvatar) {
            chatAvatar.textContent = "AS";
        }
    }


    else if (person === "mohit") {

        chatName.textContent =
            "Mohit Singh";

        chatService.textContent =
            "Carpenter · Offline";

        if (chatAvatar) {
            chatAvatar.textContent = "MS";
        }
    }


    showToast(
        "Conversation opened"
    );
}


/* =====================================================
   SEARCH MESSAGES
===================================================== */

function searchMessages() {

    const input =
        document.getElementById(
            "messageSearch"
        );

    if (!input) {
        return;
    }


    const search =
        input.value.toLowerCase().trim();


    const conversations =
        document.querySelectorAll(".conversation");


    conversations.forEach(function (conversation) {

        const name =
            conversation.dataset.name.toLowerCase();


        if (name.includes(search)) {

            conversation.style.display =
                "flex";

        } else {

            conversation.style.display =
                "none";

        }

    });
}


/* =====================================================
   SEND MESSAGE
===================================================== */

function sendMessage() {

    const input =
        document.getElementById(
            "messageInput"
        );


    if (!input) {
        return;
    }


    const message =
        input.value.trim();


    if (message === "") {

        showToast(
            "Please type a message"
        );

        return;
    }


    const chat =
        document.getElementById(
            "chatMessages"
        );


    if (!chat) {
        return;
    }


    const messageElement =
        document.createElement(
            "div"
        );


    messageElement.className =
        "message sent";


    messageElement.innerHTML = `

        <div>

            <div class="message-bubble">

                ${escapeHTML(message)}

            </div>

            <span>
                Just now
            </span>

        </div>

    `;


    chat.appendChild(
        messageElement
    );


    input.value = "";


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
   OFFER BOX
===================================================== */

function openOfferBox() {

    const box =
        document.getElementById(
            "offerBox"
        );

    const input =
        document.getElementById(
            "offerInput"
        );


    if (!box) {
        return;
    }


    box.classList.add("show");


    if (input) {

        input.focus();
        input.select();

    }

}


function closeOfferBox() {

    const box =
        document.getElementById(
            "offerBox"
        );


    if (!box) {
        return;
    }


    box.classList.remove("show");

}


/* =====================================================
   SEND OFFER
===================================================== */

function sendOffer() {

    const input =
        document.getElementById(
            "offerInput"
        );


    if (!input) {
        return;
    }


    const amount =
        Number(input.value);


    if (
        !amount ||
        amount <= 0
    ) {

        showToast(
            "Enter a valid offer"
        );

        return;
    }


    const currentOffer =
        document.getElementById(
            "currentOffer"
        );


    if (currentOffer) {

        currentOffer.textContent =
            "₹" + amount;

    }


    const chat =
        document.getElementById(
            "chatMessages"
        );


    if (chat) {

        const offer =
            document.createElement(
                "div"
            );


        offer.className =
            "message sent";


        offer.innerHTML = `

            <div>

                <div class="message-bubble">

                    My offer is ₹${amount}

                </div>

                <span>
                    Just now
                </span>

            </div>

        `;


        chat.appendChild(
            offer
        );


        chat.scrollTop =
            chat.scrollHeight;

    }


    closeOfferBox();


    showToast(
        "Offer sent successfully"
    );

}


/* =====================================================
   ACCEPT OFFER
===================================================== */

function acceptOffer() {

    const currentOffer =
        document.getElementById(
            "currentOffer"
        );


    const price =
        currentOffer
            ? currentOffer.textContent
            : "the current price";


    const confirmation =
        confirm(
            "Accept the offer at " +
            price +
            "?"
        );


    if (!confirmation) {
        return;
    }


    /*
       Store accepted booking information
       so the bookings page can use it later.
    */

    const bookingData = {

        provider:
            getCurrentProviderName(),

        service:
            getCurrentServiceName(),

        price:
            price,

        status:
            "upcoming",

        created:
            new Date().toISOString()

    };


    localStorage.setItem(
        "KAMSETUAcceptedBooking",
        JSON.stringify(bookingData)
    );


    /* Add confirmation message */

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

            <div>

                <div class="message-bubble">

                    ✓ Offer accepted at ${price}.
                    Booking created successfully.

                </div>

                <span>
                    Just now
                </span>

            </div>

        `;


        chat.appendChild(
            message
        );


        chat.scrollTop =
            chat.scrollHeight;

    }


    showToast(
        "Offer accepted! Booking created."
    );


    /*
       Move customer to bookings page
    */

    setTimeout(function () {

        window.location.href =
            "customer-bookings.html";

    }, 900);

}


/* =====================================================
   GET CURRENT PROVIDER
===================================================== */

function getCurrentProviderName() {

    const chatName =
        document.getElementById(
            "chatName"
        );


    if (chatName) {

        return chatName.textContent.trim();

    }


    return "Rahul Kumar";

}


/* =====================================================
   GET CURRENT SERVICE
===================================================== */

function getCurrentServiceName() {

    const service =
        document.querySelector(
            ".service-summary strong"
        );


    if (service) {

        return service.textContent.trim();

    }


    return "Home Electrical Repair";

}


/* =====================================================
   PROVIDER PROFILE
===================================================== */

function viewProvider() {

    /*
       Open provider profile directly.
    */

    window.location.href =
        "../provider/provider-profile.html";

}


/* =====================================================
   PROFILE
===================================================== */

function openProfile() {

    window.location.href =
        "customer-profile.html";

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

        /*
            Load the actual logged-in customer.
        */

        loadLoggedInCustomer();


        /*
            Make Rahul the default conversation.
        */

        openChat("rahul");


        /*
            Scroll chat to latest message.
        */

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
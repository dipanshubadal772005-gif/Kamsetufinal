
(function () {
    "use strict";

    const page = location.pathname.split("/").pop().toLowerCase();
    const inCustomer = /\/customer\//i.test(location.pathname) || location.pathname.includes("\\customer\\");
    const prefix = inCustomer ? "" : "customer/";

    const links = [
        ["customer-dashboard.html", "⌂", "Dashboard", "dashboard"],
        [prefix ? "../service.html" : "../service.html", "⚒", "Find Services", "services"],
        ["group-booking.html", "👥", "Group Booking", "group"],
        ["schedule.html", "📅", "Schedule Service", "schedule"],
        ["emergency.html", "🚨", "Emergency Booking", "emergency"],
        ["voice-ai.html", "🎙️", "Voice AI", "voice"],
        ["customer-bookings.html", "◫", "My Bookings", "bookings", "2"],
        ["customer-messages.html", "◌", "Messages", "messages", "3"],
        [prefix ? "../notifications.html" : "../notifications.html", "🔔", "Notifications", "notifications"],
        ["customer-profile.html", "◎", "Profile", "profile"],
        ["customer-live-tracking.html", "📍", "Track Provider", "tracking"]
    ];

    function activeKey() {
        if (page === "service.html") return "services";
        if (page === "notifications.html") return "notifications";
        if (page === "customer-dashboard.html") return "dashboard";
        if (page === "customer-bookings.html") return "bookings";
        if (page === "customer-messages.html") return "messages";
        if (page === "customer-profile.html") return "profile";
        if (page === "customer-live-tracking.html") return "tracking";
        if (page === "customer-provider-profile.html") return "services";
        if (page === "customer-negotiation.html") return "bookings";
        if (page === "group-booking.html") return "group";
        if (page === "schedule.html") return "schedule";
        if (page === "emergency.html") return "emergency";
        if (page === "voice-ai.html") return "voice";
        return "";
    }

    function hrefFor(target) {
        if (!inCustomer) {
            if (target === "customer-dashboard.html") return "customer/customer-dashboard.html";
            if (target === "group-booking.html") return "customer/group-booking.html";
            if (target === "schedule.html") return "customer/schedule.html";
            if (target === "emergency.html") return "customer/emergency.html";
            if (target === "voice-ai.html") return "customer/voice-ai.html";
            if (target === "customer-bookings.html") return "customer/customer-bookings.html";
            if (target === "customer-messages.html") return "customer/customer-messages.html";
            if (target === "customer-profile.html") return "customer/customer-profile.html";
            if (target === "customer-live-tracking.html") return "customer/customer-live-tracking.html";
        }
        return target;
    }

    function makeSidebar() {
        document.querySelectorAll("aside.sidebar, #customerSidebar").forEach(el => el.remove());

        const aside = document.createElement("aside");
        aside.id = "customerSidebar";
        aside.className = "customer-sidebar";

        const logoHref = inCustomer ? "customer-dashboard.html" : "customer/customer-dashboard.html";
        aside.innerHTML = `
            <a class="customer-logo" href="${logoHref}">
                <div class="customer-logo-icon">⌂</div>
                <div><strong>KAMSETU</strong><small>Get Things Done</small></div>
            </a>
            <nav class="customer-nav" aria-label="Customer navigation"></nav>
            <div class="customer-bottom">
                <a href="#" class="customer-bottom-item" data-action="settings">
                    <span class="customer-nav-icon">⚙</span><span class="customer-nav-label">Settings</span>
                </a>
                <a href="${inCustomer ? "../index.html" : "index.html"}" class="customer-bottom-item">
                    <span class="customer-nav-icon">←</span><span class="customer-nav-label">Back to Home</span>
                </a>
                <button type="button" class="customer-logout" data-action="logout">
                    <span class="customer-nav-icon">↪</span><span class="customer-nav-label">Logout</span>
                </button>
            </div>`;

        const nav = aside.querySelector(".customer-nav");
        const current = activeKey();
        links.forEach(([target, icon, label, key, count]) => {
            const a = document.createElement("a");
            a.className = "customer-nav-item" + (key === current ? " active" : "");
            a.href = hrefFor(target);
            a.dataset.navKey = key;
            a.innerHTML = `<span class="customer-nav-icon">${icon}</span><span class="customer-nav-label">${label}</span>${count ? `<span class="customer-count">${count}</span>` : ""}`;
            nav.appendChild(a);
        });

        document.body.prepend(aside);
        document.body.classList.add("customer-shell");

        aside.querySelector('[data-action="settings"]').addEventListener("click", function (e) {
            e.preventDefault();
            if (typeof window.showComingSoon === "function") window.showComingSoon(e);
            else alert("Settings will be available soon.");
        });
        aside.querySelector('[data-action="logout"]').addEventListener("click", function () {
            if (typeof window.logoutUser === "function") window.logoutUser();
            else {
                localStorage.removeItem("KAMSETUToken");
                localStorage.removeItem("KAMSETUUser");
                location.href = inCustomer ? "../login.html" : "login.html";
            }
        });
    }

    window.toggleCustomerSidebar = function () {
        const aside = document.getElementById("customerSidebar");
        if (!aside) return;
        aside.classList.toggle("open");
        document.body.classList.toggle("customer-sidebar-open");
    };

    document.addEventListener("DOMContentLoaded", makeSidebar);
})();

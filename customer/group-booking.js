const API_BASE_URL = window.KAMSETU_API_URL;
const token = localStorage.getItem("KAMSETUToken");
let activeInviteCode = null;
let activeGroupId = null;

const $ = (id) => document.getElementById(id);

function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>'"]/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));
}

function showToast(message) {
    const toast = $("toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(window.__gbToast);
    window.__gbToast = setTimeout(() => toast.classList.remove("show"), 2600);
}

async function api(path, options = {}) {
    if (!token) {
        window.location.href = "../login.html";
        throw new Error("Authentication required");
    }
    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            ...(options.headers || {})
        }
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.success) throw new Error(data.message || "Something went wrong");
    return data;
}

function formatDate(value) {
    return new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function setMinDate() {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    $("bookingDate").min = date.toISOString().split("T")[0];
}

async function createGroup(event) {
    event.preventDefault();
    const payload = {
        serviceName: $("serviceName").value.trim(),
        serviceType: $("serviceType").value.trim(),
        societyName: $("societyName").value.trim(),
        address: $("address").value.trim(),
        flatNumber: $("flatNumber").value.trim(),
        building: $("building").value.trim(),
        bookingDate: $("bookingDate").value,
        bookingTime: $("bookingTime").value.trim(),
        maxMembers: Number($("maxMembers").value),
        requirement: $("requirement").value.trim(),
        latitude: $("latitude").value,
        longitude: $("longitude").value
    };
    const button = event.submitter;
    button.disabled = true;
    button.textContent = "Creating...";
    try {
        const data = await api("/api/group-bookings", { method: "POST", body: JSON.stringify(payload) });
        showToast("Group created. Share the invite code with neighbours.");
        await renderGroupDetail(data.group._id);
        await loadGroups();
        window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
        event.target.reset();
        setMinDate();
    } catch (error) {
        showToast(error.message);
    } finally {
        button.disabled = false;
        button.innerHTML = "Create Group Booking <span>→</span>";
    }
}

async function lookupInvite(event) {
    event.preventDefault();
    const code = $("inviteCode").value.trim().toUpperCase();
    if (!code) return;
    try {
        const data = await api(`/api/group-bookings/invite/${encodeURIComponent(code)}`);
        activeInviteCode = code;
        const group = data.group;
        $("invitePreview").classList.remove("hidden");
        $("invitePreview").innerHTML = `
            <strong>${escapeHtml(group.serviceName)}</strong>
            <div class="invite-meta">
                <span>🏠 ${escapeHtml(group.societyName)}</span>
                <span>👥 ${group.memberCount}/${group.maxMembers} households</span>
                <span>📅 ${formatDate(group.bookingDate)}</span>
                <span>🕐 ${escapeHtml(group.bookingTime)}</span>
                <span>Organized by ${escapeHtml(group.organizer?.name || "Neighbour")}</span>
                <span class="${group.status === "full" ? "warning" : "success"}">${escapeHtml(group.status.replaceAll("_", " "))}</span>
            </div>`;
        $("joinForm").classList.toggle("hidden", ["accepted", "cancelled", "completed", "in_progress"].includes(group.status) || group.memberCount >= group.maxMembers);
        if (group.memberCount >= group.maxMembers) showToast("This group is already full.");
    } catch (error) {
        $("invitePreview").classList.remove("hidden");
        $("invitePreview").innerHTML = `<span class="warning">${escapeHtml(error.message)}</span>`;
        $("joinForm").classList.add("hidden");
    }
}

async function joinGroup(event) {
    event.preventDefault();
    if (!activeInviteCode) return showToast("Find a group first.");
    try {
        const inviteData = await api(`/api/group-bookings/invite/${encodeURIComponent(activeInviteCode)}`);
        const groupId = inviteData.group._id;
        const payload = {
            flatNumber: $("joinFlat").value.trim(),
            building: $("joinBuilding").value.trim(),
            requirement: $("joinRequirement").value.trim()
        };
        const data = await api(`/api/group-bookings/${groupId}/join`, { method: "POST", body: JSON.stringify(payload) });
        showToast("You joined the group booking.");
        await renderGroupDetail(data.group._id);
        await loadGroups();
        $("joinForm").reset();
    } catch (error) {
        showToast(error.message);
    }
}

async function loadGroups() {
    try {
        const data = await api("/api/group-bookings/customer");
        const list = $("groupList");
        if (!data.groups.length) {
            list.innerHTML = `<div class="empty-state">You have no group bookings yet. Create one or join a neighbour's group.</div>`;
            return;
        }
        list.innerHTML = data.groups.map((group) => `
            <article class="group-card">
                <div>
                    <div class="group-title"><h3>${escapeHtml(group.serviceName)}</h3><span>${escapeHtml(group.status.replaceAll("_", " "))}</span></div>
                    <div class="group-info">
                        <span>🏠 <b>${escapeHtml(group.location.societyName)}</b></span>
                        <span>📅 <b>${formatDate(group.bookingDate)}</b></span>
                        <span>👥 <b>${group.memberCount}/${group.maxMembers}</b></span>
                        <span>Code <b>${escapeHtml(group.groupCode)}</b></span>
                    </div>
                </div>
                <div class="group-actions"><button class="secondary-btn small" onclick="renderGroupDetail('${group._id}')">View</button></div>
            </article>`).join("");
    } catch (error) {
        $("groupList").innerHTML = `<div class="empty-state">${escapeHtml(error.message)}</div>`;
    }
}

async function renderGroupDetail(groupId) {
    activeGroupId = groupId;
    try {
        const data = await api(`/api/group-bookings/${groupId}`);
        const group = data.group;
        const detail = $("groupDetail");
        const currentUser = JSON.parse(localStorage.getItem("KAMSETUUser") || "{}");
        const isOrganizer = group.organizer?._id?.toString() === String(currentUser.id || "");
        const inviteUrl = `${window.location.origin}${window.location.pathname}?invite=${encodeURIComponent(group.inviteCode)}`;
        const quotes = group.quotes || [];
        detail.classList.remove("hidden");
        detail.innerHTML = `
            <div class="panel-title row"><div><span class="eyebrow">${escapeHtml(group.groupCode)}</span><h2>${escapeHtml(group.serviceName)} · ${escapeHtml(group.location.societyName)}</h2></div><button class="secondary-btn small" onclick="closeDetail()">Close</button></div>
            <div class="detail-grid">
                <div>
                    <p class="panel-copy">📅 ${formatDate(group.bookingDate)} · 🕐 ${escapeHtml(group.bookingTime)}</p>
                    <p class="panel-copy">📍 ${escapeHtml(group.location.address)}</p>
                    <div class="members">${group.members.map((m) => `<div class="member"><div><strong>${escapeHtml(m.customer?.name || "Household")}</strong><small>${escapeHtml(m.building ? `${m.building}, ` : "")}${escapeHtml(m.flatNumber)} · ${escapeHtml(m.requirement)}</small></div><span>${m.status === "confirmed" ? "✓ Confirmed" : "Joined"}</span></div>`).join("")}</div>
                </div>
                <div>
                    <div class="quote"><div class="quote-top"><strong>Invite neighbours</strong><span>${group.members.length}/${group.maxMembers}</span></div><p>Share code <b>${escapeHtml(group.inviteCode)}</b> or copy the invite link.</p><button class="secondary-btn small" onclick="copyInvite('${escapeHtml(inviteUrl)}')">Copy Invite Link</button></div>
                    ${group.status === "open" || group.status === "full" ? (isOrganizer ? `<button class="primary-btn" onclick="requestProvider('${group._id}')">Find a Provider</button>` : "") : ""}
                    ${quotes.length ? `<div class="quote"><strong>Provider quotes</strong>${quotes.map((q) => `<div class="quote"><div class="quote-top"><strong>${escapeHtml(q.provider?.name || "Provider")}</strong><span class="quote-price">₹${Number(q.totalAmount).toLocaleString("en-IN")}</span></div><p>₹${Number(q.perHouseholdAmount).toLocaleString("en-IN")} per household${q.message ? ` · ${escapeHtml(q.message)}` : ""}</p>${isOrganizer && q.status === "pending" && ["quoted","provider_requested","full"].includes(group.status) ? `<button class="primary-btn" onclick="acceptQuote('${group._id}','${q._id}')">Accept Quote</button>` : `<small>${escapeHtml(q.status)}</small>`}</div>`).join("")}</div>` : ""}
                    ${group.status === "accepted" ? `<div class="quote"><strong class="success">✓ Group confirmed</strong><p>Your individual bookings have been created. Open My Bookings to manage each household's booking.</p><a class="secondary-btn small" href="customer-bookings.html">Open My Bookings</a></div>` : ""}
                    ${isOrganizer && !["cancelled","completed"].includes(group.status) ? `<button class="secondary-btn small" onclick="cancelGroup('${group._id}')">Cancel Group</button>` : ""}
                </div>
            </div>`;
        detail.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (error) {
        showToast(error.message);
    }
}

function closeDetail() { $("groupDetail").classList.add("hidden"); }

async function requestProvider(groupId) {
    if (!confirm("Make this group visible to matching providers?")) return;
    try {
        await api(`/api/group-bookings/${groupId}/request-provider`, { method: "POST" });
        showToast("Matching providers can now see the group request.");
        await renderGroupDetail(groupId);
        await loadGroups();
    } catch (error) { showToast(error.message); }
}

async function acceptQuote(groupId, quoteId) {
    if (!confirm("Accept this provider quote? This will create an individual booking for every household.")) return;
    try {
        await api(`/api/group-bookings/${groupId}/accept-quote`, { method: "POST", body: JSON.stringify({ quoteId }) });
        showToast("Group confirmed and individual bookings created.");
        await renderGroupDetail(groupId);
        await loadGroups();
    } catch (error) { showToast(error.message); }
}

async function cancelGroup(groupId) {
    if (!confirm("Cancel this group booking?")) return;
    try {
        await api(`/api/group-bookings/${groupId}/cancel`, { method: "POST" });
        showToast("Group booking cancelled.");
        await renderGroupDetail(groupId);
        await loadGroups();
    } catch (error) { showToast(error.message); }
}

async function copyInvite(url) {
    try {
        await navigator.clipboard.writeText(url);
        showToast("Invite link copied.");
    } catch {
        showToast("Copy failed. Share the invite code instead.");
    }
}

function loadInviteFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("invite");
    if (code) {
        $("inviteCode").value = code.toUpperCase();
        $("lookupForm").requestSubmit();
    }
}

$("createForm").addEventListener("submit", createGroup);
$("lookupForm").addEventListener("submit", lookupInvite);
$("joinForm").addEventListener("submit", joinGroup);
$("refreshGroups").addEventListener("click", loadGroups);

document.addEventListener("DOMContentLoaded", () => {
    setMinDate();
    loadGroups();
    loadInviteFromUrl();
});

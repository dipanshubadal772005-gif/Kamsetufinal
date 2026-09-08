const API_BASE_URL = window.KAMSETU_API_URL;
const token = localStorage.getItem("KAMSETUToken");
const list = document.getElementById("requestList");
const toast = document.getElementById("toast");

function esc(value){return String(value??"").replace(/[&<>'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));}
function toastMsg(message){toast.textContent=message;toast.classList.add("show");clearTimeout(window.__pToast);window.__pToast=setTimeout(()=>toast.classList.remove("show"),2500);}
function dateText(value){return new Date(value).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"});}
async function loadRequests(){
    if(!token){location.href="../login.html";return;}
    list.innerHTML='<div class="empty">Loading group requests...</div>';
    try{
        const r=await fetch(`${API_BASE_URL}/api/group-bookings/provider`,{headers:{Authorization:`Bearer ${token}`}});
        const d=await r.json();
        if(!r.ok||!d.success)throw new Error(d.message||"Unable to load requests");
        if(!d.groups?.length){list.innerHTML='<div class="empty">No matching group requests right now. New requests will appear here when customers ask for your service.</div>';return;}
        list.innerHTML=d.groups.map(group=>{
            const quote=group.providerQuote;
            const quoteValue=quote?.totalAmount??"";
            return `<article class="request-card">
                <div class="request-top"><div class="request-title"><h3>👥 ${esc(group.serviceName)}</h3><p>${esc(group.location.societyName)} · ${esc(group.location.address)}</p></div><span class="status">${esc(group.status.replaceAll("_"," "))}</span></div>
                <div class="meta"><span>📅 <b>${dateText(group.bookingDate)}</b></span><span>🕐 <b>${esc(group.bookingTime)}</b></span><span>👥 <b>${group.memberCount} households</b></span><span>Organizer: <b>${esc(group.organizer?.name||"Customer")}</b></span></div>
                <div class="jobs">${group.members.map(m=>`<div class="job"><strong>${esc(m.customer?.name||"Household")} · ${esc(m.flatNumber)}</strong><span>${esc(m.building?m.building+" · ":"")}${esc(m.requirement)}</span></div>`).join("")}</div>
                <div class="request-actions">
                    <label>Total group quote (₹)<input type="number" min="0" step="1" value="${quoteValue}" id="quote-${group._id}" placeholder="e.g. 2500"></label>
                    <label>Message (optional)<input type="text" id="msg-${group._id}" value="${esc(quote?.message||"")}" placeholder="I can complete all jobs in one visit."></label>
                    <button class="primary-btn" onclick="sendQuote('${group._id}')">${quote?'Update Quote':'Send Group Quote'}</button>
                </div>
            </article>`;
        }).join("");
    }catch(e){list.innerHTML=`<div class="empty">${esc(e.message)}</div>`;}
}
async function sendQuote(groupId){
    const amount=Number(document.getElementById(`quote-${groupId}`)?.value);
    const message=document.getElementById(`msg-${groupId}`)?.value.trim();
    if(!Number.isFinite(amount)||amount<0){toastMsg("Enter a valid group quote amount.");return;}
    try{
        const r=await fetch(`${API_BASE_URL}/api/group-bookings/${groupId}/quote`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`},body:JSON.stringify({totalAmount:amount,message})});
        const d=await r.json();
        if(!r.ok||!d.success)throw new Error(d.message||"Unable to submit quote");
        toastMsg("Group quote sent to the organizer.");
        loadRequests();
    }catch(e){toastMsg(e.message);}
}
document.getElementById("refresh").addEventListener("click",loadRequests);
document.addEventListener("DOMContentLoaded",loadRequests);

const API_BASE_URL = window.KAMSETU_API_URL;
const token = localStorage.getItem("KAMSETUToken") || sessionStorage.getItem("KAMSETUToken") || "";
const selectedProviderProfile = (()=>{try{return JSON.parse(localStorage.getItem("KAMSETUNegotiationProvider")||localStorage.getItem("servioSelectedProviderProfile")||"null")}catch{return null}})();
const mode = new URLSearchParams(location.search).get("mode") || "booking";
let services = [];
let providers = [];

const $ = id => document.getElementById(id);
function esc(v){return String(v??"").replace(/[&<>'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]))}
function setResult(message, error=false){$("result").textContent=message;$("result").style.color=error?"#c0392b":"#0077b6"}

function setMinimumDate(){
    const d=new Date(); d.setMinutes(d.getMinutes()-d.getTimezoneOffset());
    $("bookingDate").min=d.toISOString().slice(0,10);
    $("bookingDate").value=d.toISOString().slice(0,10);
}

async function loadServices(){
    const response=await fetch(`${API_BASE_URL}/api/services/`);
    const data=await response.json();
    if(!response.ok||!data.success) throw new Error(data.message||"Unable to load services");
    services=data.services||[];
    const select=$("serviceSelect");
    select.innerHTML='<option value="">Select a service</option>';
    const unique=new Map();
    services.forEach(s=>unique.set(String(s._id),s));
    unique.forEach(s=>{
        const o=document.createElement("option");o.value=s._id;o.textContent=`${s.serviceName} — ₹${s.startingPrice}`;select.appendChild(o);
    });
    if(selectedProviderProfile?.name){
        const match=services.find(s=>String(s.provider?.name||"").toLowerCase()===String(selectedProviderProfile.name).toLowerCase());
        if(match){select.value=match._id;renderProviders(match._id, true)}
    }
}

function renderProviders(serviceId, preferSelected=false){
    const select=$("providerSelect");
    const matches=services.filter(s=>String(s._id)===String(serviceId));
    providers=matches;
    select.innerHTML='<option value="">Select a provider</option>';
    matches.forEach(s=>{
        if(!s.provider) return;
        const o=document.createElement("option");o.value=s.provider._id;o.dataset.serviceId=s._id;o.textContent=`${s.provider.name} — ${s.serviceName}`;select.appendChild(o);
    });
    if(preferSelected&&selectedProviderProfile?.name){
        const option=[...select.options].find(o=>o.textContent.toLowerCase().startsWith(String(selectedProviderProfile.name).toLowerCase()));
        if(option) select.value=option.value;
    }
    loadSlots();
}

async function loadSlots(){
    const provider=$("providerSelect").value,date=$("bookingDate").value,select=$("bookingTime");
    select.innerHTML='<option value="">Loading slots...</option>';
    if(!provider||!date){select.innerHTML='<option value="">Choose provider and date</option>';return}
    try{
        const response=await fetch(`${API_BASE_URL}/api/bookings/availability?provider=${encodeURIComponent(provider)}&date=${encodeURIComponent(date)}`);
        const data=await response.json();
        if(!response.ok||!data.success) throw new Error(data.message||"Unable to load slots");
        select.innerHTML='<option value="">Select an available slot</option>';
        data.slots.filter(s=>s.available).forEach(s=>{const o=document.createElement("option");o.value=s.value;o.textContent=s.label;select.appendChild(o)});
        if(select.options.length===1) select.innerHTML='<option value="">No slots available</option>';
    }catch(e){select.innerHTML='<option value="">Unable to load slots</option>';setResult(e.message,true)}
}

$("serviceSelect").addEventListener("change",e=>renderProviders(e.target.value));
$("providerSelect").addEventListener("change",loadSlots);
$("bookingDate").addEventListener("change",loadSlots);

$("confirmBooking").addEventListener("click",async()=>{
    if(!token){setResult("Please login first.",true);setTimeout(()=>location.href="../login.html",600);return}
    const serviceId=$("serviceSelect").value,provider=$("providerSelect").value;
    const service=services.find(s=>String(s._id)===String(serviceId)&&String(s.provider?._id)===String(provider));
    if(!service||!provider||!$("bookingDate").value||!$("bookingTime").value||!$("bookingLocation").value.trim()){
        setResult("Please complete service, provider, date, time and location.",true);return;
    }
    const button=$("confirmBooking");button.disabled=true;setResult("Creating booking...");
    try{
        const response=await fetch(`${API_BASE_URL}/api/bookings/`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`},body:JSON.stringify({provider,service:service._id,serviceName:service.serviceName,description:$("description").value.trim(),bookingDate:$("bookingDate").value,bookingTime:$("bookingTime").value,location:$("bookingLocation").value.trim(),agreedPrice:$("price").value?Number($("price").value):undefined,isEmergency:false})});
        const data=await response.json();
        if(!response.ok||!data.success) throw new Error(data.message||"Booking failed");
        localStorage.setItem("KAMSETUSelectedBooking",data.booking._id);
        localStorage.setItem("selectedProvider",service.provider.name);
        setResult("Booking created successfully.");
        setTimeout(()=>location.href=mode==="negotiation"?"customer-negotiation.html":"customer-bookings.html",700);
    }catch(e){setResult(e.message,true);button.disabled=false}
});

if(mode==="negotiation"){
    $("modeNotice").textContent="Negotiation mode: create the booking first. You will be taken directly to price negotiation after confirmation.";
    $("modeNotice").classList.remove("hidden");
}
setMinimumDate();
loadServices().catch(e=>setResult(e.message,true));

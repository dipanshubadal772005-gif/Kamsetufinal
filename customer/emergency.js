const API_BASE_URL=window.KAMSETU_API_URL;
const token=localStorage.getItem("KAMSETUToken")||sessionStorage.getItem("KAMSETUToken")||"";
let latitude=null,longitude=null,providers=[];
const $=id=>document.getElementById(id);
function setResult(msg,error=false){$("result").textContent=msg;$("result").style.color=error?"#c0392b":"#0077b6"}
function esc(v){return String(v??"").replace(/[&<>'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]))}
$("locate").onclick=()=>{
    if(!navigator.geolocation){setResult("Geolocation is not supported by this browser.",true);return}
    setResult("Getting your location...");
    navigator.geolocation.getCurrentPosition(pos=>{latitude=pos.coords.latitude;longitude=pos.coords.longitude;$("coords").textContent=`Location captured: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;setResult("Location captured.")},err=>setResult("Location permission is required for emergency matching.",true),{enableHighAccuracy:true,timeout:10000,maximumAge:30000});
};
$("find").onclick=async()=>{
    if(!token){setResult("Please login first.",true);setTimeout(()=>location.href="../login.html",500);return}
    if(latitude===null||longitude===null){setResult("Capture your current location first.",true);return}
    setResult("Finding emergency providers...");
    try{
        const service=$("service").value.trim();
        const r=await fetch(`${API_BASE_URL}/api/bookings/emergency/providers?latitude=${latitude}&longitude=${longitude}&service=${encodeURIComponent(service)}`,{headers:{Authorization:`Bearer ${token}`}});
        const d=await r.json();if(!r.ok||!d.success)throw new Error(d.message||"Unable to find providers");
        providers=d.providers||[];renderProviders();
        if(!providers.length)setResult("No matching provider was found. Try a broader service name.",true);
    }catch(e){setResult(e.message,true)}
};
function renderProviders(){
    $("providers").innerHTML=providers.map((p,i)=>`<div class="provider"><strong>${esc(p.providerName)}</strong><span>${esc(p.serviceName)}</span><span class="badge">${p.distanceKm===null?'Distance unavailable':`${p.distanceKm} km away`}</span><span>Starting price: ₹${Number(p.startingPrice||0)}</span><span class="muted">${p.locationAvailable?'Live location available':'Provider location not currently shared'}</span><button onclick="createEmergency(${i})">Request Emergency Service</button></div>`).join("");
}
window.createEmergency=async function(index){
    const p=providers[index];if(!p)return;
    if(!$("location").value.trim()){setResult("Enter your address/area before requesting service.",true);return}
    setResult(`Sending emergency request to ${p.providerName}...`);
    try{
        const r=await fetch(`${API_BASE_URL}/api/bookings/emergency`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`},body:JSON.stringify({provider:p.providerId,service:p.serviceId,serviceName:p.serviceName,description:$("description").value.trim()||"Emergency service request",location:$("location").value.trim(),locationCoordinates:{latitude,longitude},agreedPrice:p.startingPrice})});
        const d=await r.json();if(!r.ok||!d.success)throw new Error(d.message||"Emergency booking failed");
        localStorage.setItem("KAMSETUSelectedBooking",d.booking._id);localStorage.setItem("selectedProvider",p.providerName);setResult("Emergency booking created. Opening your bookings...");setTimeout(()=>location.href="customer-bookings.html",700);
    }catch(e){setResult(e.message,true)}
};

require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/user");
const ProviderProfile = require("./models/ProviderProfile");
const Service = require("./models/service");
const Booking = require("./models/booking");
const Negotiation = require("./models/negotiation");

const DEMO_CUSTOMER = {
  name: "Demo Customer",
  email: "customer.demo@kamsetu.test",
  phone: "9000000001",
  password: "Customer@12345",
  role: "customer"
};
const DEMO_PROVIDER = {
  name: "Rahul Kumar",
  email: "provider.demo@kamsetu.test",
  phone: "9000000002",
  password: "Provider@12345",
  role: "provider"
};

async function upsertUser(data) {
  const password = await bcrypt.hash(data.password, 10);
  return User.findOneAndUpdate(
    { email: data.email },
    { $set: { name:data.name, phone:data.phone, password, role:data.role } },
    { upsert:true, new:true, setDefaultsOnInsert:true }
  );
}

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  const customer = await upsertUser(DEMO_CUSTOMER);
  const provider = await upsertUser(DEMO_PROVIDER);

  const extraProviders = [
    { name:"Amit Sharma", email:"amit.demo@kamsetu.test", phone:"9000000003", password:"Provider@12345", role:"provider", type:"Plumber", price:350, serviceName:"Plumbing Repair", rating:4.7 },
    { name:"RK Cooling Services", email:"cooling.demo@kamsetu.test", phone:"9000000004", password:"Provider@12345", role:"provider", type:"AC Technician", price:900, serviceName:"AC Repair", rating:4.6 },
    { name:"Mohit Singh", email:"mohit.demo@kamsetu.test", phone:"9000000005", password:"Provider@12345", role:"provider", type:"Electrician", price:450, serviceName:"Fan Installation", rating:4.5 }
  ];
  const providerRecords = [provider];
  for (const item of extraProviders) {
    const u = await upsertUser(item);
    providerRecords.push(u);
    await ProviderProfile.findOneAndUpdate(
      { user:u._id },
      { $set:{ professionalType:item.type, experience:5, city:"Gurgaon", serviceArea:"Gurgaon", bio:`${item.serviceName} professional serving Gurgaon.`, verified:true, rating:item.rating, totalJobs:80 } },
      { upsert:true, new:true, setDefaultsOnInsert:true }
    );
    await Service.findOneAndUpdate(
      { provider:u._id, serviceName:item.serviceName },
      { $set:{ serviceType:item.type, description:`${item.serviceName} for homes and offices.`, startingPrice:item.price, isActive:true } },
      { upsert:true, new:true, setDefaultsOnInsert:true }
    );
  }

  await ProviderProfile.findOneAndUpdate(
    { user: provider._id },
    { $set: { professionalType:"Electrician", experience:5, city:"Gurgaon", serviceArea:"Sector 52, Gurgaon", bio:"Reliable home electrical repair and installation professional.", verified:true, rating:4.8, totalJobs:120 } },
    { upsert:true, new:true, setDefaultsOnInsert:true }
  );

  let service = await Service.findOneAndUpdate(
    { provider:provider._id, serviceName:"Electrical Repair" },
    { $set: { serviceType:"Electrician", description:"Switch, wiring and household electrical repair.", startingPrice:600, isActive:true } },
    { upsert:true, new:true, setDefaultsOnInsert:true }
  );
  let booking = await Booking.findOne({ customer:customer._id, provider:provider._id, bookingCode:"KM-DEMO001" });
  if (!booking) {
    const d=new Date(); d.setDate(d.getDate()+1); d.setHours(0,0,0,0);
    booking=await Booking.create({
      bookingCode:"KM-DEMO001", customer:customer._id, provider:provider._id,
      service:service._id, serviceName:"Electrical Repair",
      description:"Demo booking: switch repair and wiring inspection.",
      bookingDate:d, bookingTime:"14:00", location:"Sector 45, Gurgaon",
      locationCoordinates:{latitude:28.4370, longitude:77.0500},
      agreedPrice:600, status:"pending", isEmergency:false,
      trackingEnabled:false, trackingStartedAt:null, trackingStoppedAt:null
    });
  } else {
    booking.service=service._id; booking.serviceName="Electrical Repair";
    booking.location="Sector 45, Gurgaon";
    booking.locationCoordinates={latitude:28.4370, longitude:77.0500};
    booking.status="pending"; booking.agreedPrice=600;
    booking.trackingEnabled=false; booking.trackingStartedAt=null; booking.trackingStoppedAt=null;
    await booking.save();
  }

  await Negotiation.deleteMany({ booking:booking._id });
  await Negotiation.create({
    booking:booking._id, customer:customer._id, provider:provider._id,
    proposedPrice:500, proposedBy:"customer", status:"pending",
    message:"Can you do this service for ₹500?"
  });

  console.log("\nKAMSETU demo data ready.");
  console.log("Customer: customer.demo@kamsetu.test / Customer@12345");
  console.log("Provider: provider.demo@kamsetu.test / Provider@12345");
  console.log("Booking: KM-DEMO001 | Sector 45, Gurgaon | 28.4370, 77.0500");
  await mongoose.disconnect();
}
main().catch(err=>{ console.error(err); process.exit(1); });

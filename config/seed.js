// config/seed.js
const Service = require("../models/Service");

async function seedServices() {
  const count = await Service.countDocuments();
  if (count === 0) {
    console.log("🌱 Seeding default services...");
    await Service.insertMany([
      {
        name: "Classic Manicure",
        durationMinutes: 30,
        priceCents: 2000,
        description: "Basic manicure",
      },
      {
        name: "Gel Polish",
        durationMinutes: 45,
        priceCents: 3500,
        description: "Gel polish service",
      },
      {
        name: "Spa Pedicure",
        durationMinutes: 50,
        priceCents: 4000,
        description: "Relax pedicure",
      },
    ]);
    console.log("🌱 Services seeded");
  }
}

module.exports = seedServices;

// models/Service.js
const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  durationMinutes: { type: Number, required: true },
  priceCents: { type: Number, required: true },
  description: String,
});

const Service = mongoose.model("Service", serviceSchema);

module.exports = Service;

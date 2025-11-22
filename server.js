// ====== Load .env ======
require("dotenv").config();

// ====== Imports ======
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");

// ====== App setup ======
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ====== MongoDB Connection ======
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("❌ ERROR: MONGODB_URI is missing from .env file");
  process.exit(1);
}

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// ======================================================
//  SCHEMAS & MODELS
// ======================================================

// Services (dịch vụ)
const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  durationMinutes: { type: Number, required: true },
  priceCents: { type: Number, required: true },
  description: String,
});

const Service = mongoose.model("Service", serviceSchema);

// Bookings (đặt lịch)
const bookingSchema = new mongoose.Schema(
  {
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
    clientName: { type: String, required: true },
    clientPhone: { type: String, required: true },
    clientEmail: String,
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "confirmed",
    },
  },
  { timestamps: true },
);

const Booking = mongoose.model("Booking", bookingSchema);

// ======================================================
//  SEED DEFAULT SERVICES (chạy 1 lần)
// ======================================================
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

mongoose.connection.once("open", () => seedServices());

// ======================================================
//  HELPERS
// ======================================================

function isIsoDate(str) {
  const d = new Date(str);
  return !isNaN(d.getTime());
}

function validateBookingPayload(body, svc) {
  const errors = [];
  const { clientName, clientPhone, startTime, endTime, clientEmail } = body;

  if (!clientName || clientName.trim().length < 2)
    errors.push("clientName must be >= 2 chars");

  if (!clientPhone || clientPhone.trim().length < 6)
    errors.push("clientPhone must be >= 6 chars");

  if (!isIsoDate(startTime)) errors.push("startTime must be ISO date");
  if (!isIsoDate(endTime)) errors.push("endTime must be ISO date");

  if (startTime && endTime) {
    const s = new Date(startTime).getTime();
    const e = new Date(endTime).getTime();
    if (e <= s) errors.push("endTime must be after startTime");

    const expected = svc.durationMinutes * 60000;
    const diff = e - s;
    if (Math.abs(diff - expected) > 5 * 60000)
      errors.push(
        `duration mismatch: expected ~${svc.durationMinutes} minutes`,
      );
  }

  if (clientEmail && !/^\S+@\S+\.\S+$/.test(clientEmail))
    errors.push("clientEmail invalid");

  return errors;
}

// ======================================================
//  ROUTES
// ======================================================

// GET /api/services — lấy danh sách dịch vụ
app.get("/api/services", async (req, res) => {
  try {
    const services = await Service.find().lean();
    const mapped = services.map((s) => ({
      id: s._id.toString(),
      name: s.name,
      durationMinutes: s.durationMinutes,
      priceCents: s.priceCents,
      description: s.description,
    }));
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: "DB error" });
  }
});

// GET /api/bookings — danh sách booking
app.get("/api/bookings", async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("service")
      .sort({ startTime: -1 })
      .lean();

    const mapped = bookings.map((b) => ({
      id: b._id.toString(),
      serviceId: b.service?._id?.toString(),
      serviceName: b.service?.name,
      clientName: b.clientName,
      clientPhone: b.clientPhone,
      clientEmail: b.clientEmail,
      startTime: b.startTime,
      endTime: b.endTime,
      status: b.status,
      createdAt: b.createdAt,
    }));

    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: "DB error" });
  }
});

// POST /api/bookings — tạo booking
app.post("/api/bookings", async (req, res) => {
  try {
    const { serviceId, startTime, endTime } = req.body;

    // B1 — tìm service
    const svc = await Service.findById(serviceId).lean();
    if (!svc) return res.status(400).json({ error: "Service not found" });

    // B2 — validate
    const errors = validateBookingPayload(req.body, svc);
    if (errors.length)
      return res
        .status(400)
        .json({ error: "Validation failed", details: errors });

    // chuẩn hóa thời gian
    const sIso = new Date(startTime).toISOString();
    const eIso = new Date(endTime).toISOString();

    // B3 — check overlap (MongoDB)
    const conflict = await Booking.exists({
      status: { $in: ["pending", "confirmed"] },
      startTime: { $lt: eIso },
      endTime: { $gt: sIso },
    });

    if (conflict) return res.status(409).json({ error: "Slot already booked" });

    // B4 — tạo booking
    const booking = await Booking.create({
      service: svc._id,
      clientName: req.body.clientName,
      clientPhone: req.body.clientPhone,
      clientEmail: req.body.clientEmail || undefined,
      startTime: sIso,
      endTime: eIso,
      status: "confirmed",
    });

    return res
      .status(201)
      .json({ id: booking._id.toString(), message: "Booking created" });
  } catch (err) {
    console.error("POST /api/bookings error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ======================================================
//  START SERVER
// ======================================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`🚀 Server running at http://localhost:${PORT}`),
);

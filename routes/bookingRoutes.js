// routes/bookingRoutes.js
const express = require("express");
const Booking = require("../models/Booking");
const Service = require("../models/Service");

const router = express.Router();

// ---------- helpers ----------
function isIsoDate(str) {
  const d = new Date(str);
  return !isNaN(d.getTime());
}

function validateBookingPayload(body, svc) {
  const errors = [];
  const { clientName, clientPhone, clientEmail, startTime, endTime } = body;

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

    if (svc) {
      const expected = svc.durationMinutes * 60000;
      const diff = e - s;
      if (Math.abs(diff - expected) > 5 * 60000) {
        errors.push(
          `duration mismatch: expected ~${svc.durationMinutes} minutes`,
        );
      }
    }
  }

  if (clientEmail && !/^\S+@\S+\.\S+$/.test(clientEmail))
    errors.push("clientEmail invalid");

  return errors;
}

// ---------- routes ----------

// GET /api/bookings
router.get("/", async (req, res) => {
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
    console.error("GET /api/bookings error:", err);
    res.status(500).json({ error: "DB error" });
  }
});

// POST /api/bookings
router.post("/", async (req, res) => {
  try {
    const {
      serviceId,
      clientName,
      clientPhone,
      clientEmail,
      startTime,
      endTime,
    } = req.body;

    // B1: tìm service
    const svc = await Service.findById(serviceId).lean();
    if (!svc) return res.status(400).json({ error: "Service not found" });

    // B2: validate
    const errors = validateBookingPayload(req.body, svc);
    if (errors.length) {
      return res
        .status(400)
        .json({ error: "Validation failed", details: errors });
    }

    // chuẩn hóa thời gian
    const sIso = new Date(startTime).toISOString();
    const eIso = new Date(endTime).toISOString();

    // B3: check overlap
    const conflict = await Booking.exists({
      status: { $in: ["pending", "confirmed"] },
      startTime: { $lt: eIso },
      endTime: { $gt: sIso },
    });

    if (conflict) {
      return res.status(409).json({ error: "Slot already booked" });
    }

    // B4: tạo booking
    const booking = await Booking.create({
      service: svc._id,
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim(),
      clientEmail: clientEmail ? clientEmail.trim() : undefined,
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

module.exports = router;

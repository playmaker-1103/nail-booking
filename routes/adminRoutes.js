// routes/adminRoutes.js
const express = require("express");
const Booking = require("../models/Booking");

const router = express.Router();

/**
 * GET /api/admin/bookings?date=YYYY-MM-DD (optional)
 */
router.get("/bookings", async (req, res) => {
  try {
    const { date } = req.query;
    const filter = {};

    if (date) {
      const dayStart = new Date(date);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);
      filter.startTime = { $gte: dayStart, $lte: dayEnd };
    }

    const bookings = await Booking.find(filter)
      .populate("service")
      .sort({ startTime: 1 })
      .lean();

    const mapped = bookings.map((b) => ({
      id: b._id.toString(),
      serviceName: b.service?.name || "(đã xóa dịch vụ)",
      clientName: b.clientName,
      clientPhone: b.clientPhone,
      clientEmail: b.clientEmail,
      startTime: b.startTime,
      endTime: b.endTime,
      status: b.status,
    }));

    res.json(mapped);
  } catch (err) {
    console.error("GET /api/admin/bookings error:", err);
    res.status(500).json({ error: "DB error" });
  }
});

/**
 * PATCH /api/admin/bookings/:id/cancel
 */
router.patch("/bookings/:id/cancel", async (req, res) => {
  try {
    await Booking.findByIdAndUpdate(req.params.id, { status: "cancelled" });
    res.json({ ok: true });
  } catch (err) {
    console.error("PATCH cancel error:", err);
    res.status(500).json({ error: "DB error" });
  }
});

/**
 * PATCH /api/admin/bookings/:id/confirm
 */
router.patch("/bookings/:id/confirm", async (req, res) => {
  try {
    await Booking.findByIdAndUpdate(req.params.id, { status: "confirmed" });
    res.json({ ok: true });
  } catch (err) {
    console.error("PATCH confirm error:", err);
    res.status(500).json({ error: "DB error" });
  }
});

module.exports = router;

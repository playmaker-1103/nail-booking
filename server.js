// server.js (Stage 1 - in-memory APIs)
const express = require("express");
const path = require("path");
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ===== Mock data (in-memory) =====
let SERVICES = [
  {
    id: 1,
    name: "Classic Manicure",
    durationMinutes: 30,
    priceCents: 2000,
    description: "Basic manicure",
  },
  {
    id: 2,
    name: "Gel Polish",
    durationMinutes: 45,
    priceCents: 3500,
    description: "Gel polish service",
  },
  {
    id: 3,
    name: "Spa Pedicure",
    durationMinutes: 50,
    priceCents: 4000,
    description: "Relax pedicure",
  },
];

let BOOKINGS = []; // in-memory (mất khi restart)
let nextBookingId = 1;

// ===== Helpers =====
function isIsoDate(str) {
  const d = new Date(str);
  return !isNaN(d.getTime());
}
function overlap(aStart, aEnd, bStart, bEnd) {
  return !(aEnd <= bStart || aStart >= bEnd);
}
function validateBookingPayload(body) {
  const errors = [];
  const {
    serviceId,
    clientName,
    clientPhone,
    clientEmail,
    startTime,
    endTime,
  } = body;

  if (serviceId == null) errors.push("serviceId is required");
  if (!clientName || String(clientName).trim().length < 2)
    errors.push("clientName is required (>=2 chars)");
  if (!clientPhone || String(clientPhone).trim().length < 6)
    errors.push("clientPhone is required (>=6 chars)");
  if (!startTime || !isIsoDate(startTime))
    errors.push("startTime must be ISO date string");
  if (!endTime || !isIsoDate(endTime))
    errors.push("endTime must be ISO date string");

  if (startTime && endTime) {
    const s = new Date(startTime).getTime();
    const e = new Date(endTime).getTime();
    if (e <= s) errors.push("endTime must be after startTime");

    const svc = SERVICES.find((x) => x.id === Number(serviceId));
    if (svc) {
      const expect = svc.durationMinutes * 60000;
      const diff = e - s;
      if (Math.abs(diff - expect) > 5 * 60000) {
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

// ===== Routes =====

// Services
app.get("/api/services", (req, res) => {
  res.json(SERVICES);
});

// List bookings (tạm public để tiện dev)
app.get("/api/bookings", (req, res) => {
  const rows = [...BOOKINGS].sort(
    (a, b) => new Date(b.startTime) - new Date(a.startTime),
  );
  res.json(rows);
});

// Create booking
app.post("/api/bookings", (req, res) => {
  try {
    const errors = validateBookingPayload(req.body);
    if (errors.length)
      return res
        .status(400)
        .json({ error: "Validation failed", details: errors });

    const {
      serviceId,
      clientName,
      clientPhone,
      clientEmail,
      startTime,
      endTime,
    } = req.body;

    const svc = SERVICES.find((s) => s.id === Number(serviceId));
    if (!svc) return res.status(400).json({ error: "Service not found" });

    const sNew = new Date(startTime).toISOString();
    const eNew = new Date(endTime).toISOString();

    const hasConflict = BOOKINGS.some((b) => {
      if (b.status !== "confirmed" && b.status !== "pending") return false;
      return overlap(
        new Date(b.startTime),
        new Date(b.endTime),
        new Date(sNew),
        new Date(eNew),
      );
    });
    if (hasConflict)
      return res.status(409).json({ error: "Slot already booked" });

    const newBooking = {
      id: nextBookingId++,
      serviceId: Number(serviceId),
      clientName: String(clientName).trim(),
      clientPhone: String(clientPhone).trim(),
      clientEmail: clientEmail ? String(clientEmail).trim() : null,
      startTime: new Date(startTime).toLocaleString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
      endTime: new Date(endTime).toLocaleString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
      status: "confirmed",
      createdAt: new Date().toISOString(),
    };
    BOOKINGS.push(newBooking);

    return res
      .status(201)
      .json({ id: newBooking.id, message: "Booking created" });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
});

// Start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Server listening http://localhost:${PORT}`),
);

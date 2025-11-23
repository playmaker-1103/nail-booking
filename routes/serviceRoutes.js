// routes/serviceRoutes.js
const express = require("express");
const Service = require("../models/Service");

const router = express.Router();

// GET /api/services
router.get("/", async (req, res) => {
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
    console.error("GET /api/services error:", err);
    res.status(500).json({ error: "DB error" });
  }
});

module.exports = router;

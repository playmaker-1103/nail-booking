// routes/authRoutes.js
const express = require("express");
const jwt = require("jsonwebtoken");

const router = express.Router();

/**
 * POST /api/auth/login
 * Body: { email, password }
 * Nếu đúng -> trả về { token }
 */
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  if (email !== adminEmail || password !== adminPassword) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = jwt.sign({ email, role: "admin" }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "2h",
  });

  res.json({ token });
});

module.exports = router;

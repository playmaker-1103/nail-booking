// server.js - phiên bản có auth admin

require("dotenv").config();

const express = require("express");
const path = require("path");

const connectDB = require("./config/db");
const seedServices = require("./config/seed");

const serviceRoutes = require("./routes/serviceRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const adminRoutes = require("./routes/adminRoutes");
const authRoutes = require("./routes/authRoutes");
const { requireAdmin } = require("./middleware/auth");

const app = express();

// ------- middleware global -------
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ------- routes public (khách) -------
app.use("/api/services", serviceRoutes);
app.use("/api/bookings", bookingRoutes);

// ------- routes auth (login admin) -------
app.use("/api/auth", authRoutes);

// ------- routes admin (bảo vệ bởi requireAdmin) -------
app.use("/api/admin", requireAdmin, adminRoutes);

// ------- start server sau khi connect DB -------
const PORT = process.env.PORT || 3000;

(async () => {
  try {
    await connectDB();
    await seedServices();
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
})();

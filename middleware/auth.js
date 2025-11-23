// middleware/auth.js
const jwt = require("jsonwebtoken");

/**
 * Middleware bảo vệ các route admin.
 * Yêu cầu header: Authorization: Bearer <token>
 */
function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization || "";

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res
      .status(401)
      .json({ error: "Missing or invalid Authorization header" });
  }

  const token = parts[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    if (payload.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }

    // Lưu thông tin user vào req nếu sau này cần
    req.user = payload;
    next();
  } catch (err) {
    console.error("JWT verify error:", err.message);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

module.exports = { requireAdmin };

const jwt = require("jsonwebtoken");
const db = require("../models");

const SECRET_KEY = process.env.JWT_SECRET || "your_secret_key";
const { admin: Admin, role: Role } = db;

// Ported from tps-next-backend's middlewares/requireStaff.js, adapted for
// the real roles/admins RBAC model instead of a flat `company.role` string.
// Verifies the JWT, loads the admin + its role, rejects non-active admins,
// and attaches req.admin / req.role / req.permissions for downstream
// requirePermission() checks.
module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const token = authHeader.split(" ")[1];

    let decoded;
    try {
      decoded = jwt.verify(token, SECRET_KEY);
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    // A refresh token must never be accepted as an access token.
    if (!decoded || !decoded.admin_id || decoded.type === "refresh") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const adminRecord = await Admin.findByPk(decoded.admin_id, {
      include: [{ model: Role, as: "role" }],
    });

    if (!adminRecord) {
      return res.status(403).json({ message: "Admin account not found" });
    }

    if (adminRecord.status !== "active") {
      return res.status(403).json({ message: "Admin account is not active" });
    }

    req.admin = adminRecord;
    req.role = adminRecord.role;
    req.permissions = adminRecord.role ? adminRecord.role.permissions || {} : {};

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

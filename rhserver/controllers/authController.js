const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../models");
const asyncWrapper = require("../utils/asyncWrapper");

const { admin: Admin, role: Role } = db;

const SECRET_KEY = process.env.JWT_SECRET || "your_secret_key";
const ACCESS_TOKEN_TTL = process.env.ADMIN_ACCESS_TTL || "1h";
const REFRESH_TOKEN_TTL = process.env.ADMIN_REFRESH_TTL || "30d";

const signAccessToken = (adminRecord) =>
  jwt.sign(
    { admin_id: adminRecord.id, role_id: adminRecord.role_id, type: "access" },
    SECRET_KEY,
    { expiresIn: ACCESS_TOKEN_TTL }
  );

const signRefreshToken = (adminRecord) =>
  jwt.sign({ admin_id: adminRecord.id, type: "refresh" }, SECRET_KEY, {
    expiresIn: REFRESH_TOKEN_TTL,
  });

const sanitize = (adminRecord) => ({
  id: adminRecord.id,
  name: adminRecord.name,
  email: adminRecord.email,
  status: adminRecord.status,
  role: adminRecord.role
    ? {
        id: adminRecord.role.id,
        name: adminRecord.role.name,
        permissions: adminRecord.role.permissions,
      }
    : null,
});

// POST /auth/login — email/password only. No Google OAuth login in this build.
const login = asyncWrapper(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const adminRecord = await Admin.findOne({
    where: { email },
    include: [{ model: Role, as: "role" }],
  });
  if (!adminRecord) return res.status(404).json({ error: "Admin not found" });

  if (adminRecord.status !== "active") {
    return res.status(403).json({
      error:
        adminRecord.status === "invited"
          ? "Invitation not yet accepted. Please set your password first."
          : "This account has been disabled.",
    });
  }

  if (!adminRecord.password_hash) {
    return res.status(400).json({ error: "Password not set for this account" });
  }

  const isMatch = await bcrypt.compare(password, adminRecord.password_hash);
  if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

  adminRecord.last_login_at = new Date();
  await adminRecord.save();

  res.json({
    message: "Login successful",
    token: signAccessToken(adminRecord),
    refreshToken: signRefreshToken(adminRecord),
    admin: sanitize(adminRecord),
  });
});

// POST /auth/refresh — exchange a valid refresh token for a new access token.
const refreshToken = asyncWrapper(async (req, res) => {
  const incoming = req.body.refreshToken || req.body.refresh_token;
  if (!incoming) return res.status(400).json({ error: "Refresh token required" });

  let decoded;
  try {
    decoded = jwt.verify(incoming, SECRET_KEY);
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired refresh token" });
  }

  if (!decoded || decoded.type !== "refresh" || !decoded.admin_id) {
    return res.status(401).json({ error: "Invalid refresh token" });
  }

  const adminRecord = await Admin.findByPk(decoded.admin_id);
  if (!adminRecord || adminRecord.status !== "active") {
    return res.status(401).json({ error: "Admin not found or inactive" });
  }

  return res.json({ token: signAccessToken(adminRecord) });
});

// POST /auth/invite/info — look up an admin's name/email by invite token,
// for the "accept invite" screen to greet them before they set a password.
const getInviteInfo = asyncWrapper(async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: "Token is required" });

  const adminRecord = await Admin.findOne({
    where: { invite_token: token },
    attributes: ["name", "email", "invite_token_expires_at", "status"],
  });

  if (!adminRecord) return res.status(404).json({ error: "Invalid invite token" });

  if (
    adminRecord.invite_token_expires_at &&
    new Date(adminRecord.invite_token_expires_at) < new Date()
  ) {
    return res.status(400).json({ error: "Invite token has expired" });
  }

  res.status(200).json({
    admin: { name: adminRecord.name, email: adminRecord.email },
  });
});

// POST /auth/accept-invite — sets the password and activates the account.
const acceptInvite = asyncWrapper(async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) {
    return res.status(400).json({ error: "Token and password are required" });
  }

  const adminRecord = await Admin.findOne({ where: { invite_token: token } });
  if (!adminRecord) return res.status(400).json({ error: "Invalid or expired token" });

  if (
    adminRecord.invite_token_expires_at &&
    new Date(adminRecord.invite_token_expires_at) < new Date()
  ) {
    return res.status(400).json({ error: "Invite token has expired" });
  }

  adminRecord.password_hash = await bcrypt.hash(password, 10);
  adminRecord.status = "active";
  adminRecord.invite_token = null;
  adminRecord.invite_token_expires_at = null;
  await adminRecord.save();

  res.status(200).json({ message: "Password set successfully. You can now log in." });
});

// GET /auth/me — current authenticated admin (req.admin set by authenticate.js).
const me = asyncWrapper(async (req, res) => {
  const adminRecord = await Admin.findByPk(req.admin.id, {
    include: [{ model: Role, as: "role" }],
  });
  res.status(200).json({ admin: sanitize(adminRecord) });
});

module.exports = {
  login,
  refreshToken,
  getInviteInfo,
  acceptInvite,
  me,
};

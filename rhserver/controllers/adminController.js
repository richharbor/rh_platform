const { v4: uuidv4 } = require("uuid");
const db = require("../models");
const asyncWrapper = require("../utils/asyncWrapper");
const sendEmail = require("../service/email/sendEmail");
const inviteEmailTemplate = require("../service/email/inviteEmailTemplate");
const { getPaginationParams, getMeta } = require("../utils/pagination");

const { admin: Admin, role: Role } = db;

const INVITE_TOKEN_TTL_DAYS = parseInt(process.env.INVITE_TOKEN_TTL_DAYS || "7", 10);

function generateInviteEmailHtml(inviteLink) {
  let html = inviteEmailTemplate();
  return html.replace(/\{\{inviteLink\}\}/g, inviteLink);
}

// POST /admin/invite — Settings > Team > Invite. Creates an `invited`
// admin with no password and emails an accept-invite link via Google SMTP.
const inviteAdmin = asyncWrapper(async (req, res) => {
  const { name, email, role_id } = req.body;
  if (!name || !email || !role_id) {
    return res.status(400).json({ error: "name, email and role_id are required" });
  }

  const existing = await Admin.findOne({ where: { email } });
  if (existing) return res.status(400).json({ error: "Email already exists" });

  const role = await Role.findByPk(role_id);
  if (!role) return res.status(400).json({ error: "Role not found" });

  const token = uuidv4();
  const expiresAt = new Date(Date.now() + INVITE_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);

  const created = await Admin.create({
    name,
    email,
    role_id,
    status: "invited",
    invite_token: token,
    invite_token_expires_at: expiresAt,
    invited_by: req.admin ? req.admin.id : null,
  });

  const inviteLink = `${process.env.ADMIN_FRONTEND_URL}/auth/invite?token=${token}`;
  const emailHtml = generateInviteEmailHtml(inviteLink);

  const result = await sendEmail({
    to: email,
    subject: "You're invited to Rich Harbor Admin",
    html: emailHtml,
    fromName: "Rich Harbor",
    meta: { source: "admin_invite", sourceId: created.id },
  });

  res.status(200).json({
    message: result === "success" ? "Invite sent" : "Admin created, but invite email failed to send",
    inviteLink,
    admin: { id: created.id, name: created.name, email: created.email },
  });
});

// GET /admin — Settings > Team list.
const listAdmins = asyncWrapper(async (req, res) => {
  const { page, limit, offset } = getPaginationParams(req.query, 20, 100);

  const { rows, count } = await Admin.findAndCountAll({
    attributes: { exclude: ["password_hash", "invite_token"] },
    include: [{ model: Role, as: "role" }],
    order: [["createdAt", "DESC"]],
    limit,
    offset,
  });

  res.status(200).json({ admins: rows, meta: getMeta(count, page, limit) });
});

// PATCH /admin/:id — update name/role/status.
const updateAdmin = asyncWrapper(async (req, res) => {
  const { id } = req.params;
  const { name, role_id, status } = req.body;

  const adminRecord = await Admin.findByPk(id);
  if (!adminRecord) return res.status(404).json({ error: "Admin not found" });

  if (role_id) {
    const role = await Role.findByPk(role_id);
    if (!role) return res.status(400).json({ error: "Role not found" });
    adminRecord.role_id = role_id;
  }
  if (name) adminRecord.name = name;
  if (status) adminRecord.status = status;

  await adminRecord.save();

  res.status(200).json({ message: "Admin updated successfully", admin: adminRecord });
});

// DELETE /admin/:id — removes a team member. Cannot remove yourself.
const removeAdmin = asyncWrapper(async (req, res) => {
  const { id } = req.params;

  if (req.admin && String(req.admin.id) === String(id)) {
    return res.status(400).json({ error: "You cannot remove your own account" });
  }

  const adminRecord = await Admin.findByPk(id);
  if (!adminRecord) return res.status(404).json({ error: "Admin not found" });

  await adminRecord.destroy();

  res.status(200).json({ message: "Admin removed successfully" });
});

module.exports = { inviteAdmin, listAdmins, updateAdmin, removeAdmin };

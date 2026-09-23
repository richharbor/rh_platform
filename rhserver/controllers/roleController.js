const db = require("../models");
const asyncWrapper = require("../utils/asyncWrapper");

const { role: Role, admin: Admin } = db;

// GET /roles — Settings > Roles list.
const listRoles = asyncWrapper(async (req, res) => {
  const roles = await Role.findAll({ order: [["createdAt", "ASC"]] });
  res.status(200).json({ roles });
});

// POST /roles
const createRole = asyncWrapper(async (req, res) => {
  const { name, description, permissions } = req.body;
  if (!name) return res.status(400).json({ error: "name is required" });

  const existing = await Role.findOne({ where: { name } });
  if (existing) return res.status(400).json({ error: "Role name already exists" });

  const role = await Role.create({
    name,
    description: description || null,
    permissions: permissions || {},
  });

  res.status(201).json({ message: "Role created", role });
});

// PATCH /roles/:id
const updateRole = asyncWrapper(async (req, res) => {
  const { id } = req.params;
  const { name, description, permissions } = req.body;

  const role = await Role.findByPk(id);
  if (!role) return res.status(404).json({ error: "Role not found" });

  if (role.is_system) {
    return res.status(400).json({ error: "The Super Admin role cannot be edited" });
  }

  if (name) role.name = name;
  if (description !== undefined) role.description = description;
  if (permissions) role.permissions = permissions;

  await role.save();

  res.status(200).json({ message: "Role updated", role });
});

// DELETE /roles/:id — blocked if is_system, or if any admin still holds it.
const deleteRole = asyncWrapper(async (req, res) => {
  const { id } = req.params;

  const role = await Role.findByPk(id);
  if (!role) return res.status(404).json({ error: "Role not found" });

  if (role.is_system) {
    return res.status(400).json({ error: "The Super Admin role cannot be deleted" });
  }

  const adminsWithRole = await Admin.count({ where: { role_id: id } });
  if (adminsWithRole > 0) {
    return res
      .status(400)
      .json({ error: "Cannot delete a role that is still assigned to admins" });
  }

  await role.destroy();

  res.status(200).json({ message: "Role deleted" });
});

module.exports = { listRoles, createRole, updateRole, deleteRole };

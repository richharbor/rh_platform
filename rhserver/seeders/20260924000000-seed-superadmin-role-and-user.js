"use strict";

const bcrypt = require("bcryptjs");
const { getSchema } = require("../config/schema");

const FULL_PERMISSIONS = {
  blogs: { view: true, create: true, edit: true, delete: true, publish: true },
  leads: { view: true, edit: true, assign: true, delete: true, export: true },
  marketing: {
    view: true,
    manage_campaigns: true,
    send_campaigns: true,
    manage_contacts: true,
    manage_unsubscribes: true,
  },
  admin_management: { view: true, invite: true, manage_roles: true, remove: true },
};

module.exports = {
  async up(queryInterface) {
    const schema = getSchema();
    const now = new Date();

    const email = process.env.SEED_SUPERADMIN_EMAIL || "superadmin@richharbor.local";
    const password = process.env.SEED_SUPERADMIN_PASSWORD || "ChangeMe123!";
    const passwordHash = await bcrypt.hash(password, 10);

    const [existingRole] = await queryInterface.sequelize.query(
      `SELECT id FROM "${schema}"."roles" WHERE name = 'Super Admin' LIMIT 1`
    );

    let roleId;
    if (existingRole.length) {
      roleId = existingRole[0].id;
    } else {
      const [inserted] = await queryInterface.sequelize.query(
        `INSERT INTO "${schema}"."roles" (name, description, permissions, is_system, created_at, updated_at)
         VALUES ('Super Admin', 'Full access to every module. Seeded, cannot be edited or deleted.', :permissions, true, :now, :now)
         RETURNING id`,
        {
          replacements: { permissions: JSON.stringify(FULL_PERMISSIONS), now },
        }
      );
      roleId = inserted[0].id;
    }

    const [existingAdmin] = await queryInterface.sequelize.query(
      `SELECT id FROM "${schema}"."admins" WHERE email = :email LIMIT 1`,
      { replacements: { email } }
    );

    if (!existingAdmin.length) {
      await queryInterface.sequelize.query(
        `INSERT INTO "${schema}"."admins"
           (name, email, password_hash, role_id, status, created_at, updated_at)
         VALUES ('Super Admin', :email, :passwordHash, :roleId, 'active', :now, :now)`,
        { replacements: { email, passwordHash, roleId, now } }
      );
      console.log(`Seeded Super Admin login: ${email} / ${password}`);
    } else {
      console.log(`Super Admin ${email} already exists, skipping.`);
    }
  },

  async down(queryInterface) {
    const schema = getSchema();
    const email = process.env.SEED_SUPERADMIN_EMAIL || "superadmin@richharbor.local";
    await queryInterface.sequelize.query(
      `DELETE FROM "${schema}"."admins" WHERE email = :email`,
      { replacements: { email } }
    );
    await queryInterface.sequelize.query(
      `DELETE FROM "${schema}"."roles" WHERE name = 'Super Admin'`
    );
  },
};

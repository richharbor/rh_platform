"use strict";

const bcrypt = require("bcryptjs");

module.exports = {
  async up(queryInterface, Sequelize) {
    if (process.env.NODE_ENV !== "development") {
      throw new Error("This local admin seed requires NODE_ENV=development.");
    }

    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    if (!email || !password) {
      throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD in rhserver/.env.");
    }

    await queryInterface.sequelize.transaction(async (transaction) => {
      const select = (sql, replacements) => queryInterface.sequelize.query(sql, {
        replacements, transaction, type: Sequelize.QueryTypes.SELECT,
      });
      const insert = async (table, values) => {
        const rows = await queryInterface.bulkInsert(table, [{
          ...values, createdAt: new Date(), updatedAt: new Date(),
        }], { transaction, returning: true });
        return rows[0];
      };

      let [user] = await select('SELECT * FROM "Users" WHERE email = :email', { email });
      if (user && (!user.isSuperAdmin || !user.isActive || !user.emailVerified || user.tier !== 1)) {
        throw new Error("An incompatible user already has ADMIN_EMAIL; seed will not overwrite it.");
      }
      if (!user) {
        user = await insert("Users", {
          email,
          password: await bcrypt.hash(password, 10),
          firstName: "Super",
          lastName: "Admin",
          tier: 1,
          isSuperAdmin: true,
          isActive: true,
          emailVerified: true,
        });
      }

      let [role] = await select('SELECT * FROM "Roles" WHERE name = :name AND "franchiseId" IS NULL', {
        name: "superadmin",
      });
      if (!role) {
        role = await insert("Roles", {
          name: "superadmin", description: "Manage all",
          permissions: JSON.stringify(["all"]), isActive: true,
        });
      }

      const [assignment] = await select('SELECT id FROM "UserRoles" WHERE "userId" = :userId AND "roleId" = :roleId', {
        userId: user.id, roleId: role.id,
      });
      if (!assignment) {
        await insert("UserRoles", {
          userId: user.id, roleId: role.id, isPrimary: true,
          isActive: true, assignedAt: new Date(),
        });
      }

      const [application] = await select('SELECT id FROM "OnboardingApplications" WHERE "userId" = :userId AND "requestedRoleId" = :roleId', {
        userId: user.id, roleId: role.id,
      });
      if (!application) {
        await insert("OnboardingApplications", {
          userId: user.id, requestedRoleId: role.id,
          currentStep: 5, completedSteps: JSON.stringify([1, 2, 3, 4, 5]),
          status: "approved", formData: JSON.stringify({ systemGenerated: true }),
          documents: JSON.stringify({}), reviewedBy: user.id,
          reviewedAt: new Date(), reviewNotes: "Local super admin seed.",
        });
      }
    });
  },

  async down() {
    throw new Error("Remove the local admin explicitly; this seed may reuse existing records.");
  },
};

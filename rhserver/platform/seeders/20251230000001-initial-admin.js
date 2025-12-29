'use strict';
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Seed Roles
    const roles = [
      { id: uuidv4(), name: 'Super Admin', permissions: JSON.stringify({ all: true }), description: 'Full Access', createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), name: 'Ops', permissions: JSON.stringify({ leads: true, partners: true }), description: 'Operations Manager', createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), name: 'Finance', permissions: JSON.stringify({ payouts: true, wallet: true }), description: 'Finance Manager', createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), name: 'RM', permissions: JSON.stringify({ leads: 'assigned_only' }), description: 'Relationship Manager', createdAt: new Date(), updatedAt: new Date() }
    ];

    // Using bulkInsert with updateOnDuplicate to be idempotent
    for (const role of roles) {
      const exists = await queryInterface.rawSelect('admin_roles', {
        where: { name: role.name },
      }, ['id']);

      if (!exists) {
        await queryInterface.bulkInsert('admin_roles', [role]);
      }
    }

    // 2. Seed Super Admin
    const superAdminRoleId = await queryInterface.rawSelect('admin_roles', {
      where: { name: 'Super Admin' },
    }, ['id']);

    if (superAdminRoleId) {
      const hashedPassword = await bcrypt.hash('1q2w3e', 10);
      const adminEmail = 'admin@richharbor.com';

      const adminExists = await queryInterface.rawSelect('admins', {
        where: { email: adminEmail },
      }, ['id']);

      if (!adminExists) {
        await queryInterface.bulkInsert('admins', [{
          id: uuidv4(),
          name: 'Super Admin',
          email: adminEmail,
          password_hash: hashedPassword,
          role_id: superAdminRoleId,
          is_active: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }]);
      }
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('admins', { email: 'admin@richharbor.com' }, {});
    await queryInterface.bulkDelete('admin_roles', null, {});
  }
};

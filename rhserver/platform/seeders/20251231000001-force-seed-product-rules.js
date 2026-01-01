'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Ensure we have the correct product rules
        const rules = [
            { product_type: 'insurance', reward_percentage: 15.0, is_active: true },
            { product_type: 'loans', reward_percentage: 1.0, is_active: true },
            { product_type: 'equity', reward_percentage: 5.0, is_active: true },
            { product_type: 'unlisted', reward_percentage: 25.0, is_active: true },
            { product_type: 'stocks', reward_percentage: 0.5, is_active: true }
        ];

        for (const rule of rules) {
            // Upsert: Try to update, if not found then insert
            // Note: We can't use bulkCreate with updateOnDuplicate easily in standard SQL without knowing dialect specifics quirks sometimes,
            // but simplistic approach: check existence or delete/re-insert.

            // Delete old "Capitalized" duplicates if they exist
            const capitalizedType = rule.product_type.charAt(0).toUpperCase() + rule.product_type.slice(1);
            if (capitalizedType !== rule.product_type) {
                await queryInterface.bulkDelete('product_rules', { product_type: capitalizedType });
            }

            const exists = await queryInterface.rawSelect('product_rules', {
                where: { product_type: rule.product_type },
            }, ['id']);

            if (!exists) {
                await queryInterface.bulkInsert('product_rules', [{
                    ...rule,
                    created_at: new Date(),
                    updated_at: new Date()
                }]);
            } else {
                // Optional: Update percentage if it differs? No, let's respect user edits.
                // But we DO want to ensure the record EXISTS.
            }
        }
    },

    down: async (queryInterface, Sequelize) => {
        // No-op
    }
};

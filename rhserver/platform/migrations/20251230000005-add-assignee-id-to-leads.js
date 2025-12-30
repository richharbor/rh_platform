'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('leads', 'assignee_id', {
            type: Sequelize.UUID,
            allowNull: true,
            references: {
                model: 'admins',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL'
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('leads', 'assignee_id');
    }
};

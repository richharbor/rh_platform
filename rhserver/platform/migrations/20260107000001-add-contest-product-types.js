'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('contests', 'product_type', {
            type: Sequelize.STRING,
            allowNull: true
        });
        await queryInterface.addColumn('contests', 'product_sub_type', {
            type: Sequelize.STRING,
            allowNull: true
        });
        await queryInterface.addColumn('contests', 'file_url', {
            type: Sequelize.STRING,
            allowNull: true
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('contests', 'product_type');
        await queryInterface.removeColumn('contests', 'product_sub_type');
        await queryInterface.removeColumn('contests', 'file_url');
    }
};

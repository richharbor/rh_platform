module.exports = (sequelize, DataTypes) => {
    const RoleUpgradeRequest = sequelize.define('RoleUpgradeRequest', {
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        current_role: {
            type: DataTypes.STRING,
            allowNull: false
        },
        requested_role: {
            type: DataTypes.STRING,
            allowNull: false
        },
        status: {
            type: DataTypes.STRING,
            defaultValue: 'pending', // pending, approved, rejected
            allowNull: false
        },
        business_data: {
            type: DataTypes.JSON,
            allowNull: true,
            defaultValue: {}
        },
        reason: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        admin_notes: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        reviewed_by: {
            type: DataTypes.UUID,
            allowNull: true
        },
        reviewed_at: {
            type: DataTypes.DATE,
            allowNull: true
        },
        last_upgrade_request_at: {
            type: DataTypes.DATE,
            allowNull: true
        }
    }, {
        tableName: 'role_upgrade_requests',
        underscored: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    RoleUpgradeRequest.associate = function (models) {
        RoleUpgradeRequest.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
        RoleUpgradeRequest.belongsTo(models.Admin, { foreignKey: 'reviewed_by', as: 'reviewer' });
    };

    return RoleUpgradeRequest;
};

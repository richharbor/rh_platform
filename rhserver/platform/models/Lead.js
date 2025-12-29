module.exports = (sequelize, DataTypes) => {
    const Lead = sequelize.define("Lead", {
        product_type: { type: DataTypes.STRING, allowNull: false },
        lead_type: { type: DataTypes.STRING, allowNull: false }, // self, partner, referral, cold
        status: { type: DataTypes.STRING, defaultValue: "new" },
        incentive_type: { type: DataTypes.STRING, defaultValue: "pending" },
        incentive_status: { type: DataTypes.STRING, defaultValue: "pending" },
        expected_payout: { type: DataTypes.STRING },

        // Client Details
        name: { type: DataTypes.STRING, allowNull: false },
        email: { type: DataTypes.STRING },
        phone: { type: DataTypes.STRING },
        city: { type: DataTypes.STRING },
        requirement: { type: DataTypes.TEXT },

        product_details: { type: DataTypes.JSONB },

        consent_confirmed: { type: DataTypes.BOOLEAN, defaultValue: false },
        convert_to_referral: { type: DataTypes.BOOLEAN, defaultValue: false }
    }, {
        tableName: 'leads',
        timestamps: true,
        underscored: true
    });

    Lead.associate = function (models) {
        Lead.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
        Lead.belongsTo(models.Admin, { foreignKey: 'assigned_rm_id', as: 'assigned_rm' });
    };

    return Lead;
};

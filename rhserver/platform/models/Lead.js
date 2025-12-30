module.exports = (sequelize, DataTypes) => {
    const Lead = sequelize.define("Lead", {
        product_type: { type: DataTypes.STRING, allowNull: false },
        lead_type: { type: DataTypes.STRING, allowNull: false }, // self, partner, referral, cold

        // Status & Assignment
        status: {
            type: DataTypes.ENUM('New', 'In Progress', 'Credit Approved', 'Disbursed', 'Closed', 'Rejected'),
            defaultValue: "New"
        },
        assignee_id: { type: DataTypes.UUID },
        user_id: { type: DataTypes.INTEGER },

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
        Lead.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
        Lead.belongsTo(models.Admin, { foreignKey: 'assignee_id', as: 'assigned_admin' });
    };

    return Lead;
};

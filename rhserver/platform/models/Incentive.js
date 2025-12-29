module.exports = (sequelize, DataTypes) => {
    const Incentive = sequelize.define("Incentive", {
        amount: { type: DataTypes.FLOAT, defaultValue: 0.0 },
        status: {
            type: DataTypes.ENUM('pending', 'approved', 'paid', 'rejected'),
            defaultValue: "pending"
        },
        notes: { type: DataTypes.TEXT }
    }, {
        tableName: 'incentives',
        timestamps: true,
        underscored: true
    });

    Incentive.associate = function (models) {
        Incentive.belongsTo(models.Lead, { foreignKey: 'leadId', as: 'lead' });
        Incentive.belongsTo(models.User, { foreignKey: 'partnerId', as: 'partner' });
    };

    return Incentive;
};

module.exports = (sequelize, DataTypes) => {
    const ProductRule = sequelize.define("ProductRule", {
        product_type: { type: DataTypes.STRING, allowNull: false, unique: true },
        partner_percentage: { type: DataTypes.FLOAT, defaultValue: 0.0 },
        customer_percentage: { type: DataTypes.FLOAT, defaultValue: 0.0 },
        referral_partner_percentage: { type: DataTypes.FLOAT, defaultValue: 0.0 },
        is_active: { type: DataTypes.BOOLEAN, defaultValue: true }
    }, {
        tableName: 'product_rules',
        timestamps: true,
        underscored: true
    });

    return ProductRule;
};

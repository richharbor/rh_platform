module.exports = (sequelize, DataTypes) => {
    const ProductRule = sequelize.define("ProductRule", {
        product_type: { type: DataTypes.STRING, allowNull: false, unique: true },
        reward_percentage: { type: DataTypes.FLOAT, defaultValue: 0.0 }, // e.g., 25.0 for 25%
        is_active: { type: DataTypes.BOOLEAN, defaultValue: true }
    }, {
        tableName: 'product_rules',
        timestamps: true,
        underscored: true
    });

    return ProductRule;
};

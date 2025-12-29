module.exports = (sequelize, DataTypes) => {
    const NotifySubs = sequelize.define(
        "NotifySubs",
        {
            id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            userId: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            franchiseId: {
                type: DataTypes.INTEGER,
                allowNull: true,

            },
            subscription: { type: DataTypes.JSONB, defaultValue: {} },
            tier: { type: DataTypes.INTEGER, allowNull: true },
        },
        {
            timestamps: true,
            createdAt: "createdAt",
            updatedAt: "updatedAt",
        }
    );

    return NotifySubs;
};

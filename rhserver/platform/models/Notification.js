module.exports = (sequelize, DataTypes) => {
    const Notification = sequelize.define("Notification", {
        title: { type: DataTypes.STRING, allowNull: false },
        body: { type: DataTypes.STRING, allowNull: false }, // self, partner, referral, cold
        user_id: { type: DataTypes.INTEGER },
        image_url: { type: DataTypes.STRING, allowNull: true },
        type: { type: DataTypes.STRING, allowNull: true },
        is_new: { type: DataTypes.BOOLEAN, defaultValue: true },
    }, {
        tableName: 'notifications',
        timestamps: true,
        underscored: true
    });

    Notification.associate = function (models) {
        Notification.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    };

    return Notification;
};
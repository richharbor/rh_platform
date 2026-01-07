module.exports = (sequelize, DataTypes) => {
    const UserContestReward = sequelize.define("UserContestReward", {
        tier_name: { type: DataTypes.STRING, allowNull: false },
        status: { // claimed, paid, delivered
            type: DataTypes.ENUM('claimed', 'paid', 'delivered'),
            defaultValue: 'claimed'
        },
        notes: { type: DataTypes.TEXT },
        claimed_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
    }, {
        tableName: 'user_contest_rewards',
        timestamps: true,
        underscored: true
    });

    UserContestReward.associate = function (models) {
        UserContestReward.belongsTo(models.Contest, { foreignKey: 'contest_id', as: 'contest' });
        UserContestReward.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    };

    return UserContestReward;
};

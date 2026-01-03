module.exports = (sequelize, DataTypes) => {
    const UserContestReward = sequelize.define("UserContestReward", {
        tierName: { type: DataTypes.STRING, allowNull: false },
        status: { // claimed, paid, delivered
            type: DataTypes.ENUM('claimed', 'paid', 'delivered'),
            defaultValue: 'claimed'
        },
        notes: { type: DataTypes.TEXT },
        claimedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
    }, {
        tableName: 'user_contest_rewards',
        timestamps: true,
        underscored: true
    });

    UserContestReward.associate = function (models) {
        UserContestReward.belongsTo(models.Contest, { foreignKey: 'contestId', as: 'contest' });
        UserContestReward.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    };

    return UserContestReward;
};

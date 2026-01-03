module.exports = (sequelize, DataTypes) => {
  const Contest = sequelize.define(
    "Contest",
    {
      title: { type: DataTypes.STRING, allowNull: false },
      description: { type: DataTypes.TEXT },
      startDate: { type: DataTypes.DATE, allowNull: false },
      endDate: { type: DataTypes.DATE, allowNull: false },
      bannerUrl: { type: DataTypes.STRING },
      termsAndConditions: { type: DataTypes.TEXT },
      isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
      targetType: {
        type: DataTypes.ENUM("incentive", "premium", "leads_count"),
        defaultValue: "incentive",
      },
      tiers: {
        type: DataTypes.JSONB, // Use JSONB for Postgres
        defaultValue: [], // [{ name: "Tier 1", minAmount: 5000, rewardDescription: "Voucher", segment: "Life" }]
      },
    },
    {
      tableName: "contests",
      timestamps: true,
      underscored: true,
    }
  );

  Contest.associate = function (models) {
    Contest.hasMany(models.UserContestReward, {
      foreignKey: "contestId",
      as: "rewards",
    });
  };

  return Contest;
};

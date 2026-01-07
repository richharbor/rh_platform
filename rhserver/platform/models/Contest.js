module.exports = (sequelize, DataTypes) => {
  const Contest = sequelize.define(
    "Contest",
    {
      title: { type: DataTypes.STRING, allowNull: false },
      description: { type: DataTypes.TEXT },
      start_date: { type: DataTypes.DATE, allowNull: false },
      end_date: { type: DataTypes.DATE, allowNull: false },
      banner_url: { type: DataTypes.STRING },
      terms_and_conditions: { type: DataTypes.TEXT },
      is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
      product_type: {
        type: DataTypes.STRING, // 'insurance', 'loans', 'equity', 'unlisted', 'stocks'
        allowNull: true,
      },
      product_sub_type: {
        type: DataTypes.STRING, // 'Health', 'Home', etc.
        allowNull: true,
      },
      file_url: {
        type: DataTypes.STRING, // S3 URL for poster
        allowNull: true,
      },
      target_type: {
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
      foreignKey: "contest_id",
      as: "rewards",
    });
  };

  return Contest;
};

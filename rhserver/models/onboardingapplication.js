module.exports = (sequelize, DataTypes) => {
  const OnboardingApplications = sequelize.define(
    "OnboardingApplications",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      userId: { type: DataTypes.INTEGER, allowNull: false },
      requestedRoleId: { type: DataTypes.INTEGER, allowNull: false },
      franchiseId: { type: DataTypes.INTEGER, allowNull: true },
      currentStep: { type: DataTypes.INTEGER, defaultValue: 1 },
      completedSteps: { type: DataTypes.JSON, defaultValue: [] },
      formData: { type: DataTypes.JSONB, defaultValue: {} },
      documents: { type: DataTypes.JSONB, defaultValue: {} },
      status: {
        type: DataTypes.ENUM("draft", "pending", "approved", "rejected"),
        defaultValue: "draft",
      },
      reviewedBy: { type: DataTypes.INTEGER, allowNull: true },
      reviewedAt: { type: DataTypes.DATE, allowNull: true },
      reviewNotes: { type: DataTypes.TEXT },
      approvalToken: { type: DataTypes.STRING },
    },
    {
      timestamps: true,
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    }
  );

  return OnboardingApplications;
};

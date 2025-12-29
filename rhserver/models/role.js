module.exports = (sequelize, DataTypes) => {
  const Roles = sequelize.define(
    "Roles",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: DataTypes.STRING },
      description: { type: DataTypes.TEXT },
      permissions: { type: DataTypes.JSON },
      isActive: { type: DataTypes.BOOLEAN },
      franchiseId: { type: DataTypes.INTEGER, allowNull: true },
      createdBy: { type: DataTypes.INTEGER, allowNull: true },
    },
    {
      timestamps: true,
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    }
  );

  return Roles;
};

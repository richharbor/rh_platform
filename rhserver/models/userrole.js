module.exports = (sequelize, DataTypes) => {
  const UserRoles = sequelize.define(
    "UserRoles",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      userId: { type: DataTypes.INTEGER, allowNull: false },
      roleId: { type: DataTypes.INTEGER, allowNull: false },
      isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
      isPrimary: { type: DataTypes.BOOLEAN, defaultValue: false },
      franchiseId: { type: DataTypes.INTEGER, allowNull: true },
      assignedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      assignedBy: { type: DataTypes.INTEGER, allowNull: true },
    },
    {
      timestamps: true,
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    }
  );

  return UserRoles;
};

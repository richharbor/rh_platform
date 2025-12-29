module.exports = (sequelize, DataTypes) => {
  const Franchises = sequelize.define(
    "Franchises",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: DataTypes.STRING, allowNull: false, unique: true },
      subdomain: { type: DataTypes.STRING, allowNull: false, unique: true },
      status: {
        type: DataTypes.ENUM("pending", "active", "suspended"),
        defaultValue: "pending",
      },
      createdBy: { type: DataTypes.INTEGER, allowNull: true },
    },
    {
      timestamps: true,
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    }
  );

  return Franchises;
};

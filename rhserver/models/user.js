const bcrypt = require("bcryptjs");

module.exports = (sequelize, DataTypes) => {
  const Users = sequelize.define(
    "Users",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      email: { type: DataTypes.STRING },
      password: { type: DataTypes.STRING },
      firstName: { type: DataTypes.STRING },
      lastName: { type: DataTypes.STRING },
      phoneNumber: { type: DataTypes.STRING },
      isActive: { type: DataTypes.BOOLEAN },
      isSuperAdmin: { type: DataTypes.BOOLEAN },
      createdBy: { type: DataTypes.INTEGER, allowNull: true },
      franchiseId: { type: DataTypes.INTEGER, allowNull: true },
      tier: { type: DataTypes.INTEGER, allowNull: true },
      emailVerified: { type: DataTypes.BOOLEAN },
      lastLogin: { type: DataTypes.DATE },
    },
    {
      hooks: {
        beforeCreate: async (user) => {
          if (user.password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
          }
        },
        beforeUpdate: async (user) => {
          if (user.changed("password")) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
          }
        },
      },
      timestamps: true,
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    }
  );

  return Users;
};

module.exports = (sequelize, DataTypes) => {
    const Otp = sequelize.define("Otp", {
        email: { type: DataTypes.STRING, allowNull: true },
        phone: { type: DataTypes.STRING, allowNull: true },
        code_hash: { type: DataTypes.STRING, allowNull: false },
        purpose: { type: DataTypes.STRING, defaultValue: "login" }, // signup, login, reset
        expires_at: { type: DataTypes.DATE, allowNull: false },
        last_sent_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
    }, {
        tableName: 'otp_codes',
        timestamps: true,
        underscored: true
    });

    return Otp;
};

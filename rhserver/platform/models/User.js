module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define("User", {
        email: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: true,
            validate: { isEmail: true },
        },
        password_hash: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        name: { type: DataTypes.STRING },
        role: {
            type: DataTypes.STRING,
            defaultValue: "customer", // customer, partner, referral_partner, admin
        },
        phone: { type: DataTypes.STRING },
        city: { type: DataTypes.STRING },
        pan: { type: DataTypes.STRING },
        gst_number: { type: DataTypes.STRING },
        company_name: { type: DataTypes.STRING },
        onboarding_completed: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        email_verified_at: { type: DataTypes.DATE },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        kyc_status: {
            type: DataTypes.STRING,
            defaultValue: "pending",
        },
        wallet_balance: {
            type: DataTypes.FLOAT,
            defaultValue: 0.0,
        },
        signup_step: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        signup_data: {
            type: DataTypes.JSON,
            defaultValue: {},
        },
        phone_verified_at: {
            type: DataTypes.DATE,
        },
        biometric_key: {
            type: DataTypes.STRING,
        }
    }, {
        tableName: 'users',
        timestamps: true,
        underscored: true
    });

    User.associate = function (models) {
        // associations can be defined here
    };

    return User;
};

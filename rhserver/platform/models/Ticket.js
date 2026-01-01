module.exports = (sequelize, DataTypes) => {
    const Ticket = sequelize.define("Ticket", {
        subject: { type: DataTypes.STRING, allowNull: false },
        description: { type: DataTypes.TEXT, allowNull: false },
        status: { type: DataTypes.ENUM('Open', 'In Progress', 'Resolved', 'Closed'), defaultValue: 'Open' },
        priority: { type: DataTypes.ENUM('Low', 'Medium', 'High', 'Critical'), defaultValue: 'Medium' }
    }, {
        tableName: 'tickets',
        timestamps: true,
        underscored: true
    });

    Ticket.associate = function (models) {
        Ticket.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
        Ticket.belongsTo(models.Admin, { foreignKey: 'assigned_admin_id', as: 'assignedTo' });
    };

    return Ticket;
};

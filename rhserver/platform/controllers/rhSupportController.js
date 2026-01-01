const { Ticket, User, Admin } = require("../models");
const { Op } = require("sequelize");

// User: Create Ticket
const createTicket = async (req, res) => {
    try {
        const { subject, description, priority } = req.body;
        const ticket = await Ticket.create({
            user_id: req.user.id,
            subject,
            description,
            priority: priority || 'Medium',
            status: 'Open'
        });
        res.status(201).json(ticket);
    } catch (error) {
        console.error("Create ticket error:", error);
        res.status(500).json({ error: "Failed to create ticket" });
    }
};

// User: List My Tickets
const listMyTickets = async (req, res) => {
    try {
        const tickets = await Ticket.findAll({
            where: { user_id: req.user.id },
            order: [['createdAt', 'DESC']]
        });
        res.json(tickets);
    } catch (error) {
        console.error("List my tickets error:", error);
        res.status(500).json({ error: "Failed to fetch tickets" });
    }
};

// Admin: List All Tickets
const listAllTickets = async (req, res) => {
    try {
        const tickets = await Ticket.findAll({
            order: [['createdAt', 'DESC']],
            include: [
                { model: User, as: 'user', attributes: ['id', 'name', 'phone', 'email'] },
                { model: Admin, as: 'assignedTo', attributes: ['id', 'name'] }
            ]
        });
        res.json(tickets);
    } catch (error) {
        console.error("Admin list tickets error:", error);
        res.status(500).json({ error: "Failed to fetch tickets" });
    }
};

// Admin: Update Ticket (Status/Assign)
const updateTicket = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, assigned_admin_id, priority } = req.body;

        const ticket = await Ticket.findByPk(id);
        if (!ticket) return res.status(404).json({ error: "Ticket not found" });

        if (status) ticket.status = status;
        if (assigned_admin_id) ticket.assigned_admin_id = assigned_admin_id;
        if (priority) ticket.priority = priority;

        await ticket.save();

        // Return refreshed with associations
        const updated = await Ticket.findByPk(id, {
            include: [
                { model: User, as: 'user', attributes: ['id', 'name', 'phone', 'email'] },
                { model: Admin, as: 'assignedTo', attributes: ['id', 'name'] }
            ]
        });

        res.json(updated);
    } catch (error) {
        console.error("Update ticket error:", error);
        res.status(500).json({ error: "Failed to update ticket" });
    }
};

module.exports = {
    createTicket,
    listMyTickets,
    listAllTickets,
    updateTicket
};

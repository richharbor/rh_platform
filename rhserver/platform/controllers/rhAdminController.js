const { User, Lead, Admin, AdminRole } = require("../models");
const { Op } = require("sequelize");

// List all users (Admin only)
const listUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            order: [["createdAt", "DESC"]],
            attributes: { exclude: ["password_hash", "signup_data"] },
        });
        res.json(users);
    } catch (error) {
        console.error("List users error:", error);
        res.status(500).json({ error: "Failed to fetch users" });
    }
};

// Approve partner KYC (Admin only)
const approvePartner = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        user.kyc_status = "approved";
        await user.save();

        res.json(user);
    } catch (error) {
        console.error("Approve partner error:", error);
        res.status(500).json({ error: "Failed to approve partner" });
    }
};

// Get Dashboard Stats
const getDashboardStats = async (req, res) => {
    try {
        const totalLeads = await Lead.count();
        const activeLeads = await Lead.count({
            where: {
                status: { [Op.notIn]: ['closed', 'rejected'] }
            }
        });
        const totalPartners = await User.count({ where: { role: 'partner' } });

        // Calculate Conversion % (Closed / Total * 100)
        const closedLeads = await Lead.count({ where: { status: 'closed' } });
        const conversionRate = totalLeads > 0 ? ((closedLeads / totalLeads) * 100).toFixed(1) : 0;

        res.json({
            totalLeads,
            activeLeads,
            totalPartners,
            conversionRate,
            expectedPayouts: 500000, // Mock
            disbursedPayouts: 120000 // Mock
        });
    } catch (error) {
        console.error("Dashboard stats error:", error);
        res.status(500).json({ error: "Failed to fetch stats" });
    }
};

// Assign Lead to RM
const assignLead = async (req, res) => {
    try {
        const { leadId, rmId } = req.body;
        const lead = await Lead.findByPk(leadId);
        if (!lead) return res.status(404).json({ error: "Lead not found" });

        // Verify RM exists
        const rm = await Admin.findByPk(rmId);
        if (!rm) return res.status(404).json({ error: "RM not found" });

        lead.assigned_rm_id = rmId;
        lead.internal_notes = [...(lead.internal_notes || []), {
            action: "assigned",
            by: req.user.id,
            to: rm.name,
            date: new Date()
        }];

        await lead.save();
        res.json(lead);
    } catch (error) {
        console.error("Assign lead error:", error);
        res.status(500).json({ error: "Failed to assign lead" });
    }
};

// Update Internal Status
const updateLeadInternalStatus = async (req, res) => {
    try {
        const { leadId } = req.params;
        const { status, reason, priority, notes } = req.body;

        const lead = await Lead.findByPk(leadId);
        if (!lead) return res.status(404).json({ error: "Lead not found" });

        if (status) lead.internal_status = status;
        if (priority) lead.priority = priority;
        if (reason) lead.rejection_reason = reason;

        if (notes) {
            lead.internal_notes = [...(lead.internal_notes || []), {
                note: notes,
                by: req.user.id,
                date: new Date()
            }];
        }

        await lead.save();
        res.json(lead);
    } catch (error) {
        console.error("Update internal status error:", error);
        res.status(500).json({ error: "Failed to update status" });
    }
};

// List RMs (for assignment)
const listRMs = async (req, res) => {
    try {
        const rms = await Admin.findAll({
            include: [{
                model: AdminRole,
                as: 'role',
                where: { name: ['RM', 'Ops', 'Super Admin'] } // Allow assigning to any operational role
            }],
            attributes: ['id', 'name', 'email']
        });
        res.json(rms);
    } catch (error) {
        console.error("List RMs error:", error);
        res.status(500).json({ error: "Failed to fetch RMs" });
    }
};

// Get Lead Details (Admin)
const getLead = async (req, res) => {
    try {
        const lead = await Lead.findByPk(req.params.id, {
            include: [
                { model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone', 'city'] },
                { model: Admin, as: 'assigned_rm', attributes: ['id', 'name', 'email'] }
            ]
        });

        if (!lead) return res.status(404).json({ error: "Lead not found" });

        res.json(lead);
    } catch (error) {
        console.error("Get lead details error:", error);
        res.status(500).json({ error: "Failed to fetch lead details" });
    }
};

// Create New Role
const createRole = async (req, res) => {
    try {
        const { name, permissions, description } = req.body;
        const role = await AdminRole.create({ name, permissions, description });
        res.json(role);
    } catch (error) {
        console.error("Create role error:", error);
        res.status(500).json({ error: "Failed to create role" });
    }
};

// Invite New Admin
const inviteAdmin = async (req, res) => {
    try {
        const { email, roleId, name } = req.body;

        // Check if exists
        const existing = await Admin.findOne({ where: { email } });
        if (existing) return res.status(400).json({ error: "Admin already exists" });

        // Generate Token
        // In real app, use crypto.randomBytes
        const token = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
        const expires = new Date();
        expires.setHours(expires.getHours() + 48); // 48 hours

        const newAdmin = await Admin.create({
            email,
            name, // Optional at this stage
            role_id: roleId,
            invite_token: token,
            invite_expires: expires,
            is_active: false
        });

        // Mock Email Sending
        console.log(`[EMAIL MOCK] Sending Invite to ${email}`);
        console.log(`[EMAIL MOCK] Link: http://localhost:3000/invite?token=${token}`);

        res.json({ message: "Invitation sent", token });
    } catch (error) {
        console.error("Invite admin error:", error);
        res.status(500).json({ error: "Failed to invite admin" });
    }
};

// List Roles (for selection)
const listRoles = async (req, res) => {
    try {
        const roles = await AdminRole.findAll();
        res.json(roles);
    } catch (error) {
        console.error("List roles error:", error);
        res.status(500).json({ error: "Failed to fetch roles" });
    }
};

module.exports = {
    listUsers,
    approvePartner,
    getDashboardStats,
    assignLead,
    updateLeadInternalStatus,
    listRMs,
    getLead,
    createRole,
    inviteAdmin,
    listRoles
};


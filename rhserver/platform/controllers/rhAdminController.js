const { User, Lead, Admin, AdminRole, Incentive, ProductRule } = require("../models");
const { Op } = require("sequelize");
const { sendEmail } = require("../services/emailService");
const notificationService = require("../services/fcmNotificationService");

// List all users (Admin only)
const listUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            order: [["createdAt", "DESC"]],
            attributes: { exclude: ["password_hash"] },
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
                status: { [Op.notIn]: ['Closed', 'Rejected'] }
            }
        });
        const totalPartners = await User.count({ where: { role: 'partner' } });

        // Calculate Conversion % (Closed / Total * 100)
        const closedLeads = await Lead.count({ where: { status: 'Closed' } });
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

        lead.assignee_id = rmId;

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
        const { status, incentive_amount, notifyUser } = req.body; // Added notifyUser

        const lead = await Lead.findByPk(leadId);
        if (!lead) return res.status(404).json({ error: "Lead not found" });

        const previousStatus = lead.status;
        lead.status = status;

        // 1. Handle Incentive Creation / Update (Disbursed/Closed)
        // Allow incentives for 'self' leads too if a user_id is present (Partner self-lead)
        if (['Disbursed', 'Closed'].includes(status) && lead.user_id) {

            // Check if incentive already exists
            const existing = await Incentive.findOne({ where: { lead_id: lead.id } });

            // Determine Amount
            let finalAmount = 0;
            if (incentive_amount !== undefined && incentive_amount !== null) {
                finalAmount = parseFloat(incentive_amount);
            } else {
                // Fallback calculation if not provided
                const rule = await ProductRule.findOne({ where: { product_type: lead.product_type } });
                const percentage = rule ? rule.reward_percentage : 0;
                const details = lead.product_details || {};
                const val = details.amount || details.capital || details.ticketSize || details.budget || details.coverage || details.sumInsured || 0;
                const leadValue = parseFloat(val) || 0;
                finalAmount = leadValue * (percentage / 100);
            }

            if (finalAmount > 0) {
                if (existing) {
                    // Update existing if pending
                    if (existing.status === 'pending') {
                        existing.amount = finalAmount;
                        existing.notes = `Reward: Custom/Calculated (${lead.product_type})`;
                        await existing.save();
                        console.log(`[INCENTIVE] Updated reward for Lead #${lead.id}: ₹${finalAmount}`);
                    }
                } else {
                    // Create new
                    await Incentive.create({
                        lead_id: lead.id,
                        user_id: lead.user_id,
                        amount: finalAmount,
                        status: "pending",
                        notes: `Reward: Custom/Calculated (${lead.product_type})`
                    });
                    console.log(`[INCENTIVE] Created reward for Lead #${lead.id}: ₹${finalAmount}`);
                }
            }
        }

        // 2. Handle Incentive Reversal (If moving to Rejected/Dropped/New from a paid status? No, usually just Rejected)
        if (status === 'Rejected' || status === 'Dropped') {
            const existing = await Incentive.findOne({ where: { lead_id: lead.id } });
            if (existing && existing.status === 'pending') {
                await existing.destroy();
                console.log(`[INCENTIVE] Removed pending reward for Lead #${lead.id} due to Rejection`);
            }
        }

        // Notification Logic
        if (notifyUser) {
            const user = await User.findByPk(lead.user_id, { attributes: ['id', 'push_token'] });
            if (user && user.push_token) {
                const title = "Lead Update 📢";
                const body = `Your lead "${lead.name}" is now marked as ${status}.`;
                await notificationService.sendPushNotification([user.id], title, body, { type: 'lead', leadId: leadId });
            }
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
                where: {
                    name: {
                        [Op.in]: ['RM', 'Ops', 'Finance'],
                        [Op.ne]: 'Super Admin' // Exclude Super Admin from team list
                    }
                }
            }],
            attributes: ['id', 'name', 'email', 'is_active', 'createdAt']
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
                { model: Admin, as: 'assigned_admin', attributes: ['id', 'name', 'email'] }
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

        // Get role name for email
        const role = await AdminRole.findByPk(roleId);
        if (!role) return res.status(400).json({ error: "Invalid role" });

        // Generate Token
        const crypto = require('crypto');
        const token = crypto.randomBytes(32).toString('hex');
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

        // Determine the base URL for the invite link
        const baseUrl = process.env.ADMIN_PANEL_URL || 'http://localhost:3000';
        const inviteLink = `${baseUrl}/invite?token=${token}`;

        // Email HTML template
        const emailHtml = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
        }
        .content {
            background: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 10px 10px;
        }
        .button {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
        }
        .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 12px;
            color: #666;
        }
        .info-box {
            background: white;
            border-left: 4px solid #667eea;
            padding: 15px;
            margin: 15px 0;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎉 Welcome to RichHarbor Admin!</h1>
    </div>
    <div class="content">
        <p>Hello${name ? ' ' + name : ''},</p>
        
        <p>You've been invited to join the RichHarbor Admin team as a <strong>${role.name}</strong>.</p>
        
        <div class="info-box">
            <p><strong>📧 Your Email:</strong> ${email}</p>
            <p><strong>👤 Role:</strong> ${role.name}</p>
        </div>
        
        <p>To complete your registration and set up your account, please click the button below:</p>
        
        <div style="text-align: center;">
            <a href="${inviteLink}" class="button">Complete Your Setup</a>
        </div>
        
        <p style="color: #666; font-size: 14px;">
            Or copy and paste this link into your browser:<br>
            <a href="${inviteLink}">${inviteLink}</a>
        </p>
        
        <div class="info-box" style="border-left-color: #ff6b6b;">
            <p style="margin: 0;"><strong>⏰ Important:</strong> This invitation link will expire in 48 hours.</p>
        </div>
        
        <p>If you have any questions or need assistance, please contact your administrator.</p>
        
        <p>Best regards,<br>
        <strong>The RichHarbor Team</strong></p>
    </div>
    <div class="footer">
        <p>This is an automated message. Please do not reply to this email.</p>
        <p>&copy; ${new Date().getFullYear()} RichHarbor. All rights reserved.</p>
    </div>
</body>
</html>
        `;

        // Send actual email
        try {
            await sendEmail(
                email,
                "You've been invited to RichHarbor Admin",
                emailHtml,
                true // isHtml
            );
            console.log(`[EMAIL SENT] Invitation sent to ${email}`);
        } catch (emailError) {
            console.error(`[EMAIL ERROR] Failed to send invitation to ${email}:`, emailError);
            // Still return success since admin was created, but log the error
            // In production, you might want to delete the admin record or handle this differently
        }

        res.json({ message: "Invitation sent", token }); // Return token for testing
    } catch (error) {
        console.error("Invite admin error:", error);
        res.status(500).json({ error: "Failed to invite admin" });
    }
};

// Update Incentive (Amount/Status)

const updateIncentive = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, notifyUser } = req.body; // Expect notifyUser boolean

        const incentive = await Incentive.findByPk(id, {
            include: [{ model: User, as: 'partner', attributes: ['id', 'push_token'] }]
        });

        if (!incentive) return res.status(404).json({ error: "Incentive not found" });

        await incentive.update({ status });

        // Notification
        if (notifyUser && incentive.partner && incentive.partner.push_token) {
            let title = "Incentive Update 💰";
            let body = `Your incentive of ₹${incentive.amount} is now ${status}!`;

            if (status === 'approved') body = `Great work! Your incentive of ₹${incentive.amount} has been Approved.`;
            if (status === 'paid') body = `Ka-ching! ₹${incentive.amount} has been Paid to your account.`;

            await notificationService.sendPushNotification(
                [incentive.partner.id],
                title,
                body,
                { type: 'incentive', incentiveId: id }
            );
        }

        res.json(incentive);
    } catch (error) {
        console.error("Update incentive error:", error);
        res.status(500).json({ error: "Failed to update incentive" });
    }
};

// List Roles (for selection)
const listRoles = async (req, res) => {
    try {
        // Exclude Super Admin role from the list
        const roles = await AdminRole.findAll({
            where: {
                name: { [Op.ne]: 'Super Admin' } // Hide Super Admin role
            }
        });
        res.json(roles);
    } catch (error) {
        console.error("List roles error:", error);
        res.status(500).json({ error: "Failed to fetch roles" });
    }
};

// Delete Team Member
const deleteTeamMember = async (req, res) => {
    try {
        const { id } = req.params;

        const admin = await Admin.findByPk(id, {
            include: [{ model: AdminRole, as: 'role' }]
        });

        if (!admin) {
            return res.status(404).json({ error: "Team member not found" });
        }

        // Prevent deleting yourself
        if (admin.id === req.user.id) {
            return res.status(400).json({ error: "You cannot delete yourself" });
        }

        // Prevent deleting Super Admin
        if (admin.role && admin.role.name === 'Super Admin') {
            return res.status(403).json({ error: "Cannot delete Super Admin account" });
        }

        await admin.destroy();
        console.log(`[ADMIN] Team member deleted: ${admin.email}`);

        res.json({ message: "Team member removed successfully" });
    } catch (error) {
        console.error("Delete team member error:", error);
        res.status(500).json({ error: "Failed to delete team member" });
    }
};

// List Product Rules
const listProductRules = async (req, res) => {
    try {
        const rules = await ProductRule.findAll({
            order: [['product_type', 'ASC']]
        });
        res.json(rules);
    } catch (error) {
        console.error("List product rules error:", error);
        res.status(500).json({ error: "Failed to fetch rules" });
    }
};

// Update Product Rule
const updateProductRule = async (req, res) => {
    try {
        const { id } = req.params;
        const { reward_percentage, is_active } = req.body;

        const rule = await ProductRule.findByPk(id);
        if (!rule) return res.status(404).json({ error: "Rule not found" });

        if (reward_percentage !== undefined) rule.reward_percentage = parseFloat(reward_percentage);
        if (is_active !== undefined) rule.is_active = is_active;

        await rule.save();
        res.json(rule);
    } catch (error) {
        console.error("Update rule error:", error);
        res.status(500).json({ error: "Failed to update rule" });
    }
};

// List Payouts (Incentives)
const listPayouts = async (req, res) => {
    try {
        const payouts = await Incentive.findAll({
            order: [['createdAt', 'DESC']],
            include: [
                { model: User, as: 'partner', attributes: ['id', 'name', 'email', 'phone'] },
                { model: Lead, as: 'lead', attributes: ['id', 'name', 'product_type'] }
            ]
        });
        res.json(payouts);
    } catch (error) {
        console.error("List payouts error:", error);
        res.status(500).json({ error: "Failed to fetch payouts" });
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
    listRoles,
    updateIncentive,
    deleteTeamMember,
    listProductRules,
    updateProductRule,
    listPayouts
};


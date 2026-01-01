const { Lead, User, Incentive } = require("../models"); // Uses platform/models/index.js

const INCENTIVE_MAP = {
    self: "Free add-ons, priority RM, faster callback",
    partner: "Cash payout + contests",
    referral: "Gifts / vouchers",
    cold: "Up to 25% payout on conversion",
};

// Create a new lead
const create = async (req, res) => {
    try {
        const {
            product_type,
            lead_type,
            name,
            email,
            phone,
            city,
            product_details,
            consent_confirmed,
            convert_to_referral,
            requirement,
        } = req.body;

        // Validate required fields
        if (!product_type || !lead_type || !name || !phone) {
            return res.status(400).json({
                error: "Missing required fields: product_type, lead_type, name, phone",
            });
        }

        if (lead_type === "cold" && !consent_confirmed) {
            return res.status(400).json({ error: "Consent required for cold leads" });
        }

        // Create Lead

        // Determine User ID (If Admin, allow setting user_id manually, else use own ID)
        let userId = req.user.id;
        if (req.user.type === 'admin') {
            userId = req.body.user_id || null; // Admin can assign to a user or leave unassigned (null)
        }

        // Create Lead
        const lead = await Lead.create({
            user_id: userId,
            product_type,
            lead_type,
            status: "New",
            name,
            email,
            phone,
            city,
            requirement,
            product_details,
            consent_confirmed,
            convert_to_referral,
        });



        res.status(201).json(lead);
    } catch (error) {
        console.error("Create lead error:", error);
        res.status(500).json({ error: "Failed to create lead" });
    }
};

// List user's own leads
const listMyLeads = async (req, res) => {
    try {
        const leads = await Lead.findAll({
            where: { user_id: req.user.id },
            order: [["createdAt", "DESC"]],
        });
        res.json(leads);
    } catch (error) {
        console.error("List my leads error:", error);
        res.status(500).json({ error: "Failed to fetch leads" });
    }
};

// Get single lead by ID
const get = async (req, res) => {
    try {
        const lead = await Lead.findOne({
            where: { id: req.params.id, user_id: req.user.id },
        });

        if (!lead) {
            return res.status(404).json({ error: "Lead not found" });
        }

        res.json(lead);
    } catch (error) {
        console.error("Get lead error:", error);
        res.status(500).json({ error: "Failed to fetch lead" });
    }
};

// Admin: List all leads
const adminList = async (req, res) => {
    try {
        const leads = await Lead.findAll({
            order: [["createdAt", "DESC"]],
            include: [
                { model: User, as: "user", attributes: ["id", "name", "email"] },
            ],
        });
        res.json(leads);
    } catch (error) {
        console.error("Admin list leads error:", error);
        res.status(500).json({ error: "Failed to fetch leads" });
    }
};

module.exports = {
    create,
    listMyLeads,
    get,
    adminList,
};


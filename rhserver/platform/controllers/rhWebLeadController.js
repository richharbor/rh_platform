const { Lead, User, Incentive } = require("../models"); // Uses platform/models/index.js


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
        } = req.body;

        


        // consent_confirmed,
        // convert_to_referral,
        // requirement,

        // Validate required fields
        if (!product_type || !lead_type || !name || !phone) {
            return res.status(400).json({
                error: "Missing required fields: product_type, lead_type, name, phone",
            });
        }

        

        // Role-based validation
        // const userRole = req.user.role || 'customer';
        // if (userRole === 'customer' && lead_type !== 'self') {
        //     return res.status(403).json({
        //         error: "Customers can only create self leads. Please upgrade to Referral Partner to create other leads."
        //     });
        // }

        // Create Lead

        // Determine User ID (If Admin, allow setting user_id manually, else use own ID)
        // let userId = req.user.id;
        // if (req.user.type === 'admin') {
        //     userId = req.body.user_id || null; // Admin can assign to a user or leave unassigned (null)
        // }

        // Create Lead
        const lead = await Lead.create({
            product_type,
            lead_type,
            status: "New",
            name,
            email,
            phone,
            city,
            product_details,
            consent_confirmed : true,
            convert_to_referral : false ,
        });



        res.status(201).json(lead);
    } catch (error) {
        console.error("Create lead error:", error);
        res.status(500).json({ error: "Failed to create lead" });
    }
};


module.exports = {
    create,
};
const { WebShares, Sequelize } = require("../models");

// Create a new WebShare
const createWebShare = async (req, res) => {
    try {
        const { id, name, sector, price } = req.body;

        // Normalize name: lowercase and remove spaces
        const normalizedInputName = name.toLowerCase().replace(/\s+/g, '');

        // Check if WebShare exists with the same normalized name
        const existingShare = await WebShares.findOne({
            where: Sequelize.where(
                Sequelize.fn('LOWER', Sequelize.fn('REPLACE', Sequelize.col('name'), ' ', '')),
                normalizedInputName
            )
        });

        if (existingShare) {
            return res.status(400).json({ error: "WebShare with this name already exists" });
        }

        const newWebShare = await WebShares.create({
            name,
            sector,
            price
        });

        return res.status(201).json({
            message: "WebShare created successfully",
            data: newWebShare
        });
    } catch (error) {
        console.error("Error creating WebShare:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

// Update an existing WebShare
const updateWebShare = async (req, res) => {
    try {
        const { id, name, sector, price } = req.body;

        if (!id) {
            return res.status(400).json({ error: "WebShare ID is required for update" });
        }

        const webShare = await WebShares.findByPk(id);

        if (!webShare) {
            return res.status(404).json({ error: "WebShare not found" });
        }

        // Map section to sector if provided
        // Update fields if they are present in the request
        if (name) webShare.name = name;
        if (sector) webShare.sector = sector;
        if (price) webShare.price = price;

        await webShare.save();

        return res.status(200).json({
            message: "WebShare updated successfully",
            data: webShare
        });
    } catch (error) {
        console.error("Error updating WebShare:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

// Get all WebShares
const getAllWebShares = async (req, res) => {
    try {
        const webShares = await WebShares.findAll();
        return res.status(200).json({
            data: webShares
        });
    } catch (error) {
        console.error("Error fetching WebShares:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = {
    createWebShare,
    updateWebShare,
    getAllWebShares
};

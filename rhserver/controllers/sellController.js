const { where, Op } = require("sequelize");
const { Shares, Sells, Users } = require("../models");
const { sendBestDealNotification } = require("../utils/sendNotification");
const { sendWhatsAppTestMessage } = require("../utils/sendWhatsappMsg");


const getAllShares = async (req, res) => {
  const { user } = req;
  try {

    let shares;
    if (user.tier <= 2) {
      shares = await Shares.findAll({
      });

    } else {
      shares = await Shares.findAll({
        where: { franchiseId: user.franchiseId }
      });

    }




    if (!shares || shares.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No shares found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: shares,
    });
  } catch (error) {
    console.error("Error getting shares:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve shares.",
      error: error.message,
    });
  }
};

const createSell = async (req, res) => {
  const { user } = req;
  const {
    confirmDelivery,
    deliveryTimeline,
    endSellerLocation,
    endSellerName,
    endSellerProfile,
    fixedPrice,
    moq,
    preShareTransfer,
    price,
    bestDeal,
    quantityAvailable,
    shareInStock,
    shareName,
  } = req.body;

  try {
    // Validate input
    if (!shareName || !price || !quantityAvailable) {
      return res.status(400).json({
        success: false,
        message: "shareName, price, and quantityAvailable are required.",
      });
    }
    let sellingPrice = price;

    if (quantityAvailable <= 999) {
      sellingPrice = sellingPrice + 10;
    } else if (quantityAvailable >= 1000 && quantityAvailable <= 4999) {
      sellingPrice = sellingPrice + 5;
    } else if (quantityAvailable >= 5000 && quantityAvailable <= 19999) {
      sellingPrice = sellingPrice + 3;
    } else if (quantityAvailable >= 20000) {
      sellingPrice = sellingPrice + 2;
    }

    if (price < 100) {
      sellingPrice = price + 0.5;
    }

    // Find or create the share
    let share = await Shares.findOne({ where: { name: shareName, franchiseId: user.franchiseId } });

    if (!share) {
      share = await Shares.create({ name: shareName, franchiseId: user.franchiseId, price: sellingPrice });
    } else {
      const newPrice = Math.min(share.price, sellingPrice);
      await share.update({ price: newPrice });
    }
    let approve = false;
    if (user.tier <= 3) {
      sellingPrice = price;
      if (bestDeal) {
        approve = true;
      }
    };



    // Create the sell record
    const sell = await Sells.create({
      userId: user.id,
      shareId: share.id,
      confirmDelivery,
      deliveryTimeline,
      endSellerLocation,
      endSellerName,
      endSellerProfile,
      fixedPrice,
      minimumOrderQuatity: moq,
      preShareTransfer,
      actualPrice: price,
      sellingPrice,
      quantityAvailable,
      bestDeal,
      shareInStock,
      approved: approve,
      franchiseId: user.franchiseId,
    });

    if (approve) {
      await sendBestDealNotification(sell.userId, sell.franchiseId, shareName)
    }

    return res.status(201).json({
      success: true,
      message: "Sell record created successfully.",
    });
  } catch (error) {
    console.error("Error creating sell record:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create sell record.",
      error: error.message,
    });
  }
};

const getAllShareByUserId = async (req, res) => {
  const { user } = req;

  try {
    const sells = await Sells.findAll({
      where: { userId: user.id, franchiseId: user.franchiseId },
      include: [
        {
          model: Shares,
          as: "share", // matches the association alias
          attributes: ["id", "name", "symbol", "price"],
        },
      ],
    });

    if (!sells || sells.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No sells found for this user.",
      });
    }
    // Transform shares: remove actualPrice and rename sellingPrice -> price
    const formattedShares = sells.map((sell) => {
      const { actualPrice, sellingPrice, ...rest } = sell.toJSON();
      return {
        ...rest,
        price: actualPrice, // rename field
      };
    });

    return res.status(200).json({
      success: true,
      data: formattedShares,
    });
  } catch (error) {
    console.error("Error getting sells by userId:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve sells.",
      error: error.message,
    });
  }
};

const getAllSells = async (req, res) => {
  const { user } = req;
  try {

    let sells;
    if (user.tier <= 2) {
      sells = await Sells.findAll({
        where: { userId: { [Op.ne]: user.id } },
        include: [
          {
            model: Shares,
            as: "share", // must match Sells.belongsTo(Shares, { as: "share" })
            attributes: ["id", "name", "symbol", "price"],
          },
        ],
        order: [["createdAt", "DESC"]], // latest sells first
      });

    } else {

      sells = await Sells.findAll({
        where: { franchiseId: user.franchiseId, userId: { [Op.ne]: user.id } },
        include: [
          {
            model: Shares,
            as: "share", // must match Sells.belongsTo(Shares, { as: "share" })
            attributes: ["id", "name", "symbol", "price"],
          },
        ],
        order: [["createdAt", "DESC"]], // latest sells first
      });

    }


    if (!sells || sells.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No sells found.",
      });
    }

    // Transform shares: remove actualPrice and rename sellingPrice -> price
    const formattedShares = sells.map((sell) => {
      const { actualPrice, sellingPrice, ...rest } = sell.toJSON();
      return {
        ...rest,
        price: sellingPrice, // rename field
      };
    });

    return res.status(200).json({
      success: true,
      data: formattedShares,
    });
  } catch (error) {
    console.error("Error fetching all sells:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve sells.",
      error: error.message,
    });
  }
};

const updateSell = async (req, res) => {
  const { user } = req;
  const { id } = req.params;

  const {
    quantityAvailable,
    price,
    deliveryTimeline,
    moq,
    fixedPrice,
    confirmDelivery,
    shareInStock,
    preShareTransfer,
    bestDeal,
    endSellerName,
    endSellerProfile,
    endSellerLocation,
  } = req.body; // ✅ Accept all fields except shareName

  try {
    const sell = await Sells.findByPk(id);
    if (!sell) {
      return res.status(404).json({
        success: false,
        message: "Sell record not found",
      });
    }

    // ✅ Do NOT allow updating shareName (ignore it)

    if (quantityAvailable !== undefined) {
      sell.quantityAvailable = quantityAvailable;
    }

    if (price !== undefined) {
      let sellingPrice = price;

      if (quantityAvailable <= 999) {
        sellingPrice = sellingPrice + 10;
      } else if (quantityAvailable >= 1000 && quantityAvailable <= 4999) {
        sellingPrice = sellingPrice + 5;
      } else if (quantityAvailable >= 5000 && quantityAvailable <= 19999) {
        sellingPrice = sellingPrice + 3;
      } else if (quantityAvailable >= 20000) {
        sellingPrice = sellingPrice + 2;
      }

      sell.actualPrice = price;
      sell.sellingPrice = sellingPrice;
    }

    // ✅ Update remaining fields if provided
    if (deliveryTimeline !== undefined) sell.deliveryTimeline = deliveryTimeline;
    if (moq !== undefined) sell.minimumOrderQuatity = moq;
    if (fixedPrice !== undefined) sell.fixedPrice = fixedPrice;
    if (confirmDelivery !== undefined) sell.confirmDelivery = confirmDelivery;
    if (shareInStock !== undefined) sell.shareInStock = shareInStock;
    if (preShareTransfer !== undefined) sell.preShareTransfer = preShareTransfer;
    if (bestDeal !== undefined) sell.bestDeal = bestDeal;
    if (endSellerName !== undefined) sell.endSellerName = endSellerName;
    if (endSellerProfile !== undefined) sell.endSellerProfile = endSellerProfile;
    if (endSellerLocation !== undefined) sell.endSellerLocation = endSellerLocation;


    let share = await Shares.findOne({ where: { id: sell.shareId } });


    const newPrice = Math.min(share.price, sell.sellingPrice);
    await share.update({ price: newPrice });


    await sell.save();


    // Transform shares: remove actualPrice and rename sellingPrice -> price
    const { actualPrice, sellingPrice, ...rest } = sell.toJSON();
    const formattedShare = {
      ...rest,
      price: actualPrice // rename field
    };

    return res.status(200).json({
      success: true,
      message: "Sell updated",
      data: formattedShare,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to update sell",
      error: error.message,
    });
  }
};


const getSellbySellId = async (req, res) => {
  const { id } = req.params;
  const { user } = req;
  try {
    const sell = await Sells.findOne({
      where: { id: id, userId: user.id, franchiseId: user.franchiseId },
      include: [
        {
          model: Shares,
          as: "share", // matches the association alias
          attributes: ["id", "name", "symbol", "price"],
        },
      ],
    });

    if (!sell || sell.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No sells found for this user.",
      });
    }
    // Transform shares: remove actualPrice and rename sellingPrice -> price
    const { actualPrice, sellingPrice, ...rest } = sell.toJSON();
    const formattedShare = {
      ...rest,
      price: actualPrice // rename field
    };

    return res.status(200).json({
      success: true,
      data: formattedShare,
    });
  } catch (error) {
    console.error("Error getting sells by userId:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve sells.",
      error: error.message,
    });
  }

}
const getShareByShareId = async (req, res) => {
  const { id } = req.params;
  const { user } = req;
  try {
    const share = await Shares.findOne({
      where: { id: id },
      attributes: ["id", "name", "symbol", "price"],
    });

    if (!share) {
      return res.status(404).json({
        success: false,
        message: "No sells found for this user.",
      });
    }


    return res.status(200).json({
      success: true,
      data: share,
    });
  } catch (error) {
    console.error("Error getting sells by userId:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve sells.",
      error: error.message,
    });
  }

}

const getSellsByShareId = async (req, res) => {
  const { id } = req.params; // share id from route: /api/share/:id/sells
  const { user } = req;

  try {
    const sells = await Sells.findAll({
      where: { shareId: id, userId: { [Op.ne]: user.id }, }, // filter by shareId
      include: [
        {
          model: Shares,
          as: "share",
          attributes: ["id", "name", "symbol", "price"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    if (!sells || sells.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No sells found." });
    }

    // Transform shares: remove actualPrice and rename sellingPrice -> price
    let formattedShares = [];

    if (user.tier > 3) {
      formattedShares = sells.map((sell) => {
        const { actualPrice, sellingPrice, endSellerName, endSellerLocation, endSellerProfile, ...rest } = sell.toJSON();
        return {
          ...rest,
          price: sellingPrice, // rename field
        };
      });

    } else {
      formattedShares = sells.map((sell) => {
        const { actualPrice, sellingPrice, endSellerName, endSellerLocation, endSellerProfile, ...rest } = sell.toJSON();
        return {
          ...rest,
          price: sellingPrice, // rename field
          actualPrice: actualPrice,
        };
      });
    }



    return res.status(200).json({ success: true, data: formattedShares });
  } catch (error) {
    console.error("Error fetching sells by share:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve sells.",
      error: error.message,
    });
  }
};

const deleteSell = async (req, res) => {
  const { id } = req.params;
  try {
    const sell = await Sells.findOne({
      where: { id: id }
    })
    if (!sell) {
      return res.status(404).json({
        success: false,
        message: "No sell found.",
      });
    }
    await sell.destroy(); // deletes the record

    return res.status(200).json({
      success: true,
      message: "Sell deleted successfully.",
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete Sell",
      error: error.message,
    });
  }

}

const addBulkShares = async (req, res) => {


  const { shareDetails } = req.body;

  try {
    await Shares.bulkCreate(shareDetails, { validate: true });

    return res.status(201).json({
      success: true,
      message: "Shares added successfully.",
    });
  } catch (error) {
    console.error("Error adding shares:", error);
    return res.status(500).json({
      success: false,
      message: "Error adding shares",
      error: error.message,
    });
  }
};

const getAllBestDeals = async (req, res) => {
  const { user } = req;
  try {
    let sells;
    if (user.tier <= 2) {
      sells = await Sells.findAll({
        where: { bestDeal: true, approved: true, userId: { [Op.ne]: user.id } },
        include: [
          {
            model: Shares,
            as: "share", // must match Sells.belongsTo(Shares, { as: "share" })
            attributes: ["id", "name", "symbol", "price"],
          },
        ],
        order: [["createdAt", "DESC"]], // latest sells first
      });

    } else {
      sells = await Sells.findAll({
        where: { franchiseId: user.franchiseId, bestDeal: true, approved: true, userId: { [Op.ne]: user.id } },
        include: [
          {
            model: Shares,
            as: "share", // must match Sells.belongsTo(Shares, { as: "share" })
            attributes: ["id", "name", "symbol", "price"],
          },
        ],
        order: [["createdAt", "DESC"]], // latest sells first
      });

    }


    if (!sells || sells.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No best deal found.",
      });
    }

    // Transform shares: remove actualPrice and rename sellingPrice -> price
    const formattedShares = sells.map((sell) => {
      const { actualPrice, sellingPrice, ...rest } = sell.toJSON();
      return {
        ...rest,
        price: sellingPrice, // rename field
      };
    });

    return res.status(200).json({
      success: true,
      data: formattedShares,
    });
  } catch (error) {
    console.error("Error fetching all best deal:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve best Deals.",
      error: error.message,
    });
  }

}
const getAllNonApprovedBestDeals = async (req, res) => {
  const { user } = req;
  try {
    const sells = await Sells.findAll({
      where: { franchiseId: user.franchiseId, bestDeal: true, approved: false },
      include: [
        {
          model: Shares,
          as: "share", // must match Sells.belongsTo(Shares, { as: "share" })
          attributes: ["id", "name", "symbol", "price"],
        },
        {
          model: Users,
          as: "seller", // optional: include user info
          attributes: ["id", "firstName", "lastName", "email"],
        },
      ],
      order: [["createdAt", "DESC"]], // latest sells first
    });

    if (!sells || sells.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No best deal found.",
      });
    }

    // Transform shares: remove actualPrice and rename sellingPrice -> price
    const formattedShares = sells.map((sell) => {
      const { actualPrice, sellingPrice, ...rest } = sell.toJSON();
      return {
        ...rest,
        price: sellingPrice, // rename field
      };
    });

    return res.status(200).json({
      success: true,
      data: formattedShares,
    });
  } catch (error) {
    console.error("Error fetching all best deal:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve best Deals.",
      error: error.message,
    });
  }

}

const approvedBestDeal = async (req, res) => {
  const { id } = req.params;
  try {
    const sell = await Sells.findOne({
      where: { id: id },
      include: [
        {
          model: Shares,
          as: "share", // must match Sells.belongsTo(Shares, { as: "share" })
          attributes: ["id", "name", "symbol", "price"],
        },
      ],

    })
    if (!sell) {
      return res.status(404).json({
        success: false,
        message: "No best deal found.",
      });
    }
    sell.approved = true;
    await sell.save();

    await sendBestDealNotification(sell.userId, sell.franchiseId, sell.share.name)

    return res.status(200).json({
      success: true,
      message: "Approved",
      data: sell,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to approve sell",
      error: error.message,
    });
  }
}
const discardBestDeal = async (req, res) => {
  const { id } = req.params;
  try {
    const sell = await Sells.findOne({
      where: { id: id }
    })
    if (!sell) {
      return res.status(404).json({
        success: false,
        message: "No best deal found.",
      });
    }
    sell.bestDeal = false;
    await sell.save();

    return res.status(200).json({
      success: true,
      message: "Discarded",
      data: sell,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to discard sell",
      error: error.message,
    });
  }
}

const getBestDealBySellId = async (req, res) => {
  const { id } = req.params;
  const { user } = req;
  try {
    const sell = await Sells.findOne({
      where: { id: id, bestDeal: true, approved: true },
      include: [
        {
          model: Shares,
          as: "share", // matches the association alias
          attributes: ["id", "name", "symbol", "price"],
        },
      ],
    });

    if (!sell || sell.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No best deal found.",
      });
    }
    // Transform shares: remove actualPrice and rename sellingPrice -> price
    const { actualPrice, sellingPrice, ...rest } = sell.toJSON();
    const formattedShare = {
      ...rest,
      price: sellingPrice // rename field
    };

    return res.status(200).json({
      success: true,
      data: formattedShare,
    });
  } catch (error) {
    console.error("Error getting best deal by id:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve best deal.",
      error: error.message,
    });
  }

}

module.exports = {
  getAllShares,
  createSell,
  getAllShareByUserId,
  getAllSells,
  updateSell,
  getSellsByShareId,
  addBulkShares,
  getSellbySellId,
  getShareByShareId,
  getAllBestDeals,
  getAllNonApprovedBestDeals,
  approvedBestDeal,
  discardBestDeal,
  getBestDealBySellId,
  deleteSell
};

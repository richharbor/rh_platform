const { where } = require("sequelize");
const { Bookings, Sells, Users, Shares, Transactions, BuyQueries, NotifySubs } = require("../models");
const {sendBookingNotification} = require("../utils/sendNotification");



const BookShare = async (req, res) => {
  const { user } = req;

  const {
    sellId,
    quantity,
  } = req.body;
  try {
    // Validate input
    if (!sellId) {
      return res.status(400).json({
        success: false,
        message: "Sell ID is required.",
      });
    }

    const book = await Bookings.create({
      buyerId: user.id,
      quantity,
      sellId,
      franchiseId: user.franchiseId
    })

    await sendBookingNotification(user.franchiseId, user.firstName, user.lastName);

    return res.status(201).json({
      success: true,
      message: "Share booked successfully.",
      data: book,
    });
  } catch (error) {
    console.error("Error booking share:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to book share.",
      error: error.message,
    });
  }
};
const getAllBookings = async (req, res) => {
  const { user } = req;
  const { id } = req.params;
  try {
    const bookings = await Bookings.findAll({
      where: { franchiseId: id },
      include: [
        {
          model: Sells,
          as: "sell", // matches the association alias
          include: [
            { model: Shares, as: "share" },
            { model: Users, as: "seller", attributes: ['id', 'firstName', 'lastName'] }
          ]
        },
        {
          model: Users,
          as: "buyer",
          attributes: ['id', 'firstName', 'lastName']
        }
      ],
    });

    if (!bookings || bookings.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No bookings found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    console.error("Error getting bookings:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve bookings.",
      error: error.message,
    });
  }
};

const discardBooking = async (req, res) => {
  const { id } = req.params;
  try {
    const booking = await Bookings.findOne({
      where: { id: id }
    })
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "No booking found.",
      });
    }
    await booking.destroy(); // deletes the record

    return res.status(200).json({
      success: true,
      message: "Booking deleted successfully.",
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to discard booking",
      error: error.message,
    });
  }

}
const closeDeal = async (req, res) => {
  const { user } = req;
  const { sellId, id, sellerId, buyerId, dealQuantity, goodBuyer, goodSeller } = req.body;
  try {
    const sell = await Sells.findOne({
      where: { id: sellId },
      include: {
        model: Shares,
        as: "share"
      }
    })
    if (!sell) {
      return res.status(404).json({
        success: false,
        message: "Sell not found.",
      });
    }
    const transaction = await Transactions.create({
      closedBy: user.id,
      franchiseId: user.franchiseId,
      sellerId,
      buyerId,
      shareName: sell.share.name,
      quantity: dealQuantity,
      price: sell.sellingPrice,
    })

    if (sell.quantityAvailable <= dealQuantity) {
      await Sells.destroy({ where: { id: sellId } });
      await Bookings.destroy({ where: { id } });

      return res.status(200).json({
        success: true,
        message: "Deal closed successfully. Sell fully completed and removed.",
      });
    }

    sell.quantityAvailable = sell.quantityAvailable - dealQuantity;
    await sell.save();
    const deleted = await Bookings.destroy({ where: { id } });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "No booking found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Deal closed successfully"
    })


  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to close deal",
      error: error.message,
    });

  }

}

const getMyBookings = async (req, res) => {
  const { user } = req;
  try {
    const bookings = await Bookings.findAll({
      where: { buyerId: user.id },
      attributes: ['id', 'sellId', "quantity", ['createdAt', 'bookingDate']],
      include: [
        {
          model: Sells,
          as: "sell", // matches the association alias
          attributes: ['id', 'userId', 'shareId', ['sellingPrice', 'price'],],
          include: [
            { model: Shares, as: "share", attributes: ['id', 'name'] },
          ]
        },
      ],
    });

    if (!bookings || bookings.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No bookings found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    console.error("Error getting bookings:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve bookings.",
      error: error.message,
    });
  }
}
const deleteMyBooking = async (req, res) => {
  const { user } = req;
  const { id } = req.params;
  try {
    const booking = await Bookings.findOne({
      where: { id: id, buyerId: user.id }
    })
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "No booking found.",
      });
    }
    await booking.destroy(); // deletes the record

    return res.status(200).json({
      success: true,
      message: "Booking deleted successfully.",
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to discard booking",
      error: error.message,
    });
  }

}

const putBuyQuery = async (req, res) => {
  const { user } = req;
  const { shareName, quantity, price } = req.body;
  try {

    const buyQuery = await BuyQueries.create({
      userId: user.id,
      franchiseId: user.franchiseId,
      shareName,
      quantity,
      price,
    })



    return res.status(201).json({
      success: true,
      message: "Query send successfully.",
      data: buyQuery,
    });

  } catch (error) {
    console.error("Error sending query:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send query.",
      error: error.message,
    });

  }

}

const getAllBuyQueries = async (req, res) => {
  const { user } = req;
  const { id } = req.params;
  try {
    const queries = await BuyQueries.findAll({
      where: { franchiseId: id },
      include: [
        {
          model: Users,
          as: "buyer",
          attributes: ['id', 'firstName', 'lastName']
        }
      ],
    });


    if (!queries || queries.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No query found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: queries,
    });
  } catch (error) {
    console.error("Error getting buy queries:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve buy queries.",
      error: error.message,
    });
  }
}

const closeQuery = async (req, res) => {
  const { user } = req;
  const { id, buyerId, dealQuantity, goodBuyer, price, shareName } = req.body;
  try {
    const query = await BuyQueries.findOne({ where: { id } });

    if (!query) {
      return res.status(404).json({
        success: false,
        message: "No query found.",
      });
    }

    const transaction = await Transactions.create({
      closedBy: user.id,
      franchiseId: query.franchiseId,
      sellerId: user.id,
      buyerId,
      shareName: shareName,
      quantity: dealQuantity,
      price: price,
    })

    await query.destroy();

    return res.status(200).json({
      success: true,
      message: "Buy query closed successfully"
    })


  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to close buy query",
      error: error.message,
    });

  }

}

const discardQuery = async (req, res) => {
  const { id } = req.params;
  try {
    const query = await BuyQueries.findOne({
      where: { id: id }
    })
    if (!query) {
      return res.status(404).json({
        success: false,
        message: "No buy query found.",
      });
    }
    await query.destroy(); // deletes the record

    return res.status(200).json({
      success: true,
      message: "Buy query deleted successfully.",
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to discard buy query",
      error: error.message,
    });
  }

}


module.exports = {
  BookShare,
  getAllBookings,
  discardBooking,
  closeDeal,
  getMyBookings,
  deleteMyBooking,
  putBuyQuery,
  getAllBuyQueries,
  closeQuery,
  discardQuery
};
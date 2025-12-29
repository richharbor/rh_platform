const { Bids, Sells, Users, Shares, Transactions } = require("../models");
const {sendBidingNotification} = require("../utils/sendNotification");

const bidShare = async (req, res) => {
  const { user } = req;
  const {
    sellId,
    quantity,
    bidPrice,
  } = req.body;
  try {
    // Validate input
    if (!sellId) {
      return res.status(400).json({
        success: false,
        message: "Sell ID is required.",
      });
    }

    const bid = await Bids.create({
        buyerId: user.id,
        quantity,
        bidPrice,
        sellId,
        franchiseId: user.franchiseId
    })

     await sendBidingNotification(user.franchiseId, user.firstName, user.lastName);

    return res.status(201).json({
      success: true,
      message: "Bid raised successfully.",
      data: bid,
    });
  } catch (error) {
    console.error("Error in raising Bid:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to raise bid.",
      error: error.message,
    });
  }
};
const getAllBids = async (req, res) => {
  const {user} = req;
  const {id} = req.params;
  try {
    const bids = await Bids.findAll({
      where:{ franchiseId: id},
      include: [
        {
          model: Sells,
          as: "sell", // matches the association alias
          include:[
            {model : Shares, as: "share"},
            {model: Users, as: "seller", attributes: ['id', 'firstName', 'lastName' ]}
          ]
        },
        {
            model: Users,
            as: "bidder",
            attributes: ['id', 'firstName', 'lastName' ]
        }
      ],
    });

    if (!bids || bids.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No bids found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: bids,
    });
  } catch (error) {
    console.error("Error getting bids:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve bids.",
      error: error.message,
    });
  }
};
const discardBid = async (req, res) => {
  const { id } = req.params;
  try {
    const bid = await Bids.findOne({
      where: { id: id }
    })
    if (!bid) {
      return res.status(404).json({
        success: false,
        message: "No bid found.",
      });
    }
    await bid.destroy(); // deletes the record

    return res.status(200).json({
      success: true,
      message: "Bid deleted successfully.",
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to discard Bid",
      error: error.message,
    });
  }

}
const closeDeal = async (req, res) =>{
  const {user} = req;
  const { sellId,id, sellerId, buyerId, dealQuantity, goodBuyer, goodSeller, price} = req.body;
  try{
    const sell = await Sells.findOne({
      where:{id:sellId},
      include:{
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
      price: price,
    })
     if (sell.quantityAvailable <= dealQuantity) {
      await Sells.destroy({ where: { id: sellId } });
      await Bids.destroy({ where: { id } });

      return res.status(200).json({
        success: true,
        message: "Deal closed successfully. Sell fully completed and removed.",
      });
    }

    sell.quantityAvailable = sell.quantityAvailable - dealQuantity;
    await sell.save();
    const deleted = await Bids.destroy({ where: { id } });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "No bid found.",
      });
    }

    return res.status(200).json({
      success:true,
      message:"Deal closed successfully"
    })


  }catch(error){
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to close deal",
      error: error.message,
    });

  }

}
const getMyBids = async (req, res) =>{
  const { user } = req;
  try {
    const bids = await Bids.findAll({
      where: { buyerId: user.id },
      attributes:['id', 'sellId', "quantity", ['createdAt','bidingDate'], 'bidPrice'],
      include: [
        {
          model: Sells,
          as: "sell", // matches the association alias
          attributes:['id', 'userId','shareId', ['sellingPrice', 'price'],],
          include: [
            { model: Shares, as: "share", attributes:['id','name'] },
          ]
        },
      ],
    });

    if (!bids || bids.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No bid found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: bids,
    });
  } catch (error) {
    console.error("Error getting bids:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve bids.",
      error: error.message,
    });
  }
}
const deleteMyBid = async (req, res) =>{
  const {user} = req;
  const {id}  = req.params;
  try {
    const bid = await Bids.findOne({
      where: { id: id, buyerId: user.id }
    })
    if (!bid) {
      return res.status(404).json({
        success: false,
        message: "No bid found.",
      });
    }
    await bid.destroy(); // deletes the record

    return res.status(200).json({
      success: true,
      message: "Bid deleted successfully.",
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to discard Bid",
      error: error.message,
    });
  }

}


module.exports = {
  bidShare,
  getAllBids,
  discardBid,
  closeDeal,
  getMyBids,
  deleteMyBid
};
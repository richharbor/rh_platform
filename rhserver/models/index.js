const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";
const config = require(__dirname + "/../config/config.js")[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
  );
}

// Scan current directory (existing rhserver models)
fs.readdirSync(__dirname)
  .filter(
    (file) =>
      file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js"
  )
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(
      sequelize,
      Sequelize.DataTypes
    );
    db[model.name] = model;
  });

// Scan platform/models directory (new rh_platform service) -> REMOVED to support separate DB
// Platform models are now initialized in platform/models/index.js
// --- ASSOCIATIONS ---

//   Users ↔ UserRoles
db.Users.hasMany(db.UserRoles, { foreignKey: "userId", as: "userRoles" });
db.UserRoles.belongsTo(db.Users, { foreignKey: "userId", as: "user" });

//   Roles ↔ UserRoles
db.Roles.hasMany(db.UserRoles, { foreignKey: "roleId", as: "roleAssignments" });
db.UserRoles.belongsTo(db.Roles, { foreignKey: "roleId", as: "role" });

db.Roles.belongsTo(db.Users, { foreignKey: "createdBy", as: "creator" });

//   Users ↔ OnboardingApplications
db.Users.hasMany(db.OnboardingApplications, {
  foreignKey: "userId",
  as: "applications",
});

db.OnboardingApplications.belongsTo(db.Users, {
  foreignKey: "userId",
  as: "user",
});

//   Roles ↔ OnboardingApplications
db.Roles.hasMany(db.OnboardingApplications, {
  foreignKey: "requestedRoleId",
  as: "onboardingRequests",
});

db.OnboardingApplications.belongsTo(db.Roles, {
  foreignKey: "requestedRoleId",
  as: "requestedRole",
});

//   Franchises ↔ Users
db.Franchises.hasMany(db.Users, {
  foreignKey: "franchiseId",
  as: "franchiseUsers",
});

db.Users.belongsTo(db.Franchises, {
  foreignKey: "franchiseId",
  as: "franchise",
});

//   Franchises ↔ Roles
db.Franchises.hasMany(db.Roles, {
  foreignKey: "franchiseId",
  as: "franchiseRoles",
});
db.Roles.belongsTo(db.Franchises, {
  foreignKey: "franchiseId",
  as: "franchise",
});

//   Franchises ↔ UserRoles
db.Franchises.hasMany(db.UserRoles, {
  foreignKey: "franchiseId",
  as: "franchiseUserRoles",
});

db.UserRoles.belongsTo(db.Franchises, {
  foreignKey: "franchiseId",
  as: "franchise",
});

//   Self reference: Users ↔ Users (creator)
db.Users.belongsTo(db.Users, { foreignKey: "createdBy", as: "creator" });
db.Users.hasMany(db.Users, { foreignKey: "createdBy", as: "createdUsers" });

//   Shares  ↔  Users
db.Sells.belongsTo(db.Users, { foreignKey: "userId", as: "seller" });
db.Users.hasMany(db.Sells, { foreignKey: "userId", as: "sells" });


// Sells ↔ Shares
db.Sells.belongsTo(db.Shares, { foreignKey: "shareId", as: "share" });
db.Shares.hasMany(db.Sells, { foreignKey: "shareId", as: "sells" });


// Sells ↔ Franchises
db.Sells.belongsTo(db.Franchises, { foreignKey: "franchiseId", as: "franchise" });
db.Franchises.hasMany(db.Sells, { foreignKey: "franchiseId", as: "sells" });


//   Bookings  ↔  Users
db.Bookings.belongsTo(db.Users, { foreignKey: "buyerId", as: "buyer" });
db.Users.hasMany(db.Bookings, { foreignKey: "buyerId", as: "purchases" });

// Bookings ↔ Sells
db.Bookings.belongsTo(db.Sells, { foreignKey: "sellId", as: "sell" });
db.Sells.hasMany(db.Bookings, { foreignKey: "sellId", as: "bookings" });

// Bookings ↔ Franchises
db.Bookings.belongsTo(db.Franchises, { foreignKey: "franchiseId", as: "franchise" });
db.Franchises.hasMany(db.Bookings, { foreignKey: "franchiseId", as: "bookings" });

//   Bids  ↔  Users
db.Bids.belongsTo(db.Users, { foreignKey: "buyerId", as: "bidder" });
db.Users.hasMany(db.Bids, { foreignKey: "buyerId", as: "bids" });

// Bids ↔ Sells
db.Bids.belongsTo(db.Sells, { foreignKey: "sellId", as: "sell" });
db.Sells.hasMany(db.Bids, { foreignKey: "sellId", as: "bids" });


// Bids ↔ Franchises
db.Bids.belongsTo(db.Franchises, { foreignKey: "franchiseId", as: "franchise" });
db.Franchises.hasMany(db.Bids, { foreignKey: "franchiseId", as: "bids" });

// Shares ↔ Franchises
db.Shares.belongsTo(db.Franchises, { foreignKey: "franchiseId", as: "franchise" });
db.Franchises.hasMany(db.Shares, { foreignKey: "franchiseId", as: "shares" });

//Transaction <=> Seller
db.Transactions.belongsTo(db.Users, { foreignKey: "sellerId", as: "seller" });
db.Users.hasMany(db.Transactions, { foreignKey: "sellerId", as: "sales" });

//Transaction <=> Buyer
db.Transactions.belongsTo(db.Users, { foreignKey: "buyerId", as: 'buyer' });
db.Users.hasMany(db.Transactions, { foreignKey: "buyerId", as: "buyerTransactions" })

//Transaction <=> closedBy
db.Transactions.belongsTo(db.Users, { foreignKey: "closedBy", as: 'Dealer' });
db.Users.hasMany(db.Transactions, { foreignKey: 'closedBy', as: 'transactions' });

//Transaction <=> frenchises
db.Transactions.belongsTo(db.Franchises, { foreignKey: "franchiseId", as: "franchise" });
db.Franchises.hasMany(db.Transactions, { foreignKey: "franchiseId", as: "franchiseTransactions" });

//BuyQueries <=> User
db.BuyQueries.belongsTo(db.Users, { foreignKey: "userId", as: "buyer" })
db.Users.hasMany(db.BuyQueries, { foreignKey: "userId", as: "buyQueries" })

//BuyQueries <=> Frenchise
db.BuyQueries.belongsTo(db.Franchises, { foreignKey: "franchiseId", as: 'franchise' });
db.Franchises.hasMany(db.BuyQueries, { foreignKey: "franchiseId", as: "buyRequests" });

//NotifySubs <=> Frenchise
db.NotifySubs.belongsTo(db.Franchises, { foreignKey: "franchiseId", as: 'franchise' });
db.Franchises.hasMany(db.NotifySubs, { foreignKey: "franchiseId", as: "notifySubs" });

//NotifySubs <=> User
db.NotifySubs.belongsTo(db.Users, { foreignKey: "userId", as: "User" });
db.Users.hasMany(db.NotifySubs, { foreignKey: "userId", as: 'userSub' });






db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;

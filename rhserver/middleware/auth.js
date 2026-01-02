const jwt = require("jsonwebtoken");
const { Users, UserRoles, Roles } = require("../models");

const authenticate = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new Error();
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined in environment variables");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await Users.findOne({
      where: {
        id: decoded.id,
        // isActive: true,
      },
      include: [
        {
          model: UserRoles,
          as: "userRoles",
          where: { isActive: true },
          required: false,
          include: [
            {
              model: Roles,
              as: "role",
              attributes: [
                "id",
                "name",
                "description",
                "permissions",
                "isActive",
                "franchiseId",
                "createdBy",
                "createdAt",
                "updatedAt",
              ],
            },
          ],
        },
      ],
    });

    if (!user) {
      throw new Error();
    }

    req.user = user;
    req.token = token;
    req.currentRole = decoded.currentRole || null;

    next();
  } catch (error) {
    res.status(401).json({ error: "Please authenticate" });
  }
};

const authenticateSoft = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined in environment variables");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await Users.findOne({
      where: {
        id: decoded.id,
        // No isActive check here
      },
      include: [
        {
          model: UserRoles,
          as: "userRoles",
          where: { isActive: true },
          required: false,
          include: [
            {
              model: Roles,
              as: "role",
              attributes: [
                "id",
                "name",
                "description",
                "permissions",
                "isActive",
                "franchiseId",
                "createdBy",
                "createdAt",
                "updatedAt",
              ],
            },
          ],
        },
      ],
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid token" });
    }

    req.user = user;
    req.token = token;
    req.currentRole = decoded.currentRole || null;

    next();
  } catch (error) {
    res.status(401).json({ error: "Authentication failed" });
  }
};

const authorize = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      if (req.user.isSuperAdmin) {
        return next();
      }

      const userRoles = req.user.userRoles.map((ur) => ur.role.name);
      const hasRole = allowedRoles.some((role) => userRoles.includes(role));

      if (!hasRole) {
        return res.status(403).json({ error: "Access denied" });
      }

      next();
    } catch (error) {
      res.status(403).json({ error: "Access denied" });
    }
  };
};

module.exports = {
  authenticate,
  authenticateSoft,
  authorize,
};

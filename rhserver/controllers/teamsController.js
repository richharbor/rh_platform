const jwt = require("jsonwebtoken");
const { sendEmail } = require("../utils/sendEmail");
const { Op } = require("sequelize");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const {
  OnboardingApplications,
  Users,
  UserRoles,
  Roles,
  Franchises,
} = require("../models");

const getAllTeamMembers = async (req, res) => {
  try {
    const { status = "all", page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const whereCondition = { tier: 2 };
    if (status !== "all") whereCondition.status = status;

    const { count, rows } = await Users.findAndCountAll({
      where: whereCondition,
      include: [
        //  Creator of the user
        {
          model: Users,
          as: "creator",
          attributes: ["id", "firstName", "lastName", "email"],
        },

        // UserRoles for the user
        {
          model: UserRoles,
          as: "userRoles",
          required: false,
          where: { isActive: true },
          include: [
            // Role assigned
            {
              model: Roles,
              as: "role",
              attributes: ["id", "name", "description", "permissions"],
            },
            // User who assigned this role
            {
              model: Users,
              as: "user",
              attributes: ["id", "firstName", "lastName", "email"],
            },
          ],
        },
      ],
      attributes: [
        "id",
        "email",
        "firstName",
        "lastName",
        "phoneNumber",
        "emailVerified",
        "createdBy",
        "tier",
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["id", "DESC"]],
    });

    const users = rows.map((user) => {
      const plainUser = user.get({ plain: true });
      const creatorName = plainUser.creator
        ? `${plainUser.creator.firstName} ${plainUser.creator.lastName}`.trim()
        : null;

      const roles = (plainUser.userRoles || []).map((ur) => ({
        id: ur.role?.id,
        name: ur.role?.name,
        description: ur.role?.description,
        permissions: ur.role?.permissions,
        isPrimary: ur.isPrimary,
        assignedAt: ur.assignedAt,
        assignedBy: ur.user
          ? {
              id: ur.user.id,
              firstName: ur.user.firstName,
              lastName: ur.user.lastName,
              email: ur.user.email,
            }
          : null,
      }));

      return {
        id: plainUser.id,
        email: plainUser.email,
        firstName: plainUser.firstName,
        lastName: plainUser.lastName,
        phoneNumber: plainUser.phoneNumber,
        emailVerified: plainUser.emailVerified,
        tier: plainUser.tier,
        creatorId: plainUser.createdBy,
        creatorName,
        roles,
      };
    });

    res.json({
      success: true,
      users,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error("Get team members error:", error);
    res.status(500).json({ error: "Failed to fetch team members" });
  }
};

const createRoles = async (req, res) => {
  try {
    const { name, description, permissions = [] } = req.body;
    const { user } = req;

    if (!user.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    // Basic validation
    if (!name) {
      return res.status(400).json({ error: "Roles name is required" });
    }

    // Ensure unique name (case-insensitive)
    const existingRole = await Roles.findOne({
      where: {
        name,
        franchiseId: null,
      },
    });

    if (existingRole) {
      return res.status(409).json({ error: `Roles '${name}' already exists` });
    }

    // Create new role (no franchiseId for teams)
    const newRole = await Roles.create({
      name: name,
      description,
      permissions,
      createdBy: user?.id || null,
      franchiseId: null,
    });

    res.status(201).json({
      success: true,
      message: "Roles created successfully",
      role: newRole,
    });
  } catch (error) {
    console.error("Create role error:", error);
    res.status(500).json({ error: "Failed to create role" });
  }
};

const deleteRole = async (req, res) => {
  try {
    const { id } = req.params; // Role ID from route
    const { user } = req;

    // Check authentication
    if (!user || !user.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Validate role ID
    if (!id) {
      return res.status(400).json({ error: "Role ID is required" });
    }

    // Find the role
    const role = await Roles.findByPk(id);

    if (!role) {
      return res.status(404).json({ error: "Role not found" });
    }

    // Ensure it’s a team-level role (no franchise)
    if (role.franchiseId !== null) {
      return res.status(403).json({
        error: "Cannot delete franchise-specific role from this endpoint",
      });
    }

    // Prevent deletion of protected system roles
    const protectedRoles = ["superadmin"];
    if (protectedRoles.includes(role.name.toLowerCase())) {
      return res.status(403).json({ error: "Cannot delete protected role" });
    }

    // Check if this role is assigned to any users
    const assignedCount = await UserRoles.count({ where: { roleId: id } });
    if (assignedCount > 0) {
      return res
        .status(400)
        .json({ error: "Cannot delete role that is assigned to users" });
    }

    // Delete the role
    await role.destroy();

    res.json({
      success: true,
      message: `Role '${role.name}' deleted successfully`,
    });
  } catch (error) {
    console.error("Delete role error:", error);
    res.status(500).json({ error: "Failed to delete role" });
  }
};

const getAllRoles = async (req, res) => {
  try {
    const roles = await Roles.findAll({
      where: {
        franchiseId: null,
        name: { [Op.notIn]: ["superadmin", "franchise-admin", "partner"] },
      },
      include: [
        {
          model: Users,
          as: "creator", // must match alias defined in model association
          attributes: ["id", "firstName", "lastName", "email"],
        },
      ],
      // order: [["createdAt", "DESC"]],
    });

    const formattedRoles = roles.map((role) => {
      const plain = role.get({ plain: true });
      return {
        ...plain,
        createdByName: plain.creator
          ? `${plain.creator.firstName} ${plain.creator.lastName}`.trim()
          : null,
        createdByEmail: plain.creator?.email || null,
      };
    });

    return res.json({
      success: true,
      roles: formattedRoles,
    });
  } catch (error) {
    console.error("Error fetching roles:", error);
    res.status(500).json({ success: false, message: "Failed to fetch roles" });
  }
};

const inviteTeamMembers = async (req, res) => {
  try {
    const { email, roles, firstName, lastName } = req.body;
    const inviterId = req.user?.id;

    console.log("inviterId😎", inviterId);
    // Validation
    if (!email || !roles?.length || !firstName || !lastName) {
      return res.status(400).json({
        error:
          "firstName, lastName, email, and at least one role are required.",
      });
    }

    if (!inviterId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    //  Check if user already exists
    const existingUser = await Users.findOne({ where: { email } });
    if (existingUser) {
      return res
        .status(403)
        .json({ error: "A user with this email already exists." });
    }

    // Validate roles
    const validRoles = await Roles.findAll({
      where: { id: roles },
      attributes: ["id", "name"],
    });

    if (validRoles.length !== roles.length) {
      const validIds = validRoles.map((r) => r.id);
      const invalidIds = roles.filter((id) => !validIds.includes(id));
      return res.status(400).json({
        error: `Invalid role IDs: ${invalidIds.join(", ")}`,
      });
    }

    // Generate random secure password
    const generatePassword = (length = 12) =>
      crypto.randomBytes(length).toString("hex").slice(0, length);

    const plainPassword = generatePassword(10);
    // const hashedPassword = await bcrypt.hash(plainPassword, 10);

    //  Create user (inactive, tier 2, no franchise)
    const newUser = await Users.create({
      email,
      password: plainPassword,
      firstName,
      lastName,
      isActive: false,
      isSuperAdmin: false,
      tier: 2,
      franchiseId: null,
      createdBy: inviterId,
      emailVerified: false,
    });

    // Assign all roles to this user
    const userRolesToCreate = validRoles.map((role, index) => ({
      userId: newUser.id,
      roleId: role.id,
      isActive: true,
      isPrimary: index === 0, // first role is primary
      franchiseId: null,
      assignedBy: inviterId,
    }));

    await UserRoles.bulkCreate(userRolesToCreate);

    // Generate onboarding token
    const token = jwt.sign(
      { inviterId, invitedUserId: newUser.id, email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const onboardingUrl = `${process.env.FRONTEND_URL}/auth/verify?token=${token}`;

    //  Prepare email
    const roleNames = validRoles.map((r) => r.name).join(", ");
    const htmlContent = `
      <h2>You're invited to join the RichHarbor Team</h2>
      <p>Hello ${firstName},</p>
      <p>You have been invited to join as: <strong>${roleNames}</strong>.</p>
      <p>Your temporary password is: <strong>${plainPassword}</strong></p>
      <p>Click below to complete your setup:</p>
      <p><a href="${onboardingUrl}" target="_blank" style="color:#2563eb;">Accept Invitation</a></p>
      <p>This link will expire in 7 days.</p>
    `;

    await sendEmail(
      email,
      "You're Invited to Join the Team",
      htmlContent,
      true
    );

    // Response
    return res.status(201).json({
      success: true,
      message: `Invitation sent successfully to ${email}`,
      data: {
        id: newUser.id,
        email: newUser.email,
        firstName,
        lastName,
        roles: validRoles.map((r) => r.name),
      },
    });
  } catch (error) {
    console.error("Invite team error:", error);
    return res.status(500).json({ error: "Error sending team invitation." });
  }
};

module.exports = {
  inviteTeamMembers,
  getAllTeamMembers,
  createRoles,
  getAllRoles,
  deleteRole,
};

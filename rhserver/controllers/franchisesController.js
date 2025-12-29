const {
  OnboardingApplications,
  Users,
  Roles,
  Franchises,
  UserRoles,
} = require("../models");
const jwt = require("jsonwebtoken");
const { sendEmail } = require("../utils/sendEmail");
const crypto = require("crypto");
const { franchiseInvitationEmail } = require("../utils/emailTemplate");

const getAllFranchises = async (req, res) => {
  try {
    const { status = "all", page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const whereCondition = { tier: 3 }; // franchise admins
    if (status !== "all") whereCondition.status = status;

    // Step 1: Fetch franchise admins and their roles
    const { count, rows } = await Users.findAndCountAll({
      where: whereCondition,
      include: [
        {
          model: Users,
          as: "creator",
          attributes: ["id", "firstName", "lastName", "email"],
        },
        {
          model: UserRoles,
          as: "userRoles",
          required: false,
          where: { isActive: true },
          include: [
            {
              model: Roles,
              as: "role",
              attributes: ["id", "name", "description", "permissions"],
            },
            {
              model: Users,
              as: "user", // who assigned the role
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
        "franchiseId",
        "tier",
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["id", "DESC"]],
    });

    const users = rows.map((user) => user.get({ plain: true }));

    // Step 2: Fetch franchises separately
    const franchiseIds = [
      ...new Set(users.map((u) => u.franchiseId).filter(Boolean)),
    ];
    const franchises = await Franchises.findAll({
      where: { id: franchiseIds },
      attributes: ["id", "name", "subdomain", "status", "createdBy"],
    });

    // Step 3: Fetch franchise creators separately
    const creatorIds = [
      ...new Set(franchises.map((f) => f.createdBy).filter(Boolean)),
    ];
    const franchiseCreators = await Users.findAll({
      where: { id: creatorIds },
      attributes: ["id", "firstName", "lastName", "email"],
    });

    // Map creators by ID
    const creatorMap = {};
    franchiseCreators.forEach((c) => {
      creatorMap[c.id] = c;
    });

    // Map franchises by ID and attach creator info
    const franchiseMap = {};
    franchises.forEach((f) => {
      franchiseMap[f.id] = {
        ...f.get({ plain: true }),
        creator: f.createdBy ? creatorMap[f.createdBy] : null,
      };
    });

    // Step 4: Format users with franchise info
    const formattedUsers = users.map((u) => {
      const franchise = u.franchiseId ? franchiseMap[u.franchiseId] : null;
      const franchiseCreator = franchise?.creator;

      const roles = (u.userRoles || []).map((ur) => ({
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
        id: u.id,
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
        phoneNumber: u.phoneNumber,
        emailVerified: u.emailVerified,
        tier: u.tier,
        creatorId: u.createdBy,
        creatorName: u.creator
          ? `${u.creator.firstName} ${u.creator.lastName}`.trim()
          : null,
        franchise: franchise
          ? {
              ...franchise,
              createdByName: franchiseCreator
                ? `${franchiseCreator.firstName} ${franchiseCreator.lastName}`.trim()
                : null,
              createdByEmail: franchiseCreator?.email || null,
            }
          : null,
        roles,
      };
    });

    res.json({
      success: true,
      users: formattedUsers,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error("Get franchise admins error:", error);
    res.status(500).json({ error: "Failed to fetch franchise admins" });
  }
};

const inviteFranchiseAdmin = async (req, res) => {
  try {
    const { franchiseName, firstName, lastName, inviteEmail } = req.body;
    const inviterId = req.user?.id;

    // Validation
    if (!franchiseName || !firstName || !lastName || !inviteEmail) {
      return res.status(400).json({
        error:
          "franchiseName, firstName, lastName and inviteEmail are required",
      });
    }

    if (!inviterId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Check if user already exists
    const existingUser = await Users.findOne({ where: { email: inviteEmail } });
    if (existingUser) {
      return res
        .status(403)
        .json({ error: "A user with this email already exists." });
    }

    // Check if franchise already exists
    const existingFranchise = await Franchises.findOne({
      where: { name: franchiseName },
    });

    if (existingFranchise) {
      return res.status(409).json({
        error: `A franchise with the name "${franchiseName}" already exists. Please choose a different name.`,
      });
    }

    // If not exist, create new franchise
    const randomSuffix = crypto.randomBytes(3).toString("hex");
    const subdomain = `${franchiseName
      .toLowerCase()
      .replace(/\s+/g, "-")}-${randomSuffix}`;

    const franchise = await Franchises.create({
      name: franchiseName,
      subdomain,
      status: "pending",
      createdBy: inviterId,
    });

    // Ensure franchises-admin role exists
    let franchiseAdminRole = await Roles.findOne({
      where: { name: "franchises-admin" },
    });
    if (!franchiseAdminRole) {
      franchiseAdminRole = await Roles.create({
        name: "franchise-admin",
        description: "Admin role for franchise management",
        permissions: [],
        createdBy: inviterId,
      });
    }

    // Generate random secure password
    const generatePassword = (length = 12) =>
      crypto.randomBytes(length).toString("hex").slice(0, length);

    const plainPassword = generatePassword(10);
    // const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // Create franchise admin user
    const newUser = await Users.create({
      email: inviteEmail,
      password: plainPassword,
      firstName,
      lastName,
      isActive: false,
      isSuperAdmin: false,
      tier: 3, // franchise admin
      franchiseId: franchise.id,
      createdBy: inviterId,
      emailVerified: false,
    });

    // Assign franchises-admin role
    await UserRoles.create({
      userId: newUser.id,
      roleId: franchiseAdminRole.id,
      isActive: true,
      isPrimary: true,
      franchiseId: franchise.id,
      assignedBy: inviterId,
    });

    // Generate invitation token
    const token = jwt.sign(
      { inviterId, invitedUserId: newUser.id, email: inviteEmail },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const onboardingUrl = `${process.env.FRONTEND_URL}/auth/verify?token=${token}`;

    const emailHtml = franchiseInvitationEmail({
      firstName,
      franchiseName: franchise.name,
      plainPassword,
      onboardingUrl: onboardingUrl,
    });

    await sendEmail(
      inviteEmail,
      `${firstName} ${lastName} Admin Invitation`,
      emailHtml,
      true
    );

    return res.status(201).json({
      success: true,
      message: `Invitation sent successfully to ${inviteEmail}`,
      data: {
        userId: newUser.id,
        email: newUser.email,
        firstName,
        lastName,
        franchiseId: franchise.id,
        franchiseName: franchise.name,
        role: franchiseAdminRole.name,
      },
    });
  } catch (error) {
    console.error("Invite franchise admin error:", error);
    return res
      .status(500)
      .json({ error: "Failed to send franchise admin invitation." });
  }
};

module.exports = {
  getAllFranchises,
  inviteFranchiseAdmin,
};

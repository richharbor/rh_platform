const {
  OnboardingApplications,
  Users,
  Roles,
  Franchises,
  UserRoles,
  sequelize,
} = require("../models");
const jwt = require("jsonwebtoken");
const { sendEmail } = require("../utils/sendEmail");

const { generatePartnerInvitationEmail } = require("../utils/emailTemplate");

require("dotenv").config();

const { Op } = require("sequelize");

// Get all onboarding applications (with filters)
const getAllPartnerApplications = async (req, res) => {
  try {
    const { status = "all", page = 1, limit = 10, franchiseId } = req.query;
    const { user } = req;

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    //  Determine which franchiseId to use
    let effectiveFranchiseId = franchiseId || user.franchiseId;

    //  Only allow users linked to a franchise (unless superadmin)
    if (!effectiveFranchiseId && user.tier !== 1) {
      return res.status(403).json({
        error: "Access denied: No franchise associated with this user",
      });
    }

    //  Build where condition
    const whereCondition = {};
    if (status !== "all") {
      whereCondition.status = status;
    }
    if (user.tier !== 1 && effectiveFranchiseId) {
      // Franchise users only see their own franchise’s data
      whereCondition.franchiseId = effectiveFranchiseId;
    } else if (user.tier === 1 && franchiseId) {
      // Superadmin can optionally filter by any franchise
      whereCondition.franchiseId = franchiseId;
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await OnboardingApplications.findAndCountAll({
      where: whereCondition,
      include: [
        {
          model: Users,
          as: "user",
          where: {
            tier: 4,
          },
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
            "isActive"
          ],
          include: [
            {
              model: Users,
              as: "creator",
              attributes: ["id", "firstName", "lastName", "email"],
            },
          ],
        },
        {
          model: Roles,
          as: "requestedRole",
          attributes: ["id", "name"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    //  Convert Sequelize instances to plain JSON
    const plainApplications = rows.map((row) => row.get({ plain: true }));

    //  Add creatorName
    const formattedApplications = plainApplications.map((app) => {
      const user = app.user || {};
      const creator = user.creator
        ? `${user.creator.firstName} ${user.creator.lastName}`.trim()
        : null;

      return {
        ...app,
        user: {
          ...user,
          creatorName: creator,
        },
      };
    });

    res.json({
      success: true,
      applications: formattedApplications,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error("Get applications error:", error);
    res.status(500).json({ error: "Failed to fetch applications" });
  }
};

const getPartnerDetailsByUserId = async (req, res) => {
  try {
    const { userId, franchiseId } = req.query;
    const { user } = req;

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    //  Determine which franchiseId to use
    let effectiveFranchiseId = franchiseId || user.franchiseId;

    //  Only allow users linked to a franchise (unless superadmin)
    if (!effectiveFranchiseId && user.tier !== 1) {
      return res.status(403).json({
        error: "Access denied: No franchise associated with this user",
      });
    }

    //  Build where condition
    const whereCondition = {};

    whereCondition.userId = userId;

    if (user.tier !== 1 && effectiveFranchiseId) {
      // Franchise users only see their own franchise’s data
      whereCondition.franchiseId = effectiveFranchiseId;
    } else if (user.tier === 1 && franchiseId) {
      // Superadmin can optionally filter by any franchise
      whereCondition.franchiseId = franchiseId;
    }

    const partner = await OnboardingApplications.findOne({
      where: whereCondition,
      attributes: [
        "id",
        "userId",
        "formData",
      ],
      include: [
        {
          model: Users,
          as: "user",
          where: {
            tier: 4,
          },
          attributes: [
            "id",
            "email",
            "firstName",
            "lastName",
            "phoneNumber",
            "emailVerified",
            "createdAt",
            "franchiseId",
            "tier",
          ],
        },

      ],
    });
    res.json({
      success: true,
      applications: partner,
    });
  } catch (error) {
    console.error("Get applications error:", error);
    res.status(500).json({ error: "Failed to fetch applications" });
  }
}
const getMyProfile = async (req, res) => {
  try {
    const { user } = req;
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    //  Build where condition
    const whereCondition = {};

    whereCondition.userId = user.id;

    const partner = await OnboardingApplications.findOne({
      where: whereCondition,
      attributes: [
        "id",
        "userId",
        "formData",
      ],
      include: [
        {
          model: Users,
          as: "user",
          where: {
            tier: 4,
          },
          attributes: [
            "id",
            "email",
            "firstName",
            "lastName",
            "phoneNumber",
            "emailVerified",
            "createdAt",
            "franchiseId",
            "tier",
          ],
        },

      ],
    });
    res.json({
      success: true,
      data: partner,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ error: "Failed to fetch profile" });

  }
}

const getAllPartners = async (req, res) => {
  try {
    const { status = "all", page = 1, limit = 10 } = req.query;
    const { user } = req;

    const whereCondition = {};
    if (status !== "all") {
      whereCondition.status = status;
    }

    const offset = (page - 1) * limit;

    //   Only fetch applications for users who are tier 4 (partners)
    const { count, rows } = await OnboardingApplications.findAndCountAll({
      where: whereCondition,
      include: [
        {
          model: Users,
          as: "user",
          where: { tier: 4 }, //  only partners
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
          include: [
            {
              model: Users,
              as: "superior",
              attributes: ["id", "firstName", "lastName", "email"],
            },
            {
              model: Franchises,
              as: "franchise",
              attributes: ["id", "name", "subdomain", "status", "createdBy"],
              include: [
                {
                  model: Users,
                  as: "creator",
                  attributes: ["id", "firstName", "lastName", "email"],
                },
              ],
            },
          ],
        },
        {
          model: Roles,
          as: "requestedRole",
          attributes: ["id", "name"],
        },
      ],
      order: [["id", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    // Convert Sequelize instances to plain objects
    const plainApplications = rows.map((row) => row.get({ plain: true }));

    // Format for frontend
    const formattedApplications = plainApplications.map((app) => {
      const user = app.user || {};
      const superior = user.superior
        ? `${user.superior.firstName} ${user.superior.lastName}`.trim()
        : null;

      const franchise = user.franchise || {};
      const creator = franchise.creator
        ? `${franchise.creator.firstName} ${franchise.creator.lastName}`.trim()
        : null;

      return {
        ...app,
        user: {
          ...user,
          superiorName: superior,
          franchise: {
            ...franchise,
            createdByName: creator,
            createdByEmail: franchise.creator?.email || null,
          },
        },
      };
    });

    res.json({
      success: true,
      applications: formattedApplications,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error("Get partner applications error:", error);
    res.status(500).json({ error: "Failed to fetch partner applications" });
  }
};

const createRoles = async (req, res) => {
  try {
    const { name, description, permissions = [], franchiseId } = req.body;
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
      where: { name: name, franchiseId },
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
      franchiseId: franchiseId,
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
    const { id } = req.params; // Role ID to delete
    const { user } = req;

    if (!user || !user.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Validate role ID
    if (!id) {
      return res.status(400).json({ error: "Role ID is required" });
    }

    // Find role
    const role = await Roles.findByPk(id);
    if (!role) {
      return res.status(404).json({ error: "Role not found" });
    }

    // Prevent deletion of system roles (optional safeguard)
    const protectedRoles = ["superadmin"];
    if (protectedRoles.includes(role.name.toLowerCase())) {
      return res.status(403).json({ error: "Cannot delete protected role" });
    }

    // Check if role is assigned to any users
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
    const { user } = req;
    const { franchiseId } = req.query; //   support query param

    if (!user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // Determine which franchiseId to use
    const targetFranchiseId = franchiseId || user.franchiseId;

    //   Only allow if franchiseId is available
    if (!targetFranchiseId) {
      return res.status(403).json({
        success: false,
        message: "Access denied: No franchise associated with this user",
      });
    }

    const roles = await Roles.findAll({
      where: {
        franchiseId: targetFranchiseId,
        name: { [Op.notIn]: ["superadmin", "franchises-admin"] },
      },
      include: [
        {
          model: Users,
          as: "creator",
          attributes: ["id", "firstName", "lastName", "email"],
        },
      ],
      order: [["createdAt", "DESC"]],
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

const getAllFranchisesForPartner = async (req, res) => {
  try {
    const { status = "all" } = req.query;
    const { user } = req;

    if (!user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // Optional restriction: Only Super Admin (tier 1) or Admin (tier 2)
    if (user.tier > 2) {
      return res
        .status(403)
        .json({ success: false, message: "Access denied for this role" });
    }

    const whereCondition = {};
    if (status !== "all") {
      whereCondition.status = status;
    }

    // Fetch all franchises with creator details
    const franchises = await Franchises.findAll({
      where: whereCondition,
      order: [["createdAt", "DESC"]],
    });

    //  Format the data
    const formatted = franchises.map((f) => {
      const plain = f.get({ plain: true });
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
      franchises: formatted,
    });
  } catch (error) {
    console.error("Error fetching franchises:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch franchises" });
  }
};

const invitePartnerUsingEmail = async (req, res) => {
  try {
    const { email, roles, franchiseId } = req.body;
    const inviter = req.user;

    if (!email || !roles?.length) {
      return res.status(400).json({ error: "Email and roles are required" });
    }

    if (!inviter || !inviter.id) {
      return res.status(401).json({ error: "Unauthorized inviter" });
    }

    if (!inviter.franchiseId && inviter.tier !== 1) {
      return res.status(403).json({
        error: "Access denied: inviter not linked to a franchise",
      });
    }

    const effectiveFranchiseId = franchiseId || inviter.franchiseId;

    const franchise = await Franchises.findByPk(effectiveFranchiseId);
    if (!franchise) {
      return res.status(404).json({ error: "Franchise not found" });
    }

    const existingUser = await Users.findOne({ where: { email } });
    if (existingUser) {
      return res
        .status(409)
        .json({ error: "User with this email already exists" });
    }

    // Resolve role IDs to names
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

    // Generate secure invite token (valid for 7 days)
    const token = jwt.sign(
      {
        inviterId: inviter.id,
        partnerEmail: email,
        roles: validRoles.map((r) => r.id), // store IDs in token
        franchiseId: effectiveFranchiseId,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const onboardingUrl = `${process.env.FRONTEND_URL}/auth/signup?token=${token}`;

    const subject = "You're Invited to Join as a Partner";

    const emailHtml = generatePartnerInvitationEmail({
      franchiseName: franchise.name,
      roles: validRoles.map((r) => r.name).join(", "),
      onboardingUrl: onboardingUrl,
    });

    await sendEmail(email, subject, (content = emailHtml), (isHtml = true));

    return res.json({
      success: true,
      message: `Invitation sent to ${email}`,
      inviteLink: onboardingUrl, // optional for debugging
      roles: validRoles.map((r) => r.name), // return names instead of IDs
    });
  } catch (error) {
    console.error("Invite Partner Error:", error);
    res.status(500).json({ error: "Failed to send partner invitation" });
  }
};

// Change application status (approve/reject)
const changeApplicationStatus = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { applicationId } = req.params;
    const { status, reviewNotes, reason } = req.body;

    // Validate status
    if (!["approved", "rejected"].includes(status)) {
      await transaction.rollback();
      return res
        .status(400)
        .json({ error: "Invalid status. Must be approved or rejected" });
    }

    // Find application
    const application = await OnboardingApplications.findOne({
      where: { userId: applicationId },
      include: [
        { model: Users, as: "user" },
        { model: Roles, as: "requestedRole" },
      ],
      transaction,
    });

    if (!application) {
      await transaction.rollback();
      return res.status(404).json({ error: "Application not found" });
    }

    if (application.status !== "pending") {
      await transaction.rollback();
      return res.status(400).json({
        error: `Application already ${application.status}. Cannot change status.`,
      });
    }

    // Update application status
    await application.update(
      {
        status,
        reviewedBy: req.user.id,
        reviewedAt: new Date(),
        reviewNotes: reviewNotes || reason,
      },
      { transaction }
    );

    if (status === "approved") {
      // Activate user account
      await application.user.update(
        {
          isActive: true,
          emailVerified: true,
        },
        { transaction }
      );

      // Check if user already has this role
      const existingRole = await UserRoles.findOne({
        where: {
          userId: application.userId,
          roleId: application.requestedRoleId,
        },
        transaction,
      });

      if (!existingRole) {
        await UserRoles.create(
          {
            userId: application.userId,
            roleId: application.requestedRoleId,
            isActive: true,
            isPrimary: true,
            assignedBy: req.user.id,
            assignedAt: new Date(),
          },
          { transaction }
        );
      } else {
        await existingRole.update(
          {
            isActive: true,
            isPrimary: true,
          },
          { transaction }
        );
      }

      // Send approval email using sendEmail utility
      const approvalSubject =
        "🎉 Your Onboarding Application Has Been Approved!";
      const approvalContent = `
        <h2>Congratulations, ${application.user.firstName || "Partner"}!</h2>
        <p>Your onboarding application for the role <b>${application.requestedRole.name
        }</b> has been approved.</p>
        <p>You can now log in to your account and start using our platform.</p>
        <p>Welcome aboard!</p>
        <br/>
        <p>Best Regards,<br/>The Team</p>
      `;

      await sendEmail(
        application.user.email,
        approvalSubject,
        approvalContent,
        true
      );
    } else {
      // ❌ Send rejection email using sendEmail utility
      const rejectionSubject =
        "⚠️ Your Onboarding Application Has Been Rejected";
      const rejectionContent = `
        <h2>Hello ${application.user.firstName || "User"},</h2>
        <p>We regret to inform you that your onboarding application for the role <b>${application.requestedRole.name
        }</b> has been rejected.</p>
        ${reason
          ? `<p><b>Reason:</b> ${reason}</p>`
          : `<p>No specific reason was provided.</p>`
        }
        <p>If you believe this was a mistake, you can reapply or contact support.</p>
        <br/>
        <p>Best Regards,<br/>The Team</p>
      `;

      await sendEmail(
        application.user.email,
        rejectionSubject,
        rejectionContent,
        true
      );
    }

    await transaction.commit();

    res.json({
      message: `Application ${status} successfully`,
      application: {
        id: application.id,
        status: application.status,
        reviewedBy: application.reviewedBy,
        reviewedAt: application.reviewedAt,
        reviewNotes: application.reviewNotes,
      },
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Change application status error:", error);
    res.status(500).json({ error: "Failed to update application status" });
  }
};


const getSellerProfile = async (req, res) => {
  const { id } = req.params;
  const { user } = req;
  try {

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const details = await OnboardingApplications.findOne({
      where: { userId: id },
      attributes: [
        "id",
        "userId",
        "formData",
      ],
      include: [
        {
          model: Users,
          as: "user",
          attributes: [
            "id",
            "createdAt",
            "tier",
          ],
        },
      ],
    })
    if (!details) {
      // 🏢 If no onboarding details, this user is a Franchise Admin
      const result = {
        joiningSince: "Platform Launch", // or a hard-coded date if you have it
        profile: "Admin",
        location: "Global / HQ",
      };

      return res.status(200).json({
        success: true,
        note: "Franchise admin profile (default)",
        data: result,
      });
    }

    // 🧠 Extract values safely
    const step2 = details.formData?.step2;

    const result = {
      joiningSince: new Date(details.user.createdAt).toLocaleDateString("en-IN"),

      profile: details.formData?.step1?.category || null,

      location: step2
        ? `${step2.city}, ${step2.state}, ${step2.country}`
        : details.formData?.step1?.location || null,
    };

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Get seller detail error:", error);
    res.status(500).json({ error: "Failed to fetch seller detail" });
  }
}

module.exports = {
  changeApplicationStatus,
  getAllPartnerApplications,
  getAllPartners,
  getAllRoles,
  createRoles,
  getAllFranchisesForPartner,
  invitePartnerUsingEmail,
  deleteRole,
  getPartnerDetailsByUserId,
  getMyProfile,
  getSellerProfile
};

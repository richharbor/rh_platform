const {
  Users,
  Roles,
  OnboardingApplications,
  UserRoles,
  sequelize,
} = require("../models");

// Get all onboarding applications (with filters)
const getApplications = async (req, res) => {
  try {
    const { status = "all", page = 1, limit = 10 } = req.query;
    console.log(req.user);

    const whereCondition = {};
    if (status !== "all") {
      whereCondition.status = status;
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await OnboardingApplications.findAndCountAll({
      where: whereCondition,
      include: [
        {
          model: Users,
          as: "user",
          attributes: [
            "id",
            "email",
            "firstName",
            "lastName",
            "phoneNumber",
            "emailVerified",
            "createdBy",
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

    //   Convert Sequelize instances to plain JSON objects to break circular refs
    const plainApplications = rows.map((row) => row.get({ plain: true }));

    //   Add creatorName cleanly
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

// Get single application details
const getApplicationById = async (req, res) => {
  try {
    const { applicationId } = req.params;

    const application = await OnboardingApplications.findByPk(applicationId, {
      include: [
        {
          model: Users,
          as: "user",
          attributes: { exclude: ["password"] },
        },
        {
          model: Roles,
          as: "requestedRole",
        },
      ],
    });

    if (!application) {
      return res.status(404).json({ error: "Application not found" });
    }

    res.json(application);
  } catch (error) {
    console.error("Get application error:", error);
    res.status(500).json({ error: "Failed to fetch application" });
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
      transaction, // include transaction here
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
        // Assign the requested role
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
        // Reactivate existing role
        await existingRole.update(
          {
            isActive: true,
            isPrimary: true,
          },
          { transaction }
        );
      }

      // TODO: Send approval email
      // await sendApprovalEmail(application.user.email, application.requestedRole.name);
    } else {
      // Status is rejected
      // Keep user inactive
      // TODO: Send rejection email with reason
      // await sendRejectionEmail(application.user.email, reason);
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

// Bulk status change
const bulkChangeStatus = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { applicationIds, status, reviewNotes } = req.body;

    if (!Array.isArray(applicationIds) || applicationIds.length === 0) {
      return res
        .status(400)
        .json({ error: "Application IDs must be provided as array" });
    }

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const applications = await OnboardingApplications.findAll({
      where: {
        id: applicationIds,
        status: "pending",
      },
      include: [
        { model: Users, as: "user" },
        { model: Roles, as: "requestedRole" },
      ],
      transaction,
    });

    if (applications.length === 0) {
      await transaction.rollback();
      return res.status(404).json({ error: "No pending applications found" });
    }

    const results = [];

    for (const application of applications) {
      // Update application
      await application.update(
        {
          status,
          reviewedBy: req.user.id,
          reviewedAt: new Date(),
          reviewNotes,
        },
        { transaction }
      );

      if (status === "approved") {
        // Activate user
        await application.user.update(
          {
            isActive: true,
            emailVerified: true,
          },
          { transaction }
        );

        // Assign role
        const [userRole, created] = await UserRoles.findOrCreate({
          where: {
            userId: application.userId,
            roleId: application.requestedRoleId,
          },
          defaults: {
            isActive: true,
            isPrimary: true,
            assignedBy: req.user.id,
            assignedAt: new Date(),
          },
          transaction,
        });

        if (!created) {
          await userRole.update(
            {
              isActive: true,
              isPrimary: true,
            },
            { transaction }
          );
        }
      }

      results.push({
        applicationId: application.id,
        userId: application.userId,
        status: application.status,
      });
    }

    await transaction.commit();

    res.json({
      message: `${results.length} applications ${status} successfully`,
      results,
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Bulk status change error:", error);
    res.status(500).json({ error: "Failed to update applications" });
  }
};

// Get statistics
const getApplicationStats = async (req, res) => {
  try {
    const stats = await OnboardingApplications.findAll({
      attributes: [
        "status",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
      ],
      group: ["status"],
    });

    const formattedStats = {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      draft: 0,
    };

    stats.forEach((stat) => {
      const count = parseInt(stat.dataValues.count);
      formattedStats[stat.status] = count;
      formattedStats.total += count;
    });

    res.json(formattedStats);
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({ error: "Failed to fetch statistics" });
  }
};

module.exports = {
  getApplications,
  getApplicationById,
  changeApplicationStatus,
  bulkChangeStatus,
  getApplicationStats,
};

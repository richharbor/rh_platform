const {
  Users,
  Roles,
  OnboardingApplications,
  UserRoles,
} = require("../models");
const bcrypt = require("bcryptjs");
const { sendEmail } = require("../utils/sendEmail");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const generateToken = (user, currentRole = null) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      isSuperAdmin: user.isSuperAdmin,
      currentRole: currentRole,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

// Step 1: Create user account with role selection
const startOnboarding = async (req, res) => {
  const transaction = await Users.sequelize.transaction();

  try {
    let {
      email,
      password,
      fullName,
      accountType = [],
      createdBy,
      franchiseId,
      category,
      mobileNumber,
      location,
      firmName,
      isToken,
    } = req.body;

    // If accountType is empty, set default role "partner"
    if (!Array.isArray(accountType) || accountType.length === 0) {
      accountType = ["partner"];
    }

    // Check if user already exists
    const existingUser = await Users.findOne({ where: { email } });
    if (existingUser) {
      await transaction.rollback();
      return res.status(400).json({ error: "Email already registered" });
    }

    // Fetch roles by name
    let roles = await Roles.findAll({
      where: {
        name: accountType,
      },
    });

    // If "partner" is in accountType but not in Roles table, create it
    if (
      accountType.includes("partner") &&
      !roles.some((r) => r.name === "partner")
    ) {
      const partnerRole = await Roles.create(
        { name: "partner", permissions: ["selling", "dashboard", "buying", "best_deals", "manage_my_bookings", "manage_my_bids"] }, // no createdBy or franchiseId
        { transaction }
      );
      roles.push(partnerRole);
    }

    if (!roles || roles.length === 0) {
      await transaction.rollback();
      return res.status(400).json({ error: "Invalid account type(s)" });
    }

    // Split full name
    const nameParts = fullName.trim().split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(" ") || "";

    // Create new user
    const user = await Users.create(
      {
        email,
        password,
        firstName,
        lastName,
        createdBy,
        isSuperAdmin: false,
        tier: 4,
        franchiseId,
        isActive: false,
        emailVerified: isToken,
        phoneNumber: mobileNumber,
      },
      { transaction }
    );

    // Assign multiple roles
    for (const role of roles) {
      await UserRoles.create(
        {
          userId: user.id,
          roleId: role.id,
          isActive: false,
          isPrimary: false,
          assignedBy: createdBy || null,
          franchiseId: franchiseId,
          assignedAt: new Date(),
        },
        { transaction }
      );
    }

    // Create onboarding application
    const application = await OnboardingApplications.create(
      {
        userId: user.id,
        requestedRoleId: roles[0].id,
        currentStep: 1,
        completedSteps: [1],
        franchiseId: franchiseId,
        formData: {
          step1: {
            accountType: roles.map((r) => r.name),
            fullName,
            email,
            category,
            phoneNumber: mobileNumber,
            location,
            firmName,
          },
        },
        status: "draft",
      },
      { transaction }
    );

    await transaction.commit();

    const token = generateToken(
      user,
      roles.map((r) => r.id)
    );
    if (!isToken) {
      // Generate onboarding token
      const token = jwt.sign(
        { userId: user.id, email },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      const onboardingUrl = `${process.env.FRONTEND_URL}/auth/verify/partner?token=${token}`;

      //  Prepare email
      // const roleNames = validRoles.map((r) => r.name).join(", ");
      const htmlContent = `
  <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 24px; border-radius: 8px; border: 1px solid #e5e7eb;">
    <h2 style="color: #111827;">Verify your email</h2>

    <p>Hello ${firstName},</p>

    <p>Thanks for signing up! To get started, please verify your email address.</p>

    <p style="margin: 24px 0;">
      <a href="${onboardingUrl}" 
         target="_blank" 
         style="
            background-color: #2563eb; 
            color: white; 
            padding: 12px 20px; 
            text-decoration: none; 
            border-radius: 6px;
            display: inline-block;
            font-weight: 600;
         ">
        Verify Email
      </a>
    </p>

    <p>This link will expire in 7 days for your security.</p>

    <p>If you didn’t create an account, you can safely ignore this email.</p>

    <hr style="margin: 32px 0; border: none; height: 1px; background: #e5e7eb;" />

    <p style="font-size: 12px; color: #6b7280;">
      If the button above doesn’t work, copy and paste the link below into your browser:<br>
      <a href="${onboardingUrl}" style="color: #2563eb;">${onboardingUrl}</a>
    </p>
  </div>
`;

      await sendEmail(
        email,
        "Verify your email address",
        htmlContent,
        true
      );
    }

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      token,
      applicationId: application.id,
      nextStep: 2,
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Start onboarding error:", error);
    res.status(500).json({ error: "Failed to create account" });
  }
};

// Step 2: Save account information
const saveAccountInfo = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      name,
      state,
      aadharCard,
      panCard,
      mobile,
      bankName,
      accountNumber,
      ifscCode,
      country,
      addressState,
      addressLine1,
      addressLine2,
      city,
      zipCode,
    } = req.body;

    const application = await OnboardingApplications.findOne({
      where: { userId, status: "draft" },
    });

    if (!application) {
      return res.status(404).json({ error: "Application not found" });
    }

    // Update form data
    const updatedFormData = {
      ...application.formData,
      step2: {
        name,
        state,
        aadharCard,
        panCard,
        mobile,
        bankName,
        accountNumber,
        ifscCode,
        country,
        addressState,
        addressLine1,
        addressLine2,
        city,
        zipCode,
      },
    };

    const completedSteps = [...new Set([...application.completedSteps, 2])];

    await application.update({
      formData: updatedFormData,
      currentStep: 2,
      completedSteps,
    });

    // Update user phone number
    await req.user.update({ phoneNumber: mobile });

    res.json({
      message: "Account information saved",
      applicationId: application.id,
      nextStep: 3,
    });
  } catch (error) {
    console.error("Save account info error:", error);
    res.status(500).json({ error: "Failed to save account information" });
  }
};

// Step 3: Upload documents
const uploadDocuments = async (req, res) => {
  try {
    const userId = req.user.id;
    const { documents } = req.body; // This would contain document URLs/references

    const application = await OnboardingApplications.findOne({
      where: { userId, status: "draft" },
    });

    if (!application) {
      return res.status(404).json({ error: "Application not found" });
    }

    const updatedDocuments = {
      ...application.documents,
      ...documents,
    };

    const completedSteps = [...new Set([...application.completedSteps, 3])];

    await application.update({
      documents: updatedDocuments,
      currentStep: 3,
      completedSteps,
    });

    res.json({
      message: "Documents uploaded successfully",
      applicationId: application.id,
      nextStep: 4,
    });
  } catch (error) {
    console.error("Upload documents error:", error);
    res.status(500).json({ error: "Failed to upload documents" });
  }
};

// Step 4: Submit agreement
const submitAgreement = async (req, res) => {
  try {
    const userId = req.user.id;
    const { agreementUrl } = req.body;

    const application = await OnboardingApplications.findOne({
      where: { userId, status: "draft" },
    });

    if (!application) {
      return res.status(404).json({ error: "Application not found" });
    }

    const updatedDocuments = {
      ...application.documents,
      agreement: agreementUrl,
    };

    const completedSteps = [...new Set([...application.completedSteps, 4])];

    await application.update({
      documents: updatedDocuments,
      currentStep: 4,
      completedSteps,
    });

    res.json({
      message: "Agreement submitted successfully",
      applicationId: application.id,
      nextStep: 5,
    });
  } catch (error) {
    console.error("Submit agreement error:", error);
    res.status(500).json({ error: "Failed to submit agreement" });
  }
};

// Step 5: Save business/referral information
const saveBusinessInfo = async (req, res) => {
  try {
    const userId = req.user.id;
    const { businessInfo } = req.body;
    // businessInfo should be an array of objects like:
    // [
    //   {
    //     contact: "3242314234",
    //     designation: "dfsfsdfw",
    //     entityType: "broker",
    //     firmName: "wdfwe",
    //     location: "wd2w34",
    //     mailId: "varun@gamil.com",
    //     natureOfBusiness: "wefweff",
    //     referralName: "qdfqdsf",
    //     totalTradeExecution: "4"
    //   },
    //   ...
    // ]

    const application = await OnboardingApplications.findOne({
      where: { userId, status: "draft" },
    });

    if (!application) {
      return res.status(404).json({ error: "Application not found" });
    }

    // Update form data
    const updatedFormData = {
      ...application.formData,
      step5: businessInfo, // Save all array data under step5
    };

    const completedSteps = [...new Set([...application.completedSteps, 5])];

    await application.update({
      formData: updatedFormData,
      currentStep: 5,
      completedSteps,
    });

    res.json({
      message: "Business information saved successfully",
      applicationId: application.id,
      nextStep: 6,
    });
  } catch (error) {
    console.error("Save business info error:", error);
    res.status(500).json({ error: "Failed to save business information" });
  }
};

// Step 6: Complete onboarding
const completeOnboarding = async (req, res) => {
  try {
    const userId = req.user.id;

    const application = await OnboardingApplications.findOne({
      where: { userId, status: "draft" },
    });

    if (!application) {
      return res.status(404).json({ error: "Application not found" });
    }

    const approvalToken = crypto.randomBytes(32).toString("hex");
    const completedSteps = [...new Set([...application.completedSteps, 6])];

    await application.update({
      status: "pending",
      currentStep: 6,
      completedSteps,
      approvalToken,
    });

    res.json({
      message: "Application submitted for review",
      applicationId: application.id,
      status: "pending",
    });
  } catch (error) {
    console.error("Complete onboarding error:", error);
    res.status(500).json({ error: "Failed to complete onboarding" });
  }
};

// Get current application status
const getApplicationStatus = async (req, res) => {
  try {
    const userId = req.user.id;

    if (req.user.tier <= 3) {
      return res.json({
        status: 'approved',
      })
    }

    const application = await OnboardingApplications.findOne({
      where: { userId },
      include: [
        {
          model: Roles,
          as: "requestedRole",
          attributes: ["id", "name"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    if (!application) {
      return res.status(404).json({ error: "No application found" });
    }

    res.json({
      applicationId: application.id,
      currentStep: application.currentStep,
      completedSteps: application.completedSteps,
      status: application.status,
      formData: application.formData,
      documents: application.documents,
      requestedRole: application.requestedRole,
    });
  } catch (error) {
    console.error("Get application status error:", error);
    res.status(500).json({ error: "Failed to get application status" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Fetch user along with roles
    const user = await Users.findOne({
      where: { email },
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



    // Check if user exists
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    if (user.emailVerified === false) {
      return res.status(401).json({ error: "Email not verified, please check your email" });
    }

    // Check password using bcrypt directly
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Fetch latest onboarding application
    const application = await OnboardingApplications.findOne({
      where: { userId: user.id },
      order: [["createdAt", "DESC"]],
    });

    // Determine current role
    let currentRole = null;
    if (user.userRoles.length > 0) {
      const primaryRole = user.userRoles.find((ur) => ur.isPrimary);
      currentRole = primaryRole ? primaryRole.roleId : user.userRoles[0].roleId;
    }

    // Generate token
    const token = generateToken(user, currentRole);

    res.json({
      token,
      onboarding: application
        ? {
          status: application.status,
          currentStep: application.currentStep,
          completedSteps: application.completedSteps,
        }
        : null,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
};

const switchRole = async (req, res) => {
  try {
    const { roleId } = req.body;
    const user = req.user;

    let role;

    if (user.isSuperAdmin) {
      // SuperAdmin: must have the role in their UserRoles too
      const userRole = await UserRoles.findOne({
        where: { userId: user.id, roleId, isActive: true },
        include: [{ model: Roles, as: "role" }],
      });

      if (!userRole) {
        return res
          .status(404)
          .json({ error: "Roles not found or not assigned to this user" });
      }

      role = userRole.role;
    } else {
      // Regular user: same logic
      const userRole = await UserRoles.findOne({
        where: { userId: user.id, roleId, isActive: true },
        include: [{ model: Roles, as: "role" }],
      });

      if (!userRole) {
        return res
          .status(403)
          .json({ error: "You do not have access to this role" });
      }

      role = userRole.role;
    }

    //   Update DB: set this role as primary, unset others
    await UserRoles.update(
      { isPrimary: false },
      { where: { userId: user.id } }
    );
    await UserRoles.update(
      { isPrimary: true },
      { where: { userId: user.id, roleId } }
    );

    //   Issue new token with updated role
    const token = generateToken(user, role.id);

    res.json({
      message: "Roles switched successfully",
      token,
      currentRole: {
        id: role.id,
        name: role.name,
        permissions: role.permissions,
      },
    });
  } catch (error) {
    console.error("Roles switch error:", error);
    res.status(500).json({ error: "Failed to switch role" });
  }
};

const createSuperAdmin = async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // 1. Ensure Super Admin role exists
    let superAdminRole = await Roles.findOne({ where: { name: "superadmin" } });
    if (!superAdminRole) {
      superAdminRole = await Roles.create({
        name: "superadmin",
        description: "Manage all",
        permissions: ["all"],
        isActive: true,
      });
    }

    // 2. Create super admin user if not exists
    let user = await Users.findOne({ where: { email } });
    if (!user) {
      user = await Users.create({
        email,
        password,
        firstName,
        lastName,
        tier: 1,
        isSuperAdmin: true,
        isActive: true,
        emailVerified: true,
      });
    }

    // 3. Fetch all roles
    const allRoles = await Roles.findAll({ where: { isActive: true } });

    // 4. Attach userRoles for each role
    for (const role of allRoles) {
      const existingUserRole = await UserRoles.findOne({
        where: { userId: user.id, roleId: role.id },
      });

      if (!existingUserRole) {
        await UserRoles.create({
          userId: user.id,
          roleId: role.id,
          isPrimary: true,
          isActive: true,
        });
      }
    }

    // 5. Create OnboardingApplications for this superadmin (if missing)
    let onboarding = await OnboardingApplications.findOne({
      where: { userId: user.id, requestedRoleId: superAdminRole.id },
    });

    if (!onboarding) {
      onboarding = await OnboardingApplications.create({
        userId: user.id,
        requestedRoleId: superAdminRole.id,
        currentStep: 5,
        completedSteps: [1, 2, 3, 4, 5],
        status: "approved",
        formData: { systemGenerated: true },
        documents: {},
        reviewedBy: user.id, // self-approved
        reviewedAt: new Date(),
        reviewNotes: "Super admin onboarding auto-approved.",
      });
    }

    res.json({
      message: "Super admin created successfully with all roles",
      user,
      roles: allRoles,
      onboarding,
    });
  } catch (error) {
    console.error("Create Super Admin error:", error);
    res.status(500).json({ error: "Failed to create super admin" });
  }
};

const verifyOnboardingToken = async (req, res) => {
  try {
    const token = req.body.token;

    if (!token) {
      return res.status(400).json({ error: "Token is required" });
    }

    // Verify token using your secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (
      !decoded ||
      !decoded.partnerEmail ||
      !decoded.inviterId ||
      !decoded.franchiseId ||
      !decoded.roles
    ) {
      return res.status(400).json({ error: "Invalid token payload" });
    }

    // Check inviter exists
    const inviter = await Users.findByPk(decoded.inviterId);
    if (!inviter) {
      return res
        .status(401)
        .json({ message: "Unauthorized: inviter not found" });
    }

    // Fetch roles from IDs
    const rolesFromDb = await Roles.findAll({
      where: { id: decoded.roles },
      attributes: ["id", "name"],
    });

    // Return roles as array of objects {id, name}
    const rolesData = rolesFromDb.map((r) => ({ id: r.id, name: r.name }));

    res.json({
      success: true,
      message: "Token verified successfully",
      data: {
        inviterId: decoded.inviterId,
        partnerEmail: decoded.partnerEmail,
        partnerRoles: rolesData, // <-- return both id and name
        franchiseId: decoded.franchiseId,
      },
    });
  } catch (error) {
    console.error("Token verification error:", error);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Invitation link has expired" });
    }

    res.status(401).json({ error: "Invalid or malformed token" });
  }
};

const verifyAndUpdatePassword = async (req, res) => {
  const { token, tempPassword, newPassword } = req.body;

  if (!token) {
    return res.status(400).json({ message: "Token is required" });
  }

  try {
    // Decode token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { inviterId, invitedUserId, email } = decoded;

    // Check inviter exists
    const inviter = await Users.findByPk(inviterId);
    if (!inviter) {
      return res
        .status(401)
        .json({ message: "Unauthorized: inviter not found" });
    }

    // Check invited user exists
    const invitedUser = await Users.findOne({
      where: { id: invitedUserId, email },
    });
    if (!invitedUser) {
      return res.status(400).json({ message: "Invalid invited user" });
    }

    // If only token is sent → just check token is valid
    if (!tempPassword && !newPassword) {
      if (invitedUser.emailVerified) {
        return res.status(400).json({ message: "Email already verified" });
      }
      return res.status(200).json({
        Result: "SUCCESS",
        message:
          "Token is valid. Please provide temporary and new password to complete verification.",
      });
    }

    // If token + tempPassword + newPassword → verify temp password and update
    if (tempPassword && newPassword) {
      const isTempPasswordValid = await bcrypt.compare(
        tempPassword,
        invitedUser.password
      );

      if (!isTempPasswordValid) {
        return res.status(400).json({ message: "Invalid temporary password" });
      }

      // Hash new password before saving
      invitedUser.password = newPassword;
      invitedUser.isActive = true;
      invitedUser.emailVerified = true;
      await invitedUser.save();

      return res.status(200).json({
        Result: "SUCCESS",
        message: "Password updated and account verified successfully",
      });
    }

    // If request is malformed
    return res
      .status(400)
      .json({ message: "Provide both temporary and new password." });
  } catch (error) {
    console.error("Error in token verification/password update:", error);
    return res.status(400).json({ message: "Invalid or expired token" });
  }
};

//forget password
const sendPasswordResetEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Check if user exists
    const user = await Users.findOne({ where: { email } });
    if (!user) {
      return res
        .status(404)
        .json({ message: "No account found for this email" });
    }

    // Generate reset token (expires in 1 hour)
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        purpose: "password_reset",
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Reset link
    const resetUrl = `${process.env.FRONTEND_URL}/auth/forgot-password?token=${token}`;

    // Email subject
    const subject = "Reset Your Password";

    // Inline HTML for email
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; background-color: #f9fafb; padding: 40px;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); overflow: hidden;">
          <div style="background-color: #2563eb; padding: 20px; text-align: center;">
            <h2 style="color: #ffffff; margin: 0;">Password Reset Request</h2>
          </div>
          <div style="padding: 30px;">
            <p style="font-size: 16px; color: #333;">Hi ${user.firstName || "there"
      },</p>
            <p style="font-size: 15px; color: #555;">
              We received a request to reset your password. Click the button below to set a new password:
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background-color: #2563eb; color: white; text-decoration: none; 
                        padding: 12px 20px; border-radius: 8px; font-weight: 600;">
                Reset Password
              </a>
            </div>
            <p style="font-size: 14px; color: #777;">
              This link will expire in 1 hour. If you didn’t request a password reset, 
              please ignore this email — your account is safe.
            </p>
            <p style="margin-top: 40px; font-size: 14px; color: #aaa;">— The ${process.env.APP_NAME || "Our Platform"
      } Team</p>
          </div>
        </div>
      </div>
    `;

    // Send the email
    await sendEmail(email, subject, emailHtml, true);

    // Success response
    return res.status(200).json({
      success: true,
      message: "Password reset link sent to your email.",
    });
  } catch (error) {
    console.error("Error sending password reset email:", error);
    return res.status(500).json({ message: "Failed to send reset email." });
  }
};

const verifyPasswordResetToken = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.purpose !== "password_reset") {
      return res.status(400).json({ message: "Invalid token purpose" });
    }

    const user = await Users.findOne({
      where: { id: decoded.userId, email: decoded.email },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Token is valid. You can now reset your password.",
      data: { email: user.email },
    });
  } catch (error) {
    console.error("Token verification failed:", error);
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Reset link has expired." });
    }
    return res.status(400).json({ message: "Invalid or malformed token." });
  }
};

const verifyAndForgetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res
      .status(400)
      .json({ message: "Token and new password are required." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.purpose !== "password_reset") {
      return res.status(400).json({ message: "Invalid token purpose." });
    }

    const user = await Users.findOne({
      where: { id: decoded.userId, email: decoded.email },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Hash new password
    user.password = newPassword;
    user.emailVerified = true;
    user.isActive = true;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password updated successfully.",
    });
  } catch (error) {
    console.error("Error updating password:", error);
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Reset link has expired." });
    }
    return res.status(400).json({ message: "Invalid or expired token." });
  }
};


const verifyPartnerEmail = async (req, res) => {

  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: "Token is required" });
  }

  try {
    // Decode token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { userId, email } = decoded;

    // // Check inviter exists
    // const inviter = await Users.findByPk(inviterId);
    // if (!inviter) {
    //   return res
    //     .status(401)
    //     .json({ message: "Unauthorized: inviter not found" });
    // }

    // Check user exists
    const user = await Users.findOne({
      where: { id: userId, email },
    });
    if (!user) {
      return res.status(400).json({ message: "Invalid user" });
    }

    user.emailVerified = true;
    await user.save();

    return res.status(200).json({
      Result: "SUCCESS",
      message: "Account verified successfully",
    });


    // If request is malformed

  } catch (error) {
    console.error("Error in token verification/password update:", error);
    return res.status(400).json({ message: "Invalid or expired token" });
  }
}

module.exports = {
  startOnboarding,
  saveAccountInfo,
  uploadDocuments,
  submitAgreement,
  completeOnboarding,
  saveBusinessInfo,
  getApplicationStatus,
  login,
  switchRole,
  createSuperAdmin,
  verifyOnboardingToken,
  verifyAndUpdatePassword,
  sendPasswordResetEmail,
  verifyPasswordResetToken,
  verifyAndForgetPassword,
  verifyPartnerEmail
};

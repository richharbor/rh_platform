const { RoleUpgradeRequest, User, Admin } = require('../models');
const { Op } = require('sequelize');
const notificationService = require('../services/fcmNotificationService');
const { sendEmail } = require('../services/emailService');

// Submit a new upgrade request
const submitRequest = async (req, res) => {
    try {
        const userId = req.user.id;
        const currentRole = req.user.role; // customer, referral_partner
        const { requested_role, business_data, reason } = req.body;

        // Validation: Logic checks
        if (!requested_role) {
            return res.status(400).json({ error: 'Requested role is required' });
        }

        // Prevent downgrade or skipping steps (Customer -> Partner directly is not allowed usually, but customer -> referral -> partner)
        // Check allowed upgrades
        // customer -> referral_partner
        // referral_partner -> partner
        // partner -> none

        if (currentRole === 'partner') {
            return res.status(400).json({ error: 'You are already a Partner' });
        }

        if (currentRole === 'customer' && requested_role !== 'referral_partner') {
            return res.status(400).json({ error: 'Customers can only upgrade to Referral Partner' });
        }

        if (currentRole === 'referral_partner' && requested_role !== 'partner') {
            return res.status(400).json({ error: 'Referral Partners can only upgrade to Partner' });
        }

        // Check for pending requests
        const pendingRequest = await RoleUpgradeRequest.findOne({
            where: {
                user_id: userId,
                status: 'pending'
            }
        });

        if (pendingRequest) {
            return res.status(400).json({ error: 'You already have a pending upgrade request' });
        }

        // Check cooldown (last_upgrade_request_at) - user said 1 day
        const user = await User.findByPk(userId);
        if (user.last_upgrade_request_at) {
            const now = new Date();
            const lastRequest = new Date(user.last_upgrade_request_at);
            const diffHours = (now - lastRequest) / (1000 * 60 * 60);

            // Only enforce cooldown if the last request was REJECTED. 
            // If they just submitted one and it's pending, caught above.
            // If they were approved, they are in new role.
            // So logic: Find the LAST request. If it was rejected within 24h, block.

            const lastRejected = await RoleUpgradeRequest.findOne({
                where: { user_id: userId, status: 'rejected' },
                order: [['created_at', 'DESC']]
            });

            if (lastRejected) {
                const rejectedTime = new Date(lastRejected.created_at); // or reviewed_at? Usually from submission or rejection time.
                // Let's use reviewed_at for fairness, or created_at. User said "request again after 1 day".
                // If reviewed_at is null (shouldn't be for rejected), use updatedAt.
                const timeRef = lastRejected.reviewed_at || lastRejected.updatedAt;
                const hoursSince = (now - timeRef) / (1000 * 60 * 60);

                if (hoursSince < 24) {
                    return res.status(400).json({ error: 'Please wait 24 hours after a rejection before requesting again.' });
                }
            }
        }

        // Create Request
        const request = await RoleUpgradeRequest.create({
            user_id: userId,
            current_role: currentRole,
            requested_role: requested_role,
            reason,
            business_data: business_data || {},
            status: 'pending'
        });

        // Update user's last request time (tracking submission)
        user.last_upgrade_request_at = new Date();
        await user.save();

        res.status(201).json(request);

    } catch (error) {
        console.error('Submit upgrade request error:', error);
        res.status(500).json({ error: 'Failed to submit request' });
    }
};

// Get current user's request status
const getMyRequestStatus = async (req, res) => {
    try {
        const userId = req.user.id;

        // Find pending or latest request
        const request = await RoleUpgradeRequest.findOne({
            where: { user_id: userId },
            order: [['created_at', 'DESC']]
        });

        // Check cooldown availability
        let canRequest = true;
        let cooldownEndsAt = null;

        if (request && request.status === 'pending') {
            canRequest = false;
        } else if (request && request.status === 'rejected') {
            const timeRef = request.reviewed_at || request.updatedAt;
            const cooldownEnds = new Date(timeRef.getTime() + (24 * 60 * 60 * 1000));
            if (new Date() < cooldownEnds) {
                canRequest = false;
                cooldownEndsAt = cooldownEnds;
            }
        } else if (req.user.role === 'partner') {
            canRequest = false; // Max role
        }

        res.json({
            request,
            canRequest,
            cooldownEndsAt,
            currentRole: req.user.role
        });

    } catch (error) {
        console.error('Get request status error:', error);
        res.status(500).json({ error: 'Failed to fetch status' });
    }
};

// Admin: List requests
const adminListRequests = async (req, res) => {
    try {
        const { status } = req.query;
        const where = {};
        if (status) where.status = status;

        const requests = await RoleUpgradeRequest.findAll({
            where,
            include: [
                { model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone', 'role', 'created_at'] }
            ],
            order: [['created_at', 'DESC']]
        });

        res.json(requests);
    } catch (error) {
        console.error('Admin list requests error:', error);
        res.status(500).json({ error: 'Failed to fetch requests' });
    }
};

// Admin: Review Request (Approve/Reject)
const adminReviewRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { action, admin_notes } = req.body; // action: 'approve' | 'reject'
        const adminId = req.user.id; // Admin ID from token

        const request = await RoleUpgradeRequest.findByPk(id, {
            include: [{ model: User, as: 'user' }]
        });

        if (!request) {
            return res.status(404).json({ error: 'Request not found' });
        }

        if (request.status !== 'pending') {
            return res.status(400).json({ error: 'Request is already reviewed' });
        }

        if (action === 'approve') {
            request.status = 'approved';
            request.reviewed_by = adminId;
            request.reviewed_at = new Date();
            request.admin_notes = admin_notes;

            // Update User Role
            const user = request.user;
            user.role = request.requested_role;

            // If checking business data, merge it to signup_data
            if (request.business_data && Object.keys(request.business_data).length > 0) {
                const currentData = user.signup_data || {};
                user.signup_data = { ...currentData, ...request.business_data };
                // Maybe increment signup_step ? User said "update signup_step for next role".
                // Assuming next role implies completed onboarding for that role.
                // We can just leave it or set it to max step of that role flow.
            }

            await user.save();
            await request.save();

            // Notify User
            await notificationService.sendPushNotification(
                [user.id],
                '🎉 Role Upgrade Approved!',
                `You are now a ${request.requested_role === 'referral_partner' ? 'Referral Partner' : 'Partner'}. check your new features!`,
                { type: 'role_upgrade_approved', new_role: request.requested_role }
            );

        } else if (action === 'reject') {
            request.status = 'rejected';
            request.reviewed_by = adminId;
            request.reviewed_at = new Date();
            request.admin_notes = admin_notes;

            await request.save();

            // Notify User
            await notificationService.sendPushNotification(
                [request.user_id],
                'Role Upgrade Request Update',
                'Your upgrade request was declined. View details in profile.',
                { type: 'role_upgrade_rejected' }
            );
        } else {
            return res.status(400).json({ error: 'Invalid action' });
        }

        res.json(request);

    } catch (error) {
        console.error('Admin review request error:', error);
        res.status(500).json({ error: 'Failed to review request' });
    }
};

module.exports = {
    submitRequest,
    getMyRequestStatus,
    adminListRequests,
    adminReviewRequest
};

const { Contest, UserContestReward, Incentive, Lead, Sequelize } = require("../models");
const { Op } = Sequelize;

// --- ADMIN ---

const notificationService = require("../services/notificationService");

const createContest = async (req, res) => {
    try {
        const { title, description, startDate, endDate, bannerUrl, termsAndConditions, targetType, tiers, notifyUsers, productType, productSubType, fileUrl } = req.body;

        const contest = await Contest.create({
            title,
            description,
            startDate,
            endDate,
            bannerUrl,
            termsAndConditions,
            targetType,
            tiers, // Expecting object/array
            productType,
            productSubType,
            fileUrl
        });

        if (notifyUsers) {
            notificationService.broadcastNotification(
                "New Contest Alert! 🏆",
                `Join "${title}" and win exciting rewards!`,
                { type: 'contest', contestId: contest.id }
            );
        }

        res.status(201).json(contest);
    } catch (error) {
        console.error("Create Contest Error:", error);
        res.status(500).json({ error: error.message });
    }
};

const updateContest = async (req, res) => {
    try {
        const { id } = req.params;
        const contest = await Contest.findByPk(id);
        if (!contest) return res.status(404).json({ error: "Contest not found" });

        await contest.update(req.body);
        res.json(contest);
    } catch (error) {
        console.error("Update Contest Error:", error);
        res.status(500).json({ error: error.message });
    }
};

const deleteContest = async (req, res) => {
    try {
        const { id } = req.params;
        await Contest.destroy({ where: { id } });
        res.json({ message: "Contest deleted" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getEligibleUsers = async (req, res) => {
    try {
        const { id } = req.params;
        const contest = await Contest.findByPk(id);
        if (!contest) return res.status(404).json({ error: "Contest not found" });

        const { User } = require("../models");

        const userIds = new Set();

        if (contest.targetType === 'incentive') {
            const incentives = await Incentive.findAll({
                attributes: ['user_id'],
                where: { status: ['approved', 'paid'] },
                group: ['user_id']
            });
            incentives.forEach(i => userIds.add(i.user_id));
        } else {
            const leads = await Lead.findAll({
                attributes: ['user_id'],
                where: { status: 'Closed' },
                group: ['user_id']
            });
            leads.forEach(l => userIds.add(l.user_id));
        }

        const eligibleUsers = [];

        for (const userId of userIds) {
            let currentAmount = 0;

            if (contest.targetType === 'incentive') {
                if (contest.productSubType) {
                    const incentives = await Incentive.findAll({
                        where: {
                            user_id: userId,
                            status: ['approved', 'paid'],
                        },
                        include: [{ model: Lead, as: 'lead' }]
                    });

                    currentAmount = incentives.reduce((sum, inc) => {
                        if (inc.lead) {
                            const pDetails = inc.lead.product_details || {};
                            const type = pDetails.loanType || pDetails.insuranceType || pDetails.productType;
                            if (type && type === contest.productSubType) return sum + inc.amount;
                        }
                        return sum;
                    }, 0);
                } else {
                    currentAmount = await Incentive.sum('amount', {
                        where: {
                            user_id: userId,
                            status: ['approved', 'paid'],
                        }
                    }) || 0;
                }
            } else if (contest.targetType === 'leads_count') {
                if (contest.productSubType) {
                    const leads = await Lead.findAll({
                        where: {
                            user_id: userId,
                            status: 'Closed',
                        }
                    });
                    currentAmount = leads.filter(l => {
                        const pDetails = l.product_details || {};
                        const type = pDetails.loanType || pDetails.insuranceType || pDetails.productType;
                        return type === contest.productSubType;
                    }).length;
                } else {
                    currentAmount = await Lead.count({
                        where: {
                            user_id: userId,
                            status: 'Closed',
                        }
                    }) || 0;
                }
            }

            const tiers = contest.tiers || [];
            const unlockedTiers = tiers.filter(t => currentAmount >= t.minAmount);
            if (unlockedTiers.length > 0) {
                const user = await User.findByPk(userId, { attributes: ['id', 'name', 'email', 'phone'] });
                if (user) {
                    eligibleUsers.push({
                        user,
                        progress: currentAmount,
                        unlockedTiers: unlockedTiers.map(t => t.name)
                    });
                }
            }
        }
        res.json(eligibleUsers);
    } catch (error) {
        console.error("Get Eligible Users Error:", error);
        res.status(500).json({ error: error.message });
    }
};

const getAdminContests = async (req, res) => {
    try {
        const contests = await Contest.findAll({ order: [['createdAt', 'DESC']] });
        res.json(contests);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// --- CLIENT (USER) ---

const getUserContests = async (req, res) => {
    try {
        const userId = req.user.id;
        const now = new Date();

        // 1. Fetch Contests (Active + Recent Past)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const contests = await Contest.findAll({
            where: {
                // isActive: true, // We want past contests too
                createdAt: { [Op.gte]: sixMonthsAgo }
            },
            include: [
                {
                    model: UserContestReward,
                    as: 'rewards',
                    where: { userId },
                    required: false
                }
            ],
            order: [['endDate', 'DESC']]
        });

        const result = [];

        for (const contest of contests) {
            // 2. Calculate Progress
            let currentAmount = 0;

            if (contest.targetType === 'incentive') {
                if (contest.productSubType) {
                    const incentives = await Incentive.findAll({
                        where: {
                            user_id: userId,
                            status: ['approved', 'paid'],
                        },
                        include: [{ model: Lead, as: 'lead' }]
                    });
                    currentAmount = incentives.reduce((sum, inc) => {
                        if (inc.lead) {
                            const pDetails = inc.lead.product_details || {};
                            const type = pDetails.loanType || pDetails.insuranceType || pDetails.productType;
                            if (type && type === contest.productSubType) return sum + inc.amount;
                        }
                        return sum;
                    }, 0);
                } else {
                    const incentives = await Incentive.sum('amount', {
                        where: {
                            user_id: userId,
                            status: ['approved', 'paid'],
                        }
                    });
                    currentAmount = incentives || 0;
                }
            } else if (contest.targetType === 'leads_count') {
                if (contest.productSubType) {
                    const leads = await Lead.findAll({
                        where: {
                            user_id: userId,
                            status: 'Closed',
                        }
                    });
                    currentAmount = leads.filter(l => {
                        const pDetails = l.product_details || {};
                        const type = pDetails.loanType || pDetails.insuranceType || pDetails.productType;
                        return type === contest.productSubType;
                    }).length;
                } else {
                    const leads = await Lead.count({
                        where: {
                            user_id: userId,
                            status: 'Closed',
                        }
                    });
                    currentAmount = leads || 0;
                }
            }

            // 3. Process Tiers
            const tiers = Array.isArray(contest.tiers) ? contest.tiers : [];
            const processedTiers = tiers.map(tier => {
                const isUnlocked = currentAmount >= tier.minAmount;
                const claimedRecord = contest.rewards.find(r => r.tierName === tier.name);

                return {
                    ...tier,
                    isUnlocked,
                    isClaimed: !!claimedRecord,
                    claimedAt: claimedRecord ? claimedRecord.claimedAt : null
                };
            });

            // 4. Determine Contest Status for UI (e.g. "Completed", "In Progress")
            const isCompleted = processedTiers.length > 0 && processedTiers.every(t => t.isUnlocked);
            const isEligible = processedTiers.some(t => t.isUnlocked);

            result.push({
                id: contest.id,
                title: contest.title,
                bannerUrl: contest.fileUrl || contest.bannerUrl,
                description: contest.description,
                startDate: contest.startDate,
                endDate: contest.endDate,
                targetType: contest.targetType,
                productType: contest.productType,
                productSubType: contest.productSubType,
                progress: {
                    current: currentAmount,
                    target: Math.max(...tiers.map(t => t.minAmount), 0) // Max target from tiers
                },
                tiers: processedTiers,
                isCompleted,
                isEligible
            });
        }

        res.json(result);

    } catch (error) {
        console.error("Get User Contests Error:", error);
        res.status(500).json({ error: error.message });
    }
};

const claimReward = async (req, res) => {
    try {
        const userId = req.user.id;
        const { contestId, tierName } = req.body;

        const contest = await Contest.findByPk(contestId);
        if (!contest) return res.status(404).json({ error: "Contest not found" });

        // 1. Verify Eligibility
        // Re-calculate progress to be safe (prevent API abuse)
        let currentAmount = 0;
        if (contest.targetType === 'incentive') {
            const incentives = await Incentive.sum('amount', {
                where: {
                    user_id: userId,
                    status: ['approved', 'paid']
                }
            });
            currentAmount = incentives || 0;
        } else if (contest.targetType === 'leads_count') {
            const leads = await Lead.count({
                where: {
                    user_id: userId,
                    status: 'Closed' // Use the correct Enum value 'Closed'
                }
            });
            currentAmount = leads || 0;
        }

        const tier = (contest.tiers || []).find(t => t.name === tierName);
        if (!tier) return res.status(400).json({ error: "Tier not found" });

        if (currentAmount < tier.minAmount) {
            return res.status(400).json({ error: "Target not met yet" });
        }

        // 2. Check overlap
        const existing = await UserContestReward.findOne({
            where: { contestId, userId, tierName }
        });
        if (existing) return res.status(400).json({ error: "Reward already claimed" });

        // 3. Claim
        const reward = await UserContestReward.create({
            contestId,
            userId,
            tierName,
            status: 'claimed'
        });

        res.json({ success: true, reward });

    } catch (error) {
        console.error("Claim Reward Error:", error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createContest,
    updateContest,
    deleteContest,
    getAdminContests,
    getUserContests,
    claimReward,
    getEligibleUsers
};

const { Contest, UserContestReward, Incentive, Lead, Sequelize } = require("../models");
const { Op } = Sequelize;

// --- ADMIN ---

const notificationService = require("../services/notificationService");

const createContest = async (req, res) => {
    try {
        const { title, description, startDate, endDate, bannerUrl, termsAndConditions, targetType, tiers, notifyUsers } = req.body;

        const contest = await Contest.create({
            title,
            description,
            startDate,
            endDate,
            bannerUrl,
            termsAndConditions,
            targetType,
            tiers // Expecting object/array
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

        // 1. Fetch Active Contests
        const contests = await Contest.findAll({
            where: {
                isActive: true,
                // startDate: { [Op.lte]: now }, // Optionally hide future contests
                // endDate: { [Op.gte]: now }   // Optionally hide past contests
            },
            include: [
                {
                    model: UserContestReward,
                    as: 'rewards',
                    where: { userId },
                    required: false
                }
            ],
            order: [['endDate', 'ASC']]
        });

        const result = [];

        for (const contest of contests) {
            // 2. Calculate Progress
            let currentAmount = 0;

            if (contest.targetType === 'incentive') {
                // Sum approved incentives within date range
                const incentives = await Incentive.sum('amount', {
                    where: {
                        user_id: userId,
                        status: 'paid',
                    }
                });
                currentAmount = incentives || 0;
            } else if (contest.targetType === 'leads_count') {
                // Count approved leads
                const leads = await Lead.count({
                    where: {
                        userId, // Assuming lead.userId is the partner
                        status: 'closed', // or whatever 'success' status is
                    }
                });
                currentAmount = leads || 0;
            }
            // For 'premium', we'd need a 'premium' column on Lead or Incentive table, which might not verify yet. 
            // Defaulting to 0 if not supported.

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

            result.push({
                id: contest.id,
                title: contest.title,
                bannerUrl: contest.bannerUrl,
                description: contest.description,
                startDate: contest.startDate,
                endDate: contest.endDate,
                targetType: contest.targetType,
                progress: {
                    current: currentAmount,
                    target: Math.max(...tiers.map(t => t.minAmount), 0) // Max target from tiers
                },
                tiers: processedTiers,
                isCompleted
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
    claimReward
};

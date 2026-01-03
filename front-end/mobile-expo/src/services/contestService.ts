import api from './api';

export interface ContestTier {
    name: string;
    minAmount: number;
    rewardDescription: string;
    segment?: string;
    isUnlocked: boolean;
    isClaimed: boolean;
    claimedAt?: string;
}

export interface Contest {
    id: number;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    bannerUrl: string;
    targetType: 'incentive' | 'premium' | 'leads_count';
    progress: {
        current: number;
        target: number;
    };
    tiers: ContestTier[];
    isCompleted: boolean;
}

export const contestService = {
    getMyStatus: async () => {
        const response = await api.get<Contest[]>('/contests/my-status');
        return response.data;
    },

    claimReward: async (contestId: number, tierName: string) => {
        const response = await api.post('/contests/claim', { contestId, tierName });
        return response.data;
    }
};

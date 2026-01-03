import { PrivateAxios } from "@/helpers/PrivateAxios";

export interface ContestTier {
    name: string;
    minAmount: number;
    rewardDescription: string;
    segment?: string;
}

export interface Contest {
    id?: number;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    bannerUrl: string;
    termsAndConditions: string;
    isActive: boolean;
    targetType: 'incentive' | 'premium' | 'leads_count';
    tiers: ContestTier[];
    notifyUsers?: boolean;
}

export const contestService = {
    // --- Admin ---
    getAllContests: async () => {
        const response = await PrivateAxios.get<Contest[]>("/contests/admin/all");
        return response.data;
    },

    createContest: async (data: Contest) => {
        const response = await PrivateAxios.post("/contests", data);
        return response.data;
    },

    updateContest: async (id: number, data: Partial<Contest>) => {
        const response = await PrivateAxios.put(`/contests/${id}`, data);
        return response.data;
    },

    deleteContest: async (id: number) => {
        const response = await PrivateAxios.delete(`/contests/${id}`);
        return response.data;
    }
};

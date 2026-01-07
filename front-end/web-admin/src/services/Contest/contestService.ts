import { PrivateAxios } from "@/helpers/PrivateAxios";
import axios from "axios";
import Cookies from "js-cookie";

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
    fileUrl?: string;
    productType?: string;
    productSubType?: string;
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
    },

    uploadPoster: async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);

        // Fix: backend route is /api/upload, but PrivateAxios uses /v1 base
        const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5003/v1').replace('/v1', '');
        const token = Cookies.get("admin_token");

        const response = await axios.post(`${BASE_URL}/api/upload/documents`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': token ? `Bearer ${token}` : ''
            }
        });
        return response.data.fileUrl;
    },

    getEligibleUsers: async (contestId: number) => {
        const response = await PrivateAxios.get(`/contests/${contestId}/eligible-users`);
        return response.data;
    }
};

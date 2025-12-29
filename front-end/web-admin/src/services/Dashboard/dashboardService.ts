import { PrivateAxios } from "@/helpers/PrivateAxios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5003/v1';

export const getDashboardStats = async () => {
    try {
        const response = await PrivateAxios.get(`${API_URL}/admin/dashboard`);
        return response.data;
    } catch (error) {
        console.error("Failed to get dashboard stats:", error);
        throw error;
    }
};

import { PrivateAxios } from "@/helpers/PrivateAxios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5003/v1';

export const getUsers = async () => {
    try {
        const response = await PrivateAxios.get(`${API_URL}/admin/users`);
        return response.data;
    } catch (error) {
        console.error("Failed to fetch users", error);
        throw error;
    }
};

export const approvePartner = async (userId: string) => {
    try {
        const response = await PrivateAxios.put(`${API_URL}/admin/users/${userId}/approve`);
        return response.data;
    } catch (error) {
        console.error("Failed to approve partner", error);
        throw error;
    }
};

export const getRMs = async () => {
    try {
        const response = await PrivateAxios.get(`${API_URL}/admin/rm/list`);
        return response.data;
    } catch (error) {
        console.error("Failed to fetch RMs", error);
        throw error;
    }
};

export const getUpgradeRequests = async (status?: string) => {
    try {
        const query = status ? `?status=${status}` : '';
        const response = await PrivateAxios.get(`${API_URL}/admin/role-upgrade-requests${query}`);
        return response.data;
    } catch (error) {
        console.error("Failed to fetch upgrade requests", error);
        throw error;
    }
};

export const reviewUpgradeRequest = async (offerId: number, action: 'approve' | 'reject', notes?: string) => {
    try {
        const response = await PrivateAxios.put(`${API_URL}/admin/role-upgrade-requests/${offerId}/review`, {
            action,
            admin_notes: notes
        });
        return response.data;
    } catch (error) {
        console.error("Failed to review request", error);
        throw error;
    }
};

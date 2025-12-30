import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5003/v1';

export const verifyInviteToken = async (token: string) => {
    try {
        const response = await axios.get(`${API_URL}/admin/auth/verify-invite?token=${token}`);
        return response.data;
    } catch (error: any) {
        if (error.response?.data) {
            throw new Error(error.response.data.error || 'Failed to verify token');
        }
        throw error;
    }
};

export const completeInvite = async (data: {
    token: string;
    password: string;
    name?: string;
}) => {
    try {
        const response = await axios.post(`${API_URL}/admin/auth/complete-invite`, data);
        return response.data;
    } catch (error: any) {
        if (error.response?.data) {
            throw new Error(error.response.data.error || 'Failed to complete invitation');
        }
        throw error;
    }
};

import { PrivateAxios } from "@/helpers/PrivateAxios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5003/v1';

export const getLeads = async (params?: any) => {
    try {
        const response = await PrivateAxios.get(`${API_URL}/admin/leads`, { params });
        return response.data;
    } catch (error) {
        console.error("Failed to fetch leads", error);
        throw error;
    }
};

export const getLead = async (id: string) => {
    try {
        const response = await PrivateAxios.get(`${API_URL}/admin/leads/${id}`);
        return response.data;
    } catch (error) {
        console.error("Failed to fetch lead details", error);
        throw error;
    }
};

export const assignLead = async (requestBody: { leadId: string; rmId: string }) => {
    try {
        const response = await PrivateAxios.post(`${API_URL}/admin/assign`, requestBody);
        return response.data;
    } catch (error) {
        console.error("Failed to assign lead", error);
        throw error;
    }
};

export const updateLeadInternalStatus = async (leadId: string, requestBody: any) => {
    try {
        const response = await PrivateAxios.put(`${API_URL}/admin/internal-status/${leadId}`, requestBody);
        return response.data;
    } catch (error) {
        console.error("Failed to update status", error);
        throw error;
    }
};

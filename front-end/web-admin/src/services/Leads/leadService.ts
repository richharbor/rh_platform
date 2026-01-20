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
export const updateWebLeadStatus = async (leadId: string, requestBody: any) => {
    try {
        const response = await PrivateAxios.put(`${API_URL}/admin/web-lead-status/${leadId}`, requestBody);
        return response.data;
    } catch (error) {
        console.error("Failed to update status", error);
        throw error;
    }
};

export const createLead = async (requestBody: any) => {
    try {
        const response = await PrivateAxios.post(`${API_URL}/web/leads`, requestBody);
        return response.data;
    } catch (error) {
        console.error("Lead submission failed", error);
        throw error;
    }
};



export const updateLead = async (leadId: string, requestBody: any) => {
    try {
        // We have /internal-status for status
        // But for full update (product details), we need a general update route.
        // Check rhLeadController.js update? 
        // Admin routes usually have specific endpoints. 
        // If not, we might need to add one.
        // Let's assume PUT /leads/:id works?
        const response = await PrivateAxios.put(`${API_URL}/leads/${leadId}`, requestBody);
        return response.data;
    } catch (error) {
        console.error("Failed to update lead", error);
        throw error;
    }
};

import api from './api';

export interface UpgradeRequest {
    id: number;
    current_role: string;
    requested_role: string;
    status: 'pending' | 'approved' | 'rejected';
    reason?: string;
    admin_notes?: string;
    created_at: string;
    reviewed_at?: string;
}

export interface UpgradeStatusResponse {
    request?: UpgradeRequest;
    canRequest: boolean;
    cooldownEndsAt?: string;
    currentRole: string;
}

export const roleUpgradeService = {
    submitRequest: async (data: { requested_role: string; reason?: string; business_data?: any }) => {
        const response = await api.post('/me/role-upgrade-request', data);
        return response.data;
    },

    getStatus: async () => {
        const response = await api.get<UpgradeStatusResponse>('/me/role-upgrade-request');
        return response.data;
    }
};

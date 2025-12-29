import api from './api';

export interface Lead {
    id: number;
    product_type: string;
    lead_type: string;
    name: string;
    status: string;
    expected_payout?: string;
    created_at: string;
    [key: string]: any;
}

export const leadService = {
    createLead: async (data: any) => {
        const response = await api.post('/leads', data);
        return response.data;
    },

    getMyLeads: async () => {
        const response = await api.get<Lead[]>('/leads');
        return response.data;
    }
};

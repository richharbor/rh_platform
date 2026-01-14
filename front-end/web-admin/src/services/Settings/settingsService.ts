import { PrivateAxios } from "@/helpers/PrivateAxios";

export const settingsService = {
    getProductRules: async () => {
        const response = await PrivateAxios.get('/admin/product-rules');
        return response.data;
    },

    updateProductRule: async (id: number, updates: {
        partner_percentage?: number;
        customer_percentage?: number;
        referral_partner_percentage?: number;
        is_active?: boolean;
    }) => {
        const response = await PrivateAxios.put(`/admin/product-rules/${id}`, updates);
        return response.data;
    }
};

import { PrivateAxios } from "@/helpers/PrivateAxios";

export const settingsService = {
    getProductRules: async () => {
        const response = await PrivateAxios.get('/admin/product-rules');
        return response.data;
    },

    updateProductRule: async (id: number, reward_percentage: number) => {
        const response = await PrivateAxios.put(`/admin/product-rules/${id}`, {
            reward_percentage
        });
        return response.data;
    }
};

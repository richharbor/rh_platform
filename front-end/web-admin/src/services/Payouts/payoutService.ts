import { PrivateAxios } from "@/helpers/PrivateAxios";

export const payoutService = {
    getPayouts: async () => {
        const response = await PrivateAxios.get('/admin/payouts');
        return response.data;
    },

    updateIncentiveStatus: async (id: number, status: 'paid' | 'approved' | 'rejected') => {
        const response = await PrivateAxios.patch(`/admin/incentives/${id}`, { status, notifyUser: true });
        return response.data;
    }
};

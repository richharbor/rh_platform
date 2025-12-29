import api from './api';

export const rewardService = {
    getWalletStats: async () => {
        const response = await api.get('/rewards/stats');
        return response.data;
    },

    getTransactions: async () => {
        const response = await api.get('/rewards/transactions');
        return response.data;
    }
};

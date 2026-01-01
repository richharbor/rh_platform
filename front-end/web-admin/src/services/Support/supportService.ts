import { PrivateAxios } from "@/helpers/PrivateAxios";

export const supportService = {
    getAllTickets: async () => {
        const response = await PrivateAxios.get('/admin/tickets');
        return response.data;
    },

    updateTicket: async (id: number, data: any) => {
        const response = await PrivateAxios.put(`/admin/tickets/${id}`, data);
        return response.data;
    }
};

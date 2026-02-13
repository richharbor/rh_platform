import api from './api';

export interface Notification {
    id: number;
    title: string;
    body: string;
    type:string;
    image_url:string;
    is_new:boolean;
    created_at: string;
}

export const notificationServices = {
    

    getMyNotifications: async () => {
        const response = await api.get<Notification[]>('/notifications/get');
        return response.data;
    },
    updateNotification: async (id: number) => {
        const response = await api.put<Notification>('/notifications/update/' + id);
        return response.data;
    },

    
};
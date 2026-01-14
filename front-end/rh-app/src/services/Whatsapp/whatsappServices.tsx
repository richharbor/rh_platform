import { PrivateAxios } from "@/helpers/PrivateAxios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
export interface WhatsappPayload {
    title: string;
    description?: string;
    phoneNumbers: string[];
}

export const sendWhatsappMsg = async (payload: WhatsappPayload) => {
    try {
        const response = await PrivateAxios.post(`${API_URL}/whatsapp/send-msg`, payload);
        return response.data;
    } catch (error) {
        console.error("Failed to send whatsapp msg:", error);
        throw error;
    }
};
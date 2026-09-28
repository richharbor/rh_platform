import { PrivateAxios, PublicAxios } from "@/helpers/PrivateAxios";

export interface LiquidateShare {
    email: string;
    fullName: string;
    phone: string;
    price: string;
    profile: string;
    quantity: string;
    shareName: string;
}
interface FormData {
  shareName: string
  quantity: string
  name: string
  email: string
  phone: string
}

export const getShares = async () => {
    try {
        const response = await PublicAxios.get(`/web-shares`);
        return response.data.data;
    } catch (error) {
        console.error("Login failed", error);
        throw error;
    }
}


export const postLiquidateShares = async (requestBody: LiquidateShare) => {
    try {
        const response = await PublicAxios.post(`/liquidate-shares`, requestBody);

        return response.data.data;
    } catch (error) {
        console.error("Login failed", error);
        throw error;
    }
};
export const postStockEnquiry = async (requestBody: FormData) => {
    try {
        const response = await PublicAxios.post(`/leads`, requestBody);

        return response.data.data;
    } catch (error) {
        console.error("Login failed", error);
        throw error;
    }
};
import { PrivateAxios } from "@/helpers/PrivateAxios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const getAllShares = async () => {
  try {
    const response = await PrivateAxios.get(`${API_URL}/sell`);
    return response.data;
  } catch (error) {
    console.error("Failed to get shares:", error);
    throw error;
  }
};

export const getAllSellShares = async () => {
  try {
    const response = await PrivateAxios.get(`${API_URL}/sell/all-sells`);
    return response.data;
  } catch (error) {
    console.error("Failed to get shares:", error);
    throw error;
  }
};

export const getUsersAllShares = async () => {
  try {
    const response = await PrivateAxios.get(`${API_URL}/sell/users-shares`);
    return response.data;
  } catch (error) {
    console.error("Failed to get shares:", error);
    throw error;
  }
};

export interface SellPayload {
  shareName: string;
  quantityAvailable: number;
  price: number;
  deliveryTimeline?: string;
  moq?: number;
  fixedPrice?: boolean;
  confirmDelivery?: boolean;
  shareInStock?: boolean;
  preShareTransfer?: boolean;
  bestDeal?:boolean;
  endSellerName?: string;
  endSellerProfile?: string;
  endSellerLocation?: string;
}

export const createSell = async (payload: SellPayload) => {
  try {
    const response = await PrivateAxios.post(
      `${API_URL}/sell/create-sell`,
      payload
    );
    return response.data;
  } catch (error: any) {
    console.error("Failed to create sell:", error);
    throw error;
  }
};

export const updateSell = async (
  id: number| string,
  payload: SellPayload
) => {
  try {
    const response = await PrivateAxios.put(
      `${API_URL}/sell/update-sell/${id}`,
      payload
    );
    return response.data;
  } catch (error: any) {
    console.error("Failed to update sell:", error);
    throw error;
  }
};

export const getSellsByShareId = async (shareId: string | number) => {
  try {
    const response = await PrivateAxios.get(`${API_URL}/sell/share/${shareId}`);
    return response.data.data; // assuming backend returns { success: true, data: [...] }
  } catch (error) {
    console.error("Failed to get sells for share:", error);
    throw error;
  }
};

export const getSellbySellId = async (sellId: string | number) =>{
  try {
    const response = await PrivateAxios.get(`${API_URL}/sell/sell/${sellId}`);
    return response.data.data; // assuming backend returns { success: true, data: [...] }
  } catch (error) {
    console.error("Failed to get sells for share:", error);
    throw error;
  }
}

export const getShareByShareId = async (shareId: string | number) =>{
  try {
    const response = await PrivateAxios.get(`${API_URL}/sell/share-detail/${shareId}`);
    return response.data.data; // assuming backend returns { success: true, data: [...] }
  } catch (error) {
    console.error("Failed to get sells for share:", error);
    throw error;
  }
}

export const deleteSell = async(id: number | string) =>{
  try{
    const response = await PrivateAxios.delete(`${API_URL}/sell/delete/${id}`);
    return response.data;
  }catch(error){
    console.error('Faild to discard booking :', error);
    throw error;
  }
}

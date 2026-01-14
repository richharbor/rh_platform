import { PrivateAxios } from "@/helpers/PrivateAxios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const getAllBids = async (franchiseId: number) => {
  try {
    const response = await PrivateAxios.get(`${API_URL}/bids/all-bids/${franchiseId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to get shares:", error);
    throw error;
  }
};
export const getMyBids = async () => {
  try {
    const response = await PrivateAxios.get(`${API_URL}/bids/my-bids`);
    return response.data;
  } catch (error) {
    console.error("Failed to get shares:", error);
    throw error;
  }
};

export interface BookSharePayload {
  sellId: number;
  quantity:number;
  bidPrice:number;
}

export const BidShare = async (payload: BookSharePayload) => {
  try {
    const response = await PrivateAxios.post(
      `${API_URL}/bids/bid`,
      payload
    );
    return response.data;
  } catch (error: any) {
    console.error("Failed to create sell:", error);
    throw error;
  }
};

export const discardBid = async(id: number | string) =>{
  try{
    const response = await PrivateAxios.delete(`${API_URL}/bids/discard/${id}`);
    return response.data;
  }catch(error){
    console.error('Faild to discard bid :', error);
    throw error;
  }
}
export interface closeDealPayload {
  id:number;
  sellId: number;
  sellerId: number;
  buyerId: number;
  price:number;
  dealQuantity: string;
  goodBuyer: string;
  goodSeller: string;
}
export const closeDealBid = async (payload: closeDealPayload) =>{
  try {
    const response = await PrivateAxios.post(
      `${API_URL}/bids/close-deal`,
      payload
    );
    return response;
  } catch (error: any) {
    console.error("Failed to close deal:", error);
    throw error;
  }
}

export const deleteMyBid = async(id: number | string) =>{
  try{
    const response = await PrivateAxios.delete(`${API_URL}/bids/delete/${id}`);
    return response.data;
  }catch(error){
    console.error('Faild to discard bid :', error);
    throw error;
  }
}
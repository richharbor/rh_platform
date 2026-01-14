import { PrivateAxios } from "@/helpers/PrivateAxios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const getAllbookings = async (franchiseId: number) => {

  try {
    const response = await PrivateAxios.get(`${API_URL}/booking/all-bookings/${franchiseId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to get bookings:", error);
    throw error;
  }
};
export const getMyBookings = async () => {
  try {
    const response = await PrivateAxios.get(`${API_URL}/booking/my-bookings`);
    return response.data;
  } catch (error) {
    console.error("Failed to get booking:", error);
    throw error;
  }
};


export interface BookSharePayload {
  sellId: number;
  quantity:number;
}

export const bookShare = async (payload: BookSharePayload) => {
  try {
    const response = await PrivateAxios.post(
      `${API_URL}/booking/book`,
      payload
    );
    return response.data;
  } catch (error: any) {
    console.error("Failed to book share:", error);
    throw error;
  }
};

export const discardBooking = async(id: number | string) =>{
  try{
    const response = await PrivateAxios.delete(`${API_URL}/booking/discard/${id}`);
    return response.data;
  }catch(error){
    console.error('Faild to discard booking :', error);
    throw error;
  }
}
export interface closeDealPayload {
  id:number;
  sellId: number;
  sellerId: number;
  buyerId: number;
  dealQuantity: string;
  goodBuyer: string;
  goodSeller: string;
}
export const closeDeal = async (payload: closeDealPayload) =>{
  try {
    const response = await PrivateAxios.post(
      `${API_URL}/booking/close-deal`,
      payload
    );
    return response;
  } catch (error: any) {
    console.error("Failed to close deal:", error);
    throw error;
  }
}

export const deleteMyBooking = async(id: number | string) =>{
  try{
    const response = await PrivateAxios.delete(`${API_URL}/booking/delete/${id}`);
    return response.data;
  }catch(error){
    console.error('Faild to discard booking :', error);
    throw error;
  }
}

interface putBuyQueryPayload{
  shareName:string;
  price:number;
  quantity:number;
}

export const putBuyQuery = async (payload: putBuyQueryPayload) =>{
  try {
    const response = await PrivateAxios.post(
      `${API_URL}/booking/put-query`,
      payload
    );
    return response.data;
  } catch (error: any) {
    console.error("Failed to put query:", error);
    throw error;
  }
}
export const getAllBuyQueries = async (franchiseId: number) => {

  try {
    const response = await PrivateAxios.get(`${API_URL}/booking/all-buy-queries/${franchiseId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to get all buy queries:", error);
    throw error;
  }
};

export interface closeQueryPayload {
  id:number;
  buyerId: number;
  dealQuantity: string;
  shareName:string;
  price:string;
  goodBuyer: string;
}

export const closeBuyQuery = async (payload: closeQueryPayload) =>{
  try {
    const response = await PrivateAxios.post(
      `${API_URL}/booking/close-buy-query`,
      payload
    );
    return response;
  } catch (error: any) {
    console.error("Failed to close buy query:", error);
    throw error;
  }
}
export const discardBuyQuery = async(id: number | string) =>{
  try{
    const response = await PrivateAxios.delete(`${API_URL}/booking/discard-buy-query/${id}`);
    return response.data;
  }catch(error){
    console.error('Faild to discard buy query :', error);
    throw error;
  }
}
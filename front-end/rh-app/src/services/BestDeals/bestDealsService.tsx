import { PrivateAxios } from "@/helpers/PrivateAxios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const getAllBestDeals = async () => {
  try {
    const response = await PrivateAxios.get(`${API_URL}/sell/all-best-deals`);
    return response.data;
  } catch (error) {
    console.error("Failed to get shares:", error);
    throw error;
  }
};

export const getAllNonApprovedBestDeals = async () => {
  try {
    const response = await PrivateAxios.get(`${API_URL}/sell/all-non-approved-best-deals`);
    return response.data;
  } catch (error) {
    console.error("Failed to get shares:", error);
    throw error;
  }
};
export const approveBestDeal = async (
  id: number| string,
) => {
  try {
    const response = await PrivateAxios.put(
      `${API_URL}/sell/best-deal/approve/${id}`
    );
    return response.data;
  } catch (error: any) {
    console.error("Failed to update sell:", error);
    throw error;
  }
};
export const discardBestDeal = async (
  id: number| string,
) => {
  try {
    const response = await PrivateAxios.put(
      `${API_URL}/sell/best-deal/discard/${id}`
    );
    return response.data;
  } catch (error: any) {
    console.error("Failed to update sell:", error);
    throw error;
  }
};

export const getBestDealBySellId = async (sellId: string | number) =>{
  try {
    const response = await PrivateAxios.get(`${API_URL}/sell/best-deal/${sellId}`);
    return response.data.data; // assuming backend returns { success: true, data: [...] }
  } catch (error) {
    console.error("Failed to get best deal details:", error);
    throw error;
  }
}
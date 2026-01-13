import { PrivateAxios } from "@/helpers/PrivateAxios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;



export const getMyProfile = async () => {
  try {
    const response = await PrivateAxios.get(`${API_URL}/partners/my-profile`);
    return response.data;
  } catch (error) {
    console.error("Failed to profile details:", error);
    throw error;
  }
};


export const getSellerDetails = async (id : string| number) =>{
  try {
    const response = await PrivateAxios.get(`${API_URL}/partners/profile/${id}`);
    return response.data;
  } catch (error) {
    console.error("Failed to get Seller details", error);
    throw error;
  }
}


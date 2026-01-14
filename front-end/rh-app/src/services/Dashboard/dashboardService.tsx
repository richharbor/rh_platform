import { PrivateAxios } from "@/helpers/PrivateAxios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const getDashboardInfo = async () => {
  try {
    const response = await PrivateAxios.get(`${API_URL}/dashboard/info`);
    return response.data;
  } catch (error) {
    console.error("Failed to get dashboard info:", error);
    throw error;
  }
};
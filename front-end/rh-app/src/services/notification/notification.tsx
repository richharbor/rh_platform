import { PrivateAxios } from "@/helpers/PrivateAxios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const saveSubscription = async (subscription: any) => {

  try {
    const response = await PrivateAxios.post(`${API_URL}/notification/save-subscription`, subscription, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Failed to get shares:", error);
    throw error;
  }
};


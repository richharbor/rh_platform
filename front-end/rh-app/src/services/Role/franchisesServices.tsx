import { PrivateAxios } from "@/helpers/PrivateAxios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface InviteFranchisesAdmin {
  franchiseName: string;
  firstName: string;
  lastName: string;
  inviteEmail: string;
}

export const inviteFranchisesAdmin = async (data: InviteFranchisesAdmin) => {
  try {
    const response = await PrivateAxios.post(
      `${API_URL}/franchises/invite-franchises-admin`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Failed to invite team member:", error);
    throw error;
  }
};



export const getFranchiseMembers = async () => {
  try {
    const response = await PrivateAxios.get(`${API_URL}/franchises`);
    return response.data;
  } catch (error) {
    console.error("Failed to get team roles:", error);
    throw error;
  }
};






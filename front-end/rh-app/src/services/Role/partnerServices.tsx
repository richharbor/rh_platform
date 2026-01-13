import { PrivateAxios } from "@/helpers/PrivateAxios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface CreateRoleBody {
  name: string;
  description?: string;
  permissions: string[];
  franchiseId: number;
}

export const createNewRoleForPartner = async (requestBody: CreateRoleBody) => {
  try {
    const response = await PrivateAxios.post(
      `${API_URL}/partners/create-role`,
      requestBody
    );
    return response.data;
  } catch (error) {
    console.error("Failed to create team role:", error);
    throw error;
  }
};

export const deletePartnerRole = async (roleId: number) => {
  try {
    const response = await PrivateAxios.delete(
      `${API_URL}/partners/delete-role/${roleId}`
    );
    return response.data;
  } catch (error: any) {
    console.error("Failed to delete partner role:", error);
    throw error;
  }
};

// Get all onboarding applications with filters & pagination
export const getPartnerApplications = async (params?: {
  status?: string;
  page?: number;
  limit?: number;
  franchiseId: number;
}) => {
  try {
    const response = await PrivateAxios.get(
      `${API_URL}/partners/applications`,
      {
        params, // query params { status, page, limit }
      }
    );
    return response.data; // { applications, pagination }
  } catch (error) {
    console.error("Failed to fetch applications", error);
    throw error;
  }
};
export const getPartnerDetailsbyId = async (
  params:{
    userId: number;
    franchiseId: number;
  }
) =>{
  try {
    const response = await PrivateAxios.get(`${API_URL}/partners/partner-details`,
      {
        params, // query params { userId, franchiseId }
      }
    );
    return response.data;
  } catch (error) {
    console.error("Failed to fetch partner details", error);
    throw error;
  }

}

export const invitePartnerUsingEmail = async (
  email: string,
  roles: number[],
  franchiseId: number
) => {
  try {
    const response = await PrivateAxios.post(
      `${API_URL}/partners/invite-partner`,
      { email, roles, franchiseId }
    );
    return response.data;
  } catch (error) {
    console.error("Failed to send partner invite", error);
    throw error;
  }
};

export const getPartnerRoles = async (franchiseId: number) => {
  try {
    const response = await PrivateAxios.get(
      `${API_URL}/partners/roles?franchiseId=${franchiseId}`
    );
    return response.data;
  } catch (error) {
    console.error("Failed to get team roles:", error);
    throw error;
  }
};

export const fetchAllFranshisesForAdmin = async () => {
  try {
    const response = await PrivateAxios.get(`${API_URL}/partners/franchises`);
    return response.data;
  } catch (error) {
    console.error("Failed to send partner invite", error);
    throw error;
  }
};

export const updateApplicationStatus = async (
  applicationId: number,
  status: "approved" | "rejected",
  reviewNotes?: string
) => {
  try {
    const response = await PrivateAxios.patch(
      `${API_URL}/partners/applications/${applicationId}/status`,
      { status, reviewNotes }
    );
    return response.data;
  } catch (error) {
    console.error("Failed to update application status", error);
    throw error;
  }
};

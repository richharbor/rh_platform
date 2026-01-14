import { PrivateAxios } from "@/helpers/PrivateAxios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
export interface CreateRoleBody {
  name: string;
  description?: string;
  permissions: string[];
}

interface InviteTeamMemberBody {
  email: string;
  firstName: string;
  lastName: string;
  roles: number[];
}

export const createNewRoleForTeams = async (requestBody: CreateRoleBody) => {
  try {
    const response = await PrivateAxios.post(
      `${API_URL}/teams/create-role`,
      requestBody
    );
    return response.data;
  } catch (error) {
    console.error("Failed to create team role:", error);
    throw error;
  }
};

export const deleteTeamRole = async (roleId: number) => {
  try {
    const response = await PrivateAxios.delete(
      `${API_URL}/teams/delete-role/${roleId}`
    );
    return response.data;
  } catch (error: any) {
    console.error("Failed to delete team role:", error);
    throw error;
  }
};

export const getTeamRoles = async () => {
  try {
    const response = await PrivateAxios.get(`${API_URL}/teams/roles`);
    return response.data;
  } catch (error) {
    console.error("Failed to get team roles:", error);
    throw error;
  }
};

export const getAllTeamMembers = async () => {
  try {
    const response = await PrivateAxios.get(`${API_URL}/teams`);
    return response.data;
  } catch (error) {
    console.error("Failed to get team members :", error);
    throw error;
  }
};

export const inviteTeamMember = async (data: InviteTeamMemberBody) => {
  try {
    const response = await PrivateAxios.post(
      `${API_URL}/teams/invite-users`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Failed to invite team member:", error);
    throw error;
  }
};

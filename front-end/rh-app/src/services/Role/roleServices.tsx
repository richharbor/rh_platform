import { PrivateAxios } from "@/helpers/PrivateAxios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface Role {
  id: number;
  name: string;
  description: string;
  createdAt?: string;
  updatedAt?: string;
}

interface UserWithRoles {
  id: number;
  email: string;
  currentRole: Role;
  allRoles: Role[];
  profile: any;
}

interface UserRoleDetails {
  userId: number;
  email: string;
  currentRole: Role;
  assignedRoles: Role[];
}

interface AssignRoleBody {
  roleId: number;
}

export const getCurrentUser = async (): Promise<UserWithRoles> => {
  try {
    const response = await PrivateAxios.get(`${API_URL}/auth/me`);
    return response.data;
  } catch (error) {
    console.error("Failed to get current user", error);
    throw error;
  }
};

export const getAllRoles = async (): Promise<{ roles: Role[] }> => {
  try {
    const response = await PrivateAxios.get(`${API_URL}/admin/roles`);
    return response.data;
  } catch (error) {
    console.error("Failed to get roles", error);
    throw error;
  }
};

export const getUserRoles = async (userId: number): Promise<UserRoleDetails> => {
  try {
    const response = await PrivateAxios.get(`${API_URL}/admin/users/${userId}/roles`);
    return response.data;
  } catch (error) {
    console.error("Failed to get user roles", error);
    throw error;
  }
};

export const assignRoleToUser = async (userId: number, requestBody: AssignRoleBody) => {
  try {
    const response = await PrivateAxios.post(`${API_URL}/admin/users/${userId}/roles`, requestBody);
    return response.data;
  } catch (error) {
    console.error("Failed to assign role", error);
    throw error;
  }
};

export const switchRole = async (requestBody: any) => {
  try {
    const response = await PrivateAxios.post(`${API_URL}/auth/switch-role`, requestBody);
    return response.data;
  } catch (error) {
    console.error("Failed to assign role", error);
    throw error;
  }
};

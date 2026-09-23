import { PrivateAxios } from "../../helpers/PrivateAxios";

export interface AuthCredentialsLogin {
  email: string;
  password: string;
}

export interface InviteToken {
  token: string;
}

export interface ISetUserPassword {
  token: string;
  password: string;
}

export interface IInviteUser {
  name: string;
  email: string;
  role_id: number;
}

export interface IUpdateUser {
  name?: string;
  email?: string;
  role_id?: number;
  status?: string;
}

export const login = async (credentials: AuthCredentialsLogin) => {
  const response = await PrivateAxios.post("/auth/login", credentials);
  return response.data;
};

export const inviteUser = async (requestbody: IInviteUser) => {
  const response = await PrivateAxios.post("/admin/invite", requestbody);
  return response.data;
};

export const getInviteUser = async (requestbody: InviteToken) => {
  const response = await PrivateAxios.post("/auth/invite/info", requestbody);
  return response.data;
};

export const setUserPassword = async (requestbody: ISetUserPassword) => {
  const response = await PrivateAxios.post("/auth/accept-invite", requestbody);
  return response.data;
};

export const getAllUsers = async () => {
  const response = await PrivateAxios.get("/admin");
  return response.data;
};

export const updateUsers = async (id: number, requestbody: IUpdateUser) => {
  const response = await PrivateAxios.patch(`/admin/${id}`, requestbody);
  return response.data;
};

export const deleteUser = async (id: number) => {
  const response = await PrivateAxios.delete(`/admin/${id}`);
  return response.data;
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

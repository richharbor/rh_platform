import { PrivateAxios } from "@/helpers/PrivateAxios";
import axios from "axios";
import Cookies from "js-cookie";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5003/v1';

export const postLogin = async (requestBody: { email: string; password: string }) => {
    try {
        const response = await axios.post(`${API_URL}/admin/auth/login`, requestBody);
        if (response.data.token) {
            Cookies.set('admin_token', response.data.token, { expires: 0.5 }); // 12 hours
            Cookies.set('admin_user', JSON.stringify(response.data.admin), { expires: 0.5 });
        }
        return response.data;
    } catch (error) {
        console.error("Login failed", error);
        throw error;
    }
};

export const postLogout = () => {
    Cookies.remove('admin_token');
    Cookies.remove('admin_user');
    window.location.href = '/login';
};

import { PrivateAxios } from "@/helpers/PrivateAxios";
import axios from "axios";
import Cookies from "js-cookie";
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const createWebShare = async (data: { name: string; price: number; sector: string, symbol: string }) => {
    const response = await PrivateAxios.post(`${API_URL}/web-shares/create`, data);
    return response.data;
};

export const updateWebShare = async (data: { id: string; name: string; price: number; sector: string, symbol: string }) => {
    const response = await PrivateAxios.put(`${API_URL}/web-shares/update`, data);
    return response.data;
};

export const getWebShares = async () => {
    const response = await PrivateAxios.get(`${API_URL}/web-shares/`);
    return response.data;
};

export const deleteWebShare = async (id: string) => {
    const response = await PrivateAxios.delete(`${API_URL}/web-shares/delete/${id}`);
    return response.data;
};


export const uploadPoster = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    // Fix: backend route is /api/upload, but PrivateAxios uses /v1 base
    const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5003/v1').replace('/v1', '');
    const token = Cookies.get("admin_token");

    const response = await axios.post(`${BASE_URL}/upload/documents`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': token ? `Bearer ${token}` : ''
        }
    });
    return response.data.fileUrl;
}


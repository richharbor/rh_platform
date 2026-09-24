import axios from "axios";
import Cookies from "js-cookie";

const PublicAxios = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const PublicAxiosForBlogs = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL_BLOGS,
  headers: {
    "Content-Type": "application/json",
  },
});

const PrivateAxios = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

PrivateAxios.interceptors.request.use((config) => {
  const token = Cookies.get("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export { PublicAxios, PrivateAxios ,PublicAxiosForBlogs};

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Replace with your actual backend URL. 
// Local IP (Recommended for Physical Devices & Emulators on same network):


const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://10.159.167.34:5003/v1';
// const BASE_URL = 'http://10.208.181.34:5003/v1';

// Backups
// const BASE_URL = 'http://10.0.2.2:3000/v1'; // Android Emulator specific
// const BASE_URL = 'https://q9qh6pkg-5003.inc1.devtunnels.ms/v1'; // DevTunnel

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle 401 globally if needed (e.g. logout)
        return Promise.reject(error);
    }
);

export default api;

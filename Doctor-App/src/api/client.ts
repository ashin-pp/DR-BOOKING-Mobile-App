import axios from 'axios';
import { useAuthStore } from '../store/authStore';

// Assuming Android emulator for localhost. Change to your computer's IP for physical device.
const BASE_URL = 'http://10.0.2.2:5000/api'; 

export const apiClient = axios.create({
  baseURL: BASE_URL,
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useAuthStore } from '../store/authStore';

import Constants from 'expo-constants';

// Automatically gets the system IP address that Expo is currently using
const debuggerHost = Constants.expoConfig?.hostUri;
const systemIp = debuggerHost?.split(':')[0] || 'localhost';
const BASE_URL = `http://${systemIp}:5000/api`;

export const apiClient = axios.create({
  baseURL: BASE_URL,
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Bypass localtunnel warning page so we don't get an HTML response
  config.headers['Bypass-Tunnel-Reminder'] = 'true';
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 404) {
      console.log('404 ERROR ON URL:', originalRequest.url);
    }

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await SecureStore.getItemAsync('refreshToken');
        
        if (refreshToken) {
          // Attempt to get a new token
          const refreshResponse = await axios.post(`${BASE_URL}/auth/refresh`, {
            refreshToken
          });
          
          if (refreshResponse.data.token) {
            // Update token in Zustand
            useAuthStore.getState().setToken(refreshResponse.data.token);
            
            // Retry the original request with new token
            originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.token}`;
            return axios(originalRequest);
          }
        }
        
        // If no refresh token or refresh failed, logout
        useAuthStore.getState().logout();
      } catch (refreshError) {
        // If the refresh token is expired or invalid, logout
        useAuthStore.getState().logout();
      }
    }

    return Promise.reject(error);
  }
);

import { apiClient } from './client';
import { API_ENDPOINTS } from '../constants/apiEndpoints';
import { LoginPayload, RegisterPayload } from '../types/api.types';

export const authService = {
  login: async (credentials: LoginPayload) => {
    return apiClient.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
  },
  register: async (userData: RegisterPayload) => {
    return apiClient.post(API_ENDPOINTS.AUTH.REGISTER, userData);
  },
};

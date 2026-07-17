import { apiClient } from './client';
import { API_ENDPOINTS } from '../constants/apiEndpoints';
import { UpdateProfilePayload } from '../types/api.types';

export const userService = {
  updateProfile: async (data: UpdateProfilePayload) => {
    return apiClient.put(API_ENDPOINTS.USERS.PROFILE, data);
  },
};

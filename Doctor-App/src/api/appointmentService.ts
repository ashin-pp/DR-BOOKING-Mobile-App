import { apiClient } from './client';
import { API_ENDPOINTS } from '../constants/apiEndpoints';
import { BookAppointmentPayload } from '../types/api.types';

export const appointmentService = {
  getAppointments: async () => {
    return apiClient.get(API_ENDPOINTS.APPOINTMENTS.ALL);
  },
  bookAppointment: async (data: BookAppointmentPayload) => {
    return apiClient.post(API_ENDPOINTS.APPOINTMENTS.BOOK, data);
  },
  updateAppointmentStatus: async (appointmentId: string, status: string) => {
    return apiClient.patch(API_ENDPOINTS.APPOINTMENTS.UPDATE_STATUS(appointmentId), { status });
  },
};

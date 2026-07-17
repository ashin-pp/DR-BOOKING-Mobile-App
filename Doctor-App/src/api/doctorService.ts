import { apiClient } from './client';
import { API_ENDPOINTS } from '../constants/apiEndpoints';
import { CreateSchedulePayload } from '../types/api.types';

export const doctorService = {
  getAllDoctors: async () => {
    return apiClient.get(API_ENDPOINTS.DOCTORS.ALL);
  },
  getDoctorSchedule: async (doctorId: string, date: string) => {
    return apiClient.get(API_ENDPOINTS.DOCTORS.SCHEDULE(doctorId, date));
  },
  getMySchedule: async (date: string) => {
    return apiClient.get(API_ENDPOINTS.DOCTORS.MY_SCHEDULE(date));
  },
  createSchedule: async (data: CreateSchedulePayload) => {
    return apiClient.post(API_ENDPOINTS.DOCTORS.CREATE_SCHEDULE, data);
  },
  removeScheduleSlot: async (date: string, time: string) => {
    return apiClient.delete(API_ENDPOINTS.DOCTORS.REMOVE_SLOT, { data: { date, time } });
  },
  closeSchedule: async (date: string) => {
    return apiClient.post(API_ENDPOINTS.DOCTORS.CLOSE_SCHEDULE, { date });
  },
  getAnalytics: async (filter: string, search: string, page: number, limit: number) => {
    return apiClient.get(API_ENDPOINTS.DOCTORS.ANALYTICS(filter, search, page, limit));
  },
};

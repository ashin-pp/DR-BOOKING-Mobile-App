export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
  },
  USERS: {
    PROFILE: '/users/profile',
  },
  DOCTORS: {
    ALL: '/doctors',
    SCHEDULE: (doctorId: string, date: string) => `/doctors/${doctorId}/schedule/${date}`,
    MY_SCHEDULE: (date: string) => `/doctors/schedule/me/${date}`,
    CREATE_SCHEDULE: '/doctors/schedule',
    REMOVE_SLOT: '/doctors/schedule/slot',
    CLOSE_SCHEDULE: '/doctors/schedule/close',
    ANALYTICS: (filter: string, search: string, page: number, limit: number) => 
      `/doctors/analytics?filter=${filter}&search=${search}&page=${page}&limit=${limit}`,
  },
  APPOINTMENTS: {
    ALL: '/appointments',
    BOOK: '/appointments/book',
    UPDATE_STATUS: (appointmentId: string) => `/appointments/${appointmentId}/status`,
  }
};

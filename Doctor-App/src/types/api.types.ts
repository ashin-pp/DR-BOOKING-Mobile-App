export interface LoginPayload {
  email?: string;
  password?: string;
}

export interface RegisterPayload {
  name?: string;
  email?: string;
  password?: string;
  role?: string;
  phone?: string;
  age?: number;
  bloodGroup?: string;
  specialization?: string;
  experience?: number;
  consultationFee?: number;
}

export interface UpdateProfilePayload {
  name?: string;
  phone?: string;
  age?: number | null;
  bloodGroup?: string;
  specialization?: string;
  experience?: number;
  consultationFee?: number;
  imageBase64?: string;
}

export interface CreateSchedulePayload {
  date: string;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
}

export interface BookAppointmentPayload {
  doctorId: string;
  date: string;
  time: string;
  notes?: string;
}

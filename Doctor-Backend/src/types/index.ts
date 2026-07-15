import { Document, Types } from 'mongoose';
import { UserRole, AppointmentStatus } from '../constants/enums';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  phone?: string;
  specialization?: string;
  experience?: number;
  consultationFee?: number;
  about?: string;
  availableWorkingHours?: {
    start: string;
    end: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface IAppointment extends Document {
  patientId: Types.ObjectId;
  doctorId: Types.ObjectId;
  date: string;
  time: string;
  status: AppointmentStatus;
  tokenNumber: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

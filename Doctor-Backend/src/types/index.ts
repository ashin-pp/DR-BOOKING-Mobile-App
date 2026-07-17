import { Document, Types } from 'mongoose';
import { UserRole, AppointmentStatus } from '../constants/enums';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
  age?: number;
  bloodGroup?: string;
  profileImage?: string;
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
  patientSnapshot?: {
    name: string;
    email: string;
    phone?: string;
    age?: number;
    bloodGroup?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface ISlot {
  time: string;
  isBooked: boolean;
  patientId?: Types.ObjectId;
}

export interface ISchedule extends Document {
  doctorId: Types.ObjectId;
  date: string;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
  totalTokens: number;
  slots: ISlot[];
  createdAt: Date;
  updatedAt: Date;
}

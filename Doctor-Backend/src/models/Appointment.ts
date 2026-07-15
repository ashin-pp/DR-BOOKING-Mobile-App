import mongoose, { Schema } from 'mongoose';
import { AppointmentStatus } from '../constants/enums';
import { IAppointment } from '../types';

const AppointmentSchema: Schema = new Schema(
  {
    patientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    doctorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    status: { 
      type: String, 
      enum: Object.values(AppointmentStatus), 
      default: AppointmentStatus.PENDING 
    },
    tokenNumber: { type: String, required: true },
    notes: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IAppointment>('Appointment', AppointmentSchema);

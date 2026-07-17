import Appointment from '../models/Appointment';
import Schedule from '../models/Schedule';
import { UserRole } from '../constants/enums';
import { IAppointment } from '../types';

export const createAppointment = async (appointmentData: Partial<IAppointment>) => {
  const appointment = new Appointment(appointmentData);
  return await appointment.save();
};

export const markSlotAsBooked = async (doctorId: string, date: string, time: string, patientId: string) => {
  return await Schedule.updateOne(
    { doctorId, date, 'slots.time': time },
    { $set: { 'slots.$.isBooked': true, 'slots.$.patientId': patientId } }
  );
};

export const getAppointmentsByUser = async (userId: string, role: string) => {
  if (role === UserRole.DOCTOR) {
    return await Appointment.find({ doctorId: userId })
      .populate('patientId', 'name email phone age bloodGroup profileImage')
      .sort({ date: 1, time: 1 });
  } else {
    return await Appointment.find({ patientId: userId })
      .populate('doctorId', 'name specialization consultationFee profileImage')
      .sort({ date: 1, time: 1 });
  }
};

export const updateAppointmentStatus = async (appointmentId: string, status: string, doctorId: string) => {
  return await Appointment.findOneAndUpdate(
    { _id: appointmentId, doctorId },
    { status },
    { new: true }
  );
};

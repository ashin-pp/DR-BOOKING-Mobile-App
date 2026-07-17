import User from '../models/User';
import Schedule from '../models/Schedule';
import { UserRole } from '../constants/enums';
import { ISchedule } from '../types';

export const getAllDoctors = async () => {
  const doctors = await User.find({ role: UserRole.DOCTOR }).select('-password').lean();
  
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const today = `${year}-${month}-${day}`;
  
  // Find all future schedules with at least one slot
  const activeSchedules = await Schedule.find({
    date: { $gte: today },
    'slots.0': { $exists: true }
  }).select('doctorId');

  const activeDoctorIds = new Set(
    activeSchedules
      .filter(s => s && s.doctorId)
      .map(s => s.doctorId.toString())
  );

  return doctors.map(doc => ({
    ...doc,
    hasActiveSchedule: activeDoctorIds.has(doc._id ? doc._id.toString() : '')
  }));
};

export const getDoctorDetailsById = async (id: string) => {
  return await User.findOne({ _id: id, role: UserRole.DOCTOR }).select('-passwordHash');
};

export const upsertDoctorSchedule = async (doctorId: string, date: string, scheduleData: Partial<ISchedule>) => {
  return await Schedule.findOneAndUpdate(
    { doctorId, date },
    scheduleData,
    { new: true, upsert: true }
  );
};

export const getDoctorScheduleByDate = async (doctorId: string, date: string) => {
  return await Schedule.findOne({ doctorId, date });
};

export const removeSlotFromSchedule = async (doctorId: string, date: string, time: string) => {
  return await Schedule.findOneAndUpdate(
    { doctorId, date },
    { $pull: { slots: { time } } },
    { new: true }
  );
};

export const closeScheduleSlots = async (doctorId: string, date: string) => {
  return await Schedule.findOneAndUpdate(
    { doctorId, date },
    { $pull: { slots: { isBooked: false } } },
    { new: true }
  );
};

import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { getDoctorScheduleByDate } from '../services/doctorService';
import { createAppointment, markSlotAsBooked, getAppointmentsByUser, updateAppointmentStatus } from '../services/appointmentService';
import { generateToken } from '../utils/tokenUtils';
import User from '../models/User';

export const bookAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const { doctorId, date, time, notes } = req.body;
    const patientId = req.user?.id;

    if (!patientId) return res.status(401).json({ message: 'Unauthorized' });

    // Use doctorService to check if schedule exists
    const schedule = await getDoctorScheduleByDate(doctorId, date);
    if (!schedule) {
      return res.status(400).json({ message: 'Doctor has no schedule available for this date' });
    }

    const slot = schedule.slots.find((s: import('../types').ISlot) => s.time === time);
    if (!slot) {
      return res.status(400).json({ message: 'Invalid time slot' });
    }
    if (slot.isBooked) {
      return res.status(400).json({ message: 'Time slot is already booked' });
    }

    const tokenNumber = generateToken();

    const patientData = await User.findById(patientId);
    let patientSnapshot;
    if (patientData) {
      patientSnapshot = {
        name: patientData.name,
        email: patientData.email,
        phone: patientData.phone,
        age: patientData.age,
        bloodGroup: patientData.bloodGroup,
        profileImage: patientData.profileImage,
      };
    }

    const appointment = await createAppointment({
      patientId,
      doctorId,
      date,
      time,
      notes,
      tokenNumber,
      patientSnapshot,
    });

    await markSlotAsBooked(doctorId, date, time, patientId);

    res.status(201).json(appointment);
  } catch (error) {
    console.error('Error booking appointment:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getUserAppointments = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;

    if (!userId || !role) return res.status(401).json({ message: 'Unauthorized' });

    const appointments = await getAppointmentsByUser(userId, role);
    res.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const doctorId = req.user?.id;

    if (req.user?.role !== 'DOCTOR') {
      return res.status(403).json({ message: 'Only doctors can update status' });
    }

    const appointment = await updateAppointmentStatus(id, status, doctorId!);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.json(appointment);
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

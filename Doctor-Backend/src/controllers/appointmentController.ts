import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import Appointment from '../models/Appointment';
import { AppointmentStatus, UserRole } from '../constants/enums';

// Generate a random token like TKN-1234
const generateToken = () => {
  return `TKN-${Math.floor(1000 + Math.random() * 9000)}`;
};

export const bookAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const { doctorId, date, time, notes } = req.body;
    const patientId = req.user?.id;

    if (!patientId) return res.status(401).json({ message: 'Unauthorized' });

    // Check if slot is already booked for that doctor
    const existing = await Appointment.findOne({ doctorId, date, time, status: { $ne: AppointmentStatus.CANCELLED } });
    if (existing) {
      return res.status(400).json({ message: 'Time slot is already booked' });
    }

    const tokenNumber = generateToken();

    const appointment = new Appointment({
      patientId,
      doctorId,
      date,
      time,
      notes,
      tokenNumber,
    });

    await appointment.save();
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

    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    let appointments;
    if (role === UserRole.DOCTOR) {
      // Fetch appointments for the doctor, populate patient details
      appointments = await Appointment.find({ doctorId: userId })
        .populate('patientId', 'name email phone')
        .sort({ date: 1, time: 1 });
    } else {
      // Fetch appointments for the patient, populate doctor details
      appointments = await Appointment.find({ patientId: userId })
        .populate('doctorId', 'name specialization consultationFee')
        .sort({ date: 1, time: 1 });
    }

    res.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

import { Request, Response } from 'express';
import { UserRole } from '../constants/enums';
import { generateSlots } from '../utils/scheduleUtils';
import { getAllDoctors, getDoctorDetailsById, upsertDoctorSchedule, getDoctorScheduleByDate, removeSlotFromSchedule, closeScheduleSlots } from '../services/doctorService';

export const getDoctors = async (req: Request, res: Response) => {
  try {
    const doctors = await getAllDoctors();
    res.json(doctors);
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({ message: 'Server error: ' + (error instanceof Error ? error.message : String(error)) });
  }
};

export const getDoctorById = async (req: Request, res: Response) => {
  try {
    const doctor = await getDoctorDetailsById(req.params.id);
    
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    res.json(doctor);
  } catch (error) {
    console.error('Error fetching doctor details:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const generateSchedule = async (req: Request, res: Response) => {
  try {
    if (req.user?.role !== UserRole.DOCTOR) {
      return res.status(403).json({ message: 'Only doctors can generate schedules' });
    }

    const { date, startTime, endTime, totalTokens } = req.body;
    const doctorId = req.user.id;

    if (!date || !startTime || !endTime || !totalTokens) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    let scheduleData;
    try {
      const generated = generateSlots(date, startTime, endTime, totalTokens);
      scheduleData = {
        startTime,
        endTime,
        totalTokens,
        slotDurationMinutes: generated.slotDurationMinutes,
        slots: generated.slots
      };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error generating schedule';
      return res.status(400).json({ message: errorMessage });
    }

    const schedule = await upsertDoctorSchedule(doctorId, date, scheduleData);
    res.json(schedule);
  } catch (error) {
    console.error('Error generating schedule:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMySchedule = async (req: Request, res: Response) => {
  try {
    if (req.user?.role !== UserRole.DOCTOR) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    const schedule = await getDoctorScheduleByDate(req.user.id, req.params.date);
    res.json(schedule || null);
  } catch (error) {
    console.error('Error fetching my schedule:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getDoctorSchedule = async (req: Request, res: Response) => {
  try {
    const schedule = await getDoctorScheduleByDate(req.params.id, req.params.date);
    res.json(schedule || null);
  } catch (error) {
    console.error('Error fetching doctor schedule:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const removeSlot = async (req: Request, res: Response) => {
  try {
    if (req.user?.role !== UserRole.DOCTOR) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const { date, time } = req.body;
    const doctorId = req.user.id;

    if (!date || !time) {
      return res.status(400).json({ message: 'Date and time are required' });
    }

    const schedule = await removeSlotFromSchedule(doctorId, date, time);
    res.json(schedule);
  } catch (error) {
    console.error('Error removing slot:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const closeConsultations = async (req: Request, res: Response) => {
  try {
    if (req.user?.role !== UserRole.DOCTOR) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const { date } = req.body;
    const doctorId = req.user.id;

    if (!date) {
      return res.status(400).json({ message: 'Date is required' });
    }

    // 1. Check if there are any pending/confirmed appointments
    const Appointment = require('../models/Appointment').default;
    const { AppointmentStatus } = require('../constants/enums');
    
    const upcomingCount = await Appointment.countDocuments({
      doctorId,
      date,
      status: { $in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED] }
    });

    if (upcomingCount > 0) {
      return res.status(400).json({ message: 'Cannot close day while there are upcoming visits.' });
    }

    // 2. Remove all unbooked slots
    const schedule = await closeScheduleSlots(doctorId, date);

    res.json({ message: 'Consultations closed for the day', schedule });
  } catch (error) {
    console.error('Error closing consultations:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAnalytics = async (req: Request, res: Response) => {
  try {
    if (req.user?.role !== UserRole.DOCTOR) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const doctorId = req.user.id;
    const { filter, search, page, limit } = req.query; // 'today', 'weekly', 'monthly'
    
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 10;
    const searchQuery = (search as string) || '';

    let startDate = new Date();
    startDate.setHours(0, 0, 0, 0);

    let endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

    if (filter === 'weekly') {
      const day = startDate.getDay();
      const diff = startDate.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
      startDate.setDate(diff);
    } else if (filter === 'monthly') {
      startDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    }

    const Appointment = require('../models/Appointment').default;
    const { AppointmentStatus } = require('../constants/enums');

    const getLocalDateString = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };

    let appointments = await Appointment.find({
      doctorId,
      status: AppointmentStatus.COMPLETED,
      date: {
        $gte: getLocalDateString(startDate),
        $lte: getLocalDateString(endDate)
      }
    })
    .populate('patientId', 'name email phone age bloodGroup profileImage')
    .sort({ date: -1, time: -1 });

    const User = require('../models/User').default;
    const doctor = await User.findById(doctorId);
    const fee = doctor?.consultationFee || 0;

    const completedCount = appointments.length;
    const totalEarnings = completedCount * fee;

    // Apply Search
    if (searchQuery) {
      const lower = searchQuery.toLowerCase();
      appointments = appointments.filter((a: any) => {
        const p = a.patientId;
        return (p.name && p.name.toLowerCase().includes(lower)) || 
               (p.phone && p.phone.includes(lower));
      });
    }

    // Apply Pagination
    const totalPages = Math.ceil(appointments.length / limitNum);
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedAppointments = appointments.slice(startIndex, startIndex + limitNum);

    res.json({
      totalEarnings,
      completedCount,
      totalPages,
      currentPage: pageNum,
      appointments: paginatedAppointments
    });

  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

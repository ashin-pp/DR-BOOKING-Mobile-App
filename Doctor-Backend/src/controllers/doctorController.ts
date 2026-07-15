import { Request, Response } from 'express';
import User from '../models/User';
import { UserRole } from '../constants/enums';

export const getDoctors = async (req: Request, res: Response) => {
  try {
    const doctors = await User.find({ role: UserRole.DOCTOR }).select('-passwordHash');
    res.json(doctors);
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getDoctorById = async (req: Request, res: Response) => {
  try {
    const doctor = await User.findOne({ _id: req.params.id, role: UserRole.DOCTOR }).select('-passwordHash');
    
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    res.json(doctor);
  } catch (error) {
    console.error('Error fetching doctor details:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

import mongoose from 'mongoose';
import User from './src/models/User';
import Schedule from './src/models/Schedule';
import { UserRole } from './src/constants/enums';
import dotenv from 'dotenv';
dotenv.config();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/aarohcare');
    console.log('Connected to DB');
    
    const doctors = await User.find({ role: UserRole.DOCTOR }).select('-passwordHash').lean();
  
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const today = `${year}-${month}-${day}`;
    
    console.log('Today is', today);

    // Find all future schedules with at least one slot
    const activeSchedules = await Schedule.find({
      date: { $gte: today },
      'slots.0': { $exists: true }
    }).select('doctorId');
  
    console.log('Active schedules:', activeSchedules);

    const activeDoctorIds = new Set(activeSchedules.map(s => s.doctorId.toString()));
  
    const result = doctors.map(doc => ({
      ...doc,
      hasActiveSchedule: activeDoctorIds.has(doc._id.toString())
    }));

    console.log('Success! Result length:', result.length);
  } catch (e) {
    console.error('Error in logic:', e);
  } finally {
    process.exit(0);
  }
};

run();

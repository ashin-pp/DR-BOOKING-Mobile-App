import User from '../models/User';
import bcrypt from 'bcryptjs';
import { UserRole } from '../constants/enums';
import { IUser } from '../types';

export const findUserByEmail = async (email: string) => {
  return await User.findOne({ email });
};

export const createUser = async (userData: Partial<IUser>) => {
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(userData.password, salt);

  const newUser = new User({
    name: userData.name,
    email: userData.email,
    password: passwordHash,
    role: userData.role || UserRole.PATIENT,
    phone: userData.phone,
    ...(userData.role === UserRole.DOCTOR && {
      specialization: userData.specialization,
      experience: userData.experience,
      consultationFee: userData.consultationFee,
    }),
  });

  return await newUser.save();
};

export const validatePassword = async (password: string, hash: string) => {
  return await bcrypt.compare(password, hash);
};

import User from '../models/User';

import { IUser } from '../types';

export const getUserById = async (userId: string) => {
  return await User.findById(userId);
};

export const updateUserProfile = async (userId: string, updateData: Partial<IUser>) => {
  const user = await User.findById(userId);
  if (!user) return null;

  if (updateData.name !== undefined) user.name = updateData.name;
  if (updateData.phone !== undefined) user.phone = updateData.phone;
  if (updateData.age !== undefined) user.age = updateData.age;
  if (updateData.bloodGroup !== undefined) user.bloodGroup = updateData.bloodGroup;
  if (updateData.profileImage !== undefined) user.profileImage = updateData.profileImage;
  
  if (updateData.specialization !== undefined) user.specialization = updateData.specialization;
  if (updateData.experience !== undefined) user.experience = updateData.experience;
  if (updateData.consultationFee !== undefined) user.consultationFee = updateData.consultationFee;
  if (updateData.about !== undefined) user.about = updateData.about;

  return await user.save();
};

import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { updateUserProfile } from '../services/userService';
import cloudinary from '../config/cloudinary';

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    let updateData = { ...req.body };

    if (updateData.imageBase64) {
      try {
        const uploadResponse = await cloudinary.uploader.upload(updateData.imageBase64, {
          folder: 'doctor-booking-app/profiles'
        });
        updateData.profileImage = uploadResponse.secure_url;
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
        return res.status(500).json({ message: 'Failed to upload image' });
      }
      delete updateData.imageBase64;
    }

    const user = await updateUserProfile(userId, updateData);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

import { Request, Response } from 'express';
import { generateAccessToken, generateRefreshToken, verifyToken } from '../utils/jwtUtils';
import { findUserByEmail, createUser, validatePassword } from '../services/authService';

export const register = async (req: Request, res: Response) => {
  try {
    const existingUser = await findUserByEmail(req.body.email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const newUser = await createUser(req.body);

    const token = generateAccessToken(newUser._id.toString(), newUser.role);
    const refreshToken = generateRefreshToken(newUser._id.toString(), newUser.role);

    res.status(201).json({ token, refreshToken, user: newUser });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await validatePassword(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = generateAccessToken(user._id.toString(), user.role);
    const refreshToken = generateRefreshToken(user._id.toString(), user.role);

    res.json({
      token,
      refreshToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        age: user.age,
        bloodGroup: user.bloodGroup,
        specialization: user.specialization,
        experience: user.experience,
        consultationFee: user.consultationFee,
        about: user.about,
        profileImage: user.profileImage,
        hasActiveSchedule: user.hasActiveSchedule,
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const refresh = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token is required' });
    }

    try {
      const decoded = verifyToken(refreshToken);
      const token = generateAccessToken(decoded.id, decoded.role);

      res.json({ token });
    } catch (error) {
      return res.status(403).json({ message: 'Invalid or expired refresh token' });
    }
  } catch (error) {
    console.error('Refresh error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

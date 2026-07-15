import { Router } from 'express';
import { getDoctors, getDoctorById } from '../controllers/doctorController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// Protect doctor routes so only logged in users (patients/doctors) can view them
router.get('/', protect, getDoctors);
router.get('/:id', protect, getDoctorById);

export default router;

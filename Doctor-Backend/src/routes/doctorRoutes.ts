import { Router } from 'express';
import { getDoctors, getDoctorById, generateSchedule, getMySchedule, getDoctorSchedule, removeSlot, closeConsultations, getAnalytics } from '../controllers/doctorController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.get('/analytics', protect, getAnalytics);
router.post('/schedule', protect, generateSchedule);
router.post('/schedule/close', protect, closeConsultations);
router.delete('/schedule/slot', protect, removeSlot);
router.get('/schedule/me/:date', protect, getMySchedule);
router.get('/:id/schedule/:date', protect, getDoctorSchedule);

// Protect doctor routes so only logged in users (patients/doctors) can view them
router.get('/', protect, getDoctors);
router.get('/:id', protect, getDoctorById);

export default router;

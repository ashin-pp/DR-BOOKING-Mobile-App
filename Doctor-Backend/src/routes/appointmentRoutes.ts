import { Router } from 'express';
import { bookAppointment, getUserAppointments } from '../controllers/appointmentController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// Protect all appointment routes
router.use(protect);

router.post('/book', bookAppointment);
router.get('/', getUserAppointments); // Returns patient's or doctor's appts based on token role

export default router;

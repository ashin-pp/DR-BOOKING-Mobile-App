import { Router } from 'express';
import { bookAppointment, getUserAppointments, updateStatus } from '../controllers/appointmentController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// Protect all appointment routes
router.use(protect);

router.post('/book', bookAppointment);
router.get('/', getUserAppointments); // Returns patient's or doctor's appts based on token role
router.get('/doctor', getUserAppointments); // Alias for cached apps
router.patch('/:id/status', updateStatus);

export default router;

import { Router } from 'express';
import { updateProfile } from '../controllers/userController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.put('/profile', protect, updateProfile);

export default router;

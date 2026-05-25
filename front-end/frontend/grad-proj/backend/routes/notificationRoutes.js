import express from 'express';
import { getUnreadNotifications, markNotificationRead } from '../controllers/notificationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/unread', protect, getUnreadNotifications);
router.put('/:id/read', protect, markNotificationRead);

export default router;

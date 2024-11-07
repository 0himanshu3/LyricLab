import express from 'express';
import { verifyToken } from '../utils/verifyUser.js';
import {
  getnotifications,
  markasRead,
  getUnreadCount,
  getreminders,
  markreminder,
} from '../controllers/noti.controller.js';

const router = express.Router();

router.get('/getnoti/:id',verifyToken,getnotifications);
router.get('/getreminder/:id',verifyToken,getreminders);
router.get('/unreadcount/:userId',verifyToken,getUnreadCount);
router.patch('/markasread/:notificationId',verifyToken,markasRead);
router.patch('/mark-as-read',verifyToken,markreminder); //for reminders only
export default router;

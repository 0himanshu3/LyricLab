import express from 'express';
import { verifyToken } from '../utils/verifyUser.js';
import {
  getnotifications,
  markasRead,
  getUnreadCount,
} from '../controllers/noti.controller.js';

const router = express.Router();

router.get('/getnoti/:id',verifyToken,getnotifications);
router.get('/unreadcount/:userId',verifyToken,getUnreadCount);
router.patch('/markasread/:notificationId',verifyToken,markasRead);
export default router;

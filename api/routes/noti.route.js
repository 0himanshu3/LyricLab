import express from 'express';
import { verifyToken } from '../utils/verifyUser.js';
import {
  getnotifications,
} from '../controllers/noti.controller.js';

const router = express.Router();

router.get('/getnoti/:id',verifyToken,getnotifications);


export default router;

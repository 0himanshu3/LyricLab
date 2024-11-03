import {UserNotice} from "../models/notification.js";
import { errorHandler } from '../utils/error.js';
export const getnotifications = async (req, res, next) => {
    const { id } = req.params;
  
    try {
      const userNotice = await UserNotice.findOne({ userId: id }).populate('notifications.task');
  
      if (!userNotice) {
        return res.status(404).json({ message: 'No notifications found for this user' });
      }
  
      res.status(200).json(userNotice.notifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      next(error);
    }
  };
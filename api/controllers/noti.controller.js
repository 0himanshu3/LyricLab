import {UserNotice} from "../models/notification.js";
import { errorHandler } from '../utils/error.js';
export const getnotifications = async (req, res, next) => {
  const { id } = req.params;
  console.log(id);
  try {
      const userNotice = await UserNotice.findOne({ userId: id }).populate('notifications.task');
      console.log(userNotice);
      if (!userNotice) {
          return res.status(404).json({ message: 'No notifications found for this user' });
      }

      res.status(200).json(userNotice.notifications);
  } catch (error) {
      console.error('Error fetching notifications:', error);
      next(error);
  }
};

export const markasRead = async (req, res, next) => {
  const { notificationId } = req.params;
  const { userId } = req.body;

  try {
    const userNotice = await UserNotice.findOne({ userId });

    if (!userNotice) {
      return res.status(404).json({ message: 'User notifications not found' });
    }

    const notification = userNotice.notifications.id(notificationId);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Update the isRead property of the notification
    notification.isRead = true;

    await userNotice.save();

    res.status(200).json({ message: 'Notification marked as read' });
  } 
  catch (error) {
    console.error('Error marking notification as read:', error);
    next(error);
  }
};
export const getUnreadCount = async (req, res, next) => {
  const { userId } = req.params;
  
  try {
    const userNotice = await UserNotice.findOne({ userId }).populate('notifications.task');

    if (!userNotice) {
      return res.status(404).json({ count: 0 });
    }

    const unreadCount = userNotice.notifications.filter(notification => !notification.isRead).length;
    res.status(200).json({ count: unreadCount });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    next(error);
  }
};

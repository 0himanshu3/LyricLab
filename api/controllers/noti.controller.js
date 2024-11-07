import {UserNotice} from "../models/notification.js";
import { errorHandler } from '../utils/error.js';
import moment from 'moment';
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
export const getreminders = async (req, res, next) => {
  const { id } = req.params;
  console.log(id);
  try {
    const userNotice = await UserNotice.findOne({ userId: id }).populate('notifications.task');
    if (!userNotice) {
      return res.status(404).json({ message: 'No notifications found for this user' });
    }

    const currentDate = moment();  // Current date
    const oneDayReminders = [];  // Store one day reminders
    const oneWeekReminders = []; // Store one week reminders

    // Iterate through the notifications and check the reminder status
    for (let notification of userNotice.notifications) {
      const deadline = moment(notification.deadline); // Task deadline as a moment object

      // Calculate 1 day and 1 week before the task deadline
      const oneDayBefore = deadline.clone().subtract(1, 'days');
      const oneWeekBefore = deadline.clone().subtract(1, 'weeks');

      // Logic to handle reminders
      if (
        !notification.oneDayReminderSent && 
        currentDate.isSameOrAfter(oneDayBefore) && 
        currentDate.isBefore(deadline)
      ) {
        // Send 1 day before reminder if it's within the 1-day range
        notification.oneDayReminderSent = true;  // Update the reminder status
        oneDayReminders.push({ notificationId: notification._id, reminderType: 'oneDay' }); // Track the change
      } else if (
        !notification.oneWeekReminderSent &&
        currentDate.isSameOrAfter(oneWeekBefore) && 
        currentDate.isBefore(deadline)
      ) {
        // Send 1 week before reminder if it's within the 1-week range
        notification.oneWeekReminderSent = true;  // Update the reminder status
        oneWeekReminders.push({ notificationId: notification._id, reminderType: 'oneWeek' }); // Track the change
      }
    }
    console.log(oneWeekReminders);
    if (oneDayReminders.length > 0 || oneWeekReminders.length > 0) {
      // Update the notifications in the database
      const updatePromises = [...oneDayReminders, ...oneWeekReminders].map(async (reminder) => {
        if (reminder.reminderType === 'oneDay') {
          await UserNotice.updateOne(
            { userId: id, 'notifications._id': reminder.notificationId },
            { $set: { 'notifications.$.oneDayReminderSent': true } }
          );
        } else if (reminder.reminderType === 'oneWeek') {
          await UserNotice.updateOne(
            { userId: id, 'notifications._id': reminder.notificationId },
            { $set: { 'notifications.$.oneWeekReminderSent': true } }
          );
        }
      });

      // Wait for all updates to finish
      await Promise.all(updatePromises);
    }

    res.status(200).json({ oneDayReminders, oneWeekReminders }); // Send the two arrays back to the client
  } catch (error) {
    console.error('Error fetching reminders:', error);
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

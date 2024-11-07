import {UserNotice} from "../models/notification.js";
import { errorHandler } from '../utils/error.js';
import moment from 'moment';
//Get all notifications
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
// this function is to Mark reminder so that is doesnt display next time you come
export const markreminder = async (req, res, next) => {
  const { id, type } = req.body;
  try {
    if (type === 'oneDay') {
      await UserNotice.updateOne(
        { 'notifications._id': id },
        { $set: { 'notifications.$.oneDayReminderRead': true } }
      );
    } else if (type === 'oneWeek') {
      await UserNotice.updateOne(
        { 'notifications._id': id },
        { $set: { 'notifications.$.oneWeekReminderRead': true } }
      );
    } 
    
    res.status(200).json({ message: 'Marked as read successfully' });
  } catch (error) {
    console.error('Error marking as read:', error);
    next(error);
  }
};
// Get all the reminders of task that were 1 day or 1 week from current date
export const getreminders = async (req, res, next) => {
  const { id } = req.params;
  try {
    const userNotice = await UserNotice.findOne({ userId: id }).populate('notifications.task');
    if (!userNotice) {
      return res.status(404).json({ message: 'No notifications found for this user' });
    }

    const currentDate = moment(); // Current date
    const oneDayReminders = [];  // Store one day reminders with additional details
    const oneWeekReminders = []; // Store one week reminders with additional details

    for (let notification of userNotice.notifications) {
      const deadline = moment(notification.deadline);

      // Calculate 1 day and 1 week before the task deadline
      const oneDayBefore = deadline.clone().subtract(1, 'days');
      const oneWeekBefore = deadline.clone().subtract(1, 'weeks');

      // 1 day reminder 
      if (
        !notification.oneDayReminderRead &&
        currentDate.isSameOrAfter(oneDayBefore) &&
        currentDate.isBefore(deadline)
      ) {
        oneDayReminders.push({
          notificationId: notification._id,
          text: notification.text,
          createdAt: notification.createdAt,
          deadline: notification.deadline,
          reminderType: 'oneDay',
        });
      }

      // 1 week reminder 
      else if (
        !notification.oneWeekReminderRead &&
        currentDate.isSameOrAfter(oneWeekBefore) &&
        currentDate.isBefore(deadline)
      ) {
        oneWeekReminders.push({
          notificationId: notification._id,
          text: notification.text,
          createdAt: notification.createdAt,
          deadline: notification.deadline,
          reminderType: 'oneWeek',
        });
      }
    }


    res.status(200).json({ oneDayReminders, oneWeekReminders });
  } catch (error) {
    console.error('Error fetching reminders:', error);
    next(error);
  }
};

//Mark notifications as read
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

//Get the total unread count of notifications including reminders
export const getUnreadCount = async (req, res, next) => {
  const { userId } = req.params;

  try {
    const userNotice = await UserNotice.findOne({ userId }).populate('notifications.task');

    if (!userNotice) {
      return res.status(404).json({ count: 0 });
    }

    const currentDate = moment(); // Current date
    let unreadCount = 0;

    // Count unread notifications
    unreadCount += userNotice.notifications.filter(notification => !notification.isRead).length;

    

    // Iterate through notifications to check reminder status
    for (let notification of userNotice.notifications) {
      const deadline = moment(notification.deadline);

      // Calculate 1 day and 1 week before the task deadline
      const oneDayBefore = deadline.clone().subtract(1, 'days');
      const oneWeekBefore = deadline.clone().subtract(1, 'weeks');

      // 1 day reminder logic
      if (
        !notification.oneDayReminderRead &&
        currentDate.isSameOrAfter(oneDayBefore) &&
        currentDate.isBefore(deadline)
      ) {
        unreadCount++;
      }

      // 1 week reminder logic
      else if (
        !notification.oneWeekReminderRead &&
        currentDate.isSameOrAfter(oneWeekBefore) &&
        currentDate.isBefore(deadline)
      ) {
        unreadCount++;
      }
    }


    // Return the total unread count
    res.status(200).json({ count: unreadCount });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    next(error);
  }
};


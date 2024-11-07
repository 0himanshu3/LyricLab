import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import {useNavigate} from 'react-router-dom';
const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [oneDayReminders, setOneDayReminders] = useState([]);
  const [oneWeekReminders, setOneWeekReminders] = useState([]);
  const user = useSelector((state) => state.user);
  const id = user.currentUser?._id;


  useEffect(() => {
    //fetch notifications
    const fetchNotifications = async () => {
      try {
        const response = await axios.get(`/api/noti/getnoti/${id}`);
        setNotifications(response.data);

        const { data: remindersData } = await axios.get(`/api/noti/getreminder/${id}`);
        setOneDayReminders(remindersData.oneDayReminders);
        setOneWeekReminders(remindersData.oneWeekReminders);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    if (id) {
      fetchNotifications();
    }
  }, [id]);
  //mark notifications as read
  const markNotificationAsRead = async (notificationId) => {
    try {
      await axios.patch(`/api/noti/markasread/${notificationId}`, { userId: id });
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notification._id === notificationId ? { ...notification, isRead: true } : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };


  //mark reminder as read
  const markReminderAsRead = async (reminderId, type) => {
    try {
      await axios.patch(`/api/noti/mark-as-read`, { id: reminderId, type });
      if (type === 'oneDay') {
        setOneDayReminders((prev) => prev.filter((reminder) => reminder._id !== reminderId));
      } else if (type === 'oneWeek') {
        setOneWeekReminders((prev) => prev.filter((reminder) => reminder._id !== reminderId));
      }
     
    navigate(0);  // To refresh the page as now the reminders have been updated
    } catch (error) {
      console.error('Error marking reminder as read:', error);
    }
  };

  const unreadCount = 
  notifications.filter((notification) => !notification.isRead).length + 
  oneDayReminders.filter((reminder) => !reminder.isRead).length + 
  oneWeekReminders.filter((reminder) => !reminder.isRead).length;

  const renderReminderList = (reminders, color, title) => (
    reminders.length > 0 && (
      <div className={`bg-${color}-100 p-4 mb-4 shadow rounded-lg`}>
        <h2 className={`text-lg font-semibold text-${color}-600 mb-2`}>{title}</h2>
        <ul className="divide-y divide-gray-200">
          {reminders.map((reminder) => (
            <li key={reminder.notificationId} className={`p-4 bg-${color}-200`}>
              <h3 className="text-black font-medium">{reminder.text}</h3>
              <p className="text-gray-500 text-sm">
                Deadline: {new Date(reminder.deadline).toLocaleString()}
              </p>
              <button
                onClick={() => markReminderAsRead(reminder.notificationId, color === 'yellow' ? 'oneDay' : 'oneWeek')}
                className="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Mark as Read
              </button>
            </li>
          ))}
        </ul>
      </div>
    )
  );

  const renderNotificationList = () => (
    notifications.length > 0 ? (
      notifications.reverse().map((notification) => (
        <li
          key={notification._id} // Ensure the key is attached here too
          className={`p-4 transition duration-200 ${notification.isRead ? 'bg-slate-300' : 'bg-blue-200'}`}
        >
          <h2 className="text-black font-medium">{notification.text}</h2>
          <p className="text-gray-500 text-sm">
            Created at: {new Date(notification.createdAt).toLocaleString()}
          </p>
          {!notification.isRead && (
            <button
              onClick={() => markNotificationAsRead(notification._id)}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Mark as Read
            </button>
          )}
        </li>
      ))
    ) : (
      <li className="p-4 text-gray-500">No notifications available.</li>
    )
  );

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">Notifications</h1>
      <p className="text-purple-400 mb-2">Total Unread Notifications: {unreadCount}</p>

      {/* Separate sections for one-day and one-week reminders */}
      {renderReminderList(oneDayReminders, 'yellow', 'Reminders: 1 Day Left')}
      {renderReminderList(oneWeekReminders, 'blue', 'Reminders: 1 Week Left')}

      {/* Notifications Section */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <ul className="divide-y divide-gray-200">
          {renderNotificationList()}
        </ul>
      </div>
    </div>
  );
};

export default Notifications;

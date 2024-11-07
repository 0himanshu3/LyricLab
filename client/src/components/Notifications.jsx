import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [oneDayReminders, setOneDayReminders] = useState([]);
  const [oneWeekReminders, setOneWeekReminders] = useState([]);
  const user = useSelector((state) => state.user);
  const id = user.currentUser?._id;

  // Fetch notifications and reminders
  useEffect(() => {
    if (id) {
      const fetchData = async () => {
        try {
          const notificationsResponse = await axios.get(`/api/noti/getnoti/${id}`);
          setNotifications(notificationsResponse.data);

          const remindersResponse = await axios.get(`/api/noti/getreminder/${id}`);
          const { oneDayReminders, oneWeekReminders } = remindersResponse.data;
          setOneDayReminders(oneDayReminders);
          setOneWeekReminders(oneWeekReminders);
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };
      fetchData();
    }
  }, [id]);

  // Mark notification/reminder as read
  const markAsRead = (id, type) => {
    if (type === 'reminder') {
      setOneDayReminders(prev => prev.filter(reminder => reminder._id !== id));
      setOneWeekReminders(prev => prev.filter(reminder => reminder._id !== id));
    } else {
      setNotifications(prev => prev.filter(notification => notification._id !== id));
    }
  };

  const unreadCount = notifications.filter(notification => !notification.isRead).length;

  const renderReminderList = (reminders, color, title) => (
    reminders.length > 0 && (
      <div className={`bg-${color}-100 p-4 mb-4 shadow rounded-lg`}>
        <h2 className={`text-lg font-semibold text-${color}-600 mb-2`}>{title}</h2>
        <ul className="divide-y divide-gray-200">
          {reminders.map(reminder => (
            <li key={reminder._id} className={`p-4 bg-${color}-200`}>
              <h3 className="text-black font-medium">{reminder.text}</h3>
              <p className="text-gray-500 text-sm">
                Deadline: {new Date(reminder.deadline).toLocaleString()}
              </p>
              <button
                onClick={() => markAsRead(reminder._id, 'reminder')}
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
      notifications.reverse().map(notification => (
        <li
          key={notification._id}
          className={`p-4 transition duration-200 ${notification.isRead ? 'bg-slate-300' : 'bg-blue-200'}`}
        >
          <h2 className="text-black font-medium">{notification.text}</h2>
          <p className="text-gray-500 text-sm">
            Created at: {new Date(notification.createdAt).toLocaleString()}
          </p>
          {!notification.isRead && (
            <button
              onClick={() => markAsRead(notification._id, 'notification')}
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

      {renderReminderList(oneDayReminders, 'yellow', '1 Day Left Reminders')}
      {renderReminderList(oneWeekReminders, 'blue', '1 Week Left Reminders')}

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <ul className="divide-y divide-gray-200">
          {renderNotificationList()}
        </ul>
      </div>
    </div>
  );
};

export default Notifications;

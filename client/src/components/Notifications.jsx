import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const user = useSelector((state) => state.user);
  const id = user.currentUser?._id; 

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get(`/api/noti/getnoti/${id}`);
        setNotifications(response.data);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    if (id) {
      fetchNotifications();
    }
  }, [id]);

  const markAsRead = async (notificationId) => {
    try {
      await axios.patch(`/api/noti/markasread/${notificationId}`, {
        userId: id,
      });
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notification._id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const unreadCount = notifications.filter((notification) => !notification.isRead).length;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">Notifications</h1>
      <p className="text-purple-400 mb-2">Total Unread Notifications: {unreadCount}</p>
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <ul className="divide-y divide-gray-200">
          {notifications.length > 0 ? (
            notifications
              .reverse()
              .map((notification) => (
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
                      onClick={() => markAsRead(notification._id)}
                      className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Mark as Read
                    </button>
                  )}
                </li>
              ))
          ) : (
            <li className="p-4 text-gray-500">No notifications available.</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Notifications;

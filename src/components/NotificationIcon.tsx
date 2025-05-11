import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Bell } from 'lucide-react';

interface Notification {
  id: string;
  message: string;
  createdAt: string;
  isRead: boolean;
}

interface Props {
  userId: string;
}

const NotificationIcon: React.FC<Props> = ({ userId }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {

    // Simulated response instead of calling API
  const testData: Notification[] = [
    {
      id: '1',
      message: 'Your property listing has been approved.',
      createdAt: new Date().toISOString(),
      isRead: false,
    },
    {
      id: '2',
      message: 'New message received from a potential buyer.',
      createdAt: new Date(Date.now() - 3600 * 1000).toISOString(), // 1 hour ago
      isRead: false,
    },
    {
      id: '3',
      message: 'Your property has received 5 new views.',
      createdAt: new Date(Date.now() - 86400 * 1000).toISOString(), // 1 day ago
      isRead: true,
    },
  ];

  setNotifications(testData);
  setUnreadCount(testData.filter((n) => !n.isRead).length);
};
    /*try {
      const response = await axios.get(`/api/notifications/${userId}`);
      const all = response.data;
      setNotifications(all);
      setUnreadCount(all.filter((n: Notification) => !n.isRead).length);
    } catch (error) {
      console.error("Error fetching notifications", error);
    }
  };*/

  const toggleDropdown = async () => {
    if (!showDropdown) {
      await fetchNotifications();
    }
    setShowDropdown((prev) => !prev);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = (notification: Notification) => {
    alert(`Opening notification: ${notification.message}`);
    setShowDropdown(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="flex items-center gap-1 px-3 py-2 border border-blue-500 text-blue-600 hover:bg-blue-50 rounded-md relative"
      >
        <Bell className="w-5 h-5 text-blue-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full px-1.5">
            {unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white border rounded-md shadow-xl z-50">
          <div className="p-3 max-h-64 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className="p-2 border-b text-sm hover:bg-gray-100 transition cursor-pointer"
                  onClick={() => handleNotificationClick(n)}
                >
                  <p>{n.message}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-500 text-center">No notifications</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationIcon;
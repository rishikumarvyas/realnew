import React, { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface Notification {
  notificationId: string;
  message: string;
  isRead: boolean;
  createdDt: string;
}

interface NotificationResponse {
  statusCode: number;
  message: string;
  messageId?: string;
  userId?: string;
  propertyId?: string;
  notifications: Notification[];
}

const NotificationIcon: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const BASE_URL = "https://homeyatraapi.azurewebsites.net";

  useEffect(() => {
    if (user) {
      console.log('User object available:', user);
    }
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) {
      console.warn('User object or credentials missing:', user);
    setNotifications([]);
    setUnreadCount(0);
    return;
  }

    const userId = user.userId;
    if (!userId) {
      console.warn('No user ID found in user object:', user);
      useMockData();
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/Notification/GetUserNotifications?userId=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error response:', errorText);
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data: NotificationResponse = await response.json();

      if (data.statusCode === 200 && data.notifications) {
        setNotifications(data.notifications);
        setUnreadCount(data.notifications.filter(n => !n.isRead).length);
      } else {
        useMockData();
      }
    } catch (error) {
      console.error("Error fetching notifications", error);
      toast({
        title: "Failed to load notifications",
        description: "Please try again later",
        variant: "destructive",
      });
      useMockData();
    } finally {
      setIsLoading(false);
    }
  };

  const useMockData = () => {
    const testData: Notification[] = [
      {
        notificationId: '1',
        message: 'Your property listing has been approved.',
        createdDt: new Date().toISOString(),
        isRead: false,
      },
      {
        notificationId: '2',
        message: 'New message received from a potential buyer.',
        createdDt: new Date(Date.now() - 3600 * 1000).toISOString(),
        isRead: false,
      },
      {
        notificationId: '3',
        message: 'Your property has received 5 new views.',
        createdDt: new Date(Date.now() - 86400 * 1000).toISOString(),
        isRead: true,
      },
    ];

    setNotifications(testData);
    setUnreadCount(testData.filter(n => !n.isRead).length);
  };

  const toggleDropdown = async () => {
    if (!showDropdown) {
      await fetchNotifications();
    }
    setShowDropdown(prev => !prev);
  };

  const updateNotificationState = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(n =>
        n.notificationId === notificationId
          ? { ...n, isRead: true }
          : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAsRead = async (notificationId: string) => {
    if (!user || !user.userId || !user.token) {
      updateNotificationState(notificationId);
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/api/Notification/MarkAsRead`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type:'user',
          userId: user.userId,
          notificationId: notificationId,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Mark as read error response:', errorText);
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      updateNotificationState(notificationId);
    } catch (error) {
      console.error("Error marking notification as read", error);
      updateNotificationState(notificationId);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const tryAlternateEndpoint = async (userId: string, token: string) => {
    try {
      const alternateResponse = await fetch(`${BASE_URL}/api/Notification/GetNotifications?userId=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (alternateResponse.ok) {
        const data = await alternateResponse.json();
        if (data.notifications) {
          setNotifications(data.notifications);
          setUnreadCount(data.notifications.filter((n: Notification) => !n.isRead).length);
          return true;
        }
      }
    } catch (error) {
      console.log('Alternate endpoint also failed');
    }
    return false;
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return !isNaN(date.getTime())
        ? date.toLocaleString()
        : "Unknown date";
    } catch {
      return "Unknown date";
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.notificationId);
    }

    toast({
      title: "Notification",
      description: notification.message,
    });

    setShowDropdown(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        onClick={toggleDropdown}
        variant="outline"
        size="icon"
        className="relative rounded-full h-10 w-10 flex items-center justify-center border border-gray-200 hover:bg-blue-50 hover:text-blue-600"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full px-1.5 flex items-center justify-center min-w-[20px] h-5">
            {unreadCount}
          </span>
        )}
      </Button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white border rounded-md shadow-xl z-50">
          <div className="p-2 border-b bg-gradient-to-r from-blue-50 to-blue-100">
            <h3 className="font-medium text-blue-800">Notifications</h3>
          </div>

          {isLoading ? (
            <div className="p-4 text-center">
              <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mb-2"></div>
              <p className="text-sm text-gray-500">Loading notifications...</p>
            </div>
          ) : (
            <div className="max-h-64 overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div
                    key={notification.notificationId}
                    className={`p-3 border-b text-sm cursor-pointer transition-colors ${notification.isRead ? 'bg-white hover:bg-gray-50' : 'bg-blue-50 hover:bg-blue-100'}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <p className={notification.isRead ? 'text-gray-700' : 'font-medium text-gray-900'}>
                      {notification.message}
                    </p>
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-xs text-gray-500">{formatDate(notification.createdDt)}</p>
                      {!notification.isRead && (
                        <span className="text-xs bg-blue-600 text-white px-1.5 py-0.5 rounded-full">
                          New
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center">
                  <p className="text-sm text-gray-500">No notifications</p>
                </div>
              )}
            </div>
          )}

          {notifications.length > 0 && (
            <div className="p-2 border-t text-center">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-blue-600 hover:text-blue-800"
                onClick={() => setShowDropdown(false)}
              >
                Close
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationIcon;

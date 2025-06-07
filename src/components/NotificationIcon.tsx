import React, { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import axiosInstance from "../axiosCalls/axiosInstance";

interface Notification {
  notificationId: string;
  message: string;
  isRead: boolean;
  createdDt: string;
  propertyId?: string;
}

interface NotificationResponse {
  statusCode: number;
  message: string;
  messageId?: string;
  userId?: string;
  propertyId?: string;
  notifications: Notification[];
}

// Interface for the mark as read request body
interface MarkAsReadRequest {
  notificationId: string;
}

// Interface for creating a new notification
interface CreateNotificationRequest {
  message: string;
  propertyId?: string;
}

const NotificationIcon: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      console.log('User object available:', user);
    }
  }, [user]);

  const createNotification = async (message: string, propertyId?: string) => {
    if (!user || !user.userId) {
      console.warn('No user available for creating notification');
      return false;
    }

    try {
      const payload: CreateNotificationRequest = {
        message: message
      };

      // Add propertyId for property notifications
      if (propertyId!= null) {
        payload.propertyId = propertyId;
      }

      console.log('Creating notification with payload:', payload);

      const response = await axiosInstance.post('/api/Notification/CreateNotification', payload);

      if (response.status === 200 || response.status === 201) {
        console.log('Notification created successfully');
        
        // Refresh notifications to show the new one
        await fetchNotifications();
        
        toast({
          title: "Success",
          description: "Notification created successfully",
        });
        
        return true;
      }
    } catch (error: any) {
      console.error("Error creating notification:", error);
      
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
      }
      
      toast({
        title: "Error",
        description: "Failed to create notification",
        variant: "destructive",
      });
      
      return false;
    }
  };

  const fetchNotifications = async () => {
    if (!user) {
      useMockData();
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
      // Use the single GetNotifications endpoint
      const response = await axiosInstance.get(`/api/Notification/GetNotifications`);

      if (response.status === 200 && response.data.notifications) {
        const allNotifications: Notification[] = response.data.notifications;
        
        // Sort notifications by date (newest first)
        allNotifications.sort((a, b) => new Date(b.createdDt).getTime() - new Date(a.createdDt).getTime());

        setNotifications(allNotifications);
        setUnreadCount(allNotifications.filter(n => !n.isRead).length);
      } else {
        console.warn('No notifications found in response');
        useMockData();
      }

    } catch (error: any) {
      console.error('Error fetching notifications:', error);
      
      toast({
        title: "Failed to load notifications",
        description: "Unable to fetch notifications. Please try again later.",
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
        propertyId: 'property1'
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
        propertyId: 'property1'
      },
      {
        notificationId: '4',
        message: 'Profile updated successfully.',
        createdDt: new Date(Date.now() - 172800 * 1000).toISOString(),
        isRead: true,
      },
    ];

    // Sort by date (newest first)
    testData.sort((a, b) => new Date(b.createdDt).getTime() - new Date(a.createdDt).getTime());

    setNotifications(testData);
    setUnreadCount(testData.filter(n => !n.isRead).length);
  };

  const toggleDropdown = async () => {
    setShowDropdown(prev => {
      const newValue = !prev;
  
      // If we're about to open the dropdown, fetch notifications
      if (newValue) {
        setIsLoading(true);
        fetchNotifications();
      }
  
      return newValue;
    });
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
    if (!user || !user.userId) {
      updateNotificationState(notificationId);
      return;
    }

    try {
      // Create payload based on the API schema
      const payload: MarkAsReadRequest = {
        notificationId: notificationId,
      };
      
      console.log('Sending payload:', payload); // Debug log

      const response = await axiosInstance.put('/api/Notification/MarkAsRead', payload);

      if (response.status === 200) {
        updateNotificationState(notificationId);
        console.log('Notification marked as read successfully');
      }
    } catch (error: any) {
      console.error("Error marking notification as read:", error);
      
      // Log the response data for debugging
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        console.error("Response headers:", error.response.headers);
      }
      
      // Still update UI even if API call fails
      updateNotificationState(notificationId);
      
      // Show error toast for API failures
      toast({
        title: "Warning",
        description: "Notification marked as read locally, but failed to sync with server",
        variant: "destructive",
      });
    }
  };

  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter(n => !n.isRead);
    
    if (unreadNotifications.length === 0) return;

    // Update UI immediately
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);

    // Try to update on server
    if (user && user.userId) {
      try {
        await Promise.all(
          unreadNotifications.map(notification => {
            const payload: MarkAsReadRequest = {
              notificationId: notification.notificationId,
            };
            
            return axiosInstance.put('/api/Notification/MarkAsRead', payload);
          })
        );
      } catch (error) {
        console.error("Error marking all notifications as read:", error);
        toast({
          title: "Warning",
          description: "Some notifications failed to sync with server",
          variant: "destructive",
        });
      }
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

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Unknown date";
      
      const now = new Date();
      const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
      
      if (diffInHours < 1) {
        return "Just now";
      } else if (diffInHours < 24) {
        return `${Math.floor(diffInHours)} hours ago`;
      } else if (diffInHours < 48) {
        return "Yesterday";
      } else {
        return date.toLocaleDateString();
      }
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
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </Button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white border rounded-md shadow-xl z-50">
          <div className="p-3 border-b bg-gradient-to-r from-blue-50 to-blue-100">
            <div className="flex justify-between items-center">
              <h3 className="font-medium text-blue-800">All Notifications</h3>
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-green-600 hover:text-green-800"
                  onClick={() => createNotification("Test notification created", "user")}
                >
                  + Test
                </Button>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-blue-600 hover:text-blue-800"
                    onClick={markAllAsRead}
                  >
                    Mark all read
                  </Button>
                )}
              </div>
            </div>
            {notifications.length > 0 && (
              <p className="text-xs text-blue-600 mt-1">
                {unreadCount} unread of {notifications.length} total
              </p>
            )}
          </div>

          {isLoading ? (
            <div className="p-4 text-center">
              <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mb-2"></div>
              <p className="text-sm text-gray-500">Loading notifications...</p>
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div
                    key={notification.notificationId}
                    className={`p-3 border-b text-sm cursor-pointer transition-colors ${
                      notification.isRead 
                        ? 'bg-white hover:bg-gray-50' 
                        : 'bg-blue-50 hover:bg-blue-100'
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <p className={notification.isRead ? 'text-gray-700' : 'font-medium text-gray-900'}>
                      {notification.message}
                    </p>
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-xs text-gray-500">{formatDate(notification.createdDt)}</p>
                        {!notification.isRead && (
                          <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                        )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500 mb-1">No notifications yet</p>
                  <p className="text-xs text-gray-400">When you have notifications, they'll appear here</p>
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
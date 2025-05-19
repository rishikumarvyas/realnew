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
  notificationType?: 'user' | 'property';
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
  const [notificationType, setNotificationType] = useState<'user' | 'property'>('user');
  // Add propertyId state if you need to support property notifications
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      console.log('User object available:', user);
    }
  }, [user]);

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
      let endpoint: string;
      
      if (notificationType === 'user') {
        // For user notifications, only userId is needed
        endpoint = `/api/Notification/GetUserNotifications?userId=${userId}`;
      } else {
        // For property notifications, both userId and propertyId are required
        if (!selectedPropertyId) {
          // If no property is selected, show error or fetch all user's properties
          toast({
            title: "Property Required",
            description: "Please select a property to view property notifications",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
        endpoint = `/api/Notification/GetPropertyNotifications?userId=${userId}&propertyId=${selectedPropertyId}`;
      }
      
      console.log('Fetching from endpoint:', endpoint);
      const response = await axiosInstance.get(endpoint);

      if (response.status === 200 && response.data.notifications) {
        const notificationsWithType = response.data.notifications.map((n: Notification) => ({
          ...n,
          notificationType
        }));
        
        setNotifications(notificationsWithType);
        setUnreadCount(notificationsWithType.filter(n => !n.isRead).length);
      } else {
        console.warn('Unexpected response structure:', response.data);
        useMockData();
      }
    } catch (error: any) {
      console.error(`Error fetching ${notificationType} notifications:`, error);
      
      // Log more details about the error
      if (error.response) {
        console.error('Error status:', error.response.status);
        console.error('Error data:', error.response.data);
      }
      
      toast({
        title: "Failed to load notifications",
        description: `Unable to fetch ${notificationType} notifications. Please try again later.`,
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
        notificationType: 'property',
        propertyId: 'property1'
      },
      {
        notificationId: '2',
        message: 'New message received from a potential buyer.',
        createdDt: new Date(Date.now() - 3600 * 1000).toISOString(),
        isRead: false,
        notificationType: 'user'
      },
      {
        notificationId: '3',
        message: 'Your property has received 5 new views.',
        createdDt: new Date(Date.now() - 86400 * 1000).toISOString(),
        isRead: true,
        notificationType: 'property',
        propertyId: 'property1'
      },
    ];

    const filteredData = testData.filter(n => n.notificationType === notificationType);
    setNotifications(filteredData);
    setUnreadCount(filteredData.filter(n => !n.isRead).length);
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

  const markAsRead = async (notificationId: string, propertyId?: string) => {
    if (!user || !user.userId) {
      updateNotificationState(notificationId);
      return;
    }

    try {
      const payload: any = {
        userId: user.userId,
        notificationId: notificationId,
      };
      
      // Add propertyId to payload if it exists
      if (propertyId) {
        payload.propertyId = propertyId;
      }

      const response = await axiosInstance.put('/api/Notification/MarkAsRead', payload);

      if (response.status === 200) {
        updateNotificationState(notificationId);
      }
    } catch (error: any) {
      console.error("Error marking notification as read:", error);
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
      return !isNaN(date.getTime())
        ? date.toLocaleString()
        : "Unknown date";
    } catch {
      return "Unknown date";
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.notificationId, notification.propertyId);
    }

    toast({
      title: "Notification",
      description: notification.message,
    });

    setShowDropdown(false);
  };

  const handleNotificationTypeChange = async (type: 'user' | 'property') => {
    setNotificationType(type);
    // Reset notifications when changing type
    setNotifications([]);
    setUnreadCount(0);
    // Fetch new notifications for the selected type
    await fetchNotifications();
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
            <div className="flex justify-between items-center">
              <h3 className="font-medium text-blue-800">Notifications</h3>
              <div className="flex space-x-1">
                <Button
                  variant={notificationType === 'user' ? 'default' : 'outline'}
                  size="sm"
                  className="text-xs"
                  onClick={() => handleNotificationTypeChange('user')}
                >
                  User
                </Button>
                <Button
                  variant={notificationType === 'property' ? 'default' : 'outline'}
                  size="sm"
                  className="text-xs"
                  onClick={() => handleNotificationTypeChange('property')}
                >
                  Property
                </Button>
              </div>
            </div>
            
            {notificationType === 'property' && (
              <div className="mt-2">
                <select
                  value={selectedPropertyId}
                  onChange={(e) => setSelectedPropertyId(e.target.value)}
                  className="w-full text-xs border rounded px-2 py-1"
                >
                  <option value="">Select a property...</option>
                  {/* You'll need to populate this with actual property options */}
                  <option value="property1">Property 1</option>
                  <option value="property2">Property 2</option>
                </select>
              </div>
            )}
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
                      <div className="flex items-center space-x-1">
                        {notification.notificationType === 'property' && (
                          <span className="text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded-full">
                            Property
                          </span>
                        )}
                        {!notification.isRead && (
                          <span className="text-xs bg-blue-600 text-white px-1.5 py-0.5 rounded-full">
                            New
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center">
                  <p className="text-sm text-gray-500">
                    {notificationType === 'property' && !selectedPropertyId 
                      ? 'Select a property to view notifications'
                      : 'No notifications'
                    }
                  </p>
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
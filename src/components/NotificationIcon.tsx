import React, { useState, useRef, useEffect } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface Notification {
  notificationId: string;
  message: string;
  isRead: boolean;
  createdDt: string;
  propertyId?: string;
  notificationType?: "user" | "property";
}

const NotificationIcon: React.FC = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { 
    user, 
    notifications, 
    unreadCount, 
    fetchNotifications,
    refreshNotifications,
    markNotificationAsRead 
  } = useAuth();

  // Add effect to log notifications changes
  useEffect(() => {
    
  }, [notifications, unreadCount]);

  useEffect(() => {
    if (user) {
      
      
      // Set up periodic refresh of notifications every 30 seconds
      const interval = setInterval(() => {
        refreshNotifications();
      }, 30000); // 30 seconds

      return () => clearInterval(interval);
    }
  }, [user, refreshNotifications]);

  const toggleDropdown = async () => {
    if (!showDropdown) {
      setIsLoading(true);
      await fetchNotifications();
      setIsLoading(false);
    }
    setShowDropdown((prev) => !prev);
  };

  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter((n) => !n.isRead);

    if (unreadNotifications.length === 0) return;

    // Mark all as read using the centralized function
    try {
      await Promise.all(
        unreadNotifications.map((notification) =>
          markNotificationAsRead(
            notification.notificationId,
            notification.notificationType,
            notification.propertyId
          )
        )
      );
    } catch (error) {

      toast({
        title: "Warning",
        description: "Some notifications failed to sync with server",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
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

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      await markNotificationAsRead(
        notification.notificationId,
        notification.notificationType,
        notification.propertyId,
      );
    }

    toast({
      title: "Notification",
      description: notification.message,
    });

    setShowDropdown(false);
  };

  return (
    <div className="relative w-full sm:w-auto" ref={dropdownRef}>
      <Button
        onClick={toggleDropdown}
        variant="outline"
        size="icon"
        className="relative rounded-full h-10 w-10 sm:h-10 sm:w-10 flex items-center justify-center border border-gray-200 hover:bg-blue-50 hover:text-blue-600 mx-auto sm:mx-0"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full px-1.5 flex items-center justify-center min-w-[20px] h-5">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </Button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] max-w-80 bg-white border rounded-md shadow-xl z-50 sm:right-0 sm:left-auto left-1/2 transform -translate-x-1/2 sm:transform-none sm:w-80 max-h-[calc(100vh-8rem)] overflow-hidden">
          <div className="p-3 border-b bg-gradient-to-r from-blue-50 to-blue-100">
            <div className="flex justify-between items-center">
              <h3 className="font-medium text-blue-800">All Notifications</h3>
              <div className="flex space-x-2">
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
            <div className="max-h-[calc(100vh-12rem)] overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div
                    key={notification.notificationId}
                    className={`p-3 border-b text-sm cursor-pointer transition-colors ${
                      notification.isRead
                        ? "bg-white hover:bg-gray-50"
                        : "bg-blue-50 hover:bg-blue-100"
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <p
                      className={
                        notification.isRead
                          ? "text-gray-700"
                          : "font-medium text-gray-900"
                      }
                    >
                      {notification.message}
                    </p>
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-xs text-gray-500">
                        {formatDate(notification.createdDt)}
                      </p>
                      <div className="flex items-center space-x-1">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            notification.notificationType === "property"
                              ? "bg-green-100 text-green-800"
                              : "bg-purple-100 text-purple-800"
                          }`}
                        >
                          {notification.notificationType === "property"
                            ? "Property"
                            : "User"}
                        </span>
                        {!notification.isRead && (
                          <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500 mb-1">
                    No notifications yet
                  </p>
                  <p className="text-xs text-gray-400">
                    When you have notifications, they'll appear here
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

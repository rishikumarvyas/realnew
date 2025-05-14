import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Check, Bell, AlertTriangle, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface Notification {
  notificationId: string;
  message: string;
  isRead: boolean;
  createdDt: string;
}

interface PropertyNotification extends Notification {
  propertyId: string;
}

const Notifications = () => {
  const [userNotifications, setUserNotifications] = useState<Notification[]>([]);
  const [propertyNotifications, setPropertyNotifications] = useState<PropertyNotification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const BASE_URL = "https://homeyatraapi.azurewebsites.net";

  useEffect(() => {
    if (user?.id) {
      fetchUserNotifications();
      fetchPropertyNotifications();
    }
  }, [user]);

  const fetchUserNotifications = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/Notification/GetUserNotifications?userId=${user.id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.statusCode === 200 && data.notifications) {
        setUserNotifications(data.notifications);
      } else {
        // Use mock data in case of error
        useMockUserNotifications();
      }
    } catch (error) {
      console.error("Error fetching user notifications", error);
      
      // Use mock data in development
      if (process.env.NODE_ENV === 'development') {
        useMockUserNotifications();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPropertyNotifications = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      // In a real app, you might need to fetch the user's properties first,
      // then fetch notifications for each property.
      // For now, we'll assume we're getting all property notifications for the user.
      const response = await fetch(`${BASE_URL}/api/Notification/GetPropertyNotifications?userId=${user.id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.statusCode === 200 && data.notifications) {
        // Add propertyId to each notification
        const propertyNotifs = data.notifications.map((notif: Notification) => ({
          ...notif,
          propertyId: data.propertyId || "unknown",
        }));
        
        setPropertyNotifications(propertyNotifs);
      } else {
        // Use mock data in case of error
        useMockPropertyNotifications();
      }
    } catch (error) {
      console.error("Error fetching property notifications", error);
      
      // Use mock data in development
      if (process.env.NODE_ENV === 'development') {
        useMockPropertyNotifications();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const useMockUserNotifications = () => {
    const mockData: Notification[] = [
      {
        notificationId: "u1",
        message: "Welcome to HomeYatra! Start exploring properties now.",
        isRead: false,
        createdDt: new Date().toISOString(),
      },
      {
        notificationId: "u2",
        message: "Your account details have been updated successfully.",
        isRead: true,
        createdDt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        notificationId: "u3",
        message: "Remember to complete your profile for better recommendations.",
        isRead: false,
        createdDt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];
    setUserNotifications(mockData);
  };

  const useMockPropertyNotifications = () => {
    const mockData: PropertyNotification[] = [
      {
        notificationId: "p1",
        propertyId: "prop123",
        message: "Your property 'Modern 3BHK with Sea View' has received 10 new views today.",
        isRead: false,
        createdDt: new Date().toISOString(),
      },
      {
        notificationId: "p2",
        propertyId: "prop456",
        message: "Someone has saved your property 'Luxury Villa' to their favorites.",
        isRead: false,
        createdDt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        notificationId: "p3",
        propertyId: "prop789",
        message: "Your property listing 'Budget Apartment' has been approved.",
        isRead: true,
        createdDt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];
    setPropertyNotifications(mockData);
  };

  const markAsRead = async (notificationId: string) => {
    if (!user?.id) return;
    
    try {
      const response = await fetch(`${BASE_URL}/api/Notification/MarkAsRead`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          notificationId: notificationId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      // Update the UI
      setUserNotifications(prev => 
        prev.map(n => n.notificationId === notificationId ? { ...n, isRead: true } : n)
      );
      setPropertyNotifications(prev => 
        prev.map(n => n.notificationId === notificationId ? { ...n, isRead: true } : n)
      );

      toast({
        title: "Notification marked as read",
        description: "The notification has been updated.",
      });
    } catch (error) {
      console.error("Error marking notification as read", error);
      
      // In development, simulate success
      if (process.env.NODE_ENV === 'development') {
        // Update the UI
        setUserNotifications(prev => 
          prev.map(n => n.notificationId === notificationId ? { ...n, isRead: true } : n)
        );
        setPropertyNotifications(prev => 
          prev.map(n => n.notificationId === notificationId ? { ...n, isRead: true } : n)
        );
      } else {
        toast({
          title: "Error",
          description: "Failed to mark notification as read. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const createNotification = async (isPropertyNotification: boolean) => {
    if (!user?.id) return;
    
    try {
      let endpoint = isPropertyNotification 
        ? `${BASE_URL}/api/Notification/CreatePropertyNotification`
        : `${BASE_URL}/api/Notification/CreateUserNotification`;
      
      const testMessage = isPropertyNotification 
        ? "Test property notification created at " + new Date().toLocaleTimeString()
        : "Test user notification created at " + new Date().toLocaleTimeString();
      
      let payload = isPropertyNotification 
        ? { 
            propertyId: "testproperty123", // You would use a real propertyId here
            userId: user.id,
            message: testMessage
          }
        : {
            userId: user.id,
            message: testMessage
          };
      
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      toast({
        title: "Test notification created",
        description: "Refresh to see the new notification.",
      });
      
      // Refresh notifications
      if (isPropertyNotification) {
        fetchPropertyNotifications();
      } else {
        fetchUserNotifications();
      }
    } catch (error) {
      console.error("Error creating test notification", error);
      toast({
        title: "Error",
        description: "Failed to create test notification.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString() + " at " + date.toLocaleTimeString();
    } catch (error) {
      return "Unknown date";
    }
  };

  const getUnreadCount = (notifications: Notification[]) => {
    return notifications.filter(n => !n.isRead).length;
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <Card className="w-[400px]">
          <CardHeader>
            <CardTitle className="text-center">Login Required</CardTitle>
            <CardDescription className="text-center">
              Please log in to view your notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button>
              Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center">
          <Bell className="mr-2 text-blue-600" /> Notifications
        </h1>
        <p className="text-gray-600">
          Stay updated with your account and property activity
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div>
          <Tabs defaultValue="all">
            <div className="flex items-center justify-between mb-6">
              <TabsList>
                <TabsTrigger value="all" className="px-4">
                  All
                  <Badge className="ml-2 bg-gray-500">
                    {userNotifications.length + propertyNotifications.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="user" className="px-4">
                  Account
                  <Badge className="ml-2 bg-blue-600">
                    {userNotifications.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="property" className="px-4">
                  Properties
                  <Badge className="ml-2 bg-green-600">
                    {propertyNotifications.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="unread" className="px-4">
                  Unread
                  <Badge className="ml-2 bg-red-600">
                    {getUnreadCount(userNotifications) + getUnreadCount(propertyNotifications)}
                  </Badge>
                </TabsTrigger>
              </TabsList>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => createNotification(false)}
                  className="text-xs hidden sm:flex"
                >
                  Create Test User Notification
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => createNotification(true)}
                  className="text-xs hidden sm:flex"
                >
                  Create Test Property Notification
                </Button>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border p-1">
              <TabsContent value="all" className="p-4">
                {userNotifications.length === 0 && propertyNotifications.length === 0 ? (
                  <div className="text-center py-12">
                    <Bell className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No notifications</h3>
                    <p className="text-gray-500">You don't have any notifications yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {[...userNotifications, ...propertyNotifications]
                      .sort((a, b) => new Date(b.createdDt).getTime() - new Date(a.createdDt).getTime())
                      .map((notification) => (
                        <Card key={notification.notificationId} className={`
                          border-l-4 transition-all
                          ${notification.isRead ? 'border-l-gray-300' : 'border-l-blue-600'}
                          ${notification.isRead ? 'bg-white' : 'bg-blue-50'}
                        `}>
                          <CardContent className="p-4 flex justify-between items-start">
                            <div className="space-y-2">
                              <p className={`${notification.isRead ? 'font-normal' : 'font-medium'}`}>
                                {notification.message}
                              </p>
                              <div className="flex items-center text-sm text-gray-500">
                                <Calendar className="h-3.5 w-3.5 mr-1" />
                                {formatDate(notification.createdDt)}
                              </div>
                            </div>
                            {!notification.isRead && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="shrink-0"
                                onClick={() => markAsRead(notification.notificationId)}
                              >
                                <Check className="h-4 w-4 mr-1" /> Mark as Read
                              </Button>
                            )}
                          </CardContent>
                        </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="user" className="p-4">
                {userNotifications.length === 0 ? (
                  <div className="text-center py-12">
                    <Bell className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No account notifications</h3>
                    <p className="text-gray-500">You don't have any account notifications yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userNotifications
                      .sort((a, b) => new Date(b.createdDt).getTime() - new Date(a.createdDt).getTime())
                      .map((notification) => (
                        <Card key={notification.notificationId} className={`
                          border-l-4 transition-all
                          ${notification.isRead ? 'border-l-gray-300' : 'border-l-blue-600'}
                          ${notification.isRead ? 'bg-white' : 'bg-blue-50'}
                        `}>
                          <CardContent className="p-4 flex justify-between items-start">
                            <div className="space-y-2">
                              <p className={`${notification.isRead ? 'font-normal' : 'font-medium'}`}>
                                {notification.message}
                              </p>
                              <div className="flex items-center text-sm text-gray-500">
                                <Calendar className="h-3.5 w-3.5 mr-1" />
                                {formatDate(notification.createdDt)}
                              </div>
                            </div>
                            {!notification.isRead && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="shrink-0"
                                onClick={() => markAsRead(notification.notificationId)}
                              >
                                <Check className="h-4 w-4 mr-1" /> Mark as Read
                              </Button>
                            )}
                          </CardContent>
                        </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="property" className="p-4">
                {propertyNotifications.length === 0 ? (
                  <div className="text-center py-12">
                    <Bell className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No property notifications</h3>
                    <p className="text-gray-500">You don't have any property notifications yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {propertyNotifications
                      .sort((a, b) => new Date(b.createdDt).getTime() - new Date(a.createdDt).getTime())
                      .map((notification) => (
                        <Card key={notification.notificationId} className={`
                          border-l-4 transition-all
                          ${notification.isRead ? 'border-l-gray-300' : 'border-l-green-600'}
                          ${notification.isRead ? 'bg-white' : 'bg-green-50'}
                        `}>
                          <CardContent className="p-4 flex justify-between items-start">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs py-0">
                                  Property ID: {notification.propertyId}
                                </Badge>
                              </div>
                              <p className={`${notification.isRead ? 'font-normal' : 'font-medium'}`}>
                                {notification.message}
                              </p>
                              <div className="flex items-center text-sm text-gray-500">
                                <Calendar className="h-3.5 w-3.5 mr-1" />
                                {formatDate(notification.createdDt)}
                              </div>
                            </div>
                            {!notification.isRead && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="shrink-0"
                                onClick={() => markAsRead(notification.notificationId)}
                              >
                                <Check className="h-4 w-4 mr-1" /> Mark as Read
                              </Button>
                            )}
                          </CardContent>
                        </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="unread" className="p-4">
                {getUnreadCount(userNotifications) + getUnreadCount(propertyNotifications) === 0 ? (
                  <div className="text-center py-12">
                    <Check className="mx-auto h-12 w-12 text-green-500 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">All caught up!</h3>
                    <p className="text-gray-500">You have no unread notifications</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {[...userNotifications, ...propertyNotifications]
                      .filter(n => !n.isRead)
                      .sort((a, b) => new Date(b.createdDt).getTime() - new Date(a.createdDt).getTime())
                      .map((notification) => (
                        <Card key={notification.notificationId} className="border-l-4 border-l-blue-600 bg-blue-50">
                          <CardContent className="p-4 flex justify-between items-start">
                            <div className="space-y-2">
                              {'propertyId' in notification && (
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs py-0">
                                    Property ID: {(notification as PropertyNotification).propertyId}
                                  </Badge>
                                </div>
                              )}
                              <p className="font-medium">
                                {notification.message}
                              </p>
                              <div className="flex items-center text-sm text-gray-500">
                                <Calendar className="h-3.5 w-3.5 mr-1" />
                                {formatDate(notification.createdDt)}
                              </div>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="shrink-0"
                              onClick={() => markAsRead(notification.notificationId)}
                            >
                              <Check className="h-4 w-4 mr-1" /> Mark as Read
                            </Button>
                          </CardContent>
                        </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </div>
          </Tabs>
          
          <div className="mt-6 text-center">
            <Button onClick={() => {
              fetchUserNotifications();
              fetchPropertyNotifications();
            }}>
              Refresh Notifications
            </Button>
            
            <div className="flex justify-center gap-2 mt-4 sm:hidden">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => createNotification(false)}
                className="text-xs"
              >
                Create Test User Notification
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => createNotification(true)}
                className="text-xs"
              >
                Create Test Property Notification
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  PlusCircle,
  Edit,
  Trash2,
  Eye,
  Home,
  Building,
  MessageSquare,
  Settings,
  ThumbsUp,
  PowerOff,
  Check
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import axiosInstance from "../axiosCalls/axiosInstance";

interface PropertyCardProps {
  id: string;
  title: string;
  price: number;
  location: string;
  type: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  image: string;
}

interface DashboardProperty extends PropertyCardProps {
  status: string;
  propertyId: string;
}

// Updated convertToPropertyCard function with better image handling
const convertToPropertyCard = (property: any): DashboardProperty => {
  const propertyId = property.propertyId || property.id || "";
  
  let mainImage = "https://via.placeholder.com/300x200?text=Property+Image";

  try {
    console.log(`Processing property ${propertyId}:`, property);

    if (
      property.imageDetails &&
      Array.isArray(property.imageDetails) &&
      property.imageDetails.length > 0
    ) {
      console.log(`Property ${propertyId} has ${property.imageDetails.length} images`);

      const mainImageObj = property.imageDetails.find(
        (img: any) => img.isMainImage === true
      );

      if (mainImageObj) {
        mainImage = mainImageObj.imageUrl || mainImageObj.url || mainImageObj.path || mainImage;
        console.log(`Using main image for property ${propertyId}:`, mainImage);
      } else {
        const firstImg = property.imageDetails[0];
        mainImage = firstImg.imageUrl || firstImg.url || firstImg.path || mainImage;
        console.log(`Using first image for property ${propertyId}:`, mainImage);
      }
    } else if (property.mainImageDetail) {
      mainImage = property.mainImageDetail.url || property.mainImageDetail.imageUrl || property.mainImageDetail.path || mainImage;
      console.log(`Using mainImageDetail for property ${propertyId}:`, mainImage);
    } else if (property.image) {
      mainImage = property.image;
      console.log(`Using direct image property for ${propertyId}:`, mainImage);
    }

    if (mainImage && !mainImage.startsWith("http")) {
      if (!mainImage.startsWith("/")) {
        mainImage = "/" + mainImage;
      }
      mainImage = `https://homeyatraapi.azurewebsites.net${mainImage}`;
      console.log(`Converted relative path to absolute URL: ${mainImage}`);
    }

    if (mainImage && !mainImage.match(/^(https?:\/\/)/)) {
      console.warn(`Invalid image URL format: ${mainImage}, using fallback`);
      mainImage = "https://via.placeholder.com/300x200?text=Property+Image";
    }
  } catch (error) {
    console.error("Error processing image for property:", error);
    mainImage = "https://via.placeholder.com/300x200?text=Property+Image";
  }

  return {
    id: propertyId,
    propertyId: propertyId,
    title: property.title || "Untitled Property",
    price: property.price || 0,
    location: property.address
      ? `${property.address}, ${property.city || ""}`
      : "Unknown Location",
    type:
      property.superCategory?.toLowerCase() === "buy"
        ? "buy"
        : property.superCategory?.toLowerCase() === "rent"
        ? "rent"
        : "sell",
    bedrooms: property.bedroom || 0,
    bathrooms: property.bathroom || 0,
    area: property.area || 0,
    image: mainImage,
    status: property.status || "active",
  };
};

const mockMessages = [
  {
    id: "msg1",
    propertyId: "prop1",
    propertyTitle: "Modern 3BHK with Sea View",
    sender: "Priya Sharma",
    message:
      "Hello, I'm interested in your property. Is it still available? I would like to schedule a visit this weekend.",
    date: "2025-01-15T14:30:00",
    read: false,
  },
  {
    id: "msg2",
    propertyId: "prop1",
    propertyTitle: "Modern 3BHK with Sea View",
    sender: "Vikram Singh",
    message:
      "Hi, I have some questions about the amenities in your property. Could you please provide more details?",
    date: "2025-01-14T10:15:00",
    read: true,
  },
];

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("properties");
  const [properties, setProperties] = useState<DashboardProperty[]>([]);
  const [messages, setMessages] = useState<typeof mockMessages>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [userName, setUserName] = useState<string>("User");
  const [likeCount, setLikeCount] = useState<number>(0);
  const { user, logout, updateUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isDeactivateDialogOpen, setIsDeactivateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isActivateDialogOpen, setIsActivateDialogOpen] = useState(false);
  const [accountIsActive, setAccountIsActive] = useState<boolean>(true);

  const getNewPropertyIdFromQuery = () => {
    const params = new URLSearchParams(location.search);
    const newPropertyId = params.get("newPropertyId");
    console.log("Extracted Property ID from URL:", newPropertyId);
    return newPropertyId || "";
  };

  const newPropertyId = getNewPropertyIdFromQuery();

  useEffect(() => {
    if (user?.name) {
      setUserName(user.name);
    }
    if (user?.isActive !== undefined) {
      setAccountIsActive(user.isActive);
    }
  }, [user]);

  useEffect(() => {
    const fetchUserProperties = async () => {
      // Check if user is authenticated
      if (!user?.userId) {
        console.log("No user found, redirecting to login");
        setLoading(false);
        toast({
          title: "Authentication Required",
          description: "Please log in to view your dashboard.",
          variant: "destructive",
        });
        navigate("/login");
        return;
      }

      try {
        setLoading(true);
        console.log("Fetching properties for user:", user.userId);

        // Try to get user details and properties
        const response = await axiosInstance.get(
          `/api/Account/GetUserDetails?userId=${user.userId}`
        );

        console.log("API Response:", response.data);

        if (response.data?.statusCode === 200) {
          const data = response.data;

          // Update user name if available
          if (data.name) {
            setUserName(data.name);
          }

          // Set the like count from API response
          if (data.likedCount !== undefined) {
            setLikeCount(data.likedCount);
          }

          // Set account active status if available
          if (data.isActive !== undefined) {
            setAccountIsActive(data.isActive);
            if (updateUser) {
              updateUser({ isActive: data.isActive });
            }
          }

          // Process properties data
          if (Array.isArray(data.userDetails) && data.userDetails.length > 0) {
            console.log("Found properties:", data.userDetails.length);
            const formattedProperties = data.userDetails.map(convertToPropertyCard);
            console.log("Formatted properties:", formattedProperties);
            setProperties(formattedProperties);
          } else {
            console.log("No properties found in response");
            setProperties([]);
          }
        } else {
          throw new Error(`API returned status: ${response.data?.statusCode}`);
        }

        // Show success message for new property
        if (newPropertyId) {
          toast({
            title: "New Property Added!",
            description: `Your property with ID ${newPropertyId} has been successfully added.`,
          });
        }

      } catch (error) {
        console.error("Error fetching user properties:", error);
        
        // Show specific error message
        if (error.response?.status === 401) {
          toast({
            title: "Authentication Error",
            description: "Please log in again to access your dashboard.",
            variant: "destructive",
          });
          logout();
          navigate("/login");
        } else if (error.response?.status === 404) {
          toast({
            title: "User Not Found",
            description: "Your user account could not be found.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error Loading Properties",
            description: "Failed to load your properties. Please try refreshing the page.",
            variant: "destructive",
          });
        }
        
        setProperties([]);
        setLikeCount(0);
      } finally {
        setLoading(false);
        setMessages(mockMessages);
      }
    };

    fetchUserProperties();
  }, [user?.userId, toast, newPropertyId, location.search, updateUser, navigate, logout]);

  const handleActivateAccount = async () => {
    try {
      setLoading(true);
      
      const response = await axiosInstance.post(
        `/api/Account/ActivateAccount`,
        JSON.stringify(user?.userId),
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      
      setAccountIsActive(true);
      if (updateUser) {
        updateUser({ isActive: true });
      }
      
      toast({
        title: "Account Activated",
        description: "Your account has been successfully activated.",
      });
    } catch (error) {
      console.error("Error activating account:", error);
      toast({
        title: "Error",
        description: "Failed to activate account. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setIsActivateDialogOpen(false);
    }
  };

  const handleDeactivateAccount = async () => {
    try {
      setLoading(true);
      
      const response = await axiosInstance.delete(
        `/api/Account/DeactivateAccount?userid=${user?.userId}`
      );
      
      setAccountIsActive(false);
      if (updateUser) {
        updateUser({ isActive: false });
      }
      
      toast({
        title: "Account Deactivated",
        description: "Your account has been deactivated successfully.",
      });
    } catch (error) {
      console.error("Error deactivating account:", error);
      toast({
        title: "Error",
        description: "Failed to deactivate account. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setIsDeactivateDialogOpen(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setLoading(true);
      
      const response = await axiosInstance.delete(
        `/api/Account/DeleteAccount?userid=${user?.userId}`
      );
      
      toast({
        title: "Account Deleted",
        description: "Your account has been permanently deleted.",
      });
      
      if (logout) {
        logout();
      }
      navigate("/");
    } catch (error) {
      console.error("Error deleting account:", error);
      toast({
        title: "Error",
        description: "Failed to delete account. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleDeleteProperty = async (id: string) => {
    console.log("Deleting property with ID:", id);

    if (!id) {
      toast({
        title: "Error",
        description: "Cannot delete property: Missing property ID.",
        variant: "destructive",
      });
      return;
    }

    if (!window.confirm("Are you sure you want to delete this property?"))
      return;

    try {
      setLoading(true);

      const response = await axiosInstance.delete(
        `/api/Account/DeleteProperty?propertyId=${id}`
      );

      console.log("Delete response:", response.data);
      
      if (response.data.statusCode === 200) {
        setProperties((prev) => prev.filter((prop) => prop.propertyId !== id));
        toast({
          title: "Property Deleted",
          description: "The property has been removed successfully.",
        });
      } else {
        throw new Error(response.data.message || "Failed to delete property");
      }
    } catch (error) {
      console.error("Error deleting property:", error);
      toast({
        title: "Error",
        description: "Failed to delete property. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const markMessageAsRead = (id: string) => {
    setMessages(
      messages.map((msg) => (msg.id === id ? { ...msg, read: true } : msg))
    );
  };

  const unreadCount = messages.filter((msg) => !msg.read).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
              <p className="text-gray-600 mb-4">Please log in to access your dashboard.</p>
              <Button onClick={() => navigate("/login")} className="w-full">
                Go to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back, {userName}</p>
          {!accountIsActive && (
            <p className="text-amber-500 mt-1 font-medium">
              Your account is currently deactivated
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Listed Properties
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Home className="w-5 h-5 text-blue-600 mr-2" />
              <span className="text-3xl font-bold">{properties.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Liked Properties
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <ThumbsUp className="w-5 h-5 text-rose-500 mr-2" />
              <span className="text-3xl font-bold">{likeCount}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              New Messages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <MessageSquare className="w-5 h-5 text-amber-500 mr-2" />
              <span className="text-3xl font-bold">{unreadCount}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4 sm:mb-6 w-full flex overflow-x-auto no-scrollbar">
          <TabsTrigger
            value="properties"
            className="text-xs sm:text-sm flex-1 py-1.5 sm:py-2"
          >
            <span className="block truncate">Listed Properties</span>
          </TabsTrigger>
          <TabsTrigger
            value="messages"
            className="text-xs sm:text-sm flex-1 py-1.5 sm:py-2"
          >
            <span className="block truncate">Messages</span>
            {unreadCount > 0 && (
              <span className="ml-1 bg-red-500 text-white rounded-full w-4 h-4 sm:w-5 sm:h-5 inline-flex items-center justify-center text-xs">
                {unreadCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="account"
            className="text-xs sm:text-sm flex-1 py-1.5 sm:py-2"
          >
            <span className="block truncate">Account</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="properties">
          {properties.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border">
              <Building className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium">No Properties Found</h3>
              <p className="mt-1 text-gray-500">
                You haven't posted any properties yet.
              </p>
              <Button
                onClick={() => navigate("/post-property")}
                className="mt-4 bg-blue-600 hover:bg-blue-700"
              >
                Post Your First Property
              </Button>
            </div>
          ) : (
            <div className="bg-white rounded-lg border overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Property
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                      Price
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      Type
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                      Status
                    </th>
                    <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {properties.map((property) => (
                    <tr
                      key={property.propertyId || `property-${Math.random()}`}
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center">
                          <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded">
                            <img
                              src={property.image}
                              alt={property.title}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="ml-3">
                            <div className="font-medium text-gray-900 line-clamp-1">
                              {property.title}
                            </div>
                            <div className="text-gray-500 text-sm line-clamp-1">
                              {property.location || "No location specified"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 hidden sm:table-cell">
                        <div className="text-gray-900">
                          ₹
                          {property.price > 0
                            ? property.price.toLocaleString()
                            : "Not specified"}
                        </div>
                        <div className="text-gray-500 text-sm">
                          {property.type === "rent" ? "/month" : ""}
                        </div>
                      </td>
                      <td className="py-4 px-4 hidden md:table-cell">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize">
                          {property.type === "buy"
                            ? "For Sale"
                            : property.type === "rent"
                            ? "For Rent"
                            : "Selling"}
                        </span>
                      </td>
                      <td className="py-4 px-4 hidden lg:table-cell">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            property.status === "active"
                              ? "bg-green-100 text-green-800"
                              : property.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {property.status === "active"
                            ? "Active"
                            : property.status === "pending"
                            ? "Pending"
                            : "Inactive"}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() =>
                              navigate(`/properties/${property.propertyId}`)
                            }
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() =>
                              navigate(`/edit-property/${property.propertyId}`)
                            }
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="text-red-500 hover:text-red-600"
                            onClick={() =>
                              handleDeleteProperty(property.propertyId)
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="messages">
          {messages.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border">
              <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium">No Messages</h3>
              <p className="mt-1 text-gray-500">
                You haven't received any messages yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <Card
                  key={message.id}
                  className={message.read ? "" : "border-l-4 border-l-blue-600"}
                >
                  <CardContent className="p-5">
                    <div className="flex justify-between mb-2">
                      <h4 className="font-medium">From: {message.sender}</h4>
                      <span className="text-sm text-gray-500">
                        {new Date(message.date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-2">
                      Re: {message.propertyTitle}
                    </p>
                    <p className="text-gray-600 mb-4">{message.message}</p>
                    <div className="flex justify-between items-center">
                      <Link
                        to={`/properties/${message.propertyId}`}
                        className="text-blue-600 text-sm hover:underline"
                      >
                        View Property
                      </Link>
                      {!message.read && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => markMessageAsRead(message.id)}
                        >
                          Mark as Read
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-2 flex items-center">
                    <Settings className="h-4 w-4 mr-2" /> Profile Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-500">Name</label>
                      <p className="font-medium">{userName}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">
                        Phone Number
                      </label>
                      <p className="font-medium">{user?.phone || "-"}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-4">Notification Preferences</h4>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="sms-notifications"
                        defaultChecked
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                      />
                      <label
                        htmlFor="sms-notifications"
                        className="ml-2 block text-sm"
                      >
                        SMS notifications for new messages
                      </label>
                    </div>
                  </div>
                </div>

                {/* Account Actions Section */}
                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-4">Account Actions</h4>
                  <div className="flex flex-col sm:flex-row gap-4">
                    {accountIsActive ? (
                      <Button
                        variant="outline"
                        className="border-amber-500 text-amber-500 hover:bg-amber-50"
                        onClick={() => setIsDeactivateDialogOpen(true)}
                      >
                        <PowerOff className="h-4 w-4 mr-2" />
                        Deactivate Account
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        className="border-green-500 text-green-500 hover:bg-green-50"
                        onClick={() => setIsActivateDialogOpen(true)}
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Activate Account
                      </Button>
                    )}
                    <Button
                      variant="outline" 
                      className="border-red-500 text-red-500 hover:bg-red-50"
                      onClick={() => setIsDeleteDialogOpen(true)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Account
                    </Button>
                  </div>
                  <p className="text-gray-500 text-xs mt-2">
                    {accountIsActive 
                      ? "Deactivating will temporarily disable your account. Deleting will permanently remove all your data."
                      : "Activate your account to make your listings visible again. Deleting will permanently remove all your data."}
                  </p>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Save Settings
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Activate Account Confirmation Dialog */}
      <AlertDialog 
        open={isActivateDialogOpen} 
        onOpenChange={setIsActivateDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Activate Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to activate your account? Your listings will be visible again and you'll receive messages from interested users.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleActivateAccount}
              className="bg-green-500 hover:bg-green-600"
            >
              Activate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Deactivate Account Confirmation Dialog */}
      <AlertDialog 
        open={isDeactivateDialogOpen} 
        onOpenChange={setIsDeactivateDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to deactivate your account? Your listings will be hidden and you won't receive any messages. You can reactivate your account by logging in again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeactivateAccount}
              className="bg-amber-500 hover:bg-amber-600"
            >
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Account Confirmation Dialog */}
      <AlertDialog 
        open={isDeleteDialogOpen} 
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Account</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your account and remove all your data from our servers, including all your property listings.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteAccount}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Dashboard;
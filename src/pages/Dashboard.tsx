import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";

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

// 1. Updated convertToPropertyCard function with better image handling
const convertToPropertyCard = (property: any): DashboardProperty => {
  // Get the property ID correctly
  const propertyId = property.propertyId || property.id || "";

  // Initialize with a reliable fallback image
  let mainImage = "https://via.placeholder.com/300x200?text=Property+Image";

  try {
    // Log the property for debugging
    console.log(`Processing property ${propertyId}:`, property);

    // Check if the property has imageDetails array
    if (
      property.imageDetails &&
      Array.isArray(property.imageDetails) &&
      property.imageDetails.length > 0
    ) {
      console.log(
        `Property ${propertyId} has ${property.imageDetails.length} images`
      );

      // Try to find main image first
      const mainImageObj = property.imageDetails.find(
        (img: any) => img.isMainImage === true
      );

      if (mainImageObj) {
        // Make sure we're using the correct property for the URL
        mainImage =
          mainImageObj.imageUrl ||
          mainImageObj.url ||
          mainImageObj.path ||
          mainImage;
        console.log(`Using main image for property ${propertyId}:`, mainImage);
      } else {
        // Use first image as fallback
        const firstImg = property.imageDetails[0];
        mainImage =
          firstImg.imageUrl || firstImg.url || firstImg.path || mainImage;
        console.log(`Using first image for property ${propertyId}:`, mainImage);
      }
    }
    // Check if there's a mainImageDetail object
    else if (property.mainImageDetail) {
      mainImage =
        property.mainImageDetail.url ||
        property.mainImageDetail.imageUrl ||
        property.mainImageDetail.path ||
        mainImage;
      console.log(
        `Using mainImageDetail for property ${propertyId}:`,
        mainImage
      );
    }
    // Check if there's a simple image property
    else if (property.image) {
      mainImage = property.image;
      console.log(`Using direct image property for ${propertyId}:`, mainImage);
    }

    // If the image URL doesn't start with http or https, it might be a relative path
    if (mainImage && !mainImage.startsWith("http")) {
      // Add base URL for relative paths
      if (!mainImage.startsWith("/")) {
        mainImage = "/" + mainImage;
      }
      mainImage = `https://homeyatraapi.azurewebsites.net${mainImage}`;
      console.log(`Converted relative path to absolute URL: ${mainImage}`);
    }

    // Extra check to ensure image URL is valid
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

// Mock properties for fallback when API fails
const mockProperties = [
  {
    propertyId: "prop1",
    title: "Modern 3BHK with Sea View",
    price: 25000,
    address: "Marine Drive",
    city: "Mumbai",
    superCategory: "Rent",
    bedroom: 3,
    bathroom: 2,
    area: 1500,
    mainImageDetail: {
      url: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&q=80",
    },
  },
  {
    propertyId: "prop2",
    title: "Spacious Bungalow",
    price: 9500000,
    address: "Koregaon Park",
    city: "Pune",
    superCategory: "Buy",
    bedroom: 4,
    bathroom: 3,
    area: 2800,
    mainImageDetail: {
      url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80",
    },
  },
];

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("properties");
  const [properties, setProperties] = useState<DashboardProperty[]>([]);
  const [messages, setMessages] = useState<typeof mockMessages>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [userName, setUserName] = useState<string>("User");
  const [likeCount, setLikeCount] = useState<number>(0); // New state for like count
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const BASE_URL = "https://homeyatraapi.azurewebsites.net";

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
  }, [user]);

  useEffect(() => {
    const fetchUserProperties = async () => {
      if (!user?.userId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // For development testing, use mock data if API fails
        try {
          const response = await fetch(
            `${BASE_URL}/api/Account/GetUserDetails?userId=${user.userId}`
          );
          if (!response.ok) {
            throw new Error(`Failed to fetch user details: ${response.status}`);
          }

          const data = await response.json();
          console.log("Raw API response for user properties:", data);

          if (data.name) {
            setUserName(data.name);
          }
          
          // Set the like count from API response
          if (data.likedCount !== undefined) {
            setLikeCount(data.likedCount);
          }

          if (data.statusCode === 200 && Array.isArray(data.userDetails)) {
            console.log("First property from API:", data.userDetails[0]);
            const formattedProperties = data.userDetails.map(
              convertToPropertyCard
            );
            console.log("Formatted properties:", formattedProperties);
            setProperties(formattedProperties);
          } else {
            throw new Error("No property data received from API");
          }
        } catch (apiError) {
          console.error("API error, using mock data:", apiError);
          // Mock data for testing when API is unavailable
          const formattedProperties = mockProperties.map(convertToPropertyCard);
          setProperties(formattedProperties);
          setLikeCount(1); // Default like count for mock data
        }

        if (newPropertyId) {
          toast({
            title: "New Property Added!",
            description: `Your property with ID ${newPropertyId} has been successfully added.`,
          });
        }
      } catch (error) {
        console.error("Error fetching user properties:", error);
        toast({
          title: "Error",
          description:
            "Failed to load your properties. Please try again later.",
          variant: "destructive",
        });
        // Ensure we have at least some properties to display
        const formattedProperties = mockProperties.map(convertToPropertyCard);
        setProperties(formattedProperties);
        setLikeCount(0); // Reset like count on error
      } finally {
        setLoading(false);
        setMessages(mockMessages);
      }
    };

    fetchUserProperties();
  }, [user?.userId, toast, newPropertyId, location.search]);

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

      // Send the ID to the API
      const response = await fetch(
        `${BASE_URL}/api/Account/DeleteProperty?propertyId=${id}`,
        {
          method: "DELETE",
        }
      );

      console.log("Delete response status:", response.status);

      if (!response.ok) {
        throw new Error(`Failed to delete property with ID: ${id}`);
      }

      const result = await response.json();
      console.log("Delete API response:", result);

      if (result.statusCode === 200) {
        // Update the UI by removing the deleted property
        setProperties((prev) => prev.filter((prop) => prop.propertyId !== id));
        toast({
          title: "Property Deleted",
          description: "The property has been removed successfully.",
        });
      } else {
        throw new Error(result.message || "Failed to delete property");
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

  // Function to mark a message as read
  const markMessageAsRead = (id: string) => {
    setMessages(
      messages.map((msg) => (msg.id === id ? { ...msg, read: true } : msg))
    );
  };

  // Count unread messages
  const unreadCount = messages.filter((msg) => !msg.read).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back, {userName}</p>
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

        {/* New Like Count Card */}
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
    </div>
  );
};

export default Dashboard;
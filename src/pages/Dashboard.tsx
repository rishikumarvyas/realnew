import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PropertyCard, { PropertyCardProps } from "@/components/PropertyCard";
import { PlusCircle, Edit, Trash2, Eye, Home, Building, MessageSquare, Settings } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface DashboardProperty extends PropertyCardProps {
  status: string;
}

// Function to convert API property to dashboard format
const convertToPropertyCard = (property: any): DashboardProperty => {
  return {
    id: property.id || `prop-${Math.random().toString(36).substring(7)}`,
    title: property.title || "Untitled Property",
    price: property.price || 0,
    location: property.address ? `${property.address}, ${property.city || ''}` : "Unknown Location",
    type: property.superCategory?.toLowerCase() === 'buy' ? 'buy' : 
           property.superCategory?.toLowerCase() === 'rent' ? 'rent' : 'sell',
    bedrooms: property.bedroom || 0,
    bathrooms: property.bathroom || 0,
    area: property.area || 0,
    image: property.mainImageDetail?.url || "https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&q=80",
    status: "active"
  };
};

// Mock data for messages
const mockMessages = [
  {
    id: "msg1",
    propertyId: "prop1",
    propertyTitle: "Modern 3BHK with Sea View",
    sender: "Priya Sharma",
    message: "Hello, I'm interested in your property. Is it still available? I would like to schedule a visit this weekend.",
    date: "2025-01-15T14:30:00",
    read: false,
  },
  {
    id: "msg2",
    propertyId: "prop1",
    propertyTitle: "Modern 3BHK with Sea View",
    sender: "Vikram Singh",
    message: "Hi, I have some questions about the amenities in your property. Could you please provide more details?",
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
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const BASE_URL = "https://homeyatraapi.azurewebsites.net";
  
  // This useEffect logs the user object to verify userId is available
  useEffect(() => {
    console.log("Current user in Dashboard:", user);
    
    // Update userName from user object when it changes
    if (user && user.name) {
      setUserName(user.name);
      console.log("Setting user name to:", user.name);
    }
  }, [user]);

  // Fetch user properties when component mounts or user changes
  useEffect(() => {
    const fetchUserProperties = async () => {
      if (!user?.userId) {
        console.log("No userId available, skipping fetch");
        setLoading(false);
        return;
      }

      console.log("Fetching properties for userId:", user.userId);

      try {
        setLoading(true);
        const response = await fetch(`${BASE_URL}/api/Account/GetUserDetails?userId=${user.userId}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch user details: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("User properties data:", data);
        
        // Update the user name if available in the API response
        if (data.name) {
          setUserName(data.name);
          console.log("Updated user name from API:", data.name);
        }
        
        if (data.statusCode === 200 && data.userDetails && Array.isArray(data.userDetails)) {
          // Convert API properties to dashboard format
          const formattedProperties = data.userDetails.map(convertToPropertyCard);
          setProperties(formattedProperties);
        } else {
          // If no properties or wrong format, set empty array
          setProperties([]);
        }
      } catch (error) {
        console.error("Error fetching user properties:", error);
        toast({
          title: "Error",
          description: "Failed to load your properties. Please try again later.",
          variant: "destructive"
        });
        setProperties([]);
      } finally {
        setLoading(false);
        // Always load mock messages for now
        setMessages(mockMessages);
      }
    };

    fetchUserProperties();
  }, [user?.userId, toast]);

  const handleDeleteProperty = (id: string) => {
    if (window.confirm("Are you sure you want to delete this property?")) {
      setProperties(properties.filter(prop => prop.id !== id));
      toast({
        title: "Property Deleted",
        description: "The property has been removed successfully.",
      });
    }
  };

  const markMessageAsRead = (id: string) => {
    setMessages(messages.map(msg => 
      msg.id === id ? { ...msg, read: true } : msg
    ));
  };

  // Count unread messages
  const unreadCount = messages.filter(msg => !msg.read).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-real-blue"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Welcome back, {userName}
          </p>
        </div>
        <Button 
          onClick={() => navigate('/post-property')}
          className="mt-4 md:mt-0 bg-real-blue hover:bg-blue-600"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Post New Property
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Properties</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Home className="w-5 h-5 text-real-blue mr-2" />
              <span className="text-3xl font-bold">{properties.length}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Active Listings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Building className="w-5 h-5 text-green-500 mr-2" />
              <span className="text-3xl font-bold">
                {properties.filter(p => p.status === "active").length}
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">New Messages</CardTitle>
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
        <TabsList className="mb-6">
          <TabsTrigger value="properties">
            My Properties
          </TabsTrigger>
          <TabsTrigger value="messages">
            Messages {unreadCount > 0 && <span className="ml-1 bg-red-500 text-white rounded-full w-5 h-5 inline-flex items-center justify-center text-xs">{unreadCount}</span>}
          </TabsTrigger>
          <TabsTrigger value="account">
            Account Settings
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
                onClick={() => navigate('/post-property')}
                className="mt-4 bg-real-blue hover:bg-blue-600"
              >
                Post Your First Property
              </Button>
            </div>
          ) : (
            <div className="bg-white rounded-lg border overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Price</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Type</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Status</th>
                    <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {properties.map((property) => (
                    <tr key={property.id}>
                      <td className="py-4 px-4">
                        <div className="flex items-center">
                          <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded">
                            <img src={property.image} alt={property.title} className="h-full w-full object-cover" />
                          </div>
                          <div className="ml-3">
                            <div className="font-medium text-gray-900 line-clamp-1">{property.title}</div>
                            <div className="text-gray-500 text-sm line-clamp-1">{property.location || 'No location specified'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 hidden sm:table-cell">
                        <div className="text-gray-900">₹{property.price > 0 ? property.price.toLocaleString() : 'Not specified'}</div>
                        <div className="text-gray-500 text-sm">{property.type === 'rent' ? '/month' : ''}</div>
                      </td>
                      <td className="py-4 px-4 hidden md:table-cell">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize">
                          {property.type === 'buy' ? 'For Sale' : property.type === 'rent' ? 'For Rent' : 'Selling'}
                        </span>
                      </td>
                      <td className="py-4 px-4 hidden lg:table-cell">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          property.status === 'active' ? 'bg-green-100 text-green-800' : 
                          property.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {property.status === 'active' ? 'Active' : 
                           property.status === 'pending' ? 'Pending' : 
                           'Inactive'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => navigate(`/properties/${property.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => navigate(`/edit-property/${property.id}`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon"
                            className="text-red-500 hover:text-red-600"
                            onClick={() => handleDeleteProperty(property.id)}
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
                <Card key={message.id} className={message.read ? "" : "border-l-4 border-l-real-blue"}>
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
                        className="text-real-blue text-sm hover:underline"
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
                      <label className="text-sm text-gray-500">Phone Number</label>
                      <p className="font-medium">{user?.phone || "-"}</p>
                    </div>
                    {/* <div>
                      <label className="text-sm text-gray-500">User ID</label>
                      <p className="font-medium text-xs truncate">{user?.userId || "-"}</p>
                    </div> */}
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-4">Notification Preferences</h4>
                  <div className="space-y-2">
                    {/* <div className="flex items-center">
                      <input 
                        type="checkbox" 
                        id="email-notifications" 
                        defaultChecked 
                        className="h-4 w-4 rounded border-gray-300 text-real-blue focus:ring-real-blue"
                      />
                      <label htmlFor="email-notifications" className="ml-2 block text-sm">
                        Email notifications for new messages
                      </label>
                    </div> */}
                    <div className="flex items-center">
                      <input 
                        type="checkbox" 
                        id="sms-notifications" 
                        defaultChecked 
                        className="h-4 w-4 rounded border-gray-300 text-real-blue focus:ring-real-blue"
                      />
                      <label htmlFor="sms-notifications" className="ml-2 block text-sm">
                        SMS notifications for new messages
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 flex justify-end">
                  <Button className="bg-real-blue hover:bg-blue-600">Save Settings</Button>
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
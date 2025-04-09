import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, Settings, Heart, MessageSquare, Home, List } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PropertyCard from '@/components/properties/PropertyCard';
import { buyProperties, rentProperties } from '@/data/properties';
import UserPropertyCard from '@/components/dashboard/UserPropertyCard';
import { Input } from '@/components/ui/input';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("properties");
  
  // Map the properties to match the UserPropertyCard's expected format
  const userProperties = [...buyProperties.slice(0, 2), ...rentProperties.slice(0, 1)].map(prop => {
    // Handle location which can be string or object
    const locationAddress = typeof prop.location === 'string' 
      ? prop.location 
      : prop.location.address;
      
    return {
      id: prop.id,
      title: prop.title,
      location: {
        address: locationAddress,
        city: '',
        state: '',
        zip: ''
      },
      price: prop.price,
      bedrooms: prop.bedrooms,
      bathrooms: prop.bathrooms,
      squareFeet: prop.area,
      images: prop.images || (prop.image ? [prop.image] : []), // Convert single image to array
      type: prop.type,
      status: 'active',
      listedDate: 'Apr 9, 2025'
    };
  });
  
  const savedProperties = [...rentProperties.slice(2, 4), ...buyProperties.slice(2, 3)];
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar */}
            <div className="w-full md:w-64 shrink-0">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center gap-4 mb-6 pb-6 border-b">
                  <div className="w-12 h-12 bg-realestate-blue text-white rounded-full flex items-center justify-center text-xl font-bold">
                    JD
                  </div>
                  <div>
                    <h3 className="font-semibold">John Doe</h3>
                    <p className="text-sm text-gray-500">john@example.com</p>
                  </div>
                </div>
                
                <nav className="space-y-1">
                  <Button
                    variant={activeTab === "properties" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveTab("properties")}
                  >
                    <Home className="mr-2 h-4 w-4" />
                    My Properties
                  </Button>
                  
                  <Button
                    variant={activeTab === "saved" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveTab("saved")}
                  >
                    <Heart className="mr-2 h-4 w-4" />
                    Saved Properties
                  </Button>
                  
                  <Button
                    variant={activeTab === "messages" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveTab("messages")}
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Messages
                    <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5">3</span>
                  </Button>
                  
                  <Button
                    variant={activeTab === "settings" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveTab("settings")}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Account Settings
                  </Button>
                </nav>
              </div>
            </div>
            
            {/* Main Content */}
            <div className="flex-grow">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsContent value="properties">
                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-bold text-gray-800">My Properties</h2>
                      <Button asChild className="bg-realestate-teal hover:bg-realestate-blue">
                        <Link to="/add-property">
                          <Plus className="mr-2 h-4 w-4" />
                          Add New Property
                        </Link>
                      </Button>
                    </div>
                    
                    {userProperties.length === 0 ? (
                      <div className="text-center py-12">
                        <List className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-4 text-lg font-medium">No properties yet</h3>
                        <p className="mt-1 text-gray-500">Add your first property listing to get started.</p>
                        <Button className="mt-4 bg-realestate-teal hover:bg-realestate-blue">
                          <Link to="/add-property">Add Property</Link>
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {userProperties.map((property) => (
                          <UserPropertyCard 
                            key={property.id} 
                            property={property}
                            onEdit={() => console.log('Edit property', property.id)}
                            onDelete={() => console.log('Delete property', property.id)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="saved">
                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Saved Properties</h2>
                    
                    {savedProperties.length === 0 ? (
                      <div className="text-center py-12">
                        <Heart className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-4 text-lg font-medium">No saved properties</h3>
                        <p className="mt-1 text-gray-500">Save properties you're interested in to view them later.</p>
                        <Button className="mt-4 bg-realestate-blue hover:bg-realestate-teal">
                          <Link to="/buy">Browse Properties</Link>
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {savedProperties.map((property) => (
                          <Link to={`/property/${property.id}`} key={property.id} className="block hover:opacity-95 transition-opacity">
                            <PropertyCard property={property} />
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="messages">
                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Messages</h2>
                    
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                          <div className="flex justify-between">
                            <h3 className="font-medium">Jane Smith</h3>
                            <span className="text-sm text-gray-500">Yesterday</span>
                          </div>
                          <p className="text-sm text-gray-600">
                            Hello, I'm interested in your Beach View Apartment property...
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="settings">
                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Account Settings</h2>
                    
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                          <Input defaultValue="John Doe" />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                          <Input defaultValue="john@example.com" />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                          <Input defaultValue="+1 123 456 7890" />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                          <Input defaultValue="123 Main St, City" />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">About Me</label>
                        <textarea 
                          className="w-full border rounded-md p-2 text-sm" 
                          rows={4}
                          defaultValue="Real estate enthusiast and property investor with 5+ years of experience."
                        />
                      </div>
                      
                      <div className="flex justify-end">
                        <Button className="bg-realestate-blue hover:bg-realestate-teal">
                          Save Changes
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;

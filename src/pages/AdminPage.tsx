import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import PropertyReviewCard from '@/components/PropertyReviewCard';
import { 
  Home, 
  Eye,
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
  Star,
  User,
  RefreshCw
} from 'lucide-react';
import axiosInstance from "../axiosCalls/axiosInstance";

interface Property {
  propertyId: string;
  superCategory: string;
  propertyType: string;
  statusId: string;
  title: string;
  price?: number;
  location?: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  images?: string[];
  description?: string;
  createdDate?: string;
}

const AdminPage = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [activeTab, setActiveTab] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(-1);
  const { toast } = useToast();

  // Fetch properties from API
  const fetchProperties = async () => {
    console.log('🔄 Fetching properties...');
    setLoading(true);
    try {
      const body = {
        superCategoryId: 0,
        propertyTypeIds: [],
        statusId: 0, // Get all properties
        accountId: "",
        searchTerm: "",
        minPrice: 0,
        maxPrice: 0,
        bedroom: 0,
        balcony: 0,
        bathroom: 0,
        minArea: 0,
        maxArea: 0,
        pageNumber,
        pageSize,
      };
      
      console.log('📤 Fetching properties with body:', body);
      const response = await axiosInstance.post('/api/Account/GetProperty', body);
      console.log('📥 API Response:', response.data);
      console.log('📊 Total properties fetched:', response.data?.propertyInfo?.length || 0);
      
      const fetchedProperties = response.data?.propertyInfo || [];
      setProperties(fetchedProperties);
      
      if (fetchedProperties.length === 0) {
        toast({
          title: 'No Properties Found',
          description: 'No properties were found in the system.',
          variant: 'default',
        });
      }
    } catch (error: any) {
      console.error('❌ Failed to fetch properties:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch properties. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [pageNumber, pageSize]);

  // Handle property action (approve/reject)
  const handlePropertyAction = (propertyId: string, action: string) => {
    console.log('🔄 handlePropertyAction called:', { propertyId, action });
    
    // Update local state immediately for better UX
    setProperties(prev => {
      const updatedProperties = prev.map(property => {
        if (property.propertyId === propertyId) {
          const newStatusId = action === 'approve' ? '2' : '3';
          console.log(`✅ Property ${propertyId} status changed from ${property.statusId} to ${newStatusId}`);
          return { ...property, statusId: newStatusId };
        }
        return property;
      });
      
      console.log('📊 Updated properties list:', updatedProperties.map(p => ({ id: p.propertyId, status: p.statusId })));
      return updatedProperties;
    });

    // Refresh the properties list after a short delay to ensure UI is updated
    console.log('🔄 Scheduling properties refresh...');
    setTimeout(() => {
      console.log('🔄 Refreshing properties list...');
      fetchProperties();
    }, 1000);
  };

  // Filter properties based on status
  const getFilteredProperties = (status: string) => {
    console.log(`🔍 Filtering properties for status: ${status}`);
    console.log('📋 All properties:', properties.map(p => ({ id: p.propertyId, status: p.statusId })));
    
    if (status === "all") return properties;
    if (status === "pending") return properties.filter(p => p.statusId === '1');
    if (status === "approved") return properties.filter(p => p.statusId === '2');
    if (status === "rejected") return properties.filter(p => p.statusId === '3');
    return properties;
  };

  const getStatusCounts = () => {
    return {
      pending: properties.filter(p => p.statusId === '1').length,
      approved: properties.filter(p => p.statusId === '2').length,
      rejected: properties.filter(p => p.statusId === '3').length,
      total: properties.length
    };
  };

  const statusCounts = getStatusCounts();
  const filteredProperties = getFilteredProperties(activeTab);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Loading properties...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
      {/* Ultra Modern Header */}
      <div className="bg-white/95 backdrop-blur-lg border-b border-slate-200/60 shadow-lg sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                Property Management Hub
              </h1>
              <p className="text-slate-600 mt-2 text-sm sm:text-base flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500" />
                Premium property review dashboard
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                onClick={() => {
                  console.log('🔄 Refresh button clicked');
                  fetchProperties();
                }}
                variant="outline"
                size="sm"
                className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 hover:from-blue-100 hover:to-purple-100"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Badge className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 shadow-lg">
                <User className="w-4 h-4 mr-2" />
                Admin Control Center
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Dashboard */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Total Properties */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 transform group">
            <CardContent className="p-4 sm:p-6 relative z-10">
              <div className="flex items-center justify-between mb-2">
                <Home className="w-8 h-8 sm:w-10 sm:h-10 text-blue-200 group-hover:scale-110 transition-transform duration-300" />
                <div className="text-right">
                  <p className="text-blue-100 text-xs sm:text-sm font-medium">Total Properties</p>
                  <p className="text-2xl sm:text-4xl font-bold">{statusCounts.total}</p>
                </div>
              </div>
              <div className="w-full bg-blue-400/30 rounded-full h-2">
                <div className="bg-white/80 h-2 rounded-full w-full"></div>
              </div>
            </CardContent>
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          </Card>

          {/* Pending Review */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 transform group">
            <CardContent className="p-4 sm:p-6 relative z-10">
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-8 h-8 sm:w-10 sm:h-10 text-amber-200 group-hover:scale-110 transition-transform duration-300 animate-pulse" />
                <div className="text-right">
                  <p className="text-amber-100 text-xs sm:text-sm font-medium">Pending</p>
                  <p className="text-2xl sm:text-4xl font-bold">{statusCounts.pending}</p>
                </div>
              </div>
              <div className="w-full bg-amber-400/30 rounded-full h-2">
                <div className="bg-white/80 h-2 rounded-full" style={{width: `${statusCounts.total > 0 ? (statusCounts.pending / statusCounts.total) * 100 : 0}%`}}></div>
              </div>
            </CardContent>
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          </Card>

          {/* Approved */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-emerald-500 via-green-600 to-teal-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 transform group">
            <CardContent className="p-4 sm:p-6 relative z-10">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-200 group-hover:scale-110 transition-transform duration-300" />
                <div className="text-right">
                  <p className="text-emerald-100 text-xs sm:text-sm font-medium">Approved</p>
                  <p className="text-2xl sm:text-4xl font-bold">{statusCounts.approved}</p>
                </div>
              </div>
              <div className="w-full bg-emerald-400/30 rounded-full h-2">
                <div className="bg-white/80 h-2 rounded-full" style={{width: `${statusCounts.total > 0 ? (statusCounts.approved / statusCounts.total) * 100 : 0}%`}}></div>
              </div>
            </CardContent>
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          </Card>

          {/* Rejected */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-red-500 via-rose-600 to-pink-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 transform group">
            <CardContent className="p-4 sm:p-6 relative z-10">
              <div className="flex items-center justify-between mb-2">
                <XCircle className="w-8 h-8 sm:w-10 sm:h-10 text-red-200 group-hover:scale-110 transition-transform duration-300" />
                <div className="text-right">
                  <p className="text-red-100 text-xs sm:text-sm font-medium">Rejected</p>
                  <p className="text-2xl sm:text-4xl font-bold">{statusCounts.rejected}</p>
                </div>
              </div>
              <div className="w-full bg-red-400/30 rounded-full h-2">
                <div className="bg-white/80 h-2 rounded-full" style={{width: `${statusCounts.total > 0 ? (statusCounts.rejected / statusCounts.total) * 100 : 0}%`}}></div>
              </div>
            </CardContent>
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          </Card>
        </div>

        {/* Ultra Modern Properties Section */}
        <Card className="bg-white/95 backdrop-blur-lg shadow-2xl border-0 overflow-hidden rounded-2xl">
          <CardHeader className="border-b border-slate-200/60 bg-gradient-to-r from-slate-50/80 via-blue-50/40 to-purple-50/40 backdrop-blur-sm">
            <CardTitle className="flex items-center text-slate-800 text-xl font-bold">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-3">
                <Filter className="w-5 h-5 text-white" />
              </div>
              Property Control Center
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={(value) => {
              console.log('📑 Tab changed to:', value);
              setActiveTab(value);
            }} className="w-full">
              <div className="px-4 sm:px-6 pt-4 sm:pt-6">
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 bg-gradient-to-r from-slate-100 to-slate-200 p-1.5 rounded-2xl h-auto shadow-inner">
                  <TabsTrigger 
                    value="pending" 
                    className="data-[state=active]:bg-white data-[state=active]:shadow-lg rounded-xl py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold transition-all duration-300 data-[state=active]:scale-105"
                  >
                    <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Pending</span>
                    <span className="sm:hidden">({statusCounts.pending})</span>
                    <Badge className="hidden sm:inline ml-2 bg-amber-500 text-white text-xs">
                      {statusCounts.pending}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="approved" 
                    className="data-[state=active]:bg-white data-[state=active]:shadow-lg rounded-xl py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold transition-all duration-300 data-[state=active]:scale-105"
                  >
                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Approved</span>
                    <span className="sm:hidden">({statusCounts.approved})</span>
                    <Badge className="hidden sm:inline ml-2 bg-emerald-500 text-white text-xs">
                      {statusCounts.approved}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="rejected" 
                    className="data-[state=active]:bg-white data-[state=active]:shadow-lg rounded-xl py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold transition-all duration-300 data-[state=active]:scale-105"
                  >
                    <XCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Rejected</span>
                    <span className="sm:hidden">({statusCounts.rejected})</span>
                    <Badge className="hidden sm:inline ml-2 bg-red-500 text-white text-xs">
                      {statusCounts.rejected}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="all" 
                    className="data-[state=active]:bg-white data-[state=active]:shadow-lg rounded-xl py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold transition-all duration-300 data-[state=active]:scale-105"
                  >
                    <Home className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">All</span>
                    <span className="sm:hidden">({statusCounts.total})</span>
                    <Badge className="hidden sm:inline ml-2 bg-slate-500 text-white text-xs">
                      {statusCounts.total}
                    </Badge>
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Tab Content */}
              <div className="p-4 sm:p-6">
                <TabsContent value="pending" className="mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredProperties.length > 0 ? (
                      filteredProperties.map((property) => (
                        <PropertyReviewCard 
                          key={property.propertyId} 
                          property={property} 
                          onAction={handlePropertyAction}
                        />
                      ))
                    ) : (
                      <div className="col-span-full text-center py-12">
                        <Clock className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-slate-600 mb-2">No Pending Properties</h3>
                        <p className="text-slate-500">All properties have been reviewed.</p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="approved" className="mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredProperties.length > 0 ? (
                      filteredProperties.map((property) => (
                        <PropertyReviewCard 
                          key={property.propertyId} 
                          property={property} 
                          onAction={handlePropertyAction}
                        />
                      ))
                    ) : (
                      <div className="col-span-full text-center py-12">
                        <CheckCircle className="w-16 h-16 text-emerald-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-slate-600 mb-2">No Approved Properties</h3>
                        <p className="text-slate-500">No properties have been approved yet.</p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="rejected" className="mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredProperties.length > 0 ? (
                      filteredProperties.map((property) => (
                        <PropertyReviewCard 
                          key={property.propertyId} 
                          property={property} 
                          onAction={handlePropertyAction}
                        />
                      ))
                    ) : (
                      <div className="col-span-full text-center py-12">
                        <XCircle className="w-16 h-16 text-red-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-slate-600 mb-2">No Rejected Properties</h3>
                        <p className="text-slate-500">No properties have been rejected yet.</p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="all" className="mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredProperties.length > 0 ? (
                      filteredProperties.map((property) => (
                        <PropertyReviewCard 
                          key={property.propertyId} 
                          property={property} 
                          onAction={handlePropertyAction}
                        />
                      ))
                    ) : (
                      <div className="col-span-full text-center py-12">
                        <Home className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-slate-600 mb-2">No Properties Found</h3>
                        <p className="text-slate-500">No properties are available at the moment.</p>
                        <Button 
                          onClick={fetchProperties}
                          variant="outline" 
                          className="mt-4 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 hover:from-blue-100 hover:to-purple-100"
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Refresh Properties
                        </Button>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminPage;

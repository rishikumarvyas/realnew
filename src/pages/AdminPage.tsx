import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  MapPin, 
  Home, 
  Bed, 
  Bath, 
  Calendar,
  User,
  Check,
  X,
  Eye,
  Filter
} from 'lucide-react';
import PropertyReviewCard from '@/components/PropertyReviewCard';
import axiosInstance from '@/axiosCalls/axiosInstance';

interface Property {
  propertyId: string;
  superCategory: string;
  propertyType: string;
  statusId: string;
  title: string;
  // Add other fields as needed from your API
}

const AdminPage = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [activeTab, setActiveTab] = useState("pending");
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(-1);

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      try {
        const body = {
          superCategoryId: 0,
          propertyTypeIds: [],
          statusId: 1,
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
        const response = await axiosInstance.post('/api/Account/GetProperty', body);
        console.log('AdminPage API Response:', response.data);
        setProperties(response.data?.propertyInfo || []);
      } catch (error) {
        toast({ title: 'Error', description: 'Failed to fetch properties', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, [pageNumber, pageSize]);

  // Dummy status mapping for tabs (since API statusId is string '1')
  const getFilteredProperties = (status: string) => {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Property Review Dashboard</h1>
              <p className="text-slate-600 mt-1">Review and manage submitted properties</p>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="outline" className="px-3 py-1">
                <User className="w-4 h-4 mr-2" />
                Admin Panel
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Total Properties</p>
                  <p className="text-3xl font-bold">{statusCounts.total}</p>
                </div>
                <Home className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100">Pending Review</p>
                  <p className="text-3xl font-bold">{statusCounts.pending}</p>
                </div>
                <Calendar className="w-8 h-8 text-yellow-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Approved</p>
                  <p className="text-3xl font-bold">{statusCounts.approved}</p>
                </div>
                <Check className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100">Rejected</p>
                  <p className="text-3xl font-bold">{statusCounts.rejected}</p>
                </div>
                <X className="w-8 h-8 text-red-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Properties Tabs */}
        <Card className="bg-white shadow-lg">
          <CardHeader className="border-b border-slate-200">
            <CardTitle className="flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              Property Reviews
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-slate-50 p-1 m-6 rounded-lg">
                <TabsTrigger value="pending" className="data-[state=active]:bg-white">
                  Pending ({statusCounts.pending})
                </TabsTrigger>
                <TabsTrigger value="approved" className="data-[state=active]:bg-white">
                  Approved ({statusCounts.approved})
                </TabsTrigger>
                <TabsTrigger value="rejected" className="data-[state=active]:bg-white">
                  Rejected ({statusCounts.rejected})
                </TabsTrigger>
                <TabsTrigger value="all" className="data-[state=active]:bg-white">
                  All ({statusCounts.total})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="pending" className="p-6 pt-0">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {getFilteredProperties("pending").map(property => (
                    <PropertyReviewCard
                      key={property.propertyId}
                      property={property}
                      // onAction={handlePropertyAction} // implement as needed
                    />
                  ))}
                </div>
                {getFilteredProperties("pending").length === 0 && (
                  <div className="text-center py-12">
                    <Check className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <p className="text-slate-500 text-lg">No pending properties to review!</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="approved" className="p-6 pt-0">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {getFilteredProperties("approved").map(property => (
                    <PropertyReviewCard
                      key={property.propertyId}
                      property={property}
                      // onAction={handlePropertyAction}
                    />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="rejected" className="p-6 pt-0">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {getFilteredProperties("rejected").map(property => (
                    <PropertyReviewCard
                      key={property.propertyId}
                      property={property}
                      // onAction={handlePropertyAction}
                    />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="all" className="p-6 pt-0">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {getFilteredProperties("all").map(property => (
                    <PropertyReviewCard
                      key={property.propertyId}
                      property={property}
                      // onAction={handlePropertyAction}
                    />
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminPage;
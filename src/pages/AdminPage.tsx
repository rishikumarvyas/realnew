import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import PropertyReviewCard from "@/components/PropertyReviewCard";
import {
  Home,
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Star,
  User,
  RefreshCw,
  Calendar,
  TrendingUp,
} from "lucide-react";
import { useApiCache } from "@/hooks/use-api-cache";
import debounce from "lodash/debounce";
import axiosInstance from "@/axiosCalls/axiosInstance";
import { useAuth } from "@/contexts/AuthContext";

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
  mainImageUrl?: string;
  locality?: string;
  address?: string;
  city?: string;
  bedroom?: number;
  bathroom?: number;
  likeCount?: number;
  submittedBy?: string;
}

// API Response interface for GetProperty
interface GetPropertyResponse {
  statusCode: number;
  message: string;
  count: number;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  propertyInfo: Property[];
}

const AdminPage = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [activeTab, setActiveTab] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState("all");
  const [counts, setCounts] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const { toast } = useToast();
  const { cachedApiCall, clearCache } = useApiCache();
  const { createNotification, refreshNotifications } = useAuth();


  // OPTIMIZED: Single API call to get all properties and counts from GetProperty API
  // Uses StatusId=0 to get all properties and extracts count data from API response
  // This eliminates the need for separate API calls for counting
  const fetchAllProperties = useCallback(async () => {
    setLoading(true);

    try {
      // Make single API call to get all properties and counts
      const cacheKey = `admin_all_properties_date_${dateFilter}`;
      
      const result = await cachedApiCall(cacheKey, async () => {
        // Convert dateFilter to lastMonth value for API
        const getLastMonthValue = () => {
          switch (dateFilter) {
            case "1month":
              return 1;
            case "2months":
              return 2;
            case "3months":
              return 3;
            case "all":
            default:
              return 0; // 0 means all time
          }
        };

        const baseBody = {
          superCategoryId: 0,
          propertyTypeIds: [],
          accountId: "",
          searchTerm: "",
          StatusId: 0, // Get all properties regardless of status
          lastMonth: getLastMonthValue(),
          minPrice: 0,
          maxPrice: 0,
          bedroom: 0,
          balcony: 0,
          minArea: 0,
          maxArea: 0,
          pageNumber: 1,
          pageSize: -1, // Get all properties
        };

        try {
          const response = await axiosInstance.post<GetPropertyResponse>(
            "/api/Account/GetProperty",
            baseBody,
          );

          const properties = response.data?.propertyInfo || [];
          
          return {
            properties: properties.map((property) => ({
              ...property,
              statusId: String(property.statusId),
            })),
            counts: {
              total: response.data?.count || 0,
              pending: response.data?.pendingCount || 0,
              approved: response.data?.approvedCount || 0,
              rejected: response.data?.rejectedCount || 0,
            }
          };
        } catch (error) {

          return { properties: [], counts: { total: 0, pending: 0, approved: 0, rejected: 0 } };
        }
      });

      setProperties(result.properties);
      setCounts(result.counts);

      if (result.properties.length === 0) {
        toast({
          title: "No Properties Found",
          description: "There are no properties available at the moment.",
          variant: "default",
        });
      }
    } catch (error) {

      toast({
        title: "Error",
        description: "Failed to fetch properties. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [dateFilter, cachedApiCall]); // Added dateFilter and cachedApiCall dependencies

  // Effect to fetch properties when date filter changes
  useEffect(() => {
    fetchAllProperties();
  }, [dateFilter, fetchAllProperties]);



  // INITIAL LOAD: Fetch properties immediately on mount
  useEffect(() => {
    fetchAllProperties();
  }, []); // Only run once on mount

  // OPTIMIZED: Handle property action with selective updates (no duplicate API calls)
  const handlePropertyAction = useCallback(
    async (propertyId: string, action: string, newStatus: string) => {
      try {
        // OPTIMIZED: Update only the affected property instead of refetching all
        setProperties((prevProperties) => {
          return prevProperties.map((property) => {
            if (property.propertyId === propertyId) {
              return {
                ...property,
                statusId: newStatus,
              };
            }
            return property;
          });
        });

        // Clear cache to ensure fresh data
        clearCache(`admin_all_properties_date_${dateFilter}`);

        // Refresh the data to get updated counts
        await fetchAllProperties();

        // Switch to appropriate tab based on new status
        switch (newStatus) {
          case "2": // Approved
            setActiveTab("approved");
            break;
          case "3": // Rejected
            setActiveTab("rejected");
            break;
          case "1": // Pending
            setActiveTab("pending");
            break;
        }

        const actionMessages = {
          approve: "Property approved successfully!",
          reject: "Property rejected successfully!",
          revoke: "Property approval revoked successfully!",
          reconsider: "Property moved for reconsideration!",
        };

        toast({
          title: "✅ Success!",
          description:
            actionMessages[action as keyof typeof actionMessages] ||
            "Action completed successfully!",
          className: "bg-green-50 border-green-200 text-green-800",
        });
      } catch (error) {

        toast({
          title: "❌ Error",
          description: `Failed to ${action} property. Please try again.`,
          variant: "destructive",
        });
      }
    },
    [clearCache, dateFilter, fetchAllProperties],
  ); // Added fetchAllProperties dependency

  // OPTIMIZED: Manual refresh function
  const handleManualRefresh = useCallback(async () => {
    // Clear admin-related cache
    clearCache(`admin_all_properties_date_${dateFilter}`);

    // Fetch fresh data
    await fetchAllProperties();

    toast({
      title: "✅ Refreshed",
      description: "Property data has been refreshed successfully.",
      className: "bg-blue-50 border-blue-200 text-blue-800",
    });
  }, [clearCache, fetchAllProperties, dateFilter]); // Added dateFilter dependency

  const handleApproveProperty = async (propertyId: string, propertyTitle: string, ownerId: string) => {
    try {
      const response = await axiosInstance.put(`/api/Account/UpdatePropertyStatus`, {
        propertyId: propertyId,
        statusId: 2, // Approved status
        accountId: ownerId
      });

      if (response.data.statusCode === 200) {
        toast({
          title: "Property Approved",
          description: "Property has been approved and is now live.",
        });

        // Refresh the properties list
        fetchAllProperties();
      } else {
        throw new Error(response.data.message || "Failed to approve property");
      }
    } catch (error) {

      toast({
        title: "Error",
        description: "Failed to approve property. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRejectProperty = async (propertyId: string, propertyTitle: string, ownerId: string) => {
    try {
      const response = await axiosInstance.put(`/api/Account/UpdatePropertyStatus`, {
        propertyId: propertyId,
        statusId: 3, // Rejected status
        accountId: ownerId
      });

      if (response.data.statusCode === 200) {
        toast({
          title: "Property Rejected",
          description: "Property has been rejected. Owner will be notified.",
        });

        // Refresh the properties list
        fetchAllProperties();
      } else {
        throw new Error(response.data.message || "Failed to reject property");
      }
    } catch (error) {

      toast({
        title: "Error",
        description: "Failed to reject property. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Filter properties based on status (no date filtering needed as API handles it)
  const getFilteredProperties = useCallback(
    (tab: string) => {
      if (!properties || properties.length === 0) {
        return [];
      }

      // For 'all' tab, return all properties
      if (tab === "all") {
        return properties;
      }

      const statusMap = {
        pending: "1",
        approved: "2",
        rejected: "3",
      };

      const targetStatus = statusMap[tab as keyof typeof statusMap];
      // Filter properties by status
      const statusFiltered = properties.filter((property) => {
        const matches = property.statusId === targetStatus;
        if (matches) {
        }
        return matches;
      });
      return statusFiltered;
    },
    [properties],
  );

  // Use counts from API response instead of calculating locally
  const statusCounts = counts;
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
      {/* Modern Header */}
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
              {/* Date Filter */}
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-[140px] bg-white border-slate-300">
                  <Calendar className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="1month">Last Month</SelectItem>
                  <SelectItem value="2months">Last 2 Months</SelectItem>
                  <SelectItem value="3months">Last 3 Months</SelectItem>
                </SelectContent>
              </Select>

              <Button
                onClick={handleManualRefresh}
                variant="outline"
                size="sm"
                className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 hover:from-blue-100 hover:to-purple-100"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>



              <Badge className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 shadow-lg">
                <User className="w-4 h-4 mr-2" />
                Admin
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
                  <p className="text-blue-100 text-xs sm:text-sm font-medium">
                    Total Properties
                  </p>
                  <p className="text-2xl sm:text-4xl font-bold">
                    {statusCounts.total}
                  </p>
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
                  <p className="text-amber-100 text-xs sm:text-sm font-medium">
                    Pending
                  </p>
                  <p className="text-2xl sm:text-4xl font-bold">
                    {statusCounts.pending}
                  </p>
                </div>
              </div>
              <div className="w-full bg-amber-400/30 rounded-full h-2">
                <div
                  className="bg-white/80 h-2 rounded-full"
                  style={{
                    width: `${statusCounts.total > 0 ? (statusCounts.pending / statusCounts.total) * 100 : 0}%`,
                  }}
                ></div>
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
                  <p className="text-emerald-100 text-xs sm:text-sm font-medium">
                    Approved
                  </p>
                  <p className="text-2xl sm:text-4xl font-bold">
                    {statusCounts.approved}
                  </p>
                </div>
              </div>
              <div className="w-full bg-emerald-400/30 rounded-full h-2">
                <div
                  className="bg-white/80 h-2 rounded-full"
                  style={{
                    width: `${statusCounts.total > 0 ? (statusCounts.approved / statusCounts.total) * 100 : 0}%`,
                  }}
                ></div>
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
                  <p className="text-red-100 text-xs sm:text-sm font-medium">
                    Rejected
                  </p>
                  <p className="text-2xl sm:text-4xl font-bold">
                    {statusCounts.rejected}
                  </p>
                </div>
              </div>
              <div className="w-full bg-red-400/30 rounded-full h-2">
                <div
                  className="bg-white/80 h-2 rounded-full"
                  style={{
                    width: `${statusCounts.total > 0 ? (statusCounts.rejected / statusCounts.total) * 100 : 0}%`,
                  }}
                ></div>
              </div>
            </CardContent>
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          </Card>
        </div>

        {/* Properties Section */}
        <Card className="bg-white/95 backdrop-blur-lg shadow-2xl border-0 overflow-hidden rounded-2xl">
          <CardHeader className="border-b border-slate-200/60 bg-gradient-to-r from-slate-50/80 via-blue-50/40 to-purple-50/40 backdrop-blur-sm">
            <CardTitle className="flex items-center justify-between text-slate-800 text-xl font-bold">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-3">
                  <Filter className="w-5 h-5 text-white" />
                </div>
                Property Control Center
              </div>
              <div className="flex items-center text-sm text-slate-600">
                <TrendingUp className="w-4 h-4 mr-2" />
                {dateFilter === "all"
                  ? "All Time"
                  : `Last ${dateFilter.replace("months", " Months").replace("month", " Month")}`}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs
              value={activeTab}
              onValueChange={(value) => {
                setActiveTab(value);
              }}
              className="w-full"
            >
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
                {["pending", "approved", "rejected", "all"].map((tabValue) => (
                  <TabsContent key={tabValue} value={tabValue} className="mt-0">
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
                          {tabValue === "pending" && (
                            <Clock className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                          )}
                          {tabValue === "approved" && (
                            <CheckCircle className="w-16 h-16 text-emerald-300 mx-auto mb-4" />
                          )}
                          {tabValue === "rejected" && (
                            <XCircle className="w-16 h-16 text-red-300 mx-auto mb-4" />
                          )}
                          {tabValue === "all" && (
                            <Home className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                          )}
                          <h3 className="text-lg font-semibold text-slate-600 mb-2">
                            No{" "}
                            {tabValue === "all"
                              ? ""
                              : tabValue.charAt(0).toUpperCase() +
                                tabValue.slice(1)}{" "}
                            Properties
                          </h3>
                          <p className="text-slate-500">
                            {tabValue === "pending" &&
                              "All properties have been reviewed."}
                            {tabValue === "approved" &&
                              "No properties have been approved yet."}
                            {tabValue === "rejected" &&
                              "No properties have been rejected yet."}
                            {tabValue === "all" &&
                              "No properties are available at the moment."}
                          </p>
                          {tabValue === "all" && (
                            <Button
                              onClick={handleManualRefresh}
                              variant="outline"
                              className="mt-4 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 hover:from-blue-100 hover:to-purple-100"
                            >
                              <RefreshCw className="w-4 h-4 mr-2" />
                              Refresh Properties
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </TabsContent>
                ))}
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminPage;

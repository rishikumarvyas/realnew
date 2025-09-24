import { useState, useEffect } from "react";
import axios from "axios";
import { PropertyCard } from "@/components/PropertyCard";
import { Button } from "@/components/ui/button";
import { Loader2, Home } from "lucide-react";
import { Card } from "@/components/ui/card";
import axiosInstance from "../axiosCalls/axiosInstance";

// API interfaces
interface ApiResponse {
  statusCode: number;
  message: string;
  count: number;
  propertyInfo: ApiProperty[];
}

interface ApiProperty {
  propertyId: string;
  title: string;
  price: number;
  city: string;
  superCategory: string;
  propertyType: string;
  bedroom: number;
  bathroom: number;
  balcony: number;
  area: number;
  mainImageUrl: string | null;
  availableFrom?: string; // ISO date string
  preferenceId?: number; // Tenant preference ID
  amenities?: string[]; // Array of amenity strings
  furnished?: string; // "Fully", "Semi", "Not" furnished status
  likeCount?: number; // Optional like count
  statusId: number; // Add StatusId field
}

// Property card props type
interface PropertyCardProps {
  id: string;
  title: string;
  price: number;
  location: string;
  type: "buy" | "sell" | "rent";
  bedrooms: number;
  bathrooms: number;
  balcony: number;
  area: number;
  image: string;
  availableFrom?: string;
  preferenceId?: number;
  amenities?: string[];
  furnished?: string;
  formattedPrice?: string;
  likeCount?: number;
  statusId?: number; // Add StatusId to props
}

// Filter options interface for API request
interface FilterOptions {
  searchTerm: string;
  minPrice: number;
  maxPrice: number;
  minBedrooms: number;
  minBathrooms: number;
  minBalcony: number;
  minArea: number;
  maxArea: number;
}

const AllProperty = () => {
  const [properties, setProperties] = useState<PropertyCardProps[]>([]);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const pageSize = 9; // fetch 9 properties per request
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch properties from API
  const fetchProperties = async (page = 1, append = false) => {
    // If fetching next page, use loadingMore state instead of main loading
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    try {
      // Filter options - StatusId will be sent directly in API
      const filterOptions: FilterOptions = {
        searchTerm: "",
        minPrice: 0,
        maxPrice: 0,
        minBedrooms: 0,
        minBathrooms: 0,
        minBalcony: 0,
        minArea: 0,
        maxArea: 0,
      };

      // You can set superCategoryId here to filter by property type
      // 0 for all, 1 for buy, 2 for rent, 3 for sell
      const superCategoryId = 0;

      const response = await axiosInstance.post<ApiResponse>(
        "https://homeyatraapi.azurewebsites.net/api/Account/GetProperty",
        {
          superCategoryId: superCategoryId,
          propertyTypeIds: [],
          accountId: "",
          searchTerm: filterOptions.searchTerm,
          StatusId: 2, // Direct StatusId parameter in API
          minPrice: filterOptions.minPrice,
          maxPrice: filterOptions.maxPrice,
          bedroom: filterOptions.minBedrooms,
          balcony: filterOptions.minBalcony,
          minArea: filterOptions.minArea,
          maxArea: filterOptions.maxArea,
          pageNumber: page,
          pageSize: pageSize,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // API will return only StatusId = 2 properties, no need for client-side filtering
      const fetched = response.data.propertyInfo;

      // Transform API data to our property format
      const transformedData = fetched.map(
        (prop): PropertyCardProps => ({
          id: prop.propertyId,
          title: prop.title,
          price: prop.price,
          location: prop.city,
          type: prop.superCategory.toLowerCase() as "buy" | "sell" | "rent",
          bedrooms: prop.bedroom,
          bathrooms: prop.bathroom,
          balcony: prop.balcony,
          area: prop.area,
          image:
            prop.mainImageUrl ||
            "https://via.placeholder.com/400x300?text=No+Image",
          availableFrom: prop.availableFrom,
          preferenceId: prop.preferenceId,
          amenities: prop.amenities,
          furnished: prop.furnished,
          likeCount: prop.likeCount || 0,
          statusId: prop.statusId,
        })
      );
      // Clear any previous error when we have a successful response
      setError(null);

      if (append) {
        // Append while avoiding duplicates (by id)
        setProperties((prev) => {
          const existingIds = new Set(prev.map((p) => p.id));
          const deduped = transformedData.filter((p) => !existingIds.has(p.id));
          return [...prev, ...deduped];
        });
      } else {
        setProperties(transformedData);
      }

      // If fewer items returned than pageSize, no more pages
      setHasMore(fetched.length === pageSize);
    } catch (err) {
      setError("Unable to load properties. Please try again later.");

      // API failed - no fallback to mock data
    } finally {
      // Ensure both loading flags are reset appropriately. Use a single reset
      // so we won't accidentally leave the button stuck on 'Loading'.
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Removed mock data - only using actual API properties

  // Format price display based on property type
  const formatPrice = (price: number, type: string) => {
    if (type === "rent") {
      return `₹${price.toLocaleString()}/month`;
    }
    return `₹${price.toLocaleString()}`;
  };

  // Load properties on component mount
  useEffect(() => {
    // load first page
    fetchProperties(1, false);
  }, []);

  // Handler to load next page
  const loadMore = async () => {
    if (!hasMore) {
      return;
    }
    const nextPage = pageNumber + 1;
    try {
      await fetchProperties(nextPage, true);
      setPageNumber(nextPage);
    } catch (e) {
      // fetchProperties already sets error state
    }
  };

  // Retry handler for error state - reload first page
  const retry = async () => {
    setPageNumber(1);
    setHasMore(true);
    await fetchProperties(1, false);
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 bg-gray-50">
      <div className="text-center mb-8 sm:mb-10">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-2 sm:mb-3">
          Find Your Perfect Property
        </h1>
        <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto px-4">
          Discover active properties that fit your lifestyle and budget
        </p>
      </div>

      <div className="mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
          {loading ? (
            <span className="flex items-center">
              <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 mr-2 animate-spin" />
              <span className="text-sm sm:text-base">
                Loading active properties...
              </span>
            </span>
          ) : (
            "Active Properties"
          )}
        </h2>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-8 text-center bg-red-50 rounded-lg mb-8">
          <p className="text-red-600">{error}</p>
          <Button onClick={retry} variant="outline" className="mt-4">
            Try Again
          </Button>
        </div>
      )}

      {/* Empty state */}
      {!loading && properties.length === 0 && !error && (
        <div className="p-12 text-center bg-gray-50 rounded-lg mb-8">
          <Home className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-800 mb-2">
            No active properties found
          </h3>
          <p className="text-gray-600 mb-4">
            There are currently no active properties available with StatusId =
            2.
          </p>
        </div>
      )}

      {/* Results grid - improved responsive layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
        {loading
          ? // Loading skeletons - show 3 for desktop, 2 for mobile
            Array(6)
              .fill(0)
              .map((_, index) => (
                <Card
                  key={index}
                  className="overflow-hidden shadow-md rounded-xl sm:rounded-2xl"
                >
                  <div className="h-48 sm:h-56 md:h-64 bg-gray-200 animate-pulse" />
                  <div className="p-4 sm:p-5 md:p-6 space-y-2 sm:space-y-3">
                    <div className="h-3 sm:h-4 bg-gray-200 rounded animate-pulse" />
                    <div className="h-5 sm:h-6 bg-gray-200 rounded animate-pulse w-3/4" />
                    <div className="flex justify-between">
                      <div className="h-3 sm:h-4 bg-gray-200 rounded animate-pulse w-1/4" />
                      <div className="h-3 sm:h-4 bg-gray-200 rounded animate-pulse w-1/4" />
                    </div>
                  </div>
                </Card>
              ))
          : properties.map((property) => (
              <PropertyCard
                key={property.id}
                {...property}
                likeCount={property.likeCount}
                formattedPrice={formatPrice(property.price, property.type)}
              />
            ))}
      </div>

      {/* View More button */}
      {!loading && hasMore && !error && (
        <div className="text-center mt-6">
          <Button
            onClick={loadMore}
            className="inline-flex items-center bg-blue-500 rounded-full hover:bg-blue-700 text-white"
            variant="default"
            disabled={loadingMore}
          >
            {loadingMore ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              "View More"
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default AllProperty;

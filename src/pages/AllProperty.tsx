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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch properties from API
  const fetchProperties = async () => {
    setLoading(true);
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
          pageNumber: 1,
          pageSize: -1,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // API will return only StatusId = 2 properties, no need for client-side filtering
      const filteredProperties = response.data.propertyInfo;

      // Transform API data to our property format
      const transformedData = filteredProperties.map((prop): PropertyCardProps => ({
        id: prop.propertyId,
        title: prop.title,
        price: prop.price,
        location: prop.city,
        type: prop.superCategory.toLowerCase() as "buy" | "sell" | "rent",
        bedrooms: prop.bedroom,
        bathrooms: prop.bathroom,
        balcony: prop.balcony,
        area: prop.area,
        image: prop.mainImageUrl || "https://via.placeholder.com/400x300?text=No+Image",
        availableFrom: prop.availableFrom,
        preferenceId: prop.preferenceId,
        amenities: prop.amenities,
        furnished: prop.furnished,
        likeCount: prop.likeCount || 0,
        statusId: prop.statusId,
      }));

      setProperties(transformedData);
    } catch (err) {
      console.error("Failed to fetch properties:", err);
      setError("Unable to load properties. Please try again later.");
      
      // If API fails, use mock data for development/demo purposes
      useMockData();
    } finally {
      setLoading(false);
    }
  };

  // Enhanced mock data for fallback or development
  const useMockData = () => {
    const mockProperties: PropertyCardProps[] = [
      {
        id: "prop1",
        title: "Modern 3BHK with Sea View",
        price: 7500000,
        location: "Bandra West, Mumbai",
        type: "buy",
        bedrooms: 3,
        bathrooms: 3,
        balcony: 1,
        area: 1450,
        image: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&q=80",
        amenities: ["Parking", "Security", "Power Backup"],
        furnished: "Fully",
        statusId: 2
      },
      {
        id: "prop2",
        title: "Luxury 4BHK Penthouse",
        price: 12500000,
        location: "Worli, Mumbai",
        type: "buy",
        bedrooms: 4,
        bathrooms: 4,
        balcony: 2,
        area: 2100,
        image: "https://images.unsplash.com/photo-1466442929976-97f336a657be?auto=format&fit=crop&q=80",
        amenities: ["Swimming Pool", "Gym", "Club House", "Parking"],
        furnished: "Fully",
        statusId: 2
      },
      {
        id: "prop3",
        title: "Studio Apartment with Balcony",
        price: 35000,
        location: "Koramangala, Bangalore",
        type: "rent",
        bedrooms: 1,
        bathrooms: 1,
        balcony: 1,
        area: 650,
        image: "https://images.unsplash.com/photo-1721322800607-8c38375eef04?auto=format&fit=crop&q=80",
        availableFrom: "2025-05-15T00:00:00",
        preferenceId: 2, // Bachelor
        amenities: ["WiFi", "Power Backup"],
        furnished: "Semi",
        statusId: 2
      },
      {
        id: "prop4",
        title: "Spacious 2BHK Apartment",
        price: 5600000,
        location: "Powai, Mumbai",
        type: "buy",
        bedrooms: 2,
        bathrooms: 2,
        balcony: 1,
        area: 1050,
        image: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?auto=format&fit=crop&q=80",
        amenities: ["Parking", "Security"],
        furnished: "Semi",
        statusId: 2
      },
      {
        id: "prop5",
        title: "Elegant 3BHK Villa",
        price: 48000,
        location: "Whitefield, Bangalore",
        type: "rent",
        bedrooms: 3,
        bathrooms: 3,
        balcony: 2,
        area: 1800,
        image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80",
        availableFrom: "2025-06-01T00:00:00",
        preferenceId: 1, // Family
        amenities: ["Garden", "Parking", "Security"],
        furnished: "Fully",
        statusId: 2
      },
    ];
    
    setProperties(mockProperties);
  };

  // Format price display based on property type
  const formatPrice = (price: number, type: string) => {
    if (type === "rent") {
      return `₹${price.toLocaleString()}/month`;
    }
    return `₹${price.toLocaleString()}`;
  };

  // Load properties on component mount
  useEffect(() => {
    fetchProperties();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 bg-gray-50">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-primary mb-3">Find Your Perfect Property</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Discover active properties that fit your lifestyle and budget
        </p>
      </div>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          {loading ? (
            <span className="flex items-center">
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Loading active properties...
            </span>
          ) : (
            `${properties.length} Active Properties Found`
          )}
        </h2>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-8 text-center bg-red-50 rounded-lg mb-8">
          <p className="text-red-600">{error}</p>
          <Button 
            onClick={fetchProperties} 
            variant="outline" 
            className="mt-4"
          >
            Try Again
          </Button>
        </div>
      )}

      {/* Empty state */}
      {!loading && properties.length === 0 && !error && (
        <div className="p-12 text-center bg-gray-50 rounded-lg mb-8">
          <Home className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-800 mb-2">No active properties found</h3>
          <p className="text-gray-600 mb-4">
            There are currently no active properties available with StatusId = 2.
          </p>
        </div>
      )}

      {/* Results grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          // Loading skeletons
          Array(6).fill(0).map((_, index) => (
            <Card key={index} className="overflow-hidden shadow-md rounded-lg">
              <div className="h-48 bg-gray-200 animate-pulse" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
                <div className="h-6 bg-gray-200 rounded animate-pulse w-3/4" />
                <div className="flex justify-between">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4" />
                </div>
              </div>
            </Card>
          ))
        ) : (
          properties.map((property) => (
            <PropertyCard
              key={property.id}
              {...property}
              likeCount={property.likeCount}
              formattedPrice={formatPrice(property.price, property.type)}
            />
          ))
        )}
      </div>


 
    </div>
  );
};

export default AllProperty;


import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { PropertyCard, PropertyCardProps } from "@/components/PropertyCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { 
  Search, 
  FilterX, 
  Loader2, 
  Home, 
  DollarSign, 
  Calendar, 
  Users, 
  Bed, 
  Bath, 
  Ruler, 
  CheckSquare,
  LayoutDashboard,
  ChevronDown,
  ChevronUp,
  Plus,
  Minus,
  X
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

// API interfaces
interface ApiResponse {
  statusCode: number;
  message: string;
  propertyInfo: ApiProperty[];
}

interface ApiProperty {
  propertyId: string;
  title: string;
  price: number;
  city: string;
  superCategory: string;
  bedroom: number;
  bathroom: number;
  balcony: number;
  area: number;
  mainImageUrl: string | null;
  availableFrom?: string; // ISO date string
  preferenceId?: number; // Tenant preference ID
  amenities?: string[]; // Array of amenity strings
  furnished?: string; // "Fully", "Semi", "Not" furnished status
}

// Filter options interface
interface FilterOptions {
  searchTerm: string;
  minPrice: number;
  maxPrice: number;
  minBedrooms: number;
  minBathrooms: number;
  minBalcony: number;
  minArea: number;
  maxArea: number;
  availableFrom?: string;
  preferenceId?: string;
  superCategoryId?: number;
  furnished?: string;
  amenities?: string[];
}

// Tenant preference mapping
const preferenceOptions = [
  { id: "0", label: "Any" },
  { id: "1", label: "Family" },
  { id: "2", label: "Bachelor" },
  { id: "3", label: "Company" },
  { id: "4", label: "Student" }
];

// Furnished status options
const furnishedOptions = [
  { id: "any", label: "Any" },
  { id: "fully", label: "Fully Furnished" },
  { id: "semi", label: "Semi Furnished" },
  { id: "not", label: "Unfurnished" }
];

// Common amenities
const amenityOptions = [
  "Parking", "Swimming Pool", "Gym", "Power Backup", 
  "Security", "Garden", "Club House", "WiFi", "Gas Pipeline"
];

const PropertyListing = () => {
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState<PropertyCardProps[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<PropertyCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Mobile filter visibility
  const [mobileFiltersVisible, setMobileFiltersVisible] = useState(false);
  
  // Active tab for property type
  const [activeTab, setActiveTab] = useState<string>("all");
  
  // Basic search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState([0, 20000000]);
  const [minBedrooms, setMinBedrooms] = useState(0);
  const [minBathrooms, setMinBathrooms] = useState(0);
  const [minBalcony, setMinBalcony] = useState(0);
  const [minArea, setMinArea] = useState(0);
  
  // Advanced filter states
  const [availableFrom, setAvailableFrom] = useState<Date | undefined>(undefined);
  const [preferenceId, setPreferenceId] = useState<string>("0"); // Default to "Any"
  const [furnished, setFurnished] = useState<string>("any");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  // UI state for advanced filters visibility
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  // Initialize from URL params and fetch data
  useEffect(() => {
    // Get parameters from URL
    const typeParam = searchParams.get("type");
    const searchParam = searchParams.get("search");
    const minPriceParam = searchParams.get("minPrice");
    const maxPriceParam = searchParams.get("maxPrice");
    const bedroomsParam = searchParams.get("bedrooms");
    const bathroomsParam = searchParams.get("bathrooms");
    const balconyParam = searchParams.get("balcony");
    const minAreaParam = searchParams.get("minArea");
    const availableFromParam = searchParams.get("availableFrom");
    const preferenceParam = searchParams.get("preference");
    const furnishedParam = searchParams.get("furnished");
    const amenitiesParam = searchParams.get("amenities");
    
    // Set state from URL params if they exist
    if (typeParam) {
      setActiveTab(typeParam);
    }
    
    if (searchParam) {
      setSearchQuery(searchParam);
      setSearchTerm(searchParam);
    }
    
    if (minPriceParam && maxPriceParam) {
      setPriceRange([parseInt(minPriceParam), parseInt(maxPriceParam)]);
    }
    
    if (bedroomsParam) {
      setMinBedrooms(parseInt(bedroomsParam));
    }
    
    if (bathroomsParam) {
      setMinBathrooms(parseInt(bathroomsParam));
    }

    if (balconyParam) {
      setMinBalcony(parseInt(balconyParam));
    }
    
    if (minAreaParam) {
      setMinArea(parseInt(minAreaParam));
    }
    
    if (availableFromParam) {
      setAvailableFrom(new Date(availableFromParam));
    }
    
    if (preferenceParam) {
      setPreferenceId(preferenceParam);
    }

    if (furnishedParam) {
      setFurnished(furnishedParam);
    }

    if (amenitiesParam) {
      setSelectedAmenities(amenitiesParam.split(','));
    }
    
    fetchProperties();
  }, [searchParams]);

  // Fetch properties from API
  const fetchProperties = async () => {
    setLoading(true);
    try {
      // Prepare filter options based on URL parameters
      const filterOptions: FilterOptions = {
        searchTerm: searchParams.get("search") || "",
        minPrice: parseInt(searchParams.get("minPrice") || "0"),
        maxPrice: parseInt(searchParams.get("maxPrice") || "20000000"),
        minBedrooms: parseInt(searchParams.get("bedrooms") || "0"),
        minBathrooms: parseInt(searchParams.get("bathrooms") || "0"),
        minBalcony: parseInt(searchParams.get("balcony") || "0"),
        minArea: parseInt(searchParams.get("minArea") || "0"),
        maxArea: 50000,
      };
      
      // Add availability date if present
      const availableFromParam = searchParams.get("availableFrom");
      if (availableFromParam) {
        filterOptions.availableFrom = availableFromParam;
      }
      
      // Add preference ID if present
      const preferenceParam = searchParams.get("preference");
      if (preferenceParam && preferenceParam !== "0") {
        filterOptions.preferenceId = preferenceParam;
      }

      // Add furnished status if present
      const furnishedParam = searchParams.get("furnished");
      if (furnishedParam && furnishedParam !== "any") {
        filterOptions.furnished = furnishedParam;
      }

      // Add amenities if present
      const amenitiesParam = searchParams.get("amenities");
      if (amenitiesParam) {
        filterOptions.amenities = amenitiesParam.split(',');
      }
      
      // Map type param to superCategoryId: 0 for all, 1 for buy, 2 for rent, 3 for sell
      let superCategoryId = 0; // Default to all (0)
      const typeParam = searchParams.get("type");
      if (typeParam && typeParam !== "all") {
        const categoryMap: Record<string, number> = {
          buy: 1,
          rent: 2,
          sell: 3
        };
        superCategoryId = categoryMap[typeParam as keyof typeof categoryMap] || 0;
      }

      const response = await axios.post<ApiResponse>(
        "https://homeyatraapi.azurewebsites.net/api/Account/GetProperty",
        {
          superCategoryId: superCategoryId, // 0 for all, 1 for buy, 2 for rent, 3 for sell
          accountId: "string", // Replace with actual accountId if available
          searchTerm: filterOptions.searchTerm,
          minPrice: filterOptions.minPrice,
          maxPrice: filterOptions.maxPrice,
          bedroom: filterOptions.minBedrooms,
          bathroom: filterOptions.minBathrooms,
          balcony: filterOptions.minBalcony,
          minArea: filterOptions.minArea,
          maxArea: filterOptions.maxArea,
          availableFrom: filterOptions.availableFrom,
          preferenceId: filterOptions.preferenceId ? parseInt(filterOptions.preferenceId) : undefined,
          furnished: filterOptions.furnished,
          amenities: filterOptions.amenities,
          pageNumber: 0, // No pagination
          pageSize: -1, // Get all properties
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Transform API data to our property format
      const transformedData = response.data.propertyInfo.map((prop): PropertyCardProps => ({
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
        furnished: prop.furnished
      }));

      setProperties(transformedData);
      applyFilters(transformedData);
      
      toast({
        title: "Properties Loaded",
        description: `Found ${transformedData.length} properties matching your criteria.`,
      });
    } catch (err) {
      console.error("Failed to fetch properties:", err);
      setError("Unable to load properties. Please try again later.");
      
      toast({
        variant: "destructive",
        title: "Error loading properties",
        description: "We're having trouble fetching properties. Using sample data instead.",
      });
      
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
        furnished: "Fully"
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
        furnished: "Fully"
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
        image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80",
        availableFrom: "2025-05-15T00:00:00",
        preferenceId: 2, // Bachelor
        amenities: ["WiFi", "Power Backup"],
        furnished: "Semi"
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
        image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80",
        amenities: ["Parking", "Security"],
        furnished: "Semi"
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
        image: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&q=80",
        availableFrom: "2025-06-01T00:00:00",
        preferenceId: 1, // Family
        amenities: ["Garden", "Parking", "Security"],
        furnished: "Fully"
      },
      {
        id: "prop6",
        title: "Commercial Space",
        price: 9500000,
        location: "Andheri, Mumbai",
        type: "sell",
        bedrooms: 0,
        bathrooms: 2,
        balcony: 0,
        area: 2500,
        image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&q=80",
        amenities: ["Power Backup", "Parking"],
        furnished: "Not"
      },
      {
        id: "prop7",
        title: "Cozy 1BHK for Rent",
        price: 22000,
        location: "HSR Layout, Bangalore",
        type: "rent",
        bedrooms: 1,
        bathrooms: 1,
        balcony: 1,
        area: 750,
        image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&q=80",
        availableFrom: "2025-05-10T00:00:00",
        preferenceId: 2, // Bachelor
        amenities: ["WiFi", "Power Backup", "Parking"],
        furnished: "Fully"
      },
      {
        id: "prop8",
        title: "Corporate Office Space",
        price: 65000,
        location: "Cyber City, Gurgaon",
        type: "rent",
        bedrooms: 0,
        bathrooms: 3,
        balcony: 0,
        area: 3200,
        image: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&q=80",
        availableFrom: "2025-07-01T00:00:00",
        preferenceId: 3, // Company
        amenities: ["WiFi", "Power Backup", "Security", "Parking"],
        furnished: "Fully"
      }
    ];
    
    setProperties(mockProperties);
    applyFilters(mockProperties);
  };

  // Apply client-side filters
  const applyFilters = (data: PropertyCardProps[]) => {
    const filtered = data.filter((property) => {
      // Filter by tab/type
      if (activeTab !== "all" && property.type !== activeTab) {
        return false;
      }
      
      // Filter by search query
      if (
        searchQuery &&
        !property.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !property.location.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      
      // Filter by price range
      if (property.price < priceRange[0] || property.price > priceRange[1]) {
        return false;
      }
      
      // Filter by bedrooms
      if (property.bedrooms < minBedrooms) {
        return false;
      }
      
      // Filter by bathrooms
      if (property.bathrooms < minBathrooms) {
        return false;
      }

      // Filter by balcony
      if (property.balcony < minBalcony) {
        return false;
      }
      
      // Filter by area
      if (property.area < minArea) {
        return false;
      }
      
      // Filter by availability date
      if (availableFrom && property.availableFrom) {
        const propertyDate = new Date(property.availableFrom);
        if (propertyDate > availableFrom) {
          return false;
        }
      }
      
      // Filter by preference
      if (preferenceId !== "0" && property.preferenceId !== parseInt(preferenceId)) {
        return false;
      }

      // Filter by furnished status
      if (furnished !== "any" && property.furnished?.toLowerCase() !== furnished) {
        return false;
      }

      // Filter by amenities
      if (selectedAmenities.length > 0 && property.amenities) {
        for (const amenity of selectedAmenities) {
          if (!property.amenities.includes(amenity)) {
            return false;
          }
        }
      }
      
      return true;
    });
    
    setFilteredProperties(filtered);
  };

  // Update filters when any filter state changes
  useEffect(() => {
    if (properties.length > 0) {
      applyFilters(properties);
    }
  }, [
    activeTab, 
    searchQuery, 
    priceRange, 
    minBedrooms, 
    minBathrooms, 
    minBalcony, 
    minArea, 
    availableFrom, 
    preferenceId,
    furnished,
    selectedAmenities
  ]);

  // Handle tab change and update URL
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    if (value !== "all") {
      searchParams.set("type", value);
    } else {
      searchParams.delete("type");
    }
    
    setSearchParams(searchParams);
  };

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      searchParams.set("search", searchTerm);
      setSearchParams(searchParams);
      setSearchQuery(searchTerm);
      
      toast({
        title: "Search Applied",
        description: `Showing results for "${searchTerm}"`,
      });
    }
  };

  // Reset all filters to default values
  const resetFilters = () => {
    setPriceRange([0, 20000000]);
    setMinBedrooms(0);
    setMinBathrooms(0);
    setMinBalcony(0);
    setMinArea(0);
    setSearchQuery("");
    setSearchTerm("");
    setAvailableFrom(undefined);
    setPreferenceId("0");
    setFurnished("any");
    setSelectedAmenities([]);
    setActiveTab("all");
    setSearchParams(new URLSearchParams());
    
    toast({
      title: "Filters Reset",
      description: "All filters have been cleared.",
    });
  };

  // Update URL when price range changes
  const handlePriceRangeChange = (value: number[]) => {
    setPriceRange(value);
    searchParams.set("minPrice", value[0].toString());
    searchParams.set("maxPrice", value[1].toString());
    setSearchParams(searchParams);
  };

  // Update URL when bedroom selection changes
  const handleBedroomChange = (value: number) => {
    setMinBedrooms(value);
    if (value > 0) {
      searchParams.set("bedrooms", value.toString());
    } else {
      searchParams.delete("bedrooms");
    }
    setSearchParams(searchParams);
  };

  // Update URL when bathroom selection changes
  const handleBathroomChange = (value: number) => {
    setMinBathrooms(value);
    if (value > 0) {
      searchParams.set("bathrooms", value.toString());
    } else {
      searchParams.delete("bathrooms");
    }
    setSearchParams(searchParams);
  };

  // Update URL when balcony selection changes
  const handleBalconyChange = (value: number) => {
    setMinBalcony(value);
    if (value > 0) {
      searchParams.set("balcony", value.toString());
    } else {
      searchParams.delete("balcony");
    }
    setSearchParams(searchParams);
  };

  // Update URL when min area changes
  const handleAreaChange = (value: number[]) => {
    setMinArea(value[0]);
    if (value[0] > 0) {
      searchParams.set("minArea", value[0].toString());
    } else {
      searchParams.delete("minArea");
    }
    setSearchParams(searchParams);
  };

  // Update URL when availability date changes
  const handleDateChange = (date: Date | undefined) => {
    setAvailableFrom(date);
    if (date) {
      searchParams.set("availableFrom", date.toISOString().split('T')[0]);
    } else {
      searchParams.delete("availableFrom");
    }
    setSearchParams(searchParams);
  };

  // Update URL when preference changes
  const handlePreferenceChange = (value: string) => {
    setPreferenceId(value);
    if (value !== "0") {
      searchParams.set("preference", value);
    } else {
      searchParams.delete("preference");
    }
    setSearchParams(searchParams);
  };

  // Update URL when furnished status changes
  const handleFurnishedChange = (value: string) => {
    setFurnished(value);
    if (value !== "any") {
      searchParams.set("furnished", value);
    } else {
      searchParams.delete("furnished");
    }
    setSearchParams(searchParams);
  };

  // Handle amenity toggle
  const handleAmenityToggle = (amenity: string) => {
    let newAmenities: string[];
    
    if (selectedAmenities.includes(amenity)) {
      newAmenities = selectedAmenities.filter(a => a !== amenity);
    } else {
      newAmenities = [...selectedAmenities, amenity];
    }
    
    setSelectedAmenities(newAmenities);
    
    if (newAmenities.length > 0) {
      searchParams.set("amenities", newAmenities.join(','));
    } else {
      searchParams.delete("amenities");
    }
    
    setSearchParams(searchParams);
  };

  // Format price display based on property type
  const formatPrice = (price: number, type: string) => {
    if (type === "rent") {
      return `₹${price.toLocaleString()}/month`;
    }
    return `₹${price.toLocaleString()}`;
  };

  // Check if property type allows availability filter
  const showAvailabilityFilter = () => {
    return activeTab === "buy" || activeTab === "rent" || activeTab === "all";
  };

  // Toggle mobile filters
  const toggleMobileFilters = () => {
    setMobileFiltersVisible(!mobileFiltersVisible);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero section with search */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Find Your Dream Property</h1>
            <p className="text-xl opacity-90 mb-10">
              Discover the perfect home that fits your lifestyle and budget from our extensive listings
            </p>
            
            <form onSubmit={handleSearch} className="relative mx-auto max-w-2xl">
              <div className="relative flex shadow-xl rounded-full overflow-hidden">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <Search className="h-5 w-5 text-gray-600" />
                </div>
                <Input
                  type="text"
                  className="block w-full rounded-l-full pl-12 py-6 bg-white text-gray-800 border-0 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Search by location, property name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button 
                  type="submit" 
                  className="rounded-r-full bg-blue-500 hover:bg-blue-600 px-8 py-6 text-base font-medium"
                  size="lg"
                >
                  Search
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tab filter */}
        <div className="mb-6">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="w-full max-w-md mx-auto grid grid-cols-3 h-14">
              <TabsTrigger value="all" className="text-base">All Properties</TabsTrigger>
              <TabsTrigger value="buy" className="text-base">Buy</TabsTrigger>
              <TabsTrigger value="rent" className="text-base">Rent</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        {/* Mobile filter toggle button - only visible on mobile */}
        <div className="md:hidden mb-4">
          <Button 
            onClick={toggleMobileFilters}
            variant="outline" 
            className="w-full flex items-center justify-between py-6 text-base"
          >
            <span className="flex items-center gap-2">
              <FilterX className="h-5 w-5" />
              Filters
            </span>
            {mobileFiltersVisible ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </Button>
        </div>
        
        <div className="grid md:grid-cols-[300px_1fr] gap-8">
          {/* Sidebar filters - hidden on mobile unless toggled */}
          <div className={`space-y-5 ${mobileFiltersVisible ? 'block' : 'hidden md:block'}`}>
            <Card className="shadow-md">
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-blue-600" />
                        <h3 className="font-medium">Price Range</h3>
                      </div>
                      <span className="text-xs font-medium text-blue-600">
                        ₹{priceRange[0].toLocaleString()} - ₹{priceRange[1].toLocaleString()}
                      </span>
                    </div>
                    <Slider
                      defaultValue={[0, 20000000]}
                      max={20000000}
                      step={100000}
                      value={priceRange}
                      onValueChange={handlePriceRangeChange}
                      className="mb-2"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>₹0</span>
                      <span>₹2 Cr+</span>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Bed className="h-5 w-5 text-blue-600" />
                      <h3 className="font-medium">Bedrooms</h3>
                    </div>
                    <div className="flex space-x-2">
                      {[0, 1, 2, 3, 4].map((num) => (
                        <Button
                          key={num}
                          variant={minBedrooms === num ? "default" : "outline"}
                          size="sm"
                          className={`flex-1 ${minBedrooms === num ? "bg-blue-600 hover:bg-blue-700" : ""}`}
                          onClick={() => handleBedroomChange(num)}
                        >
                          {num === 0 ? "Any" : num === 4 ? "4+" : num}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Bath className="h-5 w-5 text-blue-600" />
                      <h3 className="font-medium">Bathrooms</h3>
                    </div>
                    <div className="flex space-x-2">
                      {[0, 1, 2, 3].map((num) => (
                        <Button
                          key={num}
                          variant={minBathrooms === num ? "default" : "outline"}
                          size="sm"
                          className={`flex-1 ${minBathrooms === num ? "bg-blue-600 hover:bg-blue-700" : ""}`}
                          onClick={() => handleBathroomChange(num)}
                        >
                          {num === 0 ? "Any" : num === 3 ? "3+" : num}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <LayoutDashboard className="h-5 w-5 text-blue-600" />
                      <h3 className="font-medium">Balcony</h3>
                    </div>
                    <div className="flex space-x-2">
                      {[0, 1, 2, 3].map((num) => (
                        <Button
                          key={num}
                          variant={minBalcony === num ? "default" : "outline"}
                          size="sm"
                          className={`flex-1 ${minBalcony === num ? "bg-blue-600 hover:bg-blue-700" : ""}`}
                          onClick={() => handleBalconyChange(num)}
                        >
                          {num === 0 ? "Any" : num === 3 ? "3+" : num}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Ruler className="h-5 w-5 text-blue-600" />
                        <h3 className="font-medium">Area (sq.ft)</h3>
                      </div>
                      <span className="text-xs font-medium text-blue-600">
                        {minArea}+ sq.ft
                      </span>
                    </div>
                    <Slider
                      defaultValue={[0]}
                      max={5000}
                      step={100}
                      value={[minArea]}
                      onValueChange={handleAreaChange}
                      className="mb-2"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>0 sq.ft</span>
                      <span>5000+ sq.ft</span>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      className="w-full text-blue-600 border-blue-600 hover:bg-blue-50"
                      onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    >
                      {showAdvancedFilters ? (
                        <><Minus className="h-4 w-4 mr-2" /> Hide Advanced Filters</>
                      ) : (
                        <><Plus className="h-4 w-4 mr-2" /> Show Advanced Filters</>
                      )}
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full flex items-center gap-2" 
                      onClick={resetFilters}
                    >
                      <FilterX className="h-4 w-4" />
                      Reset All Filters
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Advanced filters */}
            {showAdvancedFilters && (
              <Card className="shadow-md">
                <CardContent className="p-6">
                  <h3 className="font-medium text-lg mb-4 text-blue-800">Advanced Filters</h3>
                  <Accordion type="single" collapsible className="w-full">
                    {/* Only show availability filter for Buy and Rent property types */}
                    {(activeTab === "buy" || activeTab === "rent" || activeTab === "all") && (
                      <AccordionItem value="availability" className="border-b border-blue-100">
                        <AccordionTrigger className="py-3 hover:no-underline">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-blue-600" />
                            <span>Availability</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="pt-2 pb-4">
                            <p className="text-sm text-gray-600 mb-2">Available from</p>
                            <DatePicker 
                              date={availableFrom} 
                              setDate={handleDateChange} 
                              className="w-full"
                            />
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    )}

                    {/* Show tenant preference for all property types */}
                    <AccordionItem value="preference" className="border-b border-blue-100">
                      <AccordionTrigger className="py-3 hover:no-underline">
                        <div className="flex items-center gap-2">
                          <Users className="h-5 w-5 text-blue-600" />
                          <span>Tenant Preference</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="pt-2 pb-4">
                          <Select
                            value={preferenceId}
                            onValueChange={handlePreferenceChange}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select preference" />
                            </SelectTrigger>
                            <SelectContent>
                              {preferenceOptions.map((option) => (
                                <SelectItem key={option.id} value={option.id}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* Show furnished status for all property types */}
                    <AccordionItem value="furnished" className="border-b border-blue-100">
                      <AccordionTrigger className="py-3 hover:no-underline">
                        <div className="flex items-center gap-2">
                          <Home className="h-5 w-5 text-blue-600" />
                          <span>Furnished Status</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="pt-2 pb-4">
                          <Select
                            value={furnished}
                            onValueChange={handleFurnishedChange}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Furnished status" />
                            </SelectTrigger>
                            <SelectContent>
                              {furnishedOptions.map((option) => (
                                <SelectItem key={option.id} value={option.id}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* Show amenities for all property types */}
                    <AccordionItem value="amenities" className="border-b-0">
                      <AccordionTrigger className="py-3 hover:no-underline">
                        <div className="flex items-center gap-2">
                          <CheckSquare className="h-5 w-5 text-blue-600" />
                          <span>Amenities</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="pt-2 pb-4 grid grid-cols-2 gap-3">
                          {amenityOptions.map((amenity) => (
                            <div key={amenity} className="flex items-center space-x-2">
                              <Switch
                                id={`amenity-${amenity}`}
                                checked={selectedAmenities.includes(amenity)}
                                onCheckedChange={() => handleAmenityToggle(amenity)}
                              />
                              <Label htmlFor={`amenity-${amenity}`} className="text-sm">
                                {amenity}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Property listings */}
          <div>
            {/* Applied filters display */}
            {(searchQuery || minBedrooms > 0 || minBathrooms > 0 || minBalcony > 0 || minArea > 0 || 
              availableFrom || preferenceId !== "0" || furnished !== "any" || selectedAmenities.length > 0) && (
              <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-medium mr-2">Active Filters:</h3>
                  
                  {searchQuery && (
                    <Badge className="flex items-center gap-1 bg-blue-100 text-blue-800 hover:bg-blue-200">
                      Search: {searchQuery}
                      <X 
                        className="h-3 w-3 ml-1 cursor-pointer" 
                        onClick={() => {
                          setSearchQuery("");
                          setSearchTerm("");
                          searchParams.delete("search");
                          setSearchParams(searchParams);
                        }}
                      />
                    </Badge>
                  )}
                  
                  {minBedrooms > 0 && (
                    <Badge className="flex items-center gap-1 bg-blue-100 text-blue-800 hover:bg-blue-200">
                      {minBedrooms}+ Beds
                      <X 
                        className="h-3 w-3 ml-1 cursor-pointer" 
                        onClick={() => {
                          setMinBedrooms(0);
                          searchParams.delete("bedrooms");
                          setSearchParams(searchParams);
                        }}
                      />
                    </Badge>
                  )}
                  
                  {minBathrooms > 0 && (
                    <Badge className="flex items-center gap-1 bg-blue-100 text-blue-800 hover:bg-blue-200">
                      {minBathrooms}+ Baths
                      <X 
                        className="h-3 w-3 ml-1 cursor-pointer" 
                        onClick={() => {
                          setMinBathrooms(0);
                          searchParams.delete("bathrooms");
                          setSearchParams(searchParams);
                        }}
                      />
                    </Badge>
                  )}

                  {minBalcony > 0 && (
                    <Badge className="flex items-center gap-1 bg-blue-100 text-blue-800 hover:bg-blue-200">
                      {minBalcony}+ Balconies
                      <X 
                        className="h-3 w-3 ml-1 cursor-pointer" 
                        onClick={() => {
                          setMinBalcony(0);
                          searchParams.delete("balcony");
                          setSearchParams(searchParams);
                        }}
                      />
                    </Badge>
                  )}
                  
                  {minArea > 0 && (
                    <Badge className="flex items-center gap-1 bg-blue-100 text-blue-800 hover:bg-blue-200">
                      {minArea}+ sq.ft
                      <X 
                        className="h-3 w-3 ml-1 cursor-pointer" 
                        onClick={() => {
                          setMinArea(0);
                          searchParams.delete("minArea");
                          setSearchParams(searchParams);
                        }}
                      />
                    </Badge>
                  )}
                  
                  {availableFrom && (
                    <Badge className="flex items-center gap-1 bg-blue-100 text-blue-800 hover:bg-blue-200">
                      Available: {availableFrom.toLocaleDateString()}
                      <X 
                        className="h-3 w-3 ml-1 cursor-pointer" 
                        onClick={() => {
                          setAvailableFrom(undefined);
                          searchParams.delete("availableFrom");
                          setSearchParams(searchParams);
                        }}
                      />
                    </Badge>
                  )}
                  
                  {preferenceId !== "0" && (
                    <Badge className="flex items-center gap-1 bg-blue-100 text-blue-800 hover:bg-blue-200">
                      {preferenceOptions.find(p => p.id === preferenceId)?.label}
                      <X 
                        className="h-3 w-3 ml-1 cursor-pointer" 
                        onClick={() => {
                          setPreferenceId("0");
                          searchParams.delete("preference");
                          setSearchParams(searchParams);
                        }}
                      />
                    </Badge>
                  )}

                  {furnished !== "any" && (
                    <Badge className="flex items-center gap-1 bg-blue-100 text-blue-800 hover:bg-blue-200">
                      {furnishedOptions.find(f => f.id === furnished)?.label}
                      <X 
                        className="h-3 w-3 ml-1 cursor-pointer" 
                        onClick={() => {
                          setFurnished("any");
                          searchParams.delete("furnished");
                          setSearchParams(searchParams);
                        }}
                      />
                    </Badge>
                  )}
                  
                  {selectedAmenities.map(amenity => (
                    <Badge 
                      key={amenity} 
                      className="flex items-center gap-1 bg-blue-100 text-blue-800 hover:bg-blue-200"
                    >
                      {amenity}
                      <X 
                        className="h-3 w-3 ml-1 cursor-pointer" 
                        onClick={() => handleAmenityToggle(amenity)}
                      />
                    </Badge>
                  ))}
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={resetFilters}
                    className="text-xs text-red-500 hover:text-red-600 hover:bg-red-50 ml-auto"
                  >
                    Clear All
                  </Button>
                </div>
              </div>
            )}

            {/* Results count and sort */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                {loading ? (
                  <span className="flex items-center">
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Loading properties...
                  </span>
                ) : (
                  `${filteredProperties.length} ${filteredProperties.length === 1 ? 'Property' : 'Properties'} Found`
                )}
              </h2>
              
              <div className="mt-2 sm:mt-0">
                <Select defaultValue="newest">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="area-high">Area: Largest First</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Error state */}
            {error && (
              <Card className="bg-red-50 border-red-100 mb-8">
                <CardContent className="p-8 text-center">
                  <X className="h-10 w-10 text-red-500 mx-auto mb-4" />
                  <p className="text-red-600 mb-4">{error}</p>
                  <Button 
                    onClick={fetchProperties} 
                    variant="outline" 
                    className="bg-white border-red-200 hover:bg-red-50"
                  >
                    Try Again
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Empty state */}
            {!loading && filteredProperties.length === 0 && !error && (
              <Card className="border-dashed border-2 mb-8">
                <CardContent className="p-12 text-center">
                  <Home className="h-12 w-12 mx-auto text-blue-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-800 mb-2">No properties found</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    We couldn't find any properties matching your current filters. Try adjusting your search criteria to see more results.
                  </p>
                  <Button 
                    onClick={resetFilters}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Clear All Filters
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Results grid */}
            <div className="grid sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-10">
              {loading ? (
                // Loading skeletons
                Array(6).fill(0).map((_, index) => (
                  <Card key={index} className="overflow-hidden shadow-md">
                    <div className="h-48 bg-gray-200 animate-pulse" />
                    <CardContent className="p-4">
                      <div className="h-4 bg-gray-200 rounded-full animate-pulse mb-4" />
                      <div className="h-6 bg-gray-200 rounded-full animate-pulse w-3/4 mb-4" />
                      <div className="space-y-3">
                        <div className="flex justify-between gap-2">
                          <div className="h-4 bg-gray-200 rounded-full animate-pulse w-1/4" />
                          <div className="h-4 bg-gray-200 rounded-full animate-pulse w-1/4" />
                          <div className="h-4 bg-gray-200 rounded-full animate-pulse w-1/4" />
                        </div>
                        <div className="h-4 bg-gray-200 rounded-full animate-pulse w-1/2" />
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                filteredProperties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    {...property}
                    formattedPrice={formatPrice(property.price, property.type)}
                  />
                ))
              )}
            </div>

            {/* Pagination */}
            {filteredProperties.length > 0 && (
              <div className="mt-8 flex justify-center">
                <div className="inline-flex shadow-sm rounded-md">
                  <Button variant="outline" size="default" className="rounded-l-md rounded-r-none">
                    Previous
                  </Button>
                  <Button variant="default" size="default" className="rounded-none border-l-0 border-r-0 bg-blue-600">
                    1
                  </Button>
                  <Button variant="outline" size="default" className="rounded-none border-r-0">
                    2
                  </Button>
                  <Button variant="outline" size="default" className="rounded-none border-r-0">
                    3
                  </Button>
                  <Button variant="outline" size="default" className="rounded-r-md">
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyListing;
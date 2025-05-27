import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { PropertyCard, PropertyCardProps } from "@/components/PropertyCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { 
  Search, 
  FilterX, 
  Loader2, 
  Home, 
  IndianRupeeIcon,
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
  likes?: number; 
  isLike?: boolean; 
  propertyType?: string;
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

// Property type mapping - Updated to merge shop and commercial, remove land/office
const propertyTypeMapping = {
  "plot": { superCategoryId: 1, propertyTypeIds: [4], label: "Plot" },
  "commercial": { superCategoryId: 1, propertyTypeIds: [2, 7], label: "Commercial" },
  "buy": { superCategoryId: 1, propertyFor: 1, label: "Buy" },
  "rent": { superCategoryId: 2, propertyFor: 2, label: "Rent" },
  "all": { superCategoryId: 0, label: "All Properties" }
};

export const PropertyListing = () => {
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
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState([0, 20000000]);
  const [minBedrooms, setMinBedrooms] = useState(0);
  const [minBathrooms, setMinBathrooms] = useState(0);
  const [minBalcony, setMinBalcony] = useState(0);
  const [minArea, setMinArea] = useState(0);
  
  // Search suggestions state
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Advanced filter states
  const [availableFrom, setAvailableFrom] = useState<Date | undefined>(undefined);
  const [preferenceId, setPreferenceId] = useState<string>("0"); // Default to "Any"
  const [furnished, setFurnished] = useState<string>("any");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  
  // UI state for advanced filters visibility
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  // Debug state to show API request/response
  const [apiDebug, setApiDebug] = useState({
    request: null,
    response: null,
    error: null
  });
  
  // Fetch suggestions from API with debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm.trim().length > 1) {
        axios
          .get(`https://homeyatraapi.azurewebsites.net/api/account/suggestions?term=${encodeURIComponent(searchTerm)}`)
          .then((res) => {
            setSuggestions(res.data);
            setShowSuggestions(true);
          })
          .catch((err) => {
            console.error("Suggestion error:", err);
            setSuggestions([]);
          });
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300); // debounce 300ms

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);
  
  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setSearchTerm(suggestion);
    setShowSuggestions(false);
    
    // Update search params and trigger search
    searchParams.set("search", suggestion);
    setSearchParams(searchParams);
    setSearchQuery(suggestion);
    
    toast({
      title: "Search Applied",
      description: `Showing results for "${suggestion}"`,
    });
  };
  
  // Check if advanced filters should be hidden based on property type
  const shouldShowAdvancedFilters = () => {
    return activeTab !== "plot" && activeTab !== "commercial";
  };

  // Toggle mobile filters
  const toggleMobileFilters = () => {
    setMobileFiltersVisible(!mobileFiltersVisible);
  };

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
  
  // CRITICAL FIX: Set activeTab from URL parameter or default to "all"
  const currentTab = typeParam || "all";
  if (currentTab !== activeTab) {
    setActiveTab(currentTab);
  }
  
  // Set other state from URL params if they exist
  if (searchParam && searchParam !== searchQuery) {
    setSearchQuery(searchParam);
    setSearchTerm(searchParam);
  }
  
  if (minPriceParam && maxPriceParam) {
    const newPriceRange = [parseInt(minPriceParam), parseInt(maxPriceParam)];
    if (newPriceRange[0] !== priceRange[0] || newPriceRange[1] !== priceRange[1]) {
      setPriceRange(newPriceRange);
    }
  }
  
  if (bedroomsParam) {
    const bedrooms = parseInt(bedroomsParam);
    if (bedrooms !== minBedrooms) {
      setMinBedrooms(bedrooms);
    }
  }
  
  if (bathroomsParam) {
    const bathrooms = parseInt(bathroomsParam);
    if (bathrooms !== minBathrooms) {
      setMinBathrooms(bathrooms);
    }
  }

  if (balconyParam) {
    const balcony = parseInt(balconyParam);
    if (balcony !== minBalcony) {
      setMinBalcony(balcony);
    }
  }
  
  if (minAreaParam) {
    const area = parseInt(minAreaParam);
    if (area !== minArea) {
      setMinArea(area);
    }
  }
  
  if (availableFromParam) {
    const date = new Date(availableFromParam);
    if (!availableFrom || date.getTime() !== availableFrom.getTime()) {
      setAvailableFrom(date);
    }
  }
  
  if (preferenceParam && preferenceParam !== preferenceId) {
    setPreferenceId(preferenceParam);
  }

  if (furnishedParam && furnishedParam !== furnished) {
    setFurnished(furnishedParam);
  }

  if (amenitiesParam) {
    const amenities = amenitiesParam.split(',');
    if (JSON.stringify(amenities.sort()) !== JSON.stringify(selectedAmenities.sort())) {
      setSelectedAmenities(amenities);
    }
  }
  
  // IMPORTANT: Only fetch when activeTab changes or when component first loads
  fetchProperties();
}, [searchParams]); // Only depend on searchParams

// Updated fetchProperties function - remove activeTab dependency issue
const fetchProperties = async () => {
  setLoading(true);
  try {
    // Get the current type from URL, not from state
    const currentTypeParam = searchParams.get("type") || "all";
    
    // Prepare filter options based on URL parameters
    const filterOptions: FilterOptions = {
      searchTerm: searchParams.get("search") || "",
      minPrice: parseInt(searchParams.get("minPrice") || "0"),
      maxPrice: parseInt(searchParams.get("maxPrice") || "0"),
      minBedrooms: parseInt(searchParams.get("bedrooms") || "0"),
      minBathrooms: parseInt(searchParams.get("bathrooms") || "0"),
      minBalcony: parseInt(searchParams.get("balcony") || "0"),
      minArea: parseInt(searchParams.get("minArea") || "0"),
      maxArea: 0,
    };
    
    // Add other filter parameters...
    const availableFromParam = searchParams.get("availableFrom");
    if (availableFromParam) {
      filterOptions.availableFrom = availableFromParam;
    }
    
    const preferenceParam = searchParams.get("preference");
    if (preferenceParam && preferenceParam !== "0") {
      filterOptions.preferenceId = preferenceParam;
    }

    const furnishedParam = searchParams.get("furnished");
    if (furnishedParam && furnishedParam !== "any") {
      filterOptions.furnished = furnishedParam;
    }

    const amenitiesParam = searchParams.get("amenities");
    if (amenitiesParam) {
      filterOptions.amenities = amenitiesParam.split(',');
    }
    
    // FIXED: Use current URL type parameter instead of state
    const typeConfig = propertyTypeMapping[currentTypeParam] || propertyTypeMapping.all;
    
    let superCategoryId = typeConfig.superCategoryId;
    let propertyTypeIds = typeConfig.propertyTypeIds || [];
    let propertyFor = typeConfig.propertyFor;
    
    // Special handling for different property types
    if (currentTypeParam === "plot") {
      // Plot: Only buy (superCategoryId: 1, propertyType: 4)
      superCategoryId = 1;
      propertyTypeIds = [4];
    } else if (currentTypeParam === "commercial") {
      // Commercial: Can be both buy and rent (includes shop)
      superCategoryId = 0; // Don't filter by superCategory to get both
      propertyTypeIds = [2, 7]; // Include both buy and rent commercial types
    }
    
    // Pagination params
    let pageSize = -1;
    let pageNumber = 0;
    
    if (currentTypeParam !== "all") {
      pageSize = 10;
      pageNumber = parseInt(searchParams.get("page") || "1") - 1;
    }

    // Prepare request payload
    const requestPayload = {
      superCategoryId,
      propertyTypeIds: propertyTypeIds.length > 0 ? propertyTypeIds : undefined,
      propertyFor,
      accountId: "string",
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
      pageNumber,
      pageSize,
    };
    
    console.log(`Fetching properties for type: ${currentTypeParam}`, requestPayload);
    setApiDebug(prev => ({ ...prev, request: requestPayload }));

    const response = await axios.post<ApiResponse>(
      "https://homeyatraapi.azurewebsites.net/api/Account/GetProperty",
      requestPayload,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    
    setApiDebug(prev => ({ ...prev, response: response.data }));

    // Transform API data with proper type mapping - Updated to merge shop/commercial
    const transformedData = response.data.propertyInfo.map((prop): PropertyCardProps => {
      let type: "buy" | "sell" | "rent" | "plot" | "commercial" = "buy";
      
      const superCategoryLower = prop.superCategory?.toLowerCase() || "";
      const propertyTypeLower = prop.propertyType?.toLowerCase() || "";
      
      // Map based on API requirements - Updated logic
      if (prop.propertyType === "4" || propertyTypeLower.includes("plot")) {
        type = "plot";
      }
      else if (prop.propertyType === "2" || prop.propertyType === "7" || 
               propertyTypeLower.includes("shop") || propertyTypeLower.includes("commercial")) {
        type = "commercial";
      }
      else if (superCategoryLower.includes("rent") || prop.superCategory === "2") {
        type = "rent";
      } else if (superCategoryLower.includes("sell") || superCategoryLower.includes("buy") || prop.superCategory === "1") {
        type = "buy";
      }
      
      return {
        id: prop.propertyId,
        title: prop.title,
        price: prop.price,
        location: prop.city,
        type: type,
        bedrooms: prop.bedroom,
        bathrooms: prop.bathroom,
        balcony: prop.balcony,
        area: prop.area,
        image: prop.mainImageUrl || "https://via.placeholder.com/400x300?text=No+Image",
        availableFrom: prop.availableFrom,
        preferenceId: prop.preferenceId,
        amenities: prop.amenities,
        furnished: prop.furnished,
        likes: prop.likes ?? 0,
        isLike: prop.isLike ?? false,
        propertyType: prop.propertyType,
        status: prop.superCategory,
      };
    });

    setProperties(transformedData);
    
    // Apply client-side filtering based on current URL type
    let filtered = transformedData;
    
    if (currentTypeParam === "plot") {
      filtered = transformedData.filter(prop => 
        prop.type === "plot" || 
        prop.propertyType === "4" ||
        (prop.propertyType?.toLowerCase() || "").includes("plot")
      );
    } else if (currentTypeParam === "commercial") {
      filtered = transformedData.filter(prop => 
        prop.type === "commercial" || 
        prop.propertyType === "2" ||
        prop.propertyType === "7" ||
        (prop.propertyType?.toLowerCase() || "").includes("commercial") ||
        (prop.propertyType?.toLowerCase() || "").includes("shop")
      );
    } else if (currentTypeParam !== "all") {
      filtered = transformedData.filter(property => property.type === currentTypeParam);
    }
    
    // Apply other filters
    const currentSearchQuery = searchParams.get("search") || "";
    const currentPriceRange = [
      parseInt(searchParams.get("minPrice") || "0"),
      parseInt(searchParams.get("maxPrice") || "20000000")
    ];
    const currentMinArea = parseInt(searchParams.get("minArea") || "0");
    
    filtered = filtered.filter(property => {
      if (
        currentSearchQuery &&
        !property.title.toLowerCase().includes(currentSearchQuery.toLowerCase()) &&
        !property.location.toLowerCase().includes(currentSearchQuery.toLowerCase())
      ) {
        return false;
      }
      
      if (property.price < currentPriceRange[0] || property.price > currentPriceRange[1]) {
        return false;
      }
      
      if (property.area < currentMinArea) {
        return false;
      }
      
      return true;
    });
    
    setFilteredProperties(filtered);
    
    toast({
      title: "Properties Loaded",
      description: `Found ${filtered.length} ${currentTypeParam === 'all' ? '' : currentTypeParam} properties.`,
    });
    
  } catch (err) {
    console.error("Failed to fetch properties:", err);
    setError("Unable to load properties. Please try again later.");
    setApiDebug(prev => ({ ...prev, error: err }));
    
    toast({
      variant: "destructive",
      title: "Error loading properties",
      description: "We're having trouble fetching properties. Using sample data instead.",
    });
    
    useMockData();
  } finally {
    setLoading(false);
  }
};

// Update the applyFilters function to use current URL state
const applyFilters = (data: PropertyCardProps[]) => {
  // Get current type from URL
  const currentTypeParam = searchParams.get("type") || "all";
  
  let filtered = data;
  if (currentTypeParam !== "all") {
    if (currentTypeParam === "plot") {
      filtered = data.filter(property => 
        property.type === "plot" || 
        (property.propertyType?.toLowerCase() || "").includes("plot")
      );
    } else if (currentTypeParam === "commercial") {
      filtered = data.filter(property => 
        property.type === "commercial" || 
        (property.propertyType?.toLowerCase() || "").includes("commercial") ||
        (property.propertyType?.toLowerCase() || "").includes("shop")
      );
    } else {
      filtered = data.filter(property => property.type === currentTypeParam);
    }
  }
  
  // Apply other filters using URL parameters directly
  const currentSearchQuery = searchParams.get("search") || "";
  const currentPriceRange = [
    parseInt(searchParams.get("minPrice") || "0"),
    parseInt(searchParams.get("maxPrice") || "20000000")
  ];
  const currentMinBedrooms = parseInt(searchParams.get("bedrooms") || "0");
  const currentMinBathrooms = parseInt(searchParams.get("bathrooms") || "0");
  const currentMinBalcony = parseInt(searchParams.get("balcony") || "0");
  const currentMinArea = parseInt(searchParams.get("minArea") || "0");
  
  filtered = filtered.filter((property) => {
    if (
      currentSearchQuery &&
      !property.title.toLowerCase().includes(currentSearchQuery.toLowerCase()) &&
      !property.location.toLowerCase().includes(currentSearchQuery.toLowerCase())
    ) {
      return false;
    }
    
    if (property.price < currentPriceRange[0] || property.price > currentPriceRange[1]) {
      return false;
    }
    
    // Only apply bedroom/bathroom filters for residential properties
    if (property.type !== "plot" && property.type !== "commercial") {
      if (property.bedrooms < currentMinBedrooms) return false;
      if (property.bathrooms < currentMinBathrooms) return false;
      if (property.balcony < currentMinBalcony) return false;
    }
    
    if (property.area < currentMinArea) {
      return false;
    }
    
    return true;
  });
  
  setFilteredProperties(filtered);
};
  // Property card interface
  interface PropertyCardProps {
    id: string;
    title: string;
    price: number;
    location: string;
    type: "buy" | "sell" | "rent" | "plot" | "commercial";
    bedrooms: number;
    bathrooms: number;
    balcony?: number;
    area: number;
    image: string;
    availableFrom?: string;
    preferenceId?: number;
    amenities?: string[];
    furnished?: string;
    likes?: number;
    isLike?: boolean;
    propertyType?: string;
    status?: string;
    formattedPrice?: string;
  }

  // Enhanced mock data for fallback or development - Updated mock data
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
      // Updated mock plot and commercial properties
      {
        id: "prop9",
        title: "Residential Plot in Prime Location",
        price: 3500000,
        location: "Electronic City, Bangalore",
        type: "plot",
        bedrooms: 0,
        bathrooms: 0,
        balcony: 0,
        area: 2400,
        image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80",
        amenities: ["Power Backup"],
        propertyType: "Plot"
      },
      {
        id: "prop10",
        title: "Commercial Space in Business District",
        price: 85000,
        location: "Connaught Place, Delhi",
        type: "commercial",
        bedrooms: 0,
        bathrooms: 2,
        balcony: 0,
        area: 1800,
        image: "https://images.unsplash.com/photo-1497215842964-222b430dc094?auto=format&fit=crop&q=80",
        amenities: ["WiFi", "Power Backup", "Security", "Parking"],
        furnished: "Fully",
        propertyType: "Commercial"
      },
      {
        id: "prop11",
        title: "Retail Shop in Prime Location",
        price: 120000,
        location: "Saket, Delhi",
        type: "commercial",
        bedrooms: 0,
        bathrooms: 1,
        balcony: 0,
        area: 850,
        image: "https://images.unsplash.com/photo-1604014237800-1c9102c219da?auto=format&fit=crop&q=80",
        amenities: ["Security", "Power Backup"],
        furnished: "Not",
        propertyType: "Commercial"
      }
    ];
    
    setProperties(mockProperties);
    applyFilters(mockProperties);
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
    
    // Hide advanced filters if plot or commercial is selected
    if (value === "plot" || value === "commercial") {
      setShowAdvancedFilters(false);
    }
    
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero section with search */}
      <div className="relative">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80')",
          }}
        />
        
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black opacity-50"></div>
        
        {/* Content */}
        <div className="relative py-20 px-4">
          <div className="max-w-3xl mx-auto bg-transparent-600 bg-opacity-80 p-8 md:p-12 rounded-xl shadow-2xl backdrop-blur">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white">Find Your Dream Property</h1>
              
              <form onSubmit={handleSearch} className="relative mx-auto max-w-2xl">
                <div className="relative flex shadow-xl rounded-full overflow-hidden">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                    <Search className="h-5 w-5 text-gray-600" />
                  </div>
                  <Input
                                  type="text"
                                  className="block w-full rounded-full pl-10 sm:pl-12 pr-24 sm:pr-28 py-3 sm:py-4 md:py-5 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                                  placeholder="Search Society, Locality, City, State"
                                  value={searchTerm}
                                  onChange={(e) => setSearchTerm(e.target.value)}
                                  onFocus={() => setShowSuggestions(true)}
                                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)} // delay to allow click
                                />
                                <Button
                                  type="submit"
                                  className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 rounded-r-full py-1.5 sm:py-2 md:py-5 px-4 sm:px-6 text-xs sm:text-sm md:text-base shadow-lg"
                                >
                                  Search
                                </Button>
                              </div>
                  
                              {showSuggestions && suggestions.length > 0 && (
                                <ul className="absolute z-10 bg-white border border-gray-300 rounded-md mt-1 w-full max-h-60 overflow-y-auto shadow-md">
                                  {suggestions.map((suggestion, index) => (
                                    <li
                                      key={index}
                                      onMouseDown={() => handleSuggestionClick(suggestion)}
                                      className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                                    >
                                      {suggestion}
                                    </li>
                                  ))}
                                </ul>
                              )}
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tab filter */}
        <div className="mb-8">
          <div className="w-full bg-blue-700 bg-opacity-40 rounded-lg p-2 pl-8">
            <div className="grid grid-cols-5 gap-1 w-full">
              {["all", "buy", "rent", "plot", "commercial"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => handleTabChange(tab)}
                  className={`py-3 px-1 rounded-md text-sm md:text-base font-medium transition-all duration-200 ${
                    activeTab === tab 
                      ? "bg-white text-blue-600 shadow-md" 
                      : "text-white hover:bg-blue-500"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  {tab === "all" ? " Properties" : ""}
                </button>
              ))}
            </div>
          </div>
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
                        <IndianRupeeIcon className="h-5 w-5 text-blue-600" />
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
                    {shouldShowAdvancedFilters() && (
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
                    )}
                    
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
            {showAdvancedFilters && shouldShowAdvancedFilters() && (
              <Card className="shadow-md">
                <CardContent className="p-6">
                  <h3 className="font-medium text-lg mb-4 text-blue-800">Advanced Filters</h3>
                  <Accordion type="single" collapsible className="w-full">
                    {/* Only show availability filter for rent property type */}
                    {(activeTab === "rent" || (activeTab === "all")) && (
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

                    {/* Only show tenant preference for rent property type */}
                    {(activeTab === "rent" || (activeTab === "all")) && (
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
                    )}

                    {/* Show furnished status for all property types except plot and commercial */}
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

                    {/* Show amenities for all property types except plot and commercial */}
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
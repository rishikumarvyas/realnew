import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import axiosInstance from "@/axiosCalls/axiosInstance";
import { PropertyCard } from "@/components/PropertyCard";
import type { PropertyCardProps } from "@/components/PropertyCard";
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
  X,
  Key,
  MapPin as Map,
  Store,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import debounce from "lodash/debounce";

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
  likeCount?: number;
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

// Add sorting interface
interface SortOptions {
  sortBy: string;
  sortOrder: string;
}

// Tenant preference mapping
const preferenceOptions = [
  { id: "2", label: "Family" },
  { id: "1", label: "Bachelors" },
  { id: "3", label: "Girls" },
  { id: "6", label: "Student" },
  { id: "5", label: "Company" },
  { id: "4", label: "Anyone" },
];

// Furnished status options
const furnishedOptions = [
  { id: "Fully", label: "Fully Furnished" },
  { id: "Semi", label: "Semi Furnished" },
  { id: "Not", label: "Unfurnished" },
  { id: "any", label: "Any" },
];

// Amenity options for commercial properties
const commercialAmenityOptions = [
  "Lift",
  "Security",
  "Power Backup",
  "Parking",
  "Fully Furnished",
  "Semi Furnished",
  "Unfurnished",
];

// Amenity ID to name mapping
const AMENITY_MAP = {
  1: "Lift",
  2: "Swimming Pool",
  3: "Club House",
  4: "Garden",
  5: "Gym",
  6: "Security",
  7: "Power Backup",
  8: "Parking",
  9: "Gas Pipeline",
  10: "Fully Furnished",
  11: "Semi Furnished",
  12: "Unfurnished",
};

// For amenity filter options, use the mapping
const amenityOptions = Object.entries(AMENITY_MAP).map(([id, label]) => ({
  id,
  label,
}));

// Price and Area step definitions
const buyPriceSteps = [
  { id: "buy_1", label: "0-50L", min: 0, max: 5000000 },
  { id: "buy_2", label: "50L-1Cr", min: 5000000, max: 10000000 },
  { id: "buy_3", label: "1-1.5Cr", min: 10000000, max: 15000000 },
  { id: "buy_4", label: "1.5-2Cr", min: 15000000, max: 20000000 },
  { id: "buy_5", label: "2-3Cr", min: 20000000, max: 30000000 },
  { id: "buy_6", label: "3-5Cr", min: 30000000, max: 50000000 },
  { id: "buy_7", label: "5Cr+", min: 50000000, max: Number.MAX_SAFE_INTEGER },
];

const rentPriceSteps = [
  { id: "rent_1", label: "0-20k", min: 0, max: 20000 },
  { id: "rent_2", label: "20-40k", min: 20000, max: 40000 },
  { id: "rent_3", label: "40-60k", min: 40000, max: 60000 },
  { id: "rent_4", label: "60k-1L", min: 60000, max: 100000 },
  { id: "rent_5", label: "1L+", min: 100000, max: Number.MAX_SAFE_INTEGER },
];

const areaSteps = [
  { id: "area_1", label: "0-1000", min: 0, max: 1000 },
  { id: "area_2", label: "1000-2000", min: 1000, max: 2000 },
  { id: "area_3", label: "2000-3000", min: 2000, max: 3000 },
  { id: "area_4", label: "3000-5000", min: 3000, max: 5000 },
  { id: "area_5", label: "5000+", min: 5000, max: Number.MAX_SAFE_INTEGER },
];

// Property type mapping - Updated to merge shop and commercial, remove land/office
const propertyTypeMapping = {
  plot: { superCategoryId: 1, propertyTypeIds: [4], label: "Plot" },
  commercial: {
    superCategoryId: 1,
    propertyTypeIds: [2, 7],
    label: "Commercial",
  },
  buy: { superCategoryId: 1, propertyFor: 1, label: "Buy" },
  rent: { superCategoryId: 2, propertyFor: 2, label: "Rent" },
  all: { superCategoryId: 0, label: "All Properties" },
};

// Add price range configuration
const priceRangeConfig = {
  rent: {
    min: 0,
    max: 100000, // 1 lakh
    step: 1000, // ₹1,000 step
    format: (value: number) => `₹${value.toLocaleString()}/month`,
    displayMax: "₹1 Lakh/month",
  },
  buy: {
    min: 0,
    max: 50000000, // 5 crore
    step: 100000, // ₹1 Lakh step
    format: (value: number) => `₹${value.toLocaleString()}`,
    displayMax: "₹5 Cr+",
  },
  plot: {
    min: 0,
    max: 50000000, // 5 crore
    step: 100000, // ₹1 Lakh step
    format: (value: number) => `₹${value.toLocaleString()}`,
    displayMax: "₹5 Cr+",
  },
  commercial: {
    min: 0,
    max: 50000000, // 5 crore
    step: 100000, // ₹1 Lakh step
    format: (value: number) => `₹${value.toLocaleString()}`,
    displayMax: "₹5 Cr+",
  },
};

// Add plot features configuration
const plotFeatures = [
  { id: "corner", label: "Corner Plot" },
  { id: "mainRoad", label: "Main Road Facing" },
  { id: "waterSupply", label: "Water Supply" },
  { id: "electricity", label: "Electricity" },
  { id: "drainage", label: "Drainage" },
  { id: "approved", label: "Approved Layout" },
];

// Add commercial features configuration
const commercialFeatures = [
  { id: "parking", label: "Parking Space" },
  { id: "security", label: "Security" },
  { id: "powerBackup", label: "Power Backup" },
  { id: "fireSafety", label: "Fire Safety" },
  { id: "loading", label: "Loading/Unloading" },
  { id: "elevator", label: "Elevator" },
];

export const PropertyListing = () => {
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState<PropertyCardProps[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<
    PropertyCardProps[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mobile filter visibility
  const [mobileFiltersVisible, setMobileFiltersVisible] = useState(false);

  // Active tab for property type
  const [activeTab, setActiveTab] = useState("all");

  // Add state for commercial type
  const [commercialType, setCommercialType] = useState<"buy" | "rent">("buy");

  // Add sorting state
  const [sortBy, setSortBy] = useState<string>("newest");
  const [sortOrder, setSortOrder] = useState<string>("desc");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;
  const totalPages = Math.ceil(filteredProperties.length / pageSize);

  // NEW: Track if this is the initial load
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  // NEW: Track the last property type that was fetched
  const [lastFetchedType, setLastFetchedType] = useState<string>("all");

  // Define filter visibility types
  type FilterVisibility = {
    showPrice: boolean;
    showArea: boolean;
    showBedrooms: boolean;
    showBathrooms: boolean;
    showBalcony: boolean;
    showAvailableFrom: boolean | ((type: string) => boolean);
    showTenantPreference: boolean;
    showFurnished: boolean;
    showAmenities: boolean;
  };

  // Filter visibility configuration
  const filterVisibilityConfig: Record<string, FilterVisibility> = {
    plot: {
      showPrice: true,
      showArea: true,
      showBedrooms: false,
      showBathrooms: false,
      showBalcony: false,
      showAvailableFrom: false,
      showTenantPreference: false,
      showFurnished: false,
      showAmenities: false,
    },
    commercial: {
      showPrice: true,
      showArea: true,
      showBedrooms: false,
      showBathrooms: false,
      showBalcony: false,
      showAvailableFrom: (type: string) => type === "rent",
      showTenantPreference: false,
      showFurnished: false,
      showAmenities: true,
    },
    rent: {
      showPrice: true,
      showArea: true,
      showBedrooms: true,
      showBathrooms: true,
      showBalcony: true,
      showAvailableFrom: true,
      showTenantPreference: true,
      showFurnished: true,
      showAmenities: true,
    },
    buy: {
      showPrice: true,
      showArea: true,
      showBedrooms: true,
      showBathrooms: true,
      showBalcony: true,
      showAvailableFrom: false,
      showTenantPreference: false,
      showFurnished: true,
      showAmenities: true,
    },
  };

  // Helper function to check if filter should be visible
  const shouldShowFilter = (filterName: keyof FilterVisibility): boolean => {
    if (activeTab === "plot") {
      const config = filterVisibilityConfig.plot[filterName];
      return typeof config === "function" ? config(activeTab) : config;
    }
    if (activeTab === "commercial") {
      const config = filterVisibilityConfig.commercial[filterName];
      return typeof config === "function" ? config(commercialType) : config;
    }
    if (activeTab === "rent") {
      const config = filterVisibilityConfig.rent[filterName];
      return typeof config === "function" ? config(activeTab) : config;
    }
    if (activeTab === "buy") {
      const config = filterVisibilityConfig.buy[filterName];
      return typeof config === "function" ? config(activeTab) : config;
    }
    // For "all" tab, show all filters
    return true;
  };

  // Basic search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState([0, 50000000]); // Updated to match slider max
  const [minBedrooms, setMinBedrooms] = useState(0);
  const [minBathrooms, setMinBathrooms] = useState(0);
  const [minBalcony, setMinBalcony] = useState(0);
  const [minArea, setMinArea] = useState(0);
  const [maxArea, setMaxArea] = useState(5000); // Added for area range slider
  const [selectedPriceStep, setSelectedPriceStep] = useState<string | null>(
    null,
  );
  const [selectedAreaStep, setSelectedAreaStep] = useState<string | null>(null);

  // Multi-select states for price and area
  const [selectedPriceSteps, setSelectedPriceSteps] = useState<string[]>([]);
  const [selectedAreaSteps, setSelectedAreaSteps] = useState<string[]>([]);

  // Search suggestions state
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Advanced filter states
  const [availableFrom, setAvailableFrom] = useState<Date | undefined>(
    undefined,
  );
  const [preferenceId, setPreferenceId] = useState<string>("4"); // Default to "Anyone"
  const [furnished, setFurnished] = useState<string>("Fully"); // Default to "Fully Furnished"
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  // UI state for advanced filters visibility
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Debug state to show API request/response
  const [apiDebug, setApiDebug] = useState({
    request: null,
    response: null,
    error: null,
  });

  // Fetch suggestions from API with debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm.trim().length > 1) {
        axiosInstance
          .get(
            `/api/account/suggestions?term=${encodeURIComponent(searchTerm)}`,
          )
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
  };

  // Check if advanced filters should be hidden based on property type
  const shouldShowAdvancedFilters = () => {
    return activeTab !== "plot" && activeTab !== "commercial";
  };

  // Toggle mobile filters
  const toggleMobileFilters = () => {
    setMobileFiltersVisible(!mobileFiltersVisible);
  };

  // NEW: Function to check if we need to fetch new data
  const shouldFetchNewData = (currentType: string) => {
    // Always fetch on initial load
    if (isInitialLoad) return true;
    
    // Fetch if property type changed
    if (currentType !== lastFetchedType) return true;
    
    // Fetch if commercial type changed (for commercial properties)
    if (currentType === "commercial" && commercialType !== lastFetchedType) return true;
    
    return false;
  };

  // MODIFIED: Initialize from URL params and fetch data - ONLY on property type changes
  useEffect(() => {
    // Get parameters from URL - ONLY read property type
    const typeParam = searchParams.get("type") || "all";
    
    // CRITICAL FIX: Set activeTab from URL parameter or default to "all"
    const currentTab = typeParam || "all";
    if (currentTab !== activeTab) {
      setActiveTab(currentTab);
    }

    // NEW: Only fetch properties if property type changed or initial load
    const currentType = typeParam || "all";
    if (shouldFetchNewData(currentType)) {
      fetchProperties();
      setLastFetchedType(currentType);
      setIsInitialLoad(false);
    }
  }, [searchParams]); // Keep searchParams dependency but control API calls inside

  // MODIFIED: Debounced fetch properties - REMOVED as we don't need it anymore
  // const debouncedFetchProperties = useCallback(
  //   debounce(() => {
  //     fetchProperties();
  //   }, 500),
  //   [],
  // );

  // Updated fetchProperties function with StatusId: 2 and min/max values set to 0
  const fetchProperties = useCallback(async () => {
    setLoading(true);
    try {
      // Get the current type from URL, not from state
      const currentTypeParam = searchParams.get("type") || "all";

      // MODIFIED: Don't read filter values from URL, use default values for API call
      const filterOptions: FilterOptions = {
        searchTerm: "", // Don't use URL search term
        minPrice: 0, // Don't use URL price range
        maxPrice: 0, // Don't use URL price range
        minBedrooms: 0, // Don't use URL bedrooms
        minBathrooms: 0, // Don't use URL bathrooms
        minBalcony: 0, // Don't use URL balcony
        minArea: 0, // Don't use URL area
        maxArea: 5000, // Don't use URL area
        availableFrom: undefined, // Don't use URL date
        preferenceId: undefined, // Don't use URL preference
        furnished: undefined, // Don't use URL furnished
        amenities: undefined, // Don't use URL amenities
      };

      // FIXED: Use current URL type parameter instead of state
      const typeConfig =
        propertyTypeMapping[currentTypeParam] || propertyTypeMapping.all;

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

      // Get sort parameters from URL or use defaults
      const sortParam = searchParams.get("sort") || "newest";
      let apiSortBy = "";
      let apiSortOrder = "desc";

      // Map sort options to API parameters
      switch (sortParam) {
        case "price-low":
          apiSortBy = "price";
          apiSortOrder = "asc";
          break;
        case "price-high":
          apiSortBy = "price";
          apiSortOrder = "desc";
          break;
        case "area-high":
          apiSortBy = "area";
          apiSortOrder = "desc";
          break;
        case "newest":
        default:
          // Default: Newest First (no specific sort parameters needed)
          apiSortBy = "";
          apiSortOrder = "desc";
          break;
      }

      // Prepare request payload - MODIFIED: Use default values, not URL filter values
      const requestPayload = {
        superCategoryId,
        propertyTypeIds:
          propertyTypeIds.length > 0 ? propertyTypeIds : undefined,
        propertyFor,
        accountId: "string",
        searchTerm: filterOptions.searchTerm,
        minPrice: filterOptions.minPrice, // Use default 0
        maxPrice: filterOptions.maxPrice, // Use default 0
        bedroom: filterOptions.minBedrooms, // Use default 0
        bathroom: filterOptions.minBathrooms, // Use default 0
        balcony: filterOptions.minBalcony, // Use default 0
        minArea: filterOptions.minArea, // Use default 0
        maxArea: filterOptions.maxArea, // Use default 5000
        availableFrom: filterOptions.availableFrom, // Use undefined
        preferenceId: filterOptions.preferenceId, // Use undefined
        furnished: filterOptions.furnished, // Use undefined
        amenities: filterOptions.amenities, // Use undefined
        pageNumber,
        pageSize,
        // Add sorting parameters
        SortBy: apiSortBy,
        SortOrder: apiSortOrder,
      };

      setApiDebug((prev) => ({ ...prev, request: requestPayload }));

      const response = await axiosInstance.post<ApiResponse>(
        "/api/Account/GetProperty",
        requestPayload,
      );

      setApiDebug((prev) => ({ ...prev, response: response.data }));

      // Check if we have properties in the response
      if (
        !response.data.propertyInfo ||
        response.data.propertyInfo.length === 0
      ) {
        setProperties([]);
        setFilteredProperties([]);
        return;
      }

      // Transform API data with proper type mapping - Updated to merge shop/commercial
      const transformedData = response.data.propertyInfo.map(
        (prop): PropertyCardProps => {
          let type: "buy" | "sell" | "rent" | "plot" | "commercial" = "buy";

          const superCategoryLower = prop.superCategory?.toLowerCase() || "";
          const propertyTypeLower = prop.propertyType?.toLowerCase() || "";

          // Map based on API requirements - Updated logic
          if (prop.propertyType === "4" || propertyTypeLower.includes("plot")) {
            type = "plot";
          } else if (
            prop.propertyType === "2" ||
            prop.propertyType === "7" ||
            propertyTypeLower.includes("shop") ||
            propertyTypeLower.includes("commercial")
          ) {
            type = "commercial";
          } else if (
            superCategoryLower.includes("rent") ||
            prop.superCategory === "2"
          ) {
            type = "rent";
          } else if (
            superCategoryLower.includes("sell") ||
            superCategoryLower.includes("buy") ||
            prop.superCategory === "1"
          ) {
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
            image:
              prop.mainImageUrl ||
              "https://via.placeholder.com/400x300?text=No+Image",
            availableFrom: prop.availableFrom,
            preferenceId: prop.preferenceId,
            amenities: prop.amenities,
            furnished: prop.furnished,
            likeCount: prop.likeCount || 0,
            isLike: prop.isLike ?? false,
            propertyType: prop.propertyType,
            status: prop.superCategory,
          };
        },
      );

      setProperties(transformedData);

    } catch (err) {
      console.error("❌ Failed to fetch properties:", err);
      console.error("❌ Error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        statusText: err.response?.statusText,
      });
      setError("Unable to load properties. Please try again later.");
      setApiDebug((prev) => ({ ...prev, error: err }));

      // Set empty arrays to show no properties
      setProperties([]);
      setFilteredProperties([]);
    } finally {
      setLoading(false);
    }
  }, [searchParams]); // Keep searchParams dependency but control when to call

  // Apply filters to the property list - MODIFIED: This now handles ALL filtering client-side
  const applyFilters = useCallback(
    (data: PropertyCardProps[]) => {
      let filtered = data;

      // Get current type from URL
      const currentTypeParam = searchParams.get("type") || "all";

      // Apply property type filtering first
      if (currentTypeParam === "plot") {
        filtered = filtered.filter(
          (prop) =>
            prop.type === "plot" ||
            prop.propertyType === "4" ||
            (prop.propertyType?.toLowerCase() || "").includes("plot"),
        );
      } else if (currentTypeParam === "commercial") {
        filtered = filtered.filter(
          (prop) =>
            prop.type === "commercial" ||
            prop.propertyType === "2" ||
            prop.propertyType === "7" ||
            (prop.propertyType?.toLowerCase() || "").includes("commercial") ||
            (prop.propertyType?.toLowerCase() || "").includes("shop"),
        );
      } else if (currentTypeParam !== "all") {
        filtered = filtered.filter(
          (property) => property.type === currentTypeParam,
        );
      }

      // Apply search filter
      if (searchQuery) {
        filtered = filtered.filter(
          (property) =>
            property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            property.location.toLowerCase().includes(searchQuery.toLowerCase()),
        );
      }

      // Apply price range filter
      filtered = filtered.filter(
        (property) =>
          property.price >= priceRange[0] && property.price <= priceRange[1],
      );

      // Apply area range filter
      filtered = filtered.filter(
        (property) => property.area >= minArea && property.area <= maxArea,
      );

      // Apply bedroom filter
      if (minBedrooms > 0) {
        filtered = filtered.filter(
          (property) => property.bedrooms >= minBedrooms,
        );
      }

      // Apply bathroom filter
      if (minBathrooms > 0) {
        filtered = filtered.filter(
          (property) => property.bathrooms >= minBathrooms,
        );
      }

      // Apply balcony filter
      if (minBalcony > 0) {
        filtered = filtered.filter(
          (property) => property.balcony >= minBalcony,
        );
      }

      // Apply availability filter
      if (availableFrom) {
        filtered = filtered.filter((property) => {
          if (!property.availableFrom) return false;
          const propertyDate = new Date(property.availableFrom);
          return propertyDate >= availableFrom;
        });
      }

      // Apply tenant preference filter - ONLY for rent properties and when a specific preference is selected
      if (preferenceId !== "0" && currentTypeParam === "rent") {
        // FIXED: Handle properties without preferenceId (show them) and properties with matching preferenceId
        filtered = filtered.filter(
          (property) =>
            !property.preferenceId ||
            property.preferenceId === parseInt(preferenceId),
        );
      }

      // Apply furnished filter
      const currentFurnished = searchParams.get("furnished");
      if (currentFurnished) {
        filtered = filtered.filter(
          (property) => property.furnished === currentFurnished,
        );
      }

      // Apply amenities filter
      if (selectedAmenities.length > 0) {
        filtered = filtered.filter((property) =>
          selectedAmenities.every((amenity) =>
            property.amenities?.includes(amenity),
          ),
        );
      }

      setFilteredProperties(filtered);
    },
    [
      searchParams,
      searchQuery,
      priceRange,
      minBedrooms,
      minBathrooms,
      minBalcony,
      minArea,
      maxArea,
      availableFrom,
      preferenceId,
      selectedAmenities,
    ],
  );

  // OPTIMIZED: Apply filters without triggering new API calls
  useEffect(() => {
    if (properties.length > 0) {
      applyFilters(properties);
    }
  }, [properties, applyFilters]); // Only depend on properties, not individual filter states

  // MODIFIED: Handle tab change and update URL - ONLY trigger API call on property type change
  const handleTabChange = (value: string) => {
    setActiveTab(value);

    // Reset commercial type when switching away from commercial tab
    if (value !== "commercial") {
      setCommercialType("buy");
    }

    // Hide advanced filters if plot or commercial is selected
    if (value === "plot" || value === "commercial") {
      setShowAdvancedFilters(false);
    }

    if (value !== "all") {
      searchParams.set("type", value);
      if (value === "commercial") {
        searchParams.set("commercialType", commercialType);
      } else {
        searchParams.delete("commercialType");
      }
    } else {
      searchParams.delete("type");
      searchParams.delete("commercialType");
    }

    setSearchParams(searchParams);
  };

  // MODIFIED: Add handler for commercial type change - ONLY trigger API call on commercial type change
  const handleCommercialTypeChange = (value: "buy" | "rent") => {
    setCommercialType(value);
    searchParams.set("commercialType", value);
    setSearchParams(searchParams);
  };

  // MODIFIED: Handle price step selection (multi-select) - NO API call, NO URL update
  const handlePriceStepChange = (stepId: string) => {
    const priceSteps =
      activeTab === "rent" ||
      (activeTab === "commercial" && commercialType === "rent")
        ? rentPriceSteps
        : buyPriceSteps;

    let newSelectedPriceSteps: string[];

    if (selectedPriceSteps.includes(stepId)) {
      // Remove from selection
      newSelectedPriceSteps = selectedPriceSteps.filter((id) => id !== stepId);
    } else {
      // Add to selection
      newSelectedPriceSteps = [...selectedPriceSteps, stepId];
    }

    setSelectedPriceSteps(newSelectedPriceSteps);

    // Calculate min and max price from selected steps
    if (newSelectedPriceSteps.length > 0) {
      const selectedSteps = newSelectedPriceSteps
        .map((id) => priceSteps.find((step) => step.id === id))
        .filter(Boolean);

      const minPrice = Math.min(...selectedSteps.map((step) => step!.min));
      const maxPrice = Math.max(...selectedSteps.map((step) => step!.max));

      setPriceRange([minPrice, maxPrice]);
    } else {
      // Reset to default range
      const config = priceRangeConfig[activeTab as keyof typeof priceRangeConfig] || priceRangeConfig.buy;
      setPriceRange([config.min, config.max]);
    }
  };

  // MODIFIED: Handle area step selection (multi-select) - NO API call, NO URL update
  const handleAreaStepChange = (stepId: string) => {
    let newSelectedAreaSteps: string[];

    if (selectedAreaSteps.includes(stepId)) {
      // Remove from selection
      newSelectedAreaSteps = selectedAreaSteps.filter((id) => id !== stepId);
    } else {
      // Add to selection
      newSelectedAreaSteps = [...selectedAreaSteps, stepId];
    }

    setSelectedAreaSteps(newSelectedAreaSteps);

    // Calculate min and max area from selected steps
    if (newSelectedAreaSteps.length > 0) {
      const selectedSteps = newSelectedAreaSteps
        .map((id) => areaSteps.find((step) => step.id === id))
        .filter(Boolean);

      const minArea = Math.min(...selectedSteps.map((step) => step!.min));
      const maxArea = Math.max(...selectedSteps.map((step) => step!.max));

      setMinArea(minArea);
      setMaxArea(maxArea);
    } else {
      // Reset to default range
      setMinArea(0);
      setMaxArea(5000);
    }
  };

  // MODIFIED: Handle search form submission - NO API call, NO URL update
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setSearchQuery(searchTerm);
    }
  };

  // MODIFIED: Reset all filters to default values - NO API call, NO URL update
  const resetFilters = () => {
    setPriceRange([0, 50000000]);
    setMinBedrooms(0);
    setMinBathrooms(0);
    setMinBalcony(0);
    setMinArea(0);
    setMaxArea(5000);
    setSearchQuery("");
    setSearchTerm("");
    setAvailableFrom(undefined);
    setPreferenceId("4");
    setFurnished("Fully");
    setSelectedAmenities([]);
    setActiveTab("all");
    setSelectedPriceStep(null);
    setSelectedAreaStep(null);
    setSelectedPriceSteps([]);
    setSelectedAreaSteps([]);
    setSortBy("newest");
    
    // Only clear URL parameters, don't set new ones
    const newSearchParams = new URLSearchParams();
    setSearchParams(newSearchParams);
  };

  // MODIFIED: Handle price range change - NO API call, NO URL update
  const handlePriceRangeChange = (value: number[]) => {
    setPriceRange(value);
  };

  // MODIFIED: Handle area range change - NO API call, NO URL update
  const handleAreaChange = (value: number[]) => {
    setMinArea(value[0]);
    setMaxArea(value[1]);
  };

  // MODIFIED: Update when bedroom selection changes - NO API call, NO URL update
  const handleBedroomChange = (value: number) => {
    setMinBedrooms(value);
  };

  // MODIFIED: Update when bathroom selection changes - NO API call, NO URL update
  const handleBathroomChange = (value: number) => {
    setMinBathrooms(value);
  };

  // MODIFIED: Update when balcony selection changes - NO API call, NO URL update
  const handleBalconyChange = (value: number) => {
    setMinBalcony(value);
  };

  // MODIFIED: Update when availability date changes - NO API call, NO URL update
  const handleDateChange = (date: Date | undefined) => {
    setAvailableFrom(date);
  };

  // MODIFIED: Update when preference changes - NO API call, NO URL update
  const handlePreferenceChange = (value: string) => {
    setPreferenceId(value);
  };

  // MODIFIED: Update when furnished status changes - NO API call, NO URL update
  const handleFurnishedChange = (value: string) => {
    setFurnished(value);
  };

  // MODIFIED: Handle amenity toggle - NO API call, NO URL update
  const handleAmenityToggle = (amenity: string) => {
    let newAmenities: string[];

    if (selectedAmenities.includes(amenity)) {
      newAmenities = selectedAmenities.filter((a) => a !== amenity);
    } else {
      newAmenities = [...selectedAmenities, amenity];
    }

    setSelectedAmenities(newAmenities);
  };

  // MODIFIED: Handle sort change - NO API call, NO URL update
  const handleSortChange = (value: string) => {
    setSortBy(value);
  };

  // Format price display based on property type
  const formatPrice = (price: number, type: string) => {
    const config =
      priceRangeConfig[type as keyof typeof priceRangeConfig] ||
      priceRangeConfig.buy;
    return config.format(price);
  };

  // MODIFIED: Update price range when property type changes - NO URL update for filters
  useEffect(() => {
    const config =
      priceRangeConfig[activeTab as keyof typeof priceRangeConfig] ||
      priceRangeConfig.buy;
    setPriceRange([config.min, config.max]);
    // Remove URL updates for price range
  }, [activeTab]);

  // Add state for sidebar visibility
  const [sidebarVisible, setSidebarVisible] = useState(true);

  // Add state for property type section collapse
  const [propertyTypeCollapsed, setPropertyTypeCollapsed] = useState(false);

  // In the component, use the correct amenityOptions based on activeTab
  const getCurrentAmenityOptions = () => {
    if (activeTab === "commercial") {
      return commercialAmenityOptions;
    }
    return amenityOptions;
  };

  // Get current property type icon
  const getCurrentPropertyTypeIcon = () => {
    const propertyTypes = [
      { key: "all", icon: "🏘️" },
      { key: "buy", icon: "🏠" },
      { key: "rent", icon: "🔑" },
      { key: "plot", icon: "🏞️" },
      { key: "commercial", icon: "🏢" },
    ];
    return propertyTypes.find((pt) => pt.key === activeTab)?.icon || "🏘️";
  };

  // Slice filteredProperties for current page
  const paginatedProperties = filteredProperties.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  useEffect(() => {
    // Reset to first page when filters or tab change
    setCurrentPage(1);
  }, [
    activeTab,
    searchQuery,
    priceRange,
    minBedrooms,
    minBathrooms,
    minBalcony,
    minArea,
    maxArea,
    availableFrom,
    preferenceId,
    furnished,
    selectedAmenities,
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Hero Section with Slider - Compact */}
      <section className="relative h-96 sm:h-[500px] overflow-hidden">
        {/* Slider with clearer images */}
        <div className="absolute inset-0 z-0">
          <div
            className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 opacity-100"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80')",
            }}
          />
          {/* Light overlay for text readability */}
          <div className="absolute inset-0 bg-black/10"></div>
        </div>

        {/* Hero Content - Responsive padding and sizing */}
        <div className="relative max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 z-10 h-full flex flex-col justify-center items-center">
          <div className="animate-fade-in text-center w-full">
            <div className="bg-white/70 backdrop-blur-sm p-3 sm:p-4 md:p-6 rounded-xl sm:rounded-2xl shadow-lg mx-4 sm:mx-auto">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-3 sm:mb-4 tracking-tight text-black">
                <span>Find Your </span>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-400">
                  Dream Property
                </span>
              </h2>

              <form
                onSubmit={handleSearch}
                className="mt-3 sm:mt-4 relative mx-auto"
              >
                <div className="relative flex shadow-xl">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 sm:pl-4 pointer-events-none">
                    <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                  </div>
                  <Input
                    type="text"
                    className="block w-full rounded-full pl-10 sm:pl-12 pr-24 sm:pr-28 py-3 sm:py-4 md:py-5 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                    placeholder="Search Society, Locality, City, State"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() =>
                      setTimeout(() => setShowSuggestions(false), 150)
                    }
                  />
                  <Button
                    type="submit"
                    className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 rounded-full py-1.5 sm:py-2 md:py-5 px-4 sm:px-6 text-xs sm:text-sm md:text-base shadow-lg"
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
      </section>

      <div className="w-full px-4 py-8">
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

        {/* Main content area with sidebar and property listings using flex */}
        <div className="flex flex-col md:flex-row gap-4">
          {/* Collapsible Sidebar filters */}
          <div
            className={`transition-all duration-300 mb-6 md:mb-0 shrink-0 overflow-hidden flex flex-col
              ${sidebarVisible ? "w-full md:w-[320px]" : "w-12 md:w-12"}
              bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 border-r border-slate-200 relative rounded-2xl shadow-2xl backdrop-blur-sm
              ${!mobileFiltersVisible ? "md:block hidden" : ""}`}
            style={{
              minWidth: sidebarVisible ? undefined : "3rem",
              maxWidth: sidebarVisible ? undefined : "3rem",
            }}
          >
            {/* Sidebar toggle button - only visible on desktop */}
            <div
              className="hidden md:flex items-center justify-end h-12 w-full p-2"
              style={{ minHeight: "3rem" }}
            >
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSidebarVisible(!sidebarVisible)}
                className="mb-2 bg-white/80 backdrop-blur-sm border-slate-300 hover:bg-white hover:border-slate-400 shadow-md"
              >
                {sidebarVisible ? (
                  <>
                    <Minus className="h-4 w-4 mr-2" /> Hide
                  </>
                ) : (
                  <Plus className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Sidebar content */}
            <div
              className={`flex-1 transition-opacity duration-300 ${
                sidebarVisible || mobileFiltersVisible
                  ? "opacity-100"
                  : "opacity-0 pointer-events-none h-0 overflow-hidden"
              }`}
            >
              {(sidebarVisible || mobileFiltersVisible) && (
                <div className="p-4">
                  {/* Filter Card */}
                  <div className="bg-gradient-to-br from-white/95 via-white/90 to-white/85 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30 p-6 flex flex-col gap-6 hover:shadow-3xl transition-all duration-300 relative overflow-hidden">
                    {/* Decorative background elements */}
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full -translate-y-10 translate-x-10 blur-xl"></div>
                    <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-indigo-400/8 to-blue-400/8 rounded-full translate-y-8 -translate-x-8 blur-lg"></div>
                    {/* Property Type Tabs Section - Collapsible */}
                    <div className="mb-6 relative">
                      <div
                        className="font-bold text-slate-800 text-sm mb-3 flex items-center justify-between cursor-pointer bg-gradient-to-r from-slate-100 to-blue-50 p-3 rounded-xl border border-slate-200/50"
                        onClick={() =>
                          setPropertyTypeCollapsed(!propertyTypeCollapsed)
                        }
                      >
                        <span className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <Home className="h-3 w-3 text-white" />
                          </div>
                          <span>Property Type</span>
                          {propertyTypeCollapsed && (
                            <span className="text-lg">
                              {getCurrentPropertyTypeIcon()}
                            </span>
                          )}
                        </span>
                        {propertyTypeCollapsed ? (
                          <ChevronDown className="h-4 w-4 text-slate-600" />
                        ) : (
                          <ChevronUp className="h-4 w-4 text-slate-600" />
                        )}
                      </div>
                      {!propertyTypeCollapsed && (
                        <div className="flex flex-col gap-2">
                          {[
                            { key: "all", label: "All Properties", icon: "🏘️" },
                            { key: "buy", label: "Buy", icon: "🏠" },
                            { key: "rent", label: "Rent", icon: "🔑" },
                            { key: "plot", label: "Plot", icon: "🏞️" },
                            {
                              key: "commercial",
                              label: "Commercial",
                              icon: "🏢",
                            },
                          ].map((tab) => (
                            <button
                              key={tab.key}
                              onClick={() => handleTabChange(tab.key)}
                              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 border
                                ${
                                  activeTab === tab.key
                                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg border-blue-300 transform scale-105"
                                    : "bg-white/80 text-slate-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 border-slate-200 hover:border-blue-300 hover:shadow-md"
                                }
                              `}
                            >
                              <span className="text-lg">{tab.icon}</span>
                              <span>{tab.label}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Commercial Type Selection */}
                    {activeTab === "commercial" && (
                      <div className="mb-6">
                        <label className="block text-xs font-semibold text-blue-700 mb-2">
                          Commercial Type
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            variant={
                              commercialType === "buy" ? "default" : "outline"
                            }
                            className={`w-full flex items-center justify-center gap-2 py-6 ${
                              commercialType === "buy"
                                ? "bg-blue-600 hover:bg-blue-700 text-white"
                                : "border-blue-200 hover:bg-blue-50"
                            }`}
                            onClick={() => handleCommercialTypeChange("buy")}
                          >
                            <span className="text-lg">💰</span>
                            <span>Buy</span>
                          </Button>
                          <Button
                            variant={
                              commercialType === "rent" ? "default" : "outline"
                            }
                            className={`w-full flex items-center justify-center gap-2 py-6 ${
                              commercialType === "rent"
                                ? "bg-blue-600 hover:bg-blue-700 text-white"
                                : "border-blue-200 hover:bg-blue-50"
                            }`}
                            onClick={() => handleCommercialTypeChange("rent")}
                          >
                            <span className="text-lg">📋</span>
                            <span>Rent</span>
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Sidebar Header */}
                    <div className="flex items-center justify-between mb-4 p-3 bg-gradient-to-r from-slate-100 to-blue-50 rounded-xl border border-slate-200/50">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                          <FilterX className="h-4 w-4 text-white" />
                        </div>

                      </div>

                    </div>

                    {/* Price Range Section */}
                    {shouldShowFilter("showPrice") && (
                      <div className="mb-6">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                            <IndianRupeeIcon className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <div className="font-bold text-blue-800 text-sm">
                              Price Range
                            </div>
                            <div className="text-xs text-gray-500">
                              Select your budget
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {(activeTab === "rent" ||
                          (activeTab === "commercial" &&
                            commercialType === "rent")
                            ? rentPriceSteps
                            : buyPriceSteps
                          ).map((step) => (
                            <Button
                              key={step.id}
                              variant={
                                selectedPriceSteps.includes(step.id)
                                  ? "default"
                                  : "outline"
                              }
                              onClick={() => handlePriceStepChange(step.id)}
                              className={`h-12 text-xs font-semibold transition-all duration-200 ${
                                selectedPriceSteps.includes(step.id)
                                  ? "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg transform scale-105"
                                  : "bg-white hover:bg-blue-50 border-blue-200 hover:border-blue-300 text-blue-700 hover:text-blue-800"
                              }`}
                            >
                              <div className="flex flex-col items-center">
                                <span className="font-bold">{step.label}</span>
                                {selectedPriceSteps.includes(step.id) && (
                                  <span className="text-xs opacity-90">
                                    ✓ Selected
                                  </span>
                                )}
                              </div>
                            </Button>
                          ))}
                        </div>
                        {selectedPriceSteps.length > 0 && (
                          <div className="mt-3 p-2 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="text-xs text-blue-700 font-medium">
                              Selected: {selectedPriceSteps.length} price range
                              {selectedPriceSteps.length > 1 ? "s" : ""}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Rooms & Features Section */}
                    <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-4 flex flex-col gap-4 border border-slate-200/50">
                      <div className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
                        <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-md flex items-center justify-center">
                          <Bed className="h-3 w-3 text-white" />
                        </div>
                        {activeTab === "plot"
                          ? "Features"
                          : activeTab === "commercial"
                            ? "Features"
                            : "Rooms & Features"}
                      </div>

                      {/* Residential Features */}
                      {(activeTab === "buy" || activeTab === "rent") && (
                        <>
                          {/* Bedrooms Dropdown */}
                          {shouldShowFilter("showBedrooms") && (
                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-2">
                                Bedrooms
                              </label>
                              <Select
                                value={minBedrooms ? String(minBedrooms) : "0"}
                                onValueChange={(v) =>
                                  handleBedroomChange(Number(v))
                                }
                              >
                                <SelectTrigger className="rounded-lg border-slate-300 bg-white/80 text-slate-900 font-medium focus:ring-2 focus:ring-blue-400 hover:bg-white">
                                  <SelectValue placeholder="Any" />
                                </SelectTrigger>
                                <SelectContent className="bg-white border-slate-200">
                                  <SelectItem value="0">Any</SelectItem>
                                  <SelectItem value="1">1</SelectItem>
                                  <SelectItem value="2">2</SelectItem>
                                  <SelectItem value="3">3</SelectItem>
                                  <SelectItem value="4">4</SelectItem>
                                  <SelectItem value="5">5+</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                          {/* Bathrooms Dropdown */}
                          {shouldShowFilter("showBathrooms") && (
                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-2">
                                Bathrooms
                              </label>
                              <Select
                                value={
                                  minBathrooms ? String(minBathrooms) : "0"
                                }
                                onValueChange={(v) =>
                                  handleBathroomChange(Number(v))
                                }
                              >
                                <SelectTrigger className="rounded-lg border-blue-300 bg-blue-50 text-blue-900 font-medium focus:ring-2 focus:ring-blue-400">
                                  <SelectValue placeholder="Any" />
                                </SelectTrigger>
                                <SelectContent className="bg-white border-blue-200">
                                  <SelectItem value="0">Any</SelectItem>
                                  <SelectItem value="1">1</SelectItem>
                                  <SelectItem value="2">2</SelectItem>
                                  <SelectItem value="3">3</SelectItem>
                                  <SelectItem value="4">4</SelectItem>
                                  <SelectItem value="5">5+</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                          {/* Balconies Dropdown */}
                          {shouldShowFilter("showBalcony") && (
                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-2">
                                Balconies
                              </label>
                              <Select
                                value={minBalcony ? String(minBalcony) : "0"}
                                onValueChange={(v) =>
                                  handleBalconyChange(Number(v))
                                }
                              >
                                <SelectTrigger className="rounded-lg border-blue-300 bg-blue-50 text-blue-900 font-medium focus:ring-2 focus:ring-blue-400">
                                  <SelectValue placeholder="Any" />
                                </SelectTrigger>
                                <SelectContent className="bg-white border-blue-200">
                                  <SelectItem value="0">Any</SelectItem>
                                  <SelectItem value="1">1</SelectItem>
                                  <SelectItem value="2">2</SelectItem>
                                  <SelectItem value="3">3</SelectItem>
                                  <SelectItem value="4">4</SelectItem>
                                  <SelectItem value="5">5+</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        </>
                      )}

                      {/* Area Range Section */}
                      {shouldShowFilter("showArea") && (
                        <div className="mb-4">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                              <Ruler className="h-4 w-4 text-white" />
                            </div>
                            <div>
                              <div className="font-bold text-blue-800 text-sm">
                                Area (sq.ft)
                              </div>
                              <div className="text-xs text-gray-500">
                                Choose property size
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            {areaSteps.map((step) => (
                              <Button
                                key={step.id}
                                variant={
                                  selectedAreaSteps.includes(step.id)
                                    ? "default"
                                    : "outline"
                                }
                                onClick={() => handleAreaStepChange(step.id)}
                                className={`h-12 text-xs font-semibold transition-all duration-200 ${
                                  selectedAreaSteps.includes(step.id)
                                    ? "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg transform scale-105"
                                    : "bg-white hover:bg-blue-50 border-blue-200 hover:border-blue-300 text-blue-700 hover:text-blue-800"
                                }`}
                              >
                                <div className="flex flex-col items-center">
                                  <span className="font-bold">
                                    {step.label}
                                  </span>
                                  {selectedAreaSteps.includes(step.id) && (
                                    <span className="text-xs opacity-90">
                                      ✓ Selected
                                    </span>
                                  )}
                                </div>
                              </Button>
                            ))}
                          </div>
                          {selectedAreaSteps.length > 0 && (
                            <div className="mt-3 p-2 bg-blue-50 rounded-lg border border-blue-200">
                              <div className="text-xs text-blue-700 font-medium">
                                Selected: {selectedAreaSteps.length} area range
                                {selectedAreaSteps.length > 1 ? "s" : ""}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Preferences Dropdown */}
                    {shouldShowFilter("showTenantPreference") && (
                      <div>
                        <label className="block text-xs font-semibold text-blue-700 mb-1 mt-4">
                          Preferences
                        </label>
                        <Select
                          value={preferenceId}
                          onValueChange={handlePreferenceChange}
                        >
                          <SelectTrigger className="rounded-lg border-blue-300 bg-blue-50 text-blue-900 font-medium focus:ring-2 focus:ring-blue-400">
                            <SelectValue placeholder="Any" />
                          </SelectTrigger>
                          <SelectContent className="bg-white border-blue-200">
                            {preferenceOptions.map((option) => (
                              <SelectItem key={option.id} value={option.id}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* Furnished Dropdown */}
                    {shouldShowFilter("showFurnished") && (
                      <div>
                        <label className="block text-xs font-semibold text-blue-700 mb-1">
                          Furnished
                        </label>
                        <Select
                          value={furnished}
                          onValueChange={handleFurnishedChange}
                        >
                          <SelectTrigger className="rounded-lg border-blue-300 bg-blue-50 text-blue-900 font-medium focus:ring-2 focus:ring-blue-400">
                            <SelectValue placeholder="Fully Furnished" />
                          </SelectTrigger>
                          <SelectContent className="bg-white border-blue-200">
                            {furnishedOptions.map((option) => (
                              <SelectItem key={option.id} value={option.id}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* Available From Date Picker */}
                    {shouldShowFilter("showAvailableFrom") && (
                      <div>
                        <label className="block text-xs font-semibold text-blue-700 mb-1 mt-4">
                          Available From
                        </label>
                        <div className="relative">
                          <DatePicker
                            date={availableFrom}
                            setDate={handleDateChange}
                            className="w-full rounded-lg border-blue-300 bg-blue-50 text-blue-900 font-medium focus:ring-2 focus:ring-blue-400"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Collapsed Sidebar Icons - Only visible when sidebar is collapsed */}
            {!sidebarVisible && (
              <div className="flex flex-col items-center gap-4 p-2">
                {/* Property Type Icons - Only first 5 visible and clickable */}
                {[
                  { key: "all", label: "All Properties", icon: "🏘️" },
                  { key: "buy", label: "Buy", icon: "🏠" },
                  { key: "rent", label: "Rent", icon: "🔑" },
                  { key: "plot", label: "Plot", icon: "🏞️" },
                  { key: "commercial", label: "Commercial", icon: "🏢" },
                ]
                  .slice(0, 5)
                  .map((tab) => (
                    <div
                      key={tab.key}
                      className="relative group cursor-pointer"
                      title={tab.label}
                      onClick={() => handleTabChange(tab.key)}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg transition-colors ${
                          activeTab === tab.key
                            ? "bg-blue-600 text-white shadow-lg"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                      >
                        {tab.icon}
                      </div>
                      {/* Tooltip */}
                      <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                        {tab.label}
                      </div>
                    </div>
                  ))}
                {/* The rest of the icons are hidden in collapsed state */}
              </div>
            )}
          </div>

          {/* Property listings - takes full remaining width */}
          <div className="flex-1 min-w-0 w-full pr-4">
            {/* Applied filters display */}
            {(searchQuery ||
              minBedrooms > 0 ||
              minBathrooms > 0 ||
              minBalcony > 0 ||
              minArea > 0 ||
              availableFrom ||
              preferenceId !== "0" ||
              furnished ||
              selectedPriceSteps.length > 0 ||
              selectedAreaSteps.length > 0) && (
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

                  {preferenceId !== "4" && (
                    <Badge className="flex items-center gap-1 bg-blue-100 text-blue-800 hover:bg-blue-200">
                      {
                        preferenceOptions.find((p) => p.id === preferenceId)
                          ?.label
                      }
                      <X
                        className="h-3 w-3 ml-1 cursor-pointer"
                        onClick={() => {
                          setPreferenceId("4");
                          searchParams.delete("preference");
                          setSearchParams(searchParams);
                        }}
                      />
                    </Badge>
                  )}

                  {furnished && furnished !== "Fully" && (
                    <Badge className="flex items-center gap-1 bg-blue-100 text-blue-800 hover:bg-blue-200">
                      {furnishedOptions.find((f) => f.id === furnished)?.label}
                      <X
                        className="h-3 w-3 ml-1 cursor-pointer"
                        onClick={() => {
                          setFurnished("Fully"); // Reset to default
                          searchParams.delete("furnished"); // Remove from URL instead of setting
                          setSearchParams(searchParams);
                        }}
                      />
                    </Badge>
                  )}

                  {selectedPriceSteps.length > 0 && (
                    <Badge className="flex items-center gap-1 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 hover:from-blue-200 hover:to-blue-300 border border-blue-300">
                      <IndianRupeeIcon className="h-3 w-3" />
                      Price: {selectedPriceSteps.length} selected
                      <X
                        className="h-3 w-3 ml-1 cursor-pointer hover:text-blue-600"
                        onClick={() => {
                          setSelectedPriceSteps([]);
                          searchParams.delete("priceSteps");
                          searchParams.delete("minPrice");
                          searchParams.delete("maxPrice");
                          setSearchParams(searchParams);
                        }}
                      />
                    </Badge>
                  )}

                  {selectedAreaSteps.length > 0 && (
                    <Badge className="flex items-center gap-1 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 hover:from-blue-200 hover:to-blue-300 border border-blue-300">
                      <Ruler className="h-3 w-3" />
                      Area: {selectedAreaSteps.length} selected
                      <X
                        className="h-3 w-3 ml-1 cursor-pointer hover:text-blue-600"
                        onClick={() => {
                          setSelectedAreaSteps([]);
                          searchParams.delete("areaSteps");
                          searchParams.delete("minArea");
                          searchParams.delete("maxArea");
                          setSearchParams(searchParams);
                        }}
                      />
                    </Badge>
                  )}


                </div>
              </div>
            )}

            {/* Results count and sort */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
              {/* Results count */}
              <div className="mb-4 sm:mb-0">
                <p className="text-sm text-gray-600">
                  Showing{" "}
                  <span className="font-semibold">
                    {filteredProperties.length}
                  </span>{" "}
                  properties
                </p>
              </div>

              {/* Sort dropdown */}
              <div className="mt-2 sm:mt-0">
                <Select value={sortBy} onValueChange={handleSortChange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="price-low">
                      Price: Low to High
                    </SelectItem>
                    <SelectItem value="price-high">
                      Price: High to Low
                    </SelectItem>
                    <SelectItem value="area-high">
                      Area: Largest First
                    </SelectItem>
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

            {/* Results grid - modern card design, 3 per row on desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 mb-10 w-full">
              {loading ? (
                // Loading skeletons
                Array(6)
                  .fill(0)
                  .map((_, index) => (
                    <Card
                      key={index}
                      className="overflow-hidden shadow-lg rounded-2xl border-0 bg-white animate-pulse"
                    >
                      <div className="h-48 bg-gray-200 animate-pulse rounded-t-2xl" />
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
                <>
                  {/* Commercial Buy Properties */}
                  {activeTab === "commercial" && commercialType === "buy" && (
                    <>
                      <h3 className="col-span-full text-lg font-semibold mb-4">
                        Commercial Properties for Buy
                      </h3>
                      {paginatedProperties
                        .filter(
                          (prop) =>
                            prop.type === "commercial" &&
                            !prop.status?.toLowerCase().includes("rent"),
                        )
                        .map((property) => (
                          <div key={property.id} className="w-full">
                            <PropertyCard
                              {...property}
                              likeCount={property.likeCount}
                              formattedPrice={formatPrice(
                                property.price,
                                property.type,
                              )}
                              commercialType="buy" // Pass prop
                            />
                          </div>
                        ))}
                    </>
                  )}

                  {/* Commercial Rent Properties */}
                  {activeTab === "commercial" && commercialType === "rent" && (
                    <>
                      <h3 className="col-span-full text-lg font-semibold mb-4">
                        Commercial Properties for Rent
                      </h3>
                      {paginatedProperties
                        .filter(
                          (prop) =>
                            prop.type === "commercial" &&
                            prop.status?.toLowerCase().includes("rent"),
                        )
                        .map((property) => (
                          <div key={property.id} className="w-full">
                            <PropertyCard
                              {...property}
                              likeCount={property.likeCount}
                              formattedPrice={formatPrice(
                                property.price,
                                property.type,
                              )}
                              commercialType="rent" // Pass prop
                            />
                          </div>
                        ))}
                    </>
                  )}

                  {/* Other Property Types */}
                  {activeTab !== "commercial" &&
                    paginatedProperties.map((property) => (
                      <div key={property.id} className="w-full">
                        <PropertyCard
                          {...property}
                          likeCount={property.likeCount}
                          formattedPrice={formatPrice(
                            property.price,
                            property.type,
                          )}
                        />
                      </div>
                    ))}
                </>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <div className="inline-flex rounded-md space-x-2">
                  <Button
                    variant="outline"
                    size="default"
                    className="rounded-full"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    {"<"}
                  </Button>
                  {[...Array(totalPages)].map((_, idx) => (
                    <Button
                      key={idx + 1}
                      variant={currentPage === idx + 1 ? "default" : "outline"}
                      size="default"
                      className="rounded-full"
                      onClick={() => setCurrentPage(idx + 1)}
                    >
                      {idx + 1}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="default"
                    className="rounded-full"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    {">"}
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

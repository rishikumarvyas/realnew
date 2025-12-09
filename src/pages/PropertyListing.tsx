import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import axiosInstance from "@/axiosCalls/axiosInstance";
import { PropertyCard, PropertyCardProps } from "@/components/PropertyCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  FilterX,
  Home,
  IndianRupeeIcon,
  Bed,
  Ruler,
  ChevronDown,
  ChevronUp,
  Plus,
  Minus,
  X,
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
import { Card, CardContent } from "@/components/ui/card";

// API interfaces
interface ApiResponse {
  statusCode: number;
  message: string;
  count: number;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  propertyInfo: ApiProperty[];
}

interface ApiProperty {
  propertyId: string;
  superCategory: string;
  propertyType: string;
  statusId: string; // 2 for approved
  title: string;
  description: string;
  price: number;
  area: number;
  bedroom: number;
  bathroom: number;
  balcony: number;
  likeCount: number;
  address: string;
  locality: string;
  city: string;
  state: string;
  userType: string;
  createdDt: string; // ISO date string
  updatedDt: string; // ISO date string
  availableFrom: string; // ISO date string
  preferenceId: number[]; // Tenant preference ID
  amenityIds: string[];
  mainImageUrl: string;
  // optional from backend
  furnished?: string;
  isLike?: boolean;
  amenities?: any;
}

// Local GetProperty request/response types
interface GetPropertyRequest {
  superCategoryId?: number;
  propertyTypeIds?: number[];
  statusId?: number;
  StatusId?: number; // accept either
  accountId?: string;
  searchTerm?: string;
  lastMonth?: number;
  minPrice?: number;
  maxPrice?: number;
  bedroom?: number;
  balcony?: number;
  bathroom?: number;
  availableFrom?: string;
  minArea?: number;
  maxArea?: number;
  cityIds?: string[];
  amenityIds?: string[];
  preferenceIds?: number[];
  pageNumber?: number;
  pageSize?: number;
  SortBy?: string;
  SortOrder?: string;
  sortBy?: string;
  sortOrder?: string;
}

// Local helper to call GetProperty — simple pass-through (no normalization)
// NOTE: this is a plain async function (not a React hook) so it can be used
// from anywhere in the module without violating the Rules of Hooks.
const callGetProperty = async (payload: GetPropertyRequest) => {
  try {
    console.debug("[GetProperty] Request payload:", payload);
    const response = await axiosInstance.post<ApiResponse>(
      "/api/Account/GetProperty",
      payload
    );
    console.debug("[GetProperty] Response:", {
      status: response.status,
      count: response.data?.count,
    });
    return response;
  } catch (err: any) {
    console.error(
      "[GetProperty] Request failed:",
      err?.response?.status,
      err?.message || err
    );
    throw err;
  }
};

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
  preferenceIds?: string[];
  furnished?: string;
  // Removed amenities - only using furnished filter
}

// Tenant preference mapping
const preferenceOptions = [
  { id: "1", label: "Bachelors" },
  { id: "2", label: "Family" },
  { id: "3", label: "Girls" },
  { id: "4", label: "Anyone" },
  { id: "5", label: "Company" },
  { id: "6", label: "Student" },
];

// Furnished status options
const furnishedOptions = [
  { id: "Fully", label: "Fully Furnished" },
  { id: "Semi", label: "Semi Furnished" },
  { id: "Not", label: "Unfurnished" },
  { id: "any", label: "Any" },
];

// Configuration for furnished amenity IDs - easily changeable
// These IDs are sent in the API request as amenityIds array
const FURNISHED_AMENITY_IDS = {
  Fully: "10", // Fully Furnished - change this ID as needed
  Semi: "11", // Semi Furnished - change this ID as needed
  Not: "12", // Unfurnished - change this ID as needed
};

// Default city IDs used when no search term is provided (approved properties only)
const DEFAULT_CITY_IDS = [
  "67",
  "174",
  "242",
  "226",
  "312",
  "184",
  "216",
  "60",
  "272",
  "126",
  "91",
  "280",
  "112",
  "74",
];

// Price and area steps

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

// Property type mapping

const propertyTypeMapping = {
  plot: { superCategoryId: 1, propertyTypeIds: [4], label: "Plot" },
  buy: { superCategoryId: 1, propertyTypeIds: [1, 3, 5], label: "Buy" },
  rent: { superCategoryId: 2, propertyTypeIds: [6, 8, 10], label: "Rent" },
  all: { superCategoryId: 0, label: "All Properties" },
};

// Price range config

const priceRangeConfig = {
  rent: {
    min: 0,
    max: 0, // No max limit - show all properties
    step: 1000, // ₹1,000 step
    format: (value: number) => `₹${value.toLocaleString()}/month`,
    displayMax: "₹1 Lakh/month",
  },
  buy: {
    min: 0,
    max: 0, // No max limit - show all properties
    step: 100000, // ₹1 Lakh step
    format: (value: number) => `₹${value.toLocaleString()}`,
    displayMax: "₹5 Cr+",
  },
  plot: {
    min: 0,
    max: 0, // No max limit - show all properties
    step: 100000, // ₹1 Lakh step
    format: (value: number) => `₹${value.toLocaleString()}`,
    displayMax: "₹5 Cr+",
  },
  commercial: {
    min: 0,
    max: 0, // No max limit - show all properties
    step: 100000, // ₹1 Lakh step
    format: (value: number) => `₹${value.toLocaleString()}`,
    displayMax: "₹5 Cr+",
  },
};

export const PropertyListing = () => {
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

  // Map UI sort option to API sort parameters
  const getApiSort = (
    uiSort: string
  ): { apiSortBy: string; apiSortOrder: string } => {
    switch (uiSort) {
      case "price-low":
        return { apiSortBy: "price", apiSortOrder: "asc" };
      case "price-high":
        return { apiSortBy: "price", apiSortOrder: "desc" };
      case "area-high":
        return { apiSortBy: "area", apiSortOrder: "desc" };
      case "newest":
      default:
        // Backend returns newest first by default
        return { apiSortBy: "", apiSortOrder: "desc" };
    }
  };

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;
  const totalPages = Math.ceil(filteredProperties.length / pageSize);

  // NEW: Track if this is the initial load
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // NEW: Track the last property type that was fetched
  const [lastFetchedType, setLastFetchedType] = useState<string>("all");

  // NEW: Use state to track the current type to avoid dependency issues
  const [currentType, setCurrentType] = useState<string>("all");

  // Use ref to store fetchProperties function to avoid dependency issues
  const fetchPropertiesRef = useRef<
    ((typeParam: string) => Promise<void>) | null
  >(null);

  // Add flag to prevent multiple API calls
  const isFetchingRef = useRef<boolean>(false);
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
  const [priceRange, setPriceRange] = useState([0, 0]); // Default to 0 for no price filter
  const [minBedrooms, setMinBedrooms] = useState(0);
  const [minBathrooms, setMinBathrooms] = useState(0);
  const [minBalcony, setMinBalcony] = useState(0);
  const [minArea, setMinArea] = useState(0);
  const [maxArea, setMaxArea] = useState(0); // Default to 0 (no limit)

  // Multi-select states for price and area
  const [selectedPriceSteps, setSelectedPriceSteps] = useState<string[]>([]);
  const [selectedAreaSteps, setSelectedAreaSteps] = useState<string[]>([]);

  // Search suggestions state
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Advanced filter states
  const [availableFrom, setAvailableFrom] = useState<Date | undefined>(
    undefined
  );
  const [preferenceIds, setPreferenceIds] = useState<string[]>([]); // Empty array by default
  const [furnished, setFurnished] = useState<string>("any"); // Default to "Any"

  // Fetch suggestions from API with debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm.trim().length > 1) {
        axiosInstance
          .get(
            `/api/account/suggestions?term=${encodeURIComponent(searchTerm)}`
          )
          .then((res) => {
            setSuggestions(res.data);
            setShowSuggestions(true);
          })
          .catch((err) => {
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
    if (currentType === "commercial" && commercialType !== lastFetchedType)
      return true;

    return false;
  };

  // UNIFIED PAYLOAD BUILDER

  type FetchOverrides = {
    availableFrom?: string;
    furnished?: string;
    pageNumber?: number;
    pageSize?: number;
  };

  const buildGetPropertyPayload = useCallback(
    (typeParam: string, overrides: FetchOverrides = {}): GetPropertyRequest => {
      const currentTypeParam = typeParam;
      const typeConfig =
        propertyTypeMapping[currentTypeParam] || propertyTypeMapping.all;

      let superCategoryId = typeConfig.superCategoryId;
      let propertyTypeIds = typeConfig.propertyTypeIds || [];
      // Special handling for different property types
      if (currentTypeParam === "plot") {
        // Plot: Only buy
        superCategoryId = 1;
        propertyTypeIds = [4];
      } else if (
        currentTypeParam === "commercial" &&
        commercialType === "buy"
      ) {
        superCategoryId = 1; // Can Buy
        propertyTypeIds = [2]; // shop for Buy
      } else if (
        currentTypeParam === "commercial" &&
        commercialType === "rent"
      ) {
        superCategoryId = 2; // Can Rent
        propertyTypeIds = [7]; // shop for Rent
      }

      const filterOptions: FilterOptions = {
        searchTerm: searchQuery || "",
        minPrice: priceRange[0] || 0,
        maxPrice: priceRange[1] > 0 ? priceRange[1] : 0,
        minBedrooms: minBedrooms || 0,
        minBathrooms: minBathrooms || 0,
        minBalcony: minBalcony || 0,
        minArea: minArea || 0,
        maxArea: maxArea || 0,
        availableFrom:
          overrides.availableFrom ??
          (availableFrom ? availableFrom.toISOString() : undefined),
        preferenceIds: preferenceIds || [],
        furnished: overrides.furnished ?? (furnished || undefined),
      };

      let pageSize = overrides.pageSize ?? -1;
      let pageNumber = overrides.pageNumber ?? 0;
      if (!overrides.pageSize && currentTypeParam !== "all") {
        pageSize = 10;
        pageNumber = 0;
      }

      // Derive API sort parameters from UI state
      const { apiSortBy, apiSortOrder } = getApiSort(sortBy);

      const payload: GetPropertyRequest = {
        superCategoryId,
        accountId: "",
        searchTerm: filterOptions.searchTerm || "",
        StatusId: 2,
        minPrice: filterOptions.minPrice,
        maxPrice: filterOptions.maxPrice > 0 ? filterOptions.maxPrice : 0,
        bedroom: filterOptions.minBedrooms,
        bathroom: filterOptions.minBathrooms,
        balcony: filterOptions.minBalcony,
        minArea: filterOptions.minArea,
        maxArea: filterOptions.maxArea > 0 ? filterOptions.maxArea : 0,
        pageNumber,
        pageSize,
        SortBy: apiSortBy,
        SortOrder: apiSortOrder,
      };
      // When no search term, fetch only approved properties from default cities
      if (!filterOptions.searchTerm || !filterOptions.searchTerm.trim()) {
        payload.cityIds = DEFAULT_CITY_IDS;
      }
      // Only add propertyTypeIds if it's not empty
      if (propertyTypeIds.length > 0) {
        payload.propertyTypeIds = propertyTypeIds;
      }
      // Only add optional parameters if they have values
      if (filterOptions.availableFrom) {
        payload.availableFrom = filterOptions.availableFrom;
      }
      if (
        filterOptions.preferenceIds &&
        filterOptions.preferenceIds.length > 0
      ) {
        payload.preferenceIds = filterOptions.preferenceIds.map((id) =>
          parseInt(id, 10)
        );
      }
      // Add furnished filter to request payload as amenityIds
      if (filterOptions.furnished && filterOptions.furnished !== "any") {
        // Use the configurable furnished amenity IDs
        const amenityId = FURNISHED_AMENITY_IDS[filterOptions.furnished];
        if (amenityId) {
          // Set amenityIds array with the selected furnished amenity ID
          payload.amenityIds = [amenityId];
        }
      }

      return payload;
    },
    [
      searchQuery,
      priceRange,
      minBedrooms,
      minBathrooms,
      minBalcony,
      minArea,
      maxArea,
      availableFrom,
      preferenceIds,
      furnished,
      sortBy,
      commercialType,
    ]
  );

  //MAIN fetchProperties USING COMMON PAYLOAD

  const fetchProperties = useCallback(
    async (typeParam: string = "all") => {
      // If URL has a search param but searchQuery is not yet updated,
      // skip this call and let the [searchQuery, currentType] effect
      // trigger the real fetch with the correct searchTerm.
      const hasSearchInUrl = !!searchParams.get("search");
      if (hasSearchInUrl && !searchQuery.trim()) {
        return;
      }

      // Prevent multiple simultaneous API calls
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;
      setLoading(true);

      try {
        const payload = buildGetPropertyPayload(typeParam);
        const response = await callGetProperty(payload);

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
            if (
              prop.propertyType === "4" ||
              propertyTypeLower.includes("plot")
            ) {
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
              type,
              bedrooms: prop.bedroom,
              bathrooms: prop.bathroom,
              balcony: prop.balcony,
              area: prop.area,
              image:
                prop.mainImageUrl ||
                "https://via.placeholder.com/400x300?text=No+Image",
              availableFrom: prop.availableFrom,
              preferenceId: prop.preferenceId,
              preferenceIds: prop.preferenceIds,
              furnished: prop.furnished,
              likeCount: prop.likeCount || 0,
              isLike: prop.isLike ?? false,
              propertyType: prop.propertyType,
              status: prop.superCategory,
            };
          }
        );

        setProperties(transformedData);
      } catch (err: any) {
        // Handle 404 error specifically
        if (err.response?.status === 404) {
          setError(
            "No properties found with the current filters. Try adjusting your search criteria."
          );
        } else {
          setError("Unable to load properties. Please try again later.");
        }

        // Set empty arrays to show no properties
        setProperties([]);
        setFilteredProperties([]);
      } finally {
        setLoading(false);
        isFetchingRef.current = false;
      }
    },
    // add searchParams here so hasSearchInUrl is always correct
    [buildGetPropertyPayload, searchParams, searchQuery]
  ); // Depend on sortBy so API receives latest SortBy/SortOrder
  // Store fetchProperties in ref to avoid dependency issues
  fetchPropertiesRef.current = fetchProperties;

  //fetchPropertiesWithFurnished USING COMMON PAYLOAD

  const fetchPropertiesWithFurnished = useCallback(
    async (typeParam: string, furnishedParam: string) => {
      setLoading(true);
      try {
        const payload = buildGetPropertyPayload(typeParam, {
          furnished: furnishedParam,
          pageNumber: 1,
          pageSize: -1,
        });
        const response = await callGetProperty(payload);
        // Transform the data to match PropertyCardProps interface
        const transformedData: PropertyCardProps[] =
          response.data.propertyInfo.map((prop) => ({
            id: prop.propertyId,
            title: prop.title,
            price: prop.price,
            location: prop.city,
            image: prop.mainImageUrl,
            type: prop.superCategory.toLowerCase() as any,
            propertyType: prop.propertyType,
            area: prop.area,
            bedrooms: prop.bedroom,
            bathrooms: prop.bathroom,
            balcony: prop.balcony,
            availableFrom: prop.availableFrom,
            preferenceId: prop.preferenceId,
            preferenceIds: prop.preferenceIds,
            amenities: prop.amenities || prop.amenityIds,
            furnished: prop.furnished,
            isLike: prop.isLike ?? false,
            likeCount: prop.likeCount || 0,
          }));

        setProperties(transformedData);
        setFilteredProperties(transformedData);
      } catch (error) {
        console.error("Error fetching properties:", error);
        setError("Failed to fetch properties");
      } finally {
        setLoading(false);
      }
    },
    [buildGetPropertyPayload]
  );

  //fetchPropertiesWithDate USING COMMON PAYLOAD

  const fetchPropertiesWithDate = useCallback(
    async (typeParam: string, dateParam: Date) => {
      setLoading(true);
      try {
        const payload = buildGetPropertyPayload(typeParam, {
          availableFrom: dateParam.toISOString(),
        });
        const response = await callGetProperty(payload);

        // Check if we have properties in the response
        if (
          !response.data.propertyInfo ||
          response.data.propertyInfo.length === 0
        ) {
          setProperties([]);
          setFilteredProperties([]);
          return;
        }

        // Transform API data with proper type mapping
        const transformedData: PropertyCardProps[] =
          response.data.propertyInfo.map((prop) => {
            let type: "buy" | "sell" | "rent" | "plot" | "commercial" = "buy";
            const superCategoryLower = prop.superCategory?.toLowerCase() || "";
            const propertyTypeLower = prop.propertyType?.toLowerCase() || "";

            if (
              prop.propertyType === "4" ||
              propertyTypeLower.includes("plot")
            ) {
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
              type,
              bedrooms: prop.bedroom,
              bathrooms: prop.bathroom,
              balcony: prop.balcony,
              area: prop.area,
              image:
                prop.mainImageUrl ||
                "https://via.placeholder.com/400x300?text=No+Image",
              availableFrom: prop.availableFrom,
              preferenceId: prop.preferenceId,
              preferenceIds: prop.preferenceIds,
              furnished: prop.furnished,
              likeCount: prop.likeCount || 0,
              isLike: prop.isLike ?? false,
              propertyType: prop.propertyType,
              status: prop.superCategory,
            };
          });

        setProperties(transformedData);
      } catch (err: any) {
        // Handle 404 error specifically
        if (err.response?.status === 404) {
          setError(
            "No properties found with the current filters. Try adjusting your search criteria."
          );
        } else {
          setError("Unable to load properties. Please try again later.");
        }
        // Set empty arrays to show no properties
        setProperties([]);
        setFilteredProperties([]);
      } finally {
        setLoading(false);
      }
    },
    [buildGetPropertyPayload]
  );

  // Handle retry button click
  const handleRetry = useCallback(() => {
    const currentType = searchParams.get("type") || "all";
    if (fetchPropertiesRef.current) {
      fetchPropertiesRef.current(currentType);
    }
  }, [searchParams]); // Remove fetchProperties dependency

  // Ensure initial data fetch and subsequent fetches on type changes
  useEffect(() => {
    const typeParam = searchParams.get("type") || "all";
    const hasSearch = !!searchParams.get("search"); // NEW: check if URL has ?search=
    // Sync tab with URL and reset filters when type changes from external navigation
    if (typeParam !== activeTab) {
      setActiveTab(typeParam);

      // Reset all filters when tab changes from external navigation (navbar)
      setSearchQuery("");
      setSearchTerm("");
      setPriceRange([0, 0]);
      setMinBedrooms(0);
      setMinBathrooms(0);
      setMinBalcony(0);
      setMinArea(0);
      setMaxArea(0);
      setSelectedPriceSteps([]);
      setSelectedAreaSteps([]);
      setAvailableFrom(undefined);
      setPreferenceIds([]);
      setFurnished("any");
      setSortBy("newest");
      setSortOrder("desc");

      // Reset commercial type when switching away from commercial tab
      if (typeParam !== "commercial") {
        setCommercialType("buy");
      }
    }

    // Always handle first mount
    if (isInitialLoad) {
      setCurrentType(typeParam);
      setIsInitialLoad(false);

      // Only do the initial fetch when there is NO search param in the URL
      if (!hasSearch && fetchPropertiesRef.current) {
        fetchPropertiesRef.current(typeParam);
        setLastFetchedType(typeParam);
      }
      return;
    }

    // If URL has a search param, let the searchQuery effect drive the fetch
    // so we don't fire an extra request with searchTerm: "".
    if (hasSearch) {
      return;
    }

    // Fetch when the URL type actually changes thereafter (no ?search= in URL)
    if (typeParam !== currentType && fetchPropertiesRef.current) {
      if (shouldFetchNewData(typeParam)) {
        fetchPropertiesRef.current(typeParam);
        setLastFetchedType(typeParam);
      }
      setCurrentType(typeParam);
    }
  }, [searchParams, isInitialLoad, currentType, shouldFetchNewData]);

  // Handle commercialType URL parameter changes from external navigation
  useEffect(() => {
    const urlCommercialType = searchParams.get("commercialType") as
      | "buy"
      | "rent"
      | null;

    // Only handle commercial type changes when we're on the commercial tab
    if (
      activeTab === "commercial" &&
      urlCommercialType &&
      urlCommercialType !== commercialType
    ) {
      setCommercialType(urlCommercialType);

      // Reset all filters when commercial type changes from external navigation
      setSearchQuery("");
      setSearchTerm("");
      setPriceRange([0, 0]);
      setMinBedrooms(0);
      setMinBathrooms(0);
      setMinBalcony(0);
      setMinArea(0);
      setMaxArea(0);
      setSelectedPriceSteps([]);
      setSelectedAreaSteps([]);
      setAvailableFrom(undefined);
      setPreferenceIds([]);
      setFurnished("any");
      setSortBy("newest");
      setSortOrder("desc");
    }
  }, [searchParams, activeTab, commercialType]);

  // Sync `search` URL param into local search state so external links (e.g., Footer cities)
  // immediately filter the listings by city/locality/society.
  useEffect(() => {
    const urlSearch = searchParams.get("search") || "";
    if (urlSearch !== searchQuery) {
      setSearchQuery(urlSearch); // this will drive the fetch via the next effect
      setSearchTerm(urlSearch);
      setCurrentPage(1);
    }
  }, [searchParams, searchQuery]);

  // Refetch server data when search term changes (e.g., clicking a footer city)
  useEffect(() => {
    if (fetchPropertiesRef.current) {
      fetchPropertiesRef.current(currentType);
    }
  }, [searchQuery, currentType]);

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
            (prop.propertyType?.toLowerCase() || "").includes("plot")
        );
      } else if (currentTypeParam === "commercial") {
        filtered = filtered.filter(
          (prop) =>
            prop.type === "commercial" ||
            prop.propertyType === "2" ||
            prop.propertyType === "7" ||
            (prop.propertyType?.toLowerCase() || "").includes("commercial") ||
            (prop.propertyType?.toLowerCase() || "").includes("shop")
        );
      } else if (currentTypeParam !== "all") {
        filtered = filtered.filter(
          (property) => property.type === currentTypeParam
        );
      }

      // Apply search filter
      if (searchQuery && searchQuery.trim()) {
        const searchLower = searchQuery.toLowerCase().trim();
        filtered = filtered.filter((property) => {
          const titleMatch = property.title.toLowerCase().includes(searchLower);
          const locationMatch = property.location
            .toLowerCase()
            .includes(searchLower);
          return titleMatch || locationMatch;
        });
      }

      // Apply price range filter - FIXED: Only apply if price range is set
      if (priceRange[0] > 0 || priceRange[1] > 0) {
        filtered = filtered.filter((property) => {
          // For rent properties, check if price is above minimum threshold
          if (currentTypeParam === "rent" && priceRange[0] > 0) {
            const priceInRange = property.price >= priceRange[0];
            return priceInRange;
          }

          // For other cases, use normal range filter
          const priceInRange =
            property.price >= priceRange[0] && property.price <= priceRange[1];
          return priceInRange;
        });
      }

      // Apply area range filter - FIXED: Only apply if area range is set
      if (minArea > 0 || maxArea > 0) {
        filtered = filtered.filter((property) => {
          // Check if maxArea is set to a reasonable value (not the default reset value of 0)
          const hasMaxAreaFilter = maxArea > 0;
          const areaInRange =
            property.area >= minArea &&
            (!hasMaxAreaFilter || property.area <= maxArea);
          return areaInRange;
        });
      }

      // Apply bedroom filter - FIXED: Show exactly what you select
      if (minBedrooms > 0) {
        filtered = filtered.filter((property) => {
          // If 5+ is selected (value = 5), show 5 or more
          // Otherwise, show exactly the selected number
          const bedroomMatch =
            minBedrooms === 5
              ? property.bedrooms >= 5
              : property.bedrooms === minBedrooms;

          return bedroomMatch;
        });
      }

      // Apply bathroom filter - FIXED: Show exactly what you select
      if (minBathrooms > 0) {
        filtered = filtered.filter((property) => {
          // If 5+ is selected (value = 5), show 5 or more
          // Otherwise, show exactly the selected number
          const bathroomMatch =
            minBathrooms === 5
              ? property.bathrooms >= 5
              : property.bathrooms === minBathrooms;

          return bathroomMatch;
        });
      }

      // Apply balcony filter - FIXED: Show exactly what you select
      if (minBalcony > 0) {
        filtered = filtered.filter((property) => {
          // If 5+ is selected (value = 5), show 5 or more
          // Otherwise, show exactly the selected number
          const balconyMatch =
            minBalcony === 5
              ? property.balcony >= 5
              : property.balcony === minBalcony;

          return balconyMatch;
        });
      }

      // Apply availability filter - FIXED: Only apply if availableFrom is set
      if (availableFrom) {
        // Format selected date as YYYY-MM-DD for comparison
        const formattedSelectedDate = availableFrom.toISOString().split("T")[0];

        filtered = filtered.filter((property) => {
          if (!property.availableFrom) return true; // Include properties without availability date

          // Extract date part from property's availableFrom (could be in various formats)
          let propertyDateStr;
          if (property.availableFrom.includes("T")) {
            // Full ISO format
            propertyDateStr = property.availableFrom.split("T")[0];
          } else {
            // Already in YYYY-MM-DD format
            propertyDateStr = property.availableFrom;
          }

          // Compare dates as strings in YYYY-MM-DD format
          const availabilityMatch = propertyDateStr >= formattedSelectedDate;
          return availabilityMatch;
        });
      }

      // Apply tenant preference filter - ONLY for rent properties and when preferences are selected
      if (preferenceIds.length > 0 && currentTypeParam === "rent") {
        filtered = filtered.filter((property) => {
          // Check both preferenceId and preferenceIds fields
          const propertyPreferenceId = property.preferenceId;
          const propertyPreferenceIds = property.preferenceIds;

          // If property doesn't have any preference data, show it (available to all)
          if (!propertyPreferenceId && !propertyPreferenceIds) {
            return true;
          }

          // Check preferenceId (single value)
          if (propertyPreferenceId) {
            if (typeof propertyPreferenceId === "number") {
              const match = preferenceIds.includes(
                propertyPreferenceId.toString()
              );
              return match;
            }
            if (Array.isArray(propertyPreferenceId)) {
              const match = (propertyPreferenceId as any[]).some((id: any) =>
                preferenceIds.includes(id.toString())
              );
              return match;
            }
          }

          // Check preferenceIds (array or comma-separated string)
          if (propertyPreferenceIds) {
            if (Array.isArray(propertyPreferenceIds)) {
              // Handle array format like [2, 4] or [1, 2, 3]
              const match = propertyPreferenceIds.some((id: any) =>
                preferenceIds.includes(id.toString())
              );
              return match;
            }
            if (typeof propertyPreferenceIds === "string") {
              // Handle comma-separated string like "2,4" or "1,2,3"
              const idsArray = propertyPreferenceIds
                .split(",")
                .map((id) => id.trim());
              const match = idsArray.some((id: string) =>
                preferenceIds.includes(id)
              );
              return match;
            }
          }
          return false;
        });
      }

      // Apply sorting (client-side) to ensure correct order even if API ignores SortBy
      if (sortBy === "price-low") {
        filtered = [...filtered].sort(
          (a, b) => (a.price || 0) - (b.price || 0)
        );
      } else if (sortBy === "price-high") {
        filtered = [...filtered].sort(
          (a, b) => (b.price || 0) - (a.price || 0)
        );
      } else if (sortBy === "area-high") {
        filtered = [...filtered].sort((a, b) => (b.area || 0) - (a.area || 0));
      } // "newest" defaults to API order

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
      preferenceIds,
      sortBy,
    ]
  );

  // OPTIMIZED: Apply filters without triggering new API calls
  useEffect(() => {
    if (properties.length > 0) {
      applyFilters(properties);
    }
  }, [properties, applyFilters]); // Only depend on properties, not individual filter states

  // MODIFIED: Handle tab change and update URL - Reset filters when changing tabs
  const handleTabChange = (value: string) => {
    setActiveTab(value);

    // Reset commercial type when switching away from commercial tab
    if (value !== "commercial") {
      setCommercialType("buy");
    }

    // Reset all filters when changing tabs
    setSearchQuery("");
    setSearchTerm("");
    setPriceRange([0, 0]);
    setMinBedrooms(0);
    setMinBathrooms(0);
    setMinBalcony(0);
    setMinArea(0);
    setMaxArea(0);
    setSelectedPriceSteps([]);
    setSelectedAreaSteps([]);
    setAvailableFrom(undefined);
    setPreferenceIds([]);
    setFurnished("any");
    setSortBy("newest");
    setSortOrder("desc");

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

    // Clear all filter-related URL parameters
    searchParams.delete("search");
    searchParams.delete("minPrice");
    searchParams.delete("maxPrice");
    searchParams.delete("minBedrooms");
    searchParams.delete("minBathrooms");
    searchParams.delete("minBalcony");
    searchParams.delete("minArea");
    searchParams.delete("maxArea");
    searchParams.delete("priceSteps");
    searchParams.delete("areaSteps");
    searchParams.delete("availableFrom");
    searchParams.delete("preferenceIds");
    searchParams.delete("furnished");
    searchParams.delete("sortBy");

    setSearchParams(searchParams);
  };

  // MODIFIED: Add handler for commercial type change - Reset filters when changing commercial type
  const handleCommercialTypeChange = (value: "buy" | "rent") => {
    setCommercialType(value);

    // Reset all filters when changing commercial type
    setSearchQuery("");
    setSearchTerm("");
    setPriceRange([0, 0]);
    setMinBedrooms(0);
    setMinBathrooms(0);
    setMinBalcony(0);
    setMinArea(0);
    setMaxArea(0);
    setSelectedPriceSteps([]);
    setSelectedAreaSteps([]);
    setAvailableFrom(undefined);
    setPreferenceIds([]);
    setFurnished("any");
    setSortBy("newest");
    setSortOrder("desc");

    searchParams.set("commercialType", value);

    // Clear all filter-related URL parameters
    searchParams.delete("search");
    searchParams.delete("minPrice");
    searchParams.delete("maxPrice");
    searchParams.delete("minBedrooms");
    searchParams.delete("minBathrooms");
    searchParams.delete("minBalcony");
    searchParams.delete("minArea");
    searchParams.delete("maxArea");
    searchParams.delete("priceSteps");
    searchParams.delete("areaSteps");
    searchParams.delete("availableFrom");
    searchParams.delete("preferenceIds");
    searchParams.delete("furnished");
    searchParams.delete("sortBy");

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
      const config =
        priceRangeConfig[activeTab as keyof typeof priceRangeConfig] ||
        priceRangeConfig.buy;
      setPriceRange([config.min, config.max]);
    }
  };

  // MODIFIED: Handle area step selection (multi-select) - Trigger API call when all steps cleared
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
      // Reset to default range - use 0 to indicate no filter
      setMinArea(0);
      setMaxArea(0);

      // Trigger API call to fetch fresh data when all area steps are cleared.
      // Use a short timeout so React has applied the state updates (minArea/maxArea)
      // before we build the payload in the fetch. Also use the stable currentType
      // state rather than reading from searchParams to avoid races.
      if (fetchPropertiesRef.current) {
        setTimeout(() => {
          fetchPropertiesRef.current(currentType);
        }, 100);
      }
    }
  };

  // MODIFIED: Handle search form submission - NO API call, NO URL update
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const term = searchTerm.trim();
    if (!term) return;

    if (term === searchQuery.trim()) {
      // Same term as last committed search → explicitly refetch
      if (fetchPropertiesRef.current) {
        fetchPropertiesRef.current(currentType);
      }
    } else {
      // New term → update state and URL; the [searchQuery, currentType] effect will fire
      setSearchQuery(term);
      searchParams.set("search", term);
      setSearchParams(searchParams);
    }
  };

  // MODIFIED: Reset all filters to default values and fetch fresh data
  const resetFilters = () => {
    // Get current tab from URL or state to preserve it
    const currentTab = searchParams.get("type") || activeTab;

    setPriceRange([0, 0]); // Reset to no price filter
    setMinBedrooms(0);
    setMinBathrooms(0);
    setMinBalcony(0);
    setMinArea(0);
    setMaxArea(0); // Reset to no area filter
    setSearchQuery("");
    setSearchTerm("");
    setAvailableFrom(undefined);
    setPreferenceIds([]);
    setFurnished("any");
    // Don't change the active tab - keep current tab
    setSelectedPriceSteps([]);
    setSelectedAreaSteps([]);

    // Clear all filter-related URL parameters but keep the current type
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.delete("search");
    newSearchParams.delete("minPrice");
    newSearchParams.delete("maxPrice");
    newSearchParams.delete("minBedrooms");
    newSearchParams.delete("minBathrooms");
    newSearchParams.delete("minBalcony");
    newSearchParams.delete("minArea");
    newSearchParams.delete("maxArea");
    newSearchParams.delete("availableFrom");
    newSearchParams.delete("preferenceIds");
    newSearchParams.delete("furnished");
    newSearchParams.delete("sortBy");
    newSearchParams.delete("commercialType");
    // Keep the current type instead of setting to "all"
    if (currentTab && currentTab !== "all") {
      newSearchParams.set("type", currentTab);
    } else {
      newSearchParams.delete("type");
    }
    setSearchParams(newSearchParams);

    // Fetch fresh data for the current tab
    if (fetchPropertiesRef.current) {
      fetchPropertiesRef.current(currentTab);
    }
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

  // Updated to format date in YYYY-MM-DD format for API compatibility
  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      // Set state and trigger API call with the date directly
      setAvailableFrom(date);

      // Trigger API call immediately with the date value
      setTimeout(() => {
        if (fetchPropertiesRef.current) {
          fetchPropertiesWithDate(currentType, date);
        }
      }, 100);
    } else {
      setAvailableFrom(undefined);

      // Trigger API call when date is cleared
      setTimeout(() => {
        if (fetchPropertiesRef.current) {
          fetchPropertiesRef.current(currentType);
        }
      }, 100);
    }
  };

  // Updated to handle multiple preference selections
  const handlePreferenceChange = (value: string) => {
    if (preferenceIds.includes(value)) {
      // Remove if already selected
      setPreferenceIds(preferenceIds.filter((id) => id !== value));
    } else {
      // Add if not selected
      setPreferenceIds([...preferenceIds, value]);
    }
  };

  // MODIFIED: Update when furnished status changes - trigger immediate API call
  const handleFurnishedChange = (value: string) => {
    setFurnished(value);

    // Trigger immediate API call with the new furnished value
    setTimeout(() => {
      if (fetchPropertiesRef.current) {
        fetchPropertiesWithFurnished(currentType, value);
      }
    }, 200);
  };

  // Handle sort change: update state and reset pagination
  const handleSortChange = (value: string) => {
    setSortBy(value);
    const { apiSortOrder } = getApiSort(value);
    setSortOrder(apiSortOrder);
    setCurrentPage(1);
  };

  // Refetch from server when sort changes (skip first mount to avoid duplicate)
  useEffect(() => {
    if (isInitialLoad) return;
    if (fetchPropertiesRef.current) {
      fetchPropertiesRef.current(currentType);
    }
  }, [sortBy]);

  // Refetch from server when preference filters change (skip first mount).
  // NOTE: furnished changes are now handled directly in handleFurnishedChange
  // Keep `availableFrom` out of this dependency list so selecting a date
  // is handled exclusively by `handleDateChange` (prevents duplicate fetches).
  useEffect(() => {
    if (isInitialLoad) return;
    if (fetchPropertiesRef.current) {
      fetchPropertiesRef.current(currentType);
    }
  }, [preferenceIds]);

  // Refetch from server when other filters change (skip first mount to avoid duplicate)
  useEffect(() => {
    if (isInitialLoad) return;
    if (fetchPropertiesRef.current) {
      fetchPropertiesRef.current(currentType);
    }
  }, [priceRange, minBedrooms, minBathrooms, minBalcony, minArea, maxArea]);

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

  // Slice filteredProperties for current page
  const paginatedProperties = filteredProperties.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
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
    preferenceIds,
    furnished,
  ]);

  return (
    <>
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
                      onChange={(e) => {
                        const value = e.target.value;
                        setSearchTerm(value);
                      }}
                      onFocus={() => setShowSuggestions(true)}
                      onBlur={() =>
                        setTimeout(() => setShowSuggestions(false), 150)
                      }
                    />
                    <Button
                      type="submit"
                      aria-label="Search properties"
                      // ensure button sits above input and receives clicks
                      className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 rounded-full py-1.5 sm:py-2 md:py-5 px-4 sm:px-6 text-xs sm:text-sm md:text-base shadow-lg z-50 pointer-events-auto transform transition duration-150 ease-in-out active:scale-95 active:opacity-90 active:shadow-inner"
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
          <div className="md:hidden mb-4 flex gap-2">
            <Button
              onClick={toggleMobileFilters}
              variant="outline"
              className="flex-1 flex items-center justify-between py-6 text-base"
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
            <Button
              onClick={resetFilters}
              variant="outline"
              className="px-4 py-6 text-base bg-gradient-to-r from-red-50 to-orange-50 border-red-200 text-red-700 hover:from-red-100 hover:to-orange-100 hover:border-red-300 hover:text-red-800 transition-all duration-300"
            >
              <FilterX className="h-5 w-5" />
            </Button>
          </div>

          {/* Main content area with sidebar and property listings using flex */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Collapsible Sidebar filters */}
            <div
              className={`transition-all duration-500 mb-3 md:mb-0 shrink-0 overflow-hidden flex flex-col
               ${sidebarVisible ? "w-full md:w-[240px]" : "w-8 md:w-8"}
               bg-gradient-to-br from-white via-blue-50/40 to-indigo-50/40 border-2 border-gray-200/50 relative rounded-xl shadow-md backdrop-blur-sm
              ${!mobileFiltersVisible ? "md:block hidden" : ""}`}
              style={{
                minWidth: sidebarVisible ? undefined : "2rem",
                maxWidth: sidebarVisible ? undefined : "2rem",
              }}
            >
              {/* Sidebar toggle button - only visible on desktop */}
              <div className="hidden md:flex items-center justify-end h-10 w-full p-1 absolute top-0 right-0 z-50">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSidebarVisible(!sidebarVisible)}
                  className="rounded-full w-6 h-6 p-0 bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 border-0 hover:from-blue-600 hover:via-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300"
                >
                  {sidebarVisible ? (
                    <>
                      <Minus className="h-3 w-3" />
                    </>
                  ) : (
                    <Plus className="h-3 w-3" />
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
                  <div className="p-2">
                    {/* Filter Card */}
                    <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-md border-2 border-gray-200/50 p-3 flex flex-col gap-2 transition-all duration-500 relative overflow-hidden">
                      {/* Decorative background elements */}
                      <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-blue-100/15 to-indigo-200/15 rounded-full -translate-y-8 translate-x-8 blur-lg"></div>
                      <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-purple-100/15 to-pink-200/15 rounded-full translate-y-8 -translate-x-8 blur-lg"></div>
                      {/* Property Type Tabs Section - Collapsible */}
                      <div className="mb-2 relative">
                        <div
                          className="font-bold text-gray-800 text-xs mb-2 flex items-center justify-between cursor-pointer bg-gradient-to-r from-blue-50/80 via-indigo-50/80 to-purple-50/80 p-2 rounded-lg border-2 border-gray-200/40 backdrop-blur-sm hover:from-blue-100 hover:via-indigo-100 hover:to-purple-100 hover:border-blue-300 hover:shadow-md transition-all duration-300 shadow-sm"
                          onClick={() =>
                            setPropertyTypeCollapsed(!propertyTypeCollapsed)
                          }
                        >
                          <span className="flex items-center gap-1.5">
                            <div className="w-5 h-5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-md flex items-center justify-center shadow-md">
                              <Home className="h-3 w-3 text-white" />
                            </div>
                            <span className="text-xs font-semibold">
                              Property Type
                            </span>
                          </span>
                          {propertyTypeCollapsed ? (
                            <ChevronDown className="h-3 w-3 text-gray-500" />
                          ) : (
                            <ChevronUp className="h-3 w-3 text-gray-500" />
                          )}
                        </div>
                        {!propertyTypeCollapsed && (
                          <div className="flex flex-col gap-1">
                            {[
                              {
                                key: "all",
                                label: "All Properties",
                                icon: "🏘️",
                              },
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
                                className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 border backdrop-blur-sm
                                ${
                                  activeTab === tab.key
                                    ? "bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 text-white shadow-lg border-blue-400/50 transform scale-105 hover:shadow-xl hover:from-blue-600 hover:via-blue-700 hover:to-indigo-700"
                                    : "bg-gradient-to-r from-white to-gray-50 text-gray-700 hover:from-blue-50 hover:to-indigo-50 border-gray-200 hover:border-blue-300 hover:shadow-md hover:text-blue-700"
                                }
                              `}
                              >
                                <span className="text-sm">{tab.icon}</span>
                                <span>{tab.label}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Commercial Type Selection */}
                      {activeTab === "commercial" && (
                        <div className="mb-2">
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            Commercial Type
                          </label>
                          <div className="grid grid-cols-2 gap-1">
                            <Button
                              variant={
                                commercialType === "buy" ? "default" : "outline"
                              }
                              className={`w-full flex items-center justify-center gap-1.5 py-2 text-xs rounded-lg transition-all duration-300 ${
                                commercialType === "buy"
                                  ? "bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
                                  : "bg-gradient-to-r from-white to-gray-50 border-2 border-emerald-200 hover:from-emerald-50 hover:to-green-50 hover:border-emerald-400 hover:shadow-md text-emerald-700 hover:text-emerald-800"
                              }`}
                              onClick={() => handleCommercialTypeChange("buy")}
                            >
                              <span className="text-sm">💰</span>
                              <span>Buy</span>
                            </Button>
                            <Button
                              variant={
                                commercialType === "rent"
                                  ? "default"
                                  : "outline"
                              }
                              className={`w-full flex items-center justify-center gap-1.5 py-2 text-xs rounded-lg transition-all duration-300 ${
                                commercialType === "rent"
                                  ? "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
                                  : "bg-gradient-to-r from-white to-gray-50 border-2 border-orange-200 hover:from-orange-50 hover:to-red-50 hover:border-orange-400 hover:shadow-md text-orange-700 hover:text-orange-800"
                              }`}
                              onClick={() => handleCommercialTypeChange("rent")}
                            >
                              <span className="text-sm">📋</span>
                              <span>Rent</span>
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Price Range Section */}
                      {shouldShowFilter("showPrice") && (
                        <div className="mb-2">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-6 h-6 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 rounded-md flex items-center justify-center shadow-md rotate-3">
                              <IndianRupeeIcon className="h-3 w-3 text-white" />
                            </div>
                            <div className="font-bold text-gray-800 text-xs">
                              Price Range
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-1">
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
                                className={`h-10 text-xs font-medium transition-all duration-300 rounded-lg ${
                                  selectedPriceSteps.includes(step.id)
                                    ? "bg-gradient-to-r from-purple-500 via-purple-600 to-indigo-600 hover:from-purple-600 hover:via-purple-700 hover:to-indigo-700 text-white shadow-lg transform scale-105 border-2 border-purple-400 hover:border-purple-300 hover:shadow-xl"
                                    : "bg-gradient-to-r from-white to-gray-50 hover:from-purple-50 hover:to-indigo-50 border-2 border-purple-200 hover:border-purple-400 text-gray-700 hover:text-purple-700 hover:shadow-md backdrop-blur-sm"
                                }`}
                              >
                                <div className="flex flex-col items-center">
                                  <span className="font-bold">
                                    {step.label}
                                  </span>
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
                                Selected: {selectedPriceSteps.length} price
                                range
                                {selectedPriceSteps.length > 1 ? "s" : ""}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Rooms & Features Section */}
                      <div className="bg-gradient-to-br from-blue-50/30 to-indigo-100/30 rounded-lg p-3 flex flex-col gap-2 border border-gray-200/40 backdrop-blur-sm shadow-sm">
                        <div className="font-bold text-gray-800 text-xs mb-1 flex items-center gap-2">
                          <div className="w-6 h-6 bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 rounded-md flex items-center justify-center shadow-md -rotate-3">
                            <Bed className="h-3 w-3 text-white" />
                          </div>
                          <span className="text-gray-800">
                            {activeTab === "plot"
                              ? "Features"
                              : activeTab === "commercial"
                              ? "Features"
                              : "Rooms & Features"}
                          </span>
                        </div>

                        {/* Residential Features */}
                        {(activeTab === "buy" || activeTab === "rent") && (
                          <>
                            {/* Bedrooms Dropdown */}
                            {shouldShowFilter("showBedrooms") && (
                              <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                  Bedrooms
                                </label>
                                <Select
                                  value={
                                    minBedrooms ? String(minBedrooms) : "0"
                                  }
                                  onValueChange={(v) =>
                                    handleBedroomChange(Number(v))
                                  }
                                >
                                  <SelectTrigger className="rounded-lg h-8 border-2 border-gray-200 bg-gradient-to-r from-white to-gray-50 text-gray-700 font-medium focus:ring-2 focus:ring-blue-400 hover:from-blue-50 hover:to-indigo-50 hover:border-blue-300 hover:shadow-md backdrop-blur-sm text-xs transition-all duration-300">
                                    <SelectValue placeholder="Any" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-white border-gray-200">
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
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
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
                                  <SelectTrigger className="rounded-lg h-8 border-2 border-gray-200 bg-gradient-to-r from-white to-gray-50 text-gray-700 font-medium focus:ring-2 focus:ring-blue-400 hover:from-blue-50 hover:to-indigo-50 hover:border-blue-300 hover:shadow-md backdrop-blur-sm text-xs transition-all duration-300">
                                    <SelectValue placeholder="Any" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-white border-gray-200">
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
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                  Balconies
                                </label>
                                <Select
                                  value={minBalcony ? String(minBalcony) : "0"}
                                  onValueChange={(v) =>
                                    handleBalconyChange(Number(v))
                                  }
                                >
                                  <SelectTrigger className="rounded-lg h-8 border-2 border-gray-200 bg-gradient-to-r from-white to-gray-50 text-gray-700 font-medium focus:ring-2 focus:ring-blue-400 hover:from-blue-50 hover:to-indigo-50 hover:border-blue-300 hover:shadow-md backdrop-blur-sm text-xs transition-all duration-300">
                                    <SelectValue placeholder="Any" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-white border-gray-200">
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
                          <div className="mb-2">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-6 h-6 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-md flex items-center justify-center shadow-md rotate-3">
                                <Ruler className="h-3 w-3 text-white" />
                              </div>
                              <div className="font-bold text-gray-800 text-xs">
                                Area (sq.ft)
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-1">
                              {areaSteps.map((step) => (
                                <Button
                                  key={step.id}
                                  variant={
                                    selectedAreaSteps.includes(step.id)
                                      ? "default"
                                      : "outline"
                                  }
                                  onClick={() => handleAreaStepChange(step.id)}
                                  className={`h-10 text-xs font-medium transition-all duration-300 rounded-lg ${
                                    selectedAreaSteps.includes(step.id)
                                      ? "bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 hover:from-teal-600 hover:via-cyan-600 hover:to-blue-600 text-white shadow-lg transform scale-105 border-2 border-teal-400 hover:border-teal-300 hover:shadow-xl"
                                      : "bg-gradient-to-r from-white to-gray-50 hover:from-teal-50 hover:to-cyan-50 border-2 border-teal-200 hover:border-teal-400 text-gray-700 hover:text-teal-700 hover:shadow-md backdrop-blur-sm"
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
                                  Selected: {selectedAreaSteps.length} area
                                  range
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
                          <label className="block text-xs font-semibold text-gray-700 mb-1 mt-2">
                            Tenant Preferences
                          </label>
                          <div className="grid grid-cols-2 gap-1">
                            {preferenceOptions.map((option) => (
                              <Button
                                key={option.id}
                                type="button"
                                variant={
                                  preferenceIds.includes(option.id)
                                    ? "default"
                                    : "outline"
                                }
                                onClick={() =>
                                  handlePreferenceChange(option.id)
                                }
                                className={`h-8 text-xs font-medium transition-all duration-300 rounded-lg ${
                                  preferenceIds.includes(option.id)
                                    ? "bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 hover:from-rose-600 hover:via-pink-600 hover:to-purple-600 text-white shadow-lg border-2 border-rose-400 hover:border-rose-300 hover:shadow-xl transform hover:scale-105"
                                    : "bg-gradient-to-r from-white to-gray-50 hover:from-rose-50 hover:to-pink-50 border-2 border-rose-200 hover:border-rose-400 text-gray-700 hover:text-rose-700 hover:shadow-md backdrop-blur-sm"
                                }`}
                              >
                                {option.label}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Furnished Dropdown */}
                      {shouldShowFilter("showFurnished") && (
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            Furnished
                          </label>
                          <Select
                            value={furnished}
                            onValueChange={handleFurnishedChange}
                          >
                            <SelectTrigger className="rounded-lg border-2 border-gray-200 bg-gradient-to-r from-white to-gray-50 text-gray-700 font-medium focus:ring-2 focus:ring-blue-400 h-8 text-xs hover:from-blue-50 hover:to-indigo-50 hover:border-blue-300 hover:shadow-md transition-all duration-300">
                              <SelectValue placeholder="Any" />
                            </SelectTrigger>
                            <SelectContent className="bg-white border-gray-200">
                              {furnishedOptions.map((option) => (
                                <SelectItem key={option.id} value={option.id}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {/* Removed Amenities Filter - only using furnished filter */}

                      {/* Available From Date Picker */}
                      {shouldShowFilter("showAvailableFrom") && (
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1 mt-4">
                            Available From
                          </label>
                          <div className="relative">
                            <DatePicker
                              date={availableFrom}
                              setDate={handleDateChange}
                              className="w-full rounded-lg border-2 border-gray-200 bg-gradient-to-r from-white to-gray-50 text-gray-700 font-medium focus:ring-2 focus:ring-blue-400 h-8 text-xs hover:from-blue-50 hover:to-indigo-50 hover:border-blue-300 hover:shadow-md transition-all duration-300"
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
                <div className="flex flex-col items-center gap-6 p-2 mt-16">
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
                          className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs transition-all duration-300 ${
                            activeTab === tab.key
                              ? "bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 text-white shadow-lg scale-110 hover:shadow-xl"
                              : "bg-gradient-to-r from-white to-gray-50 text-gray-600 hover:from-blue-50 hover:to-indigo-50 hover:text-blue-600 backdrop-blur-sm border-2 border-gray-200 hover:border-blue-300 hover:shadow-md"
                          }`}
                        >
                          {tab.icon}
                        </div>
                        {/* Tooltip */}
                        <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
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
              {/* Applied filters display - Only show when filters are actually applied */}
              {(searchQuery ||
                minBedrooms > 0 ||
                minBathrooms > 0 ||
                minBalcony > 0 ||
                minArea > 0 ||
                availableFrom ||
                preferenceIds.length > 0 ||
                (furnished && furnished !== "any") ||
                // Removed selectedAmenities
                selectedPriceSteps.length > 0 ||
                selectedAreaSteps.length > 0) && (
                <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-medium mr-2">
                      Active Filters:
                    </h3>

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
                            setMaxArea(0);
                            setSelectedAreaSteps([]);
                            searchParams.delete("minArea");
                            searchParams.delete("maxArea");
                            setSearchParams(searchParams);

                            // Trigger API call to fetch fresh data after state updates
                            if (fetchPropertiesRef.current) {
                              setTimeout(() => {
                                fetchPropertiesRef.current(currentType);
                              }, 100);
                            }
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

                    {preferenceIds.length > 0 && (
                      <Badge className="flex items-center gap-1 bg-blue-100 text-blue-800 hover:bg-blue-200">
                        Preferences: {preferenceIds.length} selected
                        <X
                          className="h-3 w-3 ml-1 cursor-pointer"
                          onClick={() => {
                            setPreferenceIds([]);
                            searchParams.delete("preference");
                            setSearchParams(searchParams);
                          }}
                        />
                      </Badge>
                    )}

                    {furnished && furnished !== "any" && (
                      <Badge className="flex items-center gap-1 bg-blue-100 text-blue-800 hover:bg-blue-200">
                        {furnishedOptions.find((f) => f.id === furnished)
                          ?.label || "Furnished"}
                        <X
                          className="h-3 w-3 ml-1 cursor-pointer"
                          onClick={() => {
                            setFurnished("any"); // Reset to default
                            searchParams.delete("furnished"); // Remove from URL instead of setting
                            setSearchParams(searchParams);
                          }}
                        />
                      </Badge>
                    )}

                    {/* Removed amenity badges - only using furnished filter */}

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
                            setMinArea(0);
                            setMaxArea(0);
                            searchParams.delete("areaSteps");
                            searchParams.delete("minArea");
                            searchParams.delete("maxArea");
                            setSearchParams(searchParams);

                            // Trigger API call to fetch fresh data after state updates
                            if (fetchPropertiesRef.current) {
                              setTimeout(() => {
                                fetchPropertiesRef.current(currentType);
                              }, 100);
                            }
                          }}
                        />
                      </Badge>
                    )}

                    {/* Clear All Filters Button - appears when any filters are active */}
                    <Button
                      onClick={resetFilters}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1 bg-gradient-to-r from-red-50 to-orange-50 border-red-200 text-red-700 hover:from-red-100 hover:to-orange-100 hover:border-red-300 hover:text-red-800 transition-all duration-300 shadow-sm hover:shadow-md ml-2"
                    >
                      <FilterX className="h-3 w-3" />
                      Clear All
                    </Button>
                  </div>
                </div>
              )}

              {/* Sort options */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
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
                      onClick={handleRetry}
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
                              !prop.status?.toLowerCase().includes("rent")
                          )
                          .map((property) => (
                            <div key={property.id} className="w-full">
                              <PropertyCard
                                {...property}
                                likeCount={property.likeCount}
                                formattedPrice={formatPrice(
                                  property.price,
                                  property.type
                                )}
                                commercialType="buy" // Pass prop
                              />
                            </div>
                          ))}
                      </>
                    )}

                    {/* Commercial Rent Properties */}
                    {activeTab === "commercial" &&
                      commercialType === "rent" && (
                        <>
                          <h3 className="col-span-full text-lg font-semibold mb-4">
                            Commercial Properties for Rent
                          </h3>
                          {paginatedProperties
                            .filter(
                              (prop) =>
                                prop.type === "commercial" &&
                                prop.status?.toLowerCase().includes("rent")
                            )
                            .map((property) => (
                              <div key={property.id} className="w-full">
                                <PropertyCard
                                  {...property}
                                  likeCount={property.likeCount}
                                  formattedPrice={formatPrice(
                                    property.price,
                                    property.type
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
                              property.type
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
                        variant={
                          currentPage === idx + 1 ? "default" : "outline"
                        }
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
    </>
  );
};

export default PropertyListing;

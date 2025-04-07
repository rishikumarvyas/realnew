
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { PropertyCard, PropertyCardProps } from "@/components/PropertyCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Search, FilterX } from "lucide-react";

// Mock data for properties
const mockProperties: PropertyCardProps[] = [
  {
    id: "prop1",
    title: "Modern 3BHK with Sea View",
    price: 7500000,
    location: "Bandra West, Mumbai",
    type: "buy",
    bedrooms: 3,
    bathrooms: 3,
    area: 1450,
    image: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&q=80"
  },
  {
    id: "prop2",
    title: "Luxury 4BHK Penthouse",
    price: 12500000,
    location: "Worli, Mumbai",
    type: "buy",
    bedrooms: 4,
    bathrooms: 4,
    area: 2100,
    image: "https://images.unsplash.com/photo-1466442929976-97f336a657be?auto=format&fit=crop&q=80"
  },
  {
    id: "prop3",
    title: "Studio Apartment with Balcony",
    price: 35000,
    location: "Koramangala, Bangalore",
    type: "rent",
    bedrooms: 1,
    bathrooms: 1,
    area: 650,
    image: "https://images.unsplash.com/photo-1721322800607-8c38375eef04?auto=format&fit=crop&q=80"
  },
  {
    id: "prop4",
    title: "Spacious 2BHK Apartment",
    price: 5600000,
    location: "Powai, Mumbai",
    type: "buy",
    bedrooms: 2,
    bathrooms: 2,
    area: 1050,
    image: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?auto=format&fit=crop&q=80"
  },
  {
    id: "prop5",
    title: "Elegant 3BHK Villa",
    price: 48000,
    location: "Whitefield, Bangalore",
    type: "rent",
    bedrooms: 3,
    bathrooms: 3,
    area: 1800,
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80"
  },
  {
    id: "prop6",
    title: "Commercial Space",
    price: 9500000,
    location: "Andheri, Mumbai",
    type: "sell",
    bedrooms: 0,
    bathrooms: 2,
    area: 2500,
    image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&q=80"
  },
];

const PropertyListing = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState<PropertyCardProps[]>([]);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState([0, 20000000]);
  
  // Filter states
  const [minBedrooms, setMinBedrooms] = useState(0);
  const [minBathrooms, setMinBathrooms] = useState(0);
  const [minArea, setMinArea] = useState(0);

  useEffect(() => {
    // Get type from URL params
    const typeParam = searchParams.get("type");
    const searchParam = searchParams.get("search");
    
    if (typeParam) {
      setActiveTab(typeParam);
    }
    
    if (searchParam) {
      setSearchQuery(searchParam);
    }
    
    // Simulate API fetch
    setTimeout(() => {
      setProperties(mockProperties);
    }, 500);
  }, [searchParams]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    if (value !== "all") {
      searchParams.set("type", value);
    } else {
      searchParams.delete("type");
    }
    
    setSearchParams(searchParams);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (searchQuery) {
      searchParams.set("search", searchQuery);
    } else {
      searchParams.delete("search");
    }
    
    setSearchParams(searchParams);
  };

  const resetFilters = () => {
    setPriceRange([0, 20000000]);
    setMinBedrooms(0);
    setMinBathrooms(0);
    setMinArea(0);
    setSearchQuery("");
    setSearchParams(new URLSearchParams());
    setActiveTab("all");
  };

  // Apply filters
  const filteredProperties = properties.filter((property) => {
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
    
    // Filter by price
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
    
    // Filter by area
    if (property.area < minArea) {
      return false;
    }
    
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Find Your Perfect Property</h1>
      
      <div className="grid md:grid-cols-[280px_1fr] gap-8">
        {/* Sidebar filters */}
        <div className="space-y-6 bg-white p-6 rounded-lg border shadow-sm">
          <div>
            <h3 className="font-medium mb-3">Search</h3>
            <form onSubmit={handleSearch} className="flex space-x-2">
              <div className="relative flex-grow">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Location, keyword..." 
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button type="submit" size="sm">
                Search
              </Button>
            </form>
          </div>
          
          <div>
            <h3 className="font-medium mb-3">Price Range</h3>
            <Slider
              defaultValue={[0, 20000000]}
              max={20000000}
              step={100000}
              value={priceRange}
              onValueChange={setPriceRange}
              className="mb-4"
            />
            <div className="flex justify-between text-sm text-gray-600">
              <span>₹{priceRange[0].toLocaleString()}</span>
              <span>₹{priceRange[1].toLocaleString()}</span>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium mb-3">Bedrooms</h3>
            <div className="flex space-x-2">
              {[0, 1, 2, 3, 4].map((num) => (
                <Button
                  key={num}
                  variant={minBedrooms === num ? "default" : "outline"}
                  size="sm"
                  className="flex-1"
                  onClick={() => setMinBedrooms(num)}
                >
                  {num === 0 ? "Any" : num === 4 ? "4+" : num}
                </Button>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="font-medium mb-3">Bathrooms</h3>
            <div className="flex space-x-2">
              {[0, 1, 2, 3].map((num) => (
                <Button
                  key={num}
                  variant={minBathrooms === num ? "default" : "outline"}
                  size="sm"
                  className="flex-1"
                  onClick={() => setMinBathrooms(num)}
                >
                  {num === 0 ? "Any" : num === 3 ? "3+" : num}
                </Button>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="font-medium mb-3">Area (sq.ft)</h3>
            <Slider
              defaultValue={[0]}
              max={5000}
              step={100}
              value={[minArea]}
              onValueChange={(value) => setMinArea(value[0])}
              className="mb-2"
            />
            <div className="flex justify-between text-sm text-gray-600">
              <span>Min: {minArea} sq.ft</span>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            className="w-full flex items-center justify-center"
            onClick={resetFilters}
          >
            <FilterX className="mr-2 h-4 w-4" /> Reset Filters
          </Button>
        </div>
        
        {/* Property listings */}
        <div>
          <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-8">
            <TabsList>
              <TabsTrigger value="all">All Properties</TabsTrigger>
              <TabsTrigger value="buy">Buy</TabsTrigger>
              <TabsTrigger value="rent">Rent</TabsTrigger>
              <TabsTrigger value="sell">Sell</TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab} className="mt-6">
              {filteredProperties.length === 0 ? (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium mb-2">No properties found</h3>
                  <p className="text-gray-500 mb-4">Try adjusting your search filters</p>
                  <Button onClick={resetFilters} variant="outline">
                    Reset Filters
                  </Button>
                </div>
              ) : (
                <>
                  <p className="mb-4 text-gray-600">
                    Showing {filteredProperties.length} {filteredProperties.length === 1 ? "property" : "properties"}
                  </p>
                  <div className="property-grid">
                    {filteredProperties.map((property) => (
                      <PropertyCard key={property.id} {...property} />
                    ))}
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default PropertyListing;

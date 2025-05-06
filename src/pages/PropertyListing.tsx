
// import { useState, useEffect } from "react";
// import { useSearchParams } from "react-router-dom";
// import { PropertyCard, PropertyCardProps } from "@/components/PropertyCard";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Slider } from "@/components/ui/slider";
// import { Search, FilterX } from "lucide-react";

// // Mock data for properties
// const mockProperties: PropertyCardProps[] = [
//   {
//     id: "prop1",
//     title: "Modern 3BHK with Sea View",
//     price: 7500000,
//     location: "Bandra West, Mumbai",
//     type: "buy",
//     bedrooms: 3,
//     bathrooms: 3,
//     area: 1450,
//     image: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&q=80"
//   },
//   {
//     id: "prop2",
//     title: "Luxury 4BHK Penthouse",
//     price: 12500000,
//     location: "Worli, Mumbai",
//     type: "buy",
//     bedrooms: 4,
//     bathrooms: 4,
//     area: 2100,
//     image: "https://images.unsplash.com/photo-1466442929976-97f336a657be?auto=format&fit=crop&q=80"
//   },
//   {
//     id: "prop3",
//     title: "Studio Apartment with Balcony",
//     price: 35000,
//     location: "Koramangala, Bangalore",
//     type: "rent",
//     bedrooms: 1,
//     bathrooms: 1,
//     area: 650,
//     image: "https://images.unsplash.com/photo-1721322800607-8c38375eef04?auto=format&fit=crop&q=80"
//   },
//   {
//     id: "prop4",
//     title: "Spacious 2BHK Apartment",
//     price: 5600000,
//     location: "Powai, Mumbai",
//     type: "buy",
//     bedrooms: 2,
//     bathrooms: 2,
//     area: 1050,
//     image: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?auto=format&fit=crop&q=80"
//   },
//   {
//     id: "prop5",
//     title: "Elegant 3BHK Villa",
//     price: 48000,
//     location: "Whitefield, Bangalore",
//     type: "rent",
//     bedrooms: 3,
//     bathrooms: 3,
//     area: 1800,
//     image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80"
//   },
//   {
//     id: "prop6",
//     title: "Commercial Space",
//     price: 9500000,
//     location: "Andheri, Mumbai",
//     type: "sell",
//     bedrooms: 0,
//     bathrooms: 2,
//     area: 2500,
//     image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&q=80"
//   },
// ];

// const PropertyListing = () => {
//   const [searchParams, setSearchParams] = useSearchParams();
//   const [properties, setProperties] = useState<PropertyCardProps[]>([]);
//   const [activeTab, setActiveTab] = useState<string>("all");
//   const [searchQuery, setSearchQuery] = useState("");
//   const [priceRange, setPriceRange] = useState([0, 20000000]);
  
//   // Filter states
//   const [minBedrooms, setMinBedrooms] = useState(0);
//   const [minBathrooms, setMinBathrooms] = useState(0);
//   const [minArea, setMinArea] = useState(0);

//   useEffect(() => {
//     // Get type from URL params
//     const typeParam = searchParams.get("type");
//     const searchParam = searchParams.get("search");
    
//     if (typeParam) {
//       setActiveTab(typeParam);
//     }
    
//     if (searchParam) {
//       setSearchQuery(searchParam);
//     }
    
//     // Simulate API fetch
//     setTimeout(() => {
//       setProperties(mockProperties);
//     }, 500);
//   }, [searchParams]);

//   const handleTabChange = (value: string) => {
//     setActiveTab(value);
    
//     if (value !== "all") {
//       searchParams.set("type", value);
//     } else {
//       searchParams.delete("type");
//     }
    
//     setSearchParams(searchParams);
//   };

//   const handleSearch = (e: React.FormEvent) => {
//     e.preventDefault();
    
//     if (searchQuery) {
//       searchParams.set("search", searchQuery);
//     } else {
//       searchParams.delete("search");
//     }
    
//     setSearchParams(searchParams);
//   };

//   const resetFilters = () => {
//     setPriceRange([0, 20000000]);
//     setMinBedrooms(0);
//     setMinBathrooms(0);
//     setMinArea(0);
//     setSearchQuery("");
//     setSearchParams(new URLSearchParams());
//     setActiveTab("all");
//   };

//   // Apply filters
//   const filteredProperties = properties.filter((property) => {
//     // Filter by tab/type
//     if (activeTab !== "all" && property.type !== activeTab) {
//       return false;
//     }
    
//     // Filter by search query
//     if (
//       searchQuery &&
//       !property.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
//       !property.location.toLowerCase().includes(searchQuery.toLowerCase())
//     ) {
//       return false;
//     }
    
//     // Filter by price
//     if (property.price < priceRange[0] || property.price > priceRange[1]) {
//       return false;
//     }
    
//     // Filter by bedrooms
//     if (property.bedrooms < minBedrooms) {
//       return false;
//     }
    
//     // Filter by bathrooms
//     if (property.bathrooms < minBathrooms) {
//       return false;
//     }
    
//     // Filter by area
//     if (property.area < minArea) {
//       return false;
//     }
    
//     return true;
//   });

//   return (
//     <div className="max-w-7xl mx-auto px-4 py-8">
//       <h1 className="text-3xl font-bold mb-8">Find Your Perfect Property</h1>
      
//       <div className="grid md:grid-cols-[280px_1fr] gap-8">
//         {/* Sidebar filters */}
//         <div className="space-y-6 bg-white p-6 rounded-lg border shadow-sm">
//           <div>
//             <h3 className="font-medium mb-3">Search</h3>
//             <form onSubmit={handleSearch} className="flex space-x-2">
//               <div className="relative flex-grow">
//                 <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
//                 <Input 
//                   placeholder="Location, keyword..." 
//                   className="pl-9"
//                   value={searchQuery}
//                   onChange={(e) => setSearchQuery(e.target.value)}
//                 />
//               </div>
//               <Button type="submit" size="sm">
//                 Search
//               </Button>
//             </form>
//           </div>
          
//           <div>
//             <h3 className="font-medium mb-3">Price Range</h3>
//             <Slider
//               defaultValue={[0, 20000000]}
//               max={20000000}
//               step={100000}
//               value={priceRange}
//               onValueChange={setPriceRange}
//               className="mb-4"
//             />
//             <div className="flex justify-between text-sm text-gray-600">
//               <span>₹{priceRange[0].toLocaleString()}</span>
//               <span>₹{priceRange[1].toLocaleString()}</span>
//             </div>
//           </div>
          
//           <div>
//             <h3 className="font-medium mb-3">Bedrooms</h3>
//             <div className="flex space-x-2">
//               {[0, 1, 2, 3, 4].map((num) => (
//                 <Button
//                   key={num}
//                   variant={minBedrooms === num ? "default" : "outline"}
//                   size="sm"
//                   className="flex-1"
//                   onClick={() => setMinBedrooms(num)}
//                 >
//                   {num === 0 ? "Any" : num === 4 ? "4+" : num}
//                 </Button>
//               ))}
//             </div>
//           </div>
          
//           <div>
//             <h3 className="font-medium mb-3">Bathrooms</h3>
//             <div className="flex space-x-2">
//               {[0, 1, 2, 3].map((num) => (
//                 <Button
//                   key={num}
//                   variant={minBathrooms === num ? "default" : "outline"}
//                   size="sm"
//                   className="flex-1"
//                   onClick={() => setMinBathrooms(num)}
//                 >
//                   {num === 0 ? "Any" : num === 3 ? "3+" : num}
//                 </Button>
//               ))}
//             </div>
//           </div>
          
//           <div>
//             <h3 className="font-medium mb-3">Area (sq.ft)</h3>
//             <Slider
//               defaultValue={[0]}
//               max={5000}
//               step={100}
//               value={[minArea]}
//               onValueChange={(value) => setMinArea(value[0])}
//               className="mb-2"
//             />
//             <div className="flex justify-between text-sm text-gray-600">
//               <span>Min: {minArea} sq.ft</span>
//             </div>
//           </div>
          
//           <Button 
//             variant="outline" 
//             className="w-full flex items-center justify-center"
//             onClick={resetFilters}
//           >
//             <FilterX className="mr-2 h-4 w-4" /> Reset Filters
//           </Button>
//         </div>
        
//         {/* Property listings */}
//         <div>
//           <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-8">
//             <TabsList>
//               <TabsTrigger value="all">All Properties</TabsTrigger>
//               <TabsTrigger value="buy">Buy</TabsTrigger>
//               <TabsTrigger value="rent">Rent</TabsTrigger>
//               <TabsTrigger value="sell">Sell</TabsTrigger>
//             </TabsList>
            
//             <TabsContent value={activeTab} className="mt-6">
//               {filteredProperties.length === 0 ? (
//                 <div className="text-center py-12">
//                   <h3 className="text-lg font-medium mb-2">No properties found</h3>
//                   <p className="text-gray-500 mb-4">Try adjusting your search filters</p>
//                   <Button onClick={resetFilters} variant="outline">
//                     Reset Filters
//                   </Button>
//                 </div>
//               ) : (
//                 <>
//                   <p className="mb-4 text-gray-600">
//                     Showing {filteredProperties.length} {filteredProperties.length === 1 ? "property" : "properties"}
//                   </p>
//                   <div className="property-grid">
//                     {filteredProperties.map((property) => (
//                       <PropertyCard key={property.id} {...property} />
//                     ))}
//                   </div>
//                 </>
//               )}
//             </TabsContent>
//           </Tabs>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PropertyListing;
// PropertyListing.tsx
// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { PropertyCard, PropertyCardProps } from "@/components/PropertyCard";

// interface ApiResponse {
//   statusCode: number;
//   message: string;
//   propertyInfo: ApiProperty[];
// }

// interface ApiProperty {
//   propertyId: string;
//   title: string;
//   price: number;
//   city: string;
//   superCategory: string;
//   bedroom: number;
//   bathroom: number;
//   area: number;
//   mainImageUrl: string | null;
// }

// const PropertyListing = () => {
//   const [properties, setProperties] = useState<PropertyCardProps[]>([]);
//   const [filteredProperties, setFilteredProperties] = useState<PropertyCardProps[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [category, setCategory] = useState<string>("all"); // Default to "all"

//   useEffect(() => {

//     axios
//       .post<ApiResponse>(
//         "https://homeyatraapi.azurewebsites.net/api/Account/GetProperty",
//         {
//           superCategoryId: 2, 
//           accountId: "string", 
//           searchTerm: "string", 
//           minPrice: 0,
//           maxPrice: 0,
//           bedroom: 0,
//           balcony: 0,
//           minArea: 0,
//           maxArea: 0,
//           pageNumber: 0,
//           pageSize: 100,
//         },
//         {
//           headers: {
//             "Content-Type": "application/json", 
//           },
//         }
//       )
//       .then((res) => {
//         const data = res.data.propertyInfo.map((prop): PropertyCardProps => ({
//           id: prop.propertyId,
//           title: prop.title,
//           price: prop.price,
//           location: prop.city,
//           type: prop.superCategory.toLowerCase() as "buy" | "sell" | "rent",
//           bedrooms: prop.bedroom,
//           bathrooms: prop.bathroom,
//           area: prop.area,
//           image:
//             prop.mainImageUrl ??
//             "https://via.placeholder.com/400x300?text=No+Image",
//         }));

//         setProperties(data); 
//         setFilteredProperties(data); 
//       })
//       .catch((err) => {
//         console.error("Failed to fetch properties:", err);
//         setError("Unable to load properties.");
//       })
//       .finally(() => setLoading(false));
//   }, []);


//   const filterProperties = (category: string) => {
//     setCategory(category);
//     if (category === "all") {
//       setFilteredProperties(properties); 
//     } else {
//       setFilteredProperties(
//         properties.filter((property) => property.type === category)
//       );
//     }
//   };

//   if (loading) return <p>Loading properties...</p>;
//   if (error) return <p>{error}</p>;

//   return (
//     <div>
//       {/* Filter Buttons */}
//       <div className="mb-4">
//         <button onClick={() => filterProperties("all")} className="p-2 bg-blue-500 text-white">
//           All
//         </button>
//         <button onClick={() => filterProperties("buy")} className="p-2 bg-green-500 text-white ml-2">
//           Buy
//         </button>
//         <button onClick={() => filterProperties("rent")} className="p-2 bg-yellow-500 text-white ml-2">
//           Rent
//         </button>
//         <button onClick={() => filterProperties("sell")} className="p-2 bg-red-500 text-white ml-2">
//           Sell
//         </button>
//       </div>

//       {/* Property Listing */}
//       <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
//         {filteredProperties.map((property) => (
//           <PropertyCard key={property.id} {...property} />
//         ))}
//       </div>
//     </div>
//   );
// };

// export default PropertyListing;

// import { useState, useEffect } from "react";
// import { useSearchParams } from "react-router-dom";
// import axios from "axios";
// import { PropertyCard, PropertyCardProps } from "@/components/PropertyCard";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Slider } from "@/components/ui/slider";
// import { Search, FilterX, Loader2 } from "lucide-react";


// interface ApiResponse {
//   statusCode: number;
//   message: string;
//   propertyInfo: ApiProperty[];
// }

// interface ApiProperty {
//   propertyId: string;
//   title: string;
//   price: number;
//   city: string;
//   superCategory: string;
//   bedroom: number;
//   bathroom: number;
//   area: number;
//   mainImageUrl: string | null;
// }


// interface FilterOptions {
//   searchTerm: string;
//   minPrice: number;
//   maxPrice: number;
//   minBedrooms: number;
//   minBathrooms: number;
//   minArea: number;
//   maxArea: number;
//   superCategoryId?: number;
// }

// const PropertyListing = () => {
//   const [searchParams, setSearchParams] = useSearchParams();
//   const [properties, setProperties] = useState<PropertyCardProps[]>([]);
//   const [filteredProperties, setFilteredProperties] = useState<PropertyCardProps[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
  

//   const [activeTab, setActiveTab] = useState<string>("all");
  

//   const [searchQuery, setSearchQuery] = useState("");
//   const [priceRange, setPriceRange] = useState([0, 20000000]);
//   const [minBedrooms, setMinBedrooms] = useState(0);
//   const [minBathrooms, setMinBathrooms] = useState(0);
//   const [minArea, setMinArea] = useState(0);
  

//   useEffect(() => {

//     const typeParam = searchParams.get("type");
//     const searchParam = searchParams.get("search");
//     const minPriceParam = searchParams.get("minPrice");
//     const maxPriceParam = searchParams.get("maxPrice");
//     const bedroomsParam = searchParams.get("bedrooms");
//     const bathroomsParam = searchParams.get("bathrooms");
//     const minAreaParam = searchParams.get("minArea");
    

//     if (typeParam) {
//       setActiveTab(typeParam);
//     }
    
//     if (searchParam) {
//       setSearchQuery(searchParam);
//     }
    
//     if (minPriceParam && maxPriceParam) {
//       setPriceRange([parseInt(minPriceParam), parseInt(maxPriceParam)]);
//     }
    
//     if (bedroomsParam) {
//       setMinBedrooms(parseInt(bedroomsParam));
//     }
    
//     if (bathroomsParam) {
//       setMinBathrooms(parseInt(bathroomsParam));
//     }
    
//     if (minAreaParam) {
//       setMinArea(parseInt(minAreaParam));
//     }
    
//     fetchProperties();
//   }, [searchParams]);


//   const fetchProperties = async () => {
//     setLoading(true);
//     try {

//       const filterOptions: FilterOptions = {
//         searchTerm: searchParams.get("search") || "",
//         minPrice: parseInt(searchParams.get("minPrice") || "0"),
//         maxPrice: parseInt(searchParams.get("maxPrice") || "20000000"),
//         minBedrooms: parseInt(searchParams.get("bedrooms") || "0"),
//         minBathrooms: parseInt(searchParams.get("bathrooms") || "0"),
//         minArea: parseInt(searchParams.get("minArea") || "0"),
//         maxArea: 50000,
//       };
      
     
//       const typeParam = searchParams.get("type");
//       if (typeParam && typeParam !== "all") {
   
//         const categoryMap: Record<string, number> = {
//           buy: 1,
//           rent: 2,
//           sell: 3
//         };
//         filterOptions.superCategoryId = categoryMap[typeParam as keyof typeof categoryMap];
//       }

//       const response = await axios.post<ApiResponse>(
//         "https://homeyatraapi.azurewebsites.net/api/Account/GetProperty",
//         {
//           superCategoryId: filterOptions.superCategoryId || 0, 
//           accountId: "string", 
//           searchTerm: filterOptions.searchTerm,
//           minPrice: filterOptions.minPrice,
//           maxPrice: filterOptions.maxPrice,
//           bedroom: filterOptions.minBedrooms,
//           balcony: 0, 
//           minArea: filterOptions.minArea,
//           maxArea: filterOptions.maxArea,
//           pageNumber: 0,
//           pageSize: 100, 
//         },
//         {
//           headers: {
//             "Content-Type": "application/json",
//           },
//         }
//       );

   
//       const transformedData = response.data.propertyInfo.map((prop): PropertyCardProps => ({
//         id: prop.propertyId,
//         title: prop.title,
//         price: prop.price,
//         location: prop.city,
//         type: prop.superCategory.toLowerCase() as "buy" | "sell" | "rent",
//         bedrooms: prop.bedroom,
//         bathrooms: prop.bathroom,
//         area: prop.area,
//         image: prop.mainImageUrl || "https://via.placeholder.com/400x300?text=No+Image",
//       }));

//       setProperties(transformedData);
//       applyFilters(transformedData);
//     } catch (err) {
//       console.error("Failed to fetch properties:", err);
//       setError("Unable to load properties. Please try again later.");
      
     
//       useMockData();
//     } finally {
//       setLoading(false);
//     }
//   };


//   const useMockData = () => {
//     const mockProperties: PropertyCardProps[] = [
//       {
//         id: "prop1",
//         title: "Modern 3BHK with Sea View",
//         price: 7500000,
//         location: "Bandra West, Mumbai",
//         type: "buy",
//         bedrooms: 3,
//         bathrooms: 3,
//         area: 1450,
//         image: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&q=80"
//       },
//       {
//         id: "prop2",
//         title: "Luxury 4BHK Penthouse",
//         price: 12500000,
//         location: "Worli, Mumbai",
//         type: "buy",
//         bedrooms: 4,
//         bathrooms: 4,
//         area: 2100,
//         image: "https://images.unsplash.com/photo-1466442929976-97f336a657be?auto=format&fit=crop&q=80"
//       },
//       {
//         id: "prop3",
//         title: "Studio Apartment with Balcony",
//         price: 35000,
//         location: "Koramangala, Bangalore",
//         type: "rent",
//         bedrooms: 1,
//         bathrooms: 1,
//         area: 650,
//         image: "https://images.unsplash.com/photo-1721322800607-8c38375eef04?auto=format&fit=crop&q=80"
//       },
//       {
//         id: "prop4",
//         title: "Spacious 2BHK Apartment",
//         price: 5600000,
//         location: "Powai, Mumbai",
//         type: "buy",
//         bedrooms: 2,
//         bathrooms: 2,
//         area: 1050,
//         image: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?auto=format&fit=crop&q=80"
//       },
//       {
//         id: "prop5",
//         title: "Elegant 3BHK Villa",
//         price: 48000,
//         location: "Whitefield, Bangalore",
//         type: "rent",
//         bedrooms: 3,
//         bathrooms: 3,
//         area: 1800,
//         image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80"
//       },
//       {
//         id: "prop6",
//         title: "Commercial Space",
//         price: 9500000,
//         location: "Andheri, Mumbai",
//         type: "sell",
//         bedrooms: 0,
//         bathrooms: 2,
//         area: 2500,
//         image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&q=80"
//       },
//     ];
    
//     setProperties(mockProperties);
//     applyFilters(mockProperties);
//   };


//   const applyFilters = (data: PropertyCardProps[]) => {
//     const filtered = data.filter((property) => {

//       if (activeTab !== "all" && property.type !== activeTab) {
//         return false;
//       }
      

//       if (
//         searchQuery &&
//         !property.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
//         !property.location.toLowerCase().includes(searchQuery.toLowerCase())
//       ) {
//         return false;
//       }

//       if (property.price < priceRange[0] || property.price > priceRange[1]) {
//         return false;
//       }
      

//       if (property.bedrooms < minBedrooms) {
//         return false;
//       }
      
  
//       if (property.bathrooms < minBathrooms) {
//         return false;
//       }
      
    
//       if (property.area < minArea) {
//         return false;
//       }
      
//       return true;
//     });
    
//     setFilteredProperties(filtered);
//   };

  
//   useEffect(() => {
//     if (properties.length > 0) {
//       applyFilters(properties);
//     }
//   }, [activeTab, searchQuery, priceRange, minBedrooms, minBathrooms, minArea]);


//   const handleTabChange = (value: string) => {
//     setActiveTab(value);
    
//     if (value !== "all") {
//       searchParams.set("type", value);
//     } else {
//       searchParams.delete("type");
//     }
    
//     setSearchParams(searchParams);
//   };

 
//   const handleSearch = (e: React.FormEvent) => {
//     e.preventDefault();
    
//     if (searchQuery) {
//       searchParams.set("search", searchQuery);
//     } else {
//       searchParams.delete("search");
//     }
    
//     setSearchParams(searchParams);
//   };


//   const resetFilters = () => {
//     setPriceRange([0, 20000000]);
//     setMinBedrooms(0);
//     setMinBathrooms(0);
//     setMinArea(0);
//     setSearchQuery("");
//     setActiveTab("all");
//     setSearchParams(new URLSearchParams());
//   };


//   const handlePriceRangeChange = (value: number[]) => {
//     setPriceRange(value);
//     searchParams.set("minPrice", value[0].toString());
//     searchParams.set("maxPrice", value[1].toString());
//     setSearchParams(searchParams);
//   };


//   const handleBedroomChange = (value: number) => {
//     setMinBedrooms(value);
//     if (value > 0) {
//       searchParams.set("bedrooms", value.toString());
//     } else {
//       searchParams.delete("bedrooms");
//     }
//     setSearchParams(searchParams);
//   };


//   const handleBathroomChange = (value: number) => {
//     setMinBathrooms(value);
//     if (value > 0) {
//       searchParams.set("bathrooms", value.toString());
//     } else {
//       searchParams.delete("bathrooms");
//     }
//     setSearchParams(searchParams);
//   };


//   const handleAreaChange = (value: number[]) => {
//     setMinArea(value[0]);
//     if (value[0] > 0) {
//       searchParams.set("minArea", value[0].toString());
//     } else {
//       searchParams.delete("minArea");
//     }
//     setSearchParams(searchParams);
//   };

//   return (
//     <div className="max-w-7xl mx-auto px-4 py-8">
//       <h1 className="text-3xl font-bold mb-8">Find Your Perfect Property</h1>
      
//       <div className="grid md:grid-cols-[280px_1fr] gap-8">
//         {/* Sidebar filters */}
//         <div className="space-y-6 bg-white p-6 rounded-lg border shadow-sm">
//           <div>
//             <h3 className="font-medium mb-3">Search</h3>
//             <form onSubmit={handleSearch} className="flex space-x-2">
//               <div className="relative flex-grow">
//                 <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
//                 <Input 
//                   placeholder="Location, keyword..." 
//                   className="pl-9"
//                   value={searchQuery}
//                   onChange={(e) => setSearchQuery(e.target.value)}
//                 />
//               </div>
//               <Button type="submit" size="sm">
//                 Search
//               </Button>
//             </form>
//           </div>
          
//           <div>
//             <h3 className="font-medium mb-3">Price Range</h3>
//             <Slider
//               defaultValue={[0, 20000000]}
//               max={20000000}
//               step={100000}
//               value={priceRange}
//               onValueChange={handlePriceRangeChange}
//               className="mb-4"
//             />
//             <div className="flex justify-between text-sm text-gray-600">
//               <span>₹{priceRange[0].toLocaleString()}</span>
//               <span>₹{priceRange[1].toLocaleString()}</span>
//             </div>
//           </div>
          
//           <div>
//             <h3 className="font-medium mb-3">Bedrooms</h3>
//             <div className="flex space-x-2">
//               {[0, 1, 2, 3, 4].map((num) => (
//                 <Button
//                   key={num}
//                   variant={minBedrooms === num ? "default" : "outline"}
//                   size="sm"
//                   className="flex-1"
//                   onClick={() => handleBedroomChange(num)}
//                 >
//                   {num === 0 ? "Any" : num === 4 ? "4+" : num}
//                 </Button>
//               ))}
//             </div>
//           </div>
          
//           <div>
//             <h3 className="font-medium mb-3">Bathrooms</h3>
//             <div className="flex space-x-2">
//               {[0, 1, 2, 3].map((num) => (
//                 <Button
//                   key={num}
//                   variant={minBathrooms === num ? "default" : "outline"}
//                   size="sm"
//                   className="flex-1"
//                   onClick={() => handleBathroomChange(num)}
//                 >
//                   {num === 0 ? "Any" : num === 3 ? "3+" : num}
//                 </Button>
//               ))}
//             </div>
//           </div>
          
//           <div>
//             <h3 className="font-medium mb-3">Area (sq.ft)</h3>
//             <Slider
//               defaultValue={[0]}
//               max={5000}
//               step={100}
//               value={[minArea]}
//               onValueChange={handleAreaChange}
//               className="mb-2"
//             />
//             <div className="flex justify-between text-sm text-gray-600">
//               <span>Min: {minArea} sq.ft</span>
//             </div>
//           </div>
          
//           <Button 
//             variant="outline" 
//             className="w-full flex items-center justify-center"
//             onClick={resetFilters}
//           >
//             <FilterX className="mr-2 h-4 w-4" /> Reset Filters
//           </Button>
//         </div>
        
//         {/* Property listings */}
//         <div>
//           <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-8">
//             <TabsList>
//               <TabsTrigger value="all">All Properties</TabsTrigger>
//               <TabsTrigger value="buy">Buy</TabsTrigger>
//               <TabsTrigger value="rent">Rent</TabsTrigger>
//               {/* <TabsTrigger value="sell">Sell</TabsTrigger> */}
//             </TabsList>
            
//             <TabsContent value={activeTab} className="mt-6">
//               {loading ? (
//                 <div className="flex justify-center items-center py-12">
//                   <Loader2 className="h-8 w-8 animate-spin text-primary" />
//                   <span className="ml-2">Loading properties...</span>
//                 </div>
//               ) : error ? (
//                 <div className="text-center py-12">
//                   <h3 className="text-lg font-medium mb-2">Error</h3>
//                   <p className="text-red-500 mb-4">{error}</p>
//                   <Button onClick={() => fetchProperties()} variant="outline">
//                     Try Again
//                   </Button>
//                 </div>
//               ) : filteredProperties.length === 0 ? (
//                 <div className="text-center py-12">
//                   <h3 className="text-lg font-medium mb-2">No properties found</h3>
//                   <p className="text-gray-500 mb-4">Try adjusting your search filters</p>
//                   <Button onClick={resetFilters} variant="outline">
//                     Reset Filters
//                   </Button>
//                 </div>
//               ) : (
//                 <>
//                   <p className="mb-4 text-gray-600">
//                     Showing {filteredProperties.length} {filteredProperties.length === 1 ? "property" : "properties"}
//                   </p>
//                   <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
//                     {filteredProperties.map((property) => (
//                       <PropertyCard key={property.id} {...property} />
//                     ))}
//                   </div>
//                 </>
//               )}
//             </TabsContent>
//           </Tabs>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PropertyListing;

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
  LayoutDashboard
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

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
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState<PropertyCardProps[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<PropertyCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
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
        image: "https://images.unsplash.com/photo-1721322800607-8c38375eef04?auto=format&fit=crop&q=80",
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
        image: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?auto=format&fit=crop&q=80",
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
        image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80",
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
        image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&q=80",
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
        image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80",
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
        image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&q=80",
        availableFrom: "2025-07-01T00:00:00",
        preferenceId: 3, // Company
        amenities: ["WiFi", "Power Backup", "Security", "Parking"],
        furnished: "Fully"
      },
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
    
    if (searchQuery) {
      searchParams.set("search", searchQuery);
    } else {
      searchParams.delete("search");
    }
    
    setSearchParams(searchParams);
  };

  // Reset all filters to default values
  const resetFilters = () => {
    setPriceRange([0, 20000000]);
    setMinBedrooms(0);
    setMinBathrooms(0);
    setMinBalcony(0);
    setMinArea(0);
    setSearchQuery("");
    setAvailableFrom(undefined);
    setPreferenceId("0");
    setFurnished("any");
    setSelectedAmenities([]);
    setActiveTab("all");
    setSearchParams(new URLSearchParams());
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 bg-gray-50">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-primary mb-3">Find Your Perfect Property</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Discover the perfect space that fits your lifestyle and budget with our comprehensive property listings
        </p>
      </div>
      
      {/* Top quick search bar */}
      <Card className="mb-8 shadow-md">
        <CardContent className="p-4">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-grow">
              <Label htmlFor="quick-search" className="text-sm font-medium mb-1">Location or Keywords</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input 
                  id="quick-search"
                  placeholder="Search location, property name..." 
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" size="lg" className="bg-primary hover:bg-primary/90">
                Search
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                size="lg" 
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              >
                {showAdvancedFilters ? "Hide Filters" : "More Filters"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      
      <div className="grid md:grid-cols-[300px_1fr] gap-8">
        {/* Sidebar filters */}
        <div className="space-y-4">
          <Card className="shadow-md overflow-hidden">
            <CardContent className="p-0">
              <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <TabsList className="grid grid-cols-4 w-full">
                  <TabsTrigger value="all" className="rounded-none">All</TabsTrigger>
                  <TabsTrigger value="buy" className="rounded-none">Buy</TabsTrigger>
                  <TabsTrigger value="rent" className="rounded-none">Rent</TabsTrigger>
                  {/* <TabsTrigger value="sell" className="rounded-none">Sell</TabsTrigger> */}
                </TabsList>
              </Tabs>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardContent className="p-6">
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <DollarSign className="h-5 w-5 text-primary" />
                    <h3 className="font-medium">Price Range</h3>
                  </div>
                  <Slider
                    defaultValue={[0, 20000000]}
                    max={20000000}
                    step={100000}
                    value={priceRange}
                    onValueChange={handlePriceRangeChange}
                    className="mb-4"
                  />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>₹{priceRange[0].toLocaleString()}</span>
                    <span>₹{priceRange[1].toLocaleString()}</span>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Bed className="h-5 w-5 text-primary" />
                    <h3 className="font-medium">Bedrooms</h3>
                  </div>
                  <div className="flex space-x-2">
                    {[0, 1, 2, 3, 4].map((num) => (
                      <Button
                        key={num}
                        variant={minBedrooms === num ? "default" : "outline"}
                        size="sm"
                        className="flex-1"
                        onClick={() => handleBedroomChange(num)}
                      >
                        {num === 0 ? "Any" : num === 4 ? "4+" : num}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Bath className="h-5 w-5 text-primary" />
                    <h3 className="font-medium">Bathrooms</h3>
                  </div>
                  <div className="flex space-x-2">
                    {[0, 1, 2, 3].map((num) => (
                      <Button
                        key={num}
                        variant={minBathrooms === num ? "default" : "outline"}
                        size="sm"
                        className="flex-1"
                        onClick={() => handleBathroomChange(num)}
                      >
                        {num === 0 ? "Any" : num === 3 ? "3+" : num}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <LayoutDashboard className="h-5 w-5 text-primary" />
                    <h3 className="font-medium">Balcony</h3>
                  </div>
                  <div className="flex space-x-2">
                    {[0, 1, 2, 3].map((num) => (
                      <Button
                        key={num}
                        variant={minBalcony === num ? "default" : "outline"}
                        size="sm"
                        className="flex-1"
                        onClick={() => handleBalconyChange(num)}
                      >
                        {num === 0 ? "Any" : num === 3 ? "3+" : num}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Ruler className="h-5 w-5 text-primary" />
                    <h3 className="font-medium">Area (sq.ft)</h3>
                  </div>
                  <Slider
                   defaultValue={[0]}
                   max={5000}
                   step={100}
                   value={[minArea]}
                   onValueChange={handleAreaChange}
                   className="mb-4"
                 />
                 <div className="flex justify-between text-sm text-gray-600">
                   <span>{minArea} sq.ft</span>
                   <span>5000+ sq.ft</span>
                 </div>
               </div>

               {/* Reset filters button */}
               <Button 
                 variant="outline" 
                 className="w-full flex items-center gap-2" 
                 onClick={resetFilters}
               >
                 <FilterX className="h-4 w-4" />
                 Reset Filters
               </Button>
             </div>
           </CardContent>
         </Card>

         {/* Advanced filters */}
         {showAdvancedFilters && (
           <Card className="shadow-md">
             <CardContent className="p-6">
               <h3 className="font-medium text-lg mb-4">Advanced Filters</h3>
               <Accordion type="single" collapsible className="w-full">
                 {/* Only show availability filter for Buy and Rent property types */}
                 {(activeTab === "buy" || activeTab === "rent" || activeTab === "all") && (
                   <AccordionItem value="availability">
                     <AccordionTrigger className="py-2">
                       <div className="flex items-center gap-2">
                         <Calendar className="h-5 w-5 text-primary" />
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
                 <AccordionItem value="preference">
                   <AccordionTrigger className="py-2">
                     <div className="flex items-center gap-2">
                       <Users className="h-5 w-5 text-primary" />
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
                 <AccordionItem value="furnished">
                   <AccordionTrigger className="py-2">
                     <div className="flex items-center gap-2">
                       <Home className="h-5 w-5 text-primary" />
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
                 <AccordionItem value="amenities">
                   <AccordionTrigger className="py-2">
                     <div className="flex items-center gap-2">
                       <CheckSquare className="h-5 w-5 text-primary" />
                       <span>Amenities</span>
                     </div>
                   </AccordionTrigger>
                   <AccordionContent>
                     <div className="pt-2 pb-4 grid grid-cols-1 gap-3">
                       {amenityOptions.map((amenity) => (
                         <div key={amenity} className="flex items-center space-x-2">
                           <Switch
                             id={`amenity-${amenity}`}
                             checked={selectedAmenities.includes(amenity)}
                             onCheckedChange={() => handleAmenityToggle(amenity)}
                           />
                           <Label htmlFor={`amenity-${amenity}`}>{amenity}</Label>
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
         <div className="mb-4 flex flex-wrap gap-2">
           {searchQuery && (
             <Badge variant="secondary" className="flex items-center gap-1">
               Search: {searchQuery}
               <button 
                 onClick={() => {
                   setSearchQuery("");
                   searchParams.delete("search");
                   setSearchParams(searchParams);
                 }}
                 className="ml-1 hover:text-red-500"
               >
                 ×
               </button>
             </Badge>
           )}
           
           {minBedrooms > 0 && (
             <Badge variant="secondary" className="flex items-center gap-1">
               {minBedrooms}+ Bed
               <button 
                 onClick={() => {
                   setMinBedrooms(0);
                   searchParams.delete("bedrooms");
                   setSearchParams(searchParams);
                 }}
                 className="ml-1 hover:text-red-500"
               >
                 ×
               </button>
             </Badge>
           )}
           
           {minBathrooms > 0 && (
             <Badge variant="secondary" className="flex items-center gap-1">
               {minBathrooms}+ Bath
               <button 
                 onClick={() => {
                   setMinBathrooms(0);
                   searchParams.delete("bathrooms");
                   setSearchParams(searchParams);
                 }}
                 className="ml-1 hover:text-red-500"
               >
                 ×
               </button>
             </Badge>
           )}

           {minBalcony > 0 && (
             <Badge variant="secondary" className="flex items-center gap-1">
               {minBalcony}+ Balcony
               <button 
                 onClick={() => {
                   setMinBalcony(0);
                   searchParams.delete("balcony");
                   setSearchParams(searchParams);
                 }}
                 className="ml-1 hover:text-red-500"
               >
                 ×
               </button>
             </Badge>
           )}
           
           {minArea > 0 && (
             <Badge variant="secondary" className="flex items-center gap-1">
               {minArea}+ sq.ft
               <button 
                 onClick={() => {
                   setMinArea(0);
                   searchParams.delete("minArea");
                   setSearchParams(searchParams);
                 }}
                 className="ml-1 hover:text-red-500"
               >
                 ×
               </button>
             </Badge>
           )}
           
           {availableFrom && (
             <Badge variant="secondary" className="flex items-center gap-1">
               Available from: {availableFrom.toLocaleDateString()}
               <button 
                 onClick={() => {
                   setAvailableFrom(undefined);
                   searchParams.delete("availableFrom");
                   setSearchParams(searchParams);
                 }}
                 className="ml-1 hover:text-red-500"
               >
                 ×
               </button>
             </Badge>
           )}
           
           {preferenceId !== "0" && (
             <Badge variant="secondary" className="flex items-center gap-1">
               Preference: {preferenceOptions.find(p => p.id === preferenceId)?.label}
               <button 
                 onClick={() => {
                   setPreferenceId("0");
                   searchParams.delete("preference");
                   setSearchParams(searchParams);
                 }}
                 className="ml-1 hover:text-red-500"
               >
                 ×
               </button>
             </Badge>
           )}

           {furnished !== "any" && (
             <Badge variant="secondary" className="flex items-center gap-1">
               {furnishedOptions.find(f => f.id === furnished)?.label}
               <button 
                 onClick={() => {
                   setFurnished("any");
                   searchParams.delete("furnished");
                   setSearchParams(searchParams);
                 }}
                 className="ml-1 hover:text-red-500"
               >
                 ×
               </button>
             </Badge>
           )}
           
           {selectedAmenities.map(amenity => (
             <Badge key={amenity} variant="secondary" className="flex items-center gap-1">
               {amenity}
               <button 
                 onClick={() => handleAmenityToggle(amenity)}
                 className="ml-1 hover:text-red-500"
               >
                 ×
               </button>
             </Badge>
           ))}
           
           {(searchQuery || minBedrooms > 0 || minBathrooms > 0 || minBalcony > 0 || minArea > 0 || 
             availableFrom || preferenceId !== "0" || furnished !== "any" || selectedAmenities.length > 0) && (
             <Badge 
               variant="outline" 
               className="cursor-pointer hover:bg-red-50"
               onClick={resetFilters}
             >
               Clear All
             </Badge>
           )}
         </div>

         {/* Results count and sort */}
         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
           <h2 className="text-xl font-semibold text-gray-800">
             {loading ? (
               <span className="flex items-center">
                 <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                 Loading properties...
               </span>
             ) : (
               `${filteredProperties.length} Properties Found`
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
         {!loading && filteredProperties.length === 0 && !error && (
           <div className="p-12 text-center bg-gray-50 rounded-lg mb-8">
             <Home className="h-12 w-12 mx-auto text-gray-400 mb-4" />
             <h3 className="text-lg font-medium text-gray-800 mb-2">No properties found</h3>
             <p className="text-gray-600 mb-4">
               Try adjusting your filters to see more results.
             </p>
             <Button 
               onClick={resetFilters}
               variant="outline"
             >
               Clear All Filters
             </Button>
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
             filteredProperties.map((property) => (
               <PropertyCard
                 key={property.id}
                 {...property}
                 // Format price according to property type
                 formattedPrice={formatPrice(property.price, property.type)}
               />
             ))
           )}
         </div>

         {/* Pagination */}
         {filteredProperties.length > 0 && (
           <div className="mt-8 flex justify-center">
             <div className="flex space-x-1">
               <Button variant="outline" size="sm" disabled>
                 Previous
               </Button>
               <Button variant="default" size="sm">
                 1
               </Button>
               <Button variant="outline" size="sm">
                 2
               </Button>
               <Button variant="outline" size="sm">
                 3
               </Button>
               <Button variant="outline" size="sm">
                 Next
               </Button>
             </div>
           </div>
         )}
       </div>
     </div>
   </div>
 );
};

export default PropertyListing;
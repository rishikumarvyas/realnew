import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { MapPin, Bed, Bath, Maximize2, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface PropertyCardProps {
  id: string;
  title: string;
  price: number;
  location: string;
  type: "buy" | "rent" | "sell" | "plot" | "commercial"; // Added missing types
  bedrooms: number;
  bathrooms: number;
  balcony?: number; // Added missing balcony field
  area: number;
  image: string;
  likes?: number;
  // Added other missing fields for consistency
  availableFrom?: string;
  preferenceId?: number;
  preferenceIds?: string | number[];
  amenities?: string[];
  furnished?: string;
  isLike?: boolean;
  propertyType?: string;
  status?: string;
  formattedPrice?: string;
  likeCount?: number;
  commercialType?: "buy" | "rent"; // Add this prop
}

export function PropertyCard({
  id,
  title,
  price,
  location,
  type,
  bedrooms,
  bathrooms,
  balcony = 0, // Added balcony prop with default value
  area,
  image,
  likes = 0,
  likeCount = 0,
  commercialType,
  propertyType,
  status,
}: PropertyCardProps) {
  const { toast } = useToast();

  // Get badge color based on property type - Updated for all types
  const getBadgeStyle = () => {
    switch (type) {
      case "buy":
        return "bg-gradient-to-r from-blue-600 to-blue-500 text-white border-0";
      case "sell":
        return "bg-gradient-to-r from-teal-600 to-teal-500 text-white border-0";
      case "rent":
        return "bg-white border border-purple-400 text-purple-600";
      case "plot":
        return "bg-gradient-to-r from-green-600 to-green-500 text-white border-0";
      case "commercial":
        return "bg-gradient-to-r from-orange-600 to-orange-500 text-white border-0";
      default:
        return "";
    }
  };

  // Get badge text based on property type
  const getBadgeText = () => {
    if (type === "commercial") {
      // If commercialType is set, use it
      if (commercialType === "buy") return "Commercial For Sale";
      if (commercialType === "rent") return "Commercial For Rent";
      // If status or propertyType indicates rent, show Commercial For Rent
      if (
        status?.toLowerCase().includes("rent") ||
        propertyType?.toLowerCase().includes("rent")
      ) {
        return "Commercial For Rent";
      }
      // If status or propertyType indicates sale/buy, show Commercial For Sale
      if (
        status?.toLowerCase().includes("buy") ||
        status?.toLowerCase().includes("sale") ||
        propertyType?.toLowerCase().includes("buy") ||
        propertyType?.toLowerCase().includes("sale")
      ) {
        return "Commercial For Sale";
      }
      // Default fallback
      return "Commercial";
    }
    switch (type) {
      case "buy":
        return "For Sale";
      case "sell":
        return "Selling";
      case "rent":
        return "For Rent";
      case "plot":
        return "Plot For Sale";
      default:
        return "Property";
    }
  };

  // Check if we should show bedroom/bathroom info (not for plot/commercial)
  const showBedroomBathroom = type !== "plot" && type !== "commercial";

  return (
    <Link to={`/properties/${id}`}>
      <Card className="overflow-hidden hover:shadow-2xl transition-all duration-500 h-full group bg-white border-0 rounded-2xl shadow-lg hover:shadow-blue-100/50 hover:-translate-y-2 relative">
        {/* Gradient overlay for modern look */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-purple-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0" />
        
        <div className="relative h-64 overflow-hidden rounded-t-2xl">
          {/* Enhanced gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Modern image with better scaling */}
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          
          {/* Enhanced badge with modern styling */}
          <Badge className={`absolute top-4 right-4 z-20 ${getBadgeStyle()} shadow-lg backdrop-blur-sm border-0 font-semibold text-xs px-3 py-1.5`}>
            {getBadgeText()}
          </Badge>

          {/* Enhanced likes counter with modern design */}
          <div className="absolute top-4 left-4 z-20 flex items-center bg-white/90 backdrop-blur-md text-gray-800 px-3 py-1.5 rounded-full shadow-lg border border-white/20">
            <Heart size={14} className="mr-1.5 fill-red-500 text-red-500" />
            <span className="text-xs font-semibold">{likeCount}</span>
          </div>

          {/* Modern overlay text on hover */}
          <div className="absolute bottom-4 left-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
            <div className="bg-white/95 backdrop-blur-md rounded-xl p-3 shadow-xl border border-white/20">
              <p className="text-sm font-medium text-gray-800">View Details</p>
            </div>
          </div>
        </div>
        
        <CardContent className="p-6 relative z-10">
          {/* Enhanced title with better typography */}
          <h3 className="font-bold text-xl line-clamp-2 mb-3 group-hover:text-blue-600 transition-colors duration-300 leading-tight">
            {title}
          </h3>
          
          {/* Enhanced location with modern icon */}
          <div className="flex items-center text-gray-600 mb-4">
            <div className="p-1.5 bg-blue-100 rounded-lg mr-3">
              <MapPin size={14} className="text-blue-600" />
            </div>
            <span className="text-sm font-medium line-clamp-1">{location}</span>
          </div>
          
          {/* Enhanced price with modern gradient */}
          <div className="flex items-center justify-between">
            <p className="font-bold text-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              {type === "rent" || (type === "commercial" && (commercialType === "rent" || status?.toLowerCase().includes("rent") || propertyType?.toLowerCase().includes("rent")))
                ? `₹${price.toLocaleString()}/month`
                : `₹${price.toLocaleString()}`}
            </p>
            {(type === "rent" || (type === "commercial" && (commercialType === "rent" || status?.toLowerCase().includes("rent") || propertyType?.toLowerCase().includes("rent")))) && (
              <div className="bg-green-100 text-green-700 px-2 py-1 rounded-lg text-xs font-semibold">
                Rent
              </div>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="px-6 py-5 border-t border-gray-100 bg-gradient-to-r from-gray-50 to-blue-50/30 relative z-10">
          <div className="grid grid-cols-2 gap-4 w-full text-sm">
            {/* Conditionally show bedroom/bathroom info with modern styling */}
            {showBedroomBathroom && (
              <>
                <div className="flex items-center gap-3 bg-white/70 backdrop-blur-sm rounded-xl p-3 shadow-sm border border-white/50">
                  <div className="p-1.5 bg-blue-100 rounded-lg">
                    <Bed className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="text-sm font-semibold text-gray-700">
                    {bedrooms > 5 ? "5+" : bedrooms} Beds
                  </span>
                </div>
                <div className="flex items-center gap-3 bg-white/70 backdrop-blur-sm rounded-xl p-3 shadow-sm border border-white/50">
                  <div className="p-1.5 bg-purple-100 rounded-lg">
                    <Bath size={16} className="text-purple-600" />
                  </div>
                  <span className="text-sm font-semibold text-gray-700">
                    {bathrooms > 5 ? "5+" : bathrooms} {bathrooms === 1 ? "Bath" : "Baths"}
                  </span>
                </div>
                {/* Show balcony if greater than 0 with modern styling */}
                {balcony > 0 && (
                  <div className="flex items-center gap-3 bg-white/70 backdrop-blur-sm rounded-xl p-3 shadow-sm border border-white/50">
                    <div className="p-1.5 bg-green-100 rounded-lg">
                      <span className="text-sm">🏡</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-700">
                      {balcony > 5 ? "5+" : balcony} {balcony === 1 ? "Balcony" : "Balconies"}
                    </span>
                  </div>
                )}
              </>
            )}

            {/* Enhanced area display */}
            <div className="flex items-center gap-3 bg-white/70 backdrop-blur-sm rounded-xl p-3 shadow-sm border border-white/50">
              <div className="p-1.5 bg-orange-100 rounded-lg">
                <Maximize2 size={16} className="text-orange-600" />
              </div>
              <span className="text-sm font-semibold text-gray-700">{area} sq.ft</span>
            </div>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}

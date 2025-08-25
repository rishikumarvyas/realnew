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
      if (commercialType === "buy") return "For Sale";
      if (commercialType === "rent") return "For Rent";
      // If status or propertyType indicates rent, show For Rent
      if (
        status?.toLowerCase().includes("rent") ||
        propertyType?.toLowerCase().includes("rent")
      ) {
        return "For Rent";
      }
      // If status or propertyType indicates sale/buy, show For Sale
      if (
        status?.toLowerCase().includes("buy") ||
        status?.toLowerCase().includes("sale") ||
        propertyType?.toLowerCase().includes("buy") ||
        propertyType?.toLowerCase().includes("sale")
      ) {
        return "For Sale";
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
        return "For Sale";
      default:
        return "Property";
    }
  };

  // Check if we should show bedroom/bathroom info (not for plot/commercial)
  const showBedroomBathroom = type !== "plot" && type !== "commercial";

  return (
    <Link to={`/properties/${id}`}>
      <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 h-full group bg-white border-0 rounded-xl shadow-md">
        <div className="relative h-60 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <Badge className={`absolute top-3 right-3 z-20 ${getBadgeStyle()}`}>
            {getBadgeText()}
          </Badge>

          {/* Likes counter */}
          <div className="absolute top-3 left-3 z-20 flex items-center bg-black/50 text-white px-2 py-1 rounded-md">
            <Heart size={16} className="mr-1 fill-white text-white" />
            <span className="text-xs font-medium">{likeCount}</span>
          </div>
        </div>
        <CardContent className="p-5">
          <h3 className="font-semibold text-lg line-clamp-1 mb-2 group-hover:text-blue-600 transition-colors">
            {title}
          </h3>
          <div className="flex items-center text-gray-500 mb-4">
            <MapPin size={16} className="mr-2 text-gray-400" />
            <span className="text-sm line-clamp-1">{location}</span>
          </div>
          <p className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {type === "rent"
              ? `₹${price.toLocaleString()}/month`
              : `₹${price.toLocaleString()}`}
          </p>
        </CardContent>
        <CardFooter className="px-5 py-4 border-t bg-gray-50">
          <div className="flex justify-between w-full text-sm">
            {/* Conditionally show bedroom/bathroom info */}
            {showBedroomBathroom && (
              <>
                <div className="flex items-center gap-2">
                  <Bed className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-500">
                    {bedrooms >= 4 ? "4+" : bedrooms} Beds
                  </span>
                </div>
                <div className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors">
                  <Bath size={18} />
                  <span className="font-medium">
                    {bathrooms} {bathrooms === 1 ? "Bath" : "Baths"}
                  </span>
                </div>
                {/* Show balcony if greater than 0 */}
                {balcony > 0 && (
                  <div className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors">
                    <span className="text-sm">🏡</span>
                    <span className="font-medium">
                      {balcony} {balcony === 1 ? "Balcony" : "Balconies"}
                    </span>
                  </div>
                )}
              </>
            )}

            {/* Always show area */}
            <div className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors">
              <Maximize2 size={18} />
              <span className="font-medium">{area} sq.ft</span>
            </div>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}

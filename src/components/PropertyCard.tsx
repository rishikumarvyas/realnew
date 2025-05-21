import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { MapPin, Bed, Bath, Maximize2, Heart } from "lucide-react";
import { Link } from "react-router-dom";

export interface PropertyCardProps {
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

/**
 * Maps API property data to PropertyCard props format
 */
export function mapApiPropertyToCardProps(apiProperty) {
  // Handle missing properties with sensible defaults
  return {
    id: apiProperty.propertyId || "",
    title: apiProperty.title || "Property Listing",
    price: apiProperty.price || 0,
    location: formatLocation(apiProperty),
    type: determinePropertyType(apiProperty),
    bedrooms: apiProperty.bedroom || 0,
    bathrooms: apiProperty.bathroom || 0,
    balcony: apiProperty.balcony || 0,
    area: apiProperty.area || 0,
    image: apiProperty.mainImageUrl || "/default-property-image.jpg",
    availableFrom: apiProperty.availableFrom || null,
    preferenceId: apiProperty.preferenceId || null,
    amenities: apiProperty.amenities || [],
    furnished: apiProperty.furnished || "",
    likes: apiProperty.likes || 0,
    isLike: apiProperty.isLike || false,
    propertyType: apiProperty.propertyType || apiProperty.superCategory || "",
    status: apiProperty.status || "Available",
    formattedPrice: formatPrice(apiProperty.price, determinePropertyType(apiProperty))
  };
}

/**
 * Formats the location string from address components
 */
function formatLocation(property) {
  const addressParts = [
    property.address,
    property.city,
    property.state
  ].filter(Boolean); // Remove empty values
  
  return addressParts.join(", ");
}

/**
 * Formats price with ₹ symbol and appropriate suffix based on type
 */
function formatPrice(price, type) {
  if (!price) return "₹0";
  
  const formattedVal = price.toLocaleString('en-IN');
  
  return type === "rent" ? `₹${formattedVal}/month` : `₹${formattedVal}`;
}

/**
 * Determines the property type based on available data
 */
function determinePropertyType(property) {
  const category = (property.superCategory || "").toLowerCase();
  const propertyType = (property.propertyType || "").toLowerCase();
  const userType = (property.userType || "").toLowerCase();
  
  // Check multiple fields to determine the actual property type
  if (category.includes("rent") || userType === "rent") {
    return "rent";
  } else if (category.includes("plot") || propertyType.includes("plot")) {
    return "plot";
  } else if (category.includes("commercial") || propertyType.includes("commercial")) {
    return "commercial";
  } else if (category.includes("sell") || category.includes("buy") || userType === "sell") {
    return "sell"; // Using "sell" consistently for buy/sell properties
  }
  
  return "sell"; // Default to sell
}

export function PropertyCard({
  id,
  title,
  price,
  location,
  type,
  bedrooms,
  bathrooms,
  balcony = 0,
  area,
  image,
  likes = 0,
  isLike = false,
  status,
  formattedPrice,
}: PropertyCardProps) {
  // Get badge color based on property type
  const getBadgeStyle = () => {
    switch (type) {
      case "buy":
      case "sell":
        return "bg-gradient-to-r from-blue-600 to-blue-500 text-white border-0";
      case "rent":
        return "bg-white border border-purple-400 text-purple-600";
      case "plot":
        return "bg-gradient-to-r from-amber-600 to-amber-500 text-white border-0";
      case "commercial":
        return "bg-gradient-to-r from-indigo-600 to-indigo-500 text-white border-0";
      default:
        return "";
    }
  };

  // Get badge label based on property type
  const getBadgeLabel = () => {
    switch (type) {
      case "buy":
      case "sell":
        return "For Sale";
      case "rent":
        return "For Rent";
      case "plot":
        return "Plot";
      case "commercial":
        return "Commercial";
      default:
        return "Property";
    }
  };

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
          <Badge
            className={`absolute top-3 right-3 z-20 ${getBadgeStyle()}`}
          >
            {getBadgeLabel()}
          </Badge>
          
          {/* Status badge if available */}
          {status && status !== "Available" && (
            <Badge
              className="absolute top-10 right-3 z-20 bg-yellow-500 text-white border-0"
            >
              {status}
            </Badge>
          )}
          
          {/* Likes counter with visual indicator if user liked it */}
          <div className="absolute top-3 left-3 z-20 flex items-center bg-black/50 text-white px-2 py-1 rounded-md">
            <Heart 
              size={16} 
              className={`mr-1 ${isLike ? "fill-white text-white" : "text-white"}`} 
            />
            <span className="text-xs font-medium">{likes}</span>
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
            {formattedPrice || (type === "rent"
              ? `₹${price.toLocaleString()}/month`
              : `₹${price.toLocaleString()}`)}
          </p>
        </CardContent>
        <CardFooter className="px-5 py-4 border-t bg-gray-50">
          <div className="flex justify-between w-full text-sm">
            {(type !== "plot" && type !== "commercial") && (
              <>
                <div className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors">
                  <Bed size={18} />
                  <span className="font-medium">
                    {bedrooms} {bedrooms === 1 ? "Bed" : "Beds"}
                  </span>
                </div>
                <div className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors">
                  <Bath size={18} />
                  <span className="font-medium">
                    {bathrooms} {bathrooms === 1 ? "Bath" : "Baths"}
                  </span>
                </div>
                {balcony > 0 && (
                  <div className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors">
                    <span className="material-icons text-gray-600" style={{ fontSize: '18px' }}>
                      balcony
                    </span>
                    <span className="font-medium">
                      {balcony} {balcony === 1 ? "Balcony" : "Balconies"}
                    </span>
                  </div>
                )}
              </>
            )}
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
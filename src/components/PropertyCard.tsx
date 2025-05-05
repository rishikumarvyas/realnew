import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { MapPin, Bed, Bath, Maximize2 } from "lucide-react";
import { Link } from "react-router-dom";

export interface PropertyCardProps {
  id: string;
  title: string;
  price: number;
  location: string;
  type: "buy" | "rent" | "sell";
  bedrooms: number;
  bathrooms: number;
  area: number;
  image: string;
}

export function PropertyCard({
  id,
  title,
  price,
  location,
  type,
  bedrooms,
  bathrooms,
  area,
  image,
}: PropertyCardProps) {
  // Get badge color based on property type
  const getBadgeStyle = () => {
    switch (type) {
      case "buy":
        return "bg-gradient-to-r from-blue-600 to-blue-500 text-white border-0";
      case "sell":
        return "bg-gradient-to-r from-teal-600 to-teal-500 text-white border-0";
      case "rent":
        return "bg-white border border-purple-400 text-purple-600";
      default:
        return "";
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
            {type === "buy" 
              ? "For Sale" 
              : type === "rent" 
              ? "For Rent" 
              : "Selling"}
          </Badge>
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

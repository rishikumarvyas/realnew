
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
  return (
    <Link to={`/properties/${id}`}>
      <Card className="overflow-hidden hover:shadow-md transition-shadow duration-300 h-full">
        <div className="property-image-container">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
          />
        </div>
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-lg line-clamp-1">{title}</h3>
            <Badge 
              variant={type === 'rent' ? 'outline' : 'default'}
              className={type === 'buy' ? 'bg-real-blue' : type === 'sell' ? 'bg-real-teal' : ''}
            >
              {type === 'buy' ? 'For Sale' : type === 'rent' ? 'For Rent' : 'Selling'}
            </Badge>
          </div>
          <div className="flex items-center text-gray-500 mb-3">
            <MapPin size={14} className="mr-1" /> 
            <span className="text-sm line-clamp-1">{location}</span>
          </div>
          <p className="font-bold text-xl text-real-blue">
            {type === 'rent' ? `₹${price.toLocaleString()}/month` : `₹${price.toLocaleString()}`}
          </p>
        </CardContent>
        <CardFooter className="px-4 pb-4 pt-0 border-t">
          <div className="flex justify-between w-full text-sm text-gray-500">
            <div className="flex items-center">
              <Bed size={16} className="mr-1" />
              <span>{bedrooms} {bedrooms === 1 ? 'Bed' : 'Beds'}</span>
            </div>
            <div className="flex items-center">
              <Bath size={16} className="mr-1" />
              <span>{bathrooms} {bathrooms === 1 ? 'Bath' : 'Baths'}</span>
            </div>
            <div className="flex items-center">
              <Maximize2 size={16} className="mr-1" />
              <span>{area} sq.ft</span>
            </div>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}

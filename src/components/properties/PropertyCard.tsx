
import React from 'react';
import { Heart, BedDouble, Bath, Ruler, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

export type PropertyType = {
  id: string;
  type: 'buy' | 'rent' | 'sell';
  title: string;
  price: number;
  location: string | { address: string; city: string; state: string; zip: string; };
  bedrooms: number;
  bathrooms: number;
  area: number;
  image?: string;
  images?: string[];
  isFeatured?: boolean;
  details?: {
    bedrooms: number;
    bathrooms: number;
    size: number;
  };
  description?: string;
};

interface PropertyCardProps {
  property: PropertyType;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  // Handle location which can be string or object
  const locationAddress = typeof property.location === 'string' 
    ? property.location 
    : property.location.address;

  // Handle image which might be a string or in an array
  const imageUrl = property.images && property.images.length > 0
    ? property.images[0]
    : property.image;

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg">
      <div className="relative">
        <Link to={`/property/${property.id}`}>
          <img 
            src={imageUrl} 
            alt={property.title} 
            className="h-48 w-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </Link>
        
        {property.isFeatured && (
          <Badge className="absolute top-3 left-3 bg-realestate-teal">
            Featured
          </Badge>
        )}
        
        <button className="absolute top-3 right-3 p-1.5 bg-white rounded-full hover:bg-gray-100 transition-colors">
          <Heart size={18} className="text-gray-600 hover:text-red-500 transition-colors" />
        </button>
        
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-3">
          <span className="text-white font-bold text-xl">
            ₹{property.price.toLocaleString()}
            {property.type === 'rent' && '/mo'}
          </span>
        </div>
      </div>
      
      <CardContent className="p-4">
        <Link to={`/property/${property.id}`}>
          <h3 className="font-semibold text-lg mb-1 hover:text-realestate-teal transition-colors line-clamp-1">
            {property.title}
          </h3>
        </Link>
        
        <div className="flex items-center text-gray-500 mb-3">
          <MapPin size={16} className="mr-1" />
          <p className="text-sm line-clamp-1">{locationAddress}</p>
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center">
            <BedDouble size={16} className="mr-1" />
            <span>{property.bedrooms} {property.bedrooms > 1 ? 'Beds' : 'Bed'}</span>
          </div>
          
          <div className="flex items-center">
            <Bath size={16} className="mr-1" />
            <span>{property.bathrooms} {property.bathrooms > 1 ? 'Baths' : 'Bath'}</span>
          </div>
          
          <div className="flex items-center">
            <Ruler size={16} className="mr-1" />
            <span>{property.area} sq ft</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyCard;

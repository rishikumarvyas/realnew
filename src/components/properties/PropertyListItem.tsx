
import React from 'react';
import { Card } from '@/components/ui/card';
import { BedDouble, Bath, ArrowRight, MapPin, Ruler } from 'lucide-react';
import { PropertyType } from '@/components/properties/PropertyCard';

interface PropertyListItemProps {
  property: PropertyType;
}

const PropertyListItem = ({ property }: PropertyListItemProps) => {
  // Handle location which can be string or object
  const locationAddress = typeof property.location === 'string' 
    ? property.location 
    : property.location.address;

  // Use property.details or fall back to direct properties
  const bedrooms = property.details?.bedrooms || property.bedrooms;
  const bathrooms = property.details?.bathrooms || property.bathrooms;
  const size = property.details?.size || property.area;

  // Handle image which might be a string or in an array
  const imageUrl = property.images && property.images.length > 0
    ? property.images[0]
    : property.image;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="flex flex-col md:flex-row">
        <div className="relative h-48 md:h-auto md:w-80 flex-shrink-0">
          <img 
            src={imageUrl} 
            alt={property.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 left-2">
            <span className={`px-2 py-1 rounded text-xs font-medium text-white ${
              property.type === 'rent' ? 'bg-realestate-teal' : 'bg-realestate-blue'
            }`}>
              {property.type === 'rent' ? 'For Rent' : 'For Sale'}
            </span>
          </div>
        </div>
        
        <div className="p-4 flex flex-col justify-between flex-grow">
          <div>
            <h3 className="font-bold text-lg mb-1">{property.title}</h3>
            
            <div className="flex items-center text-gray-500 mb-2">
              <MapPin size={16} className="mr-1" />
              <p className="text-sm">{locationAddress}</p>
            </div>
            
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
              {property.description || 'Beautiful property in an excellent location.'}
            </p>
            
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="flex items-center text-gray-700">
                <BedDouble size={16} className="mr-1.5" />
                <span className="text-sm">{bedrooms} Beds</span>
              </div>
              <div className="flex items-center text-gray-700">
                <Bath size={16} className="mr-1.5" />
                <span className="text-sm">{bathrooms} Baths</span>
              </div>
              <div className="flex items-center text-gray-700">
                <Ruler size={16} className="mr-1.5" />
                <span className="text-sm">{size} sq ft</span>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between items-end mt-2">
            <div>
              <span className={`font-bold text-lg ${
                property.type === 'rent' ? 'text-realestate-teal' : 'text-realestate-blue'
              }`}>
                ₹{property.price.toLocaleString()}
              </span>
              {property.type === 'rent' && <span className="text-sm text-gray-500">/month</span>}
            </div>
            
            <div className="flex items-center text-realestate-blue hover:underline">
              <span className="font-medium">View details</span>
              <ArrowRight size={16} className="ml-1" />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PropertyListItem;

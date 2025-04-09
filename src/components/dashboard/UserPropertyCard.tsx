
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Eye, ArrowUp } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PropertyType {
  id: string;
  title: string;
  location: {
    address: string;
    city: string;
    state: string;
    zip: string;
  };
  price: number;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  images?: string[];
  type: string;
  status?: string;
  listedDate?: string;
}

interface UserPropertyCardProps {
  property: PropertyType;
  onEdit: () => void;
  onDelete: () => void;
}

const UserPropertyCard = ({ property, onEdit, onDelete }: UserPropertyCardProps) => {
  // Add default placeholder image if images array is empty or undefined
  const imageUrl = property.images && property.images.length > 0 
    ? property.images[0] 
    : 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2075&q=80';
  
  return (
    <Card className="overflow-hidden">
      <div className="relative h-48">
        <img 
          src={imageUrl}
          alt={property.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2 flex space-x-2">
          <span className={`px-2 py-1 rounded-md text-xs font-medium ${
            property.status === 'active' ? 'bg-green-500 text-white' : 
            property.status === 'pending' ? 'bg-yellow-500 text-white' : 
            'bg-gray-500 text-white'
          }`}>
            {property.status || 'Active'}
          </span>
        </div>
      </div>
      
      <CardContent className="p-4">
        <div className="mb-2">
          <h3 className="font-semibold text-lg truncate">{property.title}</h3>
          <p className="text-gray-600 text-sm">{property.location?.address || 'No address provided'}</p>
        </div>
        
        <div className="flex justify-between items-center text-sm font-medium mb-4">
          <span className="text-realestate-blue">${property.price.toLocaleString()}{property.type === 'rent' && '/mo'}</span>
          <span className="text-gray-500">Listed on {property.listedDate || 'Jun 12, 2023'}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex space-x-1">
            <Button variant="ghost" size="sm" asChild>
              <Link to={`/property/${property.id}`}>
                <Eye size={16} className="mr-1" />
                View
              </Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={onEdit}>
              <Edit size={16} className="mr-1" />
              Edit
            </Button>
          </div>
          
          <div className="flex space-x-1">
            <Button variant="ghost" size="sm" className="text-green-600">
              <ArrowUp size={16} className="mr-1" />
              Promote
            </Button>
            <Button variant="ghost" size="sm" className="text-red-600" onClick={onDelete}>
              <Trash2 size={16} className="mr-1" />
              Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserPropertyCard;

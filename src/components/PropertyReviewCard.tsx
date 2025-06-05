import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Bed, 
  Bath, 
  Maximize,
  Calendar,
  User,
  Check,
  X,
  Eye,
  DollarSign
} from 'lucide-react';

interface Property {
  propertyId: string;
  superCategory?: string;
  propertyType?: string;
  statusId?: string;
  title: string;
  description?: string;
  price?: number;
  location?: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  images?: string[];
  submittedBy?: string;
  submittedDate?: string;
  // Add other fields as needed from your API
}

interface PropertyReviewCardProps {
  property: Property;
  onAction?: (propertyId: string, action: 'approve' | 'reject') => void;
}

const PropertyReviewCard: React.FC<PropertyReviewCardProps> = ({ property, onAction }) => {
  // Status mapping for new API
  const statusMap: Record<string, { label: string; color: string }> = {
    '1': { label: 'pending', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    '2': { label: 'approved', color: 'bg-green-100 text-green-800 border-green-200' },
    '3': { label: 'rejected', color: 'bg-red-100 text-red-800 border-red-200' },
  };
  const status = property.statusId ? statusMap[property.statusId]?.label || 'unknown' : 'unknown';
  const statusColor = property.statusId ? statusMap[property.statusId]?.color || 'bg-gray-100 text-gray-800 border-gray-200' : 'bg-gray-100 text-gray-800 border-gray-200';

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <Check className="w-3 h-3" />;
      case 'rejected':
        return <X className="w-3 h-3" />;
      default:
        return <Calendar className="w-3 h-3" />;
    }
  };

  return (
    <Card className="overflow-hidden border border-slate-200 hover:shadow-lg transition-all duration-300 group">
      {/* Property Image */}
      <div className="relative h-48 bg-gradient-to-r from-slate-100 to-slate-200 overflow-hidden">
        <img 
          src={property.images?.[0] || '/placeholder.svg'} 
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-4 right-4">
          <Badge className={`${statusColor} capitalize font-medium`}>
            {getStatusIcon(status)}
            <span className="ml-1">{status}</span>
          </Badge>
        </div>
        <div className="absolute top-4 left-4">
          <Badge variant="secondary" className="bg-white/90 text-slate-700 capitalize">
            {property.propertyType || 'N/A'}
          </Badge>
        </div>
      </div>

      <CardContent className="p-6">
        {/* Property Title & Price */}
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
            {property.title}
          </h3>
          <div className="flex items-center text-green-600 font-bold text-lg">
            <DollarSign className="w-4 h-4" />
            {property.price ? property.price.toLocaleString() : 'N/A'}
          </div>
        </div>

        {/* Description */}
        <p className="text-slate-600 text-sm mb-4 line-clamp-2">
          {property.description || 'No description available.'}
        </p>

        {/* Location */}
        <div className="flex items-center text-slate-500 mb-4">
          <MapPin className="w-4 h-4 mr-2" />
          <span className="text-sm">{property.location || 'N/A'}</span>
        </div>

        {/* Property Details */}
        <div className="flex items-center space-x-4 mb-4 text-slate-600">
          <div className="flex items-center">
            <Bed className="w-4 h-4 mr-1" />
            <span className="text-sm">{property.bedrooms ?? 'N/A'} bed</span>
          </div>
          <div className="flex items-center">
            <Bath className="w-4 h-4 mr-1" />
            <span className="text-sm">{property.bathrooms ?? 'N/A'} bath</span>
          </div>
          <div className="flex items-center">
            <Maximize className="w-4 h-4 mr-1" />
            <span className="text-sm">{property.area ?? 'N/A'} sq ft</span>
          </div>
        </div>

        {/* Submission Info */}
        <div className="border-t border-slate-100 pt-4 mb-4">
          <div className="flex items-center justify-between text-sm text-slate-500">
            <div className="flex items-center">
              <User className="w-4 h-4 mr-2" />
              <span>Submitted by <strong>{property.submittedBy || 'N/A'}</strong></span>
            </div>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              <span>{property.submittedDate ? new Date(property.submittedDate).toLocaleDateString() : 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons (optional, implement as needed) */}
        {/* <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 border-slate-200 hover:bg-slate-50"
          >
            <Eye className="w-4 h-4 mr-2" />
            View Details
          </Button>
        </div> */}
      </CardContent>
    </Card>
  );
};

export default PropertyReviewCard;
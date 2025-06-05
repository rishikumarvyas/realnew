import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  MapPin, 
  Bed, 
  Bath, 
  Eye,
  Clock,
  Building,
  Square,
  CheckCircle,
  XCircle,
  Loader2,
  Heart,
  Share2
} from 'lucide-react';
import axiosInstance from '@/axiosCalls/axiosInstance';

interface Property {
  propertyId: string;
  superCategory: string;
  propertyType: string;
  statusId: string;
  title: string;
  price?: number;
  location?: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  images?: string[];
  description?: string;
  createdDate?: string;
}

interface PropertyReviewCardProps {
  property: Property;
  onAction?: (propertyId: string, action: string) => void;
}

const PropertyReviewCard: React.FC<PropertyReviewCardProps> = ({ property, onAction }) => {
  const [loading, setLoading] = useState(false);
  const [actionType, setActionType] = useState<string | null>(null);
  const { toast } = useToast();

  const handleApprove = async () => {
    setLoading(true);
    setActionType('approve');
    
    try {
      console.log('Approving property:', property.propertyId);
      
      const response = await axiosInstance.post('/api/Admin/Approve', {
        propertyId: property.propertyId
      });
      
      console.log('Approve API response:', response.data);
      
      if (response.status === 200 || response.data) {
        toast({
          title: 'Success!',
          description: `Property ${property.propertyId} approved successfully`,
        });
        
        onAction?.(property.propertyId, 'approve');
      }
    } catch (error) {
      console.error('Approve failed:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve property. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setActionType(null);
    }
  };

  const handleReject = async () => {
    setLoading(true);
    setActionType('reject');
    
    try {
      console.log('Rejecting property:', property.propertyId);
      
      const response = await axiosInstance.post('/api/Admin/Reject', {
        propertyId: property.propertyId
      });
      
      console.log('Reject API response:', response.data);
      
      if (response.status === 200 || response.data) {
        toast({
          title: 'Property Rejected',
          description: `Property ${property.propertyId} has been rejected successfully`,
        });
        
        onAction?.(property.propertyId, 'reject');
      }
    } catch (error) {
      console.error('Reject failed:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject property. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setActionType(null);
    }
  };

  const getStatusBadge = () => {
    const statusMap = {
      '1': { 
        label: 'Pending Review', 
        icon: Clock, 
        color: 'bg-gradient-to-r from-amber-400 to-orange-500 text-white',
        pulse: true
      },
      '2': { 
        label: 'Approved', 
        icon: CheckCircle, 
        color: 'bg-gradient-to-r from-emerald-400 to-green-500 text-white',
        pulse: false
      },
      '3': { 
        label: 'Rejected', 
        icon: XCircle, 
        color: 'bg-gradient-to-r from-red-400 to-rose-500 text-white',
        pulse: false
      }
    };
    
    const status = statusMap[property.statusId as keyof typeof statusMap] || statusMap['1'];
    const IconComponent = status.icon;
    
    return (
      <Badge className={`${status.color} border-0 ${status.pulse ? 'animate-pulse' : ''}`}>
        <IconComponent className="w-3 h-3 mr-1" />
        {status.label}
      </Badge>
    );
  };

  const formatPrice = (price?: number) => {
    if (!price) return 'Price on request';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Card className="group relative overflow-hidden hover:shadow-2xl transition-all duration-500 border-0 shadow-lg bg-white/90 backdrop-blur-sm hover:bg-white hover:scale-[1.02] transform">
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      {/* Property Image Placeholder */}
      <div className="relative h-48 bg-gradient-to-br from-slate-200 via-slate-100 to-slate-200 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        <div className="absolute top-4 left-4 flex gap-2">
          {getStatusBadge()}
        </div>
        <div className="absolute top-4 right-4 flex gap-2">
          <Button size="icon" variant="ghost" className="w-8 h-8 bg-white/90 hover:bg-white backdrop-blur-sm">
            <Heart className="w-4 h-4" />
          </Button>
          <Button size="icon" variant="ghost" className="w-8 h-8 bg-white/90 hover:bg-white backdrop-blur-sm">
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <div className="text-white font-semibold text-lg drop-shadow-lg">
            {formatPrice(property.price)}
          </div>
        </div>
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-bold text-slate-800 group-hover:text-slate-900 line-clamp-2 mb-2">
              {property.title || 'Luxury Property'}
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-slate-600 mb-3">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span className="truncate">{property.location || 'Prime Location'}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                <Building className="w-3 h-3 mr-1" />
                {property.propertyType || 'Apartment'}
              </Badge>
              <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                {property.superCategory || 'Residential'}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Property Features */}
        <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-slate-50/80 rounded-xl">
          <div className="text-center">
            <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg mx-auto mb-1">
              <Bed className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-xs text-slate-600">{property.bedrooms || '3'} Beds</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg mx-auto mb-1">
              <Bath className="w-4 h-4 text-green-600" />
            </div>
            <p className="text-xs text-slate-600">{property.bathrooms || '2'} Baths</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center w-8 h-8 bg-orange-100 rounded-lg mx-auto mb-1">
              <Square className="w-4 h-4 text-orange-600" />
            </div>
            <p className="text-xs text-slate-600">{property.area || '1200'} sq ft</p>
          </div>
        </div>

        {/* Description */}
        {property.description && (
          <p className="text-sm text-slate-600 mb-4 line-clamp-2">
            {property.description}
          </p>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4 border-t border-slate-100">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-10 text-slate-600 hover:text-slate-800 border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all duration-200"
          >
            <Eye className="w-4 h-4 mr-2" />
            View Details
          </Button>
          
          {property.statusId === '1' && (
            <>
              <Button
                onClick={handleApprove}
                disabled={loading}
                size="sm"
                className="flex-1 h-10 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {loading && actionType === 'approve' ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4 mr-2" />
                )}
                Approve
              </Button>
              
              <Button
                onClick={handleReject}
                disabled={loading}
                size="sm"
                className="flex-1 h-10 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {loading && actionType === 'reject' ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <XCircle className="w-4 h-4 mr-2" />
                )}
                Reject
              </Button>
            </>
          )}
        </div>

        {/* Property ID */}
        <div className="mt-3 pt-3 border-t border-slate-100">
          <p className="text-xs text-slate-400">
            Property ID: {property.propertyId}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyReviewCard;
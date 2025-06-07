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
  Share2,
  Image,
  Ruler
} from 'lucide-react';
import axiosInstance from "../axiosCalls/axiosInstance";
import { Link } from 'react-router-dom';


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
  mainImageUrl?: string;
  locality?: string;
  address?: string;
  city?: string;
  bedroom?: number;
  bathroom?: number;
  likeCount?: number;
}

interface PropertyReviewCardProps {
  property: Property;
  onAction?: (propertyId: string, action: string) => void;
}

const PropertyReviewCard: React.FC<PropertyReviewCardProps> = ({ property, onAction }) => {
  const [loading, setLoading] = useState(false);
  const [actionType, setActionType] = useState<string | null>(null);
  const { toast } = useToast();

  // Add debug logging for component mount
  React.useEffect(() => {
    console.log('PropertyReviewCard mounted with property:', property);
  }, [property]);

  const handleApprove = async () => {
    console.log('🔥 Approve button clicked!');
    console.log('Current property:', property);
    
    if (loading) {
      console.log('⏳ Already loading, skipping...');
      return;
    }
    
    setLoading(true);
    setActionType('approve');
    
    try {
      console.log('=== APPROVE PROPERTY ===');
      console.log('Property ID:', property.propertyId);
      
      // Format the payload exactly as expected by the API
      const payload = {
        propertyId: property.propertyId
      };
      
      console.log('Payload:', payload);
      
      console.log('Making API call to /api/Admin/Approve with payload:', payload);
      
      const response = await axiosInstance.post('/api/Admin/Approve', payload);
      
      console.log('Approve Response:', response);
      
      if (response.status === 200) {
        const responseData = response.data;
        console.log('Response data:', responseData);
        
        if (responseData.statusCode === 0) {
          toast({
            title: 'Success!',
            description: responseData.message || `Property ${property.propertyId} approved successfully`,
          });
          
          if (onAction) {
            console.log('Calling onAction with:', { propertyId: property.propertyId, action: 'approve' });
            onAction(property.propertyId, 'approve');
          } else {
            console.warn('onAction callback is not provided');
          }
        } else {
          console.log('API returned error statusCode:', responseData.statusCode);
          toast({
            title: 'API Error',
            description: responseData.message || `API returned status code: ${responseData.statusCode}`,
            variant: 'destructive',
          });
        }
      } else {
        console.error('Unexpected response status:', response.status);
        toast({
          title: 'Error',
          description: 'Failed to approve property. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('=== APPROVE ERROR ===');
      console.error('Error details:', error);
      console.error('Error response:', error.response);
      console.error('Error message:', error.message);
      
      let errorMessage = 'Failed to approve property. Please try again.';
      
      if (error.response?.status === 401 || error.response?.status === 403) {
        errorMessage = 'Please log in again to continue.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setActionType(null);
    }
  };

  const handleReject = async () => {
    console.log('🔥 Reject button clicked!');
    console.log('Current property:', property);
    
    if (loading) {
      console.log('⏳ Already loading, skipping...');
      return;
    }
    
    setLoading(true);
    setActionType('reject');
    
    try {
      console.log('=== REJECT PROPERTY ===');
      console.log('Property ID:', property.propertyId);
      
      // Format the payload exactly as expected by the API
      const payload = {
        propertyId: property.propertyId
      };
      
      console.log('Payload:', payload);
      
      console.log('Making API call to /api/Admin/Reject with payload:', payload);
      
      const response = await axiosInstance.post('/api/Admin/Reject', payload);
      
      console.log('Reject Response:', response);
      
      if (response.status === 200) {
        const responseData = response.data;
        console.log('Response data:', responseData);
        
        if (responseData.statusCode === 0) {
          toast({
            title: 'Property Rejected',
            description: responseData.message || `Property ${property.propertyId} has been rejected successfully`,
          });
          
          if (onAction) {
            console.log('Calling onAction with:', { propertyId: property.propertyId, action: 'reject' });
            onAction(property.propertyId, 'reject');
          } else {
            console.warn('onAction callback is not provided');
          }
        } else {
          console.log('API returned error statusCode:', responseData.statusCode);
          toast({
            title: 'API Error',
            description: responseData.message || `API returned status code: ${responseData.statusCode}`,
            variant: 'destructive',
          });
        }
      } else {
        console.error('Unexpected response status:', response.status);
        toast({
          title: 'Error',
          description: 'Failed to reject property. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('=== REJECT ERROR ===');
      console.error('Error details:', error);
      console.error('Error response:', error.response);
      console.error('Error message:', error.message);
      
      let errorMessage = 'Failed to reject property. Please try again.';
      
      if (error.response?.status === 401 || error.response?.status === 403) {
        errorMessage = 'Please log in again to continue.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
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
      <div className="relative aspect-[4/3] overflow-hidden">
        {property.mainImageUrl ? (
          <img
            src={property.mainImageUrl}
            alt={property.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
              console.error('Image failed to load:', property.mainImageUrl);
              e.currentTarget.src = 'https://placehold.co/600x400?text=No+Image';
            }}
          />
        ) : (
          <div className="w-full h-full bg-slate-100 flex items-center justify-center">
            <Image className="w-12 h-12 text-slate-400" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-lg text-slate-900 line-clamp-1">
                {property.title}
              </h3>
              <p className="text-sm text-slate-500 line-clamp-1">
                {property.locality || property.address}, {property.city}
              </p>
            </div>
            <Badge variant="outline" className="shrink-0 bg-white/80 backdrop-blur-sm">
              {property.propertyType}
            </Badge>
          </div>

          <div className="flex items-center gap-4 text-sm text-slate-600">
            <div className="flex items-center gap-1">
              <Bed className="w-4 h-4" />
              <span>{property.bedroom} Beds</span>
            </div>
            <div className="flex items-center gap-1">
              <Bath className="w-4 h-4" />
              <span>{property.bathroom} Baths</span>
            </div>
            <div className="flex items-center gap-1">
              <Ruler className="w-4 h-4" />
              <span>{property.area} sq.ft</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-semibold text-slate-900">
                ₹{property.price?.toLocaleString() || 'Price on request'}
              </span>
              <span className="text-sm text-slate-500">/month</span>
            </div>
            <div className="flex items-center gap-1 text-slate-500">
              <Heart className="w-4 h-4" />
              <span className="text-sm">{property.likeCount || 0}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4 mt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('View Details clicked for property:', property.propertyId);
              window.location.href = `/properties/${property.propertyId}`;
            }}
            className="flex-1 h-10 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-md hover:bg-slate-50 hover:text-slate-800 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-all duration-200 cursor-pointer"
          >
            <div className="flex items-center justify-center">
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </div>
          </button>
          
          {property.statusId === '1' && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Approve button clicked for property:', property.propertyId);
                  handleApprove();
                }}
                disabled={loading}
                className="flex-1 h-10 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-emerald-500 to-green-600 rounded-md hover:from-emerald-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <div className="flex items-center justify-center">
                  {loading && actionType === 'approve' ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4 mr-2" />
                  )}
                  Approve
                </div>
              </button>
              
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Reject button clicked for property:', property.propertyId);
                  handleReject();
                }}
                disabled={loading}
                className="flex-1 h-10 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-rose-600 rounded-md hover:from-red-600 hover:to-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <div className="flex items-center justify-center">
                  {loading && actionType === 'reject' ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <XCircle className="w-4 h-4 mr-2" />
                  )}
                  Reject
                </div>
              </button>
            </>
          )}
        </div>

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
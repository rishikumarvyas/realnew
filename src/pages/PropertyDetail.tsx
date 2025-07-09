import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bed, 
  Bath, 
  Maximize2, 
  MapPin, 
  Phone,
  Mail, 
  MessageSquare,
  User,
  Shield,
  ArrowLeft,
  Wifi,
  Car,
  Wind,
  Lock,
  Droplets,
  ArrowUpDown,
  Home,
  Heart,
  Share2,
  Calendar,
  Image,
  Eye,
  EyeOff
} from "lucide-react";
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious 
} from "@/components/ui/carousel";
import { Switch } from "@/components/ui/switch";
import { ContactForm } from "@/components/ContactForm";
import { useAuth } from "@/contexts/AuthContext";
import { ImageGalleryDialog } from "@/components/ImageGalleryDialog";
import { useToast } from "@/hooks/use-toast";
import PropertyMap from "@/components/PropertyMap";
import axiosInstance from "../axiosCalls/axiosInstance";

const PropertyDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [contactType, setContactType] = useState("whatsapp");
  const [isFavorite, setIsFavorite] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Ref for carousel API access
  const carouselApiRef = useRef<any>(null);

  // States for image gallery and likes
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [similarProperties, setSimilarProperties] = useState<any[]>([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);
  
  // States for contact toggle and contact count
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [ownerContactInfo, setOwnerContactInfo] = useState<any>(null);
  const [contactsViewed, setContactsViewed] = useState(0);
  const [likingProperty, setLikingProperty] = useState(false);

  useEffect(() => {
    const fetchPropertyDetails = async () => {
      setLoading(true);
      try {
        console.log("Fetching property with ID:", id);
        const response = await axiosInstance.get(`/api/Account/GetPropertyDetails?propertyId=${id}`);
        
        const data = response.data;
        console.log("Raw property data:", data);
        
        if (data.statusCode === 200 && data.propertyDetail) {
          const propertyData = data.propertyDetail;
          
          setProperty(propertyData);
          setLikesCount(propertyData.likeCount || 0);
          
          // Use correct API field for like status
          const userLikeStatus = propertyData.isLikedByUser || false;
          setIsFavorite(userLikeStatus);
          console.log("Setting initial like status:", userLikeStatus);
          
          setError(null);
          
          // Fetch similar properties
          fetchSimilarProperties(propertyData.city, propertyData.propertyType);
        } else {
          throw new Error(data.message || 'Failed to retrieve property details');
        }
      } catch (err: any) {
        console.error('Error fetching property details:', err);
        const errorMessage = err.response?.data?.message || err.message || 'An unknown error occurred';
        setError(errorMessage);
        
        // Only use mock data in development
        if (process.env.NODE_ENV === 'development') {
          const mockPropertyDetail = getMockPropertyDetail(id || "");
          if (mockPropertyDetail) {
            console.log("Using mock data in development");
            setProperty(mockPropertyDetail);
            setIsFavorite(mockPropertyDetail.isLikedByUser || false);
            setLikesCount(mockPropertyDetail.likeCount || 0);
            setError(null);
            getMockSimilarProperties(mockPropertyDetail.city, mockPropertyDetail.propertyType);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPropertyDetails();
    }
  }, [id]);

  // FIXED: Add effect to sync carousel with activeImageIndex
  useEffect(() => {
    if (carouselApiRef.current && typeof carouselApiRef.current.scrollTo === 'function') {
      carouselApiRef.current.scrollTo(activeImageIndex);
    }
  }, [activeImageIndex]);
  
  // Fetch similar properties based on location and property type
  const fetchSimilarProperties = async (city: string, propertyType: string) => {
    if (!city) return;
    
    setLoadingSimilar(true);
    try {
      console.log(`Fetching similar properties for city: ${city}, type: ${propertyType}`);
      // For development/demo purposes, use mock data
      getMockSimilarProperties(city, propertyType);
    } catch (err) {
      console.error('Error fetching similar properties:', err);
    } finally {
      setLoadingSimilar(false);
    }
  };
  
  // Mock similar properties (for development purposes)
  const getMockSimilarProperties = (city: string, propertyType: string) => {
    const mockProperties = Array(3).fill(0).map((_, index) => ({
      propertyId: `mock_similar_${index}`,
      title: `${propertyType} in ${city} - Property ${index + 1}`,
      propertyType: propertyType,
      price: Math.floor(Math.random() * 50000) + 10000,
      superCategory: Math.random() > 0.5 ? "Rent" : "Buy",
      bedroom: Math.floor(Math.random() * 4) + 1,
      bathroom: Math.floor(Math.random() * 3) + 1,
      area: Math.floor(Math.random() * 1000) + 500,
      address: `${Math.floor(Math.random() * 100) + 1} ${city} Road`,
      city: city,
      imageDetails: [{
        imageUrl: `https://source.unsplash.com/random/300x200?apartment,house,${index}`,
        isMainImage: true
      }]
    }));
    
    setSimilarProperties(mockProperties);
  };

  // Mock property data for development testing only
  const getMockPropertyDetail = (propertyId: string) => {
    console.log("Using mock data for propertyId:", propertyId);
    return {
      propertyId: propertyId,
      superCategoryId: "123",
      superCategory: "Rent",
      propertyTypeId: "456",
      propertyType: "Apartment",
      title: "Modern 3BHK with Sea View",
      description: "Beautiful apartment with amazing sea views. Fully furnished with modern amenities. This luxurious property offers stunning panoramic views, modern interiors, and all essential amenities for comfortable living. Perfect for families looking for a premium lifestyle in a prime location.",
      price: 25000,
      area: 1500,
      bedroom: 3,
      bathroom: 2,
      balcony: 1,
      likeCount: 42,
      isLikedByUser: false,
      amenityDetails: [
        { amenityId: "1", amenity: "Wifi" },
        { amenityId: "2", amenity: "Parking" },
        { amenityId: "3", amenity: "Swimming Pool" },
        { amenityId: "4", amenity: "Lift" },
        { amenityId: "5", amenity: "Security" },
        { amenityId: "6", amenity: "Air Conditioning" }
      ],
      address: "Marine Drive",
      cityId: "789",
      city: "Mumbai",
      stateId: "101",
      state: "Maharashtra",
      userTypeId: "112",
      userType: "Owner",
      postedBy: "Ram", 
      phone: "+919999999999",
      imageDetails: [
        { 
          imageId: "img1", 
          imageUrl: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&q=80",
          isMainImage: true 
        },
        { 
          imageId: "img2", 
          imageUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80",
          isMainImage: false 
        },
        { 
          imageId: "img3", 
          imageUrl: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80",
          isMainImage: false 
        }
      ],
      ownerType: "Owner",
      isReraApproved: true,
      isOCApproved: false,
      preferenceId: "2",
      preference: "Family",
      availableFrom: "2025-06-01"
    };
  };

  const handleContactModal = (type: string) => {
    setContactType(type);
    setContactModalOpen(true);
  };

  // Handle contact info toggle with proper API response handling
  const handleToggleContactInfo = async (checked: boolean) => {
    if (checked && !user) {
      toast({
        title: "Login Required",
        description: "Please login to view contact information.",
        variant: "destructive",
      });
      return;
    }

    if (checked && user && property && isPropertyOwner()) {
      toast({
        title: "Action not allowed",
        description: "You cannot view contact information for your own property.",
        variant: "destructive",
      });
      return;
    }

    if (checked && user) {
      try {
        const userId = user.userId;
        const propertyId = property.propertyId || id;
        
        if (!userId || !propertyId) {
          throw new Error('User ID or Property ID is missing');
        }

        const response = await axiosInstance.get('/api/Account/GetPropertyContact', {
          params: {
            AccountId: userId,
            PropertyId: propertyId
          }
        });

        console.log('API Response:', response.data);

        if (response.data.statusCode === 200) {
          // Store the contact information from API response
          setOwnerContactInfo({
            publisherName: response.data.publisherName,
            publisherPhone: response.data.publisherPhone,
            alreadyViewed: response.data.alreadyViewed
          });
          
          setShowContactInfo(true);
          
          // Extract contact count from message
          const message = response.data.message || '';
          const match = message.match(/(\d+)/);
          if (match) {
            setContactsViewed(parseInt(match[1]));
          }
          
          toast({
            title: "Contact information visible",
            description: response.data.alreadyViewed 
              ? "You've already viewed this contact before."
              : "Contact details are now visible."
          });
        } else {
          throw new Error(response.data.message || 'Failed to get contact information');
        }
      } catch (error: any) {
        console.error('Error loading contact info:', error);
        
        const errorMessage = error.response?.data?.message || error.message || "Failed to load contact information.";
        toast({
          title: error.response?.status === 400 ? "View Limit Reached" : "Error",
          description: errorMessage,
          variant: "destructive",
        });
        
        setShowContactInfo(false);
        setOwnerContactInfo(null);
        
        // Still extract contact count from error message if available
        if (error.response?.data?.message) {
          const match = error.response.data.message.match(/(\d+)/);
          if (match) {
            setContactsViewed(parseInt(match[1]));
          }
        }
      }
    } else {
      setShowContactInfo(false);
    }
  };

  // Handle show contact click
  const handleShowContactClick = () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to view contact information.",
        variant: "destructive",
      });
      return;
    }
    
    if (isPropertyOwner()) {
      toast({
        title: "Action not allowed",
        description: "You cannot view contact information for your own property.",
        variant: "destructive",
      });
      return;
    }
    
    handleToggleContactInfo(true);
  };

  // FIXED: Enhanced toggleFavorite function with better state management
  const toggleFavorite = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to like this property.",
        variant: "destructive",
      });
      return;
    }

    if (isPropertyOwner()) {
      toast({
        title: "Action not allowed",
        description: "You cannot like your own property.",
        variant: "destructive",
      });
      return;
    }
    
    // Prevent multiple rapid clicks
    if (likingProperty) return;
    
    setLikingProperty(true);
    
    // Store previous state for rollback if needed
    const previousLikeStatus = isFavorite;
    const previousLikesCount = likesCount;
    
    try {
      const userId = user.userId;
      const propertyId = property.propertyId || id;
      const newLikeStatus = !isFavorite;
      
      // Optimistic update
      setIsFavorite(newLikeStatus);
      setLikesCount(prev => newLikeStatus ? prev + 1 : Math.max(0, prev - 1));
      
      const response = await axiosInstance.post('/api/Account/UpdateProperty', {
        propertyId: propertyId,
        isLiked: newLikeStatus,
        accountId: userId
      });
      
      if (response.data.statusCode === 200) {
        // Update likes count from API response if provided
        if (response.data.likeCount !== undefined) {
          setLikesCount(response.data.likeCount);
        }
        
        // Also update the property object to maintain consistency
        setProperty(prev => ({
          ...prev,
          isLikedByUser: newLikeStatus,
          likeCount: response.data.likeCount || (newLikeStatus ? prev.likeCount + 1 : Math.max(0, prev.likeCount - 1))
        }));
        
        toast({
          title: newLikeStatus ? "Added to favorites" : "Removed from favorites",
          description: newLikeStatus 
            ? "This property has been added to your favorites." 
            : "This property has been removed from your favorites.",
        });
        
        console.log('Property like status updated successfully');
      } else {
        throw new Error(response.data.message || 'Failed to update like status');
      }
    } catch (error: any) {
      console.error('Error updating like status:', error);
      
      // Rollback optimistic update
      setIsFavorite(previousLikeStatus);
      setLikesCount(previousLikesCount);
      
      toast({
        title: "Action failed",
        description: error.response?.data?.message || "There was an error updating your favorites. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLikingProperty(false);
    }
  };

  // FIXED: Enhanced handleImageClick function
  const handleImageClick = (index: number) => {
    console.log('Thumbnail clicked, changing to index:', index);
    setActiveImageIndex(index);
  };
  
  // Use posted by and phone information from the property details or API response
  const ownerDetails = {
    name: ownerContactInfo?.publisherName || property?.postedBy || "Property Owner",
    phone: ownerContactInfo?.publisherPhone || property?.phone || "+91 98765 43210",
    email: "contact@homeyatra.com",
    verified: true
  };
  
  // Format date function
  const formatDate = (dateString: string) => {
    if (!dateString) return "Not specified";
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return "Invalid date";
    }
  };

  // Helper function to map preference ID to readable text
  const getPreferenceText = (prefId: string) => {
    const preferences: Record<string, string> = {
      "1": "Bachelors",
      "2": "Family",
      "3": "Girls",
      "4": "Anyone",
      "0": "Any"
    };
    return preferences[prefId] || "Not specified";
  };
  
  // Check if current user is the property owner
  const isPropertyOwner = () => {
    if (!property || !user) return false;
    
    if (property.userId && user.userId) {
      return property.userId === user.userId;
    }
    
    return property.postedBy === user.name;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Property Not Found</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => navigate(-1)} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  // Determine property category label
  const categoryLabel = property.superCategory?.toLowerCase() === 'rent' 
    ? 'For Rent' 
    : property.superCategory?.toLowerCase() === 'buy' 
      ? 'For Sale' 
      : property.superCategory?.toLowerCase() === 'sell' 
        ? 'Selling' 
        : property.superCategory;

  // Get images directly
  const images = property.imageDetails && property.imageDetails.length > 0 
    ? property.imageDetails 
    : [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with back button and actions */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </Button>
            
            <div className="flex items-center gap-3">
              {/* Contact Count Display - only show when user has viewed contacts */}
              {user && contactsViewed > 0 && (
                <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-sm">
                  <Eye className="w-4 h-4" />
                  <span>{contactsViewed} contacts viewed</span>
                </div>
              )}
              
              {/* Like Button */}
              <Button
                variant={isFavorite ? "default" : "outline"}
                size="sm"
                onClick={toggleFavorite}
                disabled={likingProperty}
                className="flex items-center gap-2"
              >
                <Heart className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`} />
                <span>{likesCount}</span>
                {likingProperty && <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white ml-1"></div>}
              </Button>
              
              {/* Share Button */}
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
        {/* Property Title and Location Section */}
        <div className="mb-6 animate-fade-in">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center">
              {property.title}
              <Badge 
                variant={property.superCategory?.toLowerCase() === 'rent' ? 'outline' : 'default'}
                className={`
                  ml-3 px-3 py-1 text-sm font-medium
                  ${property.superCategory?.toLowerCase() === 'buy' ? 'bg-blue-600' : property.superCategory?.toLowerCase() === 'sell' ? 'bg-teal-600' : ''}
                `}
              >
                {categoryLabel}
              </Badge>
              
              {/* Show isLiked status badge */}
              {isFavorite && (
                <Badge 
                  variant="outline"
                  className="ml-2 px-2 py-1 text-xs font-medium border-red-300 text-red-600 bg-red-50"
                >
                  <Heart className="h-3 w-3 mr-1 fill-red-500 text-red-500" />
                  Liked
                </Badge>
              )}
            </h1>
          </div>
          <div className="flex items-center text-gray-600">
            <MapPin size={16} className="mr-1 flex-shrink-0 text-blue-600" />
            <span className="text-sm sm:text-base">{property.address}{property.city ? `, ${property.city}` : ''}{property.state ? `, ${property.state}` : ''}</span>
          </div>
        </div>

        {/* FIXED: Image Gallery with proper carousel integration */}
        <div className="mb-8 bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow animate-scale-in">
          {images.length > 0 ? (
            <div className="relative">
              <Carousel 
                className="w-full"
                setApi={carouselApiRef.current}
                opts={{
                  startIndex: activeImageIndex,
                  loop: true
                }}
              >
                <CarouselContent>
                  {images.map((image: any, index: number) => (
                    <CarouselItem key={image.imageId || index}>
                      <div className="aspect-[16/10] overflow-hidden relative">
                        <div 
                          className="w-full h-full cursor-pointer group"
                          onClick={() => setGalleryOpen(true)}
                        >
                          <img 
                            src={image.imageUrl} 
                            alt={`Property view ${index + 1}`} 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            loading={index === 0 ? "eager" : "lazy"}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                           
                          </div>
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="absolute left-4 bg-white/80 hover:bg-white" />
                <CarouselNext className="absolute right-4 bg-white/80 hover:bg-white" />
                
                {/* Image counter badge */}
                <div className="absolute bottom-4 right-4 bg-black/70 text-white text-sm px-3 py-1 rounded-full z-10">
                  {activeImageIndex + 1} / {images.length}
                </div>
              </Carousel>
              
              {/* FIXED: Thumbnails with better click handling */}
              {images.length > 1 && (
                <div className="flex p-4 gap-2 overflow-x-auto pb-2 bg-gray-50">
                  {images.map((image: any, index: number) => (
                    <button
                      key={image.imageId || index}
                      className={`w-20 h-14 sm:w-24 sm:h-16 flex-shrink-0 cursor-pointer rounded-md overflow-hidden transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        index === activeImageIndex ? 'ring-2 ring-blue-600 transform scale-105' : 'opacity-70 hover:opacity-100'
                      }`}
                      onClick={() => handleImageClick(index)}
                      aria-label={`View image ${index + 1}`}
                    >
                      <img 
                        src={image.imageUrl} 
                        alt={`Thumbnail ${index + 1}`} 
                        className="w-full h-full object-cover" 
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="aspect-[16/10] bg-gray-200 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">No images available</p>
            </div>
          )}
        </div>

  

        {/* Property Details and Sidebar layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-6">
          {/* Main Content */}
          <div className="space-y-6">
            {/* Basic Details */}
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              {/* Price & Type Banner */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 -mx-6 -mt-6 px-6 py-4 mb-6 border-b border-blue-200 flex flex-wrap items-center gap-4 justify-between">
                <div className="flex flex-col">
                  <span className="text-sm text-blue-700 font-medium">Property Price</span>
                  <span className="text-2xl font-bold text-blue-700">
                    ₹{property.price?.toLocaleString() || '-'}
                    {property.superCategory?.toLowerCase() === 'rent' ? '/month' : ''}
                  </span>
                </div>
                <div className="flex items-center">
                  <Badge className="mr-2 bg-blue-600">
                    {property.propertyType || "Residential"}
                  </Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 mb-6">
                {/* Only show for non-Plot and non-Shop */}
                {property.propertyType && !["plot", "shop"].includes(property.propertyType.toLowerCase()) ? (
                  <>
                    {property.bedroom !== undefined && (
                      <div className="flex items-center gap-3 group hover:bg-blue-50 p-2 rounded-lg transition-colors">
                        <div className="bg-blue-100 p-2 rounded-lg group-hover:bg-blue-200 transition-colors">
                          <Bed className="text-blue-600" size={20} />
                        </div>
                        <div>
                          <span className="block font-medium">{property.bedroom}</span>
                          <span className="text-gray-500 text-sm">Bedrooms</span>
                        </div>
                      </div>
                    )}
                    {property.bathroom !== undefined && (
                      <div className="flex items-center gap-3 group hover:bg-blue-50 p-2 rounded-lg transition-colors">
                        <div className="bg-blue-100 p-2 rounded-lg group-hover:bg-blue-200 transition-colors">
                          <Bath className="text-blue-600" size={20} />
                        </div>
                        <div>
                          <span className="block font-medium">{property.bathroom}</span>
                          <span className="text-gray-500 text-sm">Bathrooms</span>
                        </div>
                      </div>
                    )}
                    {property.balcony !== undefined && property.balcony > 0 && (
                      <div className="flex items-center gap-3 group hover:bg-blue-50 p-2 rounded-lg transition-colors">
                        <div className="bg-blue-100 p-2 rounded-lg group-hover:bg-blue-200 transition-colors text-blue-600 font-bold">
                          B
                        </div>
                        <div>
                          <span className="block font-medium">{property.balcony}</span>
                          <span className="text-gray-500 text-sm">Balconies</span>
                        </div>
                      </div>
                    )}
                  </>
                ) : null}
                {property.area !== undefined && (
                  <div className="flex items-center gap-3 group hover:bg-blue-50 p-2 rounded-lg transition-colors">
                    <div className="bg-blue-100 p-2 rounded-lg group-hover:bg-blue-200 transition-colors">
                      <Maximize2 className="text-blue-600" size={20} />
                    </div>
                    <div>
                      <span className="block font-medium">{property.area}</span>
                      <span className="text-gray-500 text-sm">sq.ft Area</span>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3 group hover:bg-blue-50 p-2 rounded-lg transition-colors">
                  <div className="bg-blue-100 p-2 rounded-lg group-hover:bg-blue-200 transition-colors">
                    <User className="text-blue-600" size={20} />
                  </div>
                  <div>
                    <span className="block font-medium">{property.userType || "Owner"}</span>
                    <span className="text-gray-500 text-sm">Listed By</span>
                  </div>
                </div>
                {/* Likes Count Pill */}
                <div className="flex items-center gap-3 group hover:bg-blue-50 p-2 rounded-lg transition-colors">
                  <div className="bg-blue-100 p-2 rounded-lg group-hover:bg-blue-200 transition-colors">
                    <Heart className={`${isFavorite ? 'fill-red-500 text-red-500' : 'text-blue-600'}`} size={20} />
                  </div>
                  <div>
                    <span className="block font-medium">{likesCount}</span>
                    <span className="text-gray-500 text-sm">Likes</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-3 inline-flex items-center">
                  <span className="inline-block w-4 h-4 bg-blue-600 rounded-full mr-2"></span>
                  Property Description
                </h3>
                <p className="text-gray-600 leading-relaxed">{property.description || "No description provided"}</p>
              </div>
            </div>
            
            {/* Tabbed Details */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <Tabs defaultValue="amenities">
                <TabsList className="w-full border-b p-0 bg-gray-50">
                  <TabsTrigger value="amenities" className="flex-1 rounded-none py-4 data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-blue-600">
                    Amenities
                  </TabsTrigger>
                  <TabsTrigger value="details" className="flex-1 rounded-none py-4 data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-blue-600">
                    Property Details
                  </TabsTrigger>
                  <TabsTrigger value="moreInfo" className="flex-1 rounded-none py-4 data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-blue-600">
                    More Info
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="amenities" className="p-6">
                  {property.amenityDetails && property.amenityDetails.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {property.amenityDetails.map((amenity: any, index: number) => {
                        let icon = null;
                        
                        if (amenity.amenity.toLowerCase().includes("lift")) icon = <ArrowUpDown className="text-blue-600" size={18} />;
                        else if (amenity.amenity.toLowerCase().includes("swimming")) icon = <Droplets className="text-blue-600" size={18} />;
                        else if (amenity.amenity.toLowerCase().includes("wifi")) icon = <Wifi className="text-blue-600" size={18} />;
                        else if (amenity.amenity.toLowerCase().includes("parking")) icon = <Car className="text-blue-600" size={18} />;
                        else if (amenity.amenity.toLowerCase().includes("tv") || amenity.amenity.toLowerCase().includes("television")) 
                          icon = <Bath className="text-blue-600" size={18} />;
                        else if (amenity.amenity.toLowerCase().includes("air") || amenity.amenity.toLowerCase().includes("ac")) 
                          icon = <Wind className="text-blue-600" size={18} />;
                        else if (amenity.amenity.toLowerCase().includes("security") || amenity.amenity.toLowerCase().includes("guard")) 
                          icon = <Lock className="text-blue-600" size={18} />;
                        else icon = <div className="w-2 h-2 rounded-full bg-blue-600 mt-2"></div>;
                        
                        return (
                          <div 
                            key={amenity.amenityId || index} 
                            className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg hover:bg-blue-50 transition-colors hover:scale-[1.02] transform"
                          >
                            <div className="bg-white p-2 rounded-full shadow-sm">
                              {icon}
                            </div>
                            <span className="font-medium">{amenity.amenity}</span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-gray-500">No amenities listed for this property.</p>
                  )}
                </TabsContent>
                
                <TabsContent value="details" className="p-6">
                  <div className="divide-y">
                    <div className="flex justify-between py-3">
                      <span className="text-gray-600">Property Type</span>
                      <span className="font-medium">{property.propertyType || "Not specified"}</span>
                    </div>
                    <div className="flex justify-between py-3">
                      <span className="text-gray-600">Location</span>
                      <span className="font-medium">{property.city || ""}{property.state ? `, ${property.state}` : ""}</span>
                    </div>
                    <div className="flex justify-between py-3">
                      <span className="text-gray-600">Total Area</span>
                      <span className="font-medium">{property.area} sq.ft</span>
                    </div>
                    {/* Only show for non-Plot and non-Shop */}
                    {property.propertyType && !["plot", "shop"].includes(property.propertyType.toLowerCase()) ? (
                      <>
                        <div className="flex justify-between py-3">
                          <span className="text-gray-600">Bedrooms</span>
                          <span className="font-medium">{property.bedroom}</span>
                        </div>
                        <div className="flex justify-between py-3">
                          <span className="text-gray-600">Bathrooms</span>
                          <span className="font-medium">{property.bathroom}</span>
                        </div>
                        <div className="flex justify-between py-3">
                          <span className="text-gray-600">Balconies</span>
                          <span className="font-medium">{property.balcony}</span>
                        </div>
                      </>
                    ) : null}
                    <div className="flex justify-between py-3">
                      <span className="text-gray-600">Listed By</span>
                      <span className="font-medium">{property.userType || "Owner"}</span>
                    </div>
                    {/* Only show 'Available From' if not Plot and not Buy */}
                    {!(property.propertyType && property.propertyType.toLowerCase() === 'plot') && !(property.superCategory && property.superCategory.toLowerCase() === 'buy') && (
                      <div className="flex justify-between py-3">
                        <span className="text-gray-600">Available From</span>
                        <span className="font-medium">{property.availableFrom && new Date(property.availableFrom).toLocaleDateString()}</span>
                      </div>
                    )}
                    {/* Show isNA for Plot */}
                    {property.propertyType && property.propertyType.toLowerCase() === 'plot' && (
                      <div className="flex justify-between py-3">
                        <span className="text-gray-600">Is NA</span>
                        <span className="font-medium">{property.isNA !== null && property.isNA !== undefined ? (property.isNA ? 'Yes' : 'No') : 'Not specified'}</span>
                      </div>
                    )}
                    {/* Show preferences for Rent */}
                    {property.superCategory && property.superCategory.toLowerCase() === 'rent' && property.preferences && property.preferences.length > 0 && (
                      <div className="flex justify-between py-3">
                        <span className="text-gray-600">Preferences</span>
                        <span className="font-medium">{property.preferences.map((pref: any) => pref.preference).join(', ')}</span>
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="moreInfo" className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* For Plot, only show RERA Approved, Liked by You, and Listed Date */}
                    {property.propertyType && property.propertyType.toLowerCase() === 'plot' ? (
                      <>
                        <div className="flex justify-between border-b pb-3">
                          <span className="text-gray-600">RERA Approved</span>
                          <span className="font-medium flex items-center">
                            {property.isReraApproved ? (
                              <Badge variant="default" className="bg-green-600">Yes</Badge>
                            ) : (
                              <Badge variant="outline" className="border-gray-400 text-gray-600">No</Badge>
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between border-b pb-3">
                          <span className="text-gray-600">Liked by You</span>
                          <span className="font-medium flex items-center">
                            {isFavorite ? (
                              <Badge variant="default" className="bg-red-600 text-white">Yes</Badge>
                            ) : (
                              <Badge variant="outline" className="border-gray-400 text-gray-600">No</Badge>
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between border-b pb-3">
                          <span className="text-gray-600">Listed Date</span>
                          <span className="font-medium">{formatDate(property.createdDt)}</span>
                        </div>
                      </>
                    ) : property.propertyType && property.propertyType.toLowerCase() === 'shop' && property.superCategory && property.superCategory.toLowerCase() === 'rent' ? (
                      <>
                        <div className="flex justify-between border-b pb-3">
                          <span className="text-gray-600">Like Count</span>
                          <span className="font-medium flex items-center">
                            <Heart className={`h-4 w-4 mr-1 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                            {likesCount}
                          </span>
                        </div>
                        <div className="flex justify-between border-b pb-3">
                          <span className="text-gray-600">Liked by You</span>
                          <span className="font-medium flex items-center">
                            {isFavorite ? (
                              <Badge variant="default" className="bg-red-600 text-white">Yes</Badge>
                            ) : (
                              <Badge variant="outline" className="border-gray-400 text-gray-600">No</Badge>
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between border-b pb-3">
                          <span className="text-gray-600">Listed Date</span>
                          <span className="font-medium">{formatDate(property.createdDt)}</span>
                        </div>
                      </>
                    ) : (
                      <>
                        {property.superCategory?.toLowerCase() !== 'rent' && (
                          <>
                            <div className="flex justify-between border-b pb-3">
                              <span className="text-gray-600">RERA Approved</span>
                              <span className="font-medium flex items-center">
                                {property.isReraApproved ? (
                                  <Badge variant="default" className="bg-green-600">Yes</Badge>
                                ) : (
                                  <Badge variant="outline" className="border-gray-400 text-gray-600">No</Badge>
                                )}
                              </span>
                            </div>
                            <div className="flex justify-between border-b pb-3">
                              <span className="text-gray-600">OC Approved</span>
                              <span className="font-medium flex items-center">
                                {property.isOCApproved ? (
                                  <Badge variant="default" className="bg-green-600">Yes</Badge>
                                ) : (
                                  <Badge variant="outline" className="border-gray-400 text-gray-600">No</Badge>
                                )}
                              </span>
                            </div>
                            <div className="flex justify-between border-b pb-3">
                              <span className="text-gray-600">Like Count</span>
                              <span className="font-medium flex items-center">
                                <Heart className={`h-4 w-4 mr-1 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                                {likesCount}
                              </span>
                            </div>
                          </>
                        )}
                        <div className="flex justify-between border-b pb-3">
                          <span className="text-gray-600">Liked by You</span>
                          <span className="font-medium flex items-center">
                            {isFavorite ? (
                              <Badge variant="default" className="bg-red-600 text-white">Yes</Badge>
                            ) : (
                              <Badge variant="outline" className="border-gray-400 text-gray-600">No</Badge>
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between border-b pb-3">
                          <span className="text-gray-600">Listed Date</span>
                          <span className="font-medium">{formatDate(property.createdDt)}</span>
                        </div>
                      </>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
            
            {/* Map Section - Updated with OpenStreetMap */}
        <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
  <h3 className="text-lg font-medium mb-3 inline-flex items-center">
    <MapPin className="text-blue-600 mr-2" size={18} />
    Location
  </h3>

  <PropertyMap 
    address={property.address || ''}
    city={property.city || ''}
    state={property.state || ''}
    className="h-[300px]"
  />

  <p className="mt-3 text-sm text-gray-600">
    {property.address}
    {property.city ? `, ${property.city}` : ''}
    {property.state ? `, ${property.state}` : ''}
  </p>
</div>

          </div>
          
          {/* Sidebar - Contact Info */}
          {/* Updated Contact Info Section */}
<div>
  <div className="bg-white p-6 rounded-xl shadow-sm mb-6 sticky top-24 hover:shadow-lg transition-shadow">
    <div className="border-b pb-4 space-y-4">
      {/* First Row: Title with User Icon */}
      <div className="flex items-center">
        <User className="text-blue-600 mr-2" />
        <h3 className="text-lg font-medium">
          Contact {property.userType || "Owner"}
        </h3>
      </div>
      
      {/* Second Row: Toggle Switch with Label */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">Show Contact Info</span>
        <div className="flex items-center gap-2">
          <Switch
            checked={showContactInfo}
            onCheckedChange={handleToggleContactInfo}
            disabled={!user}
          />
          {showContactInfo ? (
            <Eye className="h-4 w-4 text-blue-600" />
          ) : (
            <EyeOff className="h-4 w-4 text-gray-400" />
          )}
        </div>
      </div>
      
      {/* Show login message if user not logged in */}
      {!user && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-sm text-yellow-800 text-center">
            Please login to view contact information
          </p>
        </div>
      )}
    </div>
    
    {/* Owner/Publisher Info Section - Updated to use API data */}
    <div className="flex items-center gap-3 mb-6 bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
      <div className="bg-blue-600 rounded-full w-12 h-12 flex items-center justify-center text-white shadow-inner">
        {ownerContactInfo?.publisherName 
          ? ownerContactInfo.publisherName.charAt(0).toUpperCase()
          : (property.postedBy ? property.postedBy.charAt(0).toUpperCase() : 'O')
        }
      </div>
      
      <div>
        <div className="font-medium">
          {showContactInfo && ownerContactInfo?.publisherName 
            ? ownerContactInfo.publisherName 
            : (property.postedBy || "Property Owner")
          }
        </div>
        {showContactInfo && ownerContactInfo?.publisherPhone && (
          <div className="font-medium">
            {ownerContactInfo.publisherPhone}
          </div>
        )}
        <div className="text-sm text-gray-500 flex items-center gap-1">
          {property.userType || "Owner"}
          {/* Add verified badge if needed */}
        </div>
      </div>
    </div>
    
    {/* Contact buttons - show based on toggle state and login status */}
    {showContactInfo && user && ownerContactInfo ? (
      <div className="space-y-4 animate-fade-in">
        {/* All contact action buttons removed */}
      </div>
    ) : null}
    
    {/* Contact Count Display - show when toggle is ON and user has viewed contacts */}
    {showContactInfo && user && contactsViewed > 0 && (
      <div className="flex flex-col items-center justify-center py-8 px-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-sm">
            <Eye className="w-4 h-4" />
            <span>{contactsViewed} contacts viewed</span>
          </div>
        </div>
      </div>
    )}
  </div>
</div>
        </div>
        
        {/* Similar Properties Section - Moved to bottom and full width */}
        <div className="mt-10 bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-xl font-bold mb-6 flex items-center">
            <Home className="text-blue-600 mr-2" size={20} />
            Similar Properties in {property.city || "this area"}
          </h2>
          
          {loadingSimilar ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : similarProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {similarProperties.map((prop: any) => (
                <div 
                  key={prop.propertyId} 
                  className="rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition-all hover:-translate-y-1"
                  onClick={() => navigate(`/property/${prop.propertyId}`)}
                >
                  <div className="relative h-48">
                    {prop.imageDetails && prop.imageDetails.length > 0 ? (
                      <img 
                        src={prop.imageDetails[0].imageUrl} 
                        alt={prop.title} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <Home className="h-10 w-10 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <Badge className={`${prop.superCategory?.toLowerCase() === 'rent' ? 'bg-blue-600' : 'bg-teal-600'}`}>
                        {prop.superCategory?.toLowerCase() === 'rent' ? 'Rent' : 'Sale'}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-lg mb-1 line-clamp-1">{prop.title}</h3>
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <MapPin className="h-3 w-3 mr-1" /> 
                      {prop.address} {prop.city ? `, ${prop.city}` : ''}
                    </div>
                    <div className="flex items-center justify-between text-sm mb-3">
                      <div className="flex items-center">
                        <div className="flex items-center mr-3">
                          <Bed className="h-3 w-3 mr-1 text-gray-500" />
                          <span>{prop.bedroom || 0}</span>
                        </div>
                        <div className="flex items-center mr-3">
                          <Bath className="h-3 w-3 mr-1 text-gray-500" />
                          <span>{prop.bathroom || 0}</span>
                        </div>
                        <div className="flex items-center">
                          <Maximize2 className="h-3 w-3 mr-1 text-gray-500" />
                          <span>{prop.area || 0} sq.ft</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-blue-600">₹{prop.price?.toLocaleString() || 0}</span>
                      <Button size="sm" variant="outline" className="text-xs">
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No similar properties found in this area.</p>
              <Button 
                className="mt-4" 
                variant="outline"
                onClick={() => navigate("/")}
              >
                Browse All Properties
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {/* Contact Form Modal */}
      <ContactForm 
        open={contactModalOpen} 
        onOpenChange={setContactModalOpen} 
        propertyTitle={property.title}
        contactType={contactType === 'whatsapp' ? 'whatsapp' : 'email'}
        contactInfo={contactType === 'whatsapp' ? (property.phone || ownerDetails.phone) : ownerDetails.email}
      />
      
      {/* Image Gallery Dialog */}
      <ImageGalleryDialog
        images={images}
        open={galleryOpen}
        onOpenChange={setGalleryOpen}
        initialIndex={activeImageIndex}
      />
    </div>
  );
};

export default PropertyDetail;

import { useState, useEffect } from "react";
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
  
  // New states for image gallery and likes
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [similarProperties, setSimilarProperties] = useState<any[]>([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);
  
  // New states for contact toggle and contact count
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [contactsViewed, setContactsViewed] = useState(0);
  
  const BASE_URL = "https://homeyatraapi.azurewebsites.net";

  useEffect(() => {
    const fetchPropertyDetails = async () => {
      setLoading(true);
      try {
        console.log("Fetching property with ID:", id);
        const response = await fetch(`${BASE_URL}/api/Account/GetPropertyDetails?propertyId=${id}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch property details: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Raw property data:", data);
        
        if (data.statusCode === 200 && data.propertyDetail) {
          const propertyData = data.propertyDetail;
          
          // Set the favorite status based on API response
          setIsFavorite(propertyData.isLiked || false);
          setProperty(propertyData);
          
          // Set likes count from API or fallback to a default
          setLikesCount(propertyData.likesCount || 0);
          
          setError(null);
          
          // Fetch similar properties after getting property details
          fetchSimilarProperties(propertyData.city, propertyData.propertyType);
        } else {
          throw new Error(data.message || 'Failed to retrieve property details');
        }
      } catch (err) {
        console.error('Error fetching property details:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        
        // Only use mock data in development
        if (process.env.NODE_ENV === 'development') {
          const mockPropertyDetail = getMockPropertyDetail(id || "");
          if (mockPropertyDetail) {
            console.log("Using mock data in development");
            setProperty(mockPropertyDetail);
            setIsFavorite(mockPropertyDetail.isLiked || false);
            setLikesCount(mockPropertyDetail.likesCount || 0);
            setError(null);
            
            // Fetch mock similar properties
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
    
    // Initialize contacts viewed count from localStorage
    const viewedContacts = localStorage.getItem('contactsViewed');
    if (viewedContacts) {
      setContactsViewed(parseInt(viewedContacts));
    }
  }, [id]);
  
  // Fetch similar properties based on location and property type
  const fetchSimilarProperties = async (city: string, propertyType: string) => {
    if (!city) return;
    
    setLoadingSimilar(true);
    try {
      // In a real implementation, you would call an API endpoint here
      // to fetch properties from the same city and with the same property type
      // This is a mock implementation
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
    // Generate 3 mock similar properties
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
      isLiked: true, // Added isLiked property
      likesCount: 42, // Added likesCount property
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
      // New fields from PostProperty
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

  // New handler for toggle switch
  const handleToggleContactInfo = (checked: boolean) => {
    setShowContactInfo(checked);
    
    if (checked) {
      // Increment the count when user toggles to view contact
      const newCount = contactsViewed + 1;
      setContactsViewed(newCount);
      
      // Store the updated count in localStorage
      localStorage.setItem('contactsViewed', newCount.toString());
      
      // Notify user
      toast({
        title: "Contact information visible",
        description: `You've viewed ${newCount} property contacts so far.`
      });
    }
  };

  const toggleFavorite = async () => {
    try {
      // Toggle the UI state immediately for better UX
      const newFavoriteState = !isFavorite;
      setIsFavorite(newFavoriteState);
      
      // Update likes count
      setLikesCount(prevCount => newFavoriteState ? prevCount + 1 : Math.max(0, prevCount - 1));
      
      // Send update to the server
      const response = await fetch(`${BASE_URL}/api/Account/UpdateProperty`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          propertyId: id,
          isLiked: newFavoriteState
        })
      });
      
      if (!response.ok) {
        // If server request fails, revert the UI
        setIsFavorite(!newFavoriteState);
        setLikesCount(prevCount => !newFavoriteState ? prevCount + 1 : Math.max(0, prevCount - 1));
        throw new Error('Failed to update favorite status');
      }
      
      toast({
        title: newFavoriteState ? "Added to favorites" : "Removed from favorites",
        description: newFavoriteState 
          ? "This property has been added to your favorites." 
          : "This property has been removed from your favorites.",
      });
      
      console.log('Property favorite status updated successfully');
    } catch (error) {
      console.error('Error updating favorite status:', error);
      toast({
        title: "Action failed",
        description: "There was an error updating your favorites. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleImageClick = (index: number) => {
    setActiveImageIndex(index);
  };
  
  // Use posted by and phone information from the property details
  const ownerDetails = {
    name: property?.postedBy || user?.name || "Property Owner",
    phone: property?.phone || user?.phone || "+91 98765 43210",
    email: user?.email || "contact@homeyatra.com",
    verified: true
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
      <div className="max-w-7xl mx-auto px-4 py-16 text-center bg-gray-50">
        <h1 className="text-3xl font-bold mb-4">Property Not Found</h1>
        <p className="mb-8 text-gray-600">{error || "The property you are looking for doesn't exist or has been removed."}</p>
        <Button className="bg-blue-600 hover:bg-blue-700 shadow-lg transition-all" onClick={() => navigate("/dashboard")}>
          <Home className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>
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

  // Get images directly without compression
  const images = property.imageDetails && property.imageDetails.length > 0 
    ? property.imageDetails 
    : [];

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen">
      {/* Fixed top navigation bar */}
      <div className="sticky top-0 z-10 bg-white shadow-md backdrop-blur-sm bg-white/90">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> 
            <span className="hidden sm:inline">Back to Dashboard</span>
            <span className="sm:hidden">Back</span>
          </Button>
          
          <div className="flex items-center gap-2">
            {/* Like/Favorite Button - WITH Counter */}
            <div className="flex items-center">
              <Button 
                variant="outline" 
                size="icon" 
                className={`rounded-full transition-all duration-300 ${isFavorite ? 'bg-red-50 border-red-200' : ''}`}
                onClick={toggleFavorite}
              >
                <Heart className={`h-4 w-4 transition-all duration-300 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
              <span className="ml-1.5 text-sm font-medium">{likesCount}</span>
            </div>
            
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full"
            >
              <Share2 className="h-4 w-4" />
            </Button>
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

        {/* Image Gallery with carousel component - MODIFIED FOR THUMBNAIL CLICK FUNCTIONALITY */}
        <div className="mb-8 bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow animate-scale-in">
          {images.length > 0 ? (
            <div className="relative">
              <Carousel 
                className="w-full" 
                selectedIndex={activeImageIndex}
                onSlideChange={setActiveImageIndex}
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
                            <Button variant="ghost" className="text-white bg-black/30 hover:bg-black/50">
                              <Maximize2 className="h-5 w-5 mr-1" />
                              View Image
                            </Button>
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
              
              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex p-4 gap-2 overflow-x-auto pb-2 bg-gray-50">
                  {images.map((image: any, index: number) => (
                    <div 
                      key={image.imageId || index}
                      className={`w-20 h-14 sm:w-24 sm:h-16 flex-shrink-0 cursor-pointer rounded-md overflow-hidden transition-all ${
                        index === activeImageIndex ? 'ring-2 ring-blue-600 transform scale-105' : 'opacity-70 hover:opacity-100'
                      }`}
                      onClick={() => handleImageClick(index)}
                    >
                      <img src={image.imageUrl} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                    </div>
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
                  <Badge variant="outline" className="border-blue-600 text-blue-700">
                    {property.bedroom || 0} BHK
                  </Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 mb-6">
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex justify-between border-b pb-3">
                      <span className="text-gray-600">Property Type</span>
                      <span className="font-medium">{property.propertyType || "Not specified"}</span>
                    </div>
                    <div className="flex justify-between border-b pb-3">
                      <span className="text-gray-600">Location</span>
                      <span className="font-medium">{property.city || ""}{property.state ? `, ${property.state}` : ""}</span>
                    </div>
                    {property.area !== undefined && (
                      <div className="flex justify-between border-b pb-3">
                        <span className="text-gray-600">Total Area</span>
                        <span className="font-medium">{property.area} sq.ft</span>
                      </div>
                    )}
                    {property.bedroom !== undefined && (
                      <div className="flex justify-between border-b pb-3">
                        <span className="text-gray-600">Bedrooms</span>
                        <span className="font-medium">{property.bedroom}</span>
                      </div>
                    )}
                    {property.bathroom !== undefined && (
                      <div className="flex justify-between border-b pb-3">
                        <span className="text-gray-600">Bathrooms</span>
                        <span className="font-medium">{property.bathroom}</span>
                      </div>
                    )}
                    {property.balcony !== undefined && (
                      <div className="flex justify-between border-b pb-3">
                        <span className="text-gray-600">Balconies</span>
                        <span className="font-medium">{property.balcony}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-b pb-3">
                      <span className="text-gray-600">Listed By</span>
                      <span className="font-medium">{property.userType || "Owner"}</span>
                    </div>
                    {/* Added from PostProperty fields */}
                    {property.preference && (
                      <div className="flex justify-between border-b pb-3">
                        <span className="text-gray-600">Tenant Preference</span>
                        <span className="font-medium">{property.preference || getPreferenceText(property.preferenceId)}</span>
                      </div>
                    )}
                    {property.availableFrom && (
                      <div className="flex justify-between border-b pb-3">
                        <span className="text-gray-600">Available From</span>
                        <span className="font-medium">{new Date(property.availableFrom).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="moreInfo" className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* New fields from PostProperty */}
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
                      <span className="text-gray-600">Likes</span>
                      <span className="font-medium flex items-center">
                        <Heart className={`h-4 w-4 mr-1 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                        {likesCount}
                      </span>
                    </div>
                    <div className="flex justify-between border-b pb-3">
                      <span className="text-gray-600">Listed Date</span>
                      <span className="font-medium">April 20, 2025</span>
                    </div>
                  </div>
                  
                  {/* Property images button */}
                  <div className="mt-6">
                    <Button 
                      variant="outline"
                      className="w-full flex items-center justify-center hover:bg-blue-50"
                      onClick={() => setGalleryOpen(true)}
                    >
                      <Image className="h-4 w-4 mr-2 text-blue-600" />
                      View All Images ({images.length})
                    </Button>
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
                {property.address}{property.city ? `, ${property.city}` : ''}{property.state ? `, ${property.state}` : ''}
              </p>
            </div>
          </div>
          
          {/* Sidebar - Contact Info */}
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
          />
          {showContactInfo ? (
            <Eye className="h-4 w-4 text-blue-600" />
          ) : (
            <EyeOff className="h-4 w-4 text-gray-400" />
          )}
        </div>
      </div>
    </div>
              
              {/* Contact info viewed counter */}
              <div className="mb-4 flex items-center justify-center bg-blue-50 py-2 px-3 rounded-md text-sm text-blue-700">
                <Eye className="h-3.5 w-3.5 mr-1.5" />
                <span>You have viewed {contactsViewed} contacts</span>
              </div>
              
              <div className="flex items-center gap-3 mb-6 bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
                <div className="bg-blue-600 rounded-full w-12 h-12 flex items-center justify-center text-white shadow-inner">
                  {property.postedBy ? property.postedBy.charAt(0).toUpperCase() : ownerDetails.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-medium">{property.postedBy || ownerDetails.name}</div>
                  <div className="text-sm text-gray-500 flex items-center gap-1">
                    {property.userType || "Owner"}
                    {ownerDetails.verified && (
                      <Shield className="h-3 w-3 text-green-600" />
                    )}
                  </div>
                </div>
                {ownerDetails.verified && (
                  <Badge variant="outline" className="ml-auto border-green-500 text-green-600">
                    <Shield className="mr-1 h-3 w-3" />
                    Verified
                  </Badge>
                )}
              </div>
              
              {/* Contact buttons - show based on toggle state */}
              {showContactInfo ? (
                <div className="space-y-4 animate-fade-in">
                  <Button
                    onClick={() => handleContactModal("whatsapp")}
                    variant="outline"
                    className="w-full justify-start hover:bg-green-50 hover:text-green-600 transition-colors"
                  >
                    <MessageSquare className="mr-2 h-5 w-5 text-green-600" /> 
                    WhatsApp Now
                  </Button>
                  
                  <Button
                    onClick={() => handleContactModal("email")} 
                    variant="outline"
                    className="w-full justify-start hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  >
                    <Mail className="mr-2 h-5 w-5 text-blue-600" /> 
                    Send Email
                  </Button>
                  
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700 transition-all shadow-md hover:shadow-lg"
                  >
                    <Phone className="mr-2 h-5 w-5" /> 
                    Call {property.phone || ownerDetails.phone}
                  </Button>
                  
                  {/* Schedule Visit Button */}
                  <div className="pt-4 border-t border-gray-200">
                    <Button
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 transition-all shadow-md hover:shadow-lg"
                    >
                      <Calendar className="mr-2 h-5 w-5" /> 
                      Schedule Visit
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 px-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  <EyeOff className="h-12 w-12 text-gray-400 mb-3" />
                  <p className="text-gray-600 text-center mb-4">Toggle the switch above to view the property owner's contact information</p>
                  <Button
                    variant="outline"
                    onClick={() => setShowContactInfo(true)}
                    className="bg-white"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Show Contact Info
                  </Button>
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
                onClick={() => navigate("/dashboard")}
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
        contactType={contactType}
        contactInfo={contactType === "whatsapp" ? (property.phone || ownerDetails.phone) : ownerDetails.email}
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

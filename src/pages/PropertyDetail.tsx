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
  ChevronLeft,
  ChevronRight,
  Wifi,
  Car,
  Wind,
  Lock,
  Droplets,
  ArrowUpDown,
  ArrowLeft,
  Home,
  Heart,
  Share2,
  Calendar
} from "lucide-react";
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious 
} from "@/components/ui/carousel";
import { ContactForm } from "@/components/ContactForm";
import { useAuth } from "@/contexts/AuthContext";

const PropertyDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [contactType, setContactType] = useState("whatsapp");
  const [isFavorite, setIsFavorite] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  
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
          setError(null);
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
            setError(null);
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

  // Mock property data for development testing only
  const getMockPropertyDetail = (propertyId) => {
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
      ]
    };
  };

  const handleContactModal = (type) => {
    setContactType(type);
    setContactModalOpen(true);
  };

  const toggleFavorite = async () => {
    try {
      // Toggle the UI state immediately for better UX
      const newFavoriteState = !isFavorite;
      setIsFavorite(newFavoriteState);
      
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
        throw new Error('Failed to update favorite status');
      }
      
      console.log('Property favorite status updated successfully');
    } catch (error) {
      console.error('Error updating favorite status:', error);
      // Could show a toast notification here
    }
  };

  // Use posted by and phone information from the property details
  const ownerDetails = {
    name: property?.postedBy || user?.name || "Property Owner",
    phone: property?.phone || user?.phone || "+91 98765 43210",
    email: user?.email || "contact@homeyatra.com",
    verified: true
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
            {/* Like/Favorite Button - No Counter */}
            <Button 
              variant="outline" 
              size="icon" 
              className={`rounded-full transition-all duration-300 ${isFavorite ? 'bg-red-50 border-red-200' : ''}`}
              onClick={toggleFavorite}
            >
              <Heart className={`h-4 w-4 transition-all duration-300 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
            
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

        {/* Image Gallery with carousel component */}
        <div className="mb-8 bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow animate-scale-in">
          {images.length > 0 ? (
            <div className="relative">
              <Carousel className="w-full" setActiveItem={setActiveImageIndex}>
                <CarouselContent>
                  {images.map((image, index) => (
                    <CarouselItem key={image.imageId || index}>
                      <div className="aspect-[16/10] overflow-hidden relative">
                        <img 
                          src={image.imageUrl} 
                          alt={`Property view ${index + 1}`} 
                          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                          loading={index === 0 ? "eager" : "lazy"}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 hover:opacity-100 transition-opacity" />
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
                  {images.map((image, index) => (
                    <div 
                      key={image.imageId || index}
                      className={`w-20 h-14 sm:w-24 sm:h-16 flex-shrink-0 cursor-pointer rounded-md overflow-hidden transition-all ${
                        index === activeImageIndex ? 'ring-2 ring-blue-600 transform scale-105' : 'opacity-70 hover:opacity-100'
                      }`}
                      onClick={() => setActiveImageIndex(index)}
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
                </TabsList>
                
                <TabsContent value="amenities" className="p-6">
                  {property.amenityDetails && property.amenityDetails.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {property.amenityDetails.map((amenity, index) => {
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
                      <span className="text-gray-600">Listed Date</span>
                      <span className="font-medium">April 20, 2025</span>
                    </div>
                    {/* Favorite status in property details tab */}
                    <div className="flex justify-between border-b pb-3">
                      <span className="text-gray-600">Favorite Status</span>
                      <span className="font-medium flex items-center">
                        {isFavorite ? (
                          <>
                            <Heart className="h-4 w-4 mr-1 fill-red-500 text-red-500" />
                            Liked
                          </>
                        ) : (
                          "Not liked"
                        )}
                      </span>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
            
            {/* Location Map Placeholder */}
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-lg font-medium mb-3 inline-flex items-center">
                <MapPin className="text-blue-600 mr-2" size={18} />
                Location
              </h3>
              <div className="bg-gray-100 rounded-lg h-[200px] flex items-center justify-center">
                <p className="text-gray-500">Map view not available</p>
              </div>
              <p className="mt-3 text-sm text-gray-600">
                {property.address}{property.city ? `, ${property.city}` : ''}{property.state ? `, ${property.state}` : ''}
              </p>
            </div>
          </div>
          
          {/* Sidebar - Contact Info */}
          <div>
            <div className="bg-white p-6 rounded-xl shadow-sm mb-6 sticky top-24 hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-medium mb-5 flex items-center border-b pb-3">
                <User className="text-blue-600 mr-2" />
                Contact {property.userType || "Owner"}
              </h3>
              
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
              
              <div className="space-y-4">
                <Button
                  onClick={() => handleContactModal("whatsapp")}
                  variant="outline"
                  className="w-full justify-start hover:bg-green-50 hover:text-green-600 transition-colors"
                >
                  <MessageSquare className="mr-2 h-5 w-5 text-green-600" /> 
                  WhatsApp Now
                </Button>
                
                {/* <Button
                  onClick={() => handleContactModal("email")} 
                  variant="outline"
                  className="w-full justify-start hover:bg-blue-50 hover:text-blue-600 transition-colors"
                >
                  <Mail className="mr-2 h-5 w-5 text-blue-600" /> 
                  Send Email
                </Button> */}
                
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 transition-all shadow-md hover:shadow-lg"
                >
                  <Phone className="mr-2 h-5 w-5" /> 
                  Call {property.phone || ownerDetails.phone}
                </Button>
              </div>
              
              {/* Schedule Visit Button */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <Button
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 transition-all shadow-md hover:shadow-lg"
                >
                  <Calendar className="mr-2 h-5 w-5" /> 
                  Schedule Visit
                </Button>
              </div>
              <div className="mt-6 pt-6 border-t border-gray-200">
              <Button
                variant="default" 
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={() => navigate("/dashboard")}
              >
                View Similar Properties
              </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <ContactForm 
        open={contactModalOpen} 
        onOpenChange={setContactModalOpen} 
        propertyTitle={property.title}
        contactType={contactType}
        contactInfo={contactType === "whatsapp" ? (property.phone || ownerDetails.phone) : ownerDetails.email}
      />
    </div>
  );
};

export default PropertyDetail;

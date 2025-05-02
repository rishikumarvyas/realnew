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
  Tv,
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
import { ContactForm } from "@/components/ContactForm";
import { useAuth } from "@/contexts/AuthContext";

// Define API response types
interface AmenityDetail {
  amenityId: string;
  amenity: string;
}

interface ImageDetail {
  imageId: string;
  imageUrl: string;
  isMainImage: boolean;
}

interface PropertyDetailResponse {
  statusCode: number;
  message: string;
  propertyDetail: {
    propertyId: string;
    superCategoryId: string;
    superCategory: string;
    propertyTypeId: string;
    propertyType: string;
    title: string;
    description: string;
    price: number;
    area: number;
    bedroom: number;
    bathroom: number;
    balcony: number;
    amenityDetails: AmenityDetail[];
    address: string;
    cityId: string;
    city: string;
    stateId: string;
    state: string;
    userTypeId: string;
    userType: string;
    imageDetails: ImageDetail[];
  };
}

const PropertyDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<PropertyDetailResponse["propertyDetail"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [contactType, setContactType] = useState<"whatsapp" | "email">("whatsapp");
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
          setProperty(data.propertyDetail);
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
  const getMockPropertyDetail = (propertyId: string) => {
    console.log("Using mock data for propertyId:", propertyId);
    return {
      propertyId: propertyId,
      superCategoryId: "123",
      superCategory: "Rent",
      propertyTypeId: "456",
      propertyType: "Apartment",
      title: "Modern 3BHK with Sea View",
      description: "Beautiful apartment with amazing sea views. Fully furnished with modern amenities.",
      price: 25000,
      area: 1500,
      bedroom: 3,
      bathroom: 2,
      balcony: 1,
      amenityDetails: [
        { amenityId: "1", amenity: "Wifi" },
        { amenityId: "2", amenity: "Parking" },
        { amenityId: "3", amenity: "Swimming Pool" },
        { amenityId: "4", amenity: "Lift" }
      ],
      address: "Marine Drive",
      cityId: "789",
      city: "Mumbai",
      stateId: "101",
      state: "Maharashtra",
      userTypeId: "112",
      userType: "Owner",
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
        }
      ]
    };
  };

  const handlePrevImage = () => {
    if (!property || !property.imageDetails?.length) return;
    setActiveImageIndex((prev) => 
      prev === 0 ? property.imageDetails.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    if (!property || !property.imageDetails?.length) return;
    setActiveImageIndex((prev) => 
      prev === property.imageDetails.length - 1 ? 0 : prev + 1
    );
  };

  const handleContactModal = (type: "whatsapp" | "email") => {
    setContactType(type);
    setContactModalOpen(true);
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  // Owner details using the user context from Dashboard
  const ownerDetails = {
    name: user?.name || "Property Owner",
    phone: user?.phone || "+91 98765 43210",
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

  // Get images safely
  const images = property.imageDetails && property.imageDetails.length > 0 
    ? property.imageDetails 
    : [];

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Fixed top navigation bar */}
      <div className="sticky top-0 z-10 bg-white shadow-md">
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
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full"
              onClick={toggleFavorite}
            >
              <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
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
        <div className="mb-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">{property.title}</h1>
            <Badge 
              variant={property.superCategory?.toLowerCase() === 'rent' ? 'outline' : 'default'}
              className={`
                px-3 py-1 text-sm font-medium
                ${property.superCategory?.toLowerCase() === 'buy' ? 'bg-blue-600' : property.superCategory?.toLowerCase() === 'sell' ? 'bg-teal-600' : ''}
              `}
            >
              {categoryLabel}
            </Badge>
          </div>
          <div className="flex items-center text-gray-600">
            <MapPin size={18} className="mr-1 flex-shrink-0 text-blue-600" />
            <span className="text-sm sm:text-base">{property.address}{property.city ? `, ${property.city}` : ''}{property.state ? `, ${property.state}` : ''}</span>
          </div>
        </div>

        {/* Image Gallery with modern look */}
        <div className="mb-8 relative bg-white rounded-xl overflow-hidden shadow-lg">
          {images.length > 0 ? (
            <>
              <div className="aspect-[16/9] overflow-hidden">
                <img 
                  src={images[activeImageIndex]?.imageUrl} 
                  alt={`Property view ${activeImageIndex + 1}`} 
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
              
              {/* Image Navigation (only show if more than 1 image) */}
              {images.length > 1 && (
                <>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full shadow-lg border-0"
                    onClick={handlePrevImage}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full shadow-lg border-0"
                    onClick={handleNextImage}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                  
                  {/* Image counter badge */}
                  <div className="absolute bottom-4 right-4 bg-black/70 text-white text-sm px-3 py-1 rounded-full">
                    {activeImageIndex + 1} / {images.length}
                  </div>
                  
                  {/* Thumbnails */}
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
                </>
              )}
            </>
          ) : (
            <div className="aspect-[16/9] bg-gray-200 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">No images available</p>
            </div>
          )}
        </div>

        {/* Property Details and Sidebar layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-6">
          {/* Main Content */}
          <div>
            {/* Basic Details */}
            <div className="bg-white p-6 rounded-xl shadow-sm mb-6 hover:shadow-md transition-shadow">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 mb-6">
                {property.price !== undefined && (
                  <div className="flex flex-col">
                    <span className="text-gray-500 text-sm">Price</span>
                    <span className="text-xl font-bold text-blue-600">
                      ₹{property.price.toLocaleString()}
                      {property.superCategory?.toLowerCase() === 'rent' ? '/month' : ''}
                    </span>
                  </div>
                )}
                {property.bedroom !== undefined && (
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-50 p-2 rounded-lg">
                      <Bed className="text-blue-600" size={20} />
                    </div>
                    <div>
                      <span className="block font-medium">{property.bedroom}</span>
                      <span className="text-gray-500 text-sm">Bedrooms</span>
                    </div>
                  </div>
                )}
                {property.bathroom !== undefined && (
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-50 p-2 rounded-lg">
                      <Bath className="text-blue-600" size={20} />
                    </div>
                    <div>
                      <span className="block font-medium">{property.bathroom}</span>
                      <span className="text-gray-500 text-sm">Bathrooms</span>
                    </div>
                  </div>
                )}
                {property.area !== undefined && (
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-50 p-2 rounded-lg">
                      <Maximize2 className="text-blue-600" size={20} />
                    </div>
                    <div>
                      <span className="block font-medium">{property.area}</span>
                      <span className="text-gray-500 text-sm">sq.ft Area</span>
                    </div>
                  </div>
                )}
                {property.balcony !== undefined && (
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-50 p-2 rounded-lg text-blue-600 font-bold">
                      B
                    </div>
                    <div>
                      <span className="block font-medium">{property.balcony}</span>
                      <span className="text-gray-500 text-sm">Balconies</span>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <div className="bg-blue-50 p-2 rounded-lg">
                    <User className="text-blue-600" size={20} />
                  </div>
                  <div>
                    <span className="block font-medium">{property.userType || "Owner"}</span>
                    <span className="text-gray-500 text-sm">Listed By</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-3 flex items-center">
                  <span className="inline-block w-4 h-4 bg-blue-600 rounded-full mr-2"></span>
                  Description
                </h3>
                <p className="text-gray-600 leading-relaxed">{property.description || "No description provided"}</p>
              </div>
            </div>
            
            {/* Tabbed Details */}
            <div className="bg-white rounded-xl shadow-sm mb-8 overflow-hidden hover:shadow-md transition-shadow">
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {property.amenityDetails.map((amenity, index) => {
                        let icon = null;
                        
                        if (amenity.amenity.includes("Lift")) icon = <ArrowUpDown className="text-blue-600" size={18} />;
                        else if (amenity.amenity.includes("Swimming Pool")) icon = <Droplets className="text-blue-600" size={18} />;
                        else if (amenity.amenity.includes("Wifi")) icon = <Wifi className="text-blue-600" size={18} />;
                        else if (amenity.amenity.includes("Parking")) icon = <Car className="text-blue-600" size={18} />;
                        else if (amenity.amenity.includes("TV")) icon = <Tv className="text-blue-600" size={18} />;
                        else if (amenity.amenity.includes("Air")) icon = <Wind className="text-blue-600" size={18} />;
                        else if (amenity.amenity.includes("Security")) icon = <Lock className="text-blue-600" size={18} />;
                        else icon = <div className="w-2 h-2 rounded-full bg-blue-600 mt-2"></div>;
                        
                        return (
                          <div 
                            key={amenity.amenityId || index} 
                            className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg hover:bg-blue-50 transition-colors"
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
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
          
          {/* Sidebar - Contact Info */}
          <div>
            <div className="bg-white p-6 rounded-xl shadow-sm mb-6 sticky top-24">
              <h3 className="text-lg font-medium mb-5 flex items-center">
                <User className="text-blue-600 mr-2" />
                Contact {property.userType || "Owner"}
              </h3>
              
              <div className="flex items-center gap-3 mb-6 bg-gray-50 p-4 rounded-lg">
                <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center text-blue-600">
                  {ownerDetails.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-medium">{ownerDetails.name}</div>
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
                  Call {ownerDetails.phone}
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
            </div>
            
            {/* Similar Properties Teaser */}
            <div className="bg-blue-50 p-5 rounded-xl shadow-sm">
              <h3 className="text-md font-medium mb-3 text-blue-800">Similar Properties</h3>
              <p className="text-sm text-gray-600 mb-4">Explore more properties like this one in {property.city || "this area"}.</p>
              <Button
                variant="outline" 
                className="w-full border-blue-600 text-blue-600 hover:bg-blue-100"
                onClick={() => navigate("/dashboard")}
              >
                View Similar Properties
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <ContactForm 
        open={contactModalOpen} 
        onOpenChange={setContactModalOpen} 
        propertyTitle={property.title}
        contactType={contactType}
        contactInfo={contactType === "whatsapp" ? ownerDetails.phone : ownerDetails.email}
      />
    </div>
  );
};

export default PropertyDetail;
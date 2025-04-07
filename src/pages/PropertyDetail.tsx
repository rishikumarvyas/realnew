
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
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
  Droplets // Replacing Pool with Droplets for water-related amenities
} from "lucide-react";
import { ContactForm } from "@/components/ContactForm";
import { PropertyCardProps } from "@/components/PropertyCard";

// Mock property data
const mockProperty = {
  id: "prop1",
  title: "Modern 3BHK with Sea View",
  description: "This luxurious 3BHK apartment offers stunning sea views from every room. Located in a premium residential complex with world-class amenities including swimming pool, gym, and landscaped gardens. Perfect for families looking for a modern lifestyle in the heart of the city.",
  price: 7500000,
  location: "Bandra West, Mumbai",
  type: "buy",
  bedrooms: 3,
  bathrooms: 3,
  area: 1450,
  images: [
    "https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1466442929976-97f336a657be?auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1721322800607-8c38375eef04?auto=format&fit=crop&q=80",
  ],
  amenities: [
    "Swimming Pool",
    "Gym",
    "24x7 Security",
    "Power Backup",
    "Parking",
    "WiFi",
    "Air Conditioning",
  ],
  ownerDetails: {
    name: "Rahul Sharma",
    type: "Owner",
    phone: "+91 98765 43210",
    email: "rahul@example.com",
    verified: true,
  },
  additionalDetails: {
    furnished: "Semi-Furnished",
    facing: "East",
    floorNo: 7,
    totalFloors: 15,
    carParking: 1,
    balconies: 2,
    waterSupply: "24x7",
    ownership: "Freehold",
    constructionYear: 2019,
  }
};

// Simulate other similar properties
const similarProperties: PropertyCardProps[] = [
  {
    id: "prop2",
    title: "Luxury 4BHK Penthouse",
    price: 12500000,
    location: "Worli, Mumbai",
    type: "buy",
    bedrooms: 4,
    bathrooms: 4,
    area: 2100,
    image: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?auto=format&fit=crop&q=80"
  },
  {
    id: "prop4",
    title: "Spacious 2BHK Apartment",
    price: 5600000,
    location: "Powai, Mumbai",
    type: "buy",
    bedrooms: 2,
    bathrooms: 2,
    area: 1050,
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80"
  },
];

const PropertyDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<typeof mockProperty | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [contactType, setContactType] = useState<"whatsapp" | "email">("whatsapp");

  useEffect(() => {
    // Simulate API fetch
    setTimeout(() => {
      setProperty(mockProperty);
      setLoading(false);
    }, 800);
  }, [id]);

  const handlePrevImage = () => {
    setActiveImageIndex((prev) => 
      prev === 0 ? property!.images.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setActiveImageIndex((prev) => 
      prev === property!.images.length - 1 ? 0 : prev + 1
    );
  };

  const handleContactModal = (type: "whatsapp" | "email") => {
    setContactType(type);
    setContactModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-pulse text-xl">Loading property details...</div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Property Not Found</h1>
        <p className="mb-8">The property you are looking for doesn't exist or has been removed.</p>
        <Button onClick={() => window.history.back()}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-bold">{property.title}</h1>
          <Badge 
            variant={property.type === 'rent' ? 'outline' : 'default'}
            className={`
              px-3 py-1 text-sm
              ${property.type === 'buy' ? 'bg-real-blue' : property.type === 'sell' ? 'bg-real-teal' : ''}
            `}
          >
            {property.type === 'buy' ? 'For Sale' : property.type === 'rent' ? 'For Rent' : 'Selling'}
          </Badge>
        </div>
        <div className="flex items-center mt-2 text-gray-600">
          <MapPin size={18} className="mr-1" />
          <span>{property.location}</span>
        </div>
      </div>

      {/* Image Gallery */}
      <div className="mb-8 relative">
        <div className="aspect-[16/9] overflow-hidden rounded-lg">
          <img 
            src={property.images[activeImageIndex]} 
            alt={`Property view ${activeImageIndex + 1}`} 
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Image Navigation */}
        <Button 
          variant="outline" 
          size="icon" 
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
          onClick={handlePrevImage}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        
        <Button 
          variant="outline" 
          size="icon" 
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
          onClick={handleNextImage}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
        
        {/* Thumbnails */}
        <div className="flex mt-4 gap-2 overflow-x-auto scrollbar-hide pb-2">
          {property.images.map((image, index) => (
            <div 
              key={index}
              className={`w-24 h-16 flex-shrink-0 cursor-pointer rounded-md overflow-hidden ${
                index === activeImageIndex ? 'ring-2 ring-real-blue' : ''
              }`}
              onClick={() => setActiveImageIndex(index)}
            >
              <img src={image} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      </div>

      {/* Property Details and Sidebar layout */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_350px] gap-8">
        {/* Main Content */}
        <div>
          {/* Basic Details */}
          <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 mb-6">
              <div className="flex flex-col">
                <span className="text-gray-500 text-sm">Price</span>
                <span className="text-xl font-bold text-real-blue">
                  ₹{property.price.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Bed className="text-gray-400" size={20} />
                <div>
                  <span className="block font-medium">{property.bedrooms}</span>
                  <span className="text-gray-500 text-sm">Bedrooms</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Bath className="text-gray-400" size={20} />
                <div>
                  <span className="block font-medium">{property.bathrooms}</span>
                  <span className="text-gray-500 text-sm">Bathrooms</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Maximize2 className="text-gray-400" size={20} />
                <div>
                  <span className="block font-medium">{property.area}</span>
                  <span className="text-gray-500 text-sm">sq.ft Area</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <User className="text-gray-400" size={20} />
                <div>
                  <span className="block font-medium">{property.ownerDetails.type}</span>
                  <span className="text-gray-500 text-sm">Listed By</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="text-gray-400" size={20} />
                <div>
                  <span className="block font-medium">{property.ownerDetails.verified ? "Yes" : "No"}</span>
                  <span className="text-gray-500 text-sm">Verified</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-3">Description</h3>
              <p className="text-gray-600">{property.description}</p>
            </div>
          </div>
          
          {/* Tabbed Details */}
          <div className="bg-white rounded-lg shadow-sm mb-8">
            <Tabs defaultValue="amenities">
              <TabsList className="w-full border-b rounded-t-lg rounded-b-none p-0">
                <TabsTrigger value="amenities" className="flex-1 rounded-none py-3">Amenities</TabsTrigger>
                <TabsTrigger value="details" className="flex-1 rounded-none py-3">Additional Details</TabsTrigger>
              </TabsList>
              
              <TabsContent value="amenities" className="p-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {property.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center gap-2">
                      {amenity.includes("WiFi") && <Wifi className="text-real-blue" size={18} />}
                      {amenity.includes("Parking") && <Car className="text-real-blue" size={18} />}
                      {amenity.includes("Pool") && <Droplets className="text-real-blue" size={18} />}
                      {amenity.includes("TV") && <Tv className="text-real-blue" size={18} />}
                      {amenity.includes("Air") && <Wind className="text-real-blue" size={18} />}
                      {amenity.includes("Security") && <Lock className="text-real-blue" size={18} />}
                      {!amenity.includes("WiFi") && 
                       !amenity.includes("Parking") && 
                       !amenity.includes("Pool") && 
                       !amenity.includes("TV") && 
                       !amenity.includes("Air") && 
                       !amenity.includes("Security") && (
                        <div className="w-4 h-4 rounded-full bg-real-blue"></div>
                      )}
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="details" className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.entries(property.additionalDetails).map(([key, value]) => (
                    <div key={key} className="flex justify-between border-b pb-2">
                      <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                      <span className="font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
        
        {/* Sidebar - Contact Info */}
        <div>
          <div className="bg-white p-6 rounded-lg shadow-sm mb-6 sticky top-24">
            <h3 className="text-lg font-medium mb-4">Contact {property.ownerDetails.name}</h3>
            
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-gray-100 rounded-full w-10 h-10 flex items-center justify-center">
                <User className="text-gray-600" />
              </div>
              <div>
                <div className="font-medium">{property.ownerDetails.name}</div>
                <div className="text-sm text-gray-500">{property.ownerDetails.type}</div>
              </div>
              {property.ownerDetails.verified && (
                <Badge variant="outline" className="ml-auto border-green-500 text-green-600">
                  <Shield className="mr-1 h-3 w-3" />
                  Verified
                </Badge>
              )}
            </div>
            
            <div className="space-y-3">
              <Button
                onClick={() => handleContactModal("whatsapp")}
                variant="outline"
                className="w-full justify-start"
              >
                <MessageSquare className="mr-2 h-4 w-4 text-green-600" /> WhatsApp
              </Button>
              
              <Button
                onClick={() => handleContactModal("email")} 
                variant="outline"
                className="w-full justify-start"
              >
                <Mail className="mr-2 h-4 w-4 text-real-blue" /> Email
              </Button>
              
              <Button
                className="w-full bg-real-blue hover:bg-blue-600"
              >
                <Phone className="mr-2 h-4 w-4" /> {property.ownerDetails.phone}
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
        contactInfo={contactType === "whatsapp" ? property.ownerDetails.phone : property.ownerDetails.email}
      />
    </div>
  );
};

export default PropertyDetail;

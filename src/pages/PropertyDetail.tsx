
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from '@/components/ui/carousel';
import { Bed, Bath, Ruler, MapPin, Phone, Mail, Check, Calendar, Heart } from 'lucide-react';
import PropertyCard from '@/components/properties/PropertyCard';
import { buyProperties, rentProperties } from '@/data/properties';
import { PropertyType } from '@/components/properties/PropertyCard';

const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactMethod, setContactMethod] = useState<'email' | 'whatsapp' | null>(null);
  const [message, setMessage] = useState('');
  
  // Find property from our data
  const allProperties = [...buyProperties, ...rentProperties];
  const property = allProperties.find((prop) => prop.id === id);
  
  // Get similar properties (same type, exclude current property)
  const similarProperties = property 
    ? allProperties
        .filter(p => p.type === property.type && p.id !== property.id)
        .slice(0, 4) 
    : [];
  
  if (!property) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Property Not Found</h2>
            <Button onClick={() => navigate(-1)}>Go Back</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  // Helper function to get location as string
  const getLocationString = (location: string | { address: string; city: string; state: string; zip: string; }): string => {
    if (typeof location === 'string') {
      return location;
    }
    return location.address;
  };
  
  const amenities = [
    { id: 'parking', name: 'Parking', available: true },
    { id: 'garden', name: 'Garden', available: property.type === 'buy' },
    { id: 'pool', name: 'Swimming Pool', available: property.id === '1' || property.id === '3' },
    { id: 'security', name: 'Security System', available: true },
    { id: 'ac', name: 'Air Conditioning', available: true },
    { id: 'heating', name: 'Heating', available: property.type === 'buy' },
    { id: 'gym', name: 'Gym', available: property.id === '2' || property.id === '11' },
    { id: 'elevator', name: 'Elevator', available: property.type === 'rent' },
  ];
  
  const handleContactClick = (method: 'email' | 'whatsapp') => {
    setContactMethod(method);
    setShowContactModal(true);
  };
  
  const handleSubmitMessage = () => {
    // Here you would integrate with your backend to send the message
    alert(`Your message has been sent via ${contactMethod}!`);
    setShowContactModal(false);
    setMessage('');
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Back Button */}
          <div className="mb-6">
            <Button 
              variant="outline" 
              onClick={() => navigate(-1)}
              className="flex items-center gap-2"
            >
              Back to Listings
            </Button>
          </div>
          
          {/* Property Title Section */}
          <div className="mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold mb-2">{property.title}</h1>
                <div className="flex items-center text-gray-600 mb-2">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>{getLocationString(property.location)}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-realestate-blue mb-2">
                  ${property.price.toLocaleString()}
                  {property.type === 'rent' && <span className="text-base font-normal text-gray-500">/month</span>}
                </div>
                <div className="flex gap-2 justify-end">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="rounded-full"
                  >
                    <Heart className="h-5 w-5" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="rounded-full"
                  >
                    <Calendar className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Image Gallery */}
          <div className="mb-10">
            <Carousel className="relative">
              <CarouselContent>
                {/* Main Property Image */}
                <CarouselItem>
                  <div className="h-[500px] w-full overflow-hidden rounded-lg">
                    <img 
                      src={property.image || (property.images && property.images.length > 0 ? property.images[0] : '')} 
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </CarouselItem>
                
                {/* Additional images would be added here in a real app */}
                <CarouselItem>
                  <div className="h-[500px] w-full overflow-hidden rounded-lg bg-gray-200 flex items-center justify-center">
                    <p className="text-gray-500">Additional image would be here</p>
                  </div>
                </CarouselItem>
                <CarouselItem>
                  <div className="h-[500px] w-full overflow-hidden rounded-lg bg-gray-200 flex items-center justify-center">
                    <p className="text-gray-500">Additional image would be here</p>
                  </div>
                </CarouselItem>
              </CarouselContent>
              <CarouselPrevious className="left-2" />
              <CarouselNext className="right-2" />
            </Carousel>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Property Details */}
            <div className="lg:col-span-2 space-y-8">
              {/* Key Details */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Property Details</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg">
                      <Bed className="h-6 w-6 text-realestate-blue mb-2" />
                      <span className="text-sm text-gray-500">Bedrooms</span>
                      <span className="font-semibold">{property.bedrooms}</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg">
                      <Bath className="h-6 w-6 text-realestate-blue mb-2" />
                      <span className="text-sm text-gray-500">Bathrooms</span>
                      <span className="font-semibold">{property.bathrooms}</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg">
                      <Ruler className="h-6 w-6 text-realestate-blue mb-2" />
                      <span className="text-sm text-gray-500">Area</span>
                      <span className="font-semibold">{property.area} sq ft</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg">
                      <MapPin className="h-6 w-6 text-realestate-blue mb-2" />
                      <span className="text-sm text-gray-500">Type</span>
                      <span className="font-semibold capitalize">{property.type}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Description */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Description</h2>
                  <p className="text-gray-600">
                    {property.title} is a {property.bedrooms} bedroom, {property.bathrooms} bathroom property located in {getLocationString(property.location)}. 
                    This {property.type === 'buy' ? 'property for sale' : 'rental property'} offers {property.area} square feet of living space.
                  </p>
                  <p className="text-gray-600 mt-4">
                    {property.description || "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam eget felis lobortis, tincidunt justo at, tempor libero. Suspendisse potenti. Nullam consectetur eros vel odio maximus, id pellentesque nunc finibus. Aenean eu nisi id metus ultrices convallis."}
                  </p>
                </CardContent>
              </Card>
              
              {/* Amenities */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Amenities</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {amenities.map(amenity => (
                      <div 
                        key={amenity.id} 
                        className={`flex items-center gap-2 ${!amenity.available && 'text-gray-400'}`}
                      >
                        {amenity.available ? (
                          <Check className="h-5 w-5 text-green-500" />
                        ) : (
                          <span className="h-5 w-5 border border-gray-300 rounded-full"></span>
                        )}
                        <span>{amenity.name}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              {/* Location Map */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Location</h2>
                  <div className="bg-gray-200 rounded-lg h-64 flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <MapPin className="h-8 w-8 mx-auto mb-2" />
                      <p>Map view would be displayed here</p>
                      <p className="text-sm mt-1">{getLocationString(property.location)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact Card */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
                  <div className="mb-4">
                    <div className="flex items-center mb-2">
                      <span className="font-semibold mr-2">Owner:</span>
                      <span>John Doe</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <span>Available since May 2023</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <Button 
                      onClick={() => handleContactClick('whatsapp')}
                      className="w-full bg-green-500 hover:bg-green-600"
                    >
                      <Phone className="mr-2 h-4 w-4" /> WhatsApp
                    </Button>
                    
                    <Button 
                      onClick={() => handleContactClick('email')}
                      className="w-full"
                      variant="outline"
                    >
                      <Mail className="mr-2 h-4 w-4" /> Email
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              {/* Schedule Visit Card */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Schedule a Visit</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Choose a day for your visit and we'll arrange a time with the owner
                  </p>
                  <Button className="w-full">
                    <Calendar className="mr-2 h-4 w-4" /> Schedule Visit
                  </Button>
                </CardContent>
              </Card>
              
              {/* Mortgage Calculator Card - For Buy Properties */}
              {property.type === 'buy' && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Mortgage Calculator</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Property Price:</span>
                        <span className="font-semibold">${property.price.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Down Payment (20%):</span>
                        <span className="font-semibold">${(property.price * 0.2).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Loan Amount:</span>
                        <span className="font-semibold">${(property.price * 0.8).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Monthly Payment:</span>
                        <span className="font-semibold">${Math.round(property.price * 0.8 * 0.005).toLocaleString()}/mo</span>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full mt-4">
                      Full Calculator
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
          
          {/* Similar Properties */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Similar Properties</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {similarProperties.map((prop) => (
                <PropertyCard key={prop.id} property={prop} />
              ))}
            </div>
          </div>
        </div>
      </main>
      
      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-4">
                Contact via {contactMethod === 'email' ? 'Email' : 'WhatsApp'}
              </h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1" htmlFor="message">
                  Your Message
                </label>
                <textarea
                  id="message"
                  rows={5}
                  className="w-full p-2 border rounded-md"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={`Hi, I'm interested in ${property.title}...`}
                ></textarea>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowContactModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmitMessage}>
                  Send Message
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      <Footer />
    </div>
  );
};

export default PropertyDetail;

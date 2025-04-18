import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PropertyCard, PropertyCardProps } from "@/components/PropertyCard";
import { Testimonial } from "@/components/Testimonial";
import { StatCard } from "@/components/StatCard";
import { 
  Search, 
  ArrowRight, 
  Building, 
  Home, 
  MapPin, 
  TrendingUp, 
  Star, 
  CheckCircle, 
  Clock, 
  HeartHandshake,
  IndianRupee,
  Key,
  Users
} from "lucide-react";

// Mock data for featured properties
const featuredProperties: PropertyCardProps[] = [
  {
    id: "prop1",
    title: "Modern 3BHK with Sea View",
    price: 7500000,
    location: "Bandra West, Mumbai",
    type: "buy",
    bedrooms: 3,
    bathrooms: 3,
    area: 1450,
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80"
  },
  {
    id: "prop2",
    title: "Luxury 4BHK Penthouse",
    price: 12500000,
    location: "Worli, Mumbai",
    type: "buy",
    bedrooms: 4,
    bathrooms: 4,
    area: 2100,
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80"
  },
  {
    id: "prop3",
    title: "Studio Apartment with Balcony",
    price: 35000,
    location: "Koramangala, Bangalore",
    type: "rent",
    bedrooms: 1,
    bathrooms: 1,
    area: 650,
    image: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80"
  },
];

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/properties?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section with centered content */}
      <section className="relative h-screen bg-slate-700 text-white flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: "url('https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80')", 
            opacity: 0.5
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-700/80 via-slate-700/70 to-slate-700/90"></div>
        
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 z-10 w-full py-16 text-center">
          <div className="animate-fade-in">
            <div className="flex items-center justify-center mb-8">
              <div className="p-3 bg-white rounded-full mr-4">
                <Home className="h-12 w-12 text-blue-600" />
              </div>
              <h1 className="text-5xl font-bold tracking-tight">HOME<span className="text-gray-300">YATRA</span></h1>
            </div>
            
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-8 tracking-tight">
              <span className="text-white">Find Your </span>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
                Dream Home
              </span>
            </h2>
            
            <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto text-gray-200">
              Discover the perfect place to call home with our exclusive selection of premium properties across India.
            </p>
            
            <form onSubmit={handleSearch} className="mt-10 relative max-w-3xl mx-auto">
              <div className="relative flex shadow-2xl">
                <div className="absolute inset-y-0 left-0 flex items-center pl-5 pointer-events-none">
                  <Search className="h-6 w-6 text-gray-600" />
                </div>
                <Input
                  type="text"
                  className="block w-full rounded-full pl-14 pr-32 py-6 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                  placeholder="Search by location, property type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button 
                  type="submit" 
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 rounded-full py-5 px-8 text-lg shadow-lg"
                >
                  Search
                </Button>
              </div>
            </form>
            
            <div className="mt-14 flex flex-wrap gap-6 justify-center">
              <Button 
                variant="outline" 
                size="lg"
                className="bg-white/5 backdrop-blur-md border-white/20 hover:bg-white/10 text-lg group transition-all duration-300 px-10 py-6 rounded-full"
                onClick={() => navigate('/properties?type=buy')}
              >
                <Home className="h-5 w-5 mr-3 group-hover:text-white" />
                Buy Properties
              </Button>
              <Button 
                variant="outline"
                size="lg"
                className="bg-white/5 backdrop-blur-md border-white/20 hover:bg-white/10 text-lg group transition-all duration-300 px-10 py-6 rounded-full"
                onClick={() => navigate('/properties?type=rent')}
              >
                <MapPin className="h-5 w-5 mr-3 group-hover:text-white" />
                Rent Properties
              </Button>
              <Button 
                variant="outline"
                size="lg"
                className="bg-white/5 backdrop-blur-md border-white/20 hover:bg-white/10 text-lg group transition-all duration-300 px-10 py-6 rounded-full"
                onClick={() => navigate('/properties?type=sell')}
              >
                <TrendingUp className="h-5 w-5 mr-3 group-hover:text-white" />
                Sell Your Property
              </Button>
            </div>
          </div>
        </div>
        
        {/* Hero section diagonal cut */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-white transform -skew-y-2 translate-y-10"></div>
      </section>

      {/* Stats Section */}
      <section className="bg-white text-gray-800 py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatCard 
              value="12,000+" 
              label="Properties Listed" 
              icon={<Building className="w-12 h-12 text-blue-600" />} 
            />
            <StatCard 
              value="10,000+" 
              label="Happy Customers" 
              icon={<HeartHandshake className="w-12 h-12 text-blue-600" />} 
            />
            <StatCard 
              value="500+" 
              label="Cities Covered" 
              icon={<MapPin className="w-12 h-12 text-blue-600" />} 
            />
            <StatCard 
              value="98%" 
              label="Customer Satisfaction" 
              icon={<CheckCircle className="w-12 h-12 text-blue-600" />} 
            />
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-gray-100">
        <div className="text-center mb-16">
          <p className="text-blue-600 font-semibold uppercase tracking-wider mb-2">Why Choose Homeyatra</p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800">Our Commitment To You</h2>
          <div className="w-24 h-1 bg-blue-600 mx-auto mt-4"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-6 bg-blue-600 rounded-full text-white group-hover:scale-110 transition-transform duration-300">
              <CheckCircle className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold mb-4">Verified Properties</h3>
            <p className="text-gray-600">
              Every property is thoroughly verified by our team to ensure authenticity and transparency.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-6 bg-blue-600 rounded-full text-white group-hover:scale-110 transition-transform duration-300">
              <Clock className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold mb-4">Fast Processing</h3>
            <p className="text-gray-600">
              Our streamlined process ensures you can find, buy, or rent properties with minimal delay.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-6 bg-blue-600 rounded-full text-white group-hover:scale-110 transition-transform duration-300">
              <HeartHandshake className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold mb-4">Expert Guidance</h3>
            <p className="text-gray-600">
              Our experienced team provides end-to-end assistance throughout your property journey.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Properties Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:justify-between items-center mb-16">
          <div className="text-center md:text-left mb-8 md:mb-0">
            <p className="text-blue-600 font-semibold uppercase tracking-wider mb-2">EXCLUSIVE LISTINGS</p>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-800">Featured Properties</h2>
            <div className="w-24 h-1 bg-blue-600 mt-4 md:mx-0 mx-auto"></div>
          </div>
          <Button 
            variant="outline" 
            onClick={() => navigate('/properties')}
            className="flex items-center gap-1 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white group px-6 py-3 rounded-full"
          >
            View All Properties <ArrowRight className="h-4 w-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" />
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredProperties.map((property) => (
            <PropertyCard key={property.id} {...property} />
          ))}
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="bg-blue-700 py-24 relative">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
             style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80')" }}>
        </div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-16 border border-white/20">
            <div className="inline-flex items-center justify-center w-20 h-20 mb-8 bg-white rounded-full text-blue-700">
              <Building className="w-10 h-10" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">Ready to post your property?</h2>
            <p className="text-xl mb-10 text-gray-100 max-w-2xl mx-auto">
              List your property with Homeyatra and reach thousands of potential buyers and renters all across India.
            </p>
            <Button 
              size="lg" 
              onClick={() => navigate('/post-property')}
              className="bg-white text-blue-700 hover:bg-gray-100 px-10 py-6 text-lg font-semibold shadow-xl rounded-full"
            >
              Post Your Property
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-white">
        <div className="text-center mb-16">
          <p className="text-blue-600 font-semibold uppercase tracking-wider mb-2">WHAT CLIENTS SAY</p>
          <h2 className="text-3xl md:text-5xl font-bold text-gray-800">Customer Testimonials</h2>
          <div className="w-24 h-1 bg-blue-600 mx-auto mt-4"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              name: "Ananya Sharma",
              location: "Mumbai",
              quote: "Homeyatra helped me find my dream apartment in just a week! The process was smooth and hassle-free.",
              avatar: "/api/placeholder/100/100"
            },
            {
              name: "Rajesh Patel",
              location: "Bangalore",
              quote: "I sold my property through Homeyatra and got a great deal. Their team is professional and responsive.",
              avatar: "/api/placeholder/100/100"
            },
            {
              name: "Priya Mehta",
              location: "Delhi",
              quote: "As a first-time home buyer, I was nervous. Homeyatra guided me through every step of the process with patience.",
              avatar: "/api/placeholder/100/100"
            }
          ].map((testimonial, index) => (
            <Testimonial key={index} {...testimonial} />
          ))}
        </div>
      </section>

      {/* App Download Section */}
      <section className="py-24 bg-gray-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-10 md:mb-0 md:pr-10">
              <h2 className="text-4xl font-bold mb-6">Download Our Mobile App</h2>
              <p className="text-xl mb-8 text-gray-200">
                Take Homeyatra with you everywhere. Search properties, get notifications, and connect with agents on the go.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button className="bg-white text-gray-800 hover:bg-gray-200 px-6 py-3 rounded-xl flex items-center">
                  <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.9 19.9l-5.4-2.9c-0.4-0.2-0.6-0.6-0.6-1v-8c0-0.4 0.2-0.8 0.6-1l5.4-2.9c0.4-0.2 0.9-0.2 1.2 0s0.6 0.6 0.6 1v12.8c0 0.4-0.2 0.8-0.6 1s-0.8 0.2-1.2 0z"/>
                    <path d="M2.5 4.1l7.4 5.9v3.8l-7.4 5.9c-0.4 0.3-0.9 0.3-1.2 0.1s-0.5-0.6-0.5-1V5c0-0.4 0.2-0.8 0.5-1s0.8-0.2 1.2 0.1z"/>
                    <path d="M2.5 19.8l7.4-5.9v-3.8l-7.4-5.9c-0.4-0.3-0.5-0.8-0.3-1.2s0.7-0.6 1.1-0.4l12.4 8.2c0.3 0.2 0.5 0.6 0.5 0.9s-0.2 0.7-0.5 0.9l-12.4 8.2c-0.4 0.3-1 0.2-1.2-0.2s-0.1-0.8 0.3-1.1v0.3z"/>
                  </svg>
                  Play Store
                </Button>
                <Button className="bg-white text-gray-800 hover:bg-gray-200 px-6 py-3 rounded-xl flex items-center">
                  <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  App Store
                </Button>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <img src="/api/placeholder/300/600" alt="Homeyatra Mobile App" className="max-w-full h-auto rounded-2xl shadow-2xl" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
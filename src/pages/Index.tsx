import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PropertyCard, PropertyCardProps } from "@/components/PropertyCard";
import { Testimonial } from "@/components/Testimonial";
import { StatCard } from "@/components/StatCard";
import AllProperty from "./AllProperty";
import { useAuth } from "@/contexts/AuthContext";
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
  Users,
  ChevronLeft,
  ChevronRight,
  Map,
  Store
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
  {
    id: "prop4",
    title: "Spacious Villa with Garden",
    price: 18500000,
    location: "Juhu, Mumbai",
    type: "buy",
    bedrooms: 5,
    bathrooms: 4,
    area: 3200,
    image: "https://images.unsplash.com/photo-1613977257365-aaae5a9817ff?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80"
  },
  {
    id: "prop5",
    title: "Modern 2BHK Apartment",
    price: 45000,
    location: "HSR Layout, Bangalore",
    type: "rent",
    bedrooms: 2,
    bathrooms: 2,
    area: 1100,
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80"
  },
];

// Slider images for hero section
const sliderImages = [
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80",
  "https://images.unsplash.com/photo-1613977257365-aaae5a9817ff?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80",
];

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();
  const { isAuthenticated, openLoginModal } = useAuth();

  // Auto-advance slider every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === sliderImages.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === sliderImages.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? sliderImages.length - 1 : prev - 1));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/properties?search=${encodeURIComponent(searchTerm)}`);
    }
  };


  // Fetch suggestions
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm.trim().length > 1) {
        axios
          .get(`https://homeyatraapi.azurewebsites.net/api/account/suggestions?term=${encodeURIComponent(searchTerm)}`)
          .then((res) => {
            setSuggestions(res.data);
            setShowSuggestions(true);
          })
          .catch((err) => {
            console.error("Suggestion error:", err);
            setSuggestions([]);
          });
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300); // debounce 300ms

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleSuggestionClick = (suggestion: string) => {
    setSearchTerm(suggestion);
    setShowSuggestions(false);
    navigate(`/properties?search=${encodeURIComponent(suggestion)}`);
  };

  const handlePostPropertyClick = () => {
    if (isAuthenticated) {
      navigate('/post-property');
    } else {
      openLoginModal();
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
    {/* Hero Section with Slider - Optimized for mobile */}
    <section className="relative h-screen sm:h-screen overflow-hidden">
      {/* Slider with clearer images */}
      <div className="absolute inset-0 z-0">
        {sliderImages.map((image, index) => (
          <div 
            key={index}
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
            style={{ backgroundImage: `url(${image})` }}
          />
        ))}
        {/* Light overlay for text readability */}
        <div className="absolute inset-0 bg-black/10"></div>
      </div>
      
      {/* Slider Controls - Smaller for mobile */}
      <button 
        onClick={prevSlide} 
        className="absolute left-2 sm:left-4 top-1/2 z-20 -translate-y-1/2 bg-black/20 hover:bg-black/40 rounded-full p-2 sm:p-3 transition-all duration-300"
      >
        <ChevronLeft className="h-5 w-5 sm:h-8 sm:w-8 text-white" />
      </button>
      <button 
        onClick={nextSlide} 
        className="absolute right-2 sm:right-4 top-1/2 z-20 -translate-y-1/2 bg-black/20 hover:bg-black/40 rounded-full p-2 sm:p-3 transition-all duration-300"
      >
        <ChevronRight className="h-5 w-5 sm:h-8 sm:w-8 text-white" />
      </button>
      
      {/* Slide Indicators - Smaller for mobile */}
      <div className="absolute bottom-4 sm:bottom-20 left-0 right-0 flex justify-center z-20 gap-1 sm:gap-2">
        {sliderImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
              index === currentSlide ? "bg-white w-6 sm:w-8" : "bg-white/70"
            }`}
          />
        ))}
      </div>
      
      {/* Hero Content - Responsive padding and sizing */}
      <div className="relative max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 z-10 h-full flex flex-col justify-center items-center">
        <div className="animate-fade-in text-center w-full">
          <div className="bg-white/70 backdrop-blur-sm p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl shadow-lg mx-4 sm:mx-auto">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 sm:mb-6 tracking-tight text-black">
              <span>Find Your </span>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-400">
                Dream Home
              </span>
            </h2>
            
            <form onSubmit={handleSearch} className="mt-4 sm:mt-6 relative mx-auto">
            <div className="relative flex shadow-xl">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 sm:pl-4 pointer-events-none">
                <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
              </div>
              <Input
                type="text"
                className="block w-full rounded-full pl-10 sm:pl-12 pr-24 sm:pr-28 py-3 sm:py-4 md:py-5 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                placeholder="Search Society, Locality, City, State"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)} // delay to allow click
              />
              <Button
                type="submit"
                className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 rounded-r-full py-1.5 sm:py-2 md:py-5 px-4 sm:px-6 text-xs sm:text-sm md:text-base shadow-lg"
              >
                Search
              </Button>
            </div>

            {showSuggestions && suggestions.length > 0 && (
              <ul className="absolute z-10 bg-white border border-gray-300 rounded-md mt-1 w-full max-h-60 overflow-y-auto shadow-md">
                {suggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    onMouseDown={() => handleSuggestionClick(suggestion)}
                    className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                  >
                    {suggestion}
                  </li>
                ))}
              </ul>
            )}
          </form>
          </div>
          
          <div className="mt-6 sm:mt-10 flex flex-wrap gap-2 sm:gap-4 justify-center px-2">
            <Button 
              variant="outline" 
              size="sm"
              className="bg-white hover:bg-blue-600 hover:text-white text-blue-600 border-blue-600 text-xs sm:text-sm md:text-base group transition-all duration-300 px-3 sm:px-5 md:px-8 py-2 sm:py-3 md:py-4 rounded-full shadow-md sm:shadow-lg"
              onClick={() => navigate('/properties?type=buy')}
            >
              <Home className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Buy
            </Button>
            <Button 
              variant="outline"
              size="sm"
              className="bg-white hover:bg-blue-600 hover:text-white text-blue-600 border-blue-600 text-xs sm:text-sm md:text-base group transition-all duration-300 px-3 sm:px-5 md:px-8 py-2 sm:py-3 md:py-4 rounded-full shadow-md sm:shadow-lg"
              onClick={() => navigate('/properties?type=rent')}
            >
              <Key className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Rent
            </Button>

             <Button 
              variant="outline"
              size="sm"
              className="bg-white hover:bg-blue-600 hover:text-white text-blue-600 border-blue-600 text-xs sm:text-sm md:text-base group transition-all duration-300 px-3 sm:px-5 md:px-8 py-2 sm:py-3 md:py-4 rounded-full shadow-md sm:shadow-lg"
              onClick={() => navigate('/properties?type=plot')}
            >
              <Map className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Plot
            </Button>
            <Button 
              variant="outline"
              size="sm"
              className="bg-white hover:bg-blue-600 hover:text-white text-blue-600 border-blue-600 text-xs sm:text-sm md:text-base group transition-all duration-300 px-3 sm:px-5 md:px-8 py-2 sm:py-3 md:py-4 rounded-full shadow-md sm:shadow-lg"
              onClick={() => navigate('/properties?type=commercial')}
            >
              <Store className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Commercial
            </Button>
          </div>
        </div>
      </div>
    </section>

      {/* Stats Section
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
      </section> */}
      <div className="min-h-screen bg-gray-50">
      <AllProperty />
    </div>
      {/* Why Choose Us Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-gradient-to-b from-gray-50 to-white">
        <div className="text-center mb-16">
          <p className="text-blue-600 font-semibold uppercase tracking-wider mb-2">Why Choose Homeyatra</p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800">Our Commitment To You</h2>
          <div className="w-24 h-1 bg-blue-600 mx-auto mt-4"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="bg-white p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 group text-center border border-gray-100">
            <div className="inline-flex items-center justify-center w-20 h-20 mb-6 bg-gradient-to-br from-blue-600 to-blue-400 rounded-2xl text-white group-hover:scale-110 transition-transform duration-300">
              <CheckCircle className="h-10 w-10" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Verified Properties</h3>
            <p className="text-gray-600">
              Every property is thoroughly verified by our team to ensure authenticity and transparency.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 group text-center border border-gray-100">
            <div className="inline-flex items-center justify-center w-20 h-20 mb-6 bg-gradient-to-br from-blue-600 to-blue-400 rounded-2xl text-white group-hover:scale-110 transition-transform duration-300">
              <Clock className="h-10 w-10" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Fast Processing</h3>
            <p className="text-gray-600">
              Our streamlined process ensures you can find, buy, or rent properties with minimal delay.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 group text-center border border-gray-100">
            <div className="inline-flex items-center justify-center w-20 h-20 mb-6 bg-gradient-to-br from-blue-600 to-blue-400 rounded-2xl text-white group-hover:scale-110 transition-transform duration-300">
              <HeartHandshake className="h-10 w-10" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Expert Guidance</h3>
            <p className="text-gray-600">
              Our experienced team provides end-to-end assistance throughout your property journey.
            </p>
          </div>
        </div>
      </section>

      {/* <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-white">
        <div className="flex flex-col md:flex-row md:justify-between items-center mb-16">
          <div className="text-center md:text-left mb-8 md:mb-0">
            <p className="text-blue-600 font-semibold uppercase tracking-wider mb-2">EXCLUSIVE LISTINGS</p>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-800">Featured Properties</h2>
            <div className="w-24 h-1 bg-blue-600 mt-4 md:mx-0 mx-auto"></div>
          </div>
          <Button 
            variant="outline" 
            onClick={() => navigate('/properties')}
            className="flex items-center gap-1 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white group px-8 py-4 rounded-full text-lg shadow-md"
          >
            View All Properties <ArrowRight className="h-5 w-5 ml-1 transition-transform duration-300 group-hover:translate-x-1" />
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredProperties.slice(0, 3).map((property) => (
            <PropertyCard key={property.id} {...property} />
          ))}
        </div>
        
        <div className="hidden lg:grid grid-cols-2 gap-8 mt-8">
          {featuredProperties.slice(3, 5).map((property) => (
            <PropertyCard key={property.id} {...property} />
          ))}
        </div>
      </section> */}
 

      {/* Call to Action Section - With clearer background image */}
<section 
  className="py-24 relative bg-cover bg-center bg-fixed" 
  style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80')" }}
>
  {/* Removed gradient overlay for clearer background */}
  <div className="absolute inset-0 bg-black/10"></div>
  
  <div className="max-w-5x1 mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
    <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-16 border border-white/50 shadow-2xl">
      <div className="inline-flex items-center justify-center w-20 h-20 mb-8 bg-blue-600 rounded-full text-white">
        <Building className="w-10 h-10" />
      </div>
      <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-800">Ready to post your property?</h2>
      <p className="text-xl mb-10 text-gray-700 max-w-2xl mx-auto">
        List your property with Homeyatra and reach thousands of potential buyers and renters all across India.
      </p>
      <Button 
        size="lg"
        onClick={handlePostPropertyClick}
        className="bg-blue-600 text-white hover:bg-blue-700 px-12 py-6 text-lg font-semibold shadow-xl rounded-full"
      >
        Post Your Property
      </Button>
    </div>
  </div>
</section>
    </div>
  );
};

export default Index;
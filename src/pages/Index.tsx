
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PropertyCard, PropertyCardProps } from "@/components/PropertyCard";
import { Search, ArrowRight, Building } from "lucide-react";

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
    image: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&q=80"
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
    image: "https://images.unsplash.com/photo-1466442929976-97f336a657be?auto=format&fit=crop&q=80"
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
    image: "https://images.unsplash.com/photo-1721322800607-8c38375eef04?auto=format&fit=crop&q=80"
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
      {/* Hero Section */}
      <section className="relative h-[600px] bg-real-dark text-white flex items-center">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: "url('https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&q=80')", 
            opacity: 0.5 
          }}
        ></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10 w-full py-12">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in">
              Find Your Dream Property
            </h1>
            <p className="text-xl mb-8 opacity-90 animate-slide-up">
              Discover the perfect place to call home with our extensive selection of properties for sale and rent.
            </p>
            
            <form onSubmit={handleSearch} className="mt-8 relative max-w-2xl animate-slide-up">
              <div className="relative flex">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full rounded-lg pl-10 p-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-real-blue"
                  placeholder="Search by location, property type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button 
                  type="submit" 
                  className="absolute right-2.5 bottom-2.5 bg-real-blue hover:bg-blue-600"
                >
                  Search
                </Button>
              </div>
            </form>
            
            <div className="mt-8 flex flex-wrap gap-4">
              <Button 
                variant="outline" 
                className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20"
                onClick={() => navigate('/properties?type=buy')}
              >
                Buy Properties
              </Button>
              <Button 
                variant="outline"
                className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20"
                onClick={() => navigate('/properties?type=rent')}
              >
                Rent Properties
              </Button>
              <Button 
                variant="outline"
                className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20"
                onClick={() => navigate('/properties?type=sell')}
              >
                Sell Your Property
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-real-dark">Featured Properties</h2>
          <Button 
            variant="ghost" 
            onClick={() => navigate('/properties')}
            className="flex items-center gap-1 text-real-blue"
          >
            View All <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
        
        <div className="property-grid">
          {featuredProperties.map((property) => (
            <PropertyCard key={property.id} {...property} />
          ))}
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="bg-real-lightBlue py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <Building className="w-12 h-12 text-real-blue mx-auto mb-4" />
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to post your property?</h2>
            <p className="text-lg mb-6">
              List your property with us and reach thousands of potential buyers and renters.
            </p>
            <Button 
              size="lg" 
              onClick={() => navigate('/post-property')}
              className="bg-real-blue hover:bg-blue-600"
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

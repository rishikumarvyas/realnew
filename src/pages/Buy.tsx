import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PropertyCard from '@/components/properties/PropertyCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, ArrowDownUp, BedDouble, Bath, Ruler } from 'lucide-react';
import { buyProperties } from '@/data/properties';
import { Link } from 'react-router-dom';

const Buy = () => {
  const [priceRange, setPriceRange] = React.useState([100000, 2000000]);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-gray-50">
        {/* Header */}
        <div className="bg-realestate-blue text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold mb-4">Find Properties for Sale</h1>
            <p className="text-xl max-w-3xl mx-auto">
              Browse through our extensive collection of properties available for purchase
            </p>
          </div>
        </div>
        
        {/* Search and Filter Section */}
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-4">
              <div className="relative">
                <MapPin className="absolute left-3 top-3 text-gray-400" size={20} />
                <Input 
                  placeholder="Location" 
                  className="pl-10"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Price Range</label>
                <Slider
                  defaultValue={[100000, 2000000]}
                  min={0}
                  max={5000000}
                  step={50000}
                  value={priceRange}
                  onValueChange={setPriceRange}
                  className="py-4"
                />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>${priceRange[0].toLocaleString()}</span>
                  <span>${priceRange[1].toLocaleString()}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Beds</label>
                  <select className="w-full border rounded-md p-2">
                    <option>Any</option>
                    <option>1+</option>
                    <option>2+</option>
                    <option>3+</option>
                    <option>4+</option>
                    <option>5+</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Baths</label>
                  <select className="w-full border rounded-md p-2">
                    <option>Any</option>
                    <option>1+</option>
                    <option>2+</option>
                    <option>3+</option>
                    <option>4+</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Type</label>
                  <select className="w-full border rounded-md p-2">
                    <option>Any</option>
                    <option>House</option>
                    <option>Apartment</option>
                    <option>Townhouse</option>
                    <option>Land</option>
                  </select>
                </div>
              </div>
              
              <Button className="bg-realestate-blue hover:bg-realestate-teal h-full mt-auto">
                Search
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" className="text-sm">More Filters</Button>
              <Button variant="outline" size="sm" className="text-sm">Pool</Button>
              <Button variant="outline" size="sm" className="text-sm">Garden</Button>
              <Button variant="outline" size="sm" className="text-sm">Garage</Button>
              <Button variant="outline" size="sm" className="text-sm">Balcony</Button>
            </div>
          </div>
          
          {/* Results Section */}
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              {buyProperties.length} Properties Found
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Sort by:</span>
              <select className="border rounded-md p-2">
                <option>Newest</option>
                <option>Price (Low to High)</option>
                <option>Price (High to Low)</option>
              </select>
            </div>
          </div>
          
          {/* Property Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {buyProperties.map((property) => (
              <Link to={`/property/${property.id}`} key={property.id} className="block hover:opacity-95 transition-opacity">
                <PropertyCard property={property} />
              </Link>
            ))}
          </div>
          
          {/* Pagination */}
          <div className="flex justify-center gap-2">
            <Button variant="outline" disabled>Previous</Button>
            <Button variant="outline" className="bg-realestate-blue text-white">1</Button>
            <Button variant="outline">2</Button>
            <Button variant="outline">3</Button>
            <Button variant="outline">Next</Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Buy;

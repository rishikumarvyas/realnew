import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { MapPin, Search as SearchIcon, Filter, Grid, List as ListIcon } from 'lucide-react';
import PropertyCard from '@/components/properties/PropertyCard';
import PropertyListItem from '@/components/properties/PropertyListItem';
import { buyProperties, rentProperties } from '@/data/properties';
import { PropertyType } from '@/components/properties/PropertyCard';
import { Link, useSearchParams } from 'react-router-dom';

const Search = () => {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('query') || '';
  const initialType = searchParams.get('type') || 'all';
  
  const [query, setQuery] = useState(initialQuery);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [priceRange, setPriceRange] = useState([50000, 1000000]);
  const [propertyType, setPropertyType] = useState(initialType);
  const [filters, setFilters] = useState({
    bedrooms: 'any',
    bathrooms: 'any',
    minSize: '',
    maxSize: '',
    parking: false,
    pool: false,
    furnished: false,
    petsAllowed: false,
  });
  
  // Combine buy and rent properties for search
  const allProperties = [...buyProperties, ...rentProperties];
  
  // Helper function to get location address regardless of format
  const getLocationAddress = (location: string | {address: string, city: string, state: string, zip: string}): string => {
    return typeof location === 'string' ? location : location.address;
  };
  
  // Helper functions to get property details
  const getBedroomCount = (property: PropertyType): number => {
    return property.details?.bedrooms ?? property.bedrooms;
  };
  
  const getBathroomCount = (property: PropertyType): number => {
    return property.details?.bathrooms ?? property.bathrooms;
  };
  
  // Filter properties based on search criteria
  const filteredProperties = allProperties.filter(property => {
    // Filter by search query
    if (query && !property.title.toLowerCase().includes(query.toLowerCase()) && 
        !getLocationAddress(property.location).toLowerCase().includes(query.toLowerCase())) {
      return false;
    }
    
    // Filter by property type (buy/rent/all)
    if (propertyType !== 'all' && property.type !== propertyType) {
      return false;
    }
    
    // Filter by price range
    if (property.price < priceRange[0] || property.price > priceRange[1]) {
      return false;
    }
    
    // Filter by bedrooms
    if (filters.bedrooms !== 'any') {
      const bedroomCount = getBedroomCount(property);
      if (bedroomCount < parseInt(filters.bedrooms)) {
        return false;
      }
    }
    
    // Filter by bathrooms
    if (filters.bathrooms !== 'any') {
      const bathroomCount = getBathroomCount(property);
      if (bathroomCount < parseInt(filters.bathrooms)) {
        return false;
      }
    }
    
    return true;
  });
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-gray-50">
        {/* Search Header */}
        <div className="bg-realestate-blue py-12 text-white">
          <div className="container mx-auto px-4">
            <h3 className="text-3xl font-bold mb-6 text-center">Find Your Dream Property</h3>
            
            <div className="max-w-4xl mx-auto">
              <div className="bg-white p-4 rounded-lg shadow-md flex flex-col md:flex-row gap-3">
                <div className="relative flex-grow">
                  <SearchIcon className="absolute left-3 top-3 text-gray-400" size={20} />
                  <Input 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by location, property name, or keyword" 
                    className="pl-10"
                  />
                </div>
                
                <select 
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="border rounded-md p-2.5"
                >
                  <option value="all">All Properties</option>
                  <option value="buy">For Sale</option>
                  <option value="rent">For Rent</option>
                </select>
                
                <Button className="bg-realestate-teal hover:bg-realestate-blue">
                  <SearchIcon className="mr-2 h-4 w-4" />
                  Search
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Filters Sidebar */}
            <div className="w-full lg:w-1/4">
              <div className="bg-white p-5 rounded-lg shadow-md sticky top-20">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Filters</h2>
                  <Button variant="link" className="text-realestate-teal p-0">
                    Reset All
                  </Button>
                </div>
                
                <div className="space-y-6">
                  {/* Price Range */}
                  <div>
                    <h3 className="font-medium mb-2">Price Range</h3>
                    <Slider
                      defaultValue={[50000, 1000000]}
                      min={0}
                      max={2000000}
                      step={10000}
                      value={priceRange}
                      onValueChange={setPriceRange}
                      className="py-4"
                    />
                    <div className="flex justify-between text-sm">
                      <span>${priceRange[0].toLocaleString()}</span>
                      <span>${priceRange[1].toLocaleString()}</span>
                    </div>
                  </div>
                  
                  {/* Bedrooms */}
                  <div>
                    <h3 className="font-medium mb-2">Bedrooms</h3>
                    <select 
                      value={filters.bedrooms}
                      onChange={(e) => setFilters({...filters, bedrooms: e.target.value})}
                      className="w-full border rounded-md p-2"
                    >
                      <option value="any">Any</option>
                      <option value="1">1+</option>
                      <option value="2">2+</option>
                      <option value="3">3+</option>
                      <option value="4">4+</option>
                      <option value="5">5+</option>
                    </select>
                  </div>
                  
                  {/* Bathrooms */}
                  <div>
                    <h3 className="font-medium mb-2">Bathrooms</h3>
                    <select 
                      value={filters.bathrooms}
                      onChange={(e) => setFilters({...filters, bathrooms: e.target.value})}
                      className="w-full border rounded-md p-2"
                    >
                      <option value="any">Any</option>
                      <option value="1">1+</option>
                      <option value="2">2+</option>
                      <option value="3">3+</option>
                      <option value="4">4+</option>
                    </select>
                  </div>
                  
                  {/* Property Size */}
                  <div>
                    <h3 className="font-medium mb-2">Property Size (sq ft)</h3>
                    <div className="flex space-x-2">
                      <Input 
                        type="number"
                        placeholder="Min"
                        value={filters.minSize}
                        onChange={(e) => setFilters({...filters, minSize: e.target.value})}
                      />
                      <Input 
                        type="number"
                        placeholder="Max"
                        value={filters.maxSize}
                        onChange={(e) => setFilters({...filters, maxSize: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  {/* Amenities */}
                  <div>
                    <h3 className="font-medium mb-2">Amenities</h3>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Checkbox 
                          id="parking" 
                          checked={filters.parking}
                          onCheckedChange={(checked) => 
                            setFilters({...filters, parking: checked === true})
                          }
                        />
                        <label htmlFor="parking" className="ml-2 text-sm">Parking</label>
                      </div>
                      
                      <div className="flex items-center">
                        <Checkbox 
                          id="pool" 
                          checked={filters.pool}
                          onCheckedChange={(checked) => 
                            setFilters({...filters, pool: checked === true})
                          }
                        />
                        <label htmlFor="pool" className="ml-2 text-sm">Swimming Pool</label>
                      </div>
                      
                      <div className="flex items-center">
                        <Checkbox 
                          id="furnished" 
                          checked={filters.furnished}
                          onCheckedChange={(checked) => 
                            setFilters({...filters, furnished: checked === true})
                          }
                        />
                        <label htmlFor="furnished" className="ml-2 text-sm">Furnished</label>
                      </div>
                      
                      <div className="flex items-center">
                        <Checkbox 
                          id="petsAllowed" 
                          checked={filters.petsAllowed}
                          onCheckedChange={(checked) => 
                            setFilters({...filters, petsAllowed: checked === true})
                          }
                        />
                        <label htmlFor="petsAllowed" className="ml-2 text-sm">Pets Allowed</label>
                      </div>
                    </div>
                  </div>
                  
                  <Button className="w-full bg-realestate-blue hover:bg-realestate-teal">
                    <Filter className="mr-2 h-4 w-4" />
                    Apply Filters
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Results Area */}
            <div className="flex-grow">
              {/* Results Header */}
              <div className="bg-white p-4 rounded-lg shadow-md mb-6 flex flex-wrap justify-between items-center gap-4">
                <div>
                  <p className="text-gray-600">
                    <span className="font-semibold text-black">{filteredProperties.length}</span> properties found
                  </p>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600 mr-2">Sort by:</span>
                    <select className="border rounded-md p-1.5 text-sm">
                      <option>Recommended</option>
                      <option>Price (Low to High)</option>
                      <option>Price (High to Low)</option>
                      <option>Newest</option>
                    </select>
                  </div>
                  
                  <div className="border-l pl-4 flex items-center space-x-2">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                    >
                      <ListIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Results Grid/List */}
              {filteredProperties.length === 0 ? (
                <div className="bg-white p-8 rounded-lg shadow-md text-center">
                  <SearchIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No properties found</h3>
                  <p className="text-gray-500 mb-4">
                    Try adjusting your search criteria or filters to find properties.
                  </p>
                  <Button onClick={() => {
                    setQuery('');
                    setPriceRange([50000, 1000000]);
                    setPropertyType('all');
                  }}>
                    Reset Search
                  </Button>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProperties.map((property) => (
                    <Link to={`/property/${property.id}`} key={property.id} className="block hover:opacity-95 transition-opacity">
                      <PropertyCard property={property} />
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredProperties.map((property) => (
                    <Link to={`/property/${property.id}`} key={property.id} className="block hover:opacity-95 transition-opacity">
                      <PropertyListItem property={property} />
                    </Link>
                  ))}
                </div>
              )}
              
              {/* Pagination */}
              {filteredProperties.length > 0 && (
                <div className="mt-8 flex justify-center">
                  <div className="flex gap-2">
                    <Button variant="outline" disabled>Previous</Button>
                    <Button variant="outline" className="bg-realestate-blue text-white">1</Button>
                    <Button variant="outline">2</Button>
                    <Button variant="outline">3</Button>
                    <Button variant="outline">Next</Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Search;

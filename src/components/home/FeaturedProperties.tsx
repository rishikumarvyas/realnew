
import React from 'react';
import { Button } from '@/components/ui/button';
import PropertyCard from '@/components/properties/PropertyCard';
import { buyProperties, rentProperties } from '@/data/properties';
import { Link } from 'react-router-dom';

const FeaturedProperties = () => {
  // Take 4 properties from both categories
  const featuredProperties = [...buyProperties.slice(0, 2), ...rentProperties.slice(0, 2)];
  
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">Featured Properties</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explore our handpicked selection of properties that offer the best in luxury, 
            location, and value for your investment
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProperties.map((property) => (
            <Link to={`/property/${property.id}`} key={property.id} className="block hover:opacity-95 transition-opacity">
              <PropertyCard property={property} />
            </Link>
          ))}
        </div>
        
        <div className="flex justify-center mt-10">
          <Button asChild variant="outline" size="lg" className="mr-4">
            <Link to="/buy">Browse Properties for Sale</Link>
          </Button>
          <Button asChild size="lg" className="bg-realestate-teal hover:bg-opacity-90">
            <Link to="/rent">Find Rental Properties</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProperties;

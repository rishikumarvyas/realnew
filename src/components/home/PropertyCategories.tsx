
import React from 'react';
import { Building, Home, Building2, Warehouse } from 'lucide-react';
import { Link } from 'react-router-dom';

const categories = [
  {
    icon: <Home className="h-8 w-8" />,
    title: 'Houses',
    count: 845,
    link: '/category/houses'
  },
  {
    icon: <Building className="h-8 w-8" />,
    title: 'Apartments',
    count: 632,
    link: '/category/apartments'
  },
  {
    icon: <Building2 className="h-8 w-8" />,
    title: 'Office Spaces',
    count: 157,
    link: '/category/offices'
  },
  {
    icon: <Warehouse className="h-8 w-8" />,
    title: 'Commercial',
    count: 98,
    link: '/category/commercial'
  }
];

const PropertyCategories = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-2">Browse By Category</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explore different types of properties available on PropVerse
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {categories.map((category, index) => (
            <Link 
              to={category.link} 
              key={index}
              className="flex flex-col items-center p-6 border rounded-lg hover:shadow-md transition-all hover:border-realestate-blue"
            >
              <div className="p-4 bg-realestate-gray rounded-full mb-4">
                {category.icon}
              </div>
              <h3 className="text-xl font-semibold mb-1">{category.title}</h3>
              <p className="text-gray-600">{category.count} Properties</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PropertyCategories;


import React from 'react';
import { Search, Home, Key } from 'lucide-react';

const steps = [
  {
    icon: <Search className="h-12 w-12 text-realestate-teal" />,
    title: 'Search Properties',
    description: 'Browse thousands of properties based on your preferences and requirements.'
  },
  {
    icon: <Home className="h-12 w-12 text-realestate-teal" />,
    title: 'Find Perfect Match',
    description: 'Explore property details, view images, and find the perfect home for your needs.'
  },
  {
    icon: <Key className="h-12 w-12 text-realestate-teal" />,
    title: 'Make It Yours',
    description: 'Connect with sellers or agents directly and finalize your dream property.'
  }
];

const HowItWorks = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-2">How It Works</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Finding your perfect property is easy with our simple process
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              <div className="mb-4 p-4 bg-realestate-gray rounded-full">
                {step.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;

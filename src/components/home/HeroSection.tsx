
import React, { useState } from 'react';
import { Search, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';

const HeroSection = () => {
  const [activeTab, setActiveTab] = useState('buy');

  return (
    <div className="relative h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
          alt="Modern Home" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
          Find Your Perfect Home
        </h1>
        <p className="text-xl text-white mb-8 max-w-2xl mx-auto">
          Explore thousands of properties for sale and rent across the country with PropVerse
        </p>

        {/* Search Tabs */}
        <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 max-w-4xl mx-auto">
          <Tabs 
            defaultValue="buy" 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="mb-6"
          >
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="buy" className="text-lg">Buy</TabsTrigger>
              <TabsTrigger value="rent" className="text-lg">Rent</TabsTrigger>
              <TabsTrigger value="sell" className="text-lg">Sell</TabsTrigger>
            </TabsList>

            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <MapPin className="absolute left-3 top-3 text-gray-400" size={20} />
                <Input 
                  placeholder="Enter location" 
                  className="pl-10 h-12 text-base"
                />
              </div>
              <Button className="h-12 px-8 bg-realestate-blue hover:bg-realestate-teal text-base">
                <Search size={20} className="mr-2" />
                Search
              </Button>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;

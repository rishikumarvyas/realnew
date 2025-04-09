
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, User, Bell, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-realestate-blue">PropVerse</span>
          </Link>

          {/* Search bar - hidden on mobile */}
          <div className="hidden lg:flex items-center max-w-md w-full mx-4">
            <form onSubmit={handleSearch} className="flex w-full">
              <input
                type="text"
                placeholder="Search properties, locations..."
                className="border border-gray-300 rounded-l-md px-4 py-2 w-full text-sm focus:outline-none focus:ring-1 focus:ring-realestate-blue"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button 
                type="submit" 
                className="bg-realestate-blue hover:bg-realestate-teal rounded-l-none"
              >
                <Search size={18} />
              </Button>
            </form>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="font-medium hover:text-realestate-teal transition-colors">Home</Link>
            <Link to="/buy" className="font-medium hover:text-realestate-teal transition-colors">Buy</Link>
            <Link to="/sell" className="font-medium hover:text-realestate-teal transition-colors">Sell</Link>
            <Link to="/rent" className="font-medium hover:text-realestate-teal transition-colors">Rent</Link>
          </div>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
              <Bell size={20} className="text-gray-600" />
            </button>
            <Button asChild variant="outline" className="space-x-2 border-realestate-teal text-realestate-blue hover:bg-realestate-teal hover:text-white">
              <Link to="/auth">
                <User size={18} />
                <span>Login</span>
              </Link>
            </Button>
            <Button asChild className="bg-realestate-blue hover:bg-realestate-teal">
              <Link to="/dashboard">
                Dashboard
              </Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              className="p-2 rounded-md hover:bg-gray-100 transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-3 py-3 border-t animate-fade-in">
            {/* Mobile search */}
            <form onSubmit={handleSearch} className="flex mb-4">
              <input
                type="text"
                placeholder="Search properties..."
                className="border border-gray-300 rounded-l-md px-4 py-2 w-full text-sm focus:outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button 
                type="submit" 
                className="bg-realestate-blue hover:bg-realestate-teal rounded-l-none"
              >
                <Search size={18} />
              </Button>
            </form>
            
            <div className="flex flex-col space-y-4">
              <Link to="/" className="px-3 py-2 rounded-md hover:bg-gray-100 transition-colors font-medium">Home</Link>
              <Link to="/buy" className="px-3 py-2 rounded-md hover:bg-gray-100 transition-colors font-medium">Buy</Link>
              <Link to="/sell" className="px-3 py-2 rounded-md hover:bg-gray-100 transition-colors font-medium">Sell</Link>
              <Link to="/rent" className="px-3 py-2 rounded-md hover:bg-gray-100 transition-colors font-medium">Rent</Link>
              <Link to="/dashboard" className="px-3 py-2 rounded-md hover:bg-gray-100 transition-colors font-medium">Dashboard</Link>
              <div className="pt-2 border-t">
                <Button asChild className="w-full bg-realestate-blue hover:bg-realestate-teal">
                  <Link to="/auth">Login / Sign Up</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

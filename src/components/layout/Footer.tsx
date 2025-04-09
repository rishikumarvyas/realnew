
import React from 'react';
import { Facebook, Twitter, Instagram, Linkedin, Mail, MapPin, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-2xl font-bold text-white mb-4">PropVerse</h3>
            <p className="mb-4">
              Your trusted platform for finding and listing properties across the country.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-realestate-teal transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="hover:text-realestate-teal transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="hover:text-realestate-teal transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="hover:text-realestate-teal transition-colors">
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/buy" className="hover:text-realestate-teal transition-colors">Buy Property</Link>
              </li>
              <li>
                <Link to="/rent" className="hover:text-realestate-teal transition-colors">Rent Property</Link>
              </li>
              <li>
                <Link to="/sell" className="hover:text-realestate-teal transition-colors">Sell Property</Link>
              </li>
              <li>
                <Link to="/blog" className="hover:text-realestate-teal transition-colors">Real Estate News</Link>
              </li>
            </ul>
          </div>

          {/* Useful Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Useful Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="hover:text-realestate-teal transition-colors">About Us</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-realestate-teal transition-colors">Contact Us</Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-realestate-teal transition-colors">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-realestate-teal transition-colors">Terms of Service</Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Contact Us</h4>
            <div className="space-y-3">
              <div className="flex items-start">
                <MapPin size={18} className="mr-2 mt-1 flex-shrink-0" />
                <p>1234 Real Estate Blvd, San Francisco, CA 94123</p>
              </div>
              <div className="flex items-center">
                <Phone size={18} className="mr-2 flex-shrink-0" />
                <p>(123) 456-7890</p>
              </div>
              <div className="flex items-center">
                <Mail size={18} className="mr-2 flex-shrink-0" />
                <p>info@propverse.com</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p>&copy; {new Date().getFullYear()} PropVerse. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

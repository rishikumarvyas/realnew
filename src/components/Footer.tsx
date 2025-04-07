
import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-real-dark text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">
              <span className="text-real-blue">Prop</span>Verse
            </h3>
            <p className="text-gray-300 text-sm">
              Finding your dream property has never been easier. Browse, buy, sell, or rent with confidence.
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/properties?type=buy" className="text-gray-300 hover:text-white text-sm">
                  Buy Property
                </Link>
              </li>
              <li>
                <Link to="/properties?type=rent" className="text-gray-300 hover:text-white text-sm">
                  Rent Property
                </Link>
              </li>
              <li>
                <Link to="/properties?type=sell" className="text-gray-300 hover:text-white text-sm">
                  Sell Property
                </Link>
              </li>
              <li>
                <Link to="/post-property" className="text-gray-300 hover:text-white text-sm">
                  Post Your Property
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-gray-300 hover:text-white text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-white text-sm">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/careers" className="text-gray-300 hover:text-white text-sm">
                  Careers
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-300 hover:text-white text-sm">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider">Connect With Us</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-white">
                <span className="sr-only">Facebook</span>
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-white">
                <span className="sr-only">Instagram</span>
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-white">
                <span className="sr-only">Twitter</span>
                <Twitter size={20} />
              </a>
            </div>
            <div className="mt-4">
              <p className="text-gray-300 text-sm">
                Email: info@propverse.com
              </p>
              <p className="text-gray-300 text-sm">
                Phone: +1 (555) 123-4567
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-700">
          <p className="text-gray-300 text-sm text-center">
            &copy; {new Date().getFullYear()} PropVerse. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

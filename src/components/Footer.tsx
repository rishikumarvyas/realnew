import { Link, useNavigate } from "react-router-dom";
import {
  Facebook,
  Instagram,
  Twitter,
  MapPin,
  Phone,
  Mail,
  Building,
  Home,
  Key,
  IndianRupee,
  Clock,
  ChevronRight,
} from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const navigate = useNavigate();

  const handleCityClick = (cityName: string) => {
    navigate(`/properties?search=${encodeURIComponent(cityName)}`);
  };

  return (
    <footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
      <div className="max-w-7xl mx-auto pt-16 pb-8 px-4 sm:px-6 lg:px-8">
        {/* Top section with newsletter */}
        {/* <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg p-6 md:p-8 mb-12 shadow-lg">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-xl font-bold">Subscribe to our Newsletter</h3>
              <p className="text-blue-100">Get the latest property updates and offers</p>
            </div>
            <div className="flex w-full md:w-auto">
              <input 
                type="email" 
                placeholder="Your email address" 
                className="px-4 py-3 rounded-l-md w-full md:w-64 text-gray-800 focus:outline-none"
              />
              <button className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-3 rounded-r-md font-medium transition duration-200">
                Subscribe
              </button>
            </div>
          </div>
        </div> */}

        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="flex items-center mb-4">
              <Building className="h-8 w-8 text-[#0EA5E9]" />
              <h3 className="text-xl font-bold ml-2">
                <span className="text-[#0EA5E9]">Home</span>
                <span className="text-orange-400">Yatra</span>
              </h3>
            </div>
            <p className="text-gray-300 mb-6">
              Your trusted partner in the journey to find your perfect home.
              Browse, buy, sell, or rent with confidence across India.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="bg-gray-700 hover:bg-gray-600 p-2 rounded-full transition duration-200"
              >
                <Facebook size={18} className="text-blue-300" />
              </a>
              <a
                href="#"
                className="bg-gray-700 hover:bg-gray-600 p-2 rounded-full transition duration-200"
              >
                <Instagram size={18} className="text-blue-300" />
              </a>
              <a
                href="#"
                className="bg-gray-700 hover:bg-gray-600 p-2 rounded-full transition duration-200"
              >
                <Twitter size={18} className="text-blue-300" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-6 text-[#0EA5E9] border-b border-gray-700 pb-2">
              Quick Links
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center">
                <ChevronRight size={16} className="text-orange-400 mr-2" />
                <Link
                  to="/properties?type=buy"
                  className="text-gray-300 hover:text-white transition duration-200"
                >
                  Buy
                </Link>
              </li>
              <li className="flex items-center">
                <ChevronRight size={16} className="text-orange-400 mr-2" />
                <Link
                  to="/properties?type=rent"
                  className="text-gray-300 hover:text-white transition duration-200"
                >
                  Rent
                </Link>
              </li>
              <li className="flex items-center">
                <ChevronRight size={16} className="text-orange-400 mr-2" />
                <Link
                  to="/properties?type=plot"
                  className="text-gray-300 hover:text-white transition duration-200"
                >
                  Plot
                </Link>
              </li>
              <li className="flex items-center">
                <ChevronRight size={16} className="text-orange-400 mr-2" />
                <Link
                  to="/properties?type=commercial"
                  className="text-gray-300 hover:text-white transition duration-200"
                >
                  Commercial
                </Link>
              </li>
              <li className="flex items-center">
                <ChevronRight size={16} className="text-orange-400 mr-2" />
                <Link
                  to="/contactus"
                  className="text-gray-300 hover:text-white transition duration-200"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-6 text-[#0EA5E9] border-b border-gray-700 pb-2">
              Company
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center">
                <ChevronRight size={16} className="text-orange-400 mr-2" />
                <Link
                  to="/about"
                  className="text-gray-300 hover:text-white transition duration-200"
                >
                  About Us
                </Link>
              </li>
              <li className="flex items-center">
                <ChevronRight size={16} className="text-orange-400 mr-2" />
                <Link
                  to="/contact"
                  className="text-gray-300 hover:text-white transition duration-200"
                >
                  Contact Us
                </Link>
              </li>
              <li className="flex items-center">
                <ChevronRight size={16} className="text-orange-400 mr-2" />
                <Link
                  to="/careers"
                  className="text-gray-300 hover:text-white transition duration-200"
                >
                  Careers
                </Link>
              </li>
              <li className="flex items-center">
                <ChevronRight size={16} className="text-orange-400 mr-2" />
                <Link
                  to="/terms"
                  className="text-gray-300 hover:text-white transition duration-200"
                >
                  Terms & Conditions
                </Link>
              </li>
              <li className="flex items-center">
                <ChevronRight size={16} className="text-orange-400 mr-2" />
                <Link
                  to="/privacy"
                  className="text-gray-300 hover:text-white transition duration-200"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-6 text-[#0EA5E9] border-b border-gray-700 pb-2">
              Contact Information
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin className="text-orange-400 mt-1 mr-3" size={18} />
                <span className="text-gray-300">
                  42 Sardar Patel Road, Connaught Place, New Delhi, 110001,
                  India
                </span>
              </li>
              <li className="flex items-center">
                <Phone className="text-orange-400 mr-3" size={18} />
                <span className="text-gray-300">+91 98765 43210</span>
              </li>
              <li className="flex items-center">
                <Mail className="text-orange-400 mr-3" size={18} />
                <span className="text-gray-300">contact@homeyatra.in</span>
              </li>
              <li className="flex items-center">
                <Clock className="text-orange-400 mr-3" size={18} />
                <span className="text-gray-300">
                  Monday - Saturday: 9AM - 7PM
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Popular cities section */}
        <div className="border-t border-gray-700 pt-8 mb-8">
          <h3 className="text-lg font-semibold mb-4 text-[#0EA5E9]">
            Popular Cities
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { name: "Mumbai", state: "Maharashtra" },
              { name: "Delhi", state: "Delhi" },
              { name: "Bangalore", state: "Karnataka" },
              { name: "Hyderabad", state: "Telangana" },
              { name: "Chennai", state: "Tamil Nadu" },
              { name: "Kolkata", state: "West Bengal" },
              { name: "Pune", state: "Maharashtra" },
              { name: "Ahmedabad", state: "Gujarat" },
              { name: "Jaipur", state: "Rajasthan" },
              { name: "Chandigarh", state: "Chandigarh" },
              { name: "Lucknow", state: "Uttar Pradesh" },
              { name: "Kochi", state: "Kerala" },
            ].map((city) => (
              <button
                key={city.name}
                onClick={() => handleCityClick(city.name)}
                className="group flex flex-row items-center gap-2 p-3 rounded-lg bg-gray-800/50 hover:bg-gray-700/70 transition-all duration-300 border border-gray-700 hover:border-orange-400/50 cursor-pointer"
                title={`Search properties in ${city.name}`}
              >
                <MapPin className="h-4 w-4 text-orange-400 group-hover:scale-110 transition-transform duration-300" />
                <span className="text-gray-300 hover:text-orange-400 text-sm font-medium transition-colors duration-200">
                  {city.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Bottom copyright bar */}
        <div className="border-t border-gray-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              &copy; {currentYear} Homeyatra Real Estate Services Pvt. Ltd. All
              rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link
                to="/terms"
                className="text-gray-400 hover:text-white text-sm"
              >
                Terms
              </Link>
              <Link
                to="/privacy"
                className="text-gray-400 hover:text-white text-sm"
              >
                Privacy
              </Link>
              <Link
                to="/sitemap"
                className="text-gray-400 hover:text-white text-sm"
              >
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

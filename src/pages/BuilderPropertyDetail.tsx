import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PropertyDetails {
  id: string;
  name: string;
  location: string;
  price: string;
  possession: string;
  configurations: string;
  description: string;
  address: {
    full: string;
    area: string;
    city: string;
    pincode: string;
  };
  nearbyPlaces: Array<{
    name: string;
    distance: string;
    icon: string;
  }>;
  priceDetails: Array<{
    type: string;
    price: string;
  }>;
  images: {
    banner: string;
    gallery: string[];
    amenities: string[];
  };
}

const amenitiesData = [
  {
    name: 'Kids\' Play Area',
    icon: '/amenity-icons/kids-play.svg',
    category: 'Recreation',
    description: 'Safe and engaging play area for children'
  },
  {
    name: 'Cricket Net',
    icon: '/amenity-icons/cricket.svg',
    category: 'Sports',
    description: 'Professional cricket practice facility'
  },
  {
    name: 'Jogging Track',
    icon: '/amenity-icons/jogging.svg',
    category: 'Fitness',
    description: 'Well-maintained track for jogging and walking'
  },
  {
    name: 'Gymnasium',
    icon: '/amenity-icons/gym.svg',
    category: 'Fitness',
    description: 'State-of-the-art fitness equipment'
  },
  {
    name: 'Squash Court',
    icon: '/amenity-icons/squash.svg',
    category: 'Sports',
    description: 'Professional squash facility'
  },
  {
    name: 'Library',
    icon: '/amenity-icons/library.svg',
    category: 'Lifestyle',
    description: 'Quiet reading space with diverse collection'
  },
  {
    name: 'Padel Court',
    icon: '/amenity-icons/padel.svg',
    category: 'Sports',
    description: 'Modern padel tennis facility'
  },
  {
    name: 'Hammock Bay & Lounge',
    icon: '/amenity-icons/hammock.svg',
    category: 'Lifestyle',
    description: 'Relaxing outdoor lounge area'
  },
  {
    name: 'Party Deck',
    icon: '/amenity-icons/party.svg',
    category: 'Entertainment',
    description: 'Spacious deck for social gatherings'
  },
  {
    name: 'Multipurpose Sports Court',
    icon: '/amenity-icons/sports.svg',
    category: 'Sports',
    description: 'Versatile court for various sports'
  }
];

const amenityCategories = ['All', 'Sports', 'Fitness', 'Lifestyle', 'Entertainment', 'Recreation'];

// Contact Section Component
const GetInTouchSection = () => {
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({ name: '', mobile: '', email: '', updates: true, country: '+91' });
  const [submitting, setSubmitting] = useState(false);
  const countryOptions = [
    { code: '+91', flag: '🇮🇳', label: 'India' },
    { code: '+1', flag: '🇺🇸', label: 'USA' },
    { code: '+44', flag: '🇬🇧', label: 'UK' },
    { code: '+971', flag: '🇦🇪', label: 'UAE' },
    { code: '+61', flag: '🇦🇺', label: 'Australia' },
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleCountryChange = (e) => {
    setForm((prev) => ({ ...prev, country: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSuccess(true);
      setSubmitting(false);
      setForm({ name: '', mobile: '', email: '', updates: true, country: '+91' });
    }, 1200);
  };

  return (
    <div className="w-full max-w-5xl mx-auto mt-16 mb-8 px-2 animate-fade-in-up">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold mb-2 tracking-wide text-[#C5B483]">GET IN TOUCH</h2>
        <p className="text-gray-600 max-w-xl mx-auto text-base sm:text-lg">
          If you would like to know more details or something specific, feel free to contact us. Our site representative will give you a call back.
        </p>
      </div>
      <div className="bg-gradient-to-br from-[#f8f6f1] to-[#f3f1ea] rounded-2xl shadow-xl border border-[#ece6d9] p-0.5">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 sm:p-10 grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
          <div className="relative">
            <input
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="peer w-full border-b-2 border-gray-300 bg-transparent py-3 px-2 text-base focus:outline-none focus:border-[#C5B483] transition-all placeholder-transparent"
              placeholder="Your Name"
              autoComplete="off"
            />
            <label htmlFor="name" className="absolute left-2 top-3 text-gray-500 text-base transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-4 peer-focus:text-xs peer-focus:text-[#C5B483] bg-white px-1 pointer-events-none">
              Name*
            </label>
          </div>
          <div className="relative">
            <div className="flex gap-2 w-full">
              <select
                name="country"
                value={form.country}
                onChange={handleCountryChange}
                className="bg-gray-50 border border-gray-200 rounded px-2 py-2 text-base focus:outline-none focus:border-[#C5B483] min-w-[70px]"
              >
                {countryOptions.map((c) => (
                  <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
                ))}
              </select>
              <div className="relative flex-1">
                <input
                  id="mobile"
                  name="mobile"
                  type="tel"
                  value={form.mobile}
                  onChange={handleChange}
                  required
                  className="peer w-full border-b-2 border-gray-300 bg-transparent py-3 px-2 text-base focus:outline-none focus:border-[#C5B483] transition-all placeholder-transparent"
                  placeholder="Mobile Number"
                  autoComplete="off"
                />
                <label htmlFor="mobile" className="absolute left-2 top-3 text-gray-500 text-base transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-4 peer-focus:text-xs peer-focus:text-[#C5B483] bg-white px-1 pointer-events-none">
                  Mobile*
                </label>
              </div>
            </div>
          </div>
          <div className="relative">
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              className="peer w-full border-b-2 border-gray-300 bg-transparent py-3 px-2 text-base focus:outline-none focus:border-[#C5B483] transition-all placeholder-transparent"
              placeholder="Your Email"
              autoComplete="off"
            />
            <label htmlFor="email" className="absolute left-2 top-3 text-gray-500 text-base transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-4 peer-focus:text-xs peer-focus:text-[#C5B483] bg-white px-1 pointer-events-none">
              Email ID*
            </label>
          </div>
          <div className="col-span-1 md:col-span-3 flex items-center mt-2">
            <input
              type="checkbox"
              id="updates"
              name="updates"
              checked={form.updates}
              onChange={handleChange}
              className="mr-2 w-4 h-4 accent-[#C5B483]"
            />
            <Label htmlFor="updates" className="text-sm text-gray-700 select-none">
              Yes, I would like to receive updates & promotions from HomeYatra Properties.
            </Label>
          </div>
          <div className="col-span-1 md:col-span-3 flex justify-end mt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 rounded-full font-semibold tracking-wide bg-gradient-to-r from-[#C5B483] to-[#b3a06e] text-white shadow-lg hover:from-[#b3a06e] hover:to-[#C5B483] transition-all text-base disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="#fff" strokeWidth="4" fill="none" /></svg>
              ) : (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" /></svg>
              )}
              {submitting ? 'Sending...' : 'Send'}
            </button>
          </div>
          {success && (
            <div className="col-span-1 md:col-span-3 mt-4 text-center animate-fade-in text-green-600 font-semibold">
              Thank you! We have received your details and will contact you soon.
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

const BuilderPropertyDetail = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('OVERVIEW');
  const [showEmiCalculator, setShowEmiCalculator] = useState(false);
  const [loanAmount, setLoanAmount] = useState('30000');
  const [advancePayment, setAdvancePayment] = useState(20);
  const [duration, setDuration] = useState(25);
  const [interestRate, setInterestRate] = useState(7);
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Filter amenities based on selected category
  const filteredAmenities = amenitiesData.filter(
    amenity => selectedCategory === 'All' || amenity.category === selectedCategory
  );

  // Mock data - replace with API call
  const propertyDetails: PropertyDetails = {
    id: '1',
    name: 'Godrej Skyshore',
    location: 'VERSOVA, ANDHERI (W), MUMBAI',
    price: 'INR 8.25 Cr. onwards',
    possession: 'February 2030',
    configurations: '3 & 4 BHK',
    description: 'A shoreline sanctuary shaped by the timeless dance of earth and sea, Godrej Skyshore emerges with quiet elegance along Mumbai\'s western coast. Where the rhythm of the waves meets architectural finesse, strength and serenity converge - creating a legacy address poised to reshape the landscape of Versova.',
    address: {
      full: 'Sales Lounge, CTS No. 1165-1172/1-4',
      area: 'Versova, Andheri',
      city: 'Mumbai Suburban',
      pincode: '400061'
    },
    nearbyPlaces: [
      { name: 'International Airport', distance: '4 Mins*', icon: '✈️' },
      { name: 'JW Marriott Sahar', distance: '20 Mins*', icon: '🏨' },
      { name: 'Kokilaben Hospital', distance: '5 Mins*', icon: '🏥' },
      { name: 'Infiniti Mall', distance: '7 Mins*', icon: '🛍️' },
      { name: 'NMIMS', distance: '12 Mins*', icon: '🎓' }
    ],
    priceDetails: [
      { type: '3 BHK', price: '8.25 Cr. onwards' },
      { type: '4 BHK', price: 'Available On Request' }
    ],
    images: {
      banner: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=2000&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1600607687644-c7171b42498b?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=800&q=80"
      ],
      amenities: [
        "https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?auto=format&fit=crop&w=400&q=80", // Pool
        "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=400&q=80", // Gym
        "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=400&q=80", // Garden
        "https://images.unsplash.com/photo-1577741314755-048d8525d31e?auto=format&fit=crop&w=400&q=80"  // Kids Area
      ]
    }
  };

  // EMI calculation function
  const calculateEMI = () => {
    // Principal = Loan Amount - Advance Payment
    const principal = Number(loanAmount) - (Number(loanAmount) * advancePayment / 100);
    const n = duration * 12; // months
    const r = Number(interestRate) / 12 / 100; // monthly interest rate
    if (principal <= 0 || r <= 0 || n <= 0) return 0;
    const emi = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    return emi ? emi.toLocaleString('en-IN', { maximumFractionDigits: 0 }) : 0;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Background Image */}
      <div className="relative h-[50vh] sm:h-[60vh] md:h-[70vh] w-full">
        <div className="absolute inset-0 bg-black/40 z-10" />
        <img
          src={propertyDetails.images.banner}
          alt={propertyDetails.name}
          className="w-full h-full object-cover"
        />
        
        {/* Back Button and Navigation */}
        <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/70 to-transparent">
          <div className="container mx-auto px-4 py-4">
            <button 
              onClick={() => window.history.back()} 
              className="text-white flex items-center gap-2 hover:bg-black/20 px-3 py-2 rounded-lg transition-colors"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              <span className="font-medium">BACK</span>
            </button>
          </div>
        </div>

        {/* Property Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 text-white z-20 bg-gradient-to-t from-black/70 to-transparent p-4 sm:p-6 md:p-8">
          <div className="container mx-auto">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 leading-tight">
              {propertyDetails.name}
            </h1>
            <p className="text-lg sm:text-xl mb-4 text-gray-200">
              {propertyDetails.location}
            </p>
            <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-sm sm:text-base md:text-lg">
              <span>{propertyDetails.price}</span>
              <span className="w-1.5 h-1.5 bg-white rounded-full hidden sm:block"></span>
              <span>Possession {propertyDetails.possession}</span>
              <span className="w-1.5 h-1.5 bg-white rounded-full hidden sm:block"></span>
              <span>{propertyDetails.configurations}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="sticky top-0 bg-white shadow-md z-30">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto hide-scrollbar">
            {['OVERVIEW', 'LOCATION', 'PRICE', 'AMENITIES'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-4 sm:px-6 font-medium whitespace-nowrap transition-all relative ${
                  activeTab === tab
                    ? 'text-[#C5B483]'
                    : 'text-gray-600 hover:text-[#C5B483]'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C5B483]"></div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="container mx-auto px-4 py-6 sm:py-8 md:py-12">
        {/* Overview Section */}
        {activeTab === 'OVERVIEW' && (
          <div className="max-w-4xl mx-auto">
            {/* Price Overview Card */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 border-b md:border-b-0 md:border-r border-gray-200">
                  <p className="text-sm text-gray-500 mb-1">Starting From</p>
                  <p className="text-xl font-bold text-gray-900">{propertyDetails.price}</p>
                </div>
                <div className="text-center p-4 border-b md:border-b-0 md:border-r border-gray-200">
                  <p className="text-sm text-gray-500 mb-1">Configuration</p>
                  <p className="text-xl font-bold text-gray-900">{propertyDetails.configurations}</p>
                </div>
                <div className="text-center p-4 border-b md:border-b-0 md:border-r border-gray-200">
                  <p className="text-sm text-gray-500 mb-1">Possession</p>
                  <p className="text-xl font-bold text-gray-900">{propertyDetails.possession}</p>
                </div>
                <div className="text-center p-4">
                  <p className="text-sm text-gray-500 mb-1">RERA</p>
                  <p className="text-xl font-bold text-gray-900">Approved</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6 pt-6 border-t border-gray-200">
                <Button variant="outline" className="w-full sm:w-auto">
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 10v6m0 0l-3-3m3 3l3-3M3 17v3a2 2 0 002 2h14a2 2 0 002-2v-3M6 11l6-6 6 6"/>
                  </svg>
                  Download Brochure
                </Button>
                <Button className="w-full sm:w-auto bg-[#C5B483] hover:bg-[#b3a06e]">
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                  </svg>
                  Enquire Now
                </Button>
              </div>
            </div>

            {/* Project Description */}
            <div className="mb-12">
              <h3 className="text-2xl font-bold mb-4">About {propertyDetails.name}</h3>
              <p className="text-gray-700 text-lg leading-relaxed mb-8">
                {propertyDetails.description}
              </p>
            </div>
            
            {/* Gallery Grid */}
            <div className="space-y-4">
              <h3 className="text-2xl font-bold mb-6">Project Gallery</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {propertyDetails.images.gallery.map((image, index) => (
                  <div 
                    key={index} 
                    className={`relative overflow-hidden rounded-lg ${
                      index === 0 ? 'md:col-span-2 aspect-[16/9]' : 'aspect-square'
                    } group`}
                  >
                    <img
                      src={image}
                      alt={`${propertyDetails.name} - View ${index + 1}`}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <Button variant="outline" className="bg-white/90 hover:bg-white">
                        View Larger
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Project Specifications */}
            <div className="mt-12">
              <h3 className="text-2xl font-bold mb-6">Project Specifications</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="font-semibold mb-4 text-lg">Structure</h4>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-[#C5B483] mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                      </svg>
                      <span className="text-gray-700">RCC framed structure with seismic resistant design</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-[#C5B483] mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                      </svg>
                      <span className="text-gray-700">External walls with premium quality bricks</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-[#C5B483] mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                      </svg>
                      <span className="text-gray-700">Internal walls with premium quality blocks</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="font-semibold mb-4 text-lg">Flooring</h4>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-[#C5B483] mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                      </svg>
                      <span className="text-gray-700">Vitrified tiles in living, dining & bedrooms</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-[#C5B483] mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                      </svg>
                      <span className="text-gray-700">Anti-skid tiles in bathrooms & balconies</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-[#C5B483] mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                      </svg>
                      <span className="text-gray-700">Granite counter in kitchen</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <GetInTouchSection />
          </div>
        )}

        {/* Location Section */}
        {activeTab === 'LOCATION' && (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">NEIGHBOURHOOD</h2>
            <p className="text-gray-700 mb-8">
              Well-planned roads and diverse transport options make India's cleanest city easily accessible from every direction
            </p>
            
            <div className="bg-gray-50 p-6 rounded-lg mb-8">
              <h3 className="font-bold mb-4">ADDRESS</h3>
              <p className="text-gray-700">
                {propertyDetails.address.full}<br />
                {propertyDetails.address.area}, {propertyDetails.address.city} {propertyDetails.address.pincode}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {propertyDetails.nearbyPlaces.map((place, index) => (
                <div key={index} className="flex items-center gap-3">
                  <span className="text-2xl">{place.icon}</span>
                  <div>
                    <p className="font-medium">{place.name}</p>
                    <p className="text-sm text-gray-500">{place.distance}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Map placeholder */}
            <div className="mt-8 h-96 bg-gray-200 rounded-lg overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3769.2892258523096!2d72.8168583!3d19.1367893!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7b7c8855f8655%3A0x7c46f53b7c77e377!2sVersova%2C%20Andheri%20West%2C%20Mumbai%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1629789045693!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
              />
            </div>
            <GetInTouchSection />
          </div>
        )}

        {/* Price Section */}
        {activeTab === 'PRICE' && (
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <div className="bg-[#C5B483] p-4">
                  <h2 className="text-white font-bold text-xl">PRICE</h2>
                </div>
                <div className="border p-4">
                  {propertyDetails.priceDetails.map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-4 border-b last:border-0">
                      <span className="font-bold">{item.type}</span>
                      <span className="text-gray-700">₹ {item.price}</span>
                    </div>
                  ))}
                  <p className="text-sm text-gray-500 mt-4">GST, AMC, IFMS & other charges additional*</p>
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h2 className="text-xl font-bold mb-6">EMI CALCULATOR</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">LOAN AMOUNT</label>
                    <input
                      type="number"
                      value={loanAmount}
                      onChange={(e) => setLoanAmount(e.target.value)}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ADVANCE PAYMENT</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={advancePayment}
                      onChange={(e) => setAdvancePayment(Number(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm">
                      <span>{advancePayment}%</span>
                      <span>{(Number(loanAmount) * advancePayment / 100).toFixed(0)}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">DURATION</label>
                    <input
                      type="range"
                      min="5"
                      max="30"
                      value={duration}
                      onChange={(e) => setDuration(Number(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm">
                      <span>{duration} Years</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">INTEREST RATE</label>
                    <input
                      type="range"
                      min="5"
                      max="15"
                      step="0.1"
                      value={interestRate}
                      onChange={(e) => setInterestRate(Number(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm">
                      <span>{interestRate}%</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <p className="text-sm font-medium text-gray-700">ESTIMATED MONTHLY EMI</p>
                    <p className="text-2xl font-bold">₹ {calculateEMI()} / month</p>
                  </div>
                </div>
              </div>
            </div>
            <GetInTouchSection />
          </div>
        )}

        {/* Amenities Section */}
        {activeTab === 'AMENITIES' && (
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">PROJECT HIGHLIGHTS</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Shaping this space with intention. Behold three levels as they flow into one another, from grounded greens to active spaces, all the way up to quiet heights cradled by the sky and light.
              </p>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              {amenityCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                    selectedCategory === category
                      ? 'bg-[#C5B483] text-white shadow-lg scale-105'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-105'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Amenities Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 mb-16">
              {filteredAmenities.map((amenity, index) => (
                <div
                  key={index}
                  className="group flex flex-col items-center text-center"
                >
                  <div className="w-20 h-20 rounded-full border-2 border-[#C5B483] flex items-center justify-center mb-3 group-hover:bg-[#C5B483] transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg">
                    <div className="w-12 h-12 text-[#C5B483] group-hover:text-white transition-colors duration-300">
                      <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
                        <path d={getIconPath(amenity.name)} />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-sm font-medium text-gray-800 mb-1">{amenity.name}</h3>
                  <span className="text-xs text-[#C5B483] font-medium">{amenity.category}</span>
                  <p className="text-xs text-gray-500 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {amenity.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Image Gallery Section */}
            <div className="bg-gray-50 rounded-xl p-8">
              <h3 className="text-2xl font-bold mb-6 text-center">Amenity Gallery</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {propertyDetails.images.amenities.map((image, index) => (
                  <div key={index} className="group relative overflow-hidden rounded-xl aspect-[4/3] shadow-md hover:shadow-xl transition-shadow duration-300">
                    <img
                      src={image}
                      alt={`Amenity View ${index + 1}`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <button className="w-full bg-white text-gray-900 rounded-full py-2 text-sm font-medium hover:bg-gray-100 transition-colors">
                          View Gallery
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Features Section */}
            <div className="mt-16">
              <h3 className="text-2xl font-bold mb-8 text-center">Additional Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                  {
                    title: 'Premium Equipment',
                    description: 'State-of-the-art fitness equipment and sports facilities',
                    icon: '🏋️‍♂️'
                  },
                  {
                    title: 'Professional Management',
                    description: 'Dedicated staff for maintenance and assistance',
                    icon: '👥'
                  },
                  {
                    title: 'Safety & Security',
                    description: '24/7 security with modern surveillance systems',
                    icon: '🔒'
                  },
                  {
                    title: 'Green Spaces',
                    description: 'Landscaped gardens and meditation areas',
                    icon: '🌳'
                  },
                  {
                    title: 'Community Events',
                    description: 'Regular social activities and community gatherings',
                    icon: '🎉'
                  },
                  {
                    title: 'Convenience',
                    description: 'Easy access to all amenities within the complex',
                    icon: '✨'
                  }
                ].map((feature, index) => (
                  <div key={index} className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
                    <span className="text-4xl mb-4 block">{feature.icon}</span>
                    <h4 className="text-lg font-semibold mb-2">{feature.title}</h4>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
            <GetInTouchSection />
          </div>
        )}
      </div>
    </div>
  );
};

// EMI calculation function
const calculateEMI = () => {
  // Add your EMI calculation logic here
  return "170";
};

// Helper function to get icon paths
const getIconPath = (amenityName: string) => {
  // Default icon path
  const defaultPath = "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z";
  
  // Map amenity names to specific icon paths
  const iconPaths: { [key: string]: string } = {
    'Kids\' Play Area': "M21.17 2.06L13.31 10H12V8.69L19.94 0.83L21.17 2.06zM12 14c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z",
    'Cricket Net': "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14H6v-2h6v2zm4-4H6v-2h10v2zm0-4H6V7h10v2z",
    'Jogging Track': "M13.49 5.48c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-3.6 13.9l1-4.4 2.1 2v6h2v-7.5l-2.1-2 .6-3c1.3 1.5 3.3 2.5 5.5 2.5v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1l-5.2 2.2v4.7h2v-3.4l1.8-.7-1.6 8.1-4.9-1-.4 2 7 1.4z",
    'Gymnasium': "M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29z",
    'Squash Court': "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 7h3V7h-3V5h5v14h-5v-2h3v-3h-3v-4z",
    'Library': "M12 11.55C9.64 9.35 6.48 8 3 8v11c3.48 0 6.64 1.35 9 3.55 2.36-2.19 5.52-3.55 9-3.55V8c-3.48 0-6.64 1.35-9 3.55zM12 8c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3z",
    // Add more icon paths as needed
  };

  return iconPaths[amenityName] || defaultPath;
};

export default BuilderPropertyDetail; 
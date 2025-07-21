import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import hmBanner from "@/Images/hm.jpg";
import { useNavigate } from 'react-router-dom';

// Mock builder project data
const mockBuilderProjects = [
  {
    id: "1",
    projectName: "Skyline Residency",
    reraNumber: "RERA12345",
    projectStatus: "New Launch",
    projectPhase: "Phase 1",
    projectArea: 5.2,
    legal: "RERA Approved",
    launchDate: "2024-07-01",
    propertyType: "Residential",
    startingPrice: "4500000",
    state: "Maharashtra",
    city: "Pune",
    location: "Wakad",
    projectPlanImages: [
      { url: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80" }
    ],
    floorPlanImages: [],
    amenities: ["Swimming Pool", "Gym", "Club House"],
    exclusiveFeatures: ["Sky Garden", "Kids Play Area"],
    paymentPlans: ["10% on Booking", "80% on Possession", "10% on Handover"],
    builder: "Godrej Properties",
    bhk: "3 & 4 BHK",
    area: "Available on Request",
    possessionDate: "Jan 2030",
    priceDisplay: "INR 5.58 Cr. onwards"
  },
  {
    id: "2",
    projectName: "Green Valley Towers",
    reraNumber: "RERA67890",
    projectStatus: "Under Construction",
    projectPhase: "Phase 2",
    projectArea: 3.8,
    legal: "RERA Applied",
    launchDate: "2023-12-15",
    propertyType: "Commercial",
    startingPrice: "12000000",
    state: "Gujarat",
    city: "Ahmedabad",
    location: "SG Highway",
    projectPlanImages: [
      { url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80" }
    ],
    floorPlanImages: [],
    amenities: ["Parking", "Power Backup"],
    exclusiveFeatures: ["Business Lounge"],
    paymentPlans: ["20% on Booking", "60% on Completion", "20% on Handover"],
    builder: "Lodha Group",
    bhk: "3 & 4 BHK",
    area: "Available on Request",
    possessionDate: "May 2030",
    priceDisplay: "INR 3.33 Cr. onwards"
  },
  {
    id: "3",
    projectName: "The Aqua Retreat At Godrej Park World",
    reraNumber: "RERA54321",
    projectStatus: "New Launch",
    projectPhase: "Phase 1",
    projectArea: 7.5,
    legal: "RERA Approved",
    launchDate: "2024-09-01",
    propertyType: "Residential",
    startingPrice: "7800000",
    state: "Maharashtra",
    city: "Pune",
    location: "Hinjawadi Phase 1",
    projectPlanImages: [
      { url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80" }
    ],
    floorPlanImages: [],
    amenities: ["Swimming Pool", "Kids Play Area", "Jogging Track"],
    exclusiveFeatures: ["Aqua Park", "Sky Lounge"],
    paymentPlans: ["10% on Booking", "80% on Possession", "10% on Handover"],
    builder: "Godrej Properties",
    bhk: "1, 2 & 3 BHK",
    area: "Available on Request",
    possessionDate: "Jun 2030",
    priceDisplay: "INR 78.00 Lakh onwards"
  },
  {
    id: "4",
    projectName: "Luxury Heights",
    reraNumber: "RERA98765",
    projectStatus: "New Launch",
    projectPhase: "Phase 1",
    projectArea: 6.0,
    legal: "RERA Approved",
    launchDate: "2024-08-01",
    propertyType: "Residential",
    startingPrice: "8500000",
    state: "Maharashtra",
    city: "Mumbai",
    location: "Andheri West",
    projectPlanImages: [
      { url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80" }
    ],
    floorPlanImages: [],
    amenities: ["Infinity Pool", "Spa", "Tennis Court"],
    exclusiveFeatures: ["Ocean View", "Helipad"],
    paymentPlans: ["15% on Booking", "75% on Possession", "10% on Handover"],
    builder: "Prestige Group",
    bhk: "4 & 5 BHK",
    area: "Available on Request",
    possessionDate: "Dec 2029",
    priceDisplay: "INR 8.50 Cr. onwards"
  },
  {
    id: "5",
    projectName: "Tech Park Plaza",
    reraNumber: "RERA24680",
    projectStatus: "Under Construction",
    projectPhase: "Phase 3",
    projectArea: 4.5,
    legal: "RERA Approved",
    launchDate: "2023-11-30",
    propertyType: "Commercial",
    startingPrice: "15000000",
    state: "Karnataka",
    city: "Bangalore",
    location: "Electronic City",
    projectPlanImages: [
      { url: "https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=800&q=80" }
    ],
    floorPlanImages: [],
    amenities: ["24/7 Security", "Food Court", "Conference Center"],
    exclusiveFeatures: ["Smart Building", "Green Certification"],
    paymentPlans: ["30% on Booking", "40% on Construction", "30% on Possession"],
    builder: "Brigade Group",
    bhk: "Office Spaces",
    area: "1000-5000 sq.ft",
    possessionDate: "Mar 2030",
    priceDisplay: "INR 1.50 Cr. onwards"
  }
];

const statusOptions = ["New Launch", "Under Construction", "Completed"];
const typeOptions = ["Residential", "Commercial", "Both"];

// Get unique builder names for dropdown
const builderOptions = Array.from(new Set(mockBuilderProjects.map(p => p.builder)));
// Add a list of all major metro cities
const metroCities = [
  "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Pune", "Ahmedabad", "Gurugram", "Noida"
];
// Merge with cityOptions and deduplicate
const allCityOptions = Array.from(new Set([...metroCities, ...mockBuilderProjects.map(p => p.city)]));

const NewLanching = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [type, setType] = useState("");
  const [selectedCities, setSelectedCities] = useState([]);
  const [state, setState] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [builder, setBuilder] = useState("");
  const [onlyNewLaunch, setOnlyNewLaunch] = useState(false);

  useEffect(() => {
    setProjects(mockBuilderProjects);
  }, []);

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.projectName.toLowerCase().includes(search.toLowerCase()) ||
      p.city.toLowerCase().includes(search.toLowerCase()) ||
      p.state.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = status ? p.projectStatus === status : true;
    const matchesType = type ? p.propertyType === type : true;
    const matchesCity = selectedCities.length > 0 ? selectedCities.includes(p.city) : true;
    const matchesState = state ? p.state.toLowerCase().includes(state.toLowerCase()) : true;
    const matchesBuilder = builder ? p.builder === builder : true;
    const price = parseInt(p.startingPrice.replace(/,/g, ""), 10);
    const matchesMinPrice = minPrice ? price >= parseInt(minPrice, 10) : true;
    const matchesMaxPrice = maxPrice ? price <= parseInt(maxPrice, 10) : true;
    const matchesNewLaunch = onlyNewLaunch ? p.projectStatus === "New Launch" : true;
    return (
      matchesSearch &&
      matchesStatus &&
      matchesType &&
      matchesCity &&
      matchesState &&
      matchesBuilder &&
      matchesMinPrice &&
      matchesMaxPrice &&
      matchesNewLaunch
    );
  });

  const handleProjectClick = (projectId: string) => {
    navigate(`/builder-property/${projectId}`);
  };

  // Dynamic banner image: use first filtered project's image, else fallback
  const bannerImage =
    filteredProjects.length > 0 && filteredProjects[0].projectPlanImages && filteredProjects[0].projectPlanImages.length > 0
      ? filteredProjects[0].projectPlanImages[0].url
      : hmBanner;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner Section */}
      <div className="relative w-full h-[320px] sm:h-[400px] md:h-[480px] flex items-center justify-center overflow-hidden mb-[-80px]">
        <img
          src={bannerImage}
          alt="New Launching Projects Banner"
          className="absolute inset-0 w-full h-full object-cover object-center scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 via-blue-800/60 to-blue-600/40" />
        <div className="relative z-10 text-center px-4 animate-fade-in-up flex flex-col items-center w-full">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg mb-4">Discover New Launching Projects with <span className="text-yellow-300">Home Yatra</span></h1>
          <p className="text-lg md:text-2xl text-blue-100 max-w-2xl mx-auto mb-6 font-medium drop-shadow">Find the most attractive and modern builder projects, handpicked for you. Filter by your preferences and explore the best new launches in your city!</p>
        </div>
      </div>
      {/* Modern Search Bar and Filter Section - moved below banner */}
      {/* Divider below banner */}
      <div className="w-full h-0.5 bg-gray-200 opacity-70 mb-0"></div>
      <div className="w-full flex flex-col items-center py-12 mb-8 bg-gray-50 mt-16 rounded-2xl shadow-2xl animate-fade-in-up transition-all duration-700">
        <div className="w-full max-w-6xl flex items-center bg-white rounded-xl shadow-md border border-gray-200 px-6 py-4 mb-6">
          <svg className="w-6 h-6 text-gray-400 mr-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            type="text"
            placeholder="Enter Project Name"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-transparent outline-none text-lg placeholder-gray-400"
          />
        </div>
        <div className="w-full max-w-6xl mx-auto mb-2">
          <div className="flex flex-col gap-3">
            <div className="flex items-center border border-blue-400 rounded-lg shadow-sm bg-white overflow-x-auto px-4 py-3 gap-3">
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="min-w-[160px] h-12 border-none focus:ring-0 focus:border-none">
                  <SelectValue placeholder="RESIDENTIAL" />
                </SelectTrigger>
                <SelectContent>
                  {typeOptions.map(opt => (
                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select open={undefined}>
                <SelectTrigger className="min-w-[200px] h-12 border-none focus:ring-0 focus:border-none text-base px-4 mr-2">
                  <SelectValue placeholder="CITIES" >
                    {selectedCities.length > 0 ? selectedCities.join(", ") : "CITIES"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {allCityOptions.map(opt => (
                    <div key={opt} className="flex items-center px-4 py-2">
                      <input
                        type="checkbox"
                        checked={selectedCities.includes(opt)}
                        onChange={e => {
                          if (e.target.checked) {
                            setSelectedCities([...selectedCities, opt]);
                          } else {
                            setSelectedCities(selectedCities.filter(c => c !== opt));
                          }
                        }}
                        className="mr-2"
                      />
                      <span className="text-base">{opt}</span>
                    </div>
                  ))}
                </SelectContent>
              </Select>
              <Select value={builder} onValueChange={setBuilder}>
                <SelectTrigger className="min-w-[160px] h-12 border-none focus:ring-0 focus:border-none text-base px-4 mr-2">
                  <SelectValue placeholder="BUILDER" />
                </SelectTrigger>
                <SelectContent>
                  {builderOptions.map(opt => (
                    <SelectItem key={opt} value={opt} className="text-base px-4 py-2">{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="min-w-[160px] h-12 border-none focus:ring-0 focus:border-none">
                  <SelectValue placeholder="STATUS" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(opt => (
                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="min-w-[160px] h-12 flex items-center">
                <Input
                  placeholder="BUDGET"
                  value={maxPrice}
                  onChange={e => setMaxPrice(e.target.value.replace(/[^0-9]/g, ""))}
                  className="w-full h-12 border-none focus:ring-0 focus:border-none"
                  type="number"
                  min="0"
                />
              </div>
              <Button
                className="h-12 px-8 bg-gray-900 text-white rounded-md font-semibold text-base shadow-none hover:bg-gray-700"
                onClick={() => {
                  setSearch(""); setStatus(""); setType(""); setBuilder(""); setSelectedCities([]); setState(""); setMinPrice(""); setMaxPrice(""); setOnlyNewLaunch(false);
                }}
              >
                RESET
              </Button>
            </div>
            <div className="flex items-center justify-between mt-3 px-1">
              <div className="flex items-center gap-2">
                <span className="text-base font-medium">New Launches Only</span>
                <button
                  onClick={() => setOnlyNewLaunch(v => !v)}
                  className={`w-10 h-6 flex items-center rounded-full transition-colors duration-200 ${onlyNewLaunch ? 'bg-blue-500' : 'bg-gray-300'}`}
                >
                  <span className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform duration-200 ${onlyNewLaunch ? 'translate-x-4' : ''}`}></span>
                </button>
              </div>
              <button className="text-gray-500 text-sm hover:underline">More Filters</button>
            </div>
          </div>
        </div>
      </div>

      {/* Project Grid Heading */}
      <div className="w-full max-w-6xl mx-auto flex items-center my-8">
        <div className="flex-1 border-t border-gray-300"></div>
        <h2 className="mx-6 text-2xl md:text-3xl font-extrabold text-gray-800 text-center whitespace-nowrap">EXPLORE HOMES</h2>
        <div className="flex-1 border-t border-gray-300"></div>
      </div>
      {/* Project Grid */}
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {filteredProjects.map((project) => {
            const image = project.projectPlanImages && project.projectPlanImages.length > 0
              ? project.projectPlanImages[0].url
              : "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=600&q=80";
            return (
              <div
                key={project.id}
                onClick={() => handleProjectClick(project.id)}
                className="group bg-white shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:-translate-y-2 hover:scale-[1.02] cursor-pointer animate-fade-in relative flex flex-col w-full"
              >
                {/* Card Image */}
                <div className="relative w-full aspect-[4/3] overflow-hidden">
                  <img
                    src={image}
                    alt={project.projectName}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className={`absolute top-4 left-4 px-3 py-1 text-xs font-semibold rounded-full shadow ${project.projectStatus === 'New Launch' ? 'bg-blue-600' : project.projectStatus === 'Under Construction' ? 'bg-yellow-500' : 'bg-green-600'} text-white tracking-wide`}>
                    {project.projectStatus.toUpperCase()}
                  </span>
                  {/* Overlay strictly within image */}
                  <div className="absolute inset-0 flex flex-col justify-center items-start bg-black/70 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 p-4">
                    <div className="mb-4 space-y-2 text-white w-full">
                      <div className="flex items-center gap-2 text-sm">
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M4 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4"/>
                          <rect width="16" height="8" x="4" y="10" rx="2"/>
                        </svg>
                        <span className="font-semibold">Beds</span>
                        <span className="ml-auto">{project.bhk}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <rect width="20" height="8" x="2" y="8" rx="2"/>
                          <path d="M12 8v8"/>
                        </svg>
                        <span className="font-semibold">Area</span>
                        <span className="ml-auto">{project.area}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M12 1v22M17 5H7m10 4H7m10 4H7m10 4H7"/>
                        </svg>
                        <span className="font-semibold">Price</span>
                        <span className="ml-auto">{project.priceDisplay}</span>
                      </div>
                    </div>
                    <div className="border-t border-white/30 w-full my-2"></div>
                    <div className="flex flex-col gap-2 w-full">
                      <button className="flex items-center gap-2 text-green-400 hover:text-green-300 font-semibold text-sm">
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                        </svg>
                        Enquire Now
                      </button>
                      <button className="flex items-center gap-2 text-green-400 hover:text-green-300 font-semibold text-sm">
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="10"/>
                          <path d="M12 6v6l4 2"/>
                        </svg>
                        Schedule a Visit
                      </button>
                      <button className="flex items-center gap-2 text-green-400 hover:text-green-300 font-semibold text-sm">
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M22 16.92V19a2 2 0 0 1-2.18 2A19.72 19.72 0 0 1 3 5.18 2 2 0 0 1 5 3h2.09a2 2 0 0 1 2 1.72c.13 1.13.37 2.23.72 3.28a2 2 0 0 1-.45 2.11l-.27.27a16 16 0 0 0 6.29 6.29l.27-.27a2 2 0 0 1 2.11-.45c1.05.35 2.15.59 3.28.72A2 2 0 0 1 22 16.92z"/>
                        </svg>
                        Call Us
                      </button>
                      <button className="flex items-center gap-2 text-green-400 hover:text-green-300 font-semibold text-sm">
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M20.52 3.48A11.94 11.94 0 0 0 12 0C5.37 0 0 5.37 0 12c0 2.21.6 4.28 1.65 6.05l-1.6 5.85a1 1 0 0 0 1.25 1.25l5.85-1.6A11.94 11.94 0 0 0 12 24c6.63 0 12-5.37 12-12 0-2.21-.6-4.28-1.65-6.05z"/>
                        </svg>
                        WhatsApp
                      </button>
                    </div>
                  </div>
                  {/* Expand overlay icon */}
                  <button className="absolute bottom-3 right-3 bg-white rounded-full p-2 shadow-lg group-hover:opacity-0 transition-opacity duration-300 z-10 border border-gray-200">
                    <svg width="20" height="20" fill="none" stroke="#2563eb" strokeWidth="2.5" viewBox="0 0 24 24">
                      <line x1="12" y1="5" x2="12" y2="19"/>
                      <line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                  </button>
                </div>
                {/* Card Content */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="text-xs text-gray-400 uppercase mb-1 tracking-wider">
                      {project.location}{project.city ? `, ${project.city}` : ''}
                    </div>
                    <div className="font-bold text-base sm:text-lg text-gray-800 mb-1 leading-tight line-clamp-2">
                      {project.projectName}
                    </div>
                    <div className="text-sm font-semibold text-gray-700 mb-2">
                      {project.builder}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 items-center mb-2">
                    <span className="bg-blue-50 text-blue-700 border border-blue-200 rounded px-2 py-1 text-xs font-semibold tracking-wide">
                      {project.projectStatus.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1 text-xs text-gray-600 mt-2">
                    <span className="font-medium">{project.priceDisplay}</span>
                    <span className="mx-1 text-gray-300">•</span>
                    <span>{project.possessionDate}</span>
                    <span className="mx-1 text-gray-300">•</span>
                    <span>{project.bhk}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {filteredProjects.length === 0 && (
          <div className="text-center text-gray-500 mt-10">No projects found.</div>
        )}
      </div>
    </div>
  );
};

export default NewLanching; 
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import hmBanner from "@/Images/hm.jpg";

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
      { url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80" }
    ],
    floorPlanImages: [],
    amenities: ["Swimming Pool", "Gym", "Club House"],
    exclusiveFeatures: ["Sky Garden", "Kids Play Area"],
    paymentPlans: ["10% on Booking", "80% on Possession", "10% on Handover"]
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
      { url: "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=600&q=80" }
    ],
    floorPlanImages: [],
    amenities: ["Parking", "Power Backup"],
    exclusiveFeatures: ["Business Lounge"],
    paymentPlans: ["20% on Booking", "60% on Completion", "20% on Handover"]
  }
];

const statusOptions = ["New Launch", "Under Construction", "Completed"];
const typeOptions = ["Residential", "Commercial", "Both"];

const NewLanching = () => {
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [type, setType] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

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
    const matchesCity = city ? p.city.toLowerCase().includes(city.toLowerCase()) : true;
    const matchesState = state ? p.state.toLowerCase().includes(state.toLowerCase()) : true;
    const price = parseInt(p.startingPrice.replace(/,/g, ""), 10);
    const matchesMinPrice = minPrice ? price >= parseInt(minPrice, 10) : true;
    const matchesMaxPrice = maxPrice ? price <= parseInt(maxPrice, 10) : true;
    return (
      matchesSearch &&
      matchesStatus &&
      matchesType &&
      matchesCity &&
      matchesState &&
      matchesMinPrice &&
      matchesMaxPrice
    );
  });

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
          <div className="w-full max-w-xl mx-auto flex justify-center">
            <Input
              placeholder="Search by project, city, or state..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full text-lg py-4 px-6 rounded-full shadow-lg border border-blue-200 bg-white focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all"
              style={{ minWidth: 0 }}
            />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-6xl mx-auto px-4">
        <Card className="mb-10 p-6 rounded-2xl shadow-lg bg-white/90 backdrop-blur-md">
          <div className="flex flex-wrap gap-4 items-end">
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Project Status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map(opt => (
                  <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Property Type" />
              </SelectTrigger>
              <SelectContent>
                {typeOptions.map(opt => (
                  <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="City"
              value={city}
              onChange={e => setCity(e.target.value)}
              className="w-36"
            />
            <Input
              placeholder="State"
              value={state}
              onChange={e => setState(e.target.value)}
              className="w-36"
            />
            <Input
              placeholder="Min Price"
              value={minPrice}
              onChange={e => setMinPrice(e.target.value.replace(/[^0-9]/g, ""))}
              className="w-28"
              type="number"
              min="0"
            />
            <Input
              placeholder="Max Price"
              value={maxPrice}
              onChange={e => setMaxPrice(e.target.value.replace(/[^0-9]/g, ""))}
              className="w-28"
              type="number"
              min="0"
            />
            <Button variant="outline" onClick={() => {
              setSearch(""); setStatus(""); setType(""); setCity(""); setState(""); setMinPrice(""); setMaxPrice("");
            }}>Reset</Button>
          </div>
        </Card>
      </div>

      {/* Project Grid */}
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project) => {
            const image = project.projectPlanImages && project.projectPlanImages.length > 0
              ? project.projectPlanImages[0].url
              : "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=600&q=80";
            return (
              <div
                key={project.id}
                className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-shadow duration-300 overflow-hidden border border-gray-100 hover:-translate-y-1 hover:scale-[1.02] cursor-pointer animate-fade-in"
              >
                <div className="relative h-56 w-full overflow-hidden">
                  <img
                    src={image}
                    alt={project.projectName}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                  <Badge className={`absolute top-3 left-3 px-3 py-1 text-xs font-semibold ${project.projectStatus === 'New Launch' ? 'bg-blue-600' : project.projectStatus === 'Under Construction' ? 'bg-yellow-500' : 'bg-green-600'} text-white shadow-lg`}>{project.projectStatus}</Badge>
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xl font-bold text-gray-800 line-clamp-1">{project.projectName}</h2>
                    <span className="text-lg font-semibold text-blue-700">₹{parseInt(project.startingPrice).toLocaleString()}</span>
                  </div>
                  <div className="text-gray-500 text-sm mb-2 flex items-center gap-2">
                    <span className="font-medium">{project.location}, {project.city}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {project.amenities.slice(0, 3).map((amenity, idx) => (
                      <Badge key={idx} variant="outline" className="border-blue-200 text-blue-700 bg-blue-50">{amenity}</Badge>
                    ))}
                    {project.exclusiveFeatures.slice(0, 2).map((feature, idx) => (
                      <Badge key={idx} variant="outline" className="border-purple-200 text-purple-700 bg-purple-50">{feature}</Badge>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-gray-400">
                    <span>RERA: {project.reraNumber}</span>
                    <span>Phase: {project.projectPhase}</span>
                    <span>Area: {project.projectArea} Acres</span>
                    <span>Type: {project.propertyType}</span>
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
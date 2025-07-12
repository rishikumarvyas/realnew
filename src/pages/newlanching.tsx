import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
    projectPlanImages: [],
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
    projectPlanImages: [],
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

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center mb-8">
        <div className="bg-blue-100 p-3 rounded-full mr-4">
          <span className="font-bold text-blue-600 text-xl">🏢</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-800">New Launching Projects</h1>
      </div>
      {/* Filters */}
      <Card className="mb-6 p-4">
        <div className="flex flex-wrap gap-4 items-end">
          <Input
            placeholder="Search by project, city, or state..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-56"
          />
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
      {/* Project Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredProjects.map((project) => (
          <Card key={project.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>{project.projectName}</CardTitle>
              <CardDescription>{project.location}, {project.city}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div><b>RERA:</b> {project.reraNumber}</div>
              <div><b>Status:</b> {project.projectStatus}</div>
              <div><b>Phase:</b> {project.projectPhase}</div>
              <div><b>Area:</b> {project.projectArea} Acres</div>
              <div><b>Type:</b> {project.propertyType}</div>
              <div><b>Starting Price:</b> ₹{parseInt(project.startingPrice).toLocaleString()}</div>
              <div><b>Legal:</b> {project.legal}</div>
              <div><b>Amenities:</b> {project.amenities.join(", ")}</div>
              <div><b>Exclusive Features:</b> {project.exclusiveFeatures.join(", ")}</div>
              <div><b>Payment Plan:</b> {project.paymentPlans.join(", ")}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      {filteredProjects.length === 0 && (
        <div className="text-center text-gray-500 mt-10">No projects found.</div>
      )}
    </div>
  );
};

export default NewLanching; 
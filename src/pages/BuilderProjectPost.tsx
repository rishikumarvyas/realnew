import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";

const BuilderProjectPost = () => {
  // Form states
  const [projectName, setProjectName] = useState("");
  const [reraNumber, setReraNumber] = useState("");
  const [projectStatus, setProjectStatus] = useState("");
  const [projectPhase, setProjectPhase] = useState("");
  const [projectArea, setProjectArea] = useState("");
  const [legal, setLegal] = useState("");
  const [launchDate, setLaunchDate] = useState();
  const [expectedCompleted, setExpectedCompleted] = useState();
  const [ocDate, setOCDate] = useState();
  const [propertyType, setPropertyType] = useState("");
  const [startingPrice, setStartingPrice] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [location, setLocation] = useState("");
  const [projectPlanImages, setProjectPlanImages] = useState([]);
  const [floorPlanImages, setFloorPlanImages] = useState([]);
  const [amenities, setAmenities] = useState([""]);
  const [exclusiveFeatures, setExclusiveFeatures] = useState([""]);
  const [paymentPlans, setPaymentPlans] = useState([""]);

  // Handlers for dynamic lists
  const handleListChange = (setter, index, value) => {
    setter((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };
  const handleAddListItem = (setter) => setter((prev) => [...prev, ""]);
  const handleRemoveListItem = (setter, index) => setter((prev) => prev.filter((_, i) => i !== index));

  // Image upload handlers (stub)
  const handleImageUpload = (setter, e) => {
    const files = Array.from(e.target.files);
    setter((prev) => [...prev, ...files]);
  };
  const handleRemoveImage = (setter, index) => setter((prev) => prev.filter((_, i) => i !== index));

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center mb-8">
        <div className="bg-blue-100 p-3 rounded-full mr-4">
          <span className="font-bold text-blue-600 text-xl">🏗️</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-800">Post Builder Project</h1>
      </div>
      <form>
        <div className="grid gap-8">
          {/* Project Details */}
          <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b">
              <CardTitle>Project Details</CardTitle>
              <CardDescription>Enter the basic details about your project</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="projectName">Project Name</Label>
                  <Input id="projectName" value={projectName} onChange={e => setProjectName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reraNumber">RERA Number</Label>
                  <Input id="reraNumber" value={reraNumber} onChange={e => setReraNumber(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="projectStatus">Project Status</Label>
                  <Select value={projectStatus} onValueChange={setProjectStatus}>
                    <SelectTrigger id="projectStatus">
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="New Launch">New Launch</SelectItem>
                      <SelectItem value="Under Construction">Under Construction</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="projectPhase">Project Phase</Label>
                  <Input id="projectPhase" value={projectPhase} onChange={e => setProjectPhase(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="projectArea">Project Area (Acres)</Label>
                  <Input id="projectArea" value={projectArea} onChange={e => setProjectArea(e.target.value)} type="number" min="0" step="0.01" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="legal">Legal</Label>
                  <Input id="legal" value={legal} onChange={e => setLegal(e.target.value)} />
                </div>
              </div>
              {/* Conditional Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {projectStatus === "New Launch" && (
                  <div className="space-y-2">
                    <Label>Launch Date</Label>
                    <DatePicker date={launchDate} setDate={setLaunchDate} />
                  </div>
                )}
                {projectStatus === "Under Construction" && (
                  <div className="space-y-2">
                    <Label>Expected Completed</Label>
                    <DatePicker date={expectedCompleted} setDate={setExpectedCompleted} />
                  </div>
                )}
                {projectStatus === "Completed" && (
                  <div className="space-y-2">
                    <Label>OC Date</Label>
                    <DatePicker date={ocDate} setDate={setOCDate} />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Type & Location */}
          <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b">
              <CardTitle>Type & Location</CardTitle>
              <CardDescription>Project type, price, and location details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="propertyType">Property Type</Label>
                  <Select value={propertyType} onValueChange={setPropertyType}>
                    <SelectTrigger id="propertyType">
                      <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Residential">Residential</SelectItem>
                      <SelectItem value="Commercial">Commercial</SelectItem>
                      <SelectItem value="Both">Both</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startingPrice">Starting Price</Label>
                  <Input id="startingPrice" value={startingPrice} onChange={e => setStartingPrice(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input id="state" value={state} onChange={e => setState(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" value={city} onChange={e => setCity(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" value={location} onChange={e => setLocation(e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Project Plan Images */}
          <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b">
              <CardTitle>Project Plan Images</CardTitle>
              <CardDescription>Upload project plan images</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <Input type="file" multiple accept="image/*" onChange={e => handleImageUpload(setProjectPlanImages, e)} />
              <div className="flex flex-wrap gap-4 mt-2">
                {projectPlanImages.map((img, idx) => (
                  <div key={idx} className="relative w-24 h-24 border rounded overflow-hidden">
                    <img src={URL.createObjectURL(img)} alt="Project Plan" className="object-cover w-full h-full" />
                    <Button type="button" size="icon" variant="destructive" className="absolute top-1 right-1" onClick={() => handleRemoveImage(setProjectPlanImages, idx)}>
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Floor Plan Images */}
          <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b">
              <CardTitle>Floor Plan Images</CardTitle>
              <CardDescription>Upload floor plan images</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <Input type="file" multiple accept="image/*" onChange={e => handleImageUpload(setFloorPlanImages, e)} />
              <div className="flex flex-wrap gap-4 mt-2">
                {floorPlanImages.map((img, idx) => (
                  <div key={idx} className="relative w-24 h-24 border rounded overflow-hidden">
                    <img src={URL.createObjectURL(img)} alt="Floor Plan" className="object-cover w-full h-full" />
                    <Button type="button" size="icon" variant="destructive" className="absolute top-1 right-1" onClick={() => handleRemoveImage(setFloorPlanImages, idx)}>
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Amenities List */}
          <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b">
              <CardTitle>Amenities</CardTitle>
              <CardDescription>List project amenities</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              {amenities.map((item, idx) => (
                <div key={idx} className="flex gap-2 items-center mb-2">
                  <Input value={item} onChange={e => handleListChange(setAmenities, idx, e.target.value)} placeholder="Amenity" />
                  <Button type="button" size="icon" variant="destructive" onClick={() => handleRemoveListItem(setAmenities, idx)}>
                    ×
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={() => handleAddListItem(setAmenities)}>
                + Add Amenity
              </Button>
            </CardContent>
          </Card>

          {/* Exclusive Features List */}
          <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b">
              <CardTitle>Exclusive Features</CardTitle>
              <CardDescription>List exclusive features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              {exclusiveFeatures.map((item, idx) => (
                <div key={idx} className="flex gap-2 items-center mb-2">
                  <Input value={item} onChange={e => handleListChange(setExclusiveFeatures, idx, e.target.value)} placeholder="Exclusive Feature" />
                  <Button type="button" size="icon" variant="destructive" onClick={() => handleRemoveListItem(setExclusiveFeatures, idx)}>
                    ×
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={() => handleAddListItem(setExclusiveFeatures)}>
                + Add Feature
              </Button>
            </CardContent>
          </Card>

          {/* Payment Plan List */}
          <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b">
              <CardTitle>Payment Plan</CardTitle>
              <CardDescription>List payment plan details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              {paymentPlans.map((item, idx) => (
                <div key={idx} className="flex gap-2 items-center mb-2">
                  <Input value={item} onChange={e => handleListChange(setPaymentPlans, idx, e.target.value)} placeholder="Payment Plan" />
                  <Button type="button" size="icon" variant="destructive" onClick={() => handleRemoveListItem(setPaymentPlans, idx)}>
                    ×
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={() => handleAddListItem(setPaymentPlans)}>
                + Add Payment Plan
              </Button>
            </CardContent>
          </Card>

          <Button type="submit" className="w-full mt-4" variant="primary">
            Submit Project
          </Button>
        </div>
      </form>
    </div>
  );
};

export default BuilderProjectPost; 
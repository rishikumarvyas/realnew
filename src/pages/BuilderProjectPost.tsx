import { useState, useEffect } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, Check, Camera } from "lucide-react";
import { getAmenity } from "@/utils/UtilityFunctions";
import imageCompression from "browser-image-compression";
import axiosInstance from "@/axiosCalls/axiosInstance";
import { useAuth } from "@/contexts/AuthContext";

const BuilderProjectPost = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Form states - matching API fields
  const [name, setName] = useState("");
  const [projectType, setProjectType] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [area, setArea] = useState("");
  const [beds, setBeds] = useState("");
  const [status, setStatus] = useState("");
  const [possession, setPossession] = useState("");
  const [address, setAddress] = useState("");
  const [locality, setLocality] = useState("");
  const [cityId, setCityId] = useState("");
  const [stateId, setStateId] = useState("");
  const [isNA, setIsNA] = useState(false);
  const [isReraApproved, setIsReraApproved] = useState(false);
  const [isOCApproved, setIsOCApproved] = useState(false);
  
  // State and city dropdowns
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  
  // Image states (like PostProperty)
  const [projectPlanImages, setProjectPlanImages] = useState([]);
  const [projectPlanImageURLs, setProjectPlanImageURLs] = useState([]);
  const [projectPlanMainIndex, setProjectPlanMainIndex] = useState(null);
  
  
  // Amenities (like PostProperty)
  const [amenities, setAmenities] = useState([]);
  const [selectedOption, setSelectedOption] = useState("");
  

  // Get amenities data
  const checkBoxAmenities = getAmenity().checkBoxAmenities;
  const radioAmenities = getAmenity().radioButtonAmenities;

  // Load states and cities (like PostProperty)
  const loadStates = async () => {
    setLoadingStates(true);
    try {
      const cachedStates = localStorage.getItem("allStates");
      if (cachedStates) {
        const statesData = JSON.parse(cachedStates);
        setStates(statesData);
      } else {
        const response = await axiosInstance.get("/api/Generic/GetActiveRecords?tableName=State");
        if (response.data.statusCode === 200) {
          setStates(response.data.data);
          localStorage.setItem("allStates", JSON.stringify(response.data.data));
        }
      }
    } finally {
      setLoadingStates(false);
    }
  };

  const loadCities = async (stateId) => {
    setLoadingCities(true);
    try {
      const response = await axiosInstance.get(`/api/Generic/GetActiveRecords?tableName=City&parentTableName=State&parentField=StateId&parentId=${stateId}`);
      if (response.data.statusCode === 200) {
        setCities(response.data.data);
      }
    } finally {
      setLoadingCities(false);
    }
  };

  useEffect(() => {
    loadStates();
  }, []);

  useEffect(() => {
    if (stateId) {
      loadCities(stateId);
    }
  }, [stateId]);


  // Image upload handlers (like PostProperty)
  const handleImageUpload = async (imageType, e) => {
    const imageFile = e.target.files[0];
    const options = {
      maxSizeMB: 0.2,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };

    try {
      const compressedFile = await imageCompression(imageFile, options);
      const convertedfile = new File([compressedFile], "example.jpg", {
        type: compressedFile.type,
      });
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(convertedfile);
      const fileList = dataTransfer.files;

      if (fileList && fileList.length > 0) {
        const newFiles = Array.from(fileList);
        
        if (imageType === 'projectPlan') {
          if (projectPlanImages.length + newFiles.length > 10) {
            toast({
              title: "Maximum 10 images allowed",
              description: "You can upload up to 10 project plan images.",
              variant: "destructive",
            });
            return;
          }
          const newImages = [...projectPlanImages, ...newFiles];
          setProjectPlanImages(newImages);
          const newImageURLs = newFiles.map((file) => URL.createObjectURL(file));
          setProjectPlanImageURLs([...projectPlanImageURLs, ...newImageURLs]);
          if (projectPlanMainIndex === null && newImages.length > 0) {
            setProjectPlanMainIndex(projectPlanImages.length);
          }
        }
      }
    } catch (error) {
      // Handle image compression error silently
    }
  };

  const removeImage = (imageType, index) => {
    if (imageType === 'projectPlan') {
      const newImages = [...projectPlanImages];
      const newURLs = [...projectPlanImageURLs];
      newImages.splice(index, 1);
      newURLs.splice(index, 1);
      setProjectPlanImages(newImages);
      setProjectPlanImageURLs(newURLs);
      
      if (projectPlanMainIndex === index) {
        setProjectPlanMainIndex(newImages.length > 0 ? 0 : null);
      } else if (projectPlanMainIndex > index) {
        setProjectPlanMainIndex(projectPlanMainIndex - 1);
      }
    }
  };

  // Amenity handlers (like PostProperty)
  const handleAmenityCheckBox = (id) => {
    setAmenities((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleAmenityRadioButton = (event) => {
    setSelectedOption(event.target.value);
  };


  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "Please log in to post a project",
        variant: "destructive",
      });
      return;
    }
    
    if (!name.trim()) {
      toast({
        title: "Validation Error", 
        description: "Project name is required",
        variant: "destructive",
      });
      return;
    }
    
    if (!cityId) {
      toast({
        title: "Validation Error",
        description: "Please select a city",
        variant: "destructive",
      });
      return;
    }
    
    if (!stateId) {
      toast({
        title: "Validation Error",
        description: "Please select a state",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const formData = new FormData();
      
      // Add all the required fields (without quotes as per API expectations)
      formData.append("BuilderId", "cc8011ef-8493-4543-84df-01bae14e4d06");
      formData.append("Name", name);
      formData.append("ProjectType", projectType);
      formData.append("Description", description);
      formData.append("Price", price.toString());
      formData.append("Area", area.toString());
      formData.append("Beds", beds.toString());
      formData.append("Status", status);
      formData.append("Possession", possession);
      formData.append("Address", address);
      formData.append("Locality", locality);
      formData.append("CityId", cityId.toString());
      formData.append("StateId", stateId.toString());
      formData.append("IsNA", isNA.toString());
      formData.append("IsReraApproved", isReraApproved.toString());
      formData.append("IsOCApproved", isOCApproved.toString());
      
      // Add amenity IDs (without quotes as per API expectations)
      // Map selected amenities to their IDs (like PostProperty)
      const amenityIds = selectedOption === "" ? amenities : [...amenities, selectedOption];
      amenityIds.forEach(amenityId => {
        formData.append("AmenityIds", amenityId);
      });
      
      // Add main images (without quotes as per API expectations)
      projectPlanImages.forEach((image, index) => {
        formData.append(`MainImages[${index}].File`, image);
        formData.append(`MainImages[${index}].IsMain`, (index === projectPlanMainIndex).toString());
      });


      
      console.log("Sending project data:", {
        BuilderId: "cc8011ef-8493-4543-84df-01bae14e4d06",
        Name: name,
        ProjectType: projectType,
        Description: description,
        Price: price,
        Area: area,
        Beds: beds,
        Status: status,
        Possession: possession,
        Address: address,
        Locality: locality,
        CityId: cityId,
        StateId: stateId,
        IsNA: isNA,
        IsReraApproved: isReraApproved,
        IsOCApproved: isOCApproved,
        AmenityIds: amenityIds,
        ImageCount: projectPlanImages.length
      });
      
      const response = await axiosInstance.post("/api/Builder/AddProject", formData);
      
      if (response.data.statusCode === 200) {
        toast({
          title: "Success",
          description: "Project added successfully!",
        });
        // Reset form
        setName("");
        setDescription("");
        setPrice("");
        setArea("");
        setBeds("");
        setStatus("");
        setPossession("");
        setAddress("");
        setLocality("");
        setCityId("");
        setStateId("");
        setIsNA(false);
        setIsReraApproved(false);
        setIsOCApproved(false);
        setProjectPlanImages([]);
        setProjectPlanImageURLs([]);
        setProjectPlanMainIndex(null);
        setAmenities([]);
        setSelectedOption("");
      }
    } catch (error) {
      console.error("API Error Details:", error);
      console.error("Error Response:", error.response?.data);
      console.error("Error Status:", error.response?.status);
      
      // Enhanced error handling
      let errorMessage = "Failed to add project. Please try again.";
      
      if (error.response?.data?.errors) {
        const validationErrors = error.response.data.errors;
        const errorMessages = [];
        
        Object.keys(validationErrors).forEach(field => {
          if (validationErrors[field]) {
            errorMessages.push(`${field}: ${validationErrors[field].join(', ')}`);
          }
        });
        
        if (errorMessages.length > 0) {
          errorMessage = `Validation errors: ${errorMessages.join('; ')}`;
        }
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      console.error("Final Error Message:", errorMessage);
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8 lg:py-12">
        {/* Modern Header - Responsive */}
        <div className="text-center mb-8 sm:mb-10 lg:mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg mb-4 sm:mb-6 transform hover:scale-105 transition-transform duration-300">
            <span className="text-2xl sm:text-3xl">🏗️</span>
        </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-3 sm:mb-4 px-4">
          Post Builder Project
        </h1>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto px-4">
            Create and showcase your latest real estate project with our comprehensive form
          </p>
      </div>
        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          {/* Project Details */}
          <Card className="group border-0 shadow-xl hover:shadow-2xl transition-all duration-500 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-t-lg p-4 sm:p-6">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="p-1.5 sm:p-2 bg-white/20 rounded-lg">
                  <span className="text-xl sm:text-2xl">📋</span>
                </div>
                <div>
                  <CardTitle className="text-lg sm:text-xl lg:text-2xl font-bold">Project Details</CardTitle>
                  <CardDescription className="text-blue-100 mt-1 text-xs sm:text-sm">
                Enter the basic details about your project
              </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
              {/* Builder Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 text-sm">👤</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-blue-800">Builder Information</p>
                    <p className="text-xs text-blue-600">
                      Project will be posted under: <span className="font-medium">{user?.name || user?.phone || 'Your Account'}</span>
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                <div className="space-y-3 group">
                  <Label htmlFor="name" className="text-sm font-semibold text-gray-700 flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Project Name
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter project name"
                    className="h-10 sm:h-12 border-2 border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-300 rounded-xl text-sm sm:text-base"
                  />
                </div>
                <div className="space-y-3 group">
                  <Label htmlFor="projectType" className="text-sm font-semibold text-gray-700 flex items-center">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                    Project Type
                  </Label>
                  <Select value={projectType} onValueChange={setProjectType}>
                    <SelectTrigger id="projectType" className="h-10 sm:h-12 border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-300 rounded-xl text-sm sm:text-base">
                      <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-2 shadow-xl">
                      <SelectItem value="Residential" className="rounded-lg">Residential</SelectItem>
                      <SelectItem value="Commercial" className="rounded-lg">Commercial</SelectItem>
                      <SelectItem value="Both" className="rounded-lg">Both</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3 group">
                  <Label htmlFor="status" className="text-sm font-semibold text-gray-700 flex items-center">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                    Status
                  </Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger id="status" className="h-12 border-2 border-gray-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all duration-300 rounded-xl">
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-2 shadow-xl">
                      <SelectItem value="New Launch" className="rounded-lg">New Launch</SelectItem>
                      <SelectItem value="Under Construction" className="rounded-lg">Under Construction</SelectItem>
                      <SelectItem value="Completed" className="rounded-lg">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3 group">
                  <Label htmlFor="price" className="text-sm font-semibold text-gray-700 flex items-center">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
                    Price
                  </Label>
                  <Input
                    id="price"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="Enter price"
                    type="number"
                    className="h-12 border-2 border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all duration-300 rounded-xl"
                  />
                </div>
                <div className="space-y-3 group">
                  <Label htmlFor="area" className="text-sm font-semibold text-gray-700 flex items-center">
                    <span className="w-2 h-2 bg-cyan-500 rounded-full mr-2"></span>
                    Area (sq ft)
                  </Label>
                  <Input
                    id="area"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    placeholder="Enter area"
                    type="number"
                    className="h-12 border-2 border-gray-200 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100 transition-all duration-300 rounded-xl"
                  />
                </div>
                <div className="space-y-3 group">
                  <Label htmlFor="beds" className="text-sm font-semibold text-gray-700 flex items-center">
                    <span className="w-2 h-2 bg-pink-500 rounded-full mr-2"></span>
                    Beds
                  </Label>
                  <Input
                    id="beds"
                    value={beds}
                    onChange={(e) => setBeds(e.target.value)}
                    placeholder="Enter number of beds"
                    type="number"
                    className="h-12 border-2 border-gray-200 focus:border-pink-500 focus:ring-4 focus:ring-pink-100 transition-all duration-300 rounded-xl"
                  />
                </div>
                <div className="space-y-3 group">
                  <Label htmlFor="possession" className="text-sm font-semibold text-gray-700 flex items-center">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
                    Possession Year
                  </Label>
                  <Input
                    id="possession"
                    value={possession}
                    onChange={(e) => setPossession(e.target.value)}
                    placeholder="Enter possession year"
                    type="number"
                    className="h-12 border-2 border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all duration-300 rounded-xl"
                  />
                </div>
              </div>
              <div className="space-y-3 group">
                <Label htmlFor="description" className="text-sm font-semibold text-gray-700 flex items-center">
                  <span className="w-2 h-2 bg-teal-500 rounded-full mr-2"></span>
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter project description"
                  rows={4}
                  className="border-2 border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-100 transition-all duration-300 rounded-xl resize-none"
                />
              </div>
            </CardContent>
          </Card>

          {/* Location & Address */}
          <Card className="group border-0 shadow-xl hover:shadow-2xl transition-all duration-500 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white rounded-t-lg p-4 sm:p-6">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="p-1.5 sm:p-2 bg-white/20 rounded-lg">
                  <span className="text-xl sm:text-2xl">📍</span>
                </div>
                <div>
                  <CardTitle className="text-lg sm:text-xl lg:text-2xl font-bold">Location & Address</CardTitle>
                  <CardDescription className="text-emerald-100 mt-1 text-xs sm:text-sm">
                    Project location and address details
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                <div className="space-y-3 group">
                  <Label htmlFor="address" className="text-sm font-semibold text-gray-700 flex items-center">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
                    Address
                  </Label>
                  <Input
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter address"
                    className="h-12 border-2 border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all duration-300 rounded-xl"
                  />
                  </div>
                <div className="space-y-3 group">
                  <Label htmlFor="locality" className="text-sm font-semibold text-gray-700 flex items-center">
                    <span className="w-2 h-2 bg-teal-500 rounded-full mr-2"></span>
                    Locality
                  </Label>
                  <Input
                    id="locality"
                    value={locality}
                    onChange={(e) => setLocality(e.target.value)}
                    placeholder="Enter locality"
                    className="h-12 border-2 border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-100 transition-all duration-300 rounded-xl"
                    />
                  </div>
                <div className="space-y-3 group">
                  <Label htmlFor="stateId" className="text-sm font-semibold text-gray-700 flex items-center">
                    <span className="w-2 h-2 bg-cyan-500 rounded-full mr-2"></span>
                    State
                  </Label>
                  <Select value={stateId} onValueChange={setStateId}>
                    <SelectTrigger id="stateId" className="h-12 border-2 border-gray-200 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100 transition-all duration-300 rounded-xl">
                      <SelectValue placeholder="Select State" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-2 shadow-xl">
                      {loadingStates ? (
                        <SelectItem value="loading" disabled>Loading states...</SelectItem>
                      ) : (
                        states.map((state) => (
                          <SelectItem key={state.id} value={state.id} className="rounded-lg">
                            {state.state}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  </div>
                <div className="space-y-3 group">
                  <Label htmlFor="cityId" className="text-sm font-semibold text-gray-700 flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    City
                  </Label>
                  <Select value={cityId} onValueChange={setCityId}>
                    <SelectTrigger id="cityId" className="h-12 border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 rounded-xl">
                      <SelectValue placeholder="Select City" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-2 shadow-xl">
                      {loadingCities ? (
                        <SelectItem value="loading" disabled>Loading cities...</SelectItem>
                      ) : (
                        cities.map((city) => (
                          <SelectItem key={city.id} value={city.id} className="rounded-lg">
                            {city.city}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Project Approvals */}
          <Card className="group border-0 shadow-xl hover:shadow-2xl transition-all duration-500 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 text-white rounded-t-lg p-4 sm:p-6">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="p-1.5 sm:p-2 bg-white/20 rounded-lg">
                  <span className="text-xl sm:text-2xl">✅</span>
                </div>
                <div>
                  <CardTitle className="text-lg sm:text-xl lg:text-2xl font-bold">Project Approvals</CardTitle>
                  <CardDescription className="text-amber-100 mt-1 text-xs sm:text-sm">
                    Select the approval status for your project
              </CardDescription>
                </div>
                </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 lg:p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                <div className="flex items-center space-x-4 p-4 rounded-xl border-2 border-gray-200 hover:border-amber-300 hover:bg-amber-50 transition-all duration-300 group">
                  <Checkbox
                    id="isNA"
                    checked={isNA}
                    onCheckedChange={(checked) => setIsNA(checked === true)}
                    className="w-5 h-5 text-amber-600 focus:ring-amber-500"
                  />
                  <Label htmlFor="isNA" className="text-sm font-semibold text-gray-700 cursor-pointer group-hover:text-amber-700 transition-colors">
                    Not Available (NA)
                  </Label>
                </div>
                <div className="flex items-center space-x-4 p-4 rounded-xl border-2 border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all duration-300 group">
                  <Checkbox
                    id="isReraApproved"
                    checked={isReraApproved}
                    onCheckedChange={(checked) => setIsReraApproved(checked === true)}
                    className="w-5 h-5 text-green-600 focus:ring-green-500"
                  />
                  <Label htmlFor="isReraApproved" className="text-sm font-semibold text-gray-700 cursor-pointer group-hover:text-green-700 transition-colors">
                    RERA Approved
                  </Label>
                </div>
                <div className="flex items-center space-x-4 p-4 rounded-xl border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-300 group">
                  <Checkbox
                    id="isOCApproved"
                    checked={isOCApproved}
                    onCheckedChange={(checked) => setIsOCApproved(checked === true)}
                    className="w-5 h-5 text-blue-600 focus:ring-blue-500"
                  />
                  <Label htmlFor="isOCApproved" className="text-sm font-semibold text-gray-700 cursor-pointer group-hover:text-blue-700 transition-colors">
                    OC Approved
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Project Plan Images */}
          <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b">
              <div className="flex items-center">
                <Camera className="h-5 w-5 text-blue-600 mr-2" />
              <CardTitle>Project Plan Images</CardTitle>
              </div>
              <CardDescription>Upload project plan images (max 10)</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {projectPlanImageURLs.map((url, index) => (
                  <div key={index} className="relative group">
                    <div className="relative w-full h-36 border rounded-lg overflow-hidden">
                      <img
                        src={url}
                        alt={`Project Plan ${index + 1}`}
                      className="object-cover w-full h-full"
                    />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                    <Button
                      type="button"
                      size="icon"
                      variant="destructive"
                          className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 h-8 w-8"
                          onClick={() => removeImage('projectPlan', index)}
                        >
                          <X className="h-4 w-4" />
                    </Button>
                  </div>
                      {projectPlanMainIndex === index && (
                        <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                          Main
                        </div>
                      )}
              </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full mt-2"
                      onClick={() => setProjectPlanMainIndex(index)}
                    >
                      {projectPlanMainIndex === index ? "Main Image" : "Set as Main"}
                    </Button>
                  </div>
                ))}
                {projectPlanImageURLs.length < 10 && (
                  <label className="border-2 border-dashed border-gray-300 rounded-lg h-36 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload('projectPlan', e)}
                      className="hidden"
                    />
                    <Upload className="h-8 w-8 text-blue-500 mb-2" />
                    <span className="text-sm text-blue-600 font-medium">
                      Upload Image
                    </span>
                    <span className="text-xs text-gray-500 mt-1">
                      {projectPlanImageURLs.length}/10 images
                    </span>
                  </label>
                )}
              </div>
            </CardContent>
          </Card>


          {/* Amenities */}
          <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b">
              <div className="flex items-center">
                <Check className="h-5 w-5 text-blue-600 mr-2" />
              <CardTitle>Amenities</CardTitle>
              </div>
              <CardDescription>
                Select the amenities available at your project
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  {checkBoxAmenities.map(({ id, amenity }) => (
                    <div
                      key={id}
                      className={`flex items-center p-3 rounded-lg cursor-pointer transition-all ${
                        amenities.includes(id)
                          ? "bg-blue-100 border-2 border-blue-300"
                          : "bg-gray-50 border-2 border-gray-200 hover:border-blue-200"
                      }`}
                      onClick={() => handleAmenityCheckBox(id)}
                    >
                      <input
                        type="checkbox"
                        id={id}
                        checked={amenities.includes(id)}
                        onChange={() => {}}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                      />
                      <Label
                        htmlFor={amenity}
                        className="cursor-pointer text-sm"
                      >
                        {amenity}
                      </Label>
                </div>
              ))}
                </div>
                <div className="my-6" />
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  {radioAmenities.map(({ id, amenity }) => (
                    <div
                      key={id}
                      className={`flex items-center p-3 rounded-lg cursor-pointer transition-all ${
                        selectedOption === id
                          ? "bg-blue-100 border-2 border-blue-300"
                          : "bg-gray-50 border-2 border-gray-200 hover:border-blue-200"
                      }`}
                    >
                      <label key={id}>
                        <input
                          type="radio"
                          name="furnishing"
                          value={id}
                          checked={selectedOption === id}
                          onChange={handleAmenityRadioButton}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                        />
                        {amenity}
                        <br />
                      </label>
                </div>
              ))}
                </div>
              </div>
            </CardContent>
          </Card>


          <div className="flex justify-center pt-6 sm:pt-8">
                  <Button
              type="submit" 
              className="w-full max-w-sm sm:max-w-md h-12 sm:h-14 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white font-bold text-base sm:text-lg rounded-2xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 border-0"
            >
              <span className="flex items-center space-x-2 sm:space-x-3">
                <span className="text-xl sm:text-2xl">🚀</span>
                <span className="text-sm sm:text-base">Submit Project</span>
              </span>
          </Button>
        </div>
      </form>
      </div>
    </div>
  );
};

export default BuilderProjectPost;

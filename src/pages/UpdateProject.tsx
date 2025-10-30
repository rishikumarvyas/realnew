import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Building,
  Save,
  Plus,
  X,
  Upload,
  Image as ImageIcon,
  Calendar,
  DollarSign,
  Home,
  Users,
  Ruler,
  MapPin,
  FileText,
  Award,
  CheckCircle,
  XCircle,
  Sparkles,
  LayoutGrid,
  Loader2,
  Camera,
  Check,
} from "lucide-react";
import axiosInstance from "@/axiosCalls/axiosInstance";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { getAmenity } from "@/utils/UtilityFunctions";
import imageCompression from "browser-image-compression";

// Define interfaces based on API schema
interface ProjectImage {
  url: string;
  isMain: boolean;
}

interface PlanDetail {
  type: string;
  area: string;
  price: string;
}

interface ProjectData {
  projectId: string;
  name: string;
  projectType: string;
  description: string;
  price: string;
  area: string;
  beds: string;
  status: string;
  possession: string;
  amenityIds: string[];
  address: string;
  locality: string;
  cityId: string;
  stateId: string;
  isNA: boolean;
  isReraApproved: boolean;
  isOCApproved: boolean;
  projectImages: ProjectImage[];
  amenityImages: ProjectImage[];
  floorImages: ProjectImage[];
  planDetails: PlanDetail[];
  reraNumber: string;
  reraDate: string;
  projectAreaAcres: string;
  launchDate: string;
  expectedCompletionDate: string;
  ocDate: string;
  exclusiveFeatures: string[];
}

const UpdateProject = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [project, setProject] = useState<ProjectData | null>(null);

  // State and city dropdowns
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);

  // Image states (split into Project/Amenity/Floor)
  const [projectImages, setProjectImages] = useState([]);
  const [projectImageURLs, setProjectImageURLs] = useState([]);
  const [projectMainIndex, setProjectMainIndex] = useState(null);
  const [amenityImages, setAmenityImages] = useState([]);
  const [amenityImageURLs, setAmenityImageURLs] = useState([]);
  const [amenityMainIndex, setAmenityMainIndex] = useState(null);
  const [floorImages, setFloorImages] = useState([]);
  const [floorImageURLs, setFloorImageURLs] = useState([]);
  const [floorMainIndex, setFloorMainIndex] = useState(null);

  // Amenities
  const [amenities, setAmenities] = useState([]);
  const [selectedOption, setSelectedOption] = useState("");

  // Form data state
  const [formData, setFormData] = useState<ProjectData>({
    projectId: projectId || "",
    name: "",
    projectType: "",
    description: "",
    price: "",
    area: "",
    beds: "",
    status: "",
    possession: "",
    amenityIds: [],
    address: "",
    locality: "",
    cityId: "",
    stateId: "",
    isNA: false,
    isReraApproved: false,
    isOCApproved: false,
    projectImages: [],
    amenityImages: [],
    floorImages: [],
    planDetails: [],
    reraNumber: "",
    reraDate: "",
    projectAreaAcres: "",
    launchDate: "",
    expectedCompletionDate: "",
    ocDate: "",
    exclusiveFeatures: [],
  });

  // Dynamic form states
  const [newExclusiveFeature, setNewExclusiveFeature] = useState("");
  const [newPlanDetail, setNewPlanDetail] = useState({ type: "", area: "", price: "" });

  // Available options
  const projectTypes = ["Residential", "Commercial", "Both"];
  const statusOptions = ["New Launch", "Under Construction", "Completed"];

  // Get amenities data
  const checkBoxAmenities = getAmenity().checkBoxAmenities;
  const radioAmenities = getAmenity().radioButtonAmenities;

  // Load states and cities
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

  // Image upload handlers
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
        
        if (imageType === 'project') {
          if (projectImages.length + newFiles.length > 10) {
            toast({
              title: "Maximum 10 images allowed",
              description: "You can upload up to 10 project images.",
              variant: "destructive",
            });
            return;
          }
          const newImages = [...projectImages, ...newFiles];
          setProjectImages(newImages);
          const newImageURLs = newFiles.map((file) => URL.createObjectURL(file));
          setProjectImageURLs([...projectImageURLs, ...newImageURLs]);
          if (projectMainIndex === null && newImages.length > 0) {
            setProjectMainIndex(projectImages.length);
          }
        }
        if (imageType === 'amenity') {
          if (amenityImages.length + newFiles.length > 10) {
            toast({ title: "Maximum 10 images allowed", description: "You can upload up to 10 amenity images.", variant: "destructive" });
            return;
          }
          const newImages = [...amenityImages, ...newFiles];
          setAmenityImages(newImages);
          const newImageURLs = newFiles.map((file) => URL.createObjectURL(file));
          setAmenityImageURLs([...amenityImageURLs, ...newImageURLs]);
          if (amenityMainIndex === null && newImages.length > 0) {
            setAmenityMainIndex(amenityImages.length);
          }
        }
        if (imageType === 'floor') {
          if (floorImages.length + newFiles.length > 10) {
            toast({ title: "Maximum 10 images allowed", description: "You can upload up to 10 floor plan images.", variant: "destructive" });
            return;
          }
          const newImages = [...floorImages, ...newFiles];
          setFloorImages(newImages);
          const newImageURLs = newFiles.map((file) => URL.createObjectURL(file));
          setFloorImageURLs([...floorImageURLs, ...newImageURLs]);
          if (floorMainIndex === null && newImages.length > 0) {
            setFloorMainIndex(floorImages.length);
          }
        }
      }
    } catch (error) {
      // Handle image compression error silently
    }
  };

  const removeImage = (imageType, index) => {
    if (imageType === 'project') {
      const newImages = [...projectImages];
      const newURLs = [...projectImageURLs];
      newImages.splice(index, 1);
      newURLs.splice(index, 1);
      setProjectImages(newImages);
      setProjectImageURLs(newURLs);
      if (projectMainIndex === index) {
        setProjectMainIndex(newImages.length > 0 ? 0 : null);
      } else if (projectMainIndex > index) {
        setProjectMainIndex(projectMainIndex - 1);
      }
    }
    if (imageType === 'amenity') {
      const newImages = [...amenityImages];
      const newURLs = [...amenityImageURLs];
      newImages.splice(index, 1);
      newURLs.splice(index, 1);
      setAmenityImages(newImages);
      setAmenityImageURLs(newURLs);
      if (amenityMainIndex === index) {
        setAmenityMainIndex(newImages.length > 0 ? 0 : null);
      } else if (amenityMainIndex > index) {
        setAmenityMainIndex(amenityMainIndex - 1);
      }
    }
    if (imageType === 'floor') {
      const newImages = [...floorImages];
      const newURLs = [...floorImageURLs];
      newImages.splice(index, 1);
      newURLs.splice(index, 1);
      setFloorImages(newImages);
      setFloorImageURLs(newURLs);
      if (floorMainIndex === index) {
        setFloorMainIndex(newImages.length > 0 ? 0 : null);
      } else if (floorMainIndex > index) {
        setFloorMainIndex(floorMainIndex - 1);
      }
    }
  };

  // Amenity handlers
  const handleAmenityCheckBox = (id) => {
    setAmenities((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleAmenityRadioButton = (event) => {
    setSelectedOption(event.target.value);
  };

  useEffect(() => {
    loadStates();
  }, []);

  useEffect(() => {
    if (formData.stateId) {
      loadCities(formData.stateId);
    }
  }, [formData.stateId]);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      if (!projectId) {
        toast({
          title: "Error",
          description: "Project ID is missing.",
          variant: "destructive",
        });
        navigate(-1);
        return;
      }

      try {
        setLoading(true);
        const response = await axiosInstance.get(`/api/Builder/GetProjectDetails?projectId=${projectId}`);

        if (response.data.statusCode === 200 && response.data.data) {
          const projectData = response.data.data;
          setProject(projectData);
          // Helper function to convert date format
          const convertDateFormat = (dateString) => {
            if (!dateString) return "";
            try {
              // If it's already in yyyy-MM-dd format, return as is
              if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
                return dateString;
              }
              // If it's in dd-MMM-yyyy format, convert to yyyy-MM-dd
              if (/^\d{2}-[A-Za-z]{3}-\d{4}$/.test(dateString)) {
                const date = new Date(dateString);
                return date.toISOString().split('T')[0];
              }
              // For any other format, try to parse and convert
              const date = new Date(dateString);
              if (!isNaN(date.getTime())) {
                return date.toISOString().split('T')[0];
              }
              return "";
            } catch (error) {
              return "";
            }
          };

          setFormData({
            projectId: projectData.projectId || projectId,
            name: projectData.name || "",
            projectType: projectData.projectType || "",
            description: projectData.description || "",
            price: projectData.price || "",
            area: projectData.area || "",
            beds: projectData.beds || "",
            status: projectData.status || "",
            possession: projectData.possession || "",
            amenityIds: projectData.amenityIds || [],
            address: projectData.address || "",
            locality: projectData.locality || "",
            cityId: projectData.cityId || "",
            stateId: projectData.stateId || "",
            isNA: projectData.isNA || false,
            isReraApproved: projectData.isReraApproved || false,
            isOCApproved: projectData.isOCApproved || false,
            projectImages: projectData.projectImages || [],
            amenityImages: projectData.amenityImages || [],
            floorImages: projectData.floorImages || [],
            planDetails: projectData.planDetails || [],
            reraNumber: projectData.reraNumber || "",
            reraDate: convertDateFormat(projectData.reraDate),
            projectAreaAcres: projectData.projectAreaAcres || "",
            launchDate: convertDateFormat(projectData.launchDate),
            expectedCompletionDate: convertDateFormat(projectData.expectedCompletionDate),
            ocDate: convertDateFormat(projectData.ocDate),
            exclusiveFeatures: projectData.exclusiveFeatures || [],
          });

          // Prefill image preview URLs and main indices for all image groups
          try {
            const projImages = Array.isArray(projectData.projectImages) ? projectData.projectImages : [];
            const amenImages = Array.isArray(projectData.amenityImages) ? projectData.amenityImages : [];
            const flrImages = Array.isArray(projectData.floorImages) ? projectData.floorImages : [];

            const projURLs = projImages.map((img: any) => img?.url).filter(Boolean);
            const amenURLs = amenImages.map((img: any) => img?.url).filter(Boolean);
            const floorURLs = flrImages.map((img: any) => img?.url).filter(Boolean);

            setProjectImageURLs(projURLs);
            setAmenityImageURLs(amenURLs);
            setFloorImageURLs(floorURLs);

            const projMainIdx = projImages.findIndex((img: any) => img?.isMain);
            const amenMainIdx = amenImages.findIndex((img: any) => img?.isMain);
            const floorMainIdx = flrImages.findIndex((img: any) => img?.isMain);

            setProjectMainIndex(
              projMainIdx >= 0 ? projMainIdx : (projURLs.length > 0 ? 0 : null)
            );
            setAmenityMainIndex(
              amenMainIdx >= 0 ? amenMainIdx : (amenURLs.length > 0 ? 0 : null)
            );
            setFloorMainIndex(
              floorMainIdx >= 0 ? floorMainIdx : (floorURLs.length > 0 ? 0 : null)
            );
          } catch {}

          // Prefill amenity selections
          try {
            const existingAmenityIds = Array.isArray(projectData.amenityIds) ? projectData.amenityIds : [];
            setAmenities(existingAmenityIds);

            // If any amenity matches a radio option id, preselect the first match
            const radioIds = (radioAmenities || []).map((r: any) => r.id);
            const firstRadioMatch = existingAmenityIds.find((id: string) => radioIds.includes(id));
            if (firstRadioMatch) {
              setSelectedOption(firstRadioMatch);
            }
          } catch {}
        } else {
          toast({
            title: "Error",
            description: "Failed to fetch project details.",
            variant: "destructive",
          });
          navigate(-1);
        }
      } catch (error: any) {
        console.error("Error fetching project details:", error);
        toast({
          title: "Error",
          description: "Failed to fetch project details.",
          variant: "destructive",
        });
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectDetails();
  }, [projectId, navigate, toast]);

  const handleInputChange = (field: keyof ProjectData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleExclusiveFeatureAdd = () => {
    if (newExclusiveFeature.trim()) {
      setFormData(prev => ({
        ...prev,
        exclusiveFeatures: [...prev.exclusiveFeatures, newExclusiveFeature.trim()]
      }));
      setNewExclusiveFeature("");
    }
  };

  const handleExclusiveFeatureRemove = (index: number) => {
    setFormData(prev => ({
      ...prev,
      exclusiveFeatures: prev.exclusiveFeatures.filter((_, i) => i !== index)
    }));
  };

  const handlePlanDetailAdd = () => {
    if (newPlanDetail.type.trim() && newPlanDetail.area.trim() && newPlanDetail.price.trim()) {
      setFormData(prev => ({
        ...prev,
        planDetails: [...prev.planDetails, { ...newPlanDetail }]
      }));
      setNewPlanDetail({ type: "", area: "", price: "" });
    }
  };

  const handlePlanDetailRemove = (index: number) => {
    setFormData(prev => ({
      ...prev,
      planDetails: prev.planDetails.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);

      // Create FormData for multipart/form-data
      const formDataToSend = new FormData();
      
      // Add all required fields
      formDataToSend.append("ProjectId", formData.projectId);
      formDataToSend.append("Name", formData.name);
      formDataToSend.append("ProjectType", formData.projectType);
      formDataToSend.append("Description", formData.description);
      formDataToSend.append("Price", formData.price);
      formDataToSend.append("Area", formData.area);
      formDataToSend.append("Beds", formData.beds);
      formDataToSend.append("Status", formData.status);
      formDataToSend.append("Possession", formData.possession);
      formDataToSend.append("Address", formData.address);
      formDataToSend.append("Locality", formData.locality);
      formDataToSend.append("CityId", formData.cityId);
      formDataToSend.append("StateId", formData.stateId);
      formDataToSend.append("IsNA", formData.isNA.toString());
      formDataToSend.append("IsReraApproved", formData.isReraApproved.toString());
      formDataToSend.append("IsOCApproved", formData.isOCApproved.toString());
      formDataToSend.append("ReraNumber", formData.reraNumber);
      formDataToSend.append("ReraDate", formData.reraDate);
      formDataToSend.append("ProjectAreaInAcres", formData.projectAreaAcres);
      formDataToSend.append("LaunchDate", formData.launchDate);
      formDataToSend.append("ExpectedCompletionDate", formData.expectedCompletionDate);
      formDataToSend.append("OCDate", formData.ocDate);

      // Add amenity IDs as comma-separated (matches working Postman format)
      const amenityIds = selectedOption === "" ? amenities : [...amenities, selectedOption];
      if (amenityIds && amenityIds.length > 0) {
        formDataToSend.append("AmenityIds", amenityIds.join(","));
      }

      // Add exclusive features
      formData.exclusiveFeatures.forEach(feature => {
        formDataToSend.append("ExclusiveFeatures", feature);
      });

      // Add plan details
      formData.planDetails.forEach((plan, index) => {
        formDataToSend.append(`PlanDetails[${index}].Type`, plan.type);
        formDataToSend.append(`PlanDetails[${index}].Area`, plan.area);
        formDataToSend.append(`PlanDetails[${index}].Price`, plan.price);
      });

      // Add project images
      projectImages.forEach((image, index) => {
        formDataToSend.append(`ProjectImages[${index}].File`, image);
        formDataToSend.append(`ProjectImages[${index}].IsMain`, (index === projectMainIndex).toString());
      });

      // Add amenity images
      amenityImages.forEach((image, index) => {
        formDataToSend.append(`AmenityImages[${index}].File`, image);
        formDataToSend.append(`AmenityImages[${index}].IsMain`, (index === amenityMainIndex).toString());
      });

      // Add floor images
      floorImages.forEach((image, index) => {
        formDataToSend.append(`FloorImages[${index}].File`, image);
        formDataToSend.append(`FloorImages[${index}].IsMain`, (index === floorMainIndex).toString());
      });

      const response = await axiosInstance.post("/api/Builder/UpdateProject", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.statusCode === 200) {
        toast({
          title: "Success",
          description: "Project updated successfully!",
        });
        navigate(`/project-detail/${projectId}`);
      } else {
        toast({
          title: "Error",
          description: response.data.message || "Failed to update project.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error updating project:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update project.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-xl text-gray-600">Loading project details...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building className="h-8 w-8 text-gray-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Project Not Found</h1>
            <p className="text-gray-600 mb-6">The project you're trying to update doesn't exist.</p>
            <Button 
              onClick={() => navigate(-1)}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/10 to-cyan-400/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-6 text-gray-600 hover:text-gray-800 hover:bg-white/50 backdrop-blur-sm transition-all duration-300 rounded-full px-4 py-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Project
          </Button>

          <div className="flex items-center space-x-4">
            <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg">
              <Building className="h-10 w-10 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Update Project
              </h1>
              <p className="text-gray-600 mt-2 text-lg">
                Edit project details and information
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card className="rounded-2xl shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
              <CardTitle className="text-2xl font-bold text-gray-800 flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg mr-3">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-semibold text-gray-700">
                  Project Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter project name"
                  className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="projectType" className="text-sm font-semibold text-gray-700">
                    Project Type <span className="text-red-500">*</span>
                  </Label>
                  <Select value={formData.projectType} onValueChange={(value) => handleInputChange("projectType", value)}>
                    <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl">
                      <SelectValue placeholder="Select project type" />
                    </SelectTrigger>
                    <SelectContent>
                      {projectTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status" className="text-sm font-semibold text-gray-700">
                    Status <span className="text-red-500">*</span>
                  </Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                    <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-semibold text-gray-700">
                  Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Enter project description..."
                  className="min-h-[120px] border-2 border-gray-200 focus:border-blue-500 rounded-xl resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="price" className="text-sm font-semibold text-gray-700 flex items-center">
                    <DollarSign className="h-4 w-4 mr-1" />
                    Price
                  </Label>
                  <Input
                    id="price"
                    type="text"
                    value={formData.price}
                    onChange={(e) => handleInputChange("price", e.target.value)}
                    placeholder="e.g., 75L, 1.2Cr"
                    className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="area" className="text-sm font-semibold text-gray-700 flex items-center">
                    <Ruler className="h-4 w-4 mr-1" />
                    Area (sqft)
                  </Label>
                  <Input
                    id="area"
                    type="text"
                    value={formData.area}
                    onChange={(e) => handleInputChange("area", e.target.value)}
                    placeholder="e.g., 1200"
                    className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="beds" className="text-sm font-semibold text-gray-700 flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    Beds
                  </Label>
                  <Input
                    id="beds"
                    type="text"
                    value={formData.beds}
                    onChange={(e) => handleInputChange("beds", e.target.value)}
                    placeholder="e.g., 2BHK, 3BHK"
                    className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="possession" className="text-sm font-semibold text-gray-700 flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Possession
                </Label>
                <Input
                  id="possession"
                  type="text"
                  value={formData.possession}
                  onChange={(e) => handleInputChange("possession", e.target.value)}
                  placeholder="e.g., Dec 2025"
                  className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                />
              </div>
            </CardContent>
          </Card>

          {/* Location Information */}
          <Card className="rounded-2xl shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-100">
              <CardTitle className="text-2xl font-bold text-gray-800 flex items-center">
                <div className="p-2 bg-green-100 rounded-lg mr-3">
                  <MapPin className="h-6 w-6 text-green-600" />
                </div>
                Location Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="address" className="text-sm font-semibold text-gray-700">
                  Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="address"
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="Enter complete address"
                  className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="locality" className="text-sm font-semibold text-gray-700">
                  Locality <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="locality"
                  type="text"
                  value={formData.locality}
                  onChange={(e) => handleInputChange("locality", e.target.value)}
                  placeholder="Enter locality"
                  className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="stateId" className="text-sm font-semibold text-gray-700">
                    State <span className="text-red-500">*</span>
                  </Label>
                  <Select value={formData.stateId} onValueChange={(value) => handleInputChange("stateId", value)}>
                    <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl">
                      <SelectValue placeholder="Select State" />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingStates ? (
                        <SelectItem value="loading" disabled>Loading states...</SelectItem>
                      ) : (
                        states.map((state) => (
                          <SelectItem key={state.id} value={state.id}>
                            {state.state}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cityId" className="text-sm font-semibold text-gray-700">
                    City <span className="text-red-500">*</span>
                  </Label>
                  <Select value={formData.cityId} onValueChange={(value) => handleInputChange("cityId", value)}>
                    <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl">
                      <SelectValue placeholder="Select City" />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingCities ? (
                        <SelectItem value="loading" disabled>Loading cities...</SelectItem>
                      ) : (
                        cities.map((city) => (
                          <SelectItem key={city.id} value={city.id}>
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

          {/* Approvals & Certifications */}
          <Card className="rounded-2xl shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-100">
              <CardTitle className="text-2xl font-bold text-gray-800 flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg mr-3">
                  <Award className="h-6 w-6 text-purple-600" />
                </div>
                Approvals & Certifications
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="isNA"
                    checked={formData.isNA}
                    onCheckedChange={(checked) => handleInputChange("isNA", checked)}
                  />
                  <Label htmlFor="isNA" className="text-sm font-medium text-gray-700">
                    Not Available (NA)
                  </Label>
                </div>

                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="isReraApproved"
                    checked={formData.isReraApproved}
                    onCheckedChange={(checked) => handleInputChange("isReraApproved", checked)}
                  />
                  <Label htmlFor="isReraApproved" className="text-sm font-medium text-gray-700">
                    RERA Approved
                  </Label>
                </div>

                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="isOCApproved"
                    checked={formData.isOCApproved}
                    onCheckedChange={(checked) => handleInputChange("isOCApproved", checked)}
                  />
                  <Label htmlFor="isOCApproved" className="text-sm font-medium text-gray-700">
                    OC Approved
                  </Label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="reraNumber" className="text-sm font-semibold text-gray-700">
                    RERA Number
                  </Label>
                  <Input
                    id="reraNumber"
                    type="text"
                    value={formData.reraNumber}
                    onChange={(e) => handleInputChange("reraNumber", e.target.value)}
                    placeholder="e.g., RERA-ABC-2025"
                    className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reraDate" className="text-sm font-semibold text-gray-700">
                    RERA Date
                  </Label>
                  <Input
                    id="reraDate"
                    type="date"
                    value={formData.reraDate ? new Date(formData.reraDate).toISOString().split('T')[0] : ""}
                    onChange={(e) => handleInputChange("reraDate", e.target.value)}
                    className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="projectAreaAcres" className="text-sm font-semibold text-gray-700">
                    Project Area (Acres)
                  </Label>
                  <Input
                    id="projectAreaAcres"
                    type="text"
                    value={formData.projectAreaAcres}
                    onChange={(e) => handleInputChange("projectAreaAcres", e.target.value)}
                    placeholder="e.g., 2.5"
                    className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="launchDate" className="text-sm font-semibold text-gray-700">
                    Launch Date
                  </Label>
                  <Input
                    id="launchDate"
                    type="date"
                    value={formData.launchDate ? new Date(formData.launchDate).toISOString().split('T')[0] : ""}
                    onChange={(e) => handleInputChange("launchDate", e.target.value)}
                    className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expectedCompletionDate" className="text-sm font-semibold text-gray-700">
                    Expected Completion Date
                  </Label>
                  <Input
                    id="expectedCompletionDate"
                    type="date"
                    value={formData.expectedCompletionDate ? new Date(formData.expectedCompletionDate).toISOString().split('T')[0] : ""}
                    onChange={(e) => handleInputChange("expectedCompletionDate", e.target.value)}
                    className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ocDate" className="text-sm font-semibold text-gray-700">
                    OC Date
                  </Label>
                  <Input
                    id="ocDate"
                    type="date"
                    value={formData.ocDate ? new Date(formData.ocDate).toISOString().split('T')[0] : ""}
                    onChange={(e) => handleInputChange("ocDate", e.target.value)}
                    className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Exclusive Features */}
          <Card className="rounded-2xl shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 border-b border-gray-100">
              <CardTitle className="text-2xl font-bold text-gray-800 flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg mr-3">
                  <Sparkles className="h-6 w-6 text-orange-600" />
                </div>
                Exclusive Features
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="flex space-x-2">
                <Input
                  value={newExclusiveFeature}
                  onChange={(e) => setNewExclusiveFeature(e.target.value)}
                  placeholder="Enter exclusive feature"
                  className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                />
                <Button
                  type="button"
                  onClick={handleExclusiveFeatureAdd}
                  className="h-12 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-2">
                {formData.exclusiveFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <span className="text-orange-800 font-medium">{feature}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleExclusiveFeatureRemove(index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Plan Details */}
          <Card className="rounded-2xl shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-cyan-50 to-blue-50 border-b border-gray-100">
              <CardTitle className="text-2xl font-bold text-gray-800 flex items-center">
                <div className="p-2 bg-cyan-100 rounded-lg mr-3">
                  <LayoutGrid className="h-6 w-6 text-cyan-600" />
                </div>
                Plan Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Input
                  value={newPlanDetail.type}
                  onChange={(e) => setNewPlanDetail(prev => ({ ...prev, type: e.target.value }))}
                  placeholder="Type (e.g., 2BHK)"
                  className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                />
                <Input
                  value={newPlanDetail.area}
                  onChange={(e) => setNewPlanDetail(prev => ({ ...prev, area: e.target.value }))}
                  placeholder="Area (e.g., 1000 sqft)"
                  className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                />
                <Input
                  value={newPlanDetail.price}
                  onChange={(e) => setNewPlanDetail(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="Price (e.g., 60L)"
                  className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                />
                <Button
                  type="button"
                  onClick={handlePlanDetailAdd}
                  className="h-12 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-2">
                {formData.planDetails.map((plan, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-cyan-50 rounded-lg border border-cyan-200">
                    <div className="flex space-x-4">
                      <Badge variant="outline" className="bg-white text-cyan-800 border-cyan-300">
                        {plan.type}
                      </Badge>
                      <span className="text-cyan-800 font-medium">{plan.area}</span>
                      <span className="text-cyan-800 font-semibold">{plan.price}</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePlanDetailRemove(index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Project Images */}
          <Card className="rounded-2xl shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
              <CardTitle className="text-2xl font-bold text-gray-800 flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg mr-3">
                  <Camera className="h-6 w-6 text-blue-600" />
                </div>
                Project Images
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {projectImageURLs.map((url, index) => (
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
                          onClick={() => removeImage('project', index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      {projectMainIndex === index && (
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
                      onClick={() => setProjectMainIndex(index)}
                    >
                      {projectMainIndex === index ? "Main Image" : "Set as Main"}
                    </Button>
                  </div>
                ))}
                {projectImageURLs.length < 10 && (
                  <label className="border-2 border-dashed border-gray-300 rounded-lg h-36 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload('project', e)}
                      className="hidden"
                    />
                    <Upload className="h-8 w-8 text-blue-500 mb-2" />
                    <span className="text-sm text-blue-600 font-medium">
                      Upload Image
                    </span>
                    <span className="text-xs text-gray-500 mt-1">
                      {projectImageURLs.length}/10 images
                    </span>
                  </label>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Amenity Images */}
          <Card className="rounded-2xl shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-100">
              <CardTitle className="text-2xl font-bold text-gray-800 flex items-center">
                <div className="p-2 bg-green-100 rounded-lg mr-3">
                  <Camera className="h-6 w-6 text-green-600" />
                </div>
                Amenity Images
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {amenityImageURLs.map((url, index) => (
                  <div key={index} className="relative group">
                    <div className="relative w-full h-36 border rounded-lg overflow-hidden">
                      <img src={url} alt={`Amenity ${index + 1}`} className="object-cover w-full h-full" />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                        <Button type="button" size="icon" variant="destructive" className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 h-8 w-8" onClick={() => removeImage('amenity', index)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      {amenityMainIndex === index && <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">Main</div>}
                    </div>
                    <Button type="button" variant="outline" size="sm" className="w-full mt-2" onClick={() => setAmenityMainIndex(index)}>
                      {amenityMainIndex === index ? "Main Image" : "Set as Main"}
                    </Button>
                  </div>
                ))}
                {amenityImageURLs.length < 10 && (
                  <label className="border-2 border-dashed border-gray-300 rounded-lg h-36 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload('amenity', e)} className="hidden" />
                    <Upload className="h-8 w-8 text-blue-500 mb-2" />
                    <span className="text-sm text-blue-600 font-medium">Upload Image</span>
                    <span className="text-xs text-gray-500 mt-1">{amenityImageURLs.length}/10 images</span>
                  </label>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Floor Plan Images */}
          <Card className="rounded-2xl shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-100">
              <CardTitle className="text-2xl font-bold text-gray-800 flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg mr-3">
                  <Camera className="h-6 w-6 text-purple-600" />
                </div>
                Floor Plan Images
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {floorImageURLs.map((url, index) => (
                  <div key={index} className="relative group">
                    <div className="relative w-full h-36 border rounded-lg overflow-hidden">
                      <img src={url} alt={`Floor ${index + 1}`} className="object-cover w-full h-full" />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                        <Button type="button" size="icon" variant="destructive" className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 h-8 w-8" onClick={() => removeImage('floor', index)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      {floorMainIndex === index && <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">Main</div>}
                    </div>
                    <Button type="button" variant="outline" size="sm" className="w-full mt-2" onClick={() => setFloorMainIndex(index)}>
                      {floorMainIndex === index ? "Main Image" : "Set as Main"}
                    </Button>
                  </div>
                ))}
                {floorImageURLs.length < 10 && (
                  <label className="border-2 border-dashed border-gray-300 rounded-lg h-36 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload('floor', e)} className="hidden" />
                    <Upload className="h-8 w-8 text-blue-500 mb-2" />
                    <span className="text-sm text-blue-600 font-medium">Upload Image</span>
                    <span className="text-xs text-gray-500 mt-1">{floorImageURLs.length}/10 images</span>
                  </label>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Amenities */}
          <Card className="rounded-2xl shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 border-b border-gray-100">
              <CardTitle className="text-2xl font-bold text-gray-800 flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg mr-3">
                  <Check className="h-6 w-6 text-orange-600" />
                </div>
                Amenities
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
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

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={saving}
              className="h-14 px-8 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              {saving ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Updating Project...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5 mr-2" />
                  Update Project
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateProject;

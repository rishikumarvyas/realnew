import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Building, 
  Star, 
  IndianRupee, 
  Home, 
  CheckCircle, 
  XCircle,
  Clock,
  Users,
  Ruler,
  Camera,
  Award,
  Shield,
  FileText
} from "lucide-react";
import axiosInstance from "@/axiosCalls/axiosInstance";
import { Loader2 } from "lucide-react";

interface Project {
  builderId: string;
  projectId: string;
  name: string;
  description: string;
  address: string;
  locality: string;
  possession: string;
  isNA: boolean;
  isReraApproved: boolean;
  isOCApproved: boolean;
  mainImage: {
    url: string;
    isMain: boolean;
  };
  projectType: string;
  price: string;
  beds: string;
  area: string;
  status: string;
  city: string;
  state: string;
  isActive: boolean;
}

const GetProject = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { projectId } = useParams();
  
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("Fetching projects for builder ID: cc8011ef-8493-4543-84df-01bae14e4d06");
      console.log("Looking for project ID:", projectId);
      
      // Get all projects for the specific builder
      const response = await axiosInstance.post("/api/Builder/GetProjects", {
        BuilderId: "cc8011ef-8493-4543-84df-01bae14e4d06"
      });

      console.log("API Response:", response.data);

      if (response.data.statusCode === 200 && response.data.data && response.data.data.length > 0) {
        // Find the specific project by projectId
        const foundProject = response.data.data.find((p: any) => p.projectId === projectId);
        
        if (foundProject) {
          console.log("Found project:", foundProject);
          
          // Map the API response to our interface
          const mappedProject: Project = {
            builderId: foundProject.builderId || foundProject.BuilderId || "cc8011ef-8493-4543-84df-01bae14e4d06",
            projectId: foundProject.projectId || foundProject.ProjectId || projectId || "",
            name: foundProject.name || foundProject.Name || foundProject.projectName || "",
            description: foundProject.description || foundProject.Description || "",
            address: foundProject.address || foundProject.Address || "",
            locality: foundProject.locality || foundProject.Locality || "",
            possession: foundProject.possession || foundProject.Possession || "",
            isNA: foundProject.isNA || foundProject.IsNA || false,
            isReraApproved: foundProject.isReraApproved || foundProject.IsReraApproved || false,
            isOCApproved: foundProject.isOCApproved || foundProject.IsOCApproved || false,
            mainImage: {
              url: foundProject.mainImage?.url || foundProject.MainImage?.url || foundProject.imageUrl || "",
              isMain: foundProject.mainImage?.isMain || foundProject.MainImage?.isMain || true
            },
            projectType: foundProject.projectType || foundProject.ProjectType || "",
            price: foundProject.price || foundProject.Price || "0",
            beds: foundProject.beds || foundProject.Beds || "0",
            area: foundProject.area || foundProject.Area || "0",
            status: foundProject.status || foundProject.Status || "",
            city: foundProject.city || foundProject.City || "",
            state: foundProject.state || foundProject.State || "",
            isActive: foundProject.isActive || foundProject.IsActive || true
          };
          
          console.log("Mapped project data:", mappedProject);
          setProject(mappedProject);
        } else {
          console.log("Project not found in builder's projects");
          setError("Project not found");
        }
      } else {
        console.log("No projects found for builder");
        setError("No projects found for this builder");
      }
    } catch (error: any) {
      console.error("Error fetching project:", error);
      console.error("Error response:", error.response?.data);
      setError("Failed to load project information");
      toast({
        title: "Error",
        description: "Failed to load project information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: string) => {
    const numPrice = parseInt(price);
    if (numPrice >= 10000000) {
      return `₹${(numPrice / 10000000).toFixed(2)} Cr`;
    } else if (numPrice >= 100000) {
      return `₹${(numPrice / 100000).toFixed(2)} Lakh`;
    } else {
      return `₹${numPrice.toLocaleString()}`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading project information...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building className="h-8 w-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Project Not Found</h1>
            <p className="text-gray-600 mb-6">{error || "The project you're looking for doesn't exist."}</p>
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center space-x-2">
              <Building className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-600">Project Details</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Project Header */}
        <Card className="mb-8 shadow-xl border-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white">
          <CardContent className="p-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-6 lg:space-y-0 lg:space-x-8">
              {/* Project Image */}
              <div className="flex-shrink-0">
                <div className="w-32 h-32 bg-white/20 rounded-2xl flex items-center justify-center overflow-hidden">
                  {project.mainImage?.url ? (
                    <img
                      src={project.mainImage.url}
                      alt={project.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Building className="h-16 w-16 text-white/80" />
                  )}
                </div>
              </div>

              {/* Project Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-3xl font-bold text-white">{project.name}</h1>
                  <Badge 
                    variant={project.isActive ? "default" : "secondary"}
                    className={project.isActive ? "bg-green-500 hover:bg-green-600" : "bg-gray-500"}
                  >
                    {project.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                
                <div className="flex items-center space-x-2 text-white/90 mb-2">
                  <MapPin className="h-4 w-4" />
                  <span className="text-lg">{project.address}, {project.locality}, {project.city}, {project.state}</span>
                </div>

                <div className="flex flex-wrap items-center space-x-6 text-white/80">
                  <div className="flex items-center space-x-2">
                    <IndianRupee className="h-4 w-4" />
                    <span className="text-xl font-bold">{formatPrice(project.price)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Home className="h-4 w-4" />
                    <span>{project.beds} BHK</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Ruler className="h-4 w-4" />
                    <span>{project.area} sq ft</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Project Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Project Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Details */}
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b">
                <CardTitle className="flex items-center text-gray-800">
                  <FileText className="h-5 w-5 text-blue-600 mr-2" />
                  Project Information
                </CardTitle>
                <CardDescription>
                  Detailed information about this project
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Description</h4>
                    <p className="text-gray-600">{project.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Building className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Project Type</p>
                        <p className="font-semibold text-gray-900">{project.projectType}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Clock className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Status</p>
                        <p className="font-semibold text-gray-900">{project.status}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Possession</p>
                        <p className="font-semibold text-gray-900">{project.possession}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <Home className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Configuration</p>
                        <p className="font-semibold text-gray-900">{project.beds} BHK</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location Details */}
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-green-50 to-white border-b">
                <CardTitle className="flex items-center text-gray-800">
                  <MapPin className="h-5 w-5 text-green-600 mr-2" />
                  Location Details
                </CardTitle>
                <CardDescription>
                  Project location and address information
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-green-600 mt-1" />
                    <div>
                      <p className="font-semibold text-gray-900">{project.address}</p>
                      <p className="text-gray-600">{project.locality}, {project.city}, {project.state}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Project Status */}
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-white border-b">
                <CardTitle className="flex items-center text-gray-800">
                  <Award className="h-5 w-5 text-purple-600 mr-2" />
                  Project Status
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-600">RERA Approved</span>
                    {project.isReraApproved ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-600">OC Approved</span>
                    {project.isOCApproved ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-600">Not Applicable</span>
                    {project.isNA ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pricing Information */}
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-yellow-50 to-white border-b">
                <CardTitle className="flex items-center text-gray-800">
                  <IndianRupee className="h-5 w-5 text-yellow-600 mr-2" />
                  Pricing
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {formatPrice(project.price)}
                  </div>
                  <p className="text-sm text-gray-600">Starting Price</p>
                </div>
              </CardContent>
            </Card>

            {/* Project Specifications */}
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-white border-b">
                <CardTitle className="flex items-center text-gray-800">
                  <Ruler className="h-5 w-5 text-indigo-600 mr-2" />
                  Specifications
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Area</span>
                    <span className="font-semibold">{project.area} sq ft</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Configuration</span>
                    <span className="font-semibold">{project.beds} BHK</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Type</span>
                    <span className="font-semibold">{project.projectType}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => navigate(`/builder/${project.builderId}`)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Building className="h-5 w-5 mr-2" />
            View Builder
          </Button>
          
          <Button
            variant="outline"
            onClick={() => navigate(`/builderpost`)}
            className="border-green-600 text-green-600 hover:bg-green-50 px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Home className="h-5 w-5 mr-2" />
            Post New Project
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GetProject;

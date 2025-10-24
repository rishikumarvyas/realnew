import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import axiosInstance from "@/axiosCalls/axiosInstance";
import { 
  ArrowLeft,
  MapPin, 
  Building, 
  Calendar,
  DollarSign,
  Home,
  Users,
  Ruler,
  Loader2,
  Phone,
  Mail,
  Share2,
  Heart,
  Download,
  Star,
  CheckCircle,
  Clock,
  Award,
  TreePine,
  Wifi,
  Shield,
  Car,
  Dumbbell,
  Waves,
  Gamepad2
} from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface ProjectDetail {
  projectId: string;
  name: string;
  projectType: string;
  description: string;
  price: string;
  area: string;
  beds: string;
  status: string;
  possession: string;
  address: string;
  locality: string;
  city: string;
  state: string;
  builderName: string;
  builderId: string;
  reraNumber: string;
  reraDate: string;
  projectAreaAcres: string;
  launchDate: string;
  expectedCompletionDate: string;
  ocDate: string;
  isNA: boolean;
  isReraApproved: boolean;
  isOCApproved: boolean;
  projectImages: Array<{
    url: string;
    isMain: boolean;
  }>;
  amenityImages: Array<{
    url: string;
    isMain: boolean;
  }>;
  floorImages: Array<{
    url: string;
    isMain: boolean;
  }>;
  exclusiveFeatures: string[];
  planDetails: Array<{
    type: string;
    area: string;
    price: string;
  }>;
  amenities: Array<{
    id: string;
    name: string;
    category: string;
  }>;
}

const ProjectDetailAPI = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [isFavorite, setIsFavorite] = useState(false);

  // Fetch project details from API
  const fetchProjectDetails = async () => {
    if (!projectId) {
      toast.error("Project ID not found");
      navigate("/get-project-api");
      return;
    }

    try {
      setLoading(true);
      const response = await axiosInstance.get(`/api/Builder/GetProjectDetails?projectId=${projectId}`);
      
      if (response.data.statusCode === 200 && response.data.data) {
        setProject(response.data.data);
      } else {
        toast.error("Project not found");
        navigate("/get-project-api");
      }
    } catch (error: any) {
      console.error("Error fetching project details:", error);
      toast.error("Failed to fetch project details. Please try again.");
      navigate("/get-project-api");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectDetails();
  }, [projectId]);

  // Helper functions
  const formatPrice = (price: string) => {
    if (!price) return "Price on Request";
    const numPrice = parseFloat(price);
    if (numPrice >= 10000000) {
      return `₹${(numPrice / 10000000).toFixed(2)} Cr`;
    } else if (numPrice >= 100000) {
      return `₹${(numPrice / 100000).toFixed(2)} L`;
    }
    return `₹${numPrice.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "TBD";
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "new launch":
      case "upcoming":
        return "bg-blue-600";
      case "under construction":
        return "bg-yellow-500";
      case "completed":
        return "bg-green-600";
      case "ready to move":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const getAmenityIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case "sports":
        return <Dumbbell className="h-6 w-6" />;
      case "recreation":
        return <Gamepad2 className="h-6 w-6" />;
      case "lifestyle":
        return <Star className="h-6 w-6" />;
      case "security":
        return <Shield className="h-6 w-6" />;
      case "parking":
        return <Car className="h-6 w-6" />;
      case "nature":
        return <TreePine className="h-6 w-6" />;
      case "water":
        return <Waves className="h-6 w-6" />;
      case "connectivity":
        return <Wifi className="h-6 w-6" />;
      default:
        return <Award className="h-6 w-6" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading project details...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Project not found</h3>
          <p className="text-gray-600 mb-4">The project you're looking for doesn't exist.</p>
          <Button onClick={() => navigate("/get-project-api")}>
            Back to Projects
          </Button>
        </div>
      </div>
    );
  }

  const mainImage = project.projectImages?.find(img => img.isMain)?.url || 
                   project.projectImages?.[0]?.url || 
                   "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=1200&q=80";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-[60vh] w-full">
        <img
          src={mainImage}
          alt={project.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        
        {/* Back Button */}
        <div className="absolute top-4 left-4 z-10">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
            className="bg-white/90 hover:bg-white text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        {/* Favorite Button */}
        <div className="absolute top-4 right-4 z-10">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFavorite(!isFavorite)}
            className={`${isFavorite ? 'bg-red-500 text-white border-red-500' : 'bg-white/90 hover:bg-white text-gray-900'}`}
          >
            <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
          </Button>
        </div>

        {/* Project Info */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge className={`${getStatusColor(project.status)} text-white`}>
                {project.status}
              </Badge>
              <Badge className="bg-white/20 text-white border-white/30">
                {project.projectType}
              </Badge>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{project.name}</h1>
            <div className="flex flex-wrap items-center gap-4 text-lg">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                <span>{project.locality}, {project.city}, {project.state}</span>
              </div>
              <div className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                <span>{project.builderName}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="sticky top-0 bg-white shadow-sm border-b z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto">
            {[
              { id: "overview", label: "Overview" },
              { id: "amenities", label: "Amenities" },
              { id: "plans", label: "Floor Plans" },
              { id: "location", label: "Location" },
              { id: "gallery", label: "Gallery" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Key Details */}
            <Card>
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center p-4 border rounded-lg">
                    <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-1">Starting Price</p>
                    <p className="text-xl font-bold">{formatPrice(project.price)}</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Home className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-1">Configuration</p>
                    <p className="text-xl font-bold">{project.beds}</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Ruler className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-1">Area</p>
                    <p className="text-xl font-bold">{project.area} sq ft</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Calendar className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-1">Possession</p>
                    <p className="text-xl font-bold">{project.possession}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>About {project.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{project.description}</p>
              </CardContent>
            </Card>

            {/* Project Information */}
            <Card>
              <CardHeader>
                <CardTitle>Project Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">RERA Number:</span>
                      <span className="font-medium">{project.reraNumber || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">RERA Date:</span>
                      <span className="font-medium">{formatDate(project.reraDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Project Area:</span>
                      <span className="font-medium">{project.projectAreaAcres} acres</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Launch Date:</span>
                      <span className="font-medium">{formatDate(project.launchDate)}</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Expected Completion:</span>
                      <span className="font-medium">{formatDate(project.expectedCompletionDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">OC Date:</span>
                      <span className="font-medium">{formatDate(project.ocDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">RERA Approved:</span>
                      <span className="font-medium">
                        {project.isReraApproved ? (
                          <CheckCircle className="h-5 w-5 text-green-600 inline" />
                        ) : (
                          <Clock className="h-5 w-5 text-yellow-600 inline" />
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">OC Approved:</span>
                      <span className="font-medium">
                        {project.isOCApproved ? (
                          <CheckCircle className="h-5 w-5 text-green-600 inline" />
                        ) : (
                          <Clock className="h-5 w-5 text-yellow-600 inline" />
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Exclusive Features */}
            {project.exclusiveFeatures && project.exclusiveFeatures.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Exclusive Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {project.exclusiveFeatures.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                        <Star className="h-5 w-5 text-blue-600" />
                        <span className="font-medium">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                <Phone className="h-5 w-5 mr-2" />
                Contact Builder
              </Button>
              <Button size="lg" variant="outline">
                <Download className="h-5 w-5 mr-2" />
                Download Brochure
              </Button>
              <Button size="lg" variant="outline">
                <Share2 className="h-5 w-5 mr-2" />
                Share
              </Button>
            </div>
          </div>
        )}

        {/* Amenities Tab */}
        {activeTab === "amenities" && (
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Project Amenities</CardTitle>
              </CardHeader>
              <CardContent>
                {project.amenities && project.amenities.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {project.amenities.map((amenity) => (
                      <div key={amenity.id} className="flex items-center space-x-4 p-4 border rounded-lg hover:shadow-md transition-shadow">
                        <div className="text-blue-600">
                          {getAmenityIcon(amenity.category)}
                        </div>
                        <div>
                          <h4 className="font-medium">{amenity.name}</h4>
                          <p className="text-sm text-gray-600">{amenity.category}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 text-center py-8">No amenities information available.</p>
                )}
              </CardContent>
            </Card>

            {/* Amenity Images */}
            {project.amenityImages && project.amenityImages.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Amenity Gallery</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {project.amenityImages.map((image, index) => (
                      <div key={index} className="aspect-square overflow-hidden rounded-lg">
                        <img
                          src={image.url}
                          alt={`Amenity ${index + 1}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Plans Tab */}
        {activeTab === "plans" && (
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Floor Plans</CardTitle>
              </CardHeader>
              <CardContent>
                {project.planDetails && project.planDetails.length > 0 ? (
                  <div className="space-y-6">
                    {project.planDetails.map((plan, index) => (
                      <div key={index} className="border rounded-lg p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Type</p>
                            <p className="text-lg font-semibold">{plan.type}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Area</p>
                            <p className="text-lg font-semibold">{plan.area} sq ft</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Price</p>
                            <p className="text-lg font-semibold">{formatPrice(plan.price)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 text-center py-8">No floor plan information available.</p>
                )}
              </CardContent>
            </Card>

            {/* Floor Plan Images */}
            {project.floorImages && project.floorImages.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Floor Plan Images</CardTitle>
                </CardHeader>
                <CardContent>
                  <Carousel className="w-full">
                    <CarouselContent>
                      {project.floorImages.map((image, index) => (
                        <CarouselItem key={index}>
                          <div className="aspect-[4/3] overflow-hidden rounded-lg">
                            <img
                              src={image.url}
                              alt={`Floor Plan ${index + 1}`}
                              className="w-full h-full object-contain bg-gray-100"
                            />
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                  </Carousel>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Location Tab */}
        {activeTab === "location" && (
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Location Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Address</p>
                    <p className="font-medium">{project.address}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Locality</p>
                    <p className="font-medium">{project.locality}, {project.city}, {project.state}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Map Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle>Location Map</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Interactive map will be displayed here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Gallery Tab */}
        {activeTab === "gallery" && (
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Project Gallery</CardTitle>
              </CardHeader>
              <CardContent>
                {project.projectImages && project.projectImages.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {project.projectImages.map((image, index) => (
                      <div key={index} className="aspect-square overflow-hidden rounded-lg group cursor-pointer">
                        <img
                          src={image.url}
                          alt={`Project ${index + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 text-center py-8">No project images available.</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetailAPI;

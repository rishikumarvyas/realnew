import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  MapPin,
  Building,
  Calendar,
  DollarSign,
  Home,
  Users,
  Ruler,
  Image as ImageIcon,
  CheckCircle,
  XCircle,
  List,
  Tag,
  Square,
  Clock,
  FileText,
  Award,
  Sparkles,
  LayoutGrid,
  Phone,
  Mail,
  User,
  Star,
  Shield,
  Zap,
} from "lucide-react";
import axiosInstance from "@/axiosCalls/axiosInstance";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

// Define comprehensive interface for ProjectDetail
interface ProjectImage {
  url: string;
  isMain: boolean;
}

interface PlanDetail {
  type: string;
  area: string;
  price: string;
}

interface ProjectDetailData {
  builderId: string;
  projectId: string;
  name: string;
  description: string;
  address: string;
  locality: string;
  city: string | null;
  state: string | null;
  possession: string | null;
  isNA: boolean;
  isReraApproved: boolean;
  isOCApproved: boolean;
  projectType: string | null;
  price: string | null;
  beds: string | null;
  area: string | null;
  areaInAcres: string | null;
  status: string | null;
  isActive: boolean;
  reraNumber: string | null;
  reraDate: string | null;
  launchDate: string | null;
  expectedCompletionDate: string | null;
  ocDate: string | null;
  contactPerson: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  projectImages: ProjectImage[];
  amenityImages: ProjectImage[];
  floorImages: ProjectImage[];
  exclusiveFeatures: string[];
  planDetails: PlanDetail[];
}

const ProjectDetail = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [project, setProject] = useState<ProjectDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      if (!projectId) {
        setError("Project ID is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Use the GetProjectDetails API endpoint
        const response = await axiosInstance.get(`/api/Builder/GetProjectDetails?projectId=${projectId}`);

        if (response.data.statusCode === 200 && response.data.data) {
          setProject(response.data.data);
        } else {
          setError(response.data.message || "Failed to fetch project details.");
          toast({
            title: "Error",
            description: response.data.message || "Failed to fetch project details.",
            variant: "destructive",
          });
        }
      } catch (err: any) {
        console.error("Error fetching project details:", err);
        setError(err.response?.data?.message || "An unexpected error occurred while fetching project details.");
        toast({
          title: "Error",
          description: err.response?.data?.message || "An unexpected error occurred.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProjectDetails();
  }, [projectId, toast]);

  const getStatusColor = (status: string | null) => {
    if (!status) return 'bg-gray-100 text-gray-800 border-gray-200';
    switch (status.toLowerCase()) {
      case 'active':
      case 'upcoming':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'on hold':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getProjectTypeColor = (type: string | null) => {
    if (!type) return 'bg-gray-100 text-gray-800 border-gray-200';
    switch (type.toLowerCase()) {
      case 'residential':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'commercial':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'both':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
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

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Project</h1>
            <p className="text-gray-600 mb-6">{error}</p>
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

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building className="h-8 w-8 text-gray-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Project Not Found</h1>
            <p className="text-gray-600 mb-6">The project you're looking for doesn't exist.</p>
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

  const allImages = [
    ...(project.projectImages || []),
    ...(project.amenityImages || []),
    ...(project.floorImages || []),
  ].filter(img => img.url);

  const mainImageUrl = project.projectImages?.find(img => img.isMain)?.url || allImages[0]?.url;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/10 to-cyan-400/10 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-6 text-gray-600 hover:text-gray-800 hover:bg-white/50 backdrop-blur-sm transition-all duration-300 rounded-full px-4 py-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
          
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                <Building className="h-10 w-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  {project.name}
                </h1>
                <p className="text-gray-600 mt-2 text-lg flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {[project.locality, project.city, project.state].filter(Boolean).join(', ') || 'Location not specified'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {project.status && (
                <Badge className={`text-sm font-medium border ${getStatusColor(project.status)}`}>
                  {project.status}
                </Badge>
              )}
              {project.projectType && (
                <Badge className={`text-sm font-medium border ${getProjectTypeColor(project.projectType)}`}>
                  {project.projectType}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Images & Overview */}
          <div className="lg:col-span-2 space-y-8">
            {/* Project Images Carousel */}
            {allImages.length > 0 ? (
              <Card className="overflow-hidden rounded-2xl shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-0">
                  <Carousel className="w-full">
                    <CarouselContent>
                      {allImages.map((img, index) => (
                        <CarouselItem key={index}>
                          <div className="relative w-full h-[500px] bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                            <img
                              src={img.url}
                              alt={`Project Image ${index + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => { 
                                e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%236b7280' font-family='Arial' font-size='18'%3ENo Image Available%3C/text%3E%3C/svg%3E";
                              }}
                            />
                            {img.isMain && (
                              <Badge className="absolute top-4 left-4 bg-blue-600 text-white shadow-lg">
                                <Star className="h-3 w-3 mr-1" />
                                Main Image
                              </Badge>
                            )}
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious className="ml-4" />
                    <CarouselNext className="mr-4" />
                  </Carousel>
                </CardContent>
              </Card>
            ) : (
              <Card className="rounded-2xl shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-8 flex items-center justify-center h-[400px] text-gray-500">
                  <div className="text-center">
                    <ImageIcon className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg">No images available</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Project Description */}
            <Card className="rounded-2xl shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
                <CardTitle className="text-2xl font-bold text-gray-800 flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg mr-3">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  Project Description
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <CardDescription className="text-gray-700 leading-relaxed text-lg">
                  {project.description || "No description provided for this project."}
                </CardDescription>
              </CardContent>
            </Card>

            {/* Exclusive Features */}
            {project.exclusiveFeatures && project.exclusiveFeatures.length > 0 && (
              <Card className="rounded-2xl shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-100">
                  <CardTitle className="text-2xl font-bold text-gray-800 flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg mr-3">
                      <Sparkles className="h-6 w-6 text-purple-600" />
                    </div>
                    Exclusive Features
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {project.exclusiveFeatures.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <Zap className="h-4 w-4 text-purple-600" />
                        </div>
                        <span className="font-medium text-purple-800">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Plan Details */}
            {project.planDetails && project.planDetails.length > 0 && (
              <Card className="rounded-2xl shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-100">
                  <CardTitle className="text-2xl font-bold text-gray-800 flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg mr-3">
                      <LayoutGrid className="h-6 w-6 text-green-600" />
                    </div>
                    Plan Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gradient-to-r from-green-50 to-emerald-50">
                        <tr>
                          <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                            Type
                          </th>
                          <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                            Area
                          </th>
                          <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                            Price
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {project.planDetails.map((plan, index) => (
                          <tr key={index} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{plan.type}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{plan.area}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">{plan.price}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column: Details & Status */}
          <div className="lg:col-span-1 space-y-8">
            {/* Key Details */}
            <Card className="rounded-2xl shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
                <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg mr-3">
                    <List className="h-5 w-5 text-blue-600" />
                  </div>
                  Key Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600 flex items-center gap-2"><Tag className="h-4 w-4 text-gray-500" /> Project ID:</span>
                  <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200 font-mono text-xs">{project.projectId}</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600 flex items-center gap-2"><Building className="h-4 w-4 text-gray-500" /> Builder ID:</span>
                  <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200 font-mono text-xs">{project.builderId}</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600 flex items-center gap-2"><Home className="h-4 w-4 text-gray-500" /> Project Type:</span>
                  <Badge className={`font-medium border ${getProjectTypeColor(project.projectType)}`}>
                    {project.projectType || 'N/A'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600 flex items-center gap-2"><DollarSign className="h-4 w-4 text-gray-500" /> Price:</span>
                  <span className="font-bold text-green-600">{project.price || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600 flex items-center gap-2"><Ruler className="h-4 w-4 text-gray-500" /> Area (sqft):</span>
                  <span className="text-gray-700 font-medium">{project.area || 'N/A'}</span>
                </div>
                {project.areaInAcres && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600 flex items-center gap-2"><Square className="h-4 w-4 text-gray-500" /> Area (Acres):</span>
                    <span className="text-gray-700 font-medium">{project.areaInAcres}</span>
                  </div>
                )}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600 flex items-center gap-2"><Users className="h-4 w-4 text-gray-500" /> Beds:</span>
                  <span className="text-gray-700 font-medium">{project.beds || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600 flex items-center gap-2"><Calendar className="h-4 w-4 text-gray-500" /> Possession:</span>
                  <span className="text-gray-700 font-medium">{project.possession || 'N/A'}</span>
                </div>
              </CardContent>
            </Card>

            {/* Status & Approvals */}
            <Card className="rounded-2xl shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-100">
                <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg mr-3">
                    <Shield className="h-5 w-5 text-green-600" />
                  </div>
                  Status & Approvals
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600 flex items-center gap-2"><Clock className="h-4 w-4 text-gray-500" /> Current Status:</span>
                  <Badge className={`font-medium border ${getStatusColor(project.status)}`}>
                    {project.status || 'Unknown'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600 flex items-center gap-2"><Award className="h-4 w-4 text-gray-500" /> RERA Approved:</span>
                  {project.isReraApproved ? (
                    <Badge className="bg-green-100 text-green-800 border-green-200 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Yes
                    </Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-800 border-red-200 flex items-center gap-1">
                      <XCircle className="h-3 w-3" />
                      No
                    </Badge>
                  )}
                </div>
                {project.reraNumber && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600 flex items-center gap-2"><FileText className="h-4 w-4 text-gray-500" /> RERA Number:</span>
                    <span className="text-gray-700 font-medium">{project.reraNumber}</span>
                  </div>
                )}
                {project.reraDate && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600 flex items-center gap-2"><Calendar className="h-4 w-4 text-gray-500" /> RERA Date:</span>
                    <span className="text-gray-700 font-medium">{project.reraDate}</span>
                  </div>
                )}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600 flex items-center gap-2"><CheckCircle className="h-4 w-4 text-gray-500" /> OC Approved:</span>
                  {project.isOCApproved ? (
                    <Badge className="bg-green-100 text-green-800 border-green-200 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Yes
                    </Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-800 border-red-200 flex items-center gap-1">
                      <XCircle className="h-3 w-3" />
                      No
                    </Badge>
                  )}
                </div>
                {project.ocDate && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600 flex items-center gap-2"><Calendar className="h-4 w-4 text-gray-500" /> OC Date:</span>
                    <span className="text-gray-700 font-medium">{project.ocDate}</span>
                  </div>
                )}
                {project.launchDate && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600 flex items-center gap-2"><Calendar className="h-4 w-4 text-gray-500" /> Launch Date:</span>
                    <span className="text-gray-700 font-medium">{project.launchDate}</span>
                  </div>
                )}
                {project.expectedCompletionDate && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600 flex items-center gap-2"><Calendar className="h-4 w-4 text-gray-500" /> Expected Completion:</span>
                    <span className="text-gray-700 font-medium">{project.expectedCompletionDate}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Contact Information */}
            {(project.contactPerson || project.contactEmail || project.contactPhone) && (
              <Card className="rounded-2xl shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 border-b border-gray-100">
                  <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
                    <div className="p-2 bg-orange-100 rounded-lg mr-3">
                      <User className="h-5 w-5 text-orange-600" />
                    </div>
                    Contact Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {project.contactPerson && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600 flex items-center gap-2"><User className="h-4 w-4 text-gray-500" /> Contact Person:</span>
                      <span className="text-gray-700 font-medium">{project.contactPerson}</span>
                    </div>
                  )}
                  {project.contactEmail && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600 flex items-center gap-2"><Mail className="h-4 w-4 text-gray-500" /> Email:</span>
                      <a href={`mailto:${project.contactEmail}`} className="text-blue-600 hover:underline font-medium">{project.contactEmail}</a>
                    </div>
                  )}
                  {project.contactPhone && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600 flex items-center gap-2"><Phone className="h-4 w-4 text-gray-500" /> Phone:</span>
                      <a href={`tel:${project.contactPhone}`} className="text-blue-600 hover:underline font-medium">{project.contactPhone}</a>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;

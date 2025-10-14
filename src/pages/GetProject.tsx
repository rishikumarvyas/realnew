import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  MapPin, 
  Building, 
  Search, 
  Filter,
  Eye,
  Edit,
  Calendar,
  DollarSign,
  Home,
  Users,
  Ruler
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
  } | null;
  projectType: string | null;
  price: string | null;
  beds: string | null;
  area: string | null;
  status: string | null;
  city: string | null;
  state: string | null;
  isActive: boolean;
}

interface ProjectResponse {
  data: Project[];
  statusCode: number;
  message: string;
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

const GetProject = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { projectId } = useParams();
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [selectedBuilder, setSelectedBuilder] = useState<string>("");

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    // Filter projects based on search term and builder
    let filtered = projects;
    
    if (searchTerm) {
      filtered = filtered.filter(project => 
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.state.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedBuilder) {
      filtered = filtered.filter(project => project.builderId === selectedBuilder);
    }
    
    setFilteredProjects(filtered);
  }, [projects, searchTerm, selectedBuilder]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axiosInstance.post("/api/Builder/GetProjects", {
        builderId: "",
        projectId: "",
        searchTerm: "",
        pageNumber: 0,
        pageSize: 100
      });

      if (response.data.statusCode === 200) {
        setProjects(response.data.data || []);
      } else {
        setError("Failed to load projects");
      }
    } catch (error: any) {
      console.error("Error fetching projects:", error);
      setError("Failed to load projects");
      toast({
        title: "Error",
        description: "Failed to load projects. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading projects...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building className="h-8 w-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Projects</h1>
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
              <span className="text-sm font-medium text-gray-600">All Projects</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">All Projects</h1>
              <p className="text-gray-600">Browse and manage all builder projects</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="text-blue-600 border-blue-200">
                {filteredProjects.length} Projects
              </Badge>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <Card className="mb-8 shadow-lg border-0">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search projects by name, description, city, or state..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-12 border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 rounded-xl"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">Filters:</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <Card className="shadow-lg border-0">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Projects Found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm ? "No projects match your search criteria." : "No projects available at the moment."}
              </p>
              {searchTerm && (
                <Button
                  onClick={() => setSearchTerm("")}
                  variant="outline"
                  className="border-blue-600 text-blue-600 hover:bg-blue-50"
                >
                  Clear Search
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <Card key={project.projectId} className="shadow-lg border-0 hover:shadow-xl transition-all duration-300 group">
                <CardHeader className="p-0">
                  <div className="relative h-48 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-t-xl overflow-hidden">
                    {project.mainImage?.url ? (
                      <img
                        src={project.mainImage.url}
                        alt={project.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Building className="h-16 w-16 text-blue-400" />
                      </div>
                    )}
                    <div className="absolute top-4 right-4 flex flex-col space-y-2">
                      <Badge className={`text-xs font-medium border ${getStatusColor(project.status)}`}>
                        {project.status || 'Unknown'}
                      </Badge>
                      <Badge className={`text-xs font-medium border ${getProjectTypeColor(project.projectType)}`}>
                        {project.projectType || 'Unknown'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                        {project.name}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {project.description}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span>
                          {[project.locality, project.city, project.state].filter(Boolean).join(', ') || 'Location not specified'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <span className="font-semibold text-gray-900">{project.price || 'Price not available'}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Ruler className="h-4 w-4 text-blue-600" />
                          <span className="text-gray-600">{project.area || 'Area not specified'}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Home className="h-4 w-4 text-purple-600" />
                          <span className="text-gray-600">{project.beds || 'Beds not specified'}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-orange-600" />
                          <span className="text-gray-600">{project.possession || 'Possession not specified'}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center space-x-2">
                          {project.isReraApproved && (
                            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                              RERA
                            </Badge>
                          )}
                          {project.isOCApproved && (
                            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                              OC
                            </Badge>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => navigate(`/project-detail/${project.projectId}`)}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => navigate(`/update-project/${project.projectId}`)}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Update Project
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GetProject;
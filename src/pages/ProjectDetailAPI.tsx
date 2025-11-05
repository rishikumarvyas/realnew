import { useState, useEffect, useRef } from "react";
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
  Heart,
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
import PropertyMap from "@/components/PropertyMap";

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
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");
  const overviewRef = useRef<HTMLDivElement>(null);
  const amenitiesRef = useRef<HTMLDivElement>(null);
  const plansRef = useRef<HTMLDivElement>(null);
  const locationRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);

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
        const projectData = response.data.data;
        
        // Transform amenities if needed
        if (projectData.amenityDetails && Array.isArray(projectData.amenityDetails)) {
          const allAmenities = JSON.parse(localStorage.getItem("amenities") || "[]");
          projectData.amenities = projectData.amenityDetails.map((item: any) => {
            const amenity = allAmenities.find((a: any) => a.id === item.amenityId);
            return {
              id: item.amenityId,
              name: amenity?.amenity || item.amenity || "Unknown",
              category: "General" // Default category, can be enhanced later
            };
          });
        } else if (!projectData.amenities) {
          projectData.amenities = [];
        }
        
        console.log("Transformed project amenities:", projectData.amenities);
        setProject(projectData);
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

  // Scroll animation observer
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in');
          entry.target.classList.remove('opacity-0', 'translate-y-8');
        }
      });
    }, observerOptions);

    const refs = [overviewRef, amenitiesRef, plansRef, locationRef, galleryRef];
    refs.forEach((ref) => {
      if (ref.current) {
        observer.observe(ref.current);
      }
    });

    return () => {
      refs.forEach((ref) => {
        if (ref.current) {
          observer.unobserve(ref.current);
        }
      });
    };
  }, [project]);

  // Track active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        { id: 'overview', ref: overviewRef },
        { id: 'amenities', ref: amenitiesRef },
        { id: 'plans', ref: plansRef },
        { id: 'location', ref: locationRef },
        { id: 'gallery', ref: galleryRef },
      ];

      const scrollPosition = window.scrollY + 200;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section.ref.current) {
          const offsetTop = section.ref.current.offsetTop;
          if (scrollPosition >= offsetTop) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
    return () => window.removeEventListener('scroll', handleScroll);
  }, [project]);

  // Scroll to section function
  const scrollToSection = (sectionId: string) => {
    const sectionMap: { [key: string]: React.RefObject<HTMLDivElement> } = {
      overview: overviewRef,
      amenities: amenitiesRef,
      plans: plansRef,
      location: locationRef,
      gallery: galleryRef,
    };

    const sectionRef = sectionMap[sectionId];
    if (sectionRef?.current) {
      const offset = 120; // Account for main navbar (60px gap) + navigation bar height (~60px)
      const elementPosition = sectionRef.current.offsetTop;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };


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
      {/* Navigation Bar Overlay - Sticky with gap from main navbar */}
      <div className="sticky top-[60px] left-0 right-0 z-30 bg-transparent backdrop-blur-sm">
        {/* White line at top */}
        <div className="h-0.5 bg-black/20"></div>
        
        <div className="flex items-center justify-between px-4 md:px-6 lg:px-8 py-3">
          {/* Back Button */}
          <button
            onClick={() => navigate("/get-project-api")}
            className="flex items-center gap-2 text-black hover:text-gray-700 transition-colors uppercase text-sm font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            BACK
          </button>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-4 lg:gap-6 xl:gap-8">
            {[
              { id: 'overview', label: 'OVERVIEW' },
              { id: 'amenities', label: 'AMENITIES' },
              { id: 'plans', label: 'FLOOR PLANS' },
              { id: 'location', label: 'LOCATION' },
              { id: 'gallery', label: 'GALLERY' },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => scrollToSection(item.id)}
                className={`uppercase text-xs lg:text-sm font-medium transition-colors whitespace-nowrap ${
                  activeSection === item.id
                    ? 'text-black border-b-2 border-black pb-1'
                    : 'text-black/80 hover:text-black'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Mobile Navigation - Scrollable */}
          <div className="md:hidden flex items-center gap-3 overflow-x-auto scrollbar-hide">
            {[
              { id: 'overview', label: 'OVERVIEW' },
              { id: 'amenities', label: 'AMENITIES' },
              { id: 'plans', label: 'FLOOR PLANS' },
              { id: 'location', label: 'LOCATION' },
              { id: 'gallery', label: 'GALLERY' },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => scrollToSection(item.id)}
                className={`uppercase text-xs font-medium transition-colors whitespace-nowrap ${
                  activeSection === item.id
                    ? 'text-black border-b-2 border-black pb-1'
                    : 'text-black/80 hover:text-black'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative h-[60vh] w-full">
        <img
          src={mainImage}
          alt={project.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Favorite Button */}
        <div className="absolute top-20 right-4 z-10">
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
              {project.status && (
                <Badge className={`${getStatusColor(project.status)} text-white`}>
                  {project.status}
                </Badge>
              )}
              {project.projectType && (
                <Badge className="bg-white/20 text-white border-white/30">
                  {project.projectType}
                </Badge>
              )}
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

      {/* Content - Sequential Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Section */}
        <div 
          ref={overviewRef}
          className="opacity-0 transform translate-y-8 mb-16 scroll-mt-20"
        >
          <div className="space-y-12 py-12">
            {/* Overview Title */}
            <div className="text-center space-y-4">
              <h2 className="text-4xl md:text-5xl font-light tracking-wider uppercase text-gray-800">
                OVERVIEW
              </h2>
              <p className="text-xl md:text-2xl font-serif text-gray-700 italic max-w-3xl mx-auto">
                Discover Your Dream Home in Every Detail
              </p>
            </div>

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
            </div>
          </div>
        </div>

        {/* Amenities Section */}
        <div 
          ref={amenitiesRef}
          className="opacity-0 transform translate-y-8 mb-16 scroll-mt-20"
        >
          <div className="space-y-12 py-12">
            {/* Amenities Title */}
            <div className="text-center space-y-4">
              <h2 className="text-4xl md:text-5xl font-light tracking-wider uppercase text-gray-800">
                AMENITIES
              </h2>
              <p className="text-xl md:text-2xl font-serif text-gray-700 italic max-w-3xl mx-auto">
                Experience Luxury Living with Premium Amenities
              </p>
            </div>

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
          </div>
        </div>

        {/* Floor Plans Section */}
        <div 
          ref={plansRef}
          className="opacity-0 transform translate-y-8 mb-16 scroll-mt-20"
        >
          <div className="space-y-12 py-12">
            {/* Floor Plans Title */}
            <div className="text-center space-y-4">
              <h2 className="text-4xl md:text-5xl font-light tracking-wider uppercase text-gray-800">
                FLOOR PLANS
              </h2>
              <p className="text-xl md:text-2xl font-serif text-gray-700 italic max-w-3xl mx-auto">
                Explore Your Perfect Living Space Layout
              </p>
            </div>

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
          </div>
        </div>

        {/* Location Section */}
        <div 
          ref={locationRef}
          className="opacity-0 transform translate-y-8 mb-16 scroll-mt-20"
        >
          <div className="space-y-12 py-12">
            {/* Location Title */}
            <div className="text-center space-y-4">
              <h2 className="text-4xl md:text-5xl font-light tracking-wider uppercase text-gray-800">
                LOCATION
              </h2>
              <p className="text-xl md:text-2xl font-serif text-gray-700 italic max-w-3xl mx-auto">
                Find Your Perfect Place in the Heart of the City
              </p>
            </div>

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

            {/* Location Map */}
            <Card className="overflow-hidden">
              {/* Map Header */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-blue-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-blue-600 p-2 rounded-lg mr-3">
                      <MapPin className="text-white" size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        Project Location
                      </h3>
                      <p className="text-sm text-gray-600">
                        Interactive map with precise location
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 px-3 py-1 bg-blue-100 rounded-full">
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                      <span className="text-xs font-medium text-blue-700">
                        Live Location
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Map Container */}
              <div className="p-6">
                <PropertyMap
                  address={project.address || ""}
                  city={project.city || ""}
                  state={project.state || ""}
                  className="h-[400px]"
                />
              </div>
            </Card>
            </div>
          </div>
        </div>

        {/* Gallery Section */}
        <div 
          ref={galleryRef}
          className="opacity-0 transform translate-y-8 mb-16 scroll-mt-20"
        >
          <div className="space-y-12 py-12">
            {/* Gallery Title */}
            <div className="text-center space-y-4">
              <h2 className="text-4xl md:text-5xl font-light tracking-wider uppercase text-gray-800">
                GALLERY
              </h2>
              <p className="text-xl md:text-2xl font-serif text-gray-700 italic max-w-3xl mx-auto">
                Experience Luxury Living Through Every Frame
              </p>
            </div>

            {/* Gallery Images Carousel - Combined: Project, Amenity, and Floor Plan Images */}
            {(() => {
              // Combine all images into a single array
              const allImages: Array<{ url: string; type: string; index: number }> = [];
              
              // Add project images
              if (project.projectImages && project.projectImages.length > 0) {
                project.projectImages.forEach((img, idx) => {
                  allImages.push({ url: img.url, type: 'Project', index: idx });
                });
              }
              
              // Add amenity images
              if (project.amenityImages && project.amenityImages.length > 0) {
                project.amenityImages.forEach((img, idx) => {
                  allImages.push({ url: img.url, type: 'Amenity', index: idx });
                });
              }
              
              // Add floor plan images
              if (project.floorImages && project.floorImages.length > 0) {
                project.floorImages.forEach((img, idx) => {
                  allImages.push({ url: img.url, type: 'Floor Plan', index: idx });
                });
              }

              return allImages.length > 0 ? (
                <div className="w-full">
                  <Carousel className="w-full">
                    <CarouselContent className="-ml-2 md:-ml-4">
                      {allImages.map((image, index) => (
                        <CarouselItem key={`${image.type}-${image.index}-${index}`} className="pl-2 md:pl-4 basis-full md:basis-1/2 lg:basis-1/3">
                          <div className="aspect-[4/3] overflow-hidden rounded-lg group cursor-pointer bg-gray-100 relative">
                            <img
                              src={image.url}
                              alt={`${project.name} - ${image.type} ${image.index + 1}`}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            {/* Image Type Badge */}
                            <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                              {image.type}
                            </div>
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious className="left-2 md:left-4 bg-white/90 hover:bg-white border-gray-300" />
                    <CarouselNext className="right-2 md:right-4 bg-white/90 hover:bg-white border-gray-300" />
                  </Carousel>

                  {/* Additional Gallery Grid View */}
                  {allImages.length > 3 && (
                    <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                      {allImages.slice(0, 4).map((image, index) => (
                        <div key={`grid-${image.type}-${image.index}-${index}`} className="aspect-square overflow-hidden rounded-lg group cursor-pointer bg-gray-100 relative">
                          <img
                            src={image.url}
                            alt={`${project.name} - ${image.type} Thumbnail ${image.index + 1}`}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          {/* Image Type Badge */}
                          <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                            {image.type}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-16">
                  <p className="text-gray-600 text-lg">No images available.</p>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailAPI;

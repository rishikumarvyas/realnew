import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  Gamepad2,
  FileText,
  Landmark,
  Rocket,
  TrendingUp,
  Zap,
  Mail
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
  const { user } = useAuth();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");
  const overviewRef = useRef<HTMLDivElement>(null);
  const amenitiesRef = useRef<HTMLDivElement>(null);
  const plansRef = useRef<HTMLDivElement>(null);
  const locationRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);

  // State for interest modal
  const [isInterestModalOpen, setIsInterestModalOpen] = useState(false);
  const [loadingEmailDetails, setLoadingEmailDetails] = useState(false);
  const [hasEmailDetails, setHasEmailDetails] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [apiFailureCount, setApiFailureCount] = useState(0);
  const [skipApiCall, setSkipApiCall] = useState(false);
  const [isSubmittingEmail, setIsSubmittingEmail] = useState(false);
  const [projectEmailDetails, setProjectEmailDetails] = useState<any>(null);
  const [interestFormData, setInterestFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    selectedProject: "",
    selectedBuilder: "",
    propertyType: "",
    budget: 0.0,
    agreeToTerms: false
  });

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
    
    // If price is >= 1 Crore (10000000), show in Crores
    if (numPrice >= 10000000) {
      const croreValue = numPrice / 10000000;
      // Remove trailing zeros for whole numbers
      return `₹${croreValue % 1 === 0 ? croreValue.toFixed(0) : croreValue.toFixed(2)} Cr`;
    } 
    // If price is >= 1 Lakh (100000), show in Lakhs
    else if (numPrice >= 100000) {
      const lakhValue = numPrice / 100000;
      // Remove trailing zeros for whole numbers
      return `₹${lakhValue % 1 === 0 ? lakhValue.toFixed(0) : lakhValue.toFixed(2)} L`;
    }
    // If price is between 1 and 100000, assume it's already in Lakhs
    else if (numPrice >= 1) {
      // Remove trailing zeros for whole numbers
      return `₹${numPrice % 1 === 0 ? numPrice.toFixed(0) : numPrice.toFixed(2)} L`;
    }
    // For very small amounts, show as is
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

  // Resolve image URL: if API returns relative path, prefix with API baseURL
  const resolveImageUrl = (url?: string) => {
    if (!url) return "";
    if (/^https?:\/\//i.test(url)) return url;
    try {
      // @ts-ignore axios instance is JS file
      const base = (axiosInstance as any)?.defaults?.baseURL || "";
      if (!base) return url;
      return `${base}${url.startsWith("/") ? url : `/${url}`}`;
    } catch {
      return url;
    }
  };

  // Handler for interest button click
  const handleInterestClick = async () => {
    if (!project) return;
    
    setIsInterestModalOpen(true);
    
    // Check if we should skip API call due to repeated failures
    if (skipApiCall || apiFailureCount >= 3) {
      console.log("Skipping API call due to repeated failures, using manual form");
      setHasEmailDetails(false);
      setInterestFormData(prev => ({
        ...prev,
        selectedProject: project.name,
        selectedBuilder: project.builderName
      }));
      setApiError("API is currently unavailable. Please fill in your details manually.");
      return;
    }
    
    setLoadingEmailDetails(true);
    setApiError(null);
    
    try {
      // Fetch project details from API using project ID
      const response = await axiosInstance.get(`/api/Builder/GetEmailDetails?projectId=${project.projectId}`);
      
      console.log("API Response:", response.data);
      
      if (response.data && (response.data.statusCode === 200 || response.data.message === "Email sent successfully.")) {
        // Store project email details for later use
        setProjectEmailDetails(response.data);
        
        // Pre-populate form with project details from API
        setHasEmailDetails(true);
        setInterestFormData(prev => ({
          ...prev,
          firstName: response.data.firstName || '',
          lastName: response.data.lastName || '',
          email: response.data.email || '',
          phone: response.data.phone || '',
          selectedProject: project.name,
          selectedBuilder: project.builderName
        }));
        console.log("Project details loaded successfully from API");
        toast.success("Project details loaded successfully!");
        // Reset failure count on success
        setApiFailureCount(0);
      } else {
        // If no project details found, set basic project info
        setHasEmailDetails(false);
        setInterestFormData(prev => ({
          ...prev,
          selectedProject: project.name,
          selectedBuilder: project.builderName
        }));
        console.log("No project details found in API response");
        toast.info("Please fill in your details manually");
      }
    } catch (error: any) {
      console.log("Project details API not available, using manual form");
      console.log("API Error Status:", error.response?.status);
      console.log("API Error Data:", error.response?.data);
      
      // Increment failure count
      const newFailureCount = apiFailureCount + 1;
      setApiFailureCount(newFailureCount);
      
      // Set basic project info and show form without pre-populated user data
      setHasEmailDetails(false);
      setInterestFormData(prev => ({
        ...prev,
        selectedProject: project.name,
        selectedBuilder: project.builderName
      }));
      
      // Set error state for retry functionality
      if (error.response?.status === 500) {
        const errorMessage = newFailureCount >= 3 
          ? "Server is currently unavailable. Please fill in your details manually."
          : "Server is temporarily unavailable. Please try again or fill details manually.";
        setApiError(errorMessage);
        toast.error(errorMessage);
        
        // Skip API calls after 3 failures
        if (newFailureCount >= 3) {
          setSkipApiCall(true);
          toast.info("API is temporarily disabled due to repeated failures. You can still use the form manually.");
        }
      } else if (error.response?.status === 400) {
        // Handle specific 400 error for projects without email details
        const errorMessage = error.response?.data?.message || "Project doesn't have email details configured.";
        setApiError("This project doesn't have email details configured. Please fill in your details manually.");
        toast.info("This project doesn't have email details configured. Please fill in your details manually.");
        // Don't increment failure count for 400 errors as they're expected for some projects
        setApiFailureCount(Math.max(0, apiFailureCount - 1));
      } else if (error.response?.status === 404) {
        setApiError("Project details not found. Please fill details manually.");
        toast.error("Project details not found. Please fill details manually.");
      } else if (error.response?.status === 401) {
        setApiError("Authentication required. Please fill details manually.");
        toast.error("Authentication required. Please fill details manually.");
      } else {
        setApiError("Unable to load project details. Please fill details manually.");
        toast.error("Unable to load project details. Please fill details manually.");
      }
    } finally {
      setLoadingEmailDetails(false);
    }
  };

  // Retry function for API call
  const retryApiCall = async () => {
    if (!project) return;
    
    setApiError(null);
    setLoadingEmailDetails(true);
    
    try {
      const response = await axiosInstance.get(`/api/Builder/GetEmailDetails?projectId=${project.projectId}`);
      
      if (response.data && (response.data.statusCode === 200 || response.data.message === "Email sent successfully.")) {
        setHasEmailDetails(true);
        setInterestFormData(prev => ({
          ...prev,
          firstName: response.data.firstName || '',
          lastName: response.data.lastName || '',
          email: response.data.email || '',
          phone: response.data.phone || '',
        }));
        toast.success("Project details loaded successfully!");
        setApiError(null);
        // Reset failure count on success
        setApiFailureCount(0);
        setSkipApiCall(false);
      } else {
        setApiError("No project details found in response.");
        toast.info("Please fill in your details manually");
      }
    } catch (error: any) {
      const newFailureCount = apiFailureCount + 1;
      setApiFailureCount(newFailureCount);
      
      if (error.response?.status === 500) {
        const errorMessage = newFailureCount >= 3 
          ? "Server is currently unavailable. Please fill in your details manually."
          : "Server is temporarily unavailable. Please try again or fill details manually.";
        setApiError(errorMessage);
        toast.error(errorMessage);
        
        // Skip API calls after 3 failures
        if (newFailureCount >= 3) {
          setSkipApiCall(true);
          toast.info("API is temporarily disabled due to repeated failures. You can still use the form manually.");
        }
      } else if (error.response?.status === 400) {
        // Handle specific 400 error for projects without email details
        setApiError("This project doesn't have email details configured. Please fill in your details manually.");
        toast.info("This project doesn't have email details configured. Please fill in your details manually.");
        // Don't increment failure count for 400 errors as they're expected for some projects
        setApiFailureCount(Math.max(0, apiFailureCount - 1));
      } else {
        setApiError("Unable to load project details. Please fill details manually.");
        toast.error("Unable to load project details. Please fill details manually.");
      }
    } finally {
      setLoadingEmailDetails(false);
    }
  };

  // Reset API failure state (for testing or manual reset)
  const resetApiState = () => {
    setApiFailureCount(0);
    setSkipApiCall(false);
    setApiError(null);
    toast.info("API retry enabled. Next attempt will try the API again.");
  };

  // Handler for interest form submission
  const handleInterestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!project) return;
    
    if (!interestFormData.agreeToTerms) {
      toast.error("Please agree to the terms and conditions");
      return;
    }

    if (!interestFormData.firstName) {
      toast.error("Please enter your First Name");
      return;
    }

    if (isSubmittingEmail) {
      toast.info("Please wait, email is being sent...");
      return;
    }

    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error("Please log in to submit your interest.");
      return;
    }

    // Check if project email details are available
    if (!projectEmailDetails?.toEmail) {
      console.log("No project email details available, using fallback");
    }

    setIsSubmittingEmail(true);

    // Convert budget to double value for API
    const getBudgetValue = () => {
      // If budget is 0 or not provided, return 0.0 (optional field)
      const value = (typeof interestFormData.budget === 'number' && interestFormData.budget > 0) ? interestFormData.budget : 0.0;
      return parseFloat(value.toFixed(1)); // Ensure double with decimal
    };

    try {
      // Use separate firstName and lastName fields
      const firstName = interestFormData.firstName.trim();
      const lastName = interestFormData.lastName.trim() || 'N/A'; // API requires LastName, use N/A if empty

      // Prepare email data for SendEmail API using GetEmailDetails response
      const budgetValue = getBudgetValue();
      const emailData = {
        toEmail: projectEmailDetails?.toEmail || "support@homeyatra.com",
        firstName: projectEmailDetails?.firstName || firstName,
        lastName: lastName,
        phone: projectEmailDetails?.phone || interestFormData.phone,
        email: projectEmailDetails?.email || interestFormData.email,
        budget: parseFloat(budgetValue.toFixed(1)), // Ensure double with decimal
        propertyType: interestFormData.propertyType || projectEmailDetails?.propertyType || '',
        subject: projectEmailDetails?.subject || `Property Interest Alert: ${firstName} Wants to Know More About ${project.name || 'Unknown Project'}`,
        projectName: projectEmailDetails?.projectName || project.name || ''
      };

      // Validate required fields before sending
      if (!emailData.firstName || !emailData.email || !emailData.phone || !emailData.toEmail) {
        console.log("Missing required fields:", {
          firstName: emailData.firstName,
          email: emailData.email,
          phone: emailData.phone,
          toEmail: emailData.toEmail
        });
        toast.error("Missing required fields. Please check your information.");
        return;
      }
      
      const response = await axiosInstance.post('/api/Builder/SendEmail', emailData);
      
      if (response.data && (response.data.statusCode === 200 || response.data.message === "Email sent successfully.")) {
        toast.success("Thank you for your interest! We'll contact you soon.");
        setIsInterestModalOpen(false);
        setInterestFormData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          selectedProject: "",
          selectedBuilder: "",
          propertyType: "",
          budget: 0.0,
          agreeToTerms: false
        });
      } else {
        toast.error("Failed to send your interest. Please try again.");
      }
    } catch (error: any) {
      console.error("Error submitting interest:", error);
      
      // Show specific error messages based on the error type
      if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.message || "Invalid data provided";
        toast.error(`Validation Error: ${errorMessage}`);
      } else if (error.response?.status === 404) {
        toast.error("Email service not available. Please contact support or try again later.");
      } else if (error.response?.status === 500) {
        const errorMessage = error.response?.data?.message || "Server error occurred.";
        if (errorMessage.includes("Failed to send email") || error.response?.status === 500) {
          // Store interest data locally as fallback
          const interestData = {
            projectName: project.name || '',
            builderName: project.builderName || '',
            userDetails: {
              FirstName: interestFormData.firstName,
              LastName: interestFormData.lastName,
              email: interestFormData.email,
              phone: interestFormData.phone
            },
            preferences: {
              propertyType: interestFormData.propertyType,
              budget: parseFloat(getBudgetValue().toFixed(1))
            },
            timestamp: new Date().toISOString()
          };
          
          // Store in localStorage as backup
          const existingInterests = JSON.parse(localStorage.getItem('pendingInterests') || '[]');
          existingInterests.push(interestData);
          localStorage.setItem('pendingInterests', JSON.stringify(existingInterests));
          
          // Show informative message for email sending failure
          toast.error("Email service is temporarily unavailable. Your interest has been recorded and we'll contact you directly.");
          setIsInterestModalOpen(false);
          setInterestFormData({
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            selectedProject: "",
            selectedBuilder: "",
            propertyType: "",
            budget: 0.0,
            agreeToTerms: false
          });
          return;
        } else {
          toast.error("Server error. Please try again later.");
        }
      } else if (error.response?.status === 401) {
        toast.error("Your session has expired. Please log in again to submit your interest.");
        // Clear the expired token
        localStorage.removeItem('token');
        // Close the modal
        setIsInterestModalOpen(false);
        // Optionally redirect to login page
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else if (error.response?.status === 400) {
        toast.error("Invalid data. Please check your information and try again.");
      } else {
        toast.error("Failed to submit your interest. Please try again.");
      }
    } finally {
      setIsSubmittingEmail(false);
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

          {/* I'm Interested Button */}
          <div className="flex items-center ml-4 md:ml-6">
            <Button
              onClick={handleInterestClick}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-2 px-4 md:px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md text-xs md:text-sm whitespace-nowrap"
            >
              <Zap className="h-3 w-3 md:h-4 md:w-4 mr-1.5 md:mr-2" />
              <span className="hidden sm:inline">I'm Interested</span>
              <span className="sm:hidden">Interested</span>
            </Button>
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
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-3xl font-bold mb-4">OVERVIEW</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Discover Your Dream Home in Every Detail
              </p>
            </div>

            <div className="space-y-8">
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
            <Card className="overflow-hidden border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white pb-4">
                <CardTitle className="text-2xl font-bold flex items-center">
                  <div className="p-2 bg-white/20 rounded-lg mr-3">
                    <FileText className="h-6 w-6" />
                  </div>
                  Project Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 bg-gradient-to-br from-gray-50 to-white">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* RERA Number */}
                  <div className="group bg-white rounded-xl p-5 border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                        <Landmark className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500 mb-1 font-medium">RERA Number</p>
                        <p className="text-lg font-bold text-gray-900">{project.reraNumber || "N/A"}</p>
                      </div>
                    </div>
                  </div>

                  {/* RERA Date */}
                  <div className="group bg-white rounded-xl p-5 border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                        <Calendar className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500 mb-1 font-medium">RERA Date</p>
                        <p className="text-lg font-bold text-gray-900">{formatDate(project.reraDate)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Project Area */}
                  <div className="group bg-white rounded-xl p-5 border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                        <Ruler className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500 mb-1 font-medium">Project Area</p>
                        <p className="text-lg font-bold text-gray-900">
                          {project.projectAreaAcres && project.projectAreaAcres.trim() 
                            ? `${project.projectAreaAcres.trim()} acres` 
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Launch Date */}
                  <div className="group bg-white rounded-xl p-5 border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                        <Rocket className="h-6 w-6 text-orange-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500 mb-1 font-medium">Launch Date</p>
                        <p className="text-lg font-bold text-gray-900">{formatDate(project.launchDate)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Expected Completion */}
                  <div className="group bg-white rounded-xl p-5 border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
                        <TrendingUp className="h-6 w-6 text-indigo-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500 mb-1 font-medium">Expected Completion</p>
                        <p className="text-lg font-bold text-gray-900">{formatDate(project.expectedCompletionDate)}</p>
                      </div>
                    </div>
                  </div>

                  {/* OC Date */}
                  <div className="group bg-white rounded-xl p-5 border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-teal-100 rounded-lg group-hover:bg-teal-200 transition-colors">
                        <Calendar className="h-6 w-6 text-teal-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500 mb-1 font-medium">OC Date</p>
                        <p className="text-lg font-bold text-gray-900">{formatDate(project.ocDate)}</p>
                      </div>
                    </div>
                  </div>

                  {/* RERA Approved */}
                  <div className="group bg-white rounded-xl p-5 border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg transition-colors ${
                        project.isReraApproved 
                          ? "bg-green-100 group-hover:bg-green-200" 
                          : "bg-yellow-100 group-hover:bg-yellow-200"
                      }`}>
                        {project.isReraApproved ? (
                          <CheckCircle className="h-6 w-6 text-green-600" />
                        ) : (
                          <Clock className="h-6 w-6 text-yellow-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500 mb-1 font-medium">RERA Approved</p>
                        <div className="flex items-center gap-2">
                          {project.isReraApproved ? (
                            <>
                              <Badge className="bg-green-100 text-green-800 border-green-300 hover:bg-green-200">
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approved
                              </Badge>
                            </>
                          ) : (
                            <>
                              <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200">
                                <Clock className="h-4 w-4 mr-1" />
                                Pending
                              </Badge>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* OC Approved */}
                  <div className="group bg-white rounded-xl p-5 border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg transition-colors ${
                        project.isOCApproved 
                          ? "bg-green-100 group-hover:bg-green-200" 
                          : "bg-yellow-100 group-hover:bg-yellow-200"
                      }`}>
                        {project.isOCApproved ? (
                          <CheckCircle className="h-6 w-6 text-green-600" />
                        ) : (
                          <Clock className="h-6 w-6 text-yellow-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500 mb-1 font-medium">OC Approved</p>
                        <div className="flex items-center gap-2">
                          {project.isOCApproved ? (
                            <>
                              <Badge className="bg-green-100 text-green-800 border-green-300 hover:bg-green-200">
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approved
                              </Badge>
                            </>
                          ) : (
                            <>
                              <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200">
                                <Clock className="h-4 w-4 mr-1" />
                                Pending
                              </Badge>
                            </>
                          )}
                        </div>
                      </div>
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
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-3xl font-bold mb-4">AMENITIES</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
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
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-3xl font-bold mb-4">FLOOR PLANS</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
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
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-3xl font-bold mb-4">LOCATION</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
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
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-3xl font-bold mb-4">GALLERY</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
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

      {/* I'm Interested Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center space-y-6">
          <h2 className="text-3xl font-bold mb-4">Interested in This Project?</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Fill out the form below and our team will get in touch with you soon.
          </p>
          <Button
            onClick={handleInterestClick}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-6 px-12 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg text-lg"
          >
            <Zap className="h-5 w-5 mr-2" />
            I'm Interested
          </Button>
        </div>
      </div>

      {/* Interest Modal */}
      <Dialog open={isInterestModalOpen} onOpenChange={setIsInterestModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-800 flex items-center">
              <Zap className="h-6 w-6 text-blue-500 mr-3" />
              Express Your Interest
            </DialogTitle>
            <DialogDescription>
              Fill in your property preferences to express interest in this project.
            </DialogDescription>
          </DialogHeader>
          
          {project && (
            <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div className="flex items-start">
                <img
                  src={resolveImageUrl(project.projectImages?.find(img => img.isMain)?.url) || 
                       resolveImageUrl(project.projectImages?.[0]?.url) || 
                       "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=600&q=80"}
                  alt={project.name}
                  className="w-20 h-20 rounded-lg object-cover mr-4"
                />
                <div>
                  <h4 className="font-bold text-lg text-gray-800">
                    {project.name}
                  </h4>
                  <p className="text-blue-600 font-semibold">
                    {project.builderName}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {project.locality}, {project.city}
                  </p>
                </div>
              </div>
            </div>
          )}

          {loadingEmailDetails ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center space-x-2">
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                <span className="text-gray-600">Loading project details...</span>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {apiError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="text-red-700 text-sm">{apiError}</span>
                    </div>
                    <div className="flex space-x-2">
                      {skipApiCall ? (
                        <Button
                          onClick={resetApiState}
                          size="sm"
                          variant="outline"
                          className="text-blue-600 border-blue-300 hover:bg-blue-50"
                        >
                          Re-enable API
                        </Button>
                      ) : (
                        <Button
                          onClick={retryApiCall}
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-300 hover:bg-red-50"
                        >
                          Retry
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              <form onSubmit={handleInterestSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName" className="text-sm font-semibold text-gray-700">
                    First Name *
                  </Label>
                  <Input
                    id="firstName"
                    value={interestFormData.firstName}
                    onChange={(e) => setInterestFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    placeholder="Enter your first name"
                    disabled={hasEmailDetails}
                    className={`mt-1 ${hasEmailDetails ? 'bg-gray-50 text-gray-600' : ''}`}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName" className="text-sm font-semibold text-gray-700">
                    Last Name (Optional)
                  </Label>
                  <Input
                    id="lastName"
                    value={interestFormData.lastName}
                    onChange={(e) => setInterestFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    placeholder="Enter your last name (optional)"
                    disabled={hasEmailDetails}
                    className={`mt-1 ${hasEmailDetails ? 'bg-gray-50 text-gray-600' : ''}`}
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={interestFormData.email}
                    onChange={(e) => setInterestFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter your email"
                    disabled={hasEmailDetails}
                    className={`mt-1 ${hasEmailDetails ? 'bg-gray-50 text-gray-600' : ''}`}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="phone" className="text-sm font-semibold text-gray-700">
                  Phone Number *
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={interestFormData.phone}
                  onChange={(e) => setInterestFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Enter your phone number"
                  disabled={hasEmailDetails}
                  className={`mt-1 ${hasEmailDetails ? 'bg-gray-50 text-gray-600' : ''}`}
                  required
                />
              </div>

            {/* Project Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-semibold text-gray-700">
                  Property Type (Optional)
                </Label>
                <Select
                  value={interestFormData.propertyType}
                  onValueChange={(value) => setInterestFormData(prev => ({ ...prev, propertyType: value }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select Property Type (Optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1 BHK">1 BHK</SelectItem>
                    <SelectItem value="2 BHK">2 BHK</SelectItem>
                    <SelectItem value="3 BHK">3 BHK</SelectItem>
                    <SelectItem value="4 BHK">4 BHK</SelectItem>
                    <SelectItem value="5 BHK">5 BHK</SelectItem>
                    <SelectItem value="Villa">Villa</SelectItem>
                    <SelectItem value="Penthouse">Penthouse</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="budget" className="text-sm font-semibold text-gray-700">
                  Budget (in Lakhs) (Optional)
                </Label>
                <Input
                  id="budget"
                  type="number"
                  step="0.1"
                  value={interestFormData.budget}
                  onChange={(e) => setInterestFormData(prev => ({ ...prev, budget: parseFloat(e.target.value) || 0.0 }))}
                  placeholder="Enter budget amount (optional)"
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter amount in lakhs (e.g., 150.5 for ₹1.5 Cr, 500 for ₹5 Cr)
                </p>
              </div>
            </div>



            <div className="flex items-start space-x-2">
              <Checkbox
                id="terms"
                checked={interestFormData.agreeToTerms}
                onCheckedChange={(checked) => setInterestFormData(prev => ({ ...prev, agreeToTerms: checked === true }))}
                required
              />
              <Label htmlFor="terms" className="text-sm text-gray-600 leading-relaxed">
                I agree to receive communications from {project?.builderName || 'the builder'} and HomeYatra regarding this property inquiry. 
                I understand that my information will be shared with the builder's sales team.
              </Label>
            </div>

            <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              disabled={isSubmittingEmail}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmittingEmail ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Submit Interest
                </>
              )}
            </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsInterestModalOpen(false)}
                className="px-6 py-3 rounded-xl"
              >
                Cancel
              </Button>
            </div>
          </form>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectDetailAPI;

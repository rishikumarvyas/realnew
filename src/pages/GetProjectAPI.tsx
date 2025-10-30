import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import axiosInstance from "@/axiosCalls/axiosInstance";
import { 
  Search, 
  MapPin, 
  Building, 
  Eye,
  Edit,
  Calendar,
  DollarSign,
  Home,
  Users,
  Ruler,
  Loader2,
  Filter,
  ArrowLeft,
  Phone,
  MessageCircle,
  Gift,
  Star,
  Percent,
  Clock,
  IndianRupee,
  Award,
  Zap,
  Mail,
  Building2
} from "lucide-react";

interface Project {
  projectId: string;
  name: string;
  projectType: string | null;
  description: string;
  price: string | null;
  area: string | null;
  beds: string | null;
  status: string | null;
  possession: string;
  address: string;
  locality: string;
  city: string | null;
  state: string | null;
  builderName: string;
  builderId: string;
  projectImages: Array<{
    url: string;
    isMain: boolean;
  }>;
  reraNumber: string;
  launchDate: string;
  projectAreaAcres: string;
  exclusiveFeatures: string[];
  amenities: string[];
}

const GetProjectAPI = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterType, setFilterType] = useState("");
  
  // State for interest modal
  const [isInterestModalOpen, setIsInterestModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loadingEmailDetails, setLoadingEmailDetails] = useState(false);
  const [hasEmailDetails, setHasEmailDetails] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [apiFailureCount, setApiFailureCount] = useState(0);
  const [skipApiCall, setSkipApiCall] = useState(false);
  const [emailRetryCount, setEmailRetryCount] = useState(0);
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
    budget: 0.0, // Store as double, not string
    agreeToTerms: false
  });

  // Fetch projects from API
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.post("/api/Builder/GetProjects", {
        builderId: "",
        projectId: "",
        searchTerm: "",
        pageNumber: 0,
        pageSize: 100
      });
      
      if ((response.data.statusCode === 200 || response.data.message === "Email sent successfully.")) {
        setProjects(response.data.data || []);
      } else {
        toast.error("Failed to fetch projects");
        setProjects([]);
      }
    } catch (error: any) {
      console.error("Error fetching projects:", error);
      toast.error("Failed to fetch projects. Please try again.");
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Handler for interest button click
  const handleInterestClick = async (project: Project) => {
    setSelectedProject(project);
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
    if (!selectedProject) return;
    
    setApiError(null);
    setLoadingEmailDetails(true);
    
    try {
      const response = await axiosInstance.get(`/api/Builder/GetEmailDetails?projectId=${selectedProject.projectId}`);
      
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
    
    if (!interestFormData.agreeToTerms) {
      toast.error("Please agree to the terms and conditions");
      return;
    }

    if (!interestFormData.firstName) {
      toast.error("Please enter your First Name");
      return;
    }

    // Budget and Property Type are now optional - no validation required

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

    // Convert budget to double value for API (moved outside try block for scope)
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
        subject: projectEmailDetails?.subject || `Property Interest Alert: ${firstName} Wants to Know More About ${selectedProject?.name || 'Unknown Project'}`,
        projectName: projectEmailDetails?.projectName || selectedProject?.name || ''
      };

      // Call SendEmail API
      console.log("GetEmailDetails Response:", projectEmailDetails);
      console.log("User selected budget:", interestFormData.budget);
      console.log("Converted budget value:", budgetValue);
      console.log("Final budget value (double):", parseFloat(budgetValue.toFixed(1)));
      console.log("Budget data type:", typeof parseFloat(budgetValue.toFixed(1)));
      console.log("Budget in emailData:", emailData.budget);
      console.log("First Name from form:", interestFormData.firstName);
      console.log("Last Name from form:", interestFormData.lastName);
      console.log("Using firstName (lowercase):", projectEmailDetails?.firstName || firstName);
      console.log("Using lastName (lowercase):", lastName, "(N/A if empty)");
      console.log("Using Email from API:", projectEmailDetails?.email || interestFormData.email);
      console.log("Using Phone from API:", projectEmailDetails?.phone || interestFormData.phone);
      console.log("Using project email:", projectEmailDetails?.toEmail || "support@homeyatra.com");
      console.log("Sending email data:", emailData);
      console.log("Email data JSON:", JSON.stringify(emailData, null, 2));
      
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
      console.log("SendEmail API Error Status:", error.response?.status);
      console.log("SendEmail API Error Data:", error.response?.data);
      console.log("SendEmail API Error Details:", JSON.stringify(error.response?.data, null, 2));
      
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
            projectName: selectedProject?.name || '',
            builderName: selectedProject?.builderName || '',
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
          setEmailRetryCount(0);
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

  // Filter projects based on search and filters
  const filteredProjects = projects.filter((project) => {
    const matchesSearch = 
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.locality.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.state?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.builderName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus ? project.status === filterStatus : true;
    const matchesType = filterType ? project.projectType === filterType : true;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Helper function to get status color
  const getStatusColor = (status: string | null) => {
    if (!status) return "bg-gray-500";
    switch (status.toLowerCase()) {
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

  // Helper function to get project type color
  const getProjectTypeColor = (type: string | null) => {
    if (!type) return "bg-gray-500";
    switch (type.toLowerCase()) {
      case "residential":
        return "bg-green-500";
      case "commercial":
        return "bg-blue-500";
      case "both":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  // Format price for display
  const formatPrice = (price: string | null) => {
    if (!price) return "Price on Request";
    const numPrice = parseFloat(price);
    if (numPrice >= 10000000) {
      return `₹${(numPrice / 10000000).toFixed(2)} Cr`;
    } else if (numPrice >= 100000) {
      return `₹${(numPrice / 100000).toFixed(2)} L`;
    }
    return `₹${numPrice.toLocaleString()}`;
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "TBD";
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short'
      });
    } catch {
      return dateString;
    }
  };

  // Dynamic banner image: use first filtered project's image, else fallback
  const bannerImage =
    filteredProjects.length > 0 &&
    filteredProjects[0].projectImages &&
    filteredProjects[0].projectImages.length > 0
      ? filteredProjects[0].projectImages[0].url
      : "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=1200&q=80";

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner Section */}
      <div className="relative w-full h-[320px] sm:h-[400px] md:h-[480px] flex items-center justify-center overflow-hidden mb-[-80px]">
        <img
          src={bannerImage}
          alt="All Projects Banner"
          className="absolute inset-0 w-full h-full object-cover object-center scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 via-blue-800/60 to-blue-600/40" />
        
        {/* Animated Flash Line with Offers */}
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 py-3 overflow-hidden z-20">
          <div className="animate-marquee whitespace-nowrap flex items-center">
            <div className="flex items-center space-x-8 mx-4">
              <div className="flex items-center space-x-2">
                <Gift className="h-5 w-5 text-white animate-pulse" />
                <span className="text-white font-bold text-sm">🎉 EXTRA 5% DISCOUNT with HomeYatra Reference</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-white animate-bounce" />
                <span className="text-white font-bold text-sm">⭐ FREE Registration + No GST for HomeYatra Users</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-white animate-pulse" />
                <span className="text-white font-bold text-sm">⚡ Instant Approval + Priority Booking</span>
              </div>
              <div className="flex items-center space-x-2">
                <Award className="h-5 w-5 text-white animate-bounce" />
                <span className="text-white font-bold text-sm">🏆 Exclusive VIP Access to Pre-Launch Projects</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-5 w-5 text-white animate-pulse" />
                <span className="text-white font-bold text-sm">📞 Call +91 98765 43210 for Special HomeYatra Offers</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-5 w-5 text-white animate-bounce" />
                <span className="text-white font-bold text-sm">📧 Email support@homeyatra.com for Best Deals</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-white animate-pulse" />
                <span className="text-white font-bold text-sm">👥 Refer Friends & Get ₹50,000 Cashback</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-white animate-bounce" />
                <span className="text-white font-bold text-sm">📅 Limited Time: Book Now & Save Up to ₹10 Lakh</span>
              </div>
            </div>
            {/* Duplicate for seamless loop */}
            <div className="flex items-center space-x-8 mx-4">
              <div className="flex items-center space-x-2">
                <Gift className="h-5 w-5 text-white animate-pulse" />
                <span className="text-white font-bold text-sm">🎉 EXTRA 5% DISCOUNT with HomeYatra Reference</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-white animate-bounce" />
                <span className="text-white font-bold text-sm">⭐ FREE Registration + No GST for HomeYatra Users</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-white animate-pulse" />
                <span className="text-white font-bold text-sm">⚡ Instant Approval + Priority Booking</span>
              </div>
              <div className="flex items-center space-x-2">
                <Award className="h-5 w-5 text-white animate-bounce" />
                <span className="text-white font-bold text-sm">🏆 Exclusive VIP Access to Pre-Launch Projects</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-5 w-5 text-white animate-pulse" />
                <span className="text-white font-bold text-sm">📞 Call +91 98765 43210 for Special HomeYatra Offers</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-5 w-5 text-white animate-bounce" />
                <span className="text-white font-bold text-sm">📧 Email support@homeyatra.com for Best Deals</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-white animate-pulse" />
                <span className="text-white font-bold text-sm">👥 Refer Friends & Get ₹50,000 Cashback</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-white animate-bounce" />
                <span className="text-white font-bold text-sm">📅 Limited Time: Book Now & Save Up to ₹10 Lakh</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="relative z-10 text-center px-4 animate-fade-in-up flex flex-col items-center w-full">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg mb-4">
            Discover All Projects with{" "}
            <span className="text-yellow-300">Home Yatra</span>
          </h1>
          <p className="text-lg md:text-2xl text-blue-100 max-w-2xl mx-auto mb-6 font-medium drop-shadow">
            Find the most attractive and modern builder projects, handpicked for
            you. Filter by your preferences and explore the best projects in
            your city!
          </p>
          
          {/* Additional Offer Highlights */}
          <div className="flex flex-wrap justify-center gap-4 mb-6">
            <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 border border-white/30">
              <span className="text-white font-semibold text-sm flex items-center">
                <Gift className="h-4 w-4 mr-2 text-yellow-300" />
                Extra 5% Discount
              </span>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 border border-white/30">
              <span className="text-white font-semibold text-sm flex items-center">
                <Star className="h-4 w-4 mr-2 text-yellow-300" />
                Free Registration
              </span>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 border border-white/30">
              <span className="text-white font-semibold text-sm flex items-center">
                <Zap className="h-5 w-5 mr-2 text-yellow-300" />
                Priority Booking
              </span>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 border border-white/30">
              <span className="text-white font-semibold text-sm flex items-center">
                <Award className="h-4 w-4 mr-2 text-yellow-300" />
                VIP Access
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Search Bar and Filter Section - moved below banner */}
      {/* Divider below banner */}
      <div className="w-full h-0.5 bg-gray-200 opacity-70 mb-0"></div>
      <div className="w-full flex flex-col items-center py-12 mb-8 bg-gray-50 mt-16 rounded-2xl shadow-2xl animate-fade-in-up transition-all duration-700">
        <div className="w-full max-w-6xl flex items-center bg-white rounded-xl shadow-md border border-gray-200 px-6 py-4 mb-6">
          <svg
            className="w-6 h-6 text-gray-400 mr-3"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Enter Project Name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent outline-none text-lg placeholder-gray-400"
          />
        </div>
        <div className="w-full max-w-6xl mx-auto mb-2">
          <div className="flex flex-col gap-3">
            <div className="flex items-center border border-blue-400 rounded-lg shadow-sm bg-white overflow-x-auto px-4 py-3 gap-3">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="min-w-[160px] h-12 border-none focus:ring-0 focus:border-none bg-transparent text-base"
              >
                <option value="">RESIDENTIAL</option>
                <option value="Residential">Residential</option>
                <option value="Commercial">Commercial</option>
                <option value="Both">Both</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="min-w-[160px] h-12 border-none focus:ring-0 focus:border-none text-base px-4 mr-2"
              >
                <option value="">STATUS</option>
                <option value="New Launch">New Launch</option>
                <option value="Under Construction">Under Construction</option>
                <option value="Completed">Completed</option>
                <option value="Ready to Move">Ready to Move</option>
              </select>
              <Button
                className="h-12 px-8 bg-gray-900 text-white rounded-md font-semibold text-base shadow-none hover:bg-gray-700"
                onClick={(e) => {
                  e.stopPropagation();
                  setSearchTerm("");
                  setFilterStatus("");
                  setFilterType("");
                }}
              >
                RESET
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Project Grid Heading */}
      <div className="w-full mx-auto flex items-center my-8">
        <div className="flex-1 border-t border-gray-300"></div>
        <div className="mx-6 flex items-center gap-4">
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-800 text-center whitespace-nowrap">
            EXPLORE PROJECTS
          </h2>
        </div>
        <div className="flex-1 border-t border-gray-300"></div>
      </div>

      {/* Project Grid */}
      <div className="mx-auto px-4">
        {filteredProjects.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">
            No projects found.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {filteredProjects.map((project) => {
              const mainImage = project.projectImages?.find(img => img.isMain)?.url || 
                               project.projectImages?.[0]?.url || 
                               "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=600&q=80";
              
              return (
                <div
                  key={project.projectId}
                  onClick={() => navigate(`/project-detail-api/${project.projectId}`)}
                  className="group bg-white shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:-translate-y-2 hover:scale-[1.02] cursor-pointer animate-fade-in relative flex flex-col w-full"
                >
                  {/* Card Image */}
                  <div className="relative w-full aspect-[4/3] overflow-hidden">
                    <img
                      src={mainImage}
                      alt={project.name}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                    <span
                      className={`absolute top-4 left-4 px-3 py-1 text-xs font-semibold rounded-full shadow ${getStatusColor(project.status)} text-white tracking-wide`}
                    >
                      {project.status?.toUpperCase() || "AVAILABLE"}
                    </span>
                    {/* Overlay strictly within image */}
                    <div className="absolute inset-0 flex flex-col justify-center items-start bg-black/70 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 p-4">
                      <div className="mb-4 space-y-2 text-white w-full">
                        <div className="flex items-center gap-2 text-sm">
                          <svg
                            width="16"
                            height="16"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                          >
                            <path d="M4 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4" />
                            <rect width="16" height="8" x="4" y="10" rx="2" />
                          </svg>
                          <span className="font-semibold">Beds</span>
                          <span className="ml-auto">{project.beds || "Available on Request"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <svg
                            width="16"
                            height="16"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                          >
                            <rect width="20" height="8" x="2" y="8" rx="2" />
                            <path d="M12 8v8" />
                          </svg>
                          <span className="font-semibold">Area</span>
                          <span className="ml-auto">{project.area || "Available on Request"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <svg
                            width="16"
                            height="16"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 1v22M17 5H7m10 4H7m10 4H7m10 4H7" />
                          </svg>
                          <span className="font-semibold">Price</span>
                          <span className="ml-auto">{formatPrice(project.price)}</span>
                        </div>
                      </div>
                      <div className="border-t border-white/30 w-full my-2"></div>
                      <div className="flex flex-col gap-2 w-full">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/project-detail-api/${project.projectId}`);
                          }}
                          className="flex items-center gap-2 text-purple-400 hover:text-purple-300 font-semibold text-sm"
                        >
                          <Home className="h-4 w-4" />
                          View Project
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/builder/${project.builderId}`);
                          }}
                          className="flex items-center gap-2 text-blue-400 hover:text-blue-300 font-semibold text-sm"
                        >
                          <Building2 className="h-4 w-4" />
                          View Builder
                        </button>
                        <button className="flex items-center gap-2 text-green-400 hover:text-green-300 font-semibold text-sm">
                          <svg
                            width="16"
                            height="16"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                          >
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                          </svg>
                          Enquire Now
                        </button>
                        <button className="flex items-center gap-2 text-green-400 hover:text-green-300 font-semibold text-sm">
                          <svg
                            width="16"
                            height="16"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                          >
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 6v6l4 2" />
                          </svg>
                          Schedule a Visit
                        </button>
                        <button className="flex items-center gap-2 text-green-400 hover:text-green-300 font-semibold text-sm">
                          <svg
                            width="16"
                            height="16"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                          >
                            <path d="M22 16.92V19a2 2 0 0 1-2.18 2A19.72 19.72 0 0 1 3 5.18 2 2 0 0 1 5 3h2.09a2 2 0 0 1 2 1.72c.13 1.13.37 2.23.72 3.28a2 2 0 0 1-.45 2.11l-.27.27a16 16 0 0 0 6.29 6.29l.27-.27a2 2 0 0 1 2.11-.45c1.05.35 2.15.59 3.28.72A2 2 0 0 1 22 16.92z" />
                          </svg>
                          Call Us
                        </button>
                        <button className="flex items-center gap-2 text-green-400 hover:text-green-300 font-semibold text-sm">
                          <svg
                            width="16"
                            height="16"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                          >
                            <path d="M20.52 3.48A11.94 11.94 0 0 0 12 0C5.37 0 0 5.37 0 12c0 2.21.6 4.28 1.65 6.05l-1.6 5.85a1 1 0 0 0 1.25 1.25l5.85-1.6A11.94 11.94 0 0 0 12 24c6.63 0 12-5.37 12-12 0-2.21-.6-4.28-1.65-6.05z" />
                          </svg>
                          WhatsApp
                        </button>
                      </div>
                    </div>
                    {/* Expand overlay icon */}
                    <button className="absolute bottom-3 right-3 bg-white rounded-full p-2 shadow-lg group-hover:opacity-0 transition-opacity duration-300 z-10 border border-gray-200">
                      <svg
                        width="20"
                        height="20"
                        fill="none"
                        stroke="#2563eb"
                        strokeWidth="2.5"
                        viewBox="0 0 24 24"
                      >
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                    </button>
                  </div>
                  {/* Card Content */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="text-xs text-gray-400 uppercase mb-1 tracking-wider">
                        {project.locality}
                        {project.city ? `, ${project.city}` : ""}
                      </div>
                      <div className="font-bold text-base sm:text-lg text-gray-800 mb-1 leading-tight line-clamp-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/project-detail-api/${project.projectId}`);
                          }}
                          className="text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-200 text-left"
                        >
                          {project.name}
                        </button>
                      </div>
                      <div className="text-sm font-semibold text-gray-700 mb-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/builder/${project.builderId}`);
                          }}
                          className="text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-200 flex items-center bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-md border border-blue-200 hover:border-blue-300 w-full justify-center"
                        >
                          <Building2 className="h-4 w-4 mr-1" />
                          {project.builderName}
                          <span className="ml-1 text-xs text-blue-500">→</span>
                        </button>
                      </div>
                      {/* Additional Builder Info */}
                      <div className="text-xs text-gray-500 mb-2 space-y-1">
                        <div className="flex items-center">
                          <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                          <span>RERA: {project.reraNumber || "N/A"}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                          <span>Type: {project.projectType || "N/A"}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                          <span>Area: {project.projectAreaAcres || "N/A"} acres</span>
                        </div>
                        <div className="flex items-center">
                          <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                          <span>Launch: {formatDate(project.launchDate)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 items-center mb-2">
                      <span className="bg-blue-50 text-blue-700 border border-blue-200 rounded px-2 py-1 text-xs font-semibold tracking-wide">
                        {project.status?.toUpperCase() || "AVAILABLE"}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1 text-xs text-gray-600 mt-2">
                      <span className="font-medium">{formatPrice(project.price)}</span>
                      <span className="mx-1 text-gray-300">•</span>
                      <span>{project.possession}</span>
                      <span className="mx-1 text-gray-300">•</span>
                      <span>{project.beds || "Available on Request"}</span>
                    </div>
                    
                    {/* I'm Interested Button */}
                    <div className="mt-4">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleInterestClick(project);
                        }}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
                      >
                        <Zap className="h-4 w-4 mr-2" />
                        I'm Interested
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
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
          
          {selectedProject && (
            <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div className="flex items-start">
                <img
                  src={selectedProject.projectImages?.find(img => img.isMain)?.url || 
                       selectedProject.projectImages?.[0]?.url || 
                       "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=600&q=80"}
                  alt={selectedProject.name}
                  className="w-20 h-20 rounded-lg object-cover mr-4"
                />
                <div>
                  <h4 className="font-bold text-lg text-gray-800">
                    {selectedProject.name}
                  </h4>
                  <p className="text-blue-600 font-semibold">
                    {selectedProject.builderName}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedProject.locality}, {selectedProject.city}
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
                I agree to receive communications from {selectedProject?.builderName || 'the builder'} and HomeYatra regarding this property inquiry. 
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

export default GetProjectAPI;

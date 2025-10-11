import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import axiosInstance from "@/axiosCalls/axiosInstance";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Building2,
  ArrowLeft,
  Save,
  Loader2,
  MapPin,
  Phone,
  Mail,
  User,
  FileText,
  CheckCircle
} from "lucide-react";
import { OtpStep } from "@/components/login/OtpStep";

interface State {
  id: string;
  state: string;
}

interface City {
  id: string;
  city: string;
}

const AddProject = () => {
  const navigate = useNavigate();
  const { user, requestOtp } = useAuth();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"form" | "otp">("form");
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [builders, setBuilders] = useState([]);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingBuilders, setLoadingBuilders] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    builderId: "",
    name: "",
    projectType: "",
    email: "",
    contactPerson: "",
    phone: "",
    isTCAccepted: false,
    cityId: "",
    stateId: ""
  });

  // Check if user is admin
  useEffect(() => {
    if (user?.role !== "Admin") {
      toast.error("Access denied. Admin privileges required.");
      navigate("/");
    }
  }, [user, navigate]);

  // Reset to form step if user refreshes during OTP step
  useEffect(() => {
    if (step === "otp" && !formData.phone) {
      setStep("form");
    }
  }, [step, formData.phone]);

  // Fetch states and builders on component mount
  useEffect(() => {
    fetchStates();
    fetchBuilders();
  }, []);

  // Fetch cities when state changes
  useEffect(() => {
    if (formData.stateId) {
      fetchCities(formData.stateId);
    } else {
      setCities([]);
    }
  }, [formData.stateId]);

  const fetchStates = async () => {
    setLoadingStates(true);
    try {
      const cachedStates = localStorage.getItem("allStates");
      if (cachedStates) {
        const statesData = JSON.parse(cachedStates);
        setStates(statesData);
      } else {
        const response = await axiosInstance.get(
          "/api/Generic/GetActiveRecords?tableName=State"
        );
        if (response.data.statusCode === 200) {
          setStates(response.data.data);
          localStorage.setItem("allStates", JSON.stringify(response.data.data));
        }
      }
    } catch (error) {
      console.error("Error loading states:", error);
      toast.error("Failed to load states");
    } finally {
      setLoadingStates(false);
    }
  };

  const fetchBuilders = async () => {
    setLoadingBuilders(true);
    try {
      const response = await axiosInstance.post("/api/Builder/GetBuilders", {
        searchTerm: ""
      });
      
      if (response.data.statusCode === 200) {
        const apiBuilders = response.data.data || [];
        
        // Map API response to consistent format
        const mappedBuilders = apiBuilders.map((builder) => {
          return {
            id: builder.builderId,
            name: builder.name,
            location: `${builder.address}, ${builder.city}, ${builder.state}`,
            email: builder.email,
            phone: builder.phone,
            logoUrl: builder.logoUrl,
            status: builder.isActive ? "Active" : "Inactive"
          };
        });
        
        setBuilders(mappedBuilders);
      } else {
        console.error("Failed to fetch builders:", response.data);
        toast.error("Failed to load builders");
      }
    } catch (error) {
      console.error("Error fetching builders:", error);
      toast.error("Failed to load builders");
    } finally {
      setLoadingBuilders(false);
    }
  };

  const fetchCities = async (stateId) => {
    setLoadingCities(true);
    try {
      const response = await axiosInstance.get(
        `/api/Generic/GetActiveRecords?tableName=City&parentTableName=State&parentField=StateId&parentId=${stateId}`
      );
      if (response.data.statusCode === 200) {
        setCities(response.data.data);
      }
    } catch (error) {
      console.error("Error loading cities:", error);
      toast.error("Failed to load cities");
    } finally {
      setLoadingCities(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.builderId) {
      toast.error("Please select a builder");
      return;
    }
    if (!formData.name.trim()) {
      toast.error("Project name is required");
      return;
    }
    if (!formData.contactPerson.trim()) {
      toast.error("Contact person is required");
      return;
    }
    if (!formData.phone.trim()) {
      toast.error("Phone number is required");
      return;
    }
    if (!formData.isTCAccepted) {
      toast.error("Please accept terms and conditions");
      return;
    }
    if (!formData.cityId) {
      toast.error("Please select a city");
      return;
    }
    if (!formData.stateId) {
      toast.error("Please select a state");
      return;
    }

    // Validate phone number
    if (formData.phone.length !== 10) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }

    setLoading(true);
    try {
      // Try to submit directly first to see if OTP is actually required
      const formDataToSend = new FormData();
      formDataToSend.append("BuilderId", formData.builderId.trim());
      formDataToSend.append("Name", formData.name.trim());
      formDataToSend.append("ProjectType", formData.projectType || "");
      formDataToSend.append("Email", formData.email.trim());
      formDataToSend.append("ContactPerson", formData.contactPerson.trim());
      formDataToSend.append("Phone", `+91${formData.phone.trim()}`);
      formDataToSend.append("OTP", ""); // Try with empty OTP first
      formDataToSend.append("IsTCAccepted", formData.isTCAccepted.toString());
      formDataToSend.append("CityId", formData.cityId);
      formDataToSend.append("StateId", formData.stateId);

      console.log("🔍 Testing direct submission without OTP...");
      const response = await axiosInstance.post("/api/Builder/AddProject", formDataToSend);

      if (response.data.statusCode === 200) {
        toast.success("Project added successfully!");
        
        // Reset form
        setFormData({
          builderId: "",
          name: "",
          projectType: "",
          email: "",
          contactPerson: "",
          phone: "",
          isTCAccepted: false,
          cityId: "",
          stateId: ""
        });
        
        // Navigate back or to projects list
        navigate("/newlanching");
      } else {
        // If direct submission fails, try OTP flow
        console.log("🔍 Direct submission failed, trying OTP flow...");
        await handleOtpFlow();
      }
    } catch (error) {
      console.error("❌ Direct submission error:", error);
      if (error.response?.data?.message?.includes("OTP") || error.response?.status === 400) {
        // If error mentions OTP, try OTP flow
        console.log("🔍 Error mentions OTP, trying OTP flow...");
        await handleOtpFlow();
      } else {
        toast.error("Failed to add project. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOtpFlow = async () => {
    try {
      // Use signup action for project creation (creates user account)
      console.log("🔍 Sending OTP for project creation (signup action)...");
      
      const signupPayload = {
        phone: `+91${formData.phone}`,
        templateId: 3,
        message: "Terms and Conditions accepted during project creation.",
        action: "signup",
        name: formData.contactPerson,
        userTypeId: "3", // Builder user type
        isTermsConditionsAccepted: formData.isTCAccepted,
      };
      
      console.log("🔍 Sending signup OTP with payload:", signupPayload);
      
      const responseOtp = await axiosInstance.post("/api/Message/Send", signupPayload);
      console.log("🔍 OTP Response:", responseOtp.data);

      if (
        responseOtp?.data?.statusCode === 200 &&
        responseOtp?.data?.message != null &&
        responseOtp?.data?.message != undefined &&
        responseOtp?.data?.message != ""
      ) {
        console.log("🔍 OTP sent successfully!");
        toast.success("OTP sent successfully! Check your phone.");
        setStep("otp");
      } else {
        console.error("❌ OTP Send Failed:", responseOtp.data);
        toast.error("Failed to send OTP. Please try again.");
      }
    } catch (error) {
      console.error("❌ Error sending OTP:", error);
      
      // Handle rate limit specifically
      if (error.response?.status === 429) {
        const errorMessage = error.response?.data?.message || "Rate limit exceeded";
        console.error("❌ Rate Limit Error:", errorMessage);
        toast.error("Rate limit exceeded. Please wait 1 hour before trying again.");
      } else {
        console.error("❌ OTP Error Response:", error.response?.data);
        toast.error("Failed to send OTP. Please try again later.");
      }
    }
  };

  const handleOtpSubmit = async (otp: string) => {
    setLoading(true);
    try {
      // Validate OTP format
      if (!otp || otp.length !== 6) {
        toast.error("Please enter a valid 6-digit OTP");
        setLoading(false);
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append("BuilderId", formData.builderId.trim());
      formDataToSend.append("Name", formData.name.trim());
      formDataToSend.append("ProjectType", formData.projectType || "");
      formDataToSend.append("Email", formData.email.trim());
      formDataToSend.append("ContactPerson", formData.contactPerson.trim());
      formDataToSend.append("Phone", `+91${formData.phone.trim()}`);
      formDataToSend.append("OTP", otp.trim());
      formDataToSend.append("IsTCAccepted", formData.isTCAccepted.toString());
      formDataToSend.append("CityId", formData.cityId);
      formDataToSend.append("StateId", formData.stateId);

      // Debug: Log what we're sending
      console.log("🔍 Debug - Form data being sent:");
      for (let [key, value] of formDataToSend.entries()) {
        console.log(`${key}: ${value}`);
      }
      console.log("🔍 Debug - OTP being sent:", otp);
      console.log("🔍 Debug - Phone number:", formData.phone);

      const response = await axiosInstance.post("/api/Builder/AddProject", formDataToSend);

      if (response.data.statusCode === 200) {
        toast.success("Project added successfully!");
        
        // Reset form
        setFormData({
          builderId: "",
          name: "",
          projectType: "",
          email: "",
          contactPerson: "",
          phone: "",
          isTCAccepted: false,
          cityId: "",
          stateId: ""
        });
        setStep("form");
        
        // Navigate back or to projects list
        navigate("/newlanching");
      } else {
        toast.error(response.data.message || "Failed to add project");
      }
    } catch (error) {
      console.error("❌ Error adding project:", error);
      console.error("❌ Error response:", error.response?.data);
      console.error("❌ Error status:", error.response?.status);
      
      if (error.response?.data?.message) {
        console.error("❌ API Error Message:", error.response.data.message);
        toast.error(error.response.data.message);
      } else if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        console.error("❌ Validation errors:", errors);
        const firstError = Object.values(errors)[0];
        toast.error(Array.isArray(firstError) ? firstError[0] : firstError);
      } else if (error.response?.status === 400) {
        toast.error("Invalid request. Please check all fields and try again.");
      } else if (error.response?.status === 401) {
        toast.error("Unauthorized. Please login again.");
      } else {
        toast.error("Failed to add project. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      console.log("🔍 Resending OTP for project creation...");
      
      const signupPayload = {
        phone: `+91${formData.phone}`,
        templateId: 3,
        message: "Terms and Conditions accepted during project creation.",
        action: "signup",
        name: formData.contactPerson,
        userTypeId: "3", // Builder user type
        isTermsConditionsAccepted: formData.isTCAccepted,
      };
      
      console.log("🔍 Resending signup OTP with payload:", signupPayload);
      
      const responseOtp = await axiosInstance.post("/api/Message/Send", signupPayload);
      console.log("🔍 Resend OTP Response:", responseOtp.data);

      if (
        responseOtp?.data?.statusCode === 200 &&
        responseOtp?.data?.message != null &&
        responseOtp?.data?.message != undefined &&
        responseOtp?.data?.message != ""
      ) {
        console.log("🔍 OTP resent successfully!");
        toast.success("OTP resent successfully!");
      } else {
        console.error("❌ OTP Resend Failed:", responseOtp.data);
        toast.error("Failed to resend OTP. Please try again.");
      }
    } catch (error) {
      console.error("❌ Error resending OTP:", error);
      
      // Handle rate limit specifically
      if (error.response?.status === 429) {
        const errorMessage = error.response?.data?.message || "Rate limit exceeded";
        console.error("❌ Rate Limit Error:", errorMessage);
        toast.error("Rate limit exceeded. Please wait before resending.");
      } else {
        console.error("❌ OTP Resend Error Response:", error.response?.data);
        toast.error("Failed to resend OTP. Please try again later.");
      }
    }
  };

  if (user?.role !== "Admin") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-cyan-400/20 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 max-w-5xl relative z-10 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-6 text-gray-600 hover:text-gray-800 hover:bg-white/50 backdrop-blur-sm transition-all duration-300 rounded-full px-4 py-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <div className="flex items-center space-x-4 mb-6">
            <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
              <Building2 className="h-10 w-10 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Add New Project
              </h1>
              <p className="text-gray-600 mt-2 text-lg">Create a stunning new builder project</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
            <CardTitle className="flex items-center text-2xl font-bold text-gray-800">
              <div className="p-2 bg-blue-100 rounded-lg mr-3">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              Project Information
            </CardTitle>
            <p className="text-gray-600 mt-2">Fill in the details to create your project</p>
          </CardHeader>
          <CardContent className="p-8">
            {step === "form" ? (
              <form onSubmit={handleFormSubmit} className="space-y-8">
              {/* Builder Selection */}
              <div className="space-y-3">
                <Label htmlFor="builderId" className="text-base font-semibold text-gray-700 flex items-center">
                  <Building2 className="h-4 w-4 mr-2 text-blue-600" />
                  Select Builder <span className="text-red-500 ml-1">*</span>
                </Label>
                <div className="relative group">
                  <Building2 className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  <Select
                    value={formData.builderId}
                    onValueChange={(value) => handleInputChange("builderId", value)}
                  >
                    <SelectTrigger className="w-full pl-12 h-12 border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 rounded-xl text-base bg-white/80 backdrop-blur-sm">
                      <SelectValue placeholder={loadingBuilders ? "Loading builders..." : "Select a builder"} />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-2 shadow-xl bg-white/95 backdrop-blur-sm">
                      {loadingBuilders ? (
                        <SelectItem value="loading" disabled className="rounded-lg">
                          <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            <span>Loading builders...</span>
                          </div>
                        </SelectItem>
                      ) : (
                        builders.map((builder) => (
                          <SelectItem key={builder.id} value={builder.id} className="rounded-lg hover:bg-blue-50">
                            <div className="flex items-center space-x-3 py-1">
                              <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center overflow-hidden shadow-sm">
                                {builder.logoUrl ? (
                                  <img 
                                    src={builder.logoUrl} 
                                    alt={builder.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <Building2 className="h-4 w-4 text-blue-600" />
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="font-semibold text-gray-800">{builder.name}</div>
                                <div className="text-sm text-gray-500">{builder.location}</div>
                              </div>
                              <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                                builder.status === "Active" 
                                  ? "bg-green-100 text-green-700 border border-green-200" 
                                  : "bg-red-100 text-red-700 border border-red-200"
                              }`}>
                                {builder.status}
                              </span>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                {/* Selected Builder Info */}
                {formData.builderId && (
                  <div className="mt-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 shadow-sm">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <CheckCircle className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <span className="text-sm font-medium text-blue-800">Selected Builder:</span>
                        <span className="text-sm text-blue-700 ml-2 font-semibold">
                          {builders.find(b => b.id === formData.builderId)?.name || "Unknown Builder"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Project Name */}
              <div className="space-y-3">
                <Label htmlFor="name" className="text-base font-semibold text-gray-700 flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-blue-600" />
                  Project Name <span className="text-red-500 ml-1">*</span>
                </Label>
                <div className="relative group">
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter project name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="w-full h-12 pl-4 border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 rounded-xl text-base bg-white/80 backdrop-blur-sm"
                    required
                  />
                </div>
              </div>

              {/* Project Type */}
              <div className="space-y-3">
                <Label htmlFor="projectType" className="text-base font-semibold text-gray-700 flex items-center">
                  <Building2 className="h-4 w-4 mr-2 text-blue-600" />
                  Project Type
                </Label>
                <Select
                  value={formData.projectType}
                  onValueChange={(value) => handleInputChange("projectType", value)}
                >
                  <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 rounded-xl text-base bg-white/80 backdrop-blur-sm">
                    <SelectValue placeholder="Select project type" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-2 shadow-xl bg-white/95 backdrop-blur-sm">
                    <SelectItem value="Residential" className="rounded-lg hover:bg-blue-50">Residential</SelectItem>
                    <SelectItem value="Commercial" className="rounded-lg hover:bg-blue-50">Commercial</SelectItem>
                    <SelectItem value="Both" className="rounded-lg hover:bg-blue-50">Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Contact Person */}
              <div className="space-y-3">
                <Label htmlFor="contactPerson" className="text-base font-semibold text-gray-700 flex items-center">
                  <User className="h-4 w-4 mr-2 text-blue-600" />
                  Contact Person <span className="text-red-500 ml-1">*</span>
                </Label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  <Input
                    id="contactPerson"
                    type="text"
                    placeholder="Enter contact person name"
                    value={formData.contactPerson}
                    onChange={(e) => handleInputChange("contactPerson", e.target.value)}
                    className="w-full h-12 pl-12 border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 rounded-xl text-base bg-white/80 backdrop-blur-sm"
                    required
                  />
                </div>
              </div>

              {/* Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* State */}
                <div className="space-y-3">
                  <Label htmlFor="state" className="text-base font-semibold text-gray-700 flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-blue-600" />
                    State <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <div className="relative group">
                    <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    <Select
                      value={formData.stateId}
                      onValueChange={(value) => handleInputChange("stateId", value)}
                      disabled={loadingStates}
                    >
                      <SelectTrigger className="pl-12 h-12 border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 rounded-xl text-base bg-white/80 backdrop-blur-sm">
                        <SelectValue placeholder={loadingStates ? "Loading states..." : "Select state"} />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-2 shadow-xl bg-white/95 backdrop-blur-sm">
                        {states.map((state) => (
                          <SelectItem key={state.id} value={state.id} className="rounded-lg hover:bg-blue-50">
                            {state.state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* City */}
                <div className="space-y-3">
                  <Label htmlFor="city" className="text-base font-semibold text-gray-700 flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-blue-600" />
                    City <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <div className="relative group">
                    <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    <Select
                      value={formData.cityId}
                      onValueChange={(value) => handleInputChange("cityId", value)}
                      disabled={!formData.stateId || loadingCities}
                    >
                      <SelectTrigger className="pl-12 h-12 border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 rounded-xl text-base bg-white/80 backdrop-blur-sm">
                        <SelectValue placeholder={
                          !formData.stateId 
                            ? "Select state first" 
                            : loadingCities 
                            ? "Loading cities..." 
                            : "Select city"
                        } />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-2 shadow-xl bg-white/95 backdrop-blur-sm">
                        {cities.map((city) => (
                          <SelectItem key={city.id} value={city.id} className="rounded-lg hover:bg-blue-50">
                            {city.city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="space-y-3">
                <Label htmlFor="email" className="text-base font-semibold text-gray-700 flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-blue-600" />
                  Email
                </Label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter email address"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="w-full h-12 pl-12 border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 rounded-xl text-base bg-white/80 backdrop-blur-sm"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-3">
                <Label htmlFor="phone" className="text-base font-semibold text-gray-700 flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-blue-600" />
                  Phone Number <span className="text-red-500 ml-1">*</span>
                </Label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="w-full h-12 pl-12 border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 rounded-xl text-base bg-white/80 backdrop-blur-sm"
                    required
                  />
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200">
                <Checkbox
                  id="isTCAccepted"
                  checked={formData.isTCAccepted}
                  onCheckedChange={(checked) => handleInputChange("isTCAccepted", checked === true)}
                  className="h-5 w-5 border-2 border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                />
                <Label htmlFor="isTCAccepted" className="text-sm font-medium text-gray-700 cursor-pointer">
                  I accept the terms and conditions <span className="text-red-500 ml-1">*</span>
                </Label>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4 pt-8">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                  className="px-8 h-12 border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-300 rounded-xl font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="px-8 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:transform-none disabled:opacity-70"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Adding Project...
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5 mr-2" />
                      Add Project
                    </>
                  )}
                </Button>
              </div>
            </form>
            ) : (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    onClick={() => setStep("form")}
                    className="text-gray-600 hover:text-gray-800 hover:bg-white/50 backdrop-blur-sm transition-all duration-300 rounded-full px-4 py-2"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Form
                  </Button>
                </div>
                
                {/* OTP Header */}
                <div className="text-center space-y-4">
                  <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg w-fit mx-auto">
                    <Phone className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">Verify Your Phone</h3>
                    <p className="text-gray-600 mt-2">We've sent a verification code to</p>
                    <p className="text-lg font-semibold text-blue-600">+91{formData.phone}</p>
                  </div>
                </div>
                
                <OtpStep
                  phone={`+91${formData.phone}`}
                  onSubmit={handleOtpSubmit}
                  onResendOtp={handleResendOtp}
                  loading={loading}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddProject;

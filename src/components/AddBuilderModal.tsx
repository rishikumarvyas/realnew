import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, Building, X } from "lucide-react";
import axiosInstance from "@/axiosCalls/axiosInstance";

interface AddBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface State {
  id: string;
  state: string;
}

interface City {
  id: string;
  city: string;
}

const AddBuilderModal: React.FC<AddBuilderModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    email: "",
    phone: "",
    logo: null as File | null,
    cityId: "",
    stateId: "",
  });

  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const { toast } = useToast();

  // Load states on component mount
  useEffect(() => {
    if (isOpen) {
      loadStates();
    }
  }, [isOpen]);

  // Load cities when state changes
  useEffect(() => {
    if (formData.stateId) {
      loadCities(formData.stateId);
    } else {
      setCities([]);
    }
  }, [formData.stateId]);

  const loadStates = async () => {
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
      toast({
        title: "Error",
        description: "Failed to load states. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingStates(false);
    }
  };

  const loadCities = async (stateId: string) => {
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
      toast({
        title: "Error",
        description: "Failed to load cities. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingCities(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file.",
          variant: "destructive",
        });
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }
      
      setFormData((prev) => ({
        ...prev,
        logo: file,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Enhanced validation
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Builder name is required.",
        variant: "destructive",
      });
      return;
    }

    if (formData.name.trim().length < 2) {
      toast({
        title: "Validation Error",
        description: "Builder name must be at least 2 characters long.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.email.trim()) {
      toast({
        title: "Validation Error",
        description: "Email is required.",
        variant: "destructive",
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.phone.trim()) {
      toast({
        title: "Validation Error",
        description: "Phone number is required.",
        variant: "destructive",
      });
      return;
    }

    // Phone validation (should be 10 digits)
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(formData.phone.trim())) {
      toast({
        title: "Validation Error",
        description: "Phone number must be exactly 10 digits.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.stateId) {
      toast({
        title: "Validation Error",
        description: "Please select a state.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.cityId) {
      toast({
        title: "Validation Error",
        description: "Please select a city.",
        variant: "destructive",
      });
      return;
    }

    // Final validation - ensure all fields are properly filled
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.cityId || !formData.stateId) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);


    try {
      // Create FormData with all required fields (without quotes as per API expectations)
      const formDataToSend = new FormData();
      formDataToSend.append("Name", formData.name.trim());
      formDataToSend.append("Description", formData.description.trim());
      formDataToSend.append("Address", formData.address.trim());
      formDataToSend.append("Email", formData.email.trim());
      formDataToSend.append("Phone", formData.phone.trim());
      formDataToSend.append("CityId", formData.cityId.toString());
      formDataToSend.append("StateId", formData.stateId.toString());
      
      if (formData.logo) {
        formDataToSend.append("Logo", formData.logo);
      }


      // Additional validation - ensure all required fields have valid values
      if (!formData.name || formData.name.trim().length === 0) {
        throw new Error("Name cannot be empty");
      }
      if (!formData.email || formData.email.trim().length === 0) {
        throw new Error("Email cannot be empty");
      }
      if (!formData.phone || formData.phone.trim().length === 0) {
        throw new Error("Phone cannot be empty");
      }
      if (!formData.stateId || formData.stateId.toString().trim().length === 0) {
        throw new Error("StateId cannot be empty");
      }
      if (!formData.cityId || formData.cityId.toString().trim().length === 0) {
        throw new Error("CityId cannot be empty");
      }







      console.log("Sending builder data:", {
        Name: formData.name.trim(),
        Description: formData.description.trim(),
        Address: formData.address.trim(),
        Email: formData.email.trim(),
        Phone: formData.phone.trim(),
        CityId: formData.cityId,
        StateId: formData.stateId,
        HasLogo: !!formData.logo
      });
      
      const response = await axiosInstance.post("/api/Builder/AddBuilder", formDataToSend);


      if (response.data.statusCode === 200) {
        toast({
          title: "Success",
          description: "Builder added successfully!",
        });
        
        // Reset form
        setFormData({
          name: "",
          description: "",
          address: "",
          email: "",
          phone: "",
          logo: null,
          cityId: "",
          stateId: "",
        });
        
        onClose();
      } else {
        throw new Error(response.data.message || "Failed to add builder");
      }
    } catch (error: any) {
      let errorMessage = "Failed to add builder. Please try again.";
      
      // Handle 500 server errors
      if (error.response?.status === 500) {
        errorMessage = "The AddBuilder API is currently experiencing server issues. This is a backend problem, not a frontend issue.";
      }
      // Handle validation errors specifically
      else if (error.response?.data?.errors) {
        const validationErrors = error.response.data.errors;
        const errorMessages = [];
        
        if (validationErrors.Name) {
          errorMessages.push(`Name: ${validationErrors.Name.join(', ')}`);
        }
        if (validationErrors.CityId) {
          errorMessages.push(`City: ${validationErrors.CityId.join(', ')}`);
        }
        if (validationErrors.StateId) {
          errorMessages.push(`State: ${validationErrors.StateId.join(', ')}`);
        }
        
        if (errorMessages.length > 0) {
          errorMessage = `Validation errors: ${errorMessages.join('; ')}`;
        }
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: error.response?.status === 500 ? "Server Error" : "Validation Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        name: "",
        description: "",
        address: "",
        email: "",
        phone: "",
        logo: null,
        cityId: "",
        stateId: "",
      });
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[95vh] overflow-hidden p-0">
        {/* Header with gradient background */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <DialogHeader className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Building className="h-8 w-8" />
                </div>
                <div>
                  <DialogTitle className="text-3xl font-bold">Add New Builder</DialogTitle>
                  <DialogDescription className="text-blue-100 text-lg mt-2">
                    Register a new builder to expand our platform
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
          </div>
          {/* Decorative elements */}
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full"></div>
          <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full"></div>
        </div>

        {/* Form Content */}
        <div className="p-8 max-h-[calc(95vh-200px)] overflow-y-auto bg-gray-50">
          

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information Section */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Builder Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                  Builder Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter builder name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-11 rounded-lg"
                  required
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                  Email Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-11 rounded-lg"
                  required
                />
              </div>
            </div>
          </div>

          {/* Contact & Location Section */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Contact & Location
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                  Phone Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter phone number"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-11 rounded-lg"
                  required
                />
              </div>

              {/* State */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                  State <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.stateId}
                  onValueChange={(value) => handleInputChange("stateId", value)}
                  disabled={loadingStates}
                >
                  <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-11 rounded-lg">
                    <SelectValue placeholder={loadingStates ? "Loading states..." : "Select state"} />
                  </SelectTrigger>
                  <SelectContent>
                    {states.map((state) => (
                      <SelectItem key={state.id} value={state.id}>
                        {state.state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {/* City */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                  City <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.cityId}
                  onValueChange={(value) => handleInputChange("cityId", value)}
                  disabled={!formData.stateId || loadingCities}
                >
                  <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-11 rounded-lg">
                    <SelectValue 
                      placeholder={
                        !formData.stateId 
                          ? "Select state first" 
                          : loadingCities 
                          ? "Loading cities..." 
                          : "Select city"
                      } 
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((city) => (
                      <SelectItem key={city.id} value={city.id}>
                        {city.city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Logo Upload */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">
                  Company Logo
                </Label>
                <div className="relative">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-11 rounded-lg"
                  />
                  {formData.logo && (
                    <div className="mt-3 flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Upload className="h-4 w-4 text-green-600" />
                      </div>
                      <span className="text-sm text-green-700 font-medium">{formData.logo.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setFormData(prev => ({ ...prev, logo: null }))}
                        className="h-6 w-6 p-0 text-green-600 hover:text-green-800"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information Section */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              Additional Information
            </h3>
            <div className="space-y-6">
              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="address" className="text-sm font-semibold text-gray-700">
                  Business Address
                </Label>
                <Textarea
                  id="address"
                  placeholder="Enter complete business address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                  rows={3}
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-semibold text-gray-700">
                  Company Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="Tell us about the builder's expertise, experience, and specialties..."
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                  rows={4}
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex flex-col sm:flex-row gap-4 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={loading}
                className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-3 rounded-lg font-medium"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Adding Builder...
                  </>
                ) : (
                  <>
                    <Building className="mr-2 h-5 w-5" />
                    Add Builder
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddBuilderModal;

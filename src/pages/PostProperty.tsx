import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Upload,
  X,
  Plus,
  Home,
  MapPin,
  Tag,
  Check,
  User,
  Camera,
  Calendar,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { DatePicker } from "@/components/ui/date-picker";
import { Checkbox } from "@/components/ui/checkbox";
import axiosInstance from "../axiosCalls/axiosInstance";

const PostProperty = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  // Form states
  const [propertyType, setPropertyType] = useState("");
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [balcony, setBalcony] = useState("");
  const [area, setArea] = useState("");
  const [ownerType, setOwnerType] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [imageURLs, setImageURLs] = useState<string[]>([]);
  const [mainImageIndex, setMainImageIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // New states for availability and approval
  const [availableFrom, setAvailableFrom] = useState<Date | undefined>(undefined);
  const [isReraApproved, setIsReraApproved] = useState<string>("false");
  const [isOCApproved, setIsOCApproved] = useState<string>("false");

  // Tenant preference options
  const preferenceOptions = [
    { id: "2", label: "Family" },
    { id: "1", label: "Bachelors" },
    { id: "3", label: "Girls" },
    { id: "4", label: "Anyone" },
  ];

  const availableAmenities = [
    "Swimming Pool",
    "Gym",
    "Security",
    "Power Backup",
    "Parking",
    "Garden",
    "Lift",
    "Club House",
    "Furnished",
    "Unfurnished",
    "Semi Furnished",
  ];

  // Individual checkbox states with proper initialization
  const [amenityStates, setAmenityStates] = useState<Record<string, boolean>>(
    availableAmenities.reduce((acc, amenity) => {
      acc[amenity] = false;
      return acc;
    }, {} as Record<string, boolean>)
  );

  const [preferenceStates, setPreferenceStates] = useState<Record<string, boolean>>(
    preferenceOptions.reduce((acc, option) => {
      acc[option.id] = false;
      return acc;
    }, {} as Record<string, boolean>)
  );

  // Enhanced city-state mapping - properly mapped
  const availableCities = [
    { id: 140, name: "Indore", stateId: 20, stateName: "Madhya Pradesh" },
    { id: 135, name: "Bhopal", stateId: 20, stateName: "Madhya Pradesh" },
    { id: 184, name: "Pune", stateId: 21, stateName: "Maharashtra" },
  ];

  // Form validation states
  const [priceValidation, setPriceValidation] = useState(true);
  const [areaValidation, setAreaValidation] = useState(true);

  // Fixed: Separate handler functions that don't cause infinite loops
  const handleAmenityChange = (amenity: string) => {
    setAmenityStates(prev => ({
      ...prev,
      [amenity]: !prev[amenity]
    }));
  };

  // Fixed: Separate handler function for preferences
  const handlePreferenceChange = (preferenceId: string) => {
    setPreferenceStates(prev => ({
      ...prev,
      [preferenceId]: !prev[preferenceId]
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);

      if (images.length + newFiles.length > 6) {
        toast({
          title: "Maximum 6 images allowed",
          description: "You can upload up to 6 images for a property.",
          variant: "destructive",
        });
        return;
      }

      const newImages = [...images, ...newFiles];
      setImages(newImages);

      // Generate preview URLs
      const newImageURLs = newFiles.map((file) => URL.createObjectURL(file));
      setImageURLs([...imageURLs, ...newImageURLs]);

      // If no main image is selected, select the first one by default
      if (mainImageIndex === null && newImages.length > 0) {
        setMainImageIndex(images.length); // Set to the first of the newly added images
      }
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    const newImageURLs = [...imageURLs];

    newImages.splice(index, 1);
    newImageURLs.splice(index, 1);

    setImages(newImages);
    setImageURLs(newImageURLs);

    // Adjust mainImageIndex if needed
    if (mainImageIndex !== null) {
      if (index === mainImageIndex) {
        setMainImageIndex(newImages.length > 0 ? 0 : null); // Set to first remaining image or null
      } else if (index < mainImageIndex) {
        setMainImageIndex(mainImageIndex - 1); // Shift index left
      }
    }
  };

  // Validate price as a number with two decimal places
  const validatePrice = (value: string) => {
    // Allow empty value during typing
    if (!value) return true;

    // Check if it's a valid number with up to 2 decimal places
    const regex = /^\d+(\.\d{0,2})?$/;
    return regex.test(value) && parseFloat(value) > 0;
  };

  // Handle price change with validation
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const isValid = validatePrice(value);
    setPriceValidation(isValid);
    setPrice(value);
  };

  // Handle area change with validation
  const handleAreaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const isValid = !value || parseFloat(value) > 0;
    setAreaValidation(isValid);
    setArea(value);
  };

  // Helper functions to map UI selections to API IDs
  const mapCategoryToId = (type: string) => {
    const categoryMap: Record<string, number> = {
      buy: 1,
      rent: 2,
    
    };
    return categoryMap[type] || 1;
  };

  const mapPropertyTypeToId = (type: string) => {
    const propertyTypeMap: Record<string, number> = {
      "Row House": 3,
      shop: 2,
      Plot: 4,
      Bunglow: 5,
      Flat: 1,
    };
    return propertyTypeMap[type] || 1;
  };

  const getCityStateId = (cityId: number) => {
    const selectedCity = availableCities.find(city => city.id === cityId);
    return selectedCity?.stateId || 1;
  };

  const mapOwnerTypeToId = (type: string) => {
    const ownerTypeMap: Record<string, number> = {
      owner: 1,
      broker: 2,
      builder: 3,
    };
    return ownerTypeMap[type] || 1;
  };

  const mapAmenityToId = (amenity: string) => {
    const amenityMap: Record<string, number> = {
      "Lift": 1,
      "Swimming Pool": 2,
      "Club House": 3,
      "Garden": 4,
      "Gym": 5,
      "Security": 6,
      "Parking": 8,
      "Power Backup": 7,
      "Furnished": 9,
      "Unfurnished": 10,
      "Semi Furnished": 11,
    };
    return amenityMap[amenity] || 1;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Basic validation
    if (!propertyType || !category || !title || !price || !address || !city) {
      toast({
        title: "Missing Information",
        description: "Please fill all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (!priceValidation) {
      toast({
        title: "Invalid Price",
        description: "Please enter a valid price.",
        variant: "destructive",
      });
      return;
    }

    if (!areaValidation) {
      toast({
        title: "Invalid Area",
        description: "Please enter a valid area in sq.ft.",
        variant: "destructive",
      });
      return;
    }

    if (images.length === 0) {
      toast({
        title: "Images Required",
        description: "Please upload at least one image of your property.",
        variant: "destructive",
      });
      return;
    }

    if (
      mainImageIndex === null ||
      mainImageIndex < 0 ||
      mainImageIndex >= images.length
    ) {
      toast({
        title: "Main Image Not Selected",
        description: "Please select a main image for your property.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Get selected amenities
      const selectedAmenities = Object.entries(amenityStates)
        .filter(([_, isSelected]) => isSelected)
        .map(([amenity, _]) => amenity);
      
      // Get selected preferences
      const selectedPreferences = Object.entries(preferenceStates)
        .filter(([_, isSelected]) => isSelected)
        .map(([preferenceId, _]) => preferenceId);

      // Map your form selections to API IDs
      const categoryId = mapCategoryToId(propertyType);
      const propertyTypeId = mapPropertyTypeToId(category);
      const cityId = parseInt(city); 
      const stateId = getCityStateId(cityId);
      const userTypeId = mapOwnerTypeToId(ownerType);

      // Map selected amenities to their IDs
      const amenityIds = selectedAmenities.map((amenity) => mapAmenityToId(amenity));

      // Create FormData for file uploads
      const formData = new FormData();

      // Add account ID - Check for both user.id and user.userId for backward compatibility
      if (!user || (!user.userId && !user.id)) {
        toast({
          title: "Authentication Required",
          description: "Please log in to post a property.",
          variant: "destructive",
        });
        navigate('/login');
        return;
      }

      // Use either userId or id, whichever is available
      const accountId = user.userId || user.id;
      
      formData.append("AccountId", accountId);
      formData.append("SuperCategoryId", categoryId.toString());
      formData.append("PropertyTypeId", propertyTypeId.toString());
      formData.append("Title", title);
      formData.append("Description", description);

      // Price handling
      if (price) {
        // Ensure price is treated as a number with 2 decimal places
        const priceValue = parseFloat(price);
        if (!isNaN(priceValue)) {
          // Format with exactly 2 decimal places
          const formattedPrice = priceValue.toFixed(2);
          formData.append("Price", formattedPrice);
        }
      }

      // Area handling
      if (area) {
        const areaValue = parseFloat(area);
        if (!isNaN(areaValue)) {
          formData.append("Area", areaValue.toString());
        }
      }

      if (bedrooms) formData.append("Bedroom", bedrooms);
      if (bathrooms) formData.append("Bathroom", bathrooms);
      if (balcony) formData.append("Balcony", balcony);
      formData.append("Address", address);
      formData.append("CityId", cityId.toString());
      formData.append("StateId", stateId.toString());
      formData.append("UserTypeId", userTypeId.toString());

      // Add amenities
      amenityIds.forEach((id) => {
        formData.append("AmenityIds", id.toString());
      });

      // Add RERA and OC approval status
      formData.append("IsReraApproved", (isReraApproved === "true").toString());
      formData.append("IsOCApproved", (isOCApproved === "true").toString());

      // Add preference and available from date for rental properties
      if (propertyType === "rent") {
        // Use the first preference or a default if none selected
        if (selectedPreferences.length > 0) {
          formData.append("PreferenceId", selectedPreferences[0]);
        } else {
          formData.append("PreferenceId", "4"); // Default to "Anyone"
        }
        
        if (availableFrom) {
          formData.append("AvailableFrom", availableFrom.toISOString());
        }
      }

      // Upload images with fixed format to match API expectations
      images.forEach((image, index) => {
        formData.append(`Images[${index}].File`, image);
        formData.append(
          `Images[${index}].IsMain`,
          index === mainImageIndex ? "true" : "false"
        );
      });

      // For debugging - log the entire FormData
      for (let pair of formData.entries()) {
        console.log(pair[0] + ": " + pair[1]);
      }

      // API call using axios instance with automatic token handling
      const response = await axiosInstance.post(
        "/api/Account/AddProperty",
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      const result = response.data;

      // Extract the propertyId from the response, checking both possible field names
      // This handles the API inconsistency where sometimes it returns 'propetyId' (with typo)
      const newPropertyId = result?.propertyId || result?.propetyId;

      if (!newPropertyId) {
        toast({
          title: "Failed to retrieve Property ID",
          description: "We could not retrieve the Property ID after posting.",
          variant: "destructive",
        });
        return;
      }

      console.log("New Property ID from API response:", newPropertyId);

      toast({
        title: "Property Posted Successfully!",
        description: "Your property has been submitted for review.",
      });

      // Navigate to the Dashboard page with the PropertyId
      navigate(`/dashboard?newPropertyId=${newPropertyId}`);
    } catch (error: any) {
      console.error("Error posting property:", error);
      
      // Handle different types of errors
      let errorMessage = "There was an error posting your property. Please try again.";
      
      if (error.response) {
        // Server responded with error status
        if (error.response.status === 401) {
          errorMessage = "Authentication failed. Please login again.";
          navigate('/login');
        } else if (error.response.status === 403) {
          errorMessage = "You don't have permission to post properties.";
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        // Network error
        errorMessage = "Network error. Please check your connection and try again.";
      }

      toast({
        title: "Failed to Post Property",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Determine if we should show bedroom, bathroom, and balcony fields
  // Don't show for Plot category or commercial properties
  const showBedroomBathroomBalcony = !(category === "Plot" || category === "shop");

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center mb-8">
        <div className="bg-blue-100 p-3 rounded-full mr-4">
          <Home className="h-6 w-6 text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800">Post Your Property</h1>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg mb-8 border border-blue-100">
        <p className="text-blue-800 font-medium">
          Complete the form below to list your property. Fields marked with *
          are required.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-8">
          {/* Basic Property Details */}
          <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b">
              <div className="flex items-center">
                <Home className="h-5 w-5 text-blue-600 mr-2" />
                <CardTitle>Property Details</CardTitle>
              </div>
              <CardDescription>
                Enter the basic details about your property
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="propertyType"
                    className="text-gray-700 font-medium"
                  >
                    Property Category <span className="text-red-500">*</span>
                  </Label>
                  <Select value={propertyType} onValueChange={setPropertyType}>
                    <SelectTrigger
                      id="propertyType"
                      className="bg-white border-2 focus:ring-2 focus:ring-blue-100"
                    >
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="buy">Sell</SelectItem>
                      <SelectItem value="rent">Rent</SelectItem>
             
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="category"
                    className="text-gray-700 font-medium"
                  >
                  Property Type <span className="text-red-500">*</span>
                  </Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger
                      id="category"
                      className="bg-white border-2 focus:ring-2 focus:ring-blue-100"
                    >
                      <SelectValue placeholder="Select  Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Flat">Flat</SelectItem>
                      <SelectItem value="Bunglow">Bunglow</SelectItem>
                      <SelectItem value="Row House">House</SelectItem>
                      <SelectItem value="Plot">Plot</SelectItem>
                      <SelectItem value="shop">Shop</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title" className="text-gray-700 font-medium">
                  Society Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="Enter Society Name, House Name"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-white border-2 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="description"
                  className="text-gray-700 font-medium"
                >
                  Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe your property in detail, highlighting key features and benefits..."
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-white border-2 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="price"
                    className="text-gray-700 font-medium flex items-center"
                  >
                    <Tag className="h-4 w-4 mr-1 text-blue-600" />
                    Price <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      ₹
                    </span>
                    <Input
                      id="price"
                      placeholder="Enter amount"
                      value={price}
                      onChange={handlePriceChange}
                      className={`bg-white border-2 pl-8 focus:ring-2 focus:ring-blue-100 ${
                        !priceValidation ? "border-red-500" : ""
                      }`}
                      type="text"
                      inputMode="decimal"
                    />
                  </div>
                  {!priceValidation && (
                    <p className="text-red-500 text-xs mt-1">
                      Please enter a valid price
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="area" className="text-gray-700 font-medium">
                    Area <span className="text-red-500">*</span> (sq.ft)
                  </Label>
                  <div className="relative">
                    <Input
                      id="area"
                      placeholder="Enter area"
                      value={area}
                      onChange={handleAreaChange}
                      className={`bg-white border-2 focus:ring-2 focus:ring-blue-100 ${
                        !areaValidation ? "border-red-500" : ""
                      }`}
                      type="text"
                      inputMode="decimal"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      sq.ft
                    </span>
                  </div>
                  {!areaValidation && (
                    <p className="text-red-500 text-xs mt-1">
                      Please enter a valid area
                    </p>
                  )}
                </div>
              </div>
              
              {/* RERA and OC Approval with Radio Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <Label className="text-gray-700 font-medium mb-2 block">
                    RERA Approved
                  </Label>
                  <RadioGroup value={isReraApproved} onValueChange={setIsReraApproved} className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="true" id="rera-yes" />
                      <Label htmlFor="rera-yes">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="false" id="rera-no" />
                      <Label htmlFor="rera-no">No</Label>
                    </div>
                  </RadioGroup>
                </div>
                <div>
                  <Label className="text-gray-700 font-medium mb-2 block">
                    OC Approved
                  </Label>
                  <RadioGroup value={isOCApproved} onValueChange={setIsOCApproved} className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="true" id="oc-yes" />
                      <Label htmlFor="oc-yes">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="false" id="oc-no" />
                      <Label htmlFor="oc-no">No</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              {/* Preferences with Checkboxes (Conditional Rendering) */}
              {propertyType === "rent" && (
                <div className="space-y-4">
                  <div>
                    <Label className="text-gray-700 font-medium mb-2 block">
                      Tenant Preference
                    </Label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {preferenceOptions.map((option) => (
                        <div
                          key={option.id}
                          className={`flex items-center p-3 rounded-lg cursor-pointer transition-all ${
                            preferenceStates[option.id]
                              ? "bg-blue-100 border-2 border-blue-300"
                              : "bg-gray-50 border-2 border-gray-200 hover:border-blue-200"
                          }`}
                        >
                          <Checkbox
                            id={`preference-${option.id}`}
                            checked={preferenceStates[option.id]}
                            onCheckedChange={() => handlePreferenceChange(option.id)}
                            className="mr-2"
                          />
                          <Label 
                            htmlFor={`preference-${option.id}`} 
                            className="cursor-pointer text-sm"
                          >
                            {option.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Available From Date Picker */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="availableFrom"
                      className="text-gray-700 font-medium flex items-center"
                    >
                      <Calendar className="h-4 w-4 mr-1 text-blue-600" />
                      Available From
                    </Label>
                    <DatePicker
                      date={availableFrom}
                      setDate={setAvailableFrom}
                    />
                  </div>
                </div>
              )}

              {/* Bedroom, Bathroom, Balcony (Conditional Rendering) */}
              {showBedroomBathroomBalcony && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="bedrooms"
                      className="text-gray-700 font-medium"
                    >
                      Bedrooms
                    </Label>
                    <Select value={bedrooms} onValueChange={setBedrooms}>
                      <SelectTrigger
                        id="bedrooms"
                        className="bg-white border-2 focus:ring-2 focus:ring-blue-100"
                      >
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {[0, 1, 2, 3, 4, 5, 6].map((num) => (
                          <SelectItem key={num} value={num.toString()}>
                            {num === 0 ? "Studio" : num === 6 ? "6+" : num}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="bathrooms"
                      className="text-gray-700 font-medium"
                    >
                      Bathrooms
                    </Label>
                    <Select value={bathrooms} onValueChange={setBathrooms}>
                      <SelectTrigger
                        id="bathrooms"
                        className="bg-white border-2 focus:ring-2 focus:ring-blue-100"
                      >
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5].map((num) => (
                          <SelectItem key={num} value={num.toString()}>
                            {num === 5 ? "5+" : num}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="balcony"
                      className="text-gray-700 font-medium"
                    >
                      Balcony
                    </Label>
                    <Select value={balcony} onValueChange={setBalcony}>
                      <SelectTrigger
                        id="balcony"
                        className="bg-white border-2 focus:ring-2 focus:ring-blue-100"
                      >
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {[0, 1, 2, 3, 4].map((num) => (
                          <SelectItem key={num} value={num.toString()}>
                            {num === 0 ? "No Balcony" : num === 4 ? "4+" : num}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Location Details with improved city-state mapping */}
          <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b">
              <div className="flex items-center">
                <MapPin className="h-5 w-5 text-blue-600 mr-2" />
                <CardTitle>Location</CardTitle>
              </div>
              <CardDescription>
                Enter the location details of your property
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-2">
                <Label htmlFor="address" className="text-gray-700 font-medium">
                  Address <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="address"
                  placeholder="Enter complete property address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="bg-white border-2 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-gray-700 font-medium">
                    City <span className="text-red-500">*</span>
                  </Label>
                  <Select value={city} onValueChange={setCity}>
                    <SelectTrigger
                      id="city"
                      className="bg-white border-2 focus:ring-2 focus:ring-blue-100"
                    >
                      <SelectValue placeholder="Select City" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCities.map((cityOption) => (
                        <SelectItem
                          key={cityOption.id}
                          value={cityOption.id.toString()}
                        >
                          {cityOption.name} ({cityOption.stateName})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {city && (
                  <div className="space-y-2">
                    <Label className="text-gray-700 font-medium">
                      State
                    </Label>
                    <div className="h-10 px-3 py-2 rounded-md border-2 border-input bg-background text-sm">
                      {availableCities.find(c => c.id.toString() === city)?.stateName || "Not selected"}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Amenities */}
          <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b">
              <div className="flex items-center">
                <Check className="h-5 w-5 text-blue-600 mr-2" />
                <CardTitle>Amenities</CardTitle>
              </div>
              <CardDescription>
                Select the amenities available at your property
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {availableAmenities.map((amenity) => (
                  <div
                    key={amenity}
                    className={`flex items-center p-3 rounded-lg cursor-pointer transition-all ${
                      amenityStates[amenity]
                        ? "bg-blue-100 border-2 border-blue-300"
                        : "bg-gray-50 border-2 border-gray-200 hover:border-blue-200"
                    }`}
                  >
                    <Checkbox
                      id={amenity}
                      checked={amenityStates[amenity]}
                      onCheckedChange={() => handleAmenityChange(amenity)}
                      className="mr-2"
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
            </CardContent>
          </Card>

          {/* Owner Details */}
          <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b">
              <div className="flex items-center">
                <User className="h-5 w-5 text-blue-600 mr-2" />
                <CardTitle>Owner Details</CardTitle>
              </div>
              <CardDescription>
                Specify your relationship with the property
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-2 max-w-md">
                <Label
                  htmlFor="ownerType"
                  className="text-gray-700 font-medium"
                >
                  I am a <span className="text-red-500">*</span>
                </Label>
                <Select value={ownerType} onValueChange={setOwnerType}>
                  <SelectTrigger
                    id="ownerType"
                    className="bg-white border-2 focus:ring-2 focus:ring-blue-100"
                  >
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="owner">Owner</SelectItem>
                    <SelectItem value="broker">Broker</SelectItem>
                    <SelectItem value="builder">Builder</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Upload Images */}
          <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b">
              <div className="flex items-center">
                <Camera className="h-5 w-5 text-blue-600 mr-2" />
                <CardTitle>Property Images</CardTitle>
              </div>
              <CardDescription>
                Upload up to 6 high-quality images of your property
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                {imageURLs.map((url, index) => (
                  <div
                    key={index}
                    className={`relative rounded-lg overflow-hidden border-2 ${
                      mainImageIndex === index
                        ? "border-blue-500 shadow-md"
                        : "border-gray-200"
                    }`}
                  >
                    <img
                      src={url}
                      alt={`Property preview ${index + 1}`}
                      className="h-36 w-full object-cover"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6 rounded-full bg-red-600 hover:bg-red-700"
                      onClick={() => removeImage(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                    <div className="mt-2 p-2 bg-white flex items-center justify-center">
                      <input
                        type="radio"
                        id={`mainImage-${index}`}
                        name="mainImage"
                        checked={mainImageIndex === index}
                        onChange={() => setMainImageIndex(index)}
                        className="mr-2"
                      />
                      <label
                        htmlFor={`mainImage-${index}`}
                        className="text-xs text-gray-700 font-medium"
                      >
                        {mainImageIndex === index
                          ? "Main Image"
                          : "Set as main"}
                      </label>
                    </div>
                  </div>
                ))}
                {imageURLs.length < 6 && (
                  <label className="border-2 border-dashed border-gray-300 rounded-lg h-36 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <Upload className="h-8 w-8 text-blue-500 mb-2" />
                    <span className="text-sm text-blue-600 font-medium">
                      Upload Image
                    </span>
                    <span className="text-xs text-gray-500 mt-1">
                      {imageURLs.length}/6 images
                    </span>
                  </label>
                )}
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <div className="flex gap-3 text-sm text-blue-700">
                  <Upload className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Image Guidelines:</p>
                    <ul className="list-disc list-inside space-y-1 mt-1">
                      <li>Upload clear, well-lit photos</li>
                      <li>Include all major areas of the property</li>
                      <li>At least one image is required</li>
                      <li>Maximum file size: 5MB per image</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <CardFooter className="flex justify-between px-0">
            <Button variant="outline" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? "Posting Property..." : "Post Property"}
            </Button>
          </CardFooter>
        </div>
      </form>
    </div>
  );
};

export default PostProperty;

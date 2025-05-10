import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardFooter, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowLeft,
  Save,
  Loader2,
  Home,
  MapPin,
  Tag,
  Check,
  User,
  Camera,
  X,
  Upload,
  Plus,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const EditProperty = () => {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // States
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [mainImageIndex, setMainImageIndex] = useState<number | null>(null);
  
  // Modified form data to match PostProperty
  const [category, setCategory] = useState("");  // buy, rent
  const [propertyType, setPropertyType] = useState(""); // Flat, Bunglow, etc
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
  const [amenities, setAmenities] = useState<string[]>([]);
  const [images, setImages] = useState<any[]>([]);
  const [imageURLs, setImageURLs] = useState<string[]>([]);
  const [priceValidation, setPriceValidation] = useState(true);
  const [areaValidation, setAreaValidation] = useState(true);
  
  // Tenant preferences (for rent properties)
  const [preferenceId, setPreferenceId] = useState<string>("0");
  const [availableFrom, setAvailableFrom] = useState<Date | undefined>(undefined);
  
  // Additional checkboxes
  const [isReraApproved, setIsReraApproved] = useState(false);
  const [isOCApproved, setIsOCApproved] = useState(false);
  
  // Furnishing options
  const [furnishingStatus, setFurnishingStatus] = useState("unfurnished");

  const preferenceOptions = [
    { id: "2", label: "Family" },
    { id: "1", label: "Bachelors" },
    { id: "3", label: "Girls" },
    { id: "4", label: "Anyone" }
  ];

  // Available cities and amenities
  const availableCities = [
    { id: 1, name: "Indore" },
    { id: 2, name: "Bhopal" },
    { id: 3, name: "Pune" },
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
  ];

  const BASE_URL = "https://homeyatraapi.azurewebsites.net";

  // Fetch property data
  useEffect(() => {
    const fetchPropertyDetails = async () => {
      if (!propertyId) {
        toast({
          title: "Error",
          description: "Property ID is missing.",
          variant: "destructive",
        });
        navigate("/dashboard");
        return;
      }

      try {
        setLoading(true);

        const response = await axios.get(
          `${BASE_URL}/api/Account/GetPropertyDetails?propertyId=${propertyId}`
        );

        if (response.status === 200 && response.data.propertyDetail) {
          const property = response.data.propertyDetail;

          // Parse amenities
          const parsedAmenities: string[] = [];
          if (property.amenityDetails && Array.isArray(property.amenityDetails)) {
            property.amenityDetails.forEach((amenity: any) => {
              const amenityName = amenity.amenity;
              if (amenityName.includes("Swimming Pool")) parsedAmenities.push("Swimming Pool");
              if (amenityName.includes("Gym")) parsedAmenities.push("Gym");
              if (amenityName.includes("Garden")) parsedAmenities.push("Garden");
              if (amenityName.includes("Power Backup")) parsedAmenities.push("Power Backup");
              if (amenityName.includes("Parking")) parsedAmenities.push("Parking");
              if (amenityName.includes("Lift")) parsedAmenities.push("Lift");
              if (amenityName.includes("Security")) parsedAmenities.push("Security");
              if (amenityName.includes("Club House")) parsedAmenities.push("Club House");
            });
          }

          // Map superCategory to category
          let mappedCategory = "";
          if (property.superCategoryId === 1 || property.superCategoryId === 2) {
            mappedCategory = "buy";
          } else if (property.superCategoryId === 3) {
            mappedCategory = "rent";
          }

          // Map propertyTypeId to propertyType
          let mappedPropertyType = "";
          switch(property.propertyTypeId) {
            case 1: mappedPropertyType = "Flat"; break;
            case 2: mappedPropertyType = "shop"; break;
            case 3: mappedPropertyType = "Row House"; break;
            case 4: mappedPropertyType = "Plot"; break;
            case 5: mappedPropertyType = "Bunglow"; break;
            default: mappedPropertyType = "Flat";
          }

          // Map userTypeId to ownerType
          let mappedOwnerType = "";
          switch(property.userTypeId) {
            case 1: mappedOwnerType = "owner"; break;
            case 2: mappedOwnerType = "broker"; break;
            case 3: mappedOwnerType = "builder"; break;
            default: mappedOwnerType = "owner";
          }

          // Set state values
          setTitle(property.title || "");
          setDescription(property.description || "");
          setPrice(property.price?.toString() || "");
          setAddress(property.address || "");
          setCity(property.cityId?.toString() || "1");
          setCategory(mappedCategory);
          setPropertyType(mappedPropertyType);
          setOwnerType(mappedOwnerType);
          setBedrooms(property.bedroom?.toString() || "");
          setBathrooms(property.bathroom?.toString() || "");
          setBalcony(property.balcony?.toString() || "");
          setArea(property.area?.toString() || "");
          setAmenities(parsedAmenities);
          setImages(property.imageDetails || []);

          // Generate image URLs for display
          if (property.imageDetails && Array.isArray(property.imageDetails)) {
            const urls = property.imageDetails.map((img: any) => img.imageUrl);
            setImageURLs(urls);
            
            // Find main image
            const mainIndex = property.imageDetails.findIndex((img: any) => img.isMainImage);
            if (mainIndex !== -1) {
              setMainImageIndex(mainIndex);
            }
          }

          // Set additional properties
          if (property.preferenceId) {
            setPreferenceId(property.preferenceId.toString());
          }
          
          if (property.availableFrom) {
            setAvailableFrom(new Date(property.availableFrom));
          }
          
          setIsReraApproved(property.isReraApproved || false);
          setIsOCApproved(property.isOCApproved || false);
          
          if (property.furnishingStatus) {
            setFurnishingStatus(property.furnishingStatus.toLowerCase());
          }
        } else {
          throw new Error("Property data not found or invalid");
        }
      } catch (error) {
        console.error("Error fetching property details:", error);
        toast({
          title: "Error",
          description:
            "Failed to load property details. Please try again later.",
          variant: "destructive",
        });

        // Set mock data for testing
        setTitle("Sample Property Title");
        setDescription("This is a sample property description for testing when the API is unavailable.");
        setPrice("25000");
        setAddress("123 Test Street");
        setCity("1");
        setCategory("rent");
        setPropertyType("Flat");
        setOwnerType("owner");
        setBedrooms("3");
        setBathrooms("2");
        setBalcony("1");
        setArea("1500");
        setAmenities(["Parking", "Garden", "Security"]);
        setImageURLs(["https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&q=80"]);
      } finally {
        setLoading(false);
      }
    };

    fetchPropertyDetails();
  }, [propertyId, toast, navigate]);

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

  const handleAmenityToggle = (amenity: string) => {
    setAmenities(prev => {
      if (prev.includes(amenity)) {
        return prev.filter(a => a !== amenity);
      } else {
        return [...prev, amenity];
      }
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);

      if (imageURLs.length + newFiles.length > 6) {
        toast({
          title: "Maximum 6 images allowed",
          description: "You can upload up to 6 images for a property.",
          variant: "destructive",
        });
        return;
      }

      // Add new files to the newImages state
      setNewImages(prev => [...prev, ...newFiles]);

      // Generate preview URLs for new images
      const newImageURLs = newFiles.map(file => URL.createObjectURL(file));
      setImageURLs(prev => [...prev, ...newImageURLs]);

      // If no main image is selected, select the first one by default
      if (mainImageIndex === null) {
        setMainImageIndex(imageURLs.length);
      }
    }
  };

  const removeExistingImage = (index: number) => {
    // Remove from images array
    const updatedImages = [...images];
    updatedImages.splice(index, 1);
    setImages(updatedImages);

    // Remove from imageURLs array
    const updatedImageURLs = [...imageURLs];
    updatedImageURLs.splice(index, 1);
    setImageURLs(updatedImageURLs);

    // Adjust mainImageIndex if needed
    if (mainImageIndex !== null) {
      if (index === mainImageIndex) {
        setMainImageIndex(updatedImages.length > 0 ? 0 : null);
      } else if (index < mainImageIndex) {
        setMainImageIndex(mainImageIndex - 1);
      }
    }
  };

  const removeNewImage = (index: number) => {
    // Calculate the index in the newImages array
    const newImageIndex = index - images.length;
    if (newImageIndex >= 0 && newImageIndex < newImages.length) {
      // Remove from newImages array
      const updatedNewImages = [...newImages];
      updatedNewImages.splice(newImageIndex, 1);
      setNewImages(updatedNewImages);

      // Remove from imageURLs array
      const updatedImageURLs = [...imageURLs];
      updatedImageURLs.splice(index, 1);
      setImageURLs(updatedImageURLs);

      // Adjust mainImageIndex if needed
      if (mainImageIndex !== null) {
        if (index === mainImageIndex) {
          setMainImageIndex(imageURLs.length - 1 > 0 ? 0 : null);
        } else if (index < mainImageIndex) {
          setMainImageIndex(mainImageIndex - 1);
        }
      }
    }
  };

  const setImageAsMain = (index: number) => {
    setMainImageIndex(index);
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
    const cityStateMap: Record<number, number> = {
      1: 1, // Indore -> Madhya Pradesh
      2: 1, // Bhopal -> Madhya Pradesh
      3: 2, // Pune -> Maharashtra
    };
    return cityStateMap[cityId] || 1;
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
    };
    return amenityMap[amenity] || 1;
  };

  const handleSubmit = async (e: React.FormEvent) => {
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

    if (imageURLs.length === 0) {
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
      mainImageIndex >= imageURLs.length
    ) {
      toast({
        title: "Main Image Not Selected",
        description: "Please select a main image for your property.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    try {
      // Map form selections to API IDs
      const categoryId = mapCategoryToId(category);
      const propertyTypeId = mapPropertyTypeToId(propertyType);
      const cityId = parseInt(city);
      const stateId = getCityStateId(cityId);
      const userTypeId = mapOwnerTypeToId(ownerType);

      // Map selected amenities to their IDs
      const amenityIds = amenities.map((amenity) => mapAmenityToId(amenity));

      // Create FormData for file uploads
      const formData = new FormData();

      // Add property ID
      formData.append("PropertyId", propertyId || "");
      formData.append("AccountId", user?.userId || "");
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

      // Add tenant preferences for rental properties
      if (category === "rent") {
        formData.append("PreferenceId", preferenceId);
        
        if (availableFrom) {
          formData.append("AvailableFrom", availableFrom.toISOString());
        }
      }

      // Add additional checkboxes
      formData.append("IsReraApproved", isReraApproved.toString());
      formData.append("IsOCApproved", isOCApproved.toString());
      
      // Add furnishing status
      formData.append("FurnishingStatus", furnishingStatus);

      // Add amenities
      amenityIds.forEach((id) => {
        formData.append("AmenityIds", id.toString());
      });

      // Add information about existing images
      if (images && images.length > 0) {
        images.forEach((image, index) => {
          formData.append(`ExistingImages[${index}].ImageId`, image.imageId);
          formData.append(`ExistingImages[${index}].IsMain`, 
            index === mainImageIndex ? "true" : "false");
        });
      }

      // Add new images
      if (newImages && newImages.length > 0) {
        newImages.forEach((file, index) => {
          formData.append(`NewImages[${index}].File`, file);
          const absoluteIndex = index + (images ? images.length : 0);
          formData.append(
            `NewImages[${index}].IsMain`,
            absoluteIndex === mainImageIndex ? "true" : "false"
          );
        });
      }

      console.log("Submitting form data:", Object.fromEntries(formData.entries()));

      // API call
      const response = await fetch(
        `${BASE_URL}/api/Account/EditProperty`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const result = await response.json();

      toast({
        title: "Property Updated Successfully!",
        description: "Your property has been updated and submitted for review.",
      });

      // Navigate back to the dashboard
      navigate(`/dashboard`);
    } catch (error) {
      console.error("Error updating property:", error);
      toast({
        title: "Failed to Update Property",
        description:
          "There was an error updating your property. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="mb-4">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
        </div>
        <h3 className="text-xl font-medium text-blue-800">
          Loading property details...
        </h3>
      </div>
    );
  }

  // Check if the property type needs to hide specific fields
  const isPlotOrCommercial = propertyType === "Plot" || propertyType === "shop";

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center mb-8">
        <div className="bg-blue-100 p-3 rounded-full mr-4">
          <Home className="h-6 w-6 text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800">Edit Your Property</h1>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg mb-8 border border-blue-100">
        <p className="text-blue-800 font-medium">
          Update the form below to modify your property listing. Fields marked with *
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
                Update the basic details about your property
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="propertyType"
                    className="text-gray-700 font-medium"
                  >
                    Property Type <span className="text-red-500">*</span>
                  </Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger
                      id="propertyType"
                      className="bg-white border-2 focus:ring-2 focus:ring-blue-100"
                    >
                      <SelectValue placeholder="Select Type" />
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
                    Category <span className="text-red-500">*</span>
                  </Label>
                  <Select value={propertyType} onValueChange={setPropertyType}>
                    <SelectTrigger
                      id="category"
                      className="bg-white border-2 focus:ring-2 focus:ring-blue-100"
                    >
                      <SelectValue placeholder="Select Category" />
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
                  placeholder="E.g., Modern 3BHK Apartment with Garden View"
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

              {!isPlotOrCommercial && (
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

              {/* Additional fields for approvals */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="isReraApproved" 
                    checked={isReraApproved}
                    onCheckedChange={(checked) => setIsReraApproved(checked === true)}
                  />
                  <Label htmlFor="isReraApproved" className="text-gray-700">
                    RERA Approved
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="isOCApproved"
                    checked={isOCApproved}
                    onCheckedChange={(checked) => setIsOCApproved(checked === true)}
                  />
                  <Label htmlFor="isOCApproved" className="text-gray-700">
                    OC Approved
                  </Label>
                </div>
              </div>

              {/* Furnishing Status */}
              {/* <div className="space-y-2">
                <Label className="text-gray-700 font-medium">
                  Furnishing Status
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div
                    className={`flex items-center p-3 rounded-lg cursor-pointer transition-all ${
                      furnishingStatus === "furnished"
                        ? "bg-blue-100 border-2 border-blue-300"
                        : "bg-gray-50 border-2 border-gray-200 hover:border-blue-200"
                    }`}
                    onClick={() => setFurnishingStatus("furnished")}
                  >
                    <input
                      type="radio"
                      id="furnished"
                      name="furnishingStatus"
                      checked={furnishingStatus === "furnished"}
                      onChange={() => {}}
                      className="mr-2"
                    />
                    <Label htmlFor="furnished" className="cursor-pointer text-sm">
                      Furnished
                    </Label>
                  </div>
                  <div
                    className={`flex items-center p-3 rounded-lg cursor-pointer transition-all ${
                      furnishingStatus === "semi-furnished"
                        ? "bg-blue-100 border-2 border-blue-300"
                        : "bg-gray-50 border-2 border-gray-200 hover:border-blue-200"
                    }`}
                    onClick={() => setFurnishingStatus("semi-furnished")}
                  >
                    <input
                      type="radio"
                      id="semi-furnished"
                      name="furnishingStatus"
                      checked={furnishingStatus === "semi-furnished"}
                      onChange={() => {}}
                      className="mr-2"
                    />
                    <Label htmlFor="semi-furnished" className="cursor-pointer text-sm">
                      Semi Furnished
                    </Label>
                  </div>
                  <div
                    className={`flex items-center p-3 rounded-lg cursor-pointer transition-all ${
                      furnishingStatus === "unfurnished"
                        ? "bg-blue-100 border-2 border-blue-300"
                        : "bg-gray-50 border-2 border-gray-200 hover:border-blue-200"
                    }`}
                    onClick={() => setFurnishingStatus("unfurnished")}
                  >
                    <input
                      type="radio"
                      id="unfurnished"
                      name="furnishingStatus"
                      checked={furnishingStatus === "unfurnished"}
                      onChange={() => {}}
                      className="mr-2"
                    />
                    <Label htmlFor="unfurnished" className="cursor-pointer text-sm">
                      Unfurnished
                    </Label>
                  </div>
                </div>
              </div> */}
            </CardContent>
          </Card>

          {/* Location Details */}
          <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b">
              <div className="flex items-center">
                <MapPin className="h-5 w-5 text-blue-600 mr-2" />
                <CardTitle>Location</CardTitle>
              </div>
              <CardDescription>
                Update the location details of your property
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
                          {cityOption.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rental Specific Fields */}
          {category === "rent" && (
            <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b">
                <div className="flex items-center">
                  <User className="h-5 w-5 text-blue-600 mr-2" />
                  <CardTitle>Rental Details</CardTitle>
                </div>
                <CardDescription>
                  Update rental-specific information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="tenantPreference" className="text-gray-700 font-medium">
                      Tenant Preference
                    </Label>
                    <Select value={preferenceId} onValueChange={setPreferenceId}>
                      <SelectTrigger
                        id="tenantPreference"
                        className="bg-white border-2 focus:ring-2 focus:ring-blue-100"
                      >
                        <SelectValue placeholder="Select Preference" />
                      </SelectTrigger>
                      <SelectContent>
                        {preferenceOptions.map(option => (
                          <SelectItem key={option.id} value={option.id}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="availableFrom" className="text-gray-700 font-medium">
                      Available From
                    </Label>
                    <DatePicker date={availableFrom} setDate={setAvailableFrom} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Amenities */}
          <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b">
              <div className="flex items-center">
                <Check className="h-5 w-5 text-blue-600 mr-2" />
                <CardTitle>Amenities</CardTitle>
              </div>
              <CardDescription>
                Update the amenities available at your property
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {availableAmenities.map((amenity) => (
                  <div
                    key={amenity}
                    className={`flex items-center p-3 rounded-lg cursor-pointer transition-all ${
                      amenities.includes(amenity)
                        ? "bg-blue-100 border-2 border-blue-300"
                        : "bg-gray-50 border-2 border-gray-200 hover:border-blue-200"
                    }`}
                    onClick={() => handleAmenityToggle(amenity)}
                  >
                    <input
                      type="checkbox"
                      id={amenity}
                      checked={amenities.includes(amenity)}
                      onChange={() => {}}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                    />
                    <Label htmlFor={amenity} className="cursor-pointer text-sm">
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
                Update your relationship with the property
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
                Update images of your property (up to 6 images)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                {imageURLs.map((url, index) => {
                  const isExistingImage = index < images.length;
                  return (
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
                        onClick={() => isExistingImage ? removeExistingImage(index) : removeNewImage(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                      <div className="mt-2 p-2 bg-white flex items-center justify-center">
                        <input
                          type="radio"
                          id={`mainImage-${index}`}
                          name="mainImage"
                          checked={mainImageIndex === index}
                          onChange={() => setImageAsMain(index)}
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
                  );
                })}
                
                {imageURLs.length < 6 && (
                  <label className="border-2 border-dashed border-gray-300 rounded-lg h-36 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      multiple
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
              disabled={saving}
              className="bg-real-blue hover:bg-blue-600"
            >
              {saving ? "Updating Property..." : "Update Property"}
            </Button>
          </CardFooter>
        </div>
      </form>
    </div>
  );
};

export default EditProperty;

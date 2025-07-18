import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
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
import imageCompression from "browser-image-compression";
import axiosInstance from "../axiosCalls/axiosInstance";
import { getAmenity } from "@/utils/UtilityFunctions";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
  const [cityId, setCityId] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [balcony, setBalcony] = useState("");
  const [area, setArea] = useState("");
  const [ownerType, setOwnerType] = useState("");
  const [amenities, setAmenities] = useState([]);
  const [images, setImages] = useState([]);
  const [imageURLs, setImageURLs] = useState([]);
  const [mainImageIndex, setMainImageIndex] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState("");
  const [selectedStateId, setSelectedStateId] = useState("");
  const [cityList, setCityList] = useState([]);
  const [locality, setLocality] = useState("");
  const [cityLoading, setCityLoading] = useState(false);
  const [isReraApproved, setIsReraApproved] = useState<string>("");
  const [isOCApproved, setIsOCApproved] = useState<string>("");
  const [isNA, setIsNA] = useState<string>("");
  const [availableFrom, setAvailableFrom] = useState<Date | undefined>(
    undefined
  );

  useEffect(() => {
    if (selectedStateId) {
      setCityId(""); // Reset city selection
      setCityLoading(true);
      axios
        .get(
          `https://homeyatraapi.azurewebsites.net/api/Generic/GetActiveRecords?tableName=City&parentTableName=State&parentField=StateId&parentId=${selectedStateId}`
        )
        .then((res) => {
          if (res?.data?.statusCode === 200 && res?.data?.data?.length > 0) {
            setCityList(res?.data?.data);
          } else {
            setCityList([]);
          }
        })
        .catch(() => setCityList([]))
        .finally(() => setCityLoading(false));
    } else {
      setCityList([]);
      setCityLoading(false);
    }
  }, [selectedStateId]);

  // Tenant preference options
  const preferenceOptions = [
    { id: "2", label: "Family" },
    { id: "1", label: "Bachelors" },
    { id: "3", label: "Girls" },
    { id: "6", label: "Student" },
    { id: "5", label: "Company" },
    { id: "4", label: "Anyone" },
  ];
  const [preferenceStates, setPreferenceStates] = useState<
    Record<string, boolean>
  >(
    preferenceOptions.reduce((acc, option) => {
      acc[option.id] = false;
      return acc;
    }, {} as Record<string, boolean>)
  );

  // Helper for category logic
  const isPlot = category === "Plot";
  const isShop = category === "Shop";
  const isFlatOrBunglowOrHouse =
    category === "Flat" || category === "Bunglow" || category === "House";
  const isSell = propertyType === "Buy";
  const isRent = propertyType === "Rent";

  const checkBoxAmenities: Amenity[] = isShop
    ? getAmenity().checkBoxAmenities.filter((item) =>
        new Set(["1", "6", "7", "8"]).has(item.id)
      )
    : getAmenity().checkBoxAmenities;
  const radioButtonAmenities: Amenity[] = getAmenity().radioButtonAmenities;
  const allStates = JSON.parse(localStorage.getItem("allStates"));
  // Form validation states
  const [priceValidation, setPriceValidation] = useState(true);
  const [areaValidation, setAreaValidation] = useState(true);

  const handleAmenityCheckBox = (amenity) => {
    if (amenities.includes(amenity)) {
      setAmenities(amenities.filter((item) => item !== amenity));
    } else {
      setAmenities([...amenities, amenity]);
    }
  };

  const handleAmenityRadioButton = (event) => {
    setSelectedOption(event.target.value);
  };
  // Fixed: Separate handler function for preferences
  const handlePreferenceChange = (preferenceId: string) => {
    setPreferenceStates((prev) => ({
      ...prev,
      [preferenceId]: !prev[preferenceId],
    }));
  };
  const handleImageUpload = async (e) => {
    const imageFile = e.target.files[0];
    const options = {
      maxSizeMB: 0.2, // Max size in MB
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };

    try {
      const compressedFile = await imageCompression(imageFile, options);

      //converting compressedFile blob type to FileList type
      const convertedfile = new File([compressedFile], "example.jpg", {
        type: compressedFile.type,
      }); // Convert Blob to File
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(convertedfile); // Add the file to DataTransfer
      const fileList = dataTransfer.files; // convert to FileList type

      if (fileList && fileList.length > 0) {
        const newFiles = Array.from(fileList);

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
    } catch (error) {
      console.error(error);
    }
  };

  const removeImage = (index) => {
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
  const validatePrice = (value) => {
    // Allow empty value during typing
    if (!value) return true;

    // Check if it's a valid number with up to 2 decimal places
    const regex = /^\d+(\.\d{0,2})?$/;
    return regex.test(value) && parseFloat(value) > 0;
  };

  // Handle price change with validation
  const handlePriceChange = (e) => {
    const value = e.target.value;
    const isValid = validatePrice(value);
    setPriceValidation(isValid);
    setPrice(value);
  };

  // Handle area change with validation
  const handleAreaChange = (e) => {
    const value = e.target.value;
    const isValid = validatePrice(value);
    setAreaValidation(isValid);
    setArea(value);
  };

  // Helper functions to map UI selections to API IDs
  const mapCategoryToId = (type) => {
    const categoryMap = {
      Buy: 1,
      Rent: 2,
    };
    return categoryMap[type] || null;
  };

  const mapPropertyTypeToId = (type) => {
    const propertyTypeMap = {
      House: 3,
      Shop: 2,
      Plot: 4,
      Bunglow: 5,
      Flat: 1,
    };
    return propertyTypeMap[type] || null;
  };

  const mapOwnerTypeToId = (type) => {
    const ownerTypeMap = {
      owner: 1,
      broker: 2,
      builder: 3,
    };
    return ownerTypeMap[type] || 1;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (
      !propertyType ||
      !category ||
      !title ||
      !price ||
      !area ||
      !address ||
      !cityId ||
      !selectedStateId ||
      !locality
    ) {
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
      // Map your form selections to API IDs
      const categoryId = mapCategoryToId(propertyType);
      const propertyTypeId = mapPropertyTypeToId(category);
      const userTypeId = mapOwnerTypeToId(ownerType);

      // Map selected amenities to their IDs
      const amenityIds =
        selectedOption === "" ? amenities : [...amenities, selectedOption];
      // Create FormData for file uploads
      const formData = new FormData();

      const selectedPreferences = Object.entries(preferenceStates)
        .filter(([_, isSelected]) => isSelected)
        .map(([preferenceId, _]) => preferenceId);

      // Add account ID
      if (!user || !user.userId) {
        toast({
          title: "User Not Logged In",
          description: "Please log in to post your property.",
          variant: "destructive",
        });
        return;
      }

      formData.append("AccountId", user.userId);
      formData.append("SuperCategoryId", categoryId.toString());
      formData.append("PropertyTypeId", propertyTypeId.toString());
      formData.append("Title", title);
      formData.append("Description", description);

      // Price handling - same approach as area
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
      formData.append("StateId", selectedStateId.toString());
      formData.append("Locality", locality.toString());
      formData.append("UserTypeId", userTypeId.toString());

      // Add amenities
      amenityIds.forEach((id) => {
        formData.append("AmenityIds", id.toString());
      });
      formData.append("IsReraApproved", isReraApproved.toString());
      formData.append("IsNA", isNA.toString());
      formData.append("IsOCApproved", isOCApproved.toString());

      // Add preference and available from date for rental properties
      if (propertyType === "Rent") {
        // Use the first preference or a default if none selected
        if (isFlatOrBunglowOrHouse) {
          if (selectedPreferences.length > 0) {
            selectedPreferences.forEach((prefId) => {
              formData.append("PreferenceIds", prefId);
            });
          } else {
            formData.append("PreferenceIds", "4"); // Default to "Anyone"
          }
        }
        if (isShop) {
          formData.append("PreferenceIds", "");
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

      // API call
      // API call using axios instance with automatic token handling
      const response = await axiosInstance.post(
        "/api/Account/AddProperty",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
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
    } catch (error) {
      console.error("Error posting property:", error);
      toast({
        title: "Failed to Post Property",
        description:
          "There was an error posting your property. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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
          Complete the form below to list your property. Fields marked with{" "}
          <span className="text-red-500">*</span> are mandatory.
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
                    htmlFor="category"
                    className="text-gray-700 font-medium"
                  >
                    Property Type <span className="text-red-500">*</span>
                  </Label>
                  <Select value={category} onValueChange={setCategory} required>
                    <SelectTrigger
                      id="category"
                      className="bg-white border-2 focus:ring-2 focus:ring-blue-100"
                    >
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Flat">Flat</SelectItem>
                      <SelectItem value="Bunglow">Bunglow</SelectItem>
                      <SelectItem value="House">House</SelectItem>
                      <SelectItem value="Plot">Plot</SelectItem>
                      <SelectItem value="Shop">Shop</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="propertyType"
                    className="text-gray-700 font-medium"
                  >
                    Category <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={propertyType}
                    onValueChange={setPropertyType}
                    required
                  >
                    <SelectTrigger
                      id="propertyType"
                      className="bg-white border-2 focus:ring-2 focus:ring-blue-100"
                    >
                      <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* If Plot, only show Sell */}
                      {isPlot ? (
                        <SelectItem value="Buy">Sell</SelectItem>
                      ) : (
                        <>
                          <SelectItem value="Buy">Sell</SelectItem>
                          <SelectItem value="Rent">Rent</SelectItem>
                        </>
                      )}
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
                  placeholder="Society name"
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
                      type="text" // Changed to text to avoid browser-specific number input behavior
                      inputMode="decimal" // Better for mobile decimal input
                    />
                  </div>
                  {!priceValidation && (
                    <p className="text-red-500 text-xs mt-1">
                      Please enter a valid price
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="area"
                    className="text-gray-700 font-medium flex items-center"
                  >
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
                      type="text" // Changed to text
                      inputMode="decimal" // Better for mobile decimal input
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
              {/* RERA, OC, NA Approval */}
              {(() => {
                // Plot: Only NA Approved
                if (isPlot) {
                  return (
                    <div className="grid grid-cols-2 sm:grid-cols-2 gap-6">
                      <div>
                        <Label className="text-gray-700 font-medium mb-2 block">
                          NA Approved
                        </Label>
                        <RadioGroup
                          value={isNA}
                          onValueChange={setIsNA}
                          className="flex gap-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="true" id="na-yes" />
                            <Label htmlFor="na-yes">Yes</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="false" id="na-no" />
                            <Label htmlFor="na-no">No</Label>
                          </div>
                        </RadioGroup>
                      </div>
                    </div>
                  );
                }
                // Shop
                if (isShop) {
                  if (isSell) {
                    // Show RERA & OC, hide NA
                    return (
                      <div className="grid grid-cols-2 sm:grid-cols-2 gap-6">
                        <div>
                          <Label className="text-gray-700 font-medium mb-2 block">
                            RERA Approved
                          </Label>
                          <RadioGroup
                            value={isReraApproved}
                            onValueChange={setIsReraApproved}
                            className="flex gap-4"
                          >
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
                          <RadioGroup
                            value={isOCApproved}
                            onValueChange={setIsOCApproved}
                            className="flex gap-4"
                          >
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
                    );
                  }
                  // Shop & Rent: show nothing
                  return null;
                }
                // Flat/Bunglow/House
                if (isFlatOrBunglowOrHouse) {
                  if (isSell) {
                    // Show RERA & OC, hide NA
                    return (
                      <div className="grid grid-cols-2 sm:grid-cols-2 gap-6">
                        <div>
                          <Label className="text-gray-700 font-medium mb-2 block">
                            RERA Approved
                          </Label>
                          <RadioGroup
                            value={isReraApproved}
                            onValueChange={setIsReraApproved}
                            className="flex gap-4"
                          >
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
                          <RadioGroup
                            value={isOCApproved}
                            onValueChange={setIsOCApproved}
                            className="flex gap-4"
                          >
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
                    );
                  }
                  // Flat/Bunglow/House & Rent: show nothing
                  return null;
                }
                return null;
              })()}
              {/* Tenant Preferences & Available From */}
              <div className="space-y-4">
                {!isPlot &&
                  !(
                    (isShop && isSell) ||
                    (isShop && isRent) ||
                    (isFlatOrBunglowOrHouse && isSell) ||
                    (isFlatOrBunglowOrHouse && !isRent)
                  ) && (
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
                              onCheckedChange={() =>
                                handlePreferenceChange(option.id)
                              }
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
                  )}
                {/* Available From Date Picker */}
                {!isPlot && isRent && (
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
                )}
              </div>

              {/* Bedrooms, Bathrooms, Balcony */}
              {!isPlot && !isShop && isFlatOrBunglowOrHouse && (
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
          {/* Amenities */}
          {/* Show only if NOT Plot */}
          {!isPlot && (
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
                <div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                    {checkBoxAmenities.map(({ id, amenity }) => (
                      <div
                        key={id}
                        className={`flex items-center p-3 rounded-lg cursor-pointer transition-all ${
                          amenities.includes(id)
                            ? "bg-blue-100 border-2 border-blue-300"
                            : "bg-gray-50 border-2 border-gray-200 hover:border-blue-200"
                        }`}
                        onClick={() => handleAmenityCheckBox(id)}
                      >
                        <input
                          type="checkbox"
                          id={id}
                          checked={amenities.includes(id)}
                          onChange={() => {}}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
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
                  <div className="my-6" />
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                    {radioButtonAmenities.map(({ id, amenity }) => (
                      <div
                        className={`flex items-center p-3 rounded-lg cursor-pointer transition-all ${
                          selectedOption.includes(id)
                            ? "bg-blue-100 border-2 border-blue-300"
                            : "bg-gray-50 border-2 border-gray-200 hover:border-blue-200"
                        }`}
                      >
                        <label key={id}>
                          <input
                            type="radio"
                            name="furnishing"
                            value={id}
                            checked={selectedOption === id}
                            onChange={handleAmenityRadioButton}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                          />
                          {amenity}
                          <br />
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          {/* Location Details */}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* State Dropdown*/}
                <div className="space-y-2">
                  <Label htmlFor="state" className="text-gray-700 font-medium">
                    State <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={selectedStateId}
                    onValueChange={(val) => setSelectedStateId(val)}
                    required
                  >
                    <SelectTrigger
                      id="state"
                      className="bg-white border-2 focus:ring-2 focus:ring-blue-100"
                    >
                      <SelectValue placeholder="Select State" />
                    </SelectTrigger>
                    <SelectContent>
                      {allStates.map((state) => (
                        <SelectItem key={state.id} value={state.id}>
                          {state.state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {/*City Dropdown*/}
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-gray-700 font-medium">
                    City <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={cityId}
                    onValueChange={(val) => setCityId(val)}
                    required
                    disabled={!selectedStateId || cityLoading}
                  >
                    <SelectTrigger
                      id="city"
                      className="bg-white border-2 focus:ring-2 focus:ring-blue-100"
                    >
                      {cityLoading ? (
                        <span className="flex items-center">
                          <Loader2 className="animate-spin h-4 w-4 mr-2" />
                          Loading...
                        </span>
                      ) : (
                        <SelectValue
                          placeholder={
                            selectedStateId
                              ? "Select City"
                              : "Select State First"
                          }
                        />
                      )}
                    </SelectTrigger>
                    <SelectContent>
                      {cityLoading ? (
                        <div className="flex items-center justify-center p-2">
                          <Loader2 className="animate-spin h-4 w-4 mr-2" />
                          Loading cities...
                        </div>
                      ) : (
                        cityList.map((cityObj) => (
                          <SelectItem key={cityObj.id} value={cityObj.id}>
                            {cityObj.city}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                {/* Locality */}
                <div className="space-y-2">
                  <Label
                    htmlFor="locality"
                    className="text-gray-700 font-medium"
                  >
                    Locality <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="locality"
                    placeholder="Enter locality or area (e.g. MG Road, Sector 10)"
                    value={locality}
                    onChange={(e) => setLocality(e.target.value)}
                    className="bg-white border-2 focus:ring-2 focus:ring-blue-100"
                    required
                  />
                </div>
              </div>
              {/* Address */}
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
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <div className="flex gap-3 text-sm text-blue-700">
                  <Upload className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Image Guidelines:</p>
                    <ul className="list-disc list-inside space-y-1 mt-1">
                      <li>
                        Upload up to 6 high-quality images of your property
                      </li>
                      <li>At least one image is required</li>
                      <li>Maximum file size: 5MB per image</li>
                    </ul>
                  </div>
                </div>
              </div>
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
            </CardContent>
          </Card>
          <CardFooter className="flex justify-center space-x-4">
            <Button variant="outline" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-real-blue hover:bg-blue-600"
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

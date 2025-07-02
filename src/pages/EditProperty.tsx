import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import axiosInstance from "../axiosCalls/axiosInstance";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Save,
  Loader2,
  Pencil,
  Building,
  Bed,
  Bath,
  MapPin,
  AreaChart,
  CheckCircle,
  Upload,
  X,
  Camera,
  Calendar,
} from "lucide-react";
import { getAmenity } from "@/utils/UtilityFunctions";
import imageCompression from "browser-image-compression";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePicker } from "@/components/ui/date-picker";

const EditProperty = () => {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState([]);
  const [imageURLs, setImageURLs] = useState([]);
  const [mainImageIndex, setMainImageIndex] = useState(null);
  const [oldImageURLs, setOldImageURLs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    address: "",
    city: "",
    cityId: "", // Default value based on the curl example
    state: "",
    stateId: "", // Default value based on the curl example
    locality: "",
    superCategory: "",
    superCategoryId: "", // Default value based on the curl example
    propertyType: "",
    propertyTypeId: "", // Default value based on the curl example
    userTypeId: "", // Default value based on the curl example
    bedroom: "",
    bathroom: "",
    balcony: "",
    area: "",
    propertyId: "",
  });
  const [selectedCheckboxes, setSelectedCheckboxes] = useState([]);
  const [selectedRadio, setSelectedRadio] = useState("");

  // Track which field is being edited
  const [activeField, setActiveField] = useState<string | null>(null);
  const [isNA, setIsNA] = useState<string>("");
  const [isReraApproved, setIsReraApproved] = useState<string>("");
  const [isOCApproved, setIsOCApproved] = useState<string>("");
  const [availableFrom, setAvailableFrom] = useState<Date | undefined>(
    undefined
  );
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

        // Use axiosInstance instead of direct axios call
        const response = await axiosInstance.get(
          `/api/Account/GetPropertyDetails?propertyId=${propertyId}`
        );
        if (
          response?.data?.statusCode === 200 &&
          response?.data?.propertyDetail
        ) {
          const property = response?.data?.propertyDetail;

          if (
            property?.amenityDetails &&
            Array.isArray(property?.amenityDetails) &&
            property?.amenityDetails.length > 0
          ) {
            const prevSelectedIds = property?.amenityDetails?.map(
              (item) => item?.amenityId
            );
            setSelectedCheckboxes(
              prevSelectedIds?.filter((id) =>
                checkBoxAmenities?.some((amenity) => amenity?.id === id)
              )
            );
            setSelectedRadio(
              prevSelectedIds?.find((id) =>
                radioAmenities?.some((amenity) => amenity?.id === id)
              ) || ""
            );
          }
          // Set initial images and image URLs
          if (property?.imageDetails && property?.imageDetails.length > 0) {
            setImages(
              property?.imageDetails.map((img) => {
                const blob = new Blob([img.imageUrl], { type: "image/jpeg" });

                return new File([blob], "property-image.jpg", {
                  type: "image/jpeg",
                });
              })
            );
            setOldImageURLs(property?.imageDetails.map((img) => img.imageUrl));
            setImageURLs(property?.imageDetails.map((img) => img.imageUrl));
            setMainImageIndex(
              property?.imageDetails.findIndex((img) => img.isMainImage)
            );
          }

          // Set initial preference states & availableFrom date
          setPreferenceStates((prev) => {
            const updated = { ...prev };
            property.preferences.forEach(({ preferenceId }) => {
              updated[preferenceId] = true;
            });
            return updated;
          });
          setAvailableFrom(property.availableFrom ?? undefined); // Convert string date to Date object

          // Set initial form data
          setIsNA(property.isNA ? "true" : "false"); // Convert boolean to string
          setIsReraApproved(property.isReraApproved ? "true" : "false"); // Convert boolean to string
          setIsOCApproved(property.isOCApproved ? "true" : "false"); // Map API response to form data

          setFormData({
            title: property.title || "",
            description: property.description || "",
            price: property.price?.toString() || "",
            address: property.address || "",
            city: property.city || "",
            cityId: property.cityId?.toString() || "1",
            state: property.state || "",
            stateId: property.stateId?.toString() || "1",
            locality: property.locality || "",
            superCategory: property.superCategory || "",
            superCategoryId: property.superCategoryId?.toString() || "",
            propertyType: property.propertyType || "",
            propertyTypeId: property.propertyTypeId?.toString() || "1",
            userTypeId: property.userTypeId?.toString() || "1",
            bedroom: property.bedroom?.toString() || "",
            bathroom: property.bathroom?.toString() || "",
            balcony: property.balcony?.toString() || "",
            area: property.area?.toString() || "",
            propertyId: property.propertyId || propertyId,
          });
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
      } finally {
        setLoading(false);
      }
    };

    fetchPropertyDetails();
  }, [propertyId, toast, navigate]);

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
  const isPlot = formData.propertyType === "Plot";
  const isShop = formData.propertyType === "Shop";
  const isSell = formData.superCategory === "Buy";
  const isRent = formData.superCategory === "Rent";
  const isFlatOrBunglowOrHouse =
    formData.propertyType === "Flat" ||
    formData.propertyType === "Bunglow" ||
    formData.propertyType === "House";

  const checkBoxAmenities: Amenity[] = isShop
    ? getAmenity().checkBoxAmenities.filter((item) =>
        new Set(["1", "6", "7", "8"]).has(item.id)
      )
    : getAmenity().checkBoxAmenities;
  const radioAmenities: Amenity[] = getAmenity().radioButtonAmenities;
  // Handle checkbox Amenity selection
  const handleCheckboxChange = (id) => {
    setSelectedCheckboxes((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };
  // Handle radio button Amenity selection
  const handleRadioChange = (id) => {
    setSelectedRadio(id);
  };

  // Fixed: Separate handler function for preferences
  const handlePreferenceChange = (preferenceId: string) => {
    setPreferenceStates((prev) => ({
      ...prev,
      [preferenceId]: !prev[preferenceId],
    }));
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleImageUpload = async (e) => {
    const imageFile = e.target.files[0];
    const options = {
      maxSizeMB: 0.1, // Max size in MB
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };

    try {
      const compressedFile = await imageCompression(imageFile, options);

      //converting compressedFile blob type to FileList type
      const convertedfile = new File([compressedFile], "example.txt", {
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
    return (e) => {
      if (e && typeof e.preventDefault === "function") e.preventDefault();
      if (e && typeof e.stopPropagation === "function") e.stopPropagation();
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
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);

      // Create FormData object for the multipart/form-data request
      const formDataObj = new FormData();
      formDataObj.append("PropertyId", formData.propertyId);
      formDataObj.append("Title", formData.title);
      formDataObj.append("Description", formData.description);
      formDataObj.append("Price", formData.price);
      formDataObj.append("Area", formData.area);
      formDataObj.append("Bedroom", formData.bedroom);
      formDataObj.append("Bathroom", formData.bathroom);
      formDataObj.append("Balcony", formData.balcony);
      formDataObj.append("Address", formData.address);
      formDataObj.append("CityId", formData.cityId);
      formDataObj.append("StateId", formData.stateId);
      formDataObj.append("Locality", formData.locality);
      formDataObj.append("PropertyTypeId", formData.propertyTypeId);
      formDataObj.append("UserTypeId", formData.userTypeId);

      // Add amenity IDs
      const finalAmenityIds =
        selectedRadio === ""
          ? selectedCheckboxes
          : [...selectedCheckboxes, selectedRadio];
      finalAmenityIds.forEach((id) => {
        formDataObj.append("AmenityIds", id);
      });

      // Helper: get file object for a given imageUrl (if exists)
      const getFileByUrl = (url) => {
        const idx = imageURLs.indexOf(url);
        return images[idx] || null;
      };
      // Upload images with fixed format to match API expectations
      imageURLs.forEach((url, idx) => {
        const isOld = oldImageURLs.includes(url);
        const isNew = !isOld;
        const isMain = mainImageIndex === idx;
        formDataObj.append(`Images[${idx}].File`, getFileByUrl(url));
        formDataObj.append(`Images[${idx}].ImageUrl`, url);
        formDataObj.append(`Images[${idx}].IsMain`, isMain ? "true" : "false");
        formDataObj.append(`Images[${idx}].IsNew`, isNew ? "true" : "false");
      });

      if ((isFlatOrBunglowOrHouse && isSell) || (isShop && isSell)) {
        formDataObj.append("IsReraApproved", isReraApproved.toString());
        formDataObj.append("IsOCApproved", isOCApproved.toString());
      } else {
        formDataObj.append("IsReraApproved", "");
        formDataObj.append("IsOCApproved", "");
      }
      if (isPlot) {
        formDataObj.append("IsNA", isNA.toString());
      } else {
        formDataObj.append("IsNA", "");
      }
      const selectedPreferences = Object.entries(preferenceStates)
        .filter(([_, isSelected]) => isSelected)
        .map(([preferenceId, _]) => preferenceId);

      if (formData.superCategory === "Rent") {
        // Use the first preference or a default if none selected
        if (isFlatOrBunglowOrHouse) {
          if (selectedPreferences.length > 0) {
            selectedPreferences.forEach((prefId) => {
              formDataObj.append("PreferenceIds", prefId);
            });
          } else {
            formDataObj.append("PreferenceIds", "4"); // Default to "Anyone"
          }
        }
        if (isShop) {
          formDataObj.append("PreferenceIds", "");
        }
        if (availableFrom) {
          formDataObj.append("AvailableFrom", availableFrom.toISOString());
        }
      }

      // Use axiosInstance instead of direct axios call
      const response = await axiosInstance.post(
        `/api/Account/EditProperty`,
        formDataObj,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200) {
        toast({
          title: "Success!",
          description: "Property updated successfully!",
        });
        navigate(`/dashboard`);
      } else {
        throw new Error(response.data.message || "Failed to update property");
      }
    } catch (error) {
      console.error("Error updating property:", error);
      toast({
        title: "Update Error",
        description: "Failed to update property. Please try again later.",
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

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 md:py-8">
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-4 mb-6 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div className="flex items-center mb-3 md:mb-0">
            <Button
              variant="ghost"
              onClick={() => navigate("/dashboard")}
              className="mr-2 bg-white/10 hover:bg-white/20 text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              <span className="inline">Back</span>
            </Button>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              Edit Property
            </h1>
          </div>

          <div className="flex space-x-2">
            <Button
              variant="outline"
              className="bg-white/10 hover:bg-white/20 text-white border-white/30"
              onClick={() => navigate(`/property/${propertyId}`)}
            >
              View Property
            </Button>
            <Button
              variant="default"
              onClick={handleSubmit}
              disabled={saving}
              className="bg-white text-blue-700 hover:bg-white/90"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" /> Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Property Details  */}
          <Card className="overflow-hidden border border-blue-100 shadow-md">
            <CardHeader className="bg-blue-50">
              <CardTitle className="flex items-center text-blue-800">
                <Building className="h-5 w-5 mr-2" /> Property Details
              </CardTitle>
              <CardDescription>
                Edit basic details of your property
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative group">
                  <Label htmlFor="propertyType" className="text-sm font-medium">
                    Category
                  </Label>
                  <Input
                    id="propertyType"
                    name="propertyType"
                    value={
                      formData.propertyTypeId === "1"
                        ? "Flat"
                        : formData.propertyTypeId === "2"
                        ? "Shop"
                        : formData.propertyTypeId === "3"
                        ? "House"
                        : formData.propertyTypeId === "4"
                        ? "Plot"
                        : formData.propertyTypeId === "5"
                        ? "Bunglow"
                        : formData.propertyType
                    }
                    className="border-blue-200 focus:border-blue-500 bg-gray-100 cursor-not-allowed"
                    readOnly
                    disabled
                  />
                </div>
                <div className="relative group">
                  <Label
                    htmlFor="superCategory"
                    className="text-sm font-medium"
                  >
                    Property Type
                  </Label>
                  <Input
                    id="superCategory"
                    name="superCategory"
                    value={
                      formData.superCategoryId === "2"
                        ? "Rent"
                        : formData.superCategoryId === "1"
                        ? "Sell"
                        : ""
                    }
                    className="border-blue-200 focus:border-blue-500 bg-gray-100 cursor-not-allowed"
                    readOnly
                    disabled
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="relative group">
                  <Label htmlFor="title" className="text-sm font-medium">
                    Society Name
                  </Label>
                  <div className="relative">
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="pr-8 transition-all border-blue-200 focus:border-blue-500"
                      onFocus={() => setActiveField("title")}
                      onBlur={() => setActiveField(null)}
                      required
                    />
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Pencil className="h-4 w-4 text-blue-500" />
                    </div>
                  </div>
                </div>

                <div className="relative group">
                  <Label htmlFor="description" className="text-sm font-medium">
                    Description
                  </Label>
                  <div className="relative">
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className="min-h-[120px] transition-all border-blue-200 focus:border-blue-500"
                      onFocus={() => setActiveField("description")}
                      onBlur={() => setActiveField(null)}
                    />
                    <div className="absolute right-2 top-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Pencil className="h-4 w-4 text-blue-500" />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="relative group">
                    <Label htmlFor="price" className="text-sm font-medium">
                      Price (₹)
                    </Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      value={formData.price}
                      onChange={handleInputChange}
                      className="border-blue-200 focus:border-blue-500"
                      onFocus={() => setActiveField("price")}
                      onBlur={() => setActiveField(null)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="area"
                      className="text-gray-700 font-medium flex items-center"
                    >
                      Area (sq.ft)
                    </Label>
                    <div className="relative">
                      <Input
                        id="area"
                        placeholder="Enter area"
                        value={formData.area}
                        onChange={handleInputChange}
                        className="border-blue-200 focus:border-blue-500"
                        type="text" // Changed to text
                        inputMode="decimal" // Better for mobile decimal input
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        sq.ft
                      </span>
                    </div>
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
                    <div className="relative group">
                      <Label htmlFor="bedroom" className="text-sm font-medium">
                        <Bed className="h-4 w-4 inline mr-1" /> Bedrooms
                      </Label>
                      <Input
                        id="bedroom"
                        name="bedroom"
                        type="number"
                        value={formData.bedroom}
                        onChange={handleInputChange}
                        className="border-blue-200 focus:border-blue-500"
                        min="0"
                        required
                      />
                    </div>

                    <div className="relative group">
                      <Label htmlFor="bathroom" className="text-sm font-medium">
                        <Bath className="h-4 w-4 inline mr-1" /> Bathrooms
                      </Label>
                      <Input
                        id="bathroom"
                        name="bathroom"
                        type="number"
                        value={formData.bathroom}
                        onChange={handleInputChange}
                        className="border-blue-200 focus:border-blue-500"
                        min="0"
                        required
                      />
                    </div>
                    <div className="relative group">
                      <Label htmlFor="balcony" className="text-sm font-medium">
                        Balconies
                      </Label>
                      <Input
                        id="balcony"
                        name="balcony"
                        type="number"
                        value={formData.balcony}
                        onChange={handleInputChange}
                        className="border-blue-200 focus:border-blue-500"
                        min="0"
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Amenities */}
          {/* Show only if NOT Plot */}
          {!isPlot && (
            <Card className="overflow-hidden border border-blue-100 shadow-md">
              <CardHeader className="bg-blue-50">
                <CardTitle className="flex items-center text-blue-800">
                  <MapPin className="h-5 w-5 mr-2" /> Amenities
                </CardTitle>
                <CardDescription>
                  Edit amenities available at your property
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-6">
                <div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                    {checkBoxAmenities.map(({ id, amenity }) => (
                      <div
                        key={id}
                        className={`flex items-center p-3 rounded-lg cursor-pointer transition-all ${
                          selectedCheckboxes.includes(id)
                            ? "bg-blue-100 border-2 border-blue-300"
                            : "bg-gray-50 border-2 border-gray-200 hover:border-blue-200"
                        }`}
                        onClick={() => handleCheckboxChange(id)}
                      >
                        <input
                          type="checkbox"
                          id={id}
                          checked={selectedCheckboxes.includes(id)}
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
                    {radioAmenities.map(({ id, amenity }) => (
                      <div
                        className={`flex items-center p-3 rounded-lg cursor-pointer transition-all ${
                          selectedRadio.includes(id)
                            ? "bg-blue-100 border-2 border-blue-300"
                            : "bg-gray-50 border-2 border-gray-200 hover:border-blue-200"
                        }`}
                      >
                        <label key={id}>
                          <input
                            type="radio"
                            name="furnishing"
                            value={id}
                            checked={selectedRadio === id}
                            onChange={() => handleRadioChange(id)}
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
          {/* Location Card */}
          <Card className="overflow-hidden border border-blue-100 shadow-md">
            <CardHeader className="bg-blue-50">
              <CardTitle className="flex items-center text-blue-800">
                <MapPin className="h-5 w-5 mr-2" /> Location
              </CardTitle>
              <CardDescription>
                Edit locality, address of your property
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4"></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* State */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="state"
                      className="text-gray-700 font-medium"
                    >
                      State <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="state"
                      value={formData.state}
                      className="bg-gray-100 border-2 focus:ring-0 cursor-not-allowed"
                      readOnly
                      disabled
                      required
                    />
                  </div>
                  {/* City */}
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-gray-700 font-medium">
                      City <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="city"
                      value={formData.city}
                      className="bg-gray-100 border-2 focus:ring-0 cursor-not-allowed"
                      readOnly
                      disabled
                      required
                    />
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
                      name="locality"
                      placeholder="Enter locality or area (e.g. MG Road, Sector 10)"
                      value={formData.locality}
                      onChange={handleInputChange}
                      className="bg-white border-2 focus:ring-2 focus:ring-blue-100"
                      required
                    />
                  </div>
                </div>
                {/* Address */}
                <div className="relative group">
                  <Label htmlFor="address" className="text-sm font-medium">
                    Address
                  </Label>
                  <Textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="border-blue-200 focus:border-blue-500"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Image Upload Card */}
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
                      onClick={removeImage(index)}
                      type="button"
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

          <div className="flex justify-center space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/dashboard")}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" /> Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProperty;

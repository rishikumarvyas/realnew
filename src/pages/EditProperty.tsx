import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
} from "lucide-react";
import {
  Parking,
  Gym,
  Garden,
  Pool,
  Security,
  Elevator,
} from "@/components/icons/CustomIcons";

const EditProperty = () => {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [mainImageIndex, setMainImageIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    address: "",
    city: "",
    cityId: "", // Default value based on the curl example
    state: "",
    stateId: "", // Default value based on the curl example
    superCategory: "",
    superCategoryId: "", // Default value based on the curl example
    propertyType: "",
    propertyTypeId: "", // Default value based on the curl example
    userTypeId: "", // Default value based on the curl example
    bedroom: "",
    bathroom: "",
    balcony: "",
    area: "",
    amenities: {
      parking: false,
      gym: false,
      garden: false,
      pool: false,
      security: false,
      elevator: false,
    },
    propertyId: "",
    images: [],
    mainImageUrl: "",
  });

  const BASE_URL = "https://homeyatraapi.azurewebsites.net";

  // Track which field is being edited
  const [activeField, setActiveField] = useState<string | null>(null);

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

          // Parse amenities from amenityDetails array
          let parsedAmenities = {
            parking: false,
            gym: false,
            garden: false,
            pool: false,
            security: false,
            elevator: false,
          };

          try {
            if (
              property.amenityDetails &&
              Array.isArray(property.amenityDetails)
            ) {
              property.amenityDetails.forEach((amenity: any) => {
                const amenityName = amenity.amenity.toLowerCase();
                if (amenityName.includes("parking"))
                  parsedAmenities.parking = true;
                if (amenityName.includes("gym")) parsedAmenities.gym = true;
                if (amenityName.includes("garden"))
                  parsedAmenities.garden = true;
                if (amenityName.includes("pool")) parsedAmenities.pool = true;
                if (amenityName.includes("security"))
                  parsedAmenities.security = true;
                if (amenityName.includes("elevator"))
                  parsedAmenities.elevator = true;
              });
            }
          } catch (e) {
            console.error("Error parsing amenities:", e);
          }

          // Find main image URL
          const mainImage = property.imageDetails?.find(
            (img: any) => img.isMainImage
          );
          const mainImageUrl = mainImage
            ? mainImage.imageUrl
            : property.imageDetails?.[0]?.imageUrl || "";

          // Map API response to form data
          setFormData({
            title: property.title || "",
            description: property.description || "",
            price: property.price?.toString() || "",
            address: property.address || "",
            city: property.city || "",
            cityId: property.cityId?.toString() || "1",
            state: property.state || "",
            stateId: property.stateId?.toString() || "1",
            superCategory: property.superCategory?.toLowerCase() || "rent",
            superCategoryId: property.superCategoryId?.toString() || "1",
            propertyType: property.propertyType || "",
            propertyTypeId: property.propertyTypeId?.toString() || "1",
            userTypeId: property.userTypeId?.toString() || "1",
            bedroom: property.bedroom?.toString() || "",
            bathroom: property.bathroom?.toString() || "",
            balcony: property.balcony?.toString() || "",
            area: property.area?.toString() || "",
            amenities: parsedAmenities,
            propertyId: property.propertyId || propertyId,
            images: property.imageDetails || [],
            mainImageUrl: mainImageUrl,
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

        // Set mock data for testing when API fails
        setFormData({
          title: "Sample Property Title",
          description:
            "This is a sample property description for testing when the API is unavailable.",
          price: "25000",
          address: "123 Test Street",
          city: "Mumbai",
          cityId: "1",
          state: "Maharashtra",
          stateId: "1",
          superCategory: "rent",
          superCategoryId: "1",
          propertyType: "Apartment",
          propertyTypeId: "1",
          userTypeId: "1",
          bedroom: "3",
          bathroom: "2",
          balcony: "1",
          area: "1500",
          amenities: {
            parking: true,
            gym: false,
            garden: true,
            pool: false,
            security: true,
            elevator: false,
          },
          propertyId: propertyId || "",
          images: [
            {
              imageId: "sample-id",
              imageUrl:
                "https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&q=80",
              isMainImage: true,
            },
          ],
          mainImageUrl:
            "https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&q=80",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPropertyDetails();
  }, [propertyId, toast, navigate]);

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

  const handleAmenityToggle = (amenity: keyof typeof formData.amenities) => {
    setFormData((prev) => ({
      ...prev,
      amenities: {
        ...prev.amenities,
        [amenity]: !prev.amenities[amenity],
      },
    }));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      setNewImages((prev) => [...prev, ...selectedFiles]);
    }
  };

  const handleSetMainImage = (index: number) => {
    setMainImageIndex(index);
  };

  const removeImage = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
    if (mainImageIndex === index) {
      setMainImageIndex(null);
    } else if (mainImageIndex !== null && mainImageIndex > index) {
      setMainImageIndex(mainImageIndex - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);

      // Format amenities for API as array of IDs
      const amenityMap: Record<string, string> = {
        parking: "1",
        gym: "2",
        garden: "3",
        pool: "4",
        security: "5",
        elevator: "6",
      };

      const amenityIds = Object.entries(formData.amenities)
        .filter(([_, selected]) => selected)
        .map(([name, _]) => amenityMap[name] || name);

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
      formDataObj.append("SuperCategoryId", formData.superCategoryId);
      formDataObj.append("PropertyTypeId", formData.propertyTypeId);
      formDataObj.append("UserTypeId", formData.userTypeId);
      formDataObj.append("MainImageUrl", formData.mainImageUrl);

      // Add amenity IDs
      amenityIds.forEach((id) => {
        formDataObj.append("AmenityIds", id);
      });

      // Add new images if any
      newImages.forEach((file, index) => {
        formDataObj.append(`NewImages[${index}].File`, file);
        formDataObj.append(
          `NewImages[${index}].IsMain`,
          mainImageIndex === index ? "true" : "false"
        );
      });

      console.log("Sending update request...");

      const response = await axios.post(
        `${BASE_URL}/api/Account/EditProperty`,
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

  // Find main image URL
  const mainImageUrl =
    formData.images.find((img: any) => img.isMainImage)?.imageUrl ||
    formData.images[0]?.imageUrl ||
    "https://via.placeholder.com/800x500?text=No+Image";

  // Get additional images (excluding main)
  const additionalImages = formData.images
    .filter((img: any) => !img.isMainImage)
    .slice(0, 3); // Show up to 3 additional images

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information Card */}
            <Card className="overflow-hidden border border-blue-100 shadow-md">
              <CardHeader className="bg-blue-50">
                <CardTitle className="flex items-center text-blue-800">
                  <Building className="h-5 w-5 mr-2" /> Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="relative group">
                    <Label htmlFor="title" className="text-sm font-medium">
                      Property Title
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
                    <Label
                      htmlFor="description"
                      className="text-sm font-medium"
                    >
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative group">
                      <Label
                        htmlFor="superCategory"
                        className="text-sm font-medium"
                      >
                        Listing Type
                      </Label>
                      <Select
                        value={formData.superCategoryId}
                        onValueChange={(value) =>
                          handleSelectChange("superCategoryId", value)
                        }
                      >
                        <SelectTrigger
                          id="superCategoryId"
                          className="border-blue-200 focus:border-blue-500"
                        >
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Buy</SelectItem>
                          <SelectItem value="2">Sell</SelectItem>
                          <SelectItem value="3">Rent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="relative group">
                      <Label
                        htmlFor="propertyType"
                        className="text-sm font-medium"
                      >
                        Property Type
                      </Label>
                      <Select
                        value={formData.propertyTypeId}
                        onValueChange={(value) =>
                          handleSelectChange("propertyTypeId", value)
                        }
                      >
                        <SelectTrigger
                          id="propertyTypeId"
                          className="border-blue-200 focus:border-blue-500"
                        >
                          <SelectValue placeholder="Select property type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Apartment</SelectItem>
                          <SelectItem value="2">House</SelectItem>
                          <SelectItem value="3">Villa</SelectItem>
                          <SelectItem value="4">Commercial</SelectItem>
                          <SelectItem value="5">Land</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

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
                </div>
              </CardContent>
            </Card>

            {/* Property Details Card */}
            <Card className="overflow-hidden border border-blue-100 shadow-md">
              <CardHeader className="bg-blue-50">
                <CardTitle className="flex items-center text-blue-800">
                  <MapPin className="h-5 w-5 mr-2" /> Property Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                    <div className="relative group">
                      <Label htmlFor="area" className="text-sm font-medium">
                        <AreaChart className="h-4 w-4 inline mr-1" /> Area
                        (sq.ft)
                      </Label>
                      <Input
                        id="area"
                        name="area"
                        type="number"
                        value={formData.area}
                        onChange={handleInputChange}
                        className="border-blue-200 focus:border-blue-500"
                        min="0"
                        required
                      />
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <h3 className="font-medium text-blue-800 flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2" /> Amenities
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="parking"
                        className="rounded text-blue-600 focus:ring-blue-500"
                        checked={formData.amenities.parking}
                        onChange={() => handleAmenityToggle("parking")}
                      />
                      <Label
                        htmlFor="parking"
                        className="text-sm cursor-pointer"
                      >
                        Parking
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="gym"
                        className="rounded text-blue-600 focus:ring-blue-500"
                        checked={formData.amenities.gym}
                        onChange={() => handleAmenityToggle("gym")}
                      />
                      <Label htmlFor="gym" className="text-sm cursor-pointer">
                        Gym
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="garden"
                        className="rounded text-blue-600 focus:ring-blue-500"
                        checked={formData.amenities.garden}
                        onChange={() => handleAmenityToggle("garden")}
                      />
                      <Label
                        htmlFor="garden"
                        className="text-sm cursor-pointer"
                      >
                        Garden
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="pool"
                        className="rounded text-blue-600 focus:ring-blue-500"
                        checked={formData.amenities.pool}
                        onChange={() => handleAmenityToggle("pool")}
                      />
                      <Label htmlFor="pool" className="text-sm cursor-pointer">
                        Swimming Pool
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="security"
                        className="rounded text-blue-600 focus:ring-blue-500"
                        checked={formData.amenities.security}
                        onChange={() => handleAmenityToggle("security")}
                      />
                      <Label
                        htmlFor="security"
                        className="text-sm cursor-pointer"
                      >
                        Security
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="elevator"
                        className="rounded text-blue-600 focus:ring-blue-500"
                        checked={formData.amenities.elevator}
                        onChange={() => handleAmenityToggle("elevator")}
                      />
                      <Label
                        htmlFor="elevator"
                        className="text-sm cursor-pointer"
                      >
                        Elevator
                      </Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Address Card */}
            <Card className="overflow-hidden border border-blue-100 shadow-md">
              <CardHeader className="bg-blue-50">
                <CardTitle className="flex items-center text-blue-800">
                  <MapPin className="h-5 w-5 mr-2" /> Location
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="relative group">
                    <Label htmlFor="address" className="text-sm font-medium">
                      Address
                    </Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="border-blue-200 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative group">
                      <Label htmlFor="cityId" className="text-sm font-medium">
                        City
                      </Label>
                      <Select
                        value={formData.cityId}
                        onValueChange={(value) =>
                          handleSelectChange("cityId", value)
                        }
                      >
                        <SelectTrigger
                          id="cityId"
                          className="border-blue-200 focus:border-blue-500"
                        >
                          <SelectValue placeholder="Select city" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Indore</SelectItem>
                          <SelectItem value="2">Bhopal</SelectItem>
                          <SelectItem value="3">Pune</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="relative group">
                      <Label htmlFor="stateId" className="text-sm font-medium">
                        State
                      </Label>
                      <Select
                        value={formData.stateId}
                        onValueChange={(value) =>
                          handleSelectChange("stateId", value)
                        }
                      >
                        <SelectTrigger
                          id="stateId"
                          className="border-blue-200 focus:border-blue-500"
                        >
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Madhya Pradesh</SelectItem>
                          <SelectItem value="2">Maharashtra</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Image Upload Card */}
            <Card className="overflow-hidden border border-blue-100 shadow-md">
              <CardHeader className="bg-blue-50">
                <CardTitle className="flex items-center text-blue-800">
                  Image Upload
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageSelect}
                    accept="image/*"
                    multiple
                    className="hidden"
                  />

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-dashed border-2 py-8 border-blue-300 text-blue-600 hover:bg-blue-50"
                  >
                    Click to select images
                  </Button>

                  {newImages.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">New Images:</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {newImages.map((file, index) => (
                          <div
                            key={index}
                            className="relative group rounded overflow-hidden border"
                          >
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Upload Preview ${index}`}
                              className="w-full h-24 object-cover"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <Button
                                type="button"
                                variant="default"
                                onClick={() => handleSetMainImage(index)}
                                size="sm"
                                className={
                                  mainImageIndex === index
                                    ? "bg-green-600"
                                    : "bg-blue-600"
                                }
                              >
                                {mainImageIndex === index ? "Main" : "Set Main"}
                              </Button>
                              <Button
                                type="button"
                                variant="destructive"
                                onClick={() => removeImage(index)}
                                size="sm"
                              >
                                Remove
                              </Button>
                            </div>
                            {mainImageIndex === index && (
                              <div className="absolute top-1 left-1 px-2 py-0.5 bg-green-600 text-white text-xs rounded">
                                Main
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end space-x-4">
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

        {/* Preview and Image Management Section */}
        <div className="space-y-6">
          <Card className="overflow-hidden border border-blue-100 shadow-md">
            <CardHeader className="bg-blue-50 p-4">
              <CardTitle className="text-blue-800 text-base">
                Property Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="relative">
                <img
                  src={mainImageUrl}
                  alt="Property Preview"
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
                  <div className="text-white">
                    <h3 className="font-bold truncate">
                      {formData.title || "Property Title"}
                    </h3>
                    <p className="flex items-center text-sm">
                      <MapPin className="h-3 w-3 mr-1" />
                      {formData.city || "Location"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span className="flex items-center">
                    <Bed className="h-4 w-4 mr-1" />
                    {formData.bedroom || 0} Bed
                  </span>
                  <span className="flex items-center">
                    <Bath className="h-4 w-4 mr-1" />
                    {formData.bathroom || 0} Bath
                  </span>
                  <span className="flex items-center">
                    <AreaChart className="h-4 w-4 mr-1" />
                    {formData.area || 0} sqft
                  </span>
                </div>

                <div className="font-bold text-blue-600 text-lg">
                  ₹ {Number(formData.price || 0).toLocaleString()}
                </div>

                <Separator className="my-3" />

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    ID: {formData.propertyId.substring(0, 8)}
                  </span>
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full capitalize">
                    {formData.superCategoryId === "1"
                      ? "Buy"
                      : formData.superCategoryId === "2"
                      ? "Sell"
                      : "Rent"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border border-blue-100 shadow-md">
            <CardHeader className="bg-blue-50 p-4">
              <CardTitle className="text-blue-800 text-base">
                Current Images
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-2">
                {formData.images.length > 0 ? (
                  formData.images
                    .slice(0, 4)
                    .map((image: any, index: number) => (
                      <div
                        key={image.imageId || index}
                        className="relative rounded overflow-hidden h-24"
                      >
                        <img
                          src={image.imageUrl}
                          alt={`Property Image ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                        {image.isMainImage && (
                          <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-blue-600 text-white text-xs rounded">
                            Main
                          </div>
                        )}
                      </div>
                    ))
                ) : (
                  <div className="col-span-2 py-8 flex flex-col items-center justify-center bg-blue-50 rounded text-center">
                    <p className="text-blue-700">No images available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EditProperty;

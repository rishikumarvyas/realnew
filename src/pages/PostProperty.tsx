import { useState } from "react";
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
import { Upload, X, Plus, Home, MapPin, Tag, Check, User, Camera } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

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
  const [amenities, setAmenities] = useState([]);
  const [images, setImages] = useState([]);
  const [imageURLs, setImageURLs] = useState([]);
  const [mainImageIndex, setMainImageIndex] = useState(null);
  const [loading, setLoading] = useState(false);

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

  // Available cities
  const availableCities = [
    { id: 1, name: "Indore" },
    { id: 2, name: "Bhopal" },
    { id: 3, name: "Pune" },
  ];

  // Form validation states
  const [priceValidation, setPriceValidation] = useState(true);
  const [areaValidation, setAreaValidation] = useState(true);

  const handleAmenityToggle = (amenity) => {
    if (amenities.includes(amenity)) {
      setAmenities(amenities.filter((item) => item !== amenity));
    } else {
      setAmenities([...amenities, amenity]);
    }
  };

  const handleImageUpload = (e) => {
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
      const newImageURLs = newFiles.map(file => URL.createObjectURL(file));
      setImageURLs([...imageURLs, ...newImageURLs]);

      // If no main image is selected, select the first one by default
      if (mainImageIndex === null && newImages.length > 0) {
        setMainImageIndex(images.length); // Set to the first of the newly added images
      }
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
    const isValid = !value || (parseFloat(value) > 0);
    setAreaValidation(isValid);
    setArea(value);
  };

  // Helper functions to map UI selections to API IDs
  const mapCategoryToId = (type) => {
    const categoryMap = {
      'buy': 1,
      'rent': 2,
    };
    return categoryMap[type] || 1;
  };

  const mapPropertyTypeToId = (type) => {
    const propertyTypeMap = {
      'Row House': 3,
      'shop': 2,
      'Plot': 4,
      'Bunglow': 5,
      'Flat': 1
    };
    return propertyTypeMap[type] || 1;
  };

  const getCityStateId = (cityId) => {
    const cityStateMap = {
      1: 1, // Indore -> Madhya Pradesh
      2: 1, // Bhopal -> Madhya Pradesh
      3: 2  // Pune -> Maharashtra
    };
    return cityStateMap[cityId] || 1;
  };

  const mapOwnerTypeToId = (type) => {
    const ownerTypeMap = {
      'owner': 1,
      'broker': 2,
      'builder': 3,
    };
    return ownerTypeMap[type] || 1;
  };

  const mapAmenityToId = (amenity) => {
    const amenityMap = {
      'Lift': 1,
      'Swimming Pool': 2,
      'Club House': 3,
      'Garden': 4,
      'Gym': 5,
      'Security': 6,
      'Parking': 8,
      'Power Backup': 7,
    };
    return amenityMap[amenity] || 1;
  };

  const handleSubmit = async (e) => {
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
  
    if (mainImageIndex === null || mainImageIndex < 0 || mainImageIndex >= images.length) {
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
      const cityId = parseInt(city); // Use the direct city ID from the dropdown
      const stateId = getCityStateId(cityId);
      const userTypeId = mapOwnerTypeToId(ownerType);
  
      // Map selected amenities to their IDs
      const amenityIds = amenities.map(amenity => mapAmenityToId(amenity));
  
      // Create FormData for file uploads
      const formData = new FormData();
  
      // Add account ID
      if (!user || !user.userId) {
        toast({
          title: "User Not Logged In",
          description: "Please log in to post your property.",
          variant: "destructive",
        });
        return;
      }
  
      formData.append('AccountId', user.userId);
      formData.append('SuperCategoryId', categoryId.toString()); 
      formData.append('PropertyTypeId', propertyTypeId.toString());
      formData.append('Title', title);
      formData.append('Description', description);
      
      // Fix for price format - ensure it's a valid number and has 2 decimal places
      // Make sure the price is not empty and is converted to a float
      const parsedPrice = parseFloat(price || "0");
      // Format with exactly 2 decimal places
      const formattedPrice = parsedPrice.toFixed(2);
      // Append as string to formData
      formData.append('Price', formattedPrice);
      
      // For debugging - log the price being sent
      console.log("Sending price to API:", formattedPrice, "Type:", typeof formattedPrice);
      
      formData.append('Area', area);
      if (bedrooms) formData.append('Bedroom', bedrooms);
      if (bathrooms) formData.append('Bathroom', bathrooms);
      if (balcony) formData.append('Balcony', balcony); 
      formData.append('Address', address);
      formData.append('CityId', cityId.toString());
      formData.append('StateId', stateId.toString());
      formData.append('UserTypeId', userTypeId.toString());
  
      // Add amenities
      amenityIds.forEach(id => {
        formData.append('AmenityIds', id.toString());
      });
  
      // Upload images with fixed format to match API expectations
      images.forEach((image, index) => {
        formData.append(`Images[${index}].File`, image);
        formData.append(`Images[${index}].IsMain`, index === mainImageIndex ? "true" : "false");
      });
      
      // For debugging - log the entire FormData
      // This will help verify that the price is being included correctly
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }
  
      // API call
      const response = await fetch('https://homeyatraapi.azurewebsites.net/api/Account/AddProperty', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const result = await response.json();

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
        description: "There was an error posting your property. Please try again.",
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
        <p className="text-blue-800 font-medium">Complete the form below to list your property. Fields marked with * are required.</p>
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
                  <Label htmlFor="propertyType" className="text-gray-700 font-medium">
                    Property Type <span className="text-red-500">*</span>
                  </Label>
                  <Select 
                    value={propertyType} 
                    onValueChange={setPropertyType}
                  >
                    <SelectTrigger id="propertyType" className="bg-white border-2 focus:ring-2 focus:ring-blue-100">
                      <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="buy">Buy</SelectItem>
                      <SelectItem value="rent">Rent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-gray-700 font-medium">
                    Category <span className="text-red-500">*</span>
                  </Label>
                  <Select 
                    value={category} 
                    onValueChange={setCategory}
                  >
                    <SelectTrigger id="category" className="bg-white border-2 focus:ring-2 focus:ring-blue-100">
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
                  Property Title <span className="text-red-500">*</span>
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
                <Label htmlFor="description" className="text-gray-700 font-medium">
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
                  <Label htmlFor="price" className="text-gray-700 font-medium flex items-center">
                    <Tag className="h-4 w-4 mr-1 text-blue-600" />
                    Price <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                    <Input 
                      id="price" 
                      placeholder="Enter amount"
                      value={price}
                      onChange={handlePriceChange}
                      className={`bg-white border-2 pl-8 focus:ring-2 focus:ring-blue-100 ${!priceValidation ? 'border-red-500' : ''}`}
                      type="number" // Change to number type for better mobile input
                      step="0.01" // Allow decimal input with 2 decimal places
                      min="0" // Prevent negative values
                    />
                  </div>
                  {!priceValidation && (
                    <p className="text-red-500 text-xs mt-1">Please enter a valid price</p>
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
                      className={`bg-white border-2 focus:ring-2 focus:ring-blue-100 ${!areaValidation ? 'border-red-500' : ''}`}
                      type="number" // Change to number type
                      min="0" // Prevent negative values
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">sq.ft</span>
                  </div>
                  {!areaValidation && (
                    <p className="text-red-500 text-xs mt-1">Please enter a valid area</p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="bedrooms" className="text-gray-700 font-medium">Bedrooms</Label>
                  <Select 
                    value={bedrooms} 
                    onValueChange={setBedrooms}
                  >
                    <SelectTrigger id="bedrooms" className="bg-white border-2 focus:ring-2 focus:ring-blue-100">
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
                  <Label htmlFor="bathrooms" className="text-gray-700 font-medium">Bathrooms</Label>
                  <Select 
                    value={bathrooms} 
                    onValueChange={setBathrooms}
                  >
                    <SelectTrigger id="bathrooms" className="bg-white border-2 focus:ring-2 focus:ring-blue-100">
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
                  <Label htmlFor="balcony" className="text-gray-700 font-medium">Balcony</Label>
                  <Select 
                    value={balcony} 
                    onValueChange={setBalcony}
                  >
                    <SelectTrigger id="balcony" className="bg-white border-2 focus:ring-2 focus:ring-blue-100">
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
                  <Select 
                    value={city} 
                    onValueChange={setCity}
                  >
                    <SelectTrigger id="city" className="bg-white border-2 focus:ring-2 focus:ring-blue-100">
                      <SelectValue placeholder="Select City" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCities.map((cityOption) => (
                        <SelectItem key={cityOption.id} value={cityOption.id.toString()}>
                          {cityOption.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
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
                      amenities.includes(amenity) 
                        ? 'bg-blue-100 border-2 border-blue-300' 
                        : 'bg-gray-50 border-2 border-gray-200 hover:border-blue-200'
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
                Specify your relationship with the property
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-2 max-w-md">
                <Label htmlFor="ownerType" className="text-gray-700 font-medium">
                  I am a <span className="text-red-500">*</span>
                </Label>
                <Select 
                  value={ownerType} 
                  onValueChange={setOwnerType}
                >
                  <SelectTrigger id="ownerType" className="bg-white border-2 focus:ring-2 focus:ring-blue-100">
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
                  <div key={index} className={`relative rounded-lg overflow-hidden border-2 ${mainImageIndex === index ? 'border-blue-500 shadow-md' : 'border-gray-200'}`}>
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
                      <label htmlFor={`mainImage-${index}`} className="text-xs text-gray-700 font-medium">
                        {mainImageIndex === index ? "Main Image" : "Set as main"}
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
                    <span className="text-sm text-blue-600 font-medium">Upload Image</span>
                    <span className="text-xs text-gray-500 mt-1">{imageURLs.length}/6 images</span>
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

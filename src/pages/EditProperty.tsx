import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, Save, Loader2, Pencil, Building, Bed, Bath, 
  MapPin, AreaChart, CheckCircle, ArrowRight, CircleCheck
} from "lucide-react";
import { Parking, Gym, Garden, Pool, Security, Elevator } from "@/components/icons/CustomIcons";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";

const EditProperty = () => {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    superCategory: "",
    propertyType: "",
    bedroom: "",
    bathroom: "",
    balcony: "",
    area: "",
    furnished: "no",
    amenities: {
      parking: false,
      gym: false,
      garden: false, 
      pool: false,
      security: false,
      elevator: false
    },
    propertyId: "",
    images: []
  });

  const BASE_URL = "https://homeyatraapi.azurewebsites.net";

  // Track which field is being edited
  const [activeField, setActiveField] = useState(null);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

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
        
        const response = await fetch(`${BASE_URL}/api/Account/GetPropertyDetails?propertyId=${propertyId}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch property details: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Property details response:", data);
        
        if (data.statusCode === 200 && data.propertyDetail) {
          const property = data.propertyDetail;
          
          // Parse amenities from amenityDetails array
          let parsedAmenities = {
            parking: false,
            gym: false,
            garden: false,
            pool: false,
            security: false,
            elevator: false
          };
          
          try {
            if (property.amenityDetails && Array.isArray(property.amenityDetails)) {
              property.amenityDetails.forEach(amenity => {
                const amenityName = amenity.amenity.toLowerCase();
                if (amenityName.includes('parking')) parsedAmenities.parking = true;
                if (amenityName.includes('gym')) parsedAmenities.gym = true;
                if (amenityName.includes('garden')) parsedAmenities.garden = true;
                if (amenityName.includes('pool')) parsedAmenities.pool = true;
                if (amenityName.includes('security')) parsedAmenities.security = true;
                if (amenityName.includes('elevator')) parsedAmenities.elevator = true;
              });
            }
          } catch (e) {
            console.error("Error parsing amenities:", e);
          }
          
          // Find main image
          let mainImage = "";
          if (property.imageDetails && Array.isArray(property.imageDetails)) {
            const mainImageObj = property.imageDetails.find(img => img.isMainImage);
            mainImage = mainImageObj ? mainImageObj.imageUrl : (property.imageDetails[0]?.imageUrl || "");
          }
          
          // Map API response to form data
          setFormData({
            title: property.title || "",
            description: property.description || "",
            price: property.price?.toString() || "",
            address: property.address || "",
            city: property.city || "",
            state: property.state || "",
            zipCode: property.zipCode || "",
            superCategory: property.superCategory?.toLowerCase() || "rent",
            propertyType: property.propertyType || "",
            bedroom: property.bedroom?.toString() || "",
            bathroom: property.bathroom?.toString() || "",
            balcony: property.balcony?.toString() || "",
            area: property.area?.toString() || "",
            furnished: property.furnished === true ? "yes" : "no",
            amenities: parsedAmenities,
            propertyId: property.propertyId || propertyId,
            images: property.imageDetails || []
          });
        } else {
          throw new Error("Property data not found or invalid");
        }
      } catch (error) {
        console.error("Error fetching property details:", error);
        toast({
          title: "Error",
          description: "Failed to load property details. Please try again later.",
          variant: "destructive",
        });
        
        // Set mock data for testing when API fails
        setFormData({
          title: "Sample Property Title",
          description: "This is a sample property description for testing when the API is unavailable.",
          price: "25000",
          address: "123 Test Street",
          city: "Mumbai",
          state: "Maharashtra",
          zipCode: "400001",
          superCategory: "rent",
          propertyType: "Apartment",
          bedroom: "3",
          bathroom: "2",
          balcony: "1",
          area: "1500",
          furnished: "yes",
          amenities: {
            parking: true,
            gym: false,
            garden: true,
            pool: false,
            security: true,
            elevator: false
          },
          propertyId: propertyId || "",
          images: [{
            imageId: "sample-id",
            imageUrl: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&q=80",
            isMainImage: true
          }]
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPropertyDetails();
  }, [propertyId, toast, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user?.userId) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to update a property.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setSaving(true);
      
      // Format amenities for API
      const selectedAmenities = Object.entries(formData.amenities)
        .filter(([_, selected]) => selected)
        .map(([name]) => name)
        .join(", ");
      
      // Create payload for API
      const payload = {
        propertyId: formData.propertyId,
        userId: user.userId,
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        superCategory: formData.superCategory.toUpperCase(),
        bedroom: parseInt(formData.bedroom),
        bathroom: parseInt(formData.bathroom),
        balcony: parseInt(formData.balcony || "0"),
        area: parseFloat(formData.area),
        furnished: formData.furnished === "yes",
        amenities: selectedAmenities
      };
      
      console.log("Updating property with payload:", payload);
      
      // Send update request to API
      const response = await fetch(`${BASE_URL}/api/Account/EditProperty`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update property: ${response.status}`);
      }
      
      const result = await response.json();
      console.log("Update API response:", result);
      
      if (result.statusCode === 200) {
        toast({
          title: "Success!",
          description: "Property updated successfully!",
        });
        
        // Navigate back to dashboard
        navigate(`/dashboard`);
      } else {
        throw new Error(result.message || "Failed to update property");
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
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="mb-4">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <h3 className="text-xl font-medium text-gray-700">Loading property details...</h3>
      </div>
    );
  }

  // Find main image URL
  const mainImageUrl = formData.images.find(img => img.isMainImage)?.imageUrl || 
                     (formData.images[0]?.imageUrl || "");
  
  // Get additional images (excluding main)
  const additionalImages = formData.images
    .filter(img => !img.isMainImage)
    .slice(0, 3); // Show up to 3 additional images

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="max-w-5xl mx-auto px-4 py-6 md:py-8"
    >
      {/* Header with fancy gradient */}
      <motion.div 
        variants={itemVariants}
        className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg p-4 mb-6 shadow-lg"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div className="flex items-center mb-3 md:mb-0">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/dashboard')}
              className="mr-2 bg-white/10 hover:bg-white/20 text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              <span className="hidden md:inline">Dashboard</span>
            </Button>
            <h1 className="text-2xl md:text-3xl font-bold text-white">Edit Property</h1>
          </div>
          
          <div className="flex space-x-2">
            <Button 
              type="button" 
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="bg-white/10 hover:bg-white/20 text-white"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              className="bg-white text-blue-700 hover:bg-blue-50"
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Main details */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="shadow-md border border-gray-100 overflow-hidden">
            <CardHeader className="bg-gray-50 border-b">
              <CardTitle className="flex items-center text-xl text-gray-800">
                <Building className="h-5 w-5 mr-2 text-blue-600" />
                Main Information
              </CardTitle>
            </CardHeader>
            
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <div className="relative group">
                    <Label htmlFor="title" className="text-sm font-medium flex items-center mb-1">
                      Property Title
                      <button 
                        type="button"
                        onClick={() => setActiveField(activeField === 'title' ? null : 'title')}
                        className="ml-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
                      >
                        <Pencil className="h-3 w-3 text-blue-500" />
                      </button>
                    </Label>
                    
                    {activeField === 'title' ? (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative"
                      >
                        <Input
                          id="title"
                          name="title"
                          value={formData.title}
                          onChange={handleInputChange}
                          required
                          className="border-blue-300 focus:border-blue-500 shadow-sm"
                          autoFocus
                        />
                        <Button 
                          type="button" 
                          size="sm" 
                          className="absolute right-0 top-0 h-full px-3 bg-blue-500 hover:bg-blue-600"
                          onClick={() => setActiveField(null)}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-md border border-gray-200 hover:border-blue-300 transition-colors">
                        {formData.title}
                      </div>
                    )}
                  </div>

                  <div className="relative group">
                    <Label htmlFor="price" className="text-sm font-medium flex items-center mb-1">
                      Price (₹)
                      <button 
                        type="button"
                        onClick={() => setActiveField(activeField === 'price' ? null : 'price')}
                        className="ml-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
                      >
                        <Pencil className="h-3 w-3 text-blue-500" />
                      </button>
                    </Label>
                    
                    {activeField === 'price' ? (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative"
                      >
                        <Input
                          id="price"
                          name="price"
                          type="number"
                          value={formData.price}
                          onChange={handleInputChange}
                          required
                          className="border-blue-300 focus:border-blue-500 shadow-sm"
                          autoFocus
                        />
                        <Button 
                          type="button" 
                          size="sm" 
                          className="absolute right-0 top-0 h-full px-3 bg-blue-500 hover:bg-blue-600"
                          onClick={() => setActiveField(null)}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-md border border-gray-200 hover:border-blue-300 transition-colors">
                        ₹{parseInt(formData.price).toLocaleString('en-IN')}
                      </div>
                    )}
                  </div>

                  <div className="relative group">
                    <Label htmlFor="description" className="text-sm font-medium flex items-center mb-1">
                      Description
                      <button 
                        type="button"
                        onClick={() => setActiveField(activeField === 'description' ? null : 'description')}
                        className="ml-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
                      >
                        <Pencil className="h-3 w-3 text-blue-500" />
                      </button>
                    </Label>
                    
                    {activeField === 'description' ? (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <Textarea
                          id="description"
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          rows={5}
                          required
                          className="border-blue-300 focus:border-blue-500 shadow-sm"
                          autoFocus
                        />
                        <Button 
                          type="button" 
                          size="sm" 
                          className="mt-2 px-3 bg-blue-500 hover:bg-blue-600"
                          onClick={() => setActiveField(null)}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Apply
                        </Button>
                      </motion.div>
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-md border border-gray-200 hover:border-blue-300 transition-colors min-h-[80px] max-h-[200px] overflow-auto">
                        {formData.description}
                      </div>
                    )}
                  </div>
                </div>

                {/* Property Type - Read Only */}
                <div className="mt-6">
                  <h3 className="font-medium text-base mb-3 text-gray-700 flex items-center">
                    <Building className="h-5 w-5 mr-2 text-blue-600" />
                    Property Type
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Listing Type</Label>
                      <RadioGroup 
                        name="superCategory"
                        value={formData.superCategory}
                        onValueChange={(value) => handleSelectChange("superCategory", value)}
                        className="flex flex-wrap gap-3"
                      >
                        <div className="flex items-center px-3 py-2 bg-white border rounded-md shadow-sm">
                          <RadioGroupItem value="rent" id="rent" />
                          <Label htmlFor="rent" className="ml-2">For Rent</Label>
                        </div>
                        <div className="flex items-center px-3 py-2 bg-white border rounded-md shadow-sm">
                          <RadioGroupItem value="buy" id="buy" />
                          <Label htmlFor="buy" className="ml-2">For Sale</Label>
                        </div>
                        <div className="flex items-center px-3 py-2 bg-white border rounded-md shadow-sm">
                          <RadioGroupItem value="sell" id="sell" />
                          <Label htmlFor="sell" className="ml-2">Selling</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="propertyType" className="text-sm font-medium">Property Type</Label>
                      <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
                        {formData.propertyType || "Not specified"}
                      </div>
                      <p className="text-xs text-gray-500 italic">Property type cannot be changed</p>
                    </div>
                  </div>
                </div>
                
                {/* Location */}
                <div className="mt-6">
                  <h3 className="font-medium text-base mb-3 text-gray-700 flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                    Location
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="relative group">
                      <Label htmlFor="address" className="text-sm font-medium flex items-center mb-1">
                        Address
                        <button 
                          type="button"
                          onClick={() => setActiveField(activeField === 'address' ? null : 'address')}
                          className="ml-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
                        >
                          <Pencil className="h-3 w-3 text-blue-500" />
                        </button>
                      </Label>
                      
                      {activeField === 'address' ? (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          <Input
                            id="address"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            required
                            className="border-blue-300 focus:border-blue-500 shadow-sm"
                            autoFocus
                          />
                          <Button 
                            type="button" 
                            size="sm" 
                            className="mt-2 px-3 bg-blue-500 hover:bg-blue-600"
                            onClick={() => setActiveField(null)}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Apply
                          </Button>
                        </motion.div>
                      ) : (
                        <div className="p-3 bg-gray-50 rounded-md border border-gray-200 hover:border-blue-300 transition-colors">
                          {formData.address}
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="relative group">
                        <Label htmlFor="city" className="text-sm font-medium flex items-center mb-1">
                          City
                          <button 
                            type="button"
                            onClick={() => setActiveField(activeField === 'city' ? null : 'city')}
                            className="ml-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
                          >
                            <Pencil className="h-3 w-3 text-blue-500" />
                          </button>
                        </Label>
                        
                        {activeField === 'city' ? (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="relative"
                          >
                            <Input
                              id="city"
                              name="city"
                              value={formData.city}
                              onChange={handleInputChange}
                              required
                              className="border-blue-300 focus:border-blue-500 shadow-sm"
                              autoFocus
                            />
                            <Button 
                              type="button" 
                              size="sm" 
                              className="absolute right-0 top-0 h-full px-3 bg-blue-500 hover:bg-blue-600"
                              onClick={() => setActiveField(null)}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          </motion.div>
                        ) : (
                          <div className="p-3 bg-gray-50 rounded-md border border-gray-200 hover:border-blue-300 transition-colors">
                            {formData.city}
                          </div>
                        )}
                      </div>
                      
                      <div className="relative group">
                        <Label htmlFor="state" className="text-sm font-medium flex items-center mb-1">
                          State
                          <button 
                            type="button"
                            onClick={() => setActiveField(activeField === 'state' ? null : 'state')}
                            className="ml-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
                          >
                            <Pencil className="h-3 w-3 text-blue-500" />
                          </button>
                        </Label>
                        
                        {activeField === 'state' ? (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="relative"
                          >
                            <Input
                              id="state"
                              name="state"
                              value={formData.state}
                              onChange={handleInputChange}
                              required
                              className="border-blue-300 focus:border-blue-500 shadow-sm"
                              autoFocus
                            />
                            <Button 
                              type="button" 
                              size="sm" 
                              className="absolute right-0 top-0 h-full px-3 bg-blue-500 hover:bg-blue-600"
                              onClick={() => setActiveField(null)}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          </motion.div>
                        ) : (
                          <div className="p-3 bg-gray-50 rounded-md border border-gray-200 hover:border-blue-300 transition-colors">
                            {formData.state}
                          </div>
                        )}
                      </div>
                      
                      {/* Zipcode - Read Only */}
                      <div>
                        <Label htmlFor="zipCode" className="text-sm font-medium">Zip Code</Label>
                        <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
                          {formData.zipCode}
                        </div>
                        <p className="text-xs text-gray-500 italic mt-1">ZIP code cannot be changed</p>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Right column - Features, Amenities, Images */}
        <motion.div variants={itemVariants} className="space-y-6">
          {/* Features */}
          <Card className="shadow-md border border-gray-100 overflow-hidden">
            <CardHeader className="bg-gray-50 border-b">
              <CardTitle className="flex items-center text-lg text-gray-800">
                <AreaChart className="h-5 w-5 mr-2 text-blue-600" />
                Features
              </CardTitle>
            </CardHeader>
            
            <CardContent className="p-6">
              <div className="space-y-5">
                {/* Bedroom */}
                <div className="relative">
                  <Label htmlFor="bedroom" className="text-sm font-medium flex items-center mb-1">
                    Bedrooms
                    <button 
                      type="button"
                      onClick={() => setActiveField(activeField === 'bedroom' ? null : 'bedroom')}
                      className="ml-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <Pencil className="h-3 w-3 text-blue-500" />
                    </button>
                  </Label>
                  
                  {activeField === 'bedroom' ? (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Select 
                        name="bedroom"
                        value={formData.bedroom}
                        onValueChange={(value) => handleSelectChange("bedroom", value)}
                      >
                        <SelectTrigger className="border-blue-300 focus:border-blue-500">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1</SelectItem>
                          <SelectItem value="2">2</SelectItem>
                          <SelectItem value="3">3</SelectItem>
                          <SelectItem value="4">4</SelectItem>
                          <SelectItem value="5">5+</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button 
                        type="button" 
                        size="sm" 
                        className="mt-2 px-3 bg-blue-500 hover:bg-blue-600"
                        onClick={() => setActiveField(null)}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Done
                      </Button>
                    </motion.div>
                  ) : (
                    <div className="flex items-center p-3 bg-gray-50 rounded-md border border-gray-200">
                      <Bed className="h-5 w-5 mr-2 text-blue-500" />
                      <span>{formData.bedroom} {parseInt(formData.bedroom) === 1 ? 'Bedroom' : 'Bedrooms'}</span>
                    </div>
                  )}
                </div>
                
                {/* Bathroom */}
                <div className="relative">
                  <Label htmlFor="bathroom" className="text-sm font-medium flex items-center mb-1">
                    Bathrooms
                    <button 
                      type="button"
                      onClick={() => setActiveField(activeField === 'bathroom' ? null : 'bathroom')}
                      className="ml-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <Pencil className="h-3 w-3 text-blue-500" />
                    </button>
                  </Label>
                  
                  {activeField === 'bathroom' ? (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Select 
                        name="bathroom"
                        value={formData.bathroom}
                        onValueChange={(value) => handleSelectChange("bathroom", value)}
                      >
                        <SelectTrigger className="border-blue-300 focus:border-blue-500">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1</SelectItem>
                          <SelectItem value="2">2</SelectItem>
                          <SelectItem value="3">3</SelectItem>
                          <SelectItem value="4">4</SelectItem>
                          <SelectItem value="5">5+</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button 
                        type="button" 
                        size="sm" 
                        className="mt-2 px-3 bg-blue-500 hover:bg-blue-600"
                        onClick={() => setActiveField(null)}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Done
                      </Button>
                    </motion.div>
                  ) : (
                    <div className="flex items-center p-3 bg-gray-50 rounded-md border border-gray-200">
                      <Bath className="h-5 w-5 mr-2 text-blue-500" />
                      <span>{formData.bathroom} {parseInt(formData.bathroom) === 1 ? 'Bathroom' : 'Bathrooms'}</span>
                    </div>
                  )}
                </div>
                
                {/* Balcony */}
                <div className="relative">
                  <Label htmlFor="balcony" className="text-sm font-medium flex items-center mb-1">
                    Balconies
                    <button 
                      type="button"
                      onClick={() => setActiveField(activeField === 'balcony' ? null : 'balcony')}
                      className="ml-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <Pencil className="h-3 w-3 text-blue-500" />
                    </button>
                  </Label>
                  
                  {activeField === 'balcony' ? (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Select 
                        name="balcony"
                        value={formData.balcony}
                        onValueChange={(value) => handleSelectChange("balcony", value)}
                      >
                        <SelectTrigger className="border-blue-300 focus:border-blue-500">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">0</SelectItem>
                          <SelectItem value="1">1</SelectItem>
                          <SelectItem value="2">2</SelectItem>
                          <SelectItem value="3">3</SelectItem>
                          <SelectItem value="4">4+</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button 
                        type="button" 
                        size="sm" 
                        className="mt-2 px-3 bg-blue-500 hover:bg-blue-600"
                        onClick={() => setActiveField(null)}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Done
                      </Button>
                    </motion.div>
                  ) : (
                    <div className="flex items-center p-3 bg-gray-50 rounded-md border border-gray-200">
                      <span>{formData.balcony} {parseInt(formData.balcony) === 1 ? 'Balcony' : 'Balconies'}</span>
                    </div>
                  )}
                </div>
                
                {/* Area */}
                <div className="relative">
                  <Label htmlFor="area" className="text-sm font-medium flex items-center mb-1">
                    Area (sq.ft.)
                    <button 
                      type="button"
                      onClick={() => setActiveField(activeField === 'area' ? null : 'area')}
                      className="ml-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <Pencil className="h-3 w-3 text-blue-500" />
                    </button>
                  </Label>
                  
                  {activeField === 'area' ? (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="relative"
                    >
                      <Input
                        id="area"
                        name="area"
                        type="number"
                        value={formData.area}
                        onChange={handleInputChange}
                        required
                        className="border-blue-300 focus:border-blue-500 shadow-sm"
                        autoFocus
                      />
                      <Button 
                        type="button" 
                        size="sm" 
                        className="absolute right-0 top-0 h-full px-3 bg-blue-500 hover:bg-blue-600"
                        onClick={() => setActiveField(null)}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  ) : (
                    <div className="flex items-center p-3 bg-gray-50 rounded-md border border-gray-200">
                      <AreaChart className="h-5 w-5 mr-2 text-blue-500" />
                      <span>{parseInt(formData.area).toLocaleString()} sq.ft</span>
                    </div>
                  )}
                </div>
                
                {/* Furnished - Read Only */}
                <div>
                  <Label className="text-sm font-medium">Furnished Status</Label>
                  <div className="flex items-center p-3 bg-gray-50 rounded-md border border-gray-200">
                    {formData.furnished === "yes" ? (
                      <>
                        <CircleCheck className="h-5 w-5 mr-2 text-green-500" />
                        <span>Furnished</span>
                      </>
                    ) : (
                      <span>Not Furnished</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 italic mt-1">Furnishing status cannot be changed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Amenities - Read Only */}
          <Card className="shadow-md border border-gray-100 overflow-hidden">
            <CardHeader className="bg-gray-50 border-b">
              <CardTitle className="flex items-center text-lg text-gray-800">
                <CheckCircle className="h-5 w-5 mr-2 text-blue-600" />
                Amenities
              </CardTitle>
            </CardHeader>
            
            <CardContent className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className={`flex items-center p-3 rounded-md ${formData.amenities.parking ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-gray-50 text-gray-500 border border-gray-200'}`}>
                  <Parking className={`h-5 w-5 mr-2 ${formData.amenities.parking ? 'text-blue-500' : 'text-gray-400'}`} />
                  <span>Parking</span>
                </div>
                
                <div className={`flex items-center p-3 rounded-md ${formData.amenities.gym ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-gray-50 text-gray-500 border border-gray-200'}`}>
                  <Gym className={`h-5 w-5 mr-2 ${formData.amenities.gym ? 'text-blue-500' : 'text-gray-400'}`} />
                  <span>Gym</span>
                </div>
                
                <div className={`flex items-center p-3 rounded-md ${formData.amenities.garden ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-gray-50 text-gray-500 border border-gray-200'}`}>
                  <Garden className={`h-5 w-5 mr-2 ${formData.amenities.garden ? 'text-blue-500' : 'text-gray-400'}`} />
                  <span>Garden</span>
                </div>
                
                <div className={`flex items-center p-3 rounded-md ${formData.amenities.pool ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-gray-50 text-gray-500 border border-gray-200'}`}>
                  <Pool className={`h-5 w-5 mr-2 ${formData.amenities.pool ? 'text-blue-500' : 'text-gray-400'}`} />
                  <span>Swimming Pool</span>
                </div>
                
                <div className={`flex items-center p-3 rounded-md ${formData.amenities.security ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-gray-50 text-gray-500 border border-gray-200'}`}>
                  <Security className={`h-5 w-5 mr-2 ${formData.amenities.security ? 'text-blue-500' : 'text-gray-400'}`} />
                  <span>24x7 Security</span>
                </div>
                
                <div className={`flex items-center p-3 rounded-md ${formData.amenities.elevator ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-gray-50 text-gray-500 border border-gray-200'}`}>
                  <Elevator className={`h-5 w-5 mr-2 ${formData.amenities.elevator ? 'text-blue-500' : 'text-gray-400'}`} />
                  <span>Elevator</span>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md flex items-start">
                <span className="text-amber-600 text-sm">To update amenities, please visit the property details page</span>
              </div>
            </CardContent>
          </Card>
          
          {/* Property Images - Read Only */}
          {mainImageUrl && (
            <Card className="shadow-md border border-gray-100 overflow-hidden">
              <CardHeader className="bg-gray-50 border-b">
                <CardTitle className="flex items-center text-lg text-gray-800">
                  Property Images
                </CardTitle>
              </CardHeader>
              
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Main Image */}
                  <div className="overflow-hidden rounded-md border border-gray-200">
                    <div className="relative">
                      <img 
                        src={mainImageUrl} 
                        alt={formData.title} 
                        className="w-full aspect-video object-cover"
                      />
                      <div className="absolute top-3 left-3 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                        Main Image
                      </div>
                    </div>
                  </div>
                  
                  {/* Additional Images */}
                  {additionalImages.length > 0 && (
                    <div className="grid grid-cols-3 gap-2">
                      {additionalImages.map((img, index) => (
                        <div key={index} className="overflow-hidden rounded-md border border-gray-200">
                          <img 
                            src={img.imageUrl} 
                            alt={`Property image ${index + 2}`} 
                            className="w-full aspect-square object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-md flex items-start">
                    <span className="text-amber-600 text-sm">
                      Image management is available in the property details section
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Save Changes Button */}
          <motion.div 
            variants={itemVariants}
            className="sticky bottom-4 z-10"
          >
            <Button 
              onClick={handleSubmit}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6"
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-5 w-5" />
                  Save All Changes
                </>
              )}
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default EditProperty;
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuth } from "@/contexts/AuthContext";

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
    bedroom: "",
    bathroom: "",
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
    image: ""
  });

  const BASE_URL = "https://homeyatraapi.azurewebsites.net";

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
        
        // Fetch property details
        const response = await fetch(`${BASE_URL}/api/Property/GetPropertyById?propertyId=${propertyId}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch property details: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Property details response:", data);
        
        if (data.statusCode === 200 && data.propertyDetails) {
          const property = data.propertyDetails;
          
          // Parse amenities from string if available
          let parsedAmenities = {
            parking: false,
            gym: false,
            garden: false,
            pool: false,
            security: false,
            elevator: false
          };
          
          try {
            if (property.amenities && typeof property.amenities === 'string') {
              const amenitiesArray = property.amenities.split(',').map(item => item.trim().toLowerCase());
              if (amenitiesArray.includes('parking')) parsedAmenities.parking = true;
              if (amenitiesArray.includes('gym')) parsedAmenities.gym = true;
              if (amenitiesArray.includes('garden')) parsedAmenities.garden = true;
              if (amenitiesArray.includes('pool')) parsedAmenities.pool = true;
              if (amenitiesArray.includes('security')) parsedAmenities.security = true;
              if (amenitiesArray.includes('elevator')) parsedAmenities.elevator = true;
            }
          } catch (e) {
            console.error("Error parsing amenities:", e);
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
            bedroom: property.bedroom?.toString() || "",
            bathroom: property.bathroom?.toString() || "",
            area: property.area?.toString() || "",
            furnished: property.furnished === true ? "yes" : "no",
            amenities: parsedAmenities,
            propertyId: property.propertyId || propertyId,
            image: property.mainImageDetail?.url || ""
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
          bedroom: "3",
          bathroom: "2",
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
          image: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&q=80"
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

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      amenities: {
        ...prev.amenities,
        [name]: checked
      }
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
        area: parseFloat(formData.area),
        furnished: formData.furnished === "yes",
        amenities: selectedAmenities
      };
      
      console.log("Updating property with payload:", payload);
      
      // Send update request to API
      const response = await fetch(`${BASE_URL}/api/Property/UpdateProperty`, {
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
          title: "Success",
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
        title: "Error",
        description: "Failed to update property. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/dashboard')}
          className="mr-2"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Dashboard
        </Button>
        <h1 className="text-2xl font-bold">Edit Property</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Property Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="font-medium text-lg mb-3">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Property Title</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price (₹)</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <div className="mt-4 space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={5}
                  required
                />
              </div>
            </div>
            
            {/* Property Type */}
            <div>
              <h3 className="font-medium text-lg mb-3">Property Type</h3>
              <div className="space-y-2">
                <Label>Listing Type</Label>
                <RadioGroup 
                  name="superCategory"
                  value={formData.superCategory}
                  onValueChange={(value) => handleSelectChange("superCategory", value)}
                  className="flex space-x-4"
                >
                  <div className="flex items-center">
                    <RadioGroupItem value="rent" id="rent" />
                    <Label htmlFor="rent" className="ml-2">For Rent</Label>
                  </div>
                  <div className="flex items-center">
                    <RadioGroupItem value="buy" id="buy" />
                    <Label htmlFor="buy" className="ml-2">For Sale</Label>
                  </div>
                  <div className="flex items-center">
                    <RadioGroupItem value="sell" id="sell" />
                    <Label htmlFor="sell" className="ml-2">Selling</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
            
            {/* Location */}
            <div>
              <h3 className="font-medium text-lg mb-3">Location</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">Zip Code</Label>
                    <Input
                      id="zipCode"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Features */}
            <div>
              <h3 className="font-medium text-lg mb-3">Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bedroom">Bedrooms</Label>
                  <Select 
                    name="bedroom"
                    value={formData.bedroom}
                    onValueChange={(value) => handleSelectChange("bedroom", value)}
                  >
                    <SelectTrigger>
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
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bathroom">Bathrooms</Label>
                  <Select 
                    name="bathroom"
                    value={formData.bathroom}
                    onValueChange={(value) => handleSelectChange("bathroom", value)}
                  >
                    <SelectTrigger>
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
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="area">Area (sq.ft.)</Label>
                  <Input
                    id="area"
                    name="area"
                    type="number"
                    value={formData.area}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <div className="mt-4 space-y-2">
                <Label>Furnished</Label>
                <RadioGroup 
                  name="furnished"
                  value={formData.furnished}
                  onValueChange={(value) => handleSelectChange("furnished", value)}
                  className="flex space-x-4"
                >
                  <div className="flex items-center">
                    <RadioGroupItem value="yes" id="furnished-yes" />
                    <Label htmlFor="furnished-yes" className="ml-2">Yes</Label>
                  </div>
                  <div className="flex items-center">
                    <RadioGroupItem value="no" id="furnished-no" />
                    <Label htmlFor="furnished-no" className="ml-2">No</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
            
            {/* Amenities */}
            <div>
              <h3 className="font-medium text-lg mb-3">Amenities</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="parking"
                    name="parking"
                    checked={formData.amenities.parking}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <Label htmlFor="parking" className="ml-2">Parking</Label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="gym"
                    name="gym"
                    checked={formData.amenities.gym}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <Label htmlFor="gym" className="ml-2">Gym</Label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="garden"
                    name="garden"
                    checked={formData.amenities.garden}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <Label htmlFor="garden" className="ml-2">Garden</Label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="pool"
                    name="pool"
                    checked={formData.amenities.pool}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <Label htmlFor="pool" className="ml-2">Swimming Pool</Label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="security"
                    name="security"
                    checked={formData.amenities.security}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <Label htmlFor="security" className="ml-2">24x7 Security</Label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="elevator"
                    name="elevator"
                    checked={formData.amenities.elevator}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <Label htmlFor="elevator" className="ml-2">Elevator</Label>
                </div>
              </div>
            </div>
            
            {/* Property Image Preview */}
            {formData.image && (
              <div>
                <h3 className="font-medium text-lg mb-3">Current Image</h3>
                <div className="w-full h-48 overflow-hidden rounded-md border">
                  <img 
                    src={formData.image} 
                    alt={formData.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  To update the image, please use the property image upload section
                </p>
              </div>
            )}
            
            {/* Submit Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => navigate('/dashboard')}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-blue-600 hover:bg-blue-700"
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
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditProperty;
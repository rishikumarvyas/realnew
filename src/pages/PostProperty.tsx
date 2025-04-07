
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
import { Upload, X, Plus } from "lucide-react";

const PostProperty = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
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
  const [area, setArea] = useState("");
  const [ownerType, setOwnerType] = useState("");
  const [amenities, setAmenities] = useState<string[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [imageURLs, setImageURLs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const availableAmenities = [
    "Swimming Pool",
    "Gym",
    "24x7 Security",
    "Power Backup",
    "Parking",
    "WiFi",
    "Air Conditioning",
    "Children's Play Area",
    "Lift",
    "Club House",
  ];

  const handleAmenityToggle = (amenity: string) => {
    if (amenities.includes(amenity)) {
      setAmenities(amenities.filter((item) => item !== amenity));
    } else {
      setAmenities([...amenities, amenity]);
    }
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
      const newImageURLs = newFiles.map(file => URL.createObjectURL(file));
      setImageURLs([...imageURLs, ...newImageURLs]);
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    const newImageURLs = [...imageURLs];
    
    newImages.splice(index, 1);
    newImageURLs.splice(index, 1);
    
    setImages(newImages);
    setImageURLs(newImageURLs);
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
    
    if (images.length === 0) {
      toast({
        title: "Images Required",
        description: "Please upload at least one image of your property.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // Simulate API call to backend
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      toast({
        title: "Property Posted Successfully!",
        description: "Your property has been submitted for review.",
      });
      
      navigate("/dashboard");
    } catch (error) {
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
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Post Your Property</h1>
      
      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          {/* Basic Property Details */}
          <Card>
            <CardHeader>
              <CardTitle>Property Details</CardTitle>
              <CardDescription>
                Enter the basic details about your property
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="propertyType">Property Type*</Label>
                  <Select 
                    value={propertyType} 
                    onValueChange={setPropertyType}
                  >
                    <SelectTrigger id="propertyType">
                      <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="buy">For Sale</SelectItem>
                      <SelectItem value="rent">For Rent</SelectItem>
                      <SelectItem value="sell">Selling</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Category*</Label>
                  <Select 
                    value={category} 
                    onValueChange={setCategory}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="apartment">Apartment</SelectItem>
                      <SelectItem value="villa">Villa</SelectItem>
                      <SelectItem value="house">House</SelectItem>
                      <SelectItem value="plot">Plot</SelectItem>
                      <SelectItem value="commercial">Commercial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="title">Property Title*</Label>
                <Input 
                  id="title" 
                  placeholder="E.g., Modern 3BHK Apartment"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description*</Label>
                <Textarea 
                  id="description" 
                  placeholder="Describe your property..."
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price* (₹)</Label>
                  <Input 
                    id="price" 
                    placeholder="Enter amount"
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="area">Area* (sq.ft)</Label>
                  <Input 
                    id="area" 
                    placeholder="Enter area in sq.ft"
                    type="number"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bedrooms">Bedrooms</Label>
                  <Select 
                    value={bedrooms} 
                    onValueChange={setBedrooms}
                  >
                    <SelectTrigger id="bedrooms">
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
                  <Label htmlFor="bathrooms">Bathrooms</Label>
                  <Select 
                    value={bathrooms} 
                    onValueChange={setBathrooms}
                  >
                    <SelectTrigger id="bathrooms">
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
              </div>
            </CardContent>
          </Card>
          
          {/* Location Details */}
          <Card>
            <CardHeader>
              <CardTitle>Location</CardTitle>
              <CardDescription>
                Enter the location details of your property
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address">Address*</Label>
                <Textarea 
                  id="address" 
                  placeholder="Enter property address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City*</Label>
                  <Input 
                    id="city" 
                    placeholder="Enter city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Amenities */}
          <Card>
            <CardHeader>
              <CardTitle>Amenities</CardTitle>
              <CardDescription>
                Select the amenities available at your property
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {availableAmenities.map((amenity) => (
                  <div key={amenity} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={amenity}
                      checked={amenities.includes(amenity)}
                      onChange={() => handleAmenityToggle(amenity)}
                      className="rounded border-gray-300 text-real-blue focus:ring-real-blue"
                    />
                    <Label htmlFor={amenity} className="cursor-pointer">
                      {amenity}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Owner Details */}
          <Card>
            <CardHeader>
              <CardTitle>Owner Details</CardTitle>
              <CardDescription>
                Specify your relationship with the property
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="ownerType">I am a*</Label>
                <Select 
                  value={ownerType} 
                  onValueChange={setOwnerType}
                >
                  <SelectTrigger id="ownerType">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="owner">Owner</SelectItem>
                    <SelectItem value="broker">Broker</SelectItem>
                    <SelectItem value="dealer">Dealer</SelectItem>
                    <SelectItem value="builder">Builder</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
          
          {/* Upload Images */}
          <Card>
            <CardHeader>
              <CardTitle>Property Images</CardTitle>
              <CardDescription>
                Upload up to 6 high-quality images of your property
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 mb-4">
                {imageURLs.map((url, index) => (
                  <div key={index} className="relative">
                    <img
                      src={url}
                      alt={`Property preview ${index}`}
                      className="h-24 w-full object-cover rounded-md"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6"
                      onClick={() => removeImage(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                
                {imageURLs.length < 6 && (
                  <label className="border-2 border-dashed border-gray-300 rounded-md h-24 flex flex-col items-center justify-center cursor-pointer hover:border-real-blue transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <Plus className="h-6 w-6 text-gray-400" />
                    <span className="text-sm text-gray-500 mt-1">Add Image</span>
                  </label>
                )}
              </div>
              
              <div className="bg-blue-50 p-3 rounded-md">
                <div className="flex gap-2 text-sm text-blue-700">
                  <Upload className="h-4 w-4 mt-0.5" />
                  <div>
                    <p className="font-medium">Image Guidelines:</p>
                    <ul className="list-disc list-inside space-y-1 mt-1">
                      <li>Upload clear, well-lit photos</li>
                      <li>Include all major areas of the property</li>
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

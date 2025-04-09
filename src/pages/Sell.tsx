
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Home, Building, MapPin, DollarSign, Ruler, Upload, CheckCircle2, 
  Circle, ChevronRight, ChevronLeft
} from 'lucide-react';

// Step types
type StepType = {
  id: number;
  title: string;
  description: string;
};

const steps: StepType[] = [
  {
    id: 1,
    title: 'Property Type',
    description: 'Select the type of property you want to list',
  },
  {
    id: 2,
    title: 'Property Details',
    description: 'Provide essential information about your property',
  },
  {
    id: 3,
    title: 'Owner Information',
    description: 'Tell us who owns the property',
  },
  {
    id: 4,
    title: 'Upload Images',
    description: 'Add images to showcase your property',
  },
  {
    id: 5,
    title: 'Amenities',
    description: 'Select amenities available at your property',
  },
  {
    id: 6,
    title: 'Location',
    description: 'Pin the exact location on the map',
  },
  {
    id: 7,
    title: 'Review & Submit',
    description: 'Review your listing and submit',
  },
];

const propertyTypes = [
  { id: 'house', name: 'House', icon: <Home size={24} /> },
  { id: 'apartment', name: 'Apartment', icon: <Building size={24} /> },
  { id: 'condo', name: 'Condo', icon: <Building size={24} /> },
  { id: 'land', name: 'Land', icon: <MapPin size={24} /> },
];

const ownerTypes = [
  { id: 'owner', name: 'Owner' },
  { id: 'broker', name: 'Broker' },
  { id: 'dealer', name: 'Dealer' },
];

const amenities = [
  { id: 'parking', name: 'Parking' },
  { id: 'garden', name: 'Garden' },
  { id: 'pool', name: 'Swimming Pool' },
  { id: 'security', name: 'Security System' },
  { id: 'ac', name: 'Air Conditioning' },
  { id: 'heating', name: 'Heating' },
  { id: 'gym', name: 'Gym' },
  { id: 'elevator', name: 'Elevator' },
];

const Sell = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    propertyType: '',
    title: '',
    description: '',
    price: '',
    size: '',
    bedrooms: '',
    bathrooms: '',
    balconies: '',
    ownerType: '',
    ownerName: '',
    ownerPhone: '',
    ownerEmail: '',
    images: [],
    selectedAmenities: [],
    location: ''
  });
  
  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Handle property type selection
  const handlePropertyTypeSelect = (type: string) => {
    setFormData({
      ...formData,
      propertyType: type
    });
  };
  
  // Handle owner type selection
  const handleOwnerTypeSelect = (type: string) => {
    setFormData({
      ...formData,
      ownerType: type
    });
  };
  
  // Handle amenity toggle
  const handleAmenityToggle = (amenityId: string) => {
    setFormData(prevData => {
      if (prevData.selectedAmenities.includes(amenityId)) {
        return {
          ...prevData,
          selectedAmenities: prevData.selectedAmenities.filter(id => id !== amenityId)
        };
      } else {
        return {
          ...prevData,
          selectedAmenities: [...prevData.selectedAmenities, amenityId]
        };
      }
    });
  };
  
  // Navigate to next step
  const handleNextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };
  
  // Navigate to previous step
  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would send the data to your backend API here
    console.log('Form submitted:', formData);
    
    // Navigate to success page or show success message
    alert('Your property has been submitted for review!');
    navigate('/');
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-gray-50 py-10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold mb-2">List Your Property</h1>
              <p className="text-gray-600">
                Complete the steps below to list your property on PropVerse
              </p>
            </div>
            
            {/* Progress Steps */}
            <div className="hidden md:flex justify-between mb-12">
              {steps.map((step) => (
                <div 
                  key={step.id} 
                  className={`flex flex-col items-center w-1/7 relative ${
                    step.id < currentStep ? 'text-realestate-teal' : 
                    step.id === currentStep ? 'text-realestate-blue' : 'text-gray-400'
                  }`}
                >
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    step.id < currentStep ? 'border-realestate-teal bg-realestate-teal text-white' : 
                    step.id === currentStep ? 'border-realestate-blue bg-white text-realestate-blue' : 
                    'border-gray-300 bg-white text-gray-400'
                  } mb-2`}>
                    {step.id < currentStep ? (
                      <CheckCircle2 size={20} />
                    ) : (
                      <span className="text-sm font-semibold">{step.id}</span>
                    )}
                  </div>
                  
                  <div className="text-xs text-center w-20">{step.title}</div>
                  
                  {/* Connector line */}
                  {step.id < steps.length && (
                    <div className={`absolute top-5 left-[calc(50%+20px)] w-[calc(100%-40px)] h-0.5 ${
                      step.id < currentStep ? 'bg-realestate-teal' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            
            {/* Mobile Step Indicator */}
            <div className="md:hidden mb-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Step {currentStep} of {steps.length}</h3>
                <span className="text-sm text-gray-600">{steps[currentStep - 1].title}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-realestate-blue h-2.5 rounded-full" 
                  style={{ width: `${(currentStep / steps.length) * 100}%` }} 
                />
              </div>
            </div>
            
            {/* Step Content */}
            <Card className="mb-8">
              <CardContent className="p-6">
                <form onSubmit={handleSubmit}>
                  {/* Step 1: Property Type */}
                  {currentStep === 1 && (
                    <div className="space-y-6">
                      <h2 className="text-2xl font-semibold">Select Property Type</h2>
                      <p className="text-gray-600 mb-6">Choose the type of property you want to list</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {propertyTypes.map((type) => (
                          <button
                            type="button"
                            key={type.id}
                            onClick={() => handlePropertyTypeSelect(type.id)}
                            className={`flex flex-col items-center justify-center p-4 border-2 rounded-lg ${
                              formData.propertyType === type.id 
                                ? 'border-realestate-blue bg-blue-50' 
                                : 'border-gray-200 hover:border-gray-300'
                            } transition-colors`}
                          >
                            <div className={`mb-2 ${
                              formData.propertyType === type.id 
                                ? 'text-realestate-blue' 
                                : 'text-gray-600'
                            }`}>
                              {type.icon}
                            </div>
                            <span className="font-medium">{type.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Step 2: Property Details */}
                  {currentStep === 2 && (
                    <div className="space-y-6">
                      <h2 className="text-2xl font-semibold">Property Details</h2>
                      <p className="text-gray-600 mb-6">Provide essential information about your property</p>
                      
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                            Property Title
                          </label>
                          <Input 
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="e.g. Modern 3-Bedroom Villa with Garden"
                            required
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                          </label>
                          <Textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Describe your property, highlighting its best features..."
                            rows={4}
                            required
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                              Price ($)
                            </label>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-3 text-gray-400" size={16} />
                              <Input 
                                id="price"
                                name="price"
                                type="number"
                                value={formData.price}
                                onChange={handleChange}
                                placeholder="e.g. 350000"
                                className="pl-10"
                                required
                              />
                            </div>
                          </div>
                          
                          <div>
                            <label htmlFor="size" className="block text-sm font-medium text-gray-700 mb-1">
                              Size (sq ft)
                            </label>
                            <div className="relative">
                              <Ruler className="absolute left-3 top-3 text-gray-400" size={16} />
                              <Input 
                                id="size"
                                name="size"
                                type="number"
                                value={formData.size}
                                onChange={handleChange}
                                placeholder="e.g. 1200"
                                className="pl-10"
                                required
                              />
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700 mb-1">
                              Bedrooms
                            </label>
                            <Input 
                              id="bedrooms"
                              name="bedrooms"
                              type="number"
                              value={formData.bedrooms}
                              onChange={handleChange}
                              placeholder="e.g. 3"
                              required
                            />
                          </div>
                          
                          <div>
                            <label htmlFor="bathrooms" className="block text-sm font-medium text-gray-700 mb-1">
                              Bathrooms
                            </label>
                            <Input 
                              id="bathrooms"
                              name="bathrooms"
                              type="number"
                              value={formData.bathrooms}
                              onChange={handleChange}
                              placeholder="e.g. 2"
                              required
                            />
                          </div>
                          
                          <div>
                            <label htmlFor="balconies" className="block text-sm font-medium text-gray-700 mb-1">
                              Balconies
                            </label>
                            <Input 
                              id="balconies"
                              name="balconies"
                              type="number"
                              value={formData.balconies}
                              onChange={handleChange}
                              placeholder="e.g. 1"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Step 3: Owner Information */}
                  {currentStep === 3 && (
                    <div className="space-y-6">
                      <h2 className="text-2xl font-semibold">Owner Information</h2>
                      <p className="text-gray-600 mb-6">Tell us who owns the property</p>
                      
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Owner Type
                        </label>
                        <div className="grid grid-cols-3 gap-4">
                          {ownerTypes.map((type) => (
                            <button
                              type="button"
                              key={type.id}
                              onClick={() => handleOwnerTypeSelect(type.id)}
                              className={`py-3 px-4 border-2 rounded-lg text-center ${
                                formData.ownerType === type.id 
                                  ? 'border-realestate-blue bg-blue-50 text-realestate-blue' 
                                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
                              } transition-colors`}
                            >
                              {type.name}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="ownerName" className="block text-sm font-medium text-gray-700 mb-1">
                            Full Name
                          </label>
                          <Input 
                            id="ownerName"
                            name="ownerName"
                            value={formData.ownerName}
                            onChange={handleChange}
                            placeholder="Enter your full name"
                            required
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="ownerPhone" className="block text-sm font-medium text-gray-700 mb-1">
                            Phone Number
                          </label>
                          <Input 
                            id="ownerPhone"
                            name="ownerPhone"
                            type="tel"
                            value={formData.ownerPhone}
                            onChange={handleChange}
                            placeholder="Enter your phone number"
                            required
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="ownerEmail" className="block text-sm font-medium text-gray-700 mb-1">
                            Email Address
                          </label>
                          <Input 
                            id="ownerEmail"
                            name="ownerEmail"
                            type="email"
                            value={formData.ownerEmail}
                            onChange={handleChange}
                            placeholder="Enter your email address"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Step 4: Upload Images */}
                  {currentStep === 4 && (
                    <div className="space-y-6">
                      <h2 className="text-2xl font-semibold">Upload Images</h2>
                      <p className="text-gray-600 mb-6">Add images to showcase your property (Max 10 images)</p>
                      
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <Upload className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600 mb-2">Drag and drop images here, or click to select files</p>
                        <p className="text-xs text-gray-500 mb-4">Supported formats: JPG, PNG, GIF (Max 5MB each)</p>
                        <Button type="button" variant="outline">
                          Select Files
                        </Button>
                      </div>
                      
                      {/* Image preview would go here in a real implementation */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                        <div className="relative bg-gray-100 rounded-lg h-24 flex items-center justify-center">
                          <p className="text-gray-400 text-xs">Preview 1</p>
                        </div>
                        <div className="relative bg-gray-100 rounded-lg h-24 flex items-center justify-center">
                          <p className="text-gray-400 text-xs">Preview 2</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Step 5: Amenities */}
                  {currentStep === 5 && (
                    <div className="space-y-6">
                      <h2 className="text-2xl font-semibold">Amenities</h2>
                      <p className="text-gray-600 mb-6">Select amenities available at your property</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {amenities.map((amenity) => (
                          <div 
                            key={amenity.id}
                            onClick={() => handleAmenityToggle(amenity.id)}
                            className={`flex items-center p-3 border rounded-lg cursor-pointer ${
                              formData.selectedAmenities.includes(amenity.id)
                                ? 'border-realestate-blue bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            {formData.selectedAmenities.includes(amenity.id) ? (
                              <CheckCircle2 className="h-5 w-5 text-realestate-blue mr-2" />
                            ) : (
                              <Circle className="h-5 w-5 text-gray-400 mr-2" />
                            )}
                            <span>{amenity.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Step 6: Location */}
                  {currentStep === 6 && (
                    <div className="space-y-6">
                      <h2 className="text-2xl font-semibold">Location</h2>
                      <p className="text-gray-600 mb-6">Pin the exact location of your property on the map</p>
                      
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                            Address
                          </label>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-3 text-gray-400" size={16} />
                            <Input 
                              id="location"
                              name="location"
                              value={formData.location}
                              onChange={handleChange}
                              placeholder="Enter full address"
                              className="pl-10"
                              required
                            />
                          </div>
                        </div>
                        
                        <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
                          <p className="text-gray-500">Map will be displayed here</p>
                        </div>
                        
                        <p className="text-sm text-gray-500">
                          Drag the pin to mark the exact location of your property
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* Step 7: Review & Submit */}
                  {currentStep === 7 && (
                    <div className="space-y-6">
                      <h2 className="text-2xl font-semibold">Review & Submit</h2>
                      <p className="text-gray-600 mb-6">Please review your property details before submission</p>
                      
                      <div className="space-y-4">
                        <div className="border rounded-lg p-4">
                          <h3 className="font-semibold mb-2">Property Information</h3>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <p className="text-gray-500">Type</p>
                              <p className="font-medium capitalize">{formData.propertyType || 'Not specified'}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Price</p>
                              <p className="font-medium">${formData.price || '0'}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Size</p>
                              <p className="font-medium">{formData.size || '0'} sq ft</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Bedrooms</p>
                              <p className="font-medium">{formData.bedrooms || '0'}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Bathrooms</p>
                              <p className="font-medium">{formData.bathrooms || '0'}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Balconies</p>
                              <p className="font-medium">{formData.balconies || '0'}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="border rounded-lg p-4">
                          <h3 className="font-semibold mb-2">Owner Information</h3>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <p className="text-gray-500">Owner Type</p>
                              <p className="font-medium capitalize">{formData.ownerType || 'Not specified'}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Name</p>
                              <p className="font-medium">{formData.ownerName || 'Not specified'}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Phone</p>
                              <p className="font-medium">{formData.ownerPhone || 'Not specified'}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Email</p>
                              <p className="font-medium">{formData.ownerEmail || 'Not specified'}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="border rounded-lg p-4">
                          <h3 className="font-semibold mb-2">Property Description</h3>
                          <p className="text-sm">{formData.description || 'No description provided'}</p>
                        </div>
                        
                        <div className="border rounded-lg p-4">
                          <h3 className="font-semibold mb-2">Location</h3>
                          <p className="text-sm">{formData.location || 'No location specified'}</p>
                        </div>
                        
                        <div className="border rounded-lg p-4">
                          <h3 className="font-semibold mb-2">Selected Amenities</h3>
                          {formData.selectedAmenities.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {formData.selectedAmenities.map(id => {
                                const amenity = amenities.find(a => a.id === id);
                                return amenity ? (
                                  <span 
                                    key={id} 
                                    className="bg-blue-50 text-realestate-blue text-sm px-2 py-1 rounded-md"
                                  >
                                    {amenity.name}
                                  </span>
                                ) : null;
                              })}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500">No amenities selected</p>
                          )}
                        </div>
                        
                        <div className="pt-4">
                          <p className="text-sm text-gray-500 mb-4">
                            By clicking "Submit Listing", you agree to our Terms of Service and Privacy Policy.
                          </p>
                          <Button 
                            type="submit" 
                            className="w-full bg-realestate-blue hover:bg-realestate-teal"
                          >
                            Submit Listing
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Navigation Buttons */}
                  <div className="flex justify-between mt-8 pt-4 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handlePreviousStep}
                      disabled={currentStep === 1}
                      className={`${currentStep === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                    </Button>
                    
                    {currentStep < steps.length && (
                      <Button 
                        type="button" 
                        onClick={handleNextStep}
                        className="bg-realestate-blue hover:bg-realestate-teal"
                      >
                        Next <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Sell;

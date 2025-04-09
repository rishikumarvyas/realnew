
import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Card, CardContent } from '@/components/ui/card';
import { Home, Upload, MapPin, DollarSign, CheckCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { indianMetroCities } from '@/data/properties';

const propertySchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters" }),
  description: z.string().min(20, { message: "Description must be at least 20 characters" }),
  price: z.string().refine(val => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Price must be a positive number",
  }),
  bedrooms: z.string().refine(val => !isNaN(Number(val)) && Number(val) >= 0, {
    message: "Bedrooms must be a non-negative number",
  }),
  bathrooms: z.string().refine(val => !isNaN(Number(val)) && Number(val) >= 0, {
    message: "Bathrooms must be a non-negative number",
  }),
  squareFootage: z.string().refine(val => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Square footage must be a positive number",
  }),
  address: z.string().min(5, { message: "Address must be at least 5 characters" }),
  city: z.string().min(2, { message: "City must be at least 2 characters" }),
  state: z.string().min(2, { message: "State must be at least 2 characters" }),
  zipCode: z.string().min(5, { message: "Zip code must be at least 5 characters" }),
  propertyType: z.string().min(1, { message: "Property type is required" }),
  listingType: z.string().min(1, { message: "Listing type is required" }),
  hasParking: z.boolean().optional(),
  hasPool: z.boolean().optional(),
  hasPetsAllowed: z.boolean().optional(),
  hasFurnished: z.boolean().optional(),
});

const AddProperty = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  
  const form = useForm<z.infer<typeof propertySchema>>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      title: "",
      description: "",
      price: "",
      bedrooms: "",
      bathrooms: "",
      squareFootage: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      propertyType: "",
      listingType: "sale",
      hasParking: false,
      hasPool: false,
      hasPetsAllowed: false,
      hasFurnished: false,
    },
  });
  
  const onSubmit = (values: z.infer<typeof propertySchema>) => {
    console.log(values);
    toast({
      title: "Property Submitted",
      description: "Your property listing has been created successfully!",
    });
    navigate('/dashboard');
  };
  
  const goToNextStep = async () => {
    if (step === 1) {
      const result = await form.trigger(['title', 'description', 'propertyType', 'listingType', 'price']);
      if (result) setStep(2);
    } else if (step === 2) {
      const result = await form.trigger(['bedrooms', 'bathrooms', 'squareFootage']);
      if (result) setStep(3);
    }
  };
  
  const goToPreviousStep = () => {
    if (step > 1) setStep(step - 1);
  };
  
  // Extract city and state from combined city format
  const handleCitySelection = (value: string) => {
    const [cityName, stateName] = value.split(", ");
    form.setValue("city", cityName);
    form.setValue("state", stateName);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Add New Property</h1>
              <p className="text-gray-600">Complete the form below to list your property on PropVerse</p>
            </div>
            
            {/* Progress Indicator */}
            <div className="mb-8">
              <div className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  step >= 1 ? 'bg-realestate-blue text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  1
                </div>
                <div className={`flex-grow h-1 mx-2 ${step >= 2 ? 'bg-realestate-blue' : 'bg-gray-200'}`}></div>
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  step >= 2 ? 'bg-realestate-blue text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  2
                </div>
                <div className={`flex-grow h-1 mx-2 ${step >= 3 ? 'bg-realestate-blue' : 'bg-gray-200'}`}></div>
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  step >= 3 ? 'bg-realestate-blue text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  3
                </div>
                <div className={`flex-grow h-1 mx-2 ${step >= 4 ? 'bg-realestate-blue' : 'bg-gray-200'}`}></div>
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  step >= 4 ? 'bg-realestate-blue text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  4
                </div>
              </div>
              <div className="flex justify-between mt-2 text-sm">
                <span className={step >= 1 ? 'text-realestate-blue' : 'text-gray-500'}>Basic Info</span>
                <span className={step >= 2 ? 'text-realestate-blue' : 'text-gray-500'}>Details</span>
                <span className={step >= 3 ? 'text-realestate-blue' : 'text-gray-500'}>Location</span>
                <span className={step >= 4 ? 'text-realestate-blue' : 'text-gray-500'}>Photos</span>
              </div>
            </div>
            
            <Card>
              <CardContent className="p-6">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {step === 1 && (
                      <div className="space-y-6">
                        <div className="flex items-center mb-4">
                          <Home className="mr-2 text-realestate-blue" />
                          <h2 className="text-xl font-semibold">Basic Property Information</h2>
                        </div>
                        
                        <FormField
                          control={form.control}
                          name="listingType"
                          render={({ field }) => (
                            <FormItem className="space-y-3">
                              <FormLabel>Listing Type</FormLabel>
                              <FormControl>
                                <div className="flex flex-wrap gap-4">
                                  <div 
                                    className={`border rounded-md p-3 flex-1 cursor-pointer ${
                                      field.value === 'sale' ? 'border-realestate-blue bg-blue-50' : 'border-gray-300'
                                    }`}
                                    onClick={() => field.onChange('sale')}
                                  >
                                    <div className="font-medium">For Sale</div>
                                    <div className="text-sm text-gray-500">Sell your property</div>
                                  </div>
                                  <div 
                                    className={`border rounded-md p-3 flex-1 cursor-pointer ${
                                      field.value === 'rent' ? 'border-realestate-blue bg-blue-50' : 'border-gray-300'
                                    }`}
                                    onClick={() => field.onChange('rent')}
                                  >
                                    <div className="font-medium">For Rent</div>
                                    <div className="text-sm text-gray-500">Rent your property</div>
                                  </div>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Property Title*</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. Modern Apartment with Sea View" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Property Description*</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Describe your property in detail..." 
                                  rows={5}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="propertyType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Property Type*</FormLabel>
                              <FormControl>
                                <select
                                  className="w-full border p-2 rounded-md"
                                  {...field}
                                >
                                  <option value="">Select a property type</option>
                                  <option value="apartment">Apartment</option>
                                  <option value="house">House</option>
                                  <option value="condo">Condo</option>
                                  <option value="villa">Villa</option>
                                  <option value="townhouse">Townhouse</option>
                                  <option value="land">Land</option>
                                  <option value="commercial">Commercial</option>
                                  <option value="bungalow">Bungalow</option>
                                </select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="price"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Price* (₹)</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <span className="absolute left-3 top-2.5 text-gray-500 h-4 w-4">₹</span>
                                  <Input 
                                    placeholder={form.watch('listingType') === 'rent' ? "Monthly Rent" : "Property Price"} 
                                    className="pl-10"
                                    {...field}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                    
                    {step === 2 && (
                      <div className="space-y-6">
                        <div className="flex items-center mb-4">
                          <CheckCircle className="mr-2 text-realestate-blue" />
                          <h2 className="text-xl font-semibold">Property Details</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <FormField
                            control={form.control}
                            name="bedrooms"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Bedrooms*</FormLabel>
                                <FormControl>
                                  <Input type="number" min="0" step="1" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="bathrooms"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Bathrooms*</FormLabel>
                                <FormControl>
                                  <Input type="number" min="0" step="0.5" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="squareFootage"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Square Footage*</FormLabel>
                                <FormControl>
                                  <Input type="number" min="1" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="hasParking"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel>Parking Available</FormLabel>
                                </div>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="hasPool"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel>Swimming Pool</FormLabel>
                                </div>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="hasPetsAllowed"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel>Pets Allowed</FormLabel>
                                </div>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="hasFurnished"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel>Furnished</FormLabel>
                                </div>
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    )}
                    
                    {step === 3 && (
                      <div className="space-y-6">
                        <div className="flex items-center mb-4">
                          <MapPin className="mr-2 text-realestate-blue" />
                          <h2 className="text-xl font-semibold">Property Location</h2>
                        </div>
                        
                        <FormField
                          control={form.control}
                          name="address"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Street Address*</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. 123 Main Street" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="grid grid-cols-1 gap-6">
                          <FormItem>
                            <FormLabel>City & State*</FormLabel>
                            <Select onValueChange={handleCitySelection}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select City" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {indianMetroCities.map((city) => (
                                  <SelectItem key={city} value={city}>
                                    {city}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="city"
                            render={() => (
                              <FormItem>
                                <FormLabel>City*</FormLabel>
                                <FormControl>
                                  <Input readOnly disabled />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="state"
                            render={() => (
                              <FormItem>
                                <FormLabel>State*</FormLabel>
                                <FormControl>
                                  <Input readOnly disabled />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={form.control}
                          name="zipCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>PIN Code*</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. 400001" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        {/* Map placeholder */}
                        <div className="mt-4">
                          <div className="bg-gray-200 h-60 rounded-md flex items-center justify-center">
                            <div className="text-gray-500 text-center">
                              <MapPin className="mx-auto h-8 w-8 mb-2" />
                              <p>Map will be shown here</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {step === 4 && (
                      <div className="space-y-6">
                        <div className="flex items-center mb-4">
                          <Upload className="mr-2 text-realestate-blue" />
                          <h2 className="text-xl font-semibold">Property Photos</h2>
                        </div>
                        
                        <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
                          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-500 mb-4">
                            Drag and drop your photos here, or click to browse
                          </p>
                          <p className="text-xs text-gray-400 mb-4">
                            Accepted formats: JPG, PNG. Max size: 5MB each
                          </p>
                          <Button type="button" variant="outline">
                            Upload Photos
                          </Button>
                        </div>
                        
                        {/* Preview grid - would be populated with actual images */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="aspect-square bg-gray-100 rounded-md relative overflow-hidden">
                              <img 
                                src={`https://picsum.photos/seed/${i}/300/300`} 
                                alt={`Property photo ${i}`} 
                                className="w-full h-full object-cover"
                              />
                              <Button 
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="absolute top-2 right-2 h-6 w-6 rounded-full p-0"
                              >
                                <span className="sr-only">Remove</span>
                                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex justify-between pt-4 border-t">
                      {step > 1 ? (
                        <Button type="button" variant="outline" onClick={goToPreviousStep}>
                          Back
                        </Button>
                      ) : (
                        <div></div>
                      )}
                      
                      {step < 4 ? (
                        <Button type="button" onClick={goToNextStep} className="bg-realestate-blue hover:bg-realestate-teal">
                          Continue
                        </Button>
                      ) : (
                        <Button type="submit" className="bg-realestate-teal hover:bg-realestate-blue">
                          Submit Property
                        </Button>
                      )}
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AddProperty;

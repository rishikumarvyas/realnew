
import { PropertyType } from '@/components/properties/PropertyCard';

// Sample data for buy properties
export const buyProperties: PropertyType[] = [
  {
    id: '1',
    type: 'buy',
    title: 'Modern Villa with Pool',
    price: 9500000,
    location: 'Mumbai, Maharashtra',
    bedrooms: 4,
    bathrooms: 3,
    area: 2400,
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2075&q=80',
    details: {
      bedrooms: 4,
      bathrooms: 3,
      size: 2400
    },
    description: 'Luxurious modern villa with a beautiful swimming pool and spacious interiors in premium Mumbai locality.'
  },
  {
    id: '3',
    type: 'buy',
    title: 'Coastal Beach House',
    price: 15500000,
    location: 'Chennai, Tamil Nadu',
    bedrooms: 5,
    bathrooms: 4,
    area: 3100,
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    description: 'Beautiful beachside property with scenic views of the Bay of Bengal and modern amenities.'
  },
  {
    id: '5',
    type: 'buy',
    title: 'Suburban Family Home',
    price: 7800000,
    location: 'Bengaluru, Karnataka',
    bedrooms: 4,
    bathrooms: 2,
    area: 2100,
    image: 'https://images.unsplash.com/photo-1576941089067-2de3c901e126?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2078&q=80',
    description: 'Spacious family home in Bengaluru tech corridor with great connectivity to major IT parks.'
  },
  {
    id: '6',
    type: 'buy',
    title: 'Luxury Apartment',
    price: 6200000,
    location: 'New Delhi, Delhi',
    bedrooms: 3,
    bathrooms: 2,
    area: 1800,
    image: 'https://images.unsplash.com/photo-1542718610-a1d656d1884c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80',
    description: 'Premium apartment located in the heart of New Delhi with close proximity to all major attractions.'
  },
  {
    id: '7',
    type: 'buy',
    title: 'Historic Colonial Style House',
    price: 12500000,
    location: 'Kolkata, West Bengal',
    bedrooms: 3,
    bathrooms: 2.5,
    area: 2200,
    image: 'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    description: 'Charming colonial-era house with modern renovations in a prestigious Kolkata neighborhood.'
  },
  {
    id: '8',
    type: 'buy',
    title: 'Modern Glass House',
    price: 18200000,
    location: 'Hyderabad, Telangana',
    bedrooms: 4,
    bathrooms: 3.5,
    area: 3000,
    image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80',
    description: 'Contemporary glass house with smart home features in Hyderabad\'s upscale Jubilee Hills area.'
  }
];

// Sample data for rent properties
export const rentProperties: PropertyType[] = [
  {
    id: '2',
    type: 'rent',
    title: 'Downtown Luxury Apartment',
    price: 65000,
    location: 'Mumbai, Maharashtra',
    bedrooms: 2,
    bathrooms: 2,
    area: 1200,
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    details: {
      bedrooms: 2,
      bathrooms: 2,
      size: 1200
    },
    description: 'Luxurious apartment in South Mumbai with premium amenities and sea view.'
  },
  {
    id: '4',
    type: 'rent',
    title: 'Modern Studio with City View',
    price: 28000,
    location: 'Bengaluru, Karnataka',
    bedrooms: 1,
    bathrooms: 1,
    area: 650,
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2080&q=80',
    description: 'Compact modern studio in the heart of Bengaluru with stunning city views.'
  },
  {
    id: '9',
    type: 'rent',
    title: 'Furnished 2-Bedroom Apartment',
    price: 42000,
    location: 'New Delhi, Delhi',
    bedrooms: 2,
    bathrooms: 1,
    area: 950,
    image: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    description: 'Fully furnished apartment in South Delhi with modern amenities and 24/7 security.'
  },
  {
    id: '10',
    type: 'rent',
    title: 'Cozy Loft in Art District',
    price: 35000,
    location: 'Pune, Maharashtra',
    bedrooms: 1,
    bathrooms: 1,
    area: 800,
    image: 'https://images.unsplash.com/photo-1536376072261-38226b18721d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80',
    description: 'Stylish loft apartment in Pune\'s vibrant Koregaon Park area, close to restaurants and nightlife.'
  },
  {
    id: '11',
    type: 'rent',
    title: 'Waterfront Condo',
    price: 55000,
    location: 'Chennai, Tamil Nadu',
    bedrooms: 3,
    bathrooms: 2,
    area: 1500,
    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    description: 'Elegant waterfront condominium with panoramic views of the Chennai coastline.'
  },
  {
    id: '12',
    type: 'rent',
    title: 'Modern Townhouse',
    price: 48000,
    location: 'Hyderabad, Telangana',
    bedrooms: 3,
    bathrooms: 2.5,
    area: 1700,
    image: 'https://images.unsplash.com/photo-1567496898669-ee935f5f647a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80',
    description: 'Modern townhouse in gated community with excellent amenities in Hyderabad\'s HITEC City area.'
  }
];

// List of major Indian metro cities for location dropdown
export const indianMetroCities = [
  "Mumbai, Maharashtra",
  "Delhi, Delhi",
  "New Delhi, Delhi",
  "Bengaluru, Karnataka",
  "Hyderabad, Telangana",
  "Chennai, Tamil Nadu",
  "Kolkata, West Bengal",
  "Pune, Maharashtra",
  "Ahmedabad, Gujarat",
  "Jaipur, Rajasthan",
  "Surat, Gujarat",
  "Lucknow, Uttar Pradesh",
  "Kanpur, Uttar Pradesh",
  "Nagpur, Maharashtra",
  "Indore, Madhya Pradesh",
  "Thane, Maharashtra",
  "Bhopal, Madhya Pradesh",
  "Visakhapatnam, Andhra Pradesh",
  "Vadodara, Gujarat",
  "Coimbatore, Tamil Nadu"
];

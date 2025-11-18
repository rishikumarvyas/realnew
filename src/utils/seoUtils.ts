// SEO Utility Functions for HomeYatra Real Estate Platform

export interface SEOConfig {
  title: string;
  description: string;
  keywords: string;
  image: string;
  url: string;
  type: 'website' | 'article' | 'product';
  structuredData?: object;
}

// Generate SEO config for homepage
export const getHomePageSEO = (): SEOConfig => ({
  title: "HomeYatra - Best Real Estate Platform | Buy, Rent, Sell Properties in India",
  description: "Find your dream home with HomeYatra. Buy, rent, or sell properties across India. Browse 1000+ verified properties with detailed information, photos, and virtual tours. Get the best deals on apartments, houses, villas, and commercial properties.",
  keywords: "real estate, property, buy property, rent property, sell property, apartments, houses, villas, commercial property, real estate India, property search, home buying, property investment, real estate agent, property listing, mortgage, home loan, property valuation, real estate market, property prices, real estate investment, residential property, commercial real estate, property management, real estate development, property consultant, real estate broker, property dealer, real estate company, property website, real estate portal",
  image: "https://www.homeyatra.com/opengraph-image-p98pqg.png",
  url: "https://www.homeyatra.com/",
  type: "website",
  structuredData: {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "name": "HomeYatra",
    "description": "Leading real estate platform for buying, renting, and selling properties across India",
    "url": "https://www.homeyatra.com/",
    "logo": "https://www.homeyatra.com/opengraph-image-p98pqg.png",
    "image": "https://www.homeyatra.com/opengraph-image-p98pqg.png",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "IN",
      "addressRegion": "India"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "email": "support@homeyatra.com",
      "availableLanguage": ["English", "Hindi"]
    },
    "sameAs": [
      "https://twitter.com/homeyatra_dev",
      "https://facebook.com/homeyatra",
      "https://linkedin.com/company/homeyatra"
    ],
    "areaServed": {
      "@type": "Country",
      "name": "India"
    },
    "serviceType": ["Property Buying", "Property Renting", "Property Selling", "Property Management"],
    "priceRange": "₹₹",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "1250"
    }
  }
});

// Generate SEO config for property listing page
export const getPropertyListingSEO = (type?: string, city?: string): SEOConfig => {
  const typeText = type === 'buy' ? 'Buy' : type === 'rent' ? 'Rent' : type === 'plot' ? 'Plot' : 'Properties';
  const cityText = city ? ` in ${city.charAt(0).toUpperCase() + city.slice(1)}` : '';
  
  return {
    title: `${typeText} Properties${cityText} | HomeYatra - Real Estate Platform`,
    description: `Find ${typeText.toLowerCase()} properties${cityText} on HomeYatra. Browse verified ${typeText.toLowerCase()} listings with detailed information, photos, and virtual tours. Get the best deals on apartments, houses, villas, and commercial properties.`,
    keywords: `${typeText.toLowerCase()} properties, ${typeText.toLowerCase()} real estate, ${typeText.toLowerCase()} property listings, ${cityText ? city + ' properties' : 'properties'}, real estate ${typeText.toLowerCase()}, property ${typeText.toLowerCase()}, ${typeText.toLowerCase()} homes, ${typeText.toLowerCase()} apartments, ${typeText.toLowerCase()} houses, ${typeText.toLowerCase()} villas, ${typeText.toLowerCase()} commercial property, real estate India, property search, home ${typeText.toLowerCase()}, property investment, real estate agent, property listing, mortgage, home loan, property valuation, real estate market, property prices, real estate investment, residential property, commercial real estate, property management, real estate development, property consultant, real estate broker, property dealer, real estate company, property website, real estate portal`,
    image: "https://www.homeyatra.com/opengraph-image-p98pqg.png",
    url: `https://www.homeyatra.com/properties${type ? `?type=${type}` : ''}${city ? `${type ? '&' : '?'}city=${city}` : ''}`,
    type: "website",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": `${typeText} Properties${cityText}`,
      "description": `Browse ${typeText.toLowerCase()} properties${cityText} on HomeYatra`,
      "url": `https://www.homeyatra.com/properties${type ? `?type=${type}` : ''}${city ? `${type ? '&' : '?'}city=${city}` : ''}`,
      "numberOfItems": 1000,
      "itemListElement": []
    }
  };
};

// Generate SEO config for property detail page
export const getPropertyDetailSEO = (property: any): SEOConfig => {
  const title = property.title || 'Property Details';
  const location = property.city || property.location || 'India';
  const price = property.price ? `₹${property.price.toLocaleString()}` : '';
  const type = property.superCategory || property.type || 'Property';
  
  return {
    title: `${title} - ${location} | ${price} | HomeYatra`,
    description: `${title} for ${type.toLowerCase()} in ${location}. ${price ? `Price: ${price}. ` : ''}${property.description || 'Find detailed information, photos, amenities, and contact details for this property on HomeYatra.'}`,
    keywords: `${title}, ${location} property, ${type.toLowerCase()}, real estate ${location}, property ${location}, ${location} real estate, property details, property information, property photos, property amenities, property price, property valuation, real estate listing, property search, home buying, property investment, real estate agent, property listing, mortgage, home loan, property valuation, real estate market, property prices, real estate investment, residential property, commercial real estate, property management, real estate development, property consultant, real estate broker, property dealer, real estate company, property website, real estate portal`,
    image: property.mainImageUrl || property.image || "https://www.homeyatra.com/opengraph-image-p98pqg.png",
    url: `https://www.homeyatra.com/properties/${property.propertyId || property.id}`,
    type: "product",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": title,
      "description": property.description || `${title} for ${type.toLowerCase()} in ${location}`,
      "image": property.mainImageUrl || property.image || "https://www.homeyatra.com/opengraph-image-p98pqg.png",
      "url": `https://www.homeyatra.com/properties/${property.propertyId || property.id}`,
      "category": type,
      "brand": {
        "@type": "Brand",
        "name": "HomeYatra"
      },
      "offers": {
        "@type": "Offer",
        "price": property.price,
        "priceCurrency": "INR",
        "availability": "https://schema.org/InStock",
        "seller": {
          "@type": "Organization",
          "name": "HomeYatra",
          "email": "support@homeyatra.com"
        }
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": property.rating || "4.5",
        "reviewCount": property.reviewCount || "10"
      }
    }
  };
};

// Generate SEO config for about page
export const getAboutPageSEO = (): SEOConfig => ({
  title: "About HomeYatra - India's Trusted Real Estate Platform",
  description: "Learn about HomeYatra, India's leading real estate platform. We help you buy, rent, and sell properties with verified listings, detailed information, and professional support. Discover our mission, values, and commitment to making real estate transactions simple and transparent.",
  keywords: "about HomeYatra, real estate platform, property website, real estate company, property portal, real estate services, property buying, property selling, property renting, real estate India, property investment, real estate agent, property consultant, real estate broker, property dealer, real estate development, property management, real estate market, property prices, real estate investment, residential property, commercial real estate, property website, real estate portal, property search, home buying, property investment, real estate agent, property listing, mortgage, home loan, property valuation",
  image: "https://www.homeyatra.com/opengraph-image-p98pqg.png",
  url: "https://www.homeyatra.com/about",
  type: "website"
});

// Generate SEO config for contact page
export const getContactPageSEO = (): SEOConfig => ({
  title: "Contact HomeYatra - Get in Touch with Real Estate Experts",
  description: "Contact HomeYatra for all your real estate needs. Get in touch with our property experts for buying, selling, or renting properties. We provide professional support and guidance throughout your real estate journey.",
  keywords: "contact HomeYatra, real estate contact, property consultant contact, real estate agent contact, property dealer contact, real estate broker contact, property investment contact, real estate services contact, property buying contact, property selling contact, property renting contact, real estate India contact, property search contact, home buying contact, property investment contact, real estate agent contact, property listing contact, mortgage contact, home loan contact, property valuation contact, real estate market contact, property prices contact, real estate investment contact, residential property contact, commercial real estate contact, property management contact, real estate development contact, property consultant contact, real estate broker contact, property dealer contact, real estate company contact, property website contact, real estate portal contact",
  image: "https://www.homeyatra.com/opengraph-image-p98pqg.png",
  url: "https://www.homeyatra.com/contactus",
  type: "website"
});

// Generate SEO config for post property page
export const getPostPropertySEO = (): SEOConfig => ({
  title: "Post Property for Sale/Rent | HomeYatra - List Your Property",
  description: "List your property for sale or rent on HomeYatra. Reach thousands of verified buyers and tenants. Get maximum exposure for your property with professional listing, photos, and virtual tours.",
  keywords: "post property, list property, sell property, rent property, property listing, real estate listing, property advertisement, property marketing, property exposure, property visibility, real estate marketing, property sales, property rental, property investment, real estate investment, property management, real estate development, property consultant, real estate broker, property dealer, real estate company, property website, real estate portal, property search, home buying, property investment, real estate agent, property listing, mortgage, home loan, property valuation, real estate market, property prices, real estate investment, residential property, commercial real estate",
  image: "https://www.homeyatra.com/opengraph-image-p98pqg.png",
  url: "https://www.homeyatra.com/post-property",
  type: "website"
});

// Generate SEO config for dashboard page
export const getDashboardSEO = (): SEOConfig => ({
  title: "Dashboard | HomeYatra - Manage Your Properties",
  description: "Access your HomeYatra dashboard to manage your properties, view listings, track inquiries, and monitor your real estate portfolio. Get insights and analytics for your property investments.",
  keywords: "dashboard, property dashboard, real estate dashboard, property management, property portfolio, property listings, property inquiries, property analytics, property insights, real estate management, property investment, real estate investment, property consultant, real estate broker, property dealer, real estate company, property website, real estate portal, property search, home buying, property investment, real estate agent, property listing, mortgage, home loan, property valuation, real estate market, property prices, real estate investment, residential property, commercial real estate",
  image: "https://www.homeyatra.com/opengraph-image-p98pqg.png",
  url: "https://www.homeyatra.com/dashboard",
  type: "website"
});

// Generate SEO config for builder project page
export const getBuilderProjectSEO = (): SEOConfig => ({
  title: "Builder Projects | HomeYatra - New Construction Properties",
  description: "Explore new construction projects and builder properties on HomeYatra. Find upcoming residential and commercial projects from trusted builders with detailed information, floor plans, and booking options.",
  keywords: "builder projects, new construction, upcoming projects, residential projects, commercial projects, property development, real estate development, construction projects, property investment, real estate investment, property consultant, real estate broker, property dealer, real estate company, property website, real estate portal, property search, home buying, property investment, real estate agent, property listing, mortgage, home loan, property valuation, real estate market, property prices, real estate investment, residential property, commercial real estate, property management, real estate development",
  image: "https://www.homeyatra.com/opengraph-image-p98pqg.png",
  url: "https://www.homeyatra.com/builderpost",
  type: "website"
});

// (Removed New Launching SEO; page deprecated)

// Generate SEO config for terms page
export const getTermsPageSEO = (): SEOConfig => ({
  title: "Terms and Conditions | HomeYatra - Real Estate Platform",
  description: "Read HomeYatra's terms and conditions for using our real estate platform. Understand our policies, user agreements, and legal terms for property buying, selling, and renting services.",
  keywords: "terms and conditions, terms of service, user agreement, legal terms, real estate terms, property terms, HomeYatra terms, real estate platform terms, property website terms, real estate portal terms, property buying terms, property selling terms, property renting terms, real estate investment terms, property investment terms, real estate agent terms, property consultant terms, real estate broker terms, property dealer terms, real estate company terms",
  image: "https://www.homeyatra.com/opengraph-image-p98pqg.png",
  url: "https://www.homeyatra.com/terms",
  type: "website"
});

// Generate SEO config for privacy page
export const getPrivacyPageSEO = (): SEOConfig => ({
  title: "Privacy Policy | HomeYatra - Data Protection and Privacy",
  description: "Learn about HomeYatra's privacy policy and how we protect your personal information. Understand our data collection, usage, and protection practices for a secure real estate experience.",
  keywords: "privacy policy, data protection, personal information, data privacy, real estate privacy, property privacy, HomeYatra privacy, real estate platform privacy, property website privacy, real estate portal privacy, data collection, data usage, data protection, personal data, privacy rights, data security, real estate data, property data, user privacy, customer privacy, real estate agent privacy, property consultant privacy, real estate broker privacy, property dealer privacy, real estate company privacy",
  image: "https://www.homeyatra.com/opengraph-image-p98pqg.png",
  url: "https://www.homeyatra.com/privacy",
  type: "website"
});

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  structuredData?: object;
}

const SEOHead: React.FC<SEOHeadProps> = ({
  title = "HomeYatra - Best Real Estate Platform | Buy, Rent, Sell Properties in India",
  description = "Find your dream home with HomeYatra. Buy, rent, or sell properties across India. Browse 1000+ verified properties with detailed information, photos, and virtual tours.",
  keywords = "real estate, property, buy property, rent property, sell property, apartments, houses, villas, commercial property, real estate India",
  image = "https://www.homeyatra.com/opengraph-image-p98pqg.png",
  url,
  type = "website",
  structuredData
}) => {
  const location = useLocation();
  const currentUrl = url || `https://www.homeyatra.com${location.pathname}`;

  useEffect(() => {
    // Update document title
    document.title = title;

    // Update meta tags
    const updateMetaTag = (name: string, content: string) => {
      let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = name;
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    const updatePropertyMetaTag = (property: string, content: string) => {
      let meta = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('property', property);
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    // Update primary meta tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);
    updateMetaTag('title', title);

    // Update Open Graph tags
    updatePropertyMetaTag('og:title', title);
    updatePropertyMetaTag('og:description', description);
    updatePropertyMetaTag('og:image', image);
    updatePropertyMetaTag('og:url', currentUrl);
    updatePropertyMetaTag('og:type', type);

    // Update Twitter tags
    updatePropertyMetaTag('twitter:title', title);
    updatePropertyMetaTag('twitter:description', description);
    updatePropertyMetaTag('twitter:image', image);
    updatePropertyMetaTag('twitter:url', currentUrl);

    // Update canonical URL
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = currentUrl;

    // Add structured data if provided
    if (structuredData) {
      // Remove existing structured data
      const existingScripts = document.querySelectorAll('script[type="application/ld+json"]');
      existingScripts.forEach(script => {
        if (script.textContent?.includes('"@type":"RealEstateAgent"') || 
            script.textContent?.includes('"@type":"Product"') ||
            script.textContent?.includes('"@type":"Article"')) {
          script.remove();
        }
      });

      // Add new structured data
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(structuredData);
      document.head.appendChild(script);
    }

  }, [title, description, keywords, image, currentUrl, type, structuredData]);

  return null; // This component doesn't render anything
};

export default SEOHead;

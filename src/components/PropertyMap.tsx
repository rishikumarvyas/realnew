import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface PropertyMapProps {
  address: string;
  city?: string;
  state?: string;
  className?: string;
}

const PropertyMap = ({ address, city, state, className = "h-[300px]" }: PropertyMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Create map instance
    const map = L.map(mapRef.current).setView([20.5937, 78.9629], 5); // Default to India center

    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // Try to geocode the address using Nominatim
    const fullAddress = `${address}${city ? `, ${city}` : ''}${state ? `, ${state}` : ''}`;
    
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}`)
      .then(response => response.json())
      .then(data => {
        if (data && data.length > 0) {
          const { lat, lon } = data[0];
          const location = [parseFloat(lat), parseFloat(lon)];
          
          // Update map view
          map.setView(location as [number, number], 16);
          
          // Add marker
          const marker = L.marker(location as [number, number]).addTo(map);
          marker.bindPopup(`<b>${fullAddress}</b>`).openPopup();
        } else {
          console.warn('Could not geocode address:', fullAddress);
          
          // If we couldn't find the specific address, try with just city and state
          if (city) {
            const cityState = `${city}${state ? `, ${state}` : ''}`;
            fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cityState)}`)
              .then(response => response.json())
              .then(cityData => {
                if (cityData && cityData.length > 0) {
                  const { lat, lon } = cityData[0];
                  const location = [parseFloat(lat), parseFloat(lon)];
                  map.setView(location as [number, number], 13);
                  L.marker(location as [number, number]).addTo(map)
                    .bindPopup(`<b>${cityState}</b><br>Approximate location`).openPopup();
                }
              });
          }
        }
      })
      .catch(err => {
        console.error('Error geocoding address:', err);
      });

    // Cleanup function
    return () => {
      map.remove();
    };
  }, [address, city, state]);

  return <div ref={mapRef} className={`rounded-lg overflow-hidden border ${className}`}></div>;
};

export default PropertyMap;
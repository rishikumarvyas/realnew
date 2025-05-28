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

    // Create custom marker icon
    const locationIcon = L.divIcon({
      html: `
        <div style="
          background-color: #ef4444;
          width: 20px;
          height: 20px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            width: 8px;
            height: 8px;
            background-color: white;
            border-radius: 50%;
            transform: rotate(45deg);
          "></div>
        </div>
      `,
      className: '',
      iconSize: [30, 30],
      iconAnchor: [15, 30],
      popupAnchor: [0, -30],
    });

    // Initialize map
    const map = L.map(mapRef.current).setView([20.5937, 78.9629], 5);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    const fullAddress = `${address}${city ? `, ${city}` : ''}${state ? `, ${state}` : ''}`;

    // Geocode full address
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          const { lat, lon } = data[0];
          const location: [number, number] = [parseFloat(lat), parseFloat(lon)];

          map.setView(location, 16);

          L.marker(location, { icon: locationIcon }).addTo(map)
            .bindPopup(`
              <div style="font-family: sans-serif;">
                <b style="color: #1f2937;">${fullAddress}</b>
                <br>
                <small style="color: #6b7280;">📍 Exact Location</small>
              </div>
            `).openPopup();
        } else {
          // Retry with city + state
          const fallback = `${city || ''}${state ? `, ${state}` : ''}`;
          fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fallback)}`)
            .then(res => res.json())
            .then(cityData => {
              if (cityData && cityData.length > 0) {
                const { lat, lon } = cityData[0];
                const location: [number, number] = [parseFloat(lat), parseFloat(lon)];

                map.setView(location, 13);

                L.marker(location, { icon: locationIcon }).addTo(map)
                  .bindPopup(`
                    <div style="font-family: sans-serif;">
                      <b style="color: #1f2937;">${fallback}</b>
                      <br>
                      <small style="color: #f59e0b;">⚠️ Approximate Location</small>
                    </div>
                  `).openPopup();
              }
            });
        }
      })
      .catch(err => {
        console.error('Geocoding failed:', err);
      });

    return () => {
      map.remove();
    };
  }, [address, city, state]);

  return (
    <div
      ref={mapRef}
      className={`relative border rounded-lg ${className}`}
      style={{
        zIndex: 1
      }}
    />
  );
};

export default PropertyMap;

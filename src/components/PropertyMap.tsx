import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface PropertyMapProps {
  address: string;
  city?: string;
  state?: string;
  className?: string;
}

const PropertyMap = ({
  address,
  city,
  state,
  className = "h-[300px]",
}: PropertyMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Clean up existing map
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
    }

    // Create custom marker icon
    const locationIcon = L.divIcon({
      html: `
        <div style="
          background-color: #ef4444;
          width: 24px;
          height: 24px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 3px solid white;
          box-shadow: 0 3px 6px rgba(0,0,0,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            width: 6px;
            height: 6px;
            background-color: white;
            border-radius: 50%;
            transform: rotate(45deg);
          "></div>
        </div>
      `,
      className: "custom-location-icon",
      iconSize: [24, 24],
      iconAnchor: [12, 24],
      popupAnchor: [0, -24],
    });

    // Initialize map
    const map = L.map(mapRef.current, {
      zoomControl: true,
      scrollWheelZoom: true,
    }).setView([20.5937, 78.9629], 5);

    mapInstanceRef.current = map;

    // Add tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // Build full address
    const fullAddress = [address, city, state].filter(Boolean).join(", ");

    // Geocoding function
    const geocodeLocation = async (
      searchQuery: string,
      isExact: boolean = true,
    ) => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1&addressdetails=1`,
          {
            headers: {
              "User-Agent": "PropertyMap/1.0",
            },
          },
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data && data.length > 0) {
          const result = data[0];
          const lat = parseFloat(result.lat);
          const lon = parseFloat(result.lon);

          if (!isNaN(lat) && !isNaN(lon)) {
            const location: [number, number] = [lat, lon];
            const zoomLevel = isExact ? 16 : 13;

            map.setView(location, zoomLevel);

            // Create popup content
            const popupContent = `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; min-width: 200px;">
                <div style="font-weight: 600; color: #1f2937; margin-bottom: 8px; font-size: 14px;">
                  📍 ${fullAddress}
                </div>
                <div style="color: ${isExact ? "#059669" : "#f59e0b"}; font-size: 12px; font-weight: 500;">
                  ${isExact ? "✅ Exact Location" : "⚠️ Approximate Location"}
                </div>
                <div style="color: #6b7280; font-size: 11px; margin-top: 4px;">
                  Lat: ${lat.toFixed(6)}, Lng: ${lon.toFixed(6)}
                </div>
              </div>
            `;

            // Add marker
            const marker = L.marker(location, { icon: locationIcon })
              .addTo(map)
              .bindPopup(popupContent, {
                maxWidth: 300,
                className: "custom-popup",
              });

            // Auto-open popup
            setTimeout(() => {
              marker.openPopup();
            }, 500);

            return true;
          }
        }
        return false;
      } catch (error) {
  
        return false;
      }
    };

    // Try geocoding with different strategies
    const attemptGeocoding = async () => {
      // Strategy 1: Full address
      if (fullAddress) {
        const success = await geocodeLocation(fullAddress, true);
        if (success) return;
      }

      // Strategy 2: City + State
      if (city && state) {
        const cityState = `${city}, ${state}`;
        const success = await geocodeLocation(cityState, false);
        if (success) return;
      }

      // Strategy 3: Just city
      if (city) {
        const success = await geocodeLocation(city, false);
        if (success) return;
      }

      // Strategy 4: Just state
      if (state) {
        const success = await geocodeLocation(state, false);
        if (success) return;
      }

      // If all fail, show error
      

      // Add a default marker at center of India with error message
      const defaultLocation: [number, number] = [20.5937, 78.9629];
      L.marker(defaultLocation, { icon: locationIcon })
        .addTo(map)
        .bindPopup(
          `
          <div style="font-family: sans-serif; color: #dc2626;">
            <b>❌ Location Not Found</b><br>
            <small>${fullAddress || "No address provided"}</small>
          </div>
        `,
        )
        .openPopup();
    };

    // Start geocoding
    attemptGeocoding();

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [address, city, state]);

  return (
    <>
      <style>{`
        .custom-popup .leaflet-popup-content-wrapper {
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        .custom-popup .leaflet-popup-tip {
          background: white;
        }
        .custom-location-icon {
          background: transparent !important;
          border: none !important;
        }
      `}</style>
      <div
        ref={mapRef}
        className={`relative border rounded-lg overflow-hidden ${className}`}
        style={{ zIndex: 1 }}
      />
    </>
  );
};

export default PropertyMap;

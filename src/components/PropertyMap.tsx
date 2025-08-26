import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Navigation, ExternalLink } from "lucide-react";

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
  className = "h-[400px]",
}: PropertyMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [locationData, setLocationData] = useState<{
    lat: number;
    lng: number;
    fullAddress: string;
    isExact: boolean;
  } | null>(null);


  useEffect(() => {
    if (!mapRef.current) return;

    // Clean up existing map
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
    }

    setIsLoading(true);

    // Create modern custom marker icon
    const locationIcon = L.divIcon({
      html: `
        <div style="
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          width: 32px;
          height: 32px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 3px solid white;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          animation: pulse 2s infinite;
        ">
          <div style="
            width: 8px;
            height: 8px;
            background-color: white;
            border-radius: 50%;
            transform: rotate(45deg);
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          "></div>
          <div style="
            position: absolute;
            top: -8px;
            left: -8px;
            width: 48px;
            height: 48px;
            border: 2px solid rgba(59, 130, 246, 0.3);
            border-radius: 50%;
            animation: ripple 2s infinite;
          "></div>
        </div>
      `,
      className: "custom-location-icon",
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    });

    // Initialize map with modern styling
    const map = L.map(mapRef.current, {
      zoomControl: false, // We'll add custom controls
      scrollWheelZoom: true,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false,
      dragging: true,
      touchZoom: true,
    }).setView([20.5937, 78.9629], 5);

    mapInstanceRef.current = map;

    // Add modern tile layer with better styling
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: false, // We'll add custom attribution
      maxZoom: 19,
    }).addTo(map);

    // Add custom zoom controls
    const zoomControl = L.control.zoom({
      position: 'topright',
      zoomInTitle: 'Zoom in',
      zoomOutTitle: 'Zoom out'
    }).addTo(map);

    // Build full address
    const fullAddress = [address, city, state].filter(Boolean).join(", ");

    // Geocoding function with enhanced error handling
    const geocodeLocation = async (
      searchQuery: string,
      isExact: boolean = true,
    ) => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1&addressdetails=1&countrycodes=in`,
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

            // Store location data
            setLocationData({
              lat,
              lng: lon,
              fullAddress,
              isExact,
            });

            // Create enhanced popup content
            const popupContent = `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; min-width: 280px; padding: 8px;">
                <div style="display: flex; align-items: center; margin-bottom: 12px;">
                  <div style="
                    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-right: 8px;
                  ">
                    <span style="color: white; font-size: 12px;">📍</span>
                  </div>
                  <div style="flex: 1;">
                    <div style="font-weight: 600; color: #1f2937; font-size: 14px; line-height: 1.3;">
                      ${fullAddress}
                    </div>
                    <div style="color: ${isExact ? "#059669" : "#f59e0b"}; font-size: 12px; font-weight: 500; margin-top: 2px;">
                      ${isExact ? "✅ Exact Location" : "⚠️ Approximate Location"}
                    </div>
                  </div>
                </div>
                <div style="
                  background: #f8fafc;
                  border-radius: 6px;
                  padding: 8px;
                  font-size: 11px;
                  color: #64748b;
                  border-left: 3px solid #3b82f6;
                ">
                  <div style="font-weight: 500; margin-bottom: 4px;">Coordinates:</div>
                  <div>Lat: ${lat.toFixed(6)}</div>
                  <div>Lng: ${lon.toFixed(6)}</div>
                </div>
              </div>
            `;

            // Add marker with enhanced popup
            const marker = L.marker(location, { icon: locationIcon })
              .addTo(map)
              .bindPopup(popupContent, {
                maxWidth: 320,
                className: "custom-popup",
                closeButton: true,
                autoClose: false,
              });

            // Auto-open popup with animation
            setTimeout(() => {
              marker.openPopup();
            }, 800);

            // Add a subtle bounce animation
            setTimeout(() => {
              marker.setIcon(locationIcon);
            }, 1000);

            return true;
          }
        }
        return false;
      } catch (error) {
        console.error("Geocoding error:", error);
        return false;
      }
    };

    // Try geocoding with different strategies
    const attemptGeocoding = async () => {
      // Strategy 1: Full address
      if (fullAddress) {
        const success = await geocodeLocation(fullAddress, true);
        if (success) {
          setIsLoading(false);
          return;
        }
      }

      // Strategy 2: City + State
      if (city && state) {
        const cityState = `${city}, ${state}`;
        const success = await geocodeLocation(cityState, false);
        if (success) {
          setIsLoading(false);
          return;
        }
      }

      // Strategy 3: Just city
      if (city) {
        const success = await geocodeLocation(city, false);
        if (success) {
          setIsLoading(false);
          return;
        }
      }

      // Strategy 4: Just state
      if (state) {
        const success = await geocodeLocation(state, false);
        if (success) {
          setIsLoading(false);
          return;
        }
      }

      // If all fail, show error
      setIsLoading(false);
      
      // Add a default marker at center of India with error message
      const defaultLocation: [number, number] = [20.5937, 78.9629];
      L.marker(defaultLocation, { icon: locationIcon })
        .addTo(map)
        .bindPopup(
          `
          <div style="font-family: sans-serif; padding: 12px; text-align: center;">
            <div style="color: #dc2626; font-size: 16px; margin-bottom: 8px;">❌</div>
            <div style="color: #dc2626; font-weight: 600; margin-bottom: 4px;">Location Not Found</div>
            <div style="color: #6b7280; font-size: 12px;">${fullAddress || "No address provided"}</div>
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



  // Open in Google Maps
  const openInGoogleMaps = () => {
    if (locationData) {
      const url = `https://www.google.com/maps?q=${locationData.lat},${locationData.lng}`;
      window.open(url, '_blank');
    }
  };

  // Get directions
  const getDirections = () => {
    if (locationData) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${locationData.lat},${locationData.lng}`;
      window.open(url, '_blank');
    }
  };

  return (
    <>
      <style>{`
        .custom-popup .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
          border: 1px solid rgba(0, 0, 0, 0.08);
        }
        .custom-popup .leaflet-popup-tip {
          background: white;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        .custom-location-icon {
          background: transparent !important;
          border: none !important;
        }
        @keyframes pulse {
          0% { transform: rotate(-45deg) scale(1); }
          50% { transform: rotate(-45deg) scale(1.1); }
          100% { transform: rotate(-45deg) scale(1); }
        }
        @keyframes ripple {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        .map-controls {
          position: absolute;
          top: 10px;
          left: 10px;
          z-index: 1000;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .map-control-btn {
          background: white;
          border: 1px solid rgba(0, 0, 0, 0.1);
          border-radius: 8px;
          padding: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
        }
        .map-control-btn:hover {
          background: #f8fafc;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        .map-control-btn:active {
          transform: translateY(0);
        }
        .map-control-btn svg {
          width: 16px;
          height: 16px;
          color: #374151;
        }
        .map-control-btn.success svg {
          color: #059669;
        }
        .map-loading {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 1000;
          background: white;
          padding: 12px 20px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #374151;
        }
        .map-loading-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid #e5e7eb;
          border-top: 2px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      
      <div
        ref={mapRef}
        className={`relative border border-gray-200 rounded-xl overflow-hidden shadow-sm ${className}`}
        style={{ zIndex: 1 }}
      >
        {/* Loading indicator */}
        {isLoading && (
          <div className="map-loading">
            <div className="map-loading-spinner"></div>
            <span>Finding location...</span>
          </div>
        )}

        {/* Map controls */}
        {locationData && (
          <div className="map-controls">
            <button
              onClick={openInGoogleMaps}
              className="map-control-btn"
              title="Open in Google Maps"
            >
              <ExternalLink size={16} />
            </button>
            <button
              onClick={getDirections}
              className="map-control-btn"
              title="Get directions"
            >
              <Navigation size={16} />
            </button>
          </div>
        )}

        {/* Attribution */}
        <div style={{
          position: 'absolute',
          bottom: '8px',
          right: '8px',
          background: 'rgba(255, 255, 255, 0.9)',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '10px',
          color: '#6b7280',
          zIndex: 1000,
        }}>
          © OpenStreetMap contributors
        </div>
      </div>
    </>
  );
};

export default PropertyMap;

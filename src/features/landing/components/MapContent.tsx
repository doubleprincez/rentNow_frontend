"use client";
import React, { useEffect, useState, memo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

interface Location {
  name: string;
  position: [number, number];
  description?: string;
}

const locations: Location[] = [
  {
    name: "Victoria Island",
    position: [6.4281, 3.4219],
    description: "Business and tourist center"
  },
  {
    name: "Lekki",
    position: [6.4698, 3.5852],
    description: "Residential and commercial hub"
  },
  {
    name: "Ikeja",
    position: [6.6018, 3.3515],
    description: "State capital and commercial center"
  },
  {
    name: "Lagos Island",
    position: [6.4549, 3.4246],
    description: "Historic commercial district"
  },
  {
    name: "Ikoyi",
    position: [6.4432, 3.4327],
    description: "Upscale residential area"
  }
];

const MapContent = memo(() => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const mapInit = localStorage.getItem('mapInitialized');
    
    if (!mapInit) {
      localStorage.setItem('mapInitialized', 'true');
      setIsMounted(true);
      
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });
    } else {
      setIsMounted(true);
    }

    return () => {
      localStorage.removeItem('mapInitialized');
    };
  }, []);

  if (!isMounted) return null;

  const lagosCenter: [number, number] = [6.5244, 3.3792];

  return (
    <div className="lg:py-8 w-full h-[400px] lg:h-full flex items-end overflow-hidden">
      
      <MapContainer
        center={lagosCenter}
        zoom={12}
        style={{ height: '100%', width: '100%', borderRadius: '0.5rem', zIndex: 0 }}
        scrollWheelZoom={false}
        attributionControl={true}
        zoomControl={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {locations.map((location, index) => (
          <Marker key={`marker-${index}`} position={location.position}>
            <Popup>
              <div className="font-sans">
                <h3 className="font-semibold text-lg">{location.name}</h3>
                {location.description && (
                  <p className="text-sm mt-1">{location.description}</p>
                )}
              </div>
            </Popup>
          </Marker>
        ))} 
        </MapContainer>
    </div>
  );
});

MapContent.displayName = 'MapContent';

export default MapContent;

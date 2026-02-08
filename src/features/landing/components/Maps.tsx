"use client";
import React, { useEffect } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

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

const MapComponent = () => {
  const { MapContainer, TileLayer, Marker, Popup } = require('react-leaflet');
  const L = require('leaflet');
  
  useEffect(() => {
    // Fix for default marker icons
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });
  }, []);

  const lagosCenter: [number, number] = [6.5244, 3.3792];

  return (
    <div className="lg:py-8 w-full h-[400px] lg:h-full flex items-end overflow-hidden">
      <MapContainer
        center={lagosCenter}
        zoom={12}
        style={{ height: '100%', width: '100%', borderRadius: '0.5rem', zIndex: 0 }}
        scrollWheelZoom={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {locations.map((location, index) => (
          <Marker key={index} position={location.position}>
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
};

// Dynamically import the map component with SSR disabled
const Map = dynamic(() => Promise.resolve(MapComponent), {
  ssr: false,
  loading: () => <div className="w-full h-[400px] lg:h-full bg-gray-200 rounded-lg animate-pulse flex items-center justify-center">Loading map...</div>
});

export default Map;

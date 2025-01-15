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
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });

    return () => {
      // Cleanup function to remove map container when component unmounts
      if (document.querySelector('.leaflet-container')) {
        (document.querySelector('.leaflet-container') as any)._leaflet_id = null;
      }
    };
  }, []); // Empty dependency array means this effect runs once on mount

  const lagosCenter: [number, number] = [6.5244, 3.3792];

  return (
    <div className="lg:py-8 w-full h-[400px] lg:h-full flex items-end overflow-hidden">
      <MapContainer
        center={lagosCenter}
        zoom={12}
        style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}
        key="map" // Add a key to force re-render when needed
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
  ssr: false
});

export default Map;
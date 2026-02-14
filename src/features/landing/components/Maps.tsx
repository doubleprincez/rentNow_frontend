"use client";
import React from 'react';

interface MapProps {
  location?: string;
}

const Map: React.FC<MapProps> = ({ location = 'Lagos, Nigeria' }) => {
  const mapUrl = `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(location)}`;
  
  return (
    <div className="lg:py-8 w-full h-[400px] lg:h-full flex items-end overflow-hidden">
      <iframe
        src={mapUrl}
        width="100%"
        height="100%"
        style={{ border: 0, borderRadius: '0.5rem' }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
};

export default Map;

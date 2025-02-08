'use client'
import React, { useEffect, useState } from 'react';
import { Banknote, MapPin, Clock, Home, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { Apartment, ApiResponse } from '@/types/apartment';

interface ApartmentPageProps {
  params: Promise<{ slug: string }>;
  initialData?: Apartment | null;
}

const ApartmentPage: React.FC<ApartmentPageProps> = ({ params, initialData }) => {
  const [apartment, setApartment] = useState<Apartment | null>(initialData || null);
  const [isLoading, setIsLoading] = useState(!initialData);
  const resolvedParams = React.use(params);

  useEffect(() => {
    // Skip API call if we already have the data
    if (initialData) {
      setApartment(initialData);
      return;
    }

    const fetchApartment = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/apartments');
        const data: ApiResponse = await response.json();
        if (data.success) {
          const apt = data.data.data.find((a) => a.id.toString() === resolvedParams.slug);
          setApartment(apt || null);
        }
      } catch (error) {
        console.error('Error fetching apartment:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApartment();
  }, [resolvedParams.slug, initialData]);

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!apartment) {
    return <div className="flex justify-center items-center min-h-screen">Apartment not found</div>;
  }

  return (
    <div className="w-full px-4 py-20 md:py-32 ">
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Main Image */}
            <div className="w-full h-[300px] md:h-[400px] rounded-lg overflow-hidden">
                <img 
                    src={apartment.images && Object.values(apartment.images)[0]?.preview_url || '/placeholder.jpg'}
                    alt={apartment.title}
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Property Details */}
            <div className="flex flex-col gap-4">
              <h1 className="text-2xl font-bold text-gray-800">{apartment.title}</h1>
              
              <div className="flex items-center gap-2">
                <User className="text-orange-500" />
                <span className="text-gray-600">Agent: {apartment.agent}</span>
              </div>

              <div className="flex items-center gap-2">
                <MapPin className="text-orange-500" />
                <span className="text-gray-600">{`${apartment.city_code}, ${apartment.state_code}, ${apartment.country_code}`}</span>
              </div>

              <div className="flex items-center gap-2">
                <Banknote className="text-orange-500" />
                <span className="text-gray-600">Price: {apartment.amount}</span>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="text-orange-500" />
                <span className="text-gray-600">Duration: {apartment.duration}</span>
              </div>

              <div className="flex items-center gap-2">
                <Home className="text-orange-500" />
                <span className="text-gray-600">Rooms: {apartment.number_of_rooms}</span>
              </div>

              <div className="mt-4">
                <h2 className="text-xl font-semibold mb-2">Description</h2>
                <p className="text-gray-600">{apartment.description}</p>
              </div>
            </div>
          </div>

          {/* Additional Images */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Property Images</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {apartment.images && Object.values(apartment.images).map((image, index) => (
                <div key={index} className="w-full h-[150px] rounded-lg overflow-hidden">
                  <img 
                    src={image.preview_url}
                    alt={`Property image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApartmentPage;
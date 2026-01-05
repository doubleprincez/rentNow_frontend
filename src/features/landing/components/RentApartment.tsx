'use client'
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Banknote, Clock } from 'lucide-react';
import Image from 'next/image';
import {baseURL} from "@/../next.config";

interface RentedApartment {
  id: number;
  apartment_id: number;
  amount: number;
  currency_code: string;
  start: string;
  end: string;
  approved: boolean;
  apartment: {
    title: string;
    description: string;
    images: Record<string, { preview_url: string }>;
    city_code: string;
    state_code: string;
    country_code: string;
  };
}

export default function RentedApartments() {
  const [rentedApartments, setRentedApartments] = useState<RentedApartment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const { isLoggedIn, token } = useSelector((state: any) => state.user);

  useEffect(() => {
    if (!isLoggedIn || !token) {
      router.push('/auth/login');
      return;
    }

    fetchRentedApartments();
  }, [isLoggedIn, token]);

  const fetchRentedApartments = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(baseURL+'/rented-apartments', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch rented apartments');
      }

      const data = await response.json();
      if (data.success) {
        setRentedApartments(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch rented apartments');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      //console.error('Error fetching rented apartments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isLoggedIn) {
    return null; // Router will handle redirect
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="text-center text-red-500">
              <h2 className="text-xl font-semibold mb-2">Error</h2>
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">My Rented Properties</CardTitle>
        </CardHeader>
      </Card>

      {rentedApartments.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-gray-500">
              <p>You haven't rented any properties yet.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rentedApartments.map((rental) => (
            <Card key={rental.id} className="overflow-hidden">
              <div className="relative h-48">
                <Image
                  src={rental.apartment.images && Object.values(rental.apartment.images)[0]?.preview_url || '/placeholder.jpg'}
                  alt={rental.apartment.title}
                  fill
                  className="object-cover"
                />
              </div>
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold mb-2">{rental.apartment.title}</h3>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-orange-500" />
                    <span className="text-sm text-gray-600">
                      {`${rental.apartment.city_code}, ${rental.apartment.state_code}`}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Banknote className="w-4 h-4 text-orange-500" />
                    <span className="text-sm text-gray-600">
                      {`${rental.currency_code} ${rental.amount}`}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-orange-500" />
                    <span className="text-sm text-gray-600">
                      From: {formatDate(rental.start)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-orange-500" />
                    <span className="text-sm text-gray-600">
                      To: {formatDate(rental.end)}
                    </span>
                  </div>

                  <Badge 
                    className={rental.approved ? 'bg-green-500' : 'bg-yellow-500'}
                  >
                    {rental.approved ? 'Approved' : 'Pending Approval'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
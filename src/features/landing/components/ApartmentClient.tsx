'use client'
import React, { useEffect, useState } from 'react';
import { Banknote, MapPin, Clock, Home, User, Building, Shield, Boxes, List } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import type { Apartment } from '@/types/apartment';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';

interface ClientProps {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function ApartmentClient({ params, searchParams }: ClientProps) {
  const router = useRouter();
  const [apartment, setApartment] = useState<Apartment | null>(null);
  const { isLoggedIn, token } = useSelector((state: any) => state.user);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [bookingData, setBookingData] = useState({
    start: '',
    end: '',
  });
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    try {
      const data = searchParams.data;
      if (data && typeof data === 'string') {
        const decodedApartment = JSON.parse(decodeURIComponent(data));
        setApartment(decodedApartment);
        setIsLoading(false);
      } else {
        fetchApartment();
      }
    } catch (error) {
      console.error('Error parsing apartment data:', error);
      fetchApartment();
    }
  }, [params.slug, searchParams]);

  const fetchApartment = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/apartments');
      const data = await response.json();
      if (data.success) {
        const apt = data.data.data.find((a: Apartment) => a.id.toString() === params.slug);
        setApartment(apt || null);
      }
    } catch (error) {
      console.error('Error fetching apartment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateEndDate = (startDate: string, duration: string): string => {
    const start = new Date(startDate);
    const durationMatch = duration.match(/(\d+)\s*(Year|Month|Week|Day)s?/i);
    
    if (!durationMatch) return startDate; 
    
    const [_, amount, unit] = durationMatch;
    const numAmount = parseInt(amount);
    
    switch(unit.toLowerCase()) {
      case 'year':
        start.setFullYear(start.getFullYear() + numAmount);
        break;
      case 'month':
        start.setMonth(start.getMonth() + numAmount);
        break;
      case 'week':
        start.setDate(start.getDate() + (numAmount * 7));
        break;
      case 'day':
        start.setDate(start.getDate() + numAmount);
        break;
    }
    
    return start.toISOString().split('T')[0];
  };
  
  
  const handleBooking = async () => {
    if (!apartment) return;
    
    if (!isLoggedIn || !token) {
      alert('Please log in to book a viewing session');
      return;
    }
  
    if (!bookingData.start) {
      alert('Please select a start date');
      return;
    }
    
    setIsBooking(true);
    try {
      const formattedStart = bookingData.start.split('T')[0]; 
      const formattedEnd = calculateEndDate(formattedStart, apartment.duration);
  
      const bookingPayload = {
        apartment_id: apartment.id,
        amount: parseInt(apartment.amount.replace(/[^0-9]/g, '')),
        currency_code: "NGN",
        start: formattedStart,
        end: formattedEnd,
        approved: true
      };
  
      console.log('Sending booking payload:', bookingPayload); 
  
      const response = await fetch('https://api.rent9ja.com.ng/api/rented-apartment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(bookingPayload),
      });
      
      if (response.ok) {
        alert('Viewing session booked successfully!');
        setBookingData({ start: '', end: '' });
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to book viewing session. Please try again.');
      }
    } catch (error) {
      console.error('Error booking viewing session:', error);
      alert('Failed to book viewing session. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!apartment) {
    return <div className="flex justify-center items-center min-h-screen">Apartment not found</div>;
  }

  return (
    <div className="w-full px-4 py-20 md:py-28">
      <Card className="w-full md:w-[90%] mx-auto border-none">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="w-full h-[300px] md:h-[400px] rounded-lg overflow-hidden">
              <Image 
                src={apartment.images && Object.values(apartment.images)[0]?.preview_url || '/placeholder.jpg'}
                alt={apartment.title}
                width={500}
                height={500}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex flex-col gap-4">
              <h1 className="text-2xl font-bold text-gray-800">{apartment.title}</h1>
              
              <div className="flex items-center gap-2">
                <User className="text-orange-500" />
                <span className="text-gray-600">Agent: {apartment.agent}</span>
              </div>

              <div className="flex items-center gap-2">
                <Building className="text-orange-500" />
                <span className="text-gray-600">Business: {apartment.business_name || 'Not specified'}</span>
              </div>

              <div className="flex items-center gap-2">
                <Boxes className="text-orange-500" />
                <span className="text-gray-600">Category: {apartment.category}</span>
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
                <Shield className="text-orange-500" />
                <span className="text-gray-600">Security Deposit: {apartment.security_deposit || 'None'}</span>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="text-orange-500" />
                <span className="text-gray-600">Duration: {apartment.duration}</span>
              </div>

              <div className="flex items-center gap-2">
                <Home className="text-orange-500" />
                <span className="text-gray-600">Rooms: {apartment.number_of_rooms}</span>
              </div>

              <div className="flex items-center gap-2">
                <List className="text-orange-500" />
                <span className="text-gray-600">Amenities: {apartment.amenities?.length ? apartment.amenities.join(', ') : 'None listed'}</span>
              </div>

              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                    Book Apartment
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Book Apartment</DialogTitle>
                  </DialogHeader>
                  {!isLoggedIn ? (
                    <div className="text-center py-4">
                      <p className="text-gray-600 mb-4">
                        Please log in to book a viewing session.
                      </p>
                      <Button 
                        onClick={() => router.push('/login')}
                        className="bg-orange-500 hover:bg-orange-600 text-white"
                      >
                        Go to Login
                      </Button>
                    </div>
                  ) : (
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <label htmlFor="start-date" className="text-sm font-medium">
                          Start Date
                        </label>
                        <Input
                          id="start-date"
                          type="date"
                          value={bookingData.start}
                          onChange={(e) => setBookingData(prev => ({ ...prev, start: e.target.value }))}
                          className="col-span-3"
                        />
                      </div>
                      
                      <div className="bg-orange-50 p-3 rounded-md mt-2">
                        <p className="text-sm text-orange-800">
                          The booking duration will be {apartment.duration} from the selected start date.
                        </p>
                      </div>

                      <Button 
                        onClick={handleBooking} 
                        disabled={isBooking || !bookingData.start}
                        className="bg-orange-500 hover:bg-orange-600 text-white w-full mt-2"
                      >
                        {isBooking ? 'Booking...' : 'Confirm Booking'}
                      </Button>
                    </div>
                  )}
                </DialogContent>
              </Dialog>

              <div className="mt-4">
                <h2 className="text-xl font-semibold mb-2">Description</h2>
                <p className="text-gray-600">{apartment.description}</p>
              </div>
            </div>
          </div>

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

          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Property Videos</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {apartment.videos && Object.values(apartment.videos).map((video, index) => (
                <div key={index} className="relative">
                  <Dialog>
                    <DialogTrigger asChild>
                      <div className="w-full h-[150px] rounded-lg overflow-hidden bg-gray-100 cursor-pointer flex items-center justify-center">
                        <div className="text-orange-500">Click to play video</div>
                      </div>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl">
                      <video 
                        controls 
                        className="w-full"
                        src={video.preview_url}
                      >
                        Your browser does not support the video tag.
                      </video>
                    </DialogContent>
                  </Dialog>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
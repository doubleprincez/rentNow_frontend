// 'use client'
// import React, { useEffect, useState } from 'react';
// import { Banknote, MapPin, Clock, Home, User } from 'lucide-react';
// import { Card, CardContent } from '@/components/ui/card';
// import type { Apartment } from '@/types/apartment';
// import Image from 'next/image';

// interface ClientProps {
//   params: { slug: string };
//   searchParams: { [key: string]: string | string[] | undefined };
// }

// export default function ApartmentClient({ params, searchParams }: ClientProps) {
//   const [apartment, setApartment] = useState<Apartment | null>(null);
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     try {
//       const data = searchParams.data;
//       if (data && typeof data === 'string') {
//         const decodedApartment = JSON.parse(decodeURIComponent(data));
//         setApartment(decodedApartment);
//         setIsLoading(false);
//       } else {
//         fetchApartment();
//       }
//     } catch (error) {
//       console.error('Error parsing apartment data:', error);
//       fetchApartment();
//     }
//   }, [params.slug, searchParams]);

//   const fetchApartment = async () => {
//     try {
//       setIsLoading(true);
//       const response = await fetch('/api/apartments');
//       const data = await response.json();
//       if (data.success) {
//         const apt = data.data.data.find((a: Apartment) => a.id.toString() === params.slug);
//         setApartment(apt || null);
//       }
//     } catch (error) {
//       console.error('Error fetching apartment:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   if (isLoading) {
//     return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
//   }

//   if (!apartment) {
//     return <div className="flex justify-center items-center min-h-screen">Apartment not found</div>;
//   }

//   return (
//     <div className="w-full px-4 py-20 md:py-28 ">
//       <Card className="w-full md:w-[90%] mx-auto border-none">
//         <CardContent className="p-6">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
//             <div className="w-full h-[300px] md:h-[400px] rounded-lg overflow-hidden">
//                 <Image 
//                     src={apartment.images && Object.values(apartment.images)[0]?.preview_url || '/placeholder.jpg'}
//                     alt={apartment.title}
//                     width={500}
//                     height={500}
//                     className="w-full h-full object-cover"
//                 />
//             </div>

//             <div className="flex flex-col gap-4">
//               <h1 className="text-2xl font-bold text-gray-800">{apartment.title}</h1>
              
//               <div className="flex items-center gap-2">
//                 <User className="text-orange-500" />
//                 <span className="text-gray-600">Agent: {apartment.agent}</span>
//               </div>

//               <div className="flex items-center gap-2">
//                 <MapPin className="text-orange-500" />
//                 <span className="text-gray-600">{`${apartment.city_code}, ${apartment.state_code}, ${apartment.country_code}`}</span>
//               </div>

//               <div className="flex items-center gap-2">
//                 <Banknote className="text-orange-500" />
//                 <span className="text-gray-600">Price: {apartment.amount}</span>
//               </div>

//               <div className="flex items-center gap-2">
//                 <Clock className="text-orange-500" />
//                 <span className="text-gray-600">Duration: {apartment.duration}</span>
//               </div>

//               <div className="flex items-center gap-2">
//                 <Home className="text-orange-500" />
//                 <span className="text-gray-600">Rooms: {apartment.number_of_rooms}</span>
//               </div>

//               <div className="mt-4">
//                 <h2 className="text-xl font-semibold mb-2">Description</h2>
//                 <p className="text-gray-600">{apartment.description}</p>
//               </div>
//             </div>
//           </div>

//           <div className="mt-8">
//             <h2 className="text-xl font-semibold mb-4">Property Images</h2>
//             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
//               {apartment.images && Object.values(apartment.images).map((image, index) => (
//                 <div key={index} className="w-full h-[150px] rounded-lg overflow-hidden">
//                   <img 
//                     src={image.preview_url}
//                     alt={`Property image ${index + 1}`}
//                     className="w-full h-full object-cover"
//                   />
//                 </div>
//               ))}
//             </div>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

'use client'
import React, { useEffect, useState } from 'react';
import { Banknote, MapPin, Clock, Home, User, Building, Shield, Boxes, List } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import type { Apartment } from '@/types/apartment';
import Image from 'next/image';

interface ClientProps {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function ApartmentClient({ params, searchParams }: ClientProps) {
  const [apartment, setApartment] = useState<Apartment | null>(null);
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

  // const handleBooking = async () => {
  //   if (!apartment) return;
    
  //   setIsBooking(true);
  //   try {
  //     const response = await fetch('https://api.rent9ja.com.ng/api/rented-apartment', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({
  //         apartment_id: apartment.id,
  //         amount: parseInt(apartment.amount.replace(/[^0-9]/g, '')),
  //         currency_code: 'NGN',
  //         start: bookingData.start,
  //         end: bookingData.end,
  //         approved: true
  //       }),
  //     });
      
  //     if (response.ok) {
  //       alert('Viewing session booked successfully!');
  //     } else {
  //       alert('Failed to book viewing session. Please try again.');
  //     }
  //   } catch (error) {
  //     console.error('Error booking viewing session:', error);
  //     alert('Failed to book viewing session. Please try again.');
  //   } finally {
  //     setIsBooking(false);
  //   }
  // };

  const handleBooking = async () => {
    if (!apartment) return;
    
    setIsBooking(true);
    try {
      const bookingPayload = {
        apartment_id: apartment.id,
        amount: parseInt(apartment.amount.replace(/[^0-9]/g, '')),
        currency_code: "NGN",
        start: "string", // Using static "string" as specified
        end: "string",   // Using static "string" as specified
        approved: true
      };
  
      const response = await fetch('https://api.rent9ja.com.ng/api/rented-apartment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingPayload),
      });
      
      if (response.ok) {
        alert('Viewing session booked successfully!');
      } else {
        alert('Failed to book viewing session. Please try again.');
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

              {/* <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                    Book Viewing Session
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Book a Viewing Session</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <label>Start Date</label>
                      <Input
                        type="datetime-local"
                        value={bookingData.start}
                        onChange={(e) => setBookingData(prev => ({ ...prev, start: e.target.value }))}
                      />
                    </div>
                    <div className="grid gap-2">
                      <label>End Date</label>
                      <Input
                        type="datetime-local"
                        value={bookingData.end}
                        onChange={(e) => setBookingData(prev => ({ ...prev, end: e.target.value }))}
                      />
                    </div>
                    <Button 
                      onClick={handleBooking} 
                      disabled={isBooking}
                      className="bg-orange-500 hover:bg-orange-600 text-white"
                    >
                      {isBooking ? 'Booking...' : 'Confirm Booking'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog> */}

              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                    Book Viewing Session
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Book a Viewing Session</DialogTitle>
                  </DialogHeader>
                  <div className="py-4">
                    <p className="text-gray-600 mb-4">
                      Click confirm to book a viewing session for this apartment.
                    </p>
                    <Button 
                      onClick={handleBooking} 
                      disabled={isBooking}
                      className="bg-orange-500 hover:bg-orange-600 text-white w-full"
                    >
                      {isBooking ? 'Booking...' : 'Confirm Booking'}
                    </Button>
                  </div>
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
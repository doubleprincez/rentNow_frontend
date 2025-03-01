'use client'
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useAlert } from '@/contexts/AlertContext';
import { Loader2 } from 'lucide-react';
import {baseURL} from "@/../next.config";

interface Apartment {
  id: number;
  title: string;
  category: {
    id: number;
    title: string;
  };
  description: string;
  number_of_rooms: number;
  amount: number;
  currency_code: string;
  security_deposit: number;
  duration: number;
  duration_type: string;
  amenities: string[];
  country_code: string;
  state_code: string;
  city_code: string;
  published: boolean;
  can_rate: boolean;
  images: string[];
  videos: string[];
}

interface ApiResponse {
  success: boolean;
  data: Apartment[];
}

const AdminApartments: React.FC = () => {
  const { showAlert } = useAlert();
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [selectedApartment, setSelectedApartment] = useState<Apartment | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAuthToken = (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  };

  const fetchApartments = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await axios.get<ApiResponse>(
        baseURL+'/apartments',
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
          withCredentials: true
        }
      );

      if (response.data.success && Array.isArray(response.data.data)) {
        setApartments(response.data.data);
      } else {
        throw new Error('Invalid data format received from server');
      }
    } catch (error) {
      let errorMessage = 'Failed to fetch apartments';
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || errorMessage;
      }
      setError(errorMessage);
      showAlert(errorMessage, 'error');
      setApartments([]); // Ensure apartments is always an array
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApartments();
  }, []);

  const handleApartmentClick = (apartment: Apartment) => {
    setSelectedApartment(apartment);
    setIsDialogOpen(true);
  };

  const handleUpdateStatus = async (id: number, published: boolean, canRate: boolean) => {
    setIsUpdating(true);
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await axios.put<ApiResponse>(
        baseURL+`/apartment/${id}`,
        {
          published,
          can_rate: canRate
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
          withCredentials: true
        }
      );

      if (response.data.success) {
        showAlert('Apartment status updated successfully', 'success');
        setApartments(prev => prev.map(apt => 
          apt.id === id ? { ...apt, published, can_rate: canRate } : apt
        ));
        if (selectedApartment?.id === id) {
          setSelectedApartment(prev => prev ? { ...prev, published, can_rate: canRate } : null);
        }
      } else {
        throw new Error('Failed to update apartment status');
      }
    } catch (error) {
      let errorMessage = 'Failed to update apartment status';
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || errorMessage;
      }
      showAlert(errorMessage, 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="text-center text-red-600">
          <p>{error}</p>
          <button 
            onClick={fetchApartments}
            className="mt-4 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold mb-6">Manage Apartments</h1>
      
      {apartments.length === 0 ? (
        <div className="text-center text-gray-600">
          <p>No apartments found</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>State</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Rooms</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reviews</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {apartments.map((apartment) => (
                <TableRow 
                  key={apartment.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleApartmentClick(apartment)}
                >
                  <TableCell>{apartment.title}</TableCell>
                  <TableCell>{apartment.category.title}</TableCell>
                  <TableCell>{apartment.state_code}</TableCell>
                  <TableCell>{apartment.country_code}</TableCell>
                  <TableCell>{apartment.number_of_rooms}</TableCell>
                  <TableCell>
                    <Checkbox
                      checked={apartment.published}
                      onCheckedChange={(checked) => {
                        handleUpdateStatus(apartment.id, checked as boolean, apartment.can_rate);
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </TableCell>
                  <TableCell>
                    <Checkbox
                      checked={apartment.can_rate}
                      onCheckedChange={(checked) => {
                        handleUpdateStatus(apartment.id, apartment.published, checked as boolean);
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          {selectedApartment && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedApartment.title}</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold">Basic Information</h3>
                    <p>Category: {selectedApartment.category.title}</p>
                    <p>Rooms: {selectedApartment.number_of_rooms}</p>
                    <p>Price: {selectedApartment.amount} {selectedApartment.currency_code}</p>
                    <p>Security Deposit: {selectedApartment.security_deposit}</p>
                    <p>Duration: {selectedApartment.duration} {selectedApartment.duration_type}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold">Location</h3>
                    <p>Country: {selectedApartment.country_code}</p>
                    <p>State: {selectedApartment.state_code}</p>
                    <p>City: {selectedApartment.city_code}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold">Description</h3>
                  <p className="whitespace-pre-wrap">{selectedApartment.description}</p>
                </div>

                <div>
                  <h3 className="font-semibold">Amenities</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedApartment.amenities.map((amenity, index) => (
                      <span 
                        key={index}
                        className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-sm"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold">Images</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                    {selectedApartment.images.map((image, index) => (
                      <img 
                        key={index}
                        src={image}
                        alt={`Property ${index + 1}`}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold">Videos</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                    {selectedApartment.videos.map((video, index) => (
                      <video 
                        key={index}
                        src={video}
                        controls
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-6 pt-4 border-t">
                  <label className="flex items-center space-x-2">
                    <Checkbox
                      checked={selectedApartment.published}
                      onCheckedChange={(checked) => {
                        handleUpdateStatus(
                          selectedApartment.id,
                          checked as boolean,
                          selectedApartment.can_rate
                        );
                      }}
                      disabled={isUpdating}
                    />
                    <span>Published</span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <Checkbox
                      checked={selectedApartment.can_rate}
                      onCheckedChange={(checked) => {
                        handleUpdateStatus(
                          selectedApartment.id,
                          selectedApartment.published,
                          checked as boolean
                        );
                      }}
                      disabled={isUpdating}
                    />
                    <span>Allow Reviews</span>
                  </label>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminApartments;
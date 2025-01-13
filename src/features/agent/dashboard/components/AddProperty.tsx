'use client';
import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import axios from 'axios';
import { Image } from 'lucide-react';
import { useFormContext } from 'react-hook-form';

interface PropertyFormData {
  propertyName: string;
  propertyType: string;
  address: string;
  numberOfRooms: number;
  amenities: string;
  monthlyRent: number;
  securityDeposit?: number;
  description: string;
  images: FileList | null;
  images1: FileList | null;
  images2: FileList | null;
  images3: FileList | null;
  images4: FileList | null;
  availabilityStatus: string;
}

const AddProperty: React.FC = () => {
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<PropertyFormData>();

    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    //const { register } = useFormContext<PropertyFormData>();
    const imageFields: (keyof PropertyFormData)[] = ['images', 'images1', 'images2', 'images3', 'images4'];

    const onSubmit: SubmitHandler<PropertyFormData> = async (data: any) => {
        setIsLoading(true);
        setMessage(null);
    
        const formData = new FormData();
        formData.append('propertyName', data.propertyName);
        formData.append('propertyType', data.propertyType);
        formData.append('address', data.address);
        formData.append('numberOfRooms', data.numberOfRooms.toString());
        formData.append('amenities', data.amenities);
        formData.append('monthlyRent', data.monthlyRent.toString());
    
        if (data.securityDeposit) {
            formData.append('securityDeposit', data.securityDeposit.toString());
        }
    
        formData.append('description', data.description);
        formData.append('availabilityStatus', data.availabilityStatus);
    
        // Append all images
        const imageFields = ['images', 'images1', 'images2', 'images3', 'images4'];
        imageFields.forEach((field: any) => {
            if (data[field]) {
                Array.from(data[field]).forEach((image: any) => {
                    formData.append(field, image);
                });
            }
        });
    
        try {
            const response = await axios.post('/api/agents/properties', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
    
            if (response.status === 201) {
                setMessage('Property successfully added!');
            }
        } catch (error) {
            setMessage('Failed to add property. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };
    

  return (
    <div className=" w-full flex flex-col px-2 md:px-6 py-2 md:py-6 gap-2 md:gap-4">
        <h1 className='text-black/80 text-[1.5rem] font-semibold'>Add New Property</h1>
        {message && (
            <p
            className={`mb-4 text-center ${
                message.includes('successfully') ? 'text-green-500' : 'text-red-500'
            }`}
            >
            {message}
            </p>
        )}

        <form onSubmit={handleSubmit(onSubmit)} 
        className="w-full flex flex-col h-auto bg-black/80 rounded-xl shadow-md shadow-orange-600 items-center p-4 gap-1 space-y-6"
        >
            <div className='w-full grid grid-cols-1 sml:grid-cols-2 gap-2 md:gap-4'>
                <div className='w-full'>
                    <label className="block text-sm font-semibold mb-2 text-white">Property Name</label>
                    <input
                        type="text"
                        {...register('propertyName', { required: 'Property name is required' })}
                        className="text-[.8em] w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="Enter property name"
                    />
                    {errors.propertyName && <p className="text-red-500 text-sm">{errors.propertyName.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-semibold text-white mb-2">Property Type</label>
                    <select
                        {...register('propertyType', { required: 'Property type is required' })}
                        className="text-[.8em] w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                        <option value="">Select a type</option>
                        <option value="House">House</option>
                        <option value="Apartment">Apartment</option>
                        <option value="Studio">Studio</option>
                    </select>
                    {errors.propertyType && <p className="text-red-500 text-sm">{errors.propertyType.message}</p>}
                </div>
            </div>

            <div className='w-full grid grid-cols-1 sml:grid-cols-3 gap-2 md:gap-4'>
                <div>
                    <label className="text-white block text-sm font-semibold mb-2">Address</label>
                    <input
                        type="text"
                        {...register('address', { required: 'Address is required' })}
                        className="text-[.8em] w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="Enter property address"
                    />
                    {errors.address && <p className="text-red-500 text-sm">{errors.address.message}</p>}
                </div>

                <div>
                    <label className="text-white block text-sm font-semibold mb-2">Number of Rooms</label>
                    <input
                        type="number"
                        {...register('numberOfRooms', { required: 'Number of rooms is required', min: 1 })}
                        className="text-[.8em] w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="Enter number of rooms"
                    />
                    {errors.numberOfRooms && <p className="text-red-500 text-sm">{errors.numberOfRooms.message}</p>}
                </div>

                <div>
                    <label className="text-white block text-sm font-semibold mb-2">Amenities</label>
                    <input
                        type="text"
                        {...register('amenities')}
                        className="text-[.8em] w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="WiFi, Parking, etc."
                    />
                </div>
            </div>

            <div className='w-full grid grid-cols-1 sml:grid-cols-3 gap-2 md:gap-4'>
                <div>
                    <label className="text-white block text-sm font-semibold mb-2">Monthly Rent</label>
                    <input
                        type="number"
                        {...register('monthlyRent', { required: 'Monthly rent is required', min: 0 })}
                        className="text-[.8em] w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="Enter rent price"
                    />
                    {errors.monthlyRent && <p className="text-red-500 text-sm">{errors.monthlyRent.message}</p>}
                </div>

                <div>
                    <label className="text-white block text-sm font-semibold mb-2">Security Deposit (optional)</label>
                    <input
                        type="number"
                        {...register('securityDeposit')}
                        className="text-[.8em] w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="Enter security deposit"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold mb-2 text-white">Availability Status</label>
                    <select
                        {...register('availabilityStatus', { required: 'Availability status is required' })}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                        <option value="Available">Available</option>
                        <option value="Occupied">Occupied</option>
                    </select>
                    {errors.availabilityStatus && <p className="text-red-500 text-sm">{errors.availabilityStatus.message}</p>}
                </div>
            </div>

            <div className='w-full'>
                <label className="text-white block text-sm font-semibold mb-2">Description</label>
                <textarea
                    {...register('description', { required: 'Description is required' })}
                    className="text-[.8em] w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Enter property description"
                ></textarea>
                {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
            </div>

            <div>
                <label className="block text-sm font-semibold mb-2 text-white">Images</label>
                <div className="flex space-x-4">
                    {imageFields.map((field) => (
                    <div key={field} className="relative group">
                        <input
                        type="file"
                        multiple
                        {...register(field)}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        <div className="w-24 h-24 border-2 border-gray-300 border-dashed flex items-center justify-center rounded-lg bg-gray-100 group-hover:border-orange-500 transition-all">
                            <Image className="text-gray-400 w-8 h-8 group-hover:text-orange-500" />
                        </div>
                    </div>
                    ))}
                </div>
            </div>

            <button
            type="submit"
            className="w-full md:w-[400px] mx-auto bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 disabled:opacity-50"
            disabled={isLoading}
            >
                {isLoading ? 'Uploading...' : 'Upload Property'}
            </button>
        </form>
    </div>
  );
};

export default AddProperty;

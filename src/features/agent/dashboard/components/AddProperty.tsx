'use client';
import React, { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import axios from 'axios';
import { Image, Video, X } from 'lucide-react';
import { useAlert } from '@/contexts/AlertContext'; 

interface PropertyFormData {
  category_id: number;
  title: string;
  description: string | null;
  number_of_rooms: number | null;
  amount: number;
  currency_code: string;
  security_deposit: number | null;
  security_deposit_currency_code: string | null;
  duration: number;
  duration_type: 'day' | 'week' | 'month' | 'year';
  amenities: string[];
  country_code: string;
  state_code: string;
  city_code: string;
  published: boolean;
  can_rate: boolean;
  image1: File | null;
  image2: File | null;
  image3: File | null;
  image4: File | null;
  image5: File | null;
  video1: File | null;
  video2: File | null;
  video3: File | null;
  video4: File | null;
  video5: File | null;
}

interface Category {
  id: number;
  title: string;
  slug: string;
}

const MAX_IMAGE_SIZE = 3 * 1024 * 1024; // 3MB
const MAX_VIDEO_SIZE = 10 * 1024 * 1024; // 10MB

const AddProperty: React.FC = () => {
    const { showAlert } = useAlert();
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [imagePreview, setImagePreview] = useState<{ [key: string]: string }>({});
    const [videoPreview, setVideoPreview] = useState<{ [key: string]: string }>({});
  
    const {
      register,
      handleSubmit,
      formState: { errors },
      setValue,
      watch,
    } = useForm<PropertyFormData>();
  
    const imageFields = ['image1', 'image2', 'image3', 'image4', 'image5'];
    const videoFields = ['video1', 'video2', 'video3', 'video4', 'video5'];
  
    // Get the token from localStorage
    const getAuthToken = () => {
      if (typeof window !== 'undefined') {
        return localStorage.getItem('token');
      }
      return null;
    };
  
    // Configure axios with authentication
    const axiosConfig = {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Accept': 'application/json',
      }
    };
  
    useEffect(() => {
      const fetchCategories = async () => {
        try {
          const response = await axios.get(
            'https://api.rent9ja.com.ng/api/apartment-types',
            axiosConfig
          );
          if (response.data.success) {
            setCategories(response.data.data);
          }
        } catch (error: any) {
          if (error.response?.status === 401) {
            showAlert('Please login to continue', 'error');
            // Optionally redirect to login page
            // window.location.href = '/login';
          } else {
            console.error('Error fetching categories:', error);
          }
        }
      };
  
      fetchCategories();
    }, []);

  const handleFileChange = (fieldName: string, type: 'image' | 'video') => async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const maxSize = type === 'image' ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE;
    if (file.size > maxSize) {
        showAlert(`File ${file.name} exceeds maximum size limit of ${maxSize / (1024 * 1024)}MB`, 'error');
      return;
    }

    setValue(fieldName as any, file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === 'image') {
        setImagePreview(prev => ({ ...prev, [fieldName]: reader.result as string }));
      } else {
        setVideoPreview(prev => ({ ...prev, [fieldName]: URL.createObjectURL(file) }));
      }
    };
    reader.readAsDataURL(file);
  };

  const removeFile = (fieldName: string, type: 'image' | 'video') => {
    setValue(fieldName as any, null);
    if (type === 'image') {
      setImagePreview(prev => {
        const newPreview = { ...prev };
        delete newPreview[fieldName];
        return newPreview;
      });
    } else {
      setVideoPreview(prev => {
        const newPreview = { ...prev };
        delete newPreview[fieldName];
        return newPreview;
      });
    }
  };

  const onSubmit: SubmitHandler<PropertyFormData> = async (data) => {
    setIsLoading(true);
    setMessage(null);

    const formData = new FormData();
    
    // Append all form fields
    Object.entries(data).forEach(([key, value]) => {
      if (value instanceof File) {
        formData.append(key, value);
      } else if (key === 'amenities') {
        formData.append(key, JSON.stringify(value));
      } else if (value !== null && value !== undefined) {
        formData.append(key, value.toString());
      }
    });

    try {
      const token = getAuthToken();
      if (!token) {
        showAlert('Please login to add a property', 'error');
        setIsLoading(false);
        return;
      }

      const response = await axios.post(
        'https://api.rent9ja.com.ng/api/apartment', 
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'multipart/form-data'
          },
        }
      );

      if (response.data.success) {
        showAlert('Property successfully added!', 'success');
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        showAlert('Your session has expired. Please login again.', 'error');
        // Optionally redirect to login page
        // window.location.href = '/login';
      } else {
        showAlert(error.response?.data?.message || 'Failed to add property. Please try again.', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col px-2 md:px-6 py-2 md:py-6 gap-2 md:gap-4">
      <h1 className="text-black/80 text-[1.5rem] font-semibold">Add New Property</h1>
      {message && (
        <p className={`mb-4 text-center ${message.includes('successfully') ? 'text-green-500' : 'text-red-500'}`}>
          {message}
        </p>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col gap-6 bg-black/80 rounded-xl shadow-md shadow-orange-600 p-4">
        {/* Category Selection */}
        <div>
          <label className="block text-sm font-semibold mb-2 text-white">Property Category</label>
          <select
            {...register('category_id', { required: 'Category is required' })}
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
          >
            <option value="">Select Category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.title}
              </option>
            ))}
          </select>
          {errors.category_id && <p className="text-red-500 text-sm">{errors.category_id.message}</p>}
        </div>

        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2 text-white">Title</label>
            <input
              {...register('title', { required: 'Title is required' })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
            />
            {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-white">Number of Rooms</label>
            <input
              type="number"
              {...register('number_of_rooms')}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
            />
          </div>
        </div>

        {/* Price Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2 text-white">Amount</label>
            <input
              type="number"
              {...register('amount', { required: 'Amount is required' })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-white">Currency Code</label>
            <input
              {...register('currency_code', { required: 'Currency code is required' })}
              defaultValue="NGN"
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-white">Security Deposit</label>
            <input
              type="number"
              {...register('security_deposit')}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
            />
          </div>
        </div>

        {/* Duration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2 text-white">Duration</label>
            <input
              type="number"
              {...register('duration', { required: 'Duration is required' })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-white">Duration Type</label>
            <select
              {...register('duration_type', { required: 'Duration type is required' })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
            >
              <option value="day">Day</option>
              <option value="week">Week</option>
              <option value="month">Month</option>
              <option value="year">Year</option>
            </select>
          </div>
        </div>

        {/* Location */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2 text-white">Country Code</label>
            <input
              {...register('country_code', { required: 'Country code is required' })}
              defaultValue="NG"
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-white">State Code</label>
            <input
              {...register('state_code', { required: 'State code is required' })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-white">City Code</label>
            <input
              {...register('city_code', { required: 'City code is required' })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
            />
          </div>
        </div>

        {/* Description and Amenities */}
        <div>
          <label className="block text-sm font-semibold mb-2 text-white">Description</label>
          <textarea
            {...register('description')}
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
            rows={4}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2 text-white">Amenities (comma-separated)</label>
          <input
            {...register('amenities')}
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
            placeholder="WiFi, Parking, Air Conditioning"
          />
        </div>

         {/* Updated File Upload Section */}
      <div className="grid grid-cols-1 gap-6">
        <div>
          <label className="block text-sm font-semibold mb-2 text-white">Images (Max 5, each &lt;3MB)</label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {imageFields.map((field) => (
              <div key={field} className="relative group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange(field, 'image')}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                />
                <div className="w-full aspect-square border-2 border-gray-300 border-dashed flex items-center justify-center rounded-lg bg-gray-100 group-hover:border-orange-500 transition-all relative">
                  {imagePreview[field] ? (
                    <>
                      <img src={imagePreview[field]} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                      <button
                        type="button"
                        onClick={() => removeFile(field, 'image')}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <Image className="text-gray-400 w-8 h-8 group-hover:text-orange-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2 text-white">Videos (Max 5, each &lt;10MB)</label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {videoFields.map((field) => (
              <div key={field} className="relative group">
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange(field, 'video')}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                />
                <div className="w-full aspect-square border-2 border-gray-300 border-dashed flex items-center justify-center rounded-lg bg-gray-100 group-hover:border-orange-500 transition-all relative">
                  {videoPreview[field] ? (
                    <>
                      <video src={videoPreview[field]} className="w-full h-full object-cover rounded-lg" />
                      <button
                        type="button"
                        onClick={() => removeFile(field, 'video')}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <Video className="text-gray-400 w-8 h-8 group-hover:text-orange-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

        {/* Settings */}
        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-white">
            <input type="checkbox" {...register('published')} />
            Published
          </label>

          <label className="flex items-center gap-2 text-white">
            <input type="checkbox" {...register('can_rate')} />
            Allow Ratings
          </label>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full md:w-[400px] mx-auto bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 disabled:opacity-50"
        >
          {isLoading ? 'Uploading...' : 'Add Property'}
        </button>
      </form>
    </div>
  );
};

export default AddProperty;


// 'use client';
// import React, { useState, useEffect } from 'react';
// import { useForm, SubmitHandler } from 'react-hook-form';
// import axios from 'axios';
// import { Image, Video } from 'lucide-react';
// import { z } from 'zod';

// interfe Category {
//   id: number;
//   title: string;
//   slug: string;
// }

// interface PropertyFormData {
//   category_id: number;
//   title: string;
//   description: string | null;
//   number_of_rooms: number | null;
//   amount: number;
//   currency_code: string;
//   security_deposit: number | null;
//   security_deposit_currency_code: string | null;
//   duration: number;
//   duration_type: 'day' | 'week' | 'month' | 'year';
//   amenities: string[];
//   country_code: string;
//   state_code: string;
//   city_code: string;
//   published: boolean;
//   can_rate: boolean;
//   images: FileList | null;
//   videos: FileList | null;
// }

// const MAX_IMAGE_SIZE = 3 * 1024 * 1024; // 3MB in bytes
// const MAX_VIDEO_SIZE = 10 * 1024 * 1024; // 10MB in bytes

// const AddProperty: React.FC = () => {
//   const [categories, setCategories] = useState<Category[]>([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [message, setMessage] = useState<string | null>(null);

//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//     watch,
//   } = useForm<PropertyFormData>();

//   useEffect(() => {
//     const fetchCategories = async () => {
//       try {
//         const response = await axios.get('https://api.rent9ja.com.ng/api/apartment-types');
//         if (response.data.success) {
//           setCategories(response.data.data);
//         }
//       } catch (error) {
//         console.error('Error fetching categories:', error);
//       }
//     };

//     fetchCategories();
//   }, []);

//   const validateFiles = (files: FileList | null, maxSize: number, type: 'image' | 'video'): boolean => {
//     if (!files) return true;
    
//     for (let i = 0; i < files.length; i++) {
//       const file = files[i];
//       if (file.size > maxSize) {
//         setMessage(`${type === 'image' ? 'Image' : 'Video'} ${file.name} exceeds maximum size limit`);
//         return false;
//       }
//       if (type === 'image' && !file.type.startsWith('image/')) {
//         setMessage(`${file.name} is not a valid image file`);
//         return false;
//       }
//       if (type === 'video' && !file.type.startsWith('video/')) {
//         setMessage(`${file.name} is not a valid video file`);
//         return false;
//       }
//     }
//     return true;
//   };

//   const onSubmit: SubmitHandler<PropertyFormData> = async (data) => {
//     setIsLoading(true);
//     setMessage(null);

//     if (!validateFiles(data.images, MAX_IMAGE_SIZE, 'image') || 
//         !validateFiles(data.videos, MAX_VIDEO_SIZE, 'video')) {
//       setIsLoading(false);
//       return;
//     }

//     const formData = new FormData();
    
//     // Append all form fields
//     Object.entries(data).forEach(([key, value]) => {
//       if (key === 'images' || key === 'videos') {
//         if (value) {
//           Array.from(value).forEach((file: any, index) => {
//             formData.append(`${key}[${index}]`, file);
//           });
//         }
//       } else if (key === 'amenities') {
//         formData.append(key, JSON.stringify(value));
//       } else if (value !== null && value !== undefined) {
//         formData.append(key, value.toString());
//       }
//     });

//     try {
//       const response = await axios.post('https://api.rent9ja.com.ng/api/apartment', formData, {
//         headers: { 'Content-Type': 'multipart/form-data' },
//       });

//       if (response.data.success) {
//         setMessage('Property successfully added!');
//       }
//     } catch (error: any) {
//       setMessage(error.response?.data?.message || 'Failed to add property. Please try again.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="w-full flex flex-col px-2 md:px-6 py-2 md:py-6 gap-2 md:gap-4">
//       <h1 className="text-black/80 text-[1.5rem] font-semibold">Add New Property</h1>
//       {message && (
//         <p className={`mb-4 text-center ${message.includes('successfully') ? 'text-green-500' : 'text-red-500'}`}>
//           {message}
//         </p>
//       )}

//       <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col gap-6 bg-black/80 rounded-xl shadow-md shadow-orange-600 p-4">
//         {/* Category Selection */}
//         <div>
//           <label className="block text-sm font-semibold mb-2 text-white">Property Category</label>
//           <select
//             {...register('category_id', { required: 'Category is required' })}
//             className="w-full border border-gray-300 rounded-lg px-4 py-2"
//           >
//             <option value="">Select Category</option>
//             {categories.map((category) => (
//               <option key={category.id} value={category.id}>
//                 {category.title}
//               </option>
//             ))}
//           </select>
//           {errors.category_id && <p className="text-red-500 text-sm">{errors.category_id.message}</p>}
//         </div>

//         {/* Basic Information */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div>
//             <label className="block text-sm font-semibold mb-2 text-white">Title</label>
//             <input
//               {...register('title', { required: 'Title is required' })}
//               className="w-full border border-gray-300 rounded-lg px-4 py-2"
//             />
//             {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
//           </div>

//           <div>
//             <label className="block text-sm font-semibold mb-2 text-white">Number of Rooms</label>
//             <input
//               type="number"
//               {...register('number_of_rooms')}
//               className="w-full border border-gray-300 rounded-lg px-4 py-2"
//             />
//           </div>
//         </div>

//         {/* Price Information */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           <div>
//             <label className="block text-sm font-semibold mb-2 text-white">Amount</label>
//             <input
//               type="number"
//               {...register('amount', { required: 'Amount is required' })}
//               className="w-full border border-gray-300 rounded-lg px-4 py-2"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-semibold mb-2 text-white">Currency Code</label>
//             <input
//               {...register('currency_code', { required: 'Currency code is required' })}
//               defaultValue="NGN"
//               className="w-full border border-gray-300 rounded-lg px-4 py-2"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-semibold mb-2 text-white">Security Deposit</label>
//             <input
//               type="number"
//               {...register('security_deposit')}
//               className="w-full border border-gray-300 rounded-lg px-4 py-2"
//             />
//           </div>
//         </div>

//         {/* Duration */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div>
//             <label className="block text-sm font-semibold mb-2 text-white">Duration</label>
//             <input
//               type="number"
//               {...register('duration', { required: 'Duration is required' })}
//               className="w-full border border-gray-300 rounded-lg px-4 py-2"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-semibold mb-2 text-white">Duration Type</label>
//             <select
//               {...register('duration_type', { required: 'Duration type is required' })}
//               className="w-full border border-gray-300 rounded-lg px-4 py-2"
//             >
//               <option value="day">Day</option>
//               <option value="week">Week</option>
//               <option value="month">Month</option>
//               <option value="year">Year</option>
//             </select>
//           </div>
//         </div>

//         {/* Location */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           <div>
//             <label className="block text-sm font-semibold mb-2 text-white">Country Code</label>
//             <input
//               {...register('country_code', { required: 'Country code is required' })}
//               defaultValue="NG"
//               className="w-full border border-gray-300 rounded-lg px-4 py-2"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-semibold mb-2 text-white">State Code</label>
//             <input
//               {...register('state_code', { required: 'State code is required' })}
//               className="w-full border border-gray-300 rounded-lg px-4 py-2"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-semibold mb-2 text-white">City Code</label>
//             <input
//               {...register('city_code', { required: 'City code is required' })}
//               className="w-full border border-gray-300 rounded-lg px-4 py-2"
//             />
//           </div>
//         </div>

//         {/* Description and Amenities */}
//         <div>
//           <label className="block text-sm font-semibold mb-2 text-white">Description</label>
//           <textarea
//             {...register('description')}
//             className="w-full border border-gray-300 rounded-lg px-4 py-2"
//             rows={4}
//           />
//         </div>

//         <div>
//           <label className="block text-sm font-semibold mb-2 text-white">Amenities (comma-separated)</label>
//           <input
//             {...register('amenities')}
//             className="w-full border border-gray-300 rounded-lg px-4 py-2"
//             placeholder="WiFi, Parking, Air Conditioning"
//           />
//         </div>

//         {/* File Uploads */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div>
//             <label className="block text-sm font-semibold mb-2 text-white">
//               Images (Max 5, each &lt;3MB)
//             </label>
//             <input
//               type="file"
//               multiple
//               accept="image/*"
//               {...register('images')}
//               className="w-full text-white"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-semibold mb-2 text-white">
//               Videos (Max 5, each &lt;10MB)
//             </label>
//             <input
//               type="file"
//               multiple
//               accept="video/*"
//               {...register('videos')}
//               className="w-full text-white"
//             />
//           </div>
//         </div>

//         {/* Settings */}
//         <div className="flex gap-4">
//           <label className="flex items-center gap-2 text-white">
//             <input type="checkbox" {...register('published')} />
//             Published
//           </label>

//           <label className="flex items-center gap-2 text-white">
//             <input type="checkbox" {...register('can_rate')} />
//             Allow Ratings
//           </label>
//         </div>

//         <button
//           type="submit"
//           disabled={isLoading}
//           className="w-full md:w-[400px] mx-auto bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 disabled:opacity-50"
//         >
//           {isLoading ? 'Uploading...' : 'Add Property'}
//         </button>
//       </form>
//     </div>
//   );
// };

// export default AddProperty;

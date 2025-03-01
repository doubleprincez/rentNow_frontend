'use client'
import React, {useCallback, useEffect, useState} from 'react';
import {useForm} from 'react-hook-form';
import axios from 'axios';
import {useAlert} from '@/contexts/AlertContext';
// import Dropzone from 'react-dropzone-uploader';
import {baseURL} from "@/../next.config";
import {useDropzone} from "react-dropzone";


interface Category {
    id: number;
    title: string;
    slug: string;
}

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
    images: File[] | null;
    videos: File[] | null;
}

type FileType = 'image' | 'video';
type PreviewMap = { [key: number]: string };

const AVAILABLE_AMENITIES = [
    'WiFi', 'Parking', 'Air Conditioning', 'Swimming Pool', 'Gym',
    'Security', 'Furnished', 'Balcony', 'Garden', 'Pet Friendly',
    'Elevator', 'CCTV', 'Generator', 'Water Supply', 'Kitchen'
];

const MAX_FILES = 5;
const MAX_IMAGE_SIZE = 30 * 1024 * 1024;
const MAX_VIDEO_SIZE = 80 * 1024 * 1024;

const AddProperty: React.FC = () => {
    const {showAlert} = useAlert();
    const [step, setStep] = useState<number>(1);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [imagePreview, setImagePreview] = useState<PreviewMap>({});
    const [videoPreview, setVideoPreview] = useState<PreviewMap>({});
    const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
    const [uploadedImages, setUploadedImages] = useState<File[]>([]);
    const [uploadedVideos, setUploadedVideos] = useState<File[]>([]);

    const {
        register,
        handleSubmit,
        formState: {errors},
        setValue,
        watch,
        trigger
    } = useForm<PropertyFormData>({
        defaultValues: {
            amenities: [],
            currency_code: '₦',
            country_code: 'Nigeria',
            images: [],
            videos: []
        }
    });

    const handleAmenityToggle = (amenity: string) => {
        setSelectedAmenities(prev => {
            const newAmenities = prev.includes(amenity)
                ? prev.filter(a => a !== amenity)
                : [...prev, amenity];
            setValue('amenities', newAmenities);
            return newAmenities;
        });
    };

    const getAuthToken = (): string | null => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('agentToken');
        }
        return null;
    };

    useEffect(() => {
        const fetchCategories = async (): Promise<void> => {
            try {
                const response = await axios.get<{ success: boolean; data: Category[] }>(
                    baseURL + '/apartment-types',
                    {
                        headers: {
                            'Authorization': `Bearer ${getAuthToken()}`,
                            'Accept': 'application/json',
                        },
                        withCredentials: true
                    }
                );
                if (response.data.success) {
                    setCategories(response.data.data);
                }
            } catch (error) {
                if (axios.isAxiosError(error) && error.response?.status === 401) {
                    showAlert('Please login to continue', 'error');
                }
            }
        };

        fetchCategories();
    }, []);


    const onDropImages = useCallback(
        (acceptedFiles: File[]) => {
            if (uploadedImages.length >= MAX_FILES) return; // Prevent exceeding limit
            const newFiles = [...uploadedImages, ...acceptedFiles].slice(0, MAX_FILES);
            setUploadedImages(newFiles);
            setValue("images", newFiles);
        },
        [uploadedImages, setValue]
    );
    const onDropVideos = useCallback(
        (acceptedFiles: File[]) => {
            if (uploadedVideos.length >= MAX_FILES) return; // Prevent exceeding limit
            const newFiles = [...uploadedVideos, ...acceptedFiles].slice(0, MAX_FILES);
            setUploadedVideos(newFiles);
            setValue("videos", newFiles);
        },
        [uploadedVideos, setValue]
    );


    const removeImage = (index: number) => {
        const updatedFiles = uploadedImages.filter((_, i) => i !== index);
        setUploadedImages(updatedFiles);
        setValue("images", updatedFiles);
    };

    const removeVideo = (index: number) => {
        const updatedFiles = uploadedVideos.filter((_, i) => i !== index);
        setUploadedVideos(updatedFiles);
        setValue("videos", updatedFiles);
    };


    const {getRootProps: getImageRootProps, getInputProps: getImageInputProps} =
        useDropzone({
            accept: {"image/*": []},
            onDrop: onDropImages,
        });

    const {getRootProps: getVideoRootProps, getInputProps: getVideoInputProps} =
        useDropzone({
            accept: {"video/*": []},
            onDrop: onDropVideos,
        });


    const validateStep = async (): Promise<boolean> => {
        let fieldsToValidate: Array<keyof PropertyFormData> = [];
        switch (step) {
            case 1:
                fieldsToValidate = ['category_id', 'title', 'number_of_rooms', 'description'];
                break;
            case 2:
                fieldsToValidate = ['amount', 'currency_code', 'security_deposit'];
                break;
            case 3:
                fieldsToValidate = ['duration', 'duration_type', 'amenities'];
                break;
            case 4:
                fieldsToValidate = ['country_code', 'state_code', 'city_code'];
                break;
            case 5:
                // const images = watch('images');
                // const videos = watch('videos');
                // const hasImage = images.some(file => file !== null);
                // const hasVideo = videos.some(file => file !== null);
                //
                // if (!hasImage) {
                //     showAlert('Please upload at least one image', 'info');
                //     return false;
                // }
                // if (!hasVideo) {
                //     showAlert('Please upload at least one video', 'info');
                //     return false;
                // }
                if(!uploadedImages || !uploadedVideos){
                    return false;
                }
                return true;
        }

        return await trigger(fieldsToValidate);
    };

    const nextStep = async (): Promise<void> => {
        const isValid = await validateStep();
        if (isValid) {
            setStep(current => Math.min(current + 1, 5));
        }
    };

    const prevStep = (): void => {
        setStep(current => Math.max(current - 1, 1));
    };

    const onSubmit = async (data: PropertyFormData) => {
        if (step !== 5) return;

        const hasImage = data.images.some(file => file !== null);
        const hasVideo = data.videos.some(file => file !== null);

        if (!hasImage || !hasVideo) {
            showAlert('Please upload at least one image and one video', 'info');
            return;
        }

        setIsLoading(true);

        const formData = new FormData();

        // Add all non-file form fields
        Object.entries(data).forEach(([key, value]) => {
            if (key !== 'images' && key !== 'videos') {
                if (key === 'amenities') {
                    formData.append(key, JSON.stringify(selectedAmenities));
                } else if (value !== null && value !== undefined) {
                    formData.append(key, value.toString());
                }
            }
        });
        // Add files to formData
        data.images.forEach((file, index) => {
            if (file) {
                formData.append('images[]', file);
            }
        });

        data.videos.forEach((file, index) => {
            if (file) {
                formData.append('videos[]', file);
            }
        });

        formData.append('published', 'false');
        formData.append('can_rate', 'false');

        try {
            const token = getAuthToken();
            if (!token) {
                showAlert('Please login to add a property', 'error');
                setIsLoading(false);
                return;
            }

            const response = await axios.post(
                baseURL + '/apartment',
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json',
                        'Content-Type': 'multipart/form-data'
                    },
                    withCredentials: true
                }
            );

            if (response.data.success) {
                showAlert('Property successfully added!', 'success');
                // Reset form
                setValue('category_id', 0);
                setValue('title', '');
                setValue('description', null);
                setValue('number_of_rooms', null);
                setValue('amount', 0);
                setValue('currency_code', 'NGN');
                setValue('security_deposit', null);
                setValue('security_deposit_currency_code', null);
                setValue('duration', 0);
                setValue('duration_type', 'month');
                setValue('amenities', []);
                setValue('country_code', 'NG');
                setValue('state_code', '');
                setValue('city_code', '');
                setValue('images', []);
                setValue('videos', []);

                setImagePreview({});
                setVideoPreview({});
                setSelectedAmenities([]);
                setStep(1);
                try {

                    data.images?.forEach((file, index) => {
                        removeImage(index - 1)
                    });
                    data.videos?.forEach((file, index) => {
                        removeVideo(index - 1)
                    });

                } catch (e) {

                }
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 401) {
                    showAlert('Your session has expired. Please login again.', 'error');
                } else if (error.response?.status === 503) {
                    showAlert('Service temporarily unavailable. Please try again later.', 'error');
                } else {
                    showAlert(error.response?.data?.message || 'Failed to add property. Please try again.', 'error');
                }
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full flex flex-col px-2 md:px-6 py-2 md:py-6 gap-2 md:gap-4">
            <div className="flex justify-between items-center">
                <h1 className="text-black/80 text-[1.5rem] font-semibold">Add New Property</h1>
                <span className="text-orange-500 font-medium">Step {step} / 5</span>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}
                  className="w-full flex flex-col gap-6 bg-black/80 rounded-xl shadow-md shadow-orange-600 p-4">

                {step === 1 && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold mb-2 text-white">Property Category</label>
                            <select
                                {...register('category_id', {required: 'Category is required'})}
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

                        <div>
                            <label className="block text-sm font-semibold mb-2 text-white">Title</label>
                            <input
                                {...register('title', {required: 'Title is required'})}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white text-black"
                            />
                            {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-2 text-white">Number of Rooms</label>
                            <input
                                type="number"
                                {...register('number_of_rooms')}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white text-black"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-2 text-white">Description</label>
                            <textarea
                                {...register('description')}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                                rows={4}
                            />
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold mb-2 text-white">Amount</label>
                            <input
                                type="number"
                                {...register('amount', {required: 'Amount is required'})}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white text-black"
                            />
                            {errors.amount && <p className="text-red-500 text-sm">{errors.amount.message}</p>}
                        </div>

                        <div className={"hidden"}>
                            <label className="block text-sm font-semibold mb-2 text-white">Currency Code</label>
                            <input
                                {...register('currency_code', {required: 'Currency code is required'})}
                                defaultValue="₦"
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white text-black"
                            />
                            {errors.currency_code &&
                            <p className="text-red-500 text-sm">{errors.currency_code.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-2 text-white">Security Deposit</label>
                            <input
                                type="number"
                                {...register('security_deposit')}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white text-black"
                            />
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold mb-2 text-white">Duration Type</label>
                            <select
                                {...register('duration_type', {required: 'Duration type is required'})}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                            >
                                <option value="day">Day</option>
                                <option value="week">Week</option>
                                <option value="month">Month</option>
                                <option value="year">Year</option>
                            </select>
                            {errors.duration_type &&
                            <p className="text-red-500 text-sm">{errors.duration_type.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-2 text-white">Rent Duration</label>
                            <input
                                type="number"
                                {...register('duration', {required: 'Duration is required'})}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                            />
                            {errors.duration && <p className="text-red-500 text-sm">{errors.duration.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-2 text-white">Amenities</label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {AVAILABLE_AMENITIES.map((amenity) => (
                                    <label key={amenity}
                                           className="flex items-center space-x-2 text-white cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={selectedAmenities.includes(amenity)}
                                            onChange={() => handleAmenityToggle(amenity)}
                                            className="rounded border-gray-300"
                                        />
                                        <span>{amenity}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {step === 4 && (
                    <div className="space-y-4">
                        {/* THIS DIV BELOW IS HIDDEN - NOT USELESS/REMOVED */}
                        <div className='hidden'>
                            <label className="block text-sm font-semibold mb-2 text-white">Country</label>
                            <input
                                {...register('country_code', {required: 'Country code is required'})}
                                defaultValue="NG"
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white text-black"
                            />
                            {errors.country_code &&
                            <p className="text-red-500 text-sm">{errors.country_code.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-2 text-white">State</label>
                            <input
                                {...register('state_code', {required: 'State is required'})}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white text-black"
                            />
                            {errors.state_code && <p className="text-red-500 text-sm">{errors.state_code.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-2 text-white">City</label>
                            <input
                                {...register('city_code', {required: 'City is required'})}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white text-black"
                            />
                            {errors.city_code && <p className="text-red-500 text-sm">{errors.city_code.message}</p>}
                        </div>
                    </div>
                )}

                {step === 5 && (
                    <div className="space-y-6">
                        <div>
                            <label className="block  text-sm font-semibold mb-2 text-white  ">Images (At least 1
                                required,
                                max 5, each &lt;30MB)</label>
                            {/* <div className="grid grid-cols-2 md:grid-cols-5 gap-4"> */}
                            <div className={"text-white"}>
                                <div {...getImageRootProps()}
                                     style={{
                                         border: "2px dashed #ccc",
                                         padding: "20px",
                                         cursor: "pointer",
                                         borderRadius: "10px"
                                     }}>
                                    <input {...getImageInputProps()} />
                                    <p className={"text-white"}>Drag & drop images here, or click to select</p>
                                </div>
                                {/*{uploadedImages && uploadedImages.map((file, index) => (*/}
                                {/*    <li key={index}>{file.name}</li>*/}
                                {/*))}*/}
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-5 min-h-[200px]">
                                    {uploadedImages && uploadedImages.map((file, index) => (
                                        <div key={index} style={{position: "relative"}}>
                                            <img
                                                src={URL.createObjectURL(file)}
                                                alt="preview"
                                                width={100}
                                                height={100}
                                                style={{borderRadius: "5px", objectFit: "cover"}}
                                            />
                                            <button
                                                onClick={() => removeImage(index)}
                                                style={{
                                                    position: "absolute",
                                                    top: 0,
                                                    right: 0,
                                                    background: "red",
                                                    color: "white",
                                                    border: "none",
                                                    cursor: "pointer",
                                                    padding: "2px 6px",
                                                    borderRadius: "50%",
                                                }}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>

                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-2 text-white">Videos (At least 1 required,
                                max 5, each &lt;80MB)</label>
                            <div className={"text-white"}>
                                <div {...getVideoRootProps()}
                                     style={{
                                         border: "2px dashed #ccc",
                                         padding: "20px",
                                         cursor: "pointer",
                                         borderRadius: "10px"
                                     }}>
                                    <input {...getVideoInputProps()} />
                                    <p>Drag & drop videos here, or click to select</p>
                                </div>
                                {/*<ul>*/}
                                {/*    {uploadedVideos && uploadedVideos.map((file, index) => (*/}
                                {/*        <li key={index}>{file.name}</li>*/}
                                {/*    ))}*/}
                                {/*</ul>*/}

                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-5 min-h-[200px]">


                                    {uploadedVideos.map((file, index) => (
                                        <div key={index} style={{position: "relative"}}>
                                            <video
                                                src={URL.createObjectURL(file)}
                                                width={120}
                                                height={80}
                                                controls
                                                style={{borderRadius: "5px", objectFit: "cover"}}
                                            />
                                            <button
                                                onClick={() => removeVideo(index)}
                                                style={{
                                                    position: "absolute",
                                                    top: 0,
                                                    right: 0,
                                                    background: "red",
                                                    color: "white",
                                                    border: "none",
                                                    cursor: "pointer",
                                                    padding: "2px 6px",
                                                    borderRadius: "50%",
                                                }}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>

                            </div>
                        </div>
                    </div>
                )}

                <div className="flex justify-between mt-6">
                    {step > 1 && (
                        <button
                            type="button"
                            onClick={prevStep}
                            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                        >
                            Previous
                        </button>
                    )}

                    {step < 5 ? (
                        <button
                            type="button"
                            onClick={nextStep}
                            className="ml-auto px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                        >
                            Next
                        </button>
                    ) : (
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="ml-auto px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
                        >
                            {isLoading ? 'Submitting...' : 'Submit Property'}
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default AddProperty;

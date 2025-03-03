'use client';

import React, {useCallback, useEffect, useState} from 'react';
import {useForm} from 'react-hook-form';
import axios from 'axios';
import {useAlert} from '@/contexts/AlertContext';
import {baseURL} from "@/../next.config";
import {useDropzone} from "react-dropzone";

interface Category {
    id: number;
    title: string;
    slug: string;
}

interface PropertyFormData {
    id: number;
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
    images: File[] | null;
    videos: File[] | null;
}

const AVAILABLE_AMENITIES = [
    'WiFi', 'Parking', 'Air Conditioning', 'Swimming Pool', 'Gym',
    'Security', 'Furnished', 'Balcony', 'Garden', 'Pet Friendly',
    'Elevator', 'CCTV', 'Generator', 'Water Supply', 'Kitchen'
];

const MAX_FILES = 5;

interface EditApartmentFormProps {
    property: PropertyFormData;
}

const EditApartmentForm: React.FC<EditApartmentFormProps> = ({property}) => {

    const {showAlert} = useAlert();
    const [step, setStep] = useState(1);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
    const [uploadedImages, setUploadedImages] = useState<File[]>([]);
    const [uploadedVideos, setUploadedVideos] = useState<File[]>([]);

    const {
        register,
        handleSubmit,
        formState: {errors},
        setValue,
        watch,
        reset,
        trigger
    } = useForm<PropertyFormData>({
        defaultValues: property
    });

    // useEffect(() => {
    //     if (property) {
    //         reset(property, {keepDefaultValues: true}); // Reset form values to match the new property data
    //         if (property.amenities) {
    //             setSelectedAmenities(property.amenities);
    //         }
    //     }
    // }, [property, step, reset]);


    useEffect(() => {

        fetchCategories().then(r => r);
        if (property.amenities) {
            setSelectedAmenities(property.amenities);
        }

        async function fetchMedia() {
            try {

                const images = property.images; // Extract media from response
                const videos = property.videos; // Extract media from response

                // Convert image URLs to File objects
                if (images) {
                    const imageFiles = await Promise.all(
                        images.map(async (url) => await urlToFile(url?.original_url))
                    );
                    setUploadedImages(imageFiles);
                }

                // Convert video URLs to File objects
                if (videos) {
                    const videoFiles = await Promise.all(
                        videos.map(async (url) => await urlToFile(url?.original_url))
                    );
                    setUploadedVideos(videoFiles);
                }
            } catch (error) {
                console.error("Error fetching media:", error);
            }
        }

        if (property.id) {
            fetchMedia().then(r => r);
        }
    }, []);

    async function urlToFile(url: string) {
        const response = await fetch(url);
        const blob = await response.blob();
        return new File([blob], url.split("/").pop() || "file", {type: blob.type});
    }

    const fetchCategories = async () => {
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

    const getAuthToken = (): string | null => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('agentToken');
        }
        return null;
    };

    const handleAmenityToggle = (amenity: string) => {
        setSelectedAmenities(prev => {
            const newAmenities = prev.includes(amenity)
                ? prev.filter(a => a !== amenity)
                : [...prev, amenity];
            setValue('amenities', newAmenities);
            return newAmenities;
        });
    };

    const onDropImages = useCallback(
        (acceptedFiles: File[]) => {
            setUploadedImages(prevImages => {
                const newFiles = [...prevImages, ...acceptedFiles].slice(0, MAX_FILES);
                setValue("images", newFiles);
                return newFiles;
            });
        },
        [setValue]
    );

    const onDropVideos = useCallback(
        (acceptedFiles: File[]) => {
            setUploadedVideos(prevVideos => {
                const newFiles = [...prevVideos, ...acceptedFiles].slice(0, MAX_FILES);
                setValue("videos", newFiles);
                return newFiles;
            });
        },
        [setValue]
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

    const {getRootProps: getImageRootProps, getInputProps: getImageInputProps} = useDropzone({
        accept: {"image/*": []},
        onDrop: onDropImages,
    });

    const {getRootProps: getVideoRootProps, getInputProps: getVideoInputProps} = useDropzone({
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
                fieldsToValidate = ['images', 'videos'];
                break;
        }
        return await trigger(fieldsToValidate);
    };

    const nextStep = async (): Promise<void> => {
        // const isValid = await validateStep();
        // if (isValid) {
        setStep(current => Math.min(current + 1, 5));
        // }
    };

    const prevStep = (): void => {
        setStep(current => Math.max(current - 1, 1));
    };

    const onSubmit = async (data: PropertyFormData) => {
        if (step !== 5) return;

        if (isLoading) return;
        setIsLoading(true);

        const formData = new FormData();

        Object.entries(data).forEach(([key, value]) => {
            if (key !== 'images' && key !== 'videos') {
                if (key === 'amenities') {
                    formData.append(key, JSON.stringify(selectedAmenities));
                } else if (value !== null && value !== undefined) {
                    formData.append(key, value.toString());
                }
            }
        });

        if (uploadedImages) {
            uploadedImages.forEach(file => formData.append("images[]", file));
        }
        if (uploadedVideos) {
            uploadedVideos.forEach(file => formData.append("videos[]", file));
        }

        try {
            const token = getAuthToken();
            if (!token) {
                showAlert('Please login to add a property', 'error');
                setIsLoading(false);
                return;
            }

            const response = await axios.put(
                baseURL + '/apartment/' + property.id,
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json',
                        "Content-Type": "application/json"
                    },
                    withCredentials: true,

                }
            );

            if (response.data.success) {
                showAlert('Property successfully updated!', 'success');
                reset(response.data.data);


                // setStep(1);
            }

        } catch (error) {
            if (axios.isAxiosError(error)) {
                showAlert(error.response?.data?.message || 'Failed to add property. Please try again.', 'error');
            }
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="w-full flex flex-col px-2 md:px-6 py-2 md:py-6 gap-2 md:gap-4">
            <div className="flex justify-between items-center">
                <h1 className="text-black/80 text-[1.5rem] font-semibold">Edit Property: </h1>
                <span className="text-orange-500 font-medium">Step {step} / 5</span>
            </div>
            <div className={"-mt-3"}>  {property?.title} </div>

            <form onSubmit={handleSubmit(onSubmit)}
                  className="w-full flex flex-col gap-6 bg-black/80 rounded-xl shadow-md shadow-orange-600 p-4">

                {step === 1 && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold mb-2 text-white">Property Category</label>
                            <select
                                {...register('category_id')}
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
                                {...register('title',)}
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
                        <div className={"flex justify-start"}><input type={"checkbox"}
                                                                     {...register('published')}
                                                                     className=" border border-gray-300 rounded-lg px-4 py-2 rounded"

                        />
                            <label
                                className="block text-sm font-semibold mb-2 px-2 text-white  pt-2">{"Publish"}</label>

                        </div>
                        <div className={"flex justify-start"}><input type={"checkbox"}
                                                                     {...register('can_rate')}
                                                                     className=" border border-gray-300 rounded-lg px-4 py-2 rounded"

                        />
                            <label
                                className="block text-sm font-semibold mb-2 text-white px-2 pt-2">{"Allow Rating"}</label>

                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold mb-2 text-white">Amount</label>
                            <input
                                type="number"
                                {...register('amount')}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white text-black"
                            />
                            {errors.amount && <p className="text-red-500 text-sm">{errors.amount.message}</p>}
                        </div>

                        <div className={"hidden"}>
                            <label className="block text-sm font-semibold mb-2 text-white">Currency Code</label>
                            <input
                                {...register('currency_code')}
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
                                {...register('duration_type')}
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
                                {...register('duration')}
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
                                {...register('country_code')}
                                defaultValue="NG"
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white text-black"
                            />
                            {errors.country_code &&
                            <p className="text-red-500 text-sm">{errors.country_code.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-2 text-white">State</label>
                            <input
                                {...register('state_code')}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white text-black"
                            />
                            {errors.state_code && <p className="text-red-500 text-sm">{errors.state_code.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-2 text-white">City</label>
                            <input
                                {...register('city_code')}
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
                                <div  {...getImageRootProps()}
                                      style={{
                                          border: "2px dashed #ccc",
                                          padding: "20px",
                                          cursor: uploadedImages.length >= MAX_FILES ? "not-allowed" : "pointer",
                                          opacity: uploadedImages.length >= MAX_FILES ? 0.5 : 1,
                                          marginBottom: "10px",
                                      }}>
                                    <input {...getImageInputProps()} />
                                    <p>{uploadedImages.length >= MAX_FILES ? "Max limit reached" : "Drag & drop images here, or click to select"}</p>

                                </div>
                                <div style={{display: "flex", gap: "10px", flexWrap: "wrap"}}>
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
                                         cursor: uploadedVideos.length >= MAX_FILES ? "not-allowed" : "pointer",
                                         opacity: uploadedVideos.length >= MAX_FILES ? 0.5 : 1,
                                         marginBottom: "10px",
                                     }}>
                                    <input {...getVideoInputProps()} />
                                    <p>{uploadedVideos.length >= MAX_FILES ? "Max limit reached" : "Drag & drop videos here, or click to select"}</p>
                                </div>
                                <div style={{display: "flex", gap: "10px", flexWrap: "wrap"}}>


                                    {uploadedVideos.map((file, index) => (
                                        <div key={index} style={{position: "relative", minHeight: "90px"}}>
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
                            {isLoading ? 'Updating...' : 'Update Property'}
                        </button>
                    )}
                </div>
            </form>

            {/*{uploadProgress !== null && (*/}
            {/*    <div style={{marginTop: "10px"}}>*/}
            {/*        <progress value={uploadProgress} max={100} style={{width: "100%"}}/>*/}
            {/*        <p>{uploadProgress}%</p>*/}
            {/*    </div>*/}
            {/*)}*/}
        </div>
    );
};

export default EditApartmentForm;





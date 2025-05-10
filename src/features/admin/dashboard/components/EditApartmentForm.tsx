'use client';

import React, {useEffect, useState} from 'react';
import {useForm} from 'react-hook-form';
import axios from 'axios';
import {useAlert} from '@/contexts/AlertContext';
import {baseURL} from "@/../next.config";
import {AxiosApi, stringToNumber} from "@/lib/utils";
import {AVAILABLE_AMENITIES} from "@/types/apartment";
import {useSelector} from "react-redux";
import {useRouter} from "next/navigation";
import {deleteExistingImage, deleteExistingVideos} from "@/features/admin/dashboard/api/adminDashboardService";

interface Category {
    id: number;
    title: string;
    slug: string;
}

export interface PropertyFormData {
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

    existing_images: string[] | null;
    existing_Videos: string[] | null;
}


const MAX_FILES = 5;

interface EditApartmentFormProps {
    property: PropertyFormData;
}

type ExistingImage = {
    custom_properties: any[];
    extension: string;
    file_name: string;
    name: string;
    order: number;
    original_url: string;
    preview_url: string;
    size: number;
    uuid: string;
}

type ExistingVideo = {
    custom_properties: any[];
    extension: string;
    file_name: string;
    name: string;
    order: number;
    original_url: string;
    preview_url: string;
    size: number;
    uuid: string;
}

const EditApartmentForm: React.FC<EditApartmentFormProps> = ({property}) => {

    const {showAlert} = useAlert();
    const [step, setStep] = useState(1);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
    const [existingImages, setExistingImages] = useState<ExistingImage[] | []>([]);
    const [existingVideos, setExistingVideos] = useState<ExistingVideo[] | []>([]);
    const [uploadedImages, setUploadedImages] = useState<File[]>([]);
    const [uploadedVideos, setUploadedVideos] = useState<File[]>([]);

    const token = useSelector((state: any) => state.admin.token);

    const {
        register,
        handleSubmit,
        formState: {errors},
        setValue,
        watch,
        reset,
        trigger
    } = useForm<PropertyFormData>();

    useEffect(() => {
        if (property) {
            reset({
                ...property,
                category_id: property.category_id || undefined,
                title: property.title || '',
                description: property.description || '',
                number_of_rooms: property.number_of_rooms,
                amount: stringToNumber(property.amount),
                currency_code: property.currency_code || '₦',
                security_deposit: stringToNumber(property.security_deposit),
                security_deposit_currency_code: property.security_deposit_currency_code || null,
                duration: stringToNumber(property.duration || 0),
                duration_type: property.duration_type || 'day',
                country_code: property.country_code || 'NG',
                state_code: property.state_code || '',
                city_code: property.city_code || '',
                published: property.published || false,
                can_rate: property.can_rate || false,
            });

            setSelectedAmenities(property.amenities || []);
            if (property && property.images) {
                const flattenedImages = Object.values(property.images).flatMap(
                    (imageArray: any) => {
                        return imageArray;
                    }
                );
                setExistingImages(flattenedImages);
            } else {
                setExistingImages([]);
            }
            if (property && property.videos) {
                // Flatten the image object into an array of ExistingImage objects
                const flattenedVideos = Object.values(property.videos).flatMap(
                    (videoArray: any) => videoArray // Directly return the inner array
                );
                setExistingVideos(flattenedVideos);
            } else {
                setExistingVideos([]);
            }
        }
    }, [property, reset]);

    const handleAmenityToggle = (amenity: string) => {
        setSelectedAmenities(prev => {
            const newAmenities = prev.includes(amenity)
                ? prev.filter(a => a !== amenity)
                : [...prev, amenity];
            setValue('amenities', newAmenities);
            return newAmenities;
        });
    };

    const router = useRouter();

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await AxiosApi('agent').get<{ success: boolean; data: Category[] }>(
                    baseURL + '/apartment-types');
                if (response.data.success) {
                    setCategories(response.data.data);
                    if (property && property.category_id && response.data.data.some(cat => cat.id === property.category_id)) {
                        setValue('category_id', property.category_id);
                    }
                }
            } catch (error) {
                if (axios.isAxiosError(error) && error.response?.status === 401) {
                    showAlert('Please login to continue', 'error');
                }
            }
        };

        fetchCategories();
    }, [setCategories, setValue, property]);

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
                return (uploadedImages.length > 0 && uploadedVideos.length > 0)
                    || (existingImages.length > 0 && existingVideos.length > 0)
                    ;
        }
        return await trigger(fieldsToValidate);
    };

    useEffect(() => {

        const subscription = watch((value) => value);
        return () => subscription.unsubscribe(); // Clean up the subscription

    }, [watch, step]);


    const nextStep = async (): Promise<void> => {
        const isValid = await validateStep();
        if (isValid) {
            setStep(current => Math.min(current + 1, 5));
        }
    };

    // handle images
    const handleDropImages = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const droppedFiles = Array.from(e.dataTransfer.files).filter(file =>
            file.type.startsWith("image/")
        );

        const totalFiles = [...uploadedImages, ...droppedFiles].slice(0, MAX_FILES);
        setUploadedImages(totalFiles);
    };

    // handle videos and files dropping
    const handleDropVideos = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const droppedFiles = Array.from(e.dataTransfer.files).filter(file =>
            file.type.startsWith("video/")
        );

        const totalFiles = [...droppedFiles].slice(0, MAX_FILES);
        setUploadedVideos(totalFiles);
    };

    // Handle EXISTING File Removed
    const handleRemoveExistingImage = async (index: number) => {
        if (isLoading) return;
        setIsLoading(true);
        const imageToRemove = existingImages[index];
        if (imageToRemove && imageToRemove?.uuid) {
            // Immediately call the API to delete the image
            const isDeleted = await deleteExistingImage(imageToRemove.uuid, token);
            if (isDeleted) {
                // If the backend deletion was successful, update the local state
                const updated = existingImages.filter((_, i) => i !== index);
                setExistingImages(updated);
                // Optionally, you might want to update the 'deletedExistingImageUUIDs' state as well,
                // in case the user submits the form later and your backend needs to know
                // which images were already deleted.
                // setDeletedExistingImageUUIDs(prev => [...prev, imageToRemove.uuid]);
            } else {
                // Handle the case where the backend deletion failed (e.g., show an error message)
                showAlert('Failed to delete image. Please try again.', 'error');
            }
            setIsLoading(false);
        }

    }
    const handleRemoveExistingVideo = async (index: number) => {

        if (isLoading) return;
        setIsLoading(true);
        const videoToRemove = existingVideos[index];
        if (videoToRemove && videoToRemove?.uuid) {
            // Immediately call the API to delete the image
            const isDeleted = await deleteExistingVideos(videoToRemove.uuid, token);
            if (isDeleted) {
                // If the backend deletion was successful, update the local state
                const updated = existingVideos.filter((_, i) => i !== index);
                setExistingVideos(updated);
                // Optionally, you might want to update the 'deletedExistingImageUUIDs' state as well,
                // in case the user submits the form later and your backend needs to know
                // which images were already deleted.
                // setDeletedExistingImageUUIDs(prev => [...prev, imageToRemove.uuid]);
            } else {
                // Handle the case where the backend deletion failed (e.g., show an error message)
                showAlert('Failed to delete image. Please try again.', 'error');

            }
            setIsLoading(false);
        }
    }


    // Handle File Removed
    const handleRemoveImage = (index: number) => {
        const updated = uploadedImages.filter((_, i) => i !== index);
        setUploadedImages(updated);
    }

    const handleRemoveVideo = (index: number) => {
        const updated = uploadedVideos.filter((_, i) => i !== index);
        setUploadedVideos(updated);
    }

    // Handle File Input

    const handleImageInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(e.target.files || []).filter(file =>
            file.type.startsWith("image/")
        );

        const totalFiles = [...uploadedImages, ...selectedFiles].slice(0, MAX_FILES);
        setUploadedImages(totalFiles);
    };
    const handleVideoInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(e.target.files || []).filter(file =>
            file.type.startsWith("video/")
        );

        const totalFiles = [...uploadedVideos, ...selectedFiles].slice(0, MAX_FILES);
        setUploadedVideos(totalFiles);
    };


    const prevStep = (): void => {
        setStep(current => Math.max(current - 1, 1));
    };

    const onSubmit = async (data: PropertyFormData) => {
        if (step !== 5) return;

        //
        const atLeastOneVideo = uploadedVideos.length > 0 || existingVideos.length > 0;
        const atLeastOneImage = uploadedImages.length > 0 || existingImages.length;

        const firstCheck = (uploadedImages.length > 0 && uploadedVideos.length > 0)
            || (existingImages.length > 0 && existingVideos.length > 0);
        const secondCheck = atLeastOneImage && atLeastOneVideo;

        if (!(firstCheck || secondCheck)) {
            showAlert('Please upload at least one image and one video', 'info');
            setIsLoading(false);
            return;
        }

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
        uploadedImages.forEach(image => formData.append("images[]", image));
        uploadedVideos.forEach(file => formData.append("videos[]", file));

        formData.append('published', 'false');
        formData.append('can_rate', 'false');

        try {
            if (!token) {
                showAlert('Please login to add a property', 'error');
                setIsLoading(false);
                return;
            }

            const response = await AxiosApi('agent', token, {'Content-Type': 'multipart/form-data'}).put(
                baseURL + '/apartment/' + property.id, formData);

            if (response.data.success) {
                showAlert('Property successfully Updated!', 'success');
                // reset();
                // setSelectedAmenities([]);
                // setStep(1);
                router.push('/admin/dashboard/view-apartments');

            }

            // setUploadProgress(100);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                showAlert(error.response?.data?.message || 'Failed to add property. Please try again.', 'error');
            }
        } finally {
            // setTimeout(() => setUploadProgress(null), 1500);
            setIsLoading(false);
        }
    };
    return (
        <div className="w-full flex flex-col px-2 md:px-6 py-2 md:py-6 gap-2 md:gap-4">
            <div className="flex justify-between items-center">
                <h1 className="text-black/80 text-[1.5rem] font-semibold">Update Property</h1>
                <span className="text-orange-500 font-medium">Step {step} / 5</span>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}
                  className="w-full flex flex-col gap-6 bg-black/80 rounded-xl shadow-md shadow-orange-600 p-4">

                {step === 1 && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold mb-2 text-white">Property
                                Category</label>
                            <select
                                {...register('category_id', {
                                    required: 'Category is required',
                                    setValueAs: (value) => (value ? parseInt(value, 10) : undefined),
                                })}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                            >
                                <option value="">Select Category</option>
                                {categories.map((category) => (
                                    <option key={category.id} value={category.id.toString()}>
                                        {category.title}
                                    </option>
                                ))}
                            </select>
                            {errors.category_id &&
                                <p className="text-red-500 text-sm">{errors.category_id.message}</p>}
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
                            <label className="block text-sm font-semibold mb-2 text-white">Number of
                                Rooms</label>
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
                            <label className="block text-sm font-semibold mb-2 text-white">Amount
                                ({watch('currency_code')})</label>
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
                            <label className="block text-sm font-semibold mb-2 text-white">Security Deposit
                                ({watch('currency_code')})</label>
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
                            {errors.duration &&
                                <p className="text-red-500 text-sm">{errors.duration.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-2 text-white">Amenities</label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {AVAILABLE_AMENITIES.map((amenity: any) => (
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
                            {errors.state_code &&
                                <p className="text-red-500 text-sm">{errors.state_code.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-2 text-white">City</label>
                            <input
                                {...register('city_code', {required: 'City is required'})}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white text-black"
                            />
                            {errors.city_code &&
                                <p className="text-red-500 text-sm">{errors.city_code.message}</p>}
                        </div>
                    </div>
                )}

                {step === 5 && (
                    <div className="space-y-6">
                        <div>
                            <label className="block  text-sm font-semibold mb-2 text-white  ">Images (At least 1
                                required,Max: {MAX_FILES})</label>
                            {/* <div className="grid grid-cols-2 md:grid-cols-5 gap-4"> */}
                            <div className={"text-white"}>
                                <div onDrop={handleDropImages} onDragOver={(e) => e.preventDefault()} style={{
                                    border: "2px dashed #ccc",
                                    padding: "20px",
                                    marginBottom: "10px",
                                    opacity: uploadedImages.length >= MAX_FILES ? 0.5 : 1,
                                    cursor: uploadedImages.length >= MAX_FILES ? "not-allowed" : "pointer"
                                }}
                                >
                                    <p>{uploadedImages.length >= MAX_FILES ? "Maximum image limit reached" : "Drag & drop images here, or click to select"}</p>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleImageInput}
                                        disabled={uploadedImages.length >= MAX_FILES}
                                    />
                                </div>
                                <div style={{display: "flex", gap: "10px", flexWrap: "wrap"}}>
                                    {Object.keys(existingImages).length > 0 &&
                                        existingImages.map((file, index) => (
                                            <div key={index} style={{position: "relative"}}>
                                                <img
                                                    src={file.preview_url || file.original_url} // Use preview if available
                                                    alt={file.name || "preview"}
                                                    width={100}
                                                    height={100}
                                                    style={{borderRadius: "5px", objectFit: "cover"}}
                                                />
                                                <button
                                                    onClick={() => handleRemoveExistingImage(index)}
                                                    type={"button"}
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
                                                onClick={() => handleRemoveImage(index)} type={"button"}
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
                            <label className="block text-sm font-semibold mb-2 text-white">Videos (At least 1
                                required,
                                Max: {MAX_FILES})</label>
                            <div className={"text-white"}>

                                <div
                                    onDrop={handleDropVideos}
                                    onDragOver={(e) => e.preventDefault()}
                                    style={{
                                        border: "2px dashed #ccc",
                                        padding: "20px",
                                        marginBottom: "10px",
                                        opacity: uploadedVideos.length >= MAX_FILES ? 0.5 : 1,
                                        cursor: uploadedVideos.length >= MAX_FILES ? "not-allowed" : "pointer"
                                    }}
                                >
                                    <p>{uploadedVideos.length >= MAX_FILES ? "Maximum video limit reached" : "Drag & drop videos here, or click to select"}</p>
                                    <input
                                        type="file"
                                        accept="video/*"
                                        multiple
                                        onChange={handleVideoInput}
                                        disabled={uploadedVideos.length >= MAX_FILES}
                                    />
                                </div>
                                <div style={{display: "flex", gap: "10px", flexWrap: "wrap"}}>

                                    {Object.keys(existingVideos).length > 0 && existingVideos.map((file, index) => (
                                        <div key={index} style={{position: "relative", minHeight: "90px"}}>
                                            <video
                                                src={file.preview_url || file.original_url} // Use preview if available
                                                width={120}
                                                height={80}
                                                controls
                                                style={{borderRadius: "5px", objectFit: "cover"}}
                                            />
                                            <button
                                                onClick={() => handleRemoveExistingVideo(index)} type={"button"}
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
                                                onClick={() => handleRemoveVideo(index)} type={"button"}
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


export default EditApartmentForm;





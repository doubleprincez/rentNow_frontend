'use client'
import React, {useEffect, useState} from 'react';
import {useForm} from 'react-hook-form';
import axios from 'axios';
import {useAlert} from '@/contexts/AlertContext';
// import Dropzone from 'react-dropzone-uploader';
import {baseURL} from "@/../next.config";
import {AxiosApi} from "@/lib/utils";
import {useSelector} from "react-redux";
import {allStates, AVAILABLE_AMENITIES} from "@/types/apartment";


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


const MAX_FILES = 5;

///////////////////////////////////////////////////////////////////////////////
const AddProperty: React.FC = () => {
    const {showAlert} = useAlert();
    const [step, setStep] = useState(1);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [uploadedImages, setUploadedImages] = useState<File[]>([]);
    const [uploadedVideos, setUploadedVideos] = useState<File[]>([]);
    const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
    const token = useSelector((state: any) => state.agent.token);

    const {register, handleSubmit, formState: {errors}, setValue, watch, reset, trigger} = useForm<PropertyFormData>({
        defaultValues: {
            amenities: [],
            currency_code: '₦',
            security_deposit_currency_code: '₦',
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


    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await AxiosApi('agent').get<{ success: boolean; data: Category[] }>(
                    baseURL + '/apartment-types');
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
                return uploadedImages.length > 0 && uploadedVideos.length > 0;
        }
        return await trigger(fieldsToValidate);
    };

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

        const totalFiles = [...uploadedVideos, ...droppedFiles].slice(0, MAX_FILES);
        setUploadedVideos(totalFiles);
    };

    // Handle File Removed
    const handleRemoveImage = (index: number) => {
        const updated = uploadedImages.filter((_, i) => i !== index);
        setUploadedImages(updated);
    };
    const handleRemoveVideo = (index: number) => {
        const updated = uploadedVideos.filter((_, i) => i !== index);
        setUploadedVideos(updated);
    };

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

        if (!uploadedImages.length || !uploadedVideos.length) {
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

            const response = await AxiosApi('agent', token, {'Content-Type': 'multipart/form-data'}).post(
                baseURL + '/apartment', formData);

            if (response.data.success) {
                showAlert('Property successfully added!', 'success');
                reset();
                setUploadedImages([]);
                setUploadedVideos([]);
                setSelectedAmenities([]);
                setStep(1);
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
                        {/*<div className='hidden'>*/}
                        {/*    <label className="block text-sm font-semibold mb-2 text-white">Country</label>*/}
                        {/*    <input*/}
                        {/*        {...register('country_code', {required: 'Country code is required'})}*/}
                        {/*        defaultValue="NG"*/}
                        {/*        className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white text-black"*/}
                        {/*    />*/}
                        {/*    {errors.country_code &&*/}
                        {/*        <p className="text-red-500 text-sm">{errors.country_code.message}</p>}*/}
                        {/*</div>*/}

                        <div>
                            <label className="block text-sm font-semibold mb-2 text-white">State</label>
                            <select
                                className="w-full border border-gray-300 rounded-lg px-4 py-2" {...register('state_code', {required: 'State is required'})}>
                                <option value={""}>Select One</option>
                                {allStates.map((stateObject: any, index: number) => {
                                    const stateName = Object.keys(stateObject)[0];
                                    return (
                                        <option key={index} value={stateName}>
                                            {stateName}
                                        </option>
                                    );
                                })}
                            </select>
                            {/*<input*/}
                            {/*    */}
                            {/*    className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white text-black"*/}
                            {/*/>*/}
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
                                required,Max: {MAX_FILES})</label>
                            {/* <div className="grid grid-cols-2 md:grid-cols-5 gap-4"> */}
                            <div className={"text-white"}>
                                <div
                                    onDrop={handleDropImages}
                                    onDragOver={(e) => e.preventDefault()}
                                    style={{
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
                            <label className="block text-sm font-semibold mb-2 text-white">Videos (At least 1 required,
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

            {/*{uploadProgress !== null && (*/}
            {/*    <div style={{marginTop: "10px"}}>*/}
            {/*        <progress value={uploadProgress} max={100} style={{width: "100%"}}/>*/}
            {/*        <p>{uploadProgress}%</p>*/}
            {/*    </div>*/}
            {/*)}*/}
        </div>
    );
};

export default AddProperty;


/**
 * Out
 *
 *     const [uploadedImages, setUploadedImages] = useState<File[]>([]);
 *     const [uploadedVideos, setUploadedVideos] = useState<File[]>([]);
 *
 *     const onDropImages = useCallback(
 *         (acceptedFiles: File[]) => {
 *             setUploadedImages(prevImages => {
 *                 const newFiles = [...prevImages, ...acceptedFiles].slice(0, MAX_FILES);
 *                 setValue("images", newFiles);
 *                 return newFiles;
 *             });
 *         },
 *         [setValue]
 *     );
 *
 *     const onDropVideos = useCallback(
 *         (acceptedFiles: File[]) => {
 *             setUploadedVideos(prevVideos => {
 *                 const newFiles = [...prevVideos, ...acceptedFiles].slice(0, MAX_FILES);
 *                 setValue("videos", newFiles);
 *                 return newFiles;
 *             });
 *         },
 *         [setValue]
 *     );
 *
 *     const removeImage = (index: number) => {
 *         const updatedFiles = uploadedImages.filter((_, i) => i !== index);
 *         setUploadedImages(updatedFiles);
 *         setValue("images", updatedFiles);
 *     };
 *
 *     const removeVideo = (index: number) => {
 *         const updatedFiles = uploadedVideos.filter((_, i) => i !== index);
 *         setUploadedVideos(updatedFiles);
 *         setValue("videos", updatedFiles);
 *     };
 *
 *     const {getRootProps: getImageRootProps, getInputProps: getImageInputProps} = useDropzone({
 *         accept: {"image/*": []},
 *         onDrop: onDropImages,
 *     });
 *
 *     const {getRootProps: getVideoRootProps, getInputProps: getVideoInputProps} = useDropzone({
 *         accept: {"video/*": []},
 *         onDrop: onDropVideos,
 *     });
 *
 *         uploadedImages.forEach(file => formData.append("images[]", file));
 *         uploadedVideos.forEach(file => formData.append("videos[]", file));
 *
 *
 *
 *                 setUploadedImages([]);
 *                 setUploadedVideos([]);
 */



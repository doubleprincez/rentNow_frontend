// components/RequestForUpdate.tsx
import React, {FormEvent, useEffect, useState} from 'react';
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Label} from "@/components/ui/label";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "@/redux/store";
import {AxiosApi, getFormData} from "@/lib/utils";
import {updateProfile, UserState} from "@/redux/userSlice"; // Assuming updateProfile exists and handles partial UserState
import {baseURL} from "../../../../next.config"; // Path to your backend URL config


// --- Local Type for Form Data ---
// This interface defines the exact shape of the data that this form will manage.
// It maps the properties from UserState to suit form inputs (e.g., 'phone' as string).
export interface FormProfileData {
    id?: null | string | number; // Optional ID for existing users
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
    phone: string | null;
}

// --- Define Required Fields for this Form ---
// These are the keys from FormProfileData that must be non-empty for a "complete" profile.
const REQUIRED_PROFILE_FIELDS: Array<keyof FormProfileData> = [
    'firstName',
    'lastName',
    'email',
    'phone',
    // Add other fields from FormProfileData that are mandatory for this form's completion check
    // e.g., 'business_name', 'country', 'state', 'city', 'business_email', 'business_phone', 'business_address'
];
// --- Valid Account Types ---
// Define the valid account types that can update their profiles
const VALID_ACCOUNT_TYPES = ['users', 'agents', 'admins'] as const;
type ValidAccountType = typeof VALID_ACCOUNT_TYPES[number];

// --- Type Guard for Account Types ---
const isValidAccountType = (accountType: string | undefined): accountType is ValidAccountType => {
    return accountType !== undefined && VALID_ACCOUNT_TYPES.includes(accountType as ValidAccountType);
};
interface extendedUserState extends UserState {
    isLoading?: false,
    error?: null,
}

const RequestForUpdate: React.FC = () => {
    const dispatch = useDispatch();
    const preparedState = useSelector((state: RootState) => state.user); // Get the full UserState from Redux
    const userState: extendedUserState = preparedState as extendedUserState;

    // --- Helper function to map UserState to FormProfileData ---
    // This transforms the Redux UserState structure (e.g., phoneNumber: number)
    // into the FormProfileData structure (e.g., phone: string).
    const mapUserStateToFormProfileData = (state: UserState): FormProfileData => {
        return {
            id: state.userId ?? undefined, // userId from UserState maps to id in FormProfileData
            firstName: state.firstName,
            lastName: state.lastName,
            email: state.email,
            phone: state.phoneNumber !== null && state.phoneNumber !== undefined
                ? String(state.phoneNumber)
                : null,

        };
    };

    // --- State Management for the Form ---
    // This state holds the current profile data formatted for the form.
    const [currentProfileDataMapped, setCurrentProfileDataMapped] = useState<FormProfileData | null>(
        userState.isLoggedIn && userState.userId // Only map if user is considered logged in
            ? mapUserStateToFormProfileData(userState)
            : null
    );

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [localUser, setLocalUser] = useState<FormProfileData | null>(currentProfileDataMapped); // For dismissal logic
    const [missingFields, setMissingFields] = useState<Array<keyof FormProfileData>>([]);
    const [formData, setFormData] = useState<Partial<FormProfileData>>({}); // Holds current form input values

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);


    // --- Profile Completion Check Logic ---
    // Checks if all REQUIRED_PROFILE_FIELDS are non-null, non-undefined, and non-empty strings.
    const checkIfProfileComplete = (profileData: FormProfileData | null): boolean => {
        if (!profileData) {
            return false; // Cannot be complete if no data
        }
        return REQUIRED_PROFILE_FIELDS.every(
            (field) => {
                const value = profileData[field];
                return value !== null && value !== undefined && (typeof value !== 'string' || value.trim() !== '');
            }
        );
    };

    // --- Effect to Sync Redux UserState with Local Mapped Profile Data ---
    // This ensures `currentProfileDataMapped` and `localUser` are always up-to-date
    // with changes from the Redux store.
    useEffect(() => {
        const mappedData = userState.isLoggedIn && userState.userId
            ? mapUserStateToFormProfileData(userState)
            : null;
        setCurrentProfileDataMapped(mappedData);
        setLocalUser(mappedData); // Keep localUser in sync for dismissal
    }, [userState]); // Rerun whenever the Redux userState object changes


    // --- Effect to Control Modal Visibility and Initialize Form Data ---
    // This effect runs when login status, account type, or mapped profile data changes.
    useEffect(() => {
        // Only proceed if user is logged in and mapped profile data exists
        // Support all authenticated user types: users, agents, and admins
        if (userState.isLoggedIn && 
            isValidAccountType(userState.accountType) && 
            currentProfileDataMapped) {
            const needsUpdate = !checkIfProfileComplete(currentProfileDataMapped);
            // Check localStorage to see if the modal was previously dismissed for this user
            const dismissed = localStorage.getItem('dismissProfileModal_' + (currentProfileDataMapped.id || '')) === 'true';

            if (needsUpdate && !dismissed) {
                setIsModalOpen(true);

                const initialFormData: { [K in keyof FormProfileData]?: string | null } = {};
                const currentMissing: Array<keyof FormProfileData> = [];

                // Iterate over required fields to populate formData and find missing ones
                REQUIRED_PROFILE_FIELDS.forEach(field => {
                    const value = currentProfileDataMapped[field]; // Access from the mapped profile data

                    let formattedValue: string = ''; // Always initialize as string for form inputs
                    if (value !== null && value !== undefined) {
                        if (typeof value === 'string') {
                            formattedValue = value.trim();
                        } else if (typeof value === 'number') {
                            formattedValue = String(value); // Convert numbers to string for input
                        } else {
                            formattedValue = String(value); // Fallback for other unexpected types
                        }
                    }
                    initialFormData[field] = formattedValue; // Assign formatted string

                    // Add field to missing list if its formatted value is empty
                    if (formattedValue === '') {
                        currentMissing.push(field);
                    }
                });
                setFormData(initialFormData);
                setMissingFields(currentMissing);

            } else {
                setIsModalOpen(false); // Close if complete or dismissed
            }
        } else {
            setIsModalOpen(false); // Close modal if user logs out or not in a valid state
        }
    }, [userState.isLoggedIn, userState.accountType, currentProfileDataMapped]);


    // --- Form Input Change Handler ---
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const {name, value} = e.target;
        setFormData(prev => ({...prev, [name as keyof FormProfileData]: value})); // Type assertion for dynamic key
    };


    // --- Form Submission Handler ---
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Client-side validation for missing fields
            const currentMissingFields = REQUIRED_PROFILE_FIELDS.filter(
                field => {
                    const value = formData[field];
                    return value === undefined || value === null || (typeof value === 'string' && value.trim() === '');
                }
            );

            if (currentMissingFields.length > 0) {
                setError('Please fill in all required fields: ' + currentMissingFields.join(', '));
                setLoading(false);
                return;
            }

            // Construct API payload from formData.
            // This assumes your backend API expects the FormProfileData shape (e.g., 'phone' as string).
            // If the API expects 'phoneNumber' as a number, perform that conversion here.
            const apiPayload: Partial<FormProfileData> = {
                ...formData,
                id: currentProfileDataMapped?.id, // Include ID for PUT request
            };

            // Example: Convert phone/business_phone back to numbers if backend needs them as numbers
            // (Only if FormProfileData has them as strings but API needs numbers)
            if (apiPayload.phone) {
                (apiPayload as any).phone = apiPayload.phone.replaceAll(' ',''); // Remove space in phone for API
            }
            // if (apiPayload.business_phone) {
            //     (apiPayload as any).business_phone = parseInt(apiPayload.business_phone); // Cast to number for API
            // }

            // Remove undefined or null values if your API prefers a cleaner payload
            Object.keys(apiPayload).forEach(key => {
                const value = apiPayload[key as keyof typeof apiPayload];
                if (value === undefined || value === null) {
                    delete apiPayload[key as keyof typeof apiPayload];
                }
            });


            // Check if user is authenticated and has valid account type
            const userToken = userState.token;
            if (!userToken) {
                throw new Error('You must be logged in to update your profile. Please log in and try again.');
            }
            
            if (!isValidAccountType(userState.accountType)) {
                throw new Error('Invalid account type. Please contact support.');
            }

            // Make the API call to update the user profile
            const response = await AxiosApi().put(`${baseURL}/user-profile`, apiPayload);
            const result = response.data;

            if (response.status !== 200) {
                throw new Error(result.message || 'Failed to update profile.');
            }
            type apiResponse = { id: number, name: string; email: string; phone: string | null };
            const updatedProfileDataFromApi: apiResponse = result.data; // Assuming API returns FormProfileData shape


            const splitFullName = updatedProfileDataFromApi.name?.trim().split(' ');

            const checkingData: FormProfileData = {
                id: updatedProfileDataFromApi.id,
                firstName: splitFullName[0],
                lastName: splitFullName[1],
                email: updatedProfileDataFromApi.email,
                phone: updatedProfileDataFromApi.phone ? parseInt(updatedProfileDataFromApi.phone) : null,
            } as FormProfileData;

            setLocalUser(checkingData); // Update local state for dismissal logic
            setCurrentProfileDataMapped(checkingData); // Keep main mapped state updated
            // --- Dispatch Update to Redux UserState ---
            // Construct a payload that matches the direct properties of UserState.
            // Convert FormProfileData fields back to UserState's types/names as needed.
            dispatch(updateProfile({
                firstName: splitFullName[0],
                lastName: splitFullName[1],
                email: updatedProfileDataFromApi.email,
                phoneNumber: updatedProfileDataFromApi.phone ? parseInt(updatedProfileDataFromApi.phone) : null,
            }));

            // Re-check completion and close modal if now complete
            const needsUpdateAfterSubmit = !checkIfProfileComplete(checkingData);
            setIsModalOpen(needsUpdateAfterSubmit);

            // Clear dismissal flag if profile is now complete
            if (!needsUpdateAfterSubmit && updatedProfileDataFromApi.id) {
                localStorage.removeItem('dismissProfileModal_' + updatedProfileDataFromApi.id);
            }

        } catch (err: any) {
            console.error('Profile update error:', err);
            setError(err.message || 'An unexpected error occurred during update.');
        } finally {
            setLoading(false);
        }
    };

    // --- Modal Close and Dismissal Logic ---
    const handleCloseModal = () => {
        setIsModalOpen(false);
        // Store a flag in localStorage to prevent showing the modal again for this session/user
        if (localUser && localUser.id) {
            localStorage.setItem('dismissProfileModal_' + localUser.id, 'true');
        }
    };


    // --- Conditional Rendering for the Modal ---
    // The modal is only rendered if it's open, if we have valid profile data,
    // and if there are still missing fields to complete.
    if (!isModalOpen || !currentProfileDataMapped || missingFields.length === 0) {
        // Provide loading/error messages based on Redux userState
        if (userState.isLoading) {
            return <div>Loading user profile...</div>;
        }
        if (userState.error) {
            return <div>Error loading profile: {userState.error}</div>;
        }
        return null; // Don't render the modal if conditions aren't met
    }

    return (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Complete Your Profile</DialogTitle>
                    <DialogDescription>
                        Please provide the missing information to complete your profile. This applies to all authenticated users including regular users, agents, and admins.
                    </DialogDescription>
                </DialogHeader>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
                         role="alert">
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                    {missingFields.map((field) => (
                        <div key={field} className="space-y-2">
                            <Label htmlFor={field} className="capitalize">
                                {/* Format field name for display (e.g., 'firstName' -> 'First Name') */}
                                {String(field).replace(/_/g, ' ')}
                            </Label>
                            {/* Conditional rendering for different input types based on field name */}
                            {field === 'phone' ? (
                                <Input
                                    id={field}
                                    name={field}
                                    type="tel"
                                    value={formData[field] || ''} // Fallback to empty string for display
                                    onChange={handleChange}
                                    required
                                />
                            ) : field === 'email' ? (
                                <Input
                                    id={field}
                                    name={field}
                                    type="email"
                                    value={formData[field] || ''}
                                    onChange={handleChange}
                                    required
                                />
                            ) : (
                                <Input
                                    id={field}
                                    name={field}
                                    type="text"
                                    value={formData[field] || ''}
                                    onChange={handleChange}
                                    required
                                />
                            )}
                        </div>
                    ))}

                    <div className="col-span-1 md:col-span-2 flex justify-end space-x-2 pt-4">
                        <Button type="button" variant="outline" onClick={handleCloseModal} disabled={loading}>
                            Later
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Updating...' : 'Update Profile'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default RequestForUpdate;

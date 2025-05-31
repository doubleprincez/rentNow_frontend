// components/RequestForUpdate.tsx
import React, {FormEvent, useEffect, useState} from 'react';

// Assuming these imports are correct based on your project structure
import {REQUIRED_PROFILE_FIELDS, User} from "@/features/admin/dashboard/api/userApi";
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from "@/components/ui/dialog"; // Added DialogHeader, DialogTitle, DialogDescription
import {Input} from "@/components/ui/input"; // Assuming you have shadcn Input
import {Button} from "@/components/ui/button"; // Assuming you have shadcn Button
import {Label} from "@/components/ui/label"; // Assuming you have shadcn Label
import {useSelector} from "react-redux";
import {RootState} from "@/redux/store";
import {baseURL} from "../../../../next.config";
import {AxiosApi} from "@/lib/utils";
import {updateProfile} from "@/redux/userSlice"; // Assuming you have shadcn Select

interface RequestForUpdateProps {
    user: User | null; // The user object, which should be provided by your authentication system
    // onUserUpdated: (updatedUser: User) => void; // Optional: If the parent needs to know about updates
}

const RequestForUpdate: React.FC<RequestForUpdateProps> = () => {

        const user = useSelector((state: RootState) => state.user);
        const [isModalOpen, setIsModalOpen] = useState(false);
        const [localUser, setLocalUser] = useState<User | null>(user); // Use local state to manage user copy
        const [missingFields, setMissingFields] = useState<Array<keyof User>>([]);
        const [formData, setFormData] = useState<Partial<User>>({});
        const [loading, setLoading] = useState(false);
        const [error, setError] = useState<string | null>(null);

        // --- Profile Completion Check Logic ---
        const checkIfProfileComplete = (userData: User | null): boolean => {
            if (!userData) {
                return false;
            }
            return REQUIRED_PROFILE_FIELDS.every(
                (field) => userData[field] !== null && (typeof userData[field] === 'string' && (userData[field] as string).trim() === '')
            );
        };

        // --- Effect to manage modal visibility based on user data ---
        useEffect(() => {
            setLocalUser(user); // Keep local user state in sync with prop

            if (user.accountType && user?.isLoggedIn) {
                const needsUpdate = !checkIfProfileComplete(user);
                // Check if modal was not previously dismissed for this session/user
                const dismissed = localStorage.getItem('dismissProfileModal_' + user.id) === 'true';

                if (needsUpdate && !dismissed) {
                    setIsModalOpen(true);

                    // Initialize form data with existing user data for missing fields
                    const initialFormData: Partial<User> = {};
                    REQUIRED_PROFILE_FIELDS.forEach(field => {
                        if (!user[field] || (typeof user[field] === 'string' && (user[field] as string).trim() === '')) {
                            initialFormData[field] = user[field] || '';
                        }
                    });
                    setFormData(initialFormData);
                    setMissingFields(REQUIRED_PROFILE_FIELDS.filter(
                        (field) => !user[field] || (typeof user[field] === 'string' && (user[field] as string).trim() === '')
                    ));

                } else {
                    setIsModalOpen(false); // Close if complete or dismissed
                }
            } else {
                setIsModalOpen(false); // Close modal if user logs out
            }
        }, [user]); // Re-run whenever the user prop changes

        // --- Form handling logic ---
        const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const {name, value} = e.target;
            setFormData(prev => ({...prev, [name]: value}));
        };

        const handleSelectChange = (name: keyof User, value: string) => {
            setFormData(prev => ({...prev, [name]: value}));
        };


        const handleSubmit = async (e: FormEvent) => {
            e.preventDefault();
            setLoading(true);
            setError(null);

            try {
                // Validate form data client-side before sending
                const currentMissingFields = missingFields.filter(field => !formData[field] || (typeof formData[field] === 'string' && (formData[field] as string).trim() === ''));

                if (currentMissingFields.length > 0) {
                    setError('Please fill in all required fields.');
                    setLoading(false);
                    return;
                }

                // *** IMPORTANT: Replace with your actual backend API endpoint ***
                const response = await AxiosApi('user', '', {}, true).put(baseURL + '/user-profile', formData);
                const result = await response.data;
                if (response.status!==200) {
                    const errorData = result;
                    throw new Error(errorData.message || 'Failed to update profile.');
                }

                const updatedUserData: User = result.data; // Assuming API returns the updated user object

                updateProfile(updatedUserData);
                setLocalUser(updatedUserData); // Update local user state
                // Re-check completion and close modal if complete
                const needsUpdateAfterSubmit = checkIfProfileComplete(updatedUserData);

                setIsModalOpen(needsUpdateAfterSubmit); // Close if now complete

                // Clear dismissal flag if profile is now complete
                if (!needsUpdateAfterSubmit && updatedUserData) {
                    localStorage.removeItem('dismissProfileModal_' + updatedUserData.id);
                }
                // Optional: Call onUserUpdated if you have it
                // if (onUserUpdated) { onUserUpdated(updatedUserData); }

            } catch (err: any) {
                console.error('Profile update error:', err);
                setError(err.message || 'An unexpected error occurred during update.');
            } finally {
                setLoading(false);
            }
        };

// --- Modal close and dismissal logic ---
        const handleCloseModal = () => {
            setIsModalOpen(false);
            if (localUser) {
                localStorage.setItem('dismissProfileModal_' + localUser.id, 'true');
            }
        };

// Only render the Dialog if it's open and we have a user
        if (!isModalOpen || !localUser || missingFields.length === 0) {
            return null;
        }

        return (
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}> {/* Control Dialog open state */}
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Complete Your Profile</DialogTitle>
                        <DialogDescription>
                            Please provide the missing information to complete your profile.
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
                                    {field.replace(/_/g, ' ')}
                                </Label>
                                {/* Conditional rendering for different input types */}
                                {field === 'state' ? (
                                    <Input
                                        id={field}
                                        name={field}
                                        type="text" // Can be a Select too, conditionally based on country
                                        value={formData[field] || ''}
                                        onChange={handleChange}
                                        required
                                    />
                                ) : field.includes('email') ? (
                                    <Input
                                        id={field}
                                        name={field}
                                        type="email"
                                        value={formData[field] || ''}
                                        onChange={handleChange}
                                        required
                                    />
                                ) : field.includes('phoneNumber') ? (
                                    <Input
                                        id={field}
                                        name={field}
                                        type="tel"
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
    }
;

export default RequestForUpdate;
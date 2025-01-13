'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  address: string;
  profilePicture: string; // URL of the profile picture
}

const ProfilePage: React.FC = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get('/api/user/profile'); // Adjust API endpoint
        setUserProfile(response.data);
      } catch (err) {
        setError('Failed to load profile information.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  // Handle Profile Update
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;

    try {
      await axios.put('/api/user/profile', userProfile); // Adjust API endpoint
      setSuccessMessage('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      setError('Failed to update profile. Please try again.');
    }
  };

  // Handle Profile Picture Upload
  const handleProfilePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;

    const formData = new FormData();
    formData.append('profilePicture', e.target.files[0]);

    try {
      const response = await axios.post('/api/user/profile-picture', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (userProfile) {
        setUserProfile({ ...userProfile, profilePicture: response.data.profilePicture });
      }
    } catch (err) {
      setError('Failed to upload profile picture.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-orange-500 mb-6">Profile</h1>

      {isLoading && <p className="text-gray-500">Loading profile...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!isLoading && userProfile && (
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <div className="w-24 h-24 rounded-full overflow-hidden border">
              <img
                src={userProfile.profilePicture || '/default-avatar.png'}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <label className="text-orange-500 cursor-pointer">
              <input type="file" className="hidden" onChange={handleProfilePictureChange} />
              Change Picture
            </label>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            {successMessage && <p className="text-green-500">{successMessage}</p>}

            <div>
              <label className="block text-sm font-semibold text-gray-700">Name</label>
              <input
                type="text"
                value={userProfile.name}
                onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
                disabled={!isEditing}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700">Email</label>
              <input
                type="email"
                value={userProfile.email}
                onChange={(e) => setUserProfile({ ...userProfile, email: e.target.value })}
                disabled={!isEditing}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700">Phone</label>
              <input
                type="text"
                value={userProfile.phone}
                onChange={(e) => setUserProfile({ ...userProfile, phone: e.target.value })}
                disabled={!isEditing}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700">Address</label>
              <textarea
                value={userProfile.address}
                onChange={(e) => setUserProfile({ ...userProfile, address: e.target.value })}
                disabled={!isEditing}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                rows={3}
              />
            </div>

            {isEditing ? (
              <div className="space-x-4">
                <button
                  type="submit"
                  className="bg-orange-500 text-white font-semibold px-4 py-2 rounded-lg hover:bg-orange-600"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-300 text-gray-700 font-semibold px-4 py-2 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="bg-orange-500 text-white font-semibold px-4 py-2 rounded-lg hover:bg-orange-600"
              >
                Edit Profile
              </button>
            )}
          </form>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;

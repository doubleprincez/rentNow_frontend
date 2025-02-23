'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';

interface AgentProfile {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  business_name: string | null;
  business_email: string | null;
  business_phone: string | null;
  business_address: string | null;
  country: string | null;
  state: string | null;
  city: string | null;
  profile_picture?: string;
}

interface RootState {
  agent: {
    token: string | null;
    userId?: number; 
  };
}

const ProfilePage: React.FC = () => {
  const [agentProfile, setAgentProfile] = useState<AgentProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Get token and userId from Redux store
  const { token, userId } = useSelector((state: RootState) => state.agent);

  // Create axios instance with authentication
  const authenticatedAxios = axios.create({
    baseURL: 'https://api.rent9ja.com.ng/api',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  // Fetch agent profile
  useEffect(() => {
    const fetchAgentProfile = async () => {
      if (!token || !userId) {
        setError('Please log in to view your profile.');
        setIsLoading(false);
        //console.log(`USER-ID: ${userId}`)
        return;
      }

      try {
        const response = await authenticatedAxios.get(`/agent/${userId}`);
        setAgentProfile(response.data);
      } catch (err) {
        setError('Failed to load agent profile information.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAgentProfile();
  }, [token, userId]);

  // Handle Profile Update
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agentProfile || !token || !userId) return;

    try {
      await authenticatedAxios.put(`/agent/${userId}`, agentProfile);
      //setSuccessMessage('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      setError('Failed to update profile. Please try again.');
    }
  };

  // Handle Profile Picture Upload
  const handleProfilePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !token || !userId) return;

    const formData = new FormData();
    formData.append('profile_picture', e.target.files[0]);

    try {
      const response = await authenticatedAxios.post(`/agent/${userId}/profile-picture`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (agentProfile) {
        setAgentProfile({ ...agentProfile, profile_picture: response.data.profile_picture });
      }
    } catch (err) {
      setError('Failed to upload profile picture.');
    }
  };

  if (!token || !userId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-red-500">Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-orange-500 mb-6">Agent Profile</h1>

      {isLoading && <p className="text-gray-500">Loading profile...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!isLoading && agentProfile && (
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <div className="w-24 h-24 rounded-full overflow-hidden border">
              <img
                src={agentProfile.profile_picture || '/default-avatar.png'}
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
                value={agentProfile.name}
                onChange={(e) => setAgentProfile({ ...agentProfile, name: e.target.value })}
                disabled={!isEditing}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700">Email</label>
              <input
                type="email"
                value={agentProfile.email}
                onChange={(e) => setAgentProfile({ ...agentProfile, email: e.target.value })}
                disabled={!isEditing}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700">Phone</label>
              <input
                type="text"
                value={agentProfile.phone || ''}
                onChange={(e) => setAgentProfile({ ...agentProfile, phone: e.target.value })}
                disabled={!isEditing}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="space-y-4 border-t pt-4">
              <h2 className="text-lg font-semibold text-gray-700">Business Information</h2>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700">Business Name</label>
                <input
                  type="text"
                  value={agentProfile.business_name || ''}
                  onChange={(e) => setAgentProfile({ ...agentProfile, business_name: e.target.value })}
                  disabled={!isEditing}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700">Business Email</label>
                <input
                  type="email"
                  value={agentProfile.business_email || ''}
                  onChange={(e) => setAgentProfile({ ...agentProfile, business_email: e.target.value })}
                  disabled={!isEditing}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700">Business Phone</label>
                <input
                  type="text"
                  value={agentProfile.business_phone || ''}
                  onChange={(e) => setAgentProfile({ ...agentProfile, business_phone: e.target.value })}
                  disabled={!isEditing}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700">Business Address</label>
                <textarea
                  value={agentProfile.business_address || ''}
                  onChange={(e) => setAgentProfile({ ...agentProfile, business_address: e.target.value })}
                  disabled={!isEditing}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700">Country</label>
                  <input
                    type="text"
                    value={agentProfile.country || ''}
                    onChange={(e) => setAgentProfile({ ...agentProfile, country: e.target.value })}
                    disabled={!isEditing}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700">State</label>
                  <input
                    type="text"
                    value={agentProfile.state || ''}
                    onChange={(e) => setAgentProfile({ ...agentProfile, state: e.target.value })}
                    disabled={!isEditing}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700">City</label>
                  <input
                    type="text"
                    value={agentProfile.city || ''}
                    onChange={(e) => setAgentProfile({ ...agentProfile, city: e.target.value })}
                    disabled={!isEditing}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
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


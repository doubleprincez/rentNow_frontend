
'use client';

import React, { useState, useEffect } from 'react';
import { AxiosApi } from '@/services/backend-api';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  country: string | null;
  state: string | null;
  city: string | null;
  address: string | null;
}

const UserSettings: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const { token, userId } = useSelector((state: RootState) => state.auth);
  const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL;

  useEffect(() => {
    fetchProfile();
  }, [token, userId]);

  const fetchProfile = async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await AxiosApi('user', token).get(baseURL + '/profile');
      setProfile(response.data.data);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load profile",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !token) return;

    setIsSaving(true);
    try {
      await AxiosApi('user', token).put(baseURL + '/user-profile', profile);
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      setIsEditing(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error?.response?.data?.message || "Failed to update profile",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (!token) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-red-500">Please log in to view your settings.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-6">User Settings</h1>

      <Card className="p-6">
        <form onSubmit={handleUpdateProfile}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={profile?.name || ''}
                onChange={(e) => setProfile(profile ? { ...profile, name: e.target.value } : null)}
                disabled={!isEditing}
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profile?.email || ''}
                disabled
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={profile?.phone || ''}
                onChange={(e) => setProfile(profile ? { ...profile, phone: e.target.value } : null)}
                disabled={!isEditing}
              />
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={profile?.address || ''}
                onChange={(e) => setProfile(profile ? { ...profile, address: e.target.value } : null)}
                disabled={!isEditing}
              />
            </div>

            <div className="flex gap-2">
              {!isEditing ? (
                <Button type="button" onClick={() => setIsEditing(true)}>
                  Edit Profile
                </Button>
              ) : (
                <>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      fetchProfile();
                    }}
                  >
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default UserSettings;
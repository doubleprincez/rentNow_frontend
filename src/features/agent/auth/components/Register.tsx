'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { useAlert } from '@/contexts/AlertContext';
import { z } from 'zod';
import {baseURL} from "@/../next.config";

const registerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  email: z.string().email('Invalid email').max(255),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  password_confirmation: z.string(),
  business_name: z.string().min(1, 'Business name is required').max(255),
  business_email: z.string().email('Invalid business email').max(255).optional(),
  business_phone: z.string().max(255),
  business_address: z.string().max(255).nullable(),
  country: z.string().min(1, 'Country is required').max(255),
  state: z.string().max(255).nullable(),
  city: z.string().max(255).nullable(),
  lat: z.string().max(255).nullable(),
  long: z.string().max(255).nullable(),
  agent_type: z.string().min(1, 'Agent type is required'),
}).refine((data) => data.password === data.password_confirmation, {
  message: "Passwords don't match",
  path: ["password_confirmation"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

const Register: React.FC = () => {
  const { showAlert } = useAlert();
  const router = useRouter();

  const [formData, setFormData] = useState<RegisterFormData>({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    business_name: '',
    business_email: '',
    business_phone: '',
    business_address: '',
    country: 'Nigeria', 
    state: null,
    city: null,
    lat: null,
    long: null,
    agent_type: '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
      const validatedData = registerSchema.parse(formData);

      const payload = {
        ...validatedData,
        account_id: 2 
      };

      const response = await axios.post(baseURL+'/register-agent', payload);

      if (response.data.success) {
        showAlert("Registration successful! Redirecting to login...", "success");
        setTimeout(() => router.push('/agents/auth/login'), 2000);
      }
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        // Handle validation errors
        const fieldErrors: { [key: string]: string } = {};
        error.errors.forEach((err) => {
          if (err.path) {
            fieldErrors[err.path[0]] = err.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
        showAlert(errorMessage, "error");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center px-4 py-4">
      <div className="w-full">
        <h1 className="text-center text-2xl font-bold text-orange-500 mb-6">
          Agent Registration
        </h1>

        <form onSubmit={handleRegister} className="space-y-6">
          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full border border-gray-300 text-sm rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500"
                required
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full border border-gray-300 text-sm rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500"
                required
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>
          </div>

          {/* Agent Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Agent Type *
            </label>
            <select
              name="agent_type"
              value={formData.agent_type}
              onChange={handleChange}
              className="w-full text-sm border border-gray-300 rounded-lg px-4 py-2 bg-white focus:ring-2 focus:ring-orange-500"
              required
            >
              <option value="">Select Agent Type</option>
              <option value="Agent">Agent</option>
              <option value="Caretaker">Caretaker</option>
              <option value="Company">Company</option>
              <option value="Landlord">Landlord</option>
            </select>
            {errors.agent_type && <p className="text-red-500 text-sm mt-1">{errors.agent_type}</p>}
          </div>

          {/* Business Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Business Name *
              </label>
              <input
                type="text"
                name="business_name"
                value={formData.business_name}
                onChange={handleChange}
                className="w-full border border-gray-300 text-sm rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500"
                required
              />
              {errors.business_name && <p className="text-red-500 text-sm mt-1">{errors.business_name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Business Email
              </label>
              <input
                type="email"
                name="business_email"
                value={formData.business_email || ''}
                onChange={handleChange}
                className="w-full border border-gray-300 text-sm rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500"
              />
              {errors.business_email && <p className="text-red-500 text-sm mt-1">{errors.business_email}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Business Phone
              </label>
              <input
                type="tel"
                name="business_phone"
                value={formData.business_phone || ''}
                onChange={handleChange}
                className="w-full border border-gray-300 text-sm rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Business Address
              </label>
              <input
                type="text"
                name="business_address"
                value={formData.business_address || ''}
                onChange={handleChange}
                className="w-full border border-gray-300 text-sm rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          {/* Location */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country *
              </label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="w-full border text-sm border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500"
                required
              />
              {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State
              </label>
              <input
                type="text"
                name="state"
                value={formData.state || ''}
                onChange={handleChange}
                className="w-full border border-gray-300 text-sm rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <input
                type="text"
                name="city"
                value={formData.city || ''}
                onChange={handleChange}
                className="w-full border border-gray-300 text-sm rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          {/* Password */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password *
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500"
                required
              />
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password *
              </label>
              <input
                type="password"
                name="password_confirmation"
                value={formData.password_confirmation}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500"
                required
              />
              {errors.password_confirmation && (
                <p className="text-red-500 text-sm mt-1">{errors.password_confirmation}</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          Already have an account?{' '}
          <Link href="/agents/auth/login" className="text-orange-500 hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;

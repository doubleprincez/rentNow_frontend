'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { useAlert } from '@/contexts/AlertContext'; 

const Register: React.FC = () => {
  const { showAlert } = useAlert();

  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    phoneNumber: '',
    email: '',
    officeAddress: '',
    businessName: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match!');
      return;
    }

    try {
      const response = await axios.post('/api/agents/register', formData);
      if (response.status === 201) {
        setSuccess('Registration successful! Redirecting...');
        showAlert("Registration successful! Redirecting...", "success");
        setTimeout(() => router.push('/agents/login'), 2000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
      showAlert(err.response?.data?.message || 'Registration failed. Please try again.', "error");
    }
  };

  return (
    <div className="flex items-center justify-center px-4">
      <div className="w-full bg-white p-2">
        <div className="mb-2 text-center text-[1.5em] md:text-[2em] font-semibold text-orange-500">
          Register
        </div>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {success && <p className="text-green-500 text-center mb-4">{success}</p>}
        <form onSubmit={handleRegister} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstname" className="block text-[.9em] text-gray-700 font-medium mb-2">
                First Name
              </label>
              <input
                type="text"
                id="firstname"
                name="firstname"
                value={formData.firstname}
                onChange={handleChange}
                className="w-full border border-gray-400 rounded-lg px-4 py-2 text-[.9em] focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Enter your first name"
                required
              />
            </div>
            <div>
              <label htmlFor="lastname" className="block text-[.9em] text-gray-700 font-medium mb-2">
                Last Name
              </label>
              <input
                type="text"
                id="lastname"
                name="lastname"
                value={formData.lastname}
                onChange={handleChange}
                className="w-full border border-gray-400 rounded-lg px-4 py-2 text-[.9em] focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Enter your last name"
                required
              />
            </div>
          </div>
          <div>
            <label htmlFor="phoneNumber" className="block text-[.9em] text-gray-700 font-medium mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              className="w-full border border-gray-400 rounded-lg px-4 py-2 text-[.9em] focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Enter your phone number"
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-[.9em] text-gray-700 font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border border-gray-400 rounded-lg px-4 py-2 text-[.9em] focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Enter your email"
              required
            />
          </div>
          <div>
            <label htmlFor="officeAddress" className="block text-[.9em] text-gray-700 font-medium mb-2">
              Office Address
            </label>
            <input
              type="text"
              id="officeAddress"
              name="officeAddress"
              value={formData.officeAddress}
              onChange={handleChange}
              className="w-full border border-gray-400 rounded-lg px-4 py-2 text-[.9em] focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Enter your office address"
              required
            />
          </div>
          <div>
            <label htmlFor="businessName" className="block text-[.9em] text-gray-700 font-medium mb-2">
              Business Name
            </label>
            <input
              type="text"
              id="businessName"
              name="businessName"
              value={formData.businessName}
              onChange={handleChange}
              className="w-full border border-gray-400 rounded-lg px-4 py-2 text-[.9em] focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Enter your business name"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-[.9em] text-gray-700 font-medium mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full border border-gray-400 rounded-lg px-4 py-2 text-[.9em] focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Enter your password"
              required
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-[.9em] text-gray-700 font-medium mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full border border-gray-400 rounded-lg px-4 py-2 text-[.9em] focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Confirm your password"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-orange-500 text-white font-semibold py-3 rounded-lg hover:bg-orange-600"
          >
            Register
          </button>
        </form>
        <p className="text-center text-gray-600 mt-4 text-[.9em]">
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

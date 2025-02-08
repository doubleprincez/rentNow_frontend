'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { useAlert } from '@/contexts/AlertContext';
import { z } from 'zod';

// Validation schema
const registerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  email: z.string().email('Invalid email').max(255),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  password_confirmation: z.string(),
  business_name: z.string().min(1, 'Business name is required').max(255),
  business_email: z.string().email('Invalid business email').max(255).optional(),
  business_phone: z.string().max(255).nullable(),
  business_address: z.string().max(255).nullable(),
  country: z.string().min(1, 'Country is required').max(255),
  state: z.string().max(255).nullable(),
  city: z.string().max(255).nullable(),
  lat: z.string().max(255).nullable(),
  long: z.string().max(255).nullable(),
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
    business_phone: null,
    business_address: null,
    country: 'Nigeria', 
    state: null,
    city: null,
    lat: null,
    long: null,
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
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
      // Validate form data
      const validatedData = registerSchema.parse(formData);

      // Add account_id to the payload
      const payload = {
        ...validatedData,
        account_id: 2 // Agent account type
      };

      const response = await axios.post('https://api.rent9ja.com.ng/api/register-agent', payload);

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
        // Handle API errors
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
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500"
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
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500"
                required
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>
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
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500"
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
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500"
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
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500"
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
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500"
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
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500"
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
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500"
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
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500"
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
          <Link href="/agents/login" className="text-orange-500 hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;

// 'use client';
// import React, { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import axios from 'axios';
// import Link from 'next/link';
// import { useAlert } from '@/contexts/AlertContext'; 

// const Register: React.FC = () => {
//   const { showAlert } = useAlert();

//   const [formData, setFormData] = useState({
//     firstname: '',
//     lastname: '',
//     phoneNumber: '',
//     email: '',
//     officeAddress: '',
//     businessName: '',
//     password: '',
//     confirmPassword: '',
//   });
//   const [error, setError] = useState<string | null>(null);
//   const [success, setSuccess] = useState<string | null>(null);
//   const router = useRouter();

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setFormData({ ...formData, [name]: value });
//   };

//   const handleRegister = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError(null);
//     setSuccess(null);

//     if (formData.password !== formData.confirmPassword) {
//       setError('Passwords do not match!');
//       return;
//     }

//     try {
//       const response = await axios.post('/api/agents/register', formData);
//       if (response.status === 201) {
//         setSuccess('Registration successful! Redirecting...');
//         showAlert("Registration successful! Redirecting...", "success");
//         setTimeout(() => router.push('/agents/login'), 2000);
//       }
//     } catch (err: any) {
//       setError(err.response?.data?.message || 'Registration failed. Please try again.');
//       showAlert(err.response?.data?.message || 'Registration failed. Please try again.', "error");
//     }
//   };

//   return (
//     <div className="flex items-center justify-center px-4">
//       <div className="w-full bg-white p-2">
//         <div className="mb-2 text-center text-[1.5em] md:text-[2em] font-semibold text-orange-500">
//           Register
//         </div>
//         {error && <p className="text-red-500 text-center mb-4">{error}</p>}
//         {success && <p className="text-green-500 text-center mb-4">{success}</p>}
//         <form onSubmit={handleRegister} className="space-y-6">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div>
//               <label htmlFor="firstname" className="block text-[.9em] text-gray-700 font-medium mb-2">
//                 First Name
//               </label>
//               <input
//                 type="text"
//                 id="firstname"
//                 name="firstname"
//                 value={formData.firstname}
//                 onChange={handleChange}
//                 className="w-full border border-gray-400 rounded-lg px-4 py-2 text-[.9em] focus:outline-none focus:ring-2 focus:ring-orange-500"
//                 placeholder="Enter your first name"
//                 required
//               />
//             </div>
//             <div>
//               <label htmlFor="lastname" className="block text-[.9em] text-gray-700 font-medium mb-2">
//                 Last Name
//               </label>
//               <input
//                 type="text"
//                 id="lastname"
//                 name="lastname"
//                 value={formData.lastname}
//                 onChange={handleChange}
//                 className="w-full border border-gray-400 rounded-lg px-4 py-2 text-[.9em] focus:outline-none focus:ring-2 focus:ring-orange-500"
//                 placeholder="Enter your last name"
//                 required
//               />
//             </div>
//           </div>
//           <div>
//             <label htmlFor="phoneNumber" className="block text-[.9em] text-gray-700 font-medium mb-2">
//               Phone Number
//             </label>
//             <input
//               type="tel"
//               id="phoneNumber"
//               name="phoneNumber"
//               value={formData.phoneNumber}
//               onChange={handleChange}
//               className="w-full border border-gray-400 rounded-lg px-4 py-2 text-[.9em] focus:outline-none focus:ring-2 focus:ring-orange-500"
//               placeholder="Enter your phone number"
//               required
//             />
//           </div>
//           <div>
//             <label htmlFor="email" className="block text-[.9em] text-gray-700 font-medium mb-2">
//               Email
//             </label>
//             <input
//               type="email"
//               id="email"
//               name="email"
//               value={formData.email}
//               onChange={handleChange}
//               className="w-full border border-gray-400 rounded-lg px-4 py-2 text-[.9em] focus:outline-none focus:ring-2 focus:ring-orange-500"
//               placeholder="Enter your email"
//               required
//             />
//           </div>
//           <div>
//             <label htmlFor="officeAddress" className="block text-[.9em] text-gray-700 font-medium mb-2">
//               Office Address
//             </label>
//             <input
//               type="text"
//               id="officeAddress"
//               name="officeAddress"
//               value={formData.officeAddress}
//               onChange={handleChange}
//               className="w-full border border-gray-400 rounded-lg px-4 py-2 text-[.9em] focus:outline-none focus:ring-2 focus:ring-orange-500"
//               placeholder="Enter your office address"
//               required
//             />
//           </div>
//           <div>
//             <label htmlFor="businessName" className="block text-[.9em] text-gray-700 font-medium mb-2">
//               Business Name
//             </label>
//             <input
//               type="text"
//               id="businessName"
//               name="businessName"
//               value={formData.businessName}
//               onChange={handleChange}
//               className="w-full border border-gray-400 rounded-lg px-4 py-2 text-[.9em] focus:outline-none focus:ring-2 focus:ring-orange-500"
//               placeholder="Enter your business name"
//               required
//             />
//           </div>
//           <div>
//             <label htmlFor="password" className="block text-[.9em] text-gray-700 font-medium mb-2">
//               Password
//             </label>
//             <input
//               type="password"
//               id="password"
//               name="password"
//               value={formData.password}
//               onChange={handleChange}
//               className="w-full border border-gray-400 rounded-lg px-4 py-2 text-[.9em] focus:outline-none focus:ring-2 focus:ring-orange-500"
//               placeholder="Enter your password"
//               required
//             />
//           </div>
//           <div>
//             <label htmlFor="confirmPassword" className="block text-[.9em] text-gray-700 font-medium mb-2">
//               Confirm Password
//             </label>
//             <input
//               type="password"
//               id="confirmPassword"
//               name="confirmPassword"
//               value={formData.confirmPassword}
//               onChange={handleChange}
//               className="w-full border border-gray-400 rounded-lg px-4 py-2 text-[.9em] focus:outline-none focus:ring-2 focus:ring-orange-500"
//               placeholder="Confirm your password"
//               required
//             />
//           </div>
//           <button
//             type="submit"
//             className="w-full bg-orange-500 text-white font-semibold py-3 rounded-lg hover:bg-orange-600"
//           >
//             Register
//           </button>
//         </form>
//         <p className="text-center text-gray-600 mt-4 text-[.9em]">
//           Already have an account?{' '}
//           <Link href="/agents/auth/login" className="text-orange-500 hover:underline">
//             Login here
//           </Link>
//         </p>
//       </div>
//     </div>
//   );
// };

// export default Register;

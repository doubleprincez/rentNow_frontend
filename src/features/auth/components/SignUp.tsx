"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@radix-ui/react-label";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { AppleIcon, GoogleIcon } from "@/icons";
import axios from "axios";
import { useAlert } from '@/contexts/AlertContext';
import {baseURL} from "../../../../next.config";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  agreeTerms: boolean;
}

const SignUp: React.FC<{ isPageVisible: boolean }> = ({ isPageVisible }) => {
  const { showAlert } = useAlert();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });

  const router = useRouter();

  useEffect(() => {
    axios.defaults.withCredentials = true;
    axios.defaults.headers.common['Accept'] = 'application/json';
    axios.defaults.headers.common['Content-Type'] = 'application/json';
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLInputElement>
  ): void => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validateForm = (): string | null => {
    if (!formData.firstName || !formData.lastName) {
      return "Please enter your full name";
    }
    if (!formData.email) {
      return "Please enter your email";
    }
    if (!formData.phoneNumber) {
      return "Please enter your phone number";
    }
    if (formData.password.length < 8) {
      return "Password must be at least 8 characters long";
    }
    if (formData.password !== formData.confirmPassword) {
      return "Passwords do not match";
    }
    if (!formData.agreeTerms) {
      return "You must agree to the terms and policy";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      showAlert("Validation Error", "error")
      return;
    }

    setIsLoading(true);

    const requestData = {
      name: `${formData.firstName} ${formData.lastName}`,
      account_id: 1,
      email: formData.email,
      phone: formData.phoneNumber,
      password: formData.password,
      password_confirmation: formData.confirmPassword,
    };

    try {
      //console.log('Sending registration request:', requestData); // Debug log
      const response = await axios.post(baseURL+'/register', requestData);
      
      //console.log('Registration response:', response.data); // Debug log

      showAlert("Registration successful. Redirecting to login...", "success")
      
      setTimeout(() => {
        router.push("/auth/login");
      }, 1000);

    } catch (error: any) {
      //console.error('Full error object:', error); // Debug log
      showAlert(`Full error object: ${error}`, 'error')

      let errorMessage = "An error occurred during registration";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        const firstError = Object.values(error.response.data.errors)[0];
        errorMessage = Array.isArray(firstError) ? firstError[0] : String(firstError);
      }

      showAlert(`Registration Failed`, 'error')
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="w-full lg:w-[70%] mx-auto">
      <motion.div
          className="relative flex flex-col gap-2 items-center justify-center w-full h-screen md:overflow-hidden overflow-y-scroll"
          initial={{opacity: 0}}
          animate={{opacity: isPageVisible ? 1 : 0}}
          transition={{duration: 1.5, ease: "easeInOut"}}
      >
        <Link href="/" className="text-[1.5em] font-semibold text-orange-500">
          Rent<span className="text-green-500">Now</span>
        </Link>

        <div className="w-full font-bold">
          <h4 className="text-2xl">Register</h4>
        </div>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-2 md:gap-4">
          <div className="flex flex-col w-full gap-2 md:gap-4">
            <div className="grid grid-cols-2 items-center gap-2">
              <div className="w-full flex flex-col gap-1">
                <Label className="text-[.8em] font-bold">First Name</Label>
                <Input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="First Name"
                    className="border-[1px] placeholder:text-gray-400 text-[.8em] w-full py-1 outline-none focus-visible:border-main rounded-md"
                    required
                />
              </div>

              <div className="w-full flex flex-col gap-1">
                <Label className="text-[.8em] font-bold">Last Name</Label>
                <Input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Last Name"
                    className="border-[1px] placeholder:text-gray-400 text-[.8em] w-full py-1 outline-none focus-visible:border-main rounded-md"
                    required
                />
              </div>
            </div>

            <div className="w-full flex flex-col gap-1">
              <Label className="text-[.8em] font-bold">Phone Number</Label>
              <Input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="Phone Number"
                  className="border-[1px] placeholder:text-gray-400 text-[.8em] w-full py-1 outline-none focus-visible:border-main rounded-md"
                  required
              />
            </div>

            <div className="w-full flex flex-col gap-1">
              <Label className="text-[.8em] font-bold">Email</Label>
              <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email"
                  className="border-[1px] placeholder:text-gray-400 text-[.8em] w-full py-1 outline-none focus-visible:border-main rounded-md"
                  required
              />
            </div>

            <div className="grid grid-cols-2 items-center gap-2">
              <div className="w-full flex flex-col gap-1">
                <Label className="text-[.8em] font-bold">Password</Label>
                <Input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Password"
                    className="border-[1px] placeholder:text-gray-400 text-[.8em] w-full py-1 outline-none focus-visible:border-main rounded-md"
                    required
                />
              </div>

              <div className="w-full flex flex-col gap-1">
                <Label className="text-[.8em] font-bold">Confirm Password</Label>
                <Input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm Password"
                    className="border-[1px] placeholder:text-gray-400 text-[.8em] w-full py-1 outline-none focus-visible:border-main rounded-md"
                    required
                />
              </div>
            </div>
          </div>

          <div>
            <p className="flex gap-2 items-center">
              <Checkbox
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onCheckedChange={(checked: boolean) =>
                      setFormData((prevState) => ({...prevState, agreeTerms: checked}))
                  }
                  className="border-[2px] border-black checked:bg-main"
              />
              <div className="flex gap-1">
                <span className="text-[.7em] font-semibold">I agree to the </span>
                <span
                    className="text-[.7em] font-semibold underline cursor-pointer hover:text-[#224aa0]">terms & policy</span>
              </div>
            </p>
          </div>

          <button
              disabled={isLoading}
              type="submit"
              className="w-full py-2 rounded-md bg-main hover:bg-main/80 text-white bg-orange-500 font-semibold"
          >
            {isLoading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <div className="w-full flex flex-col md:flex-row gap-2 px-2">
          <Link
              href='/agents/auth/register'
              className="w-full bg-green-600 hover:bg-green-600/80 text-sm text-white font-semibold text-center px-4 py-2 rounded-md"
          >
            Sign up as Agent
          </Link>
        </div>
        <div className="flex justify-center items-center gap-2 w-full">
          <div className="h-[1px] w-full bg-gray-400 mt-1"></div>
          <span className="text-gray-500 font-semibold text-[.9em]">or</span>
          <div className="h-[1px] w-full bg-gray-400 mt-1"></div>
        </div>

        <div className="text-center text-[.8em] font-bold">
          <p>
            Have an account?{" "}
            <button onClick={() => router.push("/auth/login")} className="text-[#224aa0]">
              Sign in
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default SignUp;
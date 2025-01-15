"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@radix-ui/react-label";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import { AppleIcon, GoogleIcon } from '@/icons';
import ForgetPwd from "./ForgetPwd";
import { DialogTitle } from "@radix-ui/react-dialog";
import { useDispatch } from "react-redux";
import { login } from "@/redux/userSlice";
import { useAlert } from '@/contexts/AlertContext';
import axios from 'axios';

const Login = ({ isPageVisible }: { isPageVisible: boolean }) => {
    const { showAlert } = useAlert();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        password: "",
        email: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();
    const dispatch = useDispatch();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

    // const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    // e.preventDefault();
    // setIsLoading(true);

    // try {
    //     const response = await fetch("/api/login", {
    //         method: "POST",
    //         headers: {
    //             "Content-Type": "application/json",
    //         },
    //         body: JSON.stringify(formData),
    //     });

    //     if (!response.ok) {
    //         throw new Error("Invalid email or password");
    //     }

    //     const data = await response.json();

    //     dispatch(
    //         login({
    //             firstName: data.firstName,
    //             lastName: data.lastName,
    //             email: data.email,
    //             phoneNumber: data.phoneNumber,
    //         })
    //     );
    //     showAlert("Login Successful", "success")

    //     router.push("/");
    //     } catch (error: any) {
    //         showAlert(error.message, "error");
    //     } finally {
    //         setIsLoading(false);

    //     }
    // };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await axios({
                method: 'GET',
                url: 'https://api.rent9ja.com.ng/api/login',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                data: {
                    email: formData.email,
                    password: formData.password
                }
            });

            const data = response.data;

            dispatch(
                login({
                    firstName: data.firstName,
                    lastName: data.lastName,
                    email: data.email,
                    phoneNumber: data.phoneNumber,
                })
            );
            showAlert("Login Successful", "success");
            router.push("/");
        } catch (error: any) {
            showAlert(
                error.response?.data?.message || "Login failed. Please try again.",
                "error"
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleNavigation = () => {
        router.push("/auth/signup");
    };

    return (
        <Dialog>
            <div className="w-full lg:w-[60%] mx-auto">
                <motion.div
                className="relative flex flex-col gap-2 items-center justify-center w-full h-screen overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: isPageVisible ? 1 : 0 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                >
                <form
                    className="overflow-hidden w-full flex flex-col gap-2 md:gap-6 items-center justify-center"
                    onSubmit={handleSubmit}
                >
                    <Link href="/" className="text-[1.5em] font-semibold text-orange-500">
                        Rent<span className="text-green-500">Naija</span>
                    </Link>

                    <div className="w-full font-bold">
                        <h4 className="text-2xl">Welcome back!</h4>
                        <span className="w-[40%] text-[.85em]">
                            Enter your Credentials to access your account
                        </span>
                    </div>

                    <div className="w-full flex flex-col px-2 gap-4">
                        <div>
                            <Label htmlFor="email" className="text-[.8em] font-bold">
                                Email address
                            </Label>
                            <Input
                                type="email"
                                name="email"
                                id="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter email"
                                className="border-[1px] placeholder:text-gray-400 text-[.8em] w-full px-2 py-1 outline-none focus-visible:border-main rounded-md"
                            />
                        </div>

                        <div>
                            <div className="flex justify-between">
                                <Label htmlFor="password" className="text-[.8em] font-bold">
                                    Password
                                </Label>

                                <DialogTrigger
                                    value="forgot-password"
                                    className="text-orange-500 text-[.7em] font-bold"
                                >
                                    Forgot password
                                </DialogTrigger>

                                <DialogContent className="bg-white rounded-md p-4">
                                    <DialogTitle>
                                        <div className="w-full text-center text-[1.2em] font-semibold text-orange-500">
                                            Rent<span className="text-green-500">Naija</span>
                                        </div>
                                    </DialogTitle>
                                    <ForgetPwd />
                                </DialogContent>
                            </div>

                            <div className="relative">
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    id="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Enter password"
                                    className="border-[1px] placeholder:text-gray-400 text-[.8em] w-full px-2 py-1 outline-none focus-visible:border-main rounded-md"
                                />
                                <Button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                                >
                                    {showPassword ? (
                                    <EyeOff className="h-5 w-5 text-gray-500" />
                                    ) : (
                                    <Eye className="h-5 w-5 text-gray-500" />
                                    )}
                                </Button>
                            </div>
                        </div>

                        <div>
                            <p className="flex gap-2 items-center">
                            <Checkbox
                                name="agreeTerms"
                                className="border-[2px] border-black checked:bg-main"
                            />
                            <span className="text-[.7em] font-semibold">Remember me</span>
                            </p>
                        </div>

                        <div className="flex">
                            <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-orange-500 hover:bg-orange-500/80 text-white font-semibold"
                            >
                            {isLoading ? "Logging in..." : "Log in"}
                            </Button>
                        </div>
                    </div>
                </form>

                <div className="flex justify-center items-center gap-2 w-full">
                    <div className="h-[1px] w-full bg-gray-400 mt-1"></div>
                    <span className="text-gray-500 font-semibold text-[.9em]">or</span>
                    <div className="h-[1px] w-full bg-gray-400 mt-1"></div>
                </div>

                <div className="flex flex-col md:flex-row gap-2 px-2">
                    <Button className="w-full flex justify-start items-center gap-2 px-4 border-[1px] border-gray-300 hover:border-main duration-150 ease-in-out">
                    <GoogleIcon />
                    <span className="text-black font-semibold text-[.9em]">
                        Sign in with Google
                    </span>
                    </Button>

                    <Button className="w-full flex justify-start items-center gap-2 px-4 border-[1px] border-gray-300 hover:border-main duration-150 ease-in-out">
                    <AppleIcon />
                    <span className="text-black font-semibold text-[.9em]">
                        Sign in with Apple
                    </span>
                    </Button>
                </div>

                <div className="text-center text-[.8em] font-bold">
                    <p>
                    Don&apos;t have an account?{" "}
                    <button onClick={handleNavigation} className="text-[#224aa0]">
                        Sign Up
                    </button>
                    </p>
                </div>
                </motion.div>
            </div>
        </Dialog>
    );
};

export default Login;

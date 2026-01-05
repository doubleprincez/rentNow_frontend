"use client";
import React, {useState} from "react";
import {motion} from "framer-motion";
import axios from "axios";
import {CheckCircle} from "lucide-react";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {baseURL} from "@/../next.config";
import {useAlert} from "@/contexts/AlertContext";

const ForgetPwd = () => {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const {showAlert} = useAlert();

    const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!email) {
            showAlert("Please enter a valid email.", "error");
            return;
        }

        setIsLoading(true);
        const intended = window.location.href;
        try {
            const response = await axios.post(baseURL + "/forgot-password", {email, intended});
            // console.log("User Response:", response.data);
            setStep(2); // Change step based on successful backend response
        } catch (error:any) {
            showAlert(error.message ?? error?.response?.data?.message ?? "Unable to Process, Please try again.", "error")
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full flex items-center justify-center">
            <motion.div
                className="w-full p-6 bg-white flex flex-col gap-6"
                initial={{opacity: 0, y: 30}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.5}}
            >
                {step === 1 && (
                    <motion.div
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        transition={{duration: 0.3}}
                        className="flex flex-col gap-4"
                    >
                        <h3 className="text-2xl font-bold text-center">Forgot Password</h3>
                        <p className="text-sm text-center text-gray-600">
                            Enter your email address and we’ll send you instructions to reset
                            your password.
                        </p>
                        <form onSubmit={handleEmailSubmit} className="flex flex-col gap-4">
                            <Input
                                type="email"
                                name="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full border-[1px] placeholder:text-gray-400 text-sm py-2 outline-none rounded-md"
                                required
                            />
                            <Button
                                type="submit"
                                className="w-full py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-md"
                                disabled={isLoading}
                            >
                                {isLoading ? "Sending..." : "Send Reset Email"}
                            </Button>
                        </form>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        transition={{duration: 0.3}}
                        className="flex flex-col items-center gap-4 text-center"
                    >
                        <CheckCircle className="text-green-500" size={48}/>
                        <h3 className="text-2xl font-bold">Check Your Email</h3>
                        <p className="text-sm text-gray-600">
                            A password reset email has been sent to{" "}
                            <span className="font-semibold">{email}</span>. Follow the
                            instructions to reset your password.
                        </p>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
};

export default ForgetPwd;
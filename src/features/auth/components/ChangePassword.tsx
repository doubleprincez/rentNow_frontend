"use client";
import React, {useState} from "react";
import {useRouter, useSearchParams} from "next/navigation";
import {Label} from "@radix-ui/react-label";
import {Input} from "@/components/ui/input";
import {useAlert} from "@/contexts/AlertContext";
import {baseURL} from "@/../next.config";
import {AxiosApi} from "@/lib/utils";

interface ChangePasswordProps {
    token: string; // Explicitly type the token prop
}

const ChangePassword: React.FC<ChangePasswordProps> = ({token}) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get("email");
    const {showAlert} = useAlert();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        token: token,
        email: email,
        password: "",
        password_confirmation: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setFormData((prev) => ({...prev, [name]: value}));
    };

    const handlePasswordUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (formData.password !== formData.password_confirmation) {
            showAlert("Passwords do not match.", "error");
            return;
        }

        setIsLoading(true);
        try {
            const response = await AxiosApi().post(baseURL + "/reset-password", formData);
            if (response.data?.redirect_url) {
                window.location.href = response.data.redirect_url;
            } else {
                showAlert("Password updated successfully. Redirecting to login...", "success");
                setTimeout(() => {
                    router.push("/auth/login"); // Use Next.js router for internal navigation
                }, 1500);
            }
        } catch (error: any) {
            showAlert(
                error?.response?.data?.message ||
                error?.message ||
                "Unable to update password. Please try again.",
                "error"
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            className="w-full px-1 py-20 md:py-32 flex flex-col gap-2 md:gap-4 items-center justify-start bg-gray-100 min-h-screen">
            <div className="w-3/4 md:2/4 ">
                <h3 className="text-lg font-bold">Change Password</h3>
                <p>Account: {email}</p>
                <div className="p-3">
                    <form onSubmit={handlePasswordUpdate}>
                        <div className="grid grid-cols-1 items-center gap-4">
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
                                    name="password_confirmation"
                                    value={formData.password_confirmation}
                                    onChange={handleChange}
                                    placeholder="Confirm Password"
                                    className="border-[1px] placeholder:text-gray-400 text-[.8em] w-full py-1 outline-none focus-visible:border-main rounded-md"
                                    required
                                />
                            </div>
                            <div>
                                <button
                                    disabled={isLoading}
                                    type="submit"
                                    className="w-full py-2 rounded-md bg-main hover:bg-main/80 text-white bg-orange-500 font-semibold"
                                >
                                    {isLoading ? "Updating..." : "Update"}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ChangePassword;
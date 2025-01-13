// "use client";
// import React, { useState } from "react";
// import { motion } from "framer-motion";
// import { useRouter } from "next/navigation";
// import { Button } from "@/components/ui/button";
// import { Label } from "@radix-ui/react-label";
// import { Checkbox } from "@/components/ui/checkbox";
// import Link from "next/link";
// import { Input } from "@/components/ui/input";
// import { AppleIcon, GoogleIcon } from "@/icons";
// import axios from "axios";

// const SignUp = ({ isPageVisible }: { isPageVisible: boolean }) => {
//     const [isLoading, setIsLoading] = useState(false);
//     const router = useRouter();
//     const [formData, setFormData] = useState({
//         firstName: "",
//         lastName: "",
//         email: "",
//         phoneNumber: "",
//         password: "",
//         confirmPassword: "",
//     });

//     const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//         const { name, value } = e.target;
//         setFormData({
//             ...formData,
//             [name]: value,
//         });
//     };

//     const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//         e.preventDefault();
//         setIsLoading(true);
//         if (formData.password !== formData.confirmPassword) {
//             setIsLoading(false);
//             alert("Passwords do not match.");
//             return;
//         }

//         try {
//             const response = await axios.post("/api/register", formData);
//             setIsLoading(false);
//             alert("Registration successful!");
//             router.push("/auth/login");
//         } catch (error) {
//             setIsLoading(false);
//             console.error("Error during registration:", error);
//             alert("An error occurred during registration. Please try again.");
//         }
//     };

//     return (
//         <div className="w-full lg:w-[70%] mx-auto">
//             <motion.div
//                 className="relative flex flex-col gap-2 items-center justify-center w-full h-screen md:overflow-hidden overflow-y-scroll"
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: isPageVisible ? 1 : 0 }}
//                 transition={{ duration: 1.5, ease: "easeInOut" }}
//             >
//                 <Link href="/" className="text-[1.5em] font-semibold text-orange-500">
//                     Rent<span className="text-green-500">Naija</span>
//                 </Link>

//                 <div className="w-full font-bold">
//                     <h4 className="text-2xl">Register</h4>
//                 </div>

//                 <form onSubmit={handleSubmit} className="w-full flex flex-col gap-2 md:gap-4">
//                     <div className="flex flex-col w-full gap-2 md:gap-4">
//                         <div className="grid grid-cols-2 items-center gap-2">
//                             <div className="w-full flex flex-col gap-1">
//                                 <Label className="text-[.8em] font-bold">First Name</Label>
//                                 <Input
//                                     type="text"
//                                     name="firstName"
//                                     value={formData.firstName}
//                                     onChange={handleChange}
//                                     placeholder="First Name"
//                                     className="border-[1px] placeholder:text-gray-400 text-[.8em] w-full py-1 outline-none focus-visible:border-main rounded-md"
//                                     required
//                                 />
//                             </div>

//                             <div className="w-full flex flex-col gap-1">
//                                 <Label className="text-[.8em] font-bold">Last Name</Label>
//                                 <Input
//                                     type="text"
//                                     name="lastName"
//                                     value={formData.lastName}
//                                     onChange={handleChange}
//                                     placeholder="Last Name"
//                                     className="border-[1px] placeholder:text-gray-400 text-[.8em] w-full py-1 outline-none focus-visible:border-main rounded-md"
//                                     required
//                                 />
//                             </div>
//                         </div>

//                         <div className="w-full flex flex-col gap-1">
//                             <Label className="text-[.8em] font-bold">Phone number</Label>
//                             <Input
//                                 type="tel"
//                                 name="phoneNumber"
//                                 value={formData.phoneNumber}
//                                 onChange={handleChange}
//                                 placeholder="Phone Number"
//                                 className="border-[1px] placeholder:text-gray-400 text-[.8em] w-full py-1 outline-none focus-visible:border-main rounded-md"
//                                 required
//                             />
//                         </div>

//                         <div className="w-full flex flex-col gap-1">
//                             <Label className="text-[.8em] font-bold">Email</Label>
//                             <Input
//                                 type="email"
//                                 name="email"
//                                 value={formData.email}
//                                 onChange={handleChange}
//                                 placeholder="Email"
//                                 className="border-[1px] placeholder:text-gray-400 text-[.8em] w-full py-1 outline-none focus-visible:border-main rounded-md"
//                                 required
//                             />
//                         </div>

//                         <div className="grid grid-cols-2 items-center gap-2">
//                             <div className="w-full flex flex-col gap-1">
//                                 <Label className="text-[.8em] font-bold">Password</Label>
//                                 <Input
//                                     type="password"
//                                     name="password"
//                                     value={formData.password}
//                                     onChange={handleChange}
//                                     placeholder="Password"
//                                     className="border-[1px] placeholder:text-gray-400 text-[.8em] w-full py-1 outline-none focus-visible:border-main rounded-md"
//                                     required
//                                 />
//                             </div>

//                             <div className="w-full flex flex-col gap-1">
//                                 <Label className="text-[.8em] font-bold">Confirm Password</Label>
//                                 <Input
//                                     type="password"
//                                     name="confirmPassword"
//                                     value={formData.confirmPassword}
//                                     onChange={handleChange}
//                                     placeholder="Confirm Password"
//                                     className="border-[1px] placeholder:text-gray-400 text-[.8em] w-full py-1 outline-none focus-visible:border-main rounded-md"
//                                     required
//                                 />
//                             </div>
//                         </div>
//                     </div>

//                     <div className="">
//                         <p className="flex gap-2 items-center">
//                             <Checkbox
//                                 name="agreeTerms"
//                                 className="border-[2px] border-black checked:bg-main"
//                             />
//                             <div className="flex gap-1">
//                                 <span className="text-[.7em] font-semibold">I agree to the </span>
//                                 <span className="text-[.7em] font-semibold underline cursor-pointer hover:text-[#224aa0]">terms & policy</span>
//                             </div>
//                         </p>
//                     </div>

//                     <button disabled={isLoading} type="submit" className="w-full py-2 rounded-md bg-main hover:bg-main/80 text-white bg-orange-500 font-semibold">
//                         {isLoading ? "Creating account..." : "Create account"}
//                     </button>
//                 </form>

//                 <div className="flex justify-center items-center gap-2 w-full">
//                     <div className="h-[1px] w-full bg-gray-400 mt-1"></div>
//                     <span className="text-gray-500 font-semibold text-[.9em]">or</span>
//                     <div className="h-[1px] w-full bg-gray-400 mt-1"></div>
//                 </div>

//                 <div className="flex flex-col md:flex-row gap-2 px-2">
//                     <Button className="w-full flex justify-start items-center gap-2 px-4 border-[1px] border-gray-300 hover:border-main duration-150 ease-in-out">
//                         <GoogleIcon />
//                         <span className="text-black font-semibold text-[.9em]">Sign in with Google</span>
//                     </Button>

//                     <Button className="w-full flex justify-start items-center gap-2 px-4 border-[1px] border-gray-300 hover:border-main duration-150 ease-in-out">
//                         <AppleIcon />
//                         <span className="text-black font-semibold text-[.9em]">Sign in with Apple</span>
//                     </Button>
//                 </div>

//                 <div className="text-center text-[.8em] font-bold">
//                     <p>
//                         Have an account?{" "}
//                         <button onClick={() => router.push("/auth/login")} className="text-[#224aa0]">
//                             Sign in
//                         </button>
//                     </p>
//                 </div>
//             </motion.div>
//         </div>
//     );
// };

// export default SignUp;



"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@radix-ui/react-label";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { AppleIcon, GoogleIcon } from "@/icons";
import axios from "axios";

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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLInputElement>
  ): void => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setIsLoading(false);
      alert("Passwords do not match.");
      return;
    }

    if (!formData.agreeTerms) {
      setIsLoading(false);
      alert("You must agree to the terms and policy.");
      return;
    }

    const requestData = {
      name: `${formData.firstName} ${formData.lastName}`,
      account_id: 1, // Users only
      email: formData.email,
      password: formData.password,
      password_confirmation: formData.confirmPassword,
    };

    try {
      const response = await axios.post(
        "http://rent.infinityfreeapp.com/api/register",
        requestData,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );
      setIsLoading(false);
      alert("Registration successful!");
      router.push("/auth/login");
    } catch (error: unknown) {
      setIsLoading(false);
      const errorMessage = (error as any)?.response?.data?.message || "An error occurred during registration. Please try again.";
      console.error("Error during registration:", error);
      alert(errorMessage);
    }
  };

  return (
    <div className="w-full lg:w-[70%] mx-auto">
      <motion.div
        className="relative flex flex-col gap-2 items-center justify-center w-full h-screen md:overflow-hidden overflow-y-scroll"
        initial={{ opacity: 0 }}
        animate={{ opacity: isPageVisible ? 1 : 0 }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
      >
        <Link href="/" className="text-[1.5em] font-semibold text-orange-500">
          Rent<span className="text-green-500">Naija</span>
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
                        setFormData((prevState) => ({ ...prevState, agreeTerms: checked }))
                    }
                    className="border-[2px] border-black checked:bg-main"
                />
              <div className="flex gap-1">
                <span className="text-[.7em] font-semibold">I agree to the </span>
                <span className="text-[.7em] font-semibold underline cursor-pointer hover:text-[#224aa0]">terms & policy</span>
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

        <div className="flex justify-center items-center gap-2 w-full">
          <div className="h-[1px] w-full bg-gray-400 mt-1"></div>
          <span className="text-gray-500 font-semibold text-[.9em]">or</span>
          <div className="h-[1px] w-full bg-gray-400 mt-1"></div>
        </div>

        <div className="flex flex-col md:flex-row gap-2 px-2">
          <Button className="w-full flex justify-start items-center gap-2 px-4 border-[1px] border-gray-300 hover:border-main duration-150 ease-in-out">
            <GoogleIcon />
            <span className="text-black font-semibold text-[.9em]">Sign in with Google</span>
          </Button>

          <Button className="w-full flex justify-start items-center gap-2 px-4 border-[1px] border-gray-300 hover:border-main duration-150 ease-in-out">
            <AppleIcon />
            <span className="text-black font-semibold text-[.9em]">Sign in with Apple</span>
          </Button>
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

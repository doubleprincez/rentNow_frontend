'use client';
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/redux/store';
import { loginAgent } from '@/redux/agentSlice';
import Link from "next/link";
import { useAlert } from '@/contexts/AlertContext'; 

const Login: React.FC = () => {
  const { showAlert } = useAlert();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const result = await dispatch(loginAgent({ email, password })).unwrap();
      showAlert("Login successful. Welcome!", "success")
      navigate.push("/agents/dashboard");
    } catch (err: any) {
      showAlert(err || "Login failed", "error");
    }
  };

  return (
    <div className=" flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-600">
          Agent Login
        </h2>
        
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm ">
            <div>
              <label htmlFor="email" className="sr-only">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-[.9em] border border-gray-400 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Enter your email"
                required
              />
            </div>
            <div className="mt-4">
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-[.9em] border border-gray-400 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Enter your password"
                required
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              Login
            </button>
          </div>
        </form>
        <div className="text-center">
          Don't have an account?{" "}
          <Link href="/register" className="text-orange-600 hover:text-orange-500">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
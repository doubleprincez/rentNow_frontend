'use client'
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await axios.post("/api/agents/login", { email, password });
      if (response.status === 200) {
        navigate.push("/agents/dashboard");
      }
    } catch (err: any) {
      setError("Invalid email or password. Please try again.");
      
      // REMOVE THIS LINE BELOW LATER ------
      navigate.push("/agents/dashboard");
    }
  };

  return (
    <div className="flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white p-8">
            <div className="w-full text-center text-[1.5em] md:text-[2em] font-semibold text-orange-500">
                Login
            </div>
        {error && (
          <p className="text-red-500 text-center mb-4">{error}</p>
        )}
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-[.9em] text-gray-700 font-semibold mb-2"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full text-[.9em] border border-gray-400 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Enter your email"
              required
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-[.9em] text-gray-700 font-medium mb-2"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full text-[.9em] border border-gray-400 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Enter your password"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-orange-500 text-white font-semibold py-3 rounded-lg hover:bg-orange-600"
          >
            Login
          </button>
        </form>
        <p className="text-center text-gray-600 mt-4 text-[.9em]">
          Don&apos;t have an account?{" "}
          <Link href="/agents/auth/register" className="text-orange-500 hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;

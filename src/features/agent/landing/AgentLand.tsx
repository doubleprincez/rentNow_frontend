'use client'
import React, { useState, useEffect } from "react";
import { motion } from 'framer-motion';
import { fadeIn } from '@/lib/variants';
import Agent1 from '@/components/assets/agent1.jpeg'
import Link from "next/link";
import { ChartNoAxesCombined, UsersRound, ListOrdered, LaptopMinimalCheck, Headset, Clock3 } from 'lucide-react';

const AgentLand: React.FC = () => {
    const whyjoin = [
        {
            icon: ChartNoAxesCombined,
            title: "High Commission Rates",
            description: "Earn generous commissions for every successful deal.",
        },
        {
            icon: UsersRound,
            title: "Wide Reach",
            description:"Access thousands of renters searching for properties daily.",
        },
        {
            icon: ListOrdered,
            title: "Exclusive Listings",
            description: "Get priority access to premium rental properties.",
        },
        {
            icon: LaptopMinimalCheck,
            title: "Advanced Tools",
            description: "Manage listings and leads with our user-friendly dashboard.",
        },
        {
            icon: Headset,
            title: "Agent Support",
            description: "Enjoy 24/7 support to ensure your success.",
        },
        {
            icon: Clock3,
            title: "Flexible Opportunities",
            description: "Work on your own terms and schedule.",
        },
    ]

    const howitworks = [
        {
          title: "Sign Up",
          description: "Create an account and verify your identity.",
        },
        {
          title: "List Properties",
          description:
            "Upload rental properties with ease using our intuitive tools.",
        },
        {
          title: "Connect with Renters",
          description:
            "Receive leads and communicate directly with potential tenants.",
        },
        {
          title: "Earn Commission",
          description: "Close deals and watch your earnings grow.",
        },
    ]

    return (
        <div className="bg-gray-50 min-h-screen">

        <section className="relative w-full h-screen overflow-hidden">
            <div
            className={`absolute top-0 left-0 w-full h-full bg-cover bg-center transition-opacity duration-1000`}
            style={{ 
                backgroundImage: `url(${Agent1.src})`,
                backgroundSize: 'cover', 
            }}
            />

            <div className="relative w-full h-full flex flex-col justify-center items-center bg-black bg-opacity-40 z-10 px-4">
                <motion.div 
                variants={fadeIn('down', 0.1)}
                initial='hidden'
                whileInView={'show'}
                viewport={{ once: false, amount: 0.1 }} 
                className="w-full h-full flex flex-col justify-center items-center"
                >
                    <h1 className="text-[3em] md:text-[4em] lg:text-[5em] text-white font-semibold mb-4">Join Our Agent Network</h1>
                    <p className="text-[.9em] lg:text-[1.1em] text-center md:leading-7 lg:max-w-[60%] text-white">
                        Empower your real estate career with RentNaija. Earn competitive
                        commissions, connect with renters, and grow your portfolio with our
                        advanced tools and support.
                    </p>
                    <div className="w-full flex flex-col md:flex-row gap-2 justify-center items-center">
                        <Link href='/'>
                            <button className="mt-6 text-white bg-orange-500 font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-gray-500">
                                Back to Home
                            </button>
                        </Link>

                        <Link href='/agents/auth/register'>
                            <button className="mt-6 bg-white text-orange-500 font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-gray-100">
                                Become an Agent
                            </button>
                        </Link>
                    </div>
                </motion.div>
            </div>
        </section>

        {/* Why Join Us Section */}
        <section className="py-16 bg-white">
            <div className="max-w-6xl mx-auto px-4">
                <h2 className="text-3xl font-bold text-center mb-8">Why Join Us?</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {whyjoin.map((item, index) => (
                        <div
                        key={index}
                        className="bg-gray-100 flex flex-col gap-2 rounded-lg shadow-sm p-6 border border-gray-200"
                        >
                            <div className=''>
                                <item.icon className='w-10 lg:w-14 h-10 lg:h-14 text-orange-500'/>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-800">
                                {item.title}
                            </h3>
                            <p className="text-gray-600">{item.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        {/* How It Works Section */}
        <section className="py-16 bg-gray-50">
            <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8">How It Works</h2>
            <div className="grid grid-cols-1 sml:grid-cols-2 gap-2 md:gap-6">
                {howitworks.map((step, index) => (
                    <div
                        key={index}
                        className="flex items-start bg-white shadow-md rounded-lg p-4 border border-gray-200"
                    >
                        <span className="flex-shrink-0 bg-gray-500 text-white font-bold h-8 w-8 flex items-center justify-center rounded-full mr-4">
                        {index + 1}
                        </span>
                        <div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-1">
                            {step.title}
                        </h3>
                        <p className="text-gray-600">{step.description}</p>
                        </div>
                    </div>
                ))}
            </div>
            </div>
        </section>

        {/* Call-to-Action Section */}
        <section className="py-16 bg-orange-500 text-white text-center">
            <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-lg mb-6">
                Take your real estate career to the next level with RentNaija. Join
                our network of successful agents today.
            </p>
            <button className="bg-white text-orange-500 font-bold py-3 px-6 rounded-lg shadow-md hover:bg-gray-100">
                Become an Agent Now
            </button>
            </div>
        </section>
        </div>
    );
};

export default AgentLand;

'use client'
import Link from 'next/link'
import React from 'react'

const BecomeAgent = () => {

    return (
        <div className='w-full bg-gradient-to-t from-[bg-gradient-to-b from-[#000000] to-[#ffffff] py-10 text-white justify-center items-center flex flex-col gap-8'>
            <div className='w-full flex flex-col items-center justify-center gap-2'>
                <h1 className='text-[.7em] md:text-[.8em] font-bold text-orange-500'>BECOME A PARTNER</h1>

                <p className='text-gray-900 text-center text-[1.3em] md:text-[1.8em] font-semibold'>
                    Become a{" "} 
                    <span className="text-orange-500">
                        Rent<span className="text-green-500">Now</span>
                    </span>
                     {" "}Agent
                </p>

                <p className='w-[95%] sm:w-[80%] md:w-[60%] mx-auto text-center text-gray-700 text-[.7em] md:text-[.8em]'>
                    Help connect renters with their dream homes while earning competitive 
                    commissions. Joining our network of trusted agents means accessing 
                    exclusive tools, listings, and support to grow your real estate career.
                </p>

                <Link href='/agents'>
                    <button className='mt-2 px-10 py-2 border border-orange-500 bg-black/70 hover:bg-white/90 duration-150 ease-in-out text-white hover:text-orange-500 font-semibold text-[.9em] rounded-full shadow-md'>
                        Get Started
                    </button>
                </Link>
            </div>

            <div className='w-full flex flex-col sml:flex-row items-center justify-center gap-2 md:gap-4'>
                <div className='w-[230px] md:w-[250px] p-4 flex flex-col gap-2 bg-white rounded-lg shadow-lg text-gray-800'>
                    <h1 className='text-[.8em] font-bold text-orange-500'>WHY JOIN US?</h1>
                    <ul className='pl-4 flex flex-col gap-1'>
                        <li className='text-gray-700 text-[.7em] md:text-[.8em] list-disc marker:text-orange-500'>High Commission Rates</li>
                        <li className='text-gray-700 text-[.7em] md:text-[.8em] list-disc marker:text-orange-500'>Access thousands of renters searching for properties daily</li>
                        <li className='text-gray-700 text-[.7em] md:text-[.8em] list-disc marker:text-orange-500'>Exclusive Listings</li>
                        <li className='text-gray-700 text-[.7em] md:text-[.8em] list-disc marker:text-orange-500'>Advanced Tools</li>
                        <li className='text-gray-700 text-[.7em] md:text-[.8em] list-disc marker:text-orange-500'>24/7 Agent Support</li>
                    </ul>
                </div>
                
                <div className='w-[230px] md:w-[250px] p-4 flex flex-col gap-2 bg-white rounded-lg shadow-lg text-gray-800'>
                    <h1 className='text-[.8em] font-bold text-orange-500'>HOW IT WORKS?</h1>
                    <ul className='pl-4 flex flex-col gap-1'>
                        <li className='text-gray-700 text-[.7em] md:text-[.8em] list-disc marker:text-orange-500'>Create  and verify your account</li>
                        <li className='text-gray-700 text-[.7em] md:text-[.8em] list-disc marker:text-orange-500'>Upload rental properties with ease with intuitive tools</li>
                        <li className='text-gray-700 text-[.7em] md:text-[.8em] list-disc marker:text-orange-500'>Connect with Renters</li>
                        <li className='text-gray-700 text-[.7em] md:text-[.8em] list-disc marker:text-orange-500'>Advanced Tools</li>
                        <li className='text-gray-700 text-[.7em] md:text-[.8em] list-disc marker:text-orange-500'>Earn Commission</li>
                    </ul>
                </div>    
            </div>

            
        </div>
    )
}

export default BecomeAgent
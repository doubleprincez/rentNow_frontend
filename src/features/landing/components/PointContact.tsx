'use client'
import React from 'react';
import House from '@/components/assets/house1.jpeg';
import House2 from '@/components/assets/house2.jpeg';
import House3 from '@/components/assets/house3.jpeg';
import House4 from '@/components/assets/house4.jpeg';
import House5 from '@/components/assets/house5.jpeg';
import Maps from './Maps';
import { details } from 'framer-motion/client';
import Image from 'next/image';
import { Banknote, Bed, Home, MapPin, Scaling } from 'lucide-react';

const PointContact = () => {
    const data = [
        {
            image: House,
            title: 'Luxury Villa',
            price: '1,200,000',
            location: 'Bali, Indonesia',
            bedrooms: 6,
            bathrooms: 4,
            area: '2500 sqft',
            type: 'Villa'
        },
        {
            image: House2,
            title: 'Modern Apartment',
            price: '1,200,000',
            location: 'Bali, Indonesia',
            bedrooms: 6,
            bathrooms: 4,
            area: '2500 sqft',
            type: 'Villa'
        },
        {
            image: House3,
            title: 'Cozy Apartment',
            price: '1,200,000',
            location: 'Bali, Indonesia',
            bedrooms: 6,
            bathrooms: 4,
            area: '2500 sqft',
            type: 'Villa'
        },
        {
            image: House4,
            title: 'Luxury Villa',
            price: '1,200,000',
            location: 'Bali, Indonesia',
            bedrooms: 6,
            bathrooms: 4,
            area: '2500 sqft',
            type: 'Villa'
        },
        {
            image: House5,
            title: 'Luxury Villa',
            price: '1,200,000',
            location: 'Bali, Indonesia',
            bedrooms: 6,
            bathrooms: 4,
            area: '2500 sqft',
            type: 'Villa'
        },
    ];
  return (
    <div className='px-4 py-10 grid grid-cols-1 lg:grid-cols-2 gap-4 items-center justify-center bg-gray-100'>
        <div className='w-full overflow-hidden flex flex-col items-center md:items-start lg:px-2'>
            <h1 className='text-[.7em] md:text-[.8em] font-bold text-orange-500'>YOUR REAL ESTATE PARTNER</h1>

            <p className='text-gray-700 text-[1.3em] text-center md:text-start md:text-[1.8em] font-semibold'>
                A Single Point Of Contact For All Of Your Real Estate Needs.
            </p>
            
            <p className='text-gray-700 text-[.7em] md:text-[.8em] text-center md:text-start'>
                Explore homes crafted for your comfort and style, with modern 
                interiors and prime locations. Each property is designed to meet 
                your needs, offering convenience, elegance, and community at its best.
            </p>

            <div className='mt-4 w-full flex flex-col gap-2'>
                {data.map((des, index) => (
                    <div key={index} className='w-full h-[100px] sm:h-[120px] bg-white p-2 md:p-4 rounded-xl md:rounded-2xl overflow-hidden shadow-md flex items-center gap-3'>
                        <div className='w-[30%] h-full rounded-lg md:rounded-xl overflow-hidden'>
                            <Image src={des.image} alt={des.title} className='w-full h-full object-cover'/>
                        </div>
                        <div className='flex flex-col gap-2'>
                            <p className='text-[.8em] md:text-[1em] font-semibold'>{des.title}</p>
                            <div className='flex items-center gap-4'>
                                <div className='flex items-center gap-1'>
                                    <Home className='text-orange-500 w-4 md:w-5 h-4 md:h-5'/>
                                    <span className='text-[.7em] md:text-[.9em]'>{des.type}</span>
                                </div>
                                <div className='flex items-center gap-1'>
                                    <MapPin className='text-orange-500 w-4 md:w-5 h-4 md:h-5'/>
                                    <span className='text-[.7em] md:text-[.9em]'>{des.location}</span>
                                </div>
                            </div>
                            <div className='flex flex-wrap items-center gap-2'>
                                <div className='flex items-center gap-1'>
                                    <Bed className='text-orange-500 w-4 md:w-5 h-4 md:h-5'/>
                                    <span className='text-[.7em] md:text-[.9em]'>{des.bedrooms} Bedrooms</span>
                                </div>
                                <div className='flex items-center gap-1'>
                                    <Scaling className='text-orange-500 w-4 md:w-5 h-4 md:h-5'/>
                                    <span className='text-[.7em] md:text-[.9em]'>{des.area}</span>
                                </div>
                                <div className='flex items-center gap-1'>
                                    <Banknote className='text-orange-500 w-4 md:w-5 h-4 md:h-5'/>
                                    <span className='text-[.7em] md:text-[.9em]'>{des.price}</span>
                                </div>
                            </div>
                        </div>
                    </div>    
                ))}
            </div>
        </div>

        <div className='relative z-0 w-full min-h-[300px] lg:h-full flex items-end overflow-hidden'>
            <Maps/>
        </div>
    </div>
  )
}

export default PointContact
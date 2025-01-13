'use client'
import React from 'react';
import { MessagesSquare, LaptopMinimalCheck, Boxes, SquareChartGantt } from 'lucide-react';
import House from '@/components/assets/house1.jpeg';
import House2 from '@/components/assets/house2.jpeg';
import Image from 'next/image';

const Howto = () => {
    const data = [
        {
            icons: MessagesSquare ,
            title: 'Answer Questions',
            para: 'Start by providing some details about your preferences and requirements. Our quick questionnaire helps us match you with the ideal rental property.',
        },
        {
            icons: LaptopMinimalCheck,
            title: 'Select a Space',
            para: 'Browse through curated listings tailored to your needs. Whether you want a studio apartment or a family home, we have options for every lifestyle.',
        },
        {
            icons: Boxes,
            title: 'Manage Your Belongings',
            para: 'Our platform offers tools to help you plan for moving day, organize your belongings, and ensure a smooth transition to your new home',
        },
        {
            icons: SquareChartGantt,
            title: 'Personal Liability',
            para: 'Stay protected with our personal liability guidelines. We’ll help you navigate rental agreements and secure the peace of mind you deserve.',
        },
    ]

  return (
    <div className='px-4 py-10 grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-4 items-center justify-center bg-gray-100'>
        <div className='lg:py-8 w-full h-[250px] lg:h-full flex items-end overflow-hidden'>
            <div
            style={{
                backgroundImage: `url(${House.src})`,
                backgroundSize: 'cover', 
            }}
            className='relative w-full mt-auto h-[300px] lg:h-[500px] rounded-2xl'
            >   
                <div className='w-[300px] lg:w-[400px] h-[200px] lg:h-[300px] border-[20px] border-gray-100 rounded-2xl absolute -top-20 lg:-top-32 -right-5 overflow-hidden'>
                    <Image 
                        src={House2} 
                        alt='house' 
                        width={500} 
                        height={500} 
                        className='w-full h-full object-cover rounded-xl'  
                    />
                </div>
            </div>
        </div>

        <div className='w-full overflow-hidden flex flex-col items-center md:items-start lg:px-2'>
            <h1 className='text-[.7em] md:text-[.8em] font-bold text-orange-500'>FIND YOUR DREAM SPACE</h1>

            <p className='text-gray-700 text-[1.3em] text-center md:text-start md:text-[1.8em] font-semibold'>
                Welcome To Our Luxurious Properties, With All The Conviniences.
            </p>
            
            <p className='text-gray-700 text-[.7em] md:text-[.8em] text-center md:text-start'>
                Discover properties designed to cater to your lifestyle, with 
                every detail crafted for comfort and sophistication. From modern 
                interiors to breathtaking views, each space promises a unique 
                living experience. Our luxurious homes are nestled in prime locations, 
                ensuring easy access to top amenities and vibrant communities. Enjoy 
                the perfect blend of elegance and convenience, tailored to meet your 
                desires. Let us help you find a place where your dreams truly feel at home.
            </p>

            <div className='w-full sm:w-[80%] mx-auto lg:mx-0 lg:w-full grid grid-cols-2 gap-4 py-4 md:py-8'>
                {data.map((item, index) => (
                    <div className='flex flex-col justify-center items-center lg:justify-start lg:items-start gap-2' key={index}>
                        <div className=''>
                            <item.icons className='w-14 lg:w-20 h-14 lg:h-20 text-orange-500'/>
                        </div>
                        <h1 className='text-[.9em] lg:text-[1.2em] font-bold text-gray-700 text-center lg:text-start'>{item.title}</h1>
                        <p className='text-[.7em] lg:text-[.8em] text-gray-700 text-center lg:text-start'>{item.para}</p>
                    </div>
                ))}
            </div>
        </div>
    </div>
  )
}

export default Howto
'use client'
import { Grid2x2Check, ListCheck, MailQuestion, Quote } from 'lucide-react'
import React from 'react'
import { Barchart, LineBar } from './Graphs'
import Listings from './Listings'
import { MenuPieChart } from './Charts'

const Home = () => {
    const data = [
        {
            icon: ListCheck,
            title: 'Total Properties',
            value: '134',
        },
        {
            icon: Grid2x2Check,
            title: 'Pending approvals',
            value: '48',
        },
        {
            icon: Quote,
            title: 'Total Quotes',
            value: '124',
        },
        {
            icon: MailQuestion,
            title: 'Messages',
            value: '153',
        },
    ]

    return (
        <div className='w-full h-full px-1 md:px-4 py-2 md:py-4 flex flex-col gap-2 sm:gap-4'>
            <div className='w-full flex flex-col gap-1'>
                <span className='text-black/80 text-[1.5rem] font-semibold'>Overview</span>
                <div className='w-full grid grid-cols-2 sml:grid-cols-2 mdl:grid-cols-4 gap-1 sm:gap-4'>
                    {data.map((item, index) => (
                        <div className='col-span-1 h-[100px] bg-black/80 rounded-xl shadow-md shadow-orange-600 flex items-center p-4 gap-1' key={index}>
                            <div>
                                <item.icon className='w-8 sm:w-10 lg:w-16 h-8 sm:h-10 lg:h-16 text-orange-500'/>
                            </div>
                            <div className='flex flex-col leading-6'>
                                <h1 className='text-white font-semibold text-[.7em] sm:text-[.9em]'>{item.title}</h1>
                                <span className='text-white text-[1rem] sm:text-[2rem] font-bold syne'>{item.value}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            
            <div className='w-full grid grid-cols-1 md:grid-cols-4 gap-2 sm:gap-4'>
                <div className='col-span-1 md:col-span-3 w-full h-[250px] sm:h-[300px] bg-black/80 rounded-xl shadow-md shadow-orange-600 flex items-center sm:p-4 gap-1'>
                    <LineBar/>
                </div>

                <div className='col-span-1 w-full h-[250px] sm:h-[300px] bg-black/80 rounded-xl shadow-md shadow-orange-600 flex justify-center items-center p-4 gap-1'>
                    <MenuPieChart/>
                </div>
            </div>

            <div className='col-span-1 md:col-span-3 w-full min-h-[400px] bg-black/80 rounded-xl shadow-md shadow-orange-600 flex items-center p-4 gap-1 overflow-x-scroll'>
                <Listings/>
            </div>

            <div className='w-full py-2'></div>
        </div>
    )
}

export default Home
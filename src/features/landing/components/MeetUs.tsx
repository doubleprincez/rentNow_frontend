'use client'
import React from 'react'

const MeetUs = () => {
    const data = [
        {
            image: 'https://randomuser.me/api/portraits/men/5.jpg',
            name: 'John Doherty',
            role: 'CEO',
        },
        {
            image: 'https://randomuser.me/api/portraits/women/5.jpg',
            name: 'Jane Brown',
            role: 'CTO',
        },
        {
            image: 'https://randomuser.me/api/portraits/men/2.jpg',
            name: 'Fisudo Damola',
            role: 'CFO',
        },
        {
            image: 'https://randomuser.me/api/portraits/women/2.jpg',
            name: 'Alabi Abiola',
            role: 'COO',
        },
        {
            image: 'https://randomuser.me/api/portraits/women/8.jpg',
            name: 'Bukola Wright',
            role: 'Technical',
        },
    ]
  return (
    <div className='px-4 py-10 flex flex-col gap-4 items-center justify-center bg-black'>
        <h1 className='text-[.7em] md:text-[.8em] font-bold text-orange-500'>KNOW A BIT ABOUT US</h1>
        <p className='text-gray-200 text-[1.3em] text-center md:text-start md:text-[2em] font-semibold'>
            Meet Our Real Estate Titans
        </p>

        <div className='w-full max-w-[900px] mx-auto flex justify-center items-center flex-wrap gap-8 md:grid md:grid-cols-3 lg:grid-cols-5 md:gap-2'>
            {data.map((person, index) => (
                <div key={index} className='flex flex-col items-center justify-center gap-1 md:gap-2'>
                    <img src={person.image} alt={person.name} className='w-20 md:w-40 h-20 md:h-40 rounded-full object-cover' />
                    <p className='text-gray-100 text-[.8em] md:text-[1em] font-semibold'>{person.name}</p>
                    <p className='text-orange-500 text-[.7em] md:text-[.8em] font-semibold'>{person.role}</p>
                </div>
            ))}
        </div>
    </div>
  )
}

export default MeetUs
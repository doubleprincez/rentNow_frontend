'use client'
import React, { useState } from 'react';
import { CircleX, CircleCheck } from 'lucide-react';

interface Data {
    username: string
    email: string
    amount: number
    currency: string
    paymentType: string
    status: string
}

const data: Data[] = [
  { 
    username: "Peter John",
    email: "pj@mail.com",
    amount: 600000,
    currency: "NGN",
    paymentType: "Bank Transfer",
    status: "Successful"
  },
  { 
    username: "Jenna John",
    email: "jj@mail.com",
    amount: 560000,
    currency: "NGN",
    paymentType: "Bank Transfer",
    status: "Successful"
  },
  { 
    username: "James Lawal",
    email: "jl@mail.com",
    amount: 700000,
    currency: "NGN",
    paymentType: "Bank Transfer",
    status: "Successful"
  },
  { 
    username: "Peter Parker",
    email: "pp@mail.com",
    amount: 500000,
    currency: "NGN",
    paymentType: "Bank Transfer",
    status: "Successful"
  },
  { 
    username: "Peter John",
    email: "pj@mail.com",
    amount: 600000,
    currency: "NGN",
    paymentType: "Bank Transfer",
    status: "Successful"
  },
  { 
    username: "Jenna John",
    email: "jj@mail.com",
    amount: 560000,
    currency: "NGN",
    paymentType: "Bank Transfer",
    status: "Successful"
  },
  { 
    username: "James Lawal",
    email: "jl@mail.com",
    amount: 700000,
    currency: "NGN",
    paymentType: "Bank Transfer",
    status: "Successful"
  },
  { 
    username: "Peter Parker",
    email: "pp@mail.com",
    amount: 500000,
    currency: "NGN",
    paymentType: "Bank Transfer",
    status: "Successful"
  },
]

const Listings = () => {
    const PAGE_SIZE = 5;
    const [currentPage, setCurrentPage] = useState(1)
    const [filteredData, setFilteredData] = useState(data)
  
    const paginatedData = filteredData.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
    const totalPages = Math.ceil(filteredData.length / PAGE_SIZE)

    return (
        <div className='w-full h-full flex flex-col gap-4 lg:gap-10'>

            <div className="w-full flex flex-col">
                <div className='overflow-x-scroll w-full'>
                  <div className='min-w-[600px] w-[950px] overflow-x-scroll lg:overflow-hidden lg:w-full mx-auto'>
                  
                      <div className="rounded-lg bg-orange-500 text-[.7em] md:text-[.8em] text-[#ffffff] font-semibold px-2 py-2 grid grid-cols-7 gap-2">
                          <div>Username</div>
                          <div>Email</div>
                          <div>Amount</div>
                          <div>Currency</div>
                          <div>Payment Type</div>
                          <div>Status</div>
                          <div className='flex justify-center'>Actions</div>
                      </div>

                      {paginatedData.map((user, index) => (
                          <div key={index} className="grid grid-cols-7 gap-2 px-2 py-4 border-b border-green-500 text-white text-[.8em]">
                              <div>{user.username}</div>
                              <div>{user.email}</div>
                              <div>{user.amount}</div>
                              <div>{user.currency}</div>
                              <div>{user.paymentType}</div>
                              <div>{user.status}</div>
                              <div className='flex justify-center gap-2'>
                                  <button className="text-green-500">
                                      <CircleCheck/>
                                  </button>
                                  <button className="text-[#ff332c]">
                                      <CircleX/>
                                  </button>
                              </div>
                          </div>
                      ))}
                  </div>   
                </div>
                
                <div className="flex justify-center items-center mt-4 space-x-2">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="text-[#ffffff] text-[.8em]"
                    >
                        Previous
                    </button>
                    {[...Array(totalPages)].map((_, i) => (
                        <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`px-2 py-1 rounded-[6px] text-[.8em] ${currentPage === i + 1 ? 'bg-orange-500 text-white' : 'bg-white text-orange-500'}`}
                        >
                        {i + 1}
                        </button>
                    ))}
                    <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="text-[#ffffff] text-[.8em]"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Listings;
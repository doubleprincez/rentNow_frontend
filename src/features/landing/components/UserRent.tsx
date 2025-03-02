'use client'
import React, {useEffect, useState} from 'react';
import {Tabs, TabsTrigger, TabsContent, TabsList} from '@/components/ui/tabs';
import {Banknote, MapPin, Clock} from 'lucide-react';
import {useRouter} from 'next/navigation';
import type {
    Apartment,
    ApiResponse,
    FindHomesProps,
    ApartmentCardProps
} from '@/types/apartment';


const UserRent = () => {

    //    view previous rents

    // make it easy to upload proof of payment

    // print out

    return <>
        <div

            className="relative bg-gray-100 w-full min-h-screen pt-[64px] md:pt-[75px]"
        >
            <div className="bg-opacity-60 pt-5">
                <div className="w-full px-4 py-8 flex flex-col items-center gap-4 ">
                    <h1 className="text-black/80 text-[1.5rem] font-semibold">Manage Rents</h1>
                </div>




            </div>
        </div>
    </>
}


export default UserRent;












"use client"
import React from 'react'
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { BookOpenText, CirclePlus, CircleUser, Home, Mail } from 'lucide-react';

const BottomNav = () => {
    const pathname = usePathname();

    const links = [
        {
            name: "Dashboard", 
            link: "/agents/dashboard",
            icon: Home,
        },
        {
            name: "Add Property", 
            link: "/agents/dashboard/add-property",
            icon: CirclePlus,
        },
        {
            name: "Manage Property", 
            link: "/agents/dashboard/manage-property",
            icon: BookOpenText,
        },
        {
            name: "Message", 
            link: "/agents/dashboard/messages",
            icon: Mail,
        },
        {
            name: "Profile", 
            link: "/agents/dashboard/profile",
            icon: CircleUser,
        },
    ]

    return (
        <div className='px-4 py-2 w-full h-full bg-black/85 text-white flex flex-col'>
            <div className='flex justify-center items-center gap-8 md:gap-14'>
                {links.map((link, index) => (
                    <Link href={link.link} key={index} className=''>
                        <div className={`flex flex-col items-center ${pathname === link.link ? "text-orange-500" : "text-white"}`}>
                            <link.icon className='w-7 h-7'/>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}

export default BottomNav
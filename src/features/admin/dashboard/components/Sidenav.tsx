"use client"
import React from 'react'
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { BookOpenText, CirclePlus, CircleUser, Home, Mail, User2 } from 'lucide-react';

const Sidenav = () => {
    const pathname = usePathname();

    const links = [
        {
            name: "Overview", 
            link: "/admin/dashboard",
            icon: Home,
        },
        {
            name: "View Agents", 
            link: "/admin/dashboard/view-agents",
            icon: User2,
        },
        {
            name: "Access Properties", 
            link: "/admin/dashboard/access-properties",
            icon: BookOpenText,
        },
        {
            name: "Message", 
            link: "/admin/dashboard/messages",
            icon: Mail,
        },
        {
            name: "Profile", 
            link: "/admin/dashboard/profile",
            icon: CircleUser,
        },
    ]

    return (
        <div className='px-4 py-6 w-full h-full bg-black/85 text-white flex flex-col'>
            <div className='flex flex-col w-full leading-5'>
                <div className="text-[1.8em] font-semibold text-orange-500">
                    Rent<span className="text-green-500">Naija</span>
                </div>
                <span className='ml-[120px] text-[.8em] text-white/90'>Admin</span>
            </div>

            <div className='py-20 flex flex-col gap-4'>
                {links.map((link, index) => (
                    <Link href={link.link} key={index} className='w-full'>
                        <div className={`flex items-center gap-2 p-2 text-[.8em] rounded-lg ${pathname === link.link ? "bg-green-500 text-white" : "text-white bg-black"}`}>
                            <link.icon className='w-6 h-6'/>
                            <span>{link.name}</span>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}

export default Sidenav
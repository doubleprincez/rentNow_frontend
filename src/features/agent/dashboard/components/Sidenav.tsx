"use client"
import React from 'react'
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { BookOpenText, CirclePlus, CircleUser, Home, Mail } from 'lucide-react';
import Image from 'next/image';
import Logo from '@/components/assets/logo/logo.png'

const Sidenav = () => {
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
        <div className='px-4 py-6 w-full h-full bg-black/85 text-white flex flex-col'>
            <div className='flex flex-col w-full leading-3'>
                <div>
                    <Image src={Logo} alt='logo' width={500} height={500} className='w-[120px] h-[50px] object-contain'/>
                </div>
                <span className='ml-[120px] text-[.8em] text-white/90'>Agent</span>
            </div>

            <div className='py-20 flex flex-col gap-4'>
                {links.map((link, index) => (
                    <Link href={link.link} key={index} className='w-full'>
                        <div className={`flex items-center gap-2 p-2 text-[.8em] rounded-lg ${pathname === link.link ? "bg-orange-500 text-white" : "text-white bg-black"}`}>
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
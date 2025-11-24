'use client'
import React from 'react';
import { usePathname } from 'next/navigation';
import Header from "@/features/landing/components/Header";
import Footer from "@/features/landing/components/Footer";

export default function Layout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    const pathname = usePathname();
    // Hide footer on individual apartment pages (media viewer)
    const isApartmentDetailPage = pathname?.match(/^\/find-homes\/\d+$/);
    
    return (
        <div className="relative">
            <Header/>
            <div className={isApartmentDetailPage ? '' : 'min-h-screen'}>
                {children}
            </div>
            {!isApartmentDetailPage && <Footer/>}
        </div>
    );
}
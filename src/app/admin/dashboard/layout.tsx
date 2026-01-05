'use client'
import React from 'react';
import DashHead from '@/features/admin/dashboard/components/DashHead';
import Sidenav from '@/features/admin/dashboard/components/Sidenav';
import BottomNav from '@/features/admin/dashboard/components/BottomNav';
import AdminRoute from './AdminRoute';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <AdminRoute>
      <div className='w-full h-screen flex items-center justify-center overflow-hidden'>
        <div className='hidden w-0 lg:flex lg:w-[230px] h-full overflow-hidden'><Sidenav/></div>
        <div className='w-full lg:w-[calc(100vw-230px)] h-full'>
          <div className='w-full h-[5rem] border-b-2'><DashHead/></div>
          <div className='w-full pb-4 h-[calc(100vh-8rem)] lg:h-[calc(100vh-5rem)] flex overflow-x-hidden overflow-y-scroll'>
            {children}
          </div>
          <div className='w-full h-[3rem] flex lg:hidden lg:h-0 overflow-hidden'>
            <BottomNav/>
          </div>
        </div>
      </div>
    </AdminRoute>
  );
}

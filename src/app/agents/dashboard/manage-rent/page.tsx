'use client';
import dynamic from 'next/dynamic';
import { Loader2Icon } from 'lucide-react';
import React from 'react';  

const ManageRent = dynamic(
  () => import('@/features/agent/dashboard/components/ManageRent'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2Icon className="animate-spin"/>&nbsp;Loading...
      </div>
    )
  }
);

const page = () => {
  return <ManageRent />;
}

export default page

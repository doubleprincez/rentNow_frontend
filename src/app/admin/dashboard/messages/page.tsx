'use client';
import dynamic from 'next/dynamic';
const Messages = dynamic(() => import('@/features/admin/dashboard/components/Messages'), { ssr: false });
const page = () => <div className='w-full'><Messages/></div>;
export default page

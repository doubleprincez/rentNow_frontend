'use client';
import dynamic from 'next/dynamic';
const Messages = dynamic(() => import('@/features/agent/dashboard/components/Messages'), { ssr: false });
const page = () => <div className='w-full'><Messages/></div>;
export default page

'use client';
import dynamic from 'next/dynamic';
const AddProperty = dynamic(() => import('@/features/agent/dashboard/components/AddProperty'), { ssr: false });
const page = () => <div className='w-full'><AddProperty/></div>;
export default page

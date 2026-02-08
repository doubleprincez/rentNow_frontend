'use client';
import dynamic from 'next/dynamic';
const ManageProperty = dynamic(() => import('@/features/agent/dashboard/components/ManageProperty'), { ssr: false });
const page = () => <div className='w-full'><ManageProperty/></div>;
export default page

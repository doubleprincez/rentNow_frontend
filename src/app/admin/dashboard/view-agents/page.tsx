'use client';
import dynamic from 'next/dynamic';
const ViewAgents = dynamic(() => import('@/features/admin/dashboard/components/ViewAgents'), { ssr: false });
const page = () => <div className='w-full'><ViewAgents/></div>;
export default page

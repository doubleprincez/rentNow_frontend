'use client';
import dynamic from 'next/dynamic';
const ViewUsers = dynamic(() => import('@/features/admin/dashboard/components/ViewUsers'), { ssr: false });
const page = () => <div className='w-full'><ViewUsers/></div>;
export default page

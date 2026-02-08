'use client';
import dynamic from 'next/dynamic';
const ViewSubscriptions = dynamic(() => import('@/features/admin/dashboard/components/ViewSubscriptions'), { ssr: false });
const page = () => <div className='w-full'><ViewSubscriptions/></div>;
export default page

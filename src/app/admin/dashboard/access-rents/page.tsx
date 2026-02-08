'use client';
import dynamic from 'next/dynamic';
const ViewRents = dynamic(() => import('@/features/admin/dashboard/components/ViewRents'), { ssr: false });
const page = () => <div className='w-full'><ViewRents/></div>;
export default page

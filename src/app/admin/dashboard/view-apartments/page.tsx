'use client';
import dynamic from 'next/dynamic';
const ViewApartments = dynamic(() => import('@/features/admin/dashboard/components/ViewApartments'), { ssr: false });
const page = () => <div className='w-full'><ViewApartments/></div>;
export default page

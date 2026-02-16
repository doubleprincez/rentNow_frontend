'use client';
import dynamic from 'next/dynamic';
const AdAnalyticsDashboard = dynamic(() => import('@/features/admin/dashboard/components/AdAnalyticsDashboard'), { ssr: false });
const page = () => <div className='w-full'><AdAnalyticsDashboard/></div>;
export default page

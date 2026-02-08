'use client';
import dynamic from 'next/dynamic';
const ProfilePage = dynamic(() => import('@/features/agent/dashboard/components/ProfilePage'), { ssr: false });
const page = () => <div><ProfilePage/></div>;
export default page

'use client';
import dynamic from 'next/dynamic';
const UserRent = dynamic(() => import('@/features/user/UserRent'), { ssr: false });
const page = () => <div><UserRent/></div>;
export default page

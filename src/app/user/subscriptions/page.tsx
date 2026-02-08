'use client';
import dynamic from 'next/dynamic';
const UserSubscription = dynamic(() => import('@/features/user/UserSubscription'), { ssr: false });
const page = () => <div><UserSubscription/></div>;
export default page

'use client';
import dynamic from 'next/dynamic';
const UserSubscription = dynamic(() => import('@/features/user/UserSubscription'), { ssr: false });
const page = () => <div className='pt-30 '><UserSubscription/></div>;
export default page

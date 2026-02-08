'use client';

import dynamic from 'next/dynamic';
const UserSettings = dynamic(() => import('@/features/user/UserSettings'), { ssr: false });
const page = () => <div><UserSettings/></div>;
export default page

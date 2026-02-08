'use client';
import dynamic from 'next/dynamic';
import React from 'react';

const UserChat = dynamic(
  () => import('@/features/user/UserChat'),
  { ssr: false }
);

const page = () => {
    return (
        <div>
            <UserChat/>
        </div>
    )
}

export default page

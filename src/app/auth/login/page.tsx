'use client';
import dynamic from 'next/dynamic';
import React from 'react';

const Login = dynamic(
  () => import('@/features/auth/components/Login').then(mod => ({ default: () => <mod.default isPageVisible={true} /> })),
  { ssr: false }
);

const page = () => {
  return <div><Login /></div>;
}

export default page

'use client';
import dynamic from 'next/dynamic';
import React from 'react';

const SignUp = dynamic(
  () => import('@/features/auth/components/SignUp').then(mod => ({ default: () => <mod.default isPageVisible={true} /> })),
  { ssr: false }
);

const page = () => {
  return <div><SignUp /></div>;
}

export default page

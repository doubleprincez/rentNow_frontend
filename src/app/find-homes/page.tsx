import React from 'react';
import Header from "@/features/landing/components/Header";
import Footer from "@/features/landing/components/Footer";
import FindHomes from '@/features/landing/components/FindHomes';

const page = () => {
  return (
    <div>
      <Header/>
      <FindHomes/>
      <Footer/>
    </div>
  )
}

export default page
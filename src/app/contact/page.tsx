import React from 'react';
import Header from "@/features/landing/components/Header";
import Footer from "@/features/landing/components/Footer";
import Contact from '@/features/landing/components/Contact';

const page = () => {
  return (
    <div>
      <Header/>
      <Contact/>
      <Footer/>
    </div>
  )
}

export default page
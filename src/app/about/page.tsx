import React from 'react';
import About from '@/features/landing/components/About';
import Header from "@/features/landing/components/Header";
import Footer from "@/features/landing/components/Footer";

const page = () => {
  return (
    <div>
      <Header/>
      <About/>
      <Footer/>
    </div>
  )
}

export default page
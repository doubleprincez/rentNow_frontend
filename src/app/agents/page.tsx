'use client'
import React from 'react';
import Header from "@/features/agent/landing/AgentHeader";
import Footer from "@/features/landing/components/Footer";
import AgentLand from '@/features/agent/landing/AgentLand';
import Subscribe from '@/features/landing/components/Subscribe';

const page = () => {
  return (
    <div>
      <Header />
      <AgentLand/>
      <Subscribe/>
      <Footer />
    </div>
  )
}

export default page
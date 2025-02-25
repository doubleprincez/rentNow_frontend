'use client'
import React from 'react';
import Header from "@/features/landing/components/Header";
import Footer from "@/features/landing/components/Footer";
import Home from '@/features/landing/components/Home';
import PropReq from '@/features/landing/components/PropReq';
import Howto from '@/features/landing/components/Howto';
import ComfortLiving from '@/features/landing/components/ComfortLiving';
import PointContact from '@/features/landing/components/PointContact';
import MeetUs from '@/features/landing/components/MeetUs';
import Reviews from '@/features/landing/components/Reviews';
import Subscribe from '@/features/landing/components/Subscribe';
import BecomeAgent from '@/features/landing/components/BecomeAgent';
import WhatsAppFloater from './WhatsappFloater';

const page = () => {
  return (
    <WhatsAppFloater>
      <Header/>
      <Home/>
      {/* <PropReq/> */}
      {/* <Howto/> */}
      <ComfortLiving/>
      <PointContact/>
      {/* <MeetUs/> */}
      <Reviews/>
      <BecomeAgent/>
      <Subscribe/>
      <Footer/>
    </WhatsAppFloater>
  )
}

export default page
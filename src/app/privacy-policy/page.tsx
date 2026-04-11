import React from 'react';
import Header from '@/features/landing/components/Header';
import Footer from '@/features/landing/components/Footer';
import PrivacyPolicy from '@/features/landing/components/PrivacyPolicy';

const page = () => {
  return (
    <div>
      <Header />
      <PrivacyPolicy />
      <Footer />
    </div>
  );
};

export default page;

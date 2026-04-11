import React from 'react';
import Header from '@/features/landing/components/Header';
import Footer from '@/features/landing/components/Footer';
import TermsAndConditions from '@/features/landing/components/TermsAndConditions';

const page = () => {
  return (
    <div>
      <Header />
      <TermsAndConditions />
      <Footer />
    </div>
  );
};

export default page;

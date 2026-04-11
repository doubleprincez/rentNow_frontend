'use client'
import React from 'react';

const sections = [
  {
    title: '1. Acceptance of Terms',
    content:
      'By accessing or using RentNow.ng ("the Platform"), you agree to be bound by these Terms and Conditions. If you do not agree, please discontinue use of the Platform immediately. These Terms apply to all visitors, tenants, and registered agents.',
  },
  {
    title: '2. About the Platform',
    content:
      'RentNow.ng is a Nigerian property rental marketplace that connects tenants with verified real estate agents and landlords. Tenants can browse, search, and book rental properties — apartments, flats, duplexes, and houses — across Nigeria at no cost. Agents subscribe to the Platform to list and advertise their properties to a wide audience of active renters.',
  },
  {
    title: '3. Tenant Use — Free Access',
    content:
      'Tenants may register and use the Platform entirely free of charge. This includes browsing listings, viewing property details, contacting agents via the in-app chat, and submitting booking requests. RentNow.ng does not charge tenants any fees for accessing or using these features.',
  },
  {
    title: '4. Agent Subscriptions & Listings',
    content:
      'Agents must purchase an active subscription plan to list properties on the Platform. Subscription fees are charged in Nigerian Naira (₦) and are payable via Paystack or Bank Transfer. Agents are solely responsible for the accuracy, legality, and availability of their listings. RentNow.ng does not verify all listing details and makes no warranties regarding any listed property.',
  },
  {
    title: '5. Bookings & Rentals',
    content:
      'Booking a property through RentNow.ng initiates a rental request between the tenant and the agent. RentNow.ng acts as a facilitator only and is not a party to any rental agreement. All rental terms, payments between tenant and agent, and move-in arrangements are the sole responsibility of the parties involved.',
  },
  {
    title: '6. User Accounts',
    content:
      'You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized use of your account. RentNow.ng is not liable for any loss resulting from unauthorized account access.',
  },
  {
    title: '7. Payments & Refunds',
    content:
      'Subscription fees paid by agents are non-refundable except where required by applicable Nigerian law. RentNow.ng does not process or hold rental payments between tenants and agents — those transactions occur directly between the parties.',
  },
  {
    title: '8. Prohibited Conduct',
    content:
      'You must not post fraudulent or misleading listings, impersonate any person or entity, transmit spam or malicious content, or engage in any activity that disrupts the Platform or harms other users. Violations may result in immediate account suspension.',
  },
  {
    title: '9. Intellectual Property',
    content:
      'All content on the Platform, including logos, text, and software, is the property of RentNow.ng or its licensors. You may not reproduce or distribute any content without prior written permission.',
  },
  {
    title: '10. Limitation of Liability',
    content:
      'RentNow.ng shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Platform, including disputes between tenants and agents, inaccurate listings, or failed rental transactions.',
  },
  {
    title: '11. Privacy',
    content:
      'Your use of the Platform is also governed by our Privacy Policy, which is incorporated into these Terms by reference.',
  },
  {
    title: '12. Changes to Terms',
    content:
      'We reserve the right to update these Terms at any time. Continued use of the Platform after changes are posted constitutes your acceptance of the revised Terms.',
  },
  {
    title: '13. Governing Law',
    content:
      'These Terms are governed by the laws of the Federal Republic of Nigeria. Any disputes shall be subject to the exclusive jurisdiction of Nigerian courts.',
  },
  {
    title: '14. Contact Us',
    content:
      'If you have questions about these Terms, please contact us at support@rentnow.ng.',
  },
];

const TermsAndConditions = () => {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 md:px-8 pt-24 md:pt-32 pb-12 md:pb-20">
      <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2">Terms & Conditions</h1>
      <p className="text-sm text-gray-500 mb-8">Last updated: April 2025</p>

      <p className="text-gray-600 mb-10 leading-7">
        Please read these Terms and Conditions carefully before using RentNow.ng. These terms govern your access to and use of our services — whether you are a tenant browsing for a home or an agent advertising properties.
      </p>

      <div className="flex flex-col gap-8">
        {sections.map((section) => (
          <div key={section.title}>
            <h2 className="text-base md:text-lg font-semibold text-gray-800 mb-2">{section.title}</h2>
            <p className="text-gray-600 leading-7 text-sm md:text-base">{section.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TermsAndConditions;

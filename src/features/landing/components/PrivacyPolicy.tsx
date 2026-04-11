'use client'
import React from 'react';

const sections = [
  {
    title: '1. Information We Collect',
    content:
      'We collect information you provide when registering or using the Platform, including your name, email address, phone number, and location. For agents, we also collect business details and property listing information. We additionally collect usage data such as pages visited, search queries, device type, and IP address to improve the Platform.',
  },
  {
    title: '2. How We Use Your Information',
    content:
      'We use your information to operate the Platform, match tenants with suitable properties, process agent subscriptions, facilitate in-app communication between tenants and agents, and send service-related notifications. We do not sell your personal data to third parties.',
  },
  {
    title: '3. Tenants',
    content:
      'Tenant accounts are free. The personal information you provide (name, contact details) may be shared with an agent when you initiate a booking or chat request, solely to facilitate the rental process. We do not share your data beyond what is necessary for this purpose.',
  },
  {
    title: '4. Agents',
    content:
      'Agent profiles and property listings are publicly visible on the Platform to help connect agents with prospective tenants. Subscription and payment records are kept securely and are not shared publicly. Agent contact details may be displayed to tenants who express interest in a listed property.',
  },
  {
    title: '5. Payment Data',
    content:
      'Agent subscription payments are processed by third-party providers (Paystack or Bank Transfer). RentNow.ng does not store full payment card details. Payment processors operate under their own privacy and security policies.',
  },
  {
    title: '6. Cookies',
    content:
      'We use cookies and similar technologies to maintain sessions, remember preferences, and analyze Platform traffic. You can control cookie settings through your browser, though disabling cookies may affect Platform functionality.',
  },
  {
    title: '7. Data Security',
    content:
      'We implement industry-standard security measures to protect your data. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.',
  },
  {
    title: '8. Data Retention',
    content:
      'We retain your personal data for as long as your account is active or as needed to provide services. You may request deletion of your account and associated data by contacting us at support@rentnow.ng.',
  },
  {
    title: '9. Your Rights',
    content:
      'You have the right to access, correct, or request deletion of your personal data. To exercise these rights, contact us at support@rentnow.ng. We will respond within a reasonable timeframe in accordance with applicable Nigerian law.',
  },
  {
    title: '10. Third-Party Links',
    content:
      'The Platform may contain links to third-party websites. We are not responsible for the privacy practices of those sites and encourage you to review their policies independently.',
  },
  {
    title: '11. Changes to This Policy',
    content:
      'We may update this Privacy Policy from time to time. We will notify you of significant changes by posting the updated policy on this page with a revised date.',
  },
  {
    title: '12. Contact Us',
    content:
      'If you have questions about this Privacy Policy, please contact us at support@rentnow.ng.',
  },
];

const PrivacyPolicy = () => {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 md:px-8 pt-24 md:pt-32 pb-12 md:pb-20">
      <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
      <p className="text-sm text-gray-500 mb-8">Last updated: April 2025</p>

      <p className="text-gray-600 mb-10 leading-7">
        At RentNow.ng, your privacy matters. This policy explains how we collect, use, and protect your personal information — whether you are a tenant searching for a home or an agent advertising properties on our platform.
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

export default PrivacyPolicy;

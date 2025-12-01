import React from 'react';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
        <p className="text-gray-700 mb-4">This Privacy Policy explains how Animal Marketplace collects, uses, and discloses your personal information when you use our services.</p>

        <section className="bg-white rounded-lg shadow p-6 mb-4">
          <h2 className="text-xl font-semibold mb-2">Information We Collect</h2>
          <p className="text-gray-600">We collect information you provide when creating an account, listing animals, messaging, or saving items. This includes name, email, phone number, and profile details.</p>
        </section>

        <section className="bg-white rounded-lg shadow p-6 mb-4">
          <h2 className="text-xl font-semibold mb-2">How We Use Information</h2>
          <p className="text-gray-600">We use your information to provide and improve our services, communicate with you, process payments, and enforce our policies.</p>
        </section>

        <section className="bg-white rounded-lg shadow p-6 mb-4">
          <h2 className="text-xl font-semibold mb-2">Sharing & Disclosure</h2>
          <p className="text-gray-600">We may share information with service providers, law enforcement when required, and as described in this policy.</p>
        </section>

        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-2">Contact</h2>
          <p className="text-gray-600">If you have any questions about this Privacy Policy, contact us at <a className="text-blue-600" href="mailto:support@animalhub.com">support@animalhub.com</a>.</p>
        </section>
      </div>
    </div>
  );
};

export default Privacy;

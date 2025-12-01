import React from 'react';

const Terms = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Terms of Service</h1>
        <p className="text-gray-700 mb-4">These Terms of Service govern your use of Animal Marketplace. By using the site, you agree to these terms.</p>

        <section className="bg-white rounded-lg shadow p-6 mb-4">
          <h2 className="text-xl font-semibold mb-2">Acceptable Use</h2>
          <p className="text-gray-600">Users must comply with all local laws and listing guidelines. Prohibited items and behaviors are strictly enforced.</p>
        </section>

        <section className="bg-white rounded-lg shadow p-6 mb-4">
          <h2 className="text-xl font-semibold mb-2">User Accounts</h2>
          <p className="text-gray-600">Users are responsible for maintaining account security and are liable for actions taken through their account.</p>
        </section>

        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-2">Limitation of Liability</h2>
          <p className="text-gray-600">Animal Marketplace provides a platform for users to connect. We are not responsible for transactions between users beyond facilitating contact and listings.</p>
        </section>
      </div>
    </div>
  );
};

export default Terms;

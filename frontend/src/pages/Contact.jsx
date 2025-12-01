import React, { useState } from 'react';
import toast from 'react-hot-toast';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return toast.error('Please fill all fields');
    setLoading(true);
    // For now we just simulate submission; backend endpoint can be added later.
    setTimeout(() => {
      setLoading(false);
      toast.success('Message sent. We will get back to you soon.');
      setForm({ name: '', email: '', message: '' });
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Contact Us</h1>
        <p className="text-gray-700 mb-6">Have questions or need help? Send us a message and our customer support will reply as soon as possible.</p>

        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Name</label>
              <input name="name" value={form.name} onChange={handleChange} className="mt-1 block w-full border border-gray-200 rounded px-3 py-2" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <input name="email" value={form.email} onChange={handleChange} className="mt-1 block w-full border border-gray-200 rounded px-3 py-2" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Message</label>
              <textarea name="message" value={form.message} onChange={handleChange} rows={5} className="mt-1 block w-full border border-gray-200 rounded px-3 py-2" />
            </div>

            <div className="flex items-center gap-3">
              <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                {loading ? 'Sending...' : 'Send Message'}
              </button>
              <a href="mailto:support@animalhub.com" className="text-gray-600 text-sm hover:text-blue-600">Or email us directly: support@animalhub.com</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;

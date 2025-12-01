import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';
import { FaLock } from 'react-icons/fa';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.password || !form.confirm) return toast.error('Please fill both fields');
    if (form.password !== form.confirm) return toast.error('Passwords do not match');

    setLoading(true);
    try {
      await axios.post(`/api/auth/reset-password/${encodeURIComponent(token)}`, { password: form.password });
      toast.success('Password reset successful. You may now sign in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="flex flex-col items-center mb-4">
          <FaLock className="text-3xl text-blue-600" />
          <h2 className="mt-4 text-center text-2xl font-semibold text-gray-900">Reset your password</h2>
          <p className="mt-2 text-center text-sm text-gray-600 max-w-[380px]">Enter a new password for your account. This token is simulated: <span className="font-mono text-xs break-words">{token}</span></p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="sr-only">New password</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="New password"
              required
            />
          </div>
          <div>
            <label className="sr-only">Confirm password</label>
            <input
              name="confirm"
              type="password"
              value={form.confirm}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Confirm new password"
              required
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Reset password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;

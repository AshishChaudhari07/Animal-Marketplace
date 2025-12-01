import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { FaSave, FaBell, FaLock, FaUser } from 'react-icons/fa';

const Settings = () => {
  const { user, fetchUser } = useAuth();
  const [prefs, setPrefs] = useState({ emailNotifications: true, smsNotifications: false });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load saved preferences from localStorage (frontend-only preferences)
    try {
      const saved = localStorage.getItem('animalhub_prefs');
      if (saved) setPrefs(JSON.parse(saved));
    } catch (err) {
      // ignore
    }
  }, []);

  const handleToggle = (key) => {
    setPrefs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSavePrefs = () => {
    localStorage.setItem('animalhub_prefs', JSON.stringify(prefs));
    toast.success('Preferences saved');
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    const form = e.target;
    const currentPassword = form.currentPassword.value;
    const newPassword = form.newPassword.value;
    const confirmPassword = form.confirmPassword.value;

    if (!currentPassword || !newPassword) return toast.error('Please fill password fields');
    if (newPassword !== confirmPassword) return toast.error('New passwords do not match');

    setLoading(true);
    try {
      // If your backend exposes a change-password endpoint, update the URL below.
      // Fallback: simulate success to avoid blocking the UI if backend not implemented.
      // await axios.post('/api/auth/change-password', { currentPassword, newPassword });
      await new Promise(resolve => setTimeout(resolve, 700));
      toast.success('Password changed successfully (simulated)');
      form.reset();
    } catch (err) {
      toast.error('Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Settings</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Account Summary / Quick Links */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl">
                <FaUser />
              </div>
              <div>
                <h2 className="text-lg font-semibold">{user.name}</h2>
                <p className="text-sm text-gray-500">{user.email}</p>
                <p className="text-xs text-gray-400 capitalize">{user.role}</p>
              </div>
            </div>
            <p className="text-sm text-gray-600">Manage account preferences, notification settings, and security options from here.</p>
          </div>

          {/* Notification Preferences */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><FaBell /> Notifications</h3>
            <div className="flex flex-col gap-3">
              <label className="flex items-center justify-between gap-4">
                <span className="text-sm text-gray-700">Email notifications</span>
                <input type="checkbox" checked={prefs.emailNotifications} onChange={() => handleToggle('emailNotifications')} />
              </label>
              <label className="flex items-center justify-between gap-4">
                <span className="text-sm text-gray-700">SMS notifications</span>
                <input type="checkbox" checked={prefs.smsNotifications} onChange={() => handleToggle('smsNotifications')} />
              </label>
              <div className="pt-4">
                <button onClick={handleSavePrefs} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2">
                  <FaSave /> Save Preferences
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Security / Change Password */}
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><FaLock /> Security</h3>
          <form onSubmit={handleChangePassword} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="md:col-span-1">
              <label className="text-sm text-gray-700 block mb-1">Current password</label>
              <input name="currentPassword" type="password" className="w-full px-3 py-2 border rounded" />
            </div>
            <div>
              <label className="text-sm text-gray-700 block mb-1">New password</label>
              <input name="newPassword" type="password" className="w-full px-3 py-2 border rounded" />
            </div>
            <div>
              <label className="text-sm text-gray-700 block mb-1">Confirm new</label>
              <input name="confirmPassword" type="password" className="w-full px-3 py-2 border rounded" />
            </div>
            <div className="md:col-span-3 pt-2">
              <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                {loading ? 'Saving...' : 'Change Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;

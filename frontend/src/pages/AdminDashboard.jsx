import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  FaCheckCircle,
  FaTimesCircle,
  FaUsers,
  FaPaw,
  FaChartBar,
  FaClock,
  FaSearch
} from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

const AdminDashboard = () => {
  const [pendingAnimals, setPendingAnimals] = useState([]);
  const [users, setUsers] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const { t } = useTranslation();

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'pending') {
        const res = await axios.get('/api/admin/animals/pending');
        setPendingAnimals(res.data);
      } else if (activeTab === 'users') {
        const res = await axios.get('/api/admin/users');
        setUsers(res.data.users || []);
      } else if (activeTab === 'analytics') {
        const res = await axios.get('/api/admin/analytics');
        setAnalytics(res.data || null);
      }
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await axios.put(`/api/admin/animals/${id}/approve`);
      toast.success('Animal approved');
      fetchData();
    } catch {
      toast.error('Failed to approve animal');
    }
  };

  const handleReject = async (id) => {
    try {
      await axios.put(`/api/admin/animals/${id}/reject`);
      toast.success('Animal rejected');
      fetchData();
    } catch {
      toast.error('Failed to reject animal');
    }
  };

  const handleUserUpdate = async (userId, updates) => {
    try {
      await axios.put(`/api/admin/users/${userId}`, updates);
      fetchData();
    } catch {
      toast.error('Failed to update user');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await axios.delete(`/api/admin/users/${userId}`);
      toast.success('User deleted');
      fetchData();
    } catch {
      toast.error('Failed to delete user');
    }
  };

  const toggleBlock = async (userId, blocked) => {
    try {
      await handleUserUpdate(userId, { blocked: !blocked });
      toast.success(blocked ? 'User unblocked' : 'User blocked');
      fetchData();
    } catch {}
  };

  const filteredUsers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return users.filter((u) => {
      if (roleFilter !== 'all' && u.role !== roleFilter) return false;
      if (!q) return true;
      return (
        (u.name && u.name.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q))
      );
    });
  }, [users, searchQuery, roleFilter]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-8">{t('admin.title')}</h1>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b">
          {[
            { key: 'pending', label: t('admin.pendingApprovals'), icon: <FaClock /> },
            { key: 'users', label: t('admin.users'), icon: <FaUsers /> },
            { key: 'analytics', label: t('admin.analytics'), icon: <FaChartBar /> }
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className={`px-4 py-2 font-semibold inline-flex items-center gap-2 ${
                activeTab === item.key ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'
              }`}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </div>

        {/* Pending Animals */}
        {activeTab === 'pending' && (
          <div>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin h-12 w-12 rounded-full border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : pendingAnimals.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <FaCheckCircle className="text-6xl text-green-500 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">{t('admin.noPending')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pendingAnimals.map((animal) => (
                  <div key={animal._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="relative h-48 bg-gray-200">
                      {animal.images?.length ? (
                        <img src={animal.images[0]} alt={animal.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <FaPaw className="text-4xl" />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-1">{animal.title}</h3>
                      <p className="text-gray-600 text-sm mb-2">
                        {animal.species} • {animal.breed} • ₹{animal.price}
                      </p>
                      <p className="text-gray-500 text-xs mb-2">
                        Seller: {animal.seller?.name || 'Unknown'}
                      </p>
                      <p className="text-gray-500 text-xs mb-4 line-clamp-2">{animal.description}</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(animal._id)}
                          className="flex-1 bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 flex items-center justify-center gap-2"
                        >
                          <FaCheckCircle /> {t('admin.approve')}
                        </button>
                        <button
                          onClick={() => handleReject(animal._id)}
                          className="flex-1 bg-red-600 text-white px-3 py-2 rounded-md hover:bg-red-700 flex items-center justify-center gap-2"
                        >
                          <FaTimesCircle /> {t('admin.reject')}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Users */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden p-4">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin h-12 w-12 rounded-full border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder={t('admin.searchUsers')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full border rounded px-3 py-2 pl-10"
                    />
                    <FaSearch className="absolute left-3 top-2.5 text-gray-400" />
                  </div>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="border rounded px-3 py-2"
                  >
                    <option value="all">{t('admin.allRoles')}</option>
                    <option value="buyer">{t('admin.roleBuyer')}</option>
                    <option value="seller">{t('admin.roleSeller')}</option>
                    <option value="admin">{t('admin.roleAdmin')}</option>
                  </select>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.name')}</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.email')}</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.roleHeader')}</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.verified')}</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.actions')}</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredUsers.map((u) => (
                        <tr key={u._id}>
                          <td className="px-6 py-4 whitespace-nowrap">{u.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{u.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <select
                              value={u.role}
                              onChange={(e) => handleUserUpdate(u._id, { role: e.target.value })}
                              className="border rounded px-2 py-1"
                            >
                              <option value="buyer">Buyer</option>
                              <option value="seller">Seller</option>
                              <option value="admin">Admin</option>
                            </select>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={Boolean(u.isVerified)}
                              onChange={(e) => handleUserUpdate(u._id, { isVerified: e.target.checked })}
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap flex items-center gap-3">
                            {u.role !== 'admin' ? (
                              <>
                                <button
                                  onClick={() => toggleBlock(u._id, Boolean(u.blocked))}
                                  className={`px-3 py-1 rounded ${
                                    u.blocked ? 'bg-green-600 text-white' : 'bg-yellow-400 text-gray-800'
                                  }`}
                                >
                                  {u.blocked ? t('admin.unblock') : t('admin.block')}
                                </button>
                                <button onClick={() => handleDeleteUser(u._id)} className="text-red-600 hover:text-red-800">
                                  {t('admin.delete')}
                                </button>
                              </>
                            ) : (
                              <span className="text-sm text-gray-500">{t('admin.adminLabel')}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {/* Analytics */}
        {activeTab === 'analytics' && (
          <div>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin h-12 w-12 rounded-full border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : analytics ? (
              <div className="space-y-8">
                {/* Summary cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <p className="text-gray-500 text-sm">Total Users</p>
                    <p className="text-4xl font-bold text-blue-600">{analytics.users?.total ?? 0}</p>
                  </div>
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <p className="text-gray-500 text-sm">Total Animals</p>
                    <p className="text-4xl font-bold text-green-600">{analytics.animals?.total ?? 0}</p>
                  </div>
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <p className="text-gray-500 text-sm">Pending Animals</p>
                    <p className="text-4xl font-bold text-yellow-600">{analytics.animals?.pending ?? 0}</p>
                  </div>
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <p className="text-gray-500 text-sm">Total Reviews</p>
                    <p className="text-4xl font-bold text-purple-600">{analytics.reviews ?? 0}</p>
                  </div>
                </div>

                {/* Animals by Category */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-lg font-semibold mb-4">Animals by Category</h2>
                  {analytics.categories ? (
                    <ul className="space-y-2">
                      {Array.isArray(analytics.categories)
                        ? analytics.categories.map((c, i) => (
                            <li key={i} className="flex justify-between items-center border-b pb-1">
                              <span className="text-gray-700">{c.label || c.title}</span>
                              <span className="font-semibold text-blue-600">{c.count}</span>
                            </li>
                          ))
                        : Object.entries(analytics.categories).map(([name, count]) => (
                            <li key={name} className="flex justify-between items-center border-b pb-1">
                              <span className="text-gray-700">{name}</span>
                              <span className="font-semibold text-blue-600">{count}</span>
                            </li>
                          ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 text-sm">No category data</p>
                  )}
                </div>

                {/* Monthly New Users */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-lg font-semibold mb-4">Monthly New Users</h2>
                  {analytics.monthlyUsers ? (
                    <ul className="space-y-2">
                      {analytics.monthlyUsers.map((m, i) => (
                        <li key={i} className="flex justify-between items-center border-b pb-1">
                          <span className="text-gray-700">{m.month}</span>
                          <span className="font-semibold text-green-600">{m.count}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 text-sm">No monthly users</p>
                  )}
                </div>

                {/* Monthly New Animals */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-lg font-semibold mb-4">Monthly New Animals Listed</h2>
                  {analytics.monthlyAnimals ? (
                    <ul className="space-y-2">
                      {analytics.monthlyAnimals.map((m, i) => (
                        <li key={i} className="flex justify-between items-center border-b pb-1">
                          <span className="text-gray-700">{m.month}</span>
                          <span className="font-semibold text-purple-600">{m.count}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 text-sm">No monthly animals</p>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaPaw, FaUser, FaSignOutAlt, FaHome, FaShoppingCart, FaStore, FaCog, FaComments, FaChevronDown, FaHeart, FaBars, FaTimes } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t, i18n } = useTranslation();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    if (isProfileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isProfileOpen]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsProfileOpen(false);
    setMobileOpen(false);
  };

  const getProfileInitials = () => {
    if (!user) return '';
    return user.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getProfileColor = () => {
    if (!user) return 'bg-blue-600';
    const colors = ['bg-blue-600', 'bg-purple-600', 'bg-pink-600', 'bg-green-600', 'bg-orange-600'];
    const index = user._id ? user._id.charCodeAt(0) % colors.length : 0;
    return colors[index];
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 text-blue-600 font-bold text-xl hover:text-blue-700 transition-colors">
              <FaPaw />
              <span>{t('nav.brand')}</span>
            </Link>
          </div>

          {/* Desktop Links */}
          <div className="hidden sm:flex items-center space-x-4">
            {user ? (
              <>
                <Link to="/" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1">
                  <FaHome size={16} />
                  {t('nav.home')}
                </Link>

                {(user.role === 'buyer' || user.role === 'admin') && (
                  <Link to="/buyer/dashboard" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1">
                    <FaShoppingCart size={16} />
                    {t('nav.browse')}
                  </Link>
                )}

                {(user.role === 'seller' || user.role === 'admin') && (
                  <Link to="/seller/dashboard" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1">
                    <FaStore size={16} />
                    {t('nav.myListings')}
                  </Link>
                )}

                {user.role === 'admin' && (
                  <Link to="/admin/dashboard" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1">
                    <FaCog size={16} />
                    {t('nav.admin')}
                  </Link>
                )}

                <Link to="/messages" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1">
                  <FaComments size={16} />
                  {t('nav.messages')}
                </Link>

                <Link to="/saved-items" className="text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1">
                  <FaHeart size={16} />
                  {t('nav.saved')}
                </Link>

                {/* Language selector + Profile Dropdown */}
                <div className="relative">
                  <select
                    aria-label={t('nav.language')}
                    value={i18n.language || 'en'}
                    onChange={(e) => {
                      i18n.changeLanguage(e.target.value);
                      localStorage.setItem('i18nextLng', e.target.value);
                    }}
                    className="border rounded px-2 py-1 mr-2 text-sm"
                  >
                    <option value="en">EN</option>
                    <option value="gu">GU</option>
                    <option value="hi">HI</option>
                    <option value="mr">MR</option>
                    <option value="mw">MW</option>
                  </select>
                </div>

                {/* Profile Dropdown */}
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
                    aria-expanded={isProfileOpen}
                  >
                    <div className={`w-8 h-8 rounded-full ${getProfileColor()} flex items-center justify-center text-white font-bold text-sm shadow-md`}>
                      {getProfileInitials()}
                    </div>
                    <span className="text-sm font-medium text-gray-700 hidden md:inline max-w-[120px] truncate">
                      {user.name}
                    </span>
                    <FaChevronDown size={12} className={`text-gray-600 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-10">
                            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                              <p className="font-semibold text-gray-800">{user.name}</p>
                              <p className="text-xs text-gray-500">{user.email}</p>
                              <p className="text-xs text-blue-600 capitalize font-medium mt-1">{user.role}</p>
                            </div>

                      <Link to="/profile" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100">
                        <FaUser size={16} className="text-gray-600" />
                        <span className="text-sm text-gray-700">{t('nav.dashboard')}</span>
                      </Link>

                      <Link to="/settings" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100">
                        <FaCog size={16} className="text-gray-600" />
                        <span className="text-sm text-gray-700">{t('nav.settings')}</span>
                      </Link>

                      <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors text-red-600">
                        <FaSignOutAlt size={16} />
                        <span className="text-sm font-medium">{t('nav.logout')}</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
              ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">{t('nav.login')}</Link>
                <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium transition-colors">{t('nav.signup')}</Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <div className="flex sm:hidden items-center">
            <button onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu" className="p-2 rounded-md text-gray-700 hover:bg-gray-100">
              {mobileOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {mobileOpen && (
        <div className="sm:hidden bg-white border-t border-gray-100">
          <div className="px-4 pt-4 pb-6 space-y-3">
            {user ? (
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-full ${getProfileColor()} flex items-center justify-center text-white font-bold text-sm`}>{getProfileInitials()}</div>
                  <div>
                    <div className="font-medium text-gray-800">{user.name}</div>
                    <div className="text-xs text-gray-500">{user.email}</div>
                  </div>
                </div>

                <nav className="space-y-1">
                  <Link to="/" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-50">{t('nav.home')}</Link>
                  {(user.role === 'buyer' || user.role === 'admin') && <Link to="/buyer/dashboard" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-50">{t('nav.browse')}</Link>}
                  {(user.role === 'seller' || user.role === 'admin') && <Link to="/seller/dashboard" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-50">{t('nav.myListings')}</Link>}
                  {user.role === 'admin' && <Link to="/admin/dashboard" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-50">{t('nav.admin')}</Link>}
                  <Link to="/messages" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-50">{t('nav.messages')}</Link>
                  <Link to="/saved-items" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-50">{t('nav.saved')}</Link>
                </nav>

                <div className="mt-3 border-t pt-3">
                  <Link to="/profile" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-50">{t('nav.dashboard')}</Link>
                  <Link to="/settings" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-50">{t('nav.settings')}</Link>
                  <button onClick={handleLogout} className="w-full text-left px-3 py-2 rounded-md text-red-600 hover:bg-red-50">{t('nav.logout')}</button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Link to="/login" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-50">Login</Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700">Sign Up</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;



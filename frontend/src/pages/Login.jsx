import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FaPaw, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    showPassword: false
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      toast.success(t('login.success'));
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'seller') {
        navigate('/seller/dashboard');
      } else {
        navigate('/buyer/dashboard');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || t('login.failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex flex-col items-center">
            <div className="flex justify-center">
              <FaPaw className="text-5xl text-blue-600" />
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              {t('login.title')}
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600 max-w-[320px]">{t('login.subtitle')}</p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md -space-y-px">
              <div className="mb-4">
                <label htmlFor="email" className="sr-only">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder={t('login.emailPlaceholder')}
                />
              </div>

              <div className="mb-2 relative">
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type={formData.showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm pr-10"
                  placeholder={t('login.passwordPlaceholder')}
                />
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, showPassword: !prev.showPassword }))}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  aria-label={formData.showPassword ? t('login.hidePassword') : t('login.showPassword')}
                >
                  {formData.showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              <div className="flex justify-end mb-4">
                <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-500">{t('login.forgot')}</Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? t('login.signing') : t('login.signin')}
              </button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                {t('login.noAccount')} {' '}
                <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
                  {t('login.signup')}
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;



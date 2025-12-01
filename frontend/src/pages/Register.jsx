import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FaPaw, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'buyer',
    phone: '',
    city: '',
    state: '',
    zipCode: ''
  });

  const [ui, setUi] = useState({ showPassword: false, showConfirm: false });
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Validation function
  const validate = (data) => {
    const errs = {};
    if (!data.name || data.name.trim().length < 2) errs.name = t('register.errorName');
    if (!data.email) errs.email = t('register.errorEmailRequired');
    else if (!/^[\w.-]+@[\w.-]+\.[A-Za-z]{2,}$/.test(data.email)) errs.email = t('register.errorEmailValid');
    if (!data.password) errs.password = t('register.errorPasswordRequired');
    else {
      if (data.password.length < 6) errs.password = t('register.errorPasswordLength');
    }
    if (!data.confirmPassword) errs.confirmPassword = t('register.errorConfirm');
    else if (data.password !== data.confirmPassword) errs.confirmPassword = t('register.errorPasswordMatch');
    return errs;
  };

  const errors = useMemo(() => validate(formData), [formData]);

  // Simple password strength scoring (0-4)
  const passwordStrength = useMemo(() => {
    const pw = formData.password || '';
    let score = 0;
    if (pw.length >= 6) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return Math.min(score, 4);
  }, [formData.password]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleBlur = (e) => setTouched(prev => ({ ...prev, [e.target.name]: true }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    // final validation
    const finalErrors = validate(formData);
    if (Object.keys(finalErrors).length > 0) {
      setTouched({ name: true, email: true, password: true, confirmPassword: true });
      toast.error(t('register.errorsFix'));
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...registerData } = formData;
      await register(registerData);
      toast.success(t('register.success'));
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'seller') {
        navigate('/seller/dashboard');
      } else {
        navigate('/buyer/dashboard');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || t('register.failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex flex-col items-center mb-6">
            <FaPaw className="text-5xl text-blue-600" />
            <h2 className="mt-4 text-center text-2xl font-extrabold text-gray-900">{t('register.title')}</h2>
            <p className="mt-2 text-center text-sm text-gray-600 max-w-[40rem]">{t('register.subtitle')}</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">{t('register.fullName')}</label>
                <input id="name" name="name" type="text" required value={formData.name} onChange={handleChange} onBlur={handleBlur}
                  className={`mt-1 block w-full px-3 py-2 border rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${touched.name && errors.name ? 'border-red-500' : ''}`} />
                {touched.name && errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">{t('register.email')}</label>
                <input id="email" name="email" type="email" required value={formData.email} onChange={handleChange} onBlur={handleBlur}
                  className={`mt-1 block w-full px-3 py-2 border rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${touched.email && errors.email ? 'border-red-500' : ''}`} />
                {touched.email && errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700">{t('register.iWant')}</label>
                <select id="role" name="role" value={formData.role} onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                  <option value="buyer">{t('register.buyAdopt')}</option>
                  <option value="seller">{t('register.sellAnimals')}</option>
                </select>
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">{t('register.phoneOptional')}</label>
                <input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">{t('register.password')}</label>
                <input id="password" name="password" type={ui.showPassword ? 'text' : 'password'} required value={formData.password} onChange={handleChange} onBlur={handleBlur}
                  className={`mt-1 block w-full px-3 py-2 border rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm pr-10 ${touched.password && errors.password ? 'border-red-500' : ''}`} />
                <button type="button" onClick={() => setUi(prev => ({ ...prev, showPassword: !prev.showPassword }))}
                  className="absolute right-3 top-9 text-gray-500 hover:text-gray-700" aria-label={ui.showPassword ? t('register.hidePassword') : t('register.showPassword')}>
                  {ui.showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
                {touched.password && errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
                <div className="mt-2 h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full ${passwordStrength >= 3 ? 'bg-green-500' : passwordStrength === 2 ? 'bg-yellow-400' : 'bg-red-400'}`} style={{ width: `${(passwordStrength / 4) * 100}%` }} />
                </div>
              </div>

              <div className="relative">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">{t('register.confirmPassword')}</label>
                <input id="confirmPassword" name="confirmPassword" type={ui.showConfirm ? 'text' : 'password'} required value={formData.confirmPassword} onChange={handleChange} onBlur={handleBlur}
                  className={`mt-1 block w-full px-3 py-2 border rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm pr-10 ${touched.confirmPassword && errors.confirmPassword ? 'border-red-500' : ''}`} />
                <button type="button" onClick={() => setUi(prev => ({ ...prev, showConfirm: !prev.showConfirm }))}
                  className="absolute right-3 top-9 text-gray-500 hover:text-gray-700" aria-label={ui.showConfirm ? t('register.hidePassword') : t('register.showPassword')}>
                  {ui.showConfirm ? <FaEyeSlash /> : <FaEye />}
                </button>
                {touched.confirmPassword && errors.confirmPassword && <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700">{t('register.city')}</label>
                <input id="city" name="city" type="text" value={formData.city} onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
              </div>
              <div>
                <label htmlFor="state" className="block text-sm font-medium text-gray-700">{t('register.state')}</label>
                <input id="state" name="state" type="text" value={formData.state} onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
              </div>
            </div>

            <div>
              <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">{t('register.zip')}</label>
              <input id="zipCode" name="zipCode" type="text" value={formData.zipCode} onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
            </div>

            <div>
              <button type="submit" disabled={loading}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50">
                {loading ? t('register.creating') : t('register.create')}
              </button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">{t('register.already')} {' '}
                <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">{t('nav.login')}</Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
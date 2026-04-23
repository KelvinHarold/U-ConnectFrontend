import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import api from "../api/axios";
import { 
  UserIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  MapPinIcon,
  LockClosedIcon,
  BuildingOfficeIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';

const Register = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    password_confirmation: "",
    role: "buyer",
    address: "",
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.password_confirmation) {
      setError(t('register.passwordMismatch'));
      return;
    }
    setLoading(true);
    setError(null);

    try {
      await api.post("/register", form);
      alert(t('register.registrationSuccess'));
      navigate("/login");
    } catch (err) {
      if (err.response?.status === 422) {
        const errors = err.response.data.errors;
        setError(Object.values(errors).flat()[0]);
      } else {
        setError(err.response?.data?.message || t('register.registrationFailed'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6">
      <div className="max-w-lg w-full">
        <div className="bg-white rounded-2xl shadow-xl shadow-blue-900/5 overflow-hidden border border-gray-100">
          
          {/* Header Section */}
          <div className="pt-8 pb-4 text-center">
            <img 
              src="/U-Connect Logo.png" 
              alt="U-Connect" 
              className="h-20 w-auto mx-auto mb-2 object-contain"
            />
            <h2 className="text-2xl font-bold text-gray-900">{t('register.title')}</h2>
            <p className="text-gray-500 text-sm mt-1">{t('register.subtitle')}</p>
          </div>

          <div className="px-8 pb-10">
            {/* Role Switcher - Professional Segmented Control */}
            <div className="flex p-1 bg-gray-100 rounded-xl mb-6">
              <button
                type="button"
                onClick={() => setForm({...form, role: 'buyer'})}
                className={`flex-1 flex items-center justify-center py-2 text-sm font-medium rounded-lg transition-all ${
                  form.role === 'buyer' ? 'bg-white text-[#5C352C] shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <UserIcon className="h-4 w-4 mr-2" />
                {t('register.student')}
              </button>
              <button
                type="button"
                onClick={() => setForm({...form, role: 'seller'})}
                className={`flex-1 flex items-center justify-center py-2 text-sm font-medium rounded-lg transition-all ${
                  form.role === 'seller' ? 'bg-white text-[#5C352C] shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <BuildingOfficeIcon className="h-4 w-4 mr-2" />
                {t('register.shopOwner')}
              </button>
            </div>

            {error && (
              <div className="mb-6 p-3 bg-red-50 border-l-4 border-red-500 rounded text-red-700 text-sm animate-shake">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Name */}
              <div className="md:col-span-2 space-y-1">
                <label className="text-xs font-semibold text-gray-600 ml-1">{t('register.fullName')}</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-gray-400 group-focus-within:text-[#5C352C]" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-[#5C352C]/10 focus:border-[#5C352C] outline-none transition-all"
                    placeholder={t('register.fullNamePlaceholder')}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600 ml-1">{t('register.email')}</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-[#5C352C]/10 outline-none transition-all"
                    placeholder={t('register.emailPlaceholder')}
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600 ml-1">{t('register.phone')}</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <PhoneIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-[#5C352C]/10 outline-none transition-all"
                    placeholder={t('register.phonePlaceholder')}
                  />
                </div>
              </div>

              {/* Dynamic Address Label */}
              <div className="md:col-span-2 space-y-1">
                <label className="text-xs font-semibold text-gray-600 ml-1">
                  {form.role === 'buyer' ? t('register.studentAddressLabel') : t('register.sellerAddressLabel')}
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPinIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-[#5C352C]/10 outline-none transition-all"
                    placeholder={form.role === 'buyer' ? t('register.studentAddressPlaceholder') : t('register.sellerAddressPlaceholder')}
                  />
                </div>
              </div>


              {/* Password */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600 ml-1">{t('register.password')}</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-[#5C352C]/10 outline-none transition-all"
                    placeholder={t('register.passwordPlaceholder')}
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600 ml-1">{t('register.confirmPassword')}</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password_confirmation"
                    value={form.password_confirmation}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-[#5C352C]/10 outline-none transition-all"
                    placeholder={t('register.confirmPasswordPlaceholder')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-[#5C352C] transition-colors"
                    aria-label={showPassword ? t('register.hidePassword') : t('register.showPassword')}
                  >
                    {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <div className="md:col-span-2 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#5C352C] hover:bg-[#4a2b24] text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-[#5C352C]/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? t('register.creatingAccount') : t('register.joinCommunity')}
                </button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                {t('register.alreadyHaveAccount')}{" "}
                <Link to="/login" className="text-[#5C352C] font-bold hover:underline decoration-2 underline-offset-4">
                  {t('register.login')}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Add animation style */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Register;
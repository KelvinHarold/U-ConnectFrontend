import { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import LanguageSelector from "../components/common/LanguageSelector";
import { EnvelopeIcon, LockClosedIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import '../index.css';

const Login = () => {
  const { login } = useContext(AuthContext);
  const { t } = useLanguage();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      await login(email, password);
      // The login function handles navigation, including redirects
    } catch (err) {
      setError(err.response?.data?.message || t('login.invalidCredentials'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4">
      {/* Language Selector - Top Right */}
      <div className="absolute top-4 right-4 z-50">
        <LanguageSelector />
      </div>

      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl shadow-blue-900/5 overflow-hidden border border-gray-100">
          <div className="pt-10 pb-6 text-center px-8">
            <img src="/U-Connect Logo.png" alt="U-Connect" className="h-20 w-auto mx-auto mb-4 object-contain" />
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{t('login.welcomeBack')}</h2>
            <p className="text-gray-500 mt-1">{t('login.enterDetails')}</p>
          </div>
          
          <div className="px-8 pb-10">
            {error && (
              <div className="mb-6 p-3 bg-red-50 border-l-4 border-red-500 rounded-md animate-shake">
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 ml-1">{t('login.emailAddress')}</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400 group-focus-within:text-[#5C352C] transition-colors" />
                  </div>
                  <input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                    placeholder={t('login.emailPlaceholder')} 
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-[#5C352C]/10 focus:border-[#5C352C] focus:bg-white transition-all outline-none text-gray-900" 
                  />
                </div>
              </div>
              
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 ml-1">{t('login.password')}</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-gray-400 group-focus-within:text-[#5C352C] transition-colors" />
                  </div>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                    placeholder={t('login.passwordPlaceholder')} 
                    className="w-full pl-10 pr-12 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-[#5C352C]/10 focus:border-[#5C352C] focus:bg-white transition-all outline-none text-gray-900" 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)} 
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label={showPassword ? t('login.hidePassword') : t('login.showPassword')}
                  >
                    {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center">
                  <input 
                    id="remember-me" 
                    type="checkbox" 
                    className="h-4 w-4 text-[#5C352C] border-gray-300 rounded focus:ring-[#5C352C]" 
                  />
                  <label htmlFor="remember-me" className="ml-2 text-xs text-gray-600 cursor-pointer">
                    {t('login.rememberMe')}
                  </label>
                </div>
                <Link to="/forgot-password" className="text-xs font-semibold text-[#5C352C] hover:text-[#3D221E] transition-colors">
                  {t('login.forgotPassword')}
                </Link>
              </div>
              
              <button 
                type="submit" 
                disabled={loading} 
                className="w-full bg-[#5C352C] hover:bg-[#4a2b24] text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-[#5C352C]/20 transition-all duration-200 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t('login.loggingIn')}
                  </span>
                ) : (
                  t('login.signIn')
                )}
              </button>
            </form>
            
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500">
                {t('login.newToPlatform')}{" "}
                <Link to="/register" className="text-[#5C352C] font-bold hover:underline decoration-2 underline-offset-4">
                  {t('login.createAccount')}
                </Link>
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-8 flex flex-col items-center space-y-4">
          <div className="flex space-x-6">
            <Link to="/" className="text-xs text-gray-400 hover:text-gray-600">
              {t('login.backToHome')}
            </Link>
          </div>
          <p className="text-xs text-gray-400">
            © 2026 U-Connect. {t('common.rightsReserved')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
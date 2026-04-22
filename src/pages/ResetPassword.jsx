// src/pages/ResetPassword.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { LockClosedIcon, EyeIcon, EyeSlashIcon, ArrowLeftIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import api from "../api/axios";

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [validating, setValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);

  useEffect(() => {
    // Get token and email from URL query parameters
    const params = new URLSearchParams(location.search);
    const tokenParam = params.get('token');
    const emailParam = params.get('email');
    
    console.log('Token from URL:', tokenParam);
    console.log('Email from URL:', emailParam);
    
    if (tokenParam && emailParam) {
      setToken(tokenParam);
      setEmail(emailParam);
      validateToken(tokenParam, emailParam);
    } else {
      setError("Invalid reset link. Please request a new password reset.");
      setValidating(false);
    }
  }, [location]);

  const validateToken = async (tokenValue, emailValue) => {
    try {
      const response = await api.post('/check-reset-token', {
        token: tokenValue,
        email: emailValue
      });
      
      if (response.data.success) {
        setTokenValid(true);
        setError(null);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired reset link. Please request a new one.");
      setTokenValid(false);
    } finally {
      setValidating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    if (password !== passwordConfirmation) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }
    
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      setLoading(false);
      return;
    }
    
    try {
      await api.post('/reset-password', {
        email,
        token,
        password,
        password_confirmation: passwordConfirmation
      });
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.password?.[0] || "Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <svg className="animate-spin h-12 w-12 text-[#5C352C] mx-auto" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-4 text-gray-600">Validating your reset link...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!tokenValid && error) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            <div className="pt-10 pb-6 text-center px-8">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Invalid Reset Link</h2>
              <p className="text-gray-500 mt-2">{error}</p>
            </div>
            <div className="px-8 pb-10">
              <Link
                to="/forgot-password"
                className="w-full flex items-center justify-center gap-2 bg-[#5C352C] hover:bg-[#4a2b24] text-white font-bold py-3 px-4 rounded-xl transition-all duration-200"
              >
                Request New Reset Link
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <CheckCircleIcon className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Password Reset Successfully!</h2>
            <p className="text-gray-600 mb-6">
              Your password has been changed. You will be redirected to login shortly.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 bg-[#5C352C] hover:bg-[#4a2b24] text-white font-bold py-3 px-6 rounded-xl transition-all duration-200"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="pt-10 pb-6 text-center px-8">
            <img src="/U-Connect Logo.png" alt="U-Connect" className="h-20 w-auto mx-auto mb-4 object-contain" />
            <h2 className="text-2xl font-bold text-gray-900">Create New Password</h2>
            <p className="text-gray-500 mt-1">
              Enter your new password below
            </p>
          </div>
          <div className="px-8 pb-10">
            {error && (
              <div className="mb-6 p-3 bg-red-50 border-l-4 border-red-500 rounded-md">
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 ml-1">New Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-gray-400 group-focus-within:text-[#5C352C] transition-colors" />
                  </div>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                    placeholder="••••••••" 
                    className="w-full pl-10 pr-12 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-[#5C352C]/10 focus:border-[#5C352C] focus:bg-white transition-all outline-none text-gray-900" 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)} 
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 ml-1">Minimum 8 characters</p>
              </div>
              
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 ml-1">Confirm Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-gray-400 group-focus-within:text-[#5C352C] transition-colors" />
                  </div>
                  <input 
                    type={showConfirmPassword ? "text" : "password"} 
                    value={passwordConfirmation} 
                    onChange={(e) => setPasswordConfirmation(e.target.value)} 
                    required 
                    placeholder="••••••••" 
                    className="w-full pl-10 pr-12 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-[#5C352C]/10 focus:border-[#5C352C] focus:bg-white transition-all outline-none text-gray-900" 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              
              <button 
                type="submit" 
                disabled={loading} 
                className="w-full bg-[#5C352C] hover:bg-[#4a2b24] text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-[#5C352C]/20 transition-all duration-200 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Resetting Password...
                  </span>
                ) : (
                  "Reset Password"
                )}
              </button>
            </form>
            
            <div className="mt-6 text-center">
              <Link to="/login" className="text-sm text-[#5C352C] hover:text-[#4a2b24] font-medium inline-flex items-center gap-1">
                <ArrowLeftIcon className="w-4 h-4" />
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
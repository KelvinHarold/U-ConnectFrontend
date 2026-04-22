// src/pages/ForgotPassword.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { EnvelopeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import api from "../api/axios";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      await api.post('/forgot-password', { email });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.email?.[0] || "Failed to send reset link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            <div className="pt-10 pb-6 text-center px-8">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Check Your Email</h2>
              <p className="text-gray-500 mt-2">
                We've sent a password reset link to <strong className="text-[#5C352C]">{email}</strong>
              </p>
            </div>
            <div className="px-8 pb-10">
              <div className="bg-blue-50 border-l-4 border-blue-500 rounded-md p-4 mb-6">
                <p className="text-sm text-blue-700">
                  Click the link in the email to reset your password. The link will expire in 60 minutes.
                </p>
              </div>
              <Link
                to="/login"
                className="w-full flex items-center justify-center gap-2 bg-[#5C352C] hover:bg-[#4a2b24] text-white font-bold py-3 px-4 rounded-xl transition-all duration-200"
              >
                <ArrowLeftIcon className="w-4 h-4" />
                Back to Login
              </Link>
            </div>
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
            <h2 className="text-2xl font-bold text-gray-900">Forgot Password?</h2>
            <p className="text-gray-500 mt-1">
              No worries! Enter your email and we'll send you a reset link.
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
                <label className="text-sm font-medium text-gray-700 ml-1">Email Address</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400 group-focus-within:text-[#5C352C] transition-colors" />
                  </div>
                  <input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                    placeholder="name@company.com" 
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-[#5C352C]/10 focus:border-[#5C352C] focus:bg-white transition-all outline-none text-gray-900" 
                  />
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
                    Sending...
                  </span>
                ) : (
                  "Send Reset Link"
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

export default ForgotPassword;
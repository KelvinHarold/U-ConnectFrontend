// src/pages/admin/users/EditUser.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import MainLayout from "../../../layouts/MainLayout";
import api from "../../../api/axios";
import { useToast } from "../../../contexts/ToastContext";
import { 
  ArrowLeft, 
  Save, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Shield, 
  Activity,
  AlertCircle,
  CheckCircle,
  X,
  RefreshCw,
  Store,
  ShoppingBag,
  Award,
  Building2,
  Crown,
  Briefcase
} from "lucide-react";

// ==================== SKELETON LOADERS ====================
const SkeletonFormField = () => (
  <div className="animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
    <div className="h-10 bg-gray-200 rounded w-full"></div>
  </div>
);

const SkeletonTextareaField = () => (
  <div className="animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
    <div className="h-24 bg-gray-200 rounded w-full"></div>
  </div>
);

// ==================== MAIN COMPONENT ====================
const EditUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    role: '',
    is_active: true
  });

  const refreshButtonRef = useRef(null);
  const formRef = useRef(null);

  useEffect(() => {
    fetchUser();
  }, [id]);

  const announceToScreenReader = (message) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    document.body.appendChild(announcement);
    setTimeout(() => announcement.remove(), 3000);
  };

  const fetchUser = async () => {
    setLoading(true);
    setRefreshing(true);
    try {
      const response = await api.get(`/admin/users/${id}`);
      const user = response.data;
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        role: user.roles?.[0]?.name || user.role || 'buyer',
        is_active: user.is_active ?? true
      });
      announceToScreenReader(`Loaded user data for ${user.name}`);
    } catch (error) {
      console.error("Error fetching user:", error);
      showToast(error.response?.data?.message || "Failed to load user data", "error");
    } finally {
      setLoading(false);
      setTimeout(() => setRefreshing(false), 500);
    }
  };

  const handleKeyPress = useCallback((event, callback) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      callback();
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    
    try {
      await api.put(`/admin/users/${id}`, formData);
      showToast("User updated successfully", "success");
      announceToScreenReader(`User ${formData.name} updated successfully`);
      setTimeout(() => {
        navigate(`/admin/users/${id}`);
      }, 1500);
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        showToast("Please fix the form errors", "error");
        announceToScreenReader("Please fix the form errors");
      } else {
        showToast(error.response?.data?.message || "Error updating user", "error");
      }
    } finally {
      setSaving(false);
    }
  };

  const getRoleIcon = (role) => {
    switch(role) {
      case 'admin': return <Crown className="w-4 h-4" aria-hidden="true" />;
      case 'seller': return <Store className="w-4 h-4" aria-hidden="true" />;
      case 'buyer': return <ShoppingBag className="w-4 h-4" aria-hidden="true" />;
      default: return <User className="w-4 h-4" aria-hidden="true" />;
    }
  };

  const getRoleColor = (role) => {
    switch(role) {
      case 'admin': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'seller': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'buyer': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getRoleDescription = (role) => {
    switch(role) {
      case 'admin': return 'Full system access and control';
      case 'seller': return 'Can manage products and view orders';
      case 'buyer': return 'Can browse and purchase products';
      default: return 'Standard user';
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
              </div>
              <div className="h-10 w-24 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
            <div className="h-28 bg-gradient-to-r from-gray-200 to-gray-100 rounded-2xl animate-pulse"></div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-[#2A1713] to-[#5C352C]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl animate-pulse"></div>
                  <div>
                    <div className="h-6 bg-white/20 rounded w-32 mb-1"></div>
                    <div className="h-3 bg-white/20 rounded w-48"></div>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-6">
                {[1, 2, 3, 4].map(i => <SkeletonFormField key={i} />)}
                <SkeletonTextareaField />
                <SkeletonFormField />
                <div className="h-24 bg-gray-100 rounded-xl"></div>
                <div className="flex gap-3 pt-4">
                  <div className="flex-1 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                  <div className="flex-1 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Header with Back Button */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <Link 
                to={`/admin/users/${id}`} 
                className="inline-flex items-center gap-2 text-[#5C352C] hover:text-[#956959] transition-colors group mb-2 focus:outline-none focus:ring-2 focus:ring-[#5C352C] rounded"
                aria-label="Go back to user details"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" aria-hidden="true" /> 
                <span className="font-medium">Back to User Details</span>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Edit User</h1>
              <p className="text-gray-500 text-sm">Update user information and permissions</p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                ref={refreshButtonRef}
                onClick={fetchUser}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-all font-medium text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#5C352C] disabled:opacity-50"
                aria-label="Refresh user data"
                onKeyPress={(e) => handleKeyPress(e, fetchUser)}
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} aria-hidden="true" />
                Refresh
              </button>
            </div>
          </div>

          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-[#5C352C] to-[#7A4B3E] rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white mb-1">Edit User Profile ✏️</h2>
                <p className="text-white/80 text-sm">Update user information and manage permissions</p>
              </div>
              <div className="hidden md:block">
                <div className="bg-white/10 backdrop-blur-sm rounded-full p-3">
                  <User className="w-8 h-8 text-white" aria-hidden="true" />
                </div>
              </div>
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition-all duration-300">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-[#2A1713] to-[#5C352C]">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-xl">
                  <User className="w-5 h-5 text-white" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Edit User</h2>
                  <p className="text-[#E9B48A] text-sm mt-0.5">Update user information and permissions</p>
                </div>
              </div>
            </div>

            {/* Error Summary */}
            {Object.keys(errors).length > 0 && (
              <div 
                className="m-6 bg-red-50 border border-red-200 rounded-xl p-4 animate-shake"
                role="alert"
                aria-live="polite"
              >
                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-red-100 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" aria-hidden="true" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-red-800 mb-2">Please fix the following errors:</h4>
                    <ul className="text-sm text-red-700 space-y-1">
                      {Object.values(errors).map((error, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <X className="w-3 h-3" aria-hidden="true" />
                          {error}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Form */}
            <form ref={formRef} onSubmit={handleSubmit} className="p-6" aria-label="Edit user form">
              <div className="space-y-6">
                
                {/* Name Field */}
                <div className="group/field">
                  <label className="block text-sm font-semibold text-gray-700 mb-2" id="name-label">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-[#5C352C]" aria-hidden="true" />
                      <span>Full Name</span>
                      <span className="text-red-500">*</span>
                    </div>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all text-sm ${
                      errors.name 
                        ? 'border-red-500 focus:ring-red-200' 
                        : 'border-gray-300 focus:border-[#5C352C] focus:ring-[#5C352C]/20 group-hover/field:border-[#5C352C]'
                    }`}
                    placeholder="Enter full name"
                    aria-labelledby="name-label"
                    aria-invalid={!!errors.name}
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-red-500 flex items-center gap-1" role="alert">
                      <X className="w-3 h-3" /> {errors.name}
                    </p>
                  )}
                </div>

                {/* Email Field */}
                <div className="group/field">
                  <label className="block text-sm font-semibold text-gray-700 mb-2" id="email-label">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-[#5C352C]" aria-hidden="true" />
                      <span>Email Address</span>
                      <span className="text-red-500">*</span>
                    </div>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all text-sm ${
                      errors.email 
                        ? 'border-red-500 focus:ring-red-200' 
                        : 'border-gray-300 focus:border-[#5C352C] focus:ring-[#5C352C]/20 group-hover/field:border-[#5C352C]'
                    }`}
                    placeholder="user@example.com"
                    aria-labelledby="email-label"
                    aria-invalid={!!errors.email}
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-500 flex items-center gap-1" role="alert">
                      <X className="w-3 h-3" /> {errors.email}
                    </p>
                  )}
                </div>

                {/* Phone Field */}
                <div className="group/field">
                  <label className="block text-sm font-semibold text-gray-700 mb-2" id="phone-label">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-[#5C352C]" aria-hidden="true" />
                      <span>Phone Number</span>
                      <span className="text-red-500">*</span>
                    </div>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all text-sm ${
                      errors.phone 
                        ? 'border-red-500 focus:ring-red-200' 
                        : 'border-gray-300 focus:border-[#5C352C] focus:ring-[#5C352C]/20 group-hover/field:border-[#5C352C]'
                    }`}
                    placeholder="+1 234 567 8900"
                    aria-labelledby="phone-label"
                    aria-invalid={!!errors.phone}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-xs text-red-500 flex items-center gap-1" role="alert">
                      <X className="w-3 h-3" /> {errors.phone}
                    </p>
                  )}
                </div>

                {/* Address Field */}
                <div className="group/field">
                  <label className="block text-sm font-semibold text-gray-700 mb-2" id="address-label">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#5C352C]" aria-hidden="true" />
                      <span>Address</span>
                    </div>
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-[#5C352C] focus:ring-2 focus:ring-[#5C352C]/20 transition-all text-sm group-hover/field:border-[#5C352C]"
                    placeholder="Enter user address"
                    aria-labelledby="address-label"
                  />
                </div>

                {/* Role Field */}
                <div className="group/field">
                  <label className="block text-sm font-semibold text-gray-700 mb-2" id="role-label">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-[#5C352C]" aria-hidden="true" />
                      <span>User Role</span>
                      <span className="text-red-500">*</span>
                    </div>
                  </label>
                  <div className="relative">
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-[#5C352C] focus:ring-2 focus:ring-[#5C352C]/20 transition-all appearance-none bg-white text-sm cursor-pointer group-hover/field:border-[#5C352C]"
                      aria-labelledby="role-label"
                    >
                      <option value="admin">👑 Admin - Full System Access</option>
                      <option value="seller">🏪 Seller - Product Management</option>
                      <option value="buyer">🛒 Buyer - Purchase Products</option>
                    </select>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      {getRoleIcon(formData.role)}
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${getRoleColor(formData.role)}`}>
                      {getRoleIcon(formData.role)}
                      <span>{formData.role?.toUpperCase()}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Briefcase className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>{getRoleDescription(formData.role)}</span>
                    </div>
                  </div>
                </div>

                {/* Status Toggle */}
                <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-5 border border-gray-200 group/status hover:shadow-sm transition-all duration-300">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-lg shadow-sm group-hover/status:shadow-md transition-all">
                        <Activity className="w-5 h-5 text-[#5C352C]" aria-hidden="true" />
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-gray-700" id="status-label">Account Status</label>
                        <p className="text-xs text-gray-500 mt-0.5">Enable or disable user access</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="is_active"
                        checked={formData.is_active}
                        onChange={handleChange}
                        className="sr-only peer"
                        aria-labelledby="status-label"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#5C352C]"></div>
                      <span className="ml-3 text-sm font-medium">
                        {formData.is_active ? (
                          <span className="flex items-center text-green-600">
                            <CheckCircle className="w-4 h-4 mr-1.5" aria-hidden="true" />
                            Active Account
                          </span>
                        ) : (
                          <span className="flex items-center text-red-600">
                            <X className="w-4 h-4 mr-1.5" aria-hidden="true" />
                            Inactive Account
                          </span>
                        )}
                      </span>
                    </label>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="pt-4 flex flex-col sm:flex-row gap-3 border-t border-gray-100">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 px-6 py-2.5 bg-gradient-to-r from-[#5C352C] to-[#956959] text-white rounded-lg font-medium hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5C352C] focus:ring-offset-2 hover:scale-105 transform transition-all duration-300"
                    aria-label="Save user changes"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" aria-hidden="true"></div>
                        Saving Changes...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" aria-hidden="true" />
                        Save Changes
                      </>
                    )}
                  </button>
                  
                  <Link
                    to={`/admin/users/${id}`}
                    className="flex-1 px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 hover:border-[#5C352C] transition-all duration-300 text-center text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 hover:scale-105 transform transition-all duration-300"
                    aria-label="Cancel editing and return to user details"
                  >
                    Cancel
                  </Link>
                </div>
              </div>
            </form>
          </div>

          {/* Info Note */}
          <div 
            className="bg-blue-50 border border-blue-200 rounded-xl p-4 group hover:shadow-md transition-all duration-300"
            role="note"
            aria-label="Information note about role changes"
          >
            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-blue-100 rounded-lg group-hover:scale-110 transition-transform duration-300">
                <AlertCircle className="w-4 h-4 text-blue-600" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">💡 Note:</span> Changing user roles will affect their permissions immediately. 
                  Make sure to review the role capabilities before making changes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default EditUser;
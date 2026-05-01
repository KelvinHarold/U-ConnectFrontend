import React, { useState, useEffect, useContext } from "react";
import MainLayout from "../layouts/MainLayout";
import api from "../api/axios";
import { AuthContext } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { useLanguage } from "../contexts/LanguageContext";
import { errorAlert, successAlert } from '../utils/sweetAlertHelper';

import { 
  User, 
  Save, 
  Lock, 
  Camera,
  Store,
  Package,
  ShoppingBag,
  DollarSign,
  Clock,
  CheckCircle,
  TrendingUp,
  Mail,
  Phone,
  MapPin,
  AlertCircle,
  BadgeCheck,
  Shield,
  Edit2,
  Check,
  X,
  Heart,
  Calendar,
  Truck,
  Star,
  RefreshCw,
  ChevronRight
} from "lucide-react";

// ==================== INSTAGRAM-STYLE SHIMMER ANIMATION ====================
const shimmerStyle = `
  @keyframes shimmer {
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }
  .animate-shimmer {
    animation: shimmer 1.5s ease-in-out infinite;
    background: linear-gradient(90deg, #f0f0f0 0%, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%, #f0f0f0 100%);
    background-size: 200% 100%;
  }
`;

// ==================== SKELETON LOADER ====================
const SkeletonProfileCard = () => (
  <div className="animate-pulse">
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <div className="h-24 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer"></div>
      <div className="flex justify-center -mt-12">
        <div className="w-24 h-24 rounded-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer ring-4 ring-white"></div>
      </div>
      <div className="p-6 text-center">
        <div className="h-5 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-32 mx-auto mb-2"></div>
        <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-24 mx-auto mb-4"></div>
        <div className="flex justify-center gap-2">
          <div className="h-8 w-24 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-full"></div>
          <div className="h-8 w-24 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-full"></div>
        </div>
      </div>
    </div>
  </div>
);

const SkeletonInfoCard = () => (
  <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
    <div className="p-4 border-b border-gray-100">
      <div className="h-5 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-32"></div>
    </div>
    <div className="p-4 space-y-4">
      <div className="space-y-2">
        <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-20"></div>
        <div className="h-10 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-xl"></div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-20"></div>
        <div className="h-10 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-xl"></div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-20"></div>
        <div className="h-20 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-xl"></div>
      </div>
    </div>
  </div>
);

// ==================== PROFILE HEADER CARD ====================
const ProfileHeaderCard = ({ user, role, previewUrl, isEditing, onFileChange, onEdit, onSave, onCancel, updating }) => (
  <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
    {/* Cover Image */}
    <div className="relative h-24 bg-gradient-to-r from-[#5C352C] to-[#7A4B3E]">
      <div className="absolute inset-0 bg-black/10"></div>
      {role === 'seller' && (
        <div className="absolute top-3 right-3 bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full text-[10px] font-medium flex items-center gap-1 shadow-sm">
          <BadgeCheck className="w-3 h-3" />
          Seller
        </div>
      )}
    </div>
    
    {/* Profile Picture */}
    <div className="flex justify-center -mt-10 mb-3">
      <div className="relative group">
        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden ring-4 ring-white shadow-sm">
          {previewUrl ? (
            <img 
              src={previewUrl} 
              alt="Profile" 
              className="w-full h-full object-cover"
            />
          ) : user?.profile_photo ? (
            <img 
              src={`${api.defaults.baseURL.replace('/api','')}/storage/${user.profile_photo}`} 
              alt="Profile" 
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-8 h-8 text-gray-400" />
          )}
        </div>
        {isEditing && (
          <label className="absolute bottom-0 right-0 p-1 bg-[#5C352C] rounded-full cursor-pointer hover:bg-[#956959] transition-colors shadow-sm">
            <Camera className="w-3 h-3 text-white" />
            <input 
              type="file" 
              accept="image/jpeg,image/png,image/jpg,image/webp" 
              onChange={(e) => onFileChange(e, 'profile')} 
              className="hidden" 
            />
          </label>
        )}
      </div>
    </div>
    
    {/* User Info */}
    <div className="text-center px-4 pb-4">
      <h2 className="text-base font-semibold text-gray-900">{user?.name}</h2>
      <p className="text-xs text-gray-500 mt-0.5">{user?.email}</p>
      {user?.phone && (
        <p className="text-[11px] text-gray-400 mt-1 flex items-center justify-center gap-1">
          <Phone className="w-3 h-3" />
          {user.phone}
        </p>
      )}
      
      {/* Action Buttons */}
      <div className="flex justify-center gap-2 mt-3">
        {!isEditing ? (
          <button
            onClick={onEdit}
            className="px-3 py-1.5 bg-[#5C352C] text-white rounded-lg hover:bg-[#4A2A22] transition-all text-xs font-medium flex items-center gap-1"
          >
            <Edit2 className="w-3 h-3" />
            Edit Profile
          </button>
        ) : (
          <>
            <button
              onClick={onSave}
              disabled={updating}
              className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all text-xs font-medium flex items-center gap-1"
            >
              {updating ? (
                <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></div>
              ) : (
                <>
                  <Check className="w-3 h-3" />
                  Save
                </>
              )}
            </button>
            <button
              onClick={onCancel}
              className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all text-xs font-medium flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              Cancel
            </button>
          </>
        )}
        <button
          onClick={() => document.getElementById('password-modal-trigger')?.click()}
          className="px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-all text-xs font-medium flex items-center gap-1"
        >
          <Lock className="w-3 h-3" />
          Password
        </button>
      </div>
    </div>
  </div>
);

// ==================== PERSONAL INFO CARD ====================
const PersonalInfoCard = ({ formData, errors, isEditing, onInputChange }) => (
  <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
    <div className="p-4 border-b border-gray-100">
      <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
        <User className="w-4 h-4 text-[#5C352C]" />
        Personal Information
      </h3>
      <p className="text-[10px] text-gray-500 mt-0.5">Manage your personal details</p>
    </div>
    <div className="p-4 space-y-4">
      {/* Name */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
          <User className="w-3 h-3 text-gray-400" />
          Full Name
        </label>
        {isEditing ? (
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={onInputChange}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#5C352C] focus:ring-1 focus:ring-[#5C352C]/20 transition-all text-sm bg-gray-50 focus:bg-white"
          />
        ) : (
          <div className="px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-700">
            {formData.name || 'Not provided'}
          </div>
        )}
        {errors.name && <p className="mt-1 text-[10px] text-red-500">{errors.name[0]}</p>}
      </div>

      {/* Email */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
          <Mail className="w-3 h-3 text-gray-400" />
          Email Address
        </label>
        {isEditing ? (
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={onInputChange}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#5C352C] focus:ring-1 focus:ring-[#5C352C]/20 transition-all text-sm bg-gray-50 focus:bg-white"
          />
        ) : (
          <div className="px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-700">
            {formData.email}
          </div>
        )}
        {errors.email && <p className="mt-1 text-[10px] text-red-500">{errors.email[0]}</p>}
      </div>

      {/* Phone */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
          <Phone className="w-3 h-3 text-gray-400" />
          Phone Number
        </label>
        {isEditing ? (
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={onInputChange}
            placeholder="Enter your phone number"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#5C352C] focus:ring-1 focus:ring-[#5C352C]/20 transition-all text-sm bg-gray-50 focus:bg-white"
          />
        ) : (
          <div className="px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-700">
            {formData.phone || 'Not provided'}
          </div>
        )}
      </div>

      {/* Address */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
          <MapPin className="w-3 h-3 text-gray-400" />
          Address
        </label>
        {isEditing ? (
          <textarea
            name="address"
            value={formData.address}
            onChange={onInputChange}
            rows="2"
            placeholder="Enter your address"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#5C352C] focus:ring-1 focus:ring-[#5C352C]/20 transition-all resize-none text-sm bg-gray-50 focus:bg-white"
          />
        ) : (
          <div className="px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-700 min-h-[60px]">
            {formData.address || 'Not provided'}
          </div>
        )}
      </div>
    </div>
  </div>
);

// ==================== STATS CARD ====================
const StatsCard = ({ icon: Icon, title, value, gradient }) => (
  <div className={`bg-gradient-to-r ${gradient} rounded-xl p-4 text-white shadow-sm`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-[10px] font-medium opacity-80">{title}</p>
        <p className="text-xl font-bold mt-1">{value}</p>
      </div>
      <Icon className="w-8 h-8 opacity-30" />
    </div>
  </div>
);

// ==================== MAIN COMPONENT ====================
const Profile = () => {
  const { user: authUser, role: authRole, refreshUser } = useContext(AuthContext);
  const { t } = useLanguage();

  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: ''
  });
  const [errors, setErrors] = useState({});
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Add shimmer style to document head
  useEffect(() => {
    if (!document.querySelector('#shimmer-styles-profile')) {
      const style = document.createElement('style');
      style.id = 'shimmer-styles-profile';
      style.textContent = shimmerStyle;
      document.head.appendChild(style);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    try {
      const response = await api.get('/profile');
      const userData = response.data.user;
      const userRole = response.data.role;

      setUser(userData);
      setRole(userRole);
      setFormData({
        name: userData.name,
        email: userData.email,
        phone: userData.phone || '',
        address: userData.address || '',
      });

      if (userData.profile_photo) {
        setPreviewUrl(`${api.defaults.baseURL.replace('/api','')}/storage/${userData.profile_photo}`);
      }

    } catch (error) {
      console.error('Error fetching profile:', error);
      errorAlert(t('alerts.error'), t('alerts.failedToLoadProfile') || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      errorAlert(t('alerts.invalidFile'), t('alerts.invalidImageText'));
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      errorAlert(t('alerts.fileTooLarge'), t('alerts.fileSizeError'));
      return;
    }

    if (type === 'profile') {
      setProfilePicture(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setErrors({});

    try {
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('email', formData.email);
      submitData.append('phone', formData.phone);
      submitData.append('address', formData.address);

      if (profilePicture) submitData.append('profile_photo', profilePicture);

      await api.post('/profile?_method=PUT', submitData);

      successAlert(t('alerts.profileUpdated'), t('alerts.profileUpdateSuccess'));
      setIsEditing(false);
      fetchProfile();
      refreshUser?.();

    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        errorAlert(t('alerts.error'), error.response?.data?.message || t('alerts.profileUpdateError') || 'Error updating profile');
      }
    } finally {
      setUpdating(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await api.post('/profile/change-password', passwordData);
      successAlert(t('alerts.passwordChanged'), t('alerts.passwordChangeSuccess'));
      setShowPasswordModal(false);
      setPasswordData({ current_password:'', new_password:'', new_password_confirmation:'' });
      setErrors({});
    } catch (error) {
      if (error.response?.data?.errors) setErrors(error.response.data.errors);
      else errorAlert(t('alerts.error'), error.response?.data?.message || t('alerts.passwordChangeError') || 'Error changing password');
    } finally { 
      setUpdating(false); 
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        address: user.address || '',
      });
      setPreviewUrl(user.profile_photo ? `${api.defaults.baseURL.replace('/api','')}/storage/${user.profile_photo}` : null);
      setProfilePicture(null);
    }
    setErrors({});
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="p-6 bg-gray-50 min-h-screen">
          <div className="max-w-6xl mx-auto">
            <div className="mb-6">
              <div className="h-7 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-48 mb-2"></div>
              <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-64"></div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 space-y-6">
                <SkeletonProfileCard />
              </div>
              <div className="lg:col-span-2 space-y-6">
                <SkeletonInfoCard />
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-6xl mx-auto">
          
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-xl font-semibold text-gray-900">Profile Settings</h1>
            <p className="text-sm text-gray-500 mt-1">Manage your account information</p>
          </div>

          {/* Hidden trigger for password modal */}
          <button id="password-modal-trigger" onClick={() => setShowPasswordModal(true)} className="hidden" />

          {/* Main Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column */}
            <div className="lg:col-span-1 space-y-6">
              {/* Profile Header Card */}
              <ProfileHeaderCard 
                user={user}
                role={role}
                previewUrl={previewUrl}
                isEditing={isEditing}
                onFileChange={handleFileChange}
                onEdit={() => setIsEditing(true)}
                onSave={handleSubmit}
                onCancel={cancelEdit}
                updating={updating}
              />
            </div>

            {/* Right Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Information Card */}
              <PersonalInfoCard 
                formData={formData}
                errors={errors}
                isEditing={isEditing}
                onInputChange={handleInputChange}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#5C352C]" />
                <h3 className="text-base font-semibold text-gray-900">Change Password</h3>
              </div>
              <p className="text-[11px] text-gray-500 mt-1">Update your password to keep your account secure</p>
            </div>
            <form onSubmit={handlePasswordSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Current Password</label>
                <input
                  type="password"
                  name="current_password"
                  value={passwordData.current_password}
                  onChange={handlePasswordChange}
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#5C352C] focus:ring-1 focus:ring-[#5C352C]/20 transition-all text-sm"
                />
                {errors.current_password && <p className="mt-1 text-[10px] text-red-500">{errors.current_password[0]}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">New Password</label>
                <input
                  type="password"
                  name="new_password"
                  value={passwordData.new_password}
                  onChange={handlePasswordChange}
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#5C352C] focus:ring-1 focus:ring-[#5C352C]/20 transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  name="new_password_confirmation"
                  value={passwordData.new_password_confirmation}
                  onChange={handlePasswordChange}
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#5C352C] focus:ring-1 focus:ring-[#5C352C]/20 transition-all text-sm"
                />
              </div>
              {errors.new_password && <p className="text-[10px] text-red-500">{errors.new_password[0]}</p>}
              
              <div className="flex gap-3 pt-2">
                <button 
                  type="submit" 
                  disabled={updating}
                  className="flex-1 px-3 py-2 bg-[#5C352C] text-white rounded-lg hover:bg-[#4A2A22] transition-all text-sm font-medium disabled:opacity-50"
                >
                  {updating ? 'Updating...' : 'Update Password'}
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    setShowPasswordModal(false);
                    setErrors({});
                    setPasswordData({
                      current_password: '',
                      new_password: '',
                      new_password_confirmation: ''
                    });
                  }} 
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default Profile;
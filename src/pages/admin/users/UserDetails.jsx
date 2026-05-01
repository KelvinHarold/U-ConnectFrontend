// src/pages/admin/users/UserDetails.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import MainLayout from "../../../layouts/MainLayout";
import api from "../../../api/axios";
import { useToast } from "../../../contexts/ToastContext";
import { useLanguage } from "../../../contexts/LanguageContext";
import { confirmAlert, passwordResetPrompt } from '../../../utils/sweetAlertHelper';
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  Calendar, 
  User, 
  Shield, 
  Activity,
  Edit,
  Key,
  Power,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Users,
  Package,
  Store,
  Crown,
  Briefcase,
  AlertTriangle,
  ChevronLeft,
  Star,
  DollarSign,
  ShoppingBag,
  Award
} from "lucide-react";

// ==================== SKELETON LOADERS ====================
const SkeletonStatCard = () => (
  <div className="animate-pulse">
    <div className="bg-white p-6 rounded-xl border border-gray-100">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-24"></div>
          <div className="h-8 bg-gray-200 rounded w-32"></div>
        </div>
        <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
      </div>
    </div>
  </div>
);

const SkeletonInfoItem = () => (
  <div className="animate-pulse">
    <div className="flex items-start p-2 -mx-2">
      <div className="w-10 h-10 bg-gray-200 rounded-lg mr-3"></div>
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-gray-200 rounded w-20"></div>
        <div className="h-4 bg-gray-200 rounded w-32"></div>
      </div>
    </div>
  </div>
);

// ==================== MAIN COMPONENT ====================
const UserDetails = () => {
  const { id } = useParams();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    fetchUser();
  }, [id]);

  const fetchUser = async () => {
    setLoading(true);
    setError(null);
    setImageError(false);
    try {
      const response = await api.get(`/admin/users/${id}`);
      setUser(response.data);
    } catch (error) {
      const errorMsg = error.response?.data?.message || "User not found";
      setError(errorMsg);
      showToast(errorMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchUser();
    setRefreshing(false);
    showToast('User details refreshed', 'info');
  };

  const getAvatarUrl = () => {
    if (!user) return null;
    if (user.profile_photo) {
      if (user.profile_photo.startsWith('http')) {
        return user.profile_photo;
      }
      return `http://localhost:8000/storage/${user.profile_photo}`;
    }
    return null;
  };

  const getRoleDetails = (role) => {
    switch(role) {
      case 'admin':
        return { 
          icon: Crown, 
          color: 'bg-purple-50 text-purple-700',
          description: 'Full system access and control'
        };
      case 'seller':
        return { 
          icon: Store, 
          color: 'bg-blue-50 text-blue-700',
          description: 'Can manage products and view orders'
        };
      case 'buyer':
        return { 
          icon: ShoppingBag, 
          color: 'bg-emerald-50 text-emerald-700',
          description: 'Can browse and purchase products'
        };
      default:
        return { 
          icon: User, 
          color: 'bg-gray-50 text-gray-600',
          description: 'Standard user'
        };
    }
  };

  const handleResetPassword = async () => {
    const result = await passwordResetPrompt(user?.name, {
      title: t('alerts.resetPassword'),
      text: t('alerts.enterNewPassword'),
      inputPlaceholder: t('alerts.confirmNewPassword'),
      nextButton: t('alerts.next'),
      cancelButton: t('common.cancel'),
      passwordRequired: t('alerts.passwordRequired'),
      passwordMinLength: t('alerts.passwordMinLength'),
      confirmTitle: t('alerts.confirmNewPassword'),
      confirmText: t('alerts.reenterPassword'),
      confirmPlaceholder: t('alerts.confirmNewPassword'),
      resetButton: t('alerts.resetPassword'),
      passwordMismatch: t('alerts.passwordMismatch'),
      pleaseConfirm: t('alerts.pleaseConfirm'),
    });
    if (result) {
      try {
        await api.post(`/admin/users/${id}/reset-password`, result);
        showToast(t('alerts.passwordChangeSuccess'), 'success');
      } catch (error) {
        showToast(t('alerts.error'), 'error');
      }
    }
  };

  const handleToggleStatus = async () => {
    const actionKey = user?.is_active ? 'deactivate' : 'activate';
    const confirmed = await confirmAlert({
      title: t(`alerts.${actionKey}Confirm`, { name: user?.name }),
      text: '',
      icon: 'question',
      confirmButtonText: t(`alerts.${actionKey}`),
      cancelButtonText: t('common.cancel'),
    });
    if (confirmed) {
      try {
        await api.patch(`/admin/users/${id}/toggle-status`);
        await fetchUser();
        showToast(t(`alerts.${actionKey}Success`, { name: user?.name }) || `${user?.name} ${actionKey}d successfully`, 'success');
      } catch (error) {
        showToast(t(`alerts.${actionKey}Error`) || `Error ${actionKey}ing user`, 'error');
      }
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="p-6 bg-gray-50 min-h-screen">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gray-200 rounded-xl animate-pulse"></div>
                <div className="h-7 bg-gray-200 rounded w-48 animate-pulse"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-64 animate-pulse ml-12"></div>
            </div>
            <div className="bg-gradient-to-r from-[#2A1713] to-[#5C352C] rounded-xl overflow-hidden mb-6">
              <div className="p-6">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="w-24 h-24 bg-white/20 rounded-full animate-pulse"></div>
                  <div className="flex-1 space-y-3 text-center md:text-left">
                    <div className="h-8 bg-white/20 rounded w-48 mx-auto md:mx-0 animate-pulse"></div>
                    <div className="flex justify-center md:justify-start gap-2">
                      <div className="h-6 w-20 bg-white/20 rounded-full animate-pulse"></div>
                      <div className="h-6 w-16 bg-white/20 rounded-full animate-pulse"></div>
                    </div>
                    <div className="h-4 bg-white/20 rounded w-64 mx-auto md:mx-0 animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {[1, 2, 3].map(i => <SkeletonStatCard key={i} />)}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <div className="h-6 bg-gray-200 rounded w-40 animate-pulse"></div>
                </div>
                <div className="p-6 space-y-4">
                  {[1, 2, 3, 4, 5].map(i => <SkeletonInfoItem key={i} />)}
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <div className="h-6 bg-gray-200 rounded w-40 animate-pulse"></div>
                </div>
                <div className="p-6 space-y-4">
                  {[1, 2, 3, 4].map(i => <SkeletonInfoItem key={i} />)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !user) {
    return (
      <MainLayout>
        <div className="p-6 bg-gray-50 min-h-screen">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-xl border border-red-100 p-12 text-center">
              <XCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
              <h3 className="text-base font-medium text-gray-900 mb-1">Error Loading User</h3>
              <p className="text-sm text-gray-500 mb-4">{error || "User not found"}</p>
              <Link to="/admin/users" className="inline-flex items-center gap-2 px-4 py-2 bg-[#5C352C] text-white rounded-lg hover:bg-[#956959] transition-colors text-sm">
                <ArrowLeft className="w-4 h-4" /> Back to Users
              </Link>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  const userRole = user.roles?.[0]?.name || user.role || 'N/A';
  const roleDetails = getRoleDetails(userRole);
  const RoleIcon = roleDetails.icon;
  const joinDate = new Date(user.created_at);
  const formattedJoinDate = joinDate.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const avatarUrl = getAvatarUrl();

  return (
    <MainLayout>
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="mb-6">
            <Link to="/admin/users" className="inline-flex items-center gap-2 text-[#5C352C] hover:text-[#956959] transition-colors mb-2">
              <ChevronLeft className="w-4 h-4" />
              <span className="text-sm">Back to Users</span>
            </Link>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 bg-[#5C352C]/10 rounded-xl">
                <Users className="w-5 h-5 text-[#5C352C]" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">User Profile</h1>
            </div>
            <p className="text-sm text-gray-500 ml-11">View and manage user details</p>
          </div>

          {/* Refresh Button */}
          <div className="flex justify-end mb-4">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors text-sm"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {/* User Profile Header */}
          <div className="bg-gradient-to-r from-[#2A1713] to-[#5C352C] rounded-xl overflow-hidden mb-6">
            <div className="px-6 py-6">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <div className="relative">
                  {avatarUrl && !imageError ? (
                    <img
                      src={avatarUrl}
                      alt={user.name}
                      className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-white/30"
                      onError={() => setImageError(true)}
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-[#E9B48A] to-[#956959] rounded-full flex items-center justify-center text-white text-3xl md:text-4xl font-bold">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1">
                    {user.is_active ? (
                      <CheckCircle className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-500" />
                    )}
                  </div>
                </div>
                
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-2xl font-bold text-white mb-2">{user.name}</h2>
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${roleDetails.color}`}>
                      <RoleIcon className="w-3 h-3" />
                      {userRole.toUpperCase()}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                      user.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                    }`}>
                      {user.is_active ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-[#E9B48A] text-sm flex items-center justify-center md:justify-start gap-1">
                    <Briefcase className="w-3.5 h-3.5" />
                    {roleDetails.description}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* User Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Personal Information Card */}
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <div className="p-1.5 bg-[#E9B48A]/20 rounded-lg">
                    <User className="w-5 h-5 text-[#5C352C]" />
                  </div>
                  Personal Information
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <InfoItem icon={User} label="Full Name" value={user.name} />
                <InfoItem icon={Mail} label="Email Address" value={user.email} />
                <InfoItem icon={Phone} label="Phone Number" value={user.phone || 'Not provided'} />
                <InfoItem icon={Calendar} label="Member Since" value={formattedJoinDate} />
                <InfoItem icon={Clock} label="User ID" value={`#${user.id}`} />
              </div>
            </div>

            {/* Account Information Card */}
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <div className="p-1.5 bg-[#E9B48A]/20 rounded-lg">
                    <Activity className="w-5 h-5 text-[#5C352C]" />
                  </div>
                  Account Information
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-start p-2 -mx-2 rounded-lg">
                  <div className="w-10 h-10 bg-[#E9B48A]/20 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                    <Shield className="w-5 h-5 text-[#5C352C]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">User Role</p>
                    <div className="flex items-center gap-2 mt-1">
                      <RoleIcon className="w-4 h-4" />
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${roleDetails.color}`}>
                        {userRole}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start p-2 -mx-2 rounded-lg">
                  <div className="w-10 h-10 bg-[#E9B48A]/20 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                    <Activity className="w-5 h-5 text-[#5C352C]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Account Status</p>
                    <div className="flex items-center gap-2 mt-1">
                      {user.is_active ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                          <span className="text-emerald-600 font-medium text-sm">Active Account</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 text-rose-600" />
                          <span className="text-rose-600 font-medium text-sm">Inactive Account</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start p-2 -mx-2 rounded-lg">
                  <div className="w-10 h-10 bg-[#E9B48A]/20 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                    <Clock className="w-5 h-5 text-[#5C352C]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Last Updated</p>
                    <p className="text-gray-900 font-medium text-sm">
                      {user.updated_at ? new Date(user.updated_at).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>

                {user.email_verified_at && (
                  <div className="flex items-start p-2 -mx-2 rounded-lg">
                    <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Email Verification</p>
                      <p className="text-emerald-600 font-medium text-sm flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Verified
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-end mt-6">
            <button
              onClick={handleResetPassword}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium text-sm"
            >
              <Key className="w-4 h-4" />
              Reset Password
            </button>
            
            <button
              onClick={handleToggleStatus}
              className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg transition-colors font-medium text-sm ${
                user.is_active 
                  ? 'bg-amber-600 hover:bg-amber-700 text-white' 
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              <Power className="w-4 h-4" />
              {user.is_active ? 'Deactivate User' : 'Activate User'}
            </button>
            
            <Link to={`/admin/users/${user.id}/edit`}>
              <button className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#5C352C] text-white rounded-lg hover:bg-[#956959] transition-colors font-medium text-sm">
                <Edit className="w-4 h-4" />
                Edit Profile
              </button>
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

// Helper Component for Info Items
const InfoItem = ({ icon: Icon, label, value, subtext }) => (
  <div className="flex items-start group hover:bg-gray-50 p-2 -mx-2 rounded-lg transition-colors">
    <div className="w-10 h-10 bg-[#E9B48A]/20 rounded-lg flex items-center justify-center mr-3 flex-shrink-0 group-hover:bg-[#E9B48A]/30 transition-colors">
      <Icon className="w-5 h-5 text-[#5C352C]" />
    </div>
    <div className="flex-1">
      <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="text-gray-900 font-medium text-sm break-words">{value}</p>
      {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
    </div>
  </div>
);

export default UserDetails;
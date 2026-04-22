// src/pages/admin/users/UserManagement.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import MainLayout from "../../../layouts/MainLayout";
import api from "../../../api/axios";
import { useToast } from "../../../contexts/ToastContext";
import { 
  Search, Edit, Trash2, Power, Key, Eye, RefreshCw, Users, 
  Filter, ChevronDown, UserCheck, UserX, Shield, 
  Mail, Phone, MapPin, TrendingUp, Activity, ArrowUpRight,
  UserPlus, Award, Crown, Star, ChevronLeft, ChevronRight,
  Store, ShoppingBag, AlertTriangle  // Added Store, ShoppingBag, AlertTriangle
} from "lucide-react";
import { Link } from "react-router-dom";

// ==================== SKELETON LOADERS ====================
const SkeletonStatCard = () => (
  <div className="animate-pulse">
    <div className="bg-white p-6 rounded-xl border border-gray-100">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-24"></div>
          <div className="h-8 bg-gray-200 rounded w-32"></div>
          <div className="h-3 bg-gray-200 rounded w-28"></div>
        </div>
        <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
      </div>
    </div>
  </div>
);

const SkeletonUserRow = () => (
  <div className="animate-pulse">
    <div className="flex items-center gap-4 p-4 border-b border-gray-100">
      <div className="flex items-center gap-3 flex-1">
        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
        <div className="space-y-1">
          <div className="h-4 bg-gray-200 rounded w-24"></div>
          <div className="h-3 bg-gray-200 rounded w-16"></div>
        </div>
      </div>
      <div className="w-32 h-5 bg-gray-200 rounded"></div>
      <div className="w-20 h-5 bg-gray-200 rounded"></div>
      <div className="w-24 h-5 bg-gray-200 rounded"></div>
      <div className="flex gap-2">
        <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
        <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
        <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
        <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
        <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
      </div>
    </div>
  </div>
);

const SkeletonUserCard = () => (
  <div className="animate-pulse">
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
          <div className="space-y-1">
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className="h-3 bg-gray-200 rounded w-16"></div>
          </div>
        </div>
        <div className="flex gap-1">
          <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
          <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 rounded w-48"></div>
        <div className="h-3 bg-gray-200 rounded w-32"></div>
        <div className="flex justify-between items-center pt-2">
          <div className="flex gap-2">
            <div className="h-6 bg-gray-200 rounded-full w-16"></div>
            <div className="h-6 bg-gray-200 rounded-full w-16"></div>
          </div>
          <div className="flex gap-2">
            <div className="w-7 h-7 bg-gray-200 rounded-lg"></div>
            <div className="w-7 h-7 bg-gray-200 rounded-lg"></div>
            <div className="w-7 h-7 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// ==================== MAIN COMPONENT ====================
const UserManagement = () => {
  const { showToast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 5
  });
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const searchInputRef = useRef(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter, statusFilter]);

  const fetchUsers = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/admin/users', {
        params: {
          page: page,
          search: search,
          role: roleFilter,
          status: statusFilter
        }
      });
      
      if (response.data && response.data.data) {
        setUsers(response.data.data);
        setPagination({
          current_page: response.data.current_page,
          last_page: response.data.last_page,
          total: response.data.total,
          per_page: response.data.per_page,
          from: response.data.from,
          to: response.data.to
        });
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setError(error.response?.data?.message || 'Failed to load users');
      showToast(error.response?.data?.message || 'Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchUsers(pagination.current_page);
    setRefreshing(false);
    showToast('Users refreshed', 'info');
  };

  const handleToggleStatus = async (id, currentStatus, userName) => {
    const action = currentStatus ? 'deactivate' : 'activate';
    if (window.confirm(`${action.charAt(0).toUpperCase() + action.slice(1)} "${userName}"?`)) {
      try {
        await api.patch(`/admin/users/${id}/toggle-status`);
        showToast(`${userName} ${action}d successfully`, 'success');
        await fetchUsers(pagination.current_page);
      } catch (error) {
        showToast(error.response?.data?.message || `Error ${action}ing user`, 'error');
      }
    }
  };

  const handleDelete = async (id, userName) => {
    if (window.confirm(`Delete "${userName}"? This cannot be undone.`)) {
      try {
        await api.delete(`/admin/users/${id}`);
        showToast(`${userName} deleted successfully`, 'success');
        await fetchUsers(pagination.current_page);
      } catch (error) {
        showToast(error.response?.data?.message || 'Error deleting user', 'error');
      }
    }
  };

  const handleResetPassword = async (id, userName) => {
    const newPassword = prompt(`Enter new password for ${userName} (min 8 characters):`);
    if (newPassword && newPassword.length >= 8) {
      const confirmPassword = prompt('Confirm new password:');
      if (newPassword === confirmPassword) {
        try {
          await api.post(`/admin/users/${id}/reset-password`, {
            password: newPassword,
            password_confirmation: confirmPassword
          });
          showToast(`Password reset for ${userName}`, 'success');
        } catch (error) {
          showToast('Error resetting password', 'error');
        }
      } else {
        showToast('Passwords do not match', 'error');
      }
    } else if (newPassword) {
      showToast('Password must be at least 8 characters', 'error');
    }
  };

  const getAvatarUrl = (user) => {
    if (user.profile_photo) {
      return `http://localhost:8000/storage/${user.profile_photo}`;
    }
    return null;
  };

  const getRoleBadgeColor = (user) => {
    const role = user.roles?.[0]?.name || user.role || 'N/A';
    switch(role) {
      case 'admin': return 'bg-purple-50 text-purple-700';
      case 'seller': return 'bg-blue-50 text-blue-700';
      case 'buyer': return 'bg-emerald-50 text-emerald-700';
      default: return 'bg-gray-50 text-gray-600';
    }
  };

  const getUserRole = (user) => {
    return user.roles?.[0]?.name || user.role || 'N/A';
  };

  const getRoleIcon = (role) => {
    switch(role) {
      case 'admin': return <Crown className="w-3 h-3" />;
      case 'seller': return <Store className="w-3 h-3" />;
      case 'buyer': return <ShoppingBag className="w-3 h-3" />;
      default: return <Users className="w-3 h-3" />;
    }
  };

  // Calculate stats
  const activeUsers = users.filter(u => u.is_active).length;
  const inactiveUsers = users.filter(u => !u.is_active).length;
  const adminCount = users.filter(u => getUserRole(u) === 'admin').length;
  const sellerCount = users.filter(u => getUserRole(u) === 'seller').length;
  const buyerCount = users.filter(u => getUserRole(u) === 'buyer').length;

  const statCards = [
    {
      title: "Total Users",
      value: pagination.total,
      subValue: `${activeUsers} Active, ${inactiveUsers} Inactive`,
      icon: Users,
      color: "text-emerald-600",
      bg: "bg-emerald-50"
    },
    {
      title: "Role Distribution",
      value: `${adminCount} / ${sellerCount} / ${buyerCount}`,
      subValue: "Admin / Seller / Buyer",
      icon: Shield,
      color: "text-amber-600",
      bg: "bg-amber-50"
    },
    {
      title: "Active Users",
      value: `${activeUsers}`,
      subValue: `${inactiveUsers} Inactive`,
      icon: Activity,
      color: "text-blue-600",
      bg: "bg-blue-50"
    }
  ];

  const clearFilters = () => {
    setSearch("");
    setRoleFilter("all");
    setStatusFilter("all");
    setShowFilters(false);
    showToast('Filters cleared', 'info');
  };

  const hasActiveFilters = search || roleFilter !== 'all' || statusFilter !== 'all';

  const getPaginationPages = () => {
    const pages = [];
    const maxVisible = 5;
    let startPage = Math.max(1, pagination.current_page - Math.floor(maxVisible / 2));
    let endPage = Math.min(pagination.last_page, startPage + maxVisible - 1);
    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }
    for (let i = startPage; i <= endPage; i++) pages.push(i);
    return pages;
  };

  if (loading && users.length === 0) {
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {[1, 2, 3].map(i => <SkeletonStatCard key={i} />)}
            </div>
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <div className="h-10 bg-gray-200 rounded-lg animate-pulse"></div>
              </div>
              <div className="hidden lg:block">
                {[1, 2, 3, 4, 5].map(i => <SkeletonUserRow key={i} />)}
              </div>
              <div className="lg:hidden">
                {[1, 2, 3, 4].map(i => <SkeletonUserCard key={i} />)}
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
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 bg-[#5C352C]/10 rounded-xl">
                <Users className="w-5 h-5 text-[#5C352C]" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">User Management</h1>
            </div>
            <p className="text-sm text-gray-500 ml-11">Manage and oversee all users in the platform</p>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {statCards.map((card, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">{card.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                    <p className="text-xs text-gray-400 mt-2">{card.subValue}</p>
                  </div>
                  <div className={`${card.bg} ${card.color} p-2 rounded-xl`}>
                    <card.icon className="w-5 h-5" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Search Bar */}
          <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6">
            <div className="flex flex-wrap gap-3">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search by name, email or phone..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#5C352C] focus:ring-1 focus:ring-[#5C352C]"
                  />
                </div>
              </div>
              
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-[#5C352C]"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="seller">Seller</option>
                <option value="buyer">Buyer</option>
              </select>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-[#5C352C]"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm ${
                  showFilters || hasActiveFilters
                    ? 'bg-[#5C352C] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Filter className="w-4 h-4" />
                Filters
                {hasActiveFilters && <span className="w-1.5 h-1.5 bg-white rounded-full" />}
              </button>
              
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Filter Panel */}
            {showFilters && hasActiveFilters && (
              <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="text-xs text-red-500 hover:text-red-600"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>

          {/* Results Count */}
          <div className="mb-4">
            <p className="text-xs text-gray-500">
              Showing <span className="font-medium text-gray-700">{users.length}</span> of{' '}
              <span className="font-medium text-gray-700">{pagination.total}</span> users
            </p>
          </div>

          {/* Users Display */}
          {error ? (
            <div className="bg-white rounded-xl border border-red-100 p-8 text-center">
              <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-3" />
              <p className="text-red-600 text-sm">{error}</p>
              <button onClick={() => fetchUsers(1)} className="mt-3 text-sm text-[#5C352C] hover:underline">
                Try again
              </button>
            </div>
          ) : users.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-medium text-gray-900 mb-1">No Users Found</h3>
              <p className="text-sm text-gray-500">
                {hasActiveFilters ? "Try adjusting your filters" : "No users registered yet"}
              </p>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="mt-3 text-sm text-[#5C352C] hover:underline">
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block bg-white rounded-xl border border-gray-100 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">User</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Contact</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Role</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Status</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {users.map((user) => {
                      const role = getUserRole(user);
                      const roleColor = getRoleBadgeColor(user);
                      const avatarUrl = getAvatarUrl(user);
                      
                      return (
                        <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              {avatarUrl ? (
                                <img
                                  src={avatarUrl}
                                  alt={user.name}
                                  className="w-8 h-8 rounded-full object-cover"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="w-8 h-8 bg-gradient-to-br from-[#5C352C] to-[#956959] rounded-full flex items-center justify-center text-white text-xs font-bold">
                                  {user.name?.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div>
                                <p className="font-medium text-sm text-gray-900">{user.name}</p>
                                <p className="text-xs text-gray-400">ID: #{user.id}</p>
                              </div>
                            </div>
                           </td>
                          <td className="px-4 py-3">
                            <div className="space-y-0.5">
                              <p className="text-xs text-gray-600 flex items-center gap-1">
                                <Mail className="w-3 h-3 text-gray-400" />
                                {user.email}
                              </p>
                              {user.phone && (
                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                  <Phone className="w-3 h-3 text-gray-400" />
                                  {user.phone}
                                </p>
                              )}
                            </div>
                           </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${roleColor}`}>
                              {getRoleIcon(role)}
                              {role.toUpperCase()}
                            </span>
                           </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                              user.is_active 
                                ? 'bg-emerald-50 text-emerald-700' 
                                : 'bg-rose-50 text-rose-700'
                            }`}>
                              {user.is_active ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
                              {user.is_active ? 'Active' : 'Inactive'}
                            </span>
                           </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-1">
                              <Link to={`/admin/users/${user.id}`}>
                                <button className="p-1.5 text-gray-500 hover:text-[#5C352C] hover:bg-gray-100 rounded-lg transition-colors">
                                  <Eye className="w-4 h-4" />
                                </button>
                              </Link>
                              <Link to={`/admin/users/${user.id}/edit`}>
                                <button className="p-1.5 text-gray-500 hover:text-[#5C352C] hover:bg-gray-100 rounded-lg transition-colors">
                                  <Edit className="w-4 h-4" />
                                </button>
                              </Link>
                              <button
                                onClick={() => handleToggleStatus(user.id, user.is_active, user.name)}
                                className="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                title={user.is_active ? "Deactivate" : "Activate"}
                              >
                                <Power className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleResetPassword(user.id, user.name)}
                                className="p-1.5 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                title="Reset Password"
                              >
                                <Key className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(user.id, user.name)}
                                className="p-1.5 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                           </td>
                         </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden space-y-3">
                {users.map((user) => {
                  const role = getUserRole(user);
                  const roleColor = getRoleBadgeColor(user);
                  const avatarUrl = getAvatarUrl(user);
                  
                  return (
                    <div key={user.id} className="bg-white rounded-xl border border-gray-100 p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {avatarUrl ? (
                            <img
                              src={avatarUrl}
                              alt={user.name}
                              className="w-12 h-12 rounded-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gradient-to-br from-[#5C352C] to-[#956959] rounded-full flex items-center justify-center text-white text-base font-bold">
                              {user.name?.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-sm text-gray-900">{user.name}</p>
                            <p className="text-xs text-gray-400">ID: #{user.id}</p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Link to={`/admin/users/${user.id}`}>
                            <button className="p-1.5 text-gray-500 hover:text-[#5C352C] rounded-lg">
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          </Link>
                          <Link to={`/admin/users/${user.id}/edit`}>
                            <button className="p-1.5 text-gray-500 hover:text-[#5C352C] rounded-lg">
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                          </Link>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm mb-3">
                        <div>
                          <p className="text-xs text-gray-400 flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            Email
                          </p>
                          <p className="text-xs text-gray-700 break-all">{user.email}</p>
                        </div>
                        {user.phone && (
                          <div>
                            <p className="text-xs text-gray-400 flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              Phone
                            </p>
                            <p className="text-xs text-gray-700">{user.phone}</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                        <div className="flex gap-2">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${roleColor}`}>
                            {getRoleIcon(role)}
                            {role}
                          </span>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                            user.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                          }`}>
                            {user.is_active ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
                            {user.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleToggleStatus(user.id, user.is_active, user.name)}
                            className="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg"
                          >
                            <Power className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleResetPassword(user.id, user.name)}
                            className="p-1.5 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg"
                          >
                            <Key className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(user.id, user.name)}
                            className="p-1.5 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {pagination.last_page > 1 && (
                <nav className="mt-6 flex justify-center">
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => fetchUsers(pagination.current_page - 1)}
                      disabled={pagination.current_page === 1}
                      className="p-2 border border-gray-200 rounded-lg disabled:opacity-50 hover:border-[#5C352C] hover:text-[#5C352C] transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    
                    {getPaginationPages().map(page => (
                      <button
                        key={page}
                        onClick={() => fetchUsers(page)}
                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                          pagination.current_page === page
                            ? 'bg-[#5C352C] text-white'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => fetchUsers(pagination.current_page + 1)}
                      disabled={pagination.current_page === pagination.last_page}
                      className="p-2 border border-gray-200 rounded-lg disabled:opacity-50 hover:border-[#5C352C] hover:text-[#5C352C] transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </nav>
              )}
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default UserManagement;
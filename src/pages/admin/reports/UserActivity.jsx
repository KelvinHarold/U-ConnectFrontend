// src/pages/admin/reports/UserActivity.jsx
import React, { useState, useEffect } from "react";
import MainLayout from "../../../layouts/MainLayout";
import api from "../../../api/axios";
import { useToast } from "../../../contexts/ToastContext";
import { 
  Users, 
  ShoppingBag, 
  Package, 
  TrendingUp,
  RefreshCw,
  UserCheck,
  UserPlus,
  Activity,
  Calendar,
  AlertCircle,
  ChevronLeft,
  BarChart3
} from "lucide-react";

// ==================== SKELETON LOADERS ====================
const StatCardSkeleton = () => (
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

const ProgressBarSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
    <div className="w-full bg-gray-200 rounded-full h-2"></div>
  </div>
);

// ==================== MAIN COMPONENT ====================
const UserActivity = () => {
  const { showToast } = useToast();
  const [activityData, setActivityData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState("30");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchUserActivity();
  }, [timeRange]);

  const fetchUserActivity = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/admin/reports/users', {
        params: { days: timeRange }
      });
      setActivityData(response.data);
    } catch (error) {
      console.error('Error fetching user activity:', error);
      setError(error.response?.data?.message || 'Failed to load user activity');
      showToast(error.response?.data?.message || 'Failed to load user activity', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchUserActivity();
    setRefreshing(false);
    showToast('User activity refreshed', 'info');
  };

  const getActivityPercentage = (active, total) => {
    if (!total) return 0;
    return Math.min((active / total) * 100, 100);
  };

  const totalActiveUsers =
    (activityData?.active_buyers_last_30_days || 0) +
    (activityData?.active_sellers_last_30_days || 0);

  const totalUsers = activityData?.total_users || 1;

  const statCards = [
    {
      title: "Active Buyers",
      value: activityData?.active_buyers_last_30_days || 0,
      subValue: `Last ${timeRange} days`,
      icon: ShoppingBag,
      color: "text-amber-600",
      bg: "bg-amber-50"
    },
    {
      title: "Active Sellers",
      value: activityData?.active_sellers_last_30_days || 0,
      subValue: `Last ${timeRange} days`,
      icon: Package,
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    {
      title: "New Users",
      value: activityData?.new_users_last_30_days || 0,
      subValue: "New registrations",
      icon: UserPlus,
      color: "text-emerald-600",
      bg: "bg-emerald-50"
    },
    {
      title: "Total Active",
      value: totalActiveUsers,
      subValue: "Buyers + Sellers",
      icon: UserCheck,
      color: "text-purple-600",
      bg: "bg-purple-50"
    }
  ];

  if (loading && !activityData) {
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              {[1, 2, 3, 4].map(i => <StatCardSkeleton key={i} />)}
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <div className="h-6 bg-gray-200 rounded w-40 mb-6 animate-pulse"></div>
              <div className="space-y-4">
                {[1, 2, 3].map(i => <ProgressBarSkeleton key={i} />)}
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
                <Activity className="w-5 h-5 text-[#5C352C]" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">User Activity</h1>
            </div>
            <p className="text-sm text-gray-500 ml-11">Monitor engagement and activity trends</p>
          </div>

          {/* Action Bar */}
          <div className="flex justify-end gap-3 mb-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-[#5C352C]"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
            </select>

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors text-sm"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Sync Data
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {statCards.map((card, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">{card.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                    <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                      <Activity className="w-3 h-3" />
                      {card.subValue}
                    </p>
                  </div>
                  <div className={`${card.bg} ${card.color} p-2 rounded-xl`}>
                    <card.icon className="w-5 h-5" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Activity Summary */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#5C352C]" />
                Activity Summary
              </h3>
            </div>
            
            <div className="p-6">
              {error ? (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
                  <p className="text-red-600 text-sm">{error}</p>
                  <button onClick={fetchUserActivity} className="mt-3 text-sm text-[#5C352C] hover:underline">
                    Try again
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Buyer Activity */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm font-medium text-gray-700">Buyer Activity Rate</p>
                      <p className="text-sm font-semibold text-[#5C352C]">
                        {Math.round(getActivityPercentage(
                          activityData?.active_buyers_last_30_days,
                          activityData?.total_buyers
                        ))}%
                      </p>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-[#5C352C] h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${getActivityPercentage(
                            activityData?.active_buyers_last_30_days,
                            activityData?.total_buyers
                          )}%`
                        }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {activityData?.active_buyers_last_30_days || 0} active out of {activityData?.total_buyers || 0} total buyers
                    </p>
                  </div>

                  {/* Seller Activity */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm font-medium text-gray-700">Seller Activity Rate</p>
                      <p className="text-sm font-semibold text-blue-600">
                        {Math.round(getActivityPercentage(
                          activityData?.active_sellers_last_30_days,
                          activityData?.total_sellers
                        ))}%
                      </p>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${getActivityPercentage(
                            activityData?.active_sellers_last_30_days,
                            activityData?.total_sellers
                          )}%`
                        }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {activityData?.active_sellers_last_30_days || 0} active out of {activityData?.total_sellers || 0} total sellers
                    </p>
                  </div>

                  {/* Total Activity */}
                  <div className="pt-2 border-t border-gray-100">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm font-medium text-gray-700">Total Platform Activity</p>
                      <p className="text-sm font-semibold text-emerald-600">
                        {Math.round((totalActiveUsers / totalUsers) * 100)}%
                      </p>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${(totalActiveUsers / totalUsers) * 100}%`
                        }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {totalActiveUsers} active users out of {totalUsers} total users
                    </p>
                  </div>

                  {/* Additional Info */}
                  <div className="mt-4 pt-4 border-t border-gray-100 bg-gray-50 -mx-6 -mb-6 px-6 py-4 rounded-b-xl">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <p className="text-xs text-gray-500">Total Buyers</p>
                        <p className="text-lg font-bold text-gray-900">{activityData?.total_buyers || 0}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500">Total Sellers</p>
                        <p className="text-lg font-bold text-gray-900">{activityData?.total_sellers || 0}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default UserActivity;
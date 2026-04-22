import React, { useState, useEffect, useCallback, useRef } from "react";
import MainLayout from "../../../layouts/MainLayout";
import api from "../../../api/axios";
import { useToast } from "../../../contexts/ToastContext";
import { 
  Users, 
  ShoppingBag, 
  DollarSign, 
  TrendingUp, 
  Star,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  ChevronRight,
  PieChart,
  Package,
  Activity
} from "lucide-react";
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
} from 'recharts';

// ==================== INSTAGRAM-STYLE SHIMMER ANIMATION ====================
const shimmerStyle = `
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  .animate-shimmer {
    animation: shimmer 1.5s ease-in-out infinite;
    background: linear-gradient(90deg, #f0f0f0 0%, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%, #f0f0f0 100%);
    background-size: 200% 100%;
  }
`;

// ==================== SKELETON LOADERS ====================
const SkeletonStatCard = () => (
  <div className="bg-white rounded-xl border border-gray-100 p-5 overflow-hidden">
    <div className="flex items-start justify-between">
      <div className="space-y-2">
        <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-20"></div>
        <div className="h-7 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-32"></div>
        <div className="h-2 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-24"></div>
      </div>
      <div className="w-10 h-10 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-xl"></div>
    </div>
  </div>
);

const SkeletonChart = () => (
  <div className="bg-white rounded-xl border border-gray-100 p-5 overflow-hidden">
    <div className="flex justify-between mb-4">
      <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-32"></div>
      <div className="h-7 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-24"></div>
    </div>
    <div className="h-[260px] bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-xl"></div>
  </div>
);

const SkeletonPieChart = () => (
  <div className="bg-white rounded-xl border border-gray-100 p-5 overflow-hidden">
    <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-28 mb-4"></div>
    <div className="h-[220px] bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-xl"></div>
    <div className="mt-3 space-y-1">
      <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-full"></div>
      <div className="h-1.5 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-full"></div>
    </div>
  </div>
);

const SkeletonSellerRow = () => (
  <div className="flex items-center justify-between p-4 overflow-hidden">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-full"></div>
      <div className="space-y-1">
        <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-24"></div>
        <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-16"></div>
      </div>
    </div>
    <div className="text-right space-y-1">
      <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-20"></div>
      <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-12"></div>
    </div>
  </div>
);

const SkeletonOrderRow = () => (
  <div className="flex items-center gap-4 p-4 border-b border-gray-100 overflow-hidden">
    <div className="flex-1"><div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-20"></div></div>
    <div className="flex-1"><div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-24"></div></div>
    <div className="flex-1"><div className="h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-full w-16"></div></div>
    <div className="flex-1 text-right"><div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-20 ml-auto"></div></div>
  </div>
);

// ==================== MAIN COMPONENT ====================
const AdminDashboard = () => {
  const { showToast } = useToast();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const refreshButtonRef = useRef(null);

  // Add shimmer style
  useEffect(() => {
    if (!document.querySelector('#shimmer-styles-admin-dashboard')) {
      const style = document.createElement('style');
      style.id = 'shimmer-styles-admin-dashboard';
      style.textContent = shimmerStyle;
      document.head.appendChild(style);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      const response = await api.get('/admin/dashboard');
      setDashboardData(response.data);
      setError(null);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to load dashboard';
      setError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="p-6 bg-gray-50 min-h-screen">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <div className="h-7 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-40"></div>
                <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-64 mt-1"></div>
              </div>
              <div className="h-9 w-24 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-lg"></div>
            </div>
            <div className="h-28 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-xl mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
              {[1, 2, 3].map(i => <SkeletonStatCard key={i} />)}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
              <div className="lg:col-span-2"><SkeletonChart /></div>
              <div><SkeletonPieChart /></div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                  <div className="h-5 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-32"></div>
                </div>
                <div className="divide-y divide-gray-100">
                  {[1, 2, 3, 4].map(i => <SkeletonSellerRow key={i} />)}
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                  <div className="h-5 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-40"></div>
                </div>
                <div className="divide-y divide-gray-100">
                  {[1, 2, 3, 4, 5].map(i => <SkeletonOrderRow key={i} />)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="p-6 bg-gray-50 min-h-screen">
          <div className="max-w-md mx-auto bg-white rounded-xl border border-gray-100 p-8 text-center">
            <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-gray-900 mb-1">Error Loading Dashboard</h3>
            <p className="text-sm text-gray-500 mb-4">{error}</p>
            <button onClick={fetchDashboardData} className="px-4 py-2 bg-[#5C352C] text-white rounded-lg text-sm">Try Again</button>
          </div>
        </div>
      </MainLayout>
    );
  }

  const { stats, recent_orders, top_sellers, monthly_stats } = dashboardData || {};

  const lineChartData = monthly_stats?.map(s => ({ month: s.month, revenue: s.revenue })) || [];

  const pieChartData = [
    { name: 'Delivered', value: stats?.delivered_orders || 0, color: '#10B981' },
    { name: 'Pending', value: stats?.pending_orders || 0, color: '#F59E0B' },
    { name: 'Cancelled', value: stats?.cancelled_orders || 0, color: '#EF4444' }
  ].filter(item => item.value > 0);

  const statCards = [
    { title: "Revenue", value: `Tsh ${stats?.total_revenue?.toLocaleString() || 0}`, subValue: "Gross Merchandise", icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
    { title: "Sellers", value: stats?.total_sellers || 0, subValue: `${stats?.pending_sellers || 0} pending`, icon: ShoppingBag, color: "text-amber-600", bg: "bg-amber-50" },
    { title: "Customers", value: stats?.total_buyers || 0, subValue: "Registered", icon: Users, color: "text-blue-600", bg: "bg-blue-50" }
  ];

  const getStatusStyle = (status) => {
    const styles = {
      pending: "bg-amber-50 text-amber-700",
      delivered: "bg-emerald-50 text-emerald-700",
      cancelled: "bg-rose-50 text-rose-700",
      processing: "bg-blue-50 text-blue-700",
      confirmed: "bg-emerald-50 text-emerald-700",
      preparing: "bg-purple-50 text-purple-700",
      ready_for_delivery: "bg-orange-50 text-orange-700",
    };
    return styles[status] || "bg-gray-50 text-gray-700";
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: "Pending",
      delivered: "Delivered",
      cancelled: "Cancelled",
      processing: "Processing",
      confirmed: "Confirmed",
      preparing: "Preparing",
      ready_for_delivery: "Ready",
    };
    return labels[status] || status || "Unknown";
  };

  return (
    <MainLayout>
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-500 mt-1">System overview and analytics</p>
            </div>
            <button onClick={fetchDashboardData} disabled={refreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-[#5C352C] to-[#7A4B3E] rounded-xl p-5">
            <h2 className="text-lg font-semibold text-white mb-1">Welcome back! 👋</h2>
            <p className="text-white/70 text-sm">Here's what's happening with your platform</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {statCards.map((card, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">{card.title}</p>
                    <h3 className="text-xl font-bold text-gray-900">{card.value}</h3>
                    <p className="text-[10px] text-gray-400 mt-2">{card.subValue}</p>
                  </div>
                  <div className={`${card.bg} ${card.color} p-2 rounded-lg`}>
                    <card.icon className="w-5 h-5" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Revenue Chart */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-semibold text-gray-900">Revenue Trend</h3>
                <select className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-gray-50">
                  <option>Last 12 months</option>
                </select>
              </div>
              <div className="h-[260px]">
                {lineChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart data={lineChartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 11 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 11 }} tickFormatter={(v) => `Tsh ${v/1000}k`} />
                      <Tooltip formatter={(value) => [`Tsh ${value.toLocaleString()}`, 'Revenue']} />
                      <Line type="monotone" dataKey="revenue" stroke="#5C352C" strokeWidth={2} dot={{ r: 3, fill: '#5C352C' }} />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400">
                    <div className="text-center"><Package className="w-8 h-8 mx-auto mb-2 opacity-30" /><p className="text-xs">No data</p></div>
                  </div>
                )}
              </div>
            </div>

            {/* Order Status Chart */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Order Status</h3>
              <div className="h-[200px] relative">
                {pieChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie data={pieChartData} innerRadius={45} outerRadius={70} dataKey="value" label={({ percent }) => `${(percent * 100).toFixed(0)}%`}>
                        {pieChartData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} orders`, '']} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400">
                    <div className="text-center"><Package className="w-8 h-8 mx-auto mb-2 opacity-30" /><p className="text-xs">No data</p></div>
                  </div>
                )}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xl font-bold text-gray-900">{stats?.total_orders || 0}</span>
                  <span className="text-[10px] text-gray-500">Total</span>
                </div>
              </div>
              <div className="mt-3 flex justify-around text-xs">
                {pieChartData.map((item, idx) => (
                  <div key={idx} className="text-center"><div className="w-2 h-2 rounded-full mx-auto mb-1" style={{ backgroundColor: item.color }}></div><span className="text-gray-500">{item.name}</span><span className="font-medium ml-1">{item.value}</span></div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Top Sellers */}
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-sm font-semibold text-gray-900">Top Sellers</h3>
                <button className="text-xs text-[#5C352C] font-medium">View All →</button>
              </div>
              <div className="divide-y divide-gray-100">
                {top_sellers?.slice(0, 4).map((seller, idx) => (
                  <div key={idx} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#5C352C] flex items-center justify-center text-white text-xs font-bold">
                        {seller.name?.charAt(0).toUpperCase() || 'S'}
                      </div>
                      <div><p className="text-sm font-medium text-gray-900">{seller.name}</p><p className="text-xs text-gray-400">{seller.orders_as_seller_count || 0} orders</p></div>
                    </div>
                    <p className="text-sm font-semibold text-[#5C352C]">Tsh {seller.orders_as_seller_sum_total?.toLocaleString() || 0}</p>
                  </div>
                ))}
                {(!top_sellers || top_sellers.length === 0) && <div className="p-8 text-center text-gray-400"><ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-30" /><p className="text-sm">No sellers</p></div>}
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900">Recent Orders</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-[10px] font-medium text-gray-500">Order</th>
                      <th className="px-4 py-3 text-left text-[10px] font-medium text-gray-500">Customer</th>
                      <th className="px-4 py-3 text-left text-[10px] font-medium text-gray-500">Status</th>
                      <th className="px-4 py-3 text-right text-[10px] font-medium text-gray-500">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {recent_orders?.slice(0, 5).map((order, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-xs font-mono text-gray-600">#{order.order_number || order.id}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{order.buyer?.name || 'N/A'}</td>
                        <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${getStatusStyle(order.status)}`}>{getStatusLabel(order.status)}</span></td>
                        <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Tsh {order.total?.toLocaleString() || 0}</td>
                      </tr>
                    ))}
                    {(!recent_orders || recent_orders.length === 0) && <tr><td colSpan="4" className="px-4 py-8 text-center text-gray-400"><Package className="w-8 h-8 mx-auto mb-2 opacity-30" /><p className="text-sm">No orders</p></td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AdminDashboard;
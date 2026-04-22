// src/pages/seller/Dashboard.jsx

import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../../../layouts/MainLayout";
import api from "../../../api/axios";
import { useToast } from "../../../contexts/ToastContext";
import { useLanguage } from "../../../contexts/LanguageContext";
import { 
  ShoppingBag, 
  Package,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  TrendingUp,
  Star,
  Eye,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Truck,
  Users,
  DollarSign
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';

// ==================== SHIMMER ANIMATION STYLES ====================
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

// ==================== SKELETON LOADERS ====================
const SkeletonStatCard = () => (
  <div className="bg-white rounded-xl border border-gray-100 p-4 overflow-hidden">
    <div className="flex items-start justify-between">
      <div className="space-y-2">
        <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-20"></div>
        <div className="h-7 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-28"></div>
        <div className="h-2 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-16"></div>
      </div>
      <div className="w-10 h-10 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-xl"></div>
    </div>
  </div>
);

const SkeletonChart = () => (
  <div className="bg-white rounded-xl border border-gray-100 p-4 overflow-hidden">
    <div className="flex justify-between mb-4">
      <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-28"></div>
      <div className="w-4 h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded"></div>
    </div>
    <div className="h-[240px] bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-xl"></div>
  </div>
);

const SkeletonProductRow = () => (
  <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 overflow-hidden">
    <div className="flex items-center gap-3 flex-1">
      <div className="w-12 h-12 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-xl"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-32"></div>
        <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-24"></div>
      </div>
    </div>
    <div className="text-right space-y-2">
      <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-20 ml-auto"></div>
      <div className="h-5 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-24 ml-auto"></div>
    </div>
  </div>
);

const SkeletonOrderRow = () => (
  <div className="flex items-center gap-4 p-4 border-b border-gray-100 overflow-hidden">
    <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-20"></div>
    <div className="flex-1">
      <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-28"></div>
    </div>
    <div className="w-16 h-8 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-lg"></div>
    <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-full w-20"></div>
    <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-24"></div>
    <div className="w-8 h-8 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-lg"></div>
  </div>
);

// ==================== MAIN COMPONENT ====================
const SellerDashboard = () => {
  const { showToast } = useToast();
  const { t, language } = useLanguage();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [imageErrors, setImageErrors] = useState({});

  // Add shimmer style to document head
  useEffect(() => {
    if (!document.querySelector('#shimmer-styles-seller-dashboard')) {
      const style = document.createElement('style');
      style.id = 'shimmer-styles-seller-dashboard';
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
      const response = await api.get('/seller/dashboard');
      setDashboardData(response.data);
      setError(null);
      setImageErrors({});
    } catch (err) {
      const errorMsg = err.response?.data?.message || t('seller.dashboard.error');
      setError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleImageError = (productId) => {
    setImageErrors(prev => ({ ...prev, [productId]: true }));
  };

  const formatPrice = (price) => `Tsh ${Number(price || 0).toLocaleString()}`;

  // Translation helper for status
  const getStatusLabel = (status) => {
    const statusMap = {
      pending: t('seller.dashboard.statusPending'),
      confirmed: t('seller.dashboard.statusConfirmed'),
      preparing: t('seller.dashboard.statusPreparing'),
      ready_for_delivery: t('seller.dashboard.statusReady'),
      delivered: t('seller.dashboard.statusDelivered'),
      cancelled: t('seller.dashboard.statusCancelled'),
    };
    return statusMap[status] || status || "Unknown";
  };

  const getStatusStyle = (status) => {
    const styles = {
      pending: "bg-amber-50 text-amber-700 border-amber-100",
      confirmed: "bg-blue-50 text-blue-700 border-blue-100",
      preparing: "bg-purple-50 text-purple-700 border-purple-100",
      ready_for_delivery: "bg-orange-50 text-orange-700 border-orange-100",
      delivered: "bg-emerald-50 text-emerald-700 border-emerald-100",
      cancelled: "bg-rose-50 text-rose-700 border-rose-100",
    };
    return styles[status] || "bg-gray-50 text-gray-700 border-gray-100";
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="p-6 bg-gray-50 min-h-screen">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <div className="h-7 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-40 mb-2"></div>
              <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-64"></div>
            </div>
            <div className="h-28 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-xl mb-6"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {[1, 2, 3].map(i => <SkeletonStatCard key={i} />)}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
              <SkeletonChart />
              <SkeletonChart />
            </div>
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden mb-6">
              <div className="p-4 border-b border-gray-100">
                <div className="h-5 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-32"></div>
              </div>
              <div className="divide-y divide-gray-100">
                {[1, 2, 3].map(i => <SkeletonProductRow key={i} />)}
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <div className="h-5 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-28"></div>
              </div>
              <div className="divide-y divide-gray-100">
                {[1, 2, 3, 4, 5].map(i => <SkeletonOrderRow key={i} />)}
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
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-gray-900 mb-1">{t('seller.dashboard.errorLoading')}</h3>
            <p className="text-sm text-gray-500 mb-4">{error}</p>
            <button 
              onClick={fetchDashboardData} 
              className="px-4 py-2 bg-[#5C352C] text-white rounded-lg text-sm hover:bg-[#7A4B3E] transition-colors"
            >
              {t('seller.dashboard.tryAgain')}
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  const { stats, recent_orders, monthly_sales, top_products, low_stock_products } = dashboardData || {};

  const statCards = [
    {
      title: t('seller.dashboard.orders'),
      value: stats?.total_orders || 0,
      change: stats?.orders_change || "+8.2%",
      trend: "up",
      icon: ShoppingBag,
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    {
      title: t('seller.dashboard.revenue'),
      value: formatPrice(stats?.total_revenue || 0),
      change: stats?.revenue_change || "+12.5%",
      trend: "up",
      icon: DollarSign,
      color: "text-emerald-600",
      bg: "bg-emerald-50"
    },
    {
      title: t('seller.dashboard.products'),
      value: stats?.total_products || 0,
      subValue: `${stats?.out_of_stock || 0} ${t('seller.dashboard.outOfStock')}`,
      icon: Package,
      color: "text-purple-600",
      bg: "bg-purple-50"
    },
    {
      title: t('seller.dashboard.completion'),
      value: `${stats?.completion_rate || 0}%`,
      change: stats?.completion_change || "+5.3%",
      trend: "up",
      icon: CheckCircle,
      color: "text-amber-600",
      bg: "bg-amber-50"
    },
  ];

  const pieChartData = [
    { name: t('seller.dashboard.statusDelivered'), value: stats?.delivered_orders || 0, color: '#10B981' },
    { name: t('seller.dashboard.processing'), value: stats?.processing_orders || 0, color: '#F59E0B' },
    { name: t('seller.dashboard.statusPending'), value: stats?.pending_orders || 0, color: '#EF4444' },
    { name: t('seller.dashboard.statusCancelled'), value: stats?.cancelled_orders || 0, color: '#8B5CF6' }
  ].filter(item => item.value > 0);

  return (
    <MainLayout>
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">{t('seller.dashboard.title')}</h1>
            <p className="text-sm text-gray-500 mt-1">{t('seller.dashboard.subtitle')}</p>
          </div>

          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-[#5C352C] to-[#7A4B3E] rounded-2xl p-6 mb-6 shadow-lg">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-xl font-semibold text-white mb-1">{t('seller.dashboard.welcomeBack')}</h2>
                <p className="text-white/80 text-sm">{t('seller.dashboard.welcomeMessage')}</p>
              </div>
              <button 
                onClick={fetchDashboardData}
                disabled={refreshing}
                className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-xl text-sm text-white hover:bg-white/20 transition-all duration-200 flex items-center gap-2 font-medium"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                {t('seller.dashboard.refresh')}
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {statCards.map((card, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-500 mb-1">{card.title}</p>
                    <h3 className="text-xl font-bold text-gray-900">{card.value}</h3>
                    {card.subValue && (
                      <p className="text-[10px] text-gray-400 mt-1.5">{card.subValue}</p>
                    )}
                    {card.change && (
                      <div className="flex items-center gap-1 mt-2">
                        {card.trend === 'up' ? (
                          <ArrowUp className="w-3 h-3 text-emerald-500" />
                        ) : (
                          <ArrowDown className="w-3 h-3 text-red-500" />
                        )}
                        <span className={`text-[10px] font-medium ${card.trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
                          {card.change}
                        </span>
                        <span className="text-[10px] text-gray-400 ml-1">{t('seller.dashboard.vsLastMonth')}</span>
                      </div>
                    )}
                  </div>
                  <div className={`${card.bg} ${card.color} p-3 rounded-xl`}>
                    <card.icon className="w-5 h-5" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Monthly Sales Chart */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-base font-semibold text-gray-900">{t('seller.dashboard.monthlySales')}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{t('seller.dashboard.last12Months')}</p>
                </div>
                <TrendingUp className="w-5 h-5 text-gray-400" />
              </div>
              <div className="h-[280px]">
                {monthly_sales && monthly_sales.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthly_sales} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                      <XAxis 
                        dataKey="month_name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#9CA3AF', fontSize: 11 }} 
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#9CA3AF', fontSize: 11 }} 
                        tickFormatter={(v) => `Tsh ${v/1000}k`} 
                      />
                      <Tooltip 
                        formatter={(value) => [`Tsh ${value.toLocaleString()}`, t('seller.dashboard.revenue')]} 
                        cursor={{ fill: '#F3F4F6' }}
                      />
                      <Bar dataKey="revenue" fill="#5C352C" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p className="text-sm">{t('seller.dashboard.noSalesData')}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Order Distribution Pie Chart */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h3 className="text-base font-semibold text-gray-900 mb-5">{t('seller.dashboard.orderStatus')}</h3>
              <div className="h-[240px] relative">
                {pieChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        innerRadius={60}
                        outerRadius={90}
                        dataKey="value"
                        stroke="white"
                        strokeWidth={2}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} ${t('seller.dashboard.ordersCount')}`, '']} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p className="text-sm">{t('seller.dashboard.noOrderData')}</p>
                    </div>
                  </div>
                )}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-bold text-gray-900">{stats?.total_orders || 0}</span>
                  <span className="text-xs text-gray-500">{t('seller.dashboard.totalOrders')}</span>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3">
                {pieChartData.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs py-1.5 px-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="text-gray-600">{item.name}</span>
                    </div>
                    <span className="font-semibold text-gray-900">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Products Section */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm mb-6">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h3 className="text-base font-semibold text-gray-900">{t('seller.dashboard.topProducts')}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{t('seller.dashboard.bestSellingItems')}</p>
              </div>
              <Link 
                to="/seller/products" 
                className="text-sm text-[#5C352C] font-medium hover:text-[#7A4B3E] transition-colors flex items-center gap-1"
              >
                {t('seller.dashboard.viewAll')}
                <span aria-hidden="true">→</span>
              </Link>
            </div>
            <div className="divide-y divide-gray-100">
              {top_products?.slice(0, 5).map((product, idx) => (
                <div key={idx} className="p-5 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="relative flex-shrink-0">
                      <div className="w-14 h-14 bg-gray-100 rounded-xl overflow-hidden">
                        {product.image && !imageErrors[product.id] ? (
                          <img 
                            src={product.image} 
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={() => handleImageError(product.id)}
                            loading="lazy"
                          />
                        ) : (
                          <Package className="w-6 h-6 text-gray-400 m-4" />
                        )}
                      </div>
                      <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gradient-to-r from-[#5C352C] to-[#7A4B3E] text-white text-[10px] font-bold flex items-center justify-center shadow-md">
                        {idx + 1}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link to={`/seller/products/${product.id}`}>
                        <h4 className="text-sm font-semibold text-gray-900 hover:text-[#5C352C] transition-colors truncate">
                          {product.name}
                        </h4>
                      </Link>
                      <div className="flex flex-wrap items-center gap-3 mt-1.5">
                        <p className="text-sm font-bold text-[#5C352C]">{formatPrice(product.price)}</p>
                        <div className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span className="text-xs text-gray-600">{product.avg_rating?.toFixed(1) || '0.0'}</span>
                        </div>
                        <span className="text-xs text-gray-400">•</span>
                        <p className="text-xs text-gray-500">{t('seller.dashboard.sold')}: {product.sold_count || 0}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-gray-900">{formatPrice(product.revenue || 0)}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{product.order_count || 0} {t('seller.dashboard.orders')}</p>
                    </div>
                  </div>
                </div>
              ))}
              {(!top_products || top_products.length === 0) && (
                <div className="p-12 text-center">
                  <Package className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                  <p className="text-base text-gray-500">{t('seller.dashboard.noProductsSold')}</p>
                  <Link to="/seller/products/create">
                    <button className="mt-4 px-4 py-2 bg-[#5C352C] text-white rounded-lg text-sm hover:bg-[#7A4B3E] transition-colors">
                      {t('seller.dashboard.addFirstProduct')}
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Low Stock Alert Section */}
          {low_stock_products && low_stock_products.length > 0 && (
            <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-2xl border border-amber-200 overflow-hidden shadow-sm mb-6">
              <div className="p-5 border-b border-amber-200">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-amber-200 rounded-lg">
                    <AlertTriangle className="w-4 h-4 text-amber-700" />
                  </div>
                  <h3 className="text-base font-semibold text-amber-800">{t('seller.dashboard.lowStockAlert')}</h3>
                  <span className="px-2 py-0.5 bg-amber-200 text-amber-800 text-xs font-bold rounded-full">
                    {low_stock_products.length}
                  </span>
                </div>
              </div>
              <div className="divide-y divide-amber-200">
                {low_stock_products.slice(0, 5).map((product, idx) => (
                  <div key={idx} className="p-5 flex items-center justify-between hover:bg-amber-100/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-xl overflow-hidden shadow-sm">
                        {product.image && !imageErrors[product.id] ? (
                          <img 
                            src={product.image} 
                            alt={product.name} 
                            className="w-full h-full object-cover" 
                            onError={() => handleImageError(product.id)} 
                            loading="lazy" 
                          />
                        ) : (
                          <Package className="w-5 h-5 text-gray-400 m-3.5" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{product.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs text-amber-700 font-medium">
                            {t('seller.dashboard.only')} {product.quantity} {t('seller.dashboard.unitsLeft')}
                          </p>
                          {product.quantity <= 5 && (
                            <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-[9px] font-bold rounded-full">
                              {t('seller.dashboard.critical')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Link to={`/seller/products/${product.id}/edit`}>
                      <button className="px-4 py-2 text-sm font-semibold text-amber-700 bg-white rounded-xl hover:bg-amber-100 transition-all duration-200 shadow-sm hover:shadow-md">
                        {t('seller.dashboard.restock')}
                      </button>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Orders Table */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            <div className="p-5 border-b border-gray-100">
              <h3 className="text-base font-semibold text-gray-900">{t('seller.dashboard.recentOrders')}</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('seller.dashboard.order')}</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('seller.dashboard.customer')}</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('seller.dashboard.date')}</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('seller.dashboard.status')}</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('seller.dashboard.amount')}</th>
                    <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('seller.dashboard.action')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recent_orders?.slice(0, 10).map((order, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4 text-sm font-mono font-medium text-gray-900">#{order.order_number || order.id}</td>
                      <td className="px-5 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{order.buyer?.name || 'N/A'}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{order.buyer?.email || ''}</p>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600">
                        {new Date(order.created_at).toLocaleDateString(language === 'sw' ? 'sw-TZ' : 'en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusStyle(order.status)}`}>
                          {getStatusLabel(order.status)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right text-sm font-bold text-gray-900">{formatPrice(order.total)}</td>
                      <td className="px-5 py-4 text-center">
                        <Link 
                          to={`/seller/orders/${order.id}`} 
                          className="inline-flex items-center justify-center p-2 text-gray-400 hover:text-[#5C352C] hover:bg-gray-100 rounded-lg transition-all duration-200"
                          aria-label={t('seller.dashboard.viewOrder')}
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {(!recent_orders || recent_orders.length === 0) && (
                    <tr>
                      <td colSpan="6" className="px-5 py-12 text-center text-gray-400">
                        <ShoppingBag className="w-16 h-16 mx-auto mb-3 opacity-30" />
                        <p className="text-base text-gray-500">{t('seller.dashboard.noOrders')}</p>
                        <p className="text-sm text-gray-400 mt-1">{t('seller.dashboard.noOrdersMessage')}</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default SellerDashboard;
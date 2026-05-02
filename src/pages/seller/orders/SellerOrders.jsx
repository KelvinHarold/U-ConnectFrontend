// src/pages/seller/orders/SellerOrders.jsx

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../../../layouts/MainLayout";
import api from "../../../api/axios";
import { useToast } from "../../../contexts/ToastContext";
import { useLanguage } from "../../../contexts/LanguageContext";
import { 
  ShoppingBag, 
  Eye, 
  RefreshCw, 
  Search, 
  Filter, 
  ChevronDown,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Package,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Calendar
} from "lucide-react";

// ==================== SHIMMER ANIMATION STYLES ====================
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
  <div className="bg-white rounded-xl border border-gray-100 p-4 overflow-hidden">
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-16"></div>
        <div className="h-6 sm:h-7 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-20"></div>
      </div>
      <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-lg"></div>
    </div>
  </div>
);

const SkeletonOrderRow = () => (
  <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-100 overflow-hidden">
    <div className="flex-1">
      <div className="h-3 sm:h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-20 sm:w-24"></div>
    </div>
    <div className="flex-1">
      <div className="h-3 sm:h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-24 sm:w-32"></div>
    </div>
    <div className="flex-1 hidden sm:block">
      <div className="h-3 sm:h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-12 sm:w-16"></div>
    </div>
    <div className="flex-1">
      <div className="h-3 sm:h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-16 sm:w-20"></div>
    </div>
    <div className="flex-1">
      <div className="h-5 sm:h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-16 sm:w-20"></div>
    </div>
    <div className="flex-1 hidden lg:block">
      <div className="h-3 sm:h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-20 sm:w-24"></div>
    </div>
    <div className="w-8 sm:w-10">
      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-lg"></div>
    </div>
  </div>
);

// ==================== MAIN COMPONENT ====================
const SellerOrders = () => {
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 10
  });
  const [statistics, setStatistics] = useState(null);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isSmallMobile, setIsSmallMobile] = useState(false);

  // Check screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsSmallMobile(window.innerWidth < 480);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Add shimmer style
  useEffect(() => {
    if (!document.querySelector('#shimmer-styles-seller-orders')) {
      const style = document.createElement('style');
      style.id = 'shimmer-styles-seller-orders';
      style.textContent = shimmerStyle;
      document.head.appendChild(style);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchOrdersData(), fetchStatisticsData()]);
    };
    loadData();
  }, [search, statusFilter, dateFilter, pagination.current_page]);

  const fetchOrdersData = async (page = pagination.current_page) => {
    setError(null);
    try {
      const params = { page, per_page: 10 };
      if (search) params.search = search;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (dateFilter !== 'all') params.date_filter = dateFilter;
      
      const response = await api.get('/seller/orders', { params });
      
      if (response.data && response.data.data) {
        setOrders(response.data.data);
        setPagination({
          current_page: response.data.current_page,
          last_page: response.data.last_page,
          total: response.data.total,
          per_page: response.data.per_page,
          from: response.data.from,
          to: response.data.to
        });
      } else {
        setOrders([]);
      }
    } catch (error) {
      setError(t('seller.orders.errorLoading'));
      showToast(t('seller.orders.errorLoading'), 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchStatisticsData = async () => {
    try {
      const response = await api.get('/seller/orders/statistics/summary');
      setStatistics(response.data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setLoading(true);
    await Promise.all([fetchOrdersData(pagination.current_page), fetchStatisticsData()]);
    showToast(t('seller.orders.refreshed'), 'success');
  };

  const formatPrice = (price) => `Tsh ${Number(price || 0).toLocaleString()}`;

  const getStatusConfig = (status) => {
    const configs = {
      pending: { 
        label: t('seller.orders.statusPending'), 
        color: 'bg-amber-50 text-amber-700', 
        icon: Clock 
      },
      confirmed: { 
        label: t('seller.orders.statusConfirmed'), 
        color: 'bg-blue-50 text-blue-700', 
        icon: CheckCircle 
      },
      preparing: { 
        label: t('seller.orders.statusPreparing'), 
        color: 'bg-purple-50 text-purple-700', 
        icon: Package 
      },
      ready_for_delivery: { 
        label: t('seller.orders.statusReady'), 
        color: 'bg-orange-50 text-orange-700', 
        icon: Truck 
      },
      delivered: { 
        label: t('seller.orders.statusDelivered'), 
        color: 'bg-emerald-50 text-emerald-700', 
        icon: CheckCircle 
      },
      cancelled: { 
        label: t('seller.orders.statusCancelled'), 
        color: 'bg-rose-50 text-rose-700', 
        icon: XCircle 
      }
    };
    return configs[status] || configs.pending;
  };

  const statCards = statistics ? [
    { 
      title: t('seller.orders.totalOrders'), 
      value: statistics.total_orders || 0, 
      icon: ShoppingBag, 
      color: "text-[#5C352C]", 
      bg: "bg-[#5C352C]/10" 
    },
    { 
      title: t('seller.orders.pending'), 
      value: statistics.pending || 0, 
      icon: Clock, 
      color: "text-amber-600", 
      bg: "bg-amber-50" 
    },
    { 
      title: t('seller.orders.processing'), 
      value: statistics.processing || 0, 
      icon: Package, 
      color: "text-blue-600", 
      bg: "bg-blue-50" 
    },
    { 
      title: t('seller.orders.delivered'), 
      value: statistics.delivered || 0, 
      icon: CheckCircle, 
      color: "text-emerald-600", 
      bg: "bg-emerald-50" 
    },
    { 
      title: t('seller.orders.revenue'), 
      value: formatPrice(statistics.revenue || 0), 
      icon: DollarSign, 
      color: "text-purple-600", 
      bg: "bg-purple-50" 
    }
  ] : [];

  const getPaginationPages = () => {
    const pages = [];
    const maxVisible = isMobile ? 3 : 5;
    let startPage = Math.max(1, pagination.current_page - Math.floor(maxVisible / 2));
    let endPage = Math.min(pagination.last_page, startPage + maxVisible - 1);
    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }
    for (let i = startPage; i <= endPage; i++) pages.push(i);
    return pages;
  };

  if (loading && orders.length === 0) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
              <div>
                <div className="h-6 sm:h-7 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-32 sm:w-40"></div>
                <div className="h-3 sm:h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-48 sm:w-64 mt-1"></div>
              </div>
              <div className="h-8 sm:h-9 w-24 sm:w-28 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-lg"></div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
              {[1, 2, 3, 4, 5].map(i => <SkeletonStatCard key={i} />)}
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-3 sm:p-4 mb-6">
              <div className="h-9 sm:h-10 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-lg"></div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="bg-gray-50 border-b border-gray-100 p-3 sm:p-4">
                <div className="grid grid-cols-5 sm:grid-cols-6 lg:grid-cols-7 gap-2 sm:gap-4">
                  {[1, 2, 3, 4, 5, 6, 7].map(i => (
                    <div key={i} className="h-3 sm:h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded"></div>
                  ))}
                </div>
              </div>
              {[1, 2, 3, 4, 5].map(i => <SkeletonOrderRow key={i} />)}
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="p-3 sm:p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
          
            {/* Header - Responsive */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div>
                <div className="flex items-center gap-2 sm:gap-3 mb-1">
                  <div className="p-1.5 sm:p-2 bg-[#5C352C]/10 rounded-lg sm:rounded-xl">
                    <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-[#5C352C]" />
                  </div>
                  <h1 className="text-lg sm:text-xl font-semibold text-gray-900">{t('seller.orders.title')}</h1>
                </div>
                <p className="text-xs sm:text-sm text-gray-500 ml-8 sm:ml-11">{t('seller.orders.subtitle')}</p>
              </div>
              <button 
                onClick={handleRefresh} 
                disabled={refreshing}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors self-start sm:self-auto"
              >
                <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="hidden xs:inline">{t('seller.orders.refresh')}</span>
              </button>
            </div>

            {/* Stats Cards - Responsive */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
              {statCards.map((card, i) => (
                <div key={i} className="bg-white rounded-xl border-2 border-gray-100 p-3 sm:p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[9px] sm:text-xs font-medium text-gray-500 mb-0.5 sm:mb-1">{card.title}</p>
                      <p className="text-base sm:text-xl font-bold text-gray-900">{card.value}</p>
                    </div>
                    <div className={`${card.bg} ${card.color} p-1.5 sm:p-2 rounded-lg`}>
                      <card.icon className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Search and Filters - Responsive */}
            <div className="bg-white rounded-xl border-2 border-gray-100 p-3 sm:p-4 shadow-sm">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 min-w-[180px] sm:min-w-[200px] relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder={isSmallMobile ? t('seller.orders.searchShort') : t('seller.orders.searchPlaceholder')} 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-8 sm:pl-9 pr-3 py-1.5 sm:py-2 border-2 border-gray-200 rounded-lg text-xs sm:text-sm bg-gray-50 focus:outline-none focus:border-[#5C352C] focus:ring-2 focus:ring-[#5C352C]/20 transition-all"
                  />
                </div>
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm transition-colors ${
                    showFilters ? 'bg-gradient-to-r from-[#5C352C] to-[#8B5E4F] text-white shadow-md' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  <Filter className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden xs:inline">{t('seller.orders.filters')}</span>
                  <ChevronDown className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {showFilters && (
                <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                    <select 
                      value={statusFilter} 
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-2 sm:px-3 py-1.5 sm:py-2 border-2 border-gray-200 rounded-lg text-xs sm:text-sm bg-gray-50 focus:outline-none focus:border-[#5C352C] cursor-pointer"
                    >
                      <option value="all">{t('seller.orders.allStatus')}</option>
                      <option value="pending">{t('seller.orders.statusPending')}</option>
                      <option value="confirmed">{t('seller.orders.statusConfirmed')}</option>
                      <option value="preparing">{t('seller.orders.statusPreparing')}</option>
                      <option value="ready_for_delivery">{t('seller.orders.statusReady')}</option>
                      <option value="delivered">{t('seller.orders.statusDelivered')}</option>
                      <option value="cancelled">{t('seller.orders.statusCancelled')}</option>
                    </select>
                    <select 
                      value={dateFilter} 
                      onChange={(e) => setDateFilter(e.target.value)}
                      className="px-2 sm:px-3 py-1.5 sm:py-2 border-2 border-gray-200 rounded-lg text-xs sm:text-sm bg-gray-50 focus:outline-none focus:border-[#5C352C] cursor-pointer"
                    >
                      <option value="all">{t('seller.orders.allTime')}</option>
                      <option value="today">{t('seller.orders.today')}</option>
                      <option value="week">{t('seller.orders.thisWeek')}</option>
                      <option value="month">{t('seller.orders.thisMonth')}</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Error / Empty State - Responsive */}
            {error ? (
              <div className="bg-rose-50 border-2 border-rose-200 rounded-xl p-6 sm:p-8 text-center">
                <AlertTriangle className="w-10 h-10 sm:w-12 sm:h-12 text-rose-400 mx-auto mb-3" />
                <p className="text-rose-600 text-xs sm:text-sm">{error}</p>
                <button 
                  onClick={() => fetchOrdersData(1)} 
                  className="mt-3 text-xs sm:text-sm text-[#5C352C] hover:underline"
                >
                  {t('seller.orders.tryAgain')}
                </button>
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-white rounded-xl border-2 border-gray-100 p-8 sm:p-12 text-center">
                <ShoppingBag className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-sm sm:text-base font-medium text-gray-900 mb-1">{t('seller.orders.noOrders')}</h3>
                <p className="text-xs sm:text-sm text-gray-500">{t('seller.orders.noOrdersFound')}</p>
              </div>
            ) : (
              /* Orders Table - Responsive with overflow */
              <div className="bg-white rounded-xl border-2 border-gray-100 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px] sm:min-w-[800px]">
                    <thead className="bg-gray-50 border-b-2 border-gray-100">
                      <tr>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-[9px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          {t('seller.orders.orderNumber')}
                        </th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-[9px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          {t('seller.orders.customer')}
                        </th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-[9px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                          {t('seller.orders.items')}
                        </th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-[9px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          {t('seller.orders.total')}
                        </th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-[9px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          {t('seller.orders.status')}
                        </th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-[9px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                          {t('seller.orders.date')}
                        </th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-right text-[9px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          {t('seller.orders.action')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {orders.map((order) => {
                        const statusConfig = getStatusConfig(order.status);
                        const StatusIcon = statusConfig.icon;
                        return (
                          <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-[10px] sm:text-xs font-mono font-medium text-gray-900">
                              #{order.order_number || order.id}
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3">
                              <p className="text-[10px] sm:text-sm font-medium text-gray-900 truncate max-w-[100px] sm:max-w-none">{order.buyer?.name || 'N/A'}</p>
                              <p className="text-[8px] sm:text-xs text-gray-500 truncate max-w-[100px] sm:max-w-none">{order.buyer?.email || 'N/A'}</p>
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-[10px] sm:text-sm text-gray-600 hidden sm:table-cell">
                              {order.items?.length || 0} {t('seller.orders.items')}
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-[10px] sm:text-sm font-bold text-[#5C352C]">
                              {formatPrice(order.total)}
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3">
                              <span className={`inline-flex items-center gap-0.5 sm:gap-1 px-1 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-[10px] font-medium ${statusConfig.color}`}>
                                <StatusIcon className="w-2 h-2 sm:w-3 sm:h-3" />
                                <span className="hidden xs:inline">{statusConfig.label}</span>
                              </span>
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-[8px] sm:text-xs text-gray-500 hidden lg:table-cell">
                              {new Date(order.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-right">
                              <Link 
                                to={`/seller/orders/${order.id}`} 
                                className="text-gray-400 hover:text-[#5C352C] transition-colors inline-flex items-center justify-center p-1"
                                aria-label={t('seller.orders.viewOrder')}
                              >
                                <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination - Responsive */}
                {pagination.last_page > 1 && (
                  <div className="px-3 sm:px-4 py-2 sm:py-3 border-t-2 border-gray-100 bg-gray-50 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <div className="text-[9px] sm:text-xs text-gray-500 text-center sm:text-left">
                      {t('seller.orders.showing')} {pagination.from || 0} {t('seller.orders.to')} {pagination.to || 0} {t('seller.orders.of')} {pagination.total} {t('seller.orders.orders')}
                    </div>
                    <div className="flex justify-center gap-1">
                      <button 
                        onClick={() => fetchOrdersData(pagination.current_page - 1)} 
                        disabled={pagination.current_page === 1}
                        className="p-1 sm:p-1.5 rounded-lg border-2 border-gray-200 disabled:opacity-40 hover:border-[#5C352C] transition-colors"
                        aria-label={t('seller.orders.previous')}
                      >
                        <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                      <div className="flex gap-0.5 sm:gap-1">
                        {getPaginationPages().map(page => (
                          <button 
                            key={page} 
                            onClick={() => fetchOrdersData(page)}
                            className={`w-6 h-6 sm:w-8 sm:h-8 rounded-lg text-[10px] sm:text-sm font-medium transition-colors ${
                              pagination.current_page === page ? 'bg-gradient-to-r from-[#5C352C] to-[#8B5E4F] text-white shadow-md' : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-[#5C352C] hover:text-[#5C352C]'
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                      </div>
                      <button 
                        onClick={() => fetchOrdersData(pagination.current_page + 1)} 
                        disabled={pagination.current_page === pagination.last_page}
                        className="p-1 sm:p-1.5 rounded-lg border-2 border-gray-200 disabled:opacity-40 hover:border-[#5C352C] transition-colors"
                        aria-label={t('seller.orders.next')}
                      >
                        <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default SellerOrders;
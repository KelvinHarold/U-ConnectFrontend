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
        <div className="h-7 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-20"></div>
      </div>
      <div className="w-9 h-9 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-lg"></div>
    </div>
  </div>
);

const SkeletonOrderRow = () => (
  <div className="flex items-center justify-between p-4 border-b border-gray-100 overflow-hidden">
    <div className="flex-1">
      <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-24"></div>
    </div>
    <div className="flex-1">
      <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-32"></div>
    </div>
    <div className="flex-1">
      <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-16"></div>
    </div>
    <div className="flex-1">
      <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-20"></div>
    </div>
    <div className="flex-1">
      <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-20"></div>
    </div>
    <div className="flex-1">
      <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-24"></div>
    </div>
    <div className="w-10">
      <div className="w-8 h-8 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-lg"></div>
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
    const maxVisible = 5;
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
        <div className="p-6 bg-gray-50 min-h-screen">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <div className="h-7 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-40"></div>
                <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-64 mt-1"></div>
              </div>
              <div className="h-9 w-28 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-lg"></div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
              {[1, 2, 3, 4, 5].map(i => <SkeletonStatCard key={i} />)}
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6">
              <div className="h-10 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-lg"></div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="bg-gray-50 border-b border-gray-100 p-4">
                <div className="grid grid-cols-7 gap-4">
                  {[1, 2, 3, 4, 5, 6, 7].map(i => (
                    <div key={i} className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded"></div>
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
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Header */}
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="p-2 bg-[#5C352C]/10 rounded-xl">
                  <ShoppingBag className="w-5 h-5 text-[#5C352C]" />
                </div>
                <h1 className="text-xl font-semibold text-gray-900">{t('seller.orders.title')}</h1>
              </div>
              <p className="text-sm text-gray-500 ml-11">{t('seller.orders.subtitle')}</p>
            </div>
            <button 
              onClick={handleRefresh} 
              disabled={refreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              {t('seller.orders.refresh')}
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {statCards.map((card, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">{card.title}</p>
                    <p className="text-xl font-bold text-gray-900">{card.value}</p>
                  </div>
                  <div className={`${card.bg} ${card.color} p-2 rounded-lg`}>
                    <card.icon className="w-5 h-5" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <div className="flex flex-wrap gap-3">
              <div className="flex-1 min-w-[200px] relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder={t('seller.orders.searchPlaceholder')} 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#5C352C] focus:ring-1 focus:ring-[#5C352C]"
                />
              </div>
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors ${showFilters ? 'bg-[#5C352C] text-white' : 'bg-gray-100 text-gray-600'}`}
              >
                <Filter className="w-4 h-4" />
                {t('seller.orders.filters')}
                <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <select 
                    value={statusFilter} 
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-[#5C352C]"
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
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-[#5C352C]"
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

          {/* Error / Empty State */}
          {error ? (
            <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
              <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-3" />
              <p className="text-red-600">{error}</p>
              <button 
                onClick={() => fetchOrdersData(1)} 
                className="mt-3 text-sm text-[#5C352C] hover:underline"
              >
                {t('seller.orders.tryAgain')}
              </button>
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
              <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-medium text-gray-900 mb-1">{t('seller.orders.noOrders')}</h3>
              <p className="text-sm text-gray-500">{t('seller.orders.noOrdersFound')}</p>
            </div>
          ) : (
            /* Orders Table */
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {t('seller.orders.orderNumber')}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {t('seller.orders.customer')}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {t('seller.orders.items')}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {t('seller.orders.total')}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {t('seller.orders.status')}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {t('seller.orders.date')}
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
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
                          <td className="px-4 py-3 text-xs font-mono font-medium text-gray-900">
                            #{order.order_number || order.id}
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-sm font-medium text-gray-900">{order.buyer?.name || 'N/A'}</p>
                            <p className="text-xs text-gray-500">{order.buyer?.email || 'N/A'}</p>
                           </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {order.items?.length || 0} {t('seller.orders.items')}
                          </td>
                          <td className="px-4 py-3 text-sm font-bold text-[#5C352C]">
                            {formatPrice(order.total)}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${statusConfig.color}`}>
                              <StatusIcon className="w-3 h-3" />
                              {statusConfig.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-500">
                            {new Date(order.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Link 
                              to={`/seller/orders/${order.id}`} 
                              className="text-gray-400 hover:text-[#5C352C] transition-colors"
                              aria-label={t('seller.orders.viewOrder')}
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.last_page > 1 && (
                <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 flex justify-between items-center flex-wrap gap-2">
                  <div className="text-xs text-gray-500">
                    {t('seller.orders.showing')} {pagination.from || 0} {t('seller.orders.to')} {pagination.to || 0} {t('seller.orders.of')} {pagination.total} {t('seller.orders.orders')}
                  </div>
                  <div className="flex gap-1">
                    <button 
                      onClick={() => fetchOrdersData(pagination.current_page - 1)} 
                      disabled={pagination.current_page === 1}
                      className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:border-[#5C352C] transition-colors"
                      aria-label={t('seller.orders.previous')}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    {getPaginationPages().map(page => (
                      <button 
                        key={page} 
                        onClick={() => fetchOrdersData(page)}
                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                          pagination.current_page === page ? 'bg-[#5C352C] text-white' : 'hover:bg-gray-100'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button 
                      onClick={() => fetchOrdersData(pagination.current_page + 1)} 
                      disabled={pagination.current_page === pagination.last_page}
                      className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:border-[#5C352C] transition-colors"
                      aria-label={t('seller.orders.next')}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default SellerOrders;
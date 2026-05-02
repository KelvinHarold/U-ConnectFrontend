// src/pages/buyer/orders/BuyerOrders.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../../../layouts/MainLayout";
import api from "../../../api/axios";
import { useToast } from "../../../contexts/ToastContext";
import { confirmAlert } from "../../../utils/sweetAlertHelper";
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
  MapPin,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Calendar,
  Award
} from "lucide-react";

// ==================== SKELETON LOADERS ====================
const SkeletonOrderRow = () => (
  <div className="animate-pulse">
    <div className="flex items-center gap-4 p-4 border-b border-gray-100">
      <div className="h-4 bg-gray-200 rounded w-24"></div>
      <div className="h-4 bg-gray-200 rounded w-28"></div>
      <div className="h-4 bg-gray-200 rounded w-32"></div>
      <div className="h-4 bg-gray-200 rounded w-16"></div>
      <div className="h-5 bg-gray-200 rounded w-20"></div>
      <div className="h-6 bg-gray-200 rounded w-20"></div>
      <div className="flex gap-2">
        <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
        <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
      </div>
    </div>
  </div>
);

const SkeletonOrderCard = () => (
  <div className="animate-pulse">
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      <div className="flex justify-between mb-3">
        <div className="h-5 bg-gray-200 rounded w-28"></div>
        <div className="h-6 bg-gray-200 rounded w-20"></div>
      </div>
      <div className="space-y-2 mb-3">
        <div className="flex justify-between">
          <div className="h-3 bg-gray-200 rounded w-16"></div>
          <div className="h-3 bg-gray-200 rounded w-24"></div>
        </div>
        <div className="flex justify-between">
          <div className="h-3 bg-gray-200 rounded w-12"></div>
          <div className="h-3 bg-gray-200 rounded w-8"></div>
        </div>
        <div className="flex justify-between">
          <div className="h-3 bg-gray-200 rounded w-12"></div>
          <div className="h-4 bg-gray-200 rounded w-20"></div>
        </div>
      </div>
      <div className="flex gap-2 pt-3 border-t border-gray-100">
        <div className="flex-1 h-9 bg-gray-200 rounded-lg"></div>
        <div className="flex-1 h-9 bg-gray-200 rounded-lg"></div>
      </div>
    </div>
  </div>
);

// ==================== MAIN COMPONENT ====================
const BuyerOrders = () => {
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0
  });
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [cancellingOrder, setCancellingOrder] = useState(null);
  const [confirmingOrder, setConfirmingOrder] = useState(null);

  const searchInputRef = useRef(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [search, statusFilter]);

  const fetchOrders = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const params = { page };
      if (search) params.search = search;
      if (statusFilter !== 'all') params.status = statusFilter;
      
      const response = await api.get('/buyer/orders', { params });
      
      if (response.data && response.data.data) {
        setOrders(response.data.data);
        setPagination({
          current_page: response.data.current_page,
          last_page: response.data.last_page,
          total: response.data.total
        });
      } else {
        setOrders([]);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || t('buyer.orders.failedToLoadOrders');
      setError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchOrders(pagination.current_page);
    setRefreshing(false);
    showToast(t('buyer.orders.ordersRefreshed'), 'info');
  };

  const cancelOrder = async (orderId, orderNumber) => {
    const confirmed = await confirmAlert({
      title: t('buyer.orders.cancelConfirm', { number: orderNumber }),
      text: '',
      icon: 'warning',
      confirmButtonText: t('buyer.orders.yesCancel'),
      cancelButtonText: t('buyer.orders.no'),
      dangerMode: true,
    });
    if (confirmed) {
      setCancellingOrder(orderId);
      try {
        await api.post(`/buyer/orders/${orderId}/cancel`);
        showToast(t('buyer.orders.orderCancelled'), 'success');
        await fetchOrders(pagination.current_page);
      } catch (error) {
        showToast(error.response?.data?.message || t('buyer.orders.errorCancellingOrder'), 'error');
      } finally {
        setCancellingOrder(null);
      }
    }
  };

  const confirmDelivery = async (orderId, orderNumber) => {
    const confirmed = await confirmAlert({
      title: t('buyer.orders.confirmDeliveryConfirm', { number: orderNumber }),
      text: '',
      icon: 'question',
      confirmButtonText: t('buyer.orders.yesConfirm'),
      cancelButtonText: t('buyer.orders.no'),
    });
    if (confirmed) {
      setConfirmingOrder(orderId);
      try {
        await api.post(`/buyer/orders/${orderId}/confirm-delivery`);
        showToast(t('buyer.orders.deliveryConfirmed'), 'success');
        await fetchOrders(pagination.current_page);
      } catch (error) {
        showToast(error.response?.data?.message || t('buyer.orders.errorConfirmingDelivery'), 'error');
      } finally {
        setConfirmingOrder(null);
      }
    }
  };

  const formatPrice = (price) => `Tsh ${Number(price || 0).toLocaleString()}`;

  const getStatusConfig = (status) => {
    const configs = {
      pending: { 
        label: t('buyer.orders.statusPendingLabel'), 
        color: 'bg-amber-50 text-amber-700', 
        icon: Clock 
      },
      confirmed: { 
        label: t('buyer.orders.statusConfirmedLabel'), 
        color: 'bg-blue-50 text-blue-700', 
        icon: CheckCircle 
      },
      preparing: { 
        label: t('buyer.orders.statusPreparingLabel'), 
        color: 'bg-indigo-50 text-indigo-700', 
        icon: Package 
      },
      ready_for_delivery: { 
        label: t('buyer.orders.statusReadyLabel'), 
        color: 'bg-purple-50 text-purple-700', 
        icon: Truck 
      },
      delivered: { 
        label: t('buyer.orders.statusDeliveredLabel'), 
        color: 'bg-emerald-50 text-emerald-700', 
        icon: CheckCircle 
      },
      cancelled: { 
        label: t('buyer.orders.statusCancelledLabel'), 
        color: 'bg-rose-50 text-rose-700', 
        icon: XCircle 
      },
      rejected: { 
        label: t('buyer.orders.statusRejectedLabel'), 
        color: 'bg-gray-50 text-gray-700', 
        icon: XCircle 
      }
    };
    return configs[status] || configs.pending;
  };

  const getStatusBadge = (status) => {
    const config = getStatusConfig(status);
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  const canCancel = (status) => ['pending', 'confirmed'].includes(status);
  const canConfirmDelivery = (status) => status === 'ready_for_delivery';

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setShowFilters(false);
    showToast(t('buyer.orders.filtersCleared'), 'info');
  };

  const hasActiveFilters = search || statusFilter !== 'all';

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

  const statusCounts = {
    total: pagination.total,
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => ['confirmed', 'preparing', 'ready_for_delivery'].includes(o.status)).length,
    delivered: orders.filter(o => o.status === 'delivered').length
  };

  if (loading && orders.length === 0) {
    return (
      <MainLayout>
        <div className="p-6 bg-gray-50 min-h-screen">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gray-200 rounded-xl animate-pulse"></div>
                <div className="h-7 bg-gray-200 rounded w-32 animate-pulse"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-48 animate-pulse ml-12"></div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse"></div>)}
            </div>
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <div className="h-10 bg-gray-200 rounded-lg animate-pulse"></div>
              </div>
              {/* Desktop skeleton */}
              <div className="hidden lg:block">
                {[1, 2, 3, 4].map(i => <SkeletonOrderRow key={i} />)}
              </div>
              {/* Mobile skeleton */}
              <div className="lg:hidden space-y-3 p-4">
                {[1, 2, 3, 4].map(i => <SkeletonOrderCard key={i} />)}
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
          
          {/* Header - responsive padding */}
          <div className="mb-4 md:mb-6">
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 bg-[#5C352C]/10 rounded-xl">
                <ShoppingBag className="w-5 h-5 text-[#5C352C]" />
              </div>
              <h1 className="text-lg md:text-xl font-semibold text-gray-900">{t('buyer.orders.myOrders')}</h1>
            </div>
            <p className="text-xs md:text-sm text-gray-500 ml-11">{t('buyer.orders.ordersSubtitle')}</p>
          </div>

          {/* Stats Row - responsive grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mb-4 md:mb-6">
            <div className="bg-white rounded-xl border border-gray-100 p-3">
              <p className="text-xl md:text-2xl font-bold text-gray-900">{statusCounts.total}</p>
              <p className="text-xs text-gray-500">{t('buyer.orders.totalOrders')}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-3">
              <p className="text-xl md:text-2xl font-bold text-amber-600">{statusCounts.pending}</p>
              <p className="text-xs text-gray-500">{t('buyer.orders.pending')}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-3">
              <p className="text-xl md:text-2xl font-bold text-blue-600">{statusCounts.processing}</p>
              <p className="text-xs text-gray-500">{t('buyer.orders.processing')}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-3">
              <p className="text-xl md:text-2xl font-bold text-emerald-600">{statusCounts.delivered}</p>
              <p className="text-xs text-gray-500">{t('buyer.orders.delivered')}</p>
            </div>
          </div>

          {/* Search Bar - responsive layout */}
          <div className="bg-white rounded-xl border border-gray-100 p-3 md:p-4 mb-4 md:mb-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder={t('buyer.orders.searchPlaceholder')}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#5C352C] focus:ring-1 focus:ring-[#5C352C]"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-[#5C352C]"
                  aria-label={t('buyer.orders.status')}
                >
                  <option value="all">{t('buyer.orders.allStatus')}</option>
                  <option value="pending">{t('buyer.orders.statusPending')}</option>
                  <option value="confirmed">{t('buyer.orders.statusConfirmed')}</option>
                  <option value="preparing">{t('buyer.orders.statusPreparing')}</option>
                  <option value="ready_for_delivery">{t('buyer.orders.statusReadyForDelivery')}</option>
                  <option value="delivered">{t('buyer.orders.statusDelivered')}</option>
                  <option value="cancelled">{t('buyer.orders.statusCancelled')}</option>
                </select>
                
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#5C352C] ${
                    showFilters || hasActiveFilters
                      ? 'bg-[#5C352C] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  aria-label={t('buyer.orders.filters')}
                >
                  <Filter className="w-4 h-4" />
                  {t('buyer.orders.filters')}
                  {hasActiveFilters && <span className="w-1.5 h-1.5 bg-white rounded-full" aria-hidden="true" />}
                </button>
                
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#5C352C]"
                  aria-label={t('common.refresh')}
                >
                  <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* Filter Panel - responsive */}
            {showFilters && hasActiveFilters && (
              <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="text-xs text-rose-500 hover:text-rose-600 transition-colors focus:outline-none focus:underline"
                >
                  {t('buyer.orders.clearAllFilters')}
                </button>
              </div>
            )}
          </div>

          {/* Results Count - responsive text */}
          <div className="mb-4">
            <p className="text-xs text-gray-500" aria-live="polite">
              {t('buyer.orders.showing')} <span className="font-medium text-gray-700">{orders.length}</span> {t('buyer.orders.of')}{' '}
              <span className="font-medium text-gray-700">{pagination.total}</span> {t('buyer.orders.ordersCount')}
            </p>
          </div>

          {/* Orders Display */}
          {error ? (
            <div className="bg-white rounded-xl border border-red-100 p-8 text-center" role="alert">
              <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-3" aria-hidden="true" />
              <p className="text-red-600 text-sm">{error}</p>
              <button 
                onClick={() => fetchOrders(1)} 
                className="mt-3 text-sm text-[#5C352C] hover:underline focus:outline-none focus:ring-2 focus:ring-[#5C352C] rounded px-2 py-1"
              >
                {t('buyer.orders.tryAgain')}
              </button>
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
              <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" aria-hidden="true" />
              <h3 className="text-base font-medium text-gray-900 mb-1">
                {hasActiveFilters ? t('buyer.orders.noOrdersFound') : t('buyer.orders.noOrdersYet')}
              </h3>
              <p className="text-sm text-gray-500">
                {hasActiveFilters ? t('buyer.orders.adjustFilters') : t('buyer.orders.startShopping')}
              </p>
              {hasActiveFilters && (
                <button 
                  onClick={clearFilters} 
                  className="mt-3 text-sm text-[#5C352C] hover:underline focus:outline-none focus:ring-2 focus:ring-[#5C352C] rounded px-2 py-1"
                >
                  {t('buyer.orders.clearFilters')}
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Desktop Table - hidden on mobile, visible on large screens */}
              <div className="hidden lg:block bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[800px]">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">{t('buyer.orders.orderNumber')}</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">{t('buyer.orders.date')}</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">{t('buyer.orders.seller')}</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">{t('buyer.orders.items')}</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">{t('buyer.orders.total')}</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">{t('buyer.orders.status')}</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500">{t('buyer.orders.actions')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {orders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3">
                            <span className="font-mono text-sm font-medium text-gray-900">
                              #{order.order_number || order.id}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {new Date(order.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 max-w-[200px] truncate">
                            {order.seller?.name || 'N/A'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {order.items?.length || 0}
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-semibold text-[#5C352C] text-sm">{formatPrice(order.total)}</span>
                          </td>
                          <td className="px-4 py-3">
                            {getStatusBadge(order.status)}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-1">
                              <Link 
                                to={`/buyer/orders/${order.id}`}
                                aria-label={t('buyer.orders.viewOrderDetails', { number: order.order_number || order.id })}
                              >
                                <button className="p-1.5 text-gray-500 hover:text-[#5C352C] hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#5C352C]">
                                  <Eye className="w-4 h-4" aria-hidden="true" />
                                </button>
                              </Link>
                              {canCancel(order.status) && (
                                <button
                                  onClick={() => cancelOrder(order.id, order.order_number || order.id)}
                                  disabled={cancellingOrder === order.id}
                                  className="p-1.5 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500 disabled:opacity-50"
                                  aria-label={t('buyer.orders.cancelOrderAria', { number: order.order_number || order.id })}
                                >
                                  {cancellingOrder === order.id ? (
                                    <div className="w-4 h-4 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" aria-hidden="true" />
                                  ) : (
                                    <XCircle className="w-4 h-4" aria-hidden="true" />
                                  )}
                                </button>
                              )}
                              {canConfirmDelivery(order.status) && (
                                <button
                                  onClick={() => confirmDelivery(order.id, order.order_number || order.id)}
                                  disabled={confirmingOrder === order.id}
                                  className="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
                                  aria-label={t('buyer.orders.confirmDeliveryAria', { number: order.order_number || order.id })}
                                >
                                  {confirmingOrder === order.id ? (
                                    <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" aria-hidden="true" />
                                  ) : (
                                    <CheckCircle className="w-4 h-4" aria-hidden="true" />
                                  )}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile Cards - visible on mobile, hidden on large screens */}
              <div className="lg:hidden space-y-3">
                {orders.map((order) => (
                  <div key={order.id} className="bg-white rounded-xl border border-gray-100 p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-mono font-semibold text-sm text-gray-900">
                          #{order.order_number || order.id}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      {getStatusBadge(order.status)}
                    </div>
                    
                    <div className="space-y-2 mb-3">
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-500">{t('buyer.orders.seller')}:</span>
                        <span className="text-xs font-medium text-gray-900 truncate max-w-[180px]">
                          {order.seller?.name || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-500">{t('buyer.orders.items')}:</span>
                        <span className="text-xs font-medium text-gray-900">{order.items?.length || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-500">{t('buyer.orders.total')}:</span>
                        <span className="text-sm font-bold text-[#5C352C]">{formatPrice(order.total)}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 pt-3 border-t border-gray-100">
                      <Link to={`/buyer/orders/${order.id}`} className="flex-1">
                        <button className="w-full py-2 text-xs font-medium text-[#5C352C] border border-[#5C352C] rounded-lg hover:bg-[#5C352C]/5 transition-colors focus:outline-none focus:ring-2 focus:ring-[#5C352C]">
                          {t('buyer.orders.viewDetails')}
                        </button>
                      </Link>
                      {canCancel(order.status) && (
                        <button
                          onClick={() => cancelOrder(order.id, order.order_number || order.id)}
                          disabled={cancellingOrder === order.id}
                          className="flex-1 py-2 text-xs font-medium text-rose-600 border border-rose-200 rounded-lg hover:bg-rose-50 transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500 disabled:opacity-50"
                        >
                          {cancellingOrder === order.id ? '...' : t('buyer.orders.cancel')}
                        </button>
                      )}
                      {canConfirmDelivery(order.status) && (
                        <button
                          onClick={() => confirmDelivery(order.id, order.order_number || order.id)}
                          disabled={confirmingOrder === order.id}
                          className="flex-1 py-2 text-xs font-medium text-emerald-600 border border-emerald-200 rounded-lg hover:bg-emerald-50 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
                        >
                          {confirmingOrder === order.id ? '...' : t('buyer.orders.confirm')}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination - responsive */}
              {pagination.last_page > 1 && (
                <nav className="mt-6 flex justify-center" aria-label="Pagination">
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => fetchOrders(pagination.current_page - 1)}
                      disabled={pagination.current_page === 1}
                      className="p-2 border border-gray-200 rounded-lg disabled:opacity-50 hover:border-[#5C352C] hover:text-[#5C352C] transition-colors focus:outline-none focus:ring-2 focus:ring-[#5C352C]"
                      aria-label={t('common.previousPage')}
                    >
                      <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                    </button>
                    
                    <div className="flex gap-1.5">
                      {getPaginationPages().map(page => (
                        <button
                          key={page}
                          onClick={() => fetchOrders(page)}
                          className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#5C352C] ${
                            pagination.current_page === page
                              ? 'bg-[#5C352C] text-white'
                              : 'hover:bg-gray-100'
                          }`}
                          aria-label={t('common.goToPage', { page })}
                          aria-current={pagination.current_page === page ? 'page' : undefined}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                    
                    <button
                      onClick={() => fetchOrders(pagination.current_page + 1)}
                      disabled={pagination.current_page === pagination.last_page}
                      className="p-2 border border-gray-200 rounded-lg disabled:opacity-50 hover:border-[#5C352C] hover:text-[#5C352C] transition-colors focus:outline-none focus:ring-2 focus:ring-[#5C352C]"
                      aria-label={t('common.nextPage')}
                    >
                      <ChevronRight className="w-4 h-4" aria-hidden="true" />
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

export default BuyerOrders;
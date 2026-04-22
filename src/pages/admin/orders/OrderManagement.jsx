// src/pages/admin/orders/OrderManagement.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import MainLayout from "../../../layouts/MainLayout";
import api from "../../../api/axios";
import { useToast } from "../../../contexts/ToastContext";
import { 
  Search, 
  Eye, 
  RefreshCw, 
  ShoppingBag, 
  Filter, 
  ChevronDown,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Package,
  Calendar,
  Activity,
  TrendingUp,
  Users,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  AlertTriangle
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

const SkeletonOrderRow = () => (
  <div className="animate-pulse">
    <div className="flex items-center gap-4 p-4 border-b border-gray-100">
      <div className="space-y-1 w-32">
        <div className="h-4 bg-gray-200 rounded w-24"></div>
        <div className="h-3 bg-gray-200 rounded w-16"></div>
      </div>
      <div className="space-y-1 w-40">
        <div className="h-4 bg-gray-200 rounded w-32"></div>
        <div className="h-3 bg-gray-200 rounded w-24"></div>
      </div>
      <div className="h-4 bg-gray-200 rounded w-24"></div>
      <div className="h-6 bg-gray-200 rounded w-20"></div>
      <div className="h-4 bg-gray-200 rounded w-24"></div>
      <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
    </div>
  </div>
);

const SkeletonOrderCard = () => (
  <div className="animate-pulse">
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      <div className="flex justify-between items-start mb-3">
        <div className="space-y-1">
          <div className="h-4 bg-gray-200 rounded w-32"></div>
          <div className="h-3 bg-gray-200 rounded w-24"></div>
        </div>
        <div className="h-6 bg-gray-200 rounded w-20"></div>
      </div>
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="h-10 bg-gray-200 rounded"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>
      <div className="flex justify-end pt-2">
        <div className="h-8 w-24 bg-gray-200 rounded"></div>
      </div>
    </div>
  </div>
);

// ==================== MAIN COMPONENT ====================
const OrderManagement = () => {
  const { showToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 5
  });
  const [statistics, setStatistics] = useState(null);
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
    fetchOrders();
    fetchStatistics();
  }, [search, statusFilter, startDate, endDate]);

  const fetchOrders = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const params = { page };
      if (search) params.search = search;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      
      const response = await api.get('/admin/orders', { params });
      
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
      console.error('Error fetching orders:', error);
      setError(error.response?.data?.message || 'Failed to load orders');
      showToast(error.response?.data?.message || 'Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await api.get('/admin/orders/statistics/summary');
      setStatistics(response.data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchOrders(pagination.current_page), fetchStatistics()]);
    setRefreshing(false);
    showToast('Orders refreshed', 'info');
  };

  const formatPrice = (price) => `Tsh ${Number(price || 0).toLocaleString()}`;

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: 'Pending', color: 'bg-amber-50 text-amber-700', icon: Clock },
      confirmed: { label: 'Confirmed', color: 'bg-blue-50 text-blue-700', icon: CheckCircle },
      preparing: { label: 'Preparing', color: 'bg-indigo-50 text-indigo-700', icon: Package },
      ready_for_delivery: { label: 'Ready', color: 'bg-purple-50 text-purple-700', icon: Truck },
      delivered: { label: 'Delivered', color: 'bg-emerald-50 text-emerald-700', icon: CheckCircle },
      cancelled: { label: 'Cancelled', color: 'bg-rose-50 text-rose-700', icon: XCircle },
      rejected: { label: 'Rejected', color: 'bg-gray-50 text-gray-600', icon: XCircle }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  const statCards = statistics ? [
    {
      title: "Total Orders",
      value: statistics.stats?.total_orders || 0,
      subValue: "All time",
      icon: ShoppingBag,
      color: "text-emerald-600",
      bg: "bg-emerald-50"
    },
    {
      title: "Total Revenue",
      value: formatPrice(statistics.stats?.total_revenue || 0),
      subValue: "From delivered orders",
      icon: DollarSign,
      color: "text-amber-600",
      bg: "bg-amber-50"
    },
    {
      title: "Pending Orders",
      value: statistics.stats?.pending || 0,
      subValue: "Awaiting action",
      icon: Clock,
      color: "text-yellow-600",
      bg: "bg-yellow-50"
    },
    {
      title: "Avg Order Value",
      value: formatPrice(statistics.stats?.average_order_value || 0),
      subValue: "Per transaction",
      icon: TrendingUp,
      color: "text-blue-600",
      bg: "bg-blue-50"
    }
  ] : [];

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setStartDate("");
    setEndDate("");
    setShowFilters(false);
    showToast('Filters cleared', 'info');
  };

  const hasActiveFilters = search || statusFilter !== 'all' || startDate || endDate;

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
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gray-200 rounded-xl animate-pulse"></div>
                <div className="h-7 bg-gray-200 rounded w-48 animate-pulse"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-64 animate-pulse ml-12"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              {[1, 2, 3, 4].map(i => <SkeletonStatCard key={i} />)}
            </div>
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <div className="h-10 bg-gray-200 rounded-lg animate-pulse"></div>
              </div>
              <div className="hidden lg:block">
                {[1, 2, 3, 4, 5].map(i => <SkeletonOrderRow key={i} />)}
              </div>
              <div className="lg:hidden">
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
          
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 bg-[#5C352C]/10 rounded-xl">
                <ShoppingBag className="w-5 h-5 text-[#5C352C]" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Order Management</h1>
            </div>
            <p className="text-sm text-gray-500 ml-11">Manage and track all customer orders</p>
          </div>

          {/* Statistics Cards */}
          {statistics && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
          )}

          {/* Search Bar */}
          <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6">
            <div className="flex flex-wrap gap-3">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search by order number..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#5C352C] focus:ring-1 focus:ring-[#5C352C]"
                  />
                </div>
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-[#5C352C]"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="preparing">Preparing</option>
                <option value="ready_for_delivery">Ready for Delivery</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
                <option value="rejected">Rejected</option>
              </select>
              
              <input
                type="date"
                placeholder="Start Date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#5C352C]"
              />
              
              <input
                type="date"
                placeholder="End Date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#5C352C]"
              />
              
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
              Showing <span className="font-medium text-gray-700">{orders.length}</span> of{' '}
              <span className="font-medium text-gray-700">{pagination.total}</span> orders
            </p>
          </div>

          {/* Orders Display */}
          {error ? (
            <div className="bg-white rounded-xl border border-red-100 p-8 text-center">
              <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-3" />
              <p className="text-red-600 text-sm">{error}</p>
              <button onClick={() => fetchOrders(1)} className="mt-3 text-sm text-[#5C352C] hover:underline">
                Try again
              </button>
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
              <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-medium text-gray-900 mb-1">No Orders Found</h3>
              <p className="text-sm text-gray-500">
                {hasActiveFilters ? "Try adjusting your filters" : "No orders have been placed yet"}
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
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Order #</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Buyer</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Seller</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Total</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Date</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <span className="font-mono text-sm font-medium text-gray-900">
                            {order.order_number}
                          </span>
                          <p className="text-xs text-gray-400">ID: #{order.id}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-gray-900">{order.buyer?.name || 'N/A'}</p>
                          <p className="text-xs text-gray-500 truncate max-w-[150px]">{order.buyer?.email || 'N/A'}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-gray-900">{order.seller?.name || 'N/A'}</p>
                          <p className="text-xs text-gray-400">ID: #{order.seller_id}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-semibold text-[#5C352C] text-sm">{formatPrice(order.total)}</span>
                        </td>
                        <td className="px-4 py-3">
                          {getStatusBadge(order.status)}
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-gray-600">{new Date(order.created_at).toLocaleDateString()}</p>
                          <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleTimeString()}</p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center">
                            <Link to={`/admin/orders/${order.id}`}>
                              <button className="p-1.5 text-gray-500 hover:text-[#5C352C] hover:bg-gray-100 rounded-lg transition-colors">
                                <Eye className="w-4 h-4" />
                              </button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden space-y-3">
                {orders.map((order) => (
                  <div key={order.id} className="bg-white rounded-xl border border-gray-100 p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-mono font-semibold text-sm text-gray-900">
                          {order.order_number}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">ID: #{order.id}</p>
                      </div>
                      {getStatusBadge(order.status)}
                    </div>
                    
                    <div className="space-y-2 mb-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-xs text-gray-400">Buyer</p>
                          <p className="text-xs font-medium text-gray-900">{order.buyer?.name || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Seller</p>
                          <p className="text-xs font-medium text-gray-900">{order.seller?.name || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Total</p>
                          <p className="text-sm font-bold text-[#5C352C]">{formatPrice(order.total)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Date</p>
                          <p className="text-xs text-gray-600">{new Date(order.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end pt-3 border-t border-gray-100">
                      <Link to={`/admin/orders/${order.id}`}>
                        <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-[#5C352C] border border-[#5C352C] rounded-lg hover:bg-[#5C352C]/5 transition-colors">
                          <Eye className="w-3.5 h-3.5" />
                          View Details
                        </button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination.last_page > 1 && (
                <nav className="mt-6 flex justify-center">
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => fetchOrders(pagination.current_page - 1)}
                      disabled={pagination.current_page === 1}
                      className="p-2 border border-gray-200 rounded-lg disabled:opacity-50 hover:border-[#5C352C] hover:text-[#5C352C] transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    
                    {getPaginationPages().map(page => (
                      <button
                        key={page}
                        onClick={() => fetchOrders(page)}
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
                      onClick={() => fetchOrders(pagination.current_page + 1)}
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

export default OrderManagement;
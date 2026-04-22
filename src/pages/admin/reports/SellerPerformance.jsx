// src/pages/admin/reports/SellerPerformance.jsx
import React, { useState, useEffect } from "react";
import MainLayout from "../../../layouts/MainLayout";
import api from "../../../api/axios";
import { useToast } from "../../../contexts/ToastContext";
import { 
  TrendingUp, 
  Package, 
  DollarSign, 
  Star,
  RefreshCw,
  Award,
  Users,
  ChevronRight,
  Activity,
  Medal,
  Crown,
  AlertCircle,
  ChevronLeft
} from "lucide-react";
import { Link } from "react-router-dom";

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

const SellerRowSkeleton = () => (
  <div className="animate-pulse">
    <div className="flex items-center gap-4 p-4 border-b border-gray-100">
      <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
      <div className="flex items-center gap-3 flex-1">
        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
        <div className="space-y-1 flex-1">
          <div className="h-4 bg-gray-200 rounded w-32"></div>
          <div className="h-3 bg-gray-200 rounded w-48"></div>
        </div>
      </div>
      <div className="w-16 h-5 bg-gray-200 rounded"></div>
      <div className="w-16 h-5 bg-gray-200 rounded"></div>
      <div className="w-24 h-5 bg-gray-200 rounded"></div>
      <div className="w-20 h-5 bg-gray-200 rounded"></div>
    </div>
  </div>
);

const SellerCardSkeleton = () => (
  <div className="animate-pulse p-4 border-b border-gray-100">
    <div className="flex items-start justify-between mb-3">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
        <div className="space-y-1">
          <div className="h-4 bg-gray-200 rounded w-24"></div>
          <div className="h-3 bg-gray-200 rounded w-16"></div>
        </div>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-3">
      <div className="h-10 bg-gray-200 rounded"></div>
      <div className="h-10 bg-gray-200 rounded"></div>
      <div className="h-10 bg-gray-200 rounded"></div>
      <div className="h-10 bg-gray-200 rounded"></div>
    </div>
  </div>
);

// ==================== MAIN COMPONENT ====================
const SellerPerformance = () => {
  const { showToast } = useToast();
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    fetchSellers();
  }, []);

  const fetchSellers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/admin/reports/sellers');
      setSellers(response.data);
    } catch (error) {
      console.error('Error fetching sellers:', error);
      setError(error.response?.data?.message || 'Failed to load seller performance');
      showToast(error.response?.data?.message || 'Failed to load seller performance', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchSellers();
    setRefreshing(false);
    showToast('Seller performance refreshed', 'info');
  };

  const formatPrice = (price) => `Tsh ${Number(price || 0).toLocaleString()}`;

  const getRankIcon = (index) => {
    switch(index) {
      case 0: return <Crown className="w-5 h-5 text-yellow-500" />;
      case 1: return <Medal className="w-5 h-5 text-gray-400" />;
      case 2: return <Medal className="w-5 h-5 text-amber-600" />;
      default: return <span className="w-5 h-5 flex items-center justify-center font-bold text-gray-400 text-sm">{index + 1}</span>;
    }
  };

  const getRankBadge = (index) => {
    switch(index) {
      case 0: return <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-yellow-50 text-yellow-700">🏆 Top Seller</span>;
      case 1: return <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">🥈 2nd Place</span>;
      case 2: return <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-amber-50 text-amber-700">🥉 3rd Place</span>;
      default: return null;
    }
  };

  const totalRevenue = sellers.reduce((sum, s) => sum + (s.orders_as_seller_sum_total || 0), 0);
  const totalProducts = sellers.reduce((sum, s) => sum + (s.products_count || 0), 0);
  const totalOrders = sellers.reduce((sum, s) => sum + (s.orders_as_seller_count || 0), 0);

  const statCards = [
    {
      title: "Total Sellers",
      value: sellers.length,
      subValue: "Active sellers on platform",
      icon: Users,
      color: "text-emerald-600",
      bg: "bg-emerald-50"
    },
    {
      title: "Total Revenue",
      value: formatPrice(totalRevenue),
      subValue: "Combined seller revenue",
      icon: DollarSign,
      color: "text-amber-600",
      bg: "bg-amber-50"
    },
    {
      title: "Total Products",
      value: totalProducts,
      subValue: "Across all sellers",
      icon: Package,
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    {
      title: "Total Orders",
      value: totalOrders,
      subValue: "Processed orders",
      icon: TrendingUp,
      color: "text-purple-600",
      bg: "bg-purple-50"
    }
  ];

  if (loading && sellers.length === 0) {
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
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="hidden lg:block">
                {[1, 2, 3, 4, 5].map(i => <SellerRowSkeleton key={i} />)}
              </div>
              <div className="lg:hidden">
                {[1, 2, 3, 4].map(i => <SellerCardSkeleton key={i} />)}
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
                <Award className="w-5 h-5 text-[#5C352C]" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Seller Performance</h1>
            </div>
            <p className="text-sm text-gray-500 ml-11">Track seller rankings and performance metrics</p>
          </div>

          {/* Refresh Button */}
          <div className="flex justify-end mb-4">
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

          {/* Sellers Table */}
          {error ? (
            <div className="bg-white rounded-xl border border-red-100 p-8 text-center">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
              <p className="text-red-600 text-sm">{error}</p>
              <button onClick={fetchSellers} className="mt-3 text-sm text-[#5C352C] hover:underline">
                Try again
              </button>
            </div>
          ) : sellers.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-medium text-gray-900 mb-1">No Sellers Found</h3>
              <p className="text-sm text-gray-500">No sellers have registered on the platform yet</p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block bg-white rounded-xl border border-gray-100 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Rank</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Seller</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Products</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Orders</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Total Revenue</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Avg Order</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {sellers.map((seller, index) => (
                      <tr key={seller.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-start">
                            {getRankIcon(index)}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-[#5C352C] to-[#956959] rounded-full flex items-center justify-center text-white font-bold shadow-sm flex-shrink-0">
                              {seller.name?.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <Link to={`/admin/users/${seller.id}`} className="font-medium text-sm text-gray-900 hover:text-[#5C352C] transition-colors">
                                {seller.name}
                              </Link>
                              <p className="text-xs text-gray-400 truncate">{seller.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <Package className="w-3.5 h-3.5 text-gray-400" />
                            <span className="font-semibold text-gray-700 text-sm">{seller.products_count || 0}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-semibold text-gray-700 text-sm">{seller.orders_as_seller_count || 0}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-3.5 h-3.5 text-[#5C352C]" />
                            <span className="font-bold text-gray-900 text-sm">{formatPrice(seller.orders_as_seller_sum_total)}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-600">
                            {formatPrice((seller.orders_as_seller_sum_total || 0) / (seller.orders_as_seller_count || 1))}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden space-y-3">
                {sellers.map((seller, index) => (
                  <div key={seller.id} className="bg-white rounded-xl border border-gray-100 p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="flex-shrink-0">
                          {getRankIcon(index)}
                        </div>
                        <div className="w-10 h-10 bg-gradient-to-br from-[#5C352C] to-[#956959] rounded-full flex items-center justify-center text-white font-bold shadow-sm flex-shrink-0">
                          {seller.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <Link to={`/admin/users/${seller.id}`} className="font-semibold text-gray-900 hover:text-[#5C352C] text-sm block truncate transition-colors">
                            {seller.name}
                          </Link>
                          {getRankBadge(index)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                      <div>
                        <p className="text-xs text-gray-400">Products</p>
                        <div className="flex items-center gap-1">
                          <Package className="w-3 h-3 text-gray-400" />
                          <span className="font-semibold text-gray-700 text-sm">{seller.products_count || 0}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Orders</p>
                        <p className="font-semibold text-gray-700 text-sm">{seller.orders_as_seller_count || 0}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Total Revenue</p>
                        <p className="font-bold text-[#5C352C] text-sm">{formatPrice(seller.orders_as_seller_sum_total)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Avg Order</p>
                        <p className="text-gray-600 text-sm">{formatPrice((seller.orders_as_seller_sum_total || 0) / (seller.orders_as_seller_count || 1))}</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-end pt-2 border-t border-gray-100">
                      <Link to={`/admin/users/${seller.id}`} className="text-[#5C352C] hover:text-[#956959] text-sm flex items-center gap-1 transition-colors">
                        View Details <ChevronRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default SellerPerformance;
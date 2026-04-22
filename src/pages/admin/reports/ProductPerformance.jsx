// src/pages/admin/reports/ProductPerformance.jsx
import React, { useState, useEffect } from "react";
import MainLayout from "../../../layouts/MainLayout";
import api from "../../../api/axios";
import { useToast } from "../../../contexts/ToastContext";
import { 
  Package, 
  TrendingUp, 
  AlertTriangle, 
  Eye,
  ShoppingBag,
  RefreshCw,
  Award,
  ChevronRight,
  ArrowRight,
  Archive,
  Activity,
  ChevronLeft,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { Link } from "react-router-dom";

// ==================== SKELETON LOADERS ====================
const StatCardSkeleton = () => (
  <div className="animate-pulse">
    <div className="bg-white p-6 rounded-xl border border-gray-100">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-24"></div>
          <div className="h-8 bg-gray-200 rounded w-16"></div>
        </div>
        <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
      </div>
    </div>
  </div>
);

const ProductRowSkeleton = () => (
  <div className="animate-pulse">
    <div className="space-y-3">
      <div className="flex justify-between items-end mb-2">
        <div className="flex items-center gap-3">
          <div className="w-4 h-3 bg-gray-200 rounded"></div>
          <div className="space-y-1">
            <div className="h-4 bg-gray-200 rounded w-32"></div>
            <div className="h-3 bg-gray-200 rounded w-24"></div>
          </div>
        </div>
        <div className="h-4 bg-gray-200 rounded w-16"></div>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-1.5"></div>
    </div>
  </div>
);

const LowStockSkeleton = () => (
  <div className="animate-pulse p-3 bg-gray-50 rounded-xl border border-gray-100">
    <div className="flex justify-between items-start mb-1">
      <div className="h-4 bg-gray-200 rounded w-24"></div>
      <div className="h-5 bg-gray-200 rounded w-12"></div>
    </div>
    <div className="flex justify-between items-center">
      <div className="h-3 bg-gray-200 rounded w-20"></div>
      <div className="w-4 h-4 bg-gray-200 rounded"></div>
    </div>
  </div>
);

// ==================== MAIN COMPONENT ====================
const ProductPerformance = () => {
  const { showToast } = useToast();
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showAllLowStock, setShowAllLowStock] = useState(false);

  useEffect(() => {
    fetchProductReport();
  }, []);

  const fetchProductReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/admin/reports/products');
      setReportData(response.data);
    } catch (error) {
      console.error('Error fetching product report:', error);
      setError(error.response?.data?.message || 'Failed to load report');
      showToast(error.response?.data?.message || 'Failed to load report', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchProductReport();
    setRefreshing(false);
    showToast('Report refreshed', 'info');
  };

  const formatPrice = (price) => `Tsh ${Number(price || 0).toLocaleString()}`;
  
  const maxSales = Math.max(...(reportData?.top_products?.map(p => p.sales_count) || [0]));
  const displayedLowStock = showAllLowStock ? reportData?.low_stock_products : reportData?.low_stock_products?.slice(0, 5);

  if (loading && !reportData) {
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {[1, 2, 3].map(i => <StatCardSkeleton key={i} />)}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <div className="h-6 bg-gray-200 rounded w-40 animate-pulse"></div>
                </div>
                <div className="p-6 space-y-4">
                  {[1, 2, 3, 4].map(i => <ProductRowSkeleton key={i} />)}
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
                </div>
                <div className="p-4 space-y-3">
                  {[1, 2, 3, 4].map(i => <LowStockSkeleton key={i} />)}
                </div>
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
                <TrendingUp className="w-5 h-5 text-[#5C352C]" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Product Performance</h1>
            </div>
            <p className="text-sm text-gray-500 ml-11">Analyze catalog success and inventory health</p>
          </div>

          {/* Refresh Button */}
          <div className="flex justify-end mb-4">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors text-sm"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh Report
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {[
              { title: "Top Products", value: reportData?.top_products?.length || 0, icon: Award, color: "text-amber-600", bg: "bg-amber-50" },
              { title: "Low Stock Items", value: reportData?.low_stock_products?.length || 0, icon: AlertTriangle, color: "text-orange-600", bg: "bg-orange-50" },
              { title: "Inactive Catalog", value: reportData?.inactive_products_count || 0, icon: Archive, color: "text-gray-600", bg: "bg-gray-100" }
            ].map((stat, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`${stat.bg} ${stat.color} p-2 rounded-xl`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {error ? (
            <div className="bg-white rounded-xl border border-red-100 p-8 text-center">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
              <p className="text-red-600 text-sm">{error}</p>
              <button onClick={fetchProductReport} className="mt-3 text-sm text-[#5C352C] hover:underline">
                Try again
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Top Products - Takes 2 columns */}
              <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-[#5C352C]" />
                    Top Performing Products
                  </h3>
                </div>
                <div className="p-6">
                  {reportData?.top_products?.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 text-sm">
                      No product sales data available
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {reportData?.top_products?.map((product, index) => (
                        <div key={product.id} className="relative">
                          <div className="flex justify-between items-end mb-2">
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-bold text-gray-400 w-4">
                                {index + 1}
                              </span>
                              <div>
                                <Link 
                                  to={`/admin/products/${product.id}`} 
                                  className="font-medium text-sm text-gray-900 hover:text-[#5C352C] transition-colors line-clamp-1"
                                >
                                  {product.name}
                                </Link>
                                <p className="text-xs text-gray-500">Sales: {product.sales_count || 0} units</p>
                              </div>
                            </div>
                            <span className="text-sm font-bold text-[#5C352C]">{formatPrice(product.price)}</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className="bg-gradient-to-r from-[#5C352C] to-[#E9B48A] h-full rounded-full transition-all duration-700"
                              style={{ width: `${((product.sales_count || 0) / maxSales) * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Low Stock Alerts */}
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden flex flex-col">
                <div className="px-6 py-4 border-b border-gray-100 bg-orange-50/30">
                  <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                    Stock Alerts
                  </h3>
                </div>
                <div className="p-4 flex-1">
                  {reportData?.low_stock_products?.length === 0 ? (
                    <div className="text-center text-gray-500 py-8 text-sm">
                      <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                      <p>All inventory healthy</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {displayedLowStock?.map((product) => (
                        <div key={product.id} className="p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-orange-200 transition-colors">
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="text-sm font-medium text-gray-800 line-clamp-1 flex-1">
                              {product.name}
                            </h4>
                            <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                              {product.quantity} left
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] text-gray-400 uppercase tracking-wider">
                              {product.seller?.name || 'In-House'}
                            </span>
                            <Link to={`/admin/products/${product.id}`} className="text-[#5C352C] hover:text-[#956959]">
                              <ArrowRight className="w-4 h-4" />
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {reportData?.low_stock_products?.length > 5 && (
                  <button 
                    onClick={() => setShowAllLowStock(!showAllLowStock)}
                    className="w-full py-3 text-xs font-medium text-[#5C352C] border-t border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    {showAllLowStock ? 'Show Less' : `View All ${reportData.low_stock_products.length}`}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default ProductPerformance;
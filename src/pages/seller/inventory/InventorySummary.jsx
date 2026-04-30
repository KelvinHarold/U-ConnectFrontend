// src/pages/seller/inventory/InventorySummary.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../../../layouts/MainLayout";
import api from "../../../api/axios";
import { useToast } from "../../../contexts/ToastContext";
import { useLanguage } from "../../../contexts/LanguageContext";
import { 
  Package, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  DollarSign,
  PieChart,
  Info,
  Eye
} from "lucide-react";
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
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
  <div className="bg-white rounded-xl border border-gray-100 p-3 sm:p-4 overflow-hidden">
    <div className="flex flex-col">
      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-lg mb-2 sm:mb-3"></div>
      <div className="h-5 sm:h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-12 sm:w-16 mb-1"></div>
      <div className="h-2 sm:h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-16 sm:w-20"></div>
    </div>
  </div>
);

const SkeletonChart = () => (
  <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-5 overflow-hidden">
    <div className="h-4 sm:h-5 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-24 sm:w-32 mb-3 sm:mb-4"></div>
    <div className="h-48 sm:h-64 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-xl"></div>
  </div>
);

const InventorySummary = () => {
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [summary, setSummary] = useState({
    total_products: 0,
    total_stock_value: 0,
    total_units: 0,
    low_stock_count: 0,
    out_of_stock_count: 0,
    low_stock_threshold: 10
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
    if (!document.querySelector('#shimmer-styles-inventory-summary')) {
      const style = document.createElement('style');
      style.id = 'shimmer-styles-inventory-summary';
      style.textContent = shimmerStyle;
      document.head.appendChild(style);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/seller/inventory/summary');
      const data = response.data;
      setSummary({
        total_products: data.total_products || 0,
        total_stock_value: data.total_stock_value || 0,
        total_units: data.total_units || 0,
        low_stock_count: data.low_stock_count || 0,
        out_of_stock_count: data.out_of_stock_count || 0,
        low_stock_threshold: data.low_stock_threshold || 10
      });
    } catch (error) {
      setError(t('seller.inventorySummary.failedToLoad'));
      showToast(t('seller.inventorySummary.failedToLoad'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => `${t('seller.inventorySummary.currency')} ${Number(price || 0).toLocaleString()}`;
  const formatCompactPrice = (price) => {
    const numPrice = Number(price || 0);
    if (numPrice >= 1000000) return `${t('seller.inventorySummary.currency')} ${(numPrice / 1000000).toFixed(1)}M`;
    if (numPrice >= 1000) return `${t('seller.inventorySummary.currency')} ${(numPrice / 1000).toFixed(1)}K`;
    return formatPrice(numPrice);
  };

  const inStockCount = summary.total_products - summary.low_stock_count - summary.out_of_stock_count;
  
  const pieChartData = [
    { name: t('seller.inventorySummary.inStock'), value: inStockCount, color: '#10B981' },
    { name: t('seller.inventorySummary.lowStock'), value: summary.low_stock_count, color: '#F59E0B' },
    { name: t('seller.inventorySummary.outOfStock'), value: summary.out_of_stock_count, color: '#EF4444' }
  ].filter(item => item.value > 0);

  const statCards = [
    { 
      title: t('seller.inventorySummary.products'), 
      value: summary.total_products, 
      icon: Package, 
      color: "text-[#5C352C]", 
      bg: "bg-[#5C352C]/10", 
      link: "/seller/products" 
    },
    { 
      title: t('seller.inventorySummary.value'), 
      value: formatCompactPrice(summary.total_stock_value), 
      icon: DollarSign, 
      color: "text-emerald-600", 
      bg: "bg-emerald-50", 
      link: "/seller/products" 
    },
    { 
      title: t('seller.inventorySummary.units'), 
      value: summary.total_units, 
      icon: Package, 
      color: "text-blue-600", 
      bg: "bg-blue-50", 
      link: "/seller/products" 
    },
    { 
      title: t('seller.inventorySummary.inStock'), 
      value: inStockCount, 
      icon: CheckCircle, 
      color: "text-emerald-600", 
      bg: "bg-emerald-50", 
      link: "/seller/products?stock=in_stock" 
    },
    { 
      title: t('seller.inventorySummary.lowStock'), 
      value: summary.low_stock_count, 
      icon: AlertTriangle, 
      color: "text-amber-600", 
      bg: "bg-amber-50", 
      link: "/seller/inventory/low-stock" 
    },
    { 
      title: t('seller.inventorySummary.outOfStock'), 
      value: summary.out_of_stock_count, 
      icon: XCircle, 
      color: "text-rose-600", 
      bg: "bg-rose-50", 
      link: "/seller/inventory/out-of-stock" 
    }
  ];

  // Calculate stock coverage percentage
  const stockCoverage = summary.total_products > 0 
    ? Math.min(100, Math.round((summary.total_units / (summary.total_products * summary.low_stock_threshold)) * 100))
    : 0;

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
              <div>
                <div className="h-6 sm:h-7 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-32 sm:w-40"></div>
                <div className="h-3 sm:h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-48 sm:w-64 mt-1"></div>
              </div>
              <div className="flex gap-2 sm:gap-3">
                <div className="h-8 sm:h-9 w-20 sm:w-24 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-lg"></div>
                <div className="h-8 sm:h-9 w-16 sm:w-20 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-lg"></div>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
              {[1, 2, 3, 4, 5, 6].map(i => <SkeletonStatCard key={i} />)}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <SkeletonChart />
              <SkeletonChart />
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
          <div className="max-w-md mx-auto bg-white rounded-xl border border-gray-100 p-6 sm:p-8 text-center">
            <XCircle className="w-10 h-10 sm:w-12 sm:h-12 text-red-400 mx-auto mb-3" />
            <p className="text-red-600 text-xs sm:text-sm">{error}</p>
            <button 
              onClick={fetchSummary} 
              className="mt-3 sm:mt-4 px-3 sm:px-4 py-1.5 sm:py-2 bg-[#5C352C] text-white rounded-lg text-xs sm:text-sm"
            >
              {t('seller.inventorySummary.tryAgain')}
            </button>
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
                    <Package className="w-4 h-4 sm:w-5 sm:h-5 text-[#5C352C]" />
                  </div>
                  <h1 className="text-lg sm:text-xl font-semibold text-gray-900">{t('seller.inventorySummary.title')}</h1>
                </div>
                <p className="text-xs sm:text-sm text-gray-500 ml-8 sm:ml-11">{t('seller.inventorySummary.subtitle')}</p>
              </div>
              <div className="flex gap-2 sm:gap-3">
                <Link to="/seller/inventory/bulk-update">
                  <button className="px-2.5 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-sm text-white bg-gradient-to-r from-[#5C352C] to-[#8B5E4F] rounded-lg hover:shadow-md transition-all">
                    <span className="hidden xs:inline">{t('seller.inventorySummary.bulkUpdate')}</span>
                    <span className="xs:hidden">{t('seller.inventorySummary.bulkUpdateShort')}</span>
                  </button>
                </Link>
                <button 
                  onClick={fetchSummary} 
                  className="p-1.5 sm:px-3 sm:py-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>

            {/* Stats Cards - Responsive */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
              {statCards.map((card, i) => (
                <Link to={card.link} key={i}>
                  <div className="bg-white rounded-xl border-2 border-gray-100 p-2 sm:p-4 hover:shadow-md transition-shadow">
                    <div className={`${card.bg} ${card.color} w-7 h-7 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center mb-1.5 sm:mb-3`}>
                      <card.icon className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                    </div>
                    <p className="text-sm sm:text-xl font-bold text-gray-900">{card.value}</p>
                    <p className="text-[9px] sm:text-xs text-gray-500">{card.title}</p>
                  </div>
                </Link>
              ))}
            </div>

            {/* Charts - Responsive */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Stock Distribution */}
              <div className="bg-white rounded-xl border-2 border-gray-100 p-4 sm:p-5 shadow-sm">
                <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                  <PieChart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#5C352C]" />
                  {t('seller.inventorySummary.stockDistribution')}
                </h3>
                <div className="h-48 sm:h-64">
                  {pieChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie 
                          data={pieChartData} 
                          cx="50%" 
                          cy="50%" 
                          innerRadius={isMobile ? 30 : 50} 
                          outerRadius={isMobile ? 50 : 70} 
                          dataKey="value" 
                          label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                          labelLine={false}
                        >
                          {pieChartData.map((entry, index) => (
                            <Cell key={index} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} ${t('seller.inventorySummary.products')}`, '']} />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-400 text-xs sm:text-sm">
                      {t('seller.inventorySummary.noData')}
                    </div>
                  )}
                </div>
                <div className="mt-3 sm:mt-4 flex justify-around text-center">
                  <div>
                    <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-emerald-500 mx-auto mb-0.5 sm:mb-1"></div>
                    <p className="text-[9px] sm:text-xs text-gray-600">{t('seller.inventorySummary.inStock')}</p>
                    <p className="text-[10px] sm:text-sm font-bold">{inStockCount}</p>
                  </div>
                  <div>
                    <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-amber-500 mx-auto mb-0.5 sm:mb-1"></div>
                    <p className="text-[9px] sm:text-xs text-gray-600">{t('seller.inventorySummary.lowStock')}</p>
                    <p className="text-[10px] sm:text-sm font-bold">{summary.low_stock_count}</p>
                  </div>
                  <div>
                    <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-rose-500 mx-auto mb-0.5 sm:mb-1"></div>
                    <p className="text-[9px] sm:text-xs text-gray-600">{t('seller.inventorySummary.outOfStock')}</p>
                    <p className="text-[10px] sm:text-sm font-bold">{summary.out_of_stock_count}</p>
                  </div>
                </div>
              </div>

              {/* Quick Stats - Responsive */}
              <div className="bg-white rounded-xl border-2 border-gray-100 p-4 sm:p-5 shadow-sm">
                <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-3 sm:mb-4">
                  {t('seller.inventorySummary.quickStats')}
                </h3>
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex justify-between text-[11px] sm:text-sm">
                    <span className="text-gray-500">{t('seller.inventorySummary.stockCoverage')}</span>
                    <span className="font-medium">{stockCoverage}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5 sm:h-2">
                    <div 
                      className="bg-gradient-to-r from-[#5C352C] to-[#8B5E4F] h-1.5 sm:h-2 rounded-full" 
                      style={{ width: `${stockCoverage}%` }} 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:gap-3 pt-2">
                    <div className="bg-gray-50 rounded-lg p-2 sm:p-3 text-center">
                      <p className="text-base sm:text-xl font-bold">{summary.total_units}</p>
                      <p className="text-[8px] sm:text-[10px] text-gray-500">{t('seller.inventorySummary.totalUnits')}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2 sm:p-3 text-center">
                      <p className="text-base sm:text-xl font-bold">
                        {summary.total_products > 0 ? Math.round(summary.total_units / summary.total_products) : 0}
                      </p>
                      <p className="text-[8px] sm:text-[10px] text-gray-500">{t('seller.inventorySummary.avgPerProduct')}</p>
                    </div>
                  </div>
                  {summary.low_stock_count > 0 && (
                    <div className="bg-amber-50 rounded-lg p-2 sm:p-3">
                      <p className="text-[10px] sm:text-xs text-amber-700">
                        ⚠️ {t('seller.inventorySummary.needRestocking', { count: summary.low_stock_count })}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Tips - Responsive */}
            <div className="bg-blue-50 rounded-lg p-2 sm:p-3 border border-blue-100">
              <div className="flex items-start gap-1.5 sm:gap-2">
                <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500 mt-0.5" />
                <p className="text-[10px] sm:text-xs text-blue-700">
                  {t('seller.inventorySummary.tipMessage')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default InventorySummary;
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
  <div className="bg-white rounded-xl border border-gray-100 p-4 overflow-hidden">
    <div className="flex flex-col">
      <div className="w-10 h-10 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-lg mb-3"></div>
      <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-16 mb-1"></div>
      <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-20"></div>
    </div>
  </div>
);

const SkeletonChart = () => (
  <div className="bg-white rounded-xl border border-gray-100 p-5 overflow-hidden">
    <div className="h-5 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-32 mb-4"></div>
    <div className="h-64 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-xl"></div>
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
        <div className="p-6 bg-gray-50 min-h-screen">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <div className="h-7 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-40"></div>
                <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-64 mt-1"></div>
              </div>
              <div className="flex gap-3">
                <div className="h-9 w-24 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-lg"></div>
                <div className="h-9 w-20 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-lg"></div>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
              {[1, 2, 3, 4, 5, 6].map(i => <SkeletonStatCard key={i} />)}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
        <div className="p-6 bg-gray-50 min-h-screen">
          <div className="max-w-md mx-auto bg-white rounded-xl border border-gray-100 p-8 text-center">
            <XCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
            <p className="text-red-600">{error}</p>
            <button 
              onClick={fetchSummary} 
              className="mt-4 px-4 py-2 bg-[#5C352C] text-white rounded-lg text-sm"
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
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="p-2 bg-[#5C352C]/10 rounded-xl">
                  <Package className="w-5 h-5 text-[#5C352C]" />
                </div>
                <h1 className="text-xl font-semibold text-gray-900">{t('seller.inventorySummary.title')}</h1>
              </div>
              <p className="text-sm text-gray-500 ml-11">{t('seller.inventorySummary.subtitle')}</p>
            </div>
            <div className="flex gap-3">
              <Link to="/seller/inventory/bulk-update">
                <button className="px-3 py-1.5 text-sm text-white bg-[#5C352C] rounded-lg hover:bg-[#4A2A22] transition-colors">
                  {t('seller.inventorySummary.bulkUpdate')}
                </button>
              </Link>
              <button 
                onClick={fetchSummary} 
                className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {statCards.map((card, i) => (
              <Link to={card.link} key={i}>
                <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-shadow">
                  <div className={`${card.bg} ${card.color} w-10 h-10 rounded-lg flex items-center justify-center mb-3`}>
                    <card.icon className="w-5 h-5" />
                  </div>
                  <p className="text-xl font-bold text-gray-900">{card.value}</p>
                  <p className="text-xs text-gray-500">{card.title}</p>
                </div>
              </Link>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Stock Distribution */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <PieChart className="w-4 h-4 text-[#5C352C]" />
                {t('seller.inventorySummary.stockDistribution')}
              </h3>
              <div className="h-64">
                {pieChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie 
                        data={pieChartData} 
                        cx="50%" 
                        cy="50%" 
                        innerRadius={50} 
                        outerRadius={70} 
                        dataKey="value" 
                        label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} ${t('seller.inventorySummary.products')}`, '']} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400">
                    {t('seller.inventorySummary.noData')}
                  </div>
                )}
              </div>
              <div className="mt-4 flex justify-around text-center">
                <div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500 mx-auto mb-1"></div>
                  <p className="text-xs text-gray-600">{t('seller.inventorySummary.inStock')}</p>
                  <p className="text-sm font-bold">{inStockCount}</p>
                </div>
                <div>
                  <div className="w-3 h-3 rounded-full bg-amber-500 mx-auto mb-1"></div>
                  <p className="text-xs text-gray-600">{t('seller.inventorySummary.lowStock')}</p>
                  <p className="text-sm font-bold">{summary.low_stock_count}</p>
                </div>
                <div>
                  <div className="w-3 h-3 rounded-full bg-rose-500 mx-auto mb-1"></div>
                  <p className="text-xs text-gray-600">{t('seller.inventorySummary.outOfStock')}</p>
                  <p className="text-sm font-bold">{summary.out_of_stock_count}</p>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                {t('seller.inventorySummary.quickStats')}
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">{t('seller.inventorySummary.stockCoverage')}</span>
                  <span className="font-medium">{stockCoverage}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div 
                    className="bg-[#5C352C] h-2 rounded-full" 
                    style={{ width: `${stockCoverage}%` }} 
                  />
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-xl font-bold">{summary.total_units}</p>
                    <p className="text-[10px] text-gray-500">{t('seller.inventorySummary.totalUnits')}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-xl font-bold">
                      {summary.total_products > 0 ? Math.round(summary.total_units / summary.total_products) : 0}
                    </p>
                    <p className="text-[10px] text-gray-500">{t('seller.inventorySummary.avgPerProduct')}</p>
                  </div>
                </div>
                {summary.low_stock_count > 0 && (
                  <div className="bg-amber-50 rounded-lg p-3">
                    <p className="text-xs text-amber-700">
                      ⚠️ {t('seller.inventorySummary.needRestocking', { count: summary.low_stock_count })}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-500 mt-0.5" />
              <p className="text-xs text-blue-700">
                {t('seller.inventorySummary.tipMessage')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default InventorySummary;
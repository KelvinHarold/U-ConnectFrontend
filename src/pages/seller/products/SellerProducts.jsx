// src/pages/seller/products/SellerProducts.jsx

import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../../../layouts/MainLayout";
import api from "../../../api/axios";
import { useToast } from "../../../contexts/ToastContext";
import { useLanguage } from "../../../contexts/LanguageContext";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  RefreshCw, 
  Package, 
  Search, 
  Filter, 
  ChevronDown,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  TrendingUp,
  Clock,
  Grid3x3,
  List,
  Star
} from "lucide-react";

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
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-16"></div>
        <div className="h-7 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-20"></div>
      </div>
      <div className="w-9 h-9 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-lg"></div>
    </div>
  </div>
);

const SkeletonProductCard = () => (
  <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
    <div className="relative h-32 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer"></div>
    <div className="p-3 space-y-2">
      <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-3/4"></div>
      <div className="flex justify-between">
        <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-12"></div>
        <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-16"></div>
      </div>
      <div className="flex gap-2 pt-2">
        <div className="flex-1 h-7 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-lg"></div>
        <div className="flex-1 h-7 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-lg"></div>
        <div className="w-7 h-7 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-lg"></div>
      </div>
    </div>
  </div>
);

const SkeletonProductRow = () => (
  <div className="flex items-center justify-between p-4 border-b border-gray-100 overflow-hidden">
    <div className="flex items-center gap-3 flex-1">
      <div className="w-10 h-10 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-lg"></div>
      <div className="space-y-1 flex-1">
        <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-32"></div>
        <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-48"></div>
      </div>
    </div>
    <div className="w-20 h-5 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded"></div>
    <div className="w-24 h-5 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded"></div>
    <div className="w-16 h-5 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded"></div>
    <div className="flex gap-2">
      <div className="w-7 h-7 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded"></div>
      <div className="w-7 h-7 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded"></div>
      <div className="w-7 h-7 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded"></div>
    </div>
  </div>
);

// ==================== MAIN COMPONENT ====================
const SellerProducts = () => {
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0
  });
  const [error, setError] = useState(null);
  const [imageErrors, setImageErrors] = useState({});
  const [refreshing, setRefreshing] = useState(false);

  // Add shimmer style
  useEffect(() => {
    if (!document.querySelector('#shimmer-styles-seller-products')) {
      const style = document.createElement('style');
      style.id = 'shimmer-styles-seller-products';
      style.textContent = shimmerStyle;
      document.head.appendChild(style);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [search, statusFilter, stockFilter]);

  const fetchProducts = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const params = { page };
      if (search) params.search = search;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (stockFilter !== 'all') params.stock = stockFilter;
      
      const response = await api.get('/seller/products', { params });
      
      if (response.data && response.data.data) {
        setProducts(response.data.data);
        setPagination({
          current_page: response.data.current_page,
          last_page: response.data.last_page,
          total: response.data.total
        });
        setImageErrors({});
      } else {
        setProducts([]);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || t('seller.products.errorLoading');
      setError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchProducts(pagination.current_page);
    showToast(t('seller.products.refreshed'), 'info');
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(t('seller.products.deleteConfirm', { name }))) {
      try {
        await api.delete(`/seller/products/${id}`);
        showToast(t('seller.products.deleteSuccess'), 'success');
        fetchProducts(pagination.current_page);
      } catch (error) {
        showToast(error.response?.data?.message || t('seller.products.deleteError'), 'error');
      }
    }
  };

  const formatPrice = (price) => `Tsh ${Number(price).toLocaleString()}`;

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;
    return imagePath;
  };

  const handleImageError = (productId) => {
    setImageErrors(prev => ({ ...prev, [productId]: true }));
  };

  const getStockStatus = (product) => {
    if (product.quantity <= 0) {
      return { 
        label: t('seller.products.outOfStock'), 
        color: 'text-rose-600', 
        bg: 'bg-rose-50', 
        icon: XCircle 
      };
    } else if (product.quantity <= (product.min_stock_alert || 5)) {
      return { 
        label: t('seller.products.lowStock'), 
        color: 'text-amber-600', 
        bg: 'bg-amber-50', 
        icon: AlertTriangle 
      };
    }
    return { 
      label: t('seller.products.inStock'), 
      color: 'text-emerald-600', 
      bg: 'bg-emerald-50', 
      icon: CheckCircle 
    };
  };

  const activeCount = products.filter(p => p.is_active).length;
  const lowStockCount = products.filter(p => p.quantity > 0 && p.quantity <= (p.min_stock_alert || 5)).length;
  const outOfStockCount = products.filter(p => p.quantity <= 0).length;

  const statCards = [
    { 
      title: t('seller.products.totalProducts'), 
      value: pagination.total, 
      icon: Package, 
      color: "text-[#5C352C]", 
      bg: "bg-[#5C352C]/10" 
    },
    { 
      title: t('seller.products.active'), 
      value: activeCount, 
      icon: CheckCircle, 
      color: "text-emerald-600", 
      bg: "bg-emerald-50" 
    },
    { 
      title: t('seller.products.lowStock'), 
      value: lowStockCount, 
      icon: AlertTriangle, 
      color: "text-amber-600", 
      bg: "bg-amber-50" 
    },
    { 
      title: t('seller.products.outOfStock'), 
      value: outOfStockCount, 
      icon: XCircle, 
      color: "text-rose-600", 
      bg: "bg-rose-50" 
    }
  ];

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

  if (loading && products.length === 0) {
    return (
      <MainLayout>
        <div className="p-6 bg-gray-50 min-h-screen">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <div className="space-y-2">
                <div className="h-7 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-40"></div>
                <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-64"></div>
              </div>
              <div className="flex gap-3">
                <div className="h-9 w-28 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-lg"></div>
                <div className="h-9 w-16 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-lg"></div>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              {[1, 2, 3, 4].map(i => <SkeletonStatCard key={i} />)}
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6">
              <div className="h-10 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-lg"></div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {[...Array(12)].map((_, i) => <SkeletonProductCard key={i} />)}
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
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{t('seller.products.title')}</h1>
              <p className="text-sm text-gray-500 mt-1">{t('seller.products.subtitle')}</p>
            </div>
            <div className="flex gap-3">
              <Link to="/seller/products/add">
                <button className="flex items-center gap-2 px-4 py-2 bg-[#5C352C] text-white rounded-lg text-sm font-medium hover:bg-[#4A2A22] transition-colors">
                  <Plus className="w-4 h-4" />
                  {t('seller.products.addProduct')}
                </button>
              </Link>
              <button 
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 text-sm hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                {t('seller.products.refresh')}
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {statCards.map((card, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">{card.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                  </div>
                  <div className={`${card.bg} ${card.color} p-2 rounded-lg`}>
                    <card.icon className="w-5 h-5" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6">
            <div className="flex flex-wrap gap-3">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder={t('seller.products.searchPlaceholder')}
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
                <option value="all">{t('seller.products.allStatus')}</option>
                <option value="active">{t('seller.products.active')}</option>
                <option value="inactive">{t('seller.products.inactive')}</option>
              </select>
              
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-[#5C352C]"
              >
                <option value="all">{t('seller.products.allStock')}</option>
                <option value="in_stock">{t('seller.products.inStock')}</option>
                <option value="low_stock">{t('seller.products.lowStock')}</option>
                <option value="out_of_stock">{t('seller.products.outOfStock')}</option>
              </select>
              
              <div className="flex bg-gray-100 rounded-lg p-0.5">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white text-[#5C352C] shadow-sm' : 'text-gray-500'}`}
                  aria-label={t('seller.products.gridView')}
                >
                  <Grid3x3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white text-[#5C352C] shadow-sm' : 'text-gray-500'}`}
                  aria-label={t('seller.products.listView')}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Products Display */}
          {error ? (
            <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
              <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-3" />
              <p className="text-red-600">{error}</p>
              <button onClick={() => fetchProducts(1)} className="mt-3 text-sm text-[#5C352C] hover:underline">
                {t('seller.products.tryAgain')}
              </button>
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('seller.products.noProducts')}</h3>
              <p className="text-sm text-gray-500 mb-4">{t('seller.products.noProductsMessage')}</p>
              <Link to="/seller/products/add">
                <button className="px-4 py-2 bg-[#5C352C] text-white rounded-lg text-sm font-medium hover:bg-[#4A2A22] transition-colors">
                  {t('seller.products.addFirstProduct')}
                </button>
              </Link>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {products.map((product) => {
                const stockStatus = getStockStatus(product);
                const StatusIcon = stockStatus.icon;
                const imageUrl = getImageUrl(product.image);
                
                return (
                  <div key={product.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5">
                    <Link to={`/seller/products/${product.id}`}>
                      <div className="relative w-full pt-[100%] bg-gray-50 overflow-hidden">
                        <div className="absolute inset-0">
                          {imageUrl && !imageErrors[product.id] ? (
                            <img 
                              src={imageUrl} 
                              alt={product.name} 
                              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" 
                              onError={() => handleImageError(product.id)} 
                              loading="lazy" 
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100">
                              <Package className="w-10 h-10 text-gray-300" />
                            </div>
                          )}
                        </div>
                        {!product.is_active && (
                          <span className="absolute top-2 right-2 px-2 py-0.5 text-[10px] font-medium bg-gray-500 text-white rounded-full z-10">
                            {t('seller.products.inactive')}
                          </span>
                        )}
                        {stockStatus.label !== t('seller.products.inStock') && (
                          <span className={`absolute bottom-2 left-2 px-2 py-0.5 text-[10px] font-medium rounded-full z-10 ${stockStatus.bg} ${stockStatus.color}`}>
                            {stockStatus.label}
                          </span>
                        )}
                      </div>
                    </Link>
                    <div className="p-3">
                      <Link to={`/seller/products/${product.id}`}>
                        <h3 className="text-sm font-semibold text-gray-900 hover:text-[#5C352C] line-clamp-1 transition-colors">
                          {product.name}
                        </h3>
                      </Link>
                      <p className="text-sm font-bold text-[#5C352C] mt-1">{formatPrice(product.price)}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">
                          {t('seller.products.stock')}: {product.quantity}
                        </span>
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3 text-gray-400" />
                          <span className="text-[10px] text-gray-400">{product.views_count || 0}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Link to={`/seller/products/${product.id}`} className="flex-1">
                          <button className="w-full py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                            {t('seller.products.view')}
                          </button>
                        </Link>
                        <Link to={`/seller/products/${product.id}/edit`} className="flex-1">
                          <button className="w-full py-1.5 text-xs font-medium text-white bg-[#5C352C] rounded-lg hover:bg-[#4A2A22] transition-colors">
                            {t('seller.products.edit')}
                          </button>
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id, product.name)}
                          className="px-2 py-1.5 text-rose-600 border border-rose-200 rounded-lg hover:bg-rose-50 transition-colors"
                          aria-label={t('seller.products.delete')}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {t('seller.products.product')}
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {t('seller.products.price')}
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {t('seller.products.stock')}
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {t('seller.products.status')}
                      </th>
                      <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {t('seller.products.actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {products.map((product) => {
                      const stockStatus = getStockStatus(product);
                      const StatusIcon = stockStatus.icon;
                      const imageUrl = getImageUrl(product.image);
                      
                      return (
                        <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                {imageUrl && !imageErrors[product.id] ? (
                                  <img 
                                    src={imageUrl} 
                                    alt={product.name} 
                                    className="w-full h-full object-cover" 
                                    onError={() => handleImageError(product.id)} 
                                    loading="lazy" 
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Package className="w-5 h-5 text-gray-400" />
                                  </div>
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">{product.name}</p>
                                <p className="text-xs text-gray-500 line-clamp-1">{product.description}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <p className="text-sm font-bold text-[#5C352C]">{formatPrice(product.price)}</p>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-1.5">
                              <StatusIcon className="w-3.5 h-3.5" />
                              <span className={`text-xs font-medium ${stockStatus.color}`}>{stockStatus.label}</span>
                              <span className="text-xs text-gray-400">({product.quantity})</span>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            {product.is_active ? (
                              <span className="px-2 py-1 text-[10px] font-medium bg-emerald-50 text-emerald-600 rounded-full">
                                {t('seller.products.active')}
                              </span>
                            ) : (
                              <span className="px-2 py-1 text-[10px] font-medium bg-gray-100 text-gray-500 rounded-full">
                                {t('seller.products.inactive')}
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Link 
                                to={`/seller/products/${product.id}`} 
                                className="p-1.5 text-gray-400 hover:text-[#5C352C] transition-colors"
                                aria-label={t('seller.products.view')}
                              >
                                <Eye className="w-4 h-4" />
                              </Link>
                              <Link 
                                to={`/seller/products/${product.id}/edit`} 
                                className="p-1.5 text-gray-400 hover:text-[#5C352C] transition-colors"
                                aria-label={t('seller.products.edit')}
                              >
                                <Edit className="w-4 h-4" />
                              </Link>
                              <button 
                                onClick={() => handleDelete(product.id, product.name)} 
                                className="p-1.5 text-gray-400 hover:text-rose-600 transition-colors"
                                aria-label={t('seller.products.delete')}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pagination */}
          {pagination.last_page > 1 && (
            <div className="mt-8 flex justify-center">
              <div className="flex gap-1.5">
                <button
                  onClick={() => fetchProducts(pagination.current_page - 1)}
                  disabled={pagination.current_page === 1}
                  className="p-2 border border-gray-200 rounded-lg disabled:opacity-50 hover:border-[#5C352C] hover:text-[#5C352C] transition-colors"
                  aria-label={t('seller.products.previous')}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {getPaginationPages().map(page => (
                  <button
                    key={page}
                    onClick={() => fetchProducts(page)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                      pagination.current_page === page
                        ? 'bg-[#5C352C] text-white'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => fetchProducts(pagination.current_page + 1)}
                  disabled={pagination.current_page === pagination.last_page}
                  className="p-2 border border-gray-200 rounded-lg disabled:opacity-50 hover:border-[#5C352C] hover:text-[#5C352C] transition-colors"
                  aria-label={t('seller.products.next')}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default SellerProducts;
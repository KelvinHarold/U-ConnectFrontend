// src/pages/seller/categories/SellerCategoryProducts.jsx

import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import MainLayout from "../../../layouts/MainLayout";
import api from "../../../api/axios";
import { useToast } from "../../../contexts/ToastContext";
import { confirmAlert } from '../../../utils/sweetAlertHelper';
import { useLanguage } from "../../../contexts/LanguageContext";
import { 
  Package, 
  Edit, 
  Trash2, 
  Eye, 
  Search, 
  Filter, 
  ChevronDown,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ArrowLeft,
  RefreshCw,
  Image as ImageIcon,
  Grid3x3,
  List,
  TrendingUp,
  Clock,
  Star,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
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

const SellerCategoryProducts = () => {
  const { id } = useParams();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 12
  });
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [imageErrors, setImageErrors] = useState({});

  // Add shimmer style
  useEffect(() => {
    if (!document.querySelector('#shimmer-styles-category-products')) {
      const style = document.createElement('style');
      style.id = 'shimmer-styles-category-products';
      style.textContent = shimmerStyle;
      document.head.appendChild(style);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [search, sortBy, statusFilter, stockFilter, pagination.current_page, pagination.per_page]);

  const fetchProducts = async (page = pagination.current_page) => {
    setLoading(true);
    setError(null);
    try {
      const params = { 
        page, 
        per_page: pagination.per_page 
      };
      if (search) params.search = search;
      if (sortBy !== 'latest') params.sort = sortBy;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (stockFilter !== 'all') params.stock = stockFilter;
      
      const response = await api.get(`/seller/categories/${id}/products`, { params });
      setCategory(response.data.category);
      setProducts(response.data.products.data);
      setPagination({
        current_page: response.data.products.current_page,
        last_page: response.data.products.last_page,
        total: response.data.products.total,
        per_page: response.data.products.per_page
      });
    } catch (error) {
      setError(t('seller.categoryProducts.errorLoading'));
      showToast(t('seller.categoryProducts.errorLoading'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId, productName) => {
    const confirmed = await confirmAlert({
      title: t('seller.categoryProducts.deleteConfirm', { name: productName }),
      text: '',
      icon: 'warning',
      confirmButtonText: t('seller.categoryProducts.yesDelete'),
      cancelButtonText: t('common.cancel'),
      dangerMode: true,
    });
    if (confirmed) {
      try {
        await api.delete(`/seller/products/${productId}`);
        showToast(t('seller.categoryProducts.deleteSuccess'), 'success');
        fetchProducts(1);
      } catch (error) {
        showToast(t('seller.categoryProducts.deleteError'), 'error');
      }
    }
  };

  const formatPrice = (price) => `Tsh ${Number(price).toLocaleString()}`;
  
  const formatViewCount = (views) => {
    if (!views) return '0';
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  const getStockStatus = (product) => {
    if (product.quantity <= 0) { 
      return { 
        label: t('seller.categoryProducts.out'), 
        color: 'text-rose-600', 
        bg: 'bg-rose-50', 
        icon: XCircle 
      };
    }
    if (product.quantity <= (product.min_stock_alert || 5)) { 
      return { 
        label: t('seller.categoryProducts.low'), 
        color: 'text-amber-600', 
        bg: 'bg-amber-50', 
        icon: AlertTriangle 
      };
    }
    return { 
      label: t('seller.categoryProducts.in'), 
      color: 'text-emerald-600', 
      bg: 'bg-emerald-50', 
      icon: CheckCircle 
    };
  };

  const handleImageError = (productId) => setImageErrors(prev => ({ ...prev, [productId]: true }));

  const renderPagination = () => {
    const maxVisible = 3;
    let startPage = Math.max(1, pagination.current_page - Math.floor(maxVisible / 2));
    let endPage = Math.min(pagination.last_page, startPage + maxVisible - 1);
    if (endPage - startPage + 1 < maxVisible) startPage = Math.max(1, endPage - maxVisible + 1);
    const pageNumbers = [];
    for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);

    return (
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>{t('seller.categoryProducts.show')}</span>
          <select 
            value={pagination.per_page} 
            onChange={(e) => setPagination(prev => ({ ...prev, per_page: Number(e.target.value), current_page: 1 }))}
            className="px-2 py-1 border border-gray-200 rounded-lg text-xs"
          >
            <option value={12}>12</option>
            <option value={24}>24</option>
            <option value={48}>48</option>
          </select>
          <span>{t('seller.categoryProducts.perPage')}</span>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => fetchProducts(1)} 
            disabled={pagination.current_page === 1}
            className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
            aria-label={t('seller.categoryProducts.firstPage')}
          >
            <ChevronsLeft className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={() => fetchProducts(pagination.current_page - 1)} 
            disabled={pagination.current_page === 1}
            className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
            aria-label={t('seller.categoryProducts.previousPage')}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          {startPage > 1 && <span className="text-gray-400 text-xs">...</span>}
          {pageNumbers.map(page => (
            <button 
              key={page} 
              onClick={() => fetchProducts(page)}
              className={`min-w-[32px] h-8 rounded-lg text-xs font-medium transition-colors ${
                pagination.current_page === page ? 'bg-[#5C352C] text-white' : 'hover:bg-gray-100'
              }`}
            >
              {page}
            </button>
          ))}
          {endPage < pagination.last_page && <span className="text-gray-400 text-xs">...</span>}
          <button 
            onClick={() => fetchProducts(pagination.current_page + 1)} 
            disabled={pagination.current_page === pagination.last_page}
            className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
            aria-label={t('seller.categoryProducts.nextPage')}
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={() => fetchProducts(pagination.last_page)} 
            disabled={pagination.current_page === pagination.last_page}
            className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
            aria-label={t('seller.categoryProducts.lastPage')}
          >
            <ChevronsRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  };

  if (loading && !category) {
    return (
      <MainLayout>
        <div className="p-6 bg-gray-50 min-h-screen">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-2 text-sm mb-6">
              <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-20"></div>
              <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-24"></div>
            </div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <div className="h-7 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-48"></div>
                <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-64 mt-1"></div>
              </div>
              <div className="flex gap-3">
                <div className="h-9 w-28 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-lg"></div>
                <div className="h-9 w-20 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-lg"></div>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                  <div className="h-32 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer"></div>
                  <div className="p-3 space-y-2">
                    <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-3/4"></div>
                    <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  const activeCount = products.filter(p => p.is_active).length;
  const inStockCount = products.filter(p => p.quantity > 0).length;
  const totalValue = products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
  const totalViews = products.reduce((sum, p) => sum + (p.views_count || 0), 0);

  return (
    <MainLayout>
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm">
            <Link to="/seller/categories" className="text-gray-500 hover:text-[#5C352C] transition-colors">
              {t('seller.categoryProducts.categories')}
            </Link>
            <ChevronRight className="w-3 h-3 text-gray-400" />
            <span className="text-gray-900 font-medium">{category?.name || t('seller.categoryProducts.products')}</span>
          </div>

          {/* Header */}
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="p-2 bg-[#5C352C]/10 rounded-xl">
                  <Package className="w-5 h-5 text-[#5C352C]" />
                </div>
                <h1 className="text-xl font-semibold text-gray-900">{category?.name}</h1>
              </div>
              <p className="text-sm text-gray-500 ml-11">
                {category?.description || t('seller.categoryProducts.productsIn', { name: category?.name })}
              </p>
            </div>
            <Link to="/seller/products/add">
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#5C352C] text-white rounded-lg text-sm hover:bg-[#4A2A22] transition-colors">
                <Package className="w-4 h-4" />
                {t('seller.categoryProducts.addProduct')}
              </button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
              <p className="text-2xl font-bold text-gray-900">{pagination.total}</p>
              <p className="text-xs text-gray-500">{t('seller.categoryProducts.products')}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
              <p className="text-2xl font-bold text-emerald-600">{activeCount}</p>
              <p className="text-xs text-gray-500">{t('seller.categoryProducts.active')}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
              <p className="text-2xl font-bold text-blue-600">{inStockCount}</p>
              <p className="text-xs text-gray-500">{t('seller.categoryProducts.inStock')}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
              <p className="text-sm font-bold text-gray-900 truncate">{formatPrice(totalValue)}</p>
              <p className="text-xs text-gray-500">{t('seller.categoryProducts.inventoryValue')}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
              <p className="text-2xl font-bold text-purple-600">{formatViewCount(totalViews)}</p>
              <p className="text-xs text-gray-500">{t('seller.categoryProducts.totalViews')}</p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex flex-wrap gap-3">
              <div className="flex-1 min-w-[200px] relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder={t('seller.categoryProducts.searchPlaceholder')} 
                  value={search} 
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#5C352C] focus:ring-1 focus:ring-[#5C352C]"
                />
              </div>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-[#5C352C]"
              >
                <option value="latest">{t('seller.categoryProducts.latest')}</option>
                <option value="price_asc">{t('seller.categoryProducts.priceLowToHigh')}</option>
                <option value="price_desc">{t('seller.categoryProducts.priceHighToLow')}</option>
                <option value="name_asc">{t('seller.categoryProducts.nameAToZ')}</option>
              </select>
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors ${showFilters ? 'bg-[#5C352C] text-white' : 'bg-gray-100 text-gray-600'}`}
              >
                <Filter className="w-4 h-4" />
                {t('seller.categoryProducts.filters')}
                <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
              <div className="flex bg-gray-100 rounded-lg p-0.5">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white text-[#5C352C] shadow-sm' : 'text-gray-500'}`}
                  aria-label={t('seller.categoryProducts.gridView')}
                >
                  <Grid3x3 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white text-[#5C352C] shadow-sm' : 'text-gray-500'}`}
                  aria-label={t('seller.categoryProducts.listView')}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

            {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="grid grid-cols-2 gap-3">
                  <select 
                    value={statusFilter} 
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-[#5C352C]"
                  >
                    <option value="all">{t('seller.categoryProducts.allStatus')}</option>
                    <option value="active">{t('seller.categoryProducts.active')}</option>
                    <option value="inactive">{t('seller.categoryProducts.inactive')}</option>
                  </select>
                  <select 
                    value={stockFilter} 
                    onChange={(e) => setStockFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-[#5C352C]"
                  >
                    <option value="all">{t('seller.categoryProducts.allStock')}</option>
                    <option value="in_stock">{t('seller.categoryProducts.inStock')}</option>
                    <option value="low_stock">{t('seller.categoryProducts.lowStock')}</option>
                    <option value="out_of_stock">{t('seller.categoryProducts.outOfStock')}</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Pagination Top */}
          {products.length > 0 && pagination.last_page > 1 && (
            <div className="bg-white rounded-xl border border-gray-100 p-3">{renderPagination()}</div>
          )}

          {/* Error / Empty State */}
          {error ? (
            <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
              <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-3" />
              <p className="text-red-600">{error}</p>
              <button onClick={() => fetchProducts(1)} className="mt-3 text-sm text-[#5C352C] hover:underline">
                {t('seller.categoryProducts.tryAgain')}
              </button>
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-medium text-gray-900 mb-1">{t('seller.categoryProducts.noProducts')}</h3>
              <p className="text-sm text-gray-500">{t('seller.categoryProducts.noProductsInCategory')}</p>
            </div>
          ) : viewMode === 'grid' ? (
            /* Grid View */
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {products.map((product) => {
                const stockStatus = getStockStatus(product);
                const StatusIcon = stockStatus.icon;
                return (
                  <div key={product.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5">
                    <Link to={`/seller/products/${product.id}`}>
                      <div className="h-32 bg-gray-100 relative overflow-hidden">
                        {product.image && !imageErrors[product.id] ? (
                          <img 
                            src={product.image} 
                            alt={product.name} 
                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" 
                            onError={() => handleImageError(product.id)} 
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-8 h-8 text-gray-300" />
                          </div>
                        )}
                        {!product.is_active && (
                          <span className="absolute top-2 right-2 px-1.5 py-0.5 text-[9px] font-medium bg-gray-500 text-white rounded-full">
                            {t('seller.categoryProducts.inactive')}
                          </span>
                        )}
                        {stockStatus.label !== t('seller.categoryProducts.in') && (
                          <span className={`absolute bottom-2 left-2 px-1.5 py-0.5 text-[9px] font-medium rounded-full ${stockStatus.bg} ${stockStatus.color}`}>
                            {stockStatus.label}
                          </span>
                        )}
                        <div className="absolute bottom-2 right-2 bg-black/60 rounded-md px-1.5 py-0.5">
                          <span className="text-white text-[10px] font-bold">{formatPrice(product.price)}</span>
                        </div>
                      </div>
                    </Link>
                    <div className="p-3">
                      <Link to={`/seller/products/${product.id}`}>
                        <h3 className="text-sm font-medium text-gray-900 hover:text-[#5C352C] line-clamp-1 transition-colors">
                          {product.name}
                        </h3>
                      </Link>
                      <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {formatViewCount(product.views_count)}
                        </span>
                        <span className="flex items-center gap-1">
                          <StatusIcon className="w-3 h-3" />
                          {stockStatus.label} ({product.quantity})
                        </span>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Link to={`/seller/products/${product.id}`} className="flex-1">
                          <button className="w-full py-1 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                            {t('seller.categoryProducts.view')}
                          </button>
                        </Link>
                        <Link to={`/seller/products/${product.id}/edit`} className="flex-1">
                          <button className="w-full py-1 text-xs font-medium text-white bg-[#5C352C] rounded-lg hover:bg-[#4A2A22] transition-colors">
                            {t('seller.categoryProducts.edit')}
                          </button>
                        </Link>
                        <button 
                          onClick={() => handleDelete(product.id, product.name)} 
                          className="px-2 py-1 text-rose-600 border border-rose-200 rounded-lg hover:bg-rose-50 transition-colors"
                          aria-label={t('seller.categoryProducts.delete')}
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
            /* List View */
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {t('seller.categoryProducts.product')}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {t('seller.categoryProducts.price')}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {t('seller.categoryProducts.stock')}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {t('seller.categoryProducts.views')}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {t('seller.categoryProducts.status')}
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {t('seller.categoryProducts.actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {products.map((product) => {
                      const stockStatus = getStockStatus(product);
                      const StatusIcon = stockStatus.icon;
                      return (
                        <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                                {product.image && !imageErrors[product.id] ? (
                                  <img 
                                    src={product.image} 
                                    alt={product.name} 
                                    className="w-full h-full object-cover" 
                                    onError={() => handleImageError(product.id)} 
                                  />
                                ) : (
                                  <Package className="w-4 h-4 text-gray-400 m-2" />
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">{product.name}</p>
                                <p className="text-xs text-gray-500 truncate max-w-[200px]">{product.description}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-sm font-bold text-[#5C352C]">{formatPrice(product.price)}</p>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <StatusIcon className="w-3 h-3" />
                              <span className="text-xs">{stockStatus.label}</span>
                              <span className="text-xs text-gray-400">({product.quantity})</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <Eye className="w-3 h-3 text-gray-400" />
                              <span className="text-xs text-gray-600">{formatViewCount(product.views_count)}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {product.is_active ? (
                              <span className="px-1.5 py-0.5 text-[10px] font-medium bg-emerald-50 text-emerald-600 rounded-full">
                                {t('seller.categoryProducts.active')}
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 text-[10px] font-medium bg-gray-100 text-gray-500 rounded-full">
                                {t('seller.categoryProducts.inactive')}
                              </span>
                            )}
                           </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1.5">
                              <Link to={`/seller/products/${product.id}`}>
                                <button className="p-1 text-gray-500 hover:text-[#5C352C] transition-colors" aria-label={t('seller.categoryProducts.view')}>
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                              </Link>
                              <Link to={`/seller/products/${product.id}/edit`}>
                                <button className="p-1 text-gray-500 hover:text-[#5C352C] transition-colors" aria-label={t('seller.categoryProducts.edit')}>
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                              </Link>
                              <button 
                                onClick={() => handleDelete(product.id, product.name)} 
                                className="p-1 text-gray-500 hover:text-rose-600 transition-colors"
                                aria-label={t('seller.categoryProducts.delete')}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
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

          {/* Pagination Bottom */}
          {products.length > 0 && pagination.last_page > 1 && (
            <div className="bg-white rounded-xl border border-gray-100 p-3">{renderPagination()}</div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default SellerCategoryProducts;
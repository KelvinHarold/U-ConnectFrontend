// src/pages/admin/products/ProductManagement.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import MainLayout from "../../../layouts/MainLayout";
import api from "../../../api/axios";
import { useToast } from "../../../contexts/ToastContext";
import { useLanguage } from "../../../contexts/LanguageContext";
import { confirmAlert } from '../../../utils/sweetAlertHelper';
import { 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  RefreshCw, 
  Package, 
  Filter, 
  ChevronDown,
  DollarSign,
  ShoppingBag,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Star,
  Activity,
  Users,
  Store,
  Award,
  Power,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight
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

const SkeletonProductRow = () => (
  <div className="animate-pulse">
    <div className="flex items-center gap-4 p-4 border-b border-gray-100">
      <div className="flex items-center gap-3 flex-1">
        <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
        <div className="space-y-1 flex-1">
          <div className="h-4 bg-gray-200 rounded w-32"></div>
          <div className="h-3 bg-gray-200 rounded w-48"></div>
        </div>
      </div>
      <div className="w-24 h-5 bg-gray-200 rounded"></div>
      <div className="w-20 h-5 bg-gray-200 rounded"></div>
      <div className="w-24 h-5 bg-gray-200 rounded"></div>
      <div className="w-20 h-5 bg-gray-200 rounded"></div>
      <div className="w-28 h-5 bg-gray-200 rounded"></div>
      <div className="flex gap-2">
        <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
        <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
        <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
        <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
      </div>
    </div>
  </div>
);

const SkeletonProductCard = () => (
  <div className="animate-pulse">
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      <div className="flex gap-3 mb-3">
        <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
        <div className="flex-1">
          <div className="flex justify-between">
            <div className="h-5 bg-gray-200 rounded w-32"></div>
            <div className="flex gap-1">
              <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
              <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
          <div className="h-3 bg-gray-200 rounded w-48 mt-2"></div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="h-10 bg-gray-200 rounded"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>
      <div className="flex justify-between items-center pt-2 mt-2 border-t border-gray-100">
        <div className="h-8 bg-gray-200 rounded w-24"></div>
        <div className="flex gap-2">
          <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
          <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    </div>
  </div>
);

// ==================== MAIN COMPONENT ====================
const ProductManagement = () => {
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 5
  });
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [imageErrors, setImageErrors] = useState({});

  const searchInputRef = useRef(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
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
      if (stockFilter !== 'all') params.stock_status = stockFilter;
      
      const response = await api.get('/admin/products', { params });
      
      if (response.data && response.data.data) {
        setProducts(response.data.data);
        setPagination({
          current_page: response.data.current_page,
          last_page: response.data.last_page,
          total: response.data.total,
          per_page: response.data.per_page,
          from: response.data.from,
          to: response.data.to
        });
        setImageErrors({});
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setError(error.response?.data?.message || 'Failed to load products');
      showToast(error.response?.data?.message || 'Failed to load products', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchProducts(pagination.current_page);
    setRefreshing(false);
    showToast('Products refreshed', 'info');
  };

  const handleDelete = async (id, productName) => {
    const confirmed = await confirmAlert({
      title: t('alerts.deleteConfirm', { name: productName }),
      text: t('alerts.deleteConfirmText'),
      icon: 'warning',
      confirmButtonText: t('common.delete'),
      cancelButtonText: t('common.cancel'),
      dangerMode: true,
    });
    if (confirmed) {
      try {
        await api.delete(`/admin/products/${id}`);
        showToast(t('alerts.deleteSuccess') || 'Product deleted successfully', 'success');
        await fetchProducts(pagination.current_page);
      } catch (error) {
        showToast(error.response?.data?.message || t('alerts.deleteError'), 'error');
      }
    }
  };

  const handleToggleStatus = async (id, currentStatus, productName) => {
    const actionKey = currentStatus ? 'deactivate' : 'activate';
    const confirmed = await confirmAlert({
      title: t(`alerts.${actionKey}Confirm`, { name: productName }),
      text: '',
      icon: 'question',
      confirmButtonText: t(`alerts.${actionKey}`),
      cancelButtonText: t('common.cancel'),
    });
    if (confirmed) {
      try {
        await api.put(`/admin/products/${id}`, { is_active: !currentStatus });
        showToast(t(`alerts.${actionKey}Success`) || `Product ${actionKey}d successfully`, 'success');
        await fetchProducts(pagination.current_page);
      } catch (error) {
        showToast(error.response?.data?.message || t(`alerts.${actionKey}Error`), 'error');
      }
    }
  };

  const handleToggleFeatured = async (id, currentFeatured, productName) => {
    try {
      await api.put(`/admin/products/${id}`, { is_featured: !currentFeatured });
      const action = currentFeatured ? 'removed from' : 'added to';
      showToast(`Product ${action} featured`, 'success');
      await fetchProducts(pagination.current_page);
    } catch (error) {
      showToast(error.response?.data?.message || 'Error updating featured status', 'error');
    }
  };

  const handleImageError = (productId) => {
    setImageErrors(prev => ({ ...prev, [productId]: true }));
  };

  const getStockStatus = (product) => {
    if (product.quantity <= 0) {
      return { label: 'Out of Stock', color: 'bg-rose-50 text-rose-700', icon: XCircle };
    } else if (product.quantity <= (product.min_stock_alert || 5)) {
      return { label: 'Low Stock', color: 'bg-amber-50 text-amber-700', icon: AlertTriangle };
    } else {
      return { label: 'In Stock', color: 'bg-emerald-50 text-emerald-700', icon: CheckCircle };
    }
  };

  const formatPrice = (price) => `Tsh ${Number(price || 0).toLocaleString()}`;

  // Calculate stats
  const inStockCount = products.filter(p => p.quantity > 0).length;
  const lowStockCount = products.filter(p => p.quantity > 0 && p.quantity <= (p.min_stock_alert || 5)).length;
  const outOfStockCount = products.filter(p => p.quantity <= 0).length;
  const featuredCount = products.filter(p => p.is_featured).length;

  const statCards = [
    {
      title: "Total Products",
      value: pagination.total,
      subValue: `${featuredCount} Featured`,
      icon: Package,
      color: "text-emerald-600",
      bg: "bg-emerald-50"
    },
    {
      title: "Stock Status",
      value: `${inStockCount} / ${lowStockCount} / ${outOfStockCount}`,
      subValue: "In / Low / Out",
      icon: ShoppingBag,
      color: "text-amber-600",
      bg: "bg-amber-50"
    },
    {
      title: "Active Products",
      value: products.filter(p => p.is_active).length,
      subValue: `${products.filter(p => !p.is_active).length} Inactive`,
      icon: Activity,
      color: "text-blue-600",
      bg: "bg-blue-50"
    }
  ];

  const getStatusBadge = (isActive) => {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
        isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-50 text-gray-600'
      }`}>
        {isActive ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
        {isActive ? 'Active' : 'Inactive'}
      </span>
    );
  };

  const getFeaturedBadge = (isFeatured) => {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
        isFeatured ? 'bg-yellow-50 text-yellow-700' : 'bg-gray-50 text-gray-500'
      }`}>
        <Star className="w-3 h-3" />
        {isFeatured ? 'Featured' : 'Not Featured'}
      </span>
    );
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setStockFilter("all");
    setShowFilters(false);
    showToast('Filters cleared', 'info');
  };

  const hasActiveFilters = search || statusFilter !== 'all' || stockFilter !== 'all';

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
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gray-200 rounded-xl animate-pulse"></div>
                <div className="h-7 bg-gray-200 rounded w-48 animate-pulse"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-64 animate-pulse ml-12"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {[1, 2, 3].map(i => <SkeletonStatCard key={i} />)}
            </div>
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <div className="h-10 bg-gray-200 rounded-lg animate-pulse"></div>
              </div>
              <div className="hidden lg:block">
                {[1, 2, 3, 4, 5].map(i => <SkeletonProductRow key={i} />)}
              </div>
              <div className="lg:hidden">
                {[1, 2, 3, 4].map(i => <SkeletonProductCard key={i} />)}
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
                <Package className="w-5 h-5 text-[#5C352C]" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Product Management</h1>
            </div>
            <p className="text-sm text-gray-500 ml-11">Manage all products across the marketplace</p>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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

          {/* Search Bar */}
          <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6">
            <div className="flex flex-wrap gap-3">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search products by name..."
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
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-[#5C352C]"
              >
                <option value="all">All Stock</option>
                <option value="in_stock">In Stock</option>
                <option value="low_stock">Low Stock</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
              
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
              Showing <span className="font-medium text-gray-700">{products.length}</span> of{' '}
              <span className="font-medium text-gray-700">{pagination.total}</span> products
            </p>
          </div>

          {/* Products Display */}
          {error ? (
            <div className="bg-white rounded-xl border border-red-100 p-8 text-center">
              <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-3" />
              <p className="text-red-600 text-sm">{error}</p>
              <button onClick={() => fetchProducts(1)} className="mt-3 text-sm text-[#5C352C] hover:underline">
                Try again
              </button>
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-medium text-gray-900 mb-1">No Products Found</h3>
              <p className="text-sm text-gray-500">
                {hasActiveFilters ? "Try adjusting your filters" : "No products available"}
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
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Product</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Seller</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Price</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Stock</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Featured</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {products.map((product) => {
                      const stockStatus = getStockStatus(product);
                      const StockIcon = stockStatus.icon;
                      const hasImageError = imageErrors[product.id];
                      
                      return (
                        <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                                {product.image && !hasImageError ? (
                                  <img 
                                    src={product.image} 
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                    onError={() => handleImageError(product.id)}
                                    loading="lazy"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <ImageIcon className="w-4 h-4 text-gray-400" />
                                  </div>
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-sm text-gray-900 truncate max-w-[200px]">{product.name}</p>
                                {product.description && (
                                  <p className="text-xs text-gray-500 truncate max-w-[180px]">{product.description}</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5">
                              <Store className="w-3.5 h-3.5 text-gray-400" />
                              <span className="text-sm text-gray-700">{product.seller?.name || 'N/A'}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-semibold text-[#5C352C] text-sm">{formatPrice(product.price)}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5">
                              <StockIcon className={`w-3.5 h-3.5 ${stockStatus.color.split(' ')[2]}`} />
                              <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${stockStatus.color}`}>
                                {stockStatus.label}
                              </span>
                              <span className="text-xs text-gray-400">({product.quantity})</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {getStatusBadge(product.is_active)}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => handleToggleFeatured(product.id, product.is_featured, product.name)}
                              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                                product.is_featured 
                                  ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100' 
                                  : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                              }`}
                            >
                              <Star className="w-3 h-3" />
                              {product.is_featured ? 'Featured' : 'Not Featured'}
                            </button>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-1">
                              <Link to={`/admin/products/${product.id}`}>
                                <button className="p-1.5 text-gray-500 hover:text-[#5C352C] hover:bg-gray-100 rounded-lg transition-colors">
                                  <Eye className="w-4 h-4" />
                                </button>
                              </Link>
                              <Link to={`/admin/products/${product.id}/edit`}>
                                <button className="p-1.5 text-gray-500 hover:text-[#5C352C] hover:bg-gray-100 rounded-lg transition-colors">
                                  <Edit className="w-4 h-4" />
                                </button>
                              </Link>
                              <button
                                onClick={() => handleToggleStatus(product.id, product.is_active, product.name)}
                                className="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                title={product.is_active ? "Deactivate" : "Activate"}
                              >
                                <Power className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(product.id, product.name)}
                                className="p-1.5 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                title="Delete"
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

              {/* Mobile Cards */}
              <div className="lg:hidden space-y-3">
                {products.map((product) => {
                  const stockStatus = getStockStatus(product);
                  const StockIcon = stockStatus.icon;
                  const hasImageError = imageErrors[product.id];
                  
                  return (
                    <div key={product.id} className="bg-white rounded-xl border border-gray-100 p-4">
                      <div className="flex gap-3 mb-3">
                        <div className="w-14 h-14 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                          {product.image && !hasImageError ? (
                            <img 
                              src={product.image} 
                              alt={product.name}
                              className="w-full h-full object-cover"
                              onError={() => handleImageError(product.id)}
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon className="w-5 h-5 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h3 className="font-semibold text-sm text-gray-900">{product.name}</h3>
                            <div className="flex gap-1">
                              <Link to={`/admin/products/${product.id}`}>
                                <button className="p-1.5 text-gray-500 hover:text-[#5C352C] rounded-lg">
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                              </Link>
                              <Link to={`/admin/products/${product.id}/edit`}>
                                <button className="p-1.5 text-gray-500 hover:text-[#5C352C] rounded-lg">
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                              </Link>
                            </div>
                          </div>
                          {product.description && (
                            <p className="text-xs text-gray-500 mt-1 line-clamp-1">{product.description}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-y-2 gap-x-3 text-sm mb-3">
                        <div>
                          <p className="text-xs text-gray-400">Seller</p>
                          <p className="text-xs font-medium text-gray-700 flex items-center gap-1">
                            <Store className="w-3 h-3" />
                            {product.seller?.name || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Price</p>
                          <p className="text-sm font-bold text-[#5C352C]">{formatPrice(product.price)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Stock</p>
                          <div className="flex items-center gap-1">
                            <StockIcon className="w-3 h-3" />
                            <span className={`text-xs font-medium ${stockStatus.color.split(' ')[2]}`}>
                              {stockStatus.label}
                            </span>
                            <span className="text-xs text-gray-400">({product.quantity})</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Status</p>
                          {getStatusBadge(product.is_active)}
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                        <button
                          onClick={() => handleToggleFeatured(product.id, product.is_featured, product.name)}
                          className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-lg ${
                            product.is_featured 
                              ? 'bg-yellow-50 text-yellow-700' 
                              : 'bg-gray-50 text-gray-500'
                          }`}
                        >
                          <Star className="w-3 h-3" />
                          {product.is_featured ? 'Featured' : 'Not Featured'}
                        </button>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleToggleStatus(product.id, product.is_active, product.name)}
                            className="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          >
                            <Power className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id, product.name)}
                            className="p-1.5 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {pagination.last_page > 1 && (
                <nav className="mt-6 flex justify-center">
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => fetchProducts(pagination.current_page - 1)}
                      disabled={pagination.current_page === 1}
                      className="p-2 border border-gray-200 rounded-lg disabled:opacity-50 hover:border-[#5C352C] hover:text-[#5C352C] transition-colors"
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
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => fetchProducts(pagination.current_page + 1)}
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

export default ProductManagement;
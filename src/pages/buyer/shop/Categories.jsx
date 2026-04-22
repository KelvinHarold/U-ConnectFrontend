import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import MainLayout from "../../../layouts/MainLayout";
import api from "../../../api/axios";
import { useToast } from "../../../contexts/ToastContext";
import { useLanguage } from "../../../contexts/LanguageContext";
import { 
  Package, 
  RefreshCw, 
  FolderOpen, 
  ChevronRight, 
  Image as ImageIcon,
  TrendingUp,
  Star,
  Layers,
  AlertTriangle,
  Search,
  X,
  ShoppingBag,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  Sparkles,
  Award,
  Zap,
  Grid,
  List,
  Clock,
  Shield,
  Tag
} from "lucide-react";

// ==================== ENHANCED SKELETON LOADERS ====================
const SkeletonCategoryCard = () => (
  <div className="animate-pulse">
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="relative w-full pt-[100%] bg-gradient-to-br from-gray-200 to-gray-300"></div>
      <div className="p-3 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        <div className="flex gap-2">
          <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
          <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
          <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    </div>
  </div>
);

const SkeletonCategoriesGrid = ({ count = 12 }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
    {[...Array(count)].map((_, i) => (
      <SkeletonCategoryCard key={i} />
    ))}
  </div>
);

// ==================== MAIN COMPONENT ====================
const Categories = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageErrors, setImageErrors] = useState({});
  const [productImageErrors, setProductImageErrors] = useState({});
  const [isMobile, setIsMobile] = useState(false);
  const [stats, setStats] = useState({ total_categories: 0, total_products: 0 });
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [perPage, setPerPage] = useState(6);

  // Refs for keyboard navigation
  const searchInputRef = useRef(null);
  const refreshButtonRef = useRef(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    fetchParentCategories();
    fetchStats();
  }, [currentPage, searchTerm]);

  const fetchParentCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/buyer/shop/categories/parent', {
        params: {
          page: currentPage,
          per_page: perPage,
          search: searchTerm || undefined
        }
      });
      
      setCategories(response.data.data || response.data);
      setCurrentPage(response.data.current_page || 1);
      setLastPage(response.data.last_page || 1);
      setTotal(response.data.total || 0);
      setPerPage(response.data.per_page || 6);
      
      setImageErrors({});
      setProductImageErrors({});
      
      announceToScreenReader(t('buyer.categories.foundCategories', { count: response.data.total || 0, ies: total !== 1 ? 'ies' : 'y' }));
    } catch (error) {
      console.error('Error fetching parent categories:', error);
      const errorMsg = error.response?.data?.message || t('buyer.categories.failedToLoad');
      setError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/buyer/shop/categories/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      showToast(t('buyer.categories.failedToLoad'), 'error');
    }
  };

  const announceToScreenReader = (message) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    document.body.appendChild(announcement);
    setTimeout(() => announcement.remove(), 3000);
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setShowSearch(false);
    setCurrentPage(1);
    showToast(t('buyer.categories.searchCleared'), 'info');
    announceToScreenReader(t('buyer.categories.searchCleared'));
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= lastPage) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      announceToScreenReader(t('buyer.categories.pageChanged', { current: newPage, total: lastPage }));
    }
  };

  const handleKeyPress = useCallback((event, callback) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      callback();
    }
  }, []);

  const handleImageError = (categoryId) => {
    setImageErrors(prev => ({ ...prev, [categoryId]: true }));
  };

  const handleProductImageError = (productId) => {
    setProductImageErrors(prev => ({ ...prev, [productId]: true }));
  };

  const formatPrice = (price) => {
    return `Tsh ${Number(price).toLocaleString('en-US')}`;
  };

  const refreshCategories = () => {
    setCurrentPage(1);
    fetchParentCategories();
    announceToScreenReader(t('buyer.categories.refreshingCategories'));
  };

  const getPaginationPages = () => {
    const pages = [];
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(lastPage, startPage + maxVisible - 1);
    
    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="p-4 md:p-8">
          
          {/* Enhanced Header with Stats */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 bg-gradient-to-br from-[#5C352C] to-[#8B5E4F] rounded-xl shadow-lg">
                    <FolderOpen className="w-5 h-5 text-white" aria-hidden="true" />
                  </div>
                  <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#5C352C] to-[#8B5E4F] bg-clip-text text-transparent">
                    {t('buyer.categories.title')}
                  </h1>
                </div>
                <p className="text-gray-500 text-sm ml-11">{t('buyer.categories.subtitle')}</p>
              </div>
              <div className="flex items-center gap-3">
                {/* Search Toggle Button for Mobile */}
                {isMobile && !showSearch && (
                  <button
                    onClick={() => {
                      setShowSearch(true);
                      setTimeout(() => searchInputRef.current?.focus(), 100);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-all text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#5C352C]"
                    aria-label={t('buyer.categories.openSearch')}
                  >
                    <Search className="w-4 h-4" aria-hidden="true" />
                    {t('buyer.categories.search')}
                  </button>
                )}
                
                {/* View Mode Toggle */}
                {!isMobile && (
                  <div className="flex border-2 border-gray-200 rounded-xl overflow-hidden bg-white" role="group" aria-label={t('buyer.categories.gridView')}>
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-2 px-4 transition-all text-sm focus:outline-none focus:ring-2 focus:ring-[#5C352C] ${
                        viewMode === "grid" ? "bg-gradient-to-r from-[#5C352C] to-[#8B5E4F] text-white" : "text-gray-600"
                      }`}
                      aria-label={t('buyer.categories.gridView')}
                      aria-pressed={viewMode === "grid"}
                    >
                      <Grid className="w-4 h-4" aria-hidden="true" />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-2 px-4 transition-all text-sm focus:outline-none focus:ring-2 focus:ring-[#5C352C] ${
                        viewMode === "list" ? "bg-gradient-to-r from-[#5C352C] to-[#8B5E4F] text-white" : "text-gray-600"
                      }`}
                      aria-label={t('buyer.categories.listView')}
                      aria-pressed={viewMode === "list"}
                    >
                      <List className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                )}
                
                <div 
                  className="bg-white px-4 py-2 rounded-xl shadow-md border border-gray-100"
                  role="status"
                  aria-label={t('buyer.categories.statsAria', { categories: stats.total_categories, products: stats.total_products })}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                      <span className="text-sm font-semibold text-gray-700">{stats.total_categories}</span>
                      <span className="text-xs text-gray-500">{t('buyer.categories.categories')}</span>
                    </div>
                    <div className="w-px h-4 bg-gray-200"></div>
                    <div className="flex items-center gap-1">
                      <Package className="w-4 h-4 text-[#5C352C]" aria-hidden="true" />
                      <span className="text-sm font-semibold text-gray-700">{stats.total_products}</span>
                      <span className="text-xs text-gray-500">{t('buyer.categories.products')}</span>
                    </div>
                  </div>
                </div>
                <button
                  ref={refreshButtonRef}
                  onClick={refreshCategories}
                  className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 hover:border-[#5C352C] transition-all text-sm font-medium shadow-md focus:outline-none focus:ring-2 focus:ring-[#5C352C]"
                  aria-label={t('buyer.categories.refresh')}
                  onKeyPress={(e) => handleKeyPress(e, refreshCategories)}
                >
                  <RefreshCw className="w-4 h-4" aria-hidden="true" />
                  {t('buyer.categories.refresh')}
                </button>
              </div>
            </div>

            {/* Enhanced Search Bar */}
            {(showSearch || !isMobile) && (
              <div className="mt-6">
                <div className="relative max-w-md">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
                  <label htmlFor="category-search" className="sr-only">{t('buyer.categories.searchPlaceholder')}</label>
                  <input
                    id="category-search"
                    ref={searchInputRef}
                    type="text"
                    placeholder={t('buyer.categories.searchPlaceholder')}
                    value={searchTerm}
                    onChange={handleSearch}
                    className="w-full pl-11 pr-10 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#5C352C] focus:ring-2 focus:ring-[#5C352C]/20 transition-all text-sm bg-white shadow-sm"
                    aria-label={t('buyer.categories.searchPlaceholder')}
                  />
                  {searchTerm && (
                    <button
                      onClick={clearSearch}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 rounded-full p-1"
                      aria-label={t('buyer.categories.clearSearch')}
                    >
                      <X className="w-4 h-4" aria-hidden="true" />
                    </button>
                  )}
                </div>
                
                {/* Enhanced Search Results Count */}
                {searchTerm && (
                  <div 
                    className="mt-2 text-sm text-gray-500 bg-white px-4 py-2 rounded-lg inline-block shadow-sm"
                    role="status"
                    aria-live="polite"
                  >
                    {total === 1 
                      ? t('buyer.categories.foundCategory', { count: total })
                      : t('buyer.categories.foundCategories', { count: total, ies: 'ies' })
                    } "<span className="font-semibold">{searchTerm}</span>"
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Loading State */}
          {loading ? (
            <SkeletonCategoriesGrid count={12} />
          ) : error ? (
            <div 
              className="bg-rose-50 border-2 border-rose-200 rounded-2xl p-10 text-center shadow-lg"
              role="alert"
              aria-live="polite"
            >
              <AlertTriangle className="w-16 h-16 text-rose-500 mx-auto mb-4" aria-hidden="true" />
              <h3 className="text-xl font-bold text-rose-800 mb-2">{t('buyer.categories.errorLoading')}</h3>
              <p className="text-rose-600 text-sm mb-5">{error}</p>
              <button 
                onClick={() => {
                  setCurrentPage(1);
                  fetchParentCategories();
                }} 
                className="px-6 py-2.5 bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-xl hover:shadow-lg transition-all text-sm font-bold focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
                aria-label={t('buyer.categories.tryAgain')}
              >
                {t('buyer.categories.tryAgain')}
              </button>
            </div>
          ) : categories.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 p-12 text-center">
              {searchTerm ? (
                <>
                  <Search className="w-20 h-20 mx-auto mb-4 text-gray-300" aria-hidden="true" />
                  <h3 className="text-xl font-bold text-gray-700 mb-2">{t('buyer.categories.noCategoriesFound')}</h3>
                  <p className="text-gray-500 text-sm mb-5">{t('buyer.categories.noCategoriesMatch')} "{searchTerm}"</p>
                  <button 
                    onClick={clearSearch}
                    className="px-6 py-2.5 bg-gradient-to-r from-[#5C352C] to-[#8B5E4F] text-white rounded-xl hover:shadow-lg transition-all text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#5C352C] focus:ring-offset-2"
                    aria-label={t('buyer.categories.clearSearchButton')}
                  >
                    {t('buyer.categories.clearSearchButton')}
                  </button>
                </>
              ) : (
                <>
                  <Package className="w-20 h-20 mx-auto mb-4 text-gray-300" aria-hidden="true" />
                  <h3 className="text-xl font-bold text-gray-700 mb-2">{t('buyer.categories.noCategoriesFound')}</h3>
                  <p className="text-gray-500 text-sm">{t('buyer.categories.noCategoriesMessage')}</p>
                </>
              )}
            </div>
          ) : (
            <>
              {/* Enhanced Category Grid */}
              <div 
                className={`grid gap-4 ${
                  viewMode === "grid" 
                    ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6" 
                    : "grid-cols-1"
                }`}
                role="list"
                aria-label={t('buyer.categories.categories')}
              >
                {categories.map((category) => (
                  <Link 
                    key={category.id} 
                    to={`/buyer/shop/categories/${category.id}/subcategories`}
                    className="group block focus:outline-none focus:ring-2 focus:ring-[#5C352C] focus:ring-offset-2 rounded-xl transform transition-all duration-300 hover:scale-105"
                    aria-label={t('buyer.categories.viewCategory', { 
                      name: category.name, 
                      subcategories: category.subcategories_count || 0,
                      products: category.products_count || 0
                    })}
                  >
                    <div className="bg-white rounded-xl shadow-lg border-2 border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 h-full group-hover:border-[#5C352C]/20">
                      
                      {/* Enhanced Category Image - Fixed Square Aspect Ratio */}
                      <div className="relative w-full pt-[100%] bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                        <div className="absolute inset-0">
                          {category.image && !imageErrors[category.id] ? (
                            <img 
                              src={category.image} 
                              alt={t('buyer.categories.categoryImageAlt', { name: category.name })}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              onError={() => handleImageError(category.id)}
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                              <ImageIcon className="w-12 h-12 text-gray-400" aria-hidden="true" />
                            </div>
                          )}
                        </div>
                        
                        {/* Enhanced Overlay Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        
                        {/* Enhanced Category Badges */}
                        <div className="absolute top-2 right-2 flex gap-1 z-10">
                          <div className="px-2 py-1 text-[10px] font-bold rounded-lg bg-white/95 backdrop-blur-sm text-[#5C352C] shadow-md flex items-center gap-1">
                            <Layers className="w-2.5 h-2.5" />
                            {category.subcategories_count || 0} {t('buyer.categories.subcategories')}
                          </div>
                        </div>
                        
                        {/* Products Count Overlay */}
                        <div className="absolute bottom-2 left-2 z-10">
                          <div className="px-2 py-1 text-[10px] font-bold rounded-lg bg-black/70 backdrop-blur-sm text-white shadow-md flex items-center gap-1">
                            <Package className="w-2.5 h-2.5" />
                            {category.products_count || 0} {t('buyer.categories.productsCount')}
                          </div>
                        </div>
                      </div>
                      
                      {/* Enhanced Category Info */}
                      <div className="p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h2 className="font-bold text-gray-900 text-sm group-hover:text-[#5C352C] transition-colors truncate">
                              {category.name}
                            </h2>
                          </div>
                          <div className="bg-gradient-to-r from-[#5C352C] to-[#8B5E4F] rounded-full p-1.5 group-hover:scale-110 transition-all flex-shrink-0 shadow-md">
                            <ChevronRight className="w-3 h-3 text-white" aria-hidden="true" />
                          </div>
                        </div>
                        
                        {category.description && (
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {category.description.length > 60 ? category.description.substring(0, 60) + '...' : category.description}
                          </p>
                        )}
                        
                        {/* Enhanced Popular Products Preview */}
                        {category.popular_products && category.popular_products.length > 0 && (
                          <div className="mt-3">
                            <div className="flex items-center gap-1 mb-1.5">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" aria-hidden="true" />
                              <span className="text-[10px] font-semibold text-gray-600">{t('buyer.categories.popularProducts')}</span>
                            </div>
                            <div className="flex gap-2" role="list" aria-label={t('buyer.categories.popularProducts')}>
                              {category.popular_products.slice(0, 3).map((product, idx) => (
                                <div 
                                  key={idx} 
                                  className="relative group/product"
                                  role="listitem"
                                >
                                  <div className="w-10 h-10 rounded-lg overflow-hidden border-2 border-gray-200 hover:border-[#5C352C] transition-all shadow-sm">
                                    {product.image && !productImageErrors[product.id] ? (
                                      <img 
                                        src={product.image} 
                                        alt={t('buyer.categories.productImageAlt', { name: product.name })}
                                        className="w-full h-full object-cover cursor-pointer"
                                        onError={() => handleProductImageError(product.id)}
                                        onClick={(e) => {
                                          e.preventDefault();
                                          navigate(`/buyer/shop/products/${product.id}`);
                                        }}
                                        loading="lazy"
                                      />
                                    ) : (
                                      <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                        <ShoppingBag className="w-4 h-4 text-gray-400" aria-hidden="true" />
                                      </div>
                                    )}
                                  </div>
                                  {/* Tooltip */}
                                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 hidden group-hover/product:block z-10">
                                    <div className="bg-gray-900 text-white text-[10px] rounded-lg px-2 py-1 whitespace-nowrap shadow-lg">
                                      {product.name.length > 20 ? product.name.substring(0, 20) + '...' : product.name}
                                    </div>
                                  </div>
                                </div>
                              ))}
                              {category.popular_products.length > 3 && (
                                <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center border-2 border-gray-200">
                                  <span className="text-[10px] font-bold text-gray-500">
                                    +{category.popular_products.length - 3}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {/* Highlight search match */}
                        {searchTerm && (
                          <div className="mt-2 text-[10px] text-[#5C352C] font-semibold flex items-center gap-1">
                            <Zap className="w-2.5 h-2.5" />
                            {t('buyer.categories.matchesSearch')}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Enhanced Pagination Component */}
              {lastPage > 1 && (
                <nav 
                  className="mt-10 flex justify-center items-center gap-3"
                  role="navigation"
                  aria-label={t('buyer.categories.goToPage', { page: '' })}
                >
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-[#5C352C] ${
                      currentPage === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-[#5C352C] shadow-md'
                    }`}
                    aria-label={t('buyer.categories.goToPreviousPage')}
                    aria-disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                  </button>
                  
                  <div className="flex items-center gap-2">
                    {getPaginationPages().map(page => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-[#5C352C] ${
                          currentPage === page
                            ? 'bg-gradient-to-r from-[#5C352C] to-[#8B5E4F] text-white shadow-lg'
                            : 'bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-[#5C352C]'
                        }`}
                        aria-label={t('buyer.categories.goToPage', { page })}
                        aria-current={currentPage === page ? 'page' : undefined}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === lastPage}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-[#5C352C] ${
                      currentPage === lastPage
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-[#5C352C] shadow-md'
                    }`}
                    aria-label={t('buyer.categories.goToNextPage')}
                    aria-disabled={currentPage === lastPage}
                  >
                    <ChevronRightIcon className="w-4 h-4" aria-hidden="true" />
                  </button>
                </nav>
              )}

              {/* Enhanced Showing results info */}
              <div 
                className="mt-4 text-center text-sm text-gray-500 bg-white px-4 py-2 rounded-lg inline-block mx-auto shadow-sm"
                role="status"
                aria-live="polite"
              >
                {t('buyer.categories.showing')} <span className="font-semibold text-[#5C352C]">{categories.length}</span> {t('buyer.categories.of')} <span className="font-semibold">{total}</span> {total === 1 ? t('buyer.categories.category') : t('buyer.categories.categories')}
                {searchTerm && ` ${t('buyer.categories.matchesSearch').toLowerCase().replace('matches search', '')}"${searchTerm}"`}
              </div>

              {/* Enhanced Quick Tips Section */}
              <div className="mt-8 bg-gradient-to-r from-[#5C352C] via-[#7A4B3A] to-[#8B5E4F] rounded-xl p-5 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center shadow-lg">
                      <Layers className="w-5 h-5" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base">{t('buyer.categories.cantFindWhatLookingFor')}</h3>
                      <p className="text-white/90 text-xs">{t('buyer.categories.browseAllProducts')}</p>
                    </div>
                  </div>
                  <Link 
                    to="/buyer/shop/products" 
                    className="px-5 py-2 bg-white text-[#5C352C] rounded-xl font-bold hover:shadow-lg transition-all text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#5C352C]"
                    aria-label={t('buyer.categories.browseAllProductsButton')}
                  >
                    {t('buyer.categories.browseAllProductsButton')}
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Categories;
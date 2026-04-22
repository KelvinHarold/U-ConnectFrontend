import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import MainLayout from "../../../layouts/MainLayout";
import api from "../../../api/axios";
import { useToast } from "../../../contexts/ToastContext";
import { useLanguage } from "../../../contexts/LanguageContext";
import { 
  Package, 
  RefreshCw, 
  FolderOpen, 
  ChevronRight, 
  ArrowLeft, 
  Image as ImageIcon,
  Search,
  X,
  TrendingUp,
  Star,
  Layers,
  AlertTriangle,
  Grid,
  ChevronLeft,
  Sparkles,
  Award,
  Zap,
  Clock,
  Shield,
  Tag,
  Heart,
  Eye
} from "lucide-react";

// ==================== ENHANCED SKELETON LOADERS ====================
const SkeletonSubcategoryCard = () => (
  <div className="animate-pulse">
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="relative w-full pt-[100%] bg-gradient-to-br from-gray-200 to-gray-300"></div>
      <div className="p-3 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        <div className="pt-2 border-t border-gray-100">
          <div className="h-3 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="flex gap-2">
            <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
            <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
            <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const SkeletonSubcategoriesGrid = ({ count = 12 }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
    {[...Array(count)].map((_, i) => (
      <SkeletonSubcategoryCard key={i} />
    ))}
  </div>
);

// ==================== MAIN COMPONENT ====================
const Subcategories = () => {
  const { id } = useParams();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [parentCategory, setParentCategory] = useState(null);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageErrors, setImageErrors] = useState({});
  const [isMobile, setIsMobile] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [stats, setStats] = useState({ total_products: 0 });
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [perPage, setPerPage] = useState(6);

  // Refs for keyboard navigation
  const searchInputRef = useRef(null);
  const refreshButtonRef = useRef(null);
  const backLinkRef = useRef(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    fetchSubcategories();
  }, [id, currentPage, searchTerm]);

  const fetchSubcategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/buyer/shop/categories/${id}/subcategories`, {
        params: {
          page: currentPage,
          per_page: perPage,
          search: searchTerm || undefined
        }
      });
      
      setParentCategory(response.data.parent_category);
      
      const subcategoriesData = response.data.subcategories.data || response.data.subcategories;
      setSubcategories(subcategoriesData);
      setCurrentPage(response.data.subcategories.current_page || 1);
      setLastPage(response.data.subcategories.last_page || 1);
      setTotal(response.data.subcategories.total || 0);
      setPerPage(response.data.subcategories.per_page || 6);
      
      const totalProducts = subcategoriesData.reduce((sum, cat) => sum + (cat.products_count || 0), 0);
      setStats({ total_products: totalProducts });
      
      setImageErrors({});
      announceToScreenReader(t('buyer.subcategories.statsAria', { 
        total, 
        products: totalProducts, 
        category: response.data.parent_category?.name 
      }));
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      const errorMsg = error.response?.data?.message || t('buyer.subcategories.failedToLoad');
      setError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
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
    showToast(t('buyer.subcategories.searchCleared'), 'info');
    announceToScreenReader(t('buyer.subcategories.searchCleared'));
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= lastPage) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      announceToScreenReader(t('buyer.subcategories.pageChanged', { current: newPage, total: lastPage }));
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

  const getCategoryIcon = (categoryName) => {
    const icons = {
      'Electronics': '📱',
      'Fashion': '👕',
      'Home': '🏠',
      'Books': '📚',
      'Sports': '⚽',
      'Toys': '🧸',
      'Beauty': '💄',
      'Food': '🍕',
      'Clothing': '👔',
      'Accessories': '💍',
      'Furniture': '🪑',
      'Gadgets': '📱',
    };
    return icons[categoryName] || '📦';
  };

  const refreshSubcategories = () => {
    setCurrentPage(1);
    fetchSubcategories();
    announceToScreenReader(t('buyer.subcategories.refreshingSubcategories'));
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

  if (loading && !parentCategory) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="p-4 md:p-8">
            <div className="mb-6">
              <div className="h-5 w-20 bg-gray-200 rounded animate-pulse mb-3"></div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-gray-200 rounded-xl"></div>
                <div className="h-6 w-40 bg-gray-200 rounded"></div>
              </div>
            </div>
            <SkeletonSubcategoriesGrid count={12} />
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="p-4 md:p-8">
          
          {/* Enhanced Back Button */}
          <Link 
            ref={backLinkRef}
            to="/buyer/shop/categories" 
            className="inline-flex items-center gap-2 text-[#5C352C] hover:text-[#4A2A22] transition-colors mb-4 group text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#5C352C] rounded-lg px-2 py-1"
            aria-label={t('buyer.subcategories.goBackToCategories')}
            onKeyPress={(e) => handleKeyPress(e, () => window.location.href = '/buyer/shop/categories')}
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" aria-hidden="true" />
            <span>{t('buyer.subcategories.backToCategories')}</span>
          </Link>

          {/* Enhanced Parent Category Header */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 bg-gradient-to-br from-[#5C352C] to-[#8B5E4F] rounded-xl shadow-lg">
                    <FolderOpen className="w-5 h-5 text-white" aria-hidden="true" />
                  </div>
                  <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#5C352C] to-[#8B5E4F] bg-clip-text text-transparent">
                    {parentCategory?.name}
                  </h1>
                </div>
                {parentCategory?.description && (
                  <p className="text-gray-500 text-sm ml-11">{parentCategory.description}</p>
                )}
              </div>
              
              <div className="flex items-center gap-3">
                <div 
                  className="bg-white px-4 py-2 rounded-xl shadow-md border border-gray-100"
                  role="status"
                  aria-label={t('buyer.subcategories.statsAria', { 
                    total, 
                    products: stats.total_products, 
                    category: parentCategory?.name 
                  })}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Layers className="w-4 h-4 text-[#5C352C]" aria-hidden="true" />
                      <span className="text-sm font-semibold text-gray-700">{total}</span>
                      <span className="text-xs text-gray-500">{t('buyer.subcategories.subs')}</span>
                    </div>
                    <div className="w-px h-4 bg-gray-200"></div>
                    <div className="flex items-center gap-1">
                      <Package className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                      <span className="text-sm font-semibold text-gray-700">{stats.total_products}</span>
                      <span className="text-xs text-gray-500">{t('buyer.subcategories.products')}</span>
                    </div>
                  </div>
                </div>
                <button
                  ref={refreshButtonRef}
                  onClick={refreshSubcategories}
                  className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 hover:border-[#5C352C] transition-all text-sm font-medium shadow-md focus:outline-none focus:ring-2 focus:ring-[#5C352C]"
                  aria-label={t('buyer.subcategories.refresh')}
                  onKeyPress={(e) => handleKeyPress(e, refreshSubcategories)}
                >
                  <RefreshCw className="w-4 h-4" aria-hidden="true" />
                  {t('buyer.subcategories.refresh')}
                </button>
              </div>
            </div>

            {/* Enhanced Search Bar */}
            {(showSearch || !isMobile) && (
              <div className="mt-6">
                <div className="relative max-w-md">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
                  <label htmlFor="subcategory-search" className="sr-only">{t('buyer.subcategories.searchSubcategories')}</label>
                  <input
                    id="subcategory-search"
                    ref={searchInputRef}
                    type="text"
                    placeholder={t('buyer.subcategories.searchPlaceholder', { category: parentCategory?.name || '' })}
                    value={searchTerm}
                    onChange={handleSearch}
                    className="w-full pl-11 pr-10 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#5C352C] focus:ring-2 focus:ring-[#5C352C]/20 transition-all text-sm bg-white shadow-sm"
                    aria-label={t('buyer.subcategories.searchSubcategories')}
                  />
                  {searchTerm && (
                    <button
                      onClick={clearSearch}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 rounded-full p-1"
                      aria-label={t('buyer.subcategories.clearSearch')}
                    >
                      <X className="w-4 h-4" aria-hidden="true" />
                    </button>
                  )}
                </div>
                
                {searchTerm && (
                  <div 
                    className="mt-2 text-sm text-gray-500 bg-white px-4 py-2 rounded-lg inline-block shadow-sm"
                    role="status"
                    aria-live="polite"
                  >
                    {total === 1 
                      ? t('buyer.subcategories.foundSubcategory', { count: total })
                      : t('buyer.subcategories.foundSubcategories', { count: total, ies: 'ies' })
                    } "<span className="font-semibold">{searchTerm}</span>"
                  </div>
                )}
              </div>
            )}

            {/* Mobile Search Toggle */}
            {isMobile && !showSearch && (
              <button
                onClick={() => {
                  setShowSearch(true);
                  setTimeout(() => searchInputRef.current?.focus(), 100);
                }}
                className="mt-4 flex items-center gap-2 px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-all w-full justify-center text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-[#5C352C]"
                aria-label={t('buyer.subcategories.openSearch')}
              >
                <Search className="w-4 h-4" aria-hidden="true" />
                {t('buyer.subcategories.searchSubcategories')}
              </button>
            )}
          </div>

          {/* Loading State */}
          {loading ? (
            <SkeletonSubcategoriesGrid count={12} />
          ) : error ? (
            <div 
              className="bg-rose-50 border-2 border-rose-200 rounded-2xl p-10 text-center shadow-lg"
              role="alert"
              aria-live="polite"
            >
              <AlertTriangle className="w-16 h-16 text-rose-500 mx-auto mb-4" aria-hidden="true" />
              <h3 className="text-xl font-bold text-rose-800 mb-2">{t('buyer.subcategories.errorLoading')}</h3>
              <p className="text-rose-600 text-sm mb-5">{error}</p>
              <button 
                onClick={() => {
                  setCurrentPage(1);
                  fetchSubcategories();
                }} 
                className="px-6 py-2.5 bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-xl hover:shadow-lg transition-all text-sm font-bold focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
                aria-label={t('buyer.subcategories.tryAgain')}
              >
                {t('buyer.subcategories.tryAgain')}
              </button>
            </div>
          ) : subcategories.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 p-12 text-center">
              {searchTerm ? (
                <>
                  <Search className="w-20 h-20 mx-auto mb-4 text-gray-300" aria-hidden="true" />
                  <h3 className="text-xl font-bold text-gray-700 mb-2">{t('buyer.subcategories.noSubcategoriesFound')}</h3>
                  <p className="text-gray-500 text-sm mb-5">{t('buyer.subcategories.noSubcategoriesMatch')} "{searchTerm}"</p>
                  <button 
                    onClick={clearSearch}
                    className="px-6 py-2.5 bg-gradient-to-r from-[#5C352C] to-[#8B5E4F] text-white rounded-xl hover:shadow-lg transition-all text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#5C352C] focus:ring-offset-2"
                    aria-label={t('buyer.subcategories.clearSearchButton')}
                  >
                    {t('buyer.subcategories.clearSearchButton')}
                  </button>
                </>
              ) : (
                <>
                  <Package className="w-20 h-20 mx-auto mb-4 text-gray-300" aria-hidden="true" />
                  <h3 className="text-xl font-bold text-gray-700 mb-2">{t('buyer.subcategories.noSubcategoriesFound')}</h3>
                  <p className="text-gray-500 text-sm">{t('buyer.subcategories.noSubcategoriesMessage')}</p>
                </>
              )}
            </div>
          ) : (
            <>
              {/* Enhanced Subcategories Grid */}
              <div 
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
                role="list"
                aria-label={t('buyer.subcategories.subcategories')}
              >
                {subcategories.map((subcategory) => (
                  <Link 
                    key={subcategory.id} 
                    to={`/buyer/shop/categories/${subcategory.id}/products`}
                    className="group block focus:outline-none focus:ring-2 focus:ring-[#5C352C] focus:ring-offset-2 rounded-xl transform transition-all duration-300 hover:scale-105"
                    aria-label={t('buyer.subcategories.viewSubcategory', { 
                      name: subcategory.name, 
                      products: subcategory.products_count || 0 
                    })}
                  >
                    <div className="bg-white rounded-xl shadow-lg border-2 border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 h-full group-hover:border-[#5C352C]/20">
                      
                      {/* Enhanced Category Image - Fixed Square Aspect Ratio */}
                      <div className="relative w-full pt-[100%] bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                        <div className="absolute inset-0">
                          {subcategory.image && !imageErrors[subcategory.id] ? (
                            <img 
                              src={subcategory.image} 
                              alt={t('buyer.subcategories.subcategoryImageAlt', { name: subcategory.name })}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              onError={() => handleImageError(subcategory.id)}
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                              <div className="text-4xl mb-1" aria-hidden="true">{getCategoryIcon(subcategory.name)}</div>
                              <ImageIcon className="w-8 h-8 text-gray-400" aria-hidden="true" />
                            </div>
                          )}
                        </div>
                        
                        {/* Enhanced Overlay Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        
                        {/* Enhanced Products Count Badge */}
                        <div className="absolute top-2 right-2 z-10">
                          <div className="px-2 py-1 text-[10px] font-bold rounded-lg bg-white/95 backdrop-blur-sm text-[#5C352C] shadow-md flex items-center gap-1">
                            <Package className="w-2.5 h-2.5" />
                            {subcategory.products_count || 0} {t('buyer.subcategories.productsCount')}
                          </div>
                        </div>
                      </div>
                      
                      {/* Enhanced Category Info */}
                      <div className="p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h2 className="font-bold text-gray-900 text-sm group-hover:text-[#5C352C] transition-colors truncate">
                              {subcategory.name}
                            </h2>
                          </div>
                          <div className="bg-gradient-to-r from-[#5C352C] to-[#8B5E4F] rounded-full p-1.5 group-hover:scale-110 transition-all flex-shrink-0 shadow-md">
                            <ChevronRight className="w-3 h-3 text-white" aria-hidden="true" />
                          </div>
                        </div>
                        
                        {subcategory.description && (
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {subcategory.description.length > 60 ? subcategory.description.substring(0, 60) + '...' : subcategory.description}
                          </p>
                        )}
                        
                        {/* Enhanced Popular Products Preview */}
                        {subcategory.popular_products && subcategory.popular_products.length > 0 && (
                          <div className="mt-3 pt-2 border-t-2 border-gray-100">
                            <div className="flex items-center gap-1 mb-2">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" aria-hidden="true" />
                              <span className="text-[10px] font-semibold text-gray-600">{t('buyer.subcategories.popularProducts')}</span>
                            </div>
                            <div className="flex items-center gap-2" role="list" aria-label={t('buyer.subcategories.popularProducts')}>
                              {subcategory.popular_products.slice(0, 3).map((product, idx) => (
                                <div 
                                  key={idx} 
                                  className="relative group/product w-8 h-8 rounded-lg overflow-hidden border border-gray-200 hover:border-[#5C352C] transition-all shadow-sm"
                                  role="listitem"
                                >
                                  <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200">
                                    {product.image ? (
                                      <img 
                                        src={product.image} 
                                        alt={t('buyer.subcategories.productImageAlt', { name: product.name })} 
                                        className="w-full h-full object-cover" 
                                        loading="lazy" 
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center">
                                        <Package className="w-3 h-3 text-gray-400" aria-hidden="true" />
                                      </div>
                                    )}
                                  </div>
                                  {/* Tooltip */}
                                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 hidden group-hover/product:block z-10">
                                    <div className="bg-gray-900 text-white text-[9px] rounded-lg px-1.5 py-0.5 whitespace-nowrap shadow-lg">
                                      {product.name.length > 15 ? product.name.substring(0, 15) + '...' : product.name}
                                    </div>
                                  </div>
                                </div>
                              ))}
                              {subcategory.popular_products.length > 3 && (
                                <div className="w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center border border-gray-200">
                                  <span className="text-[9px] font-bold text-gray-500">
                                    +{subcategory.popular_products.length - 3}
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
                            {t('buyer.subcategories.matchesSearch')}
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
                  aria-label={t('buyer.subcategories.goToPage', { page: '' })}
                >
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-[#5C352C] ${
                      currentPage === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-[#5C352C] shadow-md'
                    }`}
                    aria-label={t('buyer.subcategories.goToPreviousPage')}
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
                        aria-label={t('buyer.subcategories.goToPage', { page })}
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
                    aria-label={t('buyer.subcategories.goToNextPage')}
                    aria-disabled={currentPage === lastPage}
                  >
                    <ChevronRight className="w-4 h-4" aria-hidden="true" />
                  </button>
                </nav>
              )}

              {/* Enhanced Showing results info */}
              <div 
                className="mt-4 text-center text-sm text-gray-500 bg-white px-4 py-2 rounded-lg inline-block mx-auto shadow-sm"
                role="status"
                aria-live="polite"
              >
                {t('buyer.subcategories.showing')} <span className="font-semibold text-[#5C352C]">{subcategories.length}</span> {t('buyer.subcategories.of')} <span className="font-semibold">{total}</span> {total === 1 ? t('buyer.subcategories.subcategory') : t('buyer.subcategories.subcategories')}
                {searchTerm && ` ${t('buyer.subcategories.matchesSearch').toLowerCase().replace('matches search', '')}"${searchTerm}"`}
              </div>

              {/* Enhanced Quick Stats Section */}
              {!searchTerm && subcategories.length > 0 && (
                <div className="mt-8 bg-gradient-to-r from-[#5C352C] via-[#7A4B3A] to-[#8B5E4F] rounded-xl p-5 text-white shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12"></div>
                  <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center shadow-lg">
                        <Grid className="w-5 h-5" aria-hidden="true" />
                      </div>
                      <div>
                        <h3 className="font-bold text-base">{t('buyer.subcategories.exploreCategory', { category: parentCategory?.name })}</h3>
                        <p className="text-white/90 text-xs">
                          {total} {t('buyer.subcategories.subcategories')} • {stats.total_products} {t('buyer.subcategories.products')} {t('buyer.subcategories.available')}
                        </p>
                      </div>
                    </div>
                    <Link 
                      to={`/buyer/shop/category/${id}/products`}
                      className="px-5 py-2 bg-white text-[#5C352C] rounded-xl font-bold hover:shadow-lg transition-all text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#5C352C]"
                      aria-label={t('buyer.subcategories.browseAllProducts')}
                    >
                      {t('buyer.subcategories.browseAllProducts')}
                    </Link>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Subcategories;
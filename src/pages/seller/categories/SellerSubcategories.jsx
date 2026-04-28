// src/pages/seller/categories/SellerSubcategories.jsx

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
  Image as ImageIcon,
  TrendingUp,
  Layers,
  AlertTriangle,
  Search,
  X,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  Zap,
  Grid,
  List,
  ArrowLeft
} from "lucide-react";

// ==================== ENHANCED SKELETON LOADERS ====================
const SkeletonSubcategoryCard = () => (
  <div className="animate-pulse">
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="relative w-full pt-[100%] bg-gradient-to-br from-gray-200 to-gray-300"></div>
      <div className="p-3 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        <div className="flex gap-2">
          <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
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
const SellerSubcategories = () => {
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
  const [viewMode, setViewMode] = useState("grid");
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [perPage, setPerPage] = useState(12);

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
    fetchSubcategories();
  }, [id, currentPage, searchTerm]);

  const fetchSubcategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/seller/categories/${id}/subcategories`, {
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
      setPerPage(response.data.subcategories.per_page || 12);
      
      setImageErrors({});
      
      announceToScreenReader(t('seller.subcategories.foundSubcategories', { count: response.data.subcategories.total || 0 }));
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      const errorMsg = error.response?.data?.message || t('seller.subcategories.failedToLoad');
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
    showToast(t('seller.subcategories.searchCleared'), 'info');
    announceToScreenReader(t('seller.subcategories.searchCleared'));
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= lastPage) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      announceToScreenReader(t('seller.subcategories.pageChanged', { current: newPage, total: lastPage }));
    }
  };

  const handleKeyPress = useCallback((event, callback) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      callback();
    }
  }, []);

  const handleImageError = (subcategoryId) => {
    setImageErrors(prev => ({ ...prev, [subcategoryId]: true }));
  };

  const refreshSubcategories = () => {
    setCurrentPage(1);
    fetchSubcategories();
    announceToScreenReader(t('seller.subcategories.refreshingSubcategories'));
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

  // Calculate stats
  const totalSubcategories = total;
  const totalProducts = subcategories.reduce((sum, sub) => sum + (sub.products_count || 0), 0);
  const avgProductsPerSub = totalSubcategories > 0 ? Math.round(totalProducts / totalSubcategories) : 0;

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="p-4 md:p-8">
          
          {/* Breadcrumb Navigation */}
          <nav className="mb-6 flex items-center gap-2 text-sm" aria-label={t('seller.subcategories.breadcrumb')}>
            <Link 
              to="/seller/categories" 
              className="text-gray-500 hover:text-[#5C352C] transition-colors flex items-center gap-1"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              {t('seller.subcategories.categories')}
            </Link>
            <ChevronRight className="w-3 h-3 text-gray-400" aria-hidden="true" />
            <span className="text-gray-900 font-medium">{parentCategory?.name || t('seller.subcategories.subcategories')}</span>
          </nav>

          {/* Enhanced Header with Stats */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 bg-gradient-to-br from-[#5C352C] to-[#8B5E4F] rounded-xl shadow-lg">
                    <Layers className="w-5 h-5 text-white" aria-hidden="true" />
                  </div>
                  <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#5C352C] to-[#8B5E4F] bg-clip-text text-transparent">
                    {parentCategory?.name || t('seller.subcategories.title')}
                  </h1>
                </div>
                {parentCategory?.description && (
                  <p className="text-gray-500 text-sm ml-11">{parentCategory.description}</p>
                )}
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
                    aria-label={t('seller.subcategories.openSearch')}
                  >
                    <Search className="w-4 h-4" aria-hidden="true" />
                    {t('seller.subcategories.search')}
                  </button>
                )}
                
                {/* View Mode Toggle */}
                {!isMobile && (
                  <div className="flex border-2 border-gray-200 rounded-xl overflow-hidden bg-white" role="group" aria-label={t('seller.subcategories.viewMode')}>
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-2 px-4 transition-all text-sm focus:outline-none focus:ring-2 focus:ring-[#5C352C] ${
                        viewMode === "grid" ? "bg-gradient-to-r from-[#5C352C] to-[#8B5E4F] text-white" : "text-gray-600"
                      }`}
                      aria-label={t('seller.subcategories.gridView')}
                      aria-pressed={viewMode === "grid"}
                    >
                      <Grid className="w-4 h-4" aria-hidden="true" />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-2 px-4 transition-all text-sm focus:outline-none focus:ring-2 focus:ring-[#5C352C] ${
                        viewMode === "list" ? "bg-gradient-to-r from-[#5C352C] to-[#8B5E4F] text-white" : "text-gray-600"
                      }`}
                      aria-label={t('seller.subcategories.listView')}
                      aria-pressed={viewMode === "list"}
                    >
                      <List className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                )}
                
                <div 
                  className="bg-white px-4 py-2 rounded-xl shadow-md border border-gray-100"
                  role="status"
                  aria-label={t('seller.subcategories.statsAria', { subcategories: totalSubcategories, products: totalProducts })}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Layers className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                      <span className="text-sm font-semibold text-gray-700">{totalSubcategories}</span>
                      <span className="text-xs text-gray-500">{t('seller.subcategories.subcategoriesShort')}</span>
                    </div>
                    <div className="w-px h-4 bg-gray-200"></div>
                    <div className="flex items-center gap-1">
                      <Package className="w-4 h-4 text-[#5C352C]" aria-hidden="true" />
                      <span className="text-sm font-semibold text-gray-700">{totalProducts}</span>
                      <span className="text-xs text-gray-500">{t('seller.subcategories.productsShort')}</span>
                    </div>
                    <div className="w-px h-4 bg-gray-200"></div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4 text-blue-500" aria-hidden="true" />
                      <span className="text-sm font-semibold text-gray-700">{avgProductsPerSub}</span>
                      <span className="text-xs text-gray-500">{t('seller.subcategories.avgPerSub')}</span>
                    </div>
                  </div>
                </div>
                <button
                  ref={refreshButtonRef}
                  onClick={refreshSubcategories}
                  className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 hover:border-[#5C352C] transition-all text-sm font-medium shadow-md focus:outline-none focus:ring-2 focus:ring-[#5C352C]"
                  aria-label={t('seller.subcategories.refresh')}
                  onKeyPress={(e) => handleKeyPress(e, refreshSubcategories)}
                >
                  <RefreshCw className="w-4 h-4" aria-hidden="true" />
                  {t('seller.subcategories.refresh')}
                </button>
              </div>
            </div>

            {/* Enhanced Search Bar */}
            {(showSearch || !isMobile) && (
              <div className="mt-6">
                <div className="relative max-w-md">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
                  <label htmlFor="subcategory-search" className="sr-only">{t('seller.subcategories.searchPlaceholder')}</label>
                  <input
                    id="subcategory-search"
                    ref={searchInputRef}
                    type="text"
                    placeholder={t('seller.subcategories.searchPlaceholder')}
                    value={searchTerm}
                    onChange={handleSearch}
                    className="w-full pl-11 pr-10 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#5C352C] focus:ring-2 focus:ring-[#5C352C]/20 transition-all text-sm bg-white shadow-sm"
                    aria-label={t('seller.subcategories.searchPlaceholder')}
                  />
                  {searchTerm && (
                    <button
                      onClick={clearSearch}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 rounded-full p-1"
                      aria-label={t('seller.subcategories.clearSearch')}
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
                      ? t('seller.subcategories.foundSubcategory', { count: total })
                      : t('seller.subcategories.foundSubcategories', { count: total })
                    } "<span className="font-semibold">{searchTerm}</span>"
                  </div>
                )}
              </div>
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
              <h3 className="text-xl font-bold text-rose-800 mb-2">{t('seller.subcategories.errorLoading')}</h3>
              <p className="text-rose-600 text-sm mb-5">{error}</p>
              <button 
                onClick={() => {
                  setCurrentPage(1);
                  fetchSubcategories();
                }} 
                className="px-6 py-2.5 bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-xl hover:shadow-lg transition-all text-sm font-bold focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
                aria-label={t('seller.subcategories.tryAgain')}
              >
                {t('seller.subcategories.tryAgain')}
              </button>
            </div>
          ) : subcategories.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 p-12 text-center">
              {searchTerm ? (
                <>
                  <Search className="w-20 h-20 mx-auto mb-4 text-gray-300" aria-hidden="true" />
                  <h3 className="text-xl font-bold text-gray-700 mb-2">{t('seller.subcategories.noSubcategoriesFound')}</h3>
                  <p className="text-gray-500 text-sm mb-5">{t('seller.subcategories.noSubcategoriesMatch')} "{searchTerm}"</p>
                  <button 
                    onClick={clearSearch}
                    className="px-6 py-2.5 bg-gradient-to-r from-[#5C352C] to-[#8B5E4F] text-white rounded-xl hover:shadow-lg transition-all text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#5C352C] focus:ring-offset-2"
                    aria-label={t('seller.subcategories.clearSearchButton')}
                  >
                    {t('seller.subcategories.clearSearchButton')}
                  </button>
                </>
              ) : (
                <>
                  <Layers className="w-20 h-20 mx-auto mb-4 text-gray-300" aria-hidden="true" />
                  <h3 className="text-xl font-bold text-gray-700 mb-2">{t('seller.subcategories.noSubcategoriesFound')}</h3>
                  <p className="text-gray-500 text-sm">{t('seller.subcategories.noSubcategoriesMessage')}</p>
                </>
              )}
            </div>
          ) : (
            <>
              {/* Enhanced Subcategories Grid/List */}
              <div 
                className={`grid gap-4 ${
                  viewMode === "grid" 
                    ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6" 
                    : "grid-cols-1"
                }`}
                role="list"
                aria-label={t('seller.subcategories.subcategoriesList')}
              >
                {subcategories.map((subcategory) => (
                  <Link 
                    key={subcategory.id} 
                    to={`/seller/categories/${subcategory.id}/products`}
                    className="group block focus:outline-none focus:ring-2 focus:ring-[#5C352C] focus:ring-offset-2 rounded-xl transform transition-all duration-300 hover:scale-105"
                    aria-label={t('seller.subcategories.viewSubcategory', { 
                      name: subcategory.name, 
                      products: subcategory.products_count || 0
                    })}
                  >
                    <div className="bg-white rounded-xl shadow-lg border-2 border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 h-full group-hover:border-[#5C352C]/20">
                      
                      {/* Enhanced Subcategory Image - Fixed Square Aspect Ratio */}
                      <div className="relative w-full pt-[100%] bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                        <div className="absolute inset-0">
                          {subcategory.image && !imageErrors[subcategory.id] ? (
                            <img 
                              src={subcategory.image} 
                              alt={t('seller.subcategories.subcategoryImageAlt', { name: subcategory.name })}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              onError={() => handleImageError(subcategory.id)}
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
                        
                        {/* Products Count Overlay */}
                        <div className="absolute bottom-2 left-2 z-10">
                          <div className="px-2 py-1 text-[10px] font-bold rounded-lg bg-black/70 backdrop-blur-sm text-white shadow-md flex items-center gap-1">
                            <Package className="w-2.5 h-2.5" />
                            {subcategory.products_count || 0} {t('seller.subcategories.productsShort')}
                          </div>
                        </div>
                      </div>
                      
                      {/* Enhanced Subcategory Info */}
                      <div className="p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h2 className="font-bold text-gray-900 text-sm group-hover:text-[#5C352C] transition-colors truncate">
                              {subcategory.name}
                            </h2>
                          </div>
                        </div>
                        
                        {subcategory.description && (
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {subcategory.description.length > 60 ? subcategory.description.substring(0, 60) + '...' : subcategory.description}
                          </p>
                        )}
                        
                        {/* Highlight search match */}
                        {searchTerm && (
                          <div className="mt-2 text-[10px] text-[#5C352C] font-semibold flex items-center gap-1">
                            <Zap className="w-2.5 h-2.5" />
                            {t('seller.subcategories.matchesSearch')}
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
                  aria-label={t('seller.subcategories.pagination')}
                >
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-[#5C352C] ${
                      currentPage === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-[#5C352C] shadow-md'
                    }`}
                    aria-label={t('seller.subcategories.goToPreviousPage')}
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
                        aria-label={t('seller.subcategories.goToPage', { page })}
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
                    aria-label={t('seller.subcategories.goToNextPage')}
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
                {t('seller.subcategories.showing')} <span className="font-semibold text-[#5C352C]">{subcategories.length}</span> {t('seller.subcategories.of')} <span className="font-semibold">{total}</span> {total === 1 ? t('seller.subcategories.subcategory') : t('seller.subcategories.subcategories')}
                {searchTerm && ` ${t('seller.subcategories.matchesSearch').toLowerCase()} "${searchTerm}"`}
              </div>
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default SellerSubcategories;
// src/pages/seller/categories/SellerCategories.jsx

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../../../layouts/MainLayout";
import api from "../../../api/axios";
import { useToast } from "../../../contexts/ToastContext";
import { useLanguage } from "../../../contexts/LanguageContext";
import { 
  FolderOpen, 
  ChevronRight, 
  RefreshCw, 
  Package,
  Layers,
  TrendingUp,
  ArrowRight,
  Search,
  Grid,
  List,
  AlertCircle,
  ChevronLeft,
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

const SellerCategories = () => {
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [imageErrors, setImageErrors] = useState({});
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [perPage, setPerPage] = useState(12);

  // Add shimmer style
  useEffect(() => {
    if (!document.querySelector('#shimmer-styles-categories')) {
      const style = document.createElement('style');
      style.id = 'shimmer-styles-categories';
      style.textContent = shimmerStyle;
      document.head.appendChild(style);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [currentPage, perPage]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredCategories(categories);
    } else {
      const filtered = categories.filter(category => 
        category.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCategories(filtered);
    }
  }, [searchTerm, categories]);

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/seller/categories/parent', {
        params: { page: currentPage, per_page: perPage }
      });
      
      if (response.data.data) {
        setCategories(response.data.data);
        setFilteredCategories(response.data.data);
        setCurrentPage(response.data.current_page);
        setTotalPages(response.data.last_page);
        setTotalItems(response.data.total);
      } else {
        setCategories(response.data);
        setFilteredCategories(response.data);
        setTotalItems(response.data.length);
        setTotalPages(Math.ceil(response.data.length / perPage));
      }
    } catch (error) {
      setError(t('seller.categories.errorLoading'));
      showToast(t('seller.categories.errorLoading'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleImageError = (categoryId) => {
    setImageErrors(prev => ({ ...prev, [categoryId]: true }));
  };

  const getProductCount = (category) => {
    return category.subcategories?.reduce((sum, sub) => sum + (sub.products_count || 0), 0) || 0;
  };

  const renderPagination = () => {
    const maxVisible = 3;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }
    const pageNumbers = [];
    for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);

    return (
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>{t('seller.categories.show')}</span>
          <select
            value={perPage}
            onChange={(e) => { setPerPage(Number(e.target.value)); setCurrentPage(1); }}
            className="px-2 py-1 border border-gray-200 rounded-lg text-xs"
          >
            <option value={12}>12</option>
            <option value={24}>24</option>
            <option value={48}>48</option>
          </select>
          <span>{t('seller.categories.perPage')}</span>
        </div>
        
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setCurrentPage(1)} 
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
            aria-label={t('seller.categories.firstPage')}
          >
            <ChevronsLeft className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={() => setCurrentPage(currentPage - 1)} 
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
            aria-label={t('seller.categories.previousPage')}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          
          {startPage > 1 && <span className="text-gray-400 text-xs">...</span>}
          {pageNumbers.map(page => (
            <button 
              key={page} 
              onClick={() => setCurrentPage(page)}
              className={`min-w-[32px] h-8 rounded-lg text-xs font-medium transition-colors ${
                currentPage === page ? 'bg-[#5C352C] text-white' : 'hover:bg-gray-100'
              }`}
            >
              {page}
            </button>
          ))}
          {endPage < totalPages && <span className="text-gray-400 text-xs">...</span>}
          
          <button 
            onClick={() => setCurrentPage(currentPage + 1)} 
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
            aria-label={t('seller.categories.nextPage')}
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={() => setCurrentPage(totalPages)} 
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
            aria-label={t('seller.categories.lastPage')}
          >
            <ChevronsRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  };

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
              <div className="h-9 w-28 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-lg"></div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                  <div className="h-28 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer"></div>
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

  const totalSubcategories = categories.reduce((sum, cat) => sum + (cat.subcategories_count || 0), 0);
  const totalProducts = categories.reduce((sum, cat) => sum + getProductCount(cat), 0);

  return (
    <MainLayout>
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Header */}
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="p-2 bg-[#5C352C]/10 rounded-xl">
                  <FolderOpen className="w-5 h-5 text-[#5C352C]" />
                </div>
                <h1 className="text-xl font-semibold text-gray-900">{t('seller.categories.title')}</h1>
              </div>
              <p className="text-sm text-gray-500 ml-11">{t('seller.categories.subtitle')}</p>
            </div>
            <button 
              onClick={fetchCategories} 
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              {t('seller.categories.refresh')}
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
              <p className="text-2xl font-bold text-gray-900">{totalItems}</p>
              <p className="text-xs text-gray-500">{t('seller.categories.categories')}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
              <p className="text-2xl font-bold text-gray-900">{totalSubcategories}</p>
              <p className="text-xs text-gray-500">{t('seller.categories.subcategories')}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
              <p className="text-2xl font-bold text-gray-900">{totalProducts}</p>
              <p className="text-xs text-gray-500">{t('seller.categories.products')}</p>
            </div>
          </div>

          {/* Search and View Toggle */}
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex flex-wrap gap-3">
              <div className="flex-1 min-w-[200px] relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('seller.categories.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#5C352C] focus:ring-1 focus:ring-[#5C352C]"
                />
              </div>
              <div className="flex bg-gray-100 rounded-lg p-0.5">
                <button 
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-md transition-all ${viewMode === "grid" ? "bg-white text-[#5C352C] shadow-sm" : "text-gray-500"}`}
                  aria-label={t('seller.categories.gridView')}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 rounded-md transition-all ${viewMode === "list" ? "bg-white text-[#5C352C] shadow-sm" : "text-gray-500"}`}
                  aria-label={t('seller.categories.listView')}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Pagination Top */}
          {filteredCategories.length > 0 && totalPages > 1 && (
            <div className="bg-white rounded-xl border border-gray-100 p-3">
              {renderPagination()}
            </div>
          )}

          {/* Error / Empty State */}
          {error ? (
            <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
              <p className="text-red-600">{error}</p>
              <button 
                onClick={fetchCategories} 
                className="mt-3 text-sm text-[#5C352C] hover:underline"
              >
                {t('seller.categories.tryAgain')}
              </button>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
              <FolderOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-medium text-gray-900 mb-1">{t('seller.categories.noCategories')}</h3>
              <p className="text-sm text-gray-500">
                {searchTerm 
                  ? t('seller.categories.noResults', { searchTerm }) 
                  : t('seller.categories.noCategoriesAvailable')}
              </p>
            </div>
          ) : viewMode === "grid" ? (
            /* Grid View */
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {filteredCategories.map((category) => {
                const productCount = getProductCount(category);
                const subcategoryCount = category.subcategories_count || 0;
                
                return (
                  <Link key={category.id} to={`/seller/categories/${category.id}/subcategories`} className="group">
                    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5">
                      <div className="h-28 bg-gray-100 relative overflow-hidden">
                        {category.image && !imageErrors[category.id] ? (
                          <img 
                            src={category.image} 
                            alt={category.name} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={() => handleImageError(category.id)} 
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <FolderOpen className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <h3 className="absolute bottom-2 left-2 right-2 text-white text-sm font-semibold line-clamp-1">
                          {category.name}
                        </h3>
                      </div>
                      <div className="p-3">
                        <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                          <span className="flex items-center gap-1">
                            <Layers className="w-3 h-3" />
                            {subcategoryCount}
                          </span>
                          <span className="flex items-center gap-1">
                            <Package className="w-3 h-3" />
                            {productCount}
                          </span>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                          <span className="text-xs text-[#5C352C] font-medium group-hover:gap-2 transition-all gap-1 flex items-center">
                            {t('seller.categories.browse')} <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            /* List View */
            <div className="space-y-2">
              {filteredCategories.map((category) => {
                const productCount = getProductCount(category);
                const subcategoryCount = category.subcategories_count || 0;
                
                return (
                  <Link key={category.id} to={`/seller/categories/${category.id}/subcategories`}>
                    <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all duration-200 hover:bg-gray-50">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          {category.image && !imageErrors[category.id] ? (
                            <img 
                              src={category.image} 
                              alt={category.name} 
                              className="w-full h-full object-cover" 
                              onError={() => handleImageError(category.id)} 
                            />
                          ) : (
                            <FolderOpen className="w-6 h-6 text-gray-400 m-3" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 text-sm">{category.name}</h3>
                          {category.description && (
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{category.description}</p>
                          )}
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                            <span className="flex items-center gap-1">
                              <Layers className="w-3 h-3" />
                              {subcategoryCount} {t('seller.categories.subcategoriesLabel')}
                            </span>
                            <span className="flex items-center gap-1">
                              <Package className="w-3 h-3" />
                              {productCount} {t('seller.categories.productsLabel')}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#5C352C] transition-colors" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Pagination Bottom */}
          {filteredCategories.length > 0 && totalPages > 1 && (
            <div className="bg-white rounded-xl border border-gray-100 p-3">
              {renderPagination()}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default SellerCategories;
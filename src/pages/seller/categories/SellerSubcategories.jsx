// src/pages/seller/categories/SellerSubcategories.jsx

import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import MainLayout from "../../../layouts/MainLayout";
import api from "../../../api/axios";
import { useToast } from "../../../contexts/ToastContext";
import { useLanguage } from "../../../contexts/LanguageContext";
import { 
  FolderOpen, 
  Package, 
  ChevronRight, 
  ArrowLeft, 
  RefreshCw,
  Layers,
  Search,
  TrendingUp,
  ArrowRight,
  ChevronLeft,
  AlertTriangle,
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

const SellerSubcategories = () => {
  const { id } = useParams();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [parentCategory, setParentCategory] = useState(null);
  const [subcategories, setSubcategories] = useState([]);
  const [filteredSubcategories, setFilteredSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [imageErrors, setImageErrors] = useState({});
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [perPage, setPerPage] = useState(12);

  // Add shimmer style
  useEffect(() => {
    if (!document.querySelector('#shimmer-styles-subcategories')) {
      const style = document.createElement('style');
      style.id = 'shimmer-styles-subcategories';
      style.textContent = shimmerStyle;
      document.head.appendChild(style);
    }
  }, []);

  useEffect(() => {
    fetchSubcategories();
  }, [id, currentPage, perPage]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredSubcategories(subcategories);
    } else {
      const filtered = subcategories.filter(sub => 
        sub.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredSubcategories(filtered);
    }
  }, [searchTerm, subcategories]);

  const fetchSubcategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/seller/categories/${id}/subcategories`, {
        params: { page: currentPage, per_page: perPage }
      });
      
      setParentCategory(response.data.parent_category);
      
      if (response.data.subcategories.data) {
        setSubcategories(response.data.subcategories.data);
        setFilteredSubcategories(response.data.subcategories.data);
        setCurrentPage(response.data.subcategories.current_page);
        setTotalPages(response.data.subcategories.last_page);
        setTotalItems(response.data.subcategories.total);
      } else {
        setSubcategories(response.data.subcategories);
        setFilteredSubcategories(response.data.subcategories);
        setTotalItems(response.data.subcategories.length);
        setTotalPages(Math.ceil(response.data.subcategories.length / perPage));
      }
      
      setImageErrors({});
    } catch (error) {
      setError(t('seller.subcategories.errorLoading'));
      showToast(t('seller.subcategories.errorLoading'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleImageError = (subcategoryId) => {
    setImageErrors(prev => ({ ...prev, [subcategoryId]: true }));
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
          <span>{t('seller.subcategories.show')}</span>
          <select
            value={perPage}
            onChange={(e) => { setPerPage(Number(e.target.value)); setCurrentPage(1); }}
            className="px-2 py-1 border border-gray-200 rounded-lg text-xs"
          >
            <option value={12}>12</option>
            <option value={24}>24</option>
            <option value={48}>48</option>
          </select>
          <span>{t('seller.subcategories.perPage')}</span>
        </div>
        
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setCurrentPage(1)} 
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
            aria-label={t('seller.subcategories.firstPage')}
          >
            <ChevronsLeft className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={() => setCurrentPage(currentPage - 1)} 
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
            aria-label={t('seller.subcategories.previousPage')}
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
            aria-label={t('seller.subcategories.nextPage')}
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={() => setCurrentPage(totalPages)} 
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
            aria-label={t('seller.subcategories.lastPage')}
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
            <div className="flex items-center gap-2 text-sm mb-6">
              <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-20"></div>
              <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-24"></div>
            </div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <div className="h-7 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-48"></div>
                <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-64 mt-1"></div>
              </div>
              <div className="h-9 w-20 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-lg"></div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                  <div className="h-24 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer"></div>
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

  const totalProducts = subcategories.reduce((sum, sub) => sum + (sub.products_count || 0), 0);
  const totalSubcategories = totalItems;

  return (
    <MainLayout>
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm">
            <Link to="/seller/categories" className="text-gray-500 hover:text-[#5C352C] transition-colors">
              {t('seller.subcategories.categories')}
            </Link>
            <ChevronRight className="w-3 h-3 text-gray-400" />
            <span className="text-gray-900 font-medium">{parentCategory?.name || t('seller.subcategories.subcategories')}</span>
          </div>

          {/* Header */}
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="p-2 bg-[#5C352C]/10 rounded-xl">
                  <FolderOpen className="w-5 h-5 text-[#5C352C]" />
                </div>
                <h1 className="text-xl font-semibold text-gray-900">{parentCategory?.name}</h1>
              </div>
              <p className="text-sm text-gray-500 ml-11">
                {parentCategory?.description || t('seller.subcategories.subcategoriesUnder', { name: parentCategory?.name })}
              </p>
            </div>
            <button 
              onClick={fetchSubcategories} 
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              {t('seller.subcategories.refresh')}
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
              <p className="text-2xl font-bold text-gray-900">{totalSubcategories}</p>
              <p className="text-xs text-gray-500">{t('seller.subcategories.subcategories')}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
              <p className="text-2xl font-bold text-emerald-600">{totalProducts}</p>
              <p className="text-xs text-gray-500">{t('seller.subcategories.totalProducts')}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
              <p className="text-2xl font-bold text-blue-600">
                {totalSubcategories > 0 ? Math.round(totalProducts / totalSubcategories) : 0}
              </p>
              <p className="text-xs text-gray-500">{t('seller.subcategories.avgProductsPerSub')}</p>
            </div>
          </div>

          {/* Search */}
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={t('seller.subcategories.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#5C352C] focus:ring-1 focus:ring-[#5C352C]"
              />
            </div>
          </div>

          {/* Pagination Top */}
          {filteredSubcategories.length > 0 && totalPages > 1 && (
            <div className="bg-white rounded-xl border border-gray-100 p-3">{renderPagination()}</div>
          )}

          {/* Error / Empty State */}
          {error ? (
            <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
              <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-3" />
              <p className="text-red-600">{error}</p>
              <button 
                onClick={fetchSubcategories} 
                className="mt-3 text-sm text-[#5C352C] hover:underline"
              >
                {t('seller.subcategories.tryAgain')}
              </button>
            </div>
          ) : filteredSubcategories.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
              <FolderOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-medium text-gray-900 mb-1">{t('seller.subcategories.noSubcategories')}</h3>
              <p className="text-sm text-gray-500">
                {searchTerm 
                  ? t('seller.subcategories.noResults', { searchTerm }) 
                  : t('seller.subcategories.noSubcategoriesAvailable')}
              </p>
            </div>
          ) : (
            /* Subcategories Grid */
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {filteredSubcategories.map((subcategory) => (
                <Link 
                  key={subcategory.id} 
                  to={`/seller/categories/${subcategory.id}/products`} 
                  className="group"
                >
                  <div className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5">
                    <div className="h-24 bg-gray-100 relative overflow-hidden">
                      {subcategory.image && !imageErrors[subcategory.id] ? (
                        <img 
                          src={subcategory.image} 
                          alt={subcategory.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={() => handleImageError(subcategory.id)} 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FolderOpen className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                      <div className="absolute bottom-2 right-2 bg-black/60 rounded-md px-1.5 py-0.5">
                        <span className="text-white text-[10px] font-medium flex items-center gap-0.5">
                          <Package className="w-2.5 h-2.5" />
                          {subcategory.products_count || 0}
                        </span>
                      </div>
                    </div>
                    <div className="p-3">
                      <div className="flex items-start justify-between gap-1">
                        <h3 className="font-medium text-gray-900 text-sm group-hover:text-[#5C352C] transition-colors truncate">
                          {subcategory.name}
                        </h3>
                        <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#5C352C] group-hover:translate-x-0.5 transition-all" />
                      </div>
                      {subcategory.description && (
                        <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{subcategory.description}</p>
                      )}
                      <div className="mt-2 pt-2 border-t border-gray-100">
                        <span className="text-[10px] text-[#5C352C] font-medium flex items-center gap-0.5">
                          {t('seller.subcategories.browseProducts')} <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Pagination Bottom */}
          {filteredSubcategories.length > 0 && totalPages > 1 && (
            <div className="bg-white rounded-xl border border-gray-100 p-3">{renderPagination()}</div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default SellerSubcategories;
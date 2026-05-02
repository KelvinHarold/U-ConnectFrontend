// src/pages/buyer/products/Products.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../../../layouts/MainLayout";
import api from "../../../api/axios";
import { useToast } from "../../../contexts/ToastContext";
import { useLanguage } from "../../../contexts/LanguageContext";
import DiscountBadge from "../../../components/common/DiscountBadge";
import { 
  Search, 
  Filter, 
  ChevronDown,
  ShoppingCart,
  Eye,
  Star,
  DollarSign,
  Grid,
  List,
  X,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Clock,
  Tag,
  Truck,
  AlertTriangle,
  Heart,
  Sparkles,
  Zap,
  Shield,
  Award,
  Flame,
  SlidersHorizontal,
  RotateCcw
} from "lucide-react";

// ==================== SKELETON LOADERS ====================
const SkeletonProductCard = () => (
  <div className="animate-pulse">
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="relative w-full pt-[100%] bg-gradient-to-br from-gray-200 to-gray-300"></div>
      <div className="p-3 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 bg-gray-200 rounded-full"></div>
          <div className="h-3 w-12 bg-gray-200 rounded"></div>
          <div className="h-3 w-3 bg-gray-200 rounded-full"></div>
          <div className="h-3 w-8 bg-gray-200 rounded"></div>
        </div>
        <div className="h-5 bg-gray-200 rounded w-1/3"></div>
        <div className="h-8 bg-gray-200 rounded-lg w-full mt-2"></div>
      </div>
    </div>
  </div>
);

const SkeletonGridLoader = ({ count = 12 }) => (
  <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4">
    {[...Array(count)].map((_, i) => (
      <SkeletonProductCard key={i} />
    ))}
  </div>
);

// ==================== PRODUCT CARD COMPONENT ====================
const ProductCard = React.memo(({ product, formatPrice, addToCart, addingToCart, handleImageError, imageErrors, t }) => (
  <div className="group bg-white rounded-xl shadow-lg border-2 border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:border-[#5C352C]/20 flex flex-col h-full transform hover:-translate-y-1">
    <Link 
      to={`/buyer/shop/products/${product.id}`}
      className="focus:outline-none focus:ring-2 focus:ring-[#5C352C] focus:ring-offset-2 rounded-t-xl"
      aria-label={`${t('buyer.products.viewDetails')} ${product.name}`}
    >
      <div className="relative w-full pt-[100%] bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
        <div className="absolute inset-0">
          {product.image && !imageErrors[product.id] ? (
            <img 
              src={product.image} 
              alt={product.name} 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              onError={() => handleImageError(product.id)}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100">
              <ImageIcon className="w-8 h-8 sm:w-10 sm:h-10 text-gray-300" aria-hidden="true" />
            </div>
          )}
        </div>
        
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {product.is_featured && (
            <span className="px-1.5 sm:px-2 py-0.5 text-[8px] sm:text-[10px] font-bold rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 text-white shadow-md flex items-center gap-1">
              <Award className="w-2 h-2 sm:w-2.5 sm:h-2.5" aria-hidden="true" />
              <span className="hidden xs:inline">{t('buyer.products.featured')}</span>
            </span>
          )}
          {product.discount_percentage > 0 && (
            <DiscountBadge percentage={product.discount_percentage} className="shadow-md !px-1.5 !py-0.5 !text-[8px] sm:!px-2 sm:!py-0.5 sm:!text-[10px]" />
          )}
          {product.is_new && (
            <span className="px-1.5 sm:px-2 py-0.5 text-[8px] sm:text-[10px] font-bold rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md flex items-center gap-1">
              <Sparkles className="w-2 h-2 sm:w-2.5 sm:h-2.5" aria-hidden="true" />
              <span className="hidden xs:inline">{t('buyer.products.new')}</span>
            </span>
          )}
        </div>
        
        {product.quantity === 0 && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-10">
            <span className="px-2 py-0.5 text-[8px] sm:text-[10px] font-bold rounded-full bg-gray-900 text-white shadow-lg">
              {t('buyer.products.outOfStock')}
            </span>
          </div>
        )}
      </div>
    </Link>
    
    <div className="p-2 sm:p-3 flex-1 flex flex-col">
      <Link 
        to={`/buyer/shop/products/${product.id}`}
        className="focus:outline-none focus:ring-2 focus:ring-[#5C352C] focus:ring-offset-2 rounded"
      >
        <h3 className="font-bold text-gray-900 text-xs sm:text-sm mb-1 hover:text-[#5C352C] transition-colors line-clamp-2 min-h-[32px] sm:min-h-[40px]">
          {product.name}
        </h3>
      </Link>
      
      <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 mb-1 sm:mb-2">
        <div className="flex items-center gap-0.5 bg-amber-50 px-1 sm:px-1.5 py-0.5 rounded-lg">
          <Star className="w-2 h-2 sm:w-2.5 sm:h-2.5 fill-amber-400 text-amber-400" aria-hidden="true" />
          <span className="text-[8px] sm:text-[10px] font-bold text-amber-700">{product.average_rating ? product.average_rating.toFixed(1) : '5.0'}</span>
        </div>
        <span className="text-[8px] sm:text-[9px] text-gray-400" aria-hidden="true">•</span>
        <span className="text-[8px] sm:text-[10px] text-gray-500 font-medium">{product.sales_count || 0} {t('buyer.products.sold')}</span>
      </div>
      
      <div className="mb-1 sm:mb-2">
        <span className="font-bold text-[#5C352C] text-sm sm:text-base">
          {formatPrice(product.discount_percentage > 0 ? product.discounted_price : product.price)}
        </span>
        {product.discount_percentage > 0 && (
          <span className="text-[9px] sm:text-[10px] text-gray-400 line-through ml-1">{formatPrice(product.price)}</span>
        )}
      </div>
      
      <button
        onClick={() => addToCart(product.id)}
        disabled={product.quantity === 0 || addingToCart[product.id]}
        className={`mt-auto py-1.5 sm:py-2 rounded-xl transition-all flex items-center justify-center gap-1 sm:gap-2 text-[10px] sm:text-xs font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5C352C] ${
          product.quantity === 0 
            ? 'bg-gray-100 cursor-not-allowed text-gray-400' 
            : 'bg-gradient-to-r from-[#5C352C] to-[#8B5E4F] text-white hover:shadow-lg transform hover:scale-105'
        }`}
        aria-label={product.quantity === 0 ? t('buyer.products.outOfStock') : `${t('buyer.products.addToCart')} ${product.name}`}
        aria-disabled={product.quantity === 0}
      >
        {addingToCart[product.id] ? (
          <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-2 border-white border-t-transparent" aria-hidden="true"></div>
        ) : (
          <>
            <ShoppingCart className="w-3 h-3 sm:w-3.5 sm:h-3.5" aria-hidden="true" />
            <span>{product.quantity === 0 ? t('buyer.products.outOfStock') : t('buyer.products.addToCart')}</span>
          </>
        )}
      </button>
    </div>
  </div>
));

ProductCard.displayName = 'ProductCard';

// ==================== MAIN PRODUCTS COMPONENT ====================
const Products = () => {
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [categories, setCategories] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isSmallMobile, setIsSmallMobile] = useState(false);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0
  });
  
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [addingToCart, setAddingToCart] = useState({});
  
  const [error, setError] = useState(null);
  const [imageErrors, setImageErrors] = useState({});
  
  const searchTimeoutRef = useRef(null);
  const filterTimeoutRef = useRef(null);
  const filtersRef = useRef(null);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsSmallMobile(window.innerWidth < 480);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Click outside to close filters on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobile && showFilters && filtersRef.current && !filtersRef.current.contains(event.target)) {
        setShowFilters(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile, showFilters]);

  useEffect(() => {
    fetchCategories();
  }, []);

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      fetchProducts(1);
    }, 500);
    
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [search]);

  // Debounced filter changes
  useEffect(() => {
    if (filterTimeoutRef.current) {
      clearTimeout(filterTimeoutRef.current);
    }
    
    filterTimeoutRef.current = setTimeout(() => {
      fetchProducts(1);
    }, 300);
    
    return () => {
      if (filterTimeoutRef.current) {
        clearTimeout(filterTimeoutRef.current);
      }
    };
  }, [selectedCategory, minPrice, maxPrice, sortBy]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/buyer/shop/categories');
      setCategories(response.data?.data || response.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
      showToast(t('buyer.products.failedToLoadCategories'), 'error');
    }
  };

  const fetchProducts = async (page = 1, isLoadMore = false) => {
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    setError(null);
    
    try {
      const params = { 
        page,
        ...(search && { search }),
        ...(selectedCategory && { category_id: selectedCategory }),
        ...(minPrice && { min_price: minPrice }),
        ...(maxPrice && { max_price: maxPrice }),
        ...(sortBy && { sort_by: sortBy })
      };
      
      const response = await api.get('/buyer/shop/products', { params });
      
      if (response.data && response.data.data) {
        if (isLoadMore) {
          setProducts(prev => [...prev, ...response.data.data]);
        } else {
          setProducts(response.data.data);
          // Auto scroll to top on mobile when filters are applied
          if (isMobile && (selectedCategory || minPrice || maxPrice || search)) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }
        setPagination({
          current_page: response.data.current_page || 1,
          last_page: response.data.last_page || 1,
          total: response.data.total || 0
        });
        setImageErrors({});
      } else {
        setProducts([]);
        setPagination({
          current_page: 1,
          last_page: 1,
          total: 0
        });
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      const errorMsg = error.response?.data?.message || t('buyer.products.failedToLoadProducts');
      setError(errorMsg);
      showToast(errorMsg, 'error');
      setProducts([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const addToCart = async (productId) => {
    setAddingToCart(prev => ({ ...prev, [productId]: true }));
    try {
      await api.post('/buyer/cart/add', { product_id: productId, quantity: 1 });
      showToast(t('buyer.products.productAddedToCart'), 'success');
    } catch (error) {
      showToast(error.response?.data?.message || t('buyer.products.errorAddingToCart'), 'error');
    } finally {
      setAddingToCart(prev => ({ ...prev, [productId]: false }));
    }
  };

  const formatPrice = (price) => {
    return `Tsh ${Number(price).toLocaleString('en-US')}`;
  };

  const clearFilters = () => {
    setSelectedCategory("");
    setMinPrice("");
    setMaxPrice("");
    setSortBy("latest");
    setSearch("");
    setShowFilters(false);
    showToast(t('buyer.products.filtersCleared'), 'info');
  };

  const hasActiveFilters = selectedCategory || minPrice || maxPrice || search;

  const handleImageError = (productId) => {
    setImageErrors(prev => ({ ...prev, [productId]: true }));
  };

  const loadMore = () => {
    if (pagination.current_page < pagination.last_page && !loadingMore) {
      fetchProducts(pagination.current_page + 1, true);
    }
  };

  const handleFilterPanelKeyDown = (e) => {
    if (e.key === 'Escape') {
      setShowFilters(false);
    }
  };

  const toggleFilters = () => {
    setShowFilters(prev => !prev);
  };

  const sortOptions = [
    { value: "latest", label: t('buyer.products.latestArrivals') },
    { value: "price_low", label: t('buyer.products.priceLowToHigh') },
    { value: "price_high", label: t('buyer.products.priceHighToLow') },
    { value: "popular", label: t('buyer.products.mostPopular') },
  ];

  // Get grid columns based on screen size
  const getGridColumns = () => {
    if (isSmallMobile) return "grid-cols-2";
    if (isMobile) return "grid-cols-2";
    return "grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6";
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="p-3 sm:p-4 md:p-6 lg:p-8">
          
          {/* Mobile Header with Compact Layout */}
          <div className="mb-4 sm:mb-6 md:mb-8">
            <div className="flex flex-col gap-3 sm:gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 sm:p-2 bg-gradient-to-br from-[#5C352C] to-[#8B5E4F] rounded-lg sm:rounded-xl shadow-lg">
                    <Tag className="w-4 h-4 sm:w-5 sm:h-5 text-white" aria-hidden="true" />
                  </div>
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#5C352C] to-[#8B5E4F] bg-clip-text text-transparent">
                    {t('buyer.products.shop')}
                  </h1>
                </div>
                <div className="bg-white px-2 sm:px-3 py-1 sm:py-2 rounded-lg sm:rounded-xl shadow-md border border-gray-100">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-500" aria-hidden="true" />
                    <span className="text-xs sm:text-sm font-semibold text-gray-700">{pagination.total}</span>
                    <span className="text-[10px] sm:text-xs text-gray-500 hidden xs:inline">{t('buyer.products.products')}</span>
                  </div>
                </div>
              </div>
              <p className="text-gray-500 text-xs sm:text-sm ml-9 sm:ml-10">{t('buyer.products.subtitle')}</p>
            </div>
          </div>

          {/* Search and Filter Bar - Mobile Optimized */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border-2 border-gray-100 p-3 sm:p-4 mb-4 sm:mb-6">
            <div className="flex flex-col gap-3">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" aria-hidden="true" />
                  <input
                    type="text"
                    placeholder={t('buyer.products.searchPlaceholder')}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 sm:pl-11 pr-3 sm:pr-4 py-2 sm:py-3 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:border-[#5C352C] focus:ring-2 focus:ring-[#5C352C]/20 transition-all text-xs sm:text-sm bg-gray-50"
                    aria-label="Search products"
                  />
                </div>
                <button
                  type="button"
                  onClick={toggleFilters}
                  className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl transition-all text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#5C352C] focus:ring-offset-2 ${
                    showFilters || hasActiveFilters
                      ? 'bg-gradient-to-r from-[#5C352C] to-[#8B5E4F] text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  aria-expanded={showFilters}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 sm:w-4 sm:h-4" aria-hidden="true" />
                  <span className="hidden xs:inline">{t('buyer.products.filters')}</span>
                  {hasActiveFilters && (
                    <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded-full text-[8px] sm:text-[9px]">
                      {t('buyer.products.active')}
                    </span>
                  )}
                </button>
              </div>
              
              <div className="flex gap-2">
                <div className="flex-1">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 sm:py-2.5 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:border-[#5C352C] focus:ring-2 focus:ring-[#5C352C]/20 text-xs sm:text-sm font-semibold bg-gray-50 cursor-pointer"
                  >
                    {sortOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Filter Panel - Mobile Optimized Drawer */}
            {showFilters && (
              <div 
                ref={filtersRef}
                className={`mt-3 sm:mt-4 pt-3 sm:pt-4 border-t-2 border-gray-100 transition-all duration-300 ${
                  isMobile ? 'fixed inset-x-0 bottom-0 top-auto z-50 bg-white rounded-t-2xl shadow-2xl p-4 animate-slide-up border-t-0 max-h-[80vh] overflow-y-auto' : ''
                }`}
                onKeyDown={handleFilterPanelKeyDown}
                role="dialog"
                aria-label="Filter options"
              >
                {isMobile && (
                  <div className="flex justify-between items-center mb-4 sticky top-0 bg-white pt-2 pb-3 border-b border-gray-100">
                    <h3 className="font-bold text-gray-900">{t('buyer.products.filterOptions')}</h3>
                    <button
                      onClick={() => setShowFilters(false)}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                      aria-label="Close filters"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                )}
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1.5 sm:mb-2">
                      {t('buyer.products.category')}
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:border-[#5C352C] text-xs sm:text-sm bg-gray-50 font-medium"
                    >
                      <option value="">{t('buyer.products.allCategories')}</option>
                      {categories && categories.length > 0 ? (
                        categories.map(category => (
                          <option key={category.id} value={category.id}>
                            {category.name} ({category.products_count || 0})
                          </option>
                        ))
                      ) : (
                        <option disabled>{t('buyer.products.loadingCategories')}</option>
                      )}
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1.5 sm:mb-2">
                        {t('buyer.products.minPrice')}
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" aria-hidden="true" />
                        <input
                          type="number"
                          placeholder="0"
                          value={minPrice}
                          onChange={(e) => setMinPrice(e.target.value)}
                          className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:border-[#5C352C] text-xs sm:text-sm bg-gray-50"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1.5 sm:mb-2">
                        {t('buyer.products.maxPrice')}
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" aria-hidden="true" />
                        <input
                          type="number"
                          placeholder={t('buyer.products.any')}
                          value={maxPrice}
                          onChange={(e) => setMaxPrice(e.target.value)}
                          className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:border-[#5C352C] text-xs sm:text-sm bg-gray-50"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Clear Filters Button */}
                {hasActiveFilters && (
                  <div className="mt-4 sm:mt-5 flex justify-end">
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="px-4 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-lg sm:rounded-xl hover:shadow-lg transition-all text-xs sm:text-sm font-bold flex items-center gap-2"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      {t('buyer.products.clearAllFilters')}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Results Count - Responsive */}
          <div className="mb-3 sm:mb-5 flex justify-between items-center">
            <div className="text-[11px] sm:text-sm text-gray-600 bg-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl shadow-md border border-gray-100">
              {t('buyer.products.showing')} <span className="font-bold text-[#5C352C]">{products.length}</span> {t('buyer.products.of')}{' '}
              <span className="font-bold">{pagination.total}</span> <span className="hidden xs:inline">{t('buyer.products.products')}</span>
            </div>
          </div>

          {/* Products Display - Grid Only */}
          {loading ? (
            <SkeletonGridLoader count={isSmallMobile ? 8 : isMobile ? 8 : 12} />
          ) : error ? (
            <div className="bg-rose-50 border-2 border-rose-200 rounded-xl sm:rounded-2xl p-6 sm:p-10 text-center shadow-lg">
              <AlertTriangle className="w-12 h-12 sm:w-16 sm:h-16 text-rose-500 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-lg sm:text-xl font-bold text-rose-800 mb-2">{t('buyer.products.errorLoading')}</h3>
              <p className="text-rose-600 text-xs sm:text-sm mb-4 sm:mb-5">{error}</p>
              <button 
                onClick={() => fetchProducts(1)} 
                className="px-5 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-lg sm:rounded-xl hover:shadow-lg transition-all text-xs sm:text-sm font-bold"
              >
                {t('buyer.products.tryAgain')}
              </button>
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border-2 border-gray-100 p-8 sm:p-12 text-center">
              <ShoppingCart className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4 text-gray-300" />
              <h3 className="text-lg sm:text-xl font-bold text-gray-700 mb-2">{t('buyer.products.noProductsFound')}</h3>
              <p className="text-gray-500 text-xs sm:text-sm mb-4 sm:mb-5">{t('buyer.products.adjustFilters')}</p>
              {hasActiveFilters && (
                <button 
                  onClick={clearFilters} 
                  className="px-5 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-[#5C352C] to-[#8B5E4F] text-white rounded-lg sm:rounded-xl hover:shadow-lg transition-all text-xs sm:text-sm font-bold"
                >
                  {t('buyer.products.clearAllFilters')}
                </button>
              )}
            </div>
          ) : (
            <>
              <div className={`grid ${getGridColumns()} gap-2 sm:gap-3 md:gap-4`}>
                {products.map((product) => (
                  <ProductCard 
                    key={product.id}
                    product={product}
                    formatPrice={formatPrice}
                    addToCart={addToCart}
                    addingToCart={addingToCart}
                    handleImageError={handleImageError}
                    imageErrors={imageErrors}
                    t={t}
                  />
                ))}
              </div>
              
              {/* Loading More Indicator */}
              {loadingMore && (
                <div className="mt-4 sm:mt-6">
                  <div className={`grid ${getGridColumns()} gap-2 sm:gap-3 md:gap-4`}>
                    {[...Array(isSmallMobile ? 4 : 6)].map((_, i) => (
                      <SkeletonProductCard key={`more-${i}`} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Pagination - Responsive */}
          {!loading && products.length > 0 && pagination.last_page > 1 && (
            <div className="mt-6 sm:mt-8 md:mt-10 flex justify-center">
              {isMobile ? (
                <button
                  type="button"
                  onClick={loadMore}
                  disabled={loadingMore || pagination.current_page === pagination.last_page}
                  className="px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-[#5C352C] to-[#8B5E4F] text-white rounded-lg sm:rounded-xl hover:shadow-lg transition-all text-xs sm:text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingMore ? (
                    <>
                      <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent inline-block mr-2"></div>
                      {t('buyer.products.loading')}
                    </>
                  ) : (
                    `${t('buyer.products.loadMore')} (${pagination.current_page}/${pagination.last_page})`
                  )}
                </button>
              ) : (
                <div className="flex gap-1 sm:gap-2">
                  <button
                    type="button"
                    onClick={() => fetchProducts(pagination.current_page - 1)}
                    disabled={pagination.current_page === 1}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 border-2 border-gray-200 rounded-lg sm:rounded-xl text-xs sm:text-sm disabled:opacity-50 hover:border-[#5C352C] hover:text-[#5C352C] transition-all bg-white font-semibold"
                  >
                    <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                  <div className="flex gap-1 sm:gap-2">
                    {[...Array(Math.min(5, pagination.last_page))].map((_, i) => {
                      let pageNum;
                      if (pagination.last_page <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.current_page <= 3) {
                        pageNum = i + 1;
                      } else if (pagination.current_page >= pagination.last_page - 2) {
                        pageNum = pagination.last_page - 4 + i;
                      } else {
                        pageNum = pagination.current_page - 2 + i;
                      }
                      return (
                        <button
                          type="button"
                          key={i}
                          onClick={() => fetchProducts(pageNum)}
                          className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition-all ${
                            pagination.current_page === pageNum
                              ? 'bg-gradient-to-r from-[#5C352C] to-[#8B5E4F] text-white shadow-lg'
                              : 'bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-200'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    type="button"
                    onClick={() => fetchProducts(pagination.current_page + 1)}
                    disabled={pagination.current_page === pagination.last_page}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 border-2 border-gray-200 rounded-lg sm:rounded-xl text-xs sm:text-sm disabled:opacity-50 hover:border-[#5C352C] hover:text-[#5C352C] transition-all bg-white font-semibold"
                  >
                    <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Animation styles for mobile filter drawer */}
      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
        
        @media (max-width: 480px) {
          .grid {
            gap: 0.5rem;
          }
        }
      `}</style>
    </MainLayout>
  );
};

export default Products;
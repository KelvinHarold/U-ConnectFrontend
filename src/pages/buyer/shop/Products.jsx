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
  Flame
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

const SkeletonProductListItem = () => (
  <div className="animate-pulse">
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="flex flex-row">
        <div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 flex-shrink-0"></div>
        <div className="flex-1 p-3">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="flex gap-2">
                <div className="h-3 bg-gray-200 rounded w-10"></div>
                <div className="h-3 bg-gray-200 rounded w-8"></div>
                <div className="h-3 bg-gray-200 rounded w-12"></div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-5 bg-gray-200 rounded w-20"></div>
              <div className="h-8 w-12 bg-gray-200 rounded-lg"></div>
              <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const SkeletonGridLoader = ({ count = 12 }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
    {[...Array(count)].map((_, i) => (
      <SkeletonProductCard key={i} />
    ))}
  </div>
);

const SkeletonListLoader = ({ count = 6 }) => (
  <div className="space-y-4">
    {[...Array(count)].map((_, i) => (
      <SkeletonProductListItem key={i} />
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
              <ImageIcon className="w-10 h-10 text-gray-300" aria-hidden="true" />
            </div>
          )}
        </div>
        
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {product.is_featured && (
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 text-white shadow-md flex items-center gap-1">
              <Award className="w-2.5 h-2.5" aria-hidden="true" />
              {t('buyer.products.featured')}
            </span>
          )}
          {product.discount_percentage > 0 && (
            <DiscountBadge percentage={product.discount_percentage} className="shadow-md" />
          )}
          {product.is_new && (
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" aria-hidden="true" />
              {t('buyer.products.new')}
            </span>
          )}
        </div>
        
        {product.quantity === 0 && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-10">
            <span className="px-3 py-1 text-[10px] font-bold rounded-full bg-gray-900 text-white shadow-lg">
              {t('buyer.products.outOfStock')}
            </span>
          </div>
        )}
      </div>
    </Link>
    
    <div className="p-3 flex-1 flex flex-col">
      <Link 
        to={`/buyer/shop/products/${product.id}`}
        className="focus:outline-none focus:ring-2 focus:ring-[#5C352C] focus:ring-offset-2 rounded"
      >
        <h3 className="font-bold text-gray-900 text-sm mb-1 hover:text-[#5C352C] transition-colors line-clamp-2 min-h-[40px]">
          {product.name}
        </h3>
      </Link>
      
      <div className="flex items-center gap-1.5 mb-2">
        <div className="flex items-center gap-0.5 bg-amber-50 px-1.5 py-0.5 rounded-lg">
          <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" aria-hidden="true" />
          <span className="text-[10px] font-bold text-amber-700">{product.average_rating ? product.average_rating.toFixed(1) : '5.0'}</span>
        </div>
        <span className="text-[9px] text-gray-400" aria-hidden="true">•</span>
        <span className="text-[10px] text-gray-500 font-medium">{product.sales_count || 0} {t('buyer.products.sold')}</span>
      </div>
      
      <div className="mb-2">
        <span className="font-bold text-[#5C352C] text-base">
          {formatPrice(product.discount_percentage > 0 ? product.discounted_price : product.price)}
        </span>
        {product.discount_percentage > 0 && (
          <span className="text-[10px] text-gray-400 line-through ml-1.5">{formatPrice(product.price)}</span>
        )}
      </div>
      
      <button
        onClick={() => addToCart(product.id)}
        disabled={product.quantity === 0 || addingToCart[product.id]}
        className={`mt-auto py-2 rounded-xl transition-all flex items-center justify-center gap-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5C352C] ${
          product.quantity === 0 
            ? 'bg-gray-100 cursor-not-allowed text-gray-400' 
            : 'bg-gradient-to-r from-[#5C352C] to-[#8B5E4F] text-white hover:shadow-lg transform hover:scale-105'
        }`}
        aria-label={product.quantity === 0 ? t('buyer.products.outOfStock') : `${t('buyer.products.addToCart')} ${product.name}`}
        aria-disabled={product.quantity === 0}
      >
        {addingToCart[product.id] ? (
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" aria-hidden="true"></div>
        ) : (
          <>
            <ShoppingCart className="w-3.5 h-3.5" aria-hidden="true" />
            {product.quantity === 0 ? t('buyer.products.outOfStock') : t('buyer.products.addToCart')}
          </>
        )}
      </button>
    </div>
  </div>
));

ProductCard.displayName = 'ProductCard';

// ==================== PRODUCT LIST ITEM COMPONENT ====================
const ProductListItem = React.memo(({ product, formatPrice, addToCart, addingToCart, handleImageError, imageErrors, t }) => (
  <div className="group bg-white rounded-xl shadow-lg border-2 border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:border-[#5C352C]/20">
    <div className="flex flex-row">
      <Link 
        to={`/buyer/shop/products/${product.id}`} 
        className="w-24 h-24 flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-[#5C352C] focus:ring-offset-2"
        aria-label={`${t('buyer.products.viewDetails')} ${product.name}`}
      >
        <div className="relative w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
          {product.image && !imageErrors[product.id] ? (
            <img 
              src={product.image} 
              alt={product.name} 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              onError={() => handleImageError(product.id)}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <ImageIcon className="w-8 h-8 text-gray-300" aria-hidden="true" />
            </div>
          )}
          
          {product.quantity === 0 && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="px-2 py-0.5 text-[9px] font-bold rounded-full bg-gray-900 text-white">
                {t('buyer.products.outOfStock')}
              </span>
            </div>
          )}
        </div>
      </Link>
      
      <div className="flex-1 p-3">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
          <div className="flex-1 min-w-0">
            <Link 
              to={`/buyer/shop/products/${product.id}`}
              className="focus:outline-none focus:ring-2 focus:ring-[#5C352C] focus:ring-offset-2 rounded"
            >
              <h3 className="font-bold text-gray-900 text-sm hover:text-[#5C352C] transition-colors line-clamp-1">
                {product.name}
              </h3>
            </Link>
            
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              <div className="flex items-center gap-0.5 bg-amber-50 px-1.5 py-0.5 rounded-lg">
                <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" aria-hidden="true" />
                <span className="text-[10px] font-bold text-amber-700">{product.average_rating ? product.average_rating.toFixed(1) : '5.0'}</span>
              </div>
              <span className="text-[9px] text-gray-400" aria-hidden="true">•</span>
              <span className="text-[10px] text-gray-500 font-medium">{product.sales_count || 0} {t('buyer.products.sold')}</span>
              <span className="text-[9px] text-gray-400" aria-hidden="true">•</span>
              <div className="flex items-center gap-1">
                <Shield className="w-2.5 h-2.5 text-emerald-500" aria-hidden="true" />
                <span className="text-[9px] text-gray-500 truncate">{t('buyer.products.by')} {product.seller?.name?.split(' ')[0] || t('buyer.products.seller')}</span>
              </div>
            </div>
            
            <div className="flex gap-2 mt-2">
              {product.delivery_free && (
                <span className="text-[9px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                  <Truck className="w-2.5 h-2.5" aria-hidden="true" />
                  {t('buyer.products.freeDelivery')}
                </span>
              )}
              {product.quantity > 50 && (
                <span className="text-[9px] font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                  <Zap className="w-2.5 h-2.5" aria-hidden="true" />
                  {t('buyer.products.inStock')}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="text-right">
              <span className="font-bold text-[#5C352C] text-base">
                {formatPrice(product.discount_percentage > 0 ? product.discounted_price : product.price)}
              </span>
              {product.discount_percentage > 0 && (
                <div className="flex items-center justify-end gap-1.5">
                  <span className="text-[10px] text-gray-400 line-through">{formatPrice(product.price)}</span>
                  <span className="text-[10px] font-bold text-rose-500">-{product.discount_percentage}%</span>
                </div>
              )}
            </div>
            
            <button
              onClick={() => addToCart(product.id)}
              disabled={product.quantity === 0 || addingToCart[product.id]}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center justify-center gap-1.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5C352C] ${
                product.quantity === 0 
                  ? 'bg-gray-100 cursor-not-allowed text-gray-400' 
                  : 'bg-gradient-to-r from-[#5C352C] to-[#8B5E4F] text-white hover:shadow-lg'
              }`}
              aria-label={product.quantity === 0 ? t('buyer.products.outOfStock') : `${t('buyer.products.addToCart')} ${product.name}`}
            >
              {addingToCart[product.id] ? (
                <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" aria-hidden="true"></div>
              ) : (
                <ShoppingCart className="w-3.5 h-3.5" aria-hidden="true" />
              )}
            </button>
            
            <Link
              to={`/buyer/shop/products/${product.id}`}
              className="p-2 rounded-xl border-2 border-gray-200 hover:border-[#5C352C] hover:bg-[#5C352C]/5 transition-all focus:outline-none focus:ring-2 focus:ring-[#5C352C] focus:ring-offset-2"
              aria-label={`${t('buyer.products.viewDetails')} ${product.name}`}
            >
              <Eye className="w-3.5 h-3.5 text-gray-600" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  </div>
));

ProductListItem.displayName = 'ProductListItem';

// ==================== MAIN PRODUCTS COMPONENT ====================
const Products = () => {
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [categories, setCategories] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [isMobile, setIsMobile] = useState(false);
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

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  // Debounced filter changes - only category and price range
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
        // Only include category and price range filters
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
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', 'assertive');
      announcement.className = 'sr-only';
      announcement.textContent = t('buyer.products.productAddedToCart');
      document.body.appendChild(announcement);
      setTimeout(() => announcement.remove(), 3000);
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

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="p-4 md:p-8">
          
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 bg-gradient-to-br from-[#5C352C] to-[#8B5E4F] rounded-xl shadow-lg">
                    <Tag className="w-5 h-5 text-white" aria-hidden="true" />
                  </div>
                  <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#5C352C] to-[#8B5E4F] bg-clip-text text-transparent">
                    {t('buyer.products.shop')}
                  </h1>
                </div>
                <p className="text-gray-500 text-sm ml-11">{t('buyer.products.subtitle')}</p>
              </div>
              <div className="flex items-center gap-3">
                <div 
                  className="bg-white px-4 py-2 rounded-xl shadow-md border border-gray-100"
                  role="status"
                  aria-label={`${pagination.total} ${t('buyer.products.products')} available`}
                >
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                    <span className="text-sm font-semibold text-gray-700">{pagination.total}</span>
                    <span className="text-xs text-gray-500">{t('buyer.products.products')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 p-4 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
                <input
                  type="text"
                  placeholder={t('buyer.products.searchPlaceholder')}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#5C352C] focus:ring-2 focus:ring-[#5C352C]/20 transition-all text-sm bg-gray-50"
                  aria-label="Search products"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={toggleFilters}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#5C352C] focus:ring-offset-2 ${
                    showFilters || hasActiveFilters
                      ? 'bg-gradient-to-r from-[#5C352C] to-[#8B5E4F] text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  aria-expanded={showFilters}
                >
                  <Filter className="w-4 h-4" aria-hidden="true" />
                  <span>{t('buyer.products.filters')}</span>
                  {hasActiveFilters && (
                    <span className="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-[10px]">
                      {t('buyer.products.active')}
                    </span>
                  )}
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} aria-hidden="true" />
                </button>
                
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#5C352C] focus:ring-2 focus:ring-[#5C352C]/20 text-sm font-semibold bg-gray-50 cursor-pointer"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
                
                {!isMobile && (
                  <div className="border-2 border-gray-200 rounded-xl overflow-hidden flex bg-gray-50">
                    <button
                      type="button"
                      onClick={() => setViewMode("grid")}
                      className={`p-3 px-4 transition-all focus:outline-none focus:ring-2 focus:ring-[#5C352C] focus:ring-offset-2 ${
                        viewMode === "grid" ? "bg-gradient-to-r from-[#5C352C] to-[#8B5E4F] text-white" : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <Grid className="w-4 h-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode("list")}
                      className={`p-3 px-4 transition-all focus:outline-none focus:ring-2 focus:ring-[#5C352C] focus:ring-offset-2 ${
                        viewMode === "list" ? "bg-gradient-to-r from-[#5C352C] to-[#8B5E4F] text-white" : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <List className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Filter Panel - Only Category and Price Range */}
            {showFilters && (
              <div 
                className="mt-5 pt-5 border-t-2 border-gray-100"
                onKeyDown={handleFilterPanelKeyDown}
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      {t('buyer.products.category')}
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#5C352C] text-sm bg-gray-50 font-medium"
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
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      {t('buyer.products.minPrice')}
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
                      <input
                        type="number"
                        placeholder="0"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#5C352C] text-sm bg-gray-50"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      {t('buyer.products.maxPrice')}
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
                      <input
                        type="number"
                        placeholder={t('buyer.products.any')}
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#5C352C] text-sm bg-gray-50"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Clear Filters Button */}
                {hasActiveFilters && (
                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="px-6 py-2.5 bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-xl hover:shadow-lg transition-all text-sm font-bold"
                    >
                      {t('buyer.products.clearAllFilters')}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Results Count */}
          <div className="mb-5 flex justify-between items-center">
            <div className="text-sm text-gray-600 bg-white px-4 py-2 rounded-xl shadow-md border border-gray-100">
              {t('buyer.products.showing')} <span className="font-bold text-[#5C352C]">{products.length}</span> {t('buyer.products.of')}{' '}
              <span className="font-bold">{pagination.total}</span> {t('buyer.products.products')}
            </div>
            {isMobile && (
              <div className="flex border-2 border-gray-200 rounded-xl overflow-hidden bg-white">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={`p-2 px-4 transition-all text-sm ${
                    viewMode === "grid" ? "bg-gradient-to-r from-[#5C352C] to-[#8B5E4F] text-white" : "text-gray-600"
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className={`p-2 px-4 transition-all text-sm ${
                    viewMode === "list" ? "bg-gradient-to-r from-[#5C352C] to-[#8B5E4F] text-white" : "text-gray-600"
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Products Display */}
          {loading ? (
            viewMode === "grid" ? <SkeletonGridLoader count={12} /> : <SkeletonListLoader count={6} />
          ) : error ? (
            <div className="bg-rose-50 border-2 border-rose-200 rounded-2xl p-10 text-center shadow-lg">
              <AlertTriangle className="w-16 h-16 text-rose-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-rose-800 mb-2">{t('buyer.products.errorLoading')}</h3>
              <p className="text-rose-600 text-sm mb-5">{error}</p>
              <button 
                onClick={() => fetchProducts(1)} 
                className="px-6 py-2.5 bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-xl hover:shadow-lg transition-all text-sm font-bold"
              >
                {t('buyer.products.tryAgain')}
              </button>
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 p-12 text-center">
              <ShoppingCart className="w-20 h-20 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-bold text-gray-700 mb-2">{t('buyer.products.noProductsFound')}</h3>
              <p className="text-gray-500 text-sm mb-5">{t('buyer.products.adjustFilters')}</p>
              {hasActiveFilters && (
                <button 
                  onClick={clearFilters} 
                  className="px-6 py-2.5 bg-gradient-to-r from-[#5C352C] to-[#8B5E4F] text-white rounded-xl hover:shadow-lg transition-all text-sm font-bold"
                >
                  {t('buyer.products.clearAllFilters')}
                </button>
              )}
            </div>
          ) : (
            <>
              {viewMode === "grid" ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
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
              ) : (
                <div className="space-y-4">
                  {products.map((product) => (
                    <ProductListItem 
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
              )}
              
              {/* Loading More Indicator */}
              {loadingMore && (
                <div className="mt-6">
                  {viewMode === "grid" ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                      {[...Array(6)].map((_, i) => (
                        <SkeletonProductCard key={`more-${i}`} />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <SkeletonProductListItem key={`more-${i}`} />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Pagination */}
          {!loading && products.length > 0 && pagination.last_page > 1 && (
            <div className="mt-10 flex justify-center">
              {isMobile ? (
                <button
                  type="button"
                  onClick={loadMore}
                  disabled={loadingMore || pagination.current_page === pagination.last_page}
                  className="px-8 py-3 bg-gradient-to-r from-[#5C352C] to-[#8B5E4F] text-white rounded-xl hover:shadow-lg transition-all text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingMore ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent inline-block mr-2"></div>
                      {t('buyer.products.loading')}
                    </>
                  ) : (
                    `${t('buyer.products.loadMore')} (${pagination.current_page}/${pagination.last_page})`
                  )}
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => fetchProducts(pagination.current_page - 1)}
                    disabled={pagination.current_page === 1}
                    className="px-4 py-2 border-2 border-gray-200 rounded-xl text-sm disabled:opacity-50 hover:border-[#5C352C] hover:text-[#5C352C] transition-all bg-white font-semibold"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <div className="flex gap-2">
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
                          className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${
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
                    className="px-4 py-2 border-2 border-gray-200 rounded-xl text-sm disabled:opacity-50 hover:border-[#5C352C] hover:text-[#5C352C] transition-all bg-white font-semibold"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Products;
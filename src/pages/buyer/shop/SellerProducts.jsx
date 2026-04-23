import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import MainLayout from "../../../layouts/MainLayout";
import api from "../../../api/axios";
import { useToast } from "../../../contexts/ToastContext";
import { useLanguage } from "../../../contexts/LanguageContext";
import DiscountBadge from "../../../components/common/DiscountBadge";
import { 
  ArrowLeft, 
  ShoppingCart, 
  DollarSign, 
  Package,
  Store,
  Search,
  Star,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  MapPin,
  Clock,
  Eye,
  Shield,
  AlertTriangle,
  RefreshCw,
  X,
  Grid,
  List,
  Filter,
  ChevronDown,
  TrendingUp,
  Award,
  BadgeCheck,
  Truck,
  Zap,
  Sparkles,
  Heart
} from "lucide-react";

// ==================== INSTAGRAM-STYLE SHIMMER ANIMATION ====================
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

// ==================== SKELETON LOADERS ====================
const SkeletonProductCard = () => (
  <div className="animate-pulse">
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="relative w-full pt-[100%] bg-gradient-to-br from-gray-200 to-gray-300"></div>
      <div className="p-3 space-y-2">
        <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-3/4"></div>
        <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-1/2"></div>
        <div className="h-5 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-1/3"></div>
        <div className="h-8 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-lg w-full mt-2"></div>
      </div>
    </div>
  </div>
);

const SkeletonProductListItem = () => (
  <div className="animate-pulse">
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="flex">
        <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300"></div>
        <div className="flex-1 p-3 space-y-2">
          <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-2/3"></div>
          <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-1/3"></div>
          <div className="h-5 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-1/4"></div>
        </div>
      </div>
    </div>
  </div>
);

// ==================== PRODUCT CARD COMPONENT ====================
const ProductCard = React.memo(({ product, formatPrice, addToCart, addingToCart, handleImageError, imageErrors, t }) => (
  <div className="group bg-white rounded-xl shadow-lg border-2 border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
    <Link 
      to={`/buyer/shop/products/${product.id}`}
      className="block focus:outline-none focus:ring-2 focus:ring-[#5C352C] focus:ring-offset-2 rounded-t-xl"
      aria-label={`${t('buyer.sellerProducts.viewDetails')} ${product.name}`}
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
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <ImageIcon className="w-10 h-10 text-gray-300" />
            </div>
          )}
        </div>
        
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {product.is_featured && (
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 text-white shadow-md flex items-center gap-1">
              <Award className="w-2.5 h-2.5" />
              {t('buyer.sellerProducts.featured')}
            </span>
          )}
          {product.discount_percentage > 0 && (
            <DiscountBadge percentage={product.discount_percentage} className="shadow-md" />
          )}
          {product.is_new && (
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md flex items-center gap-1">
              <Zap className="w-2.5 h-2.5" />
              {t('buyer.sellerProducts.new')}
            </span>
          )}
        </div>
        
        {product.quantity === 0 && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-10">
            <span className="px-3 py-1 text-[10px] font-bold rounded-full bg-gray-900 text-white shadow-lg">
              {t('buyer.sellerProducts.outOfStock')}
            </span>
          </div>
        )}
      </div>
    </Link>
    
    <div className="p-3">
      <Link 
        to={`/buyer/shop/products/${product.id}`}
        className="block focus:outline-none focus:ring-2 focus:ring-[#5C352C] focus:ring-offset-2 rounded"
      >
        <h3 className="font-bold text-gray-900 text-sm hover:text-[#5C352C] transition-colors line-clamp-2 min-h-[40px]">
          {product.name}
        </h3>
      </Link>
      
      <div className="flex items-center gap-1.5 mt-1">
        <div className="flex items-center gap-0.5 bg-amber-50 px-1.5 py-0.5 rounded-lg">
          <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
          <span className="text-[10px] font-bold text-amber-700">{product.average_rating ? product.average_rating.toFixed(1) : '5.0'}</span>
        </div>
        <span className="text-[9px] text-gray-400">•</span>
        <span className="text-[10px] text-gray-500 font-medium">{product.sales_count || 0} {t('buyer.sellerProducts.sold')}</span>
      </div>
      
      <div className="mt-2">
        <span className="font-bold text-[#5C352C] text-base">
          {formatPrice(product.price)}
        </span>
        {product.discount_percentage > 0 && (
          <span className="text-[10px] text-gray-400 line-through ml-1.5">{formatPrice(product.original_price)}</span>
        )}
      </div>
      
      <button
        onClick={() => addToCart(product.id)}
        disabled={product.quantity === 0 || addingToCart[product.id]}
        className={`mt-3 w-full py-2 rounded-xl transition-all flex items-center justify-center gap-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5C352C] ${
          product.quantity === 0 
            ? 'bg-gray-100 cursor-not-allowed text-gray-400' 
            : 'bg-gradient-to-r from-[#5C352C] to-[#8B5E4F] text-white hover:shadow-lg transform hover:scale-105'
        }`}
        aria-label={product.quantity === 0 ? t('buyer.sellerProducts.outOfStock') : `${t('buyer.sellerProducts.addToCart')} ${product.name}`}
      >
        {addingToCart[product.id] ? (
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
        ) : (
          <>
            <ShoppingCart className="w-3.5 h-3.5" />
            {product.quantity === 0 ? t('buyer.sellerProducts.outOfStock') : t('buyer.sellerProducts.addToCart')}
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
        aria-label={`${t('buyer.sellerProducts.viewDetails')} ${product.name}`}
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
              <ImageIcon className="w-8 h-8 text-gray-300" />
            </div>
          )}
          
          {product.quantity === 0 && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="px-2 py-0.5 text-[9px] font-bold rounded-full bg-gray-900 text-white">
                {t('buyer.sellerProducts.outOfStock')}
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
                <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                <span className="text-[10px] font-bold text-amber-700">{product.average_rating ? product.average_rating.toFixed(1) : '5.0'}</span>
              </div>
              <span className="text-[9px] text-gray-400">•</span>
              <span className="text-[10px] text-gray-500 font-medium">{product.sales_count || 0} {t('buyer.sellerProducts.sold')}</span>
              <span className="text-[9px] text-gray-400">•</span>
              <div className="flex items-center gap-1">
                <Package className="w-2.5 h-2.5 text-gray-400" />
                <span className="text-[10px] text-gray-500">{t('buyer.sellerProducts.stock')}: {product.quantity}</span>
              </div>
            </div>
            
            <p className="text-[10px] text-gray-400 mt-1 line-clamp-1">{product.description}</p>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="text-right">
              <span className="font-bold text-[#5C352C] text-base">
                {formatPrice(product.price)}
              </span>
              {product.discount_percentage > 0 && (
                <div className="flex items-center justify-end gap-1.5">
                  <span className="text-[10px] text-gray-400 line-through">{formatPrice(product.original_price)}</span>
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
              aria-label={product.quantity === 0 ? t('buyer.sellerProducts.outOfStock') : `${t('buyer.sellerProducts.addToCart')} ${product.name}`}
            >
              {addingToCart[product.id] ? (
                <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
              ) : (
                <ShoppingCart className="w-3.5 h-3.5" />
              )}
            </button>
            
            <Link
              to={`/buyer/shop/products/${product.id}`}
              className="p-2 rounded-xl border-2 border-gray-200 hover:border-[#5C352C] hover:bg-[#5C352C]/5 transition-all focus:outline-none focus:ring-2 focus:ring-[#5C352C] focus:ring-offset-2"
              aria-label={`${t('buyer.sellerProducts.viewDetails')} ${product.name}`}
            >
              <Eye className="w-3.5 h-3.5 text-gray-600" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  </div>
));

ProductListItem.displayName = 'ProductListItem';

// ==================== MAIN COMPONENT ====================
const SellerProducts = () => {
  const { id } = useParams();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [addingToCart, setAddingToCart] = useState({});
  const [imageErrors, setImageErrors] = useState({});
  const [logoError, setLogoError] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("latest");
  const [showFilters, setShowFilters] = useState(false);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const searchInputRef = useRef(null);

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
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    fetchSellerProducts();
  }, [id, currentPage, search, sortBy, minPrice, maxPrice]);

  const fetchSellerProducts = async () => {
    setLoading(true);
    try {
      const params = { page: currentPage };
      if (search) params.search = search;
      if (sortBy) params.sort_by = sortBy;
      if (minPrice) params.min_price = minPrice;
      if (maxPrice) params.max_price = maxPrice;
      
      const response = await api.get(`/buyer/shop/sellers/${id}/products`, { params });
      setSeller(response.data.seller);
      setProducts(response.data.products.data);
      setCurrentPage(response.data.products.current_page);
      setLastPage(response.data.products.last_page);
      setTotal(response.data.products.total);
      setImageErrors({});
      setLogoError(false);
    } catch (error) {
      showToast(error.response?.data?.message || t('buyer.sellerProducts.failedToLoadProducts'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchSellerProducts();
    setRefreshing(false);
    showToast(t('buyer.sellerProducts.productsRefreshed'), 'success');
  };

  const addToCart = async (productId) => {
    setAddingToCart(prev => ({ ...prev, [productId]: true }));
    try {
      await api.post('/buyer/cart/add', { product_id: productId, quantity: 1 });
      showToast(t('buyer.sellerProducts.productAddedToCart'), 'success');
    } catch (error) {
      showToast(error.response?.data?.message || t('buyer.sellerProducts.errorAddingToCart'), 'error');
    } finally {
      setAddingToCart(prev => ({ ...prev, [productId]: false }));
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= lastPage) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const formatPrice = (price) => `Tsh ${Number(price).toLocaleString()}`;

  const handleImageError = (productId) => {
    setImageErrors(prev => ({ ...prev, [productId]: true }));
  };

  const handleLogoError = () => setLogoError(true);

  const clearFilters = () => {
    setMinPrice("");
    setMaxPrice("");
    setSortBy("latest");
    setSearch("");
    setShowFilters(false);
    setCurrentPage(1);
    showToast(t('buyer.sellerProducts.filtersCleared'), 'info');
  };

  const hasActiveFilters = minPrice || maxPrice || search || sortBy !== "latest";

  const getPaginationPages = () => {
    const pages = [];
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(lastPage, startPage + maxVisible - 1);
    
    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) pages.push(i);
    return pages;
  };

  const sortOptions = [
    { value: "latest", label: t('buyer.sellerProducts.latestArrivals') },
    { value: "price_low", label: t('buyer.sellerProducts.priceLowToHigh') },
    { value: "price_high", label: t('buyer.sellerProducts.priceHighToLow') },
    { value: "popular", label: t('buyer.sellerProducts.mostPopular') },
  ];

  if (loading && !seller) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-4">
              <div className="h-4 w-32 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded"></div>
            </div>
            <div className="bg-gradient-to-r from-[#2A1713] to-[#5C352C] rounded-xl overflow-hidden mb-6">
              <div className="p-5">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white/20 rounded-xl animate-shimmer"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-5 bg-white/20 rounded w-48 animate-shimmer"></div>
                    <div className="h-3 bg-white/20 rounded w-32 animate-shimmer"></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {[...Array(10)].map((_, i) => <SkeletonProductCard key={i} />)}
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!seller) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-4 md:p-8">
          <div className="max-w-md mx-auto text-center">
            <div className="bg-white rounded-2xl shadow-xl border-2 border-rose-100 p-8">
              <AlertTriangle className="w-16 h-16 text-rose-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">{t('buyer.sellerProducts.sellerNotFoundTitle')}</h2>
              <p className="text-gray-500 mb-6">{t('buyer.sellerProducts.sellerNotFoundDesc')}</p>
              <Link to="/buyer/shop/sellers" className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#5C352C] to-[#8B5E4F] text-white rounded-xl hover:shadow-lg transition-all font-semibold">
                <ArrowLeft className="w-4 h-4" />
                {t('buyer.sellerProducts.backToSellersButton')}
              </Link>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm mb-4 flex-wrap">
              <Link to="/" className="text-gray-500 hover:text-[#5C352C] transition-colors">{t('buyer.sellerProducts.home')}</Link>
              <ChevronRight className="w-3 h-3 text-gray-400" />
              <Link to="/buyer/shop/sellers" className="text-gray-500 hover:text-[#5C352C] transition-colors">{t('buyer.sellerProducts.sellers')}</Link>
              <ChevronRight className="w-3 h-3 text-gray-400" />
              <span className="text-[#5C352C] font-semibold truncate max-w-[200px]">{seller.store_name || seller.name}</span>
            </nav>

            {/* Back Button */}
            <Link 
              to="/buyer/shop/sellers" 
              className="inline-flex items-center gap-2 text-[#5C352C] hover:text-[#4A2A22] mb-6 group font-medium"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>{t('buyer.sellerProducts.backToSellers')}</span>
            </Link>

            {/* Enhanced Seller Info Header */}
            <div className="bg-gradient-to-r from-[#2A1713] to-[#5C352C] rounded-2xl overflow-hidden mb-8 shadow-xl">
              <div className="p-6">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-5">
                  <div className="w-16 h-16 bg-white/10 rounded-xl flex items-center justify-center shadow-lg">
                    {seller.store_logo && !logoError ? (
                      <img 
                        src={seller.store_logo} 
                        alt={seller.name}
                        className="w-full h-full object-cover rounded-xl"
                        onError={handleLogoError}
                      />
                    ) : (
                      <Store className="w-8 h-8 text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h1 className="text-xl md:text-2xl font-bold text-white">{seller.store_name || seller.name}</h1>
                      <BadgeCheck className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="text-sm font-semibold text-white">{seller.rating || '4.5'}</span>
                        <span className="text-xs text-white/60">({seller.reviews_count || 0} {t('buyer.sellerProducts.reviews')})</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full">
                        <Package className="w-3.5 h-3.5 text-white/80" />
                        <span className="text-sm font-semibold text-white">{total}</span>
                        <span className="text-xs text-white/60">{t('buyer.sellerProducts.products')}</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full">
                        <Shield className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-sm font-semibold text-white">{t('buyer.sellerProducts.verified')}</span>
                      </div>
                    </div>
                    {seller.location && (
                      <div className="flex items-center gap-1 mt-3 text-white/70">
                        <MapPin className="w-3.5 h-3.5" />
                        <span className="text-xs">{seller.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Search and Filter Bar - Enhanced */}
            <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 p-4 mb-6">
              <div className="flex flex-wrap gap-3">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder={t('buyer.sellerProducts.searchPlaceholder', { seller: seller.store_name || seller.name })}
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full pl-11 pr-10 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#5C352C] focus:ring-2 focus:ring-[#5C352C]/20 transition-all bg-gray-50 focus:bg-white"
                    />
                    {search && (
                      <button
                        onClick={() => setSearch("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:border-[#5C352C] focus:ring-2 focus:ring-[#5C352C]/20 transition-all cursor-pointer font-medium"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
                
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#5C352C] ${
                    showFilters || hasActiveFilters
                      ? 'bg-gradient-to-r from-[#5C352C] to-[#8B5E4F] text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  {t('buyer.sellerProducts.filters')}
                  {hasActiveFilters && <span className="ml-1 w-2 h-2 bg-white rounded-full" />}
                  <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </button>
                
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="p-2.5 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                  aria-label={t('buyer.sellerProducts.refresh')}
                >
                  <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                </button>
                
                {/* View Toggle */}
                <div className="flex border-2 border-gray-200 rounded-xl overflow-hidden bg-white">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 px-4 transition-all ${
                      viewMode === "grid" ? "bg-gradient-to-r from-[#5C352C] to-[#8B5E4F] text-white" : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 px-4 transition-all ${
                      viewMode === "list" ? "bg-gradient-to-r from-[#5C352C] to-[#8B5E4F] text-white" : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Filter Panel */}
              {showFilters && (
                <div className="mt-5 pt-5 border-t-2 border-gray-100">
                  <div className="flex flex-wrap gap-4 items-end">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">{t('buyer.sellerProducts.minPrice')}</label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="number"
                          placeholder="0"
                          value={minPrice}
                          onChange={(e) => {
                            setMinPrice(e.target.value);
                            setCurrentPage(1);
                          }}
                          className="pl-9 pr-3 py-2 w-36 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#5C352C] bg-gray-50"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">{t('buyer.sellerProducts.maxPrice')}</label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="number"
                          placeholder={t('buyer.sellerProducts.any')}
                          value={maxPrice}
                          onChange={(e) => {
                            setMaxPrice(e.target.value);
                            setCurrentPage(1);
                          }}
                          className="pl-9 pr-3 py-2 w-36 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#5C352C] bg-gray-50"
                        />
                      </div>
                    </div>
                    {hasActiveFilters && (
                      <button
                        onClick={clearFilters}
                        className="px-4 py-2 bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-xl text-xs font-bold hover:shadow-lg transition-all"
                      >
                        {t('buyer.sellerProducts.clearAll')}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Results Count */}
            <div className="mb-5 flex justify-between items-center">
              <div className="text-sm text-gray-600 bg-white px-4 py-2 rounded-xl shadow-md border border-gray-100">
                {t('buyer.sellerProducts.showing')} <span className="font-bold text-[#5C352C]">{products.length}</span> {t('buyer.sellerProducts.of')}{' '}
                <span className="font-bold">{total}</span> {t('buyer.sellerProducts.productsCount')}
                {search && <span> {t('buyer.sellerProducts.matching')} "<span className="italic">{search}</span>"</span>}
              </div>
            </div>

            {/* Products Display */}
            {loading ? (
              <div className={viewMode === "grid" 
                ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
                : "space-y-3"
              }>
                {[...Array(10)].map((_, i) => 
                  viewMode === "grid" ? <SkeletonProductCard key={i} /> : <SkeletonProductListItem key={i} />
                )}
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 p-12 text-center">
                <Package className="w-20 h-20 mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-bold text-gray-700 mb-2">{t('buyer.sellerProducts.noProductsFound')}</h3>
                <p className="text-gray-500 text-sm mb-5">
                  {search || hasActiveFilters ? t('buyer.sellerProducts.adjustFilters') : t('buyer.sellerProducts.noProductsFromSeller')}
                </p>
                {(search || hasActiveFilters) && (
                  <button onClick={clearFilters} className="px-6 py-2.5 bg-gradient-to-r from-[#5C352C] to-[#8B5E4F] text-white rounded-xl hover:shadow-lg transition-all text-sm font-bold">
                    {t('buyer.sellerProducts.clearFilters')}
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className={viewMode === "grid" 
                  ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
                  : "space-y-3"
                }>
                  {products.map((product) => (
                    viewMode === "grid" ? (
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
                    ) : (
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
                    )
                  ))}
                </div>

                {/* Enhanced Pagination */}
                {lastPage > 1 && (
                  <nav className="mt-10 flex justify-center" aria-label={t('buyer.sellerProducts.goToPage', { page: '' })}>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-4 py-2 border-2 border-gray-200 rounded-xl text-sm disabled:opacity-50 hover:border-[#5C352C] hover:text-[#5C352C] transition-all bg-white font-semibold"
                        aria-label={t('buyer.sellerProducts.goToPreviousPage')}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      
                      {getPaginationPages().map(page => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${
                            currentPage === page
                              ? 'bg-gradient-to-r from-[#5C352C] to-[#8B5E4F] text-white shadow-lg'
                              : 'bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-[#5C352C]'
                          }`}
                          aria-label={t('buyer.sellerProducts.goToPage', { page })}
                          aria-current={currentPage === page ? 'page' : undefined}
                        >
                          {page}
                        </button>
                      ))}
                      
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === lastPage}
                        className="px-4 py-2 border-2 border-gray-200 rounded-xl text-sm disabled:opacity-50 hover:border-[#5C352C] hover:text-[#5C352C] transition-all bg-white font-semibold"
                        aria-label={t('buyer.sellerProducts.goToNextPage')}
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
      </div>
    </MainLayout>
  );
};

export default SellerProducts;
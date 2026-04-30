// src/pages/seller/inventory/OutOfStockProducts.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../../../layouts/MainLayout";
import api from "../../../api/axios";
import { useToast } from "../../../contexts/ToastContext";
import { useLanguage } from "../../../contexts/LanguageContext";
import { 
  XCircle, 
  RefreshCw, 
  Edit, 
  Eye,
  DollarSign,
  Package,
  AlertCircle,
  TrendingDown,
  Search,
  Filter,
  ChevronDown,
  ArrowUpRight,
  Info,
  CheckCircle
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
const SkeletonStatCard = () => (
  <div className="bg-white rounded-xl border border-gray-100 p-3 sm:p-4 overflow-hidden">
    <div className="flex items-center justify-between">
      <div>
        <div className="h-2 sm:h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-16 sm:w-20 mb-1 sm:mb-2"></div>
        <div className="h-5 sm:h-7 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-12 sm:w-16"></div>
      </div>
      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-lg"></div>
    </div>
  </div>
);

const SkeletonProductCard = () => (
  <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-5 overflow-hidden">
    <div className="flex justify-between mb-2 sm:mb-3">
      <div className="h-4 sm:h-5 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-3/4"></div>
      <div className="h-5 sm:h-6 w-16 sm:w-20 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-full"></div>
    </div>
    <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
      <div className="h-2 sm:h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-full"></div>
      <div className="h-2 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-3/4"></div>
    </div>
    <div className="flex gap-2">
      <div className="flex-1 h-8 sm:h-9 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-lg"></div>
      <div className="flex-1 h-8 sm:h-9 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-lg"></div>
    </div>
  </div>
);

const OutOfStockProducts = () => {
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("name_asc");
  const [isMobile, setIsMobile] = useState(false);
  const [isSmallMobile, setIsSmallMobile] = useState(false);

  // Check screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsSmallMobile(window.innerWidth < 480);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Add shimmer style
  useEffect(() => {
    if (!document.querySelector('#shimmer-styles-out-of-stock')) {
      const style = document.createElement('style');
      style.id = 'shimmer-styles-out-of-stock';
      style.textContent = shimmerStyle;
      document.head.appendChild(style);
    }
  }, []);

  useEffect(() => {
    fetchOutOfStockProducts();
  }, []);

  useEffect(() => {
    let filtered = [...products];
    if (searchTerm) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    switch (sortBy) {
      case "price_asc": filtered.sort((a, b) => a.price - b.price); break;
      case "price_desc": filtered.sort((a, b) => b.price - a.price); break;
      case "sales_desc": filtered.sort((a, b) => (b.sales_count || 0) - (a.sales_count || 0)); break;
      default: filtered.sort((a, b) => a.name.localeCompare(b.name));
    }
    setFilteredProducts(filtered);
  }, [searchTerm, sortBy, products]);

  const fetchOutOfStockProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/seller/inventory/out-of-stock');
      setProducts(response.data || []);
      setFilteredProducts(response.data || []);
    } catch (error) {
      setError(t('seller.outOfStockProducts.failedToLoad'));
      showToast(t('seller.outOfStockProducts.failedToLoad'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => `${t('seller.outOfStockProducts.currency')} ${Number(price || 0).toLocaleString()}`;

  const totalPotentialRevenue = products.reduce((sum, p) => sum + p.price, 0);
  const averagePrice = products.length > 0 
    ? products.reduce((sum, p) => sum + p.price, 0) / products.length 
    : 0;

  if (loading && products.length === 0) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
              <div>
                <div className="h-6 sm:h-7 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-32 sm:w-40"></div>
                <div className="h-3 sm:h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-48 sm:w-64 mt-1"></div>
              </div>
              <div className="flex gap-2 sm:gap-3">
                <div className="h-8 sm:h-9 w-20 sm:w-24 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-lg"></div>
                <div className="h-8 sm:h-9 w-16 sm:w-20 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-lg"></div>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
              {[1, 2, 3, 4].map(i => <SkeletonStatCard key={i} />)}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5">
              {[1, 2, 3].map(i => <SkeletonProductCard key={i} />)}
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
          <div className="max-w-md mx-auto bg-white rounded-xl border border-gray-100 p-6 sm:p-8 text-center">
            <XCircle className="w-10 h-10 sm:w-12 sm:h-12 text-red-400 mx-auto mb-3" />
            <p className="text-red-600 text-xs sm:text-sm">{error}</p>
            <button 
              onClick={fetchOutOfStockProducts} 
              className="mt-3 sm:mt-4 px-3 sm:px-4 py-1.5 sm:py-2 bg-[#5C352C] text-white rounded-lg text-xs sm:text-sm"
            >
              {t('seller.outOfStockProducts.tryAgain')}
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="p-3 sm:p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
          
            {/* Header - Responsive */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div>
                <div className="flex items-center gap-2 sm:gap-3 mb-1">
                  <div className="p-1.5 sm:p-2 bg-rose-500/10 rounded-lg sm:rounded-xl">
                    <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-rose-600" />
                  </div>
                  <h1 className="text-lg sm:text-xl font-semibold text-gray-900">{t('seller.outOfStockProducts.title')}</h1>
                </div>
                <p className="text-xs sm:text-sm text-gray-500 ml-8 sm:ml-11">{t('seller.outOfStockProducts.subtitle')}</p>
              </div>
              <div className="flex gap-2 sm:gap-3">
                <Link to="/seller/inventory/bulk-update">
                  <button className="px-2.5 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-sm text-white bg-gradient-to-r from-[#5C352C] to-[#8B5E4F] rounded-lg hover:shadow-md transition-all">
                    <span className="hidden xs:inline">{t('seller.outOfStockProducts.bulkRestock')}</span>
                    <span className="xs:hidden">{t('seller.outOfStockProducts.bulkRestockShort')}</span>
                  </button>
                </Link>
                <button 
                  onClick={fetchOutOfStockProducts} 
                  className="p-1.5 sm:px-3 sm:py-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>

            {/* Stats - Responsive */}
            {products.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                <div className="bg-white rounded-xl border-2 border-gray-100 p-2 sm:p-3 shadow-sm">
                  <p className="text-lg sm:text-2xl font-bold text-rose-600">{products.length}</p>
                  <p className="text-[8px] sm:text-xs text-gray-500">{t('seller.outOfStockProducts.outOfStockLabel')}</p>
                </div>
                <div className="bg-white rounded-xl border-2 border-gray-100 p-2 sm:p-3 shadow-sm">
                  <p className="text-[11px] sm:text-sm font-bold text-amber-600 truncate">{formatPrice(totalPotentialRevenue)}</p>
                  <p className="text-[8px] sm:text-xs text-gray-500">{t('seller.outOfStockProducts.potentialRevenue')}</p>
                </div>
                <div className="bg-white rounded-xl border-2 border-gray-100 p-2 sm:p-3 shadow-sm">
                  <p className="text-[11px] sm:text-sm font-bold text-blue-600 truncate">{formatPrice(averagePrice)}</p>
                  <p className="text-[8px] sm:text-xs text-gray-500">{t('seller.outOfStockProducts.avgPrice')}</p>
                </div>
                <div className="bg-white rounded-xl border-2 border-gray-100 p-2 sm:p-3 shadow-sm">
                  <p className="text-lg sm:text-2xl font-bold text-rose-600">{t('seller.outOfStockProducts.high')}</p>
                  <p className="text-[8px] sm:text-xs text-gray-500">{t('seller.outOfStockProducts.lostSalesRisk')}</p>
                </div>
              </div>
            )}

            {/* Urgent Warning - Responsive */}
            {products.length > 0 && (
              <div className="bg-rose-50 rounded-lg p-2 sm:p-3 border border-rose-100">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-600" />
                  <p className="text-[10px] sm:text-xs text-rose-700">
                    {t('seller.outOfStockProducts.urgentWarning', { count: products.length })}
                  </p>
                </div>
              </div>
            )}

            {/* Search and Filters - Responsive */}
            {products.length > 0 && (
              <div className="bg-white rounded-xl border-2 border-gray-100 p-3 sm:p-4 shadow-sm">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 min-w-[180px] relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder={isSmallMobile ? t('seller.outOfStockProducts.searchShort') : t('seller.outOfStockProducts.searchPlaceholder')} 
                      value={searchTerm} 
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-8 sm:pl-9 pr-3 py-1.5 sm:py-2 border-2 border-gray-200 rounded-lg text-xs sm:text-sm bg-gray-50 focus:outline-none focus:border-[#5C352C] focus:ring-2 focus:ring-[#5C352C]/20 transition-all" 
                    />
                  </div>
                  <button 
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm transition-colors ${
                      showFilters ? 'bg-gradient-to-r from-[#5C352C] to-[#8B5E4F] text-white shadow-md' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    <Filter className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden xs:inline">{t('seller.outOfStockProducts.sort')}</span>
                    <ChevronDown className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                  </button>
                </div>

                {showFilters && (
                  <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t-2 border-gray-100">
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      <button 
                        onClick={() => setSortBy("name_asc")}
                        className={`px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs rounded-lg transition-colors ${
                          sortBy === "name_asc" ? 'bg-gradient-to-r from-[#5C352C] to-[#8B5E4F] text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {t('seller.outOfStockProducts.nameAToZ')}
                      </button>
                      <button 
                        onClick={() => setSortBy("price_asc")}
                        className={`px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs rounded-lg transition-colors ${
                          sortBy === "price_asc" ? 'bg-gradient-to-r from-[#5C352C] to-[#8B5E4F] text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {t('seller.outOfStockProducts.priceLowToHigh')}
                      </button>
                      <button 
                        onClick={() => setSortBy("price_desc")}
                        className={`px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs rounded-lg transition-colors ${
                          sortBy === "price_desc" ? 'bg-gradient-to-r from-[#5C352C] to-[#8B5E4F] text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {t('seller.outOfStockProducts.priceHighToLow')}
                      </button>
                      <button 
                        onClick={() => setSortBy("sales_desc")}
                        className={`px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs rounded-lg transition-colors ${
                          sortBy === "sales_desc" ? 'bg-gradient-to-r from-[#5C352C] to-[#8B5E4F] text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {t('seller.outOfStockProducts.bestSellersFirst')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Empty State - Responsive */}
            {!loading && !error && products.length === 0 && (
              <div className="bg-white rounded-xl border-2 border-gray-100 p-8 sm:p-12 text-center">
                <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-emerald-400 mx-auto mb-3" />
                <h3 className="text-sm sm:text-base font-medium text-gray-900 mb-1">{t('seller.outOfStockProducts.noOutOfStock')}</h3>
                <p className="text-xs sm:text-sm text-gray-500">{t('seller.outOfStockProducts.allProductsInStock')}</p>
              </div>
            )}

            {/* Products Grid - Responsive */}
            {!loading && !error && products.length > 0 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5">
                  {filteredProducts.map((product) => (
                    <div key={product.id} className="bg-white rounded-xl border-2 border-gray-100 overflow-hidden hover:shadow-md transition-all">
                      <div className="p-3 sm:p-4">
                        <div className="flex justify-between items-start mb-2 sm:mb-3">
                          <Link to={`/seller/products/${product.id}`}>
                            <h3 className="font-medium text-gray-900 text-xs sm:text-sm hover:text-[#5C352C] line-clamp-2">{product.name}</h3>
                          </Link>
                          <span className="px-1.5 sm:px-2 py-0.5 text-[8px] sm:text-[10px] font-medium bg-rose-50 text-rose-600 rounded-full">
                            {isSmallMobile ? t('seller.outOfStockProducts.outOfStockShort') : t('seller.outOfStockProducts.outOfStockBadge')}
                          </span>
                        </div>
                        
                        <p className="text-[9px] sm:text-xs text-gray-500 mb-2 sm:mb-3 line-clamp-2">
                          {product.description || t('seller.outOfStockProducts.noDescription')}
                        </p>
                        
                        <div className="bg-rose-50 rounded-lg p-1.5 sm:p-2 text-center mb-2 sm:mb-3">
                          <p className="text-[9px] sm:text-xs text-rose-600 font-medium">
                            ⚠️ {isSmallMobile ? t('seller.outOfStockProducts.unavailableShort') : t('seller.outOfStockProducts.currentlyUnavailable')}
                          </p>
                        </div>
                        
                        <div className="flex justify-between text-[10px] sm:text-xs mb-2 sm:mb-3">
                          <span className="text-gray-500">{t('seller.outOfStockProducts.price')}</span>
                          <span className="font-semibold text-[#5C352C]">{formatPrice(product.price)}</span>
                        </div>
                        {product.sales_count > 0 && (
                          <div className="flex justify-between text-[10px] sm:text-xs mb-2 sm:mb-3">
                            <span className="text-gray-500">{t('seller.outOfStockProducts.totalSold')}</span>
                            <span className="text-gray-700">{product.sales_count} {t('seller.outOfStockProducts.units')}</span>
                          </div>
                        )}
                        
                        <div className="flex gap-1.5 sm:gap-2 pt-2">
                          <Link to={`/seller/products/${product.id}`} className="flex-1">
                            <button className="w-full py-1 sm:py-1.5 text-[10px] sm:text-xs text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                              {t('seller.outOfStockProducts.view')}
                            </button>
                          </Link>
                          <Link to={`/seller/products/${product.id}/edit`} className="flex-1">
                            <button className="w-full py-1 sm:py-1.5 text-[10px] sm:text-xs text-white bg-gradient-to-r from-[#5C352C] to-[#8B5E4F] rounded-lg hover:shadow-md transition-all">
                              {t('seller.outOfStockProducts.restock')}
                            </button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* No search results - Responsive */}
                {filteredProducts.length === 0 && searchTerm && (
                  <div className="bg-white rounded-xl border-2 border-gray-100 p-6 sm:p-8 text-center">
                    <Search className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-2 sm:mb-3" />
                    <p className="text-xs sm:text-sm text-gray-500">
                      {t('seller.outOfStockProducts.noProductsFound', { searchTerm })}
                    </p>
                    <button 
                      onClick={() => setSearchTerm("")} 
                      className="mt-2 text-[11px] sm:text-sm text-[#5C352C] hover:underline"
                    >
                      {t('seller.outOfStockProducts.clearSearch')}
                    </button>
                  </div>
                )}

                {/* Lost Sales Alert - Responsive */}
                <div className="bg-amber-50 rounded-lg p-2 sm:p-3 border border-amber-100">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <TrendingDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600" />
                      <p className="text-[10px] sm:text-xs text-amber-700">
                        {t('seller.outOfStockProducts.lostRevenue')}: <span className="font-bold">{formatPrice(totalPotentialRevenue)}</span>
                      </p>
                    </div>
                    <Link to="/seller/inventory/bulk-update">
                      <button className="px-2.5 sm:px-3 py-1 sm:py-1 text-[10px] sm:text-xs bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors self-start sm:self-auto">
                        {t('seller.outOfStockProducts.bulkRestockButton')} →
                      </button>
                    </Link>
                  </div>
                </div>

                {/* Tips - Responsive */}
                <div className="bg-blue-50 rounded-lg p-2 sm:p-3 border border-blue-100">
                  <div className="flex items-start gap-1.5 sm:gap-2">
                    <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500 mt-0.5" />
                    <p className="text-[10px] sm:text-xs text-blue-700">
                      {t('seller.outOfStockProducts.tipMessage')}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default OutOfStockProducts;
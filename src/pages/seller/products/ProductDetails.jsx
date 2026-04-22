// src/pages/seller/products/ProductDetails.jsx

import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import MainLayout from "../../../layouts/MainLayout";
import api from "../../../api/axios";
import { useToast } from "../../../contexts/ToastContext";
import { useLanguage } from "../../../contexts/LanguageContext";
import { 
  ArrowLeft, 
  Package, 
  DollarSign, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Edit,
  TrendingUp,
  Clock,
  Tag,
  RefreshCw,
  Eye,
  Calendar
} from "lucide-react";

// ==================== SHIMMER ANIMATION STYLES ====================
const shimmerStyle = `
  @keyframes shimmer {
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }
  .animate-shimmer {
    animation: shimmer 1.5s ease-in-out infinite;
    background: linear-gradient(90deg, #f0f0f0 0%, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%, #f0f0f0 100%);
    background-size: 200% 100%;
  }
`;

// ==================== SKELETON LOADERS ====================
const SkeletonStatCard = () => (
  <div className="bg-white rounded-xl border border-gray-100 p-4 overflow-hidden">
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-lg"></div>
      <div>
        <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-16 mb-1"></div>
        <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-24"></div>
      </div>
    </div>
  </div>
);

const SkeletonDetailRow = () => (
  <div className="flex justify-between py-2 border-b border-gray-100 overflow-hidden">
    <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-24"></div>
    <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-32"></div>
  </div>
);

// ==================== MAIN COMPONENT ====================
const ProductDetails = () => {
  const { id } = useParams();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Add shimmer style
  useEffect(() => {
    if (!document.querySelector('#shimmer-styles-product-details')) {
      const style = document.createElement('style');
      style.id = 'shimmer-styles-product-details';
      style.textContent = shimmerStyle;
      document.head.appendChild(style);
    }
  }, []);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/seller/products/${id}`);
      setProduct(response.data);
      setError(null);
      setImageError(false);
    } catch (error) {
      const errorMsg = error.response?.data?.message || t('seller.productDetails.notFound');
      setError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchProduct();
    setRefreshing(false);
    showToast(t('seller.productDetails.refreshed'), 'info');
  };

  const formatPrice = (price) => `Tsh ${Number(price).toLocaleString()}`;

  const getStockStatus = () => {
    if (!product) return null;
    if (product.quantity <= 0) {
      return { 
        label: t('seller.productDetails.outOfStock'), 
        color: 'text-rose-600', 
        bg: 'bg-rose-50', 
        icon: XCircle 
      };
    } else if (product.quantity <= (product.min_stock_alert || 5)) {
      return { 
        label: t('seller.productDetails.lowStock'), 
        color: 'text-amber-600', 
        bg: 'bg-amber-50', 
        icon: AlertTriangle 
      };
    }
    return { 
      label: t('seller.productDetails.inStock'), 
      color: 'text-emerald-600', 
      bg: 'bg-emerald-50', 
      icon: CheckCircle 
    };
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;
    return imagePath;
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="p-6 bg-gray-50 min-h-screen">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-32"></div>
              <div className="flex gap-3">
                <div className="h-9 w-20 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-lg"></div>
                <div className="h-9 w-24 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-lg"></div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
              <div className="flex gap-5">
                <div className="w-24 h-24 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-xl"></div>
                <div className="flex-1">
                  <div className="flex gap-2 mb-2">
                    <div className="h-6 w-16 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-full"></div>
                    <div className="h-6 w-20 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-full"></div>
                  </div>
                  <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-48 mb-2"></div>
                  <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-full max-w-md"></div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[1, 2, 3, 4].map(i => <SkeletonStatCard key={i} />)}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl border border-gray-100 overflow-hidden mb-6">
                  <div className="p-4 border-b border-gray-100">
                    <div className="h-5 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-32"></div>
                  </div>
                  <div className="p-4 space-y-2">
                    {[1, 2, 3, 4, 5, 6].map(i => <SkeletonDetailRow key={i} />)}
                  </div>
                </div>
              </div>
              <div>
                <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                  <div className="p-4 border-b border-gray-100">
                    <div className="h-5 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-28"></div>
                  </div>
                  <div className="p-4 space-y-2">
                    {[1, 2, 3].map(i => <SkeletonDetailRow key={i} />)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !product) {
    return (
      <MainLayout>
        <div className="p-6 bg-gray-50 min-h-screen">
          <div className="max-w-md mx-auto bg-white rounded-xl border border-gray-100 p-8 text-center">
            <XCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-gray-900 mb-1">{t('seller.productDetails.notFound')}</h3>
            <p className="text-sm text-gray-500 mb-4">{error || t('seller.productDetails.unableToLoad')}</p>
            <Link to="/seller/products" className="inline-flex items-center gap-2 text-sm text-[#5C352C] hover:underline">
              <ArrowLeft className="w-4 h-4" />
              {t('seller.productDetails.backToProducts')}
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  const stockStatus = getStockStatus();
  const StockIcon = stockStatus.icon;
  const imageUrl = getImageUrl(product.image);
  const totalRevenue = product.price * (product.sales_count || 0);
  const stockPercentage = product.quantity + (product.sales_count || 0) > 0 
    ? (product.quantity / (product.quantity + (product.sales_count || 0))) * 100 
    : 100;

  return (
    <MainLayout>
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto">
          
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <Link to="/seller/products" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#5C352C] transition-colors">
              <ArrowLeft className="w-4 h-4" />
              {t('seller.productDetails.backToProducts')}
            </Link>
            <div className="flex gap-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                {t('seller.productDetails.refresh')}
              </button>
              <Link to={`/seller/products/${product.id}/edit`}>
                <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-white bg-[#5C352C] rounded-lg hover:bg-[#4A2A22] transition-colors">
                  <Edit className="w-4 h-4" />
                  {t('seller.productDetails.edit')}
                </button>
              </Link>
            </div>
          </div>

          {/* Product Header */}
          <div className="bg-white rounded-xl border border-gray-100 p-5 mb-6 shadow-sm">
            <div className="flex gap-5">
              <div className="w-24 h-24 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                {imageUrl && !imageError ? (
                  <img 
                    src={imageUrl} 
                    alt={product.name} 
                    className="w-full h-full object-cover" 
                    onError={() => setImageError(true)} 
                    loading="lazy" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-8 h-8 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap gap-2 mb-2">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${stockStatus.bg} ${stockStatus.color}`}>
                    <StockIcon className="w-3 h-3" />
                    {stockStatus.label}
                  </span>
                  {product.is_active ? (
                    <span className="px-2 py-0.5 text-[10px] font-medium bg-emerald-50 text-emerald-600 rounded-full">
                      {t('seller.productDetails.active')}
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 text-[10px] font-medium bg-gray-100 text-gray-500 rounded-full">
                      {t('seller.productDetails.inactive')}
                    </span>
                  )}
                </div>
                <h1 className="text-lg font-semibold text-gray-900">{product.name}</h1>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{product.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Tag className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-xs text-gray-500">
                    {product.category?.name || t('seller.productDetails.uncategorized')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-gray-500" />
                <p className="text-xs text-gray-500">{t('seller.productDetails.price')}</p>
              </div>
              <p className="text-base font-bold text-gray-900 mt-1">{formatPrice(product.price)}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-gray-500" />
                <p className="text-xs text-gray-500">{t('seller.productDetails.stock')}</p>
              </div>
              <p className="text-base font-bold text-gray-900 mt-1">{product.quantity} {t('seller.productDetails.units')}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-gray-500" />
                <p className="text-xs text-gray-500">{t('seller.productDetails.sold')}</p>
              </div>
              <p className="text-base font-bold text-gray-900 mt-1">{product.sales_count || 0} {t('seller.productDetails.units')}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-gray-500" />
                <p className="text-xs text-gray-500">{t('seller.productDetails.views')}</p>
              </div>
              <p className="text-base font-bold text-gray-900 mt-1">{product.views_count || 0}</p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column - Details */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                <div className="p-4 border-b border-gray-100 bg-gray-50">
                  <h3 className="text-sm font-semibold text-gray-900">{t('seller.productDetails.productDetails')}</h3>
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-xs text-gray-500">{t('seller.productDetails.productName')}</span>
                    <span className="text-xs font-medium text-gray-700">{product.name}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-xs text-gray-500">{t('seller.productDetails.skuId')}</span>
                    <span className="text-xs font-mono text-gray-600">#{product.id.toString().padStart(6, '0')}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-xs text-gray-500">{t('seller.productDetails.category')}</span>
                    <span className="text-xs text-gray-700">{product.category?.name || t('seller.productDetails.uncategorized')}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-xs text-gray-500">{t('seller.productDetails.price')}</span>
                    <span className="text-xs font-semibold text-[#5C352C]">{formatPrice(product.price)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-xs text-gray-500">{t('seller.productDetails.minStockAlert')}</span>
                    <span className="text-xs text-gray-700">{product.min_stock_alert || 5} {t('seller.productDetails.units')}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-xs text-gray-500">{t('seller.productDetails.created')}</span>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(product.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden mt-6 shadow-sm">
                <div className="p-4 border-b border-gray-100 bg-gray-50">
                  <h3 className="text-sm font-semibold text-gray-900">{t('seller.productDetails.description')}</h3>
                </div>
                <div className="p-4">
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {product.description || t('seller.productDetails.noDescription')}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column - Stock Info */}
            <div>
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                <div className="p-4 border-b border-gray-100 bg-gray-50">
                  <h3 className="text-sm font-semibold text-gray-900">{t('seller.productDetails.stockLevel')}</h3>
                </div>
                <div className="p-4">
                  <div className="mb-4">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-500">{t('seller.productDetails.inventory')}</span>
                      <span className="text-gray-700">{Math.round(stockPercentage)}% {t('seller.productDetails.remaining')}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full transition-all ${
                          product.quantity <= 0 ? 'bg-rose-400' : 
                          product.quantity <= (product.min_stock_alert || 5) ? 'bg-amber-400' : 'bg-emerald-400'
                        }`}
                        style={{ width: `${Math.min(100, stockPercentage)}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-xs text-gray-500">{t('seller.productDetails.currentStock')}</span>
                      <span className="text-xs font-medium text-gray-900">{product.quantity} {t('seller.productDetails.units')}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-xs text-gray-500">{t('seller.productDetails.totalSold')}</span>
                      <span className="text-xs font-medium text-emerald-600">{product.sales_count || 0} {t('seller.productDetails.units')}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-xs text-gray-500">{t('seller.productDetails.alertThreshold')}</span>
                      <span className="text-xs font-medium text-amber-600">{product.min_stock_alert || 5} {t('seller.productDetails.units')}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-xs text-gray-500">{t('seller.productDetails.totalRevenue')}</span>
                      <span className="text-xs font-bold text-[#5C352C]">{formatPrice(totalRevenue)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ProductDetails;
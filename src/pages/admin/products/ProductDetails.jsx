// src/pages/admin/products/ProductDetails.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import MainLayout from "../../../layouts/MainLayout";
import api from "../../../api/axios";
import { useToast } from "../../../contexts/ToastContext";
import { 
  ArrowLeft, 
  Package, 
  DollarSign, 
  ShoppingBag, 
  User, 
  Tag,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Star,
  Edit,
  Trash2,
  Clock,
  Activity,
  RefreshCw,
  Store,
  Info,
  Mail,
  Phone,
  Image as ImageIcon,
  ZoomIn,
  ChevronLeft
} from "lucide-react";

// ==================== SKELETON LOADERS ====================
const SkeletonStatCard = () => (
  <div className="animate-pulse">
    <div className="bg-white p-6 rounded-xl border border-gray-100">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-24"></div>
          <div className="h-8 bg-gray-200 rounded w-32"></div>
          <div className="h-3 bg-gray-200 rounded w-28"></div>
        </div>
        <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
      </div>
    </div>
  </div>
);

const SkeletonDetailItem = () => (
  <div className="animate-pulse">
    <div className="flex items-start p-2 -mx-2">
      <div className="w-10 h-10 bg-gray-200 rounded-lg mr-3"></div>
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-gray-200 rounded w-20"></div>
        <div className="h-4 bg-gray-200 rounded w-32"></div>
      </div>
    </div>
  </div>
);

// ==================== MAIN COMPONENT ====================
const ProductDetails = () => {
  const { id } = useParams();
  const { showToast } = useToast();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/admin/products/${id}`);
      setProduct(response.data);
      setImageError(false);
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Product not found";
      setError(errorMsg);
      showToast(errorMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchProduct();
    setRefreshing(false);
    showToast('Product details refreshed', 'info');
  };

  const formatPrice = (price) => `Tsh ${Number(price || 0).toLocaleString()}`;

  const getStockStatus = () => {
    if (!product) return null;
    if (product.quantity <= 0) {
      return { label: 'Out of Stock', color: 'bg-rose-50 text-rose-700', icon: XCircle };
    } else if (product.quantity <= (product.min_stock_alert || 5)) {
      return { label: 'Low Stock', color: 'bg-amber-50 text-amber-700', icon: AlertTriangle };
    } else {
      return { label: 'In Stock', color: 'bg-emerald-50 text-emerald-700', icon: CheckCircle };
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Delete "${product?.name}"? This cannot be undone.`)) {
      try {
        await api.delete(`/admin/products/${product.id}`);
        showToast('Product deleted successfully', 'success');
        setTimeout(() => {
          window.location.href = '/admin/products';
        }, 1500);
      } catch (error) {
        showToast(error.response?.data?.message || 'Error deleting product', 'error');
      }
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  // Image Modal
  const ImageModal = ({ image, onClose }) => {
    useEffect(() => {
      const handleEscape = (e) => {
        if (e.key === 'Escape') onClose();
      };
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = 'unset';
      };
    }, [onClose]);

    return (
      <div 
        className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div className="relative max-w-4xl max-h-full">
          <img src={image} alt="Product zoom" className="max-w-full max-h-screen object-contain" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/70 transition-colors"
          >
            <XCircle className="w-6 h-6" />
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
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gray-200 rounded-xl animate-pulse"></div>
                <div className="h-7 bg-gray-200 rounded w-48 animate-pulse"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-64 animate-pulse ml-12"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {[1, 2, 3].map(i => <SkeletonStatCard key={i} />)}
            </div>
            <div className="bg-gradient-to-r from-[#2A1713] to-[#5C352C] rounded-xl overflow-hidden mb-6">
              <div className="p-6">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="w-32 h-32 bg-white/20 rounded-xl animate-pulse"></div>
                  <div className="flex-1 space-y-3 text-center md:text-left">
                    <div className="flex justify-center md:justify-start gap-2">
                      <div className="h-6 w-20 bg-white/20 rounded-full animate-pulse"></div>
                      <div className="h-6 w-16 bg-white/20 rounded-full animate-pulse"></div>
                    </div>
                    <div className="h-8 bg-white/20 rounded w-48 mx-auto md:mx-0 animate-pulse"></div>
                    <div className="h-4 bg-white/20 rounded w-64 mx-auto md:mx-0 animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <div className="h-6 bg-gray-200 rounded w-40 animate-pulse"></div>
                </div>
                <div className="p-6 space-y-4">
                  {[1, 2, 3, 4, 5, 6].map(i => <SkeletonDetailItem key={i} />)}
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <div className="h-6 bg-gray-200 rounded w-40 animate-pulse"></div>
                </div>
                <div className="p-6 space-y-4">
                  {[1, 2, 3, 4].map(i => <SkeletonDetailItem key={i} />)}
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
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-xl border border-red-100 p-12 text-center">
              <XCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
              <h3 className="text-base font-medium text-gray-900 mb-1">Error Loading Product</h3>
              <p className="text-sm text-gray-500 mb-4">{error || "Product not found"}</p>
              <Link to="/admin/products" className="inline-flex items-center gap-2 px-4 py-2 bg-[#5C352C] text-white rounded-lg hover:bg-[#956959] transition-colors text-sm">
                <ArrowLeft className="w-4 h-4" /> Back to Products
              </Link>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  const stockStatus = getStockStatus();
  const StockIcon = stockStatus.icon;

  const statCards = [
    {
      title: "Product Price",
      value: formatPrice(product.price),
      icon: DollarSign,
      color: "text-emerald-600",
      bg: "bg-emerald-50"
    },
    {
      title: "Stock Quantity",
      value: `${product.quantity} units`,
      subValue: product.min_stock_alert ? `Alert at ${product.min_stock_alert}` : "No alert set",
      icon: ShoppingBag,
      color: "text-amber-600",
      bg: "bg-amber-50"
    },
    {
      title: "Product Status",
      value: product.is_active ? "Active" : "Inactive",
      subValue: product.is_featured ? "Featured Product" : "Not Featured",
      icon: Activity,
      color: "text-blue-600",
      bg: "bg-blue-50"
    }
  ];

  return (
    <MainLayout>
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          
          {/* Image Modal */}
          {selectedImage && (
            <ImageModal image={selectedImage} onClose={() => setSelectedImage(null)} />
          )}
          
          {/* Header */}
          <div className="mb-6">
            <Link to="/admin/products" className="inline-flex items-center gap-2 text-[#5C352C] hover:text-[#956959] transition-colors mb-2">
              <ChevronLeft className="w-4 h-4" />
              <span className="text-sm">Back to Products</span>
            </Link>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 bg-[#5C352C]/10 rounded-xl">
                <Package className="w-5 h-5 text-[#5C352C]" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Product Details</h1>
            </div>
            <p className="text-sm text-gray-500 ml-11">View and manage product information</p>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {statCards.map((card, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">{card.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                    {card.subValue && (
                      <p className="text-xs text-gray-400 mt-2">{card.subValue}</p>
                    )}
                  </div>
                  <div className={`${card.bg} ${card.color} p-2 rounded-xl`}>
                    <card.icon className="w-5 h-5" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Refresh Button Row */}
          <div className="flex justify-end mb-4">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors text-sm"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {/* Product Header Banner */}
          <div className="bg-gradient-to-r from-[#2A1713] to-[#5C352C] rounded-xl overflow-hidden mb-6">
            <div className="px-6 py-6">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                {/* Product Image */}
                <div 
                  className="relative group cursor-pointer"
                  onClick={() => product.image && !imageError && setSelectedImage(product.image)}
                >
                  <div className="w-32 h-32 md:w-40 md:h-40 bg-white/10 rounded-xl flex items-center justify-center overflow-hidden">
                    {product.image && !imageError ? (
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={handleImageError}
                        loading="lazy"
                      />
                    ) : (
                      <Package className="w-16 h-16 text-white/50" />
                    )}
                  </div>
                  {product.image && !imageError && (
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                      <ZoomIn className="w-8 h-8 text-white" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                      product.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-50 text-gray-600'
                    }`}>
                      {product.is_active ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {product.is_active ? 'Active' : 'Inactive'}
                    </span>
                    {product.is_featured && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700">
                        <Star className="w-3 h-3" />
                        Featured
                      </span>
                    )}
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${stockStatus.color}`}>
                      <StockIcon className="w-3 h-3" />
                      {stockStatus.label}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">{product.name}</h2>
                  <p className="text-[#E9B48A] text-sm line-clamp-2">{product.description}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Product Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            
            {/* Product Information Card */}
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <Package className="w-5 h-5 text-[#5C352C]" />
                  Product Information
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <DetailItem icon={Tag} label="Product Name" value={product.name} />
                <DetailItem icon={DollarSign} label="Price" value={formatPrice(product.price)} highlight />
                <DetailItem icon={ShoppingBag} label="Stock Quantity" value={`${product.quantity} units`} />
                {product.min_stock_alert && (
                  <DetailItem icon={AlertTriangle} label="Min Stock Alert" value={`${product.min_stock_alert} units`} />
                )}
                <DetailItem icon={Calendar} label="Created" value={new Date(product.created_at).toLocaleDateString()} />
                <DetailItem icon={Clock} label="Last Updated" value={new Date(product.updated_at).toLocaleDateString()} />
                <DetailItem icon={Info} label="Product ID" value={`#${product.id}`} />
              </div>
            </div>

            {/* Seller Information Card */}
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <Store className="w-5 h-5 text-[#5C352C]" />
                  Seller Information
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <DetailItem icon={User} label="Seller Name" value={product.seller?.name || 'N/A'} />
                <DetailItem icon={Tag} label="Category" value={product.category?.name || 'Uncategorized'} />
                {product.seller?.email && (
                  <DetailItem icon={Mail} label="Seller Email" value={product.seller.email} />
                )}
                {product.seller?.phone && (
                  <DetailItem icon={Phone} label="Seller Phone" value={product.seller.phone} />
                )}
                <div className="pt-2">
                  <Link to={`/admin/users/${product.seller?.id}`} className="text-sm text-[#5C352C] hover:text-[#956959] font-medium inline-flex items-center gap-1">
                    View Seller Profile
                    <ArrowLeft className="w-3 h-3 rotate-180" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Description Section */}
          {product.description && (
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden mb-6">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <Info className="w-5 h-5 text-[#5C352C]" />
                  Product Description
                </h3>
              </div>
              <div className="p-6">
                <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{product.description}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <Link to={`/admin/products/${product.id}/edit`}>
              <button className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#5C352C] text-white rounded-lg hover:bg-[#956959] transition-colors font-medium text-sm w-full sm:w-auto">
                <Edit className="w-4 h-4" />
                Edit Product
              </button>
            </Link>
            <button
              onClick={handleDelete}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors font-medium text-sm w-full sm:w-auto"
            >
              <Trash2 className="w-4 h-4" />
              Delete Product
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

// Helper Component
const DetailItem = ({ icon: Icon, label, value, highlight }) => (
  <div className="flex items-start group hover:bg-gray-50 p-2 -mx-2 rounded-lg transition-colors">
    <div className="w-10 h-10 bg-[#E9B48A]/20 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
      <Icon className="w-5 h-5 text-[#5C352C]" />
    </div>
    <div className="flex-1">
      <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
      <p className={`${highlight ? 'text-lg font-bold text-[#5C352C]' : 'text-gray-900 font-medium text-sm'} break-words`}>
        {value}
      </p>
    </div>
  </div>
);

export default ProductDetails;
// src/pages/buyer/products/ProductDetails.jsx
import React, { useState, useEffect, useContext, useCallback, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { AuthContext } from "../../../contexts/AuthContext";
import { useLanguage } from "../../../contexts/LanguageContext";
import MainLayout from "../../../layouts/MainLayout";
import api from "../../../api/axios";
import { useToast } from "../../../contexts/ToastContext";
import { confirmAlert } from '../../../utils/sweetAlertHelper';
import DiscountBadge from "../../../components/common/DiscountBadge";
import {
  ArrowLeft,
  ShoppingCart,
  Package,
  Store,
  Star,
  Truck,
  Clock,
  CheckCircle,
  Minus,
  Plus,
  Image as ImageIcon,
  Shield,
  RotateCcw,
  MapPin,
  Phone,
  MessageCircle,
  Send,
  Trash2,
  AlertTriangle,
  TrendingUp,
  ChevronRight,
  Verified,
  CreditCard,
  Heart,
  Share2,
  Zap,
  Award,
  Sparkles,
  DollarSign,
  BadgeCheck,
  ThumbsUp,
  Calendar,
  User
} from "lucide-react";

// ==================== ENHANCED SKELETON LOADERS ====================
const SkeletonProductDetails = () => (
  <div className="animate-pulse">
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      <div className="grid lg:grid-cols-2 gap-8 p-6 md:p-8">
        <div>
          <div className="relative w-full pt-[100%] bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl"></div>
        </div>
        <div className="space-y-5">
          <div className="h-9 bg-gray-200 rounded w-3/4"></div>
          <div className="h-7 bg-gray-200 rounded w-1/2"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="h-20 bg-gray-200 rounded-xl"></div>
            <div className="h-20 bg-gray-200 rounded-xl"></div>
          </div>
          <div className="h-36 bg-gray-200 rounded-2xl"></div>
          <div className="flex gap-3">
            <div className="h-14 bg-gray-200 rounded-xl flex-1"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const SkeletonRelatedProduct = () => (
  <div className="animate-pulse">
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="relative w-full pt-[100%] bg-gradient-to-br from-gray-200 to-gray-300"></div>
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-5 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>
  </div>
);

const SkeletonComment = () => (
  <div className="animate-pulse flex gap-4 p-5 rounded-xl bg-gray-50">
    <div className="w-10 h-10 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full"></div>
    <div className="flex-1 space-y-2">
      <div className="flex items-center gap-2">
        <div className="h-4 bg-gray-200 rounded w-24"></div>
        <div className="h-3 bg-gray-200 rounded w-16"></div>
      </div>
      <div className="h-4 bg-gray-200 rounded w-full"></div>
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
    </div>
  </div>
);

// ==================== MAIN COMPONENT ====================
const ProductDetails = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [error, setError] = useState(null);
  const [mainImageError, setMainImageError] = useState(false);
  const [relatedImageErrors, setRelatedImageErrors] = useState({});
  const [logoError, setLogoError] = useState(false);

  // Comments state
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentError, setCommentError] = useState(null);
  const [deletingComment, setDeletingComment] = useState(null);

  useEffect(() => {
    fetchProduct();
    fetchComments();
  }, [id]);

  const fetchComments = async () => {
    setCommentsLoading(true);
    try {
      const response = await api.get(`/products/${id}/comments`);
      setComments(response.data.comments || response.data || []);
    } catch (err) {
      console.error('Error fetching comments:', err);
      showToast(t('buyer.productDetails.errorLoadingComments'), 'error');
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmittingComment(true);
    setCommentError(null);
    try {
      const response = await api.post(`/products/${id}/comments`, {
        body: newComment.trim(),
        rating: newRating
      });
      setComments(prev => [response.data.comment || response.data, ...prev]);
      setNewComment("");
      setNewRating(5);
      showToast(t('buyer.productDetails.commentPosted'), 'success');
    } catch (err) {
      const errorMsg = err.response?.data?.message || t('buyer.productDetails.failedToPostComment');
      setCommentError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    const confirmed = await confirmAlert({
      title: t('buyer.productDetails.deleteConfirm'),
      text: '',
      icon: 'warning',
      confirmButtonText: t('buyer.productDetails.yesDelete'),
      cancelButtonText: t('common.cancel'),
      dangerMode: true,
    });
    if (!confirmed) return;
    setDeletingComment(commentId);
    try {
      await api.delete(`/products/${id}/comments/${commentId}`);
      setComments(prev => prev.filter(c => c.id !== commentId));
      showToast(t('buyer.productDetails.commentDeleted'), 'info');
    } catch (err) {
      showToast(t('buyer.productDetails.failedToDeleteComment'), 'error');
    } finally {
      setDeletingComment(null);
    }
  };

  const getCommentAvatarUrl = (comment) => {
    const photo = comment.user?.profile_photo;
    if (photo) return `http://localhost:8000/storage/${photo}`;
    return null;
  };

  const formatCommentDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMins = Math.floor((now - date) / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return t('buyer.productDetails.justNow');
    if (diffMins < 60) return t('buyer.productDetails.minutesAgo', { minutes: diffMins });
    if (diffHours < 24) return t('buyer.productDetails.hoursAgo', { hours: diffHours });
    if (diffDays < 7) return t('buyer.productDetails.daysAgo', { days: diffDays });
    return date.toLocaleDateString();
  };

  const fetchProduct = async () => {
    try {
      const response = await api.get(`/buyer/shop/products/${id}`);
      setProduct(response.data.product);
      setRelatedProducts(response.data.related_products);
      setError(null);
      setMainImageError(false);
      setRelatedImageErrors({});
      setLogoError(false);
    } catch (error) {
      console.error("Error fetching product:", error);
      const errorMsg = error.response?.data?.message || t('buyer.productDetails.productNotFound');
      setError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async () => {
    setAddingToCart(true);
    try {
      await api.post('/buyer/cart/add', {
        product_id: product.id,
        quantity: quantity
      });
      const productName = product.name.length > 30 ? product.name.substring(0, 30) + '...' : product.name;
      showToast(t('buyer.productDetails.productAddedToCart', { quantity, product: productName }), 'success');
    } catch (error) {
      if (error.response?.data?.error_code === 'SELLER_INACTIVE') {
        showToast(t('buyer.productDetails.sellerInactive'), 'error');
      } else {
        showToast(error.response?.data?.message || t('buyer.productDetails.errorAddingToCart'), 'error');
      }
    } finally {
      setAddingToCart(false);
    }
  };

  const formatPrice = (price) => {
    return `Tsh ${Number(price).toLocaleString('en-US')}`;
  };

  const incrementQuantity = () => {
    if (quantity < (product?.quantity || 10)) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleMainImageError = () => {
    setMainImageError(true);
  };

  const handleRelatedImageError = (productId) => {
    setRelatedImageErrors(prev => ({ ...prev, [productId]: true }));
  };

  const handleLogoError = () => {
    setLogoError(true);
  };

  const productImage = product?.image || (product?.images?.[0] || null);
  const averageRating = comments.length > 0
    ? (comments.reduce((sum, c) => sum + (c.rating || 0), 0) / comments.length).toFixed(1)
    : 5.0;

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <SkeletonProductDetails />
            <div className="mt-12">
              <div className="h-9 w-48 bg-gray-200 rounded animate-pulse mb-6"></div>
              <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <SkeletonRelatedProduct key={i} />
                ))}
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
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl border-2 border-rose-100 p-12 text-center">
              <AlertTriangle className="w-24 h-24 text-rose-500 mx-auto mb-4" aria-hidden="true" />
              <h3 className="text-2xl font-bold text-rose-800 mb-3">{t('buyer.productDetails.productNotFound')}</h3>
              <p className="text-rose-600 mb-6">{error || t('buyer.productDetails.productNotFoundDesc')}</p>
              <Link to="/buyer/shop/products" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#5C352C] to-[#8B5E4F] text-white rounded-xl hover:shadow-lg transition-all font-semibold">
                <ArrowLeft className="w-4 h-4" />
                {t('buyer.productDetails.backToShopButton')}
              </Link>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Get stock status text
  const getStockStatusText = () => {
    if (product.quantity === 0) return t('buyer.productDetails.outOfStock');
    if (product.quantity <= 5) return t('buyer.productDetails.onlyLeft', { quantity: product.quantity });
    return t('buyer.productDetails.inStock', { quantity: product.quantity });
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="p-4 md:p-8">
          <div className="max-w-7xl mx-auto">

            {/* Enhanced Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm mb-6 flex-wrap">
              <Link to="/" className="text-gray-500 hover:text-[#5C352C] transition-colors">{t('buyer.productDetails.home')}</Link>
              <ChevronRight className="w-3 h-3 text-gray-400" />
              <Link to="/buyer/shop/products" className="text-gray-500 hover:text-[#5C352C] transition-colors">{t('buyer.productDetails.shop')}</Link>
              <ChevronRight className="w-3 h-3 text-gray-400" />
              <span className="text-[#5C352C] font-semibold truncate max-w-[200px]">{product.name}</span>
            </nav>

            {/* Enhanced Back Button */}
            <Link
              to="/buyer/shop/products"
              className="inline-flex items-center gap-2 text-[#5C352C] hover:text-[#4A2A22] mb-6 group font-medium"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>{t('buyer.productDetails.backToShop')}</span>
            </Link>

            {/* Enhanced Main Product Card */}
            <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 overflow-hidden">
              <div className="grid lg:grid-cols-2 gap-8 p-6 md:p-8">

                {/* Left Column - Single Main Image */}
                <div>
                  <div className="relative w-full pt-[100%] bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl overflow-hidden shadow-inner">
                    <div className="absolute inset-0">
                      {productImage && !mainImageError ? (
                        <img
                          src={productImage}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                          onError={handleMainImageError}
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-100">
                          <ImageIcon className="w-24 h-24 mb-3" aria-hidden="true" />
                          <p className="text-sm">{t('buyer.productDetails.noImageAvailable')}</p>
                        </div>
                      )}
                    </div>

                    {/* Enhanced Badges */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                      {product.is_featured && (
                        <span className="px-3 py-1.5 text-xs font-bold rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-white shadow-lg flex items-center gap-1">
                          <Award className="w-3 h-3" aria-hidden="true" />
                          {t('buyer.productDetails.featured')}
                        </span>
                      )}
                      {product.discount_percentage > 0 && (
                        <DiscountBadge percentage={product.discount_percentage} className="shadow-lg !px-3 !py-1.5 !text-xs" />
                      )}
                      {product.is_new && (
                        <span className="px-3 py-1.5 text-xs font-bold rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg flex items-center gap-1">
                          <Zap className="w-3 h-3" aria-hidden="true" />
                          {t('buyer.productDetails.newArrival')}
                        </span>
                      )}
                    </div>

                    {/* Enhanced Stock Overlay */}
                    {product.quantity === 0 && (
                      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-10">
                        <span className="px-5 py-2.5 text-sm font-bold rounded-xl bg-gradient-to-r from-gray-800 to-gray-900 text-white shadow-xl">
                          {t('buyer.productDetails.outOfStock')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column - Product Info */}
                <div>
                  <div className="mb-4">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">{product.name}</h1>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 mb-5">
                    <div className="flex items-baseline gap-3">
                      <span className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#5C352C] to-[#8B5E4F] bg-clip-text text-transparent">
                        {formatPrice(product.discount_percentage > 0 ? product.discounted_price : product.price)}
                      </span>
                      {product.discount_percentage > 0 && (
                        <span className="text-base text-gray-400 line-through">
                          {formatPrice(product.price)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 bg-amber-50 px-3 py-1.5 rounded-xl">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${star <= Math.round(averageRating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                      <span className="font-bold text-gray-700">{averageRating}</span>
                      <span className="text-sm text-gray-500">({comments.length} {t('buyer.productDetails.comments')})</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 mb-5">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold ${product.quantity === 0 ? 'bg-rose-100 text-rose-700' :
                        product.quantity <= 5 ? 'bg-orange-100 text-orange-700' :
                          'bg-emerald-100 text-emerald-700'
                      }`}>
                      <Package className="w-3.5 h-3.5" />
                      {getStockStatusText()}
                    </div>
                    {product.sales_count > 0 && (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-100 text-blue-700">
                        <TrendingUp className="w-3.5 h-3.5" />
                        {product.sales_count}+ {t('buyer.productDetails.sold')}
                      </div>
                    )}
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-100 text-purple-700">
                      <ThumbsUp className="w-3.5 h-3.5" />
                      {t('buyer.productDetails.highQuality')}
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 mb-2">{t('buyer.productDetails.productDescription')}</h3>
                    <p className="text-gray-600 text-base leading-relaxed">
                      {product.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="flex items-center gap-3 bg-gradient-to-br from-gray-50 to-white p-3 rounded-xl border border-gray-100">
                      <Package className="w-5 h-5 text-[#5C352C]" />
                      <div>
                        <p className="text-xs text-gray-500">{t('buyer.productDetails.category')}</p>
                        <p className="font-semibold text-gray-900 text-sm">{product.category?.name || t('buyer.productDetails.uncategorized')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-gradient-to-br from-gray-50 to-white p-3 rounded-xl border border-gray-100">
                      <Calendar className="w-5 h-5 text-[#5C352C]" />
                      <div>
                        <p className="text-xs text-gray-500">{t('buyer.productDetails.added')}</p>
                        <p className="font-semibold text-gray-900 text-sm">{new Date(product.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-5 mb-6 border border-gray-100">
                    <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Store className="w-5 h-5 text-[#5C352C]" />
                      {t('buyer.productDetails.sellerInformation')}
                    </h2>

                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-[#5C352C] to-[#8B5E4F] rounded-full overflow-hidden flex items-center justify-center shadow-lg flex-shrink-0">
                        {product.seller?.store_logo && !logoError ? (
                          <img
                            src={product.seller.store_logo}
                            alt={product.seller.store_name}
                            className="w-full h-full object-cover"
                            onError={handleLogoError}
                          />
                        ) : (
                          <Store className="w-7 h-7 text-white" />
                        )}
                      </div>
                      <div>
                        <p className="text-gray-900 font-bold text-base">
                          {product.seller?.store_name || product.seller?.name}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          <div className="flex items-center gap-1">
                            <BadgeCheck className="w-4 h-4 text-emerald-500" />
                            <span className="text-xs font-medium text-emerald-600">{t('buyer.productDetails.verifiedSeller')}</span>
                          </div>
                          {product.seller?.average_rating && (
                            <div className="flex items-center gap-1 border-l border-gray-200 pl-3">
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                              <span className="text-sm font-bold text-gray-700">{product.seller.average_rating}</span>
                              <span className="text-xs text-gray-400">({product.seller.ratings_count || 0})</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-white">
                        <MapPin className="w-4 h-4 text-[#5C352C]" />
                        <span className="text-gray-600">{product.seller?.address || t('buyer.productDetails.locationNotSpecified')}</span>
                      </div>
                      {product.seller?.phone && (
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-white">
                          <Phone className="w-4 h-4 text-[#5C352C]" />
                          <a href={`tel:${product.seller.phone}`} className="text-gray-600 hover:text-[#5C352C] transition-colors font-medium">
                            {product.seller.phone}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {product.quantity > 0 && (
                    <div className="mb-6">
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        {t('buyer.productDetails.quantity')}
                      </label>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden bg-white">
                          <button
                            onClick={decrementQuantity}
                            disabled={quantity <= 1}
                            className="w-12 h-12 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#5C352C]"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-16 text-center font-bold text-xl">{quantity}</span>
                          <button
                            onClick={incrementQuantity}
                            disabled={quantity >= product.quantity}
                            className="w-12 h-12 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#5C352C]"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <span className="text-sm text-gray-500 font-medium">
                          {product.quantity} {t('buyer.productDetails.available')}
                        </span>
                      </div>
                    </div>
                  )}

                  {product.quantity > 0 && (
                    <div className="mb-6">
                      <button
                        onClick={addToCart}
                        disabled={addingToCart}
                        className="w-full py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 font-bold text-base bg-gradient-to-r from-[#5C352C] to-[#8B5E4F] text-white hover:shadow-xl transform hover:scale-[1.02]"
                      >
                        {addingToCart ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                            {t('buyer.productDetails.addingToCart')}
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="w-5 h-5" />
                            {t('buyer.productDetails.addToCart')} - {formatPrice((product.discount_percentage > 0 ? product.discounted_price : product.price) * quantity)}
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Enhanced Related Products */}
            {relatedProducts.length > 0 && (
              <div className="mt-12">
                <div className="flex items-center gap-2 mb-6">
                  <Sparkles className="w-6 h-6 text-[#5C352C]" />
                  <h2 className="text-xl font-bold text-gray-900">{t('buyer.productDetails.youMightAlsoLike')}</h2>
                </div>
                <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {relatedProducts.slice(0, 4).map((related) => (
                    <Link
                      key={related.id}
                      to={`/buyer/shop/products/${related.id}`}
                      className="group"
                    >
                      <div className="bg-white rounded-xl shadow-lg border-2 border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                        <div className="relative w-full pt-[100%] bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                          <div className="absolute inset-0">
                            {related.image && !relatedImageErrors[related.id] ? (
                              <img
                                src={related.image}
                                alt={related.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                onError={() => handleRelatedImageError(related.id)}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                <ImageIcon className="w-12 h-12 text-gray-400" />
                              </div>
                            )}
                          </div>
                          {related.discount_percentage > 0 && (
                            <div className="absolute top-2 left-2 z-10">
                              <DiscountBadge percentage={related.discount_percentage} className="shadow-md" />
                            </div>
                          )}
                          {related.quantity === 0 && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                              <span className="px-2 py-1 text-[10px] font-bold rounded-lg bg-gray-900 text-white">
                                {t('buyer.productDetails.outOfStock')}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="font-bold text-gray-900 text-sm line-clamp-2 mb-1 group-hover:text-[#5C352C] transition-colors">
                            {related.name}
                          </h3>
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span className="text-xs font-medium text-gray-600">4.5</span>
                          </div>
                          <p className="font-bold text-[#5C352C] text-base mt-2">
                            {formatPrice(related.discount_percentage > 0 ? related.discounted_price : related.price)}
                          </p>
                          {related.discount_percentage > 0 && (
                            <p className="text-[10px] text-gray-400 line-through">
                              {formatPrice(related.price)}
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Enhanced Comments Section */}
            <div className="mt-12">
              <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 overflow-hidden">
                <div className="px-6 py-5 border-b-2 border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-[#5C352C]" />
                    {t('buyer.productDetails.customerComments')}
                    {comments.length > 0 && (
                      <span className="ml-2 px-2.5 py-0.5 text-xs font-bold bg-gradient-to-r from-[#5C352C] to-[#8B5E4F] text-white rounded-full shadow-md">
                        {comments.length}
                      </span>
                    )}
                  </h2>
                </div>

                <div className="p-6">
                  {/* Enhanced Comment Form */}
                  {user ? (
                    <form onSubmit={handleSubmitComment} className="mb-8">
                      <div className="flex gap-4">
                        <div className="flex-shrink-0">
                          {user.profile_photo ? (
                            <img
                              src={`http://localhost:8000/storage/${user.profile_photo}`}
                              alt={user.name}
                              className="w-12 h-12 rounded-full object-cover border-2 border-[#5C352C] shadow-md"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gradient-to-r from-[#5C352C] to-[#8B5E4F] rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                              {user.name?.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="mb-3 flex items-center gap-2">
                            <span className="text-sm font-semibold text-gray-700">Rate this product:</span>
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() => setNewRating(star)}
                                  className="focus:outline-none hover:scale-110 transition-transform"
                                >
                                  <Star className={`w-5 h-5 ${star <= newRating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                                </button>
                              ))}
                            </div>
                          </div>
                          <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder={t('buyer.productDetails.shareYourThoughts')}
                            rows={3}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:border-[#5C352C] focus:ring-2 focus:ring-[#5C352C]/20 bg-gray-50"
                          />
                          {commentError && (
                            <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              {commentError}
                            </p>
                          )}
                          <div className="flex justify-end mt-3">
                            <button
                              type="submit"
                              disabled={submittingComment || !newComment.trim()}
                              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#5C352C] to-[#8B5E4F] text-white text-sm font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
                            >
                              {submittingComment ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                  {t('buyer.productDetails.posting')}
                                </>
                              ) : (
                                <>
                                  <Send className="w-4 h-4" />
                                  {t('buyer.productDetails.postComment')}
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </form>
                  ) : (
                    <div className="mb-8 p-6 bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-gray-100 text-center">
                      <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                      <p className="text-sm text-gray-600">
                        <Link to="/login" className="font-bold text-[#5C352C] hover:underline">
                          {t('buyer.productDetails.loginToComment')}
                        </Link>
                      </p>
                    </div>
                  )}

                  {/* Enhanced Comments List */}
                  {commentsLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <SkeletonComment key={i} />
                      ))}
                    </div>
                  ) : comments.length === 0 ? (
                    <div className="text-center py-12">
                      <MessageCircle className="w-20 h-20 mx-auto mb-4 text-gray-200" />
                      <p className="text-gray-400 font-medium">{t('buyer.productDetails.noCommentsYet')}</p>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {comments.map((comment) => (
                        <div key={comment.id} className="flex gap-4 p-5 rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 hover:shadow-md transition-all">
                          <div className="flex-shrink-0">
                            {getCommentAvatarUrl(comment) ? (
                              <img
                                src={getCommentAvatarUrl(comment)}
                                alt={comment.user?.name}
                                className="w-10 h-10 rounded-full object-cover border border-gray-200"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-gradient-to-r from-[#5C352C] to-[#8B5E4F] rounded-full flex items-center justify-center text-white font-bold">
                                {comment.user?.name?.charAt(0).toUpperCase() || '?'}
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-gray-900">
                                  {comment.user?.name || 'Anonymous'}
                                </span>
                                {comment.user?.id === user?.id && (
                                  <span className="px-2 py-0.5 text-[10px] font-bold bg-gradient-to-r from-[#5C352C] to-[#8B5E4F] text-white rounded-full shadow-sm">
                                    {t('buyer.productDetails.you')}
                                  </span>
                                )}
                                <div className="flex items-center gap-0.5 ml-2">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star key={star} className={`w-3 h-3 ${star <= (comment.rating || 5) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                                  ))}
                                </div>
                                <span className="text-xs text-gray-400 flex items-center gap-1 ml-2">
                                  <Clock className="w-3 h-3" />
                                  {formatCommentDate(comment.created_at)}
                                </span>
                              </div>
                              {user && comment.user?.id === user.id && (
                                <button
                                  onClick={() => handleDeleteComment(comment.id)}
                                  className="text-gray-400 hover:text-rose-500 transition-colors p-1 hover:bg-rose-50 rounded-lg"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                            <p className="text-sm text-gray-700 leading-relaxed">{comment.body}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-in {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </MainLayout>
  );
};

export default ProductDetails;
// src/pages/buyer/cart/Cart.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import MainLayout from "../../../layouts/MainLayout";
import InactiveSellerPopup from "../../../components/InactiveSellerPopup";
import api from "../../../api/axios";
import { useToast } from "../../../contexts/ToastContext";
import { confirmAlert } from '../../../utils/sweetAlertHelper';
import { useCart } from "../../../contexts/CartContext";
import { useLanguage } from "../../../contexts/LanguageContext";
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  CreditCard,
  Truck,
  Mail,
  X,
  Package,
  AlertCircle,
  MapPin,
  Clock,
  Shield,
  ChevronRight,
  Heart,
  Wallet,
  CheckCircle,
  Store,
  TrendingUp,
  Sparkles
} from "lucide-react";

// ==================== SKELETON LOADERS ====================
const SkeletonCartItem = () => (
  <div className="animate-pulse">
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="p-6">
        <div className="flex gap-5">
          <div className="w-24 h-24 md:w-28 md:h-28 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl"></div>
          <div className="flex-1 space-y-3">
            <div className="h-5 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            <div className="flex justify-between items-center mt-4">
              <div className="flex gap-3">
                <div className="w-9 h-9 bg-gray-200 rounded-lg"></div>
                <div className="w-9 h-9 bg-gray-200 rounded-lg"></div>
              </div>
              <div className="h-7 bg-gray-200 rounded w-28"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const SkeletonCartSummary = () => (
  <div className="animate-pulse">
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-[#5C352C] to-[#8B5E4F] px-6 py-5">
        <div className="h-6 bg-white/20 rounded w-36"></div>
      </div>
      <div className="p-6 space-y-5">
        <div className="flex justify-between">
          <div className="h-4 bg-gray-200 rounded w-24"></div>
          <div className="h-4 bg-gray-200 rounded w-20"></div>
        </div>
        <div className="flex justify-between">
          <div className="h-4 bg-gray-200 rounded w-32"></div>
          <div className="h-4 bg-gray-200 rounded w-28"></div>
        </div>
        <div className="border-t border-gray-100 pt-5">
          <div className="flex justify-between">
            <div className="h-5 bg-gray-200 rounded w-28"></div>
            <div className="h-7 bg-gray-200 rounded w-28"></div>
          </div>
        </div>
        <div className="h-12 bg-gray-200 rounded-xl w-full mt-6"></div>
      </div>
    </div>
  </div>
);

// ==================== MAIN COMPONENT ====================
const Cart = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const { fetchCartCount } = useCart();
  const [cart, setCart] = useState([]);
  const [summary, setSummary] = useState({ total_items: 0, subtotal: 0 });
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showInactiveSellerPopup, setShowInactiveSellerPopup] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [imageErrors, setImageErrors] = useState({});
  const [checkoutData, setCheckoutData] = useState({
    delivery_address: '',
    notes: ''
  });
  const [checkoutErrors, setCheckoutErrors] = useState({});
  const [updatingItem, setUpdatingItem] = useState(null);

  // Refs for keyboard navigation
  const checkoutModalRef = useRef(null);
  const addressInputRef = useRef(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    fetchCart();
  }, []);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && showCheckoutModal) {
        setShowCheckoutModal(false);
      }
    };
    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [showCheckoutModal]);

  const announceToScreenReader = (message) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    document.body.appendChild(announcement);
    setTimeout(() => announcement.remove(), 3000);
  };

  const fetchCart = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/buyer/cart');
      setCart(response.data.cart);
      setSummary(response.data.summary);
      announceToScreenReader(
        t('buyer.cart.cartUpdated', { 
          count: response.data.summary.total_items, 
          total: formatPrice(response.data.summary.subtotal) 
        })
      );
    } catch (error) {
      console.error('Error fetching cart:', error);
      const errorMsg = error.response?.data?.message || t('buyer.cart.failedToLoadCart');
      setError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (cartId, newQuantity, productStock, productName) => {
    if (newQuantity < 1) return;
    if (newQuantity > productStock) {
      showToast(t('buyer.cart.onlyXItemsAvailable', { count: productStock }), 'error');
      announceToScreenReader(t('buyer.cart.onlyXItemsAvailable', { count: productStock }));
      return;
    }
    
    setUpdatingItem(cartId);
    try {
      await api.put(`/buyer/cart/${cartId}`, { quantity: newQuantity });
      await fetchCart();
      await fetchCartCount();
      showToast(t('buyer.cart.quantityUpdated'), 'success');
      announceToScreenReader(t('buyer.cart.itemQuantityUpdated', { product: productName, quantity: newQuantity }));
    } catch (error) {
      showToast(error.response?.data?.message || t('buyer.cart.errorUpdatingQuantity'), 'error');
    } finally {
      setUpdatingItem(null);
    }
  };

  const removeItem = async (cartId, productName) => {
    const confirmed = await confirmAlert({
      title: t('buyer.cart.removeItem', { product: productName }),
      text: '',
      icon: 'warning',
      confirmButtonText: t('buyer.cart.yes'),
      cancelButtonText: t('buyer.cart.cancel'),
      dangerMode: true,
    });
    if (confirmed) {
      setUpdatingItem(cartId);
      try {
        await api.delete(`/buyer/cart/${cartId}`);
        await fetchCart();
        await fetchCartCount();
        showToast(t('buyer.cart.itemRemoved', { product: productName }), 'success');
        announceToScreenReader(t('buyer.cart.itemRemovedAria', { product: productName }));
      } catch (error) {
        showToast(error.response?.data?.message || t('buyer.cart.errorRemovingItem'), 'error');
      } finally {
        setUpdatingItem(null);
      }
    }
  };

  const clearCart = async () => {
    const confirmed = await confirmAlert({
      title: t('buyer.cart.clearCartConfirm'),
      text: '',
      icon: 'warning',
      confirmButtonText: t('buyer.cart.yes'),
      cancelButtonText: t('buyer.cart.cancel'),
      dangerMode: true,
    });
    if (confirmed) {
      try {
        await api.delete('/buyer/cart/clear/all');
        await fetchCart();
        await fetchCartCount();
        showToast(t('buyer.cart.cartCleared'), 'success');
        announceToScreenReader(t('buyer.cart.cartClearedAria'));
      } catch (error) {
        showToast(error.response?.data?.message || t('buyer.cart.errorClearingCart'), 'error');
      }
    }
  };

  const handleCheckoutInputChange = (e) => {
    const { name, value } = e.target;
    setCheckoutData(prev => ({ ...prev, [name]: value }));
    if (checkoutErrors[name]) {
      setCheckoutErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  const handleCheckout = async () => {
    if (!checkoutData.delivery_address.trim()) {
      setCheckoutErrors({ delivery_address: t('buyer.cart.deliveryAddressRequired') });
      showToast(t('buyer.cart.deliveryAddressRequired'), 'error');
      announceToScreenReader(t('buyer.cart.deliveryAddressRequired'));
      addressInputRef.current?.focus();
      return;
    }

    setCheckoutLoading(true);
    try {
      const response = await api.post('/buyer/cart/checkout', checkoutData);
      showToast(t('buyer.cart.orderPlacedSuccess'), 'success');
      announceToScreenReader(t('buyer.cart.orderPlacedAria'));
      
      setTimeout(() => {
        navigate(`/buyer/orders/${response.data.order.id}`);
      }, 1500);
    } catch (error) {
      if (error.response?.data?.error_code === 'SELLER_INACTIVE') {
        setShowCheckoutModal(false);
        setShowInactiveSellerPopup(true);
      } else if (error.response?.data?.errors) {
        setCheckoutErrors(error.response.data.errors);
        showToast(t('buyer.cart.pleaseFixErrors'), 'error');
      } else {
        const errorMsg = error.response?.data?.message || t('buyer.cart.errorProcessingCheckout');
        showToast(errorMsg, 'error');
      }
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleKeyPress = useCallback((event, callback) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      callback();
    }
  }, []);

  const formatPrice = (price) => {
    return `Tsh ${Number(price).toLocaleString('en-US')}`;
  };

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    return `http://localhost:8000/${path.replace(/^\//, '')}`;
  };

  const handleImageError = (productId) => {
    setImageErrors(prev => ({ ...prev, [productId]: true }));
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="p-4 md:p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <div className="h-9 bg-gray-200 rounded w-40 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-56 mt-2 animate-pulse"></div>
            </div>
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-5">
                {[1, 2, 3].map(i => <SkeletonCartItem key={i} />)}
              </div>
              <div className="lg:col-span-1">
                <SkeletonCartSummary />
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="p-4 md:p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
          <div className="max-w-7xl mx-auto">
            <div 
              className="bg-rose-50 border-2 border-rose-200 rounded-2xl p-8 text-center shadow-lg"
              role="alert"
              aria-live="polite"
            >
              <AlertCircle className="w-16 h-16 text-rose-500 mx-auto mb-4" aria-hidden="true" />
              <h3 className="text-xl font-bold text-rose-800 mb-2">{t('buyer.cart.errorLoadingCart')}</h3>
              <p className="text-rose-600 mb-5">{error}</p>
              <button 
                onClick={fetchCart}
                className="px-6 py-2.5 bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition-colors font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
                aria-label={t('buyer.cart.tryAgain')}
              >
                {t('buyer.cart.tryAgain')}
              </button>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-4 md:p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
        <div className="max-w-7xl mx-auto">
          
          {/* Enhanced Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-gradient-to-br from-[#5C352C] to-[#8B5E4F] rounded-xl shadow-lg">
                  <ShoppingCart className="w-5 h-5 text-white" aria-hidden="true" />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#5C352C] to-[#8B5E4F] bg-clip-text text-transparent">
                  {t('buyer.cart.myCart')}
                </h1>
              </div>
              <p className="text-gray-500 text-sm ml-11">{t('buyer.cart.cartSubtitle')}</p>
            </div>
            <Link 
              to="/buyer/shop/products" 
              className="inline-flex items-center gap-2 text-[#5C352C] hover:text-[#4A2A22] font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-[#5C352C] rounded-lg px-3 py-2 bg-white shadow-md border border-gray-100"
              aria-label={t('buyer.cart.continueShopping')}
            >
              {t('buyer.cart.continueShopping')} <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>

          {cart.length === 0 ? (
            <div 
              className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 p-12 text-center"
              role="status"
              aria-label={t('buyer.cart.emptyCartTitle')}
            >
              <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
                <ShoppingCart className="w-12 h-12 text-gray-400" aria-hidden="true" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('buyer.cart.emptyCartTitle')}</h3>
              <p className="text-gray-500 mb-7">{t('buyer.cart.emptyCartDesc')}</p>
              <Link to="/buyer/shop/products">
                <button className="px-8 py-3 bg-gradient-to-r from-[#5C352C] to-[#8B5E4F] text-white rounded-xl hover:shadow-lg transition-all font-semibold focus:outline-none focus:ring-2 focus:ring-[#5C352C] focus:ring-offset-2">
                  {t('buyer.cart.startShopping')}
                </button>
              </Link>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              
              {/* Enhanced Cart Items */}
              <div className="lg:col-span-2 space-y-5">
                {cart.map((item) => {
                  const imageUrl = getImageUrl(item.product?.image);
                  const hasImageError = imageErrors[item.product?.id];
                  const isUpdating = updatingItem === item.id;
                  
                  return (
                    <div 
                      key={item.id} 
                      className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:border-[#5C352C]/20"
                      role="listitem"
                      aria-label={t('buyer.cart.cartItemLabel', {
                        product: item.product?.name,
                        quantity: item.quantity,
                        price: formatPrice(item.product?.price * item.quantity)
                      })}
                    >
                      <div className="p-6">
                        <div className="flex gap-5">
                          {/* Enhanced Product Image */}
                          <div className="w-24 h-24 md:w-28 md:h-28 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden shadow-md">
                            {imageUrl && !hasImageError ? (
                              <img 
                                src={imageUrl} 
                                alt={item.product?.name} 
                                className="w-full h-full object-cover"
                                onError={() => handleImageError(item.product?.id)}
                                loading="lazy"
                              />
                            ) : (
                              <Package className="w-10 h-10 text-gray-400" aria-hidden="true" />
                            )}
                          </div>
                          
                          {/* Enhanced Product Details */}
                          <div className="flex-1 min-w-0">
                            <Link 
                              to={`/buyer/shop/products/${item.product_id}`}
                              className="focus:outline-none focus:ring-2 focus:ring-[#5C352C] rounded"
                              aria-label={t('buyer.sellerProducts.viewDetails', { name: item.product?.name })}
                            >
                              <h3 className="font-bold text-gray-900 hover:text-[#5C352C] transition-colors line-clamp-1 text-base">
                                {item.product?.name}
                              </h3>
                            </Link>
                            <div className="flex items-center gap-2 mt-1">
                              <Store className="w-3 h-3 text-gray-400" aria-hidden="true" />
                              <p className="text-xs text-gray-500">{t('buyer.cart.by')} {item.product?.seller?.name || 'Seller'}</p>
                              <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                              <div className="flex items-center gap-0.5">
                                <TrendingUp className="w-3 h-3 text-emerald-500" aria-hidden="true" />
                                <span className="text-xs text-emerald-600 font-medium">{t('buyer.cart.inStock')}</span>
                              </div>
                            </div>
                            
                            <div className="flex flex-wrap items-center justify-between gap-4 mt-4">
                              {/* Enhanced Quantity Controls */}
                              <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-1 shadow-inner">
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity - 1, item.product?.quantity, item.product?.name)}
                                  disabled={isUpdating || item.quantity <= 1}
                                  className="w-9 h-9 bg-white border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-50 hover:border-[#5C352C] transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#5C352C]"
                                  aria-label={t('buyer.sellerProducts.decreaseQuantity', { product: item.product?.name })}
                                >
                                  <Minus className="w-3.5 h-3.5 text-gray-600" aria-hidden="true" />
                                </button>
                                <span 
                                  className="w-10 text-center font-bold text-gray-900"
                                  aria-live="polite"
                                  aria-label={`Quantity: ${item.quantity}`}
                                >
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity + 1, item.product?.quantity, item.product?.name)}
                                  disabled={isUpdating || item.quantity >= item.product?.quantity}
                                  className="w-9 h-9 bg-white border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-50 hover:border-[#5C352C] transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#5C352C]"
                                  aria-label={t('buyer.sellerProducts.increaseQuantity', { product: item.product?.name })}
                                >
                                  <Plus className="w-3.5 h-3.5 text-gray-600" aria-hidden="true" />
                                </button>
                              </div>
                              
                              {/* Enhanced Price */}
                              <div className="text-right">
                                <p className="font-bold text-[#5C352C] text-xl">
                                  {formatPrice(item.product?.discounted_price * item.quantity)}
                                </p>
                                {item.product?.discount_percentage > 0 ? (
                                  <div className="flex flex-col items-end">
                                    <p className="text-[10px] text-gray-400 line-through">{formatPrice(item.product?.price)} {t('buyer.cart.each')}</p>
                                    <p className="text-[10px] text-rose-500 font-bold">-{item.product?.discount_percentage}% OFF</p>
                                  </div>
                                ) : (
                                  <p className="text-xs text-gray-400">{formatPrice(item.product?.price)} {t('buyer.cart.each')}</p>
                                )}
                              </div>
                              
                              {/* Enhanced Remove Button */}
                              <button
                                onClick={() => removeItem(item.id, item.product?.name)}
                                disabled={isUpdating}
                                className="text-gray-400 hover:text-rose-500 transition-all p-2 hover:bg-rose-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                                aria-label={t('buyer.cart.removeItem', { product: item.product?.name })}
                              >
                                {isUpdating ? (
                                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-400 border-t-transparent" aria-hidden="true"></div>
                                ) : (
                                  <Trash2 className="w-4 h-4" aria-hidden="true" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {/* Enhanced Clear Cart Button */}
                <button
                  onClick={clearCart}
                  className="text-rose-500 hover:text-rose-600 text-sm flex items-center gap-2 transition-all focus:outline-none focus:ring-2 focus:ring-rose-500 rounded-xl px-3 py-2 bg-rose-50 hover:bg-rose-100 font-medium"
                  aria-label={t('buyer.cart.clearCart')}
                >
                  <Trash2 className="w-4 h-4" aria-hidden="true" />
                  {t('buyer.cart.clearCart')}
                </button>
              </div>

              {/* Enhanced Order Summary */}
              <div className="lg:col-span-1">
                <div 
                  className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 overflow-hidden lg:sticky lg:top-24"
                  role="complementary"
                  aria-label={t('buyer.cart.orderSummary')}
                >
                  <div className="bg-gradient-to-r from-[#5C352C] to-[#8B5E4F] px-6 py-5">
                    <div className="flex items-center gap-2">
                      <Wallet className="w-5 h-5 text-white" aria-hidden="true" />
                      <h3 className="text-lg font-bold text-white">{t('buyer.cart.orderSummary')}</h3>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      <div className="flex justify-between text-gray-600">
                        <span className="font-medium">{t('buyer.cart.subtotal', { count: summary.total_items })}</span>
                        <span className="font-bold text-gray-900">{formatPrice(summary.subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span className="font-medium">{t('buyer.cart.deliveryFee')}</span>
                        <span className="text-gray-400 bg-gray-50 px-2 py-0.5 rounded-lg text-xs">{t('buyer.cart.calculatedAtCheckout')}</span>
                      </div>
                      <div className="border-t-2 border-gray-100 pt-4 mt-2">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-gray-900 text-lg">{t('buyer.cart.estimatedTotal')}</span>
                          <span className="font-bold text-2xl text-[#5C352C]">{formatPrice(summary.subtotal)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => setShowCheckoutModal(true)}
                      className="w-full mt-7 py-3.5 bg-gradient-to-r from-[#5C352C] to-[#8B5E4F] text-white rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2 font-bold focus:outline-none focus:ring-2 focus:ring-[#5C352C] focus:ring-offset-2"
                      aria-label={t('buyer.cart.proceedToCheckout')}
                    >
                      <CreditCard className="w-4 h-4" aria-hidden="true" />
                      {t('buyer.cart.proceedToCheckout')}
                    </button>
                    
                    <div className="mt-5 flex items-center justify-center gap-3 text-xs">
                      <div className="flex items-center gap-1 text-gray-400">
                        <Shield className="w-3 h-3" aria-hidden="true" />
                        <span>{t('buyer.cart.secureCheckout')}</span>
                      </div>
                      <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                      <div className="flex items-center gap-1 text-gray-400">
                        <Truck className="w-3 h-3" aria-hidden="true" />
                        <span>{t('buyer.cart.fastDelivery')}</span>
                      </div>
                    </div>
                    
                    {/* Enhanced Trust Badge */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-center gap-2 text-emerald-600">
                        <CheckCircle className="w-3 h-3" aria-hidden="true" />
                        <span className="text-[10px] font-medium">{t('buyer.cart.securePayments')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

    {/* Professional Checkout Modal - Matching Dashboard Style */}
{showCheckoutModal && (
  <div 
    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    role="dialog"
    aria-modal="true"
    aria-label={t('buyer.cart.completeCheckout')}
    onClick={(e) => {
      if (e.target === e.currentTarget) setShowCheckoutModal(false);
    }}
  >
    <div 
      ref={checkoutModalRef}
      className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
    >
      {/* Modal Header - Matching Dashboard banner style */}
      <div className="bg-gradient-to-r from-[#5C352C] to-[#7A4B3E] px-6 py-5 rounded-t-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <ShoppingCart className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white">{t('buyer.cart.completeCheckout')}</h3>
            <p className="text-white/60 text-xs mt-0.5">{t('buyer.cart.reviewOrder')}</p>
          </div>
          <button 
            onClick={() => setShowCheckoutModal(false)}
            className="text-white/60 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/10"
            aria-label={t('common.close')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      <div className="p-6 space-y-6">
        {/* Order Items Preview - Like dashboard stat cards */}
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <Package className="w-4 h-4 text-[#5C352C]" />
            <span className="text-sm font-semibold text-gray-900">{t('buyer.cart.itemsInOrder')}</span>
            <span className="text-xs text-gray-400 ml-auto">{t('buyer.cart.itemsCount', { count: cart.length })}</span>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {cart.slice(0, 5).map((item) => (
              <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-500 w-6">{item.quantity}x</span>
                  <span className="text-sm text-gray-700 truncate max-w-[180px]">{item.product?.name}</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{formatPrice(item.product?.discounted_price * item.quantity)}</span>
              </div>
            ))}
            {cart.length > 5 && (
              <p className="text-xs text-gray-400 pt-1">{t('buyer.cart.moreItemsCount', { count: cart.length - 5 })}</p>
            )}
          </div>
          <div className="border-t border-gray-200 mt-3 pt-3 flex justify-between">
            <span className="text-sm font-semibold text-gray-900">{t('buyer.cart.total')}</span>
            <span className="text-lg font-bold text-[#5C352C]">{formatPrice(summary.subtotal)}</span>
          </div>
        </div>
        
        {/* Delivery Address - Clean form like dashboard inputs */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2" id="delivery-address-label">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span>{t('buyer.cart.deliveryAddress')} <span className="text-rose-500">*</span></span>
            </div>
          </label>
          <textarea
            ref={addressInputRef}
            name="delivery_address"
            value={checkoutData.delivery_address}
            onChange={handleCheckoutInputChange}
            rows={isMobile ? 2 : 3}
            className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:border-[#5C352C] focus:ring-1 focus:ring-[#5C352C] text-sm transition-colors bg-gray-50 ${
              checkoutErrors.delivery_address ? 'border-rose-400 bg-rose-50' : 'border-gray-200'
            }`}
            placeholder={t('buyer.cart.deliveryAddressPlaceholder')}
            aria-labelledby="delivery-address-label"
            aria-required="true"
            aria-invalid={!!checkoutErrors.delivery_address}
          />
          {checkoutErrors.delivery_address && (
            <p className="mt-1.5 text-xs text-rose-500 flex items-center gap-1" role="alert">
              <AlertCircle className="w-3 h-3" />
              {checkoutErrors.delivery_address}
            </p>
          )}
        </div>
        
        {/* Order Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2" id="order-notes-label">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span>{t('buyer.cart.orderNotes')}</span>
              <span className="text-xs text-gray-400 font-normal">{t('buyer.cart.optional')}</span>
            </div>
          </label>
          <textarea
            name="notes"
            value={checkoutData.notes}
            onChange={handleCheckoutInputChange}
            rows={isMobile ? 2 : 2}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#5C352C] focus:ring-1 focus:ring-[#5C352C] text-sm transition-colors bg-gray-50"
            placeholder={t('buyer.cart.orderNotesPlaceholder')}
            aria-labelledby="order-notes-label"
          />
        </div>
        
        {/* Payment Method Info - Like dashboard stat card style */}
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <span className="text-sm font-semibold text-blue-800">{t('buyer.cart.paymentMethod')}</span>
              <p className="text-xs text-blue-600 mt-0.5">{t('buyer.cart.paymentDescription')}</p>
            </div>
          </div>
        </div>
        
        {/* Email Notification Info */}
        <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Mail className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex-1">
              <span className="text-sm font-semibold text-emerald-800">{t('buyer.cart.emailNotificationTitle')}</span>
              <p className="text-xs text-emerald-600 mt-0.5">{t('buyer.cart.emailNotificationDesc')}</p>
            </div>
          </div>
        </div>
        
        {/* Action Buttons - Matching dashboard button style */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={handleCheckout}
            disabled={checkoutLoading}
            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#5C352C] to-[#7A4B3E] text-white rounded-xl hover:shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2 font-medium focus:outline-none focus:ring-2 focus:ring-[#5C352C] focus:ring-offset-2"
            aria-label={t('buyer.cart.placeOrder')}
          >
            {checkoutLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                {t('buyer.cart.processing')}
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                {t('buyer.cart.placeOrder')}
              </>
            )}
          </button>
          <button
            onClick={() => setShowCheckoutModal(false)}
            className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all font-medium focus:outline-none focus:ring-2 focus:ring-gray-400"
            aria-label={t('buyer.cart.cancel')}
          >
            {t('buyer.cart.cancel')}
          </button>
        </div>
      </div>
    </div>
  </div>
)}

      <InactiveSellerPopup 
        isOpen={showInactiveSellerPopup} 
        onClose={() => setShowInactiveSellerPopup(false)} 
      />

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </MainLayout>
  );
};

export default Cart;
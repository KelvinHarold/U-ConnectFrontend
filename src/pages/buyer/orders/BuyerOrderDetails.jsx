// src/pages/buyer/orders/BuyerOrderDetails.jsx
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import MainLayout from "../../../layouts/MainLayout";
import api from "../../../api/axios";
import { useToast } from "../../../contexts/ToastContext";
import { useLanguage } from "../../../contexts/LanguageContext";
import { 
  ArrowLeft, 
  ShoppingBag, 
  User, 
  Calendar,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  MessageCircle,
  CreditCard,
  Phone,
  Mail,
  AlertTriangle,
  Shield,
  Eye,
  Store
} from "lucide-react";
import ReportModal from "../../../components/ReportModal";

// ==================== SKELETON LOADERS ====================
const SkeletonOrderHeader = () => (
  <div className="animate-pulse">
    <div className="bg-white rounded-xl border border-gray-100 p-5 mb-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
          <div className="space-y-2">
            <div className="h-5 bg-gray-200 rounded w-32"></div>
            <div className="h-3 bg-gray-200 rounded w-24"></div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-8 bg-gray-200 rounded-full w-24"></div>
          <div className="h-8 bg-gray-200 rounded-lg w-16"></div>
        </div>
      </div>
    </div>
  </div>
);

const SkeletonOrderItems = () => (
  <div className="animate-pulse">
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <div className="border-b border-gray-100 px-5 py-3 bg-gray-50">
        <div className="h-5 bg-gray-200 rounded w-24"></div>
      </div>
      <div className="divide-y divide-gray-100">
        {[1, 2].map(i => (
          <div key={i} className="p-4">
            <div className="flex gap-4">
              <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-48"></div>
                <div className="flex gap-4">
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                  <div className="h-3 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
              <div className="h-5 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ==================== MAIN COMPONENT ====================
const BuyerOrderDetails = () => {
  const { id } = useParams();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [imageErrors, setImageErrors] = useState({});
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/buyer/orders/${id}`);
      setOrder(response.data);
      setError(null);
    } catch (error) {
      const errorMsg = error.response?.data?.message || t('buyer.orderDetails.unableToLoadOrder');
      setError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async () => {
    if (window.confirm(t('buyer.orderDetails.cancelConfirm'))) {
      setCancelling(true);
      try {
        await api.post(`/buyer/orders/${id}/cancel`);
        showToast(t('buyer.orderDetails.orderCancelled'), 'success');
        await fetchOrder();
      } catch (error) {
        showToast(error.response?.data?.message || t('buyer.orderDetails.errorCancellingOrder'), 'error');
      } finally {
        setCancelling(false);
      }
    }
  };

  const confirmDelivery = async () => {
    if (window.confirm(t('buyer.orderDetails.confirmDeliveryConfirm'))) {
      setConfirming(true);
      try {
        await api.post(`/buyer/orders/${id}/confirm-delivery`);
        showToast(t('buyer.orderDetails.deliveryConfirmed'), 'success');
        await fetchOrder();
      } catch (error) {
        showToast(error.response?.data?.message || t('buyer.orderDetails.errorConfirmingDelivery'), 'error');
      } finally {
        setConfirming(false);
      }
    }
  };

  const handleImageError = (itemId) => {
    setImageErrors(prev => ({ ...prev, [itemId]: true }));
  };

  const formatPrice = (price) => `Tsh ${Number(price || 0).toLocaleString()}`;

  const getStatusConfig = (status) => {
    const configs = {
      pending: { 
        label: t('buyer.orderDetails.statusPending'), 
        color: 'bg-amber-50 text-amber-700', 
        icon: Clock 
      },
      confirmed: { 
        label: t('buyer.orderDetails.statusConfirmed'), 
        color: 'bg-blue-50 text-blue-700', 
        icon: CheckCircle 
      },
      preparing: { 
        label: t('buyer.orderDetails.statusPreparing'), 
        color: 'bg-indigo-50 text-indigo-700', 
        icon: Package 
      },
      ready_for_delivery: { 
        label: t('buyer.orderDetails.statusReadyForDelivery'), 
        color: 'bg-purple-50 text-purple-700', 
        icon: Truck 
      },
      delivered: { 
        label: t('buyer.orderDetails.statusDelivered'), 
        color: 'bg-emerald-50 text-emerald-700', 
        icon: CheckCircle 
      },
      cancelled: { 
        label: t('buyer.orderDetails.statusCancelled'), 
        color: 'bg-rose-50 text-rose-700', 
        icon: XCircle 
      }
    };
    return configs[status] || configs.pending;
  };

  const canCancel = () => order && ['pending', 'confirmed'].includes(order.status);
  const canConfirmDelivery = () => order && order.status === 'ready_for_delivery';

  if (loading) {
    return (
      <MainLayout>
        <div className="p-6 bg-gray-50 min-h-screen">
          <div className="max-w-5xl mx-auto">
            <div className="mb-6">
              <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
            </div>
            <SkeletonOrderHeader />
            <div className="grid lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2">
                <SkeletonOrderItems />
              </div>
              <div>
                <div className="h-64 bg-gray-200 rounded-xl animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !order) {
    return (
      <MainLayout>
        <div className="p-6 bg-gray-50 min-h-screen">
          <div className="max-w-md mx-auto bg-white rounded-xl border border-gray-100 p-8 text-center">
            <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-gray-900 mb-1">{t('buyer.orderDetails.orderNotFound')}</h3>
            <p className="text-sm text-gray-500 mb-4">{error || t('buyer.orderDetails.unableToLoadOrder')}</p>
            <Link to="/buyer/orders" className="inline-flex items-center gap-2 text-[#5C352C] hover:underline text-sm">
              <ArrowLeft className="w-4 h-4" />
              {t('buyer.orderDetails.backToOrders')}
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  const StatusIcon = getStatusConfig(order.status).icon;

  return (
    <MainLayout>
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-5xl mx-auto">
          
          {/* Back Button */}
          <div className="mb-5">
            <Link to="/buyer/orders" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#5C352C] transition-colors">
              <ArrowLeft className="w-4 h-4" />
              {t('buyer.orderDetails.backToOrders')}
            </Link>
          </div>

          {/* Order Header */}
          <div className="bg-white rounded-xl border border-gray-100 p-5 mb-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#5C352C]/10 rounded-xl flex items-center justify-center">
                  <ShoppingBag className="w-6 h-6 text-[#5C352C]" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">
                    {t('buyer.orderDetails.orderNumber', { number: order.order_number || order.id })}
                  </h1>
                  <p className="text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusConfig(order.status).color}`}>
                  <StatusIcon className="w-3 h-3" />
                  {getStatusConfig(order.status).label}
                </span>
                <Link to={`/buyer/orders/${order.id}/track`}>
                  <button className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    {t('buyer.orderDetails.trackOrder')}
                  </button>
                </Link>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid lg:grid-cols-3 gap-5">
            
            {/* Left Column - Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="border-b border-gray-100 px-5 py-3 bg-gray-50">
                  <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <Package className="w-4 h-4 text-[#5C352C]" />
                    {t('buyer.orderDetails.orderItems')}
                  </h3>
                </div>
                
                <div className="divide-y divide-gray-100">
                  {order.items?.map((item, index) => (
                    <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex gap-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                          {item.product?.image && !imageErrors[item.id] ? (
                            <img 
                              src={item.product.image} 
                              alt={item.product_name}
                              className="w-full h-full object-cover"
                              onError={() => handleImageError(item.id)}
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <Link 
                            to={`/buyer/shop/products/${item.product_id}`}
                            className="font-medium text-gray-900 hover:text-[#5C352C] text-sm transition-colors"
                          >
                            {item.product_name || item.product?.name || 'Product'}
                          </Link>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-gray-500">
                            <span>{t('buyer.orderDetails.quantity', { count: item.quantity })}</span>
                            <span>{formatPrice(item.product_price || item.price)} {t('buyer.orderDetails.each')}</span>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="font-semibold text-[#5C352C] text-sm">
                            {formatPrice(item.subtotal || (item.price * item.quantity))}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Order Summary */}
                <div className="border-t border-gray-100 px-5 py-3 bg-gray-50">
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">{t('buyer.orderDetails.subtotal')}</span>
                      <span className="font-medium">{formatPrice(order.subtotal || order.total)}</span>
                    </div>
                    {order.delivery_fee > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">{t('buyer.orderDetails.deliveryFee')}</span>
                        <span className="font-medium">{formatPrice(order.delivery_fee)}</span>
                      </div>
                    )}
                    {order.discount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">{t('buyer.orderDetails.discount')}</span>
                        <span className="text-red-600">-{formatPrice(order.discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-2 mt-2 border-t border-gray-200">
                      <span className="font-semibold text-gray-900">{t('buyer.orderDetails.total')}</span>
                      <span className="font-bold text-[#5C352C]">{formatPrice(order.total)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Info Sidebar */}
            <div className="space-y-4">
              
              {/* Seller Card */}
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
                  <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <Store className="w-4 h-4 text-[#5C352C]" />
                    {t('buyer.orderDetails.seller')}
                  </h3>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#5C352C]/10 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-[#5C352C]" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{order.seller?.name || 'N/A'}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Shield className="w-3 h-3 text-emerald-500" />
                        <span className="text-xs text-gray-500">{t('buyer.orderDetails.verifiedSeller')}</span>
                      </div>
                    </div>
                  </div>
                  {order.seller?.email && (
                    <div className="flex items-center gap-2 mt-3 text-xs">
                      <Mail className="w-3.5 h-3.5 text-gray-400" />
                      <a href={`mailto:${order.seller.email}`} className="text-gray-600 hover:text-[#5C352C] truncate">
                        {order.seller.email}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Delivery Card */}
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
                  <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <Truck className="w-4 h-4 text-[#5C352C]" />
                    {t('buyer.orderDetails.delivery')}
                  </h3>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5" />
                    <p className="text-xs text-gray-600">
                      {order.delivery_address || t('buyer.orderDetails.addressNotProvided')}
                    </p>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">{t('buyer.orderDetails.paymentMethod')}</span>
                    <span className="text-gray-700 flex items-center gap-1">
                      <CreditCard className="w-3 h-3" />
                      {order.payment_method || t('buyer.orderDetails.cashOnDelivery')}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">{t('buyer.orderDetails.paymentStatus')}</span>
                    <span className={order.payment_status === 'paid' ? 'text-emerald-600 font-medium' : 'text-amber-600'}>
                      {order.payment_status === 'paid' ? t('buyer.orderDetails.paid') : t('buyer.orderDetails.pending')}
                    </span>
                  </div>
                  {order.notes && (
                    <div className="flex items-start gap-2 pt-2 border-t border-gray-100">
                      <MessageCircle className="w-3.5 h-3.5 text-gray-400 mt-0.5" />
                      <p className="text-xs text-gray-500 italic">{order.notes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              {(canCancel() || canConfirmDelivery()) && (
                <div className="space-y-2">
                  {canCancel() && (
                    <button
                      onClick={cancelOrder}
                      disabled={cancelling}
                      className="w-full py-2 text-sm font-medium text-white bg-rose-500 rounded-lg hover:bg-rose-600 transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
                      aria-label={t('buyer.orderDetails.cancelOrder')}
                    >
                      {cancelling ? t('buyer.orderDetails.cancelling') : t('buyer.orderDetails.cancelOrder')}
                    </button>
                  )}
                  {canConfirmDelivery() && (
                    <button
                      onClick={confirmDelivery}
                      disabled={confirming}
                      className="w-full py-2 text-sm font-medium text-white bg-emerald-500 rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                      aria-label={t('buyer.orderDetails.confirmDelivery')}
                    >
                      {confirming ? t('buyer.orderDetails.confirming') : t('buyer.orderDetails.confirmDelivery')}
                    </button>
                  )}
                  <button
                    onClick={() => setIsReportModalOpen(true)}
                    className="w-full py-2 text-sm font-medium text-rose-600 bg-white border border-rose-200 rounded-lg hover:bg-rose-50 transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
                    aria-label={t('buyer.orderDetails.reportIssue')}
                  >
                    {t('buyer.orderDetails.reportIssue')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ReportModal 
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        initialType="order"
        initialData={{ orderId: order.id }}
      />
    </MainLayout>
  );
};

export default BuyerOrderDetails;
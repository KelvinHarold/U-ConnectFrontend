// src/pages/seller/orders/OrderDetails.jsx

import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import MainLayout from "../../../layouts/MainLayout";
import api from "../../../api/axios";
import { useToast } from "../../../contexts/ToastContext";
import { confirmAlert } from '../../../utils/sweetAlertHelper';
import { useLanguage } from "../../../contexts/LanguageContext";
import { 
  ArrowLeft, 
  ShoppingBag, 
  User, 
  DollarSign, 
  Calendar,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  MessageCircle,
  RefreshCw,
  MapPin,
  Phone,
  Mail,
  ChevronRight,
  CreditCard,
  AlertTriangle,
  Copy,
  Check,
  ChevronDown,
  Image as ImageIcon
} from "lucide-react";
import ReportModal from "../../../components/ReportModal";

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

const OrderDetails = () => {
  const { id } = useParams();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [copied, setCopied] = useState(false);
  const [receiptLoading, setReceiptLoading] = useState(false);
  const [imageErrors, setImageErrors] = useState({});
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Add shimmer style
  useEffect(() => {
    if (!document.querySelector('#shimmer-styles-order-details')) {
      const style = document.createElement('style');
      style.id = 'shimmer-styles-order-details';
      style.textContent = shimmerStyle;
      document.head.appendChild(style);
    }
  }, []);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const response = await api.get(`/seller/orders/${id}`);
      setOrder(response.data);
      setSelectedStatus(response.data.status);
      setError(null);
    } catch (error) {
      setError(t('seller.orderDetails.orderNotFound'));
      showToast(t('seller.orderDetails.orderNotFound'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (selectedStatus === order.status) {
      showToast(t('seller.orderDetails.selectDifferentStatus'), 'error');
      return;
    }
    
    const confirmed = await confirmAlert({
      title: t('seller.orderDetails.confirmStatusChange', { status: selectedStatus.replace('_', ' ').toUpperCase() }),
      text: '',
      icon: 'question',
      confirmButtonText: t('seller.orderDetails.yesUpdate'),
      cancelButtonText: t('common.cancel'),
    });
    if (confirmed) {
      setUpdating(true);
      try {
        await api.patch(`/seller/orders/${id}/status`, { status: selectedStatus });
        showToast(t('seller.orderDetails.statusUpdated'), 'success');
        fetchOrder();
      } catch (error) {
        showToast(t('seller.orderDetails.errorUpdatingStatus'), 'error');
      } finally {
        setUpdating(false);
      }
    }
  };

  const handleSendReceipt = async () => {
    setReceiptLoading(true);
    try {
      await api.post(`/seller/orders/${id}/receipt`);
      showToast(t('seller.orderDetails.receiptSent') || 'Receipt sent successfully to buyer email', 'success');
    } catch (error) {
      showToast(t('seller.orderDetails.errorSendingReceipt') || 'Failed to send receipt', 'error');
    } finally {
      setReceiptLoading(false);
    }
  };

  const copyOrderId = () => {
    const orderId = order?.order_number || order?.id;
    navigator.clipboard.writeText(`#${orderId}`);
    setCopied(true);
    showToast(t('seller.orderDetails.orderIdCopied'), 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  const formatPrice = (price) => `Tsh ${Number(price || 0).toLocaleString()}`;

  const getStatusConfig = (status) => {
    const configs = {
      pending: { 
        label: t('seller.orderDetails.statusPending'), 
        color: 'bg-amber-50 text-amber-700', 
        icon: Clock, 
        step: 1 
      },
      confirmed: { 
        label: t('seller.orderDetails.statusConfirmed'), 
        color: 'bg-blue-50 text-blue-700', 
        icon: CheckCircle, 
        step: 2 
      },
      preparing: { 
        label: t('seller.orderDetails.statusPreparing'), 
        color: 'bg-purple-50 text-purple-700', 
        icon: Package, 
        step: 3 
      },
      ready_for_delivery: { 
        label: t('seller.orderDetails.statusReady'), 
        color: 'bg-orange-50 text-orange-700', 
        icon: Truck, 
        step: 4 
      },
      delivered: { 
        label: t('seller.orderDetails.statusDelivered'), 
        color: 'bg-emerald-50 text-emerald-700', 
        icon: CheckCircle, 
        step: 5 
      },
      cancelled: { 
        label: t('seller.orderDetails.statusCancelled'), 
        color: 'bg-rose-50 text-rose-700', 
        icon: XCircle, 
        step: 0 
      }
    };
    return configs[status] || configs.pending;
  };

  const getStatusBadge = (status) => {
    const config = getStatusConfig(status);
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3.5 h-3.5" />
        {config.label}
      </span>
    );
  };

  const getAvailableStatuses = () => {
    const flow = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['preparing', 'cancelled'],
      preparing: ['ready_for_delivery', 'cancelled'],
      ready_for_delivery: ['delivered', 'cancelled'],
      delivered: [],
      cancelled: []
    };
    return flow[order?.status] || [];
  };

  const getProgressPercentage = () => {
    const steps = { 
      pending: 20, 
      confirmed: 40, 
      preparing: 60, 
      ready_for_delivery: 80, 
      delivered: 100, 
      cancelled: 0 
    };
    return steps[order?.status] || 0;
  };

  const progressSteps = [
    t('seller.orderDetails.progressPending'),
    t('seller.orderDetails.progressConfirmed'),
    t('seller.orderDetails.progressPreparing'),
    t('seller.orderDetails.progressReady'),
    t('seller.orderDetails.progressDelivered')
  ];

  if (loading) {
    return (
      <MainLayout>
        <div className="p-6 bg-gray-50 min-h-screen">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-32"></div>
              <div className="h-9 w-28 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-lg"></div>
            </div>
            <div className="bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-xl h-28 mb-6"></div>
            <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
              <div className="h-5 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-32 mb-4"></div>
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex gap-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-xl"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-48"></div>
                      <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-24"></div>
                    </div>
                  </div>
                ))}
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
            <XCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-gray-900 mb-1">{t('seller.orderDetails.orderNotFound')}</h3>
            <p className="text-sm text-gray-500 mb-4">{error || t('seller.orderDetails.unableToLoad')}</p>
            <Link to="/seller/orders" className="inline-flex items-center gap-2 text-sm text-[#5C352C] hover:underline">
              <ArrowLeft className="w-4 h-4" />
              {t('seller.orderDetails.backToOrders')}
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  const statusConfig = getStatusConfig(order.status);
  const progressPercentage = getProgressPercentage();
  const availableStatuses = getAvailableStatuses();

  return (
    <MainLayout>
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto space-y-6">
          
          <ReportModal 
            isOpen={isReportModalOpen}
            onClose={() => setIsReportModalOpen(false)}
            initialType="order"
            initialData={{ orderId: order.id }}
          />

          {/* Header */}
          <div className="flex justify-between items-center flex-wrap gap-4">
            <Link to="/seller/orders" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#5C352C] transition-colors">
              <ArrowLeft className="w-4 h-4" />
              {t('seller.orderDetails.backToOrders')}
            </Link>
            {order.status === 'delivered' && (
              <button 
                onClick={handleSendReceipt} 
                disabled={receiptLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                {receiptLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                {t('seller.orderDetails.sendReceipt') || 'Send Receipt'}
              </button>
            )}
          </div>

          {/* Order Header */}
          <div className="bg-gradient-to-r from-[#2A1713] to-[#5C352C] rounded-xl p-5">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                  <ShoppingBag className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-lg font-semibold text-white">
                      {t('seller.orderDetails.orderHash')}{order.order_number || order.id}
                    </h1>
                    <button 
                      onClick={copyOrderId} 
                      className="p-1 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                      aria-label={t('seller.orderDetails.copyOrderId')}
                    >
                      {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3 text-white" />}
                    </button>
                  </div>
                  <p className="text-xs text-white/70 mt-0.5">
                    {new Date(order.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
              {getStatusBadge(order.status)}
            </div>
          </div>

          {/* Progress Tracker */}
          {order.status !== 'cancelled' && (
            <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
              <div className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-500">{t('seller.orderDetails.progress')}</span>
                  <span className="text-[#5C352C] font-medium">{progressPercentage}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div 
                    className="bg-[#5C352C] h-1.5 rounded-full transition-all" 
                    style={{ width: `${progressPercentage}%` }} 
                  />
                </div>
              </div>
              <div className="grid grid-cols-5 gap-1 text-center">
                {progressSteps.map((step, idx) => {
                  const stepValue = (idx + 1) * 20;
                  const isCompleted = progressPercentage >= stepValue;
                  return (
                    <div key={idx}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center mx-auto mb-1 text-xs ${
                        isCompleted ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {isCompleted ? <CheckCircle className="w-3 h-3" /> : idx + 1}
                      </div>
                      <p className="text-[10px] text-gray-500">{step}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="grid lg:grid-cols-3 gap-6">
            
            {/* Left Column - Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                <div className="p-4 border-b border-gray-100 bg-gray-50">
                  <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <Package className="w-4 h-4 text-[#5C352C]" />
                    {t('seller.orderDetails.orderItems')}
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
                              onError={() => setImageErrors(prev => ({ ...prev, [item.id]: true }))} 
                            />
                          ) : (
                            <ImageIcon className="w-6 h-6 text-gray-400 m-5" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 text-sm">{item.product_name || item.product?.name}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {t('seller.orderDetails.quantity')}: {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-[#5C352C] text-sm">
                            {formatPrice(item.product_price || item.price)}
                          </p>
                          <p className="text-[10px] text-gray-400">
                            {t('seller.orderDetails.total')}: {formatPrice((item.product_price || item.price) * item.quantity)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 bg-gray-50 border-t border-gray-100">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">{t('seller.orderDetails.subtotal')}</span>
                    <span className="font-medium">{formatPrice(order.subtotal || order.total)}</span>
                  </div>
                  {order.shipping_cost && (
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-gray-500">{t('seller.orderDetails.shipping')}</span>
                      <span className="font-medium">{formatPrice(order.shipping_cost)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 mt-2 border-t border-gray-200">
                    <span className="font-semibold text-gray-900">{t('seller.orderDetails.total')}</span>
                    <span className="font-bold text-[#5C352C]">{formatPrice(order.total)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Info */}
            <div className="space-y-4">
              
              {/* Status Update */}
              {availableStatuses.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                  <div className="p-4 border-b border-gray-100 bg-gray-50">
                    <h3 className="text-sm font-semibold text-gray-900">{t('seller.orderDetails.updateStatus')}</h3>
                  </div>
                  <div className="p-4">
                    <select 
                      value={selectedStatus} 
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm mb-3 focus:outline-none focus:border-[#5C352C]"
                    >
                      <option value={order.status}>
                        {t('seller.orderDetails.current')}: {statusConfig.label}
                      </option>
                      {availableStatuses.map(status => {
                        const config = getStatusConfig(status);
                        return <option key={status} value={status}>→ {config.label}</option>;
                      })}
                    </select>
                    <button 
                      onClick={handleStatusUpdate} 
                      disabled={updating}
                      className="w-full py-2 bg-[#5C352C] text-white rounded-lg text-sm font-medium hover:bg-[#4A2A22] transition-colors disabled:opacity-50"
                    >
                      {updating ? t('seller.orderDetails.updating') : t('seller.orderDetails.updateStatus')}
                    </button>
                  </div>
                </div>
              )}

              {/* Customer Info */}
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                <div className="p-4 border-b border-gray-100 bg-gray-50">
                  <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <User className="w-4 h-4 text-[#5C352C]" />
                    {t('seller.orderDetails.customer')}
                  </h3>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-start gap-2">
                    <User className="w-3.5 h-3.5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">{t('seller.orderDetails.name')}</p>
                      <p className="text-sm text-gray-900">{order.buyer?.name || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Mail className="w-3.5 h-3.5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">{t('seller.orderDetails.email')}</p>
                      <p className="text-sm text-gray-900">{order.buyer?.email || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Phone className="w-3.5 h-3.5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">{t('seller.orderDetails.phone')}</p>
                      <p className="text-sm text-gray-900">{order.buyer?.phone || 'N/A'}</p>
                    </div>
                  </div>
                  {order.delivery_address && (
                    <div className="flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500">{t('seller.orderDetails.address')}</p>
                        <p className="text-sm text-gray-900">{order.delivery_address}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Info */}
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                <div className="p-4 border-b border-gray-100 bg-gray-50">
                  <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-[#5C352C]" />
                    {t('seller.orderDetails.payment')}
                  </h3>
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">{t('seller.orderDetails.method')}</span>
                    <span className="text-gray-900 capitalize">
                      {order.payment_method === 'cash_on_delivery' 
                        ? t('seller.orderDetails.cashOnDelivery')
                        : order.payment_method || t('seller.orderDetails.cashOnDelivery')}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">{t('seller.orderDetails.paymentStatus')}</span>
                    <span className={order.payment_status === 'paid' ? 'text-emerald-600 font-medium' : 'text-amber-600'}>
                      {order.payment_status === 'paid' 
                        ? t('seller.orderDetails.paid') 
                        : t('seller.orderDetails.pending')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Report Button */}
              <button 
                onClick={() => setIsReportModalOpen(true)}
                className="w-full py-2 text-sm text-rose-600 bg-white border border-rose-200 rounded-lg hover:bg-rose-50 transition-colors"
              >
                {t('seller.orderDetails.reportIssue')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default OrderDetails;
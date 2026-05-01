// src/pages/admin/orders/OrderDetails.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import MainLayout from "../../../layouts/MainLayout";
import api from "../../../api/axios";
import { useToast } from "../../../contexts/ToastContext";
import { useLanguage } from "../../../contexts/LanguageContext";
import { confirmAlert } from '../../../utils/sweetAlertHelper';
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
  RefreshCw,
  MapPin,
  Mail,
  Phone,
  Activity,
  TrendingUp,
  CreditCard,
  Info,
  AlertTriangle,
  ChevronLeft
} from "lucide-react";

// ==================== SKELETON LOADERS ====================
const SkeletonDetailItem = () => (
  <div className="animate-pulse">
    <div className="flex items-start gap-3 p-2 -mx-2">
      <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-gray-200 rounded w-20"></div>
        <div className="h-4 bg-gray-200 rounded w-32"></div>
      </div>
    </div>
  </div>
);

const SkeletonOrderItem = () => (
  <div className="animate-pulse">
    <div className="p-5 border-b border-gray-100">
      <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-48"></div>
          <div className="flex gap-3">
            <div className="h-3 bg-gray-200 rounded w-16"></div>
            <div className="h-3 bg-gray-200 rounded w-12"></div>
          </div>
        </div>
        <div className="h-5 bg-gray-200 rounded w-24"></div>
      </div>
    </div>
  </div>
);

// ==================== MAIN COMPONENT ====================
const OrderDetails = () => {
  const { id } = useParams();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/admin/orders/${id}`);
      setOrder(response.data);
      setSelectedStatus(response.data.status);
    } catch (error) {
      console.error("Error fetching order:", error);
      setError(error.response?.data?.message || "Order not found");
      showToast(error.response?.data?.message || "Order not found", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchOrder();
    setRefreshing(false);
    showToast('Order details refreshed', 'info');
  };

  const handleStatusUpdate = async () => {
    if (selectedStatus === order.status) {
      showToast("Please select a different status", "info");
      return;
    }
    
    const confirmed = await confirmAlert({
      title: t('alerts.statusUpdateConfirm', { status: selectedStatus }),
      text: '',
      icon: 'question',
      confirmButtonText: t('common.save'),
      cancelButtonText: t('common.cancel'),
    });
    if (confirmed) {
      setUpdating(true);
      try {
        await api.patch(`/admin/orders/${id}/status`, { status: selectedStatus });
        showToast("Order status updated successfully", "success");
        await fetchOrder();
      } catch (error) {
        showToast(error.response?.data?.message || "Error updating order status", "error");
      } finally {
        setUpdating(false);
      }
    }
  };

  const formatPrice = (price) => `Tsh ${Number(price || 0).toLocaleString()}`;

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: 'Pending', color: 'bg-amber-50 text-amber-700', icon: Clock },
      confirmed: { label: 'Confirmed', color: 'bg-blue-50 text-blue-700', icon: CheckCircle },
      preparing: { label: 'Preparing', color: 'bg-indigo-50 text-indigo-700', icon: Package },
      ready_for_delivery: { label: 'Ready', color: 'bg-purple-50 text-purple-700', icon: Truck },
      delivered: { label: 'Delivered', color: 'bg-emerald-50 text-emerald-700', icon: CheckCircle },
      cancelled: { label: 'Cancelled', color: 'bg-rose-50 text-rose-700', icon: XCircle },
      rejected: { label: 'Rejected', color: 'bg-gray-50 text-gray-600', icon: XCircle }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  const getStatusProgress = () => {
    const statusOrder = ['pending', 'confirmed', 'preparing', 'ready_for_delivery', 'delivered'];
    const currentIndex = statusOrder.indexOf(order?.status);
    if (currentIndex === -1) return 0;
    const progress = ((currentIndex + 1) / statusOrder.length) * 100;
    return progress;
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
            <div className="bg-gradient-to-r from-[#2A1713] to-[#5C352C] rounded-xl overflow-hidden mb-6">
              <div className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white/20 rounded-xl animate-pulse"></div>
                    <div className="space-y-2">
                      <div className="h-6 bg-white/20 rounded w-48 animate-pulse"></div>
                      <div className="h-3 bg-white/20 rounded w-32 animate-pulse"></div>
                    </div>
                  </div>
                  <div className="h-8 bg-white/20 rounded w-24 animate-pulse"></div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
              <div className="h-6 bg-gray-200 rounded w-32 mb-4 animate-pulse"></div>
              <div className="h-2 bg-gray-200 rounded-full mb-4 animate-pulse"></div>
              <div className="flex justify-between">
                {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-3 bg-gray-200 rounded w-12 animate-pulse"></div>)}
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100">
                    <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {[1, 2, 3].map(i => <SkeletonOrderItem key={i} />)}
                  </div>
                  <div className="px-6 py-4 bg-gray-50">
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                      <div className="h-6 bg-gray-200 rounded w-32 ml-auto animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100">
                    <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
                  </div>
                  <div className="p-5 space-y-4">
                    {[1, 2, 3].map(i => <SkeletonDetailItem key={i} />)}
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100">
                    <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
                  </div>
                  <div className="p-5 space-y-4">
                    {[1, 2, 3].map(i => <SkeletonDetailItem key={i} />)}
                  </div>
                </div>
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
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-xl border border-red-100 p-12 text-center">
              <XCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
              <h3 className="text-base font-medium text-gray-900 mb-1">Error Loading Order</h3>
              <p className="text-sm text-gray-500 mb-4">{error || "Order not found"}</p>
              <Link to="/admin/orders" className="inline-flex items-center gap-2 px-4 py-2 bg-[#5C352C] text-white rounded-lg hover:bg-[#956959] transition-colors text-sm">
                <ArrowLeft className="w-4 h-4" /> Back to Orders
              </Link>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="mb-6">
            <Link to="/admin/orders" className="inline-flex items-center gap-2 text-[#5C352C] hover:text-[#956959] transition-colors mb-2">
              <ChevronLeft className="w-4 h-4" />
              <span className="text-sm">Back to Orders</span>
            </Link>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 bg-[#5C352C]/10 rounded-xl">
                <ShoppingBag className="w-5 h-5 text-[#5C352C]" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Order Details</h1>
            </div>
            <p className="text-sm text-gray-500 ml-11">View and manage order information</p>
          </div>

          {/* Refresh Button */}
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

          {/* Order Header Banner */}
          <div className="bg-gradient-to-r from-[#2A1713] to-[#5C352C] rounded-xl overflow-hidden mb-6">
            <div className="px-6 py-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center">
                    <ShoppingBag className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white font-mono">Order #{order.order_number}</h2>
                    <p className="text-[#E9B48A] text-sm mt-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Placed on {new Date(order.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                {getStatusBadge(order.status)}
              </div>
            </div>
          </div>

          {/* Order Progress Timeline */}
          {order.status !== 'cancelled' && order.status !== 'rejected' && (
            <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
              <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#5C352C]" />
                Order Progress
              </h3>
              <div className="relative">
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-gray-100">
                  <div 
                    style={{ width: `${getStatusProgress()}%` }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-[#5C352C] transition-all duration-500 rounded-full"
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span className={order.status === 'pending' ? 'text-[#5C352C] font-semibold' : ''}>Pending</span>
                  <span className={order.status === 'confirmed' ? 'text-[#5C352C] font-semibold' : ''}>Confirmed</span>
                  <span className={order.status === 'preparing' ? 'text-[#5C352C] font-semibold' : ''}>Preparing</span>
                  <span className={order.status === 'ready_for_delivery' ? 'text-[#5C352C] font-semibold' : ''}>Ready</span>
                  <span className={order.status === 'delivered' ? 'text-[#5C352C] font-semibold' : ''}>Delivered</span>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Order Items - Takes 2/3 on desktop */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Items Card */}
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                    <Package className="w-5 h-5 text-[#5C352C]" />
                    Order Items
                  </h3>
                </div>
                
                {/* Items List */}
                <div className="divide-y divide-gray-100">
                  {order.items?.map((item, index) => (
                    <div key={index} className="p-5 hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{item.product?.name || 'Product'}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-gray-500">Qty: {item.quantity}</span>
                            <span className="text-xs text-gray-400">×</span>
                            <span className="text-xs text-gray-600">{formatPrice(item.price)} each</span>
                          </div>
                        </div>
                        <div className="text-left sm:text-right">
                          <p className="font-bold text-[#5C352C]">{formatPrice(item.price * item.quantity)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Order Summary */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Subtotal</span>
                      <span className="font-medium text-gray-900 text-sm">{formatPrice(order.subtotal || order.total)}</span>
                    </div>
                    {order.shipping_cost && (
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">Shipping Cost</span>
                        <span className="text-gray-600 text-sm">{formatPrice(order.shipping_cost)}</span>
                      </div>
                    )}
                    {order.tax && (
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">Tax</span>
                        <span className="text-gray-600 text-sm">{formatPrice(order.tax)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                      <span className="text-sm font-bold text-gray-900">Total</span>
                      <span className="text-xl font-bold text-[#5C352C]">{formatPrice(order.total)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              {order.payment_method && (
                <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100">
                    <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-[#5C352C]" />
                      Payment Information
                    </h3>
                  </div>
                  <div className="p-5 space-y-3">
                    <InfoRow icon={CreditCard} label="Payment Method" value={order.payment_method} />
                    <InfoRow icon={CheckCircle} label="Payment Status" value={order.payment_status || 'Pending'} />
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Order Information */}
            <div className="space-y-6">
              
              {/* Status Update Card */}
              {order.status !== 'delivered' && order.status !== 'cancelled' && order.status !== 'rejected' && (
                <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100">
                    <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                      <RefreshCw className="w-5 h-5 text-[#5C352C]" />
                      Update Status
                    </h3>
                  </div>
                  <div className="p-5">
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#5C352C] focus:ring-1 focus:ring-[#5C352C] mb-3 text-sm"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="preparing">Preparing</option>
                      <option value="ready_for_delivery">Ready for Delivery</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="rejected">Rejected</option>
                    </select>
                    <button
                      onClick={handleStatusUpdate}
                      disabled={updating}
                      className="w-full px-4 py-2.5 bg-[#5C352C] text-white rounded-lg font-medium hover:bg-[#956959] transition-colors disabled:opacity-50 text-sm"
                    >
                      {updating ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                          Updating...
                        </span>
                      ) : (
                        'Update Status'
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Buyer Information */}
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                    <User className="w-5 h-5 text-[#5C352C]" />
                    Buyer Information
                  </h3>
                </div>
                <div className="p-5 space-y-3">
                  <InfoRow icon={User} label="Full Name" value={order.buyer?.name || 'N/A'} />
                  <InfoRow icon={Mail} label="Email Address" value={order.buyer?.email || 'N/A'} />
                  <InfoRow icon={Phone} label="Phone Number" value={order.buyer?.phone || 'N/A'} />
                  {order.shipping_address && (
                    <InfoRow icon={MapPin} label="Shipping Address" value={order.shipping_address} />
                  )}
                </div>
              </div>

              {/* Seller Information */}
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                    <Package className="w-5 h-5 text-[#5C352C]" />
                    Seller Information
                  </h3>
                </div>
                <div className="p-5 space-y-3">
                  <InfoRow icon={User} label="Seller Name" value={order.seller?.name || 'N/A'} />
                  <InfoRow icon={Mail} label="Email Address" value={order.seller?.email || 'N/A'} />
                  <InfoRow icon={Phone} label="Phone Number" value={order.seller?.phone || 'N/A'} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

// Helper Components
const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3 group hover:bg-gray-50 p-2 -mx-2 rounded-lg transition-colors">
    <div className="w-8 h-8 bg-[#E9B48A]/20 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-[#E9B48A]/30 transition-colors">
      <Icon className="w-4 h-4 text-[#5C352C]" />
    </div>
    <div className="flex-1">
      <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="text-gray-900 font-medium text-sm break-words">{value}</p>
    </div>
  </div>
);

export default OrderDetails;
// src/pages/buyer/orders/OrderTracking.jsx
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import MainLayout from "../../../layouts/MainLayout";
import api from "../../../api/axios";
import { useToast } from "../../../contexts/ToastContext";
import { useLanguage } from "../../../contexts/LanguageContext";
import { 
  ArrowLeft, 
  Package, 
  CheckCircle, 
  Clock,
  Truck,
  Home,
  MapPin,
  XCircle,
  Phone,
  Mail,
  AlertCircle
} from "lucide-react";

const OrderTracking = () => {
  const { id } = useParams();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    fetchTracking();
  }, [id]);

  const fetchTracking = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/buyer/orders/${id}/track`);
      setTracking(response.data);
      setError(null);
    } catch (error) {
      const errorMsg = error.response?.data?.message || t('buyer.orderTracking.unableToLoadTracking');
      setError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const getStepLabel = (stepKey) => {
    const labels = {
      pending: t('buyer.orderTracking.stepPending'),
      confirmed: t('buyer.orderTracking.stepConfirmed'),
      preparing: t('buyer.orderTracking.stepPreparing'),
      ready_for_delivery: t('buyer.orderTracking.stepReadyForDelivery'),
      delivered: t('buyer.orderTracking.stepDelivered')
    };
    return labels[stepKey] || stepKey;
  };

  const getStepIcon = (stepKey, isCompleted, isCurrent) => {
    const icons = {
      pending: Clock,
      confirmed: CheckCircle,
      preparing: Package,
      ready_for_delivery: Truck,
      delivered: Home
    };
    const Icon = icons[stepKey] || Package;
    
    if (isCompleted) {
      return <CheckCircle className="w-4 h-4 text-white" aria-hidden="true" />;
    }
    return <Icon className={`w-4 h-4 ${isCurrent ? 'text-white' : 'text-gray-400'}`} aria-hidden="true" />;
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="p-6 bg-gray-50 min-h-screen">
          <div className="max-w-3xl mx-auto">
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5C352C]" aria-hidden="true"></div>
              <p className="mt-3 text-sm text-gray-500">{t('buyer.orderTracking.loadingTracking')}</p>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !tracking) {
    return (
      <MainLayout>
        <div className="p-6 bg-gray-50 min-h-screen">
          <div className="max-w-md mx-auto bg-white rounded-xl border border-gray-100 p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" aria-hidden="true" />
            <p className="text-sm text-gray-600">{error || t('buyer.orderTracking.trackingNotFound')}</p>
            <Link to={`/buyer/orders/${id}`} className="inline-block mt-4 text-sm text-[#5C352C] hover:underline focus:outline-none focus:ring-2 focus:ring-[#5C352C] rounded px-2 py-1">
              {t('buyer.orderTracking.backToOrder')}
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  const { order, tracking: statuses, current_step } = tracking;
  const statusKeys = Object.keys(statuses);
  const progressPercentage = (current_step / (statusKeys.length - 1)) * 100;

  // Get order status display text
  const getOrderStatusDisplay = () => {
    if (order.status === 'delivered') return t('buyer.orderTracking.delivered');
    if (order.status === 'cancelled') return t('buyer.orderTracking.cancelled');
    return t('buyer.orderTracking.inProgress');
  };

  const getOrderStatusColor = () => {
    if (order.status === 'delivered') return 'bg-emerald-50 text-emerald-700';
    if (order.status === 'cancelled') return 'bg-rose-50 text-rose-700';
    return 'bg-amber-50 text-amber-700';
  };

  return (
    <MainLayout>
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-3xl mx-auto">
          
          {/* Back Button */}
          <div className="mb-5">
            <Link 
              to={`/buyer/orders/${id}`} 
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#5C352C] transition-colors focus:outline-none focus:ring-2 focus:ring-[#5C352C] rounded px-2 py-1"
              aria-label={t('buyer.orderTracking.backToOrder')}
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              {t('buyer.orderTracking.backToOrder')}
            </Link>
          </div>

          {/* Order Info */}
          <div className="bg-white rounded-xl border border-gray-100 p-5 mb-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  {t('buyer.orderTracking.trackOrder', { number: order.order_number || order.id })}
                </h1>
                <p className="text-xs text-gray-500 mt-0.5">
                  {t('buyer.orderTracking.placedOn', { date: new Date(order.created_at).toLocaleDateString() })}
                </p>
              </div>
              <div className={`px-2.5 py-1 rounded-full text-xs font-medium ${getOrderStatusColor()}`}>
                {getOrderStatusDisplay()}
              </div>
            </div>
          </div>

          {/* Tracking Timeline */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="p-5">
              
              {/* Desktop Horizontal Timeline */}
              {!isMobile && (
                <div className="relative mb-8" role="region" aria-label={t('buyer.orderTracking.orderTrackingLabel', { number: order.order_number || order.id })}>
                  {/* Progress Bar */}
                  <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-100">
                    <div 
                      className="h-full bg-[#5C352C] transition-all duration-500"
                      style={{ width: `${progressPercentage}%` }}
                      aria-hidden="true"
                    />
                  </div>
                  
                  {/* Steps */}
                  <div className="relative flex justify-between">
                    {statusKeys.map((key, index) => {
                      const step = statuses[key];
                      const isCompleted = step.completed;
                      const isCurrent = index === current_step;
                      const stepLabel = getStepLabel(key);
                      
                      return (
                        <div key={key} className="flex flex-col items-center text-center flex-1">
                          <div 
                            className={`
                              relative z-10 w-8 h-8 rounded-full flex items-center justify-center
                              ${isCompleted ? 'bg-[#5C352C]' : isCurrent ? 'bg-[#5C352C]' : 'bg-gray-100'}
                            `}
                            aria-label={isCompleted ? t('buyer.orderTracking.stepCompletedLabel', { step: stepLabel, date: step.completed_at ? new Date(step.completed_at).toLocaleDateString() : '' }) : (isCurrent ? t('buyer.orderTracking.stepInProgressLabel', { step: stepLabel }) : stepLabel)}
                          >
                            {getStepIcon(key, isCompleted, isCurrent)}
                          </div>
                          <p className={`mt-2 text-xs font-medium ${isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-400'}`}>
                            {stepLabel}
                          </p>
                          {step.completed_at && (
                            <p className="text-[10px] text-gray-400 mt-1">
                              {new Date(step.completed_at).toLocaleDateString()}
                            </p>
                          )}
                          {isCurrent && !isCompleted && (
                            <span className="mt-1 text-[10px] text-[#5C352C] font-medium">
                              {t('buyer.orderTracking.current')}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Mobile Vertical Timeline */}
              {isMobile && (
                <div className="space-y-4" role="region" aria-label={t('buyer.orderTracking.orderTrackingLabel', { number: order.order_number || order.id })}>
                  {statusKeys.map((key, index) => {
                    const step = statuses[key];
                    const isCompleted = step.completed;
                    const isCurrent = index === current_step;
                    const stepLabel = getStepLabel(key);
                    
                    return (
                      <div key={key} className="flex items-start gap-3">
                        <div 
                          className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${
                            isCompleted ? 'bg-[#5C352C]' : isCurrent ? 'bg-[#5C352C]' : 'bg-gray-100'
                          }`}
                          aria-label={isCompleted ? t('buyer.orderTracking.stepCompletedLabel', { step: stepLabel, date: step.completed_at ? new Date(step.completed_at).toLocaleString() : '' }) : (isCurrent ? t('buyer.orderTracking.stepInProgressLabel', { step: stepLabel }) : stepLabel)}
                        >
                          {getStepIcon(key, isCompleted, isCurrent)}
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-400'}`}>
                            {stepLabel}
                          </p>
                          {step.completed_at && (
                            <p className="text-xs text-gray-400 mt-0.5">
                              {new Date(step.completed_at).toLocaleString()}
                            </p>
                          )}
                          {isCurrent && !isCompleted && (
                            <span className="inline-block mt-1 text-xs text-[#5C352C] font-medium">
                              {t('buyer.orderTracking.inProgressStatus')}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Status Messages */}
              {order.status === 'ready_for_delivery' && (
                <div className="mt-6 p-3 bg-purple-50 rounded-lg border border-purple-100" role="status">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-purple-600" aria-hidden="true" />
                    <p className="text-sm text-purple-800">{t('buyer.orderTracking.outForDelivery')}</p>
                  </div>
                </div>
              )}

              {order.status === 'delivered' && (
                <div className="mt-6 p-3 bg-emerald-50 rounded-lg border border-emerald-100" role="status">
                  <div className="flex items-center gap-2">
                    <Home className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                    <p className="text-sm text-emerald-800">{t('buyer.orderTracking.orderDelivered')}</p>
                  </div>
                </div>
              )}

              {order.status === 'cancelled' && (
                <div className="mt-6 p-3 bg-rose-50 rounded-lg border border-rose-100" role="status">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-rose-600" aria-hidden="true" />
                    <p className="text-sm text-rose-800">{t('buyer.orderTracking.orderCancelled')}</p>
                  </div>
                </div>
              )}

              {/* Delivery Address */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5" aria-hidden="true" />
                  <div>
                    <p className="text-xs font-medium text-gray-700">{t('buyer.orderTracking.deliveryAddress')}</p>
                    <p className="text-sm text-gray-600">
                      {order.delivery_address || t('buyer.orderTracking.addressNotProvided')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Help Section */}
          <div className="mt-5 text-center">
            <p className="text-xs text-gray-500">{t('buyer.orderTracking.needAssistance')}</p>
            <div className="flex flex-wrap gap-3 justify-center mt-2">
              <button 
                className="text-xs text-[#5C352C] hover:underline flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-[#5C352C] rounded px-2 py-1"
                onClick={() => window.location.href = 'mailto:support@example.com'}
                aria-label={t('buyer.orderTracking.emailSupport')}
              >
                <Mail className="w-3 h-3" aria-hidden="true" />
                {t('buyer.orderTracking.emailSupport')}
              </button>
              <button 
                className="text-xs text-[#5C352C] hover:underline flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-[#5C352C] rounded px-2 py-1"
                onClick={() => window.location.href = 'tel:+255123456789'}
                aria-label={t('buyer.orderTracking.callCustomerCare')}
              >
                <Phone className="w-3 h-3" aria-hidden="true" />
                {t('buyer.orderTracking.callCustomerCare')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default OrderTracking;
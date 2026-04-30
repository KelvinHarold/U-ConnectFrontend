import React, { useState, useEffect } from 'react';
import { useToast } from '../../../contexts/ToastContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import MainLayout from '../../../layouts/MainLayout';
import api from '../../../api/axios';
import { 
  ShieldCheck, 
  AlertCircle, 
  Clock, 
  Upload, 
  CreditCard,
  CheckCircle,
  XCircle,
  Calendar,
  Send,
  Loader2,
  FileText
} from 'lucide-react';

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
const SkeletonStatusCard = () => (
  <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-6 overflow-hidden">
    <div className="h-3 sm:h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-24 sm:w-32 mb-3 sm:mb-4"></div>
    <div className="flex flex-col items-center p-4 sm:p-6">
      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-full mb-3 sm:mb-4"></div>
      <div className="h-5 sm:h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-20 sm:w-24 mb-1 sm:mb-2"></div>
      <div className="h-3 sm:h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-24 sm:w-32"></div>
    </div>
  </div>
);

const SkeletonPaymentCard = () => (
  <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-6 overflow-hidden">
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-3 sm:mb-4">
      <div className="h-5 sm:h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-28 sm:w-32"></div>
      <div className="h-6 sm:h-7 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-24 sm:w-28"></div>
    </div>
    <div className="bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-xl h-28 sm:h-32 mb-3 sm:mb-4"></div>
    <div className="h-9 sm:h-10 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-xl"></div>
  </div>
);

const SkeletonHistoryRow = () => (
  <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-4 p-3 sm:p-4 border-b border-gray-100 overflow-hidden">
    <div className="flex-1 min-w-[100px]"><div className="h-3 sm:h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-20 sm:w-24"></div></div>
    <div className="flex-1"><div className="h-3 sm:h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-16 sm:w-20"></div></div>
    <div className="flex-1"><div className="h-3 sm:h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-28 sm:w-32"></div></div>
    <div className="flex-1"><div className="h-5 sm:h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-full w-16 sm:w-20"></div></div>
  </div>
);

const SellerSubscription = () => {
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [data, setData] = useState({
    current_subscription: null,
    history: [],
    is_active: false,
    price: 5000,
    payment_number: ''
  });
  const [paymentProof, setPaymentProof] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
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
    if (!document.querySelector('#shimmer-styles-subscription')) {
      const style = document.createElement('style');
      style.id = 'shimmer-styles-subscription';
      style.textContent = shimmerStyle;
      document.head.appendChild(style);
    }
  }, []);

  useEffect(() => {
    fetchSubscriptionData();
  }, []);

  const fetchSubscriptionData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/seller/subscription');
      setData(response.data);
    } catch (error) {
      showToast(t('seller.subscription.loadFailed'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast(t('seller.subscription.invalidFileSize'), 'error');
        return;
      }
      setPaymentProof(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!paymentProof) {
      showToast(t('seller.subscription.noFileSelected'), 'error');
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('payment_proof', paymentProof);
      await api.post('/seller/subscription', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      showToast(t('seller.subscription.uploadSuccess'), 'success');
      setPaymentProof(null);
      setPreviewUrl('');
      fetchSubscriptionData();
    } catch (error) {
      showToast(error.response?.data?.message || t('seller.subscription.uploadFailed'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'active':
        return { color: 'text-emerald-600', bg: 'bg-emerald-50', text: t('seller.subscription.active'), icon: <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> };
      case 'pending':
        return { color: 'text-amber-600', bg: 'bg-amber-50', text: t('seller.subscription.pending'), icon: <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> };
      case 'rejected':
        return { color: 'text-rose-600', bg: 'bg-rose-50', text: t('seller.subscription.rejected'), icon: <XCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> };
      default:
        return { color: 'text-gray-500', bg: 'bg-gray-100', text: t('seller.subscription.inactive'), icon: <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> };
    }
  };

  const formatCurrency = (amount) => `Tsh ${Number(amount).toLocaleString()}`;
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
          <div className="max-w-5xl mx-auto">
            <div className="mb-4 sm:mb-6">
              <div className="h-6 sm:h-8 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-36 sm:w-48 mb-1 sm:mb-2"></div>
              <div className="h-3 sm:h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-48 sm:w-64"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
              <div className="md:col-span-1"><SkeletonStatusCard /></div>
              <div className="md:col-span-2"><SkeletonPaymentCard /></div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="p-3 sm:p-4 border-b border-gray-100">
                <div className="h-4 sm:h-5 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-24 sm:w-32"></div>
              </div>
              <div className="divide-y divide-gray-100">
                {[1, 2, 3].map(i => <SkeletonHistoryRow key={i} />)}
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  const currentSub = data.current_subscription;
  const statusConfig = getStatusConfig(currentSub?.status || (data.is_active ? 'active' : 'inactive'));

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="p-3 sm:p-4 md:p-6 lg:p-8">
          <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6">
          
            {/* Header - Responsive */}
            <div>
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900">{t('seller.subscription.title')}</h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">{t('seller.subscription.subtitle')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              
              {/* Status Card - Responsive */}
              <div className="bg-white rounded-xl border-2 border-gray-100 p-4 sm:p-5 shadow-sm">
                <h2 className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 sm:mb-4">{t('seller.subscription.currentStatus')}</h2>
                <div className="flex flex-col items-center p-3 sm:p-4 bg-gray-50 rounded-lg">
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center mb-2 sm:mb-3 ${statusConfig.bg} ${statusConfig.color}`}>
                    {statusConfig.icon}
                  </div>
                  <span className={`text-sm sm:text-base font-semibold ${statusConfig.color}`}>{statusConfig.text}</span>
                  {currentSub?.status === 'active' && currentSub.ends_at && (
                    <p className="text-[10px] sm:text-xs text-gray-500 mt-2 sm:mt-3 text-center">
                      {t('seller.subscription.validUntil')} <span className="font-medium text-gray-700">{formatDate(currentSub.ends_at)}</span>
                    </p>
                  )}
                  {currentSub?.status === 'pending' && (
                    <p className="text-[10px] sm:text-xs text-gray-500 mt-2 sm:mt-3 text-center">{t('seller.subscription.awaitingVerification')}</p>
                  )}
                </div>
              </div>

              {/* Payment Section - Responsive */}
              <div className="md:col-span-2 bg-white rounded-xl border-2 border-gray-100 p-4 sm:p-5 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-3 sm:mb-4">
                  <h2 className="text-sm sm:text-base font-semibold text-gray-900 flex items-center gap-2">
                    <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#5C352C]" />
                    {t('seller.subscription.activateRenew')}
                  </h2>
                  <div className="bg-[#5C352C]/10 text-[#5C352C] px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold self-start sm:self-auto">
                    {formatCurrency(data.price)} {t('seller.subscription.perMonth')}
                  </div>
                </div>

                {/* Payment Info Box - Responsive */}
                <div className="bg-gradient-to-r from-[#5C352C] to-[#7A4B3E] rounded-lg p-3 sm:p-4 text-white mb-4 sm:mb-5">
                  <p className="text-white/80 text-[8px] sm:text-[10px] mb-0.5 sm:mb-1 uppercase tracking-wider">{t('seller.subscription.sendPaymentTo')}</p>
                  <p className="text-base sm:text-lg font-mono font-bold mb-1 sm:mb-2 break-all">{data.payment_number}</p>
                  <p className="text-[8px] sm:text-[10px] text-white/70">{t('seller.subscription.uploadConfirmation')}</p>
                </div>

                {currentSub?.status === 'pending' ? (
                  <div className="bg-amber-50 rounded-lg p-3 sm:p-4 text-center">
                    <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-amber-500 mx-auto mb-1 sm:mb-2" />
                    <h3 className="text-xs sm:text-sm font-semibold text-amber-700">{t('seller.subscription.requestPending')}</h3>
                    <p className="text-[10px] sm:text-xs text-amber-600 mt-1">{t('seller.subscription.paymentBeingVerified')}</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                    <div>
                      <label className="block text-[10px] sm:text-xs font-medium text-gray-700 mb-1 sm:mb-2">{t('seller.subscription.paymentProof')}</label>
                      <input type="file" accept="image/jpeg,image/png,image/jpg" onChange={handleFileChange} className="hidden" id="proof-upload" />
                      <label htmlFor="proof-upload" className={`flex flex-col items-center justify-center w-full h-24 sm:h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${previewUrl ? 'border-[#5C352C] bg-[#5C352C]/5' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'}`}>
                        {previewUrl ? (
                          <img src={previewUrl} alt="Preview" className="h-full object-contain rounded-lg" />
                        ) : (
                          <div className="flex flex-col items-center">
                            <Upload className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 mb-1 sm:mb-2" />
                            <p className="text-[10px] sm:text-xs text-gray-500 text-center px-2">{t('seller.subscription.clickToUpload')}</p>
                            <p className="text-[8px] sm:text-[10px] text-gray-400 mt-0.5 sm:mt-1">{t('seller.subscription.uploadHint')}</p>
                          </div>
                        )}
                      </label>
                    </div>

                    <button type="submit" disabled={submitting || !paymentProof}
                      className="w-full py-2 sm:py-2.5 bg-gradient-to-r from-[#5C352C] to-[#8B5E4F] text-white rounded-lg font-medium text-xs sm:text-sm hover:shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                      {submitting ? <><Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" /> <span className="hidden xs:inline">{t('seller.subscription.submitting')}</span></> : <><Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> <span className="hidden xs:inline">{t('seller.subscription.submitRequest')}</span></>}
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* History Section - Responsive with overflow */}
            <div className="bg-white rounded-xl border-2 border-gray-100 overflow-hidden shadow-sm">
              <div className="p-3 sm:p-4 border-b-2 border-gray-100 bg-gray-50">
                <h3 className="text-xs sm:text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
                  {t('seller.subscription.subscriptionHistory')}
                </h3>
              </div>
              <div className="overflow-x-auto">
                {data.history && data.history.length > 0 ? (
                  <table className="w-full min-w-[500px]">
                    <thead className="bg-gray-50 border-b-2 border-gray-100">
                      <tr>
                        <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-[9px] sm:text-xs font-medium text-gray-500">{t('seller.subscription.date')}</th>
                        <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-[9px] sm:text-xs font-medium text-gray-500">{t('seller.subscription.amount')}</th>
                        <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-[9px] sm:text-xs font-medium text-gray-500 hidden sm:table-cell">{t('seller.subscription.period')}</th>
                        <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-[9px] sm:text-xs font-medium text-gray-500">{t('seller.subscription.status')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {data.history.map((record) => {
                        const statConf = getStatusConfig(record.status);
                        return (
                          <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-3 sm:px-4 py-2 sm:py-3 text-[9px] sm:text-xs text-gray-600">{formatDate(record.created_at)}</td>
                            <td className="px-3 sm:px-4 py-2 sm:py-3 text-[9px] sm:text-xs font-medium text-gray-900">{formatCurrency(record.amount)}</td>
                            <td className="px-3 sm:px-4 py-2 sm:py-3 text-[9px] sm:text-xs text-gray-500 hidden sm:table-cell">
                              {record.starts_at && record.ends_at ? `${formatDate(record.starts_at)} - ${formatDate(record.ends_at)}` : '-'}
                            </td>
                            <td className="px-3 sm:px-4 py-2 sm:py-3">
                              <span className={`inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 rounded-full text-[7px] sm:text-[10px] font-medium ${statConf.bg} ${statConf.color}`}>
                                {statConf.icon}
                                <span className="hidden xs:inline">{statConf.text}</span>
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-6 sm:p-8 text-center">
                    <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-xs sm:text-sm text-gray-500">{t('seller.subscription.noHistory')}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default SellerSubscription;
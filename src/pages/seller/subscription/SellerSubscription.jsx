import React, { useState, useEffect } from 'react';
import { useToast } from '../../../contexts/ToastContext';
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
  <div className="bg-white rounded-xl border border-gray-100 p-6 overflow-hidden">
    <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-32 mb-4"></div>
    <div className="flex flex-col items-center p-6">
      <div className="w-16 h-16 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-full mb-4"></div>
      <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-24 mb-2"></div>
      <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-32"></div>
    </div>
  </div>
);

const SkeletonPaymentCard = () => (
  <div className="bg-white rounded-xl border border-gray-100 p-6 overflow-hidden">
    <div className="flex justify-between items-center mb-4">
      <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-32"></div>
      <div className="h-7 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-28"></div>
    </div>
    <div className="bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-xl h-32 mb-4"></div>
    <div className="h-10 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-xl"></div>
  </div>
);

const SkeletonHistoryRow = () => (
  <div className="flex items-center gap-4 p-4 border-b border-gray-100 overflow-hidden">
    <div className="flex-1"><div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-24"></div></div>
    <div className="flex-1"><div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-20"></div></div>
    <div className="flex-1"><div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-32"></div></div>
    <div className="flex-1"><div className="h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-full w-20"></div></div>
  </div>
);

const SellerSubscription = () => {
  const { showToast } = useToast();
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
      showToast('Failed to load subscription details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast('Image size must be less than 2MB', 'error');
        return;
      }
      setPaymentProof(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!paymentProof) {
      showToast('Please upload payment proof', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('payment_proof', paymentProof);
      await api.post('/seller/subscription', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      showToast('Subscription request submitted!', 'success');
      setPaymentProof(null);
      setPreviewUrl('');
      fetchSubscriptionData();
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to submit request', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'active':
        return { color: 'text-emerald-600', bg: 'bg-emerald-50', text: 'Active', icon: <CheckCircle className="w-4 h-4" /> };
      case 'pending':
        return { color: 'text-amber-600', bg: 'bg-amber-50', text: 'Pending', icon: <Clock className="w-4 h-4" /> };
      case 'rejected':
        return { color: 'text-rose-600', bg: 'bg-rose-50', text: 'Rejected', icon: <XCircle className="w-4 h-4" /> };
      default:
        return { color: 'text-gray-500', bg: 'bg-gray-100', text: 'Inactive', icon: <AlertCircle className="w-4 h-4" /> };
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
        <div className="p-6 bg-gray-50 min-h-screen">
          <div className="max-w-5xl mx-auto">
            <div className="mb-6">
              <div className="h-8 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-48 mb-2"></div>
              <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-64"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="md:col-span-1"><SkeletonStatusCard /></div>
              <div className="md:col-span-2"><SkeletonPaymentCard /></div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <div className="h-5 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-32"></div>
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
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-5xl mx-auto space-y-6">
          
          {/* Header */}
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Subscription Plan</h1>
            <p className="text-sm text-gray-500 mt-1">Manage your seller account subscription</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Status Card */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Current Status</h2>
              <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 ${statusConfig.bg} ${statusConfig.color}`}>
                  {statusConfig.icon}
                </div>
                <span className={`text-base font-semibold ${statusConfig.color}`}>{statusConfig.text}</span>
                {currentSub?.status === 'active' && currentSub.ends_at && (
                  <p className="text-xs text-gray-500 mt-3 text-center">
                    Valid until: <span className="font-medium text-gray-700">{formatDate(currentSub.ends_at)}</span>
                  </p>
                )}
                {currentSub?.status === 'pending' && (
                  <p className="text-xs text-gray-500 mt-3 text-center">Awaiting admin verification</p>
                )}
              </div>
            </div>

            {/* Payment Section */}
            <div className="md:col-span-2 bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#5C352C]" />
                  Activate / Renew
                </h2>
                <div className="bg-[#5C352C]/10 text-[#5C352C] px-3 py-1 rounded-full text-xs font-bold">
                  {formatCurrency(data.price)} / month
                </div>
              </div>

              {/* Payment Info Box */}
              <div className="bg-gradient-to-r from-[#5C352C] to-[#7A4B3E] rounded-lg p-4 text-white mb-5">
                <p className="text-white/80 text-[10px] mb-1 uppercase tracking-wider">Send payment to:</p>
                <p className="text-lg font-mono font-bold mb-2">{data.payment_number}</p>
                <p className="text-[10px] text-white/70">Upload a screenshot of the payment confirmation</p>
              </div>

              {currentSub?.status === 'pending' ? (
                <div className="bg-amber-50 rounded-lg p-4 text-center">
                  <Clock className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                  <h3 className="text-sm font-semibold text-amber-700">Request Pending</h3>
                  <p className="text-xs text-amber-600 mt-1">Your payment is being verified</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">Payment Proof</label>
                    <input type="file" accept="image/jpeg,image/png,image/jpg" onChange={handleFileChange} className="hidden" id="proof-upload" />
                    <label htmlFor="proof-upload" className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${previewUrl ? 'border-[#5C352C] bg-[#5C352C]/5' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'}`}>
                      {previewUrl ? (
                        <img src={previewUrl} alt="Preview" className="h-full object-contain rounded-lg" />
                      ) : (
                        <div className="flex flex-col items-center">
                          <Upload className="w-6 h-6 text-gray-400 mb-2" />
                          <p className="text-xs text-gray-500">Click to upload screenshot</p>
                          <p className="text-[10px] text-gray-400 mt-1">PNG, JPG up to 2MB</p>
                        </div>
                      )}
                    </label>
                  </div>

                  <button type="submit" disabled={submitting || !paymentProof}
                    className="w-full py-2.5 bg-[#5C352C] text-white rounded-lg font-medium text-sm hover:bg-[#4A2A22] transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                    {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : <><Send className="w-4 h-4" /> Submit Request</>}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* History Section */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                Subscription History
              </h3>
            </div>
            <div className="overflow-x-auto">
              {data.history && data.history.length > 0 ? (
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Amount</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Period</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.history.map((record) => {
                      const statConf = getStatusConfig(record.status);
                      return (
                        <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-xs text-gray-600">{formatDate(record.created_at)}</td>
                          <td className="px-4 py-3 text-xs font-medium text-gray-900">{formatCurrency(record.amount)}</td>
                          <td className="px-4 py-3 text-xs text-gray-500">{record.starts_at && record.ends_at ? `${formatDate(record.starts_at)} - ${formatDate(record.ends_at)}` : '-'}</td>
                          <td className="px-4 py-3"><span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${statConf.bg} ${statConf.color}`}>{statConf.icon}{statConf.text}</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="p-8 text-center">
                  <FileText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No subscription history</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default SellerSubscription;
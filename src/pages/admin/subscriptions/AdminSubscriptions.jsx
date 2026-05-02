import React, { useState, useEffect } from 'react';
import MainLayout from '../../../layouts/MainLayout';
import api from '../../../api/axios';
import { useToast } from '../../../contexts/ToastContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import { confirmAlert } from '../../../utils/sweetAlertHelper';
import { 
  ShieldCheck, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Search,
  Settings,
  Image as ImageIcon,
  Loader2,
  DollarSign,
  Phone,
  ChevronLeft,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';

// ==================== SKELETON LOADERS ====================
const TableRowSkeleton = () => (
  <div className="animate-pulse">
    <div className="flex items-center gap-4 p-4 border-b border-gray-100">
      <div className="flex-1">
        <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-48"></div>
      </div>
      <div className="w-24 h-5 bg-gray-200 rounded"></div>
      <div className="w-32 h-5 bg-gray-200 rounded"></div>
      <div className="w-20 h-5 bg-gray-200 rounded"></div>
      <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
      <div className="flex gap-2">
        <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
        <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
      </div>
    </div>
  </div>
);

const SettingsFormSkeleton = () => (
  <div className="animate-pulse p-8">
    <div className="h-6 bg-gray-200 rounded w-48 mb-6"></div>
    <div className="space-y-6">
      <div>
        <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
        <div className="h-12 bg-gray-200 rounded w-full"></div>
      </div>
      <div>
        <div className="h-4 bg-gray-200 rounded w-40 mb-2"></div>
        <div className="h-12 bg-gray-200 rounded w-full"></div>
      </div>
      <div className="h-12 bg-gray-200 rounded w-32"></div>
    </div>
  </div>
);

const AdminSubscriptions = () => {
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('requests'); // requests, all, seller-status, settings
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [subscriptions, setSubscriptions] = useState([]);
  const [sellerStatuses, setSellerStatuses] = useState([]);
  const [settings, setSettings] = useState({ price: '', payment_number: '' });
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [selectedProof, setSelectedProof] = useState(null);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    if (activeTab === 'settings') {
      await fetchSettings();
    } else if (activeTab === 'seller-status') {
      await fetchSellerStatuses();
    } else {
      await fetchSubscriptions(activeTab === 'requests' ? 'pending' : '');
    }
    setLoading(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
    showToast('Data refreshed', 'info');
  };

  const fetchSubscriptions = async (statusFilter = '') => {
    try {
      const endpoint = statusFilter ? `/admin/subscriptions?status=${statusFilter}` : '/admin/subscriptions';
      const response = await api.get(endpoint);
      const payload = response.data?.data;
      setSubscriptions(Array.isArray(payload) ? payload : (payload?.data || []));
    } catch (error) {
      showToast('Failed to load subscriptions.', 'error');
      setSubscriptions([]);
    }
  };

  const fetchSellerStatuses = async () => {
    try {
      const response = await api.get('/admin/subscriptions/seller-status');
      setSellerStatuses(response.data?.data || []);
    } catch (error) {
      showToast('Failed to load seller statuses.', 'error');
      setSellerStatuses([]);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await api.get('/admin/subscription-settings');
      setSettings(response.data?.data || response.data);
    } catch (error) {
      showToast('Failed to load settings.', 'error');
    }
  };

  const handleUpdateSettings = async (e) => {
    e.preventDefault();
    setSettingsLoading(true);
    try {
      await api.put('/admin/subscription-settings', {
        price: settings.price,
        payment_number: settings.payment_number
      });
      showToast('Settings updated successfully', 'success');
    } catch (error) {
      showToast('Failed to update settings', 'error');
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    const confirmed = await confirmAlert({
      title: action === 'approve' 
        ? t('alerts.approveConfirm', { name: 'this' }) || 'Approve this subscription request?'
        : t('alerts.rejectConfirm', { name: 'this' }) || 'Reject this subscription request?',
      text: '',
      icon: action === 'approve' ? 'question' : 'warning',
      confirmButtonText: action === 'approve' 
        ? t('common.alerts.approveConfirm')
        : t('common.alerts.rejectConfirm'),
      cancelButtonText: t('common.cancel'),
      dangerMode: action === 'reject',
    });
    if (!confirmed) return;
    
    setActionLoading(id);
    try {
      await api.post(`/admin/subscriptions/${id}/${action}`);
      showToast(`Subscription ${action}d successfully`, 'success');
      await fetchSubscriptions(activeTab === 'requests' ? 'pending' : '');
    } catch (error) {
      showToast(`Failed to ${action} subscription`, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-GB', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700"><CheckCircle className="w-3 h-3" /> Active</span>;
      case 'pending':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700"><Clock className="w-3 h-3" /> Pending</span>;
      case 'rejected':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700"><XCircle className="w-3 h-3" /> Rejected</span>;
      case 'expired':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-50 text-gray-600">Expired</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-50 text-gray-600">{status}</span>;
    }
  };

  // Stats for summary cards
  const pendingCount = subscriptions.filter(s => s.status === 'pending').length;
  const activeCount = subscriptions.filter(s => s.status === 'active').length;
  const rejectedCount = subscriptions.filter(s => s.status === 'rejected').length;

  const statCards = [
    {
      title: "Pending Requests",
      value: pendingCount,
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50"
    },
    {
      title: "Active Subscriptions",
      value: activeCount,
      icon: CheckCircle,
      color: "text-emerald-600",
      bg: "bg-emerald-50"
    },
    {
      title: "Rejected",
      value: rejectedCount,
      icon: XCircle,
      color: "text-rose-600",
      bg: "bg-rose-50"
    }
  ];

  if (loading && subscriptions.length === 0 && activeTab !== 'settings') {
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white p-4 rounded-xl border border-gray-100 animate-pulse">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                      <div className="h-8 bg-gray-200 rounded w-32"></div>
                    </div>
                    <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <div className="h-10 bg-gray-200 rounded-lg animate-pulse"></div>
              </div>
              {[1, 2, 3, 4].map(i => <TableRowSkeleton key={i} />)}
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (loading && activeTab === 'settings') {
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
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <SettingsFormSkeleton />
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
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 bg-[#5C352C]/10 rounded-xl">
                <ShieldCheck className="w-5 h-5 text-[#5C352C]" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Subscription Management</h1>
            </div>
            <p className="text-sm text-gray-500 ml-11">Verify payment proofs and configure pricing</p>
          </div>

          {/* Refresh Button */}
          <div className="flex justify-end mb-4">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors text-sm"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Sync Data
            </button>
          </div>

          {/* Stats Cards (only for non-settings tabs) */}
          {activeTab !== 'settings' && subscriptions.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {statCards.map((card, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">{card.title}</p>
                      <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                    </div>
                    <div className={`${card.bg} ${card.color} p-2 rounded-xl`}>
                      <card.icon className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tabs */}
          <div className="flex bg-white rounded-lg border border-gray-200 w-fit mb-6 overflow-hidden">
            <button
              onClick={() => setActiveTab('requests')}
              className={`px-5 py-2.5 text-sm font-medium transition-all ${
                activeTab === 'requests' 
                  ? 'bg-[#5C352C] text-white' 
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              Pending Requests
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`px-5 py-2.5 text-sm font-medium transition-all ${
                activeTab === 'all' 
                  ? 'bg-[#5C352C] text-white' 
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              All Records
            </button>
            <button
              onClick={() => setActiveTab('seller-status')}
              className={`px-5 py-2.5 text-sm font-medium transition-all ${
                activeTab === 'seller-status' 
                  ? 'bg-[#5C352C] text-white' 
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              Seller Status
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-5 py-2.5 text-sm font-medium transition-all ${
                activeTab === 'settings' 
                  ? 'bg-[#5C352C] text-white' 
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              Settings
            </button>
          </div>

          {/* Results Count */}
          {activeTab !== 'settings' && (
            <div className="mb-4">
              <p className="text-xs text-gray-500">
                Showing <span className="font-medium text-gray-700">{subscriptions.length}</span> subscriptions
              </p>
            </div>
          )}

          {/* Main Content Area */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            
            {activeTab === 'settings' ? (
              
              // SETTINGS TAB
              <div className="p-6">
                <h2 className="text-base font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-[#5C352C]" />
                  Subscription Configuration
                </h2>
                <form onSubmit={handleUpdateSettings} className="max-w-md space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Monthly Subscription Price <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <DollarSign className="w-5 h-5 text-gray-400" />
                      </div>
                      <input
                        type="number"
                        min="0"
                        required
                        value={settings.price}
                        onChange={(e) => setSettings({ ...settings, price: e.target.value })}
                        className="pl-10 w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#5C352C] focus:border-[#5C352C] text-sm"
                        placeholder="Enter price"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Mobile Number <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="w-5 h-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        required
                        value={settings.payment_number}
                        onChange={(e) => setSettings({ ...settings, payment_number: e.target.value })}
                        className="pl-10 w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#5C352C] focus:border-[#5C352C] text-sm"
                        placeholder="Enter payment number"
                      />
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={settingsLoading}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#5C352C] text-white rounded-lg hover:bg-[#956959] transition-colors text-sm font-medium disabled:opacity-50"
                  >
                    {settingsLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                    Save Settings
                  </button>
                </form>
              </div>

            ) : activeTab === 'seller-status' ? (
              
              // SELLER STATUS TAB
              sellerStatuses.length === 0 ? (
                <div className="text-center py-12">
                  <ShieldCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-base font-medium text-gray-900 mb-1">No Sellers Found</h3>
                  <p className="text-sm text-gray-500">There are no registered sellers to display.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Seller / Store</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Current Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Expires At</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Last Payment</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {sellerStatuses.map((seller) => (
                        <tr key={seller.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3">
                            <p className="font-medium text-sm text-gray-900">{seller.store_name || seller.name}</p>
                            <p className="text-xs text-gray-500">{seller.email}</p>
                          </td>
                          <td className="px-4 py-3">
                            {getStatusBadge(seller.status)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500 font-medium">
                            {seller.ends_at ? (
                              <div className="flex flex-col">
                                <span>{formatDate(seller.ends_at)}</span>
                                {new Date(seller.ends_at) < new Date() && seller.status === 'active' && (
                                  <span className="text-[10px] text-rose-500 font-bold">EXPIRED</span>
                                )}
                              </div>
                            ) : '-'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {seller.last_subscription ? formatDate(seller.last_subscription) : 'Never'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )

            ) : (
              
              // LISTINGS TAB (Requests & All)
              subscriptions.length === 0 ? (
                <div className="text-center py-12">
                  <ShieldCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-base font-medium text-gray-900 mb-1">No Subscriptions Found</h3>
                  <p className="text-sm text-gray-500">
                    {activeTab === 'requests' ? 'No pending subscription requests' : 'No subscription records found'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Seller</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Amount</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Date Submitted</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Proof</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {subscriptions.map((sub) => (
                        <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3">
                            <p className="font-medium text-sm text-gray-900">{sub.seller?.store_name || sub.seller?.name}</p>
                            <p className="text-xs text-gray-500">{sub.seller?.email}</p>
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-semibold text-[#5C352C] text-sm">
                              Tsh {Number(sub.amount).toLocaleString()}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {formatDate(sub.created_at)}
                          </td>
                          <td className="px-4 py-3">
                            {getStatusBadge(sub.status)}
                          </td>
                          <td className="px-4 py-3">
                            {sub.payment_proof ? (
                              <button
                                onClick={() => setSelectedProof(`http://localhost:8000/storage/${sub.payment_proof}`)}
                                className="w-10 h-10 rounded-lg overflow-hidden border border-gray-200 hover:border-[#5C352C] transition-colors relative group"
                              >
                                <img 
                                  src={`http://localhost:8000/storage/${sub.payment_proof}`} 
                                  alt="Payment Proof" 
                                  className="w-full h-full object-cover" 
                                />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Search className="w-4 h-4 text-white" />
                                </div>
                              </button>
                            ) : (
                              <span className="text-xs text-gray-400 flex items-center gap-1">
                                <ImageIcon className="w-3 h-3" /> None
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-2">
                              {sub.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => handleAction(sub.id, 'approve')}
                                    disabled={actionLoading === sub.id}
                                    className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-50"
                                    title="Approve"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleAction(sub.id, 'reject')}
                                    disabled={actionLoading === sub.id}
                                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50"
                                    title="Reject"
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {selectedProof && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setSelectedProof(null)}
        >
          <img 
            src={selectedProof} 
            alt="Payment Proof" 
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
          />
        </div>
      )}
    </MainLayout>
  );
};

export default AdminSubscriptions;
import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  MessageSquare,
  User,
  ShoppingBag,
  Package,
  Calendar,
  Loader2,
  RefreshCw,
  Send,
  Image as ImageIcon,
  Shield,
  Flag,
  Scale,
  Bell,
  CheckCheck,
  Ban,
  FileText,
  Users,
  Briefcase,
  Star,
  TrendingUp,
  Activity,
  Zap,
  Layers,
  ChevronDown,
  MoreVertical,
  ThumbsUp,
  ThumbsDown,
  Award,
  BadgeCheck
} from 'lucide-react';
import api from '../../api/axios';
import MainLayout from '../../layouts/MainLayout';
import { useToast } from '../../contexts/ToastContext';

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
const SkeletonStatCard = () => (
  <div className="bg-white rounded-xl border border-gray-100 p-5 overflow-hidden">
    <div className="flex items-start justify-between">
      <div className="space-y-2">
        <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-20"></div>
        <div className="h-7 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-32"></div>
        <div className="h-2 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-24"></div>
      </div>
      <div className="w-10 h-10 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-xl"></div>
    </div>
  </div>
);

const SkeletonReportRow = () => (
  <div className="flex items-center gap-4 p-4 border-b border-gray-100 overflow-hidden">
    <div className="flex-1 space-y-1">
      <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-32"></div>
      <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-24"></div>
    </div>
    <div className="flex-1"><div className="h-8 w-8 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-full"></div></div>
    <div className="flex-1"><div className="h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-lg w-20"></div></div>
    <div className="flex-1"><div className="h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-full w-16"></div></div>
    <div><div className="w-8 h-8 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-lg"></div></div>
  </div>
);

const SkeletonDetailSidebar = () => (
  <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
    <div className="h-24 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer"></div>
    <div className="p-5 space-y-4">
      <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-32"></div>
      <div className="h-20 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-xl"></div>
      <div className="h-24 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-xl"></div>
    </div>
  </div>
);

// ==================== MAIN COMPONENT ====================
const AdminReports = () => {
  const { showToast } = useToast();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [adminResponse, setAdminResponse] = useState('');
  const [resolveStatus, setResolveStatus] = useState('investigation');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    type: '',
  });
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0
  });
  const [refreshing, setRefreshing] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Add shimmer style
  useEffect(() => {
    if (!document.querySelector('#shimmer-styles-admin-reports')) {
      const style = document.createElement('style');
      style.id = 'shimmer-styles-admin-reports';
      style.textContent = shimmerStyle;
      document.head.appendChild(style);
    }
  }, []);

  const fetchReports = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      setRefreshing(true);
      const params = {};
      if (filters.status && filters.status !== '') {
        params.status = filters.status;
      }
      if (filters.type && filters.type !== '') {
        params.type = filters.type;
      }
      params.page = page;
      
      let response;
      try {
        response = await api.get('/admin/reports', { params });
      } catch (err) {
        try {
          response = await api.get('/admin/issue-reports', { params });
        } catch (err2) {
          throw err2;
        }
      }
      
      let reportsData = [];
      if (response.data && response.data.data) {
        reportsData = response.data.data;
        setPagination({
          current_page: response.data.current_page || page,
          last_page: response.data.last_page || 1,
          per_page: response.data.per_page || 15,
          total: response.data.total || 0
        });
      } else if (Array.isArray(response.data)) {
        reportsData = response.data;
      } else if (response.data && typeof response.data === 'object') {
        reportsData = Object.values(response.data).filter(item => item && typeof item === 'object');
      } else {
        reportsData = [];
      }
      
      setReports(reportsData);
      
      if (reportsData.length === 0 && !error) {
        setError('No reports found');
      }
    } catch (err) {
      console.error('Failed to fetch reports:', err);
      const errorMsg = err.response?.data?.message || 'Failed to fetch reports';
      setError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReports(1);
  }, [filters.status, filters.type]);

  const handleResolve = async (e) => {
    e.preventDefault();
    if (!adminResponse.trim()) {
      showToast('Please enter an admin response', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      let response;
      try {
        response = await api.patch(`/admin/reports/${selectedReport.id}/resolve`, {
          status: resolveStatus,
          admin_response: adminResponse
        });
      } catch (err) {
        if (err.response?.status === 404) {
          response = await api.patch(`/admin/issue-reports/${selectedReport.id}/resolve`, {
            status: resolveStatus,
            admin_response: adminResponse
          });
        } else {
          throw err;
        }
      }
      
      showToast(`Case ${resolveStatus} successfully`, 'success');
      setSelectedReport(null);
      setAdminResponse('');
      setResolveStatus('investigation');
      fetchReports(1);
    } catch (err) {
      console.error('Failed to resolve report', err);
      showToast(err.response?.data?.message || 'Failed to resolve report', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'investigation': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'resolved': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'dismissed': return 'bg-gray-100 text-gray-600 border-gray-200';
      default: return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-3 h-3" />;
      case 'investigation': return <Search className="w-3 h-3" />;
      case 'resolved': return <CheckCheck className="w-3 h-3" />;
      case 'dismissed': return <Ban className="w-3 h-3" />;
      default: return <AlertTriangle className="w-3 h-3" />;
    }
  };

  const getStatusGradient = (status) => {
    switch (status) {
      case 'pending': return 'from-amber-400 to-orange-400';
      case 'investigation': return 'from-blue-400 to-indigo-400';
      case 'resolved': return 'from-emerald-400 to-green-400';
      case 'dismissed': return 'from-gray-400 to-gray-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'order': return <ShoppingBag className="w-3.5 h-3.5" />;
      case 'product': return <Package className="w-3.5 h-3.5" />;
      case 'user': return <User className="w-3.5 h-3.5" />;
      default: return <Flag className="w-3.5 h-3.5" />;
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'order': return 'Order Issue';
      case 'user': return 'User Report';
      case 'product': return 'Product Issue';
      default: return 'Other';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'order': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'user': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'product': return 'bg-amber-50 text-amber-700 border-amber-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const clearFilters = () => {
    setFilters({ status: '', type: '' });
    setIsFilterOpen(false);
  };

  const stats = {
    total: reports.length,
    pending: reports.filter(r => r.status === 'pending').length,
    investigation: reports.filter(r => r.status === 'investigation').length,
    resolved: reports.filter(r => r.status === 'resolved').length,
    dismissed: reports.filter(r => r.status === 'dismissed').length,
  };

  if (loading && reports.length === 0) {
    return (
      <MainLayout>
        <div className="p-6 bg-gray-50 min-h-screen">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <div className="h-7 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-48"></div>
                <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-64 mt-1"></div>
              </div>
              <div className="h-9 w-24 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-lg"></div>
            </div>
            <div className="h-28 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-xl mb-6"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[1, 2, 3, 4].map(i => <SkeletonStatCard key={i} />)}
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2">
                <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                  <div className="p-4 border-b border-gray-100">
                    <div className="h-5 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-32"></div>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {[1, 2, 3, 4, 5].map(i => <SkeletonReportRow key={i} />)}
                  </div>
                </div>
              </div>
              <div><SkeletonDetailSidebar /></div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error && reports.length === 0) {
    return (
      <MainLayout>
        <div className="p-6 bg-gray-50 min-h-screen">
          <div className="max-w-md mx-auto bg-white rounded-xl border border-gray-100 p-8 text-center">
            <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-gray-900 mb-1">Error Loading Cases</h3>
            <p className="text-sm text-gray-500 mb-4">{error}</p>
            <button onClick={() => fetchReports(1)} className="px-4 py-2 bg-[#5C352C] text-white rounded-lg text-sm">Try Again</button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Case Management</h1>
              <p className="text-sm text-gray-500 mt-1">Review and resolve disputes & reports</p>
            </div>
            <button 
              onClick={() => fetchReports(1)} 
              disabled={refreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-[#5C352C] to-[#7A4B3E] rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white mb-1">Case Resolution Center</h2>
                <p className="text-white/70 text-sm">Manage and resolve user-reported issues</p>
              </div>
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                <Scale className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Total Cases</p>
                  <h3 className="text-xl font-bold text-gray-900">{stats.total}</h3>
                  <p className="text-[10px] text-gray-400 mt-2">All time reports</p>
                </div>
                <div className="bg-gray-100 p-2 rounded-lg">
                  <Layers className="w-5 h-5 text-gray-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Pending</p>
                  <h3 className="text-xl font-bold text-amber-600">{stats.pending}</h3>
                  <p className="text-[10px] text-gray-400 mt-2">Awaiting review</p>
                </div>
                <div className="bg-amber-50 p-2 rounded-lg">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Investigation</p>
                  <h3 className="text-xl font-bold text-blue-600">{stats.investigation}</h3>
                  <p className="text-[10px] text-gray-400 mt-2">Under review</p>
                </div>
                <div className="bg-blue-50 p-2 rounded-lg">
                  <Search className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Resolved</p>
                  <h3 className="text-xl font-bold text-emerald-600">{stats.resolved}</h3>
                  <p className="text-[10px] text-gray-400 mt-2">Closed cases</p>
                </div>
                <div className="bg-emerald-50 p-2 rounded-lg">
                  <CheckCheck className="w-5 h-5 text-emerald-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Reports List Block */}
            <div className="xl:col-span-2 space-y-6">
              {/* Filters */}
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-[#5C352C]" />
                    <span className="text-sm font-medium text-gray-700">Filter Cases</span>
                    {(filters.status || filters.type) && (
                      <span className="px-2 py-0.5 bg-[#5C352C] text-white text-[10px] rounded-full">
                        Active
                      </span>
                    )}
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isFilterOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isFilterOpen && (
                  <div className="p-4 border-t border-gray-100 bg-gray-50/50 animate-in slide-down duration-300">
                    <div className="flex flex-wrap gap-4">
                      <div className="flex-1 min-w-[180px]">
                        <label className="block text-xs font-medium text-gray-500 mb-1.5">Status</label>
                        <select 
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#5C352C] focus:border-transparent outline-none text-sm bg-white"
                          value={filters.status}
                          onChange={(e) => setFilters({...filters, status: e.target.value})}
                        >
                          <option value="">All Statuses</option>
                          <option value="pending">Pending</option>
                          <option value="investigation">Investigation</option>
                          <option value="resolved">Resolved</option>
                          <option value="dismissed">Dismissed</option>
                        </select>
                      </div>
                      <div className="flex-1 min-w-[180px]">
                        <label className="block text-xs font-medium text-gray-500 mb-1.5">Type</label>
                        <select 
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#5C352C] focus:border-transparent outline-none text-sm bg-white"
                          value={filters.type}
                          onChange={(e) => setFilters({...filters, type: e.target.value})}
                        >
                          <option value="">All Types</option>
                          <option value="order">Order Issues</option>
                          <option value="user">User Behavior</option>
                          <option value="product">Product Quality</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                    
                    {(filters.status || filters.type) && (
                      <div className="flex justify-end mt-3 pt-3 border-t border-gray-200">
                        <button 
                          onClick={clearFilters}
                          className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
                        >
                          <XCircle className="w-3 h-3" />
                          Clear filters
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Results Count */}
              {!loading && reports.length > 0 && (
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Showing <span className="font-semibold text-gray-700">{reports.length}</span> cases
                    {pagination.total > 0 && ` of ${pagination.total} total`}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Activity className="w-3 h-3" />
                    <span>Updated: {new Date().toLocaleTimeString()}</span>
                  </div>
                </div>
              )}

              {/* Cases Table */}
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                {reports.length === 0 && !error ? (
                  <div className="py-20 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <CheckCheck className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium">
                      {filters.status || filters.type ? 'No cases match your filters' : 'All clear! No active cases.'}
                    </p>
                    {(filters.status || filters.type) && (
                      <button onClick={clearFilters} className="mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors">
                        Clear Filters
                      </button>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                          <tr>
                            <th className="px-4 py-3 text-left text-[10px] font-medium text-gray-500 uppercase">Case</th>
                            <th className="px-4 py-3 text-left text-[10px] font-medium text-gray-500 uppercase">Reporter</th>
                            <th className="px-4 py-3 text-left text-[10px] font-medium text-gray-500 uppercase">Type</th>
                            <th className="px-4 py-3 text-left text-[10px] font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-4 py-3 text-center text-[10px] font-medium text-gray-500 uppercase">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {reports.map((report) => (
                            <tr 
                              key={report.id} 
                              className={`hover:bg-gray-50 transition-colors cursor-pointer ${selectedReport?.id === report.id ? 'bg-[#5C352C]/5' : ''}`}
                              onClick={() => {
                                setSelectedReport(report);
                                setAdminResponse('');
                                setResolveStatus(report.status === 'resolved' || report.status === 'dismissed' ? 'resolved' : 'investigation');
                              }}
                            >
                              <td className="px-4 py-3">
                                <p className="text-sm font-medium text-gray-900 line-clamp-1">{report.subject}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-[10px] text-gray-400 font-mono">#{report.id}</span>
                                  <span className="text-[10px] text-gray-300">•</span>
                                  <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                    <Calendar className="w-2.5 h-2.5" />
                                    {new Date(report.created_at).toLocaleDateString()}
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center">
                                    <User className="w-3.5 h-3.5 text-gray-500" />
                                  </div>
                                  <div>
                                    <p className="text-xs font-medium text-gray-800">{report.reporter?.name || 'Unknown'}</p>
                                    <p className="text-[9px] text-gray-400 capitalize">{report.reporter?.role || 'user'}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <span className={`inline-flex items-center gap-1 text-[10px] font-medium py-1 px-2 rounded-lg border ${getTypeColor(report.type)}`}>
                                  {getTypeIcon(report.type)}
                                  {getTypeLabel(report.type)}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-medium uppercase tracking-wide border ${getStatusColor(report.status)}`}>
                                  {getStatusIcon(report.status)}
                                  {report.status}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <button 
                                  className="p-1.5 bg-gray-100 hover:bg-[#5C352C] rounded-lg transition-all duration-200 hover:shadow-md"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedReport(report);
                                    setAdminResponse('');
                                    setResolveStatus(report.status === 'resolved' || report.status === 'dismissed' ? 'resolved' : 'investigation');
                                  }}
                                >
                                  <Eye className="w-3.5 h-3.5 text-gray-500 hover:text-white transition-colors" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    {/* Pagination */}
                    {pagination.last_page > 1 && (
                      <div className="flex justify-center gap-2 py-4 border-t border-gray-100 bg-gray-50/30">
                        <button
                          onClick={() => fetchReports(pagination.current_page - 1)}
                          disabled={pagination.current_page === 1}
                          className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white hover:border-[#5C352C] transition-all text-xs font-medium"
                        >
                          Previous
                        </button>
                        <span className="px-3 py-1.5 rounded-lg bg-[#5C352C] text-white text-xs font-medium">
                          {pagination.current_page} / {pagination.last_page}
                        </span>
                        <button
                          onClick={() => fetchReports(pagination.current_page + 1)}
                          disabled={pagination.current_page === pagination.last_page}
                          className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white hover:border-[#5C352C] transition-all text-xs font-medium"
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Selected Report Detail Sidebar */}
            <div className="space-y-6">
              <div className={`bg-white rounded-xl border border-gray-100 overflow-hidden transition-all duration-300 ${!selectedReport ? 'opacity-60' : 'shadow-lg'}`}>
                {!selectedReport ? (
                  <div className="py-16 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <MessageSquare className="w-8 h-8 text-gray-300" />
                    </div>
                    <p className="text-gray-400 text-sm font-medium">Select a case to review</p>
                    <p className="text-gray-300 text-xs mt-1">Click on any case to view details</p>
                  </div>
                ) : (
                  <div className="animate-in slide-in-from-right-4 duration-300">
                    {/* Case Header */}
                    <div className="bg-gradient-to-r from-[#5C352C] to-[#7A4B3E] p-5 text-white">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Scale className="w-5 h-5" />
                          <h2 className="text-base font-semibold">Case Details</h2>
                        </div>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-medium uppercase border border-white/20 ${getStatusColor(selectedReport.status)}`}>
                          {getStatusIcon(selectedReport.status)}
                          {selectedReport.status}
                        </span>
                      </div>
                      <p className="text-white/70 text-xs">Case #{selectedReport.id}</p>
                    </div>

                    <div className="p-5 space-y-5 max-h-[500px] overflow-y-auto custom-scrollbar">
                      {/* Subject */}
                      <div>
                        <div className="flex items-center gap-1.5 mb-2">
                          <Flag className="w-3.5 h-3.5 text-[#5C352C]" />
                          <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">Subject</p>
                        </div>
                        <p className="text-gray-900 font-medium text-sm">{selectedReport.subject}</p>
                      </div>

                      {/* Category */}
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-2">Category</p>
                        <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg border ${getTypeColor(selectedReport.type)}`}>
                          {getTypeIcon(selectedReport.type)}
                          {getTypeLabel(selectedReport.type)}
                        </span>
                      </div>

                      {/* Description */}
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-2">Description</p>
                        <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-600 leading-relaxed border border-gray-100">
                          "{selectedReport.description}"
                        </div>
                      </div>

                      {/* Evidence Image */}
                      {selectedReport.evidence_image_url && (
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-2 flex items-center gap-1">
                            <ImageIcon className="w-3 h-3" /> Evidence
                          </p>
                          <div className="rounded-lg overflow-hidden border border-gray-200 group relative bg-gray-100 cursor-pointer">
                            <img 
                              src={selectedReport.evidence_image_url} 
                              alt="Evidence" 
                              className="w-full h-32 object-cover hover:scale-105 transition-transform duration-300"
                              onClick={() => window.open(selectedReport.evidence_image_url, '_blank')}
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Eye className="text-white w-4 h-4" />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Related Order */}
                      {selectedReport.order && (
                        <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                          <div className="flex items-center gap-1.5 mb-2">
                            <ShoppingBag className="w-3.5 h-3.5 text-amber-600" />
                            <p className="text-[10px] uppercase tracking-wider text-amber-700 font-semibold">Related Order</p>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs font-semibold text-gray-900 font-mono">#{selectedReport.order.order_number || selectedReport.order.id}</p>
                              <p className="text-[10px] text-gray-500">{new Date(selectedReport.order.created_at).toLocaleDateString()}</p>
                            </div>
                            <button 
                              className="px-2 py-1 bg-white text-amber-700 rounded-lg text-[10px] font-medium hover:bg-amber-100 transition-colors"
                              onClick={() => window.open(`/admin/orders/${selectedReport.order.id}`, '_blank')}
                            >
                              View →
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Reported User */}
                      {selectedReport.reported_user && (
                        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                          <div className="flex items-center gap-1.5 mb-2">
                            <User className="w-3.5 h-3.5 text-blue-600" />
                            <p className="text-[10px] uppercase tracking-wider text-blue-700 font-semibold">Reported User</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-gray-900">{selectedReport.reported_user.name || 'Unknown'}</p>
                              <p className="text-[10px] text-gray-500">{selectedReport.reported_user.email}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Reporter Info */}
                      {selectedReport.reporter && (
                        <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-200">
                          <div className="flex items-center gap-1.5 mb-2">
                            <Shield className="w-3.5 h-3.5 text-emerald-600" />
                            <p className="text-[10px] uppercase tracking-wider text-emerald-700 font-semibold">Reported By</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-emerald-600" />
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-gray-900">{selectedReport.reporter.name}</p>
                              <p className="text-[10px] text-gray-500">{selectedReport.reporter.email}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Existing Admin Response */}
                      {selectedReport.admin_response && (
                        <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                          <div className="flex items-center gap-1.5 mb-2">
                            <MessageSquare className="w-3.5 h-3.5 text-purple-600" />
                            <p className="text-[10px] uppercase tracking-wider text-purple-700 font-semibold">Admin Response</p>
                          </div>
                          <p className="text-xs text-gray-700 italic leading-relaxed">"{selectedReport.admin_response}"</p>
                          {selectedReport.resolved_at && (
                            <p className="text-[9px] text-gray-400 mt-2 flex items-center gap-1">
                              <Calendar className="w-2.5 h-2.5" />
                              Resolved: {new Date(selectedReport.resolved_at).toLocaleString()}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Action Form */}
                    {selectedReport.status !== 'resolved' && selectedReport.status !== 'dismissed' && (
                      <div className="p-5 border-t border-gray-100 bg-gray-50/50">
                        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <Send className="w-4 h-4 text-[#5C352C]" /> 
                          Take Action
                        </h3>
                        
                        <form onSubmit={handleResolve} className="space-y-3">
                          <div className="flex gap-2 p-1 bg-white rounded-lg border border-gray-200">
                            {[
                              { value: 'investigation', label: 'Investigate', icon: <Search className="w-3 h-3" /> },
                              { value: 'resolved', label: 'Resolve', icon: <CheckCheck className="w-3 h-3" /> },
                              { value: 'dismissed', label: 'Dismiss', icon: <Ban className="w-3 h-3" /> }
                            ].map((stat) => (
                              <button
                                key={stat.value}
                                type="button"
                                onClick={() => setResolveStatus(stat.value)}
                                className={`flex-1 py-1.5 rounded-md text-[10px] font-semibold uppercase transition-all flex items-center justify-center gap-1 ${
                                  resolveStatus === stat.value 
                                    ? 'bg-[#5C352C] text-white shadow-sm' 
                                    : 'text-gray-400 hover:text-gray-600'
                                }`}
                              >
                                {stat.icon}
                                {stat.label}
                              </button>
                            ))}
                          </div>

                          <textarea
                            placeholder="Enter your response to the user..."
                            className="w-full p-2.5 text-sm rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-[#5C352C] focus:border-transparent transition-all min-h-[80px] resize-none"
                            value={adminResponse}
                            onChange={(e) => setAdminResponse(e.target.value)}
                            required
                          ></textarea>

                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-gradient-to-r from-[#5C352C] to-[#7A4B3E] text-white py-2 rounded-lg font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                          >
                            {isSubmitting ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              <>
                                <Send className="w-3.5 h-3.5" />
                                Update & Notify
                              </>
                            )}
                          </button>
                        </form>
                      </div>
                    )}

                    {/* Resolved/Dismissed Message */}
                    {(selectedReport.status === 'resolved' || selectedReport.status === 'dismissed') && (
                      <div className="p-5 border-t border-gray-100 bg-gray-50">
                        <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                            {selectedReport.status === 'resolved' ? (
                              <CheckCheck className="w-5 h-5 text-emerald-500" />
                            ) : (
                              <Ban className="w-5 h-5 text-gray-500" />
                            )}
                          </div>
                          <p className="text-sm font-medium text-gray-800">Case {selectedReport.status}</p>
                          <p className="text-[10px] text-gray-500 mt-0.5">No further action can be taken</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <style>{`
          @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slide-in-from-right-4 {
            from { transform: translateX(1rem); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
          @keyframes slide-down {
            from { transform: translateY(-0.5rem); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          .animate-in {
            animation: fade-in 0.5s ease-out;
          }
          .slide-in-from-right-4 {
            animation: slide-in-from-right-4 0.3s ease-out;
          }
          .slide-down {
            animation: slide-down 0.3s ease-out;
          }
          .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: #F3F4F6;
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #D1D5DB;
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #9CA3AF;
          }
        `}</style>
      </div>
    </MainLayout>
  );
};

export default AdminReports;
import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ChevronRight, 
  MessageSquare,
  MessageCircle,
  Calendar,
  Eye,
  Plus,
  X,
  User,
  Package,
  ShoppingBag,
  Image as ImageIcon
} from 'lucide-react';
import api from '../../api/axios';
import ReportModal from '../../components/ReportModal';
import MainLayout from '../../layouts/MainLayout';
import { useLanguage } from '../../contexts/LanguageContext';
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
const SkeletonReportCard = () => (
  <div className="bg-white rounded-xl border border-gray-100 p-4 overflow-hidden">
    <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
      <div className="flex-1">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <div className="w-16 h-5 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-full"></div>
          <div className="w-20 h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded"></div>
          <div className="w-24 h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded"></div>
        </div>
        <div className="h-5 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-3/4 mb-2"></div>
        <div className="space-y-1">
          <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-full"></div>
          <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-2/3"></div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-16 h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded"></div>
        <div className="w-8 h-8 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-lg"></div>
        <div className="w-4 h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded"></div>
      </div>
    </div>
  </div>
);

// ==================== MAIN COMPONENT ====================
const IssueReports = () => {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    search: '',
  });
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0
  });

  // Add shimmer style to document head
  useEffect(() => {
    if (!document.querySelector('#shimmer-styles-reports')) {
      const style = document.createElement('style');
      style.id = 'shimmer-styles-reports';
      style.textContent = shimmerStyle;
      document.head.appendChild(style);
    }
  }, []);

  const fetchReports = async (page = 1) => {
    setLoading(true);
    try {
      const role = localStorage.getItem('role');
      const params = {};
      if (filters.status && filters.status !== '') {
        params.status = filters.status;
      }
      if (filters.search && filters.search.trim() !== '') {
        params.search = filters.search;
      }
      params.page = page;
      
      const response = await api.get(`/${role}/reports`, { params });
      
      if (response.data && response.data.data) {
        setReports(response.data.data);
        setPagination({
          current_page: response.data.current_page || page,
          last_page: response.data.last_page || 1,
          per_page: response.data.per_page || 10,
          total: response.data.total || 0
        });
      } else if (Array.isArray(response.data)) {
        setReports(response.data);
      } else {
        setReports([]);
      }
    } catch (err) {
      console.error('Failed to fetch reports', err);
      showToast(t('buyer.issueReports.failedToFetchReports'), 'error');
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports(1);
  }, [filters.status, filters.search]);

  const handleViewDetails = async (reportId) => {
    try {
      const role = localStorage.getItem('role');
      const response = await api.get(`/${role}/reports/${reportId}`);
      setSelectedReport(response.data);
      setIsDetailsModalOpen(true);
    } catch (err) {
      console.error('Failed to fetch report details', err);
      showToast(t('buyer.issueReports.failedToFetchReports'), 'error');
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ status: '', search: '' });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'investigation': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'resolved': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'dismissed': return 'bg-gray-50 text-gray-700 border-gray-100';
      default: return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-3 h-3" />;
      case 'investigation': return <Search className="w-3 h-3" />;
      case 'resolved': return <CheckCircle2 className="w-3 h-3" />;
      case 'dismissed': return <XCircle className="w-3 h-3" />;
      default: return <AlertTriangle className="w-3 h-3" />;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return t('buyer.issueReports.statusPending');
      case 'investigation': return t('buyer.issueReports.statusInvestigation');
      case 'resolved': return t('buyer.issueReports.statusResolved');
      case 'dismissed': return t('buyer.issueReports.statusDismissed');
      default: return status;
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'order': return <Package className="w-3.5 h-3.5" />;
      case 'user': return <User className="w-3.5 h-3.5" />;
      case 'product': return <ShoppingBag className="w-3.5 h-3.5" />;
      default: return <AlertTriangle className="w-3.5 h-3.5" />;
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'order': return t('buyer.issueReports.typeOrder');
      case 'user': return t('buyer.issueReports.typeUser');
      case 'product': return t('buyer.issueReports.typeProduct');
      default: return t('buyer.issueReports.typeOther');
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'order': return 'bg-purple-50 text-purple-700';
      case 'user': return 'bg-blue-50 text-blue-700';
      case 'product': return 'bg-emerald-50 text-emerald-700';
      default: return 'bg-gray-50 text-gray-700';
    }
  };

  // Show skeleton while loading first time
  if (loading && reports.length === 0) {
    return (
      <MainLayout>
        <div className="p-6 bg-gray-50 min-h-screen">
          <div className="max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <div className="h-7 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-40"></div>
                <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-64 mt-1"></div>
              </div>
              <div className="h-9 w-28 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-lg"></div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1 h-10 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-lg"></div>
                <div className="w-32 h-10 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-lg"></div>
              </div>
            </div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map(i => <SkeletonReportCard key={i} />)}
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-5xl mx-auto" role="main" aria-label={t('buyer.issueReports.reportsPageLabel')}>
          
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{t('buyer.issueReports.reportsAndDisputes')}</h1>
              <p className="text-sm text-gray-500 mt-1">{t('buyer.issueReports.reportsSubtitle')}</p>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#5C352C] text-white rounded-lg text-sm font-medium hover:bg-[#4A2A22] transition-colors focus:outline-none focus:ring-2 focus:ring-[#5C352C] focus:ring-offset-2"
              aria-label={t('buyer.issueReports.openNewReportForm')}
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              {t('buyer.issueReports.newReport')}
            </button>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6">
            <div className="flex flex-wrap gap-3">
              <div className="flex-1 min-w-[200px] relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
                <input 
                  type="text"
                  placeholder={t('buyer.issueReports.searchPlaceholder')}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#5C352C] focus:ring-1 focus:ring-[#5C352C]"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  aria-label={t('buyer.issueReports.searchPlaceholder')}
                />
              </div>
              
              <select 
                className="px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:border-[#5C352C] focus:ring-1 focus:ring-[#5C352C]"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                aria-label={t('buyer.issueReports.allStatus')}
              >
                <option value="">{t('buyer.issueReports.allStatus')}</option>
                <option value="pending">{t('buyer.issueReports.statusPending')}</option>
                <option value="investigation">{t('buyer.issueReports.statusInvestigation')}</option>
                <option value="resolved">{t('buyer.issueReports.statusResolved')}</option>
                <option value="dismissed">{t('buyer.issueReports.statusDismissed')}</option>
              </select>
              
              {(filters.status || filters.search) && (
                <button 
                  onClick={clearFilters} 
                  className="text-xs text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus:underline"
                >
                  {t('buyer.issueReports.clear')}
                </button>
              )}
            </div>
          </div>

          {/* Reports List */}
          <div className="space-y-3">
            {reports.length === 0 && !loading ? (
              <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <MessageSquare className="w-6 h-6 text-gray-400" aria-hidden="true" />
                </div>
                <h3 className="text-base font-medium text-gray-900 mb-1">{t('buyer.issueReports.noReports')}</h3>
                <p className="text-sm text-gray-500">
                  {filters.status || filters.search ? t('buyer.issueReports.noMatchesFound') : t('buyer.issueReports.noReportsSubmitted')}
                </p>
                {(filters.status || filters.search) && (
                  <button 
                    onClick={clearFilters} 
                    className="mt-3 text-sm text-[#5C352C] hover:underline focus:outline-none focus:ring-2 focus:ring-[#5C352C] rounded px-2 py-1"
                  >
                    {t('buyer.issueReports.clearFilters')}
                  </button>
                )}
              </div>
            ) : (
              <>
                {reports.map((report) => (
                  <div 
                    key={report.id} 
                    className="bg-white rounded-xl border border-gray-100 hover:shadow-md transition-shadow overflow-hidden"
                    role="article"
                    aria-label={t('buyer.issueReports.viewReportDetails', { id: report.id })}
                  >
                    <div className="p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          {/* Badges */}
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${getStatusColor(report.status)}`}>
                              {getStatusIcon(report.status)}
                              {getStatusLabel(report.status)}
                            </span>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${getTypeColor(report.type)}`}>
                              {getTypeIcon(report.type)}
                              {getTypeLabel(report.type)}
                            </span>
                            <span className="text-[10px] text-gray-400 flex items-center gap-1">
                              <Calendar className="w-3 h-3" aria-hidden="true" />
                              {new Date(report.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          
                          {/* Subject */}
                          <h3 className="font-medium text-gray-900 text-sm">{report.subject}</h3>
                          
                          {/* Description Preview */}
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{report.description}</p>

                          {/* Related Info Tags */}
                          <div className="flex flex-wrap gap-2 mt-2">
                            {report.order && (
                              <span className="text-[10px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded">
                                {t('buyer.issueReports.orderLabel')} #{report.order.order_number || report.order.id}
                              </span>
                            )}
                            {report.product && (
                              <span className="text-[10px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded">
                                {report.product.name || `${t('buyer.issueReports.productLabel')} #${report.product.id}`}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          {report.admin_response ? (
                            <div className="text-[10px] text-emerald-600 flex items-center gap-1">
                              <MessageCircle className="w-3 h-3" aria-hidden="true" />
                              {t('buyer.issueReports.responded')}
                            </div>
                          ) : (
                            <div className="text-[10px] text-amber-600 flex items-center gap-1">
                              <Clock className="w-3 h-3" aria-hidden="true" />
                              {t('buyer.issueReports.awaiting')}
                            </div>
                          )}
                          <button 
                            onClick={() => handleViewDetails(report.id)}
                            className="p-1.5 text-gray-400 hover:text-[#5C352C] hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#5C352C]"
                            aria-label={t('buyer.issueReports.viewReportDetails', { id: report.id })}
                          >
                            <Eye className="w-4 h-4" aria-hidden="true" />
                          </button>
                          <ChevronRight className="w-4 h-4 text-gray-300" aria-hidden="true" />
                        </div>
                      </div>
                      
                      {/* Admin Response Preview */}
                      {report.admin_response && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <p className="text-[10px] font-medium text-gray-400 mb-1">{t('buyer.issueReports.response')}</p>
                          <p className="text-xs text-gray-600 line-clamp-1 italic">"{report.admin_response}"</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {/* Pagination */}
                {pagination.last_page > 1 && (
                  <div className="flex justify-center gap-2 mt-6">
                    <button
                      onClick={() => fetchReports(pagination.current_page - 1)}
                      disabled={pagination.current_page === 1}
                      className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs disabled:opacity-40 hover:border-[#5C352C] hover:text-[#5C352C] transition-colors focus:outline-none focus:ring-2 focus:ring-[#5C352C]"
                      aria-label={t('buyer.issueReports.previous')}
                    >
                      {t('buyer.issueReports.previous')}
                    </button>
                    <span className="px-3 py-1.5 text-xs font-medium text-white bg-[#5C352C] rounded-lg">
                      {pagination.current_page} / {pagination.last_page}
                    </span>
                    <button
                      onClick={() => fetchReports(pagination.current_page + 1)}
                      disabled={pagination.current_page === pagination.last_page}
                      className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs disabled:opacity-40 hover:border-[#5C352C] hover:text-[#5C352C] transition-colors focus:outline-none focus:ring-2 focus:ring-[#5C352C]"
                      aria-label={t('buyer.issueReports.next')}
                    >
                      {t('buyer.issueReports.next')}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Report Details Modal */}
          {isDetailsModalOpen && selectedReport && (
            <div 
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" 
              onClick={() => setIsDetailsModalOpen(false)}
              role="dialog"
              aria-modal="true"
              aria-label={t('buyer.issueReports.reportDetails')}
            >
              <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex justify-between items-center">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{t('buyer.issueReports.reportDetails')}</h2>
                    <p className="text-xs text-gray-500">{t('buyer.issueReports.id')}: #{selectedReport.id}</p>
                  </div>
                  <button 
                    onClick={() => setIsDetailsModalOpen(false)} 
                    className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
                    aria-label={t('buyer.issueReports.closeModal')}
                  >
                    <X className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>

                <div className="p-5 space-y-4">
                  {/* Status and Type */}
                  <div className="flex flex-wrap gap-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${getStatusColor(selectedReport.status)}`}>
                      {getStatusIcon(selectedReport.status)}
                      {getStatusLabel(selectedReport.status)}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${getTypeColor(selectedReport.type)}`}>
                      {getTypeIcon(selectedReport.type)}
                      {getTypeLabel(selectedReport.type)}
                    </span>
                  </div>

                  {/* Subject */}
                  <div>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase mb-1">{t('buyer.issueReports.subject')}</h3>
                    <p className="text-sm text-gray-900">{selectedReport.subject}</p>
                  </div>

                  {/* Description */}
                  <div>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase mb-1">{t('buyer.issueReports.description')}</h3>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">{selectedReport.description}</p>
                  </div>

                  {/* Evidence Image */}
                  {selectedReport.evidence_image_url && (
                    <div>
                      <h3 className="text-xs font-semibold text-gray-500 uppercase mb-1">{t('buyer.issueReports.evidence')}</h3>
                      <img 
                        src={selectedReport.evidence_image_url} 
                        alt={t('buyer.issueReports.evidence')} 
                        className="rounded-lg max-w-full h-auto max-h-64 object-contain border border-gray-100" 
                      />
                    </div>
                  )}

                  {/* Related Info */}
                  <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase">{t('buyer.issueReports.relatedInfo')}</h3>
                    {selectedReport.order && (
                      <p className="text-xs text-gray-700">
                        {t('buyer.issueReports.orderLabel')}: #{selectedReport.order.order_number || selectedReport.order.id}
                      </p>
                    )}
                    {selectedReport.product && (
                      <p className="text-xs text-gray-700">
                        {t('buyer.issueReports.productLabel')}: {selectedReport.product.name || `#${selectedReport.product.id}`}
                      </p>
                    )}
                    {selectedReport.reported_user && (
                      <p className="text-xs text-gray-700">
                        {t('buyer.issueReports.reportedUser')}: {selectedReport.reported_user.name || selectedReport.reported_user.email}
                      </p>
                    )}
                  </div>

                  {/* Admin Response */}
                  {selectedReport.admin_response && (
                    <div className="bg-amber-50 rounded-lg p-3">
                      <h3 className="text-xs font-semibold text-amber-700 uppercase mb-1">{t('buyer.issueReports.adminResponse')}</h3>
                      <p className="text-sm text-amber-700 italic">"{selectedReport.admin_response}"</p>
                      {selectedReport.resolved_at && (
                        <p className="text-[10px] text-amber-600 mt-1">{new Date(selectedReport.resolved_at).toLocaleString()}</p>
                      )}
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="text-[10px] text-gray-400 pt-2 border-t border-gray-100">
                    <p>{t('buyer.issueReports.reported')}: {new Date(selectedReport.created_at).toLocaleString()}</p>
                    {selectedReport.updated_at !== selectedReport.created_at && (
                      <p>{t('buyer.issueReports.updated')}: {new Date(selectedReport.updated_at).toLocaleString()}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Submission Modal */}
          <ReportModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)}
            onSuccess={() => {
              fetchReports(1);
              setFilters({ status: '', search: '' });
              showToast(t('buyer.issueReports.reportSubmitted'), 'success');
            }}
          />
        </div>
      </div>
    </MainLayout>
  );
};

export default IssueReports;
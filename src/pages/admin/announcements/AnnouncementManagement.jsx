// src/pages/admin/announcements/AnnouncementManagement.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import MainLayout from '../../../layouts/MainLayout';
import { announcementService } from '../../../services/announcementService';
import api from '../../../api/axios';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useToast } from '../../../contexts/ToastContext';
import { confirmAlert } from '../../../utils/sweetAlertHelper';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Search,
  Calendar,
  CheckCircle,
  Clock,
  Send,
  RefreshCw,
  Bell,
  Megaphone,
  Filter,
  X,
  AlertCircle,
  Users,
  UserCheck,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  AlertTriangle
} from 'lucide-react';
import AnnouncementModal from './AnnouncementModal';
import AnnouncementDetails from './AnnouncementDetails';

// Skeleton Loaders
const SkeletonRow = () => (
  <div className="animate-pulse">
    <div className="flex items-center gap-4 p-4 border-b border-gray-100">
      <div className="w-5 h-5 bg-gray-200 rounded"></div>
      <div className="flex-1">
        <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-48"></div>
      </div>
      <div className="h-6 bg-gray-200 rounded w-20"></div>
      <div className="h-6 bg-gray-200 rounded w-24"></div>
      <div className="h-4 bg-gray-200 rounded w-32"></div>
      <div className="h-4 bg-gray-200 rounded w-24"></div>
      <div className="flex gap-2">
        <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
        <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
        <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
      </div>
    </div>
  </div>
);

const SkeletonStats = () => (
  <div className="animate-pulse grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
    {[1, 2, 3, 4].map(i => (
      <div key={i} className="bg-white p-4 rounded-xl border border-gray-100">
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
);

const AnnouncementManagement = () => {
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [filters, setFilters] = useState({ status: '', search: '', audience: '' });
  const [selectedIds, setSelectedIds] = useState([]);
  
  const refreshButtonRef = useRef(null);

  useEffect(() => {
    fetchAnnouncements();
  }, [filters]);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const response = await announcementService.getAllAnnouncements(filters);
      setAnnouncements(response.data.data || []);
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to load announcements';
      showToast(errorMsg, 'error');
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAnnouncements();
    setRefreshing(false);
    showToast('Announcements refreshed', 'info');
  };

  const handleCreate = () => {
    setSelectedAnnouncement(null);
    setShowModal(true);
  };

  const handleEdit = (announcement) => {
    setSelectedAnnouncement(announcement);
    setShowModal(true);
  };

  const handleView = (announcement) => {
    setSelectedAnnouncement(announcement);
    setShowDetails(true);
  };

  const handleDelete = async (id, title) => {
    const confirmed = await confirmAlert({
      title: t('alerts.deleteConfirm', { name: title }),
      text: t('alerts.deleteConfirmText'),
      icon: 'warning',
      confirmButtonText: t('common.delete'),
      cancelButtonText: t('common.cancel'),
      dangerMode: true,
    });
    if (confirmed) {
      try {
        await announcementService.deleteAnnouncement(id);
        showToast(t('alerts.deleteSuccess', { name: title }) || 'Announcement deleted successfully', 'success');
        await fetchAnnouncements();
      } catch (error) {
        showToast(t('alerts.deleteError') || 'Failed to delete announcement', 'error');
      }
    }
  };

  const handleBulkPublish = async () => {
    if (selectedIds.length === 0) {
      showToast('Please select at least one announcement', 'warning');
      return;
    }
    
    try {
      await announcementService.bulkUpdateStatus(selectedIds, 'published');
      showToast(`${selectedIds.length} announcement(s) published`, 'success');
      setSelectedIds([]);
      await fetchAnnouncements();
    } catch (error) {
      showToast('Failed to publish announcements', 'error');
    }
  };

  const clearFilters = () => {
    setFilters({ status: '', search: '', audience: '' });
    showToast('Filters cleared', 'info');
  };

  const hasActiveFilters = filters.status || filters.search || filters.audience;

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status, publishedAt) => {
    if (status === 'published' && publishedAt && new Date(publishedAt) <= new Date()) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
          <CheckCircle className="w-3 h-3" />
          Published
        </span>
      );
    }
    
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
        <Clock className="w-3 h-3" />
        Draft
      </span>
    );
  };

  const getAudienceBadge = (audience) => {
    const config = {
      all: { icon: Users, label: 'All Users', class: 'bg-purple-50 text-purple-700' },
      buyers: { icon: UserCheck, label: 'Buyers', class: 'bg-blue-50 text-blue-700' },
      sellers: { icon: Briefcase, label: 'Sellers', class: 'bg-emerald-50 text-emerald-700' }
    };
    
    const { icon: Icon, label, class: badgeClass } = config[audience] || config.all;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${badgeClass}`}>
        <Icon className="w-3 h-3" />
        {label}
      </span>
    );
  };

  // Stats for summary cards
  const stats = {
    total: announcements.length,
    published: announcements.filter(a => a.status === 'published' && a.published_at && new Date(a.published_at) <= new Date()).length,
    draft: announcements.filter(a => a.status === 'draft').length,
    all: announcements.filter(a => a.audience === 'all').length,
  };

  const statCards = [
    {
      title: "Total Announcements",
      value: stats.total,
      icon: Megaphone,
      color: "text-purple-600",
      bg: "bg-purple-50"
    },
    {
      title: "Published",
      value: stats.published,
      icon: CheckCircle,
      color: "text-emerald-600",
      bg: "bg-emerald-50"
    },
    {
      title: "Drafts",
      value: stats.draft,
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50"
    },
    {
      title: "All Users",
      value: stats.all,
      icon: Users,
      color: "text-purple-600",
      bg: "bg-purple-50"
    }
  ];

  if (loading && announcements.length === 0) {
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
            <SkeletonStats />
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <div className="h-10 bg-gray-200 rounded-lg animate-pulse"></div>
              </div>
              {[1, 2, 3, 4, 5].map(i => <SkeletonRow key={i} />)}
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
                <Megaphone className="w-5 h-5 text-[#5C352C]" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Announcements</h1>
            </div>
            <p className="text-sm text-gray-500 ml-11">Create and manage targeted announcements for different user groups</p>
          </div>

          {/* Action Bar */}
          <div className="flex justify-end gap-3 mb-4">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors text-sm"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Sync
            </button>
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 px-4 py-2 bg-[#5C352C] text-white rounded-lg hover:bg-[#956959] transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              New Announcement
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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

          {/* Search Bar */}
          <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6">
            <div className="flex flex-wrap gap-3">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by title or content..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#5C352C] focus:ring-1 focus:ring-[#5C352C]"
                  />
                </div>
              </div>
              
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-[#5C352C]"
              >
                <option value="">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>

              <select
                value={filters.audience}
                onChange={(e) => setFilters({ ...filters, audience: e.target.value })}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-[#5C352C]"
              >
                <option value="">All Audiences</option>
                <option value="all">All Users</option>
                <option value="buyers">Buyers Only</option>
                <option value="sellers">Sellers Only</option>
              </select>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="px-3 py-2 text-sm text-red-500 hover:text-red-600 flex items-center gap-1"
                >
                  <X className="w-4 h-4" />
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-4">
            <p className="text-xs text-gray-500">
              Showing <span className="font-medium text-gray-700">{announcements.length}</span> announcements
            </p>
          </div>

          {/* Bulk Actions Bar */}
          {selectedIds.length > 0 && (
            <div className="bg-amber-50 rounded-lg px-4 py-3 flex items-center justify-between mb-4 border border-amber-200">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span className="text-sm text-amber-700">{selectedIds.length} announcement(s) selected</span>
              </div>
              <button
                onClick={handleBulkPublish}
                className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm"
              >
                <Send className="w-4 h-4" />
                Publish Selected
              </button>
            </div>
          )}

          {/* Announcements Table */}
          {announcements.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
              <Megaphone className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-medium text-gray-900 mb-1">No Announcements Yet</h3>
              <p className="text-sm text-gray-500">
                {hasActiveFilters ? "Try adjusting your filters" : "Create your first announcement to communicate with users"}
              </p>
              {hasActiveFilters ? (
                <button onClick={clearFilters} className="mt-3 text-sm text-[#5C352C] hover:underline">
                  Clear filters
                </button>
              ) : (
                <button
                  onClick={handleCreate}
                  className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-[#5C352C] text-white rounded-lg hover:bg-[#956959] transition-colors text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Create Announcement
                </button>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left w-12">
                        <input
                          type="checkbox"
                          checked={selectedIds.length === announcements.length && announcements.length > 0}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedIds(announcements.map(a => a.id));
                            } else {
                              setSelectedIds([]);
                            }
                          }}
                          className="rounded border-gray-300 focus:ring-[#5C352C]"
                        />
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Title</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Audience</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Published</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Created By</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {announcements.map((announcement) => (
                      <tr key={announcement.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(announcement.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedIds([...selectedIds, announcement.id]);
                              } else {
                                setSelectedIds(selectedIds.filter(id => id !== announcement.id));
                              }
                            }}
                            className="rounded border-gray-300 focus:ring-[#5C352C]"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-sm text-gray-900">{announcement.title}</p>
                          <p className="text-xs text-gray-500 truncate max-w-md mt-0.5">{announcement.content}</p>
                        </td>
                        <td className="px-4 py-3">
                          {getStatusBadge(announcement.status, announcement.published_at)}
                        </td>
                        <td className="px-4 py-3">
                          {getAudienceBadge(announcement.audience)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Calendar className="w-3 h-3" />
                            {formatDate(announcement.published_at)}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500">
                          {announcement.creator?.name || 'Unknown'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleView(announcement)}
                              className="p-1.5 text-gray-500 hover:text-[#5C352C] hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEdit(announcement)}
                              className="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(announcement.id, announcement.title)}
                              className="p-1.5 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modals */}
        {showModal && (
          <AnnouncementModal
            announcement={selectedAnnouncement}
            onClose={() => setShowModal(false)}
            onSuccess={() => {
              setShowModal(false);
              fetchAnnouncements();
            }}
          />
        )}
        
        {showDetails && (
          <AnnouncementDetails
            announcement={selectedAnnouncement}
            onClose={() => setShowDetails(false)}
          />
        )}
      </div>
    </MainLayout>
  );
};

export default AnnouncementManagement;
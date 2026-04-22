// src/pages/seller/announcements/SellerAnnouncements.jsx
import React, { useState, useEffect, useCallback } from 'react';
import MainLayout from '../../../layouts/MainLayout';
import { announcementService } from '../../../services/announcementService';
import { useToast } from '../../../contexts/ToastContext';
import { 
  Bell, 
  Calendar, 
  User, 
  ChevronDown, 
  ChevronUp,
  Megaphone,
  CheckCircle,
  Clock,
  RefreshCw,
  AlertCircle,
  Sparkles
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
const SkeletonAnnouncement = () => (
  <div className="bg-white rounded-xl border border-gray-100 p-5 overflow-hidden">
    <div className="flex justify-between items-start">
      <div className="flex-1">
        <div className="h-5 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-3/4 mb-3"></div>
        <div className="flex gap-3">
          <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-28"></div>
          <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-20"></div>
        </div>
      </div>
      <div className="w-5 h-5 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded"></div>
    </div>
  </div>
);

const SellerAnnouncements = () => {
  const { showToast } = useToast();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  // Add shimmer style
  useEffect(() => {
    if (!document.querySelector('#shimmer-styles-seller-announcements')) {
      const style = document.createElement('style');
      style.id = 'shimmer-styles-seller-announcements';
      style.textContent = shimmerStyle;
      document.head.appendChild(style);
    }
  }, []);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setRefreshing(true);
      const response = await announcementService.getPublishedAnnouncements();
      setAnnouncements(response.data.data || []);
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to load announcements';
      showToast(errorMsg, 'error');
      setAnnouncements([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchAnnouncements();
    showToast('Announcements refreshed', 'info');
  };

  const formatDateTime = (date) => {
    if (!date) return 'Date not available';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatRelativeTime = (date) => {
    if (!date) return null;
    const now = new Date();
    const published = new Date(date);
    const diffMs = now - published;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return null;
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="p-6 bg-gray-50 min-h-screen">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-xl"></div>
                <div className="h-7 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-40"></div>
              </div>
              <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-64 ml-12"></div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white rounded-xl border border-gray-100 p-4 overflow-hidden">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-lg"></div>
                  <div>
                    <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-20 mb-1"></div>
                    <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-12"></div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-4 overflow-hidden">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-lg"></div>
                  <div>
                    <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-20 mb-1"></div>
                    <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-32"></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <div className="h-5 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-32"></div>
              </div>
              {[1, 2, 3, 4].map(i => <SkeletonAnnouncement key={i} />)}
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto">
          
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#5C352C]/10 rounded-xl">
                  <Megaphone className="w-5 h-5 text-[#5C352C]" />
                </div>
                <h1 className="text-xl font-semibold text-gray-900">Announcements</h1>
              </div>
              <button 
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-1 ml-11">Stay updated with the latest news</p>
          </div>

          {/* Stats Row */}
          {announcements.length > 0 && (
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white rounded-xl border border-gray-100 p-3">
                <p className="text-2xl font-bold text-gray-900">{announcements.length}</p>
                <p className="text-xs text-gray-500">Total Updates</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-3">
                <p className="text-2xl font-bold text-emerald-600">
                  {announcements.filter(a => {
                    const daysOld = (new Date() - new Date(a.published_at)) / (1000 * 60 * 60 * 24);
                    return daysOld <= 7;
                  }).length}
                </p>
                <p className="text-xs text-gray-500">Recent (7d)</p>
              </div>
            </div>
          )}

          {/* Latest Update Banner */}
          {announcements.length > 0 && (
            <div className="bg-gradient-to-r from-[#5C352C] to-[#7A4B3E] rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-white/10 rounded-lg">
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-medium text-yellow-200 uppercase tracking-wide">Latest</p>
                  <p className="text-sm font-medium text-white mt-0.5">{announcements[0]?.title}</p>
                  <p className="text-xs text-white/70 mt-1 line-clamp-1">{announcements[0]?.content}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-white/60">{formatDateTime(announcements[0]?.published_at)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Announcements List */}
          {announcements.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
              <div className="p-3 bg-gray-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <Bell className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="text-base font-medium text-gray-900 mb-1">No Announcements</h3>
              <p className="text-sm text-gray-500">Check back later for updates</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100 bg-gray-50">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-[#5C352C]" />
                  <h3 className="text-sm font-semibold text-gray-900">Recent Announcements</h3>
                  <span className="ml-auto text-xs text-gray-400">{announcements.length} items</span>
                </div>
              </div>
              <div className="divide-y divide-gray-100">
                {announcements.map((announcement, index) => {
                  const relativeTime = formatRelativeTime(announcement.published_at);
                  const isExpanded = expandedId === announcement.id;
                  const isLatest = index === 0;
                  
                  return (
                    <div 
                      key={announcement.id} 
                      className={`transition-colors ${isExpanded ? 'bg-amber-50/20' : 'hover:bg-gray-50'} ${isLatest && !isExpanded ? 'border-l-3 border-l-[#5C352C]' : ''}`}
                      style={isLatest && !isExpanded ? { borderLeftWidth: '3px', borderLeftColor: '#5C352C' } : {}}
                    >
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : announcement.id)}
                        className="w-full text-left p-4 focus:outline-none"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            {/* Title Row */}
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-sm font-medium text-gray-900">
                                {announcement.title}
                              </h3>
                              {isLatest && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-medium bg-emerald-50 text-emerald-600">
                                  New
                                </span>
                              )}
                            </div>
                            
                            {/* Meta Row */}
                            <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDateTime(announcement.published_at)}
                              </span>
                              {relativeTime && (
                                <span className="text-emerald-500">• {relativeTime}</span>
                              )}
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {announcement.creator?.name || 'Admin'}
                              </span>
                            </div>
                            
                            {/* Preview - only show when collapsed */}
                            {!isExpanded && (
                              <p className="text-xs text-gray-500 mt-2 line-clamp-1">
                                {announcement.content}
                              </p>
                            )}
                          </div>
                          
                          {/* Expand Icon */}
                          <div className="flex-shrink-0 mt-1">
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-gray-400" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                        </div>
                        
                        {/* Expanded Content */}
                        {isExpanded && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed bg-gray-50 rounded-lg p-4">
                              {announcement.content}
                            </div>
                            <div className="flex items-center justify-end gap-2 mt-2">
                              <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" />
                                Official
                              </span>
                            </div>
                          </div>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Footer Note */}
          {announcements.length > 0 && (
            <div className="mt-6 text-center">
              <p className="text-[10px] text-gray-400 flex items-center justify-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Announcements are official communications from system administrators
              </p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default SellerAnnouncements;
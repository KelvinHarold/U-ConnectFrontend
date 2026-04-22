// src/pages/buyer/announcements/BuyerAnnouncements.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import MainLayout from '../../../layouts/MainLayout';
import { announcementService } from '../../../services/announcementService';
import { useToast } from '../../../contexts/ToastContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import { 
  Bell, 
  Calendar, 
  User, 
  RefreshCw,
  Megaphone,
  ChevronDown,
  ChevronUp,
  Users,
  UserCheck,
  Briefcase,
  AlertCircle,
  Sparkles
} from 'lucide-react';

// ==================== INSTAGRAM-STYLE SHIMMER ANIMATION ====================
const shimmerStyle = `
  @keyframes shimmer {
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
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
    <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
      <div className="h-5 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-48"></div>
      <div className="w-24 h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-full"></div>
    </div>
    <div className="flex flex-wrap items-center gap-3 mb-4 pb-3 border-b border-gray-100">
      <div className="w-28 h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded"></div>
      <div className="w-20 h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded"></div>
    </div>
    <div className="space-y-2">
      <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-full"></div>
      <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-11/12"></div>
      <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-9/12"></div>
    </div>
  </div>
);

const SkeletonStats = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    {[1, 2].map(i => (
      <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 overflow-hidden">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-20"></div>
            <div className="h-8 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-16"></div>
          </div>
          <div className="w-10 h-10 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-xl"></div>
        </div>
      </div>
    ))}
  </div>
);

// ==================== MAIN COMPONENT ====================
const BuyerAnnouncements = () => {
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expanded, setExpanded] = useState({});
  
  const refreshButtonRef = useRef(null);

  // Add shimmer style to document head
  useEffect(() => {
    if (!document.querySelector('#shimmer-styles-buyer-announcements')) {
      const style = document.createElement('style');
      style.id = 'shimmer-styles-buyer-announcements';
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
      const errorMsg = error.response?.data?.message || t('buyer.announcements.failedToLoadAnnouncements');
      showToast(errorMsg, 'error');
      setAnnouncements([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchAnnouncements();
    showToast(t('buyer.announcements.announcementsRefreshed'), 'info');
  };

  const toggleReadMore = (id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const formatDateTime = (date) => {
    if (!date) return t('buyer.announcements.dateNotAvailable');
    return new Date(date).toLocaleDateString(t('common.locale') === 'sw' ? 'sw-TZ' : 'en-US', {
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

    if (diffMins < 1) return t('buyer.announcements.justNow');
    if (diffMins < 60) return t('buyer.announcements.minutesAgo', { minutes: diffMins });
    if (diffHours < 24) return t('buyer.announcements.hoursAgo', { hours: diffHours });
    if (diffDays < 7) return t('buyer.announcements.daysAgo', { days: diffDays });
    return null;
  };

  const getAudienceBadge = (audience) => {
    const configs = {
      all: { 
        icon: Users, 
        label: t('buyer.announcements.audienceAll'), 
        class: 'bg-purple-50 text-purple-600' 
      },
      buyers: { 
        icon: UserCheck, 
        label: t('buyer.announcements.audienceBuyers'), 
        class: 'bg-blue-50 text-blue-600' 
      },
      sellers: { 
        icon: Briefcase, 
        label: t('buyer.announcements.audienceSellers'), 
        class: 'bg-emerald-50 text-emerald-600' 
      }
    };
    const config = configs[audience] || configs.all;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${config.class}`}>
        <Icon className="w-3 h-3" aria-hidden="true" />
        {config.label}
      </span>
    );
  };

  const stats = {
    total: announcements.length,
    recent: announcements.filter(a => {
      const daysOld = (new Date() - new Date(a.published_at)) / (1000 * 60 * 60 * 24);
      return daysOld <= 7;
    }).length
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
            <SkeletonStats />
            <div className="mt-6 space-y-4">
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
                  <Megaphone className="w-5 h-5 text-[#5C352C]" aria-hidden="true" />
                </div>
                <h1 className="text-xl font-semibold text-gray-900">{t('buyer.announcements.announcements')}</h1>
              </div>
              <button 
                ref={refreshButtonRef}
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#5C352C] disabled:opacity-50"
                aria-label={t('buyer.announcements.refreshAnnouncements')}
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} aria-hidden="true" />
                {t('buyer.announcements.refresh')}
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-1 ml-11">{t('buyer.announcements.announcementsSubtitle')}</p>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-gray-100 p-3">
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-xs text-gray-500">{t('buyer.announcements.totalUpdates')}</p>
              <span className="sr-only">{t('buyer.announcements.totalUpdatesLabel', { count: stats.total })}</span>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-3">
              <p className="text-2xl font-bold text-emerald-600">{stats.recent}</p>
              <p className="text-xs text-gray-500">{t('buyer.announcements.recentUpdates')}</p>
              <span className="sr-only">{t('buyer.announcements.recentUpdatesLabel', { count: stats.recent })}</span>
            </div>
          </div>

          {/* Latest Update Banner */}
          {announcements.length > 0 && (
            <div 
              className="bg-gradient-to-r from-[#5C352C] to-[#7A4B3E] rounded-xl p-4 mb-6"
              role="region"
              aria-label={t('buyer.announcements.latestAnnouncement', { title: announcements[0]?.title })}
            >
              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-white/10 rounded-lg">
                  <Sparkles className="w-4 h-4 text-yellow-300" aria-hidden="true" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-medium text-yellow-200 uppercase tracking-wide">
                    {t('buyer.announcements.latest')}
                  </p>
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
                <Bell className="w-6 h-6 text-gray-400" aria-hidden="true" />
              </div>
              <h3 className="text-base font-medium text-gray-900 mb-1">{t('buyer.announcements.noAnnouncements')}</h3>
              <p className="text-sm text-gray-500">{t('buyer.announcements.noAnnouncementsDesc')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {announcements.map((announcement, index) => {
                const isExpanded = expanded[announcement.id];
                const content = announcement.content || "";
                const isLong = content.length > 150;
                const displayText = isExpanded || !isLong ? content : content.substring(0, 150) + "...";
                const relativeTime = formatRelativeTime(announcement.published_at);
                const isLatest = index === 0;

                return (
                  <div
                    key={announcement.id}
                    className={`bg-white rounded-xl border border-gray-100 overflow-hidden transition-all duration-200 hover:shadow-md ${
                      isLatest && !isExpanded ? 'border-l-3' : ''
                    }`}
                    style={isLatest && !isExpanded ? { borderLeftWidth: '3px', borderLeftColor: '#5C352C' } : {}}
                    role="article"
                    aria-label={t('buyer.announcements.announcementFrom', { 
                      name: announcement.creator?.name || 'Admin', 
                      date: formatDateTime(announcement.published_at) 
                    })}
                  >
                    <div className="p-4">
                      {/* Header */}
                      <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-semibold text-gray-900">
                            {announcement.title}
                          </h3>
                          {isLatest && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-medium bg-emerald-50 text-emerald-600">
                              {t('buyer.announcements.new')}
                            </span>
                          )}
                        </div>
                        {announcement.audience && (
                          <div className="flex-shrink-0">
                            {getAudienceBadge(announcement.audience)}
                          </div>
                        )}
                      </div>

                      {/* Meta */}
                      <div className="flex flex-wrap items-center gap-3 text-[10px] text-gray-400 mb-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" aria-hidden="true" />
                          {formatDateTime(announcement.published_at)}
                        </span>
                        {relativeTime && (
                          <span className="text-emerald-500">• {relativeTime}</span>
                        )}
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" aria-hidden="true" />
                          {announcement.creator?.name || 'Admin'}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="text-xs text-gray-600 leading-relaxed mb-2">
                        <div className="whitespace-pre-wrap">
                          {displayText}
                        </div>
                      </div>

                      {/* Read More */}
                      {isLong && (
                        <button
                          onClick={() => toggleReadMore(announcement.id)}
                          className="inline-flex items-center gap-0.5 text-[#5C352C] text-[10px] font-medium hover:text-[#7A4B3E] transition-colors focus:outline-none focus:ring-2 focus:ring-[#5C352C] rounded px-1 py-0.5"
                          aria-label={t('buyer.announcements.toggleReadMore', { title: announcement.title })}
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp className="w-3 h-3" aria-hidden="true" />
                              {t('buyer.announcements.showLess')}
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-3 h-3" aria-hidden="true" />
                              {t('buyer.announcements.readMore')}
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Footer */}
          {announcements.length > 0 && (
            <div className="mt-6 text-center">
              <p className="text-[10px] text-gray-400 flex items-center justify-center gap-1">
                <AlertCircle className="w-3 h-3" aria-hidden="true" />
                {t('buyer.announcements.officialAnnouncements')}
              </p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default BuyerAnnouncements;
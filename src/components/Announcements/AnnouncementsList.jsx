// src/components/Announcements/AnnouncementsList.jsx
import React, { useState, useEffect } from 'react';
import { announcementService } from '../../services/announcementService';
import { useLanguage } from '../../contexts/LanguageContext';
import { Bell, Calendar, User, ChevronDown, ChevronUp, Users, UserCheck, Briefcase, Megaphone, Clock } from 'lucide-react';

const AnnouncementsList = () => {
  const { t } = useLanguage();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await announcementService.getPublishedAnnouncements();
      setAnnouncements(response.data.data || []);
    } catch (error) {
      console.error('Failed to load announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (date) => {
    if (!date) return t('announcements.notPublishedYet');
    const locale = t('common.locale') === 'sw' ? 'sw-TZ' : 'en-US';
    return new Date(date).toLocaleString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAudienceConfig = (audience) => {
    switch(audience) {
      case 'buyers':
        return { 
          icon: UserCheck, 
          label: t('announcements.forBuyers'), 
          color: 'text-blue-700',
          bg: 'bg-blue-50',
          border: 'border-blue-100'
        };
      case 'sellers':
        return { 
          icon: Briefcase, 
          label: t('announcements.forSellers'), 
          color: 'text-emerald-700',
          bg: 'bg-emerald-50',
          border: 'border-emerald-100'
        };
      default:
        return { 
          icon: Users, 
          label: t('announcements.forEveryone'), 
          color: 'text-purple-700',
          bg: 'bg-purple-50',
          border: 'border-purple-100'
        };
    }
  };

  // Skeleton Loader
  const SkeletonLoader = () => (
    <div className="animate-pulse">
      <div className="space-y-3">
        <div className="h-20 bg-gray-100 rounded-lg"></div>
        <div className="h-20 bg-gray-100 rounded-lg"></div>
        <div className="h-20 bg-gray-100 rounded-lg"></div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm mb-6 overflow-hidden">
        <div className="border-b border-gray-100 px-5 py-4 flex items-center gap-2 bg-gradient-to-r from-gray-50 to-white">
          <div className="p-1.5 bg-gray-100 rounded-lg">
            <Bell className="w-4 h-4 text-gray-400" aria-hidden="true" />
          </div>
          <h2 className="text-base font-semibold text-gray-900">{t('announcements.title')}</h2>
        </div>
        <div className="p-5">
          <SkeletonLoader />
        </div>
      </div>
    );
  }

  if (announcements.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm mb-6 overflow-hidden">
      {/* Header */}
      <div className="border-b border-gray-100 px-5 py-4 flex items-center gap-2 bg-gradient-to-r from-gray-50 to-white">
        <div className="p-1.5 bg-[#5C352C]/10 rounded-lg">
          <Megaphone className="w-4 h-4 text-[#5C352C]" aria-hidden="true" />
        </div>
        <h2 className="text-base font-semibold text-gray-900">{t('announcements.title')}</h2>
        <span className="ml-auto text-xs font-medium bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
          {announcements.length} {t('announcements.newCount')}
        </span>
      </div>
      
      {/* Announcements List */}
      <div className="divide-y divide-gray-100">
        {announcements.map((announcement) => {
          const audienceConfig = getAudienceConfig(announcement.audience);
          const AudienceIcon = audienceConfig.icon;
          const isExpanded = expandedId === announcement.id;
          
          return (
            <div key={announcement.id} className="hover:bg-gray-50/50 transition-colors">
              <button
                onClick={() => setExpandedId(isExpanded ? null : announcement.id)}
                className="w-full text-left p-5 focus:outline-none focus:bg-gray-50 focus:ring-2 focus:ring-[#5C352C] focus:ring-inset"
                aria-expanded={isExpanded}
                aria-label={isExpanded ? t('announcements.collapseAnnouncement', { title: announcement.title }) : t('announcements.expandAnnouncement', { title: announcement.title })}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Title and Badge */}
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900 text-sm">
                        {announcement.title}
                      </h3>
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${audienceConfig.bg} ${audienceConfig.color}`}>
                        <AudienceIcon className="w-3 h-3" aria-hidden="true" />
                        {audienceConfig.label}
                      </span>
                    </div>
                    
                    {/* Meta Info */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" aria-hidden="true" />
                        {formatDateTime(announcement.published_at)}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" aria-hidden="true" />
                        {announcement.creator?.name || t('announcements.administrator')}
                      </span>
                    </div>
                  </div>
                  
                  {/* Expand/Collapse Icon */}
                  <div className="flex-shrink-0">
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-gray-400" aria-hidden="true" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400" aria-hidden="true" />
                    )}
                  </div>
                </div>
                
                {/* Expanded Content */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="text-gray-600 text-sm whitespace-pre-wrap leading-relaxed">
                      {announcement.content}
                    </div>
                    
                    {/* Timestamp footer for expanded view */}
                    {announcement.published_at && (
                      <div className="mt-3 pt-2 text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" aria-hidden="true" />
                        {t('announcements.publishedOn')} {formatDateTime(announcement.published_at)}
                      </div>
                    )}
                  </div>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AnnouncementsList;
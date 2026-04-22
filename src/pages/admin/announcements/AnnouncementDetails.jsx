// src/pages/admin/announcements/AnnouncementDetails.jsx
import React, { useEffect, useRef } from 'react';
import { X, Calendar, User, Clock, CheckCircle, FileText, Mail, Share2, Download, Users, UserCheck, Briefcase, AlertCircle, ChevronLeft } from 'lucide-react';

const AnnouncementDetails = ({ announcement, onClose }) => {
  const modalRef = useRef(null);

  useEffect(() => {
    modalRef.current?.focus();
    
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const formatDateTime = (date) => {
    if (!date) return 'Not published yet';
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
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
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  const getStatusConfig = () => {
    const isPublished = announcement.status === 'published' && announcement.published_at && new Date(announcement.published_at) <= new Date();
    if (isPublished) {
      return {
        icon: CheckCircle,
        text: 'Published',
        color: 'text-emerald-700',
        bg: 'bg-emerald-50'
      };
    }
    return {
      icon: Clock,
      text: 'Draft',
      color: 'text-amber-700',
      bg: 'bg-amber-50'
    };
  };

  const getAudienceConfig = () => {
    const configs = {
      all: { icon: Users, label: 'All Users', description: 'Visible to all users (buyers and sellers)', color: 'text-purple-700', bg: 'bg-purple-50' },
      buyers: { icon: UserCheck, label: 'Buyers Only', description: 'Visible only to buyers', color: 'text-blue-700', bg: 'bg-blue-50' },
      sellers: { icon: Briefcase, label: 'Sellers Only', description: 'Visible only to sellers', color: 'text-emerald-700', bg: 'bg-emerald-50' }
    };
    return configs[announcement.audience] || configs.all;
  };

  const statusConfig = getStatusConfig();
  const audienceConfig = getAudienceConfig();
  const StatusIcon = statusConfig.icon;
  const AudienceIcon = audienceConfig.icon;
  const relativeTime = formatRelativeTime(announcement.published_at);

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        ref={modalRef}
        className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden focus:outline-none"
        tabIndex="-1"
      >
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-[#2A1713] to-[#5C352C] px-6 py-4">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-xl">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 id="details-title" className="text-lg font-semibold text-white">
                  Announcement Details
                </h2>
                <p className="text-[#E9B48A] text-xs mt-0.5">
                  View full announcement information
                </p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="text-white/80 hover:text-white hover:bg-white/10 rounded-lg p-1.5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(90vh - 80px)' }}>
          <div className="space-y-6">
            {/* Title Section */}
            <div>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <h3 className="text-xl font-bold text-gray-900 leading-tight">
                  {announcement.title}
                </h3>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.color}`}>
                  <StatusIcon className="w-3 h-3" />
                  {statusConfig.text}
                </span>
              </div>
            </div>
            
            {/* Meta Information Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <div className="flex items-center gap-2 text-gray-500 mb-2">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase tracking-wider">Published</span>
                </div>
                <p className="text-sm font-medium text-gray-900">
                  {formatDateTime(announcement.published_at)}
                </p>
                {relativeTime && (
                  <p className="text-xs text-gray-500 mt-1">
                    {relativeTime}
                  </p>
                )}
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <div className="flex items-center gap-2 text-gray-500 mb-2">
                  <User className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase tracking-wider">Created By</span>
                </div>
                <p className="text-sm font-medium text-gray-900">
                  {announcement.creator?.name || 'Unknown'}
                </p>
                {announcement.creator?.email && (
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    {announcement.creator.email}
                  </p>
                )}
              </div>

              <div className={`${audienceConfig.bg} rounded-lg p-4 border border-gray-100`}>
                <div className="flex items-center gap-2 text-gray-500 mb-2">
                  <AudienceIcon className={`w-4 h-4 ${audienceConfig.color}`} />
                  <span className={`text-xs font-medium uppercase tracking-wider ${audienceConfig.color}`}>Target Audience</span>
                </div>
                <p className="text-sm font-medium text-gray-900">
                  {audienceConfig.label}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {audienceConfig.description}
                </p>
              </div>
            </div>
            
            {/* Content Section */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-5 bg-[#5C352C] rounded-full"></div>
                <h4 className="font-semibold text-gray-900 text-sm">Content</h4>
              </div>
              <div className="bg-gray-50 rounded-lg p-5 border border-gray-100">
                <div className="whitespace-pre-wrap text-gray-700 text-sm leading-relaxed">
                  {announcement.content}
                </div>
              </div>
            </div>
            
            {/* Additional Info */}
            <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-amber-100 rounded-lg">
                  <Clock className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-amber-800 uppercase tracking-wider">System Information</p>
                  <p className="text-xs text-amber-700 mt-1">
                    Created: {formatDateTime(announcement.created_at)}
                  </p>
                  {announcement.updated_at && announcement.updated_at !== announcement.created_at && (
                    <p className="text-xs text-amber-700 mt-0.5">
                      Last updated: {formatDateTime(announcement.updated_at)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Footer Actions */}
          <div className="border-t border-gray-100 mt-6 pt-6 flex justify-end gap-3">
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#5C352C] text-white rounded-lg hover:bg-[#956959] transition-colors text-sm font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementDetails;
// src/pages/admin/announcements/AnnouncementModal.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { announcementService } from '../../../services/announcementService';
import { useToast } from '../../../contexts/ToastContext';
import { X, Send, Save, FileText, AlertCircle, CheckCircle, Clock, Users, UserCheck, Briefcase, ChevronLeft } from 'lucide-react';

const AnnouncementModal = ({ announcement, onClose, onSuccess }) => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    status: 'draft',
    audience: 'all'
  });
  const [loading, setLoading] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const titleInputRef = useRef(null);

  useEffect(() => {
    if (announcement) {
      setFormData({
        title: announcement.title,
        content: announcement.content,
        status: announcement.status,
        audience: announcement.audience || 'all'
      });
      setCharCount(announcement.content.length);
    }
    setTimeout(() => {
      titleInputRef.current?.focus();
    }, 100);
  }, [announcement]);

  const handleContentChange = (e) => {
    const content = e.target.value;
    setFormData({ ...formData, content });
    setCharCount(content.length);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      showToast('Please enter a title', 'error');
      return;
    }
    
    if (!formData.content.trim()) {
      showToast('Please enter content', 'error');
      return;
    }
    
    setLoading(true);
    
    try {
      if (announcement) {
        await announcementService.updateAnnouncement(announcement.id, formData);
        showToast('Announcement updated successfully', 'success');
      } else {
        await announcementService.createAnnouncement(formData);
        showToast('Announcement created successfully', 'success');
      }
      onSuccess();
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.response?.data?.errors || 'Operation failed';
      showToast(typeof errorMsg === 'string' ? errorMsg : 'Please check your input', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = useCallback((event, callback) => {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      callback();
    }
  }, []);

  const getStatusIcon = () => {
    if (formData.status === 'published') {
      return <CheckCircle className="w-4 h-4 text-emerald-600" />;
    }
    return <Clock className="w-4 h-4 text-amber-600" />;
  };

  const audienceOptions = [
    { value: 'all', label: 'All Users', icon: Users, description: 'Visible to all users (both buyers and sellers)', color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200' },
    { value: 'buyers', label: 'Buyers Only', icon: UserCheck, description: 'Visible only to buyers', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
    { value: 'sellers', label: 'Sellers Only', icon: Briefcase, description: 'Visible only to sellers', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' }
  ];

  const selectedAudience = audienceOptions.find(opt => opt.value === formData.audience);

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#2A1713] to-[#5C352C] px-6 py-4">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-xl">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 id="modal-title" className="text-lg font-semibold text-white">
                  {announcement ? 'Edit Announcement' : 'Create Announcement'}
                </h2>
                <p className="text-[#E9B48A] text-xs mt-0.5">
                  {announcement ? 'Update your announcement details' : 'Fill in the details to create an announcement'}
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
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 100px)' }}>
          
          {/* Title Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title <span className="text-rose-500">*</span>
            </label>
            <input
              ref={titleInputRef}
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#5C352C] focus:border-[#5C352C] transition-all text-sm"
              placeholder="e.g., New Feature Release, System Update, Important Notice"
              maxLength="255"
              disabled={loading}
            />
            <p className="text-xs text-gray-400 mt-1">
              {formData.title.length}/255 characters
            </p>
          </div>
          
          {/* Audience Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Target Audience <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {audienceOptions.map((option) => (
                <label
                  key={option.value}
                  className={`relative flex cursor-pointer rounded-lg border-2 p-4 transition-all ${
                    formData.audience === option.value
                      ? `${option.bg} border-[#5C352C] shadow-sm`
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="audience"
                    value={option.value}
                    checked={formData.audience === option.value}
                    onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                    className="sr-only"
                    disabled={loading}
                  />
                  <div className="flex-1">
                    <div className={`flex items-center gap-2 mb-2 ${option.color}`}>
                      <option.icon className="w-4 h-4" />
                      <span className="font-medium text-sm">{option.label}</span>
                    </div>
                    <p className="text-xs text-gray-500">{option.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
          
          {/* Content Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows="10"
              value={formData.content}
              onChange={handleContentChange}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#5C352C] focus:border-[#5C352C] transition-all text-sm resize-none"
              placeholder="Write your announcement content here..."
              disabled={loading}
              onKeyDown={(e) => handleKeyPress(e, handleSubmit)}
            />
            <div className="flex justify-between items-center mt-1">
              <p className="text-xs text-gray-400">
                {charCount} characters
              </p>
              <p className="text-xs text-gray-400">
                Tip: Press Ctrl+Enter to submit
              </p>
            </div>
          </div>
          
          {/* Status Field */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Publication Status
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="draft"
                  checked={formData.status === 'draft'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-4 h-4 text-amber-600 focus:ring-amber-500"
                  disabled={loading}
                />
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span className="text-sm text-gray-700">Draft</span>
                </div>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="published"
                  checked={formData.status === 'published'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                  disabled={loading}
                />
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm text-gray-700">Publish Now</span>
                </div>
              </label>
            </div>
            
            <div className={`mt-3 p-3 rounded-lg flex items-start gap-2 text-sm ${
              formData.status === 'published' 
                ? 'bg-emerald-50 text-emerald-800' 
                : 'bg-amber-50 text-amber-800'
            }`}>
              {getStatusIcon()}
              <p className="text-xs">
                {formData.status === 'published' 
                  ? `Published announcements will be visible to ${selectedAudience?.label.toLowerCase()} immediately.` 
                  : 'Draft announcements are only visible to administrators. Publish when ready.'}
              </p>
            </div>
          </div>
          
          {/* Audience Preview */}
          <div className={`p-3 rounded-lg flex items-start gap-2 text-sm ${selectedAudience?.bg}`}>
            <selectedAudience.icon className={`w-4 h-4 ${selectedAudience?.color}`} />
            <div>
              <p className={`text-xs font-medium ${selectedAudience?.color}`}>
                Audience: {selectedAudience?.label}
              </p>
              <p className="text-xs text-gray-600 mt-0.5">
                {selectedAudience?.description}
              </p>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors text-sm font-medium"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#5C352C] text-white rounded-lg hover:bg-[#956959] transition-colors text-sm font-medium disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  {announcement ? (
                    <>
                      <Save className="w-4 h-4" />
                      Update Announcement
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Create Announcement
                    </>
                  )}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AnnouncementModal;
import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { confirmAlert } from '../utils/sweetAlertHelper';
import { Bell, CheckCheck, ChevronRight, Clock, Eye, Trash2 } from 'lucide-react';
import { useNotifications } from '../contexts/NotificationContext';

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

const NotificationBell = () => {
    const { t } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const { 
        notifications, 
        unreadCount, 
        loading, 
        markAsRead, 
        markAllAsRead, 
        deleteAllNotifications
    } = useNotifications();

    // Add shimmer style
    useEffect(() => {
        if (!document.querySelector('#shimmer-styles-notifications')) {
            const style = document.createElement('style');
            style.id = 'shimmer-styles-notifications';
            style.textContent = shimmerStyle;
            document.head.appendChild(style);
        }
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const formatTime = (date) => {
        if (!date) return 'Just now';
        const now = new Date();
        const diff = now - new Date(date);
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        
        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m`;
        if (hours < 24) return `${hours}h`;
        if (days < 7) return `${days}d`;
        return new Date(date).toLocaleDateString();
    };

    const sortedNotifications = [...notifications].sort((a, b) => {
        if (!a.read_at && b.read_at) return -1;
        if (a.read_at && !b.read_at) return 1;
        return new Date(b.created_at) - new Date(a.created_at);
    });

    const handleClearAll = async () => {
        const confirmed = await confirmAlert({
            title: t('alerts.deleteConfirm', { name: t('common.notifications') || 'notifications' }),
            text: t('alerts.deleteConfirmText'),
            icon: 'warning',
            confirmButtonText: t('common.deleteAll'),
            cancelButtonText: t('common.cancel'),
            dangerMode: true,
        });
        if (confirmed) {
            await deleteAllNotifications();
        }
    };

    // Skeleton loader for notifications
    const SkeletonNotification = () => (
        <div className="px-4 py-3 border-b border-gray-100 overflow-hidden">
            <div className="flex items-start gap-2 mb-2">
                <div className="flex-1">
                    <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-32 mb-1"></div>
                    <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-40"></div>
                </div>
                <div className="w-10 h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-full"></div>
            </div>
            <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-full mb-2"></div>
            <div className="flex gap-2">
                <div className="w-12 h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded"></div>
            </div>
        </div>
    );

    return (
        <div className="relative inline-block" ref={dropdownRef}>
            {/* Notification Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-[#5C352C] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#5C352C] focus:ring-offset-2"
                aria-label="Notifications"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1 shadow-sm">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div className="fixed inset-0 bg-black/50 z-40 sm:hidden" onClick={() => setIsOpen(false)}></div>
                    
                    <div className={`
                        fixed sm:absolute 
                        left-4 right-4 sm:left-auto sm:right-0 
                        bottom-4 sm:top-full sm:bottom-auto 
                        sm:mt-2 
                        w-auto sm:w-[360px]
                        max-w-[calc(100vw-2rem)] sm:max-w-none
                        bg-white 
                        rounded-xl 
                        shadow-lg 
                        border border-gray-100 
                        overflow-hidden 
                        z-50 
                        transform transition-all duration-200 ease-out
                        animate-slide-up sm:animate-dropdown
                    `}>
                        
                        {/* Header */}
                        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                                    <p className="text-[10px] text-gray-500 mt-0.5">
                                        {unreadCount} unread
                                    </p>
                                </div>
                                <div className="flex items-center gap-1">
                                    {unreadCount > 0 && (
                                        <button
                                            onClick={markAllAsRead}
                                            className="flex items-center gap-1 px-2 py-1 text-[10px] text-gray-500 hover:text-[#5C352C] hover:bg-gray-100 rounded-lg transition-colors"
                                            title="Mark all as read"
                                        >
                                            <CheckCheck className="w-3 h-3" />
                                            <span>Read all</span>
                                        </button>
                                    )}
                                    {notifications.length > 0 && (
                                        <button
                                            onClick={handleClearAll}
                                            className="flex items-center gap-1 px-2 py-1 text-[10px] text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                            title="Clear all"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                            <span>Clear</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Notifications List */}
                        <div className="overflow-y-auto max-h-[400px]">
                            {loading ? (
                                <div>
                                    {[1, 2, 3, 4].map(i => <SkeletonNotification key={i} />)}
                                </div>
                            ) : sortedNotifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
                                    <Bell className="w-10 h-10 text-gray-200 mb-2" />
                                    <p className="text-sm text-gray-500">No notifications</p>
                                    <p className="text-xs text-gray-400 mt-1">You're all caught up!</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {sortedNotifications.slice(0, 20).map((notification) => (
                                        <div
                                            key={notification.id}
                                            className={`
                                                group relative 
                                                px-4 py-3 
                                                transition-all duration-200 
                                                cursor-pointer 
                                                hover:bg-gray-50
                                                ${!notification.read_at ? 'bg-amber-50/20' : ''}
                                            `}
                                            onClick={() => {
                                                if (!notification.read_at) {
                                                    markAsRead(notification.id);
                                                }
                                                if (notification.data?.action_url) {
                                                    window.location.href = notification.data.action_url;
                                                    setIsOpen(false);
                                                }
                                            }}
                                        >
                                            <div className="flex-1 min-w-0">
                                                {/* Title and New Badge */}
                                                <div className="flex items-start justify-between gap-2 mb-1">
                                                    <p className={`text-sm flex-1 ${!notification.read_at ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
                                                        {notification.title}
                                                    </p>
                                                    {!notification.read_at && (
                                                        <span className="flex-shrink-0 text-[9px] font-medium text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded-full">
                                                            New
                                                        </span>
                                                    )}
                                                </div>
                                                
                                                {/* Message Body */}
                                                <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-2">
                                                    {notification.body}
                                                </p>
                                                
                                                {/* Time */}
                                                <div className="flex items-center gap-2">
                                                    <div className="flex items-center gap-1 text-[10px] text-gray-400">
                                                        <Clock className="w-3 h-3" />
                                                        <span>{formatTime(notification.created_at)}</span>
                                                    </div>
                                                    {notification.read_at && (
                                                        <div className="flex items-center gap-1 text-[10px] text-gray-400">
                                                            <Eye className="w-3 h-3" />
                                                            <span>Read</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Chevron indicator */}
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <ChevronRight className="w-4 h-4 text-gray-300" />
                                            </div>

                                            {/* Action Buttons */}
                                            {notification.actions && notification.actions.length > 0 && (
                                                <div className="mt-2.5 flex gap-2">
                                                    {notification.actions.map((action, idx) => (
                                                        <button
                                                            key={idx}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                window.location.href = action.url;
                                                                setIsOpen(false);
                                                            }}
                                                            className={`text-xs px-3 py-1 rounded-lg font-medium transition-colors ${
                                                                action.color === 'primary'
                                                                    ? 'bg-[#5C352C] text-white hover:bg-[#4A2A22]'
                                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                            }`}
                                                        >
                                                            {action.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {notifications.length > 0 && (
                            <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
                                <button
                                    onClick={() => {
                                        window.location.href = '/notifications';
                                        setIsOpen(false);
                                    }}
                                    className="w-full text-xs font-medium text-[#5C352C] hover:text-[#4A2A22] transition-colors flex items-center justify-center gap-1"
                                >
                                    View all
                                    <ChevronRight className="w-3 h-3" />
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}

            <style>{`
                @keyframes dropdown {
                    from { opacity: 0; transform: scale(0.95) translateY(-10px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }
                @keyframes slide-up {
                    from { transform: translateY(100%); }
                    to { transform: translateY(0); }
                }
                .animate-dropdown { animation: dropdown 0.2s ease-out; }
                .animate-slide-up { animation: slide-up 0.3s ease-out; }
                
                .overflow-y-auto::-webkit-scrollbar { width: 4px; }
                .overflow-y-auto::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
                .overflow-y-auto::-webkit-scrollbar-thumb { background: #c1c1c1; border-radius: 10px; }
                .overflow-y-auto::-webkit-scrollbar-thumb:hover { background: #a8a8a8; }
                
                .line-clamp-2 {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
            `}</style>
        </div>
    );
};

export default NotificationBell;
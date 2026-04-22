// src/contexts/NotificationContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';

const NotificationContext = createContext();

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within NotificationProvider');
    }
    return context;
};

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext);

    // Keep a ref to the Echo instance so we can properly disconnect on cleanup
    const echoRef = useRef(null);
    const channelRef = useRef(null);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

    const getAuthHeaders = () => {
        const token = localStorage.getItem('auth_token');
        return {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            }
        };
    };

    const fetchNotifications = useCallback(async () => {
        try {
            const token = localStorage.getItem('auth_token');
            if (!token) {
                setLoading(false);
                return;
            }
            const response = await axios.get(`${API_URL}/notifications`, getAuthHeaders());
            setNotifications(response.data.data.data || []);
            setUnreadCount(response.data.unread_count || 0);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    }, [API_URL]);

    const fetchUnreadCount = useCallback(async () => {
        try {
            const token = localStorage.getItem('auth_token');
            if (!token) return;
            const response = await axios.get(`${API_URL}/notifications/unread/count`, getAuthHeaders());
            setUnreadCount(response.data.unread_count || 0);
        } catch (error) {
            console.error('Failed to fetch unread count:', error);
        }
    }, [API_URL]);

    const markAsRead = async (notificationId) => {
        try {
            const token = localStorage.getItem('auth_token');
            if (!token) return false;
            await axios.post(`${API_URL}/notifications/${notificationId}/read`, {}, getAuthHeaders());
            setNotifications(prev =>
                prev.map(notif =>
                    notif.id === notificationId
                        ? { ...notif, read_at: new Date().toISOString() }
                        : notif
                )
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
            return true;
        } catch (error) {
            console.error('Failed to mark as read:', error);
            return false;
        }
    };

    const markAllAsRead = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            if (!token) return false;
            await axios.post(`${API_URL}/notifications/read/all`, {}, getAuthHeaders());
            setNotifications(prev =>
                prev.map(notif => ({ ...notif, read_at: new Date().toISOString() }))
            );
            setUnreadCount(0);
            return true;
        } catch (error) {
            console.error('Failed to mark all as read:', error);
            return false;
        }
    };

    const deleteAllNotifications = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            if (!token) return false;
            await axios.delete(`${API_URL}/notifications`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications([]);
            setUnreadCount(0);
            return true;
        } catch (error) {
            console.error('Failed to delete all notifications:', error);
            return false;
        }
    };

    const deleteNotification = async (notificationId) => {
        try {
            const token = localStorage.getItem('auth_token');
            if (!token) return false;
            await axios.delete(`${API_URL}/notifications/${notificationId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const deletedNotif = notifications.find(n => n.id === notificationId);
            setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
            if (deletedNotif && !deletedNotif.read_at) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
            return true;
        } catch (error) {
            console.error('Failed to delete notification:', error);
            return false;
        }
    };

    // ─── Real-time Pusher setup ───────────────────────────────────────────────
    useEffect(() => {
        const token = localStorage.getItem('auth_token');

        if (!user || !token) {
            setLoading(false);
            // Clear notifications when logged out
            if (!user) {
                setNotifications([]);
                setUnreadCount(0);
            }
            return;
        }

        // Initial data load
        fetchNotifications();

        // Request browser notification permission
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }

        // Dynamically import createEcho factory so we always get a fresh token
        import('../services/echo').then(({ default: createEcho }) => {
            try {
                const echoInstance = createEcho();
                echoRef.current = echoInstance;

                const channelName = `user-notifications.${user.id}`;
                const channel = echoInstance.private(channelName);
                channelRef.current = channel;

                channel.listen('.new-notification', (data) => {
                    console.log('🔥 Real-time notification received:', data);

                    // broadcastWith() sends a flat object — id, title, body, data,
                    // actions, icon, color, created_at (diffForHumans), read_at, unread_count
                    const notif = {
                        id: data.id,
                        type: data.type,
                        title: data.title,
                        body: data.body,
                        data: data.data,
                        actions: data.actions,
                        icon: data.icon,
                        color: data.color,
                        read_at: data.read_at || null,
                        // created_at from backend is diffForHumans() string; store as-is
                        created_at: data.created_at || new Date().toISOString(),
                    };

                    // Prepend new notification — avoid duplicates
                    setNotifications(prev => {
                        const exists = prev.some(n => n.id === notif.id);
                        if (exists) return prev;
                        return [notif, ...prev];
                    });

                    // Use the unread_count from the server payload directly
                    if (typeof data.unread_count === 'number') {
                        setUnreadCount(data.unread_count);
                    } else {
                        setUnreadCount(prev => prev + 1);
                    }

                    // Show browser notification if permission granted
                    if ('Notification' in window && Notification.permission === 'granted') {
                        new Notification(notif.title || 'New Notification', {
                            body: notif.body || '',
                            icon: '/favicon.ico',
                        });
                    }
                });

                channel.error((error) => {
                    console.error('Pusher channel error:', error);
                });

            } catch (error) {
                console.error('Failed to setup Echo:', error);
            }
        });

        // Cleanup: leave channel & disconnect Echo when component unmounts
        return () => {
            if (channelRef.current && echoRef.current) {
                try {
                    echoRef.current.leave(`user-notifications.${user.id}`);
                } catch (e) {
                    // ignore cleanup errors
                }
            }
            if (echoRef.current) {
                try {
                    echoRef.current.disconnect();
                } catch (e) {
                    // ignore cleanup errors
                }
                echoRef.current = null;
                channelRef.current = null;
            }
        };
    }, [user, fetchNotifications]); // Re-run when user logs in/out

    const value = {
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        fetchUnreadCount,
        markAsRead,
        markAllAsRead,
        deleteAllNotifications,
        deleteNotification,
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};
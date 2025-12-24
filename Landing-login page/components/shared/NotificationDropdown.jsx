import React, { useState, useEffect } from 'react';
import { Bell, Check, Trash2, X, CheckCheck } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

const NotificationDropdown = ({ isOpen, onClose, dropdownRef }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState(null);

    const [timeTick, setTimeTick] = useState(0);

    useEffect(() => {
        fetchCurrentUser();
    }, []);

    useEffect(() => {
        if (currentUserId && isOpen) {
            fetchNotifications();
        }
    }, [currentUserId, isOpen]);

    // Realtime Subscription
    useEffect(() => {
        if (!currentUserId) return;

        const channel = supabase
            .channel('realtime-notifications')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `receiver_id=eq.${currentUserId}`
                },
                (payload) => {
                    console.log('New notification received:', payload.new);
                    setNotifications((prev) => [payload.new, ...prev]);

                    // Optional: Play a sound or show a system notification here
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [currentUserId]);

    // Update relative time every minute
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeTick(t => t + 1);
        }, 60000); // Update every minute
        return () => clearInterval(timer);
    }, []);

    const fetchCurrentUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            setCurrentUserId(user.id);
        }
    };

    const fetchNotifications = async () => {
        // Don't show loading if we already have some notifications (background refresh)
        if (notifications.length === 0) setLoading(true);

        try {
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('receiver_id', currentUserId)
                .order('created_at', { ascending: false })
                .limit(10);

            if (!error) {
                setNotifications(data || []);
            }
        } catch (err) {
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('id', notificationId);

            setNotifications(prev =>
                prev.map(notif =>
                    notif.id === notificationId ? { ...notif, is_read: true } : notif
                )
            );
        } catch (err) {
            console.error('Error marking as read:', err);
        }
    };

    const deleteNotification = async (notificationId) => {
        try {
            await supabase
                .from('notifications')
                .delete()
                .eq('id', notificationId);

            setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
        } catch (err) {
            console.error('Error deleting notification:', err);
        }
    };

    const markAllAsRead = async () => {
        try {
            const unreadNotifications = notifications.filter(n => !n.is_read);
            if (unreadNotifications.length === 0) return;

            await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('receiver_id', currentUserId)
                .eq('is_read', false);

            setNotifications(prev =>
                prev.map(notif => ({ ...notif, is_read: true }))
            );
        } catch (err) {
            console.error('Error marking all as read:', err);
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'leave_approved':
                return '✓';
            case 'leave_rejected':
                return '✗';
            case 'leave_request':
                return '📅';
            case 'task_assigned':
                return '📋';
            case 'announcement':
                return '📢';
            default:
                return '🔔';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Just now';

        // Parse the UTC timestamp from Supabase
        const date = new Date(dateString);

        // Check if date is valid
        if (isNaN(date.getTime()) || date.getTime() === 0) return 'Just now';

        const now = new Date();

        // Calculate difference in milliseconds
        const diffMs = now.getTime() - date.getTime();

        // Handle future dates or clock skew
        if (diffMs < 0) return 'Just now';

        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;

        // For older notifications, show formatted date
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        });
    };

    if (!isOpen) return null;

    const unreadCount = notifications.filter(n => !n.is_read).length;

    return (
        <div
            ref={dropdownRef}
            style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '8px',
                width: '400px',
                maxHeight: '500px',
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
                border: '1px solid var(--border)',
                zIndex: 1000,
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            {/* Header */}
            <div style={{
                padding: '16px',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Bell size={20} />
                    <h3 style={{ fontSize: '1rem', fontWeight: 'bold' }}>Notifications</h3>
                    {unreadCount > 0 && (
                        <span style={{
                            backgroundColor: 'var(--primary)',
                            color: 'white',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: 600
                        }}>
                            {unreadCount}
                        </span>
                    )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllAsRead}
                            style={{
                                background: 'none',
                                border: '1px solid var(--border)',
                                cursor: 'pointer',
                                padding: '6px 12px',
                                borderRadius: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                fontSize: '0.8rem',
                                fontWeight: 500,
                                color: 'var(--text-primary)',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'var(--primary)';
                                e.currentTarget.style.color = 'white';
                                e.currentTarget.style.borderColor = 'var(--primary)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                                e.currentTarget.style.color = 'var(--text-primary)';
                                e.currentTarget.style.borderColor = 'var(--border)';
                            }}
                        >
                            <CheckCheck size={14} />
                            Mark All Read
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '4px',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center'
                        }}
                    >
                        <X size={18} />
                    </button>
                </div>
            </div>

            {/* Notifications List */}
            <div style={{ overflowY: 'auto', maxHeight: '400px' }}>
                {loading ? (
                    <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        Loading...
                    </div>
                ) : notifications.length === 0 ? (
                    <div style={{ padding: '32px', textAlign: 'center' }}>
                        <Bell size={32} color="var(--text-secondary)" style={{ opacity: 0.5, marginBottom: '8px' }} />
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                            No notifications yet
                        </p>
                    </div>
                ) : (
                    notifications.map((notification, index) => (
                        <div
                            key={notification.id}
                            style={{
                                padding: '12px 16px',
                                borderBottom: index < notifications.length - 1 ? '1px solid var(--border)' : 'none',
                                backgroundColor: notification.is_read ? 'transparent' : 'rgba(59, 130, 246, 0.05)',
                                transition: 'background-color 0.2s'
                            }}
                        >
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <div style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    backgroundColor: 'var(--background)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1rem',
                                    flexShrink: 0
                                }}>
                                    {getNotificationIcon(notification.type)}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    {notification.sender_name && (
                                        <p style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '2px' }}>
                                            {notification.sender_name}
                                        </p>
                                    )}
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '4px' }}>
                                        {notification.message}
                                    </p>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                            {formatDate(notification.created_at)}
                                        </span>
                                        {!notification.is_read && (
                                            <button
                                                onClick={() => markAsRead(notification.id)}
                                                style={{
                                                    padding: '2px 8px',
                                                    fontSize: '0.7rem',
                                                    borderRadius: '4px',
                                                    border: '1px solid var(--border)',
                                                    backgroundColor: 'white',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '4px'
                                                }}
                                            >
                                                <Check size={10} />
                                                Read
                                            </button>
                                        )}

                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default NotificationDropdown;

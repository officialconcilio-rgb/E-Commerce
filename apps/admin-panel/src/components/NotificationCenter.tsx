'use client';

import { useState, useEffect, useRef } from 'react';
import api from '@/utils/api';
import { Bell, Package, ShoppingBag, Users, Info, X, Trash2, Clock } from 'lucide-react';
import Link from 'next/link';

function formatTimeAgo(dateInput: string | Date) {
    const date = new Date(dateInput);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
}

export default function NotificationCenter() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/admin/notifications');
            setNotifications(res.data.notifications);
            setUnreadCount(res.data.unreadCount);
        } catch (error) {
            console.error('Failed to fetch notifications');
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Poll for new notifications every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAsRead = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await api.patch(`/admin/notifications/${id}/read`);
            setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to mark as read');
        }
    };

    const markAllRead = async () => {
        try {
            await api.patch('/admin/notifications/read-all');
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to mark all as read');
        }
    };

    const deleteNotification = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await api.delete(`/admin/notifications/${id}`);
            setNotifications(notifications.filter(n => n._id !== id));
            const deleted = notifications.find(n => n._id === id);
            if (deleted && !deleted.isRead) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Failed to delete notification');
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'Order': return <ShoppingBag className="w-5 h-5 text-amber-500" />;
            case 'User': return <Users className="w-5 h-5 text-blue-500" />;
            case 'Inventory': return <Package className="w-5 h-5 text-rose-500" />;
            default: return <Info className="w-5 h-5 text-gray-500" />;
        }
    };

    return (
        <div className="relative" ref={wrapperRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-3 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors"
                title="Notifications"
            >
                <Bell className={`w-6 h-6 ${unreadCount > 0 ? 'text-[#1e1e2d]' : 'text-gray-500'}`} />
                {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 min-w-[20px] h-[20px] bg-red-500 text-white text-[10px] flex items-center justify-center font-black rounded-full border-2 border-white px-1">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-4 w-[400px] bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-fade-in shadow-gray-200/50">
                    <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                        <div>
                            <h3 className="font-black text-[#1e1e2d] text-base">NOTIFICATIONS</h3>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Store Updates</p>
                        </div>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllRead}
                                className="text-[10px] font-black uppercase tracking-widest text-amber-600 hover:text-amber-700 transition-colors"
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>

                    <div className="max-h-[450px] overflow-y-auto custom-scrollbar">
                        {notifications.length > 0 ? (
                            notifications.map((n) => (
                                <div
                                    key={n._id}
                                    className={`relative p-5 border-b border-gray-50 transition-all hover:bg-gray-50/80 ${!n.isRead ? 'bg-amber-50/30' : ''}`}
                                >
                                    <div className="flex gap-4">
                                        <div className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100 shrink-0 h-fit">
                                            {getIcon(n.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <h4 className={`text-sm font-bold truncate ${!n.isRead ? 'text-[#1e1e2d]' : 'text-gray-600'}`}>
                                                    {n.title}
                                                </h4>
                                                <span className="text-[10px] text-gray-400 font-bold flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {formatTimeAgo(n.createdAt)}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500 leading-relaxed mb-3 line-clamp-2">
                                                {n.message}
                                            </p>
                                            <div className="flex items-center gap-4">
                                                {n.link && (
                                                    <Link
                                                        href={n.link}
                                                        onClick={() => setIsOpen(false)}
                                                        className="text-[10px] font-black uppercase tracking-widest text-[#1e1e2d] hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-all"
                                                    >
                                                        Details
                                                    </Link>
                                                )}
                                                {!n.isRead && (
                                                    <button
                                                        onClick={(e) => markAsRead(n._id, e)}
                                                        className="text-[10px] font-black uppercase tracking-widest text-amber-600 hover:text-amber-700"
                                                    >
                                                        Read
                                                    </button>
                                                )}
                                                <button
                                                    onClick={(e) => deleteNotification(n._id, e)}
                                                    className="p-1.5 text-gray-300 hover:text-red-500 transition-colors ml-auto rounded-lg hover:bg-red-50"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-12 text-center">
                                <div className="bg-gray-50 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-gray-100">
                                    <Bell className="w-8 h-8 text-gray-200" />
                                </div>
                                <h4 className="font-bold text-gray-600 mb-1">All caught up!</h4>
                                <p className="text-xs text-gray-400">No new notifications for you right now.</p>
                            </div>
                        )}
                    </div>

                    <div className="p-5 border-t border-gray-50 bg-gray-50/50 text-center">
                        <button className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-[#1e1e2d] transition-colors">
                            Notification Settings
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

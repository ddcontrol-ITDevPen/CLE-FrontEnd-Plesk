import React, { useState, useEffect } from 'react';
import { X, Check, Bell, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getUnreadNotifications, markNotificationAsRead } from '../../services/notificationService.js';

export const NotificationOverlay = () => {
    const [notifications, setNotifications] = useState([]);
    const userId = localStorage.getItem("userId");

    const fetchNotifications = async () => {
        if (!userId) return;
        try {
            const data = await getUnreadNotifications(userId);
            setNotifications(data);
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        }
    };

    const handleDismiss = async (id) => {
        try {
            await markNotificationAsRead(id);
            setNotifications(prev => prev.filter(n => n.id !== id));
        } catch (error) {
            console.error("Could not dismiss notification", error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 20000);
        return () => clearInterval(interval);
    }, [userId]);

    if (notifications.length === 0) return null;

    return (
        <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-4 w-96">
            <AnimatePresence>
                {notifications.map((notif) => (
                    <motion.div
                        key={notif.id}
                        initial={{ opacity: 0, x: 100, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 100, transition: { duration: 0.2 } }}
                        className="bg-white border-l-4 border-red-500 shadow-[0_10px_40px_rgba(0,0,0,0.15)] rounded-2xl p-5 flex gap-4 items-start relative overflow-hidden"
                    >
                        {/* Subtle background decoration */}
                        <div className="absolute top-0 right-0 p-2 opacity-5">
                            <AlertTriangle size={80} />
                        </div>

                        <div className="bg-red-50 p-2.5 rounded-xl text-red-600 shrink-0">
                            <Bell size={20} className="animate-bounce" />
                        </div>

                        <div className="flex-1">
                            <h4 className="text-sm font-bold text-gray-900">Enroute Booking Rejected</h4>
                            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                                {notif.message} (ROT: <span className="font-bold text-red-600">{notif.rotNumber}</span>)
                            </p>

                            <div className="flex gap-2 mt-4">
                                <button
                                    onClick={() => handleDismiss(notif.id)}
                                    className="flex-1 flex items-center justify-center gap-2 text-xs font-bold bg-gray-900 text-white py-2 rounded-lg hover:bg-black transition-all active:scale-95"
                                >
                                    <Check size={14} /> Understood
                                </button>
                                <button
                                    onClick={() => handleDismiss(notif.id)}
                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                                    title="Close"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};
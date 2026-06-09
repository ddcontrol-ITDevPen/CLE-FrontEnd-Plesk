import React, { useState, useEffect } from 'react';
import {X, Check, Bell, AlertTriangle, CheckCircle2, Clock} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getUnreadNotifications, markNotificationAsRead } from '../../services/notificationService.js';
import {getUserById} from "../../services/userService.js";

export const NotificationOverlay = () => {
    const [notifications, setNotifications] = useState([]);
    const [companyCode, setCompanyCode] = useState(null);
    const userId = localStorage.getItem("userId");

    useEffect(() => {
        const fetchUserCompany = async () => {
            if (!userId) return;
            try {
                const userData = await getUserById(userId);
                setCompanyCode(userData.companyCode);
            } catch (error) {
                console.error("Failed to fetch user company info", error);
            }
        };
        fetchUserCompany();
    }, [userId]);
    
    const fetchNotifications = async () => {
        if (!companyCode) return;
        try {
            const data = await getUnreadNotifications(companyCode);
            setNotifications(data);
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        }
    };

    useEffect(() => {
        if (!companyCode) return;
        fetchNotifications();
        const intervalId = setInterval(() => {
            fetchNotifications();
        }, 30000);

        return () => clearInterval(intervalId);
    }, [companyCode]);

    const handleDismiss = async (id) => {
        try {
            await markNotificationAsRead(id);
            setNotifications(prev => prev.filter(n => n.id !== id));
        } catch (error) {
            console.error("Could not dismiss notification", error);
        }
    };

    useEffect(() => {
        if (!companyCode) return;
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 20000);
        return () => clearInterval(interval);
    }, [companyCode]);

    if (notifications.length === 0) return null;

    return (
        <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-4 w-96">
            <AnimatePresence>
                {notifications.map((notif) => {
                    const messageText = notif.message?.toLowerCase() || "";

                    let headingTitle = "Booking Update";
                    let barColor = "bg-system-color";
                    let iconBg = "bg-blue-50 text-system-color";
                    let icon = <Bell size={20} />;

                    if (messageText.includes("terminal changed")) {
                        headingTitle = "Terminal Schedule Shifted";
                        barColor = "bg-amber-500";
                        iconBg = "bg-amber-50 text-amber-600";
                        icon = <Bell size={20} />;
                    }
                    else if (messageText.includes("automatically accepted")) {
                        headingTitle = "Slot Auto-Accepted";
                        barColor = "bg-green-500";
                        iconBg = "bg-green-50 text-green-600";
                        icon = <CheckCircle2 size={20} />;
                    }
                    else if (messageText.includes("automatically rejected")) {
                        headingTitle = "Slot Auto-Rejected";
                        barColor = "bg-slate-700";
                        iconBg = "bg-slate-100 text-slate-700";
                        icon = <Clock size={20} />;
                    }
                    else if (messageText.includes("rejected by the forwarding")) {
                        headingTitle = "Enroute Booking Rejected";
                        barColor = "bg-red-500";
                        iconBg = "bg-red-50 text-red-600";
                        icon = <AlertTriangle size={20} />;
                    }
                    
                    return(
                    <motion.div
                        key={notif.id}
                        initial={{ opacity: 0, x: 100, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 100, transition: { duration: 0.2 } }}
                        className="bg-white shadow-[0_10px_40px_rgba(0,0,0,0.15)] rounded-2xl p-5 flex gap-4 items-start relative overflow-hidden"
                    >
                        {/* Subtle background decoration */}
                        <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${barColor}`} />

                        <div className={`p-3 rounded-xl h-fit ${iconBg}`}>
                            {icon}
                        </div>

                        <div className="flex-1">
                            <h4 className="text-sm font-bold text-gray-900">{headingTitle}</h4>
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
            );
            })}
            </AnimatePresence>
        </div>
    );
};
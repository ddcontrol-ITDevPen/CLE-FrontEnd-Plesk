import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../layout/Layout.jsx";
import {
    LayoutDashboard,
    Package,
    CheckCircle,
    Clock,
    AlertTriangle,
    ArrowUpRight,
    UserCircle,
    Building2,
    Calendar,
    ArrowRight
} from "lucide-react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { toast, Toaster } from "sonner";
import { getUserById } from "../../../services/userService.js";
import { getAleBookings } from "../../../services/aleBookingService.js";
import {getAleContainers} from "../../../services/aleContainerService.js";


const STATUS_CONFIG = {
    "Assigned": { bg: "bg-assigned", text: "text-orange-900", border: "border-orange-300" },
    "Enroute":   { bg: "bg-enroute",  text: "text-amber-900",  border: "border-amber-200" },
    // "Examine-AKPS": { bg: "bg-examine",text: "text-purple-900",border: "border-purple-200" },
    // "Examine-Custom": { bg: "bg-examine",   text: "text-purple-900",   border: "border-purple-200" },
    // "Examine-Complete": { bg: "bg-examine",   text: "text-purple-900",   border: "border-purple-200" },
    "Approved-AKPS": { bg: "bg-delivered-rfc",text: "text-emerald-900",border: "border-teal-200" },
    "Approved-Custom": { bg: "bg-delivered-rfc",   text: "text-emerald-900",   border: "border-teal-200" },
    "Approved-Complete": { bg: "bg-delivered-rfc",   text: "text-teal-900",   border: "border-teal-200" },
    "Accepted":   { bg: "bg-accepted",  text: "text-green",  border: "border-green-200" },
    "Gate-In":   { bg: "bg-gate-in-out",   text: "text-blue-900",   border: "border-indigo-200" },
    "Gate-Out":  { bg: "bg-gate-in-out", text: "text-indigo-900", border: "border-indigo-200" },
    "Delivered": { bg: "bg-delivered-rfc",text: "text-emerald-900",border: "border-teal-200" },
    "RFC":       { bg: "bg-delivered-rfc",   text: "text-teal-900",   border: "border-teal-200" },
    "Rejected":  { bg: "bg-red-100",    text: "text-red-900",    border: "border-red-200" },
    //"Deleted":  { bg: "bg-red-100",    text: "text-red-900",    border: "border-red-200" },
};

export function ALEConsigneeDashboard() {
    const navigate = useNavigate();
    const userName = localStorage.getItem("userName");
    const userId = localStorage.getItem("userId");
    const [bookings, setBookings] = useState([]);
    const [containers, setContainers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [companyName, setCompanyName] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userData = await getUserById(userId);
                const consigneeCode = userData?.companyCode;
                setCompanyName(userData?.companyName || "Consignee Corporation");

                if (consigneeCode) {
                    const allBookings = await getAleBookings();
                    const filteredBookings = allBookings?.filter(b => b.consigneeId === consigneeCode) || [];
                    setBookings(filteredBookings);
                    const allContainers = await getAleContainers();
                    const filteredContainers = allContainers?.filter(b => b.consigneeId === consigneeCode) || [];
                    setContainers(filteredContainers);
                }
            } catch (error) {
                console.error("Failed to sync dashboard structural context metrics:", error);
                toast.error("Failed to sync structural shipment pipelines.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [userId]);
    
    const metrics = useMemo(() => {
        return {
            enroute: containers.filter(c => c.enrouteTime !== null).length,
            rfc: containers.filter(c => c.rfcTime !== null).length,
            delivered: containers.filter(c => c.deliveredTime !== null).length,
            actionRequired: bookings.filter(b => !b.size || b.totalPackageQuantity).length
        };
    }, [containers]);
    
    const chartData = useMemo(() => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const counts = Array(12).fill(0);

        containers.forEach(c => {
            if (c.rotDate) {
                const monthIndex = new Date(c.rotDate).getMonth();
                counts[monthIndex]++;
            } else {
                counts[new Date().getMonth()]++;
            }
        });

        return months.map((m, i) => ({ name: m, value: counts[i] }));
    }, [bookings]);

    const recentArrivals = useMemo(() => {
        return [...containers].slice(0, 3);
    }, [containers]);

    if (isLoading) {
        return (
            <Layout role="consignee">
                <div className="flex items-center justify-center min-h-[400px]">
                    <p className="text-lg text-gray-500 font-medium">Synchronizing delivery dashboard profiles...</p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout role="consignee">
            <Toaster richColors position="top-right" />
            <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="bg-blue-100 p-3 rounded-xl text-system-color">
                        <UserCircle size={32} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Welcome Back, {userName}</h1>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-0.5">
                            <Building2 size={14} />
                            <span>{companyName}</span>
                            <span className="h-1 w-1 bg-gray-300 rounded-full"></span>
                            <span>Consignee Account</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl text-xs font-semibold text-gray-500 border border-gray-200/60 self-start md:self-auto">
                    <Calendar size={14} />
                    <span>{new Date().toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                <MetricCard
                    title="Enroute"
                    count={metrics.enroute}
                    icon={<Clock size={22} />}
                    colorClass="bg-blue-600"
                    bgColor="bg-blue-50/70"
                    textColor="text-blue-600"
                    desc="On the way to Terminal"
                />
                <MetricCard
                    title="Delivered"
                    count={metrics.delivered}
                    icon={<CheckCircle size={22} />}
                    colorClass="bg-emerald-600"
                    bgColor="bg-emerald-50/70"
                    textColor="text-emerald-600"
                    desc="Successfully delivered"
                />
                <MetricCard
                    title="Ready For Collection (RFC)"
                    count={metrics.rfc}
                    icon={<Package size={22} />}
                    colorClass="bg-amber-500"
                    bgColor="bg-amber-50/70"
                    textColor="text-amber-600"
                    desc="Ready to be collected"
                />
                <MetricCard
                    title="Action Required"
                    count={metrics.actionRequired}
                    icon={<AlertTriangle size={22} />}
                    colorClass="bg-rose-500"
                    bgColor="bg-rose-50/70"
                    textColor="text-rose-600"
                    desc="Pending booking info"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-3 space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-lg font-bold text-gray-800">Inbound Shipment</h2>
                                <p className="text-xs text-gray-400 mt-0.5">Your real-time active ROTs</p>
                            </div>
                            <button
                                onClick={() => navigate("/ale/consignee/rot/history")}
                                className="group flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
                            >
                                View All Shipments
                                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {recentArrivals.length > 0 ? (
                                recentArrivals.map((b, idx) => {
                                    const isDelivered = b.status === "Delivered";
                                    const isRFC = b.status === "RFC";
                                    const theme = STATUS_CONFIG[b.status] || {bg: "bg-gray-100", text: "text-gray-700"};

                                    return (
                                        <div key={idx} className="p-4 border border-gray-100 rounded-xl hover:border-gray-200 hover:shadow-sm transition-all bg-gray-50/40">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                                                <div>
                                                    <span className="text-xs font-black tracking-wider text-indigo-600 uppercase bg-indigo-50 px-2.5 py-1 rounded-md">
                                                        {b.rotNumber}
                                                    </span>
                                                    <span className="text-xs font-medium text-gray-400 ml-3">
                                                        AWB: {b.aleBooking.awbNumber}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide
                                                       ${theme.bg} ${theme.text}`}
                                                    >
                                                        {b.status}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-3 gap-2 mt-4 pt-2 border-t border-gray-100/70 text-center relative">
                                                <div className="text-left">
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase">Flight No.</p>
                                                    <p className="text-xs font-semibold text-gray-700 truncate">{b.aleBooking?.flightNumber}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase">Forwarding Agent</p>
                                                    <p className="text-xs font-semibold text-gray-700 truncate">{b.aleBooking?.forwarding?.companyName || "N/A"}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase">Packages</p>
                                                    <p className="text-xs font-semibold text-gray-700">{b.packageQuantity || 0} Pkgs</p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-center py-12 border border-dashed border-gray-200 rounded-xl">
                                    <Package className="text-gray-300 mx-auto mb-2" size={32} />
                                    <p className="text-sm text-gray-400 font-medium">No bookings created.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-gray-800 mb-1">Volume Logistics Matrix</h2>
                            <p className="text-xs text-gray-400 mb-6">Consignment volume mapping per calendar month</p>
                        </div>

                        <div className="h-[360px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f9fafb" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} />
                                    <Tooltip
                                        cursor={{ fill: '#f8fafc' }}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                                    />
                                    <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={20}>
                                        {chartData.map((entry, index) => {
                                            const currentMonth = index === new Date().getMonth();
                                            return <Cell key={`cell-${index}`} fill={currentMonth ? '#4f46e5' : '#c7d2fe'} />;
                                        })}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

            </div>
        </Layout>
    );
}

// Internal reusable functional interface card
const MetricCard = ({ title, count, icon, colorClass, bgColor, textColor, desc }) => (
    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-start justify-between gap-4">
        <div className="space-y-2">
            <p className="text-xs font-bold text-gray-900 uppercase tracking-wider">{title}</p>
            <h3 className="text-3xl font-black text-gray-800">{count}</h3>
            <p className="text-[11px] font-medium text-gray-400/90 truncate">{desc}</p>
        </div>
        <div className={`${bgColor} ${textColor} p-3 rounded-xl`}>
            {icon}
        </div>
    </div>
);
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../layout/Layout.jsx";
import {
    Truck,
    LogIn,
    LogOut,
    Timer,
    CheckCircle,
    AlertCircle,
    ArrowRightLeft,
    User
} from "lucide-react";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { getAllContainersByHaulier } from "../../../services/containerService.js";
import { getUserById } from "../../../services/userService.js";
import { toast } from "sonner";

export function ALEHaulierDashboard() {
    const navigate = useNavigate();
    const userName = localStorage.getItem("userName");
    const userId = localStorage.getItem("userId");

    const [containers, setContainers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userData = await getUserById(userId);
                const haulierId = userData?.companyCode;

                if (haulierId) {
                    const containerData = await getAllContainersByHaulier(haulierId);
                    setContainers(containerData || []);
                }
            } catch (error) {
                toast.error("Failed to sync fleet data");
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [userId]);

    // Metric Calculations
    const stats = useMemo(() => {
        let totalTurnAround = 0;
        let tatCount = 0;
        let activeCount = 0;
        let inDepotCount = 0;
        let completedTodayCount = 0;
        let currentWeekTAT = [];
        let previousWeekTAT = [];
        const now = new Date();
        const today = now.toDateString();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

        containers.forEach(c => {
            const status = c.status || "";
            const statusLower = status.toLowerCase();

            if (["enroute", "gatedin", "gatedout"].includes(statusLower)) activeCount++;
            if (statusLower === "gatedin") inDepotCount++;
            if (status === "Completed" && c.deliveredTime) {
                if (new Date(c.deliveredTime).toDateString() === today) completedTodayCount++;
            }
            if (c.turnAroundTime > 0) {
                totalTurnAround += c.turnAroundTime;
                tatCount++;
            }
            if (c.turnAroundTime > 0 && c.deliveredTime) {
                const deliveryDate = new Date(c.deliveredTime);
                if (deliveryDate >= oneWeekAgo) {
                    currentWeekTAT.push(c.turnAroundTime);
                } else if (deliveryDate >= twoWeeksAgo && deliveryDate < oneWeekAgo) {
                    previousWeekTAT.push(c.turnAroundTime);
                }
            }
        });

        const currentAvg = currentWeekTAT.length > 0
            ? currentWeekTAT.reduce((a, b) => a + b, 0) / currentWeekTAT.length
            : 0;

        const previousAvg = previousWeekTAT.length > 0
            ? previousWeekTAT.reduce((a, b) => a + b, 0) / previousWeekTAT.length
            : 0;

        let efficiencyGap = 0;
        if (previousAvg > 0) efficiencyGap = ((previousAvg - currentAvg) / previousAvg) * 100;

        const result = {
            totalActive: activeCount,
            inDepot: inDepotCount,
            completedToday: completedTodayCount,
            avgTat: tatCount > 0 ? (totalTurnAround / tatCount).toFixed(1) : "0.0",
            efficiency: Math.abs(efficiencyGap).toFixed(1),
            isImproving: efficiencyGap >= 0,
        };
        return result;
    }, [containers]);

    const StatCard = ({ title, value, icon: Icon, color, subtext }) => (
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
            <div className={`absolute right-0 top-0 h-full w-1 ${color}`} />
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{title}</p>
                    <h3 className="text-3xl font-black mt-2 text-gray-800">{value}</h3>
                    <p className="text-[10px] text-gray-500 mt-1 font-medium">{subtext}</p>
                </div>
                <div className={`p-3 rounded-xl bg-gray-50 group-hover:scale-110 transition-transform`}>
                    <Icon size={24} className={color.replace('bg-', 'text-')} />
                </div>
            </div>
        </div>
    );

    const chartData = useMemo(() => {
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const counts = {
            Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0
        };

        containers.forEach(cont => {
            if (!cont.gatedInTime) return;
            const date = new Date(cont.gatedInTime);
            const dayName = days[date.getDay() === 0 ? 6 : date.getDay() - 1]; 

            if (counts[dayName] !== undefined) {
                counts[dayName]++;
            }
        });

        return days.map(day => ({
            name: day,
            value: counts[day]
        }));
    }, [containers]);

    return (
        <Layout role="haulier">
            <div className="p-6 space-y-8 max-w-7xl mx-auto">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="h-14 w-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
                            <Truck size={30} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-gray-800">Fleet Operations</h1>
                            <p className="text-gray-500 text-sm font-medium">Monitoring {stats.totalActive} active containers across the network.</p>
                        </div>
                    </div>
                    {/*<div className="flex gap-2">*/}
                    {/*    <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-gray-50 transition-colors">*/}
                    {/*        <ArrowRightLeft size={16} /> Gate Logs*/}
                    {/*    </button>*/}
                    {/*</div>*/}
                </div>

                {/* Logistics Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Live Fleet"
                        value={stats.totalActive}
                        icon={Truck}
                        color="bg-blue-600"
                        subtext="Containers on road"
                    />
                    <StatCard
                        title="Gate In"
                        value={stats.inDepot}
                        icon={LogIn}
                        color="bg-amber-500"
                        subtext="Currently at Depot"
                    />
                    <StatCard
                        title="Avg TAT"
                        value={`${stats.avgTat}h`}
                        icon={Timer}
                        color="bg-purple-600"
                        subtext="Turn Around Time"
                    />
                    <StatCard
                        title="Delivered"
                        value={stats.completedToday}
                        icon={CheckCircle}
                        color="bg-emerald-500"
                        subtext="Completed Today"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* TAT Performance Graph */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-lg font-bold text-gray-800">Performance Efficiency</h3>
                            <div className="flex gap-2">
                                <span className={`flex items-center gap-1 text-xs font-bold ${stats.isImproving ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50'} px-2 py-1 rounded-md`}>
                                   {stats.isImproving ? `+${stats.efficiency}%` : `${stats.efficiency}%`} Efficiency
                                </span>
                            </div>
                        </div>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 600}} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                                    <Tooltip />
                                    <Area type="monotone" dataKey="value" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Critical Alerts / Priority Movement */}
                    <div className="bg-gray-900 rounded-3xl p-6 text-white shadow-xl">
                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                            <AlertCircle size={20} className="text-amber-400" /> Critical Gate Alerts
                        </h3>
                        <div className="space-y-4">
                            {containers.filter(c => c.timeStatus === "Urgent").slice(0, 4).map((c, i) => (
                                <div key={i} className="bg-white/10 p-4 rounded-2xl border border-white/5 hover:bg-white/20 transition-all cursor-pointer">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-[10px] font-black uppercase bg-amber-500 text-black px-2 py-0.5 rounded">Urgent</span>
                                        <span className="text-[10px] text-gray-400 font-bold">{c.containerNumber}</span>
                                    </div>
                                    <p className="text-sm font-bold truncate">{c.booking?.blOrBookingNumber}</p>
                                    <div className="flex items-center gap-2 mt-3 text-[11px] text-gray-300 font-medium">
                                        <Timer size={14} /> Delayed in Gate: {c.turnAroundTime} mins
                                    </div>
                                </div>
                            ))}
                            {containers.filter(c => c.timeStatus === "Urgent").length === 0 && (
                                <div className="text-center py-10">
                                    <div className="bg-white/5 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <CheckCircle className="text-emerald-400" size={24} />
                                    </div>
                                    <p className="text-xs text-gray-400">All fleet movements are within TAT limits.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
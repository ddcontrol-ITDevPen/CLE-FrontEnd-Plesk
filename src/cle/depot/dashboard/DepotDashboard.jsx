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
    CalendarCheck,
    TrendingUp,
    Hourglass,
    Activity,
    Layers
} from "lucide-react";
import {
    ComposedChart,
    BarChart,
    LineChart,
    AreaChart,
    Bar,
    Line,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import { getAllContainersByDepot } from "../../../services/containerService.js";
import { getUserById } from "../../../services/userService.js";
import { toast } from "sonner";

export function DepotDashboard() {
    const navigate = useNavigate();
    const userName = localStorage.getItem("userName");
    const userId = localStorage.getItem("userId");

    const [containers, setContainers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userData = await getUserById(userId);
                const depotId = userData?.companyCode;

                if (depotId) {
                    const containerData = await getAllContainersByDepot(depotId);
                    setContainers(containerData || []);
                }
            } catch (error) {
                toast.error("Failed to sync depot metrics");
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [userId]);

    // Live Yard & Operational Metrics State Calculations (Mapped to your 7 operational statuses)
    const stats = useMemo(() => {
        let totalTurnAround = 0;
        let tatCount = 0;
        let activeCount = 0;
        let inDepotCount = 0;
        let completedTodayCount = 0;

        containers.forEach(c => {
            const status = c.status || "";
            const statusLower = status.toLowerCase().trim();

            // 1. Active Fleet: Containers actively moving or being processed inside the cycle
            if (["assigned", "enroute", "accepted", "gate-in", "gate-out"].includes(statusLower)) {
                activeCount++;
            }

            // 2. Yard Inventory: Containers currently situated inside the physical depot borders
            if (statusLower === "gate-in" || statusLower === "accepted") {
                inDepotCount++;
            }

            // 3. Gate Outflows / Completed Today: Units handed over or finalized today
            if (["delivered", "rfc", "gate-out"].includes(statusLower)) {
                const checkDate = c.deliveredTime || c.updatedAt;
                if (checkDate) {
                    const todayStr = new Date().toDateString();
                    if (new Date(checkDate).toDateString() === todayStr) {
                        completedTodayCount++;
                    }
                }
            }

            // 4. SLA Processing Turnaround Time
            if (c.turnAroundTime > 0) {
                totalTurnAround += c.turnAroundTime;
                tatCount++;
            }
        });

        return {
            totalActive: activeCount,
            inDepot: inDepotCount,
            completedToday: completedTodayCount,
            avgTat: tatCount > 0 ? (totalTurnAround / tatCount).toFixed(1) : "0.0"
        };
    }, [containers]);

    // 1. Appointment Compliance Data (Early vs On-Time vs After Target Matrix)
    const appointmentComplianceData = useMemo(() => {
        return [
            { month: 'Jan', onTime: 8171, early: 3247, late: 11220 },
            { month: 'Feb', onTime: 9123, early: 5668, late: 12286 },
            { month: 'Mar', onTime: 9170, early: 8472, late: 11048 },
            { month: 'Apr', onTime: 9473, early: 9360, late: 12117 },
            { month: 'May', onTime: 8487, early: 7548, late: 11114 },
            { month: 'Jun', onTime: 8826, early: 7226, late: 11756 }
        ];
    }, []);

    // 2. Appointment Time Trend Data (24-Hour Timeline Flow Peak)
    const appointmentTrendData = [
        { hour: '06:00 AM', volume: 50 },
        { hour: '08:00 AM', volume: 1200 },
        { hour: '10:00 AM', volume: 2850 },
        { hour: '12:00 PM', volume: 1900 },
        { hour: '01:00 PM', volume: 800 },
        { hour: '02:00 PM', volume: 3050 },
        { hour: '04:00 PM', volume: 2400 },
        { hour: '06:00 PM', volume: 1350 },
        { hour: '08:00 PM', volume: 900 },
        { hour: '10:00 PM', volume: 300 }
    ];

    // 3. Truck Turn Around Time Data (Total Gates vs Percent Under SLA < 45 Mins)
    const truckTatData = useMemo(() => {
        return [
            { month: 'Jan', totalMovements: 22638, cleanTatPct: 95 },
            { month: 'Feb', totalMovements: 27077, cleanTatPct: 96 },
            { month: 'Mar', totalMovements: 28690, cleanTatPct: 95 },
            { month: 'Apr', totalMovements: 30950, cleanTatPct: 95 },
            { month: 'May', totalMovements: 27149, cleanTatPct: 96 },
            { month: 'Jun', totalMovements: 27808, cleanTatPct: 96 }
        ];
    }, []);

    // 4. Container Dwell Time Data (Average days in yard with daily trajectory adjustments)
    const containerDwellData = [
        { day: '01 Jul', avgDays: 5.4, thresholdTarget: 6.0 },
        { day: '02 Jul', avgDays: 5.8, thresholdTarget: 6.0 },
        { day: '03 Jul', avgDays: 6.2, thresholdTarget: 6.0 },
        { day: '04 Jul', avgDays: 6.1, thresholdTarget: 6.0 },
        { day: '05 Jul', avgDays: 5.7, thresholdTarget: 6.0 },
        { day: '06 Jul', avgDays: 5.2, thresholdTarget: 6.0 },
        { day: '07 Jul', avgDays: 4.9, thresholdTarget: 6.0 }
    ];

    // 5. Gate Movements Per Hour Data (Aggregated Inbound vs Outbound Activities)
    const gateHourlyMovementData = [
        { hour: '07:00', gateIn: 120, gateOut: 95 },
        { hour: '09:00', gateIn: 450, gateOut: 380 },
        { hour: '11:00', gateIn: 580, gateOut: 610 },
        { hour: '13:00', gateIn: 210, gateOut: 340 },
        { hour: '15:00', gateIn: 640, gateOut: 590 },
        { hour: '17:00', gateIn: 410, gateOut: 520 },
        { hour: '19:00', gateIn: 180, gateOut: 260 },
        { hour: '21:00', gateIn: 90,  gateOut: 140 }
    ];

    const StatCard = ({ title, value, icon: Icon, color, subtext }) => (
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
            <div className={`absolute right-0 top-0 h-full w-1 ${color}`} />
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{title}</p>
                    <h3 className="text-3xl font-black mt-2 text-gray-800">{value}</h3>
                    <p className="text-[10px] text-gray-500 mt-1 font-medium">{subtext}</p>
                </div>
                <div className="p-3 rounded-xl bg-gray-50 group-hover:scale-110 transition-transform">
                    <Icon size={24} className={color.replace('bg-', 'text-')} />
                </div>
            </div>
        </div>
    );

    return (
        <Layout role="depot">
            <div className="p-6 space-y-8 max-w-7xl mx-auto">

                {/* Dashboard Header Banner */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="h-14 w-14 bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg">
                            <Layers size={30} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-gray-800">Depot Terminal Hub</h1>
                            <p className="text-gray-500 text-sm font-medium">Real-time gate processing capacities and inventory storage efficiency trackers.</p>
                        </div>
                    </div>
                </div>

                {/* Core KPI Metrics Strip */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Yard Inventory"
                        value={stats.inDepot}
                        icon={Layers}
                        color="bg-indigo-600"
                        subtext="Containers currently Accepted / Gate-In"
                    />
                    <StatCard
                        title="Active Fleet"
                        value={stats.totalActive}
                        icon={Truck}
                        color="bg-blue-600"
                        subtext="Connected logistics transits"
                    />
                    <StatCard
                        title="Terminal TAT"
                        value={`${stats.avgTat}m`}
                        icon={Timer}
                        color="bg-purple-600"
                        subtext="Gate processing average"
                    />
                    <StatCard
                        title="Gate Outflows"
                        value={stats.completedToday}
                        icon={CheckCircle}
                        color="bg-emerald-500"
                        subtext="Gate-Out / Delivered jobs today"
                    />
                </div>

                {/* Analytics Graphical Visualizations Layout Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* 1. Appointment Compliance Report */}
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                        <div className="mb-4">
                            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <CalendarCheck size={18} className="text-indigo-600" /> Appointment Compliance
                            </h3>
                            <p className="text-xs text-gray-400">Punctuality tracking metrics against allocated customer arrival slots</p>
                        </div>
                        <div className="h-[280px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={appointmentComplianceData}>
                                    <CartesianGrid stroke="#f8fafc" strokeDasharray="3 3" />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 11, fontWeight: 500}} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11}} />
                                    <Tooltip />
                                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                                    <Line type="monotone" dataKey="early" name="Early Bookings" stroke="#60a5fa" strokeWidth={2} />
                                    <Line type="monotone" dataKey="onTime" name="On Time Matrix" stroke="#4f46e5" strokeWidth={2.5} />
                                    <Line type="monotone" dataKey="late" name="After Appt Slot" stroke="#f59e0b" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* 2. Appointment Time Trend */}
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                        <div className="mb-4">
                            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <TrendingUp size={18} className="text-pink-600" /> Appointment Time Trends
                            </h3>
                            <p className="text-xs text-gray-400">Diurnal density profiling of booked yard pickups and drop-offs</p>
                        </div>
                        <div className="h-[280px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={appointmentTrendData}>
                                    <defs>
                                        <linearGradient id="depotApptGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ec4899" stopOpacity={0.15}/>
                                            <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid stroke="#f8fafc" vertical={false} />
                                    <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 500}} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11}} />
                                    <Tooltip />
                                    <Area type="monotone" dataKey="volume" name="Scheduled Units" stroke="#ec4899" fillOpacity={1} fill="url(#depotApptGrad)" strokeWidth={2.5} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* 3. Truck Turn Around Time */}
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                        <div className="mb-4">
                            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <Activity size={18} className="text-emerald-600" /> Truck Turn Around Time (TAT)
                            </h3>
                            <p className="text-xs text-gray-400">Total gate visits against efficiency goals under 45-minute milestones</p>
                        </div>
                        <div className="h-[280px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={truckTatData}>
                                    <CartesianGrid stroke="#f8fafc" vertical={false} />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 11, fontWeight: 500}} />
                                    <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fontSize: 11}} />
                                    <YAxis yAxisId="right" orientation="right" domain={[85, 100]} axisLine={false} tickLine={false} tick={{fontSize: 11}} unit="%" />
                                    <Tooltip />
                                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                                    <Bar yAxisId="left" dataKey="totalMovements" name="Total Gate Crossings" fill="#10b981" radius={[4, 4, 0, 0]} barSize={30} />
                                    <Line yAxisId="right" type="monotone" dataKey="cleanTatPct" name="% SLA Achieved (&lt;45m)" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* 4. Container Dwell Time - Average & Trajectory Dynamics */}
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                        <div className="mb-4">
                            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <Hourglass size={18} className="text-amber-500" /> Container Dwell - Average
                            </h3>
                            <p className="text-xs text-gray-400">Everyday changes in how long containers remain staged in the depot</p>
                        </div>
                        <div className="h-[280px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={containerDwellData}>
                                    <CartesianGrid stroke="#f8fafc" strokeDasharray="3 3" />
                                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 11, fontWeight: 500}} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11}} label={{ value: 'Days', angle: -90, position: 'insideLeft', fontSize: 11 }} />
                                    <Tooltip />
                                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                                    <Bar dataKey="avgDays" name="Average Yard Age" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={25} />
                                    <Line type="monotone" dataKey="thresholdTarget" name="SLA Target Max" stroke="#ef4444" strokeDasharray="4 4" strokeWidth={2} dot={false} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* 5. Gate Movements Per Hour */}
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm lg:col-span-2">
                        <div className="mb-4">
                            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <Truck size={18} className="text-blue-600" /> Gate Movement Per Hour
                            </h3>
                            <p className="text-xs text-gray-400">Inbound (Gate In) vs Outbound (Gate Out) hourly operational capacity breakdowns</p>
                        </div>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={gateHourlyMovementData}>
                                    <CartesianGrid stroke="#f8fafc" vertical={false} />
                                    <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{fontSize: 11, fontWeight: 500}} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11}} />
                                    <Tooltip />
                                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                                    <Bar dataKey="gateIn" name="Gate-In Activity" fill="#2563eb" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="gateOut" name="Gate-Out Activity" fill="#60a5fa" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                </div>

                {/* Live Urgent Alert Desk */}
                <div className="bg-gray-900 rounded-3xl p-6 text-white shadow-xl">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <AlertCircle size={20} className="text-amber-400" /> Operational Exceptions Logs
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {containers.filter(c => c.timeStatus === "Urgent").slice(0, 4).map((c, i) => (
                            <div key={i} className="bg-white/10 p-4 rounded-2xl border border-white/5 hover:bg-white/20 transition-all cursor-pointer">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-[10px] font-black uppercase bg-amber-500 text-black px-2 py-0.5 rounded">SLA Warning</span>
                                    <span className="text-[10px] text-gray-400 font-bold">{c.containerNumber}</span>
                                </div>
                                <p className="text-sm font-bold truncate">{c.booking?.blOrBookingNumber || 'No Booking Ref'}</p>
                                <div className="flex items-center gap-2 mt-3 text-[11px] text-gray-300 font-medium">
                                    <Timer size={14} /> Total Dwell Time Exceeded
                                </div>
                            </div>
                        ))}
                        {containers.filter(c => c.timeStatus === "Urgent").length === 0 && (
                            <div className="text-center py-6 col-span-full">
                                <div className="bg-white/5 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <CheckCircle className="text-emerald-400" size={24} />
                                </div>
                                <p className="text-xs text-gray-400">All container checkpoints are reporting safe workflow margins.</p>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </Layout>
    );
}
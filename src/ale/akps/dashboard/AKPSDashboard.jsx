import React, {useState, useEffect, useMemo} from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../layout/Layout.jsx";
import {
    LayoutDashboard,
    PlusCircle,
    Truck,
    ClipboardCheck,
    Clock,
    History,
    ArrowUpRight,
    UserCircle,
    List, UserCheck, CheckCircle2, LogOut
} from "lucide-react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import {getAleContainers, getAllAleContainersByForwarding} from "../../../services/aleContainerService.js";
import {toast} from "sonner";
import {getUserById} from "../../../services/userService.js";
import {getAleContainerAudits} from "../../../services/aleContainerAuditService.js";


export function AKPSDashboard() {
    const navigate = useNavigate();
    const userName = localStorage.getItem("userName");
    const userId = localStorage.getItem("userId");
    const [bookings, setBookings] = useState([]);
    const [containers, setContainers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [chartView, setChartView] = useState("Weekly");
    const recentContainers = [...containers]
        .sort((a, b) => new Date(b.assignedTime) - new Date(a.assignedTime))
        .slice(0, 3);

    const chartData = useMemo(() => {
        if (chartView === "Weekly") {
            // Weekly Logic (Mon-Sun)
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const counts = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };

            containers.forEach(cont => {
                if (!cont.assignedTime) return;
                const dayName = days[new Date(cont.assignedTime).getDay()];
                if (counts[dayName] !== undefined) counts[dayName]++;
            });

            return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => ({
                name: day,
                value: counts[day]
            }));
        } else {
            // Monthly Logic (Jan-Dec)
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const counts = {};
            months.forEach(m => counts[m] = 0);

            containers.forEach(cont => {
                if (!cont.assignedTime) return;
                const monthName = months[new Date(cont.assignedTime).getMonth()];
                counts[monthName]++;
            });

            return months.map(month => ({
                name: month,
                value: counts[month]
            }));
        }
    }, [containers, chartView]);

    useEffect( () => {
        if (!userId) {
            console.error("No user ID found, redirecting...");
            navigate("/login");
            return;
        }

        const fetchData = async () => {
            setIsLoading(true);
            try {
                // 1. Identify the current user's audit signature
                const userData = await getUserById(userId);
                const updatedByString = `${userData.fullName} - ${userData.companyName}`;

                // 2. Fetch general datasets
                // We fetch all audits to find which items this specific user has updated
                const [allContainers, allAudits] = await Promise.all([
                    getAleContainers(),
                    getAleContainerAudits()
                ]);

                // 3. Filter Audits for the current user
                const myAudits = allAudits.filter(audit => audit.updatedBy === updatedByString);

                // Create a Set of unique containerIds and bookingIds the user has worked on
                const myAuditedContainerIds = new Set(myAudits.map(a => a.containerId));
                const myAuditedBookingIds = new Set(myAudits.map(a => a.bookingId));

                // 4. Filter Containers and Bookings based on the Audit matches
                const filteredContainers = allContainers.filter(cont =>
                    myAuditedContainerIds.has(cont.containerId)
                );

                // If you need the bookings list to also reflect only user-audited items:
                // This assumes containers have a nested booking object or you'd need a getBookings service
                const filteredBookings = filteredContainers.map(c => c.booking).filter(Boolean);

                // Remove duplicates from the booking list
                const uniqueBookings = Array.from(new Map(filteredBookings.map(b => [b.bookingId, b])).values());

                // 5. Update GUI State
                setContainers(filteredContainers);
                setBookings(uniqueBookings);

            } catch (error) {
                console.error("AKPS Dashboard Fetch Error:", error);
                toast.error("Failed to load your specific dashboard data");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [userId, navigate]);

    const StatCard = ({ title, value, icon: Icon, colorClass, borderClass }) => (
        <div className={`bg-white p-6 rounded-xl shadow-sm border-l-4 ${borderClass} flex justify-between items-start hover:shadow-md transition-shadow`}>
            <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</p>
                <h3 className="text-2xl font-bold mt-1 text-gray-800">{value}</h3>
            </div>
            <div className={`p-3 ml-1 rounded-lg ${colorClass}`}>
                <Icon size={24} className="text-white" />
            </div>
        </div>
    );

    return (
        <Layout role="akps">
            <div className="p-6 space-y-8 max-w-7xl mx-auto">

                {/* Greeting Section */}
                <div className="flex items-center gap-4">
                    <div className="bg-blue-100 p-3 rounded-full">
                        <UserCircle size={40} className="text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Welcome back, {userName}!</h1>
                        <p className="text-gray-500 text-sm">Here is what's happening with your bookings today.</p>
                    </div>
                </div>

                {/* Stat Cards - Bright Left Border Style */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Enroute"
                        value={containers.filter(c => c.enrouteTime !== null).length}
                        icon={Truck}
                        colorClass="bg-orange-600"
                        borderClass="border-orange-600"
                    />
                    <StatCard
                        title="Approved-AKPS"
                        value={containers.filter(c => c.approvedAKPSTime !== null).length}
                        icon={UserCheck}
                        colorClass="bg-amber-500"
                        borderClass="border-amber-500"
                    />
                    <StatCard
                        title="Approved-Complete"
                        value={containers.filter(c => c.approvedBothTime !== null).length}
                        icon={CheckCircle2}
                        colorClass="bg-indigo-500"
                        borderClass="border-indigo-500"
                    />
                    <StatCard
                        title="Gate-Out"
                        value={containers.filter(c => c.gatedOutTime !== null).length}
                        icon={LogOut}
                        colorClass="bg-emerald-500"
                        borderClass="border-emerald-500"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Quick Actions & Recent History */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <PlusCircle size={20} className="text-blue-600" /> Quick Actions
                            </h3>
                            <button
                                onClick={() => navigate("/akps/bookinglist")}
                                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02]"
                            >
                                <List size={22} />
                                Booking List
                            </button>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold flex items-center gap-2">
                                    <History size={20} className="text-gray-600" /> Recent Activity
                                </h3>
                                <button className="text-system-color text-xs font-bold hover:underline" onClick={() => navigate("/akps/bookinglist")}>View All</button>
                            </div>
                            <div className="space-y-4">
                                {isLoading ? (
                                    <p className="text-sm text-gray-400 text-center py-4">Loading...</p>
                                ) : recentContainers.length > 0 ? (
                                    recentContainers.map((cont) => (
                                        <div
                                            key={cont.containerId}
                                            onClick={() => navigate(`/ale/akps/booking/bookingdetails/${cont.containerId}`)}
                                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg group cursor-pointer hover:bg-gray-100 transition-colors"
                                        >
                                            <div className="overflow-hidden">
                                                <p className="text-sm font-bold text-gray-700 truncate">
                                                    {cont.aleBooking.awbNumber || "No AWB Number"}
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    {cont.assignedTime ? new Date(cont.assignedTime).toLocaleDateString() : 'Just now'}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                                                    cont.status === 'Assigned' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-system-color'
                                                }`}>
                                                    {cont.status}
                                                </span>
                                                <ArrowUpRight size={16} className="text-gray-300 group-hover:text-blue-500 transition-colors" />
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-6">
                                        <p className="text-sm text-gray-400 italic">No recent activity found.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Shipment Trend Graph */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-lg font-bold">Shipment Volume</h3>
                                <p className="text-sm text-gray-400">Total containers moved {chartView === "Weekly" ? "this week" : "this year"}</p>
                            </div>
                            <select value={chartView} onChange={(e) => setChartView(e.target.value)} className="text-xs border-none bg-gray-100 p-2 rounded-lg font-semibold outline-none cursor-pointer">
                                <option>Weekly</option>
                                <option>Monthly</option>
                            </select>
                        </div>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} />
                                    <Tooltip
                                        cursor={{fill: '#f3f4f6'}}
                                        contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                                    />
                                    <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={chartView === "Weekly" ? 40 : 25}>
                                        {chartData.map((entry, index) => {
                                            const isCurrent = chartView === "Weekly"
                                                ? index === (new Date().getDay() === 0 ? 6 : new Date().getDay() - 1)
                                                : index === new Date().getMonth();
                                            return <Cell key={`cell-${index}`} fill={isCurrent ? '#2563eb' : '#93c5fd'} />
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
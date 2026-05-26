import { Link, useLocation, useNavigate } from "react-router-dom";
import {
    LucideArchive,
    LucideArchiveX, LucideClipboardCheck, LucideClipboardClock, LucideFile, LucideFileInput,
    LucideHistory,
    LucideHome,
    LucideLogOut,
    LucideMapPinned, LucidePlaneLanding, LucidePlaneTakeoff,
    LucideTruck, LucideUserCheck
} from "lucide-react";
import {logout} from "../../services/authService.js";
import {useEffect, useState} from "react";
import {getAleBookings} from "../../services/aleBookingService.js";
import {getUserById} from "../../services/userService.js";

export default function ForwardingNavBar({ role = "forwarder" }) {
    const location = useLocation();
    const navigate = useNavigate();
    const [assignedCount, setAssignedCount] = useState(0);

    useEffect(() => {
        const fetchAssignedCount = async () => {
            try {
                const userId = localStorage.getItem("userId");
                if (!userId) return;

                const user = await getUserById(userId);
                const forwardingAgentId = user?.companyCode;

                if (forwardingAgentId) {
                    const data = await getAleBookings();
                    const count = data.filter(b =>
                        b.forwardingId === forwardingAgentId &&
                        (b.billingParty === null || b.billingParty === "") &&
                        b.airlineId === null
                    ).length;
                    setAssignedCount(count);
                }
            } catch (error) {
                console.error("Failed to fetch assigned booking count for navbar badge", error);
            }
        };
        fetchAssignedCount();
        }, []);

    const handleLogout = async () => {
        await logout();
    };

    const menuItems = [
        { icon: LucideHome, label: "Dashboard", path: "/ale/forwarding/dashboard" },
        { icon: LucidePlaneTakeoff, label: "Create ROT", path: "/ale/forwarding/rot/add/form1" },
        { icon: LucideFileInput, label: "Assigned Booking", path: "/ale/forwarding/booking/new", badgeCount: assignedCount },
        { icon: LucideHistory, label: "Your ROTs", path: "/ale/forwarding/rot/history" },
        { icon: LucideArchive, label: "Archived ROTs", path: "/ale/forwarding/rot/archived" },
        { icon: LucideMapPinned, label: "Track & Trace", path: "/ale/rot/track" },
        // { icon: LucideFile, label: "View Document", path: "/ale/forwarding/rot/document/view" },
    ];

    return (
        <aside className="bg-system-color w-64 min-h-screen flex flex-col shadow-xl">
            {/* Logo/Brand */}
            <div className="p-1 border-system-color-hover flex justify-center items-center mt-3">
                <Link to={`/ale/${role === "forwarder" ? "forwarding" : role}/dashboard`} className="flex items-center gap-3">
                    {<img src="/assets/ALE-Logo-White.png" alt="ALE Logo" className="w-45 h-auto content-center" />}
                </Link>
            </div>

            {/* Navigation Menu */}
            <nav className="flex-1 px-4 py-6">
                <ul className="space-y-2">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;

                        return (
                            <li key={item.path}>
                                <Link
                                    to={item.path}
                                    className={`
                                        flex items-center gap-3 px-4 py-3 rounded-lg
                                        transition-all duration-200 font-semibold text-lg
                                        ${isActive
                                        ? 'bg-white bg-opacity-10 text-system-color'
                                        : 'text-white text-opacity-80 bg-system-color hover:bg-system-color-dark hover:text-white hover:text-xl'
                                    }
                  `                 }
                                >
                                    <Icon size={25} />
                                    <span>{item.label}</span>
                                    {item.badgeCount > 0 && (
                                        <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-accent-danger px-1.5 text-[14px] font-black text-red-100 shadow-sm ring-2 ring-system-color group-hover:scale-110 transition-transform">
                                            {item.badgeCount}
                                        </span>
                                    )}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Logout Section */}
            <div className="p-4 mt-auto">
                <button
                    onClick={handleLogout}
                    className="flex w-full mb-35 items-center gap-3 px-4 py-3 rounded-xl bg-white text-system-color font-semibold text-lg hover:text-accent-danger transition-all cursor-pointer"
                >
                    <LucideLogOut size={20} />
                    <span>Logout</span>
                </button>
            </div>

        </aside>
    );
}
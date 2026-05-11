import { Link, useLocation, useNavigate } from "react-router-dom";
import {
    LucideArchive,
    LucideArchiveX, LucideBolt, LucideClipboardCheck, LucideClipboardClock, LucideFile,
    LucideHistory,
    LucideHome,
    LucideLogOut,
    LucideMapPinned,
    LucideTruck, LucideUserCheck
} from "lucide-react";
import {logout} from "../../services/authService.js";

export default function DepotNavBar({ role = "haulier" }) {
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
    };

    const menuItems = [
        { icon: LucideHome, label: "Dashboard", path: "/depot/dashboard" },
        { icon: LucideTruck, label: "Create Booking", path: "/depot/booking/add/form1" },
        { icon: LucideClipboardClock, label: "Your ROTs", path: "/depot/booking" },
        { icon: LucideMapPinned, label: "Track & Trace", path: "/rot/track" },
        { icon: LucideBolt, label: "Haulier Management", path: "/depot/management/configure" },
    ];

    return (
        <aside className="bg-system-color w-64 min-h-screen flex flex-col shadow-xl">
            {/* Logo/Brand */}
            <div className="p-1 border-system-color-hover flex justify-center items-center mt-3">
                <Link to={`/${role === "forwarder" ? "forwarding" : role}/dashboard`} className="flex items-center gap-3">
                    {<img src="/assets/CLE-Logo-White.png" alt="CLE Logo" className="w-45 h-auto content-center" />}
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
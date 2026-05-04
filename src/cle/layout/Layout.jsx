import { useNavigate } from "react-router-dom";
import {FaArrowRightFromBracket, FaArrowsRotate, FaCircleUser, FaGear, FaRightFromBracket} from "react-icons/fa6";
import {useContext, useEffect, useRef, useState} from "react";
import cle_logo from "../../../public/assets/CLE-Logo.png";
import ForwarderNavBar from "../NavBar/ForwarderNavBar.jsx";
import {Icon, LucideCircleUser, LucideLogOut, LucideRotateCcw, LucideShoppingCart, LucideUsers} from "lucide-react";
import {FaCartPlus} from "react-icons/fa";
import {logout} from "../../services/authService.js";
import HaulierNavBar from "../NavBar/HaulierNavbar.jsx";

export default function Layout({ children, role }) {

    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const storedName = localStorage.getItem("userName");
        const storedId = localStorage.getItem("userId");
        const storedRole = localStorage.getItem("role");

        if (storedId) {
            setUser({
                FullName: storedName,
                UserId: storedId,
                Role: storedRole.toLowerCase(),
            });
        }
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = async() => {
        await logout();
    };

    const userInitial = (user?.FullName || "U")[0].toUpperCase();
    
    return (
        <div className="flex min-h-screen bg-main">
            <div className={`fixed left-0 top-0 h-full z-20 transition-all duration-300 ease-in-out w-64 shadow-lg
                            transform -translate-x-full lg:translate-x-0 lg:block`}>
                {/* Sidebar */}
                {user?.Role === "forwarding" && <ForwarderNavBar />}
                {user?.Role === "haulier" && <HaulierNavBar />}
                {/*other roles*/}
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 ml-0 lg:ml-64 transition-all duration-300 ease-in-out">
                {/* Top Bar */}
                <header className="sticky top-0 z-10 bg-white px-8 py-4 shadow-md w-full">
                    <div className="flex justify-end items-center gap-3 lg:justify-end">
                        <div className="text-right">
                            <p className="text-heading font-semibold text-system-color text-md">
                                {user?.Role === "forwarding"
                                    ? `${user?.FullName || "Forwarding"}`
                                    : localStorage.getItem("userName") || "User"}
                            </p>
                            <p className="text-system-color/80 text-xs font-regular capitalize">{user?.Role}</p>
                        </div>
                        {/*<div className="flex justify-end items-center gap-3 pl-5 lg:justify-end">*/}
                        {/*    <button className="text-center w-full font-semibold text-white bg-system-color rounded-lg px-4 py-1.5 cursor-pointer">*/}
                        {/*        e-Assure*/}
                        {/*    </button>*/}
                        {/*</div>*/}
                        <div className="flex justify-end items-center ml-5 gap-6 px-3 lg:justify-end">
                            <button className="cursor-pointer" onClick={"/"}>
                                <FaCartPlus className="text-system-color size-7"></FaCartPlus>
                            </button>
                            <button className="cursor-pointer" onClick={"/"}>
                                <FaGear className="text-system-color size-7"></FaGear>
                            </button>
                            {/*<button className="cursor-pointer" onClick={"/"}>*/}
                            {/*    <FaCircleUser className="text-system-color size-7"></FaCircleUser>*/}
                            {/*</button>*/}
                        </div>
                        <div className="relative" ref={dropdownRef}>
                        <button
                            className="w-10 h-10 rounded-full bg-system-color text-text-on-dark
                      flex items-center justify-center font-semibold cursor-pointer"
                            onClick={(() => setIsDropdownOpen(!isDropdownOpen))}
                        >
                            {userInitial}
                        </button>
                            {isDropdownOpen && (
                                <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 transform origin-top-right transition-all">
                                    <div className="px-4 py-3 border-b border-gray-50">
                                        <p className="text-sm font-bold text-gray-800 truncate">{user?.FullName}</p>
                                        <p className="text-[11px] text-gray-500 truncate">{user?.UserId}</p>
                                    </div>

                                    <button
                                        onClick={() => { navigate("/forwarding/profile"); setIsDropdownOpen(false); }}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 hover:text-system-color transition-colors"
                                    >
                                        <LucideUsers className="size-4" /> Profile
                                    </button>

                                    <button
                                        onClick={() => { navigate("/forwarding/userManagement"); setIsDropdownOpen(false); }}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 hover:text-system-color transition-colors"
                                    >
                                        <LucideCircleUser className="size-4" /> Employee Management
                                    </button>

                                    <button
                                        onClick={() => { /* logic to switch role */ setIsDropdownOpen(false); }}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 hover:text-system-color transition-colors"
                                    >
                                        <LucideRotateCcw className="size-4" /> Change User Role
                                    </button>

                                    <div className="h-px bg-gray-100 my-1"></div>

                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                    >
                                        <LucideLogOut className="size-4" /> Log Out
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-8 border-none overflow-y-auto overflow-x-hidden">
                    {children}
                </main>
            </div>
        </div>
    );
}

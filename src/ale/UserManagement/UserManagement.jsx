import React, { useState, useEffect, useMemo } from "react";
import Layout from "../layout/Layout.jsx";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search, UserPlus, Eye, Edit, Trash2,
    Users, ShieldCheck, Mail, Phone, Filter, AlertCircle, CircleX
} from "lucide-react";
import { toast, Toaster } from "sonner";
import { useNavigate } from "react-router-dom";
import {getUsers, deleteUser, getUserById} from "../../services/userService.js";

export function UserManagement() {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [accessFilter, setAccessFilter] = useState("All");
    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        userId: null,
        fullName: ""
    });
    const userId = localStorage.getItem("userId");
    const userRole = localStorage.getItem("role")?.toLowerCase();

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            setIsLoading(true);
            const user = await getUserById(userId);
            const data = await getUsers();
            const filteredData = Array.isArray(data)
                ? data.filter(c => c.companyCode === user.companyCode)
                : [];
            setUsers(filteredData);
        } catch (error) {
            toast.error("Failed to load employees");
        } finally {
            setIsLoading(false);
        }
    };

    const getUserRole = () => {
        const role = localStorage.getItem("role");
        const roles = {
            Forwarding: "forwarder",
            Haulier: "haulier",
            Terminal: "terminal",
            Akps: "akps",
            Customs: "customs",
            "Booking Agent": "bookingAgent",
            Consignee: "consignee",
        };
        return roles[role] || "";
    };

    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const matchesSearch =
                user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.emailAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.userId.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesAccess = accessFilter === "All" || user.accessLevel === accessFilter;
            return matchesSearch && matchesAccess;
        });
    }, [users, searchQuery, accessFilter]);

    const openDeleteModal = (emp) => {
        setDeleteModal({
            isOpen: true,
            userId: emp.userId,
            fullName: emp.fullName
        });
    };
    
    const handleDelete = async (userId) => {
        try {
            await deleteUser(deleteModal.userId);
            toast.success("Employee removed successfully");
            setDeleteModal({ isOpen: false, userId: null, fullName: "" });
            fetchEmployees();
        } catch (error) {
            toast.error("Failed to delete employee");
        }
    };

    return (
        <Layout role={getUserRole}>
            <Toaster richColors position="top-right" />
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-gray-800 flex items-center gap-3">
                            <Users className="text-amber-600" size={32} />
                            Employee Management
                        </h1>
                        <p className="text-gray-500 font-medium mt-1">
                            Managing team members for <span className="text-amber-700 font-bold">{localStorage.getItem("companyName")}</span>
                        </p>
                    </div>
                    <button
                        onClick={() => navigate("/user/management/add")}
                        className="flex items-center gap-2 bg-amber-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg hover:bg-amber-700 transition-all active:scale-95 w-fit"
                    >
                        <UserPlus size={20} /> Add New Employee
                    </button>
                </div>

                {/* Filters Bar */}
                <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by name, email, or user ID..."
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-2xl border border-gray-100">
                        <Filter size={18} className="text-gray-400" />
                        <select
                            className="bg-transparent outline-none font-bold text-gray-600 text-sm"
                            value={accessFilter}
                            onChange={(e) => setAccessFilter(e.target.value)}
                        >
                            <option value="All">All Access Levels</option>
                            <option value="Full Access">Full Access</option>
                            <option value="Half Access">Half Access</option>
                        </select>
                    </div>
                </div>

                {/* Table Section */}
                <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-8 py-6 text-sm font-black text-gray-400 uppercase tracking-widest">Employee</th>
                                <th className="px-6 py-6 text-sm font-black text-gray-400 uppercase tracking-widest">Contact</th>
                                <th className="px-6 py-6 text-sm font-black text-gray-400 uppercase tracking-widest">Access Level</th>
                                <th className="px-6 py-6 text-sm font-black text-gray-400 uppercase tracking-widest text-center">Actions</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                            <AnimatePresence>
                                {filteredUsers.map((emp) => (
                                    <motion.tr
                                        key={emp.userId}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="hover:bg-amber-50/30 transition-colors group"
                                    >
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="size-12 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl flex items-center justify-center text-amber-700 font-bold text-xl shadow-sm">
                                                    {emp.fullName.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-black text-gray-800 text-lg">{emp.fullName}</div>
                                                    <div className="text-gray-400 font-medium text-sm">ID: {emp.userId}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-gray-600 text-sm font-medium">
                                                    <Mail size={14} className="text-amber-500" /> {emp.emailAddress}
                                                </div>
                                                <div className="flex items-center gap-2 text-gray-600 text-sm font-medium">
                                                    <Phone size={14} className="text-amber-500" /> {emp.contactNumber || "N/A"}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                                <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-tighter ${
                                                    emp.accessLevel === 'Full Access'
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-blue-100 text-blue-700'
                                                }`}>
                                                    <ShieldCheck size={14} />
                                                    {emp.accessLevel}
                                                </span>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => navigate(`/user/management/view/${emp.userId}`)}
                                                    className="p-3 text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                                    title="View Details"
                                                >
                                                    <Eye size={20} />
                                                </button>
                                                {/*<button*/}
                                                {/*    onClick={() => navigate(`/management/employees/edit/${emp.userId}`)}*/}
                                                {/*    className="p-3 text-amber-600 hover:bg-amber-50 rounded-xl transition-all"*/}
                                                {/*    title="Edit Employee"*/}
                                                {/*>*/}
                                                {/*    <Edit size={20} />*/}
                                                {/*</button>*/}
                                                <button
                                                    onClick={() => openDeleteModal(emp)}
                                                    className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                    title="Remove Employee"
                                                >
                                                    <Trash2 size={20} />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                            {filteredUsers.length === 0 && !isLoading && (
                                <tr>
                                    <td colSpan="4" className="py-20 text-center text-gray-400 font-medium">
                                        No employees found matching your criteria.
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {deleteModal.isOpen && (
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-[2rem] max-w-md w-full p-8 shadow-2xl relative border border-gray-100 overflow-hidden"
                        >
                            {/*<button*/}
                            {/*    onClick={() => setDeleteModal({ isOpen: false, userId: null, fullName: "" })}*/}
                            {/*    className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"*/}
                            {/*>*/}
                            {/*    <CircleX size={24} />*/}
                            {/*</button>*/}

                            <div className="flex flex-col items-center text-center mb-8 mt-4">
                                <div className="bg-red-50 p-4 rounded-2xl text-red-500 mb-4">
                                    <AlertCircle size={32} />
                                </div>
                                <h3 className="text-2xl font-black text-gray-800">Remove Employee</h3>
                                <p className="text-gray-500 font-medium mt-2 leading-relaxed">
                                    Are you sure you want to completely remove <span className="text-red-600 font-bold">{deleteModal.fullName}</span> from your organization registry? This action is permanent.
                                </p>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => setDeleteModal({ isOpen: false, userId: null, fullName: "" })}
                                    className="flex-1 py-3 border-2 border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="flex-1 py-3 text-white rounded-xl font-bold shadow-lg transition-all bg-red-500 hover:bg-red-600 shadow-red-200"
                                >
                                    Confirm Delete
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </Layout>
    );
}
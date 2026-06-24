import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../layout/Layout.jsx";
import { motion } from "framer-motion";
import {
    ArrowLeft, User, ShieldCheck, Mail, Phone,
    Building2, Hash, ToggleLeft, KeyRound
} from "lucide-react";
import { toast, Toaster } from "sonner";
import { getUserById } from "../../services/userService.js";

export function ViewUser() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [employee, setEmployee] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const userRole = localStorage.getItem("role")?.toLowerCase();

    useEffect(() => {
        const fetchEmployeeDetails = async () => {
            try {
                setIsLoading(true);
                const data = await getUserById(id);
                setEmployee(data);
            } catch (error) {
                console.error(error);
                toast.error("Failed to load employee details");
            } finally {
                setIsLoading(false);
            }
        };
        if (id) fetchEmployeeDetails();
    }, [id]);

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

    if (isLoading) {
        return (
            <Layout role={getUserRole}>
                <div className="p-10 text-center font-bold text-gray-500">
                    Loading Employee Registry...
                </div>
            </Layout>
        );
    }

    if (!employee) {
        return (
            <Layout role={getUserRole}>
                <div className="p-10 text-center font-bold text-red-500">
                    Employee record not found.
                </div>
            </Layout>
        );
    }

    return (
        <Layout role={getUserRole}>
            <Toaster richColors position="top-right" />
            <div className="max-w-5xl mx-auto">

                {/* Navigation Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-gray-500 hover:text-amber-600 mb-4 transition-colors font-bold text-sm"
                    >
                        <ArrowLeft size={16} /> Back to Management
                    </button>
                    <h1 className="text-3xl font-black text-gray-800">Employee Details</h1>
                    <p className="text-gray-500 font-medium mt-1">Detailed structural profile for registry ID: {id}</p>
                </div>

                <div className="space-y-8">
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-8 text-white flex flex-col sm:flex-row items-center gap-6">
                            <div className="size-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white font-black text-3xl shadow-inner">
                                {employee.fullName ? employee.fullName.charAt(0).toUpperCase() : "U"}
                            </div>
                            <div className="text-center sm:text-left flex-1">
                                <h2 className="text-2xl font-black">{employee.fullName}</h2>
                                <p className="text-orange-100 font-medium text-sm mt-1">User ID: {employee.userId}</p>
                            </div>
                            <div className="mt-4 sm:mt-0">
                                <span className={`inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-black uppercase tracking-wider shadow-sm ${employee.accessLevel === 'Full Access'
                                        ? 'bg-white text-green-700'
                                        : 'bg-white text-blue-700'
                                    }`}>
                                    <ShieldCheck size={14} />
                                    {employee.accessLevel || "No Access Setup"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Information Grid layout */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                        <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-100/40 p-8 border border-gray-100 space-y-6">
                            <h3 className="text-lg font-black text-gray-800 flex items-center gap-2 border-b border-gray-50 pb-3">
                                <User size={18} className="text-amber-500" />
                                Personal Parameters
                            </h3>

                            <ReadOnlyField label="Full Identity Name" value={employee.fullName} icon={<User size={18} />} />
                            <ReadOnlyField label="Official Email Address" value={employee.emailAddress} icon={<Mail size={18} />} />
                            <ReadOnlyField label="Contact Mobile Line" value={employee.contactNumber || "Not Appended"} icon={<Phone size={18} />} />
                        </div>

                        <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-100/40 p-8 border border-gray-100 space-y-6">
                            <h3 className="text-lg font-black text-gray-800 flex items-center gap-2 border-b border-gray-50 pb-3">
                                <Building2 size={18} className="text-amber-500" />
                                Operational Bounds
                            </h3>

                            <ReadOnlyField label="Company Name" value={employee.companyName} icon={<Building2 size={18} />} />
                            <ReadOnlyField label="Company Identifier Code" value={employee.companyCode} icon={<Hash size={18} />} />

                            <div className="grid grid-cols-2 gap-4">
                                <ReadOnlyField label="Access Route" value={employee.access} icon={<KeyRound size={16} />} />
                                <ReadOnlyField label="Registry Status" value={employee.status || "Active"} icon={<ToggleLeft size={16} />} />
                            </div>
                        </div>

                    </div>

                </div>
            </div>
        </Layout>
    );
}

const ReadOnlyField = ({ label, value, icon }) => (
    <div className="flex flex-col gap-1.5">
        <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
            {icon} {label}
        </label>
        <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/70 font-bold text-gray-700 text-base outline-none shadow-inner-sm">
            {value}
        </div>
    </div>
);
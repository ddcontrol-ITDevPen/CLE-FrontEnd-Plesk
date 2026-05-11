import React, { useEffect, useState } from "react";
import Layout from "../layout/Layout.jsx";
import { motion } from "framer-motion";
import {
    FaRegCircleUser, FaBuilding, FaEnvelope, FaPhone,
    FaShieldHalved, FaIdBadge, FaMapLocationDot, FaPenToSquare
} from "react-icons/fa6";
import { getUserById } from "../../services/userService.js";
import {useNavigate} from "react-router-dom";

export function ALEForwardingProfile() {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [updatedByUser, setUpdatedByUser] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            const userId = localStorage.getItem("userId");
            try {
                const data = await getUserById(userId);
                setUserData(data);
                if (data.updatedBy) {
                    if (data.updatedBy === userId) {
                        setUpdatedByUser(data);
                    } else {
                        const updatedUser = await getUserById(data.updatedBy);
                        setUpdatedByUser(updatedUser);
                    }
                }
            } catch (error) {
                console.error("Error fetching profile", error);
            } finally {
                loading && setLoading(false);
            }
        };
        fetchUser();
    }, []);

    if (loading) return <div className="p-20 text-center font-bold">Loading Profile...</div>;

    return (
        <Layout role="forwarder">
            <div className="max-w-5xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative bg-gradient-to-r from-[#E0E7FF] to-[#f0fdfa] rounded-3xl p-8 mb-8 shadow-2xl overflow-hidden"
                >
                    <div className="relative z-1 flex flex-col md:flex-row items-center gap-6">
                        <div className="w-32 h-32 rounded-2xl bg-system-color backdrop-blur-md border border-white/30 flex items-center justify-center text-white text-5xl font-bold shadow-inner">
                            {userData?.fullName?.[0].toUpperCase()}
                        </div>
                        <div className="text-center md:text-left">
                            <h1 className="text-4xl font-extrabold text-system-color-dark mb-1">{userData?.fullName}</h1>
                            <div className="flex flex-wrap justify-center md:justify-start gap-3">
                                <span className="px-3 py-1 rounded-full bg-white text-system-color-dark text-xs font-medium backdrop-blur-sm border border-white/10">
                                    ID: {userData?.userId}
                                </span>
                                <span className="px-3 py-1 rounded-full bg-green-700 text-green-50 text-xs font-medium backdrop-blur-sm border border-green-400/20">
                                    {userData?.status || "Active Account"}
                                </span>
                            </div>
                        </div>
                        <button className="md:ml-auto flex items-center gap-2 bg-white text-system-color px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-gray-100 transition-all active:scale-95"
                        onClick={() => navigate("/forwarding/profile/edit")}>
                            <FaPenToSquare /> Edit Profile
                        </button>
                    </div>
                    <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Account Details */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="lg:col-span-1 space-y-6"
                    >
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                                <FaIdBadge className="text-system-color" /> Security & Access
                            </h3>
                            <div className="space-y-4">
                                <InfoItem label="Role Access" value={userData?.access} />
                                <InfoItem label="Access Level" value={userData?.accessLevel} />
                                <div className="pt-4 border-t border-gray-50 text-[12px] text-gray-500 italic">
                                    Last Updated By: {updatedByUser?.fullName || userData?.updatedBy || "System"}
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Contact and Company Information */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="lg:col-span-2 space-y-8"
                    >
                        {/* Contact Info */}
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                                <FaRegCircleUser className="text-system-color" /> Contact Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
                                        <FaEnvelope size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 font-medium">Email Address</p>
                                        <p className="text-[16px] font-semibold text-gray-700">{userData?.emailAddress}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-500">
                                        <FaPhone size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 font-medium">Contact Number</p>
                                        <p className="text-[16px] font-semibold text-gray-700">{userData?.contactNumber || "Not Provided"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Company Card */}
                        <div className="bg-gray-50/50 rounded-3xl p-8 border border-dashed border-gray-200">
                            <div className="flex justify-between items-start mb-6">
                                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                    <FaBuilding className="text-system-color" /> Affiliated Company
                                </h3>
                                <span className="bg-system-color text-white text-[12px] px-2 py-0.5 rounded font-bold">
                                    {userData?.companyCode}
                                </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <p className="text-xs text-gray-400 font-medium mb-1">Company Name</p>
                                    <p className="text-[16px] font-bold text-gray-700">{userData?.companyName}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 font-medium mb-1">SSM Registration</p>
                                    <p className="text-[16px] font-bold text-gray-700">{userData?.company?.ssmNo || "N/A"}</p>
                                </div>
                                <div className="md:col-span-2">
                                    <p className="text-xs text-gray-400 font-medium mb-1 flex items-center gap-1">
                                        <FaMapLocationDot /> Registered Address
                                    </p>
                                    <p className="text-[16px] text-gray-600 italic">
                                        {userData?.company?.address || "Address not loaded"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </Layout>
    );
}

const InfoItem = ({ label, value }) => (
    <div className="group">
        <p className="text-[12px] uppercase tracking-wider text-gray-400 font-bold mb-0.5">{label}</p>
        <p className="text-[16px] font-bold text-gray-700 group-hover:text-system-color transition-colors">{value || "—"}</p>
    </div>
);
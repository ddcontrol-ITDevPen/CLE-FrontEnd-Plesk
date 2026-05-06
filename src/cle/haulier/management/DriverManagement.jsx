import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../layout/Layout.jsx";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search,
    UserPlus,
    Edit3,
    Trash2,
    Mail,
    Phone,
    IdCard,
    X,
    Save, Clock
} from "lucide-react";
import { getDrivers, deleteDriver, updateDriver } from "../../../services/driverService.js";
import { toast, Toaster } from "sonner";
import {getUserById} from "../../../services/userService.js";

export function DriverManagement() {
    const navigate = useNavigate();
    const [drivers, setDrivers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedDriver, setSelectedDriver] = useState(null);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });

    useEffect(() => {
        loadDrivers();
    }, []);

    const loadDrivers = async () => {
        try {
            setIsLoading(true);
            const user = await getUserById(localStorage.getItem("userId"));
            const haulierId = user.companyCode;
            const data = await getDrivers();
            const filteredData = data.filter(d => d.haulierId === haulierId)
            setDrivers(filteredData || []);
        } catch (error) {
            toast.error("Failed to fetch driver records");
        } finally {
            setIsLoading(false);
        }
    };

    const filteredDrivers = useMemo(() => {
        return drivers.filter(d =>
            d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            d.icNumber.includes(searchTerm) ||
            d.emailAddress.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [drivers, searchTerm]);

    const handleEditClick = (driver) => {
        setSelectedDriver({ ...driver });
        setIsEditModalOpen(true);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const updatedData = {...selectedDriver, updatedAt: new Date().toISOString()};
            await updateDriver(selectedDriver.id, updatedData);
            toast.success("Driver updated successfully");
            setIsEditModalOpen(false);
            loadDrivers();
        } catch (error) {
            toast.error("Update failed");
        }
    };

    const handleDelete = async () => {
        try {
            await deleteDriver(deleteModal.id);
            toast.success("Driver removed successfully");
            setDeleteModal({ isOpen: false, id: null });
            loadDrivers();
        } catch (error) {
            toast.error("Error deleting driver");
        }
    };

    return (
        <Layout role="haulier">
            <Toaster richColors position="top-right"/>
            <div className="space-y-6 mx-auto">
                {/* Header & Search Bar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-15">
                    <div>
                        <h1 className="text-3xl font-black text-gray-800">Driver Management</h1>
                        <p className="text-gray-500 font-medium">View and manage your active personnel</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search Name, IC, or Email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2.5 w-64 md:w-100 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            />
                        </div>
                        <button
                            onClick={() => navigate("/haulier/add/driver")}
                            className="flex items-center gap-2 bg-system-color text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                        >
                            <UserPlus size={18} /> Add Driver
                        </button>
                    </div>
                </div>

                {/* Drivers Table */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-indigo-200 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold text-gray-700 uppercase tracking-wider">No.</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-700 uppercase tracking-wider">Driver Name</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-700 uppercase tracking-wider">IC Number</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-700 uppercase tracking-wider">Contact Info</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-700 uppercase tracking-wider">Updated At</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-700 uppercase tracking-wider text-center">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                        {isLoading ? (
                            // Loading State
                            <tr>
                                <td colSpan="5" className="p-10 text-center text-gray-400">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-system-color"></div>
                                        <p>Loading records...</p>
                                    </div>
                                </td>
                            </tr>
                        ) : filteredDrivers.length > 0 ?
                            filteredDrivers.map((driver, index) => (
                                <tr key={driver.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="p-4">{index + 1}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                                                {driver.name.charAt(0)}
                                            </div>
                                            <span className="font-bold text-gray-700">{driver.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <IdCard size={14} className="text-gray-400" />
                                            <span className="font-medium">{driver.icNumber}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Mail size={14} className="text-gray-400" /> {driver.emailAddress}
                                            </div>
                                            {driver.mobileNumber && (
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Phone size={14} className="text-gray-400" /> {driver.mobileNumber}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <Clock size={14} className="text-gray-400" />
                                            <span className="font-medium">{driver.updatedAt
                                                ? new Date(driver.updatedAt).toLocaleString()
                                                : '-'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => handleEditClick(driver)}
                                                className="p-2 text-system-color hover:bg-blue-50 rounded-lg transition-colors"
                                            >
                                                <Edit3 size={18} />
                                            </button>
                                            <button
                                                onClick={() => setDeleteModal({ isOpen: true, id: driver.id })}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                            : (
                                <tr>
                                    <td colSpan="6" className="p-16 text-center">
                                        <div className="flex flex-col items-center justify-center gap-4">
                                            <div className="bg-gray-50 p-6 rounded-full">
                                                <Search size={48} className="text-gray-300" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-xl font-bold text-gray-800">No drivers found</p>
                                                <p className="text-sm text-gray-500 max-w-xs mx-auto">
                                                    {searchTerm
                                                        ? `We couldn't find any results for "${searchTerm}".`
                                                        : "Your driver directory is currently empty."}
                                                </p>
                                            </div>
                                            {searchTerm && (
                                                <button
                                                    onClick={() => setSearchTerm("")}
                                                    className="mt-2 text-sm text-system-blue font-bold hover:underline"
                                                >
                                                    Clear search results
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Modal */}
            <AnimatePresence>
                {isEditModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/20 backdrop-blur-sm">
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            className="w-full max-w-md h-full bg-white shadow-2xl p-8 overflow-y-auto"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-black text-gray-800">Edit Driver</h2>
                                <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleUpdate} className="space-y-6">
                                <ModalInput
                                    label="Full Name"
                                    value={selectedDriver.name}
                                    onChange={(val) => setSelectedDriver({...selectedDriver, name: val})}
                                />
                                <ModalInput
                                    label="IC Number"
                                    value={selectedDriver.icNumber}
                                    onChange={(val) => setSelectedDriver({...selectedDriver, icNumber: val})}
                                />
                                <ModalInput
                                    label="Email Address"
                                    value={selectedDriver.emailAddress}
                                    onChange={(val) => setSelectedDriver({...selectedDriver, emailAddress: val})}
                                />
                                <ModalInput
                                    label="Mobile Number"
                                    value={selectedDriver.mobileNumber || ""}
                                    onChange={(val) => setSelectedDriver({...selectedDriver, mobileNumber: val})}
                                />

                                <div className="pt-6">
                                    <button
                                        type="submit"
                                        className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
                                    >
                                        <Save size={20} /> Save Changes
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Deletion Confirmation Modal */}
            <AnimatePresence>
                {deleteModal.isOpen && (
                    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl text-center"
                        >
                            <div className="mb-6 flex justify-center">
                                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
                                    <Trash2 size={32} />
                                </div>
                            </div>

                            <h2 className="text-2xl font-black text-gray-800 mb-2">Are you sure?</h2>
                            <p className="text-gray-500 mb-8 font-medium">
                                This action cannot be undone. This will permanently delete the driver's record from the system.
                            </p>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => setDeleteModal({ isOpen: false, id: null })}
                                    className="flex-1 py-4 border-2 border-gray-100 rounded-2xl font-bold text-gray-500 hover:bg-gray-50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-bold shadow-lg shadow-red-100 hover:bg-red-600 transition-all"
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

const ModalInput = ({ label, value, onChange }) => (
    <div className="flex flex-col gap-1">
        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</label>
        <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
        />
    </div>
);
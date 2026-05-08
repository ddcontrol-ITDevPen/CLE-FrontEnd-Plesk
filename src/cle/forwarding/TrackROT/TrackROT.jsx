import React, { useState } from "react";
import { Search, Package, MapPin, Calendar, ArrowLeft } from "lucide-react";
import ShipmentLog from "../../ROTComponents/ROTShipmentLog.jsx";
import { getContainers } from "../../../services/containerService.js";
import {toast, Toaster} from "sonner";
import Layout from "../../layout/Layout.jsx";
import {getUserById} from "../../../services/userService.js";

const STATUS_CONFIG = {
    "Assigned": { bg: "bg-assigned", text: "text-orange-900", border: "border-orange-300" },
    "Enroute":   { bg: "bg-enroute",  text: "text-amber-900",  border: "border-amber-200" },
    "Accepted":   { bg: "bg-accepted",  text: "text-green",  border: "border-green-200" },
    "Gated-In":   { bg: "bg-gate-in-out",   text: "text-blue-900",   border: "border-indigo-200" },
    "Gated-Out":  { bg: "bg-gate-in-out", text: "text-indigo-900", border: "border-indigo-200" },
    "Delivered": { bg: "bg-delivered-rfc",text: "text-emerald-900",border: "border-teal-200" },
    "RFC":       { bg: "bg-delivered-rfc",   text: "text-teal-900",   border: "border-teal-200" },
    "Rejected":  { bg: "bg-red-100",    text: "text-red-900",    border: "border-red-200" },
    "Deleted":  { bg: "bg-red-100",    text: "text-red-900",    border: "border-red-200" },
    "RTAssigned": { bg: "bg-assigned", text: "text-orange-900", border: "border-orange-300" },
    "RTEnroute":   { bg: "bg-enroute",  text: "text-amber-900",  border: "border-amber-200" },
    "RTAccepted":   { bg: "bg-accepted",  text: "text-green",  border: "border-green-200" },
    "RTGated-In":   { bg: "bg-gate-in-out",   text: "text-blue-900",   border: "border-indigo-200" },
    "RTGated-Out":  { bg: "bg-gate-in-out", text: "text-indigo-900", border: "border-indigo-200" },
    "RTDelivered": { bg: "bg-delivered-rfc",text: "text-emerald-900",border: "border-teal-200" },
    "RTRFC":       { bg: "bg-delivered-rfc",   text: "text-teal-900",   border: "border-teal-200" },
};

export function TrackROT () {
    const [searchQuery, setSearchQuery] = useState("");
    const [results, setResults] = useState([]);
    const [selectedShipment, setSelectedShipment] = useState(null);
    const [hasSearched, setHasSearched] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        if (!searchQuery.trim()) return;

        setLoading(true);
        setSelectedShipment(null);
        try {
            const user = await getUserById(localStorage.getItem("userId"));
            const companyCode = user.companyCode;
            const allContainers = await getContainers();
            const containers = allContainers.filter(container => {
                const isForwarder = container.booking?.forwardingId === companyCode;
                const isHaulier = container.haulierId === companyCode;
                return isForwarder || isHaulier;
            });

            const filtered = containers.filter(cont =>
                cont.booking?.blOrBookingNumber?.toLowerCase() === searchQuery.toLowerCase() ||
                cont.booking?.houseBLNumber?.toLowerCase() === searchQuery.toLowerCase() ||
                cont.rotNumber?.toLowerCase() === searchQuery.toLowerCase() ||
                cont.containerNumber?.toLowerCase() === searchQuery.toLowerCase() ||
                cont.containerId?.toString() === searchQuery
            );

            setResults(filtered);
            setHasSearched(true);
            if (filtered.length === 0) {
                toast.error("No records found for that number.");
            }
        } catch (error) {
            console.error("Search error:", error);
            toast.error("Failed to fetch tracking data.");
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (shipment) => {
        setSelectedShipment(shipment);
    };

    return (
        <Layout role="forwarder">
            <Toaster richColors position="top-right" />
            <div className="space-y-6">
                <div className="flex flex-col gap-0">
                    <h1 className="text-2xl font-bold">Track & Trace</h1>
                    <p className="text-gray-500 text-sm">Track your shipments in real-time</p>
                </div>

                {/* Search Input Section - Card Design from your screenshot */}
                {!selectedShipment && (
                    <div className="bg-gradient-to-br from-blue-100 to-teal-50 p-12 rounded-3xl border border-blue-100 flex flex-col items-center justify-center space-y-6 shadow-sm">
                        <div className="bg-gradient-to-br from-blue-400 to-system-color-dark p-4 rounded-full shadow-lg">
                            <Search className="text-white" size={32} />
                        </div>
                        <div className="text-center space-y-2">
                            <h2 className="text-xl font-bold text-gray-800">Container Logistics Ecosystem Track & Trace</h2>
                            <p className="text-sm text-gray-500">Enter your Booking No., BL No., or Container No. to track your shipment</p>
                        </div>
                        <form onSubmit={handleSearch} className="flex w-full max-w-2xl gap-2">
                            <input
                                type="text"
                                placeholder="Booking No. / BL No. / Container No."
                                className="flex-1 p-4 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2 transition-all shadow-md active:scale-95"
                            >
                                <Search size={20} />
                                {loading ? "Searching..." : "Search"}
                            </button>
                        </form>
                    </div>
                )}

                {/* Selection Results - Card List */}
                {!selectedShipment && hasSearched && results.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {results.map((item) => {
                            const statusStyle = STATUS_CONFIG[item.status] || { bg: "bg-gray-100", text: "text-gray-600", border: "border-gray-200" };
                            return (
                                <div
                                    key={item.containerId}
                                    onClick={() => handleSelect(item)}
                                    className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 cursor-pointer transition-all group"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 bg-blue-50 rounded-xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                            <Package size={24} />
                                        </div>
                                        <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                                    {item.status}
                                </span>
                                    </div>
                                    <h3 className="font-bold text-lg text-gray-800 mb-1">{item.containerNumber || "No Container No."}</h3>
                                    <p className="text-sm text-gray-500 mb-4">Booking: {item.blOrBookingNumber}</p>

                                    <div className="space-y-2 border-t pt-4">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <MapPin size={14} className="text-gray-400" />
                                            <span className="truncate">Consignee: {item.consigneeName || "N/A"}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Calendar size={14} className="text-gray-400" />
                                            <span>ROT Date: {item.rotDate || "N/A"}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Individual Shipment View - Shipment Log */}
                {selectedShipment && (
                    <div className="w-full space-y-6">
                        <button
                            onClick={() => setSelectedShipment(null)}
                            className="flex items-center gap-2 text-gray-500 hover:text-blue-600 font-medium transition-colors"
                        >
                            <ArrowLeft size={18} />
                            Back to results
                        </button>

                        {/* Summary Card */}
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                                <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">Shipment Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase font-bold">Booking No</p>
                                        <p className="font-semibold">{selectedShipment.booking.blOrBookingNumber}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase font-bold">Container No</p>
                                        <p className="font-semibold">{selectedShipment.containerNumber}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase font-bold">Size/Type</p>
                                        <p className="font-semibold">{selectedShipment.containerSize} {selectedShipment.containerType}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Log Component */}
                        <div className="w-full">
                            <ShipmentLog {...selectedShipment} />
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};
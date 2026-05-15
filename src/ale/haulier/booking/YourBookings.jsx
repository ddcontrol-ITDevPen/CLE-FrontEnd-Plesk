import React, {useState, useEffect, useMemo} from "react";
import Layout from "../../layout/Layout.jsx";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search, Calendar, FileDown, Eye, Edit, Trash2,
    FileText, AlertCircle, CheckCircle2, LucideX, Check
} from "lucide-react";
import { toast, Toaster } from "sonner";
import {getAleContainers, deleteAleContainer, updateAleContainer, getAleContainerById} from "../../../services/aleContainerService.js";
import {getUserById} from "../../../services/userService.js";
import * as XLSX from 'xlsx';
import {useNavigate} from "react-router-dom";
import StatusInfographic from "../../ROTComponents/ROTStatistics.jsx";
import {getAleAssignedHaulierByContainerId} from "../../../services/aleAssignedHaulierService.js";

const STATUS_CONFIG = {
    "Assigned": { bg: "bg-assigned", text: "text-orange-900", border: "border-orange-300" },
    "Enroute":   { bg: "bg-enroute",  text: "text-amber-900",  border: "border-amber-200" },
    // "Examine-AKPS": { bg: "bg-examine",text: "text-purple-900",border: "border-purple-200" },
    // "Examine-Custom": { bg: "bg-examine",   text: "text-purple-900",   border: "border-purple-200" },
    // "Examine-Complete": { bg: "bg-examine",   text: "text-purple-900",   border: "border-purple-200" },
    "Approved-AKPS": { bg: "bg-delivered-rfc",text: "text-emerald-900",border: "border-teal-200" },
    "Approved-Custom": { bg: "bg-delivered-rfc",   text: "text-emerald-900",   border: "border-teal-200" },
    "Approved-Complete": { bg: "bg-delivered-rfc",   text: "text-teal-900",   border: "border-teal-200" },
    "Accepted":   { bg: "bg-accepted",  text: "text-green",  border: "border-green-200" },
    "Gate-In":   { bg: "bg-gate-in-out",   text: "text-blue-900",   border: "border-indigo-200" },
    "Gate-Out":  { bg: "bg-gate-in-out", text: "text-indigo-900", border: "border-indigo-200" },
    // "Delivered": { bg: "bg-delivered-rfc",text: "text-emerald-900",border: "border-teal-200" },
    // "RFC":       { bg: "bg-delivered-rfc",   text: "text-teal-900",   border: "border-teal-200" },
    "Rejected":  { bg: "bg-red-100",    text: "text-red-900",    border: "border-red-200" },
    //"Deleted":  { bg: "bg-red-100",    text: "text-red-900",    border: "border-red-200" },
};

export function ALEYourBookings ()  {
    const [containers, setContainers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusModal, setStatusModal] = useState({ isOpen: false, id: null, nextStatus: "", remarks: "" });
    const [filterStatus, setFilterStatus] = useState("All");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const navigate = useNavigate();
    useEffect(() => {
        fetchData();
    }, []);

    const exportToExcel = () => {
        if (filteredContainers.length === 0) {
            toast.error("No data to export");
            return;
        }

        const exportData = filteredContainers.map(cont => ({
            "Container ID": cont.containerId,
            "Container Type": cont.containerType,
            "Container Size": cont.containerSize,
            "Package Quantity": cont.packageQuantity || "N/A",
            "VGM": cont.vgm || "N/A",
            "Volumetric Weight": cont.volumeMetricWeight || "N/A",
            "Status": cont.status,
            "PickUpAssignedTime": cont.assignedTime ? new Date(cont.assignedTime).toLocaleString() : "N/A",
            "PickUpEnrouteTime": cont.enrouteTime ? new Date(cont.enrouteTime).toLocaleString() : "N/A",
            "PickUpAcceptedTime": cont.acceptedTime  ? new Date(cont.acceptedTime).toLocaleString() : "N/A",
            "PickUpGated In": cont.gatedInTime  ? new Date(cont.gatedInTime).toLocaleString() : "N/A",
            "PickUpGated Out": cont.gatedOutTime  ? new Date(cont.gatedOutTime).toLocaleString() : "N/A",
            "PickUpDeliveredTime": cont.deliveredTime ? new Date(cont.deliveredTime).toLocaleString() : "N/A",
            "PickUpRFCTime": cont.rfcTime ? new Date(cont.rfcTime).toLocaleString() : "N/A",
            "RejectedTime": cont.rejectedTime ? new Date(cont.rejectedTime).toLocaleString() : "N/A",
            "DeletedTime": cont.deletedTime ? new Date(cont.deletedTime).toLocaleString() : "N/A",
            "DropOffAssignedTime": cont.rtAssignedTime ? new Date(cont.rtAssignedTime).toLocaleString() : "N/A",
            "DropOffEnrouteTime": cont.rtEnrouteTime ? new Date(cont.rtEnrouteTime).toLocaleString() : "N/A",
            "DropOffAcceptedTime": cont.rtAcceptedTime  ? new Date(cont.rtAcceptedTime).toLocaleString() : "N/A",
            "DropOffGated In": cont.rtGatedInTime ? new Date(cont.rtGatedInTime).toLocaleString() :"N/A",
            "DropOffGated Out": cont.rtGatedOutTime ? new Date(cont.rtGatedOutTime).toLocaleString() : "N/A",
            "DropOffDeliveredTime": cont.rtDeliveredTime ? new Date(cont.rtDeliveredTime).toLocaleString() : "N/A",
            "DropOffRFCTime": cont.rtRFCTime ? new Date(cont.rtRFCTime).toLocaleString() : "N/A",
            "ROT Number": cont.rotNumber,
            "BL/Booking Number": cont.booking?.blOrBookingNumber || "N/A",
            "House BL Number": cont.booking?.houseBLNumber || "N/A",
            "Movement Type": cont.booking?.movementType || "N/A",
            "Trip Type": cont.booking?.tripType || "N/A",
            "Haulier": cont.haulierName || "Unassigned",
            "Shipping Line": cont.booking?.shippingAgentName || "N/A",
            "Forwarding": cont.booking?.forwardingName || "N/A",
            "ROT Date": cont?.rotDate || "N/A",
            "Vessel Name": cont.booking?.vesselName || "N/A",
            "From Location": getLocationName(cont, 'from'),
            "To Location": getLocationName(cont, 'to'),
            "Consignee Address": cont.toAddress && cont.toAddress.length > 0
                ? cont.toAddress.map(a => a.address).join(", ")
                : "N/A",
            "Custom Form No": cont.booking?.customFormNo || "N/A",
            "Custom Receipt No": cont.booking?.customReceiptNo || "N/A",
            "DIC Number": cont.booking?.dicNumber || "N/A",
            "ZB Number": cont.booking?.zbNumber || "N/A",
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "ROT_History");

        // Generate file and download
        XLSX.writeFile(workbook, `ROT_History_${new Date().toISOString().split('T')[0]}.xlsx`);
        toast.success("Excel file downloaded");
    };

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const user = await getUserById(localStorage.getItem("userId"));
            const haulierId = user.companyCode;
            console.log(haulierId);
            const data = await getAleContainers();
            const haulierContainers = data.filter(c => c.haulierId === haulierId);

            const enrichedData = await Promise.all(
                haulierContainers.map(async (cont) => {
                    try {
                        const assignment = await getAleAssignedHaulierByContainerId(cont.containerId);
                        console.log(assignment);
                        return {
                            ...cont,
                            date: assignment?.timeSlot?.date,
                            timeSlot: assignment?.timeSlot?.time || "N/A"
                        };
                    } catch (err) {
                        console.error("No assignment found for", cont.containerId);
                        return { ...cont, timeSlot: "N/A" };
                    }
                })
            );

            const sortedData = enrichedData.sort((a, b) => {
                const dateA = new Date(getStatusTimestamp(a) || 0);
                const dateB = new Date(getStatusTimestamp(b) || 0);
                return dateB - dateA;
            });
            console.log(data);
            setContainers(sortedData);
        } catch (error) {
            toast.error("Failed to fetch ROT history");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getStatusTimestamp = (container) => {
        if (container.status === "Assigned") return container.rtAssignedTime || container.assignedTime;
        if (container.status === "Enroute")  return container.rtEnrouteTime || container.enrouteTime;
        if (container.status === "Gate-In")  return container.rtGatedInTime || container.gatedInTime;
        if (container.status === "Gate-Out") return container.rtGatedOutTime || container.gatedOutTime;
        if (container.status === "Delivered") return container.rtDeliveredTime || container.deliveredTime;
        if (container.status === "RFC") return container.rtRFCTime || container.rfcTime;
        if (container.status === "Rejected") return container.rejectedTime;
        if (container.status === "Deleted") return container.deletedTime;
        if (container.status === "Approved-AKPS") return container.approvedAKPSTime;
        if (container.status === "Approved-Custom") return container.approvedCustomTime;
        if (container.status === "Approved-Complete") return container.approvedBothTime;
        if (container.status === "Rejected-AKPS") return container.rejectedAKPSTime;
        if (container.status === "Rejected-Custom") return container.rejectedCustomTime;
        if (container.status === "Rejected-Both") return container.rejectedBothTime;
        return null;
    };

    const handleStatusUpdate = async () => {
        const toastId = toast.loading(`Updating status to ${statusModal.nextStatus}...`);
        try {
            const currentContainer = await getAleContainerById(statusModal.id);
            const now = new Date().toISOString();
            const user = await getUserById(localStorage.getItem("userId"));
            const updatedBy = user.fullName + " - " + user.companyName;

            const payload = {
                ...currentContainer,
                toAddress: currentContainer.toAddress?.map(addr => ({ address: addr.address })) || [],
                status: statusModal.nextStatus,
                enrouteTime: statusModal.nextStatus === "Enroute" ? now : currentContainer.enrouteTime,
                rejectedTime: statusModal.nextStatus === "Rejected" ? now : currentContainer.rejectedTime,
                rejectedRemarks: statusModal.remarks,
                UpdatedBy: updatedBy,
            };
            await updateAleContainer(statusModal.id, payload);
            toast.success(`Container ${statusModal.nextStatus} successfully`, { id: toastId });
            setStatusModal({ isOpen: false, id: null, nextStatus: "", remarks: "" });
            fetchData();
        } catch (error) {
            toast.error("Update failed", { id: toastId });
        }
    };

    const filteredContainers = useMemo(() => {
        let result = containers.filter(cont => {
            const matchesSearch =
                cont.containerNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                cont.rotNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                cont.booking.blOrBookingNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                cont.booking.haulierName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                cont.booking.movementType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                cont.consigneeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                cont.portName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                cont.depotName?.toLowerCase().includes(searchTerm.toLowerCase());

            let isExpiredGateOut = false;
            if (cont.status === "Gate-Out" && cont.gatedOutTime) {
                const gatedOutDate = new Date(cont.gatedOutTime);
                console.log(gatedOutDate.toISOString());
                const today = new Date();
                const diffInTime = today.getTime() - gatedOutDate.getTime();
                const diffInDays = diffInTime / (1000 * 3600 * 24);

                if (diffInDays > 1) {
                    isExpiredGateOut = true;
                }
            }

            let matchesStatus = false;
            if(filterStatus === "All")
                matchesStatus = cont.status !== "Deleted" && !isExpiredGateOut;
            else
                matchesStatus = cont.status === filterStatus;
            const rotDate = cont.rotDate;
            let matchesDate = true;

            if (startDate && endDate) {
                matchesDate = rotDate >= startDate && rotDate <= endDate;
            } else if (startDate) {
                matchesDate = rotDate === startDate;
            }

            return matchesSearch && matchesStatus && matchesDate;
        });
        if (sortConfig.key !== null) {
            result.sort((a, b) => {
                if (sortConfig.key === 'timeStamp') {
                    const timeA = getStatusTimestamp(a);
                    const timeB = getStatusTimestamp(b);

                    const dateA = timeA ? new Date(timeA).getTime() : 0;
                    const dateB = timeB ? new Date(timeB).getTime() : 0;

                    return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
                }

                if (sortConfig.key === 'rotDate') {
                    // Treat null/undefined as very old dates so they move to the bottom
                    const dateA = a.rotDate ? new Date(a.rotDate).getTime() : 0;
                    const dateB = b.rotDate ? new Date(b.rotDate).getTime() : 0;

                    return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
                }

                const getVal = (obj, path) => path.split('.').reduce((o, i) => o?.[i], obj);
                let aValue = getVal(a, sortConfig.key) || "";
                let bValue = getVal(b, sortConfig.key) || "";

                if (typeof aValue === 'string') aValue = aValue.toLowerCase();
                if (typeof bValue === 'string') bValue = bValue.toLowerCase();

                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return result;
    }, [containers, searchTerm, filterStatus, startDate, endDate, sortConfig]);

    const getLocationName = (cont, type) => {
        const { movementType, tripType } = cont.aleBooking || {};

        if (type === 'from') {
            if (tripType) {
                // if (movementType === "Import" && tripType === "Pick-up") return cont.portName || "Port";
                // if (tripType === "Drop-off") return cont.consignee.companyName || "Consignee";
                // if (movementType === "Export" && tripType === "Pick-up") return cont.terminalName || "Terminal";
                // if (movementType === "Import" && tripType === "Pick-up & Drop-off") return cont.portName || "Port";
                // if (movementType === "Export" && tripType === "Pick-up & Drop-off") return cont.terminalName || "Terminal";
            } else {
                if (movementType === "Import") return cont.terminalName || "Terminal";
                if (movementType === "Export") {
                    return cont.consigneeId === null
                        ? cont.externalConsigneeName
                        : cont.consigneeName;
                }
            }
            return cont.aleBooking?.fromName || "N/A";
        } else {
            if (tripType) {
                // if (movementType === "Import" && tripType === "Drop-off") return cont.depotName || "Depot";
                // if (tripType === "Pick-up") return cont.consignee.companyName || "Consignee";
                // if (movementType === "Export" && tripType === "Drop-off") return cont.portName || "Port";
                // if (movementType === "Import" && tripType === "Pick-up & Drop-off") return cont.depotName || "Depot";
                // if (movementType === "Export" && tripType === "Pick-up & Drop-off") return cont.portName || "Port";
            } else {
                if (movementType === "Import") {
                    return cont.consigneeId === null
                        ? cont.externalConsigneeName
                        : cont.consigneeName;
                }
                if (movementType === "Export") return cont.terminalName || "Terminal";
            }
            return cont?.toName || "N/A";
        }
    };

    const handleDelete = async () => {
        const toastId = toast.loading("Deleting record...");
        const user = await getUserById(localStorage.getItem("userId"));
        const updatedBy = user.fullName + " - " + user.companyName;
        try {
            const currentContainer = await getAleContainerById(deleteModal.id);
            console.log(currentContainer);
            const payload = {
                ...currentContainer,
                toAddress: currentContainer.toAddress?.map(addr => ({ address: addr.address })) || [],
                status: "Deleted",
                deletedTime: new Date().toISOString(),
                deletedRemarks: deleteModal.remarks,
                UpdatedBy: updatedBy,
            };
            await updateAleContainer(deleteModal.id, payload);
            toast.success("Record deleted successfully", { id: toastId });
            setDeleteModal({ isOpen: false, id: null, remarks: "" });
            fetchData();
        } catch (error) {
            const serverMessage = error.response?.data?.message || error.response?.data || "Unknown Error";
            console.log("Deleted Error: ", serverMessage);
            toast.error("Deletion failed. Please try again.", { id: toastId });
        }
    };

    return (
        <Layout role="forwarder">
            <Toaster richColors position="top-right" />

            <div className="space-y-6">
                <div className="flex flex-col gap-0">
                    <h1 className="text-2xl font-bold">Request for Transport (ROT) Bookings</h1>
                    <p className="text-gray-500 text-sm">Manage all your assigned ROTS here</p>
                </div>

                <StatusInfographic containers={containers} />

                {/* Toolbar */}
                <div className="flex flex-wrap items-center gap-4">
                    <div className="relative flex-1 min-w-[300px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Type here to search for specific details..."
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="p-2 border rounded-lg bg-blue-600 text-white"><Search size={20}/></button>
                    {/* Date Range Filter Group */}
                    <div className="flex items-center bg-white border border-gray-200 rounded-lg p-1 shadow-sm focus-within:ring-2 focus-within:ring-blue-500 transition-all">
                        <div className="flex items-center px-2 border-r border-gray-100">
                            <Calendar size={17} className="text-gray-400 mr-2" />
                            <input
                                type="date"
                                className="outline-none py-2 text-gray-800 bg-transparent cursor-pointer"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center px-2">
                            <span className="text-gray-400  mr-2">to</span>
                            <input
                                type="date"
                                className="outline-none py-2 text-gray-700 bg-transparent cursor-pointer"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                min={startDate} // Prevents selecting end date before start date
                            />
                        </div>
                        {(startDate || endDate) && (
                            <button
                                onClick={() => { setStartDate(""); setEndDate(""); }}
                                className="ml-2 px-2 text-xs text-red-500 hover:font-bold border-l border-gray-100"
                            >
                                Clear
                            </button>
                        )}
                    </div>

                    {/* Export Excel Button */}
                    <button
                        onClick={exportToExcel}
                        className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-[#E9E9E9] to-[#4378AD] hover:bg-emerald-700 text-black rounded-lg font-bold shadow-md transition-all active:scale-95"
                    >
                        <FileDown size={18} />
                        Export Excel
                    </button>
                </div>

                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={() => setFilterStatus("All")}
                        className={`px-6 py-2 rounded-lg font-bold border transition-all ${filterStatus === "All" ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                    >
                        All
                    </button>
                    {Object.keys(STATUS_CONFIG).map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-5 py-2 rounded-lg font-bold border transition-all
                                ${filterStatus === status
                                ? `${STATUS_CONFIG[status].bg} ${STATUS_CONFIG[status].text} ${STATUS_CONFIG[status].border} shadow-md ring-2 ring-offset-1 ring-opacity-50`
                                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                            }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
                    <table className="w-full text-left border-collapse lg:table-auto">
                        <thead className="bg-[#E3DEEB] text-gray-800 font-bold text-sm">
                        <tr>
                            <th className="p-4 border-b w-10 text-center">No.</th>
                            <th className="p-4 border-b w-32">
                                <div className="flex items-center gap-1" onClick={() => handleSort('aleBooking.awbNumber')}>
                                    Air WayBill Number
                                    {sortConfig.key === 'aleBooking.awbNumber' && (
                                        <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                                    )}
                                </div>
                            </th>
                            <th className="p-4 border-b w-32">
                                <div className="flex items-center gap-1" onClick={() => handleSort('aleBooking.houseAWBNumber')}>
                                    House AWB Number
                                    {sortConfig.key === 'aleBooking.houseAWBNumber' && (
                                        <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                                    )}
                                </div>
                            </th>
                            <th className="p-4 border-b w-36">
                                <div className="flex items-center gap-1" onClick={() => handleSort('aleBooking.movementType')}>
                                    Movement Type
                                    {sortConfig.key === 'aleBooking.movementType' && (
                                        <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                                    )}
                                </div>
                            </th>
                            <th className="p-4 border-b w-24">
                                <div className="flex items-center gap-1" onClick={() => handleSort('rotDate')}>
                                    ROT Date
                                    {sortConfig.key === 'rotDate' && (
                                        <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                                    )}
                                </div>
                            </th>
                            <th className="p-4 border-b w-30 text-center">
                                <div className="flex items-center gap-1" onClick={() => handleSort('status')}>
                                    Status
                                    {sortConfig.key === 'status' && (
                                        <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                                    )}
                                </div>
                            </th>
                            <th className="p-4 border-b w-36">
                                <div className="flex items-center gap-1" onClick={() => handleSort('timeStamp')}>
                                    Timestamp
                                    {sortConfig.key === 'timeStamp' && (
                                        <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                                    )}
                                </div>
                            </th>
                            <th className="p-4 border-b">
                                <div className="flex items-center gap-1" onClick={() => handleSort('booking.from')}>
                                    From
                                    {sortConfig.key === 'booking.from' && (
                                        <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                                    )}
                                </div>
                            </th>
                            <th className="p-4 border-b">
                                <div className="flex items-center gap-1" onClick={() => handleSort('to')}>
                                    To
                                    {sortConfig.key === 'to' && (
                                        <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                                    )}
                                </div>
                            </th>
                            <th className="p-4 border-b w-28 text-center">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="text-[13px] xl:text-sm">
                        {isLoading ? (
                            <tr>
                                <td colSpan="11" className="p-10 text-center text-gray-400">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                        <p>Loading records...</p>
                                    </div>
                                </td>
                            </tr>
                        ) : filteredContainers.length > 0 ? (
                                filteredContainers.map((cont, index) => {
                                    const theme = STATUS_CONFIG[cont.status] || {bg: "bg-gray-100", text: "text-gray-700"};
                                    return (
                                        <tr key={cont.containerId} className="border-b hover:bg-gray-50 transition-colors">
                                            <td className="p-4">{index + 1}</td>
                                            <td className="p-4 font-semibold text-blue-600 break-all leading-tight cursor-pointer hover:underline" onClick={() => navigate(`/ale/haulier/booking/view/${cont.containerId}`)}>{cont?.aleBooking?.awbNumber}</td>
                                            <td className="p-4 font-semibold text-blue-600 break-all leading-tight cursor-pointer hover:underline" onClick={() => navigate(`/ale/haulier/booking/view/${cont.containerId}`)}>{cont?.aleBooking?.houseAWBNumber}</td>
                                            <td className="p-4">{cont.aleBooking?.tripType ? `${cont.aleBooking?.movementType} - ${cont.aleBooking?.tripType}` : cont.aleBooking?.movementType}</td>
                                            <td className="p-4 whitespace-nowrap">
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{cont.date ? cont.date : cont.rotDate}</span>
                                                    <span className="text-[11px] text-blue-500 font-bold bg-blue-50 px-2 py-0.5 rounded mt-1 w-fit">{cont.timeSlot}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-center">
                                                {/* Status Badge using Theme Colors */}
                                                <span
                                                    className={`px-3 py-1.5 rounded-lg text-[12px] font-bold uppercase tracking-wider whitespace-nowrap ${theme.bg} ${theme.text}`}>
                                                {cont.status}
                                            </span>
                                            </td>
                                            <td className="p-4 text-[12px] whitespace-normal break-words leading-tight text-gray-600">
                                                {getStatusTimestamp(cont) ? new Date(getStatusTimestamp(cont)).toLocaleString() : "-"}
                                            </td>
                                            <td className="p-4">{getLocationName(cont, 'from')}</td>
                                            <td className="p-4">{getLocationName(cont, 'to')}</td>
                                            <td className="p-4">
                                                {/* Horizontal Action Icons */}
                                                <div className="flex items-center justify-center gap-3">
                                                    {cont.status === "Assigned" && (
                                                        <button onClick={() => navigate(`/ale/haulier/booking/assign/${cont.containerId}`)} className="p-2 bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors" title="Accept / Enroute">
                                                            <Check size={18} />
                                                        </button>
                                                    )}
                                                    {cont.status === "Assigned" && (
                                                        <button onClick={() => setStatusModal({ isOpen: true, id: cont.containerId, nextStatus: "Rejected" })} className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors" title="Reject">
                                                            <LucideX size={18} />
                                                        </button>
                                                    )}
                                                    <Eye size={18}
                                                         className="text-gray-600 cursor-pointer hover:text-blue-600" onClick={() => navigate(`/ale/haulier/booking/view/${cont.containerId}`)}/>
                                                    {["Enroute", "Approved-AKPS", "Approved-Custom", "Approved-Complete"].includes(cont.status) && (
                                                        <Edit size={18}
                                                          className="text-green-600 cursor-pointer hover:text-green-800" onClick={() => navigate(`/ale/haulier/booking/edit/form1/${cont.containerId}`)}/>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                }))
                            : (
                                <tr>
                                    <td colSpan="11" className="p-12 text-center">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <div className="bg-gray-50 p-4 rounded-full">
                                                <Search size={40} className="text-gray-300" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-lg font-bold text-gray-800">No records found</p>
                                                <p className="text-sm text-gray-500">
                                                    {searchTerm || startDate || filterStatus !== "All"
                                                        ? "Try adjusting your filters or search terms to find what you're looking for."
                                                        : "There is currently no data available in the system."}
                                                </p>
                                            </div>
                                            {(searchTerm || startDate || filterStatus !== "All") && (
                                                <button
                                                    onClick={() => {
                                                        setSearchTerm("");
                                                        setFilterStatus("All");
                                                        setStartDate("");
                                                        setEndDate("");
                                                    }}
                                                    className="mt-2 text-sm text-blue-600 font-semibold hover:underline"
                                                >
                                                    Clear all filters
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

            <AnimatePresence>
                {statusModal.isOpen && (
                    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl text-center"
                        >
                            <div className="mb-6 flex justify-center">
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                                    statusModal.nextStatus === "Enroute" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                                }`}>
                                    {statusModal.nextStatus === "Enroute" ? <CheckCircle2 size={40} /> : <AlertCircle size={40} />}
                                </div>
                            </div>

                            <h2 className="text-2xl font-bold text-gray-800 mb-2">
                                {statusModal.nextStatus === "Enroute" ? "Accept Job?" : "Reject Job?"}
                            </h2>
                            <p className="text-gray-600 mb-8">
                                {statusModal.nextStatus === "Enroute"
                                    ? "Confirming this will set the container status to Enroute."
                                    : "Are you sure you want to reject this assigned job?"}
                            </p>

                            <div className="text-left mb-6">
                                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Reason for RejectionF *</label>
                                <textarea
                                    className="w-full mt-1 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition-all text-sm min-h-[100px]"
                                    placeholder="e.g., Incorrect Booking Number provided by client..."
                                    value={statusModal.remarks}
                                    onChange={(e) => setStatusModal({ ...statusModal, remarks: e.target.value })}
                                />
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => setStatusModal({ isOpen: false, id: null, nextStatus: "", remarks: "" })}
                                    className="flex-1 py-3 border-2 border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleStatusUpdate}
                                    className={`flex-1 py-3 text-white rounded-xl font-bold shadow-lg transition-all ${
                                        statusModal.nextStatus === "Enroute" ? "bg-green-600 hover:bg-green-700" : "bg-red-500 hover:bg-red-600"
                                    }`}
                                >
                                    Confirm
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </Layout>
    );
};
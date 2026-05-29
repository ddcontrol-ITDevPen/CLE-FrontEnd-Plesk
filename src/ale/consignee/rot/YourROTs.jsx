import React, {useState, useEffect, useMemo} from "react";
import Layout from "../../layout/Layout.jsx";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search, Calendar, FileDown, Eye, Edit, Trash2,
    FileText, AlertCircle, CheckCircle2, PencilRuler, CircleX, LucideShieldUser, PackageCheck
} from "lucide-react";
import { toast, Toaster } from "sonner";
import {getAleContainers, deleteAleContainer, updateAleContainer, getAleContainerById} from "../../../services/aleContainerService.js";
import {getUserById} from "../../../services/userService.js";
import * as XLSX from 'xlsx';
import {useNavigate} from "react-router-dom";
import StatusInfographic from "../../ROTComponents/ROTStatistics.jsx";

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
    "Delivered": { bg: "bg-delivered-rfc",text: "text-emerald-900",border: "border-teal-200" },
    "RFC":       { bg: "bg-delivered-rfc",   text: "text-teal-900",   border: "border-teal-200" },
    "Rejected":  { bg: "bg-red-100",    text: "text-red-900",    border: "border-red-200" },
    //"Deleted":  { bg: "bg-red-100",    text: "text-red-900",    border: "border-red-200" },
};

export function ALEConsigneeYourROTs ()  {
    const [containers, setContainers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [rejectModal, setRejectModal] = useState({ isOpen: false, id: null, remarks: "" });
    const [editModal, setEditModal] = useState({ isOpen: false, id: null, remarks: "", newDate: "", showDateField: false });
    const [readjustmentModal, setReadjustmentModal] = useState({ isOpen: false, id: null, remarks: "", newDate: "", icNumber: "", isSecureEdit: false, showDateField: false});
    const [deliveredModal, setDeliveredModal] = useState({isOpen: false, id: null});
    const [rfcModal, setRFCModal] = useState({isOpen: false, id: null});
    const [filterStatus, setFilterStatus] = useState("All");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const navigate = useNavigate();
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, startDate, endDate]);

    const exportToExcel = () => {
        if (filteredContainers.length === 0) {
            toast.error("No data to export");
            return;
        }

        const exportData = filteredContainers.map(cont => ({
            "Trucker ID": cont.containerId,
            "Trucker Type": cont.containerType,
            "Trucker Size": cont.containerSize,
            "Package Quantity": cont.packageQuantity || "N/A",
            "VGM": cont.vgm || "N/A",
            "Volumetric Weight": cont.volumeMetricWeight || "N/A",
            "Status": cont.status,
            "PickUpAssignedTime": cont.assignedTime ? new Date(cont.assignedTime).toLocaleString() : "N/A",
            "PickUpEnrouteTime": cont.enrouteTime ? new Date(cont.enrouteTime).toLocaleString() : "N/A",
            "PickUpAcceptedTime": cont.acceptedTime ? new Date(cont.acceptedTime).toLocaleString() : "N/A",
            "PickUpGated In": cont.gatedInTime  ? new Date(cont.gatedInTime).toLocaleString() : "N/A",
            "PickUpGated Out": cont.gatedOutTime  ? new Date(cont.gatedOutTime).toLocaleString() : "N/A",
            "ApprovedAKPSTime": cont.approvedAKPSTime ? new Date(cont.approvedAKPSTime).toLocaleString() : "N/A",
            "ApprovedCustomTime": cont.approvedCustomTime ? new Date(cont.approvedCustomTime).toLocaleString() : "N/A",
            "ApprovedByBothTime": cont.approvedBothTime ? new Date(cont.approvedBothTime).toLocaleString() : "N/A",
            // "PickUpDeliveredTime": cont.deliveredTime ? new Date(cont.deliveredTime).toLocaleString() : "N/A",
            // "PickUpRFCTime": cont.rfcTime ? new Date(cont.rfcTime).toLocaleString() : "N/A",
            "RejectedTime": cont.rejectedTime ? new Date(cont.rejectedTime).toLocaleString() : "N/A",
            //"DeletedTime": cont.deletedTime ? new Date(cont.deletedTime).toLocaleString() : "N/A",
            "DropOffAssignedTime": cont.rtAssignedTime ? new Date(cont.rtAssignedTime).toLocaleString() : "N/A",
            "DropOffEnrouteTime": cont.rtEnrouteTime ? new Date(cont.rtEnrouteTime).toLocaleString() : "N/A",
            "DropOffAcceptedTime": cont.rtAcceptedTime ? new Date(cont.rtAcceptedTime).toLocaleString() : "N/A",
            "DropOffGated In": cont.rtGatedInTime ? new Date(cont.rtGatedInTime).toLocaleString() :"N/A",
            "DropOffGated Out": cont.rtGatedOutTime ? new Date(cont.rtGatedOutTime).toLocaleString() : "N/A",
            // "DropOffDeliveredTime": cont.rtDeliveredTime ? new Date(cont.rtDeliveredTime).toLocaleString() : "N/A",
            // "DropOffRFCTime": cont.rtRFCTime ? new Date(cont.rtRFCTime).toLocaleString() : "N/A",
            "ROT Number": cont.rotNumber,
            "AWB Number": cont.aleBooking?.awbNumber || "N/A",
            "House AWB Number": cont.aleBooking?.houseAWBNumber || "N/A",
            "Movement Type": cont.aleBooking?.movementType || "N/A",
            "Trip Type": cont.aleBooking?.tripType || "N/A",
            "Haulier": cont.haulierName || "Unassigned",
            "Airline": cont.aleBooking?.airlineName || "N/A",
            "Forwarding": cont.aleBooking?.forwardingName || "N/A",
            "ROT Date": cont?.rotDate || "N/A",
            "From Location": getLocationName(cont, 'from'),
            "To Location": getLocationName(cont, 'to'),
            "Consignee Name": cont.aleBooking?.consigneeCompany?.companyName || cont.aleBooking?.externalConsigneeName || "N/A",
            "Consignee Address": cont.toAddress && cont.toAddress.length > 0
                ? cont.toAddress.map(a => a.address).join(", ")
                : "N/A",
            "SSM Number": cont.aleBooking?.ssmNumber || "N/A",
            "Flight Number": cont.aleBooking?.flightNumber || "N/A",
            "Carrier Reference Number" : cont.aleBooking?.carrierReferenceNumber || "N/A",
            "Total Package Quantity": cont.aleBooking?.updatedTotalPackageQuantity || cont.aleBooking?.totalPackageQuantity || "N/A",
            "Weight": cont.aleBooking?.updatedWeight || cont.aleBooking?.weight || "N/A",
            "Size": cont.aleBooking?.size || "N/A",
            "ETA": cont.aleBooking.eta || "N/A",
            "Custom Form Type": cont.aleBooking?.customFormType || "N/A",
            "Custom Form No": cont.aleBooking?.customFormNo || "N/A",
            "Custom Receipt No": cont.aleBooking?.customReceiptNo || "N/A",
            "DIC Number": cont.aleBooking?.dicNumber || "N/A",
            "ZB Number": cont.aleBooking?.zbNumber || "N/A",
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
            const consigneeId = user.companyCode;
            const data = await getAleContainers();
            const filteredData = await data
                .filter(c => c.consigneeId === consigneeId)
                .sort((a, b) => {
                    const dateA = new Date(getStatusTimestamp(a) || 0);
                    const dateB = new Date(getStatusTimestamp(b) || 0);
                    return dateB - dateA;
                });
            console.log(data);
            setContainers(filteredData);
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
        if (container.status === "Assigned") return container.assignedTime;
        if (container.status === "Enroute") return container.enrouteTime;
        if (container.status === "Accepted") return container.acceptedTime;
        if (container.status === "Gate-In") return container.gatedInTime;
        if (container.status === "Gate-Out") return container.gatedOutTime;
        if (container.status === "Delivered") return container.deliveredTime;
        if (container.status === "RFC") return container.rfcTime;
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

    const filteredContainers = useMemo(() => {
        let result = containers.filter(cont => {
            const matchesSearch =
                cont.containerNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                cont.rotNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                cont.aleBooking.awbNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                cont.aleBooking.houseAWBNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                cont.haulierName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                cont.aleBooking.movementType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                cont.consigneeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                cont.terminalName?.toLowerCase().includes(searchTerm.toLowerCase())

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

            const latestTimestamp = getStatusTimestamp(cont.status);
            
            let matchesStatus = false;
            if(filterStatus === "All")
                matchesStatus = cont.status !== "Rejected" && !isExpiredGateOut;
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

    const paginatedContainers = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredContainers.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredContainers, currentPage]);

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

    const handleReject = async () => {
        if (!rejectModal.remarks || rejectModal.remarks.trim() === "") {
            setError(true);
            return;
        }
        const toastId = toast.loading("Cancelling...");
        try {
            const currentContainer = await getAleContainerById(rejectModal.id);
            const user = await getUserById(localStorage.getItem("userId"));
            const updatedBy = user.fullName + " - " + user.companyName
            const payload = {
                ...currentContainer,
                toAddress: currentContainer.toAddress?.map(addr => ({ address: addr.address })) || [],
                status: "Rejected",
                rejectedTime: new Date().toISOString(),
                rejectedRemarks: rejectModal.remarks,
                updatedBy: updatedBy,
            };
            await updateAleContainer(rejectModal.id, payload);
            toast.success("Record rejected successfully", { id: toastId });
            setRejectModal({ isOpen: false, id: null, remarks: "" });
            fetchData();
            setError(false);
        } catch (error) {
            const serverMessage = error.response?.data?.message || error.response?.data || "Unknown Error";
            console.log("Deleted Error: ", serverMessage);
            toast.error("Deletion failed. Please try again.", { id: toastId });
        }
    };

    const handleEdit = async () => {
        if (!editModal.remarks || editModal.remarks.trim() === "") {
            setError(true);
            return;
        }
        const toastId = toast.loading("Updating...");
        try {
            const currentContainer = await getAleContainerById(editModal.id);
            const user = await getUserById(localStorage.getItem("userId"));
            const updatedBy = user.fullName + " - " + editModal?.icNumber || user.companyName;
            const payload = {
                ...currentContainer,
                toAddress: currentContainer.toAddress?.map(addr => ({ address: addr.address })) || [],
                status: currentContainer.status === "Assigned" ? "Assigned" : currentContainer.status,
                assignedTime: new Date().toISOString(),
                editRemarks: editModal.remarks,
                rotDate: editModal.newDate,
                updatedBy: updatedBy,
            };
            await updateAleContainer(editModal.id, payload);
            toast.success("Record updated successfully", { id: toastId });
            setEditModal({ isOpen: false, id: null, remarks: "", icNumber: "", newDate: "", showDateField: false, isSecureEdit: false });
            fetchData();
            setError(false);
        } catch (error) {
            const serverMessage = error.response?.data?.message || error.response?.data || "Unknown Error";
            console.log("Deleted Error: ", serverMessage);
            toast.error("Deletion failed. Please try again.", { id: toastId });
        }
    };

    const handleDeliver = async () => {
        const toastId = toast.loading("Updating...");
        try {
            const currentContainer = await getAleContainerById(deliveredModal.id);
            const userId = localStorage.getItem("userId")
            const user = await getUserById(userId);
            const updatedBy = user.fullName + " - " + user.companyName;
            const payload = {
                ...currentContainer,
                toAddress: currentContainer.toAddress?.map(addr => ({ address: addr.address })) || [],
                status: "Delivered",
                deliveredTime: new Date().toISOString(),
                receivedBy: userId,
                updatedBy: updatedBy,
            };
            await updateAleContainer(deliveredModal.id, payload);
            toast.success("Record updated successfully", { id: toastId });
            setDeliveredModal({ isOpen: false, id: null});
            fetchData();
            setError(false);
        } catch (error) {
            const serverMessage = error.response?.data?.message || error.response?.data || "Unknown Error";
            console.log("Delivered Error: ", serverMessage);
            toast.error("Status change to Delivered failed. Please try again.", { id: toastId });
        }
    };

    const handleRFC = async () => {
        const toastId = toast.loading("Updating...");
        try {
            const currentContainer = await getAleContainerById(rfcModal.id);
            const user = await getUserById(localStorage.getItem("userId"));
            const updatedBy = user.fullName + " - " + user.companyName;
            const payload = {
                ...currentContainer,
                toAddress: currentContainer.toAddress?.map(addr => ({ address: addr.address })) || [],
                status: "RFC",
                rfcTime: new Date().toISOString(),
                updatedBy: updatedBy,
            };
            await updateAleContainer(rfcModal.id, payload);
            toast.success("Record updated successfully", { id: toastId });
            setRFCModal({ isOpen: false, id: null});
            fetchData();
            setError(false);
        } catch (error) {
            const serverMessage = error.response?.data?.message || error.response?.data || "Unknown Error";
            console.log("RFC Error: ", serverMessage);
            toast.error("Status change to RFC failed. Please try again.", { id: toastId });
        }
    };

    return (
        <Layout role="forwarder">
            <Toaster richColors position="top-right" />

            <div className="space-y-6">
                <div className="flex flex-col gap-0">
                    <h1 className="text-2xl font-bold">Request for Transport (ROT) History</h1>
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
                            className={`px-4 py-2 rounded-lg font-bold border transition-all
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
                                    AWB Number
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
                            <th className="p-4 border-b">
                                <div className="flex items-center gap-1" onClick={() => handleSort('haulierId')}>
                                    Transporter
                                    {sortConfig.key === 'haulierId' && (
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
                                <div className="flex items-center justify-center gap-1" onClick={() => handleSort('status')}>
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
                                <div className="flex items-center gap-1" onClick={() => handleSort('aleBooking.from')}>
                                    From
                                    {sortConfig.key === 'aleBooking.from' && (
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
                        ) : paginatedContainers.length > 0 ? (
                                paginatedContainers.map((cont, index) => {
                                    const recordNumber = (currentPage - 1) * itemsPerPage + index + 1;
                                    const theme = STATUS_CONFIG[cont.status] || {bg: "bg-gray-100", text: "text-gray-700"};
                                    return (
                                        <tr key={cont.containerId} className="border-b hover:bg-gray-50 transition-colors">
                                            <td className="p-4">{recordNumber}</td>
                                            <td className="p-4 font-semibold text-blue-600 break-all leading-tight cursor-pointer hover:underline" onClick={() => navigate(`/ale/forwarding/rot/view/${cont.containerId}`)}>{cont.aleBooking.awbNumber}</td>
                                            <td className="p-4 font-semibold text-blue-600 break-all leading-tight cursor-pointer hover:underline" onClick={() => navigate(`/ale/forwarding/rot/view/${cont.containerId}`)}>{cont.aleBooking.houseAWBNumber}</td>
                                            <td className="p-4">{cont.aleBooking?.tripType ? `${cont.aleBooking?.movementType} - ${cont.aleBooking?.tripType}` : cont.aleBooking?.movementType}</td>
                                            <td className="p-4 whitespace-normal break-words leading-tight">{cont?.haulierName || "Unassigned"}</td>
                                            <td className="p-4 whitespace-nowrap">{cont.rotDate}</td>
                                            <td className="p-4 text-center">
                                                {/* Status Badge using Theme Colors */}
                                                <span className={`px-3 py-1.5 rounded-lg text-[12px] font-bold uppercase tracking-wider whitespace-nowrap ${theme.bg} ${theme.text}`}>
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
                                                <div className="flex items-center gap-3">
                                                    <Eye size={18}
                                                         className="text-gray-600 cursor-pointer hover:text-blue-600" onClick={() => navigate(`/ale/forwarding/rot/view/${cont.containerId}`)}/>
                                                    {cont.status === "Assigned" &&
                                                        <Edit size={18}
                                                              className="text-green-600 cursor-pointer hover:text-green-800" onClick={() => setEditModal({isOpen: true, id: cont.containerId, remarks: "", newDate: cont.rotDate, isSecureEdit: false, showDateField: false})}/>
                                                    }
                                                    {["Enroute", "Approved-AKPS", "Approved-Custom", "Approved-Complete"].includes(cont.status) && (
                                                        <PencilRuler size={18}
                                                                     className="text-green-600 cursor-pointer hover:text-green-800" onClick={() => setEditModal({isOpen: true, id: cont.containerId, remarks: "", newDate: cont.rotDate, isSecureEdit: true, showDateField: false})}/>
                                                    )}
                                                    {cont.status === "Gate-Out" &&
                                                        <CheckCircle2 size={18}
                                                              className="text-[#709f90] cursor-pointer hover:text-[#446b60]" onClick={() => setDeliveredModal({isOpen: true, id: cont.containerId})}/>
                                                    }
                                                    {cont.status === "Delivered" &&
                                                        <PackageCheck size={18}
                                                                      className="text-[#709f90] cursor-pointer hover:text-[#446b60]" onClick={() => setRFCModal({isOpen: true, id: cont.containerId})}/>
                                                    }
                                                    {["Assigned", "Enroute"].includes(cont.status) && (
                                                        <CircleX size={18} className="text-red-500 cursor-pointer hover:text-red-700" onClick={() => setRejectModal({isOpen: true, id: cont.containerId, remarks: ""})}/>
                                                    )}
                                                    {cont.status !== "Assigned" && cont.status !== "Rejected" &&
                                                    <FileText
                                                        size={18}
                                                        className="text-blue-600 cursor-pointer hover:text-blue-800"
                                                        onClick={() => navigate(`/ale/booking/view/eCSN/${cont.containerId}`)}/>
                                                    }
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

                {filteredContainers.length > 0 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white px-6 py-4 rounded-xl border border-gray-100 mt-4 shadow-sm">
                        <div className="text-sm text-gray-500 font-medium">
                            Showing{" "}
                            <span className="font-semibold text-gray-800">
                                {Math.min((currentPage - 1) * itemsPerPage + 1, filteredContainers.length)}
                            </span>{" "}
                            to{" "}
                            <span className="font-semibold text-gray-800">
                                {Math.min(currentPage * itemsPerPage, filteredContainers.length)}
                            </span>{" "}
                            of{" "}
                            <span className="font-semibold text-gray-800">{filteredContainers.length}</span>{" "}
                            records
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 text-sm font-bold bg-white text-gray-600 border border-gray-200 rounded-lg shadow-sm transition-all hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white"
                            >
                                Previous
                            </button>

                            <div className="flex items-center gap-1">
                                {Array.from({ length: Math.ceil(filteredContainers.length / itemsPerPage) }).map((_, idx) => {
                                    const pageNum = idx + 1;
                                    if (Math.abs(currentPage - pageNum) <= 1 || pageNum === 1 || pageNum === Math.ceil(filteredContainers.length / itemsPerPage)) {
                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => setCurrentPage(pageNum)}
                                                className={`w-9 h-9 text-sm font-bold rounded-lg transition-all ${
                                                    currentPage === pageNum
                                                        ? "bg-blue-600 text-white shadow-md shadow-blue-100"
                                                        : "bg-white text-gray-600 hover:bg-gray-50 border border-transparent"
                                                }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    }
                                    if (pageNum === 2 || pageNum === Math.ceil(filteredContainers.length / itemsPerPage) - 1) {
                                        return <span key={pageNum} className="text-gray-400 px-1">...</span>;
                                    }
                                    return null;
                                })}
                            </div>

                            <button
                                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, Math.ceil(filteredContainers.length / itemsPerPage)))}
                                disabled={currentPage === Math.ceil(filteredContainers.length / itemsPerPage)}
                                className="px-4 py-2 text-sm font-bold bg-white text-gray-600 border border-gray-200 rounded-lg shadow-sm transition-all hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}

                <div className="flex flex-wrap items-center gap-6 px-2 pt-2">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-gray-100 rounded-md text-gray-600"><Eye size={14} /></div>
                        <span className="text-[14px] font-medium text-gray-500">View Details</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-green-50 rounded-md text-green-600"><Edit size={14} /></div>
                        <span className="text-[14px] font-medium text-gray-500">Edit ROT</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-green-50 rounded-md text-green-600"><PencilRuler size={14} /></div>
                        <span className="text-[14px] font-medium text-gray-500">Readjustment</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-green-50 rounded-md text-[#709f90]"><CheckCircle2 size={14} /></div>
                        <span className="text-[14px] font-medium text-gray-500">Deliver</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-green-50 rounded-md text-[#709f90]"><PackageCheck size={14} /></div>
                        <span className="text-[14px] font-medium text-gray-500">RFC</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-red-50 rounded-md text-red-500"><CircleX size={14} /></div>
                        <span className="text-[14px] font-medium text-gray-500">Reject/Cancel</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-blue-50 rounded-md text-blue-600"><FileText size={14} /></div>
                        <span className="text-[14px] font-medium text-gray-500">View PDF</span>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            <AnimatePresence>
                {editModal.isOpen && (
                    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
                        >
                            <div className="mb-6 flex justify-center">
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${editModal.isSecureEdit ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                                    {editModal.isSecureEdit ? <LucideShieldUser size={32} /> : <PencilRuler size={32} />}
                                </div>
                            </div>

                            <div className="text-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-800">
                                    {editModal.isSecureEdit ? "Secure ROT Update" : "Update ROT Record"}
                                </h2>
                                <p className="text-gray-500 text-sm">
                                    {editModal.isSecureEdit ? "Identity verification required for enroute records." : "Please provide a reason before modifying the date."}
                                </p>
                            </div>

                            <div className="space-y-4">
                                {/* User Name */}
                                {editModal.isSecureEdit && (
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">User Name</label>
                                        <input
                                            type="text"
                                            readOnly
                                            className="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-400 font-medium cursor-not-allowed"
                                            value={localStorage.getItem("userName") || "Active User"}
                                        />
                                    </div>
                                )}

                                {/* IC Number */}
                                {editModal.isSecureEdit && (
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">IC / Passport Number *</label>
                                        <input
                                            type="text"
                                            className={`w-full mt-1 p-3 border rounded-xl outline-none text-sm ${
                                                error === "ic" ? "border-red-500" : "border-gray-200"
                                            }`}
                                            placeholder="Enter IC for security audit"
                                            value={editModal.icNumber || ""}
                                            onChange={(e) => {
                                                setError("");
                                                setEditModal({ ...editModal, icNumber: e.target.value });
                                            }}
                                        />
                                        {error === "ic" && <p className="text-red-500 text-xs mt-1 ml-1">IC Number is required</p>}
                                    </div>
                                )}

                                {/* Edit Reason (Remarks) */}
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Edit Reason *</label>
                                    <div className="flex gap-2 mt-1">
                                        <input
                                            type="text"
                                            className={`flex-1 p-3 border rounded-xl outline-none text-sm ${
                                                error === "remarks" ? "border-red-500" : "border-gray-200"
                                            }`}
                                            placeholder="e.g., Typo in original entry"
                                            value={editModal.remarks}
                                            onChange={(e) => {
                                                setError("");
                                                setEditModal({ ...editModal, remarks: e.target.value });
                                            }}
                                        />
                                        {!editModal.showDateField && (
                                            <button
                                                onClick={() => {
                                                    // Validation logic for Step 1
                                                    if (editModal.isSecureEdit && !editModal.icNumber?.trim()) {
                                                        setError("ic");
                                                        return;
                                                    }
                                                    if (!editModal.remarks.trim()) {
                                                        setError("remarks");
                                                        return;
                                                    }
                                                    setError("");
                                                    setEditModal({ ...editModal, showDateField: true });
                                                }}
                                                className="px-4 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700"
                                            >
                                                Next
                                            </button>
                                        )}
                                    </div>
                                    {error === "remarks" && !editModal.showDateField && (
                                        <p className="text-red-500 text-xs mt-1 ml-1">Reason is required</p>
                                    )}
                                </div>

                                {editModal.showDateField && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                    >
                                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">New ROT Date</label>
                                        <input
                                            type="date"
                                            className="w-full mt-1 p-3 border border-gray-200 rounded-xl outline-none text-sm focus:ring-2 focus:ring-blue-500"
                                            value={editModal.newDate}
                                            onChange={(e) => setEditModal({ ...editModal, newDate: e.target.value })}
                                        />
                                    </motion.div>
                                )}
                            </div>

                            <div className="flex gap-4 mt-8">
                                <button
                                    onClick={() => {
                                        setEditModal({ isOpen: false, id: null, remarks: "", newDate: "", showDateField: false });
                                        setError("");
                                    }}
                                    className="flex-1 py-3 border-2 border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleEdit}
                                    disabled={!editModal.showDateField}
                                    className={`flex-1 py-3 text-white rounded-xl font-bold shadow-lg transition-all ${
                                        editModal.showDateField ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-300 cursor-not-allowed"
                                    }`}
                                >
                                    Save Changes
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Rejection Confirmation Modal */}
            <AnimatePresence>
                {rejectModal.isOpen && (
                    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl text-center"
                        >
                            <div className="mb-6 flex justify-center">
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                                    rejectModal.nextStatus === "Enroute" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                                }`}>
                                    {rejectModal.nextStatus === "Enroute" ? <CheckCircle2 size={40} /> : <AlertCircle size={40} />}
                                </div>
                            </div>

                            <h2 className="text-2xl font-bold text-gray-800 mb-2">
                                Cancel Shipment
                            </h2>
                            <p className="text-gray-600 mb-8">
                                {rejectModal.nextStatus === "Enroute"
                                    ? "Confirming this will set the shipment status to Enroute."
                                    : "Are you sure you want to cancel this shipment or booking?"}
                            </p>

                            <div className="text-left mb-6">
                                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Reason for Rejection *</label>
                                <textarea
                                    className={`w-full mt-1 p-3 border rounded-xl outline-none transition-all text-sm min-h-[100px] ${
                                        error ? "border-red-500 ring-1 ring-red-500" : "border-gray-200 focus:ring-2 focus:ring-red-500"
                                    }`}
                                    placeholder="e.g., Incorrect Booking Number provided by client..."
                                    value={rejectModal.remarks}
                                    onChange={(e) => {
                                        setError(false);
                                        setRejectModal({ ...rejectModal, remarks: e.target.value });
                                    }}
                                />
                                {error && (
                                    <p className="text-red-500 text-xs mt-1 ml-1 font-medium">
                                        Please provide a reason before confirming.
                                    </p>
                                )}
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => {
                                        setError(false);
                                        setRejectModal({ isOpen: false, id: null, remarks: "" });
                                    }}
                                    className="flex-1 py-3 border-2 border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleReject}
                                    className={`flex-1 py-3 text-white rounded-xl font-bold shadow-lg transition-all ${
                                        rejectModal.nextStatus === "Enroute" ? "bg-green-600 hover:bg-green-700" : "bg-red-500 hover:bg-red-600"
                                    }`}
                                >
                                    Confirm
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Delivered Confirmation Modal */}
            <AnimatePresence>
                {deliveredModal.isOpen && (
                    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl text-center"
                        >
                            <div className="mb-6 flex justify-center">
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center bg-green-50 text-delivered-rfc`}>
                                    <CheckCircle2 size={40} />
                                </div>
                            </div>

                            <h2 className="text-2xl font-bold text-gray-800 mb-2">
                                Deliver Shipment
                            </h2>
                            <p className="text-gray-600 mb-8">"Confirming this will set the shipment/package status to Delivered."</p>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => {
                                        setError(false);
                                        setDeliveredModal({ isOpen: false, id: null});
                                    }}
                                    className="flex-1 py-3 border-2 border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeliver}
                                    className={`flex-1 py-3 text-black rounded-xl font-bold shadow-lg transition-all bg-delivered-rfc hover:bg-green-700 hover:text-white`}
                                >
                                    Confirm
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* RFC Confirmation Modal */}
            <AnimatePresence>
                {rfcModal.isOpen && (
                    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl text-center"
                        >
                            <div className="mb-6 flex justify-center">
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center bg-green-50 text-delivered-rfc`}>
                                    <PackageCheck size={40} />
                                </div>
                            </div>

                            <h2 className="text-2xl font-bold text-gray-800 mb-2">
                                Shipment Ready For Collection
                            </h2>
                            <p className="text-gray-600 mb-8">"Confirming this will set the shipment/package status to RFC."</p>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => {
                                        setError(false);
                                        setRFCModal({ isOpen: false, id: null});
                                    }}
                                    className="flex-1 py-3 border-2 border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleRFC}
                                    className={`flex-1 py-3 text-black rounded-xl font-bold shadow-lg transition-all bg-delivered-rfc hover:bg-green-700 hover:text-white`}
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
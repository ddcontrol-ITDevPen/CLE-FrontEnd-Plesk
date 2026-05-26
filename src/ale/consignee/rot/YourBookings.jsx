import React, {useState, useEffect, useMemo} from "react";
import Layout from "../../layout/Layout.jsx";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search, Calendar, FileDown, Eye, Edit, Trash2,
    FileText, AlertCircle, CheckCircle2, PencilRuler, CircleX, LucideShieldUser
} from "lucide-react";
import { toast, Toaster } from "sonner";
import {getUserById} from "../../../services/userService.js";
import * as XLSX from 'xlsx';
import {useNavigate} from "react-router-dom";
import {getAleBookings} from "../../../services/aleBookingService.js";

export function ALEConsigneeYourBookings ()  {
    const [bookings, setBookings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [editModal, setEditModal] = useState({ isOpen: false, id: null, remarks: "", newDate: "", showDateField: false });
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const navigate = useNavigate();
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const exportToExcel = () => {
        if (filteredBookings.length === 0) {
            toast.error("No data to export");
            return;
        }

        const exportData = filteredBookings.map(aleBooking => ({
            "ROT Number": cont.rotNumber,
            "AWB Number": aleBooking?.awbNumber || "N/A",
            "House AWB Number": aleBooking?.houseAWBNumber || "N/A",
            "Movement Type": aleBooking?.movementType || "N/A",
            "Trip Type": aleBooking?.tripType || "N/A",
            "Haulier": cont.haulierName || "Unassigned",
            "Airline": aleBooking?.airlineName || "N/A",
            "Forwarding": aleBooking?.forwardingName || "N/A",
            "Consignee Name": aleBooking?.consigneeCompany?.companyName || aleBooking?.externalConsigneeName || "N/A",
            "Consignee Address": cont.toAddress && cont.toAddress.length > 0
                ? cont.toAddress.map(a => a.address).join(", ")
                : "N/A",
            "SSM Number": aleBooking?.ssmNumber || "N/A",
            "Flight Number": aleBooking?.flightNumber || "N/A",
            "Carrier Reference Number" : aleBooking?.carrierReferenceNumber || "N/A",
            "Total Package Quantity": aleBooking?.totalPackageQuantity || "N/A",
            "Weight": aleBooking?.weight || "N/A",
            "Size": aleBooking?.size || "N/A",
            "ETA": aleBooking.eta || "N/A",
            "Custom Form Type": aleBooking?.customFormType || "N/A",
            "Custom Form No": aleBooking?.customFormNo || "N/A",
            "Custom Receipt No": aleBooking?.customReceiptNo || "N/A",
            "DIC Number": aleBooking?.dicNumber || "N/A",
            "ZB Number": aleBooking?.zbNumber || "N/A",
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
            const data = await getAleBookings();
            const filteredData = await data
                .filter(b => b.consigneeId === consigneeId && (b.terminalLocation === null || b.terminalLocation === "") && b.airlineId === null)
            console.log(filteredData);
            setBookings(filteredData);
        } catch (error) {
            toast.error("Failed to fetch booking information");
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

    const filteredBookings = useMemo(() => {
        let result = bookings.filter(aleBooking => {
            const matchesSearch =
                aleBooking.rotNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                aleBooking.awbNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                aleBooking.houseAWBNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                aleBooking.flightNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                aleBooking.carrierReferenceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                aleBooking?.consigneeCompany?.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                aleBooking.externalConsigneeName?.toLowerCase().includes(searchTerm.toLowerCase())

            const eta = aleBooking.eta;
            let matchesDate = true;

            if (startDate && endDate) {
                matchesDate = eta >= startDate && eta <= endDate;
            } else if (startDate) {
                matchesDate = eta === startDate;
            }

            return matchesSearch && matchesDate;
        });
        if (sortConfig.key !== null) {
            result.sort((a, b) => {
                if (sortConfig.key === 'eta') {
                    const dateA = a.eta ? new Date(a.eta).getTime() : 0;
                    const dateB = b.eta ? new Date(b.eta).getTime() : 0;

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
    }, [bookings, searchTerm, startDate, endDate, sortConfig]);

    // const handleEdit = async () => {
    //     if (!editModal.remarks || editModal.remarks.trim() === "") {
    //         setError(true);
    //         return;
    //     }
    //     const toastId = toast.loading("Updating...");
    //     try {
    //         const currentContainer = await getAleBookingById(editModal.id);
    //         console.log(currentContainer);
    //         const user = await getUserById(localStorage.getItem("userId"));
    //         const updatedBy = user.fullName + " - " + editModal?.icNumber || user.companyName;
    //         const payload = {
    //             ...currentContainer,
    //             toAddress: currentContainer.toAddress?.map(addr => ({ address: addr.address })) || [],
    //             status: currentContainer.status === "Assigned" ? "Assigned" : currentContainer.status,
    //             assignedTime: new Date().toISOString(),
    //             editRemarks: editModal.remarks,
    //             rotDate: editModal.newDate,
    //         };
    //         await updateAleContainer(editModal.id, payload);
    //         toast.success("Record updated successfully", { id: toastId });
    //         setEditModal({ isOpen: false, id: null, remarks: "", icNumber: "", newDate: "", showDateField: false, isSecureEdit: false });
    //         fetchData();
    //         setError(false);
    //     } catch (error) {
    //         const serverMessage = error.response?.data?.message || error.response?.data || "Unknown Error";
    //         console.log("Deleted Error: ", serverMessage);
    //         toast.error("Deletion failed. Please try again.", { id: toastId });
    //     }
    // };

    return (
        <Layout role="forwarder">
            <Toaster richColors position="top-right" />

            <div className="space-y-6">
                <div className="flex flex-col gap-0">
                    <h1 className="text-2xl font-bold">Request for Transport (ROT) History</h1>
                    <p className="text-gray-500 text-sm">Manage all your assigned ROTS here</p>
                </div>

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
                    {/*<div className="flex items-center bg-white border border-gray-200 rounded-lg p-1 shadow-sm focus-within:ring-2 focus-within:ring-blue-500 transition-all">*/}
                    {/*    <div className="flex items-center px-2 border-r border-gray-100">*/}
                    {/*        <Calendar size={17} className="text-gray-400 mr-2" />*/}
                    {/*        <input*/}
                    {/*            type="date"*/}
                    {/*            className="outline-none py-2 text-gray-800 bg-transparent cursor-pointer"*/}
                    {/*            value={startDate}*/}
                    {/*            onChange={(e) => setStartDate(e.target.value)}*/}
                    {/*        />*/}
                    {/*    </div>*/}
                    {/*    <div className="flex items-center px-2">*/}
                    {/*        <span className="text-gray-400  mr-2">to</span>*/}
                    {/*        <input*/}
                    {/*            type="date"*/}
                    {/*            className="outline-none py-2 text-gray-700 bg-transparent cursor-pointer"*/}
                    {/*            value={endDate}*/}
                    {/*            onChange={(e) => setEndDate(e.target.value)}*/}
                    {/*            min={startDate} // Prevents selecting end date before start date*/}
                    {/*        />*/}
                    {/*    </div>*/}
                    {/*    {(startDate || endDate) && (*/}
                    {/*        <button*/}
                    {/*            onClick={() => { setStartDate(""); setEndDate(""); }}*/}
                    {/*            className="ml-2 px-2 text-xs text-red-500 hover:font-bold border-l border-gray-100"*/}
                    {/*        >*/}
                    {/*            Clear*/}
                    {/*        </button>*/}
                    {/*    )}*/}
                    {/*</div>*/}

                    {/* Export Excel Button */}
                    <button
                        onClick={exportToExcel}
                        className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-[#E9E9E9] to-[#4378AD] hover:bg-emerald-700 text-black rounded-lg font-bold shadow-md transition-all active:scale-95"
                    >
                        <FileDown size={18} />
                        Export Excel
                    </button>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto mt-20">
                    <table className="w-full text-left border-collapse lg:table-auto">
                        <thead className="bg-[#E3DEEB] text-gray-800 font-bold text-sm">
                        <tr>
                            <th className="p-4 border-b w-10 text-center">No.</th>
                            <th className="p-4 border-b w-32">
                                <div className="flex items-center gap-1" onClick={() => handleSort('rotNumber')}>
                                    ROT Number
                                    {sortConfig.key === 'rotNumber' && (
                                        <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                                    )}
                                </div>
                            </th>
                            <th className="p-4 border-b w-32">
                                <div className="flex items-center gap-1" onClick={() => handleSort('awbNumber')}>
                                    AWB Number
                                    {sortConfig.key === 'awbNumber' && (
                                        <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                                    )}
                                </div>
                            </th>
                            <th className="p-4 border-b w-32">
                                <div className="flex items-center gap-1" onClick={() => handleSort('houseAWBNumber')}>
                                    House AWB Number
                                    {sortConfig.key === 'houseAWBNumber' && (
                                        <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                                    )}
                                </div>
                            </th>
                            <th className="p-4 border-b w-36">
                                <div className="flex items-center gap-1" onClick={() => handleSort('flightNumber')}>
                                    Flight Number
                                    {sortConfig.key === 'flightNumber' && (
                                        <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                                    )}
                                </div>
                            </th>
                            <th className="p-4 border-b">
                                <div className="flex items-center gap-1" onClick={() => handleSort('carrierReferenceNumber')}>
                                    Carrier Reference No.
                                    {sortConfig.key === 'carrierReferenceNumber' && (
                                        <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                                    )}
                                </div>
                            </th>
                            <th className="p-4 border-b w-24">
                                <div className="flex items-center gap-1" onClick={() => handleSort('totalPackageQuantity')}>
                                    Total Package Quantity
                                    {sortConfig.key === 'totalPackageQuantity' && (
                                        <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                                    )}
                                </div>
                            </th>
                            <th className="p-4 border-b w-24">
                                <div className="flex items-center gap-1" onClick={() => handleSort('consigneeCompany.companyName')}>
                                    Shipper/Consignee
                                    {(sortConfig.key === 'consigneeCompany.companyName' || sortConfig.key === 'externalConsigneeName') && (
                                        <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                                    )}
                                </div>
                            </th>
                            {/*<th className="p-4 border-b">*/}
                            {/*    <div className="flex items-center gap-1" onClick={() => handleSort('weight')}>*/}
                            {/*        Weight*/}
                            {/*        {sortConfig.key === 'weight' && (*/}
                            {/*            <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>*/}
                            {/*        )}*/}
                            {/*    </div>*/}
                            {/*</th>*/}
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
                        ) : filteredBookings.length > 0 ? (
                                filteredBookings.map((aleBooking, index) => {
                                    return (
                                        <tr key={aleBooking.rotNumber} className="border-b hover:bg-gray-50 transition-colors">
                                            <td className="p-4">{index + 1}</td>
                                            <td className="p-4 whitespace-normal break-words leading-tight font-semibold text-blue-600  cursor-pointer hover:underline" onClick={() => navigate(`/ale/consignee/booking/view/${aleBooking.rotNumber}`)}>{aleBooking.rotNumber}</td>
                                            <td className="p-4 break-all leading-tight">{aleBooking.awbNumber}</td>
                                            <td className="p-4 break-all leading-tight">{aleBooking.houseAWBNumber}</td>
                                            <td className="p-4 whitespace-normal break-words leading-tight">{aleBooking?.flightNumber}</td>
                                            <td className="p-4 whitespace-normal break-words leading-tight">{aleBooking.carrierReferenceNumber}</td>
                                            <td className="p-4 whitespace-nowrap">{aleBooking?.updatedTotalPackageQuantity || aleBooking?.totalPackageQuantity}</td>
                                            <td className="p-4">{aleBooking?.consigneeCompany?.companyName ? aleBooking?.consigneeCompany?.companyName : aleBooking.externalConsigneeName}</td>
                                            <td className="p-4">
                                                {/* Horizontal Action Icons */}
                                                <div className="flex items-center justify-center gap-3">
                                                    <Eye size={18}
                                                         className="text-gray-600 cursor-pointer hover:text-blue-600" onClick={() => navigate(`/ale/consignee/booking/view/${aleBooking.rotNumber}`)}/>
                                                    <Edit size={18}
                                                          className="text-green-600 cursor-pointer hover:text-green-800" onClick={() => navigate(`/ale/consignee/booking/edit/${aleBooking.rotNumber}`)}/>
                                                    {/*{cont.status !== "Deleted" &&*/}
                                                    {/*    <Trash2*/}
                                                    {/*        size={18}*/}
                                                    {/*        className="text-red-500 cursor-pointer hover:text-red-700"*/}
                                                    {/*        onClick={() => setDeleteModal({isOpen: true, id: cont.containerId, remarks: ""})}*/}
                                                    {/*    />*/}
                                                    {/*}*/}
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
                                                    {searchTerm || startDate
                                                        ? "Try adjusting your filters or search terms to find what you're looking for."
                                                        : "There is currently no data available in the system."}
                                                </p>
                                            </div>
                                            {(searchTerm || startDate) && (
                                                <button
                                                    onClick={() => {
                                                        setSearchTerm("");
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

                <div className="flex flex-wrap items-center gap-6 px-2 pt-2">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-gray-100 rounded-md text-gray-600"><Eye size={14} /></div>
                        <span className="text-[14px] font-medium text-gray-500">View Details</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-green-50 rounded-md text-green-600"><Edit size={14} /></div>
                        <span className="text-[14px] font-medium text-gray-500">Edit ROT</span>
                    </div>

                    {/*<div className="flex items-center gap-2">*/}
                    {/*    <div className="p-1.5 bg-red-50 rounded-md text-red-500"><CircleX size={14} /></div>*/}
                    {/*    <span className="text-[14px] font-medium text-gray-500">Reject/Cancel</span>*/}
                    {/*</div>*/}
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

            {/* Deletion Confirmation Modal */}
            {/*<AnimatePresence>*/}
            {/*    {rejectModal.isOpen && (*/}
            {/*        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">*/}
            {/*            <motion.div*/}
            {/*                initial={{ scale: 0.9, opacity: 0 }}*/}
            {/*                animate={{ scale: 1, opacity: 1 }}*/}
            {/*                exit={{ scale: 0.9, opacity: 0 }}*/}
            {/*                className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl text-center"*/}
            {/*            >*/}
            {/*                <div className="mb-6 flex justify-center">*/}
            {/*                    <div className={`w-16 h-16 rounded-full flex items-center justify-center ${*/}
            {/*                        rejectModal.nextStatus === "Enroute" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"*/}
            {/*                    }`}>*/}
            {/*                        {rejectModal.nextStatus === "Enroute" ? <CheckCircle2 size={40} /> : <AlertCircle size={40} />}*/}
            {/*                    </div>*/}
            {/*                </div>*/}

            {/*                <h2 className="text-2xl font-bold text-gray-800 mb-2">*/}
            {/*                    Cancel Shipment*/}
            {/*                </h2>*/}
            {/*                <p className="text-gray-600 mb-8">*/}
            {/*                    {rejectModal.nextStatus === "Enroute"*/}
            {/*                        ? "Confirming this will set the container status to Enroute."*/}
            {/*                        : "Are you sure you want to cancel this shipment or booking?"}*/}
            {/*                </p>*/}

            {/*                <div className="text-left mb-6">*/}
            {/*                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Reason for Rejection *</label>*/}
            {/*                    <textarea*/}
            {/*                        className={`w-full mt-1 p-3 border rounded-xl outline-none transition-all text-sm min-h-[100px] ${*/}
            {/*                            error ? "border-red-500 ring-1 ring-red-500" : "border-gray-200 focus:ring-2 focus:ring-red-500"*/}
            {/*                        }`}*/}
            {/*                        placeholder="e.g., Incorrect Booking Number provided by client..."*/}
            {/*                        value={rejectModal.remarks}*/}
            {/*                        onChange={(e) => {*/}
            {/*                            setError(false);*/}
            {/*                            setRejectModal({ ...rejectModal, remarks: e.target.value });*/}
            {/*                        }}*/}
            {/*                    />*/}
            {/*                    {error && (*/}
            {/*                        <p className="text-red-500 text-xs mt-1 ml-1 font-medium">*/}
            {/*                            Please provide a reason before confirming.*/}
            {/*                        </p>*/}
            {/*                    )}*/}
            {/*                </div>*/}

            {/*                <div className="flex gap-4">*/}
            {/*                    <button*/}
            {/*                        onClick={() => {*/}
            {/*                            setError(false);*/}
            {/*                            setRejectModal({ isOpen: false, id: null, remarks: "" });*/}
            {/*                        }}*/}
            {/*                        className="flex-1 py-3 border-2 border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-all"*/}
            {/*                    >*/}
            {/*                        Cancel*/}
            {/*                    </button>*/}
            {/*                    <button*/}
            {/*                        onClick={handleReject}*/}
            {/*                        className={`flex-1 py-3 text-white rounded-xl font-bold shadow-lg transition-all ${*/}
            {/*                            rejectModal.nextStatus === "Enroute" ? "bg-green-600 hover:bg-green-700" : "bg-red-500 hover:bg-red-600"*/}
            {/*                        }`}*/}
            {/*                    >*/}
            {/*                        Confirm*/}
            {/*                    </button>*/}
            {/*                </div>*/}
            {/*            </motion.div>*/}
            {/*        </div>*/}
            {/*    )}*/}
            {/*</AnimatePresence>*/}
        </Layout>
    );
};
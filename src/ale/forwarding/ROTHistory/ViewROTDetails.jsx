import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../../layout/Layout.jsx";
import { getAleContainerById } from "../../../services/aleContainerService.js";
import {AnimatePresence, motion} from "framer-motion";
import {
    AlertCircle,
    AlertTriangle,
    ArrowLeft,
    Clock,
    Download,
    Edit3,
    ExternalLink,
    FileText,
    Upload,
    X, FileImage, Eye, Trash2, 
} from "lucide-react";
import ShipmentLog from "../../ROTComponents/ROTShipmentLog.jsx";
import {getCompanyById} from "../../../services/companyService.js";
import {getAleAssignedHaulierByContainerId} from "../../../services/aleAssignedHaulierService.js";
import {
    deleteAleBookingDocument,
    getAleBookingDocumentByBookingNumber,
    updateAleBookingDocument
} from "../../../services/aleBookingDocumentService.js";
import api from "../../../services/api.js";
import { toast, Toaster } from "sonner";

export function ALEViewROTDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [companyDetails, setCompanyDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [billingPartyName, setBillingPartyName] = useState(null);
    const [assignedHaulier, setAssignedHaulier] = useState(null);
    
    const [documents, setDocuments] = useState([]);
    const [previewData, setPreviewData] = useState({ url: null, type: null, fileName: null });
    const [editModal, setEditModal] = useState({ isOpen: false, doc: null });
    const [editFile, setEditFile] = useState(null);
    const [newFileName, setNewFileName] = useState("");
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, docId: null });

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const result = await getAleContainerById(id);
                console.log(result);
                setData(result);
                try {
                    const assignedData = await getAleAssignedHaulierByContainerId(id);
                    setAssignedHaulier(assignedData);
                } catch {
                    setAssignedHaulier(null);
                }
                if (result.aleBooking?.billingParty) {
                    try {
                        const company = await getCompanyById(result.aleBooking.billingParty);
                        setBillingPartyName(company?.companyName || "N/A");
                    } catch {
                        setBillingPartyName("N/A");
                    }
                }
                if (result.rotNumber) {
                    const docs = await getAleBookingDocumentByBookingNumber(result.rotNumber);
                    setDocuments(docs);
                }
            } catch (error) {
                console.error("Error fetching ROT details:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDetails();
    }, [id]);

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

    const getFileIcon = (fileName) => {
        const ext = fileName.split('.').pop().toLowerCase();
        if (['jpg', 'jpeg', 'png'].includes(ext)) return <FileImage className="text-orange-500" />;
        if (ext === 'pdf') return <FileText className="text-red-500" />;
        return <File className="text-blue-500" />;
    };

    const handlePreview = async (filePath, fileName) => {
        try {
            const response = await api.get(filePath, { responseType: 'blob' });
            const extension = fileName.split('.').pop().toLowerCase();
            const blob = new Blob([response.data], { type: response.headers['content-type'] });
            const localUrl = URL.createObjectURL(blob);
            setPreviewData({ url: localUrl, type: extension, fileName: fileName });
        } catch (error) {
            toast.error("Could not preview file.");
        }
    };

    const handleDownload = async (path, fileName) => {
        try {
            const response = await api.get(path, { responseType: 'blob' });
            const url = URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            toast.error("Download failed.");
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        const toastId = toast.loading("Updating...");
        try {
            const formData = new FormData();
            formData.append("documentType", editModal.doc.documentType);
            formData.append("fileName", newFileName);
            if (editFile) formData.append("file", editFile);

            const updated = await updateAleBookingDocument(editModal.doc.bookingDocumentId, formData);
            setDocuments(prev => prev.map(d => d.bookingDocumentId === editModal.doc.bookingDocumentId ? updated : d));
            toast.success("Updated", { id: toastId });
            setEditModal({ isOpen: false, doc: null });
        } catch (error) {
            toast.error("Update failed", { id: toastId });
        }
    };

    const handleDelete = async () => {
        try {
            await deleteAleBookingDocument(deleteModal.docId);
            setDocuments(prev => prev.filter(d => d.bookingDocumentId !== deleteModal.docId));
            toast.success("Document deleted");
            setDeleteModal({ isOpen: false, docId: null });
        } catch (error) {
            toast.error("Delete failed");
        }
    };

    if (isLoading) return <div className="p-10 text-center">Loading details...</div>;
    if (!data) return <div className="p-10 text-center">Record not found.</div>;

    const Section = ({ title, children }) => (
        <div className="bg-card-color p-6 rounded-xl shadow-sm border border-gray-100 h-full">
            <h3 className="text-system-color font-bold mb-4 border-b pb-2">{title}</h3>
            <div className="grid grid-cols-2 gap-y-3 text-sm">
                {children}
            </div>
        </div>
    );

    const InfoRow = ({ label, value }) => (
        <>
            <span className="text-gray-500 font-medium">{label}</span>
            <span className="text-gray-900 font-semibold">{value || "N/A"}</span>
        </>
    );

    return (
        <Layout role="forwarder">
            <Toaster richColors position="top-right" />
            <div className="space-y-6 max-w-7xl mx-auto pb-10">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold">View ROT</h1>
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-bold transition-all"
                    >
                        <ArrowLeft size={18} /> Back
                    </button>
                </div>

                {/* General Information */}
                <div className="bg-card-color p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-system-color font-bold mb-4 border-b pb-2">General Information</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-12 text-sm">
                        <div className="space-y-3">
                            <div className="flex justify-between"><span className="text-gray-500">ROT Number.</span> <span className="font-bold">{data.rotNumber || "N/A"}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">AWB Number</span> <span className="font-bold">{data.aleBooking?.awbNumber || "N/A"}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">House AWB Number</span> <span className="font-bold">{data.aleBooking?.houseAWBNumber || "N/A"}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Flight No.</span> <span className="font-bold">{data.aleBooking?.flightNumber || "N/A"}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Movement Type</span> <span className="font-bold text-blue-600">{data.aleBooking?.movementType || "N/A"}</span></div>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between"><span className="text-gray-500">Type of Trip</span> <span className="font-bold">{data.aleBooking?.tripType || "N/A"}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">ETA</span> <span className="font-bold">{data.aleBooking?.eta || "N/A"}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Terminal</span> <span className="font-bold">{data.aleBooking?.terminalLocation || "N/A"}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Seal No.</span> <span className="font-bold">{data.aleBooking?.sealNumber || "N/A"}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Forwarding Remarks</span> <span className="font-bold italic">{data.aleBooking?.forwardingRemarks || "N/A"}</span></div>
                    </div>
                        <div className="space-y-3">
                            <div className="flex justify-between"><span className="text-gray-500">Custom Form Type</span> <span className="font-bold">{data.aleBooking?.customFormType || "N/A"}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Custom Form No.</span> <span className="font-bold">{data.aleBooking?.customFormNo || "N/A"}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Custom Receipt No.</span> <span className="font-bold">{data.aleBooking?.customReceiptNo || "N/A"}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">DIC Number</span> <span className="font-bold">{data.aleBooking?.dicNumber || "N/A"}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">ZB Number</span> <span className="font-bold">{data.aleBooking?.zbNumber || "N/A"}</span></div>
                        </div>
                    </div>
                </div>

                {/* Grid Layout for details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Section title="Shipping Information">
                        <InfoRow label="From" value={getLocationName(data, "from")} />
                        <InfoRow label="To" value={getLocationName(data, "to")} />
                        <InfoRow label="Shipping Agent" value={data.aleBooking?.airlineName} />
                        <InfoRow label="Billing Party" value={billingPartyName} />
                        <InfoRow label="ROT Date" value={data.rotDate} />
                    </Section>

                    <Section title="Container Information">
                        <InfoRow label="Package Quantity." value={data.packageQuantity} />
                        <InfoRow label="Size" value={data.containerSize} />
                        <InfoRow label="Type" value={data.containerType} />
                        <InfoRow label="VGM" value={data.vgm} />
                        <InfoRow label="Volumetric" value={data.trailerType} />
                    </Section>

                    <Section title="Trucker/Transporter Information">
                        <InfoRow label="Name" value={data.haulierName} />
                        <InfoRow label="Address" value={data.haulier?.address} />
                        <InfoRow label="PIC Name" value={data.haulier?.picName} />
                        <InfoRow label="PIC Number" value={data.haulier?.handphoneNumber} />
                        <InfoRow label="PIC Email" value={data.haulier?.emailAddress} />
                    </Section>

                    <Section title="Consignee Information">
                        <InfoRow label="Name" value={data.consignee?.companyName} />
                        <InfoRow label="Address" value={data.toAddress?.map(a => a.address).join(", ")} />
                        <InfoRow label="PIC Name" value={data.consignee?.picName} />
                        <InfoRow label="PIC Number" value={data.consignee?.handphoneNumber} />
                        <InfoRow label="PIC Email" value={data.consignee?.emailAddress} />
                    </Section>

                    <Section title="Terminal Information">
                        <InfoRow label="Name" value={data.terminal?.companyName} />
                        <InfoRow label="Address" value={data.terminal?.address} />
                        <InfoRow label="PIC Name" value={data.terminal?.picName} />
                        <InfoRow label="PIC Number" value={data.terminal?.handphoneNumber} />
                        <InfoRow label="PIC Email" value={data.terminal?.emailAddress} />
                    </Section>

                    <Section title="Assigned Trucker Information">
                        <InfoRow label="Driver Name" value={`${assignedHaulier?.driver?.name || "N/A"} (${assignedHaulier?.driver?.mobileNumber || "N/A"} / ${assignedHaulier?.driver?.emailAddress || "N/A"})`} />
                        <InfoRow label="PM No." value={assignedHaulier?.primeMover?.plateNumber || "N/A"} />
                        <InfoRow label="Trailer No." value={`${assignedHaulier?.trailer?.plateNumber || "N/A"} - ${assignedHaulier?.trailer?.type || "N/A"}`} />
                        <InfoRow label="Time Slot" value={`${assignedHaulier?.timeSlot?.date || "N/A"} @ ${assignedHaulier?.timeSlot?.time || "N/A"}`} />
                        <InfoRow label="Trucker Remarks" value={data?.aleBooking?.haulierRemarks || "N/A"} />
                    </Section>

                    {/*<Section title="Airline Information">*/}
                    {/*    <InfoRow label="Name" value={data.aleBooking?.airline?.companyName} />*/}
                    {/*    <InfoRow label="Address" value={data.aleBooking?.airline?.address} />*/}
                    {/*    <InfoRow label="PIC Name" value={data.aleBooking?.airline?.picName} />*/}
                    {/*    <InfoRow label="PIC Number" value={data.aleBooking?.airline?.handphoneNumber} />*/}
                    {/*    <InfoRow label="PIC Email" value={data.aleBooking?.airline?.emailAddress} />*/}
                    {/*</Section>*/}
                </div>

                {/* Documents Section */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 border-b pb-2">
                        <FileText className="text-blue-600" size={24} />
                        <h2 className="text-xl font-bold text-gray-800">Document Vault</h2>
                    </div>

                    {documents.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {documents.map((doc) => (
                                <div key={doc.bookingDocumentId} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all group">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-blue-50">
                                            {getFileIcon(doc.fileName)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[10px] font-bold text-blue-600 uppercase">{doc.documentType}</p>
                                            <h3 className="font-semibold text-gray-800 text-sm truncate">{doc.fileName}</h3>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
                                        <div className="flex gap-1">
                                            <button onClick={() => handlePreview(doc.filePath, doc.fileName)} className="p-1.5 hover:bg-blue-50 text-gray-500 hover:text-blue-600 rounded-md"><Eye size={16} /></button>
                                            <button onClick={() => handleDownload(doc.filePath, doc.fileName)} className="p-1.5 hover:bg-green-50 text-gray-500 hover:text-green-600 rounded-md"><Download size={16} /></button>
                                        </div>
                                        <div className="flex gap-1">
                                            <button onClick={() => { setEditModal({ isOpen: true, doc }); setNewFileName(doc.fileName); }} className="p-1.5 hover:bg-amber-50 text-gray-500 hover:text-amber-600 rounded-md"><Edit3 size={16} /></button>
                                            <button onClick={() => setDeleteModal({ isOpen: true, docId: doc.bookingDocumentId })} className="p-1.5 hover:bg-red-50 text-gray-500 hover:text-red-600 rounded-md"><Trash2 size={16} /></button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-gray-50 rounded-2xl border-2 border-dashed p-8 text-center">
                            <p className="text-gray-400 text-sm">No documents attached to this container.</p>
                        </div>
                    )}
                </div>

                {/* Log of Shipment (Timeline) */}
                {ShipmentLog(data)}
            </div>

            {/* In-App Preview Modal (Overlay) */}
            {previewData.url && (
                <div className="fixed inset-0 z-[1000] bg-black/90 flex flex-col p-4 animate-in fade-in duration-200">
                    <div className="flex justify-between items-center text-white mb-4 px-2">
                        <div className="flex flex-col">
                            <span className="font-bold text-lg">Document Preview</span>
                            <span className="text-xs text-gray-400">Viewing .{previewData.type} file</span>
                        </div>
                        <div className="flex gap-4">
                            <a href={previewData.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg hover:bg-white/20 transition-all">
                                <ExternalLink size={18} /> Open Fullscreen
                            </a>
                            <button
                                onClick={() => {
                                    URL.revokeObjectURL(previewData.url); // Clean up memory
                                    setPreviewData({ url: null, type: null, fileName: null });
                                }}
                                className="p-2 bg-red-500/20 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all"
                            >
                                <X size={24} />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 bg-white rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center">
                        {['jpg', 'jpeg', 'png', 'gif'].includes(previewData.type) ? (
                            <img
                                src={previewData.url}
                                className="max-w-full max-h-full object-contain p-4"
                                alt="Preview"
                            />
                        ) : previewData.type === 'pdf' ? (
                            /* Use <object> instead of <iframe> — much more reliable for blob URLs */
                            <object
                                data={previewData.url}
                                type="application/pdf"
                                className="w-full h-full"
                            >
                                {/* Fallback if object tag also fails (e.g. mobile) */}
                                <div className="text-center p-10">
                                    <FileText size={64} className="mx-auto text-gray-300 mb-4" />
                                    <p className="text-gray-600 mb-4 font-medium">
                                        PDF cannot be displayed in this browser.
                                    </p>
                                    <a
                                        href={previewData.url}
                                        download={previewData.fileName}
                                        className="inline-flex items-center gap-2 bg-system-color text-white px-6 py-3 rounded-xl font-bold"
                                    >
                                        <Download size={20} /> Download to View
                                    </a>
                                </div>
                            </object>
                        ) : (
                            <div className="text-center p-10">
                                <FileText size={64} className="mx-auto text-gray-300 mb-4" />
                                <p className="text-gray-600 mb-4 font-medium">
                                    This file type (.{previewData.type}) cannot be previewed directly.
                                </p>
                                <a
                                    href={previewData.url}
                                    download={previewData.fileName}
                                    className="inline-flex items-center gap-2 bg-system-color text-white px-6 py-3 rounded-xl font-bold"
                                >
                                    <Download size={20} /> Download to View
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            <AnimatePresence>
                {editModal?.isOpen && (
                    <div className="fixed inset-0 z-[1100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <Edit3 className="text-system-color" /> Edit Document
                                </h2>
                                <button onClick={() => setEditModal({isOpen: false, doc: null})} className="p-2 hover:bg-gray-100 rounded-full">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleUpdate} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Display File Name</label>
                                    <input
                                        type="text"
                                        className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-system-color outline-none"
                                        value={newFileName}
                                        onChange={(e) => setNewFileName(e.target.value)}
                                        placeholder="Enter file name"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Document Type</label>
                                    <select
                                        className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-system-color outline-none"
                                        value={editModal.doc.documentType}
                                        onChange={(e) => setEditModal({
                                            ...editModal,
                                            doc: { ...editModal.doc, documentType: e.target.value }
                                        })}
                                    >
                                        <option value="DO Form">DO Form</option>
                                        <option value="Packing List">Packing List</option>
                                        <option value="Custom Form">Custom Form</option>
                                        <option value="Other Document">Other Document</option>
                                    </select>
                                </div>

                                {/* File Re-upload (Optional) */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Replace File (Optional)</label>
                                    <div className="relative border-2 border-dashed border-gray-200 rounded-2xl p-4 text-center hover:border-system-color transition-colors">
                                        <input
                                            type="file"
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            onChange={(e) => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                    setEditFile(file);
                                                }
                                            }}
                                        />
                                        <Upload className="mx-auto text-gray-400 mb-2" size={24} />
                                        <p className="text-xs text-gray-500">
                                            {editFile ? <span className="text-system-color font-bold">{editFile.name}</span> : "Click or drag to replace existing file"}
                                        </p>
                                    </div>
                                    {editFile && (
                                        <p className="text-[10px] text-amber-600 mt-2 flex gap-1 items-center">
                                            <AlertTriangle size={12}/> This will overwrite the existing file and update the uploaded date.
                                        </p>
                                    )}
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setEditModal(null)}
                                        className="flex-1 py-3 font-bold text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-3 bg-system-color text-white font-bold rounded-xl shadow-lg hover:bg-system-color-dark transition-all active:scale-95"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {deleteModal.isOpen && (
                    <div className="fixed inset-0 z-[1100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl"
                        >
                            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertCircle size={40} />
                            </div>
                            <h2 className="text-2xl font-bold mb-2 text-system-color">Delete Document?</h2>
                            <p className="text-gray-700 mb-6 leading-relaxed">This action cannot be undone. The file will be permanently removed from the vault.</p>
                            <div className="flex gap-3">
                                <button onClick={() => setDeleteModal({ isOpen: false, docId: null })} className="flex-1 py-3 border-2 rounded-xl font-bold">Cancel</button>
                                <button onClick={handleDelete} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700">Delete</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </Layout>
    );
}
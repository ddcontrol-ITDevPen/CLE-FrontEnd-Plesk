import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../../layout/Layout.jsx";
import { getContainerById } from "../../../services/containerService.js";
import { motion } from "framer-motion";
import {ArrowLeft, Clock, Download, Eye, File, FileImage, FileText} from "lucide-react";
import ShipmentLog from "../../ROTComponents/ROTShipmentLog.jsx";
import {getCompanyById} from "../../../services/companyService.js";
import { getAssignedHaulierByContainerId } from "../../../services/assignedHaulier.js";
import {
    deleteBookingDocument,
    getBookingDocumentByBookingNumber,
    updateBookingDocument
} from "../../../services/bookingDocumentService.js";
import {toast} from "sonner";

export function ViewROTDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [companyDetails, setCompanyDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [billingPartyName, setBillingPartyName] = useState(null);
    const [documents, setDocuments] = useState([]);
    const [assignedHaulier, setAssignedHaulier] = useState(null);
    
    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const result = await getContainerById(id);
                console.log(result);
                setData(result);
                try {
                    const assignedData = await getAssignedHaulierByContainerId(id);
                    setAssignedHaulier(assignedData);
                } catch {
                    setAssignedHaulier(null);
                }
                if (result.booking?.billingParty) {
                    try {
                        const company = await getCompanyById(result.booking.billingParty);
                        setBillingPartyName(company?.companyName || "N/A");
                    } catch {
                        setBillingPartyName("N/A");
                    }
                }
                if (result.rotNumber) {
                    const docs = await getBookingDocumentByBookingNumber(result.rotNumber);
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
        const { movementType, tripType } = cont.booking || {};

        if (type === 'from') {
            if (tripType) {
                if (movementType === "Import" && tripType === "Pick-up") return cont.portName || "Port";
                if (tripType === "Drop-off") return cont.consignee.companyName || "Consignee";
                if (movementType === "Export" && tripType === "Pick-up") return cont.depotName || "Depot";
                if (movementType === "Import" && tripType === "Pick-up & Drop-off") return cont.portName || "Port";
                if (movementType === "Export" && tripType === "Pick-up & Drop-off") return cont.depotName || "Depot";
            } else {
                if (movementType === "Import") return cont.depotName || "Depot";
                if (movementType === "Export") return cont.portName || "Port";
            }
            return cont.booking?.fromName || "N/A";
        } else {
            if (tripType) {
                if (movementType === "Import" && tripType === "Drop-off") return cont.depotName || "Depot";
                if (tripType === "Pick-up") return cont.consignee.companyName || "Consignee";
                if (movementType === "Export" && tripType === "Drop-off") return cont.portName || "Port";
                if (movementType === "Import" && tripType === "Pick-up & Drop-off") return cont.depotName || "Depot";
                if (movementType === "Export" && tripType === "Pick-up & Drop-off") return cont.portName || "Port";
            } else {
                if (movementType === "Import") return cont.portName || "Port";
                if (movementType === "Export") return cont.depotName || "Depot";
            }
            return cont.toName || "N/A";
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
    const getFileIcon = (fileName) => {
        const ext = fileName.split('.').pop().toLowerCase();
        if (['jpg', 'jpeg', 'png'].includes(ext)) return <FileImage className="text-orange-500" />;
        if (ext === 'pdf') return <FileText className="text-red-500" />;
        return <File className="text-blue-500" />;
    };

    // Updated Download Function
    const handleDownload = (filePath, fileName) => {
        if (!filePath) {
            toast.error("File path is empty");
            return;
        }

        // If it's already a full cloud link, use it directly. 
        // Otherwise fallback to your old local API structure.
        const downloadUrl = filePath.startsWith('http')
            ? filePath
            : `http://localhost:5173/api/uploads/${filePath}`;

        const link = document.createElement('a');
        link.href = downloadUrl;
        link.setAttribute('download', fileName || 'download.xlsx');
        link.setAttribute('target', '_blank');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

// Updated Preview Function
    const handlePreview = (filePath) => {
        if (!filePath) {
            toast.error("File path is empty");
            return;
        }

        const fileUrl = filePath.startsWith('http')
            ? filePath
            : `http://localhost:5173/api/uploads/${filePath}`;

        // Excel files cannot be rendered natively in web browsers.
        // We pass the Cloudinary link to Microsoft Office Viewer to load it!
        if (fileUrl.toLowerCase().endsWith('.xlsx') || fileUrl.toLowerCase().endsWith('.xls')) {
            const officePreviewUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`;
            window.open(officePreviewUrl, '_blank');
        } else {
            // Images and PDFs can be opened directly in a new tab
            window.open(fileUrl, '_blank');
        }
    };

    return (
        <Layout role="forwarder">
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
                            <div className="flex justify-between"><span className="text-gray-500">BL/Booking Number</span> <span className="font-bold">{data.booking?.blOrBookingNumber || "N/A"}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">House BL Number</span> <span className="font-bold">{data.booking?.houseBLNumber || "N/A"}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">SCN.</span> <span className="font-bold">{data.booking?.scn || "N/A"}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Movement Type</span> <span className="font-bold text-blue-600">{data.booking?.movementType || "N/A"}</span></div>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between"><span className="text-gray-500">Type of Trip</span> <span className="font-bold">{data.booking?.tripType || "N/A"}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">ETA</span> <span className="font-bold">{data.booking?.eta || "N/A"}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">POD/POL</span> <span className="font-bold">{data.booking?.portLocation || "N/A"}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Seal No.</span> <span className="font-bold">{data.booking?.sealNumber || "N/A"}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Forwarding Remarks</span> <span className="font-bold italic">{data.booking?.forwardingRemarks || "N/A"}</span></div>
                    </div>
                        <div className="space-y-3">
                            <div className="flex justify-between"><span className="text-gray-500">Custom Form No.</span> <span className="font-bold">{data.booking?.customFormNo || "N/A"}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Custom Receipt No.</span> <span className="font-bold">{data.booking?.customReceiptNo || "N/A"}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">DIC Number</span> <span className="font-bold">{data.booking?.dicNumber || "N/A"}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">ZB Number</span> <span className="font-bold">{data.booking?.zbNumber || "N/A"}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Container Quantity</span> <span className="font-bold">{data.booking?.containerQuantity || "N/A"}</span></div>
                        </div>
                    </div>
                </div>

                {/* Grid Layout for details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Section title="Shipping Information">
                        <InfoRow label="From" value={getLocationName(data, "from")} />
                        <InfoRow label="To" value={getLocationName(data, "to")} />
                        <InfoRow label="Shipping Agent" value={data.booking?.shippingAgentName} />
                        <InfoRow label="Billing Party" value={billingPartyName} />
                        <InfoRow label="ROT Date" value={data.rotDate} />
                    </Section>

                    <Section title="Container Information">
                        <InfoRow label="No." value={data.containerNumber} />
                        <InfoRow label="Size" value={data.containerSize} />
                        <InfoRow label="Type" value={data.containerType} />
                        <InfoRow label="VGM" value={data.vgm} />
                        <InfoRow label="Trailer Type" value={data.trailerType} />
                    </Section>

                    <Section title="Haulier Information">
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

                    <Section title="Port Information">
                        <InfoRow label="Name" value={data.port?.companyName} />
                        <InfoRow label="Address" value={data.port?.address} />
                        <InfoRow label="PIC Name" value={data.port?.picName} />
                        <InfoRow label="PIC Number" value={data.port?.handphoneNumber} />
                        <InfoRow label="PIC Email" value={data.port?.emailAddress} />
                    </Section>

                    <Section title="Depot Information">
                        <InfoRow label="Name" value={data.depotName} />
                        <InfoRow label="Address" value={data.depot?.address} />
                        <InfoRow label="PIC Name" value={data.depot?.picName} />
                        <InfoRow label="PIC Number" value={data.depot?.handphoneNumber} />
                        <InfoRow label="PIC Email" value={data.depot?.emailAddress} />
                    </Section>
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

                                    <div className="flex items-center justify-start gap-4 mt-4 pt-3 border-t border-gray-50">
                                        <div className="flex gap-4">
                                            <button onClick={() => handlePreview(doc.filePath, doc.fileName)} className="flex items-center gap-1 text-sm font-mediump-1.5 hover:bg-blue-50 text-gray-500 hover:text-blue-600 rounded-md"><Eye size={16} />Preview</button>
                                            <button onClick={() => handleDownload(doc.filePath, doc.fileName)} className="flex items-center gap-1 text-sm font-mediump-1.5 hover:bg-green-50 text-gray-500 hover:text-green-600 rounded-md"><Download size={16} />Download</button>
                                        </div>
                                        {/*<div className="flex gap-1">*/}
                                        {/*    <button onClick={() => { setEditModal({ isOpen: true, doc }); setNewFileName(doc.fileName); }} className="p-1.5 hover:bg-amber-50 text-gray-500 hover:text-amber-600 rounded-md"><Edit3 size={16} /></button>*/}
                                        {/*    <button onClick={() => setDeleteModal({ isOpen: true, docId: doc.bookingDocumentId })} className="p-1.5 hover:bg-red-50 text-gray-500 hover:text-red-600 rounded-md"><Trash2 size={16} /></button>*/}
                                        {/*</div>*/}
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
        </Layout>
    );
}
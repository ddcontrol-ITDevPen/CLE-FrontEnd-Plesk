import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../../../ale/layout/Layout.jsx";
import { getAleContainerById } from "../../../services/aleContainerService.js";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, Download, Edit3, ExternalLink, Eye, File, FileImage, FileText, Trash2, X } from "lucide-react";
import ShipmentLog from "../../../ale/ALEComponents/ALEShipmentLog.jsx";
import { getCompanyById } from "../../../services/companyService.js";
import api from "../../../services/api.js";
import { toast } from "sonner";
import { getUserById } from "../../../services/userService.js";
import { getAleBookingDocumentByBookingNumber } from "../../../services/aleBookingDocumentService.js";
import ROTShipmentLog from "../../ROTComponents/ROTShipmentLog.jsx";
import { getAleAssignedHaulierByContainerId } from "../../../services/aleAssignedHaulierService.js";

export function CustomsbookingDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [forwarding, setForwarding] = useState(null);
    const [companyDetails, setCompanyDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [billingPartyName, setBillingPartyName] = useState(null);
    const [assignedHaulier, setAssignedHaulier] = useState(null);
    const [previewData, setPreviewData] = useState({ url: null, type: null, fileName: null });

    // --- NEW STATES FOR DOCUMENTS ---
    const [documents, setDocuments] = useState([]);
    const [isDocsLoading, setIsDocsLoading] = useState(false);

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

    // 2. NEW EFFECT: Automatically fetch documents when data.rotNumber is ready
    useEffect(() => {
        const fetchDocuments = async () => {
            if (!data?.rotNumber) return;

            setIsDocsLoading(true);
            try {
                // Pass the rotNumber directly from the loaded data
                const docs = await getAleBookingDocumentByBookingNumber(data.rotNumber);
                setDocuments(docs || []);
            } catch (error) {
                console.error("Error fetching documents:", error);
            } finally {
                setIsDocsLoading(false);
            }
        };

        fetchDocuments();
    }, [data?.rotNumber]); // Runs as soon as data.rotNumber is set

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
        if (ext === 'pdf') return <FileText className="text-accent-danger" />;
        return <File className="text-system-color" />;
    };

    const handlePreview = async (filePath, fileName) => {
        try {
            const response = await api.get(filePath, { responseType: 'blob' });
            const extension = fileName.split('.').pop().toLowerCase();
            const blob = new Blob([response.data], { type: response.headers['content-type'] });
            const localUrl = URL.createObjectURL(blob);

            setPreviewData({ url: localUrl, type: extension, fileName: fileName });
        } catch (error) {
            toast.error("Unauthorized: Please log in again.");
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
            URL.revokeObjectURL(url);
        } catch (error) {
            toast.error("Download failed. Your session may have expired.");
        }
    };

    return (
        <Layout role="customs">
            <div className="space-y-6 max-w-7xl mx-auto pb-10">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold">View Details</h1>
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
                            <div className="flex justify-between"><span className="text-gray-500">House Number</span> <span className="font-bold">{data.aleBooking?.houseAWBNumber || "N/A"}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">SCN.</span> <span className="font-bold">{data.aleBooking?.scn || "N/A"}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Movement Type</span> <span className="font-bold text-blue-600">{data.aleBooking?.movementType || "N/A"}</span></div>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between"><span className="text-gray-500">Type of Trip</span> <span className="font-bold">{data.aleBooking?.tripType || "N/A"}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">ETA</span> <span className="font-bold">{data.aleBooking?.eta || "N/A"}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">POD/POL</span> <span className="font-bold">{data.aleBooking?.portLocation || "N/A"}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Seal No.</span> <span className="font-bold">{data.aleBooking?.sealNumber || "N/A"}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Forwarding Remarks</span> <span className="font-bold italic">{data.aleBooking?.forwardingRemarks || "N/A"}</span></div>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between"><span className="text-gray-500">Custom Form No.</span> <span className="font-bold">{data.aleBooking?.customFormNo || "N/A"}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Custom Receipt No.</span> <span className="font-bold">{data.aleBooking?.customReceiptNo || "N/A"}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">DIC Number</span> <span className="font-bold">{data.aleBooking?.dicNumber || "N/A"}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">ZB Number</span> <span className="font-bold">{data.aleBooking?.zbNumber || "N/A"}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Container Quantity</span> <span className="font-bold">{data.aleBooking?.containerQuantity || "N/A"}</span></div>
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
                        <InfoRow label="Time Slot" value={`${assignedHaulier?.aleTimeSlot?.date || "N/A"} @ ${assignedHaulier?.aleTimeSlot?.time || "N/A"}`} />
                        <InfoRow label="Trucker Remarks" value={data?.aleBooking?.haulierRemarks || "N/A"} />
                    </Section>

                </div>

                {/* Updated Document Grid Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between border-b pb-2">
                        <h2 className="font-bold text-gray-700 uppercase tracking-wider text-sm">
                            Attached Documents {isDocsLoading && <span className="ml-2 animate-pulse text-xs normal-case font-normal">(Loading...)</span>}
                        </h2>
                    </div>

                    {documents.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {documents.map((doc) => (
                                <div key={doc.bookingDocumentId} className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-lg transition-all group relative">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-gray-50 rounded-xl group-hover:bg-blue-50 transition-colors">
                                            {getFileIcon(doc.fileName)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-system-color uppercase mb-1">{doc.documentType}</p>
                                            <h3 className="font-semibold text-gray-800 truncate" title={doc.fileName}>{doc.fileName}</h3>
                                            <p className="text-[11px] text-gray-400 mt-1">Uploaded: {new Date(doc.uploadDate).toLocaleDateString()}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-start gap-4 mt-6 pt-4 border-t border-gray-50">
                                        <button
                                            onClick={() => handlePreview(doc.filePath, doc.fileName)}
                                            className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-system-color transition-colors"
                                        >
                                            <Eye size={16} /> Preview
                                        </button>
                                        <button
                                            onClick={() => handleDownload(doc.filePath, doc.fileName)}
                                            className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-green-600 transition-colors"
                                        >
                                            <Download size={16} /> Download
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : !isDocsLoading && (
                        <div className="text-center py-10 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                            <p className="text-gray-500">No documents associated with this ROT.</p>
                        </div>
                    )}
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
                {/* Log of Shipment (Timeline) */}
                {ROTShipmentLog(data)}
            </div>
        </Layout>
    );
}
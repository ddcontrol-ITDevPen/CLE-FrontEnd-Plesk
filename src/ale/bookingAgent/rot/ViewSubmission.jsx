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
    X, FileImage, Eye, Trash2, CircleChevronUp, Users, Package
} from "lucide-react";
import {
    deleteAleBookingDocument,
    getAleBookingDocumentByBookingNumber,
    updateAleBookingDocument
} from "../../../services/aleBookingDocumentService.js";
import api from "../../../services/api.js";
import { toast, Toaster } from "sonner";
import {getAleBookingById} from "../../../services/aleBookingService.js";

export function ALEViewSubmission() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [companyDetails, setCompanyDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const [documents, setDocuments] = useState([]);
    const [previewData, setPreviewData] = useState({ url: null, type: null, fileName: null });
    
    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const result = await getAleBookingById(id);
                console.log(result);
                setData(result);
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

    if (isLoading) return <div className="p-10 text-center">Loading details...</div>;
    if (!data) return <div className="p-10 text-center">Record not found.</div>;

    const InfoSection = ({ title, icon: Icon, children }) => (
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm shadow-gray-50/50 space-y-5">
            <div className="flex items-center gap-2.5 border-b border-gray-100 pb-3">
                {Icon && <Icon size={18} className="text-system-color" />}
                <h3 className="text-gray-800 font-bold text-xl tracking-tight">{title}</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-4">
                {children}
            </div>
        </div>
    );

    const DataField = ({ label, value, isHighlight = false, isItalic = false }) => (
        <div className="flex flex-col gap-1">
            <span className="text-[13px] font-bold text-gray-400 uppercase tracking-wider">{label}</span>
            <span className={`text-[15px] font-bold tracking-wide leading-tight ${
                isHighlight ? 'text-blue-600' : 'text-gray-800'
            } ${isItalic ? 'italic text-gray-500 font-medium' : ''}`}>
                {value || "—"}
            </span>
        </div>
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
                <InfoSection title="General Information" icon={CircleChevronUp}>
                    <DataField label="ROT Number" value={data.rotNumber} />
                    <DataField label="Master AWB Number" value={data.awbNumber} />
                    <DataField label="House AWB Number" value={data.houseAWBNumber} />
                    <DataField label="Flight Number" value={data.flightNumber} />
                    <DataField label="Carrier Reference Number" value={data.carrierReferenceNumber} />
                    <DataField label="Forwarding" value={data.forwarding.companyName || "N/A"} />
                </InfoSection>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <InfoSection title="Consignee/Shipper Details" icon={Users}>
                            <div className="sm:col-span-2 md:col-span-3">
                                <DataField label="Company Name" value={data.consigneeCompany?.companyName || data.externalConsigneeName} />
                            </div>
                            <div className="sm:col-span-2 md:col-span-3">
                                <DataField label="Company Address" value={data.consigneeCompany?.address || data.externalConsigneeAddress} />
                            </div>
                            <DataField label="SSM/ROC No." value={data?.ssmNumber || "N/A"} />
                            <DataField label="Person In charge (PIC)" value={data.consigneeCompany?.picName || "N/A"} />
                            <DataField label="PIC Contact Handphone" value={data.consigneeCompany?.handphoneNumber || data.externalConsigneeContact} />
                            <DataField label="Email Address" value={data.consigneeCompany?.emailAddress || "N/A"} />
                        </InfoSection>
                    </div>

                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm h-full flex flex-col justify-between space-y-5">
                            <div className="flex items-center gap-2.5 border-b border-gray-100 pb-3">
                                <Package size={18} className="text-system-color" />
                                <h3 className="text-gray-800 font-bold text-xl tracking-tight">Package Configuration</h3>
                            </div>
                            <div className="flex-1 grid grid-cols-1 gap-y-4">
                                <DataField label="Total Package Quantity Units" value={`${data.totalPackageQuantity} (Updated Value: ${data.updatedTotalPackageQuantity || "N/A"})`} />
                                <DataField label="Weight Cargo Metric (Tonne)" value={`${data.weight} (Updated Value: ${data.updatedWeight || "N/A"})`} />
                                <DataField label="Dimension Size" value={data?.size || "N/A"} />
                            </div>
                        </div>
                    </div>
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
                                            <button onClick={() => handleDownload(doc.filePath, doc.fileName)} className="flex items-center gap-1 text-sm font-mediump-1.5 hover:bg-green-50 text-gray-500 hover:text-green-600 rounded-md"><Download size={16}/>Download</button>
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
            {/*<AnimatePresence>*/}
            {/*    {editModal?.isOpen && (*/}
            {/*        <div className="fixed inset-0 z-[1100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">*/}
            {/*            <motion.div*/}
            {/*                initial={{ opacity: 0, y: 20 }}*/}
            {/*                animate={{ opacity: 1, y: 0 }}*/}
            {/*                exit={{ opacity: 0, scale: 0.95 }}*/}
            {/*                className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"*/}
            {/*            >*/}
            {/*                <div className="flex justify-between items-center mb-6">*/}
            {/*                    <h2 className="text-xl font-bold flex items-center gap-2">*/}
            {/*                        <Edit3 className="text-system-color" /> Edit Document*/}
            {/*                    </h2>*/}
            {/*                    <button onClick={() => setEditModal({isOpen: false, doc: null})} className="p-2 hover:bg-gray-100 rounded-full">*/}
            {/*                        <X size={20} />*/}
            {/*                    </button>*/}
            {/*                </div>*/}
            
            {/*                <form onSubmit={handleUpdate} className="space-y-5">*/}
            {/*                    <div>*/}
            {/*                        <label className="block text-sm font-semibold text-gray-700 mb-2">Display File Name</label>*/}
            {/*                        <input*/}
            {/*                            type="text"*/}
            {/*                            className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-system-color outline-none"*/}
            {/*                            value={newFileName}*/}
            {/*                            onChange={(e) => setNewFileName(e.target.value)}*/}
            {/*                            placeholder="Enter file name"*/}
            {/*                            required*/}
            {/*                        />*/}
            {/*                    </div>*/}
            {/*                    <div>*/}
            {/*                        <label className="block text-sm font-semibold text-gray-700 mb-2">Document Type</label>*/}
            {/*                        <select*/}
            {/*                            className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-system-color outline-none"*/}
            {/*                            value={editModal.doc.documentType}*/}
            {/*                            onChange={(e) => setEditModal({*/}
            {/*                                ...editModal,*/}
            {/*                                doc: { ...editModal.doc, documentType: e.target.value }*/}
            {/*                            })}*/}
            {/*                        >*/}
            {/*                            <option value="DO Form">DO Form</option>*/}
            {/*                            <option value="Packing List">Packing List</option>*/}
            {/*                            <option value="Custom Form">Custom Form</option>*/}
            {/*                            <option value="Other Document">Other Document</option>*/}
            {/*                        </select>*/}
            {/*                    </div>*/}
            
            {/*                    /!* File Re-upload (Optional) *!/*/}
            {/*                    <div>*/}
            {/*                        <label className="block text-sm font-semibold text-gray-700 mb-2">Replace File (Optional)</label>*/}
            {/*                        <div className="relative border-2 border-dashed border-gray-200 rounded-2xl p-4 text-center hover:border-system-color transition-colors">*/}
            {/*                            <input*/}
            {/*                                type="file"*/}
            {/*                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"*/}
            {/*                                onChange={(e) => {*/}
            {/*                                    const file = e.target.files[0];*/}
            {/*                                    if (file) {*/}
            {/*                                        setEditFile(file);*/}
            {/*                                    }*/}
            {/*                                }}*/}
            {/*                            />*/}
            {/*                            <Upload className="mx-auto text-gray-400 mb-2" size={24} />*/}
            {/*                            <p className="text-xs text-gray-500">*/}
            {/*                                {editFile ? <span className="text-system-color font-bold">{editFile.name}</span> : "Click or drag to replace existing file"}*/}
            {/*                            </p>*/}
            {/*                        </div>*/}
            {/*                        {editFile && (*/}
            {/*                            <p className="text-[10px] text-amber-600 mt-2 flex gap-1 items-center">*/}
            {/*                                <AlertTriangle size={12}/> This will overwrite the existing file and update the uploaded date.*/}
            {/*                            </p>*/}
            {/*                        )}*/}
            {/*                    </div>*/}
            
            {/*                    <div className="pt-4 flex gap-3">*/}
            {/*                        <button*/}
            {/*                            type="button"*/}
            {/*                            onClick={() => setEditModal(null)}*/}
            {/*                            className="flex-1 py-3 font-bold text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"*/}
            {/*                        >*/}
            {/*                            Cancel*/}
            {/*                        </button>*/}
            {/*                        <button*/}
            {/*                            type="submit"*/}
            {/*                            className="flex-1 py-3 bg-system-color text-white font-bold rounded-xl shadow-lg hover:bg-system-color-dark transition-all active:scale-95"*/}
            {/*                        >*/}
            {/*                            Save Changes*/}
            {/*                        </button>*/}
            {/*                    </div>*/}
            {/*                </form>*/}
            {/*            </motion.div>*/}
            {/*        </div>*/}
            {/*    )}*/}
            {/*</AnimatePresence>*/}
            
            {/*/!* Delete Confirmation Modal *!/*/}
            {/*<AnimatePresence>*/}
            {/*    {deleteModal.isOpen && (*/}
            {/*        <div className="fixed inset-0 z-[1100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">*/}
            {/*            <motion.div*/}
            {/*                initial={{ scale: 0.9, opacity: 0 }}*/}
            {/*                animate={{ scale: 1, opacity: 1 }}*/}
            {/*                className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl"*/}
            {/*            >*/}
            {/*                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">*/}
            {/*                    <AlertCircle size={40} />*/}
            {/*                </div>*/}
            {/*                <h2 className="text-2xl font-bold mb-2 text-system-color">Delete Document?</h2>*/}
            {/*                <p className="text-gray-700 mb-6 leading-relaxed">This action cannot be undone. The file will be permanently removed from the vault.</p>*/}
            {/*                <div className="flex gap-3">*/}
            {/*                    <button onClick={() => setDeleteModal({ isOpen: false, docId: null })} className="flex-1 py-3 border-2 rounded-xl font-bold">Cancel</button>*/}
            {/*                    <button onClick={handleDelete} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700">Delete</button>*/}
            {/*                </div>*/}
            {/*            </motion.div>*/}
            {/*        </div>*/}
            {/*    )}*/}
            {/*</AnimatePresence>*/}
        </Layout>
    );
}
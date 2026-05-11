import React, { useState } from "react";
import Layout from "../../layout/Layout.jsx";
import {
    Search, FileText, FileImage, Download, Eye,
    Trash2, Edit3, Upload, X, File, ExternalLink, AlertTriangle, AlertCircle
} from "lucide-react";
import { toast, Toaster } from "sonner";
import {
    getAleBookingDocumentById,
    getAleBookingDocumentByBookingNumber,
    deleteAleBookingDocument,
    updateAleBookingDocument
} from "../../../services/aleBookingDocumentService.js";
import {getUserById} from "../../../services/userService.js";
import axios from "axios";
import {AnimatePresence, motion} from "framer-motion";
import api from "../../../services/api.js";

export function ALEViewROTDocument() {
    const [rotNumber, setRotNumber] = useState("");
    const [documents, setDocuments] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [editModal, setEditModal] = useState(null);
    const [editFile, setEditFile] = useState(null);
    const [newFileName, setNewFileName] = useState("");
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, docId: null });
    const [previewData, setPreviewData] = useState({ url: null, type: null, fileName: null });
    
    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        if (!rotNumber.trim()) return;

        setIsLoading(true);
        setHasSearched(false);
        try {
            const user = await getUserById(localStorage.getItem("userId"));
            const companyCode = user?.companyCode;
            const data = await getAleBookingDocumentByBookingNumber(rotNumber);
            const filteredData = data.filter(b => b.booking?.forwardingId === companyCode);
            setDocuments(filteredData);
            setHasSearched(true);
        } catch (error) {
            console.error(error);
            toast.error("Could not find documents for this booking.");
        } finally {
            setIsLoading(false);
        }
    };

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

    const openEditModal = (doc) => {
        setEditModal({ isOpen: true, doc });
        setNewFileName(doc.fileName);
        setEditFile(null);
    };
    const handleUpdate = async (e) => {
        e.preventDefault();
        const toastId = toast.loading("Updating document...");

        try {
            const formData = new FormData();
            formData.append("documentType", editModal.doc.documentType);
            formData.append("fileName", newFileName);
            if (editFile) {
                formData.append("file", editFile);
            }
            const updatedDoc = await updateAleBookingDocument(editModal.doc.bookingDocumentId, formData);

            setDocuments(prev => prev.map(d =>
                d.bookingDocumentId === editModal.doc.bookingDocumentId ? updatedDoc : d
            ));

            toast.success("Document updated successfully", { id: toastId });
            setEditModal({isOpen: false, doc: null});
            setEditFile(null);
        } catch (error) {
            toast.error(error.response?.data?.message || "Update failed", { id: toastId });
        }
    };

    const handleDelete = async () => {
        const toastId = toast.loading("Deleting document...");
        try {
            await deleteAleBookingDocument(deleteModal.docId);
            setDocuments(prev => prev.filter(d => d.bookingDocumentId !== deleteModal.docId));
            toast.success("Document deleted", { id: toastId });
            setDeleteModal({ isOpen: false, docId: null });
        } catch (error) {
            toast.error("Delete failed", { id: toastId });
        }
    };

    return (
        <Layout role="forwarder">
            <Toaster richColors position="top-right"/>
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-2">
                    <div>
                        <h1 className="text-2xl font-bold">Booking Document Vault</h1>
                        <p className="text-gray-500 text-sm">Manage and view documents by Booking Number</p>
                    </div>
                </div>

                {/* Search Bar Section */}
                <div className="bg-gradient-to-br from-blue-50 to to-teal-50 p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <form onSubmit={handleSearch} className="flex gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Enter BL or Booking Number (e.g. BL1234567890)"
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-system-color transition-all"
                                value={rotNumber}
                                onChange={(e) => setRotNumber(e.target.value)}
                            />
                        </div>
                        <button className="px-8 py-3 bg-system-color text-white font-bold rounded-xl hover:bg-system-color-dark transition-all shadow-md active:scale-95">
                            {isLoading ? "Searching..." : "Retrieve Documents"}
                        </button>
                    </form>
                </div>

                {/* Document Grid */}
                {hasSearched && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="font-bold text-gray-700 uppercase tracking-wider text-sm">
                                Found {documents.length} Documents for <span className="text-system-color">{rotNumber}</span>
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

                                        {/* Actions Footer */}
                                        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-50">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handlePreview(doc.filePath, doc.fileName)}
                                                    className="p-2 hover:bg-blue-50 text-gray-600 hover:text-system-color rounded-lg transition-colors"
                                                    title="Quick View"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDownload(doc.filePath, doc.fileName)}
                                                    className="p-2 hover:bg-green-50 text-gray-600 hover:text-green-600 rounded-lg transition-colors"
                                                    title="Download"
                                                >
                                                    <Download size={18} />
                                                </button>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => openEditModal(doc)}
                                                    className="p-2 hover:bg-amber-50 text-gray-600 hover:text-amber-600 rounded-lg transition-colors"
                                                >
                                                    <Edit3 size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => setDeleteModal({ isOpen: true, docId: doc.bookingDocumentId })}
                                                    className="p-2 hover:bg-red-50 text-gray-600 hover:text-red-600 rounded-lg transition-colors">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                                <FileText className="mx-auto text-gray-300 mb-4" size={48} />
                                <p className="text-gray-500">No documents found for this booking number.</p>
                            </div>
                        )}
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
                                        <option value="ROT Form">ROT Form</option>
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
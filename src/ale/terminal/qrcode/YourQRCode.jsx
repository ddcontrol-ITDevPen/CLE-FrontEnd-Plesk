import React, { useState, useEffect, useRef } from "react";
import Layout from "../../layout/Layout.jsx";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeCanvas, QRCodeSVG } from "qrcode.react";
import {
    QrCode, Download, RefreshCw, AlertCircle,
    CheckCircle2, FileText, ArrowLeft
} from "lucide-react";
import { toast, Toaster } from "sonner";
import { generateAleQRCode, getAleQRCodes } from "../../../services/aleQRCodeService.js";
import { getUserById } from "../../../services/userService.js";

export function YourQRCode() {
    const [terminalId, setTerminalId] = useState("");
    const [terminalName, setTerminalName] = useState("");
    const [qrData, setQrData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const qrCanvasRef = useRef(null);

    useEffect(() => {
        const initializeTerminal = async () => {
            try {
                const userId = localStorage.getItem("userId");
                if (!userId) {
                    console.error("No user ID found in localStorage");
                    setIsLoading(false);
                    return;
                }

                const terminal = await getUserById(userId);
                setTerminalId(terminal.companyCode);
                setTerminalName(terminal.companyName);
                await fetchTerminalQRCode(terminal.companyCode);
            } catch (error) {
                console.error("Error initializing terminal:", error);
                toast.error("Failed to load terminal information.");
                setIsLoading(false);
            }
        }
        initializeTerminal();
    }, []);

    const fetchTerminalQRCode = async (targetId) => {
        const idToQuery = targetId || terminalId;
        if (!idToQuery) return;
        setIsLoading(true);
        try {
            const data = await getAleQRCodes();
            const existingQr = data.find(q => q.terminalId === idToQuery && q.status === "Active");

            if (existingQr) {
                setQrData(existingQr);
            }
        } catch (error) {
            console.error("Error retrieving terminal asset:", error);
            toast.error("Failed to check existing terminal configurations.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateQR = async () => {
        setIsGenerating(true);
        const promise = new Promise(async (resolve, reject) => {
            try {
                const payload = {
                    terminalId: terminalId,
                };

                const response = await generateAleQRCode(payload);
                setQrData(response.data);
                resolve(response.data);
            } catch (error) {
                console.error("Generation error:", error);
                throw error;
            } finally {
                setIsGenerating(false);
            }
        });

        toast.promise(promise, {
            loading: "Generating permanent terminal gate registration token...",
            success: "Static QR Code asset generated successfully!",
            error: "Failed to generate terminal gateway registration code."
        });
    };

    const handleDownloadQR = () => {
        try {
            const canvas = document.getElementById("terminal-gate-qr-canvas");
            if (!canvas) throw new Error("Target canvas instance elements not bound in DOM viewport.");

            const base64Image = canvas.toDataURL("image/png");
            const downloadLink = document.createElement("a");
            downloadLink.href = base64Image;
            downloadLink.download = `QR_${terminalName.replace(/\s+/g, "_")}_GateAsset.png`;

            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);

            toast.success("Gate asset image downloaded successfully.");
        } catch (err) {
            toast.error("Failed to process asset imagery file exports.");
            console.error(err);
        }
    };

    return (
        <Layout>
            <Toaster position="top-right" richColors />
            <div className="p-6 max-w-5xl mx-auto space-y-6">

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-system-color tracking-tight flex items-center gap-2">
                            <QrCode size={32} className="text-[#8E7F9F]" />
                            Terminal QR Code Setup
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">
                            Manage permanent static QR codes deployed at physical terminal entries for automatic Gate-In / Gate-Out scans.
                        </p>
                    </div>
                    <div className="bg-gray-100 px-4 py-2 rounded-xl border border-gray-200">
                        <span className="text-xs text-gray-400 block font-bold uppercase tracking-wider">Active Workspace</span>
                        <span className="font-semibold text-gray-700 text-sm">{terminalName}</span>
                    </div>
                </div>

                <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden min-h-[450px] flex items-center justify-center p-8 relative">
                    <AnimatePresence mode="wait">

                        {/* STATE 1: LOADING TIMEOUT CONTEXT */}
                        {isLoading && (
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center gap-3 text-gray-400"
                            >
                                <RefreshCw className="animate-spin text-[#8E7F9F]" size={40} />
                                <p className="font-medium text-sm">Synchronizing infrastructure asset keys...</p>
                            </motion.div>
                        )}

                        {/* STATE 2: EMPTY SETUP SHEET - SHOW GENERATION BUTTON */}
                        {!isLoading && !qrData && (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="text-center max-w-md flex flex-col items-center"
                            >
                                <div className="w-20 h-20 bg-gray-50 text-gray-400 border border-dashed border-gray-200 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                                    <QrCode size={40} className="stroke-[1.5]" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">No Active Gate QR Code Found</h3>
                                <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                                    This workspace does not currently possess an initialized QR Code. Generate a permanent identification QR Code to display and print for arriving driver check-in verification gates.
                                </p>
                                <button
                                    onClick={handleGenerateQR}
                                    disabled={isGenerating}
                                    className="px-6 py-3 bg-[#364153] hover:bg-[#2c3543] disabled:bg-gray-300 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2"
                                >
                                    <RefreshCw size={18} className={isGenerating ? "animate-spin" : ""} />
                                    Initialize Terminal QR Asset
                                </button>
                            </motion.div>
                        )}

                        {/* STATE 3: ASSIGNED STATIC CONFIG FOUND - SHOW HIGH-RES CANVAS DISK DOWNLOAD MODULE */}
                        {!isLoading && qrData && (
                            <motion.div
                                key="active-qr"
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -15 }}
                                className="w-full grid grid-cols-1 md:grid-cols-12 gap-8 items-center"
                            >
                                <div className="md:col-span-5 flex flex-col items-center justify-center border-r md:border-r border-gray-100 pr-0 md:pr-8">
                                    <div className="p-6 bg-white rounded-3xl shadow-md border border-gray-100 inline-block bg-gradient-to-tr from-gray-50 via-white to-gray-50">
                                        <QRCodeCanvas
                                            id="terminal-gate-qr-canvas"
                                            value={qrData.qrCode}
                                            size={1024}
                                            style={{ width: "260px", height: "260px" }}
                                            level={"H"}
                                            includeMargin={true}
                                        />
                                    </div>
                                    <span className="text-xs font-mono text-gray-400 mt-4 tracking-widest uppercase bg-gray-50 px-3 py-1 rounded-md border">
                                        UID: {qrData.id.substring(0, 8)}...
                                    </span>
                                </div>

                                <div className="md:col-span-7 space-y-6">
                                    <div className="space-y-2">
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-emerald-800 text-xs font-bold uppercase tracking-wider">
                                            <CheckCircle2 size={12} /> Live Production Key
                                        </div>
                                        <h2 className="text-2xl font-bold text-gray-800">Operational Gate Identification Token</h2>
                                        <p className="text-gray-500 text-sm leading-relaxed">
                                            This barcode configuration acts as a terminal reference endpoint. Print and mount this code on entry control boards. Drivers can process Gate-In and Gate-Out states continuously without renewing this setup asset block.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100 text-sm">
                                        <div>
                                            <span className="text-gray-400 block font-medium text-xs uppercase">Deployment Location</span>
                                            <span className="font-bold text-gray-700">{terminalName}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-400 block font-medium text-xs uppercase">Generation Date</span>
                                            <span className="font-bold text-gray-700">
                                                {new Date(qrData.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-3">
                                        <button
                                            onClick={handleDownloadQR}
                                            className="px-5 py-3 bg-[#8E7F9F] hover:bg-[#7a6b8a] text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2"
                                        >
                                            <Download size={18} />
                                            Download Asset PNG
                                        </button>
                                        <button
                                            onClick={() => window.print()}
                                            className="px-5 py-3 border-2 border-gray-200 text-gray-700 hover:bg-gray-50 font-bold rounded-xl transition-all duration-200 flex items-center gap-2"
                                        >
                                            <FileText size={18} />
                                            Print Poster Layout
                                        </button>
                                    </div>
                                </div>

                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>

            </div>
        </Layout>
    );
}
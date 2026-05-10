import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../../../ale/layout/Layout.jsx";
import { getContainerById } from "../../../services/containerService.js";
import { motion } from "framer-motion";
import {ArrowLeft, Clock, Save, Check, XCircle} from "lucide-react";
import {getCompanyById} from "../../../services/companyService.js";

export function CustomsbookingAction() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [forwarding, setForwarding] = useState(null);
    const [companyDetails, setCompanyDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [billingPartyName, setBillingPartyName] = useState(null);
// Add these inside your AkpsbookingAction function
    const [isRejecting, setIsRejecting] = useState(false);
    const [rejectReason, setRejectReason] = useState("");
    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const result = await getContainerById(id);
                console.log(result);
                setData(result);
                const forwardingId = result.booking?.forwardingId;
                const forwardingInfo = await getCompanyById(forwardingId);
                setForwarding(forwardingInfo);
                if (result.booking?.billingParty) {
                    try {
                        const company = await getCompanyById(result.booking.billingParty);
                        setBillingPartyName(company?.companyName || "N/A");
                    } catch {
                        setBillingPartyName("N/A");
                    }
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

    return (
        <Layout role="customs">
            <div className="space-y-6 max-w-7xl mx-auto pb-10">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-2 text-gray-500 hover:text-system-color mb-2 transition-colors"
                        >
                            <ArrowLeft size={16} /> Back to List
                        </button>
                        <h1 className="text-3xl font-black text-gray-800">Review Booking</h1>
                        <p className="text-gray-500 font-medium">Approve/Reject </p>
                    </div>
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

                    <Section title="Forwarding Information">
                        <InfoRow label="Name" value={forwarding.companyName} />
                        <InfoRow label="Address" value={forwarding.address} />
                        <InfoRow label="PIC Name" value={forwarding.picName} />
                        <InfoRow label="PIC Number" value={forwarding.handphoneNumber} />
                        <InfoRow label="PIC Email" value={forwarding.emailAddress} />
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


            </div>
            {/* Action Button */}
            {/* Action Buttons & Rejection Field */}
            <div className="max-w-7xl mx-auto px-6 pb-10">
                {!isRejecting ? (
                    // DEFAULT VIEW: Approve and Reject Buttons
                    <div className="flex justify-end gap-4 pt-4">
                        <button
                            type="button"
                            onClick={() => { /* Your Approve Logic */ }}
                            className="flex-1 md:flex-none flex items-center justify-center gap-3 bg-green-600 text-white px-10 py-4 rounded-2xl font-bold shadow-lg hover:bg-blue-700 transition-all active:scale-95"
                        >
                            <Check size={20} /> Approve
                        </button>

                        <button
                            type="button"
                            onClick={() => setIsRejecting(true)} // Shows the text field
                            className="flex-1 md:flex-none flex items-center justify-center gap-3 bg-red-600 text-white px-10 py-4 rounded-2xl font-bold shadow-lg hover:bg-red-700 transition-all active:scale-95"
                        >
                            <XCircle size={20} /> Reject
                        </button>
                    </div>
                ) : (
                    // REJECTION VIEW: Textarea and Confirm/Cancel
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-50 p-6 rounded-2xl border border-red-100 space-y-4"
                    >
                        <div>
                            <label className="block text-red-800 font-bold mb-2 text-sm uppercase">
                                Reason for Rejection
                            </label>
                            <textarea
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="Please explain why this booking is being rejected..."
                                className="w-full p-4 rounded-xl border-2 border-red-200 focus:border-red-500 focus:ring-0 transition-all h-32 resize-none"
                            />
                        </div>

                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => {
                                    setIsRejecting(false);
                                    setRejectReason("");
                                }}
                                className="px-6 py-3 font-bold text-gray-500 hover:text-gray-700"
                            >
                                Cancel
                            </button>
                            <button
                                disabled={!rejectReason.trim()}
                                onClick={() => { /* Your Logic to Save Reject Status + rejectReason */ }}
                                className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white shadow-lg transition-all 
                        ${!rejectReason.trim() ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}
                            >
                                <Save size={18} /> Confirm Rejection
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>

        </Layout>
    );
}
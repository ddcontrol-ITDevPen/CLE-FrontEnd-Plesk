import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../../layout/Layout.jsx";
import { getContainerById } from "../../../services/containerService.js";
import { motion } from "framer-motion";
import {ArrowLeft, Clock, FileText} from "lucide-react";
import ShipmentLog from "../../ROTComponents/ROTShipmentLog.jsx";
import {getCompanyById} from "../../../services/companyService.js";
import {getAssignedHaulierByContainerId} from "../../../services/assignedHaulier.js";

export function PortViewBooking() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [forwarding, setForwarding] = useState(null);
    const [companyDetails, setCompanyDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [billingPartyName, setBillingPartyName] = useState(null);
    const [assignedHaulier, setAssignedHaulier] = useState(null);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const result = await getContainerById(id);
                console.log(result);
                setData(result);
                const forwardingId = result.booking?.forwardingId;
                const forwardingInfo = await getCompanyById(forwardingId);
                setForwarding(forwardingInfo);
                const assignedHaulierData = await getAssignedHaulierByContainerId(id);
                setAssignedHaulier(assignedHaulierData);
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
        <Layout role="port">
            <div className="space-y-6 max-w-7xl mx-auto pb-10">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold">View ROT</h1>
                    <div className="flex items-center gap-4 ">
                        <button className="flex items-center bg-system-color text-white font-bold rounded-lg px-4 py-2 gap-3 cursor-pointer"
                                onClick={() => navigate(`/rot/view/pdf/${data.containerId}`)}>
                            <FileText
                                size={20}
                                className="text-blue-600-600 cursor-pointer hover:text-blue-800"/>
                            <p>e-ROT</p>
                        </button>
                        {data.status !== "Assigned" &&
                            <button className="flex items-center bg-system-color text-white font-bold rounded-lg px-4 py-2 gap-3 cursor-pointer"
                                    onClick={() => navigate(`/haulier/booking/view/eCSN/${data.containerId}`)}>
                                <FileText
                                    size={20}
                                    className="text-blue-600-600 cursor-pointer hover:text-blue-800" />
                                <p>e-CSN</p>
                            </button>
                        }
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-bold transition-all cursor-pointer"
                        >
                            <ArrowLeft size={18} /> Back
                        </button>
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
                {(data.status !== "Assigned" && data.status !== "Deleted" && data.status !== "Rejected") && (
                    <Section title="Enroute Information">
                        <InfoRow label="Driver" value={`${assignedHaulier?.driver?.name} (${assignedHaulier?.driver?.mobileNumber} / ${assignedHaulier?.driver?.emailAddress})`} />
                        <InfoRow label="PM Number" value={assignedHaulier.primeMover?.plateNumber} />
                        <InfoRow label="Trailer Number" value={`${assignedHaulier.trailer?.plateNumber} - ${assignedHaulier.trailer?.type}`} />
                        <InfoRow label="Time Slot" value={`${assignedHaulier?.timeSlot?.date} @ ${assignedHaulier?.timeSlot?.time}`} />
                        <InfoRow label="ROT Date" value={data.rotDate} />
                    </Section>
                )}

                {/* Log of Shipment (Timeline) */}
                {ShipmentLog(data)}
            </div>
        </Layout>
    );
}
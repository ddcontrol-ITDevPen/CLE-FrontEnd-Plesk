import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../../layout/Layout.jsx";
import {Printer, Download, ArrowLeft, MapPinned, Phone, Mail} from "lucide-react";
import { getContainerById } from "../../../services/containerService.js";
import {getCompanyById} from "../../../services/companyService.js";
import jsPDF from "jspdf";
import html2canvas from "html2canvas-pro";

export function ViewROTPDF() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [company, setCompany] = useState(null);
    const [billingPartyName, setBillingPartyName] = useState("");
    const pdfRef = useRef();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await getContainerById(id);
                setData(result);
                if (result.booking?.billingParty) {
                    try {
                        const company = await getCompanyById(result.booking.billingParty);
                        setBillingPartyName(company?.companyName || "N/A");
                    } catch {
                        setBillingPartyName("N/A");
                    }
                }
                console.log(result);
                const companyData = await getCompanyById(result.haulierId);
                console.log(companyData);
                setCompany(companyData);
            } catch (err) {
                console.error("Failed to fetch PDF data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleDownloadPDF = async () => {
        const element = pdfRef.current;

        const canvas = await html2canvas(element, {
            scale: 4,
            useCORS: true,
            logging: false,
            backgroundColor: "#ffffff",
        });

        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save(`eROT_${data.containerNumber || "Document"}.pdf`);
    };

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
    
    if (loading) return <div className="p-20 text-center">Generating PDF View...</div>;
    if (!data) return <div className="p-20 text-center text-red-500">Record not found.</div>;

    const booking = data.booking || {};

    return (
        <Layout role="forwarder">
            <div className="max-w-4xl mx-auto mb-10">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">View ROT PDF</h1>
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-system-color transition-colors">
                        <ArrowLeft size={20} /> Back to History
                    </button>
                </div>

                <div ref={pdfRef} className="bg-white shadow-2xl border border-gray-200 p-8 rounded-sm min-h-[1056px] font-sans text-[#333]" style = {{border: '1px solid #e5e7eb', padding: '32px', borderRadius: '2px', minHeight: '1056px', backgroundColor: '#ffffff', color: '#333333',}}>
                    {/* Header Section */}
                    <div className="flex justify-between items-start border-b-2 border-[#f3f4f6] pb-4 mb-4" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #f3f4f6', paddingBottom: '16px', marginBottom: '16px',}}>
                        <div className="flex items-center gap-4">
                            <img src={company?.logoPath || "/public/assets/CLE-Logo.png"} alt="Company Logo" className="h-20 object-contain" style={{ height: '80px', objectFit: 'contain' }}/>
                            <div className="space-y-0.5">
                                <h2 className="text-2xl font-bold" style={{ fontSize: '24px', fontWeight: 'bold', margin: '0' }}>{company.companyName}</h2>
                                <div className="flex items-start gap-2 text-[12px] max-w-md"
                                     style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12px', maxWidth: '448px', color: '#6a7282' }}>
                                    <MapPinned size={15} className="shrink-0" style={{ color: '#0054dc' }}/>
                                    <span>{company.address}</span>
                                </div>
                                <div className="flex items-start gap-2 text-[12px]"
                                     style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12px', color: '#6a7282' }}>
                                    <Phone size={15} className="shrink-0" style={{ color: '#0054dc' }}/>
                                    <span>{company.telephoneNumber}</span>
                                </div>
                                <div className="flex items-start gap-2 text-[12px]"
                                     style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12px', color: '#6a7282' }}>
                                    <Mail size={15} className="shrink-0" style={{ color: '#0054dc' }}/>
                                    <span>{company.emailAddress}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="text-center py-1 font-bold text-[-16px] tracking-widest mb-4"
                         style={{display: 'flex', justifyContent: 'space-between', textAlign: 'center', paddingTop: '4px', paddingBottom: '4px', paddingLeft: '25px', paddingRight: '25px', fontWeight: 'bold', fontSize: '16px', letterSpacing: '0.1em', marginBottom: '16px', backgroundColor: '#0054dc', color: '#ffffff',}}>
                        <p>e-ROT</p>
                        <p>{booking.rotNumber}</p>
                    </div>

                    {/* Section: General Details */}
                    <PDFSectionHeader title="General Details" />
                    <div className="grid grid-cols-2 gap-x-4 mb-6" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: '16px', marginBottom: '24px' }}>
                        <PDFRow label="Movement Type" value={booking.movementType} />
                        <PDFRow label="Type of Trip" value={booking.tripType} />
                        <PDFRow label="BL/Booking Number" value={booking.blOrBookingNumber} />
                        <PDFRow label="SCN" value={booking.scn} />
                        <PDFRow label="POD/POL" value={booking.portLocation} />
                        <PDFRow label="ETA" value={booking.eta?.split('T')[0]} />
                        <PDFRow label="Seal No." value={booking.sealNumber} />
                        <PDFRow label="Forwarder Remarks" value={booking.forwarderRemarks} />
                    </div>

                    {/* Section: Shipping Details */}
                    <PDFSectionHeader title="Shipping Details" />
                    <div className="grid grid-cols-2 gap-x-4 mb-6" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: '16px', marginBottom: '24px' }}>
                        <PDFRow label="Pickup From" value={getLocationName(data, "from")} />
                        <PDFRow label="Send To" value={getLocationName(data, "to")} />
                        <PDFRow label="Forwarding Agent" value={booking.forwardingName} />
                        <PDFRow label="Haulier" value={data.haulierName} />
                        <PDFRow label="Shipping Agent" value={booking.shippingAgentName} />
                        <PDFRow label="Billing Party" value={billingPartyName} />
                    </div>

                    {/* Section: Container Details */}
                    <PDFSectionHeader title="Container Details" />
                    <div className="grid grid-cols-2 gap-x-4 mb-6" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: '16px', marginBottom: '24px' }}>
                        <PDFRow label="Container No." value={data.containerNumber} />
                        <PDFRow label="Size" value={data.containerSize} />
                        <PDFRow label="Type" value={data.containerType} />
                        <PDFRow label="VGM" value={data.vgm} />
                        <PDFRow label="Trailer Type" value={data.trailerType} />
                        <PDFRow label="Depot" value={data.depotName} />
                        <PDFRow label="Consignee" value={data.consigneeName} />
                        <PDFRow label="Port" value={data.portName} />
                        <PDFRow label="To Address" value={data.toAddress?.[0]?.address} isFullWidth={true} />
                        <PDFRow label="ROT Date" value={data.rotDate?.split('T')[0]} />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-center gap-12 mt-8">
                    <button onClick={() => window.print()} className="flex flex-col items-center gap-2 group">
                        <div className="p-4 bg-blue-100 rounded-full text-blue-700 group-hover:bg-blue-700 group-hover:text-white transition-all">
                            <Printer size={28} />
                        </div>
                        <span className="font-bold text-gray-700">Print</span>
                    </button>
                    <button onClick={handleDownloadPDF} className="flex flex-col items-center gap-2 group">
                        <div className="p-4 bg-blue-100 rounded-full text-blue-700 group-hover:bg-blue-700 group-hover:text-white transition-all">
                            <Download size={28} />
                        </div>
                        <span className="font-bold text-gray-700">Download</span>
                    </button>
                </div>
            </div>
        </Layout>
    );
}

const PDFSectionHeader = ({ title }) => (
    <div style={{
        backgroundColor: '#8E7F9F',
        color: '#ffffff',
        padding: '4px 16px',
        fontSize: '16px',
        fontWeight: 'bold',
        width: 'fit-content',
        marginBottom: '8px',
        borderRadius: '2px',
        textTransform: 'uppercase',
        fontStyle: 'italic',
    }}>
        {title}
    </div>
);

const PDFRow = ({ label, value }) => (
    <div className="flex border border-[#d1d5dc] -mb-px" style={{ display: 'flex', border: '1px solid #d1d5dc', marginBottom: '-1px', }}>
        <div style={{
            width: '33.33%',
            padding: '6px',
            fontSize: '13px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#364153',
            color: '#ffffff',
        }}>
            {label}
        </div>
        <div style={{
            width: '66.67%',
            padding: '6px',
            fontSize: '11px',
            display: 'flex',
            alignItems: 'center',
            minHeight: '24px',
            backgroundColor: '#ffffff',
            color: '#364153',
        }}>
            {value || "N/A"}
        </div>
    </div>
);
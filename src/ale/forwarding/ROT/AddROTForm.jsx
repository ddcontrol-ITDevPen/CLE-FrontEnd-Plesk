import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../layout/Layout.jsx";
import { motion, AnimatePresence } from "framer-motion";
import {CircleChevronDown, LucideArrowBigRightDash, LucideShieldUser, LucideTruck, Trash2, Upload} from "lucide-react";
import {getCompanies} from "../../../services/companyService.js";
import {getAleBookings, registerAleBooking} from "../../../services/aleBookingService.js";
import {getUserById} from "../../../services/userService.js";
import {toast, Toaster} from "sonner";
import {registerAleBookingDocument} from "../../../services/aleBookingDocumentService.js";
import {registerAleContainer} from "../../../services/aleContainerService.js";

export function ALEAddROTForm() {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [isLoadingPorts, setIsLoadingPorts] = useState(false);
    const [hauliers, setHauliers] = useState([]);
    const [airlines, setAirlines] = useState([]);
    const [billingParties, setBillingParties] = useState([]);
    const [terminals, setTerminals] = useState([]);
    const [consignees, setConsignees] = useState([]);
    const [terminalChoice, setTerminalChoice] = useState([]);
    const [haulierChoice, setHaulierChoice] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const rotNumberGenerator = () => {
        const newNumber = (Math.floor(Math.random() * 9000000000) + 1).toString().padStart(10, "0");
        return "CLE" + newNumber;
    }

    const [formData, setFormData] = useState({
        movementType: "",
        rotNumber: rotNumberGenerator(),
        awbNumber: "",
        houseAWBNumber: "",
        flightNumber: "",
        terminalLocation: "",
        eta: "",
        sealNo: "",
        forwardingRemarks: "",
        customFormType: "",
        customFormNo: "",
        customReceiptNo: "",
        dicNumber: "",
        zbNumber: "",
        airline: "",
        billingParty: "",
        truckQuantity: 1,
        packageQuantity: 1,
        containerType: "",
        containerSize: "",
        vgm: "",
        volumeMetricWeight: "",
        trailerType: "",
        rotDate: "",
        haulier: "",
        consignee: "",
        // terminal: "",
        // terminalChoice: "Single",
        haulierChoice: "Single",
        externalConsigneeName: "",
        externalConsigneeAddress: "",
        externalConsigneeContact: "",
    });

    const [documents, setDocuments] = useState({
        doForm: null,
        customForm: null,
        packingList: null,
        otherDoc: null
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        const savedData = JSON.parse(localStorage.getItem("pendingROT") || "{}");
        setFormData(prev => ({
            ...prev,
            movementType: savedData.movementType || "Import",
            rotNumber: savedData.rotNumber || rotNumberGenerator(),
            awbNumber: savedData.awbNumber || "",
            houseAWBNumber: savedData.houseAWBNumber || "",
            flightNumber: savedData.flightNumber || "",
            terminalLocation: savedData.terminalLocation || "",
            eta: savedData.eta || "",
            sealNo: savedData.sealNo || "",
            forwardingRemarks: savedData.forwardingRemarks || "",
            customFormType: savedData.customFormType || "",
            customFormNo: savedData.customFormNo || "",
            customReceiptNo: savedData.customReceiptNo || "",
            dicNumber: savedData.dicNumber || "",
            zbNumber: savedData.zbNumber || "",
            forwarding: savedData.forwarding || localStorage.getItem("companyName") || "",
            airline: savedData.airline || "",
            billingParty: savedData.billingParty || "",
            truckQuantity: savedData.truckQuantity || 1,
            packageQuantity: savedData.packageQuantity || 1,
            containerType: savedData.containerType || "",
            containerSize: savedData.containerSize || "",
            vgm: savedData.vgm || "",
            volumeMetricWeight: savedData.volumeMetricWeight || "",
            trailerType: savedData.trailerType || "",
            rotDate: savedData.rotDate || "",
            haulier: savedData.haulier || "",
            consignee: savedData.consignee || "",
            // terminal: savedData.terminal || "",
            // terminalChoice: savedData.terminalChoice || "Single",
            haulierChoice: savedData.haulierChoice || "Single",
            externalConsigneeName: savedData.externalConsigneeName || "",
            externalConsigneeAddress: savedData.externalConsigneeAddress || "",
            externalConsigneeContact: savedData.externalConsigneeContact || "",
        }));
        const fetchData = async () => {
            setIsLoadingPorts(true);
            try {
                const data = await getCompanies();
                if (Array.isArray(data)) {
                    const terminalLocations = data.filter(c => c.role === "Terminal").map(c => ({companyName: c.companyName, companyCode: c.companyCode}));
                    const haulier = data.filter(h => h.role === "Haulier").map(h => ({companyName: h.companyName, companyCode: h.companyCode}));
                    const airline = data.filter(h => h.role === "Airline").map(h => ({companyName: h.companyName, companyCode: h.companyCode}));
                    const currentForwardingName = localStorage.getItem("companyName") || "Forwarding";
                    const user = await getUserById(localStorage.getItem("userId"));
                    const currentForwardingCode = user.companyCode;
                    const consignees = data.filter(h => h.role === "Consignee").map(h => ({companyName: h.companyName, companyCode: h.companyCode, address: h.address}));
                    const billingParty = [{companyName: currentForwardingName, companyCode: currentForwardingCode}, ...consignees];
                    setTerminals(terminalLocations);
                    setHauliers(haulier);
                    setAirlines(airline);
                    setBillingParties(billingParty);
                    setConsignees(consignees);
                }
                const bookings = await getAleBookings();
                setBookings(bookings || []);
            } catch (error) {
                console.error("Failed to load data:", error);
                setHauliers([]);
                setAirlines([]);
                setBillingParties([]);
                setConsignees([]);
                setTerminals([]);
            } finally {
                setIsLoadingPorts(false);
            }
        };
        fetchData();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newData = { ...prev, [name]: value };
            if (name === "haulierChoice" && value === "Multiple") newData.haulier = "";
            //if (name === "terminalChoice" && value === "Multiple") newData.terminal = "";
            return newData;
        });
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    };

    const handleFileChange = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            setDocuments(prev => ({
                ...prev,
                [type]: file
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};
        
        if (!formData.movementType) newErrors.movementType = `Movement Type is required!`;
        // const refLabel = formData.movementType === "Import" ? "BL Number" : "Booking Number";
        // const portLabel = formData.movementType === "Import" ? "POD" : "POL";
        
        if (!formData.awbNumber) newErrors.awbNumber = `Air WayBill Number is required!`;
        if (!formData.houseAWBNumber) newErrors.houseAWBNumber = "House BL Number is required!";
        if (!formData.flightNumber) newErrors.flightNumber = "Flight Number is required!";
        if (!formData.terminalLocation) newErrors.terminalLocation = `Terminal is required!`;
        if (!formData.eta) newErrors.eta = "ETA is required!";
        if (!formData.customFormNo) newErrors.customFormNo = "Custom Form Number is required!";
        //if (!formData.customReceiptNo) newErrors.customReceiptNo = "Custom Receipt No is required!";
        //if (!formData.dicNumber) newErrors.dicNumber = "DIC Number is required!";
        //if (!formData.zbNumber) newErrors.zbNumber = "Zon Bebas Number is required!";

        if (!formData.truckQuantity) {newErrors.truckQuantity = "Number of Trucks is required!";}
        else if (isNaN(formData.truckQuantity)) {newErrors.truckQuantity = "Truck Quantity should be a number!";}
        else if (Number(formData.truckQuantity) <= 0) {newErrors.truckQuantity = "Truck Quantity must be greater than zero!";}

        if (!formData.packageQuantity) {newErrors.packageQuantity = "Number of Packages is required!";}
        else if (isNaN(formData.packageQuantity)) {newErrors.packageQuantity = "Package Quantity should be a number!";}
        else if (Number(formData.packageQuantity) <= 0) {newErrors.packageQuantity = "Package Quantity must be greater than zero!";}
        
        if (!formData.airline) newErrors.airline = "Shipping Agent is required!";
        if (!formData.billingParty) newErrors.billingParty = "Billing Party is required!";
        if (!formData.containerType) newErrors.containerType = "Container Type is required!";
        if (!formData.containerSize) newErrors.containerSize = "Container Size is required!";


        if (!formData.haulierChoice) {
            newErrors.haulierChoice = "Haulier choice is required!";
        } else if (formData.haulierChoice === "Single" && !formData.haulier) {
            newErrors.haulier = "Please select a Haulier!";
        }

        // if (!formData.terminalChoice) {
        //     newErrors.terminalChoice = "Terminal choice is required!";
        // } else if (formData.terminalChoice === "Single" && !formData.terminal) {
        //     newErrors.terminal = "Please select a Terminal!";
        // }

        if (!formData.terminalLocation) newErrors.terminalLocation = "Please select a Terminal!";
        if (!formData.rotDate) newErrors.rotDate = "ROT Date is required!";

        if (!formData.consignee) {
            newErrors.consignee = "Please select a Consignee!";
        } else if (formData.consignee === "Other") {
            if (!formData.externalConsigneeName) newErrors.externalConsigneeName = "Consignee Name is required!";
            if (!formData.externalConsigneeAddress) newErrors.externalConsigneeAddress = "Consignee Address is required!";
            if (!formData.externalConsigneeContact) newErrors.externalConsigneeContact = "Consignee Contact Information is required!";
        }

        // const isBookingNumberDuplicate = bookings.some(
        //     (b) => b.blOrBookingNumber?.toLowerCase() === formData.awbNumber?.toLowerCase()
        // );
        // if (isBookingNumberDuplicate) {
        //     newErrors.awbNumber = `Booking Number already exists, please enter another number!`;
        // }
        
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        setIsSubmitting(true);
        try{
            const userData = await getUserById(localStorage.getItem("userId"));
            const companyCode = await userData.companyCode;
            const bookingPayload = {
                rotNumber: formData.rotNumber,
                awbNumber: formData.awbNumber,
                houseAWBNumber: formData.houseAWBNumber,
                movementType: formData.movementType,
                //tripType: formData.tripType,
                flightNumber: formData.flightNumber,
                terminalLocation: formData.terminalLocation,
                eta: formData.eta,
                commodity: formData.commodity,
                specialHandling: formData.specialHandling,
                sealNumber: formData.sealNo,
                forwardingRemarks: formData.forwardingRemarks,
                forwardingId: companyCode,
                airlineId: formData.airline,
                billingParty: formData.billingParty,
                customFormType: formData.customFormType,
                customFormNo: formData.customFormNo || "",
                customReceiptNo: formData.customReceiptNo || "",
                dicNumber: formData.dicNumber || "",
                zbNumber: formData.zbNumber || "",
                truckQuantity: Number(formData.truckQuantity),
            };
            console.log(bookingPayload);

            const savedBooking = await registerAleBooking(bookingPayload);
            const rotNumber = savedBooking.rotNumber;

            const docTypes = {
                doForm: "DO Form",
                customForm: "Custom Form",
                packingList: "Packing List",
                otherDoc: "Other Document"
            };

            for (const [key, file] of Object.entries(documents)) {
                if (file) {
                    const docFormData = new FormData();
                    docFormData.append("DocumentType", docTypes[key]);
                    docFormData.append("ROTNumber", formData.rotNumber);
                    docFormData.append("FileName", file.name);
                    docFormData.append("File", file);
                    await registerAleBookingDocument(docFormData);
                }
            }

            const totalTrucks = Number(formData.truckQuantity) || 1;
            for (let i = 0; i < totalTrucks; i++) {
                const formattedRotDate = formData.rotDate ? new Date(formData.rotDate).toISOString().split('T')[0] : null;
                const containerPayload = {
                    packageQuantity: Number(formData.packageQuantity),
                    ContainerType: formData.containerType,
                    ContainerSize: formData.containerSize,
                    VGM: formData.vgm === "" ? null : formData.vgm,
                    TerminalId: formData.terminalLocation || null,
                    HaulierId: formData.haulier || null,
                    ROTDate: formattedRotDate,
                    Status: "Assigned",
                    AssignedTime: new Date().toISOString(),
                    ROTNumber: rotNumber,
                };
                
                if (formData.consignee && formData.consignee !== "Other") {
                    const selectedConsignee = consignees.find(c => c.companyCode === formData.consignee);
                    containerPayload.ConsigneeId = formData.consignee;
                    containerPayload.ToAddress = selectedConsignee?.address
                        ? [{ Address: selectedConsignee.address }]
                        : [];
                } else {
                    containerPayload.externalConsigneeName = formData.externalConsigneeName;
                    containerPayload.externalConsigneeAddress = formData.externalConsigneeAddress;
                    containerPayload.externalConsigneeContact = formData.externalConsigneeContact;
                }
                console.log(`Saving Container ${i + 1}:`,containerPayload);
                await registerAleContainer(containerPayload);
            }

            toast.success("ROT Booking and all containers saved successfully!");
            localStorage.removeItem("pendingROT");
            setTimeout(() => navigate("/ale/forwarding/rot/history"), 2000);
        } catch (error) {
            console.error("Save failed:", error);
            if (error.response && error.response.data) {
                console.log("Backend Validation Errors:", error.response.data);
            }
            setIsSubmitting(false);
            toast.error(error.response?.data?.message || "Failed to save record. Please check your connection.");
        }
    };

    const date = new Date();
    date.setDate(date.getDate() - 1);
    const yesterday = date.toISOString().split('T')[0];

    return (
        <Layout role="forwarder">
            <Toaster richColors position="top-right" />
            <div className="max-w-6xl">
                <h1 className="text-3xl font-bold text-text-heading mb-8">Create New ROT - Forwarding</h1>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <section>
                        {/* --- SECTION 1: BOOKING INFORMATION --- */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 flex items-center gap-4 border-b border-blue-100">
                                <div className="bg-system-color p-2 rounded-lg text-white">
                                    <CircleChevronDown size={24} className="rotate-180" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-800">Booking Information</h2>
                                    <p className="text-sm text-system-color/70">Primary shipment and party details</p>
                                </div>
                            </div>

                            <div className="p-8 space-y-8">
                                {/* Movement Type Radio Row */}
                                <div className="flex items-center gap-12 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <span className="text-sm font-semibold text-gray-700">Movement Type <span className="text-red-500">*</span></span>
                                    <div className="flex gap-6">
                                        {['Import', 'Export'].map((type) => (
                                            <label key={type} className="flex items-center gap-2 cursor-pointer group">
                                                <input
                                                    type="radio"
                                                    name="movementType"
                                                    checked={formData.movementType === type}
                                                    value={type}
                                                    onChange={handleChange}
                                                    className="w-4 h-4 accent-blue-600"
                                                />
                                                <span className={`text-sm ${formData.movementType === type ? 'font-bold text-system-color' : 'text-gray-500'}`}>{type}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <InputField label="AWB No." name="awbNumber" value={formData.awbNumber} onChange={handleChange} error={errors.awbNumber} required />
                                    <InputField label="House AWB No." name="houseAWBNumber" value={formData.houseAWBNumber} onChange={handleChange} error={errors.houseAWBNumber} required/>
                                    <InputField label="Flight No." name="flightNumber" value={formData.flightNumber} onChange={handleChange} error={errors.flightNumber} required />
                                    <SelectField label="Terminal" name="terminalLocation" value={formData.terminalLocation} onChange={handleChange} error={errors.terminalLocation} required options={terminals.map(p => ({label: p.companyName, value: p.companyCode}))} />
                                    <SelectField label="Airline" name="airline" value={formData.airline} onChange={handleChange} error={errors.airline} required options={airlines.map(s => ({label: s.companyName, value: s.companyCode}))} />
                                    <SelectField label="Billing Party" name="billingParty" value={formData.billingParty} onChange={handleChange} error={errors.billingParty} required options={billingParties.map(b => ({label: b.companyName, value: b.companyCode}))} />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Haulier Choice */}
                                    <div className="flex flex-col gap-2 p-4 bg-blue-50/30 rounded-xl border border-blue-100">
                                        <label className="text-sm font-semibold text-gray-800">Trucker Assignment <span className="text-red-500">*</span></label>
                                        <div className="flex items-center gap-4 h-12">
                                            <label className="flex items-center gap-2 min-w-[120px] cursor-pointer">
                                                <input type="checkbox" checked={formData.haulierChoice === "Multiple"} onChange={(e) => handleChange({ target: { name: 'haulierChoice', value: e.target.checked ? "Multiple" : "Single" }})} className="w-4 h-4 rounded text-system-color"/>
                                                <span className="text-xs font-medium text-gray-600 italic">Multiple</span>
                                            </label>
                                            {formData.haulierChoice === "Single" && (
                                                <div className="flex-1 -mt-5">
                                                    <SelectField label="" name="haulier" value={formData.haulier} onChange={handleChange} error={errors.haulier} options={hauliers.map(h => ({label: h.companyName, value: h.companyCode}))} />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Terminal Choice */}
                                    {/*<div className="flex flex-col gap-2 p-4 bg-blue-50/30 rounded-xl border border-blue-100">*/}
                                    {/*    <label className="text-sm font-semibold text-gray-800">Terminal Assignment <span className="text-red-500">*</span></label>*/}
                                    {/*    <div className="flex items-center gap-4 h-12">*/}
                                    {/*        <label className="flex items-center gap-2 min-w-[120px] cursor-pointer">*/}
                                    {/*            <input type="checkbox" checked={formData.terminalChoice === "Multiple"} onChange={(e) => handleChange({ target: { name: 'terminalChoice', value: e.target.checked ? "Multiple" : "Single" }})} className="w-4 h-4 rounded text-system-color"/>*/}
                                    {/*            <span className="text-xs font-medium text-gray-600 italic">Multiple</span>*/}
                                    {/*        </label>*/}
                                    {/*        {formData.terminalChoice === "Single" && (*/}
                                    {/*            <div className="flex-1 -mt-5">*/}
                                    {/*                <SelectField label="" name="terminal" value={formData.terminal} onChange={handleChange} options={terminals.map(d => ({label: d.companyName, value: d.companyCode}))} error={errors.terminal} />*/}
                                    {/*            </div>*/}
                                    {/*        )}*/}
                                    {/*    </div>*/}
                                    {/*</div>*/}
                                    <SelectField label="Consignee/Shipper" name="consignee" required options={[{ label: "Other", value: "Other" }, ...consignees.map(t => ({label: t.companyName, value: t.companyCode}))]} value={formData.consignee} onChange={handleChange} error={errors.consignee}/>
                                    {formData.consignee === "Other" && (
                                        <>
                                            <InputField label="Consignee/Shipper Name" name="externalConsigneeName" value={formData.externalConsigneeName} onChange={handleChange} error={errors.externalConsigneeName} required />
                                            <InputField label="Consignee/Shipper Address" name="externalConsigneeAddress" value={formData.externalConsigneeAddress} onChange={handleChange} error={errors.externalConsigneeAddress} required />
                                            <InputField label="Consignee/Shipper Contact Information" name="externalConsigneeContact" value={formData.externalConsigneeContact} onChange={handleChange} placeholder="012-3456789, john@example.com" error={errors.externalConsigneeContact} required />
                                        </>
                                    )}
                                    <InputField label="Forwarding Remarks" name="forwardingRemarks" value={formData.forwardingRemarks} onChange={handleChange} placeholder="* Commodity/Special Handling/Others *" />
                                </div>
                            </div>
                        </div>

                        {/* --- SECTION 2: TRUCK DETAILS --- */}
                        <div className="bg-white rounded-2xl shadow-sm border mt-5 border-gray-100 overflow-hidden">
                            <div className="bg-gradient-to-r from-gray-100 to-slate-200 p-6 flex items-center gap-4 border-b border-gray-200">
                                <div className="bg-gray-700 p-2 rounded-lg text-white">
                                    <LucideTruck size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-800">Truck Details</h2>
                                    <p className="text-sm text-gray-500">Specifications and quantities</p>
                                </div>
                            </div>
                            <div className="p-8">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                    <InputField label="Truck Quantity" name="truckQuantity" value={formData.truckQuantity} onChange={handleChange} error={errors.truckQuantity} required />
                                    <InputField label="Package Quantity" name="packageQuantity" value={formData.packageQuantity} onChange={handleChange} error={errors.packageQuantity} required />
                                    <SelectField label="Type" name="containerType" required options={["GP", "RF", "HC"]} value={formData.containerType} onChange={handleChange} error={errors.containerType} />
                                    <SelectField label="Size" name="containerSize" required options={["20", "40", "45"]} value={formData.containerSize} onChange={handleChange} error={errors.containerSize} />
                                    <InputField label="ROT Date" name="rotDate" type="date" value={formData.rotDate} onChange={handleChange} error={errors.rotDate} required />
                                    <InputField label="VGM" subLabel="Optional" name="vgm" value={formData.vgm} onChange={handleChange} />
                                    {/*<SelectField label="Trailer" name="trailerType" options={["Normal", "Tipper", "Air", "SL"]} value={formData.trailerType} onChange={handleChange} />*/}
                                    <InputField label="Volumetric Weight" subLabel="Optional" name="volumeMetricWeight" value={formData.volumeMetricWeight} onChange={handleChange} />
                                </div>
                            </div>
                        </div>

                        {/* --- SECTION 3: CUSTOMS & TRACKING --- */}
                        <div className="bg-white rounded-2xl shadow-sm border mt-5 border-gray-100 overflow-hidden">
                            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 flex items-center gap-4 border-b border-purple-100">
                                <div className="bg-purple-600 p-2 rounded-lg text-white">
                                    <LucideShieldUser size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-800">Customs & Tracking</h2>
                                    <p className="text-sm text-purple-600/70">Regulatory and reference numbers</p>
                                </div>
                            </div>
                            <div className="p-8 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <InputField label="ETA" name="eta" type="date" value={formData.eta} onChange={handleChange} error={errors.eta} required min={yesterday} />
                                    <SelectField label="Custom Form Type" name="customFormType" required options={["K1", "K2", "K8"]} value={formData.customFormType} onChange={handleChange} error={errors.customFormType} />
                                    <InputField label="Custom Form No." name="customFormNo" value={formData.customFormNo} onChange={handleChange} error={errors.customFormNo} required />
                                    <InputField label="Custom Receipt No." name="customReceiptNo" value={formData.customReceiptNo} onChange={handleChange} />
                                    <InputField label="DIC No." name="dicNumber" value={formData.dicNumber} onChange={handleChange} />
                                    <InputField label="FCZ No." name="zbNumber" value={formData.zbNumber} onChange={handleChange} />
                                    <InputField label="Seal No." name="sealNo" value={formData.sealNo} onChange={handleChange} />
                                </div>
                            </div>
                        </div>

                        {/* --- SECTION 4: FORMS & DOCUMENTS --- */}
                        <div className="bg-white rounded-2xl shadow-sm border mt-5 border-gray-100 overflow-hidden">
                            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 flex items-center gap-4 border-b border-purple-100">
                                <div className="bg-orange-600 p-2 rounded-lg text-white">
                                    <LucideShieldUser size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-800">Forms & Documents</h2>
                                    <p className="text-sm text-orange-600/70">Additional or supporting document</p>
                                </div>
                            </div>
                            <div className="p-8 space-y-6">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                    <FileUpload label="DO Form" fileName={documents.doForm?.name} onChange={(e) => handleFileChange(e, "doForm")} onRemove={() => setDocuments(prev => ({ ...prev, doForm: null }))} />
                                    <FileUpload label="Custom Form" fileName={documents.customForm?.name} onChange={(e) => handleFileChange(e, "customForm")} onRemove={() => setDocuments(prev => ({ ...prev, customForm: null }))} />
                                    <FileUpload label="Packing List/Invoice" fileName={documents.packingList?.name} onChange={(e) => handleFileChange(e, "packingList")} onRemove={() => setDocuments(prev => ({ ...prev, packingList: null }))} />
                                    <FileUpload label="Other Document" fileName={documents.otherDoc?.name} onChange={(e) => handleFileChange(e, "otherDoc")} onRemove={() => setDocuments(prev => ({ ...prev, otherDoc: null }))} />
                                </div>
                            </div>
                        </div>
                    </section>

                    <div className="flex justify-end pt-4">
                        <button type="submit" className="group flex items-center gap-3 bg-system-color text-white px-12 py-4 rounded-lg font-bold shadow-lg hover:bg-system-color-dark hover:-translate-y-1 transition-all active:scale-95">
                            {isSubmitting ? "Processing..." : "Submit"}
                            <LucideArrowBigRightDash size={24} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </form>
            </div>
        </Layout>
    );
}

const InputField = ({ label, subLabel, name, value, onChange, error, type = "text", required, placeholder, min, max, readOnly }) => (
    <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold">{label} {required && <span className="text-red-500">*</span>}
            {subLabel && (
                <span className="ml-1 text-xs font-normal italic text-gray-400">
                    ({subLabel})
                </span>
            )}
        </label>
        <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            min={min}
            max={max}
            className={`p-3 rounded-xl border ${readOnly ? "bg-gray-200" : "bg-white"} shadow-sm focus:ring-2 focus:ring-system-color outline-none transition-all ${error ? 'border-red-500' : 'border-gray-200'}`}
        />
        <AnimatePresence>
            {error && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[11px] text-red-600 font-medium leading-tight mt-1">
                    {error}
                </motion.span>
            )}
        </AnimatePresence>
    </div>
);

const SelectField = ({ label, name, value, onChange, error, required, options }) => (
    <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold">{label} {required && <span className="text-red-500">*</span>}</label>
        <div className="relative group w-full">
            <select
                name={name}
                value={value}
                onChange={onChange}
                className={`p-3 pr-8 w-full rounded-xl border bg-white shadow-sm focus:ring-2 focus:ring-system-color outline-none appearance-none transition-all ${error ? 'border-red-500' : 'border-gray-200'} truncate`}
            >
                <option value="">Select...</option>
                {options.map((opt, index) => {
                    const isObj = typeof opt === 'object';
                    const val = isObj ? opt.value : opt;
                    const lab = isObj ? opt.label : opt;
                    return (<option key={index} value={val}>{lab}</option>);})}
            </select>
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400 group-hover:text-system-color transition-colors">
                <CircleChevronDown size={18} />
            </div>
        </div>
        <AnimatePresence>
            {error && (
                <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-[11px] text-accent-danger font-semibold mt-1 ml-1"
                >
                    {error}
                </motion.span>
            )}
        </AnimatePresence>
    </div>
);

const FileUpload = ({ label, onChange, fileName, onRemove }) => (
    <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold">{label}</label>
        <div className="relative group">
            <div className="p-3 rounded-xl border border-gray-200 bg-white flex justify-between items-center text-gray-400 cursor-pointer">
                <span className="truncate">{fileName || "Upload Doc"}</span>
                {fileName ? (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            onRemove();
                        }}
                        className="text-red-500 hover:scale-110 transition-transform z-10"
                    >
                        <Trash2 size={18} />
                    </button>
                ) : (
                    <Upload size={18} />
                )}
            </div>
            {!fileName && (
                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={onChange}/>
            )}
        </div>
    </div>
);
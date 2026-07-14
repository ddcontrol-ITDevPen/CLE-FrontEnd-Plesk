import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../layout/Layout.jsx";
import { motion, AnimatePresence } from "framer-motion";
import {CircleChevronDown, LucideArrowBigRightDash, LucideShieldUser, LucideTruck} from "lucide-react";
import {getCompanies} from "../../../services/companyService.js";
import {getBookings} from "../../../services/bookingService.js";
import {getUserById} from "../../../services/userService.js";

export function AddROTForm() {
    const navigate = useNavigate();
    const [ports, setPorts] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [isLoadingPorts, setIsLoadingPorts] = useState(false);
    const [hauliers, setHauliers] = useState([]);
    const [shippingAgents, setShippingAgents] = useState([]);
    const [billingParties, setBillingParties] = useState([]);
    const [depots, setDepots] = useState([]);
    const [consignees, setConsignees] = useState([]);
    const [depotChoice, setDepotChoice] = useState([]);
    const [haulierChoice, setHaulierChoice] = useState([]);

    const rotNumberGenerator = () => {
        const newNumber = (Math.floor(Math.random() * 9000000000) + 1).toString().padStart(10, "0");
        return "CLE" + newNumber;
    }

    const [formData, setFormData] = useState({
        movementType: "",
        tripType: "",
        rotNumber: rotNumberGenerator(),
        bookingNumber: "",
        houseBLNumber: "",
        scn: "",
        portLocation: "",
        eta: "",
        sealNo: "",
        forwardingRemarks: "",
        customFormNo: "",
        customReceiptNo: "",
        dicNumber: "",
        zbNumber: "",
        shippingAgent: "",
        billingParty: "",
        containerQuantity: 1,
        containerType: "",
        containerSize: "",
        vgm: "",
        trailerType: "",
        rotDate: "",
        haulier: "",
        consignee: "",
        depot: "",
        depotChoice: "Single",
        haulierChoice: "Single",
        // ADD THESE
        externalConsigneeName: "",
        externalConsigneeAddress: "",
        externalConsigneeContact: "",
        externalConsigneeEmail: "",
        commodity:"",
        forwardingPicName: "",
        forwardingPicEmail: "",
        forwardingPicContact: "",
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        const savedData = JSON.parse(localStorage.getItem("pendingROT") || "{}");
        setFormData(prev => ({
            ...prev,
            movementType: savedData.movementType || "Import",
            tripType: savedData.tripType || "Round Trip",
            rotNumber: savedData.rotNumber || rotNumberGenerator(),
            bookingNumber: savedData.bookingNumber || "",
            houseBLNumber: savedData.houseBLNumber || "",
            scn: savedData.scn || "",
            portLocation: savedData.portLocation || "",
            eta: savedData.eta || "",
            sealNo: savedData.sealNo || "",
            forwardingRemarks: savedData.forwardingRemarks || "",
            customFormNo: savedData.customFormNo || "",
            customReceiptNo: savedData.customReceiptNo || "",
            dicNumber: savedData.dicNumber || "",
            zbNumber: savedData.zbNumber || "",
            forwarding: savedData.forwarding || localStorage.getItem("companyName") || "",
            shippingAgent: savedData.shippingAgent || "",
            billingParty: savedData.billingParty || "",
            containerQuantity: savedData.containerQuantity || 1,
            containerType: savedData.containerType || "",
            containerSize: savedData.containerSize || "",
            vgm: savedData.vgm || "",
            trailerType: savedData.trailerType || "",
            rotDate: savedData.rotDate || "",
            haulier: savedData.haulier || "",
            consignee: savedData.consignee || "",
            depot: savedData.depot || "",
            depotChoice: savedData.depotChoice || "Single",
            haulierChoice: savedData.haulierChoice || "Single",
            // ADD THESE
            externalConsigneeName: savedData.externalConsigneeName || "",
            externalConsigneeAddress: savedData.externalConsigneeAddress || "",
            externalConsigneeContact: savedData.externalConsigneeContact || "",
            externalConsigneeEmail: savedData.externalConsigneeEmail || "",
            commodity: savedData.commodity || "",
            forwardingPicName: savedData.forwardingPicName || "",
            forwardingPicEmail: savedData.forwardingPicEmail || "",
            forwardingPicContact: savedData.forwardingPicContact || "",
        }));
        const fetchData = async () => {
            setIsLoadingPorts(true);``
            try {
                const data = await getCompanies();

                if (Array.isArray(data)) {

                    // Get logged-in user
                    const user = await getUserById(localStorage.getItem("userId"));
                    const currentForwardingCode = user.companyCode;

                    // Find user's company
                    const userCompany = data.find(
                        c => c.companyCode === currentForwardingCode
                    );

                    // Get user's allowed region codes
                    const userRegionCodes = userCompany?.region?.map(r => r.regionCode) || [];

                    console.log("Logged In User:", user);
                    console.log("User Company:", userCompany);
                    console.log("User Regions:", userRegionCodes);

                    // Filter Port based on matching Region
                    const portLocations = data
                        .filter(company => {
                            if (company.role !== "Port") return false;

                            const portRegions = company.region || [];

                            return portRegions.some(region =>
                                userRegionCodes.includes(region.regionCode)
                            );
                        })
                        .map(company => ({
                            companyName: company.companyName,
                            companyCode: company.companyCode
                        }));

                    console.log("Filtered Ports:", portLocations);

                    // Other company lists
                    const haulier = data
                        .filter(c => c.role === "Haulier")
                        .map(c => ({
                            companyName: c.companyName,
                            companyCode: c.companyCode
                        }));

                    const shippingAgent = data
                        .filter(c => c.role === "Shipping Line")
                        .map(c => ({
                            companyName: c.companyName,
                            companyCode: c.companyCode
                        }));
                    const consignees = data
                        .filter(c => c.role === "Consignee")
                        .map(c => ({
                            companyName: c.companyName,
                            companyCode: c.companyCode
                        }));
                   /* const consignees = [
                        ...data
                            .filter(c => c.role === "Consignee")
                            .map(c => ({
                                companyName: c.companyName,
                                companyCode: c.companyCode
                            })),
                        {
                            companyName: "Other",
                            companyCode: "OTHER"
                        }
                    ];*/

                    const depots = data
                        .filter(c => c.role === "Depot")
                        .map(c => ({
                            companyName: c.companyName,
                            companyCode: c.companyCode
                        }));

                    const currentForwardingName =
                        userCompany?.companyName || localStorage.getItem("companyName") || "";

                    const billingParty = [
                        {
                            companyName: currentForwardingName,
                            companyCode: currentForwardingCode
                        },
                        ...consignees
                    ];

                    // Set states
                    setPorts(portLocations);
                    setHauliers(haulier);
                    setShippingAgents(shippingAgent);
                    setBillingParties(billingParty);
                    setConsignees(consignees);
                    setDepots(depots);
                }

                const bookings = await getBookings();
                setBookings(bookings || []);

            } catch (error) {
                console.error("Failed to load ports:", error);
                setPorts([]);
                setHauliers([]);
                setShippingAgents([]);
                setBillingParties([]);
                setConsignees([]);
                setDepots([]);
            } finally {
                setIsLoadingPorts(false);
            }
        };
        fetchData();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;

        // --- NEW SAFE ADDITION ---
        // If the input is blOrBookingNumber or scn, force it to uppercase
        let processedValue = value;
        if (name === "bookingNumber" || name === "scn" || name === "dicNumber" || name === "customFormNo" || name === "customReceiptNo" || name === "zbNumber" || name === "sealNo") {
            processedValue = value.toUpperCase();
        }
        // -------------------------
        
        setFormData(prev => {
            const newData = { ...prev, [name]: processedValue };
            if (name === "haulierChoice" && value === "Multiple") newData.haulier = "";
            if (name === "depotChoice" && value === "Multiple") newData.depot = "";
            // Clear houseBLNumber if user switches to Export
            if (name === "movementType" && value === "Export") newData.houseBLNumber = "";
            return newData;
        });
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    };

    useEffect(() => {
        localStorage.setItem("pendingROT", JSON.stringify(formData));
    }, [formData]);
    
    const handleNext = (e) => {
        e.preventDefault();
        const newErrors = {};
        
        if (!formData.movementType) newErrors.movementType = `Movement Type is required!`;
        if (!formData.tripType) newErrors.tripType = `Trip Type is required!`;
        const refLabel = formData.movementType === "Import" ? "BL Number" : "Booking Number";
        const portLabel = formData.movementType === "Import" ? "POD" : "POL";
        
        if (!formData.bookingNumber) newErrors.bookingNumber = `${refLabel} is required!`;
        //if (!formData.houseBLNumber) newErrors.houseBLNumber = "House BL Number is required!";
        if (!formData.scn) newErrors.scn = "Ship Call Number is required!";
        if (!formData.portLocation) newErrors.portLocation = `${portLabel} is required!`;
        if (!formData.eta) newErrors.eta = "ETA is required!";
        //if (!formData.customFormNo) newErrors.customFormNo = "Custom Form Number is required!";
        //if (!formData.customReceiptNo) newErrors.customReceiptNo = "Custom Receipt No is required!";
        if (!formData.dicNumber) newErrors.dicNumber = "DIC Number is required!";
        //if (!formData.zbNumber) newErrors.zbNumber = "Zon Bebas Number is required!";

        if (!formData.containerQuantity) {newErrors.containerQuantity = "Number of Containers is required!";}
        else if (isNaN(formData.containerQuantity)) {newErrors.containerQuantity = "Container Quantity should be a number!";}
        else if (Number(formData.containerQuantity) <= 0) {newErrors.containerQuantity = "Quantity must be greater than zero!";}

        if (!formData.shippingAgent) newErrors.shippingAgent = "Shipping Agent is required!";
        if (!formData.billingParty) newErrors.billingParty = "Billing Party is required!";
        if (!formData.containerType) newErrors.containerType = "Container Type is required!";
        if (!formData.containerSize) newErrors.containerSize = "Container Size is required!";


        if (!formData.haulierChoice) {
            newErrors.haulierChoice = "Haulier choice is required!";
        } else if (formData.haulierChoice === "Single" && !formData.haulier) {
            newErrors.haulier = "Please select a Haulier!";
        }

        if (!formData.depotChoice) {
            newErrors.depotChoice = "Depot choice is required!";
        } else if (formData.depotChoice === "Single" && !formData.depot) {
            newErrors.depot = "Please select a Depot!";
        }
        
        if (!formData.consignee) {
            newErrors.consignee = "Please select a Consignee!";
        } else if (formData.consignee === "OTHER") {
            if (!formData.externalConsigneeName) newErrors.externalConsigneeName = "Consignee Name is required!";
            if (!formData.externalConsigneeAddress) newErrors.externalConsigneeAddress = "Consignee Address is required!";
            if (!formData.externalConsigneeContact) newErrors.externalConsigneeContact = "Consignee Contact Number is required!";
            if (!formData.externalConsigneeEmail) newErrors.externalConsigneeEmail = "Consignee Email Address is required!";
        }
        
        if (!formData.rotDate) newErrors.rotDate = "ROT Date is required!";

        const isBookingNumberDuplicate = bookings.some(
            (b) => b.blOrBookingNumber?.toLowerCase() === formData.bookingNumber?.toLowerCase()
        );
        if (isBookingNumberDuplicate) {
            newErrors.bookingNumber = `${refLabel} already exists, please enter another number!`;
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        let finalRotNumber = formData.rotNumber;
        const isROTNumberDuplicate = bookings.some(
            (b) => b.rotNumber?.toLowerCase() === finalRotNumber.toLowerCase()
        );
        if (isROTNumberDuplicate) {
            finalRotNumber = rotNumberGenerator();
        }

        // Merge and Save
        const updatedData = { ...formData, rotNumber: finalRotNumber };
        localStorage.setItem("pendingROT", JSON.stringify(updatedData));
        navigate("/forwarding/rot/add/form2");
    };

    // const isDepotRequired = (tripType !== "Pick-up" && movementType === "Import") ||
    //     (movementType === "Export" && tripType !== "Drop-off");
    //
    // const isPortRequired = (movementType === "Import" && tripType !== "Drop-off") ||
    //     (movementType === "Export" && tripType !== "Pick-up");

    const date = new Date();
    date.setDate(date.getDate() - 1);
    const yesterday = date.toISOString().split('T')[0];

    return (
        <Layout role="forwarder">
            <div className="max-w-6xl">
                <h1 className="text-3xl font-bold text-text-heading mb-8">Create New ROT - Forwarding</h1>

                <form onSubmit={handleNext} className="space-y-8">
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
                                {/* Trip Type Radio Row */}
                                <div className="flex items-center gap-12 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <span className="text-sm font-semibold text-gray-700">Trip Type <span className="text-red-500">*</span></span>
                                    <div className="flex gap-6">
                                        {['Round Trip', 'MT Trip', 'Laden Trip'].map((type) => (
                                            <label key={type} className="flex items-center gap-2 cursor-pointer group">
                                                <input
                                                    type="radio"
                                                    name="tripType"
                                                    checked={formData.tripType === type}
                                                    value={type}
                                                    onChange={handleChange}
                                                    className="w-4 h-4 accent-blue-600"
                                                />
                                                <span className={`text-sm ${formData.tripType === type ? 'font-bold text-system-color' : 'text-gray-500'}`}>{type}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <InputField label={formData.movementType === "Import" ? "BL No." : "Booking No."} name="bookingNumber" 
                                                value={formData.bookingNumber} 
                                                onChange={handleChange} 
                                                error={errors.bookingNumber} 
                                                required 
                                    />
                                    <InputField label="Vessel Name/SCN" name="scn" value={formData.scn} onChange={handleChange} error={errors.scn} required />
                                    <InputField label="Commodity" name="commodity" value={formData.commodity} onChange={handleChange} error={errors.commodity} required />
                                    <SelectField label="Shipping Agent" name="shippingAgent" value={formData.shippingAgent} onChange={handleChange} error={errors.shippingAgent} required options={shippingAgents.map(s => ({label: s.companyName, value: s.companyCode}))} />
                                    {/* Haulier Choice */}
                                    <SelectField label="Haulier" name="haulier" value={formData.haulier} onChange={handleChange} error={errors.haulier} options={hauliers.map(h => ({label: h.companyName, value: h.companyCode}))} />
                                   
                                    <InputField label="Forwarding Remarks" name="forwardingRemarks" value={formData.forwardingRemarks} onChange={handleChange} placeholder="* Commodity/Special Handling/Others *" />
                                    <SelectField label={formData.movementType === "Import" ? "POD" : "POL"} name="portLocation" value={formData.portLocation} onChange={handleChange} error={errors.portLocation} required options={ports.map(p => ({label: p.companyName, value: p.companyCode}))} />
                                    {/* Depot Choice */}
                                    <SelectField label="Depot" name="depot" value={formData.depot} onChange={handleChange} options={depots.map(d => ({label: d.companyName, value: d.companyCode}))} error={errors.depot} />
                                  
                                    <SelectField label="Consignee/Shipper" name="consignee" required options={consignees.map(t => ({label: t.companyName, value: t.companyCode}))} value={formData.consignee} onChange={handleChange} error={errors.consignee}/>
                                    {formData.consignee === "OTHER" && (
                                        <>
                                            <InputField label="Consignee/Shipper Name" name="externalConsigneeName" value={formData.externalConsigneeName} onChange={handleChange} error={errors.externalConsigneeName} required />
                                            <InputField label="Consignee/Shipper Address" name="externalConsigneeAddress" value={formData.externalConsigneeAddress} onChange={handleChange} error={errors.externalConsigneeAddress} required />
                                            <InputField label="Consignee/Shipper Contact Number" name="externalConsigneeContact" value={formData.externalConsigneeContact} onChange={handleChange} placeholder="e.g: 012-3456789" error={errors.externalConsigneeContact} required />
                                            <InputField label="Consignee/Shipper Email Address" name="externalConsigneeEmail" value={formData.externalConsigneeEmail} onChange={handleChange} placeholder="john@example.com" error={errors.externalConsigneeEmail} required />
                                        </>
                                    )}
                                    <InputField label="Forwarding PIC" name="forwardingPicName" value={formData.forwardingPicName} onChange={handleChange} error={errors.forwardingPicName} style={{ textTransform: 'none' }} required />
                                    <InputField label="Email" name="forwardingPicEmail" value={formData.forwardingPicEmail} onChange={handleChange} error={errors.forwardingPicEmail} style={{ textTransform: 'none' }} required />
                                    <InputField label="Phone No" name="forwardingPicContact" value={formData.forwardingPicContact} onChange={handleChange} placeholder="e.g: 012-3456789" error={errors.forwardingPicContact} style={{ textTransform: 'none' }} required />
                                    <SelectField label="Billing Party" name="billingParty" value={formData.billingParty} onChange={handleChange} error={errors.billingParty} required options={billingParties.map(b => ({label: b.companyName, value: b.companyCode}))} />
                                </div>

                               {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="flex flex-col gap-2 p-4 bg-blue-50/30 rounded-xl border border-blue-100">
                                        <label className="text-sm font-semibold text-gray-800">Haulier Assignment <span className="text-red-500">*</span></label>
                                        <div className="flex items-center gap-4 h-12">
                                            <label className="flex items-center gap-2 min-w-[120px] cursor-pointer">
                                                <input type="checkbox" checked={formData.haulierChoice === "Multiple"} onChange={(e) => handleChange({ target: { name: 'haulierChoice', value: e.target.checked ? "Multiple" : "Single" }})} className="w-4 h-4 rounded text-system-color"/>
                                                <span className="text-xs font-medium text-gray-600 italic">Multiple</span>
                                            </label>
                                            {formData.haulierChoice === "Single" && (
                                                <div className="flex-1 -mt-5">

                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 p-4 bg-blue-50/30 rounded-xl border border-blue-100">
                                        <label className="text-sm font-semibold text-gray-800">Depot Assignment <span className="text-red-500">*</span></label>
                                        <div className="flex items-center gap-4 h-12">
                                            <label className="flex items-center gap-2 min-w-[120px] cursor-pointer">
                                                <input type="checkbox" checked={formData.depotChoice === "Multiple"} onChange={(e) => handleChange({ target: { name: 'depotChoice', value: e.target.checked ? "Multiple" : "Single" }})} className="w-4 h-4 rounded text-system-color"/>
                                                <span className="text-xs font-medium text-gray-600 italic">Multiple</span>
                                            </label>
                                            {formData.depotChoice === "Single" && (
                                                <div className="flex-1 -mt-5">
                                                    
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>*/}
                            </div>
                        </div>

                        {/* --- SECTION 2: CONTAINER DETAILS --- */}
                        <div className="bg-white rounded-2xl shadow-sm border mt-5 border-gray-100 overflow-hidden">
                            <div className="bg-gradient-to-r from-gray-100 to-slate-200 p-6 flex items-center gap-4 border-b border-gray-200">
                                <div className="bg-gray-700 p-2 rounded-lg text-white">
                                    <LucideTruck size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-800">Container Details</h2>
                                    <p className="text-sm text-gray-500">Specifications and quantities</p>
                                </div>
                            </div>
                            <div className="p-8">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                    <InputField label="Quantity" name="containerQuantity" value={formData.containerQuantity} onChange={handleChange} error={errors.containerQuantity} required />
                                    <SelectField label="Size" name="containerSize" required options={["20", "40", "45"]} value={formData.containerSize} onChange={handleChange} error={errors.containerSize} />
                                    <SelectField label="Type" name="containerType" required options={["GP", "RF", "HC"]} value={formData.containerType} onChange={handleChange} error={errors.containerType} />
                                   {/* <InputField label="VGM" subLabel="Optional" name="vgm" value={formData.vgm} onChange={handleChange} />*/}
                                    <InputField label="ROT Date" name="rotDate" type="date" value={formData.rotDate} onChange={handleChange} error={errors.rotDate} required />
                                    <SelectField label="Trailer" name="trailerType" options={["2-Axle","3-Axle","Flatbed","Gooseneck","ISO Tank","Lowbed","Normal","Reefer","Side Loader", "Skeletal"]} value={formData.trailerType} onChange={handleChange} />
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
                                    <InputField label="Vessel ETA" name="eta" type="date" value={formData.eta} onChange={handleChange} error={errors.eta} required min={yesterday} />
                                    <InputField label="DIC No." name="dicNumber" value={formData.dicNumber} onChange={handleChange} error={errors.dicNumber} required />
                                    <InputField label="Custom Form No." name="customFormNo" value={formData.customFormNo} onChange={handleChange} />
                                    <InputField label="Custom Receipt No." name="customReceiptNo" value={formData.customReceiptNo} onChange={handleChange} />
                                    <InputField label="FCZ No." name="zbNumber" value={formData.zbNumber} onChange={handleChange} />
                                    <InputField label="Seal No." name="sealNo" value={formData.sealNo} onChange={handleChange} />
                                </div>
                            </div>
                        </div>
                    </section>

                    <div className="flex justify-end pt-4">
                        <button type="submit" className="group flex items-center gap-3 bg-system-color text-white px-12 py-4 rounded-lg font-bold shadow-xl hover:bg-system-color-dark hover:-translate-y-1 transition-all active:scale-95">
                            Continue to Container List
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
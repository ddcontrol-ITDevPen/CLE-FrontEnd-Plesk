import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../layout/Layout.jsx";
import { motion, AnimatePresence } from "framer-motion";
import {
    CircleChevronDown,
    Clock,
    Hash,
    LucideArrowBigRightDash,
    LucideShieldUser,
    LucideTruck, Trash2, Upload,
    User
} from "lucide-react";
import {getCompanies} from "../../../services/companyService.js";
import {getBookings, registerBooking} from "../../../services/bookingService.js";
import {getUserById} from "../../../services/userService.js";
import {getDrivers} from "../../../services/driverService.js";
import {getPrimeMovers} from "../../../services/primeMoverService.js";
import {getTrailers} from "../../../services/trailerService.js";
import {getTimeSlots, updateTimeSlot} from "../../../services/timeSlotService.js";
import {registerBookingDocument} from "../../../services/bookingDocumentService.js";
import {registerContainer, updateContainer} from "../../../services/containerService.js";
import {toast, Toaster} from "sonner";
import {registerAssignedHaulier} from "../../../services/assignedHaulier.js";

export function CreateBookingForm() {
    const navigate = useNavigate();
    const [ports, setPorts] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [isLoadingPorts, setIsLoadingPorts] = useState(false);
    const [forwardings, setForwardings] = useState([]);
    const [shippingAgents, setShippingAgents] = useState([]);
    const [billingParties, setBillingParties] = useState([]);
    const [depots, setDepots] = useState([]);
    const [consignees, setConsignees] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [addresses, setAddresses] = useState([""]);
    const [allCompanies, setAllCompanies] = useState([]);

    const [drivers, setDrivers] = useState([]);
    const [primeMovers, setPrimeMovers] = useState([]);
    const [trailers, setTrailers] = useState([]);
    const [timeSlots, setTimeSlots] = useState([]);
    const [availableDates, setAvailableDates] = useState([]);
    const [selectedDate, setSelectedDate] = useState("");
    const [filteredSlots, setFilteredSlots] = useState([]);

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
        haulierRemarks: "",
        customFormNo: "",
        customReceiptNo: "",
        dicNumber: "",
        zbNumber: "",
        shippingAgent: "",
        billingParty: "",
        containerQuantity: 1,
        containerNo: "",
        containerType: "",
        containerSize: "",
        vgm: "",
        trailerType: "",
        rotDate: "",
        forwarding: "",
        consignee: "",
        depot: "",
        // depotChoice: "Single",
        // haulierChoice: "Single",
        driverId: "",
        pmId: "",
        trailerId: "",
        timeSlotId: "",
    });

    const [documents, setDocuments] = useState({
        rotForm: null,
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
            tripType: savedData.tripType || "Pick-up",
            rotNumber: savedData.rotNumber || rotNumberGenerator(),
            bookingNumber: savedData.bookingNumber || "",
            houseBLNumber: savedData.houseBLNumber || "",
            scn: savedData.scn || "",
            portLocation: savedData.portLocation || "",
            eta: savedData.eta || "",
            sealNo: savedData.sealNo || "",
            haulierRemarks: savedData.haulierRemarks || "",
            customFormNo: savedData.customFormNo || "",
            customReceiptNo: savedData.customReceiptNo || "",
            dicNumber: savedData.dicNumber || "",
            zbNumber: savedData.zbNumber || "",
            forwarding: savedData.forwarding || "",
            shippingAgent: savedData.shippingAgent || "",
            billingParty: savedData.billingParty || "",
            containerQuantity: savedData.containerQuantity || 1,
            containerNo: savedData.containerNo || "",
            containerType: savedData.containerType || "",
            containerSize: savedData.containerSize || "",
            vgm: savedData.vgm || "",
            trailerType: savedData.trailerType || "",
            rotDate: savedData.rotDate || "",
            haulier: savedData.haulier || localStorage.getItem("companyName") ||"",
            consignee: savedData.consignee || "",
            depot: savedData.depot || "",
            // depotChoice: savedData.depotChoice || "Single",
            // haulierChoice: savedData.haulierChoice || "Single",
            driverId: savedData.driverId || "",
            pmId: savedData.pmId || "",
            trailerId: savedData.trailerId || "",
            timeSlotId: savedData.timeSlotId || "",
        }));
        const fetchData = async () => {
            setIsLoadingPorts(true);
            try {
                const data = await getCompanies();
                setAllCompanies(data);
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

                    const forwardings = data.filter(h => h.role === "Forwarding").map(h => ({companyName: h.companyName, companyCode: h.companyCode}));

                    setPorts(portLocations);
                    setDepots(depots);
                    setShippingAgents(shippingAgent);
                    setBillingParties(billingParty);
                    setConsignees(consignees);
                    setForwardings(forwardings);
                }
                const bookings = await getBookings();
                setBookings(bookings || []);
                const [driverData, pmData, trailerData, slotData] = await Promise.all([
                    getDrivers(),
                    getPrimeMovers(),
                    getTrailers(),
                    getTimeSlots()
                ]);
                const user = await getUserById(localStorage.getItem("userId"));
                const haulierId = user.companyCode
                setDrivers(driverData.filter(x => x.haulierId === haulierId) || []);
                setPrimeMovers(pmData.filter(x => x.haulierId === haulierId) || []);
                setTrailers(trailerData.filter(x => x.haulierId === haulierId) || []);
                setTimeSlots(slotData || []);

                const uniqueDates = [...new Set(slotData.map(s => s.date))].sort();
                setAvailableDates(uniqueDates);
            } catch (error) {
                console.error("Failed to load data:", error);
                setPorts([]);
                setForwardings([]);
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
        setFormData(prev => {
            const newData = { ...prev, [name]: value };
            // if (name === "haulierChoice" && value === "Multiple") newData.haulier = "";
            // if (name === "depotChoice" && value === "Multiple") newData.depot = "";
            return newData;
        });
        if (name === "consignee") {
            const selected = allCompanies.find(c => c.companyCode === value);
            const autoAddress = selected?.address || selected?.companyName || "";
            setAddresses(prev => {
                const updated = [...prev];
                updated[0] = autoAddress;
                return updated;
            });
        }
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    };

    const handleDateChange = (e) => {
        const date = e.target.value;
        setSelectedDate(date);
        const slotsForDate = timeSlots.filter(s => s.date === date).sort((a, b) => a.time.localeCompare(b.time));
        setFilteredSlots(slotsForDate);
        setFormData(prev => ({ ...prev, timeSlot: "" }));
    };

    const addAddress = () => {
        setAddresses(prev => [...prev, ""]);
    };

    const removeAddress = (addrIndex) => {
        setAddresses(prev => prev.filter((_, i) => i !== addrIndex));
    };

    const handleAddressChange = (addrIndex, value) => {
        setAddresses(prev => {
            const updated = [...prev];
            updated[addrIndex] = value;
            return updated;
        });
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

    const getTargetSlotType = () => {
        const { tripType, movementType } = formData;

        if (tripType === "Pick Up") return "pickUp";
        if (tripType === "Drop Off") return "dropOff";

        if (tripType === "Pick Up & Drop Off") {
            return movementType === "Import" ? "dropOff" : "pickUp";
        }
        return 0;
    };

    const handleContainerTypeChange = (index, size, type) => {
        // Define tare weights based on selected container size
        let automaticTare = "";
        if (size === "20") {
            automaticTare = "20000";
        } else if (size === "40") {
            automaticTare = "40000";
        } else if (size === "45") {
            automaticTare = "45000";
        }

        const tare = parseFloat(automaticTare) || 0;
        const cargo = parseFloat(formData.cargoWeight) || 0;
        const calculatedVgm = (tare + cargo > 0) ? (tare + cargo).toString() : "";

        setFormData(prev => ({
            ...prev,
            containerSize: size,
            containerType: type || prev.containerType,
            tareWeight: automaticTare,
            vgm: calculatedVgm
        }));
    };

    const handleAutoChange = (index, field, value) => {
        setFormData(prev => {
            const newData = { ...prev, [field]: value };

            // Auto-calculate VGM when weight fields change
            const tare = parseFloat(newData.tareWeight) || 0;
            const cargo = parseFloat(newData.cargoWeight) || 0;
            newData.vgm = (tare + cargo > 0) ? (tare + cargo).toString() : "";

            return newData;
        });
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();

        // 🛑 GUARD: Exit early if a submission is already in progress!
        if (isSubmitting) return;
        
        const newErrors = {};

        if (!formData.movementType) newErrors.movementType = `Movement Type is required!`;
        const refLabel = formData.movementType === "Import" ? "BL Number" : "Booking Number";
        const portLabel = formData.movementType === "Import" ? "POD" : "POL";

        if (!formData.bookingNumber) newErrors.bookingNumber = `${refLabel} is required!`;
        // if (!formData.houseBLNumber) newErrors.houseBLNumber = "House BL Number is required!";
        if (!formData.scn) newErrors.scn = "Ship Call Number is required!";
        if (!formData.portLocation) newErrors.portLocation = `${portLabel} is required!`;
        if (!formData.eta) newErrors.eta = "ETA is required!";
        //if (!formData.customFormNo) newErrors.customFormNo = "Custom Form Number is required!";
        //if (!formData.customReceiptNo) newErrors.customReceiptNo = "Custom Receipt No is required!";
        if (!formData.dicNumber) newErrors.dicNumber = "DIC Number is required!";
        //if (!formData.zbNumber) newErrors.zbNumber = "Zon Bebas Number is required!";

        // if (!formData.containerQuantity) {newErrors.containerQuantity = "Number of Containers is required!";}
        // else if (isNaN(formData.containerQuantity)) {newErrors.containerQuantity = "Container Quantity should be a number!";}
        // else if (Number(formData.containerQuantity) <= 0) {newErrors.containerQuantity = "Quantity must be greater than zero!";}

        if (!formData.shippingAgent) newErrors.shippingAgent = "Shipping Agent is required!";
        if (!formData.billingParty) newErrors.billingParty = "Billing Party is required!";
        if (!formData.containerType) newErrors.containerType = "Container Type is required!";
        if (!formData.containerSize) newErrors.containerSize = "Container Size is required!";

        if (!formData.haulier) newErrors.haulier = "Please select a Haulier!";
        if (!formData.depot) newErrors.depot = "Please select a Depot!";
        // if (!formData.haulierChoice) {
        //     newErrors.haulierChoice = "Haulier choice is required!";
        // } else if (formData.haulierChoice === "Single" && !formData.haulier) {
        //     newErrors.haulier = "Please select a Haulier!";
        // }
        //
        // if (!formData.depotChoice) {
        //     newErrors.depotChoice = "Depot choice is required!";
        // } else if (formData.depotChoice === "Single" && !formData.depot) {
        //     newErrors.depot = "Please select a Depot!";
        // }

        //if (!formData.containerNo) newErrors.containerNo = "Container Number is required!";
        if (!formData.consignee) newErrors.consignee = "Please select a Consignee!";
        if (!formData.rotDate) newErrors.rotDate = "ROT Date is required!";

        // const isBookingNumberDuplicate = bookings.some(
        //     (b) => b.blOrBookingNumber?.toLowerCase() === formData.bookingNumber?.toLowerCase()
        // );
        // if (isBookingNumberDuplicate) {
        //     newErrors.bookingNumber = `${refLabel} already exists, please enter another number!`;
        // }

        if (!formData.driverId) newErrors.driverId = "Driver Selection is required";
        if (!formData.pmId) newErrors.pmId = "Prime Mover is required";
        if (!formData.trailerId) newErrors.trailerId = "Trailer selection is required";
        if (!formData.timeSlotId) newErrors.timeSlotId = "Time Slot is required";

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

        setIsSubmitting(true);
        // Merge and Save
        try {
            const userData = await getUserById(localStorage.getItem("userId"));
            const companyCode = await userData.companyCode;
            const formattedEta = formData.eta ? new Date(formData.eta).toISOString().split('T')[0] : null;
            const bookingPayload = {
                rotNumber: formData.rotNumber,
                blOrBookingNumber: formData.bookingNumber,
                houseBLNumber: formData.houseBLNumber,
                movementType: formData.movementType,
                tripType: formData.tripType,
                scn: formData.scn,
                vesselName: formData.vesselName,
                portLocation: formData.portLocation,
                eta: formData.eta,
                commodity: formData.commodity,
                specialHandling: formData.specialHandling,
                sealNumber: formData.sealNo,
                forwardingRemarks: formData.forwardingRemarks,
                forwardingId: formData.forwarding,
                shippingAgentId: formData.shippingAgent,
                billingParty: formData.billingParty,
                customFormNo: formData.customFormNo || "",
                customReceiptNo: formData.customReceiptNo || "",
                dicNumber: formData.dicNumber || "",
                zbNumber: formData.zbNumber || "",
                containerQuantity: formData.containerQuantity || 1,
            };
            console.log(bookingPayload);

            const savedBooking = await registerBooking(bookingPayload);
            const rotNumber = savedBooking.rotNumber;

            const docTypes = {
                rotForm: "ROT Form",
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
                    await registerBookingDocument(docFormData);
                }
            }

            const formattedRotDate = formData.rotDate ? new Date(formData.rotDate).toISOString().split('T')[0] : null;
            const containerPayload = {
                ContainerNumber: formData.containerNo,
                ContainerType: formData.containerType,
                ContainerSize: formData.containerSize,
                VGM: formData.vgm === "" ? null : formData.vgm,
                TrailerType: formData.trailerType || null,
                ConsigneeId: formData.consignee,
                DepotId: formData.depot || null,
                PortId: formData.portLocation || null,
                HaulierId: companyCode,
                ROTDate: formattedRotDate,
                Status: "Enroute",
                AssignedTime: new Date().toISOString(),
                EnrouteTime: new Date().toISOString(),
                ROTNumber: formData.rotNumber,
                ToAddress: addresses
                    .filter(addr => addr.trim() !== "")
                    .map(addr => ({ Address: addr }))
            };
            console.log(containerPayload);
            const createdContainer = await registerContainer(containerPayload);
            const containerId = createdContainer.containerId;

            const assignedHaulierPayload = {
                driverId: formData.driverId,
                pmId: formData.pmId,
                trailerId: formData.trailerId,
                timeSlotId: formData.timeSlotId,
                containerId: containerId,
                rotNumber: formData.rotNumber,
                haulierId: companyCode,
            };
            await registerAssignedHaulier(assignedHaulierPayload);
            const selectedSlot = timeSlots.find(s => s.id === formData.timeSlotId);
            if (selectedSlot) {
                const updatedSlotData = {
                    id: selectedSlot.id,
                    date: selectedSlot.date,
                    time: selectedSlot.time,
                    totalSlot: selectedSlot.totalSlot - 1,
                    depotId: selectedSlot.depotId,
                };
                await updateTimeSlot(formData.timeSlotId, updatedSlotData)
            }

            toast.success("ROT Booking created successfully!");
            setTimeout(() => navigate("/haulier/booking"), 2000);
        } catch (error) {
            console.error("Save failed:", error);
            if (error.response && error.response.data) {
                console.log("Backend Validation Errors:", error.response.data);
            }
            setIsSubmitting(false);
            toast.error(error.response?.data?.message || "Failed to save record. Please check your connection.");
        }
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
        <Layout role="haulier">
            <Toaster richColors position="top-right" />
            <div className="max-w-6xl">
                <h1 className="text-3xl font-bold text-text-heading mb-8">Create New Booking</h1>
                <div className="flex items-center p-4 mb-4 text-sm font-semibold italic text-gray-700 bg-gray-50 rounded-xl border border-gray-100">If you do not know any required (*) information, you can input '-' or 'N/A'.</div>

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

                                {/* Trip Type Radio Row */}
                                <div className="flex items-center gap-12 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <span className="text-sm font-semibold text-gray-700">Trip Type <span className="text-red-500">*</span></span>
                                    <div className="flex gap-6">
                                        {['Pick-up', 'Drop-off', 'Pick-up & Drop-off'].map((type) => (
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
                                    <InputField label={formData.movementType === "Import" ? "BL No." : "Booking No."} name="bookingNumber" value={formData.bookingNumber} onChange={handleChange} error={errors.bookingNumber} required />
                                    <InputField label="House BL No." name="houseBLNumber" value={formData.houseBLNumber} onChange={handleChange} error={errors.houseBLNumber}/>
                                    <InputField label="SCN" name="scn" value={formData.scn} onChange={handleChange} error={errors.scn} required />
                                    <SelectField label={formData.movementType === "Import" ? "POD" : "POL"} name="portLocation" value={formData.portLocation} onChange={handleChange} error={errors.portLocation} required options={ports.map(p => ({label: p.companyName, value: p.companyCode}))} />
                                    <SelectField label="Shipping Agent" name="shippingAgent" value={formData.shippingAgent} onChange={handleChange} error={errors.shippingAgent} required options={shippingAgents.map(s => ({label: s.companyName, value: s.companyCode}))} />
                                    <SelectField label="Billing Party" name="billingParty" value={formData.billingParty} onChange={handleChange} error={errors.billingParty} required options={billingParties.map(b => ({label: b.companyName, value: b.companyCode}))} />
                                    <SelectField label="Fowarding Agent" name="forwarding" value={formData.forwarding} onChange={handleChange} error={errors.forwarding} required options={forwardings.map(b => ({label: b.companyName, value: b.companyCode}))} />
                                    <InputField label="Haulier Remarks" name="haulierRemarks" value={formData.haulierRemarks} onChange={handleChange} placeholder="* Commodity/Special Handling/Others *" />
                                </div>

                                {/*<div className="grid grid-cols-1 md:grid-cols-2 gap-8">*/}
                                {/*    /!* Haulier Choice *!/*/}
                                {/*    <div className="flex flex-col gap-2 p-4 bg-blue-50/30 rounded-xl border border-blue-100">*/}
                                {/*        <label className="text-sm font-semibold text-gray-800">Haulier Assignment <span className="text-red-500">*</span></label>*/}
                                {/*        <div className="flex items-center gap-4 h-12">*/}
                                {/*            <label className="flex items-center gap-2 min-w-[120px] cursor-pointer">*/}
                                {/*                <input type="checkbox" checked={formData.haulierChoice === "Multiple"} onChange={(e) => handleChange({ target: { name: 'haulierChoice', value: e.target.checked ? "Multiple" : "Single" }})} className="w-4 h-4 rounded text-system-color"/>*/}
                                {/*                <span className="text-xs font-medium text-gray-600 italic">Multiple</span>*/}
                                {/*            </label>*/}
                                {/*            {formData.haulierChoice === "Single" && (*/}
                                {/*                <div className="flex-1 -mt-5">*/}
                                {/*                    <SelectField label="" name="haulier" value={formData.haulier} onChange={handleChange} error={errors.haulier} options={hauliers.map(h => ({label: h.companyName, value: h.companyCode}))} />*/}
                                {/*                </div>*/}
                                {/*            )}*/}
                                {/*        </div>*/}
                                {/*    </div>*/}

                                {/*    /!* Depot Choice *!/*/}
                                {/*    <div className="flex flex-col gap-2 p-4 bg-blue-50/30 rounded-xl border border-blue-100">*/}
                                {/*        <label className="text-sm font-semibold text-gray-800">Depot Assignment <span className="text-red-500">*</span></label>*/}
                                {/*        <div className="flex items-center gap-4 h-12">*/}
                                {/*            <label className="flex items-center gap-2 min-w-[120px] cursor-pointer">*/}
                                {/*                <input type="checkbox" checked={formData.depotChoice === "Multiple"} onChange={(e) => handleChange({ target: { name: 'depotChoice', value: e.target.checked ? "Multiple" : "Single" }})} className="w-4 h-4 rounded text-system-color"/>*/}
                                {/*                <span className="text-xs font-medium text-gray-600 italic">Multiple</span>*/}
                                {/*            </label>*/}
                                {/*            {formData.depotChoice === "Single" && (*/}
                                {/*                <div className="flex-1 -mt-5">*/}
                                {/*                    <SelectField label="" name="depot" value={formData.depot} onChange={handleChange} options={depots.map(d => ({label: d.companyName, value: d.companyCode}))} error={errors.depot} />*/}
                                {/*                </div>*/}
                                {/*            )}*/}
                                {/*        </div>*/}
                                {/*    </div>*/}
                                {/*    <SelectField label="Consignee/Shipper" name="consignee" required options={consignees.map(t => ({label: t.companyName, value: t.companyCode}))} value={formData.consignee} onChange={handleChange} error={errors.consignee}/>*/}
                                {/*</div>*/}
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
                                    <InputField label="Container No." name="containerNo" value={formData.containerNo} onChange={handleChange} error={errors.containerNo} />
                                    <SelectField label="Type" name="containerType" required options={["GP", "RF", "HC"]} value={formData.containerType} onChange={handleChange} error={errors.containerType} />
                                    {/*<SelectField label="Size" name="containerSize" required options={["20", "40", "45"]} value={formData.containerSize} onChange={handleChange} error={errors.containerSize} />*/}
                                    <SelectField
                                        label="Container Size"
                                        name="containerSize"
                                        required
                                        options={["20", "40", "45"]}
                                        value={formData.containerSize}
                                        onChange={(e) => {
                                            // Call your change handler using the explicit field name
                                            handleChange(e);
                                            // Trigger your weight layout calculations based on the selected value
                                            handleContainerTypeChange(0, e.target.value, formData.containerType);
                                        }}
                                        error={errors.containerSize}
                                    />
                                    <InputField label="ROT Date" name="rotDate" type="date" value={formData.rotDate} onChange={handleChange} error={errors.rotDate} required />
                                    <InputField
                                        label="Container Tare Weight (kg)"
                                        type="number"
                                        value={formData.tareWeight || ""}
                                        readOnly
                                    />
                                    <InputField
                                        label="Cargo Weight (kg)"
                                        type="number"
                                        value={formData.cargoWeight || ""}
                                        onChange={(e) => handleAutoChange(0, "cargoWeight", e.target.value)}
                                    />
                                    <InputField
                                        label="VGM (kg)"
                                        type="number"
                                        value={formData.vgm || ""}
                                        readOnly
                                        className="bg-gray-100 font-bold"
                                    />
                                    {/*<InputField label="VGM" subLabel="Optional" name="vgm" value={formData.vgm} onChange={handleChange} />*/}

                                    <SelectField label="Trailer" name="trailerType" options={["2-Axle", "3-Axle", "Flatbed", "Gooseneck", "ISO Tank", "Lowbed", "Normal", "Reefer", "Side Loader", "Skeletal"]} value={formData.trailerType} onChange={handleChange} />

                                    {/*<SelectField label="" name="haulier" value={formData.haulier} onChange={handleChange} error={errors.haulier} options={hauliers.map(h => ({label: h.companyName, value: h.companyCode}))} />*/}
                                    <SelectField label="Depot" name="depot" value={formData.depot} onChange={handleChange} options={depots.map(d => ({label: d.companyName, value: d.companyCode}))} error={errors.depot} />
                                    <SelectField label="Consignee/Shipper" name="consignee" required options={consignees.map(t => ({label: t.companyName, value: t.companyCode}))} value={formData.consignee} onChange={handleChange} error={errors.consignee}/>
                                </div>
                                <div className="mt-6 space-y-4">
                                    {addresses.map((addr, aIdx) => (
                                        <div key={aIdx} className="flex items-end gap-4">
                                            <div className="flex-1">
                                                <label className="text-sm font-semibold mb-1 block">Consignee Address</label>
                                                <textarea
                                                    className="w-full p-3 rounded-xl border border-gray-200 bg-white min-h-[100px] outline-none focus:ring-2 focus:ring-system-color"
                                                    value={addr}
                                                    onChange={(e) => handleAddressChange(aIdx, e.target.value)}
                                                    readOnly={aIdx === 0}
                                                />
                                            </div>
                                            {aIdx > 0 && (
                                                <button type="button" onClick={() => removeAddress(aIdx)} className="mb-4 text-red-500">
                                                    <Trash2 size={20} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={addAddress}
                                        className="bg-gray-700 text-white px-6 py-2 rounded-lg font-bold text-sm shadow-md"
                                    >
                                        Add New Consignee Info.
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* --- SECTION 3: HAULIER DETAILS --- */}
                        <div className="bg-white rounded-3xl shadow-sm border mt-5 border-gray-100 overflow-hidden">
                            <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-6 text-white flex items-center gap-4">
                                <div className="bg-white/20 p-2 rounded-lg">
                                    <LucideTruck size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold">Haulier Configuration</h2>
                                    <p className="text-blue-100 text-sm">Assign personnel and assets</p>
                                </div>
                            </div>

                            <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                                <SelectField label="Driver Name" name="driverId" icon={<User size={18}/>} value={formData.driverId} onChange={handleChange} error={errors.driverId} required options={drivers.map(d => ({ label: d.name, value: d.id }))}/>
                                <SelectField label="PM No. (Prime Mover)" name="pmId" icon={<Hash size={18}/>} value={formData.pmId} onChange={handleChange} error={errors.pmId} required options={primeMovers.map(p => ({ label: p.plateNumber, value: p.id }))}/>

                                <SelectField
                                    label="Booking Date" n
                                    ame="bookingDate"
                                    icon={<Clock size={18}/>}
                                    value={selectedDate}
                                    onChange={handleDateChange}
                                    options={availableDates.map(d => ({ label: d, value: d }))}/>
                                <SelectField
                                    label="Time Slot"
                                    name="timeSlotId"
                                    icon={<Clock size={18}/>}
                                    value={formData.timeSlotId}
                                    onChange={handleChange}
                                    error={errors.timeSlotId}
                                    required disabled={!selectedDate} // Prevents clicking until a date is selected
                                    options={filteredSlots.map(s => {
                                        // Correctly calculates slots left using PascalCase
                                        const availableCount = s.pickUpTotalSlot ?? s.dropOffTotalSlot ?? 0;
                                        return {
                                            label: `${s.time} (${availableCount} left)`,
                                            value: s.id
                                        };
                                    })}
                                />
                                {/*<SelectField 
                                    label="Time Slot" 
                                    name="timeSlotId" 
                                    icon={<Clock size={18}/>} 
                                    value={formData.timeSlotId} 
                                    onChange={handleChange} 
                                    error={errors.timeSlotId} 
                                    required disabled={!selectedDate} 
                                    options={filteredSlots.filter(s => s.totalSlot > 0).map(s => ({label: `${s.time} (${s.totalSlot} left)`, value: s.id}))}/>*/}

                                <SelectField label="Trailer No." name="trailerId" icon={<LucideTruck size={18}/>} value={formData.trailerId} onChange={handleChange} error={errors.trailerId} required options={trailers.map(t => ({ label: `${t.plateNumber} - ${t.type}`, value: t.id }))}/>
                            </div>
                        </div>

                        {/* --- SECTION 4: CUSTOMS & TRACKING --- */}
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
                                    <InputField label="DIC No." name="dicNumber" value={formData.dicNumber} onChange={handleChange} error={errors.dicNumber} required />
                                    <InputField label="Custom Form No." name="customFormNo" value={formData.customFormNo} onChange={handleChange} />
                                    <InputField label="Custom Receipt No." name="customReceiptNo" value={formData.customReceiptNo} onChange={handleChange} />
                                    <InputField label="FCZ No." name="zbNumber" value={formData.zbNumber} onChange={handleChange} />
                                    <InputField label="Seal No." name="sealNo" value={formData.sealNo} onChange={handleChange} />
                                </div>
                            </div>
                        </div>

                        {/* --- SECTION 5: FORMS & DOCUMENTS --- */}
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
                                    <FileUpload label="ROT Form" fileName={documents.rotForm?.name} onChange={(e) => handleFileChange(e, "rotForm")} onRemove={() => setDocuments(prev => ({ ...prev, rotForm: null }))} />
                                    <FileUpload label="Custom Form" fileName={documents.customForm?.name} onChange={(e) => handleFileChange(e, "customForm")} onRemove={() => setDocuments(prev => ({ ...prev, customForm: null }))} />
                                    <FileUpload label="Packing List" fileName={documents.packingList?.name} onChange={(e) => handleFileChange(e, "packingList")} onRemove={() => setDocuments(prev => ({ ...prev, packingList: null }))} />
                                    <FileUpload label="Other Document" fileName={documents.otherDoc?.name} onChange={(e) => handleFileChange(e, "otherDoc")} onRemove={() => setDocuments(prev => ({ ...prev, otherDoc: null }))} />
                                </div>
                            </div>
                        </div>
                    </section>

                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={isSubmitting} // 🛑 Prevents clicks during network requests
                            className={`group flex items-center gap-3 bg-system-color text-white px-12 py-4 rounded-lg font-bold shadow-xl transition-all active:scale-95 ${
                                isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-system-color-dark hover:-translate-y-1'
                            }`}
                        >
                            {isSubmitting ? "Submitting Booking..." : "Submit Booking"}
                            {!isSubmitting && <LucideArrowBigRightDash size={24} className="group-hover:translate-x-1 transition-transform" />}
                        </button>
                       {/* <button 
                            type="submit" className="group flex items-center gap-3 bg-system-color text-white px-12 py-4 rounded-lg font-bold shadow-xl hover:bg-system-color-dark hover:-translate-y-1 transition-all active:scale-95">
                            Submit Booking
                            <LucideArrowBigRightDash size={24} className="group-hover:translate-x-1 transition-transform" />
                        </button>*/}
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
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../../layout/Layout.jsx";
import { motion, AnimatePresence } from "framer-motion";
import {
    CircleChevronDown,
    LucideTruck,
    User,
    Clock,
    Hash,
    Save,
    ArrowLeft, LucideShieldUser, TicketCheck
} from "lucide-react";
import {getAleContainerById, updateAleContainer} from "../../../services/aleContainerService.js";
import { toast, Toaster } from "sonner";
import { getDrivers } from "../../../services/driverService.js";
import { getPrimeMovers } from "../../../services/primeMoverService.js";
import { getTrailers } from "../../../services/trailerService.js";
import {getAleTimeSlots, updateAleTimeSlot} from "../../../services/aleTimeSlotService.js";
import { registerAleAssignedHaulier } from "../../../services/aleAssignedHaulierService.js";
import {getUserById} from "../../../services/userService.js";
import {getCompanyById} from "../../../services/companyService.js";

export function ALEAssignBooking() {
    const { id } = useParams(); 
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [drivers, setDrivers] = useState([]);
    const [primeMovers, setPrimeMovers] = useState([]);
    const [trailers, setTrailers] = useState([]);
    const [timeSlots, setTimeSlots] = useState([]);
    const [availableDates, setAvailableDates] = useState([]);
    const [selectedDate, setSelectedDate] = useState("");
    const [filteredSlots, setFilteredSlots] = useState([]);
    const [container, setContainer] = useState(null);
    const [billingParty, setBillingParty] = useState(null);

    const [formData, setFormData] = useState({
        driverId: "",      
        pmId: "",        
        trailerId: "",   
        timeSlotId: "",        
        containerId: id,     
        rotNumber: "",       
        haulierId: localStorage.getItem("companyCode") || "",
        passNumber: "",
        consigneeTimeSlot: "",
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setIsLoading(true);
                const containerData = await getAleContainerById(id);
                setContainer(containerData);
                const bp = await getCompanyById(containerData.aleBooking?.billingParty);
                setBillingParty(bp.companyName);
                setFormData(prev => ({
                    ...prev,
                    movementType: containerData.aleBooking?.movementType || "Import",
                    rotNumber: containerData.rotNumber || "",
                    awbNumber: containerData.aleBooking?.awbNumber || "",
                    houseAWBNumber: containerData.aleBooking?.houseAWBNumber || "",
                    flightNumber: containerData.aleBooking?.flightNumber || "",
                    terminalLocation: containerData.terminalId || "",
                    eta: containerData.aleBooking?.eta || "",
                    sealNo: containerData.aleBooking?.sealNo || "",
                    forwardingRemarks: containerData.aleBooking?.forwardingRemarks || "",
                    customFormType: containerData.aleBooking?.customFormType || "",
                    customFormNo: containerData.aleBooking?.customFormNo || "",
                    customReceiptNo: containerData.aleBooking?.customReceiptNo || "",
                    dicNumber: containerData.aleBooking?.dicNumber || "",
                    zbNumber: containerData.aleBooking?.zbNumber || "",
                    forwarding: containerData.aleBooking?.forwarding || localStorage.getItem("companyName") || "",
                    airline: containerData.aleBooking?.airline || "",
                    billingParty: containerData.aleBooking?.billingParty || "",
                    truckQuantity: containerData.aleBooking?.truckQuantity || 1,
                    packageQuantity: containerData.packageQuantity || 1,
                    containerType: containerData.containerType || "",
                    containerSize: containerData.containerSize || "",
                    vgm: containerData.vgm || "",
                    volumeMetricWeight: containerData.volumeMetricWeight || "",
                    rotDate: containerData.rotDate || "",
                    haulier: containerData.haulier || "",
                    consignee: containerData.consignee || "",
                    haulierChoice: containerData.haulierChoice || "Single",
                    externalConsigneeName: containerData.externalConsigneeName || "",
                    externalConsigneeAddress: containerData.externalConsigneeAddress || "",
                    externalConsigneeContact: containerData.externalConsigneeContact || "",
                    containerId: id,
                }));

                const [driverData, pmData, trailerData, slotData] = await Promise.all([
                    getDrivers(),
                    getPrimeMovers(),
                    getTrailers(),
                    getAleTimeSlots()
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
                toast.error("Failed to load assignment data");
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchInitialData();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    };

    const handleDateChange = (e) => {
        const date = e.target.value;
        setSelectedDate(date);
        const slotsForDate = timeSlots.filter(s => s.date === date).sort((a, b) => a.time.localeCompare(b.time));
        setFilteredSlots(slotsForDate);
        setFormData(prev => ({ ...prev, timeSlot: "" }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};

        if (!formData.driverId) newErrors.driverId = "Driver Selection is required";
        if (!formData.pmId) newErrors.pmId = "Prime Mover is required";
        if (!formData.trailerId) newErrors.trailerId = "Trailer selection is required";
        if (!formData.timeSlotId) newErrors.timeSlotId = "Time Slot is required";
        if (!formData.passNumber) newErrors.passNumber = "Pass Number is required";
        if (!formData.consigneeTimeSlot) newErrors.consigneeTimeSlot = "Consignee Time Slot is required";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            const user = await getUserById(localStorage.getItem("userId"));
            const updatedBy = user.fullName + " - " + user.companyName;
            const assignmentPayload = {
                containerId: parseInt(id),                      
                rotNumber: container.rotNumber,
                haulierId: user.companyCode,
                driverId: formData.driverId,
                pmId: formData.pmId,
                trailerId: formData.trailerId,
                timeSlotId: formData.timeSlotId,
                passNumber: formData.passNumber,
                consigneeTimeSlot: formData.consigneeTimeSlot.length === 5
                    ? `${formData.consigneeTimeSlot}:00`
                    : formData.consigneeTimeSlot
            };
            await registerAleAssignedHaulier(assignmentPayload);
            const updatedContainerData = {...container, containerId: id, status: "Enroute", enrouteTime: new Date().toISOString(), UpdatedBy: updatedBy}
            await updateAleContainer(id, updatedContainerData);
            const selectedSlot = timeSlots.find(s => s.id === formData.timeSlotId);
            if (selectedSlot) {
                const updatedSlotData = {
                    id: selectedSlot.id,
                    date: selectedSlot.date,
                    time: selectedSlot.time,
                    pickUpTotalSlot: selectedSlot.pickUpTotalSlot - 1,
                    terminalId: selectedSlot.terminalId,
                };
                await updateAleTimeSlot(formData.timeSlotId, updatedSlotData)
            }
            toast.success("Haulier assigned successfully!");
            setTimeout(() => navigate("/ale/haulier/booking"), 1500);
        } catch (error) {
            toast.error("Failed to save assignment");
            console.error(error);
        }
    };

    if (isLoading) return <div className="p-10 text-center">Loading Assignment Form...</div>;

    return (
        <Layout role="haulier">
            <Toaster richColors position="top-right"/>
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-2 text-gray-500 hover:text-system-color mb-2 transition-colors"
                        >
                            <ArrowLeft size={16} /> Back to List
                        </button>
                        <h1 className="text-3xl font-black text-gray-800">Assign Booking</h1>
                        <p className="text-gray-500 font-medium">Coordinate driver and equipment for ROT: {formData.rotNumber}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
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
                                                className="w-4 h-4 accent-blue-600"
                                                disabled={true}
                                            />
                                            <span className={`text-sm ${formData.movementType === type ? 'font-bold text-system-color' : 'text-gray-500'}`}>{type}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <InputField label="AWB No." name="awbNumber" value={formData.awbNumber} readOnly={true}/>
                                <InputField label="House AWB No." name="houseAWBNumber" value={formData.houseAWBNumber} readOnly={true}/>
                                <InputField label="Flight No." name="flightNumber" value={formData.flightNumber} readOnly={true}/>
                                <SelectField label="Terminal" name="terminalLocation" value={formData.terminalLocation} disabled={true} options={[{label: container?.terminal?.companyName || "N/A", value: formData.terminalLocation}]} />
                                <SelectField label="Airline" name="airline" value={formData.airline} disabled={true} options={[{ label: container?.aleBooking?.airline?.companyName || "N/A", value: formData.airline }]} />
                                <SelectField label="Billing Party" name="billingParty" value={formData.billingParty} disabled={true} options={[{ label: billingParty || "N/A", value: billingParty }]} />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Haulier Choice */}
                                <div className="flex flex-col gap-2 p-4 bg-blue-50/30 rounded-xl border border-blue-100">
                                    <label className="text-sm font-semibold text-gray-800">Trucker Assignment <span className="text-red-500">*</span></label>
                                    <div className="flex items-center gap-4 h-12">
                                        <label className="flex items-center gap-2 min-w-[120px] cursor-pointer">
                                            <input type="checkbox" checked={formData.haulierChoice === "Multiple"} onChange={(e) => handleChange({ target: { name: 'haulierChoice', value: e.target.checked ? "Multiple" : "Single" }})} className="w-4 h-4 rounded text-system-color" disabled={true}/>
                                            <span className="text-xs font-medium text-gray-600 italic">Multiple</span>
                                        </label>
                                        {formData.haulierChoice === "Single" && (
                                            <div className="flex-1 -mt-5">
                                                <SelectField label="" name="haulier" value={formData.haulier} options={[{ label: container?.haulier?.companyName || "N/A", value: formData.haulier }]} disabled={true} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <SelectField label="Consignee/Shipper" name="consignee" value={formData.consignee} options={[{ label: container?.consignee?.companyName || "N/A", value: formData.consignee }]} disabled={true}/>
                                {formData.consignee === "Other" && (
                                    <>
                                        <InputField label="Consignee/Shipper Name" name="externalConsigneeName" value={formData.externalConsigneeName} readOnly={true} />
                                        <InputField label="Consignee/Shipper Address" name="externalConsigneeAddress" value={formData.externalConsigneeAddress} readOnly={true} />
                                        <InputField label="Consignee/Shipper Contact Information" name="externalConsigneeContact" value={formData.externalConsigneeContact} readOnly={true} />
                                    </>
                                )}
                                <InputField label="Forwarding Remarks" name="forwardingRemarks" value={formData.forwardingRemarks} readOnly={true} />
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
                                <InputField label="Truck Quantity" name="truckQuantity" value={formData.truckQuantity} readOnly={true} />
                                <InputField label="Package Quantity" name="packageQuantity" value={formData.packageQuantity} readOnly={true} />
                                <SelectField label="Type" name="containerType" options={["GP", "RF", "HC"]} value={formData.containerType} options={[{ label: container?.containerType || "N/A", value: formData.containerType }]} disabled={true} />
                                <SelectField label="Size" name="containerSize" options={["20", "40", "45"]} value={formData.containerSize} options={[{ label: container?.containerSize || "N/A", value: formData.containerSize }]} disabled={true} />
                                <InputField label="ROT Date" name="rotDate" type="date" value={formData.rotDate} readOnly={true} />
                                <InputField label="VGM" subLabel="Optional" name="vgm" value={formData.vgm} readOnly={true} />
                                {/*<SelectField label="Trailer" name="trailerType" options={["Normal", "Tipper", "Air", "SL"]} value={formData.trailerType} onChange={handleChange} />*/}
                                <InputField label="Volumetric Weight" subLabel="Optional" name="volumeMetricWeight" value={formData.volumeMetricWeight} readOnly={true} />
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
                                <InputField label="ETA" name="eta" type="date" value={formData.eta} readOnly={true} />
                                <SelectField label="Custom Form Type" name="customFormType" options={["K1", "K2", "K8"]} value={formData.customFormType} options={[{ label: container?.aleBooking?.customFormType || "N/A", value: formData.customFormType }]} disabled={true} />
                                <InputField label="Custom Form No." name="customFormNo" value={formData.customFormNo} readOnly={true} />
                                <InputField label="Custom Receipt No." name="customReceiptNo" value={formData.customReceiptNo} readOnly={true} />
                                <InputField label="DIC No." name="dicNumber" value={formData.dicNumber}readOnly={true} />
                                <InputField label="FCZ No." name="zbNumber" value={formData.zbNumber} readOnly={true} />
                                <InputField label="Seal No." name="sealNo" value={formData.sealNo} readOnly={true} />
                            </div>
                        </div>
                    </div>

                    {/* Section 4: Assignment Form */}
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-6 text-white flex items-center gap-4">
                            <div className="bg-white/20 p-2 rounded-lg">
                                <LucideTruck size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">Dispatch Configuration</h2>
                                <p className="text-blue-100 text-sm">Assign personnel and assets</p>
                            </div>
                        </div>

                        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <SelectField
                                label="Driver Name"
                                name="driverId"
                                icon={<User size={18}/>}
                                value={formData.driverId}
                                onChange={handleChange}
                                error={errors.driverId}
                                required
                                options={drivers.map(d => ({ label: d.name, value: d.id }))}
                            />

                            <SelectField
                                label="Trucker/PM No. (Prime Mover)"
                                name="pmId"
                                icon={<Hash size={18}/>}
                                value={formData.pmId}
                                onChange={handleChange}
                                error={errors.pmId}
                                required
                                options={primeMovers.map(p => ({ label: p.plateNumber, value: p.id }))}
                            />

                            <SelectField
                                label="Booking Date"
                                name="bookingDate"
                                icon={<Clock size={18}/>}
                                value={selectedDate}
                                onChange={handleDateChange}
                                required
                                options={availableDates.map(d => ({ label: d, value: d }))}
                            />

                            <SelectField
                                label="Time Slot"
                                name="timeSlotId"
                                icon={<Clock size={18}/>}
                                value={formData.timeSlotId}
                                onChange={handleChange}
                                error={errors.timeSlotId}
                                required
                                disabled={!selectedDate}
                                options={filteredSlots
                                    .filter(s => s.pickUpTotalSlot > 0)
                                    .map(s => ({
                                    label: `${s.time} (${s.pickUpTotalSlot} left)`,
                                    value: s.id
                                }))}
                            />
                            
                            <SelectField
                                label="Trailer No."
                                name="trailerId"
                                icon={<LucideTruck size={18}/>}
                                value={formData.trailerId}
                                onChange={handleChange}
                                error={errors.trailerId}
                                required
                                options={trailers.map(t => ({ label: `${t.plateNumber} - ${t.type}`, value: t.id }))}
                            />
                            
                            <InputField
                                label="Pass No."
                                name="passNumber"
                                icon={<TicketCheck size={18}/>}
                                value={formData.passNumber}
                                onChange={handleChange}
                                error={errors.passNumber}
                                readOnly={false}
                                required
                            />

                            <InputField
                                label="Consignee Time Slot."
                                name="consigneeTimeSlot"
                                type="time"
                                icon={<Clock size={18}/>}
                                value={formData.consigneeTimeSlot}
                                onChange={handleChange}
                                error={errors.consigneeTimeSlot}
                                readOnly={false}
                                required
                            />
                        </div>
                    </div>

                    {/* Action Button */}
                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            className="flex items-center gap-3 bg-indigo-600 text-white px-10 py-4 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-1 transition-all active:scale-95"
                        >
                            <Save size={20} />
                            Confirm Assignment
                        </button>
                    </div>
                </form>
            </div>
        </Layout>
    );
}

// Reusable UI Components based on your Design System
const InputField = ({ icon, label, name, value, onChange, error, required, readOnly, type }) => (
    <div className="flex flex-col gap-1">
        <label className="text-sm font-bold text-gray-700 tracking-wider flex items-center gap-2"> {icon} {label} {required && !readOnly && <span className="text-red-500">*</span>}</label>
        <input
            type={type !== null ? type : "text"}
            name={name}
            value={value}
            onChange={onChange}
            readOnly={readOnly}
            className={`p-3 rounded-xl border border-gray-200 ${readOnly ? "bg-gray-100/50" : "bg-gray-50/50" } bg-gray-100/50 outline-none  ${error ? 'border-red-500' : 'border-gray-100 hover:border-indigo-300'}`}
        />
        <AnimatePresence>
            {error && (
                <motion.span initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-red-500 font-bold mt-1 ml-2">
                    {error}
                </motion.span>
            )}
        </AnimatePresence>
    </div>
);

const SelectField = ({ label, name, value, onChange, error, required, options = [], icon, disabled }) => (
    <div className="flex flex-col gap-1">
        <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
            {icon} {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative group">
            <select
                name={name}
                value={value}
                onChange={onChange}
                disabled={disabled}
                className={`p-4 pr-10 w-full rounded-2xl border bg-gray-50/50 shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none appearance-none transition-all ${error ? 'border-red-500' : 'border-gray-100 hover:border-indigo-300'}`}
            >
                {disabled ? (
                    <option value={value}>{options[0]?.label || "N/A"}</option>
                ) : (
                    <>
                        <option value="">Select {label}...</option>
                        {options.map((opt, index) => (
                            <option key={index} value={opt.value}>{opt.label}</option>
                        ))}
                    </>
                )}
            </select>
            {!disabled && (
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-400">
                    <CircleChevronDown size={20} />
                </div>
            )}
        </div>
        <AnimatePresence>
            {error && (
                <motion.span initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-red-500 font-bold mt-1 ml-2">
                    {error}
                </motion.span>
            )}
        </AnimatePresence>
    </div>
);
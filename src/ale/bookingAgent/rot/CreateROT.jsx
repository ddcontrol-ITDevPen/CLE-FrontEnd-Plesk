import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Layout from "../../layout/Layout.jsx";
import { motion, AnimatePresence } from "framer-motion";
import {
    CircleChevronDown,
    LucideArrowBigRightDash,
    LucidePackage,
    LucideShieldUser,
    LucideTruck,
    Trash2,
    Upload
} from "lucide-react";
import { getCompanies } from "../../../services/companyService.js";
import { getAleBookings, registerAleBooking, updateAleBooking } from "../../../services/aleBookingService.js";
import { getUserById } from "../../../services/userService.js";
import { toast, Toaster } from "sonner";

export function ALECreateROT() {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [isLoadingPorts, setIsLoadingPorts] = useState(false);
    const [consignees, setConsignees] = useState([]);
    const [forwardings, setForwardings] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [rotNumber, setRotNumber] = useState("");

    const rotNumberGenerator = () => {
        const newNumber = (Math.floor(Math.random() * 9000000000) + 1).toString().padStart(10, "0");
        return "CLE" + newNumber;
    }

    const [formData, setFormData] = useState({
        rotNumber: rotNumberGenerator(),
        awbNumber: "",
        houseAWBNumber: "",
        flightNumber: "",
        consignee: "",
        externalConsigneeName: "",
        externalConsigneeAddress: "",
        externalConsigneeContact: "",
        externalConsigneeEmail: "",
        carrierReferenceNumber: "",
        totalPackageQuantity: 1,
        weight: 1.0,
        ssmNumber: "",
        size: "",
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        const fetchData = async () => {
            setIsLoadingPorts(true);
            try {
                const data = await getCompanies();
                if (Array.isArray(data)) {
                    const consignees = data.filter(h => h.role === "Consignee").map(h => ({ companyName: h.companyName, companyCode: h.companyCode, address: h.address, ssmNo: h.ssmNo || h.ssmNumber }));
                    setConsignees(consignees);
                    const forwardings = data.filter(h => h.role === "Forwarding").map(h => ({ companyName: h.companyName, companyCode: h.companyCode }));
                    setForwardings(forwardings);
                }
                const bookings = await getAleBookings();
                setBookings(bookings || []);
            } catch (error) {
                console.error("Failed to load data:", error);
                setConsignees([]);
            } finally {
                setIsLoadingPorts(false);
            }
        };
        fetchData();
    }, [location.state]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            let cleanValue = value;
            if (name === "ssmNumber") {
                cleanValue = value.replace(/[^a-zA-Z0-9]/g, "");
            }
            const newData = { ...prev, [name]: cleanValue };
            if (name === "consignee") {
                if (value === "Other") {
                    newData.ssmNumber = "";
                } else {
                    const selectedCompany = consignees.find(c => c.companyCode === value);
                    newData.ssmNumber = (selectedCompany?.ssmNo || selectedCompany?.ssmNumber || "").replace(/[^a-zA-Z0-9]/g, "");
                }
            }
            return newData;
        });
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};

        if (!formData.awbNumber) newErrors.awbNumber = `Air WayBill Number is required!`;
        if (!formData.houseAWBNumber) newErrors.houseAWBNumber = "House AWB Number is required!";
        if (!formData.flightNumber) newErrors.flightNumber = "Flight Number is required!";
        if (!formData.carrierReferenceNumber) newErrors.carrierReferenceNumber = `Carrier Reference Number is required!`;

        if (!formData.consignee) {
            newErrors.consignee = "Please select a Consignee!";
        } else if (formData.consignee === "Other") {
            if (!formData.externalConsigneeName) newErrors.externalConsigneeName = "Consignee Name is required!";
            if (!formData.externalConsigneeAddress) newErrors.externalConsigneeAddress = "Consignee Address is required!";
            if (!formData.externalConsigneeContact) newErrors.externalConsigneeContact = "Consignee Contact Number is required!";
            if (!formData.externalConsigneeEmail) newErrors.externalConsigneeEmail = "Consignee Email Address is required!";
        }

        if (!formData.ssmNumber) newErrors.ssmNumber = "SSM or ROC Number is required!";

        if (!formData.totalPackageQuantity) { newErrors.totalPackageQuantity = "Total Package Quantity is required!"; }
        else if (isNaN(formData.totalPackageQuantity)) { newErrors.totalPackageQuantity = "Total Package Quantity should be a number!"; }
        else if (Number(formData.totalPackageQuantity) <= 0) { newErrors.totalPackageQuantity = "Total Package Quantity must be greater than zero!"; }

        if (!formData.weight) { newErrors.weight = "Weight is required!"; }
        else if (isNaN(formData.weight)) { newErrors.weight = "Weight should be a number!"; }
        else if (Number(formData.weight) <= 0) { newErrors.weight = "Weight must be greater than zero!"; }

        if (!formData.forwardingId) newErrors.forwardingId = "Forwarding Agent is required!";

        const isDuplicate = bookings.some(booking =>
            booking.awbNumber?.trim().toLowerCase() === formData.awbNumber?.trim().toLowerCase() &&
            booking.houseAWBNumber?.trim().toLowerCase() === formData.houseAWBNumber?.trim().toLowerCase()
        )
        if (isDuplicate) {
            newErrors.awbNumber = "This combination of AWB No. and House AWB No. already exists in a booking.";
            newErrors.houseAWBNumber = "This combination of AWB No. and House AWB No. already exists in a booking.";
            toast.error("Duplicate Entry! A booking with this AWB and House AWB combination already exists.");
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        setIsSubmitting(true);
        try {
            const userData = await getUserById(localStorage.getItem("userId"));
            const companyCode = await userData.companyCode;
            const bookingPayload = {
                rotNumber: formData.rotNumber,
                awbNumber: formData.awbNumber.toUpperCase(),
                houseAWBNumber: formData.houseAWBNumber.toUpperCase(),
                flightNumber: formData.flightNumber.toUpperCase(),
                carrierReferenceNumber: formData.carrierReferenceNumber.toUpperCase(),
                totalPackageQuantity: Number(formData.totalPackageQuantity),
                weight: Number(formData.weight),
                forwardingId: formData.forwardingId,
                bookingAgentId: companyCode,
            };

            if (formData.consignee && formData.consignee !== "Other") {
                const selectedConsignee = consignees.find(c => c.companyCode === formData.consignee);
                bookingPayload.consigneeId = formData.consignee;
                bookingPayload.ssmNumber = formData.ssmNumber || selectedConsignee?.ssmNo;
            } else {
                bookingPayload.externalConsigneeName = formData.externalConsigneeName;
                bookingPayload.externalConsigneeAddress = formData.externalConsigneeAddress;
                bookingPayload.externalConsigneeContact = formData.externalConsigneeContact;
                bookingPayload.externalConsigneeEmail = formData.externalConsigneeEmail;
                bookingPayload.ssmNumber = formData.ssmNumber;
            }
            console.log("Registering new booking record:", bookingPayload);
            const savedBooking = await registerAleBooking(bookingPayload);
            toast.success("ROT Booking created successfully!");
            setTimeout(() => navigate("/ale/bookingAgent/submission/history"), 2000);
        } catch (error) {
            console.error("Save failed:", error);
            if (error.response && error.response.data) {
                console.log("Backend Validation Errors:", error.response.data);
            }
            setIsSubmitting(false);
            toast.error(error.response?.data?.message || "Failed to save record. Please check your connection.");
        }
    };

    return (
        <Layout role="forwarder">
            <Toaster richColors position="top-right" />
            <div className="max-w-6xl">
                <h1 className="text-3xl font-bold text-text-heading mb-8">Create New ROT</h1>

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
                            <div className="p-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InputField label="AWB No." name="awbNumber" value={formData.awbNumber} onChange={handleChange} error={errors.awbNumber} required />
                                    <InputField label="House AWB No." name="houseAWBNumber" value={formData.houseAWBNumber} onChange={handleChange} error={errors.houseAWBNumber} required />
                                    <InputField label="Flight No." name="flightNumber" value={formData.flightNumber} onChange={handleChange} error={errors.flightNumber} required />
                                    <InputField label="Carrier Reference No." name="carrierReferenceNumber" value={formData.carrierReferenceNumber} onChange={handleChange} error={errors.carrierReferenceNumber} required />
                                    <SelectField label="Consignee/Shipper" name="consignee" required options={[{ label: "Other", value: "Other" }, ...consignees.map(t => ({ label: t.companyName, value: t.companyCode }))]} value={formData.consignee} onChange={handleChange} error={errors.consignee} />
                                    {formData.consignee === "Other" && (
                                        <>
                                            <InputField label="Consignee/Shipper Name" name="externalConsigneeName" value={formData.externalConsigneeName} onChange={handleChange} error={errors.externalConsigneeName} required />
                                            <InputField label="Consignee/Shipper Address" name="externalConsigneeAddress" value={formData.externalConsigneeAddress} onChange={handleChange} error={errors.externalConsigneeAddress} required />
                                            <InputField label="Consignee/Shipper Contact Number" name="externalConsigneeContact" value={formData.externalConsigneeContact} onChange={handleChange} placeholder="012-3456789" error={errors.externalConsigneeContact} required />
                                            <InputField label="Consignee/Shipper Email Address" name="externalConsigneeEmail" value={formData.externalConsigneeEmail} onChange={handleChange} placeholder="john@example.com" error={errors.externalConsigneeEmail} required />
                                        </>
                                    )}
                                    <InputField label="Consignee SSM/ROC No." name="ssmNumber" value={formData.ssmNumber} onChange={handleChange} readOnly={formData.consignee && formData.consignee !== "Other"} error={errors.ssmNumber} required />
                                    <SelectField label="Forwarding Agent" name="forwardingId" value={formData.forwardingId} onChange={handleChange} options={forwardings.map(t => ({ label: t.companyName, value: t.companyCode }))} error={errors.forwardingId} required />
                                </div>
                            </div>
                        </div>

                        {/* --- SECTION 2: PACKAGE DETAILS --- */}
                        <div className="bg-white rounded-2xl shadow-sm border mt-5 border-gray-100 overflow-hidden">
                            <div className="bg-gradient-to-r from-teal-50 to-green-50 p-6 flex items-center gap-4 border-b border-gray-200">
                                <div className="bg-teal-700 p-2 rounded-lg text-white">
                                    <LucidePackage size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-800">Package Details</h2>
                                    <p className="text-sm text-gray-500">Measurements and quantities</p>
                                </div>
                            </div>
                            <div className="p-8">
                                <div className="grid grid-cols-2 md:grid-cols-2 gap-6">
                                    <InputField label="Total Package Quantity" name="totalPackageQuantity" value={formData.totalPackageQuantity} onChange={handleChange} error={errors.totalPackageQuantity} required />
                                    <InputField label="Weight (kg)" name="weight" value={formData.weight} onChange={handleChange} error={errors.weight} required />
                                </div>
                            </div>
                        </div>
                    </section>

                    <div className="flex justify-end pt-4">
                        <button type="submit" className="group flex items-center gap-3 bg-system-color text-white px-12 py-4 mb-8 rounded-lg font-bold shadow-lg hover:bg-system-color-dark hover:-translate-y-1 transition-all active:scale-95">
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
                    return (<option key={index} value={val}>{lab}</option>);
                })}
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

const FileUpload = ({ label, name, onChange, fileName, onRemove, required, error }) => (
    <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold">{label} {required && <span className="text-red-500">*</span>}</label>
        <div className="relative group">
            <div className={`p-3 rounded-xl border bg-white flex justify-between items-center transition-all shadow-sm
                ${error ? 'border-red-500' : 'border-gray-200'} 
                ${!fileName ? 'text-gray-400' : 'text-gray-800'}`}
            >
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
                <input name={name} type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={onChange} />
            )}
        </div>
        <AnimatePresence>
            {error && (
                <motion.span
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-[11px] text-red-500 font-semibold mt-1 ml-1"
                >
                    {error}
                </motion.span>
            )}
        </AnimatePresence>
    </div>
);
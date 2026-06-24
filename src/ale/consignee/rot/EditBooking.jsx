import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import Layout from "../../layout/Layout.jsx";
import { motion, AnimatePresence } from "framer-motion";
import {
    CircleChevronDown,
    LucideArrowBigRightDash, LucideFile,
    LucidePackage,
    LucideShieldUser,
    LucideTruck,
    Trash2,
    Upload
} from "lucide-react";
import { getCompanies } from "../../../services/companyService.js";
import {
    getAleBookingById,
    getAleBookings,
    registerAleBooking,
    updateAleBooking
} from "../../../services/aleBookingService.js";
import { getUserById } from "../../../services/userService.js";
import { toast, Toaster } from "sonner";
import {
    deleteAleBookingDocument,
    getAleBookingDocuments,
    registerAleBookingDocument
} from "../../../services/aleBookingDocumentService.js";

export function ALEEditBooking() {
    const navigate = useNavigate();
    const [booking, setBooking] = useState(null);
    const [isLoadingData, setIsLoadingData] = useState(false);
    const [forwardings, setForwardings] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [rotNumber, setRotNumber] = useState("");
    const { id } = useParams();

    const rotNumberGenerator = () => {
        const newNumber = (Math.floor(Math.random() * 9000000000) + 1).toString().padStart(10, "0");
        return "CLE" + newNumber;
    }

    const [formData, setFormData] = useState({
        // rotNumber: rotNumberGenerator(),
        awbNumber: "",
        houseAWBNumber: "",
        flightNumber: "",
        // consignee: "",
        // externalConsigneeName: "",
        // externalConsigneeAddress: "",
        // externalConsigneeContact: "",
        // carrierReferenceNumber: "",
        updatedTotalPackageQuantity: 1,
        updatedWeight: 1.0,
        // ssmNumber: "",
        size: "",
    });

    const [documents, setDocuments] = useState({
        doForm: null,
        customForm: null,
        packingList: null,
        otherDoc: null
    });

    const [existingDocuments, setExistingDocuments] = useState({
        doForm: null,
        customForm: null,
        packingList: null,
        otherDoc: null
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        const fetchData = async () => {
            setIsLoadingData(true);
            try {
                const data = await getCompanies();
                if (Array.isArray(data)) {
                    const forwardings = data.filter(h => h.role === "Forwarding").map(h => ({ companyName: h.companyName, companyCode: h.companyCode }));
                    setForwardings(forwardings);
                }
                const booking = await getAleBookingById(id);
                setBooking(booking || null);
                console.log("booking ", booking);

                if (booking) {
                    const isOther = !booking.consigneeId && booking.externalConsigneeName;

                    setFormData({
                        // rotNumber: booking.rotNumber || "",
                        awbNumber: booking.awbNumber || "",
                        houseAWBNumber: booking.houseAWBNumber || "",
                        flightNumber: booking.flightNumber || "",
                        // consignee: isOther ? "Other" : (booking.consigneeId || ""),
                        // externalConsigneeName: booking.externalConsigneeName || "",
                        // externalConsigneeAddress: booking.externalConsigneeAddress || "",
                        // externalConsigneeContact: booking.externalConsigneeContact || "",
                        // carrierReferenceNumber: booking.carrierReferenceNumber || "",
                        updatedTotalPackageQuantity: booking.updatedTotalPackageQuantity || booking.totalPackageQuantity || 1,
                        updatedWeight: booking.updatedWeight || booking.weight || 1.0,
                        size: booking.size || "",
                        // ssmNumber: booking.ssmNumber || booking.ssmNo || "",
                        // forwardingId: booking.forwardingId || "",
                    });

                    console.log(booking.rotNumber);
                    if (booking.rotNumber) {
                        try {
                            const allDocs = await getAleBookingDocuments();
                            if (Array.isArray(allDocs)) {
                                const filteredDocs = allDocs.filter(doc => doc.rotNumber === booking.rotNumber || doc.key === booking.rotNumber);
                                console.log(filteredDocs);
                                const mappedExistingDocs = { doForm: null, customForm: null, packingList: null, otherDoc: null };
                                filteredDocs.forEach(doc => {
                                    const docInfo = { id: doc.bookingDocumentId, name: doc.fileName }
                                    if (doc.documentType === "DO Form") mappedExistingDocs.doForm = docInfo || "DO_Form_Uploaded";
                                    if (doc.documentType === "Custom Form") mappedExistingDocs.customForm = docInfo || "Custom_Form_Uploaded";
                                    if (doc.documentType === "Packing List") mappedExistingDocs.packingList = docInfo || "Packing_List_Uploaded";
                                    if (doc.documentType === "Other Document") mappedExistingDocs.otherDoc = docInfo || "Other_Document_Uploaded";
                                });
                                setExistingDocuments(mappedExistingDocs);
                            }
                        } catch (docError) {
                            console.error("Failed to fetch matching booking documents:", docError);
                        }
                    }
                } else {
                    toast.error("Requested booking context record could not be found.");
                }
            } catch (error) {
                console.error("Failed to load data:", error);
            } finally {
                setIsLoadingData(false);
            }
        };
        fetchData();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newData = { ...prev, [name]: value };
            if (name === "consignee") {
                if (value === "Other") {
                    newData.ssmNumber = "";
                } else {
                    const selectedCompany = consignees.find(c => c.companyCode === value);
                    newData.ssmNumber = selectedCompany?.ssmNo || selectedCompany?.ssmNumber || "";
                }
            }
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
        if (errors[type]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[type];
                return newErrors;
            });
        }
    };

    const handleRemoveExistingFile = async (type) => {
        const targetedDoc = existingDocuments[type];
        if (!targetedDoc || !targetedDoc.id) {
            toast.error("Could not find a valid database ID for this file reference.");
            return;
        }

        try {
            await deleteAleBookingDocument(targetedDoc.id)
            setExistingDocuments(prev => ({ ...prev, [type]: null }));
            toast.info(`Removed server reference for ${type}. Ready for new file upload.`);
        } catch (err) {
            console.error("Error clearing existing document:", err);
            toast.error("Could not delete the server document slot.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};

        // if (!formData.awbNumber) newErrors.awbNumber = `Air WayBill Number is required!`;
        // if (!formData.houseAWBNumber) newErrors.houseAWBNumber = "House AWB Number is required!";
        // if (!formData.flightNumber) newErrors.flightNumber = "Flight Number is required!";
        // if (!formData.carrierReferenceNumber) newErrors.carrierReferenceNumber = `Carrier Reference Number is required!`;
        //
        // if (!formData.consignee) {
        //     newErrors.consignee = "Please select a Consignee!";
        // } else if (formData.consignee === "Other") {
        //     if (!formData.externalConsigneeName) newErrors.externalConsigneeName = "Consignee Name is required!";
        //     if (!formData.externalConsigneeAddress) newErrors.externalConsigneeAddress = "Consignee Address is required!";
        //     if (!formData.externalConsigneeContact) newErrors.externalConsigneeContact = "Consignee Contact Information is required!";
        // }
        //
        // if (!formData.ssmNumber) newErrors.ssmNumber = "SSM or ROC Number is required!";

        if (!formData.updatedTotalPackageQuantity) { newErrors.updatedTotalPackageQuantity = "Total Package Quantity is required!"; }
        else if (isNaN(formData.updatedTotalPackageQuantity)) { newErrors.updatedTotalPackageQuantity = "Total Package Quantity should be a number!"; }
        else if (Number(formData.updatedTotalPackageQuantity) <= 0) { newErrors.updatedTotalPackageQuantity = "Total Package Quantity must be greater than zero!"; }

        if (!formData.updatedWeight) { newErrors.updatedWeight = "Weight is required!"; }
        else if (isNaN(formData.updatedWeight)) { newErrors.updatedWeight = "Weight should be a number!"; }
        else if (Number(formData.updatedWeight) <= 0) { newErrors.updatedWeight = "Weight must be greater than zero!"; }

        if (!formData.size) { newErrors.size = "Size is required!"; }

        if (!documents.doForm && !existingDocuments.doForm) newErrors.doForm = "DO Form is required!";
        if (!documents.packingList && !existingDocuments.packingList) newErrors.packingList = "Packing List is required!";
        if (!documents.customForm && !existingDocuments.customForm) newErrors.customForm = "Custom Form is required!";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        setIsSubmitting(true);
        try {
            const userData = await getUserById(localStorage.getItem("userId"));
            const companyCode = await userData.companyCode;
            const bookingPayload = {
                ...booking,
                // rotNumber: formData.rotNumber,
                // awbNumber: formData.awbNumber,
                // houseAWBNumber: formData.houseAWBNumber,
                // flightNumber: formData.flightNumber,
                // carrierReferenceNumber: formData.carrierReferenceNumber,
                updatedTotalPackageQuantity: Number(formData.updatedTotalPackageQuantity),
                updatedWeight: Number(formData.updatedWeight),
                size: formData.size,
                // forwardingId: formData.forwardingId,
                // bookingAgentId: companyCode,
            };

            // if (formData.consignee && formData.consignee !== "Other") {
            //     const selectedConsignee = consignees.find(c => c.companyCode === formData.consignee);
            //     bookingPayload.consigneeId = formData.consignee;
            //     bookingPayload.ssmNumber = formData.ssmNumber || selectedConsignee?.ssmNo;
            // } else {
            //     bookingPayload.externalConsigneeName = formData.externalConsigneeName;
            //     bookingPayload.externalConsigneeAddress = formData.externalConsigneeAddress;
            //     bookingPayload.externalConsigneeContact = formData.externalConsigneeContact;
            //     bookingPayload.ssmNumber = formData.ssmNumber;
            // }
            console.log("Updating new booking record:", bookingPayload);
            await updateAleBooking(booking.rotNumber, bookingPayload);

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
                    docFormData.append("ROTNumber", booking.rotNumber);
                    docFormData.append("FileName", file.name);
                    docFormData.append("File", file);
                    await registerAleBookingDocument(docFormData);
                }
            }

            toast.success("ROT Booking updated successfully!");
            setTimeout(() => navigate("/ale/consignee/booking/history"), 2000);
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
                            <div className="p-8">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <InputField label="AWB No." name="awbNumber" value={formData.awbNumber} readOnly={true} />
                                    <InputField label="House AWB No." name="houseAWBNumber" value={formData.houseAWBNumber} readOnly={true} />
                                    <InputField label="Flight No." name="flightNumber" value={formData.flightNumber} readOnly={true} />
                                    {/*<InputField label="Carrier Reference No." name="carrierReferenceNumber" value={formData.carrierReferenceNumber} onChange={handleChange} error={errors.carrierReferenceNumber} required />*/}
                                    {/*<SelectField label="Consignee/Shipper" name="consignee" required options={[{ label: "Other", value: "Other" }, ...consignees.map(t => ({label: t.companyName, value: t.companyCode}))]} value={formData.consignee} onChange={handleChange} error={errors.consignee}/>*/}
                                    {/*{formData.consignee === "Other" && (*/}
                                    {/*    <>*/}
                                    {/*        <InputField label="Consignee/Shipper Name" name="externalConsigneeName" value={formData.externalConsigneeName} onChange={handleChange} error={errors.externalConsigneeName} required />*/}
                                    {/*        <InputField label="Consignee/Shipper Address" name="externalConsigneeAddress" value={formData.externalConsigneeAddress} onChange={handleChange} error={errors.externalConsigneeAddress} required />*/}
                                    {/*        <InputField label="Consignee/Shipper Contact Information" name="externalConsigneeContact" value={formData.externalConsigneeContact} onChange={handleChange} placeholder="012-3456789, john@example.com" error={errors.externalConsigneeContact} required />*/}
                                    {/*    </>*/}
                                    {/*)}*/}
                                    {/*<InputField label="SSM/ROC No." name="ssmNumber" value={formData.ssmNumber} onChange={handleChange} readOnly={formData.consignee && formData.consignee !== "Other"} error={errors.ssmNumber} required/>*/}
                                    {/*<SelectField label="Forwarding Agent" name="forwardingId" value={formData.forwardingId} onChange={handleChange} options={forwardings.map(t => ({label: t.companyName, value: t.companyCode}))} />*/}
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
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                    <InputField label="Total Package Quantity" name="updatedTotalPackageQuantity" value={formData.updatedTotalPackageQuantity} onChange={handleChange} error={errors.updatedTotalPackageQuantity} required />
                                    <InputField label="Weight (kg)" name="updatedWeight" value={formData.updatedWeight} onChange={handleChange} error={errors.updatedWeight} required />
                                    <InputField label="Size" name="size" value={formData.size} onChange={handleChange} error={errors.size} required />
                                </div>
                            </div>
                        </div>

                        {/* --- SECTION 3: FORMS & DOCUMENTS --- */}
                        <div className="bg-white rounded-2xl shadow-sm border mt-5 border-gray-100 overflow-hidden">
                            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 flex items-center gap-4 border-b border-purple-100">
                                <div className="bg-orange-600 p-2 rounded-lg text-white">
                                    <LucideFile size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-800">Forms & Documents</h2>
                                    <p className="text-sm text-orange-600/70">Additional or supporting document</p>
                                </div>
                            </div>
                            <div className="p-8 space-y-6">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                    <FileUpload name="doForm" label="DO Form" fileName={documents.doForm?.name || existingDocuments.doForm?.name} onChange={(e) => handleFileChange(e, "doForm")} onRemove={() => documents.doForm ? setDocuments(prev => ({ ...prev, doForm: null })) : handleRemoveExistingFile("doForm")} required={true} error={errors.doForm} />
                                    <FileUpload name="customForm" label="Custom Form" fileName={documents.customForm?.name || existingDocuments.customForm?.name} onChange={(e) => handleFileChange(e, "customForm")} onRemove={() => documents.customForm ? setDocuments(prev => ({ ...prev, customForm: null })) : handleRemoveExistingFile("customForm")} required={true} error={errors.customForm} />
                                    <FileUpload name="packingList" label="Packing List/Invoice" fileName={documents.packingList?.name || existingDocuments.packingList?.name} onChange={(e) => handleFileChange(e, "packingList")} onRemove={() => documents.packingList ? setDocuments(prev => ({ ...prev, packingList: null })) : handleRemoveExistingFile("packingList")} required={true} error={errors.packingList} />
                                    <FileUpload name="otherDoc" label="Other Document" fileName={documents.otherDoc?.name || existingDocuments.otherDoc?.name} onChange={(e) => handleFileChange(e, "otherDoc")} onRemove={() => documents.otherDoc ? setDocuments(prev => ({ ...prev, otherDoc: null })) : handleRemoveExistingFile("otherDoc")} />
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
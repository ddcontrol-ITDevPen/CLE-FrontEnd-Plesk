import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../layout/Layout.jsx";
import {AnimatePresence, motion} from "framer-motion";
import { User, IdCard, Mail, Phone, ArrowLeft, UserPlus, CheckCircle2, FileDown, Upload, FileSpreadsheet}  from "lucide-react";
import { registerDriver } from "../../../services/driverService.js";
import { toast, Toaster } from "sonner";
import * as XLSX from "xlsx";

export function ALEAddDriver() {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        name: "",
        icNumber: "",
        emailAddress: "",
        mobileNumber: ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const downloadTemplate = () => {
        const templateData = [
            {
                "Full Name": "",
                "IC Number": "",
                "Email Address": "",
                "Mobile Number": ""
            }
        ];

        const ws = XLSX.utils.json_to_sheet(templateData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Drivers");
        XLSX.writeFile(wb, "Driver_Import_Template.xlsx");
        toast.info("Template downloaded. Please fill in the details.");
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (evt) => {
            try {
                const dataBuffer = evt.target.result;
                const wb = XLSX.read(dataBuffer, { type: "array" });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];

                if (!ws || !ws['!ref']) {
                    toast.error("The uploaded file is empty or invalid");
                    return;
                }
                const data = XLSX.utils.sheet_to_json(ws, { raw: false, defval: ""});

                // Map Excel headers back to the model
                const formattedData = data.map(row => ({
                    name: row["Full Name"]?.trim(),
                    icNumber: row["IC Number"]?.toString().replace(/\D/g, ""),
                    emailAddress: row["Email Address"]?.trim(),
                    mobileNumber: row["Mobile Number"]?.toString()
                })).filter(d => d.name && d.name !== "");

                if (formattedData.length === 0) {
                    toast.error("No valid driver data found (rows are empty or missing names)");
                    return;
                }

                setIsSubmitting(true);
                for (const driver of formattedData) {
                    await registerDriver(driver);
                }
                toast.success(`Successfully imported ${data.length} drivers!`);
                setTimeout(() => navigate("/ale/haulier/manage/drivers"), 1500);
            } catch (error) {
                console.error(error);
                toast.error("Failed to parse or upload Excel file. Ensure headers match the template.");
            } finally {
                setIsSubmitting(false);
                if (fileInputRef.current) fileInputRef.current.value = "";
            }
        };
        reader.readAsArrayBuffer(file);
    };
    
    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => {
                const { [field]: removed, ...rest } = prev;
                return rest;
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = "Full name is required";
        } else if (formData.name.length < 3) {
            newErrors.name = "Name must be at least 3 characters long";
        }

        const icRegex = /^\d{12}$/;
        if (!formData.icNumber) {
            newErrors.icNumber = "IC number is required";
        } else if (!icRegex.test(formData.icNumber)) {
            newErrors.icNumber = "IC must be 12 digits (e.g., 950101105566)";
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.emailAddress) {
            newErrors.emailAddress = "Email address is required";
        } else if (!emailRegex.test(formData.emailAddress)) {
            newErrors.emailAddress = "Please enter a valid email address";
        }

        const phoneRegex = /^01[0-46-9]-?\d{7,8}$/;
        if (!formData.mobileNumber) {
            newErrors.mobileNumber = "Mobile number is required";
        } else if (!phoneRegex.test(formData.mobileNumber.replace(/-/g, ""))) {
            newErrors.mobileNumber = "Enter a valid mobile number (e.g., 0123456789)";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            toast.error("Please correct the errors in the form");
            return;
        }
    
        setIsSubmitting(true);
        try {
            const user = await getUserById(localStorage.getItem("userId"));
            const updatedData = { ...formData, haulierId: user.companyCode };
            await registerDriver(updatedData);
            toast.success("Driver registered successfully!");
            setTimeout(() => navigate("/ale/haulier/manage/drivers"), 1500);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to add driver");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Layout role="haulier">
            <Toaster richColors position="top-right" />

            <div className="max-w-2xl mx-auto space-y-6">
                <div className="flex flex-col gap-4">
                    <button
                        onClick={() => navigate("/ale/haulier/manage/drivers")}
                        className="flex items-center gap-2 text-gray-500 hover:text-system-color font-bold transition-colors w-fit"
                    >
                        <ArrowLeft size={18} /> Back to Directory
                    </button>

                    <div>
                        <h1 className="text-3xl font-black text-gray-800">Register New Driver</h1>
                        <p className="text-gray-500 font-medium">Fill in the personal details to create a new driver profile</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                        onClick={downloadTemplate}
                        className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl hover:border-indigo-200 transition-all group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-50 text-system-color rounded-xl group-hover:bg-system-color group-hover:text-white transition-colors">
                                <FileDown size={20} />
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-bold text-gray-800">Download Template</p>
                                <p className="text-[11px] text-gray-400 font-medium">Get the Excel format</p>
                            </div>
                        </div>
                    </button>

                    <button
                        onClick={() => fileInputRef.current.click()}
                        className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl hover:border-green-200 transition-all group"
                    >
                        <input
                            type="file"
                            ref={fileInputRef}
                            hidden
                            accept=".xlsx, .xls"
                            onChange={handleFileUpload}
                        />
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-50 text-green-600 rounded-xl group-hover:bg-green-600 group-hover:text-white transition-colors">
                                <Upload size={20} />
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-bold text-gray-800">Upload Filled Excel</p>
                                <p className="text-[11px] text-gray-400 font-medium">Import multiple records</p>
                            </div>
                        </div>
                    </button>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-100/50 p-8 md:p-10"
                >
                    <div className="flex items-center gap-2 mb-6 text-gray-400">
                        <FileSpreadsheet size={18} />
                        <span className="text-xs font-bold uppercase tracking-widest">Individual Registration</span>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 gap-4">
                            <FormInput
                                label="Full Name"
                                icon={<User size={20} />}
                                placeholder="Enter driver's legal name"
                                value={formData.name}
                                onChange={(val) => handleInputChange("name", val)}
                                error={errors.name}
                                required
                            />

                            <FormInput
                                label="IC Number"
                                icon={<IdCard size={20} />}
                                placeholder="e.g. 950101105566"
                                value={formData.icNumber}
                                onChange={(val) => handleInputChange("icNumber", val)}
                                error={errors.icNumber}
                                required
                            />

                            <FormInput
                                label="Email Address"
                                icon={<Mail size={20} />}
                                placeholder="driver@example.com"
                                value={formData.emailAddress}
                                onChange={(val) => handleInputChange("emailAddress", val)}
                                error={errors.emailAddress}
                                required
                            />

                            <FormInput
                                label="Mobile Number"
                                icon={<Phone size={20} />}
                                placeholder="e.g. 0123456789"
                                value={formData.mobileNumber}
                                onChange={(val) => handleInputChange("mobileNumber", val)}
                                error={errors.mobileNumber}
                                required
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-5 flex flex-col md:flex-row gap-4">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-bold transition-all shadow-lg ${
                                    isSubmitting
                                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                        : "bg-system-color text-white hover:bg-system-color-dark shadow-indigo-100"
                                }`}
                            >
                                {isSubmitting ? (
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-400"></div>
                                ) : (
                                    <>
                                        <CheckCircle2 size={20} />
                                        Complete Registration
                                    </>
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate("/ale/haulier/manage/drivers")}
                                className="px-8 py-4 text-gray-500 font-bold hover:bg-gray-50 rounded-2xl transition-all"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </motion.div>

                {/* Helpful Tip */}
                <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4 flex gap-3">
                    <div className="bg-white p-2 rounded-xl shadow-sm text-indigo-600 h-fit">
                        <UserPlus size={18} />
                    </div>
                    <p className="text-sm text-indigo-900/70 font-medium leading-relaxed">
                        Registered drivers will immediately appear in your management directory and can be assigned to active bookings.
                    </p>
                </div>
            </div>
        </Layout>
    );
}

const FormInput = ({ label, icon, placeholder, value, onChange, type = "text", required = false, error }) => (
    <div className="flex flex-col gap-1">
        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
            {label} {required && <span className="text-red-400">*</span>}
        </label>
        <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors">
                {icon}
            </div>
            <input
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={`w-full pl-12 pr-4 py-4 bg-gray-50 border rounded-2xl outline-none transition-all font-medium text-gray-700 placeholder:text-gray-300 
                ${error ? 'border-red-300 focus:ring-4 focus:ring-red-500/10' : 'border-gray-100 focus:ring-4 focus:ring-indigo-500/10 focus:border-system-color'}`}
            />
        </div>
        <AnimatePresence>
            {error && (
                <motion.span initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="text-[11px] text-accent-danger font-semibold mt-1 ml-1">
                    {error}
                </motion.span>
            )}
        </AnimatePresence>
    </div>
);
import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../layout/Layout.jsx";
import { AnimatePresence, motion } from "framer-motion";
import {
    Truck,
    Hash,
    Weight,
    User,
    ArrowLeft,
    PlusCircle,
    CheckCircle2,
    FileDown,
    Upload,
    FileSpreadsheet
} from "lucide-react";
import { registerPrimeMover } from "../../../services/primeMoverService.js"; 
import { toast, Toaster } from "sonner";
import * as XLSX from "xlsx";
import {getUserById} from "../../../services/userService.js";

export function AddPrimeMover() {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        plateNumber: "",
        pmCode: "",
        btm: "",
        bgk: "",
        defaultDriver: ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const downloadTemplate = () => {
        const templateData = [
            {
                "Plate Number": "",
                "PM Code": "",
                "BTM (Weight)": "",
                "BGK (Weight)": "",
                "Default Driver": ""
            }
        ];

        const ws = XLSX.utils.json_to_sheet(templateData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "PrimeMovers");
        XLSX.writeFile(wb, "PrimeMover_Import_Template.xlsx");
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

                // Map Excel headers to PrimeMover Model
                const formattedData = data.map(row => ({
                    plateNumber: row["Plate Number"]?.toString().trim(),
                    pmCode: row["PM Code"]?.toString().trim(),
                    btm: row["BTM (Weight)"]?.toString(),
                    bgk: row["BGK (Weight)"]?.toString(),
                    defaultDriver: row["Default Driver"]?.toString()
                })).filter(p => p.plateNumber && p.plateNumber !== "");

                if (formattedData.length === 0) {
                    toast.error("No valid prime mover data found (rows are empty or missing names)");
                    return;
                }
                const user = await getUserById(localStorage.getItem("userId"));
                const currentHaulierCode = user.companyCode;
                setIsSubmitting(true);
                for (const pm of formattedData) {
                    //await registerPrimeMover(pm);
                    // 💡 Updated: Added haulierId property to Excel uploads
                    await registerPrimeMover({
                        ...pm,
                        haulierId: currentHaulierCode
                    });
                }
                toast.success(`Successfully imported ${data.length} prime movers!`);
                setTimeout(() => navigate("/haulier/manage/prime-movers"), 1500);
            } catch (error) {
                console.error(error);
                toast.error("Import failed. Ensure headers match the template.");
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

        if (!formData.plateNumber.trim()) {
            newErrors.plateNumber = "Plate number is required";
        }

        if (!formData.pmCode.trim()) {
            newErrors.pmCode = "PM Code is required";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            toast.error("Please correct the errors in the form");
            return;
        }

        setIsSubmitting(true);
        try {
            const user = await getUserById(localStorage.getItem("userId"));
            const currentHaulierCode = user.companyCode;
            // 💡 Added: Retrieve logged-in user profile data and extract Haulier ID

            console.log("HaulierID: ", currentHaulierCode);

            // 💡 Updated: Combined your form entries with the system's haulierId property
            const payload = {
                ...formData,
                haulierId: currentHaulierCode
            };
            await registerPrimeMover(payload);
            toast.success("Prime Mover registered successfully!");
            setTimeout(() => navigate("/haulier/manage/prime-movers"), 1500);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to add prime mover");
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
                        onClick={() => navigate("/haulier/manage/prime-movers")}
                        className="flex items-center gap-2 text-gray-500 hover:text-system-color font-bold transition-colors w-fit"
                    >
                        <ArrowLeft size={18} /> Back to Assets
                    </button>

                    <div>
                        <h1 className="text-3xl font-black text-gray-800">Add Prime Mover</h1>
                        <p className="text-gray-500 font-medium">Register a new vehicle to your fleet</p>
                    </div>
                </div>

                {/* Bulk Actions */}
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
                                <p className="text-[11px] text-gray-400 font-medium">Import multiple prime movers</p>
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
                        <span className="text-xs font-bold uppercase tracking-widest">Manual Entry</span>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 gap-4">
                            <FormInput
                                label="Plate Number"
                                icon={<Truck size={20} />}
                                placeholder="e.g. WYY 1234"
                                value={formData.plateNumber}
                                onChange={(val) => handleInputChange("plateNumber", val)}
                                error={errors.plateNumber}
                                required
                            />

                            <FormInput
                                label="PM Code"
                                icon={<Hash size={20} />}
                                placeholder="Internal vehicle code"
                                value={formData.pmCode}
                                onChange={(val) => handleInputChange("pmCode", val)}
                                error={errors.pmCode}
                                required
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormInput
                                    label="BTM (Berat Tanpa Muatan)"
                                    icon={<Weight size={20} />}
                                    placeholder="Unladen weight"
                                    value={formData.btm}
                                    onChange={(val) => handleInputChange("btm", val)}
                                />
                                <FormInput
                                    label="BGK (Berat Gabungan Kendaraan)"
                                    icon={<Weight size={20} />}
                                    placeholder="Laden weight"
                                    value={formData.bgk}
                                    onChange={(val) => handleInputChange("bgk", val)}
                                />
                            </div>

                            <FormInput
                                label="Default Driver (Optional)"
                                icon={<User size={20} />}
                                placeholder="Assigned driver name"
                                value={formData.defaultDriver}
                                onChange={(val) => handleInputChange("defaultDriver", val)}
                            />
                        </div>

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
                                        Register Vehicle
                                    </>
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate("/haulier/manage/prime-movers")}
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
                        <PlusCircle size={18} />
                    </div>
                    <p className="text-sm text-indigo-900/70 font-medium leading-relaxed">
                        Adding a Prime Mover allows it to be tracked via GPS and integrated into the Container Ledger Environment (CLE) booking system.
                    </p>
                </div>
            </div>
        </Layout>
    );
}

// Reuse the FormInput component for styling consistency
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
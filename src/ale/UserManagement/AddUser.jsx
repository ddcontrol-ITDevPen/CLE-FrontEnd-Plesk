import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../layout/Layout.jsx";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowLeft, User, Mail, Phone, ShieldCheck,
    KeyRound, RefreshCw, Building2, Save, LucideCircleCheck, Check, Copy
} from "lucide-react";
import { toast, Toaster } from "sonner";
import { getUserById, registerUser } from "../../services/userService.js";

export function AddUser() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [adminUser, setAdminUser] = useState(null);
    const [successModal, setSuccessModal] = useState({isOpen: false, userId: "", password: ""});
    const [copiedField, setCopiedField] = useState(null);
    const loggedInUserId = localStorage.getItem("userId");
    const userRole = localStorage.getItem("role")?.toLowerCase();

    const [formData, setFormData] = useState({
        fullName: "",
        emailAddress: "",
        contactNumber: "",
        password: "",
        access: [],      
        accessLevel: ""   
    });

    const [errors, setErrors] = useState({});

    const generateRandomPassword = () => {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$";
        const length = Math.floor(Math.random() * 3) + 6;
        let generatedPassword = "";
        for (let i = 0; i < length; i++) {
            generatedPassword += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setFormData(prev => ({ ...prev, password: generatedPassword }));
        if (errors.password) setErrors(prev => ({ ...prev, password: null }));
    };

    useEffect(() => {
        generateRandomPassword();
        const fetchAdminDetails = async () => {
            try {
                const data = await getUserById(loggedInUserId);
                setAdminUser(data);
            } catch (error) {
                toast.error("Failed to read context organization parameters");
            }
        };
        if (loggedInUserId) fetchAdminDetails();
    }, [loggedInUserId]);

    const getUserRole = () => {
        const role = localStorage.getItem("role");
        const roles = {
            Forwarding: "forwarder",
            Haulier: "haulier",
            Terminal: "terminal",
            Akps: "akps",
            Customs: "customs",
            "Booking Agent": "bookingAgent",
            Consignee: "consignee",
        };
        return roles[role] || "";
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    };

    const handleCheckboxChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
    };

    const handleMultiCheckboxChange = (field, routeValue) => {
        setFormData(prev => {
            const currentAccessList = prev[field];

            // Check if the clicked route is already selected
            const updatedAccessList = currentAccessList.includes(routeValue)
                ? currentAccessList.filter(item => item !== routeValue) // Remove if already exists
                : [...currentAccessList, routeValue];                   // Add if it doesn't exist

            return {
                ...prev,
                [field]: updatedAccessList
            };
        });
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
    };

    const handleCopyToClipboard = (text, type) => {
        navigator.clipboard.writeText(text);
        setCopiedField(type);
        toast.success(`${type === 'id' ? 'User ID' : 'Password'} copied to clipboard!`);
        setTimeout(() => setCopiedField(null), 2000);
    };

    const handleCopyBoth = () => {
        const combinedText = `User ID: ${successModal.userId}\nPassword: ${successModal.password}`;
        navigator.clipboard.writeText(combinedText);
        setCopiedField('all');
        toast.success("Both credentials copied together cleanly!");
        setTimeout(() => setCopiedField(null), 2000);
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};

        if (!formData.fullName.trim()) newErrors.fullName = "Full Name is required";
        if (!formData.emailAddress.trim()) newErrors.emailAddress = "Email Address is required";
        if (!formData.password) newErrors.password = "Security password context is required";
        if (formData.access.length === 0) newErrors.access = "At least one Access selection is required";
        if (!formData.accessLevel) newErrors.accessLevel = "Authorization Access Level is required";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            setIsLoading(true);

            const payload = {
                userId: "PENDING_BE",
                password: formData.password,
                fullName: formData.fullName,
                companyCode: adminUser.companyCode,
                access: formData.access.join(","),
                accessLevel: formData.accessLevel,
                emailAddress: formData.emailAddress,
                contactNumber: formData.contactNumber || null,
                status: "Active"
            };

            const responseData = await registerUser(payload);
            setSuccessModal({
                isOpen: true,
                userId: responseData?.userId || responseData?.data?.userId || "Generated By BE",
                password: formData.password
            });
            toast.success("Employee profile completed!");
            setTimeout(() => navigate(-1), 2500);
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to register new employee profile");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Layout role={getUserRole}>
            <Toaster richColors position="top-right" />
            <div className="max-w-4xl mx-auto">

                <div className="mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-gray-500 hover:text-amber-600 mb-4 transition-colors font-bold text-sm"
                    >
                        <ArrowLeft size={16} /> Back
                    </button>
                    <h1 className="text-3xl font-black text-gray-800">Add New Employee</h1>
                    <p className="text-gray-500 font-medium mt-1">Register a new user account profile under your organization registry.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">

                    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Building2 size={14} /> Assigned Company Name
                            </label>
                            <input
                                type="text"
                                readOnly
                                value={adminUser?.companyName || "Loading..."}
                                className="p-3 rounded-xl border border-gray-200 bg-gray-100/70 font-bold text-gray-500 outline-none"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Building2 size={14} /> Company Code
                            </label>
                            <input
                                type="text"
                                readOnly
                                value={adminUser?.companyCode || "Loading..."}
                                className="p-3 rounded-xl border border-gray-200 bg-gray-100/70 font-bold text-gray-500 outline-none"
                            />
                        </div>
                    </div>

                    {/* Master Grid Form Layout */}
                    <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-100/40 border border-gray-100 p-8 space-y-8">

                        {/* Section A: Identities */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputField
                                label="Full Name"
                                name="fullName"
                                icon={<User size={18} />}
                                value={formData.fullName}
                                onChange={handleChange}
                                error={errors.fullName}
                                required
                            />
                            <InputField
                                label="Email Address"
                                name="emailAddress"
                                type="email"
                                icon={<Mail size={18} />}
                                value={formData.emailAddress}
                                onChange={handleChange}
                                error={errors.emailAddress}
                                required
                            />
                            <InputField
                                label="Contact Number (Optional)"
                                name="contactNumber"
                                icon={<Phone size={18} />}
                                value={formData.contactNumber}
                                onChange={handleChange}
                            />

                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-bold text-gray-700 tracking-wider flex items-center gap-2">
                                    <KeyRound size={18} /> Password Context <span className="text-red-500">*</span>
                                </label>
                                <div className="relative flex items-center">
                                    <input
                                        type="text"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className={`p-3 pr-12 w-full rounded-xl border border-gray-200 bg-gray-50/50 outline-none font-mono tracking-wider font-bold ${errors.password ? 'border-red-500' : 'hover:border-amber-300 focus:border-amber-500'}`}
                                    />
                                    <button
                                        type="button"
                                        onClick={generateRandomPassword}
                                        className="absolute right-3 p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                        title="Regenerate Password"
                                    >
                                        <RefreshCw size={18} />
                                    </button>
                                </div>
                                {errors.password && <span className="text-xs text-red-500 font-bold mt-1 ml-2">{errors.password}</span>}
                            </div>
                        </div>

                        <hr className="border-gray-100" />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-sm font-black text-gray-700 uppercase tracking-wider flex items-center gap-2">
                                    <ShieldCheck size={18} className="text-amber-500" /> Access Configuration Route
                                </label>
                                <div className="grid grid-cols-3 gap-4">
                                    {["CLE", "ALE", "WLE"].map((route) => {
                                        const isSelected = formData.access.includes(route);
                                        return (
                                        <div
                                            key={route}
                                            onClick={() => handleMultiCheckboxChange("access", route)}
                                            className={`p-4 rounded-2xl border-2 flex items-center gap-3 cursor-pointer select-none transition-all ${
                                                isSelected
                                                    ? 'border-amber-500 bg-amber-50/40 ring-2 ring-amber-500/20'
                                                    : 'border-gray-100 bg-gray-50/50 hover:border-gray-300'
                                            }`}
                                        >
                                            <div className={`size-6 rounded-lg border flex items-center justify-center transition-all ${
                                                isSelected ? 'bg-amber-600 border-amber-600 text-white' : 'border-gray-300 bg-white'
                                            }`}>
                                                {isSelected && <div className="size-2 bg-white rounded-full"/>}
                                            </div>
                                            <span className="font-bold text-gray-700 capitalize text-sm">{route}</span>
                                        </div>
                                );
                                })}
                                </div>
                                {errors.access && <p className="text-xs text-red-500 font-bold mt-1 ml-2">{errors.access}</p>}
                            </div>

                            <div className="space-y-3">
                                <label className="text-sm font-black text-gray-700 uppercase tracking-wider flex items-center gap-2">
                                    <ShieldCheck size={18} className="text-amber-500" /> Authorization Level
                                </label>
                                <div className="grid grid-cols-2 gap-4">
                                    {["Full Access", "Half Access"].map((level) => (
                                        <div
                                            key={level}
                                            onClick={() => handleCheckboxChange("accessLevel", level)}
                                            className={`p-4 rounded-2xl border-2 flex items-center gap-3 cursor-pointer select-none transition-all ${
                                                formData.accessLevel === level
                                                    ? 'border-amber-500 bg-amber-50/40 ring-2 ring-amber-500/20'
                                                    : 'border-gray-100 bg-gray-50/50 hover:border-gray-300'
                                            }`}
                                        >
                                            <div className={`size-6 rounded-lg border flex items-center justify-center transition-all ${
                                                formData.accessLevel === level ? 'bg-amber-600 border-amber-600 text-white' : 'border-gray-300 bg-white'
                                            }`}>
                                                {formData.accessLevel === level && <div className="size-2 bg-white rounded-full"/>}
                                            </div>
                                            <span className="font-bold text-gray-700 text-sm">{level}</span>
                                        </div>
                                    ))}
                                </div>
                                {errors.accessLevel && <p className="text-xs text-red-500 font-bold mt-1 ml-2">{errors.accessLevel}</p>}
                            </div>

                        </div>

                    </div>

                    {/* Submit Actions Button Box */}
                    <div className="flex justify-end pt-2">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex items-center gap-3 bg-amber-600 text-white px-10 py-4 rounded-2xl font-bold shadow-lg hover:bg-amber-700 transition-all disabled:opacity-50"
                        >
                            <Save size={20} /> {isLoading ? "Onboarding User..." : "Register Employee"}
                        </button>
                    </div>

                </form>
            </div>

            <AnimatePresence>
                {successModal.isOpen && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-white rounded-[2.5rem] max-w-lg w-full p-8 shadow-2xl border border-gray-100 text-center relative"
                        >
                            <div className="flex flex-col items-center mb-6">
                                <div className="bg-green-50 p-4 rounded-full text-green-500 mb-3 animate-bounce">
                                    <LucideCircleCheck size={48} />
                                </div>
                                <h3 className="text-2xl font-black text-gray-900">User Registered Successfully!</h3>
                                <p className="text-gray-500 font-medium text-sm mt-1">
                                    Copy details for administrative deployment hand-off.
                                </p>
                            </div>

                            <div className="mb-6">
                                <button
                                    type="button"
                                    onClick={handleCopyBoth}
                                    className={`w-full py-3 px-4 rounded-xl border-2 flex items-center justify-center gap-2 font-bold text-sm transition-all ${
                                        copiedField === 'all'
                                            ? 'bg-green-600 border-green-600 text-white shadow-md'
                                            : 'border-amber-200 bg-amber-50/50 text-amber-800 hover:bg-amber-50 hover:border-amber-400'
                                    }`}
                                >
                                    {copiedField === 'all' ? <Check size={16} /> : <Copy size={16} />}
                                    {copiedField === 'all' ? "Copied Both Strings!" : "Copy ID & Password Together"}
                                </button>
                            </div>

                            <div className="space-y-4 text-left mb-8">
                                {/* Copy User ID */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-wider">Generated User ID</label>
                                    <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 justify-between">
                                        <span className="font-mono font-bold text-gray-800 text-lg selection:bg-amber-100">{successModal.userId}</span>
                                        <button
                                            type="button" onClick={() => handleCopyToClipboard(successModal.userId, 'id')} className={`p-2 rounded-lg transition-colors ${copiedField === 'id' ? 'bg-green-100 text-green-700' : 'text-gray-400 hover:text-amber-600 hover:bg-amber-50'}`}>
                                            {copiedField === 'id' ? <Check size={18} /> : <Copy size={18} />}
                                        </button>
                                    </div>
                                </div>

                                {/* Copy Password */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-wider">Assigned Temporary Password</label>
                                    <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 justify-between">
                                        <span className="font-mono font-bold text-gray-800 text-lg selection:bg-amber-100">{successModal.password}</span>
                                        <button
                                            type="button" onClick={() => handleCopyToClipboard(successModal.password, 'pwd')} className={`p-2 rounded-lg transition-colors ${copiedField === 'pwd' ? 'bg-green-100 text-green-700' : 'text-gray-400 hover:text-amber-600 hover:bg-amber-50'}`}>
                                            {copiedField === 'pwd' ? <Check size={18} /> : <Copy size={18} />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    setSuccessModal({ isOpen: false, userId: "", password: "" });
                                    navigate(-1);
                                }}
                                className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all shadow-xl active:scale-[0.98]"
                            >
                                Done & Back to Management
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </Layout>
    );
}

const InputField = ({ icon, label, name, value, onChange, error, required, type = "text" }) => (
    <div className="flex flex-col gap-1">
        <label className="text-sm font-bold text-gray-700 tracking-wider flex items-center gap-2">
            {icon} {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            className={`p-3 rounded-xl border bg-gray-50/50 outline-none font-medium text-gray-800 transition-all ${error ? 'border-red-500' : 'border-gray-200 hover:border-amber-300 focus:border-amber-500'}`}
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
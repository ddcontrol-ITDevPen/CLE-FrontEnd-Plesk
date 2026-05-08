import React, { useEffect, useState } from "react";
import Layout from "../../layout/Layout.jsx";
import { motion, AnimatePresence } from "framer-motion";
import { FaUser, FaLock, FaBuilding, FaFloppyDisk, FaArrowLeft } from "react-icons/fa6";
import { getUserById, updateUser } from "../../../services/userService.js";
import { useNavigate } from "react-router-dom";
import { toast, Toaster } from "sonner";

export function ALEForwardingEditProfile() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("general");
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [errors, setErrors] = useState({});
    const [originalUser, setOriginalUser] = useState(null);

    const [formData, setFormData] = useState({
        fullName: "",
        emailAddress: "",
        contactNumber: "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    useEffect(() => {
        const fetchData = async () => {
            const userId = localStorage.getItem("userId");
            try {
                const data = await getUserById(userId);
                setOriginalUser(data);
                setFormData(prev => ({
                    ...prev,
                    fullName: data.fullName,
                    emailAddress: data.emailAddress,
                    contactNumber: data.contactNumber || ""
                }));
            } catch (error) {
                toast.error("Failed to load profile data");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const validateForm = () => {
        let newErrors = {};
        
            if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
            
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!formData.emailAddress) {
                newErrors.emailAddress = "Email is required";
            } else if (!emailRegex.test(formData.emailAddress)) {
                newErrors.emailAddress = "Invalid email format";
            }

            const phoneRegex = /^[0-9]{10,12}$/;
            if (!formData.contactNumber) {
                newErrors.contactNumber = "Contact number is required";
            } else if (!phoneRegex.test(formData.contactNumber)) {
                newErrors.contactNumber = "Phone must be 10-12 digits";
            }

        const curPw = formData.currentPassword.trim();
        const newPw = formData.newPassword.trim();
        const conPw = formData.confirmPassword.trim();
        const isChangingPassword = newPw.length > 0 || conPw.length > 0;
            
        if (isChangingPassword) {
            if (!formData.currentPassword) newErrors.currentPassword = "Old password is required";

            const pwRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

            if (!formData.newPassword) {
                newErrors.newPassword = "New password is required";
            } else if (!pwRegex.test(formData.newPassword)) {
                newErrors.newPassword = "Password must be 8+ chars with Upper, Lower, Number, and Special Character";
            }
            if (formData.newPassword !== formData.confirmPassword) {
                newErrors.confirmPassword = "Passwords do not match";
            }
        }

        setErrors(newErrors);
        const hasGeneralErrors = newErrors.fullName || newErrors.emailAddress || newErrors.contactNumber;
        const hasSecurityErrors = newErrors.currentPassword || newErrors.newPassword || newErrors.confirmPassword;

        if (activeTab === "general" && hasSecurityErrors) {
            toast.error("Please check the Security tab for errors.");
        } else if (activeTab === "security" && hasGeneralErrors) {
            toast.error("Please check the General Info tab for errors.");
        }
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            toast.error("Please fix the errors before saving");
            return;
        }
        setIsSaving(true);
        
        try {
            const userId = localStorage.getItem("userId");
            const trimmedNewPw = formData.newPassword.trim();
            const trimmedCurPw = formData.currentPassword.trim();

            const updatePayload = {
                ...originalUser,
                fullName: formData.fullName,
                emailAddress: formData.emailAddress,
                contactNumber: formData.contactNumber,
                currentPassword: trimmedCurPw ? trimmedCurPw : null,
                newPassword: trimmedNewPw ? trimmedNewPw : null
            };
            await updateUser(userId, updatePayload);
            toast.success("Profile updated successfully");
            setFormData(prev => ({
                ...prev,
                currentPassword: "",
                newPassword: "",
                confirmPassword: ""
            }));
            setTimeout(() => navigate("/ale/forwarding/profile"), 1500);
        } catch (error) {
            toast.error(error.response?.data?.message || "Update failed");
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return <div className="p-20 text-center font-bold text-system-color">Loading Editor...</div>;

    return (
        <Layout role="forwarder">
            <Toaster richColors position="top-right"/>
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <FaArrowLeft className="text-gray-600" />
                    </button>
                    <h1 className="text-3xl font-bold text-gray-800">Account Settings</h1>
                </div>

                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                    {/* Tabs Navigation */}
                    <div className="flex border-b border-gray-100 bg-gray-50/50">
                        <TabButton
                            active={activeTab === "general"}
                            onClick={() => setActiveTab("general")}
                            icon={<FaUser />}
                            label="General Info"
                        />
                        <TabButton
                            active={activeTab === "security"}
                            onClick={() => setActiveTab("security")}
                            icon={<FaLock />}
                            label="Security"
                        />
                    </div>

                    <form onSubmit={handleSave} className="p-8">
                        <AnimatePresence mode="wait">
                            {activeTab === "general" ? (
                                <motion.div
                                    key="general"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                                >
                                    <EditInput
                                        label="Full Name"
                                        value={formData.fullName}
                                        error={errors.fullName}
                                        onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                                    />
                                    <EditInput
                                        label="Email Address"
                                        value={formData.emailAddress}
                                        error={errors.emailAddress}
                                        onChange={(e) => setFormData({...formData, emailAddress: e.target.value})}
                                    />
                                    <EditInput
                                        label="Contact Number"
                                        value={formData.contactNumber}
                                        error={errors.contactNumber}
                                        onChange={(e) => setFormData({...formData, contactNumber: e.target.value})}
                                    />
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="security"
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="max-w-md space-y-6"
                                >
                                    <EditInput
                                        label="Current Password"
                                        type="password"
                                        autoComplete="one-time-code"
                                        value={formData.currentPassword}
                                        error={errors.currentPassword}
                                        onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
                                    />
                                    <div className="h-px bg-gray-100 w-full my-2"></div>
                                    <EditInput
                                        label="New Password"
                                        type="password"
                                        error={errors.newPassword}
                                        value={formData.newPassword}
                                        onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                                    />
                                    <EditInput
                                        label="Confirm New Password"
                                        type="password"
                                        error={errors.confirmPassword}
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="mt-12 pt-8 border-t border-gray-100 flex justify-end">
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="flex items-center gap-2 bg-system-color text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-system-color-dark transition-all disabled:opacity-50"
                            >
                                <FaFloppyDisk /> {isSaving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Layout>
    );
}

const TabButton = ({ active, onClick, icon, label }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-8 py-4 text-sm font-bold transition-all border-b-2 ${
            active
                ? "border-system-color text-system-color bg-white"
                : "border-transparent text-gray-400 hover:text-gray-600"
        }`}
    >
        {icon} {label}
    </button>
);

const EditInput = ({ label, value, onChange, type = "text", error, autoComplete }) => (
    <div className="flex flex-col gap-1">
        <label className="text-[15px] font-bold text-gray-400 tracking-wider ml-1">{label}</label>
        <input
            type={type}
            autoComplete={autoComplete}
            value={value}
            onChange={onChange}
            className={`p-3 rounded-xl border ${error ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-system-color outline-none transition-all font-medium text-gray-700 bg-gray-50/30`}
        />
        {error && <span className="text-[10px] text-red-500 font-bold ml-1">{error}</span>}
    </div>
);
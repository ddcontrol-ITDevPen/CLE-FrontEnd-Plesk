import { useState } from 'react';
import { toast, Toaster } from "sonner";
import { User, Lock, Mail, Eye, EyeOff, CheckCircle2, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from "react-router-dom";
import {resetPassword} from "../services/authService.js";

const portImage2 = "/assets/portImage2.jpg";

export default function ForgotPasswordPage() {
    const [isSuccess, setIsSuccess] = useState(false);
    const [userId, setUserId] = useState('');
    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState({});
    const [apiError, setApiError] = useState('');
    const navigate = useNavigate();

    const handlePasswordReset = async (e) => {
        e.preventDefault();
        setError({});
        setApiError('');
        const newErrors = {};

        if (!userId) newErrors.userId = "User ID is required";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) {
            newErrors.email = "Email is required";
        } else if (!emailRegex.test(email)) {
            newErrors.email = "Invalid email format";
        }
        if (!newPassword) newErrors.password = "Password is required";
        if (!confirmPassword) newErrors.confirmPassword = "Confirm Password is required";
        if (newPassword !== confirmPassword) newErrors.confirmPassword = "Passwords do not match";
        
        if (Object.keys(newErrors).length > 0) {
            setError(newErrors);
            return;
        }

        setIsLoading(true);
        try {
            await resetPassword(userId, email, newPassword);
            setIsSuccess(true);
            toast.success("Password updated successfully!");
            setTimeout(() => {
                navigate("/login");
            }, 2500);
        } catch (err) {
            console.error("Reset Password Error:", err);
            const message = err.response?.data?.message || 'Verification failed. Please check your user details.';
            toast.error(message);
            setApiError(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Toaster position="top-right" richColors />
            <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(to_bottom_right,rgba(35,0,230,0.65),rgba(225,224,254,1),rgba(238,220,154,0.65))] p-4 font-sans">
                <motion.div
                    layout
                    className={`flex flex-col lg:flex-row lg:w-5/6 overflow-hidden bg-white shadow-cle rounded-xl transition-all duration-700 
                ${isSuccess ? 'min-h-0 lg:min-h-[650px] lg:flex-row-reverse' : 'min-h-[510px] lg:min-h-[650px] lg:flex-row'}`}
                >
                    {/* Image Panel */}
                    <motion.div
                        layout
                        transition={{ type: "spring", stiffness: 100, damping: 20 }}
                        className="hidden lg:block lg:w-6/13 bg-system-color relative"
                    >
                        <img
                            src={portImage2}
                            alt="Port Security Backdrop"
                            className="h-full w-full object-cover"
                        />
                        <AnimatePresence>
                            {isSuccess && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 0.3 }}
                                    className="absolute inset-0 bg-black"
                                />
                            )}
                        </AnimatePresence>
                    </motion.div>

                    {/* Form Content Panel */}
                    <motion.div
                        layout
                        className="w-full lg:w-7/13 p-6 sm:p-12 flex flex-col justify-center bg-white"
                    >
                        <AnimatePresence mode="wait">
                            {!isSuccess ? (
                                <motion.div
                                    key="reset-form"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -50 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <button
                                        onClick={() => navigate("/login")}
                                        className="flex items-center gap-2 text-sm text-gray-500 hover:text-system-color mb-4 font-medium transition-colors group"
                                    >
                                        <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" /> Back to Log In
                                    </button>

                                    <h1 className="text-4xl font-bold text-gray-800">Reset Password</h1>
                                    <p className="text-gray-500 text-sm mt-1 mb-6">Verify account ownership to change credential keys.</p>

                                    <form onSubmit={handlePasswordReset} className="space-y-4">
                                        <div className="space-y-4 shadow-input">
                                            <InputField
                                                icon={User}
                                                type="text"
                                                placeholder="User ID"
                                                value={userId}
                                                onChange={(e) => setUserId(e.target.value)}
                                                errorText={error.userId}
                                            />
                                            <InputField
                                                icon={Mail}
                                                type="text"
                                                placeholder="Registered Email Address"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                errorText={error.email}
                                            />
                                            <InputField
                                                icon={Lock}
                                                type="password"
                                                placeholder="New Password"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                isPassword
                                                showPassword={showPassword}
                                                setShowPassword={setShowPassword}
                                                errorText={error.password}
                                            />
                                            <InputField
                                                icon={Lock}
                                                type="password"
                                                placeholder="Confirm New Password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                isPassword
                                                showPassword={showPassword}
                                                setShowPassword={setShowPassword}
                                                errorText={error.confirmPassword}
                                            />
                                        </div>

                                        {/* Error Display Card */}
                                        <AnimatePresence>
                                            {apiError && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -10 }}
                                                    className="bg-red-50 border-l-4 border-red-500 p-3 mt-4 rounded-r-md"
                                                >
                                                    <p className="text-xs text-red-700 font-medium text-center">
                                                        {apiError}
                                                    </p>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        <div className="flex flex-col items-center gap-4 pt-4">
                                            <button
                                                type="submit"
                                                disabled={isLoading}
                                                className={`rounded-full bg-system-color px-12 py-3.5 text-lg font-semibold text-white transition-all 
                                            ${isLoading ? 'opacity-50 cursor-not-allowed' : 'shadow-xl hover:bg-system-color-dark hover:-translate-y-0.5'}`}
                                            >
                                                {isLoading ? 'Updating Credentials...' : 'Save Password'}
                                            </button>
                                        </div>
                                    </form>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="success-message"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.3, duration: 0.5 }}
                                    className="flex flex-col items-center text-center"
                                >
                                    <div className="bg-green-100 p-4 rounded-full mb-6">
                                        <CheckCircle2 className="w-16 h-16 text-green-600" />
                                    </div>
                                    <h2 className="text-3xl font-bold text-gray-800 mb-2">Password Reset!</h2>
                                    <p className="text-gray-600">Your password was updated safely. <br/>Redirecting to Log In gate...</p>

                                    <motion.div
                                        className="w-full h-1 bg-gray-100 mt-8 rounded-full overflow-hidden"
                                        initial={{ width: 0 }}
                                        animate={{ width: "100%" }}
                                        transition={{ duration: 2.0 }}
                                    >
                                        <div className="h-full bg-system-color w-full" />
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </motion.div>
            </div>
        </>
    );
}

const InputField = ({ icon: Icon, type, placeholder, value, onChange, isPassword, showPassword, setShowPassword, errorText, ...props }) => {
    const inputBaseClasses = `w-full rounded-xl border ${errorText ? 'border-red-500' : 'border-gray-300'} py-3 pl-12 pr-10 text-black sm:text-base placeholder:text-gray-400 focus:border-system-color focus:ring-1 focus:ring-system-color transition-all bg-white`;

    return (
        <div className="flex flex-col gap-1">
            <div className="relative">
                <Icon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 z-10" />
                <input
                    type={isPassword ? (showPassword ? 'text' : 'password') : type}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    className={inputBaseClasses}
                    {...props}
                />
                {isPassword && (
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-system-color">
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                )}
            </div>
            {errorText && (
                <span className="text-[10px] text-red-600 font-medium ml-2">
                    {errorText}
                </span>
            )}
        </div>
    );
};
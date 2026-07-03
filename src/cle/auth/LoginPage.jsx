import { useEffect, useState } from 'react';
import { toast, Toaster } from "sonner";
import { User, Lock, MapPin, Eye, EyeOff, ChevronDown, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { login } from "../../services/authService.js";
import { useNavigate } from "react-router-dom";

const portImage1 = "../assets/portImage1.png";
const portImage2 = "../assets/portImage2.png";
const portImage3 = "../assets/portImage3.png";
const cleLogo = "../assets/CLE-Logo.png";
const aleLogo = "../assets/ALE-Logo.png";
const wleLogo = "../assets/WLE-Logo.png";
const claLogo = "../assets/CLA-Logo.png";

const ACCESS_OPTIONS = {
    CLE: [
        { value: "PNG", label: "Penang" },
        { value: "PKG", label: "Port Klang" },
        { value: "PGD", label: "Pasir Gudang" },
        { value: "KTN", label: "Kuantan" }
    ],
    ALE: [
        { value: "PEN", label: "PEN" },
        { value: "KUL", label: "KUL" },
        { value: "JHB", label: "JHB" },
    ],
};

export default function LoginPage() {
    const [isSuccess, setIsSuccess] = useState(false);
    const [access, setAccess] = useState('CLE');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [location, setLocation] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Authentication Logic
    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        if (!username || !password || !location) {
            setError('Validation error');
            setIsLoading(false);
            return;
        }

        try {
            const userData = await login(username, password, location, access);
            if (!userData) {
                throw new Error("No user data received from server.");
            }

            localStorage.setItem("userId", userData.userId);
            localStorage.setItem("userName", userData.fullName);
            localStorage.setItem("role", userData.role);
            localStorage.setItem("companyName", userData.companyName)
            setIsSuccess(true);

            const dbAccess = userData.access || "";
            // 👉 1. Create a sanitized role string (strips spaces and converts to lowercase)
            const sanitizedRole = userData.role.replace(/\s+/g, '').toLowerCase();
            // This turns "Shipping Line" into "shippingline"
            
            if (access === 'CLE' && dbAccess.includes('CLE')) {
                setTimeout(() => {
                    // 👉 2. Update this to use the sanitized string instead
                    navigate(`/${sanitizedRole}/dashboard`);
                }, 2000);
             /*   setTimeout(() => {
                    navigate(`/${userData.role.toLowerCase()}/dashboard`);
                }, 2000);*/
            } else if (access === 'ALE' && dbAccess.includes('ALE')) {
                setTimeout(() => {
                    navigate(`/ale/${userData.role.toLowerCase() === "booking agent" ? "bookingAgent" : userData.role.toLowerCase()}/dashboard`);
                }, 2000);
            } else {
                toast.error("Wrong access!")
            }
        } catch (err) {
            console.error("Login Error:", err);
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
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
                    transition={{ type: "tween", ease: "easeOut", duration: 0.6 }}
                    className={`flex flex-col lg:flex-row lg:w-5/6 overflow-hidden bg-white shadow-cle rounded-xl
                ${isSuccess ? 'min-h-0 lg:min-h-[650px] lg:flex-row-reverse' : 'min-h-[510px] lg:min-h-[650px] lg:flex-row'}`}
                >
                    <motion.div
                        layout
                        // transition={{ type: "spring", stiffness: 100, damping: 20 }}
                        transition={{ type: "tween", ease: "easeOut", duration: 0.6 }}
                        className="hidden lg:block lg:w-6/13 bg-system-color relative"
                    >
                        <img
                            src={portImage1}
                            alt="Port Image"
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
                    <motion.div
                        layout
                        transition={{ type: "tween", ease: "easeOut", duration: 0.6 }}
                        className="w-full lg:w-7/13 p-6 sm:p-12 flex flex-col justify-center bg-white"
                    >
                        <AnimatePresence mode="wait">
                            {!isSuccess ? (
                                <motion.div
                                    key="login-form"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -50 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <h1 className="mb-6 text-4xl font-bold text-gray-800">Log In</h1>
                                    <form onSubmit={handleLogin} className="space-y-6" noValidate>

                                        <div className="flex items-center gap-3">
                                            <EntityCard
                                                logo={cleLogo}
                                                name="CLE"
                                                isSelected={access === 'CLE'}
                                                onClick={() => { setAccess('CLE'); setLocation(''); setError(''); }}
                                            />
                                            <EntityCard
                                                logo={aleLogo}
                                                name="ALE"
                                                isSelected={access === 'ALE'}
                                                onClick={() => { setAccess('ALE'); setLocation(''); setError(''); }}
                                            />
                                            <EntityCard
                                                logo={wleLogo}
                                                name="WLE"
                                                isSelected={access === 'WLE'}
                                                disabled
                                                onClick={() => { setAccess('WLE'); setLocation(''); setError(''); }}
                                            />
                                            <EntityCard
                                                logo={claLogo}
                                                name="CLA"
                                                onClick={() => window.location.href = "https://www.clap.my"}
                                            />
                                            {/* Empty Placeholder Card from Figma */}
                                            {/*<div className="h-[60px] w-1/3 rounded-xl border border-gray-200 bg-white"></div>*/}
                                        </div>

                                        <div className="space-y-4 shadow-input">
                                            <InputField
                                                icon={User}
                                                type="text"
                                                placeholder="Username"
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value)}
                                                errorText={error && !username ? "Username is required" : null}
                                                required
                                            />
                                            <InputField
                                                icon={Lock}
                                                type="password"
                                                placeholder="Password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                isPassword
                                                showPassword={showPassword}
                                                setShowPassword={setShowPassword}
                                                errorText={error && !password ? "Password is required" : null}
                                                required
                                            />
                                            <InputField
                                                icon={MapPin}
                                                placeholder="Select Location"
                                                value={location}
                                                onChange={(e) => setLocation(e.target.value)}
                                                isDropdown
                                                access={access}
                                                errorText={error && !location ? "Please select a location" : null}
                                                required
                                            />
                                        </div>

                                        {/* Error Message Display */}
                                        <AnimatePresence>
                                            {error && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -10 }}
                                                    className="bg-red-50 border-l-4 border-red-500 p-3 mt-4 rounded-r-md"
                                                >
                                                    <p className="text-xs text-red-700 font-medium text-center">
                                                        {error}
                                                    </p>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        <div className="flex flex-col items-center gap-4 mt-8">
                                            <button
                                                type="submit"
                                                disabled={isLoading}
                                                className={`rounded-full bg-system-color px-12 py-3.5 text-lg font-semibold text-white transition-all 
                                            ${isLoading ? 'opacity-50 cursor-not-allowed' : 'shadow-xl hover:bg-system-color-dark hover:-translate-y-0.5'}`}
                                            >
                                                {isLoading ? 'Authenticating...' : 'Login'}
                                            </button>

                                            <a onClick={() => navigate("/forgot-password")} className="text-sm text-gray-700 hover:text-cle-blue hover:underline mb-5">
                                                Forgot Password?
                                            </a>

                                            <button
                                                type="button"
                                                onClick={() => navigate("/register")}
                                                className={`rounded-full bg-system-color px-10 py-3 text-sm font-semibold text-white transition-all shadow-xl hover:bg-system-color-dark hover:-translate-y-0.5`}
                                            >
                                                Want to be our member?
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
                                    <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back!</h2>
                                    <p className="text-gray-600">Successfully authenticated. <br />Redirecting to {access} Dashboard...</p>

                                    {/* A small loading bar for visual polish */}
                                    <motion.div
                                        className="w-full h-1 bg-gray-100 mt-8 rounded-full overflow-hidden"
                                        initial={{ width: 0 }}
                                        animate={{ width: "100%" }}
                                        transition={{ duration: 1.5 }}
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

const InputField = ({ icon: Icon, type, placeholder, value, onChange, isPassword, isDropdown, showPassword, setShowPassword, errorText, access, ...props }) => {
    const inputBaseClasses = `w-full rounded-xl border ${errorText ? 'border-red-500' : 'border-gray-300'} py-3 pl-12 pr-10 text-black sm:text-base placeholder:text-gray-400 focus:border-system-color focus:ring-1 focus:ring-system-color transition-all bg-white`;

    return (
        <div className="flex flex-col gap-1">
            <div className="relative">
                {/* Left Icon */}
                <Icon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 z-10" />

                {isDropdown ? (
                    <select value={value} onChange={onChange} className={`${inputBaseClasses} appearance-none cursor-pointer relative z-0`} {...props}>
                        <option value="" disabled>{placeholder}</option>
                        {ACCESS_OPTIONS[access]?.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                ) : (
                    <input
                        type={isPassword ? (showPassword ? 'text' : 'password') : type}
                        placeholder={placeholder}
                        value={value}
                        onChange={onChange}
                        className={inputBaseClasses}
                        {...props}
                    />
                )}

                {/* Right Interactive Icons (Eye/Dropdown) */}
                {isPassword && (
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-system-color">
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                )}
                {isDropdown && (
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 pointer-events-none" />
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

const EntityCard = ({ logo, name, isSelected, onClick, disabled }) => (
    <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={`flex flex-col h-[75px] sm:h-[90px] items-center justify-center rounded-xl border p-2 transition-all w-1/3 hover:scale-105
            ${isSelected
                ? 'border-system-color ring-1 ring-bg-system-color shadow-lg bg-blue-50/10'
                : 'border-gray-200 bg-white hover:border-system-color hover:shadow-md'}`}
    >
        <img src={logo} alt={name} className="h-full w-full object-contain" />
    </button>
);
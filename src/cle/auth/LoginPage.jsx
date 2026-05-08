import {useEffect, useState} from 'react';
import {toast, Toaster} from "sonner";
import {User, Lock, MapPin, Eye, EyeOff, ChevronDown, CheckCircle2} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {login} from "../../services/authService.js";
import {useNavigate} from "react-router-dom";

const portImage1 = "../assets/portImage1.png";
const portImage2 = "../assets/portImage1.png";
const portImage3 = "../assets/portImage1.png";
const cleLogo = "../assets/CLE-Logo.png";
const aleLogo = "../assets/ALE-Logo.png";

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

        if (!location) {
            setError('Please select a location');
            setIsLoading(false);
            return;
        }
        
        const loginData = {
            userId: username,
            password: password,
            location: location,
            access: access
        };

        try {
            const userData = await login(username, password, location, access);
            localStorage.setItem("userId", userData.userId);
            localStorage.setItem("userName", userData.fullName);
            localStorage.setItem("role", userData.role);
            localStorage.setItem("companyName", userData.companyName)
            setIsSuccess(true);
            
            const dbAccess = userData.access || "";
            
            if (access === 'CLE' && dbAccess.includes('CLE')) {
                
                setTimeout(() => {
                    navigate(`/${userData.role.toLowerCase()}/dashboard`);
                    
                }, 2000);
            } else if (access === 'ALE' && dbAccess.includes('ALE')) {
                setTimeout(() => {
                    navigate(`/ale/${userData.role.toLowerCase()}/dashboard`);
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
                className={`flex w-full max-w-[950px] min-h-[600px] overflow-hidden bg-white shadow-cle rounded-xl transition-all duration-700 ${isSuccess ? 'flex-row-reverse' : 'flex-row'}`}
            >
                <motion.div
                    layout
                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                    className="w-1/2 bg-system-color relative"
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
                    className="w-1/2 p-12 px-16 flex flex-col justify-center bg-white"
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
                                <form onSubmit={handleLogin} className="space-y-6">
            
                                    <div className="flex items-center gap-3">
                                        <EntityCard
                                            logo={cleLogo}
                                            name="CLE"
                                            isSelected={access === 'CLE'}
                                            onClick={() => setAccess('CLE')}
                                        />
                                        <EntityCard
                                            logo={aleLogo}
                                            name="ALE"
                                            isSelected={access === 'ALE'}
                                            onClick={() => setAccess('ALE')}
                                        />
                                        {/* Empty Placeholder Card from Figma */}
                                        <div className="h-[60px] w-1/3 rounded-xl border border-gray-200 bg-white"></div>
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
            
                                        <a href="#" className="text-sm text-gray-700 hover:text-cle-blue hover:underline">
                                            Forgot Password?
                                        </a>
                                    </div>
            
                                </form>
                            </motion.div>
                            ): (
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
                                    <p className="text-gray-600">Successfully authenticated. <br/>Redirecting to {access} Dashboard...</p>
    
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

const InputField = ({ icon: Icon, type, placeholder, value, onChange, isPassword, isDropdown, showPassword, setShowPassword, errorText, ...props }) => {
    const inputBaseClasses = `w-full rounded-xl border ${errorText ? 'border-red-500' : 'border-gray-300'} py-3 pl-12 pr-10 text-black placeholder:text-gray-400 focus:border-system-color focus:ring-1 focus:ring-systemn-color transition-all`;

    return (
        <div className="flex flex-col gap-1">
        <div className="relative">
            {/* Left Icon */}
            <Icon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />

            {isDropdown ? (
                <select value={value} onChange={onChange} className={`${inputBaseClasses} appearance-none`} {...props}>
                    <option value="" disabled>{placeholder}</option>
                    <option value="PNG">Penang</option>
                    <option value="PKG">Port Klang</option>
                    <option value="PGD">Pasir Gudang</option>
                    <option value="KTN">Kuantan</option>
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

const EntityCard = ({ logo, name, isSelected, onClick }) => (
    <button
        type="button"
        onClick={onClick}
        className={`flex flex-col h-[60px] items-center justify-center rounded-xl border p-2 transition-all w-1/3 hover:scale-105
            ${isSelected
            ? 'border-system-color ring-1 ring-bg-system-color shadow-lg'
            : 'border-gray-200 bg-white hover:border-system-color hover:shadow-md'}`}
    >
        <img src={logo} alt={name} className="max-h-[45px] object-contain" />
    </button>
);
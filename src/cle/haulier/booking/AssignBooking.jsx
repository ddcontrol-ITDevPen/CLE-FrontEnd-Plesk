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
    ArrowLeft
} from "lucide-react";
import { getContainerById } from "../../../services/containerService.js";
import { toast, Toaster } from "sonner";
import { getDrivers } from "../../../services/driverService.js";
import { getPrimeMovers } from "../../../services/primeMoverService.js";
import { getTrailers } from "../../../services/trailerService.js";
import { getTimeSlots } from "../../../services/timeSLotService.js";
import { registerAssignedHaulier } from "../../../services/assignedHaulier.js";

export function AssignBooking() {
    const { id } = useParams(); 
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [drivers, setDrivers] = useState([]);
    const [primeMovers, setPrimeMovers] = useState([]);
    const [trailers, setTrailers] = useState([]);
    const [timeSlots, setTimeSlots] = useState([]);

    const [formData, setFormData] = useState({
        blNumber: "",        
        houseBLNumber: "",   
        containerNumber: "", 
        driverName: "",      
        pmNumber: "",        
        trailerNumber: "",   
        timeSlot: "",        
        containerId: id,     
        rotNumber: "",       
        haulierId: localStorage.getItem("companyCode") || "" 
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setIsLoading(true);
                const container = await getContainerById(id);
                const [driverData, pmData, trailerData, slotData] = await Promise.all([
                    getDrivers(),
                    getPrimeMovers(),
                    getTrailers(),
                    getTimeSlots()
                ]);

                setFormData(prev => ({
                    ...prev,
                    blNumber: container.booking?.blOrBookingNumber || "",
                    houseBLNumber: container.booking?.houseBLNumber || "",
                    containerNumber: container.containerNumber || "",
                    rotNumber: container.rotNumber || "",
                    containerId: id
                }));

                setDrivers(driverData || []);
                setPrimeMovers(pmData || []);
                setTrailers(trailerData || []);
                setTimeSlots(slotData || []);
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};

        if (!formData.driverName) newErrors.driverName = "Driver Selection is required";
        if (!formData.pmNumber) newErrors.pmNumber = "Prime Mover is required";
        if (!formData.trailerNumber) newErrors.trailerNumber = "Trailer selection is required";
        if (!formData.timeSlot) newErrors.timeSlot = "Time Slot is required";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            await registerAssignedHaulier(formData);
            toast.success("Haulier assigned successfully!");
            setTimeout(() => navigate("/haulier/booking/accepted"), 1500);
        } catch (error) {
            toast.error("Failed to save assignment");
        }
    };

    if (isLoading) return <div className="p-10 text-center">Loading Assignment Form...</div>;

    return (
        <Layout role="haulier">
            <Toaster richColors />
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
                    {/* Section 1: Read-Only Container Info */}
                    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <InputField label="BL Number" value={formData.blNumber} readOnly />
                        <InputField label="House BL Number" value={formData.houseBLNumber} readOnly />
                        <InputField label="Container Number" value={formData.containerNumber} readOnly />
                    </div>

                    {/* Section 2: Assignment Form */}
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
                                name="driverName"
                                icon={<User size={18}/>}
                                value={formData.driverName}
                                onChange={handleChange}
                                error={errors.driverName}
                                required
                                options={drivers.map(d => ({ label: d.fullName, value: d.fullName }))}
                            />

                            <SelectField
                                label="PM No. (Prime Mover)"
                                name="pmNumber"
                                icon={<Hash size={18}/>}
                                value={formData.pmNumber}
                                onChange={handleChange}
                                error={errors.pmNumber}
                                required
                                options={primeMovers.map(p => ({ label: p.plateNumber, value: p.plateNumber }))}
                            />

                            <SelectField
                                label="Trailer No."
                                name="trailerNumber"
                                icon={<LucideTruck size={18}/>}
                                value={formData.trailerNumber}
                                onChange={handleChange}
                                error={errors.trailerNumber}
                                required
                                options={trailers.map(t => ({ label: t.trailerPlate, value: t.trailerPlate }))}
                            />

                            <SelectField
                                label="Time Slot"
                                name="timeSlot"
                                icon={<Clock size={18}/>}
                                value={formData.timeSlot}
                                onChange={handleChange}
                                error={errors.timeSlot}
                                required
                                options={timeSlots.map(s => ({ label: s.slotRange, value: s.slotRange }))}
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
const InputField = ({ label, value, readOnly }) => (
    <div className="flex flex-col gap-1">
        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</label>
        <input
            type="text"
            value={value}
            readOnly={readOnly}
            className="p-3 rounded-xl border border-gray-200 bg-gray-100/50 text-gray-600 font-bold outline-none"
        />
    </div>
);

const SelectField = ({ label, name, value, onChange, error, required, options, icon }) => (
    <div className="flex flex-col gap-1">
        <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
            {icon} {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative group">
            <select
                name={name}
                value={value}
                onChange={onChange}
                className={`p-4 pr-10 w-full rounded-2xl border bg-gray-50/50 shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none appearance-none transition-all ${error ? 'border-red-500' : 'border-gray-100 hover:border-indigo-300'}`}
            >
                <option value="">Select {label}...</option>
                {options.map((opt, index) => (
                    <option key={index} value={opt.value}>{opt.label}</option>
                ))}
            </select>
            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-400">
                <CircleChevronDown size={20} />
            </div>
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
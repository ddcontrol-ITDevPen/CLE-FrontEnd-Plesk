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
import { getContainerById, updateContainer } from "../../../services/containerService.js";
import { toast, Toaster } from "sonner";
import { getDrivers } from "../../../services/driverService.js";
import { getPrimeMovers } from "../../../services/primeMoverService.js";
import { getTrailers } from "../../../services/trailerService.js";
import { getTimeSlots, updateTimeSlot, getTimeSlotById } from "../../../services/timeSlotService.js";
import {
    getAssignedHaulierByContainerId,
    getAssignedHauliers,
    updateAssignedHaulier
} from "../../../services/assignedHaulier.js";
import { getUserById } from "../../../services/userService.js";

export function EditAssignBooking() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(true);
    const [drivers, setDrivers] = useState([]);
    const [primeMovers, setPrimeMovers] = useState([]);
    const [trailers, setTrailers] = useState([]);
    const [timeSlots, setTimeSlots] = useState([]);
    const [availableDates, setAvailableDates] = useState([]);
    const [selectedDate, setSelectedDate] = useState("");
    const [filteredSlots, setFilteredSlots] = useState([]);
    const [container, setContainer] = useState(null);
    const [assignedHaulier, setAssignedHaulier] = useState(null);

    const [formData, setFormData] = useState({
        id: "",
        blNumber: "",
        houseBLNumber: "",
        containerNumber: "",
        driverId: "",
        pmId: "",
        trailerId: "",
        timeSlotId: "",
        containerId: id,
        rotNumber: "",
        haulierId: ""
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        const fetchEditData = async () => {
            try {
                setIsLoading(true);

                const [containerData, driverData, pmData, trailerData, slotData, assignedHaulierData] = await Promise.all([
                    getContainerById(id),
                    getDrivers(),
                    getPrimeMovers(),
                    getTrailers(),
                    getTimeSlots(),
                    getAssignedHaulierByContainerId(id)
                ]);

                setContainer(containerData);
                setAssignedHaulier(assignedHaulierData);
                console.log(assignedHaulierData);

                const user = await getUserById(localStorage.getItem("userId"));
                const haulierId = user.companyCode;

                setDrivers(driverData.filter(x => x.haulierId === haulierId));
                setPrimeMovers(pmData.filter(x => x.haulierId === haulierId));
                setTrailers(trailerData.filter(x => x.haulierId === haulierId));
                setTimeSlots(slotData);

                const uniqueDates = [...new Set(slotData.map(s => s.date))].sort();
                setAvailableDates(uniqueDates);

                if (assignedHaulierData) {
                    const currentSlot = slotData.find(s => s.id === assignedHaulierData.timeSlotId);
                    if (currentSlot) {
                        setSelectedDate(currentSlot.date);
                        setFilteredSlots(slotData.filter(s => s.date === currentSlot.date));
                    }

                    setFormData({
                        id: assignedHaulierData.id,
                        blNumber: containerData.booking?.blOrBookingNumber || "",
                        houseBLNumber: containerData.booking?.houseBLNumber || "",
                        containerNumber: containerData.containerNumber || "",
                        rotNumber: containerData.rotNumber || "",
                        driverId: assignedHaulierData.driverId,
                        pmId: assignedHaulierData.pmId,
                        trailerId: assignedHaulierData.trailerId,
                        timeSlotId: assignedHaulierData.timeSlotId,
                        containerId: id,
                        haulierId: haulierId
                    });
                }
            } catch (error) {
                toast.error("Failed to load existing assignment");
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchEditData();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    };

    const handleDateChange = (e) => {
        const date = e.target.value;
        setSelectedDate(date);
        const slotsForDate = timeSlots.filter(s => s.date === date).sort((a, b) => a.time.localeCompare(b.time));
        setFilteredSlots(slotsForDate);
        setFormData(prev => ({ ...prev, timeSlotId: "" }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};
        if (!formData.driverId) newErrors.driverId = "Driver Selection is required";
        if (!formData.pmId) newErrors.pmId = "Prime Mover is required";
        if (!formData.trailerId) newErrors.trailerId = "Trailer selection is required";
        if (!formData.timeSlotId) newErrors.timeSlotId = "Time Slot is required";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            await updateAssignedHaulier(formData.id, formData);
            if (formData.timeSlotId !== assignedHaulier.timeSlotId) {
                // Revert OLD slot (+1)
                const oldSlot = await getTimeSlotById(assignedHaulier.timeSlotId);
                await updateTimeSlot(oldSlot.id, { ...oldSlot, totalSlot: oldSlot.totalSlot + 1 });
                // Deduct NEW slot (-1)
                const newSlot = await getTimeSlotById(formData.timeSlotId);
                await updateTimeSlot(newSlot.id, { ...newSlot, totalSlot: newSlot.totalSlot - 1 });
            }
            toast.success("Assignment updated successfully!");
            setTimeout(() => navigate("/haulier/booking/accepted"), 1500);
        } catch (error) {
            toast.error("Failed to update assignment");
            console.error(error);
        }
    };

    if (isLoading) return <div className="p-10 text-center">Loading Assignment...</div>;

    return (
        <Layout role="haulier">
            <Toaster richColors position="top-right"/>
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-system-color mb-2 transition-colors">
                            <ArrowLeft size={16} /> Back
                        </button>
                        <h1 className="text-3xl font-black text-gray-800">Edit Assignment</h1>
                        <p className="text-gray-500 font-medium">Update assets for ROT: {formData.rotNumber}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <InputField label="BL Number" value={formData.blNumber} readOnly />
                        <InputField label="House BL Number" value={formData.houseBLNumber} readOnly />
                        <InputField label="Container Number" value={formData.containerNumber} readOnly />
                    </div>

                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-6 text-white flex items-center gap-4">
                            <div className="bg-white/20 p-2 rounded-lg"><LucideTruck size={24} /></div>
                            <div>
                                <h2 className="text-xl font-bold">Update Dispatch</h2>
                                <p className="text-orange-100 text-sm">Modify existing personnel and assets</p>
                            </div>
                        </div>

                        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <SelectField label="Driver Name" name="driverId" icon={<User size={18}/>} value={formData.driverId} onChange={handleChange} error={errors.driverId} required options={drivers.map(d => ({ label: d.name, value: d.id }))} />
                            <SelectField label="PM No. (Prime Mover)" name="pmId" icon={<Hash size={18}/>} value={formData.pmId} onChange={handleChange} error={errors.pmId} required options={primeMovers.map(p => ({ label: p.plateNumber, value: p.id }))} />
                            <SelectField label="Booking Date" name="bookingDate" icon={<Clock size={18}/>} value={selectedDate} onChange={handleDateChange} required options={availableDates.map(d => ({ label: d, value: d }))} />
                            <SelectField
                                label="Time Slot"
                                name="timeSlotId"
                                icon={<Clock size={18}/>}
                                value={formData.timeSlotId}
                                onChange={handleChange}
                                error={errors.timeSlotId}
                                required
                                disabled={!selectedDate}
                                options={filteredSlots.map(s => ({
                                    label: `${s.time} ${s.id === assignedHaulier?.timeSlotId ? '(Current)' : `(${s.totalSlot} left)`}`,
                                    value: s.id
                                }))}
                            />
                            <SelectField label="Trailer No." name="trailerId" icon={<LucideTruck size={18}/>} value={formData.trailerId} onChange={handleChange} error={errors.trailerId} required options={trailers.map(t => ({ label: `${t.plateNumber} - ${t.type}`, value: t.id }))} />
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button type="submit" className="flex items-center gap-3 bg-amber-600 text-white px-10 py-4 rounded-2xl font-bold shadow-lg hover:bg-amber-700 transition-all">
                            <Save size={20} /> Update Assignment
                        </button>
                    </div>
                </form>
            </div>
        </Layout>
    );
}

// Reusable components (Same as your AssignBooking file)
const InputField = ({ label, value, readOnly }) => (
    <div className="flex flex-col gap-1">
        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</label>
        <input type="text" value={value} readOnly={readOnly} className="p-3 rounded-xl border border-gray-200 bg-gray-100/50 text-gray-600 font-bold outline-none" />
    </div>
);

const SelectField = ({ label, name, value, onChange, error, required, options, icon }) => (
    <div className="flex flex-col gap-1">
        <label className="text-sm font-bold text-gray-700 flex items-center gap-2">{icon} {label} {required && <span className="text-red-500">*</span>}</label>
        <div className="relative group">
            <select name={name} value={value} onChange={onChange} className={`p-4 pr-10 w-full rounded-2xl border bg-gray-50/50 shadow-sm outline-none appearance-none transition-all ${error ? 'border-red-500' : 'border-gray-100 hover:border-amber-300'}`}>
                <option value="">Select {label}...</option>
                {options.map((opt, index) => <option key={index} value={opt.value}>{opt.label}</option>)}
            </select>
            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-400"><CircleChevronDown size={20} /></div>
        </div>
        <AnimatePresence>{error && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-red-500 font-bold mt-1 ml-2">{error}</motion.span>}</AnimatePresence>
    </div>
);
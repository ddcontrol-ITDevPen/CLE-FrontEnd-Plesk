import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../../layout/Layout.jsx";
import { motion, AnimatePresence } from "framer-motion";
import { CircleChevronDown, LucideArrowBigRightDash, LucideShieldUser, LucideTruck } from "lucide-react";
import { getCompanies } from "../../../services/companyService.js";
import { getContainerById } from "../../../services/containerService.js";
import { updateBooking } from "../../../services/bookingService.js";
import { getUserById } from "../../../services/userService.js";
import { toast } from "sonner";

export function ALEEditROTForm() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [isLoading, setIsLoading] = useState(true);
    const [ports, setPorts] = useState([]);
    const [hauliers, setHauliers] = useState([]);
    const [shippingAgents, setShippingAgents] = useState([]);
    const [billingParties, setBillingParties] = useState([]);
    const [depots, setDepots] = useState([]);
    const [consignees, setConsignees] = useState([]);

    const [formData, setFormData] = useState({
        movementType: "",
        rotNumber: "",
        bookingNumber: "",
        houseBLNumber: "",
        scn: "",
        portLocation: "",
        eta: "",
        sealNo: "",
        forwardingRemarks: "",
        customFormNo: "",
        customReceiptNo: "",
        dicNumber: "",
        zbNumber: "",
        shippingAgent: "",
        billingParty: "",
        containerQuantity: 1,
        containerType: "",
        containerSize: "",
        vgm: "",
        trailerType: "",
        rotDate: "",
        haulier: "",
        consignee: "",
        depot: "",
        depotChoice: "Single",
        haulierChoice: "Single",
        forwardingId: ""
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        const initializeData = async () => {
            try {
                // 1. Fetch Company Data
                const companies = await getCompanies();
                const user = await getUserById(localStorage.getItem("userId"));
                const userCompanyCode = user.companyCode;

                if (Array.isArray(companies)) {
                    setPorts(companies.filter(c => c.role === "Port").map(c => ({companyName: c.companyName, companyCode: c.companyCode})));
                    setHauliers(companies.filter(h => h.role === "Haulier").map(h => ({companyName: h.companyName, companyCode: h.companyCode})));
                    setShippingAgents(companies.filter(h => h.role === "Shipping Line").map(h => ({companyName: h.companyName, companyCode: h.companyCode})));
                    setConsignees(companies.filter(h => h.role === "Consignee").map(h => ({companyName: h.companyName, companyCode: h.companyCode})));
                    setDepots(companies.filter(h => h.role === "Depot").map(h => ({companyName: h.companyName, companyCode: h.companyCode})));

                    const billing = [{ companyName: localStorage.getItem("companyName"), companyCode: userCompanyCode },
                        ...companies.filter(c => c.role === "Consignee").map(c => ({companyName: c.companyName, companyCode: c.companyCode}))];
                    setBillingParties(billing);
                }

                // 2. Fetch Existing Container/Booking Data
                const container = await getContainerById(id);
                if (container) {
                    const b = container.booking;
                    setFormData({
                        movementType: b.movementType || "Import",
                        rotNumber: b.rotNumber || "",
                        bookingNumber: b.blOrBookingNumber || "",
                        houseBLNumber: b.houseBLNumber || "",
                        scn: b.scn || "",
                        portLocation: b.portLocation || "",
                        eta: b.eta ? b.eta.split('T')[0] : "",
                        sealNo: b.sealNumber || "",
                        forwardingRemarks: b.forwardingRemarks || "",
                        customFormNo: b.customFormNo || "",
                        customReceiptNo: b.customReceiptNo || "",
                        dicNumber: b.dicNumber || "",
                        zbNumber: b.zbNumber || "",
                        shippingAgent: b.shippingAgentId || "",
                        billingParty: b.billingParty || "",
                        containerQuantity: b.containerQuantity || 1,
                        containerType: container.containerType || "",
                        containerSize: container.containerSize || "",
                        vgm: container.vgm || "",
                        trailerType: container.trailerType || "",
                        rotDate: container.rotDate ? container.rotDate.split('T')[0] : "",
                        haulier: container.haulierId || "",
                        consignee: container.consigneeId || "",
                        depot: container.depotId || "",
                        depotChoice: b.depotChoice || "Single",
                        haulierChoice: b.haulierChoice || "Single",
                        forwardingId: userCompanyCode
                    });
                }
            } catch (error) {
                toast.error("Failed to load ROT data");
            } finally {
                setIsLoading(false);
            }
        };
        initializeData();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newData = { ...prev, [name]: value };
            if (name === "haulierChoice" && value === "Multiple") newData.haulier = "";
            if (name === "depotChoice" && value === "Multiple") newData.depot = "";
            return newData;
        });
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    };

    const handleNext = async (e) => {
        e.preventDefault();
        const newErrors = {};

        if (!formData.bookingNumber) newErrors.bookingNumber = "Required!";
        if (!formData.scn) newErrors.scn = "Required!";
        if (!formData.haulier && formData.haulierChoice === "Single") newErrors.haulier = "Required!";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            const payload = {
                ...formData,
                ShippingAgentId: formData.shippingAgent,
                rotNumber: formData.rotNumber,
                blOrBookingNumber: formData.bookingNumber,
            };

            localStorage.setItem("updatedROT", JSON.stringify(payload));
            await updateBooking(formData.rotNumber, payload);
            navigate(`/ale/forwarding/rot/edit/form2/${id}`);
        } catch (err) {
            toast.error("Update failed");
        }
    };

    const date = new Date();
    date.setDate(date.getDate() - 1);
    const yesterday = date.toISOString().split('T')[0];

    if (isLoading) return <div className="p-20 text-center font-bold">Loading Shipment Data...</div>;

    return (
        <Layout role="forwarder">
            <div className="max-w-6xl">
                <h1 className="text-3xl font-bold text-text-heading mb-8 uppercase">Edit ROT - Step 1</h1>

                <form onSubmit={handleNext} className="space-y-8">
                    <section>
                        {/* --- SECTION 1: BOOKING INFORMATION --- */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 flex items-center gap-4 border-b border-blue-100">
                                <div className="bg-system-color p-2 rounded-lg text-white">
                                    <CircleChevronDown size={24} className="rotate-180" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-800">Booking Information</h2>
                                    <p className="text-sm text-system-color/70">Update shipment and party details</p>
                                </div>
                            </div>

                            <div className="p-8 space-y-8">
                                <div className="flex items-center gap-12 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <span className="text-sm font-semibold text-gray-700">Movement Type <span className="text-red-500">*</span></span>
                                    <div className="flex gap-6">
                                        {['Import', 'Export'].map((type) => (
                                            <label key={type} className="flex items-center gap-2 cursor-pointer group">
                                                <input type="radio" name="movementType" checked={formData.movementType === type} value={type} onChange={handleChange} className="w-4 h-4 accent-blue-600" />
                                                <span className={`text-sm ${formData.movementType === type ? 'font-bold text-system-color' : 'text-gray-500'}`}>{type}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <InputField label={formData.movementType === "Import" ? "BL No." : "Booking No."} name="bookingNumber" value={formData.bookingNumber} readOnly />
                                    <InputField label="House BL No." name="houseBLNumber" value={formData.houseBLNumber} onChange={handleChange} error={errors.houseBLNumber} required/>
                                    <InputField label="SCN" name="scn" value={formData.scn} onChange={handleChange} error={errors.scn} required />
                                    <SelectField label={formData.movementType === "Import" ? "POD" : "POL"} name="portLocation" value={formData.portLocation} onChange={handleChange} error={errors.portLocation} options={ports.map(p => ({label: p.companyName, value: p.companyCode}))} />
                                    <SelectField label="Shipping Agent" name="shippingAgent" value={formData.shippingAgent} onChange={handleChange} options={shippingAgents.map(s => ({label: s.companyName, value: s.companyCode}))} />
                                    <SelectField label="Billing Party" name="billingParty" value={formData.billingParty} onChange={handleChange} options={billingParties.map(b => ({label: b.companyName, value: b.companyCode}))} />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="flex flex-col gap-2 p-4 bg-blue-50/30 rounded-xl border border-blue-100">
                                        <label className="text-sm font-semibold text-gray-800">Assigned Haulier</label>
                                        <div className="flex-1">
                                            <SelectField
                                                label=""
                                                name="haulier"
                                                value={formData.haulier}
                                                onChange={handleChange}
                                                error={errors.haulier}
                                                options={hauliers.map(h => ({label: h.companyName, value: h.companyCode}))}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2 p-4 bg-blue-50/30 rounded-xl border border-blue-100">
                                        <label className="text-sm font-semibold text-gray-800">Assigned Depot</label>
                                        <div className="flex-1">
                                            <SelectField
                                                label=""
                                                name="depot"
                                                value={formData.depot}
                                                onChange={handleChange}
                                                options={depots.map(d => ({label: d.companyName, value: d.companyCode}))}
                                            />
                                        </div>
                                    </div>
                                    <SelectField label="Consignee/Shipper" name="consignee" options={consignees.map(t => ({label: t.companyName, value: t.companyCode}))} value={formData.consignee} onChange={handleChange} />
                                    <InputField label="Forwarding Remarks" name="forwardingRemarks" value={formData.forwardingRemarks} onChange={handleChange} />
                                </div>
                            </div>
                        </div>

                        {/* --- SECTION 2: CONTAINER DETAILS --- */}
                        <div className="bg-white rounded-2xl shadow-sm border mt-5 border-gray-100 overflow-hidden">
                            <div className="bg-gradient-to-r from-gray-100 to-slate-200 p-6 flex items-center gap-4 border-b border-gray-200">
                                <div className="bg-gray-700 p-2 rounded-lg text-white">
                                    <LucideTruck size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-800">Container Details</h2>
                                    <p className="text-sm text-gray-500">Specifications for this container</p>
                                </div>
                            </div>
                            <div className="p-8">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                    <InputField label="Quantity" name="containerQuantity" value={formData.containerQuantity} readOnly />
                                    <SelectField label="Type" name="containerType" options={["GP", "RF", "HC"]} value={formData.containerType} onChange={handleChange} />
                                    <SelectField label="Size" name="containerSize" options={["20", "40", "45"]} value={formData.containerSize} onChange={handleChange} />
                                    <InputField label="VGM" name="vgm" value={formData.vgm} onChange={handleChange} />
                                    <SelectField label="Trailer" name="trailerType" options={["Normal", "Tipper", "Air", "SL"]} value={formData.trailerType} onChange={handleChange} />
                                    <InputField label="ROT Date" name="rotDate" type="date" value={formData.rotDate} onChange={handleChange} required />
                                </div>
                            </div>
                        </div>

                        {/* --- SECTION 3: CUSTOMS & TRACKING --- */}
                        <div className="bg-white rounded-2xl shadow-sm border mt-5 border-gray-100 overflow-hidden">
                            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 flex items-center gap-4 border-b border-purple-100">
                                <div className="bg-purple-600 p-2 rounded-lg text-white">
                                    <LucideShieldUser size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-800">Customs & Tracking</h2>
                                    <p className="text-sm text-purple-600/70">Regulatory and reference numbers</p>
                                </div>
                            </div>
                            <div className="p-8 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <InputField label="ETA" name="eta" type="date" value={formData.eta} onChange={handleChange} min="01/01/2025" />
                                    <InputField label="DIC No." name="dicNumber" value={formData.dicNumber} onChange={handleChange} />
                                    <InputField label="Custom Form No." name="customFormNo" value={formData.customFormNo} onChange={handleChange} />
                                    <InputField label="Custom Receipt No." name="customReceiptNo" value={formData.customReceiptNo} onChange={handleChange} />
                                    <InputField label="FCZ No." name="zbNumber" value={formData.zbNumber} onChange={handleChange} />
                                    <InputField label="Seal No." name="sealNo" value={formData.sealNo} onChange={handleChange} />
                                </div>
                            </div>
                        </div>
                    </section>

                    <div className="flex justify-end pt-4">
                        <button type="submit" className="group flex items-center gap-3 bg-system-color text-white px-12 py-4 rounded-lg font-bold shadow-xl hover:-translate-y-1 transition-all active:scale-95">
                            Update & Continue to Addressing
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
            {subLabel && <span className="ml-1 text-xs font-normal italic text-gray-400">({subLabel})</span>}
        </label>
        <input
            type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} min={min} max={max} readOnly={readOnly}
            className={`p-3 rounded-xl border ${readOnly ? "bg-gray-100 text-gray-500 cursor-not-allowed" : "bg-white"} shadow-sm focus:ring-2 focus:ring-system-color outline-none transition-all ${error ? 'border-red-500' : 'border-gray-200'}`}
        />
        <AnimatePresence>
            {error && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[11px] text-red-600 font-medium leading-tight mt-1">{error}</motion.span>}
        </AnimatePresence>
    </div>
);

const SelectField = ({ label, name, value, onChange, error, required, options }) => (
    <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold">{label} {required && <span className="text-red-500">*</span>}</label>
        <div className="relative group w-full">
            <select name={name} value={value} onChange={onChange}
                    className={`p-3 pr-8 w-full rounded-xl border bg-white shadow-sm focus:ring-2 focus:ring-system-color outline-none appearance-none transition-all ${error ? 'border-red-500' : 'border-gray-200'} truncate`}
            >
                <option value="">Select...</option>
                {options.map((opt, index) => {
                    const isObj = typeof opt === 'object';
                    return (<option key={index} value={isObj ? opt.value : opt}>{isObj ? opt.label : opt}</option>);
                })}
            </select>
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400 group-hover:text-system-color transition-colors">
                <CircleChevronDown size={18} />
            </div>
        </div>
        <AnimatePresence>
            {error && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[11px] text-accent-danger font-semibold mt-1 ml-1">{error}</motion.span>}
        </AnimatePresence>
    </div>
);
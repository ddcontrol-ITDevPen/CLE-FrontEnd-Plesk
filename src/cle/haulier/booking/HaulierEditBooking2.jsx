import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../../layout/Layout.jsx";
import { motion, AnimatePresence } from "framer-motion";
import { CircleChevronDown, Trash2, Upload } from "lucide-react";
import { toast, Toaster } from "sonner";
import { getCompanies } from "../../../services/companyService.js";
import { getContainerById, updateContainer } from "../../../services/containerService.js";
import { registerBookingDocument } from "../../../services/bookingDocumentService.js";
import {getUserById} from "../../../services/userService.js";

export function HaulierEditBooking2() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [allCompanies, setAllCompanies] = useState([]);
    const [consignees, setConsignees] = useState([]);
    const [hauliers, setHauliers] = useState([]);
    const [depots, setDepots] = useState([]);

    const [containerData, setContainerData] = useState({
        containerNo: "",
        containerType: "",
        containerSize: "",
        tareWeight: 0,
        cargoWeight: 0,
        vgm: "",
        trailerType: "",
        consignee: "",
        haulier: "",
        depot: "",
        port: "",
        rotDate: "",
        addresses: [""],
        status: "",
        assignedTime: "",
        enrouteTime: "",
        gatedInTime: "",
        gatedOutTime: "",
        deliveredTime: "",
        rfcTime: "",
        rejectedTime: "",
        deletedTime: "",
        rtAssignedTime: "",
        rtEnrouteTime: "",
        rtGatedInTime: "",
        rtGatedOutTime: "",
        rtDeliveredTime: "",
        rtRFCTime: "",
    });

    const [documents, setDocuments] = useState({
        rotForm: null,
        customForm: null,
        packingList: null,
        otherDoc: null
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        const initializeData = async () => {
            try {
                const companies = await getCompanies();
                if (Array.isArray(companies)) {
                    setAllCompanies(companies);
                    setConsignees(companies.filter(c => c.role === "Consignee").map(c => ({ label: c.companyName, value: c.companyCode })));
                    setHauliers(companies.filter(c => c.role === "Haulier").map(c => ({ label: c.companyName, value: c.companyCode })));
                    setDepots(companies.filter(c => c.role === "Depot").map(c => ({ label: c.companyName, value: c.companyCode })));
                }

                const container = await getContainerById(id);
                const localEdits = JSON.parse(localStorage.getItem("updatedROT") || "null");
                console.log(container);
                if (container) {
                    setContainerData({
                        containerNo: container.containerNumber || "",
                        containerType: localEdits?.containerType || container.containerType || "",
                        containerSize: localEdits?.containerSize || container.containerSize || "",
                        tareWeight: localEdits?.tareWeight || container.tareWeight || "",
                        cargoWeight: localEdits?.cargoWeight || container.cargoWeight || "",
                        vgm: localEdits?.vgm || container.vgm || "",
                        trailerType: localEdits?.trailerType || container.trailerType || "",
                        consignee: localEdits?.consignee || container.consigneeId || "",
                        haulier: localEdits?.haulier || container.haulierId || "",
                        depot: localEdits?.depot || container.depotId || "",
                        port: localEdits?.port || container.portId || "",
                        rotDate: localEdits?.rotDate
                            ? localEdits.rotDate
                            : (container.rotDate ? container.rotDate.split('T')[0] : ""),
                        addresses: container.toAddress?.length > 0
                            ? container.toAddress.map(a => a.address)
                            : [""],
                        rotNumber: container.rotNumber || "",
                        status: container.status || "Assigned",
                        assignedTime: container.assignedTime,
                        enrouteTime: container.enrouteTime || null,
                        acceptedTime: container.acceptedTime || null,
                        gatedInTime: container.gatedInTime || null,
                        gatedOutTime: container.gatedOutTime || null,
                        deliveredTime: container.deliveredTime || null,
                        rfcTime: container.rfcTime || null,
                        rejectedTime: container.rejectedTime || null,
                        deletedTime: container.deletedTime || null,
                        rtAssignedTime: container.rtAssignedTime || null,
                        rtEnrouteTime: container.rtEnrouteTime || null,
                        rtAcceptedTime: container.rtAcceptedTime || null,
                        rtGatedInTime: container.rtGatedInTime || null,
                        rtGatedOutTime: container.rtGatedOutTime || null,
                        rtDeliveredTime: container.rtDeliveredTime || null,
                        rtRFCTime: container.rtRFCTime || null,
                    });
                }
            } catch (error) {
                toast.error("Failed to load container data");
            } finally {
                setIsLoading(false);
            }
        };
        initializeData();
    }, [id]);

    const handleInputChange = (field, value) => {
        setContainerData(prev => {
            const newData = { ...prev, [field]: value };
            if (field === "consignee") {
                const selected = allCompanies.find(c => c.companyCode === value);
                if (selected) newData.addresses[0] = selected.address;
            }
            return newData;
        });
    };
    const handleAutoChange = (field, value) => {
        setContainerData(prev => {
            const updated = {
                ...prev,
                [field]: value
            };

            const tare = parseFloat(updated.tareWeight) || 0;
            const cargo = parseFloat(updated.cargoWeight) || 0;

            updated.vgm = tare + cargo > 0
                ? (tare + cargo).toString()
                : "";

            return updated;
        });
    };
    const handleContainerTypeChange = (size) => {
        let automaticTare = "";

        if (size === "20") {
            automaticTare = "20000";
        } else if (size === "40") {
            automaticTare = "40000";
        } else if (size === "45") {
            automaticTare = "45000";
        }

        setContainerData(prev => {
            const cargo = parseFloat(prev.cargoWeight) || 0;

            return {
                ...prev,
                containerSize: size,
                tareWeight: automaticTare,
                vgm:
                    (parseFloat(automaticTare) || 0) + cargo > 0
                        ? (
                            (parseFloat(automaticTare) || 0) +
                            cargo
                        ).toString()
                        : ""
            };
        });
    };
    const handleAddressChange = (idx, value) => {
        const newAddrs = [...containerData.addresses];
        newAddrs[idx] = value;
        setContainerData(prev => ({ ...prev, addresses: newAddrs }));
    };

    const addAddress = () => setContainerData(prev => ({ ...prev, addresses: [...prev.addresses, ""] }));

    const removeAddress = (idx) => {
        const newAddrs = containerData.addresses.filter((_, i) => i !== idx);
        setContainerData(prev => ({ ...prev, addresses: newAddrs }));
    };

    const handleFileChange = (e, type) => {
        const file = e.target.files[0];
        if (file) setDocuments(prev => ({ ...prev, [type]: file }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};
        /* if (!containerData.containerNo) newErrors.containerNo = "Required";*/
        if (!containerData.consignee) newErrors.consignee = "Required";
        if (!containerData.rotDate) newErrors.rotDate = "Required";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            toast.error("Please fill in all required fields");
            return;
        }

        const user = await getUserById(localStorage.getItem("userId"));
        const updatedBy = user.fullName + " - " + user.companyName
        setIsSubmitting(true);
        try {
            const containerPayload = {
                ContainerNumber: containerData.containerNo || null,
                ContainerType: containerData.containerType,
                ContainerSize: containerData.containerSize,
                TareWeight: containerData.tareWeight || 0,
                CargoWeight: containerData.cargoWeight || 0,
                VGM: containerData.vgm || null,
                TrailerType: containerData.trailerType || null,
                ConsigneeId: containerData.consignee,
                DepotId: containerData.depot,
                HaulierId: containerData.haulier,
                PortId: containerData.port,
                ROTDate: containerData.rotDate,
                ToAddress: containerData.addresses
                    .filter(addr => addr.trim() !== "")
                    .map(addr => ({ Address: addr })),
                ROTNumber: containerData.rotNumber,
                Status: containerData.status,
                AssignedTime: containerData.assignedTime,
                EnrouteTime: containerData.enrouteTime || null,
                GatedInTime: containerData.gatedInTime || null,
                GatedOutTime: containerData.gatedOutTime || null,
                DeliveredTime: containerData.deliveredTime || null,
                RfcTime: containerData.rfcTime || null,
                RejectedTime: containerData.rejectedTime || null,
                DeletedTime: containerData.deletedTime || null,
                RtAssignedTime: containerData.rtAssignedTime || null,
                RtEnrouteTime: containerData.rtEnrouteTime || null,
                RtGatedInTime: containerData.rtGatedInTime || null,
                RtGatedOutTime: containerData.rtGatedOutTime || null,
                RtDeliveredTime: containerData.rtDeliveredTime || null,
                RtRFCTime: containerData.rtRFCTime || null,
                UpdatedBy: updatedBy,
            };

            await updateContainer(id, containerPayload);

            const updatedROT = JSON.parse(localStorage.getItem("updatedROT") || "{}");
            for (const [key, file] of Object.entries(documents)) {
                if (file) {
                    const docForm = new FormData();
                    docForm.append("DocumentType", key);
                    docForm.append("ROTNumber", updatedROT.rotNumber || "UNKNOWN");
                    docForm.append("FileName", file.name);
                    docForm.append("File", file);
                    await registerBookingDocument(docForm);
                }
            }

            toast.success("Record updated successfully");
            localStorage.removeItem("updatedROT");
            setTimeout(() => navigate("/haulier/booking"), 1500);
        } catch (error) {
            toast.error("Update failed");
            setIsSubmitting(false);
        }
    };

    if (isLoading) return <div className="p-20 text-center font-bold">Loading Container Info...</div>;

    const date = new Date();
    date.setDate(date.getDate() - 1);
    const yesterday = date.toISOString().split('T')[0];

    return (
        <Layout role="forwarder">
            <Toaster position="top-right" richColors />
            <div className="max-w-6xl">
                <h1 className="text-3xl font-bold text-text-heading mb-8 uppercase">Edit ROT - Forwarding</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <h2 className="text-2xl font-bold">Container Information</h2>

                    <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg">Container Details</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                            <InputField label="Container No." value={containerData.containerNo} onChange={(e) => handleInputChange("containerNo", e.target.value)} error={errors.containerNo} />
                            <SelectField label="Container Type" required options={["GP", "RF", "HC"]} value={containerData.containerType} onChange={(e) => handleInputChange("containerType", e.target.value)} />
                            {/* <SelectField label="Container Size" required options={["20", "40", "45"]} value={containerData.containerSize} onChange={(e) => handleInputChange("containerSize", e.target.value)} />*/}
                            <SelectField
                                label="Container Size"
                                required
                                options={["20", "40", "45"]}
                                value={containerData.containerSize} // ✅ Changed from container to containerData
                                onChange={(e) => handleContainerTypeChange(e.target.value)}
                                error={errors.containerSize}
                            />
                            <InputField label="ROT Date" required type="date" value={containerData.rotDate} onChange={(e) => handleInputChange("rotDate", e.target.value)} min="01/01/2025" error={errors.rotDate} />
                            <InputField
                                label="Container Tare Weight (kg)"
                                type="number"
                                value={containerData.tareWeight || ""} // ✅ Changed from container to containerData
                                readOnly
                            />
                            <InputField
                                label="Cargo Weight (kg)"
                                type="number"
                                value={containerData.cargoWeight || ""} // ✅ Changed from container to containerData
                                onChange={(e) =>
                                    handleAutoChange("cargoWeight", e.target.value)
                                }
                            />
                            <InputField
                                label="VGM (kg)"
                                type="number"
                                value={containerData.vgm || ""} // ✅ Changed from container to containerData
                                readOnly
                                className="bg-gray-100 font-bold"
                            />
                            {/* <InputField label="VGM" value={containerData.vgm} onChange={(e) => handleInputChange("vgm", e.target.value)} />
*/}
                            <SelectField label="Trailer Type" options={["Normal", "Tipper", "Air", "SL"]} value={containerData.trailerType} onChange={(e) => handleInputChange("trailerType", e.target.value)} />
                            <SelectField label="Consignee/Shipper" required options={consignees} value={containerData.consignee} onChange={(e) => handleInputChange("consignee", e.target.value)} error={errors.consignee} />
                            <SelectField label="Haulier" required options={hauliers} value={containerData.haulier} onChange={(e) => handleInputChange("haulier", e.target.value)} />
                            <SelectField label="Depot" required options={depots} value={containerData.depot} onChange={(e) => handleInputChange("depot", e.target.value)} />

                            <InputField label="Port" value={allCompanies.find(c => c.companyCode === containerData.port)?.companyName || containerData.port} readOnly />

                        </div>

                        <div className="mt-6 space-y-4">
                            {containerData.addresses.map((addr, aIdx) => (
                                <div key={aIdx} className="flex items-end gap-4">
                                    <div className="flex-1">
                                        <label className="text-sm font-semibold mb-1 block">Consignee Address</label>
                                        <textarea
                                            className="w-full p-3 rounded-xl border border-gray-200 bg-white min-h-[100px] outline-none focus:ring-2 focus:ring-system-color"
                                            value={addr}
                                            onChange={(e) => handleAddressChange(aIdx, e.target.value)}
                                            readOnly={aIdx === 0}
                                        />
                                    </div>
                                    {aIdx > 0 && (
                                        <button type="button" onClick={() => removeAddress(aIdx)} className="mb-4 text-red-500 hover:text-red-700">
                                            <Trash2 size={20} />
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button type="button" onClick={addAddress} className="bg-gray-700 text-white px-6 py-2 rounded-lg font-bold text-sm shadow-md hover:bg-gray-800 transition-colors">
                                Add New Consignee Info.
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-gray-300">
                        <FileUpload label="ROT Form" fileName={documents.rotForm?.name} onChange={(e) => handleFileChange(e, "rotForm")} onRemove={() => setDocuments(prev => ({ ...prev, rotForm: null }))} />
                        <FileUpload label="Custom Form" fileName={documents.customForm?.name} onChange={(e) => handleFileChange(e, "customForm")} onRemove={() => setDocuments(prev => ({ ...prev, customForm: null }))} />
                        <FileUpload label="Packing List" fileName={documents.packingList?.name} onChange={(e) => handleFileChange(e, "packingList")} onRemove={() => setDocuments(prev => ({ ...prev, packingList: null }))} />
                        <FileUpload label="Other Document" fileName={documents.otherDoc?.name} onChange={(e) => handleFileChange(e, "otherDoc")} onRemove={() => setDocuments(prev => ({ ...prev, otherDoc: null }))} />
                    </div>

                    <div className="flex justify-end gap-4 pt-10">
                        <button type="button" onClick={() => navigate(-1)} className="bg-gray-200 text-gray-700 px-12 py-2.5 rounded-lg font-bold hover:bg-gray-300 transition-all">
                            Back
                        </button>
                        <button type="submit" className="bg-system-color text-white px-12 py-2.5 rounded-lg font-bold shadow-lg hover:bg-system-color-dark transition-all">
                            {isSubmitting ? "Processing..." : "Update Record"}
                        </button>
                    </div>
                </form>
            </div>
        </Layout>
    );
}

/* Sub-components using AddROTForm2 styling */

const InputField = ({ label, required, value, onChange, error, type, readOnly, min }) => (
    <div className="flex flex-col gap-1 relative pb-0">
        <div className="h-10 flex flex-col justify-end mb-1">
            <label className="text-sm font-semibold">{label} {required && <span className="text-red-500">*</span>}</label>
        </div>
        <input
            type={type || "text"}
            className={`p-3 rounded-xl border border-gray-200 ${readOnly ? "bg-gray-200" : "bg-white"} shadow-sm outline-none focus:ring-2 focus:ring-system-color`}
            value={value}
            onChange={onChange}
            readOnly={readOnly}
            min={min}
        />
        <AnimatePresence>
            {error && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[11px] text-red-600 font-medium leading-tight block">
                    {error}
                </motion.span>
            )}
        </AnimatePresence>
    </div>
);

const SelectField = ({ label, required, options, value, onChange, error }) => (
    <div className="flex flex-col gap-1 relative">
        <div className="h-10 flex flex-col justify-end mb-1">
            <label className="text-sm font-semibold">{label} {required && <span className="text-red-500">*</span>}</label>
        </div>
        <div className="relative w-full">
            <select
                className="p-3 pr-8 truncate w-full rounded-xl border border-gray-200 bg-white shadow-sm outline-none appearance-none"
                value={value}
                onChange={onChange}
            >
                <option value="">Select...</option>
                {options.map((opt, index) => {
                    const isObj = typeof opt === 'object';
                    return <option key={index} value={isObj ? opt.value : opt}>{isObj ? opt.label : opt}</option>;
                })}
            </select>
            <CircleChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
        <AnimatePresence>
            {error && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[11px] text-red-600 font-medium leading-tight mt-1">
                    {error}
                </motion.span>
            )}
        </AnimatePresence>
    </div>
);

const FileUpload = ({ label, onChange, fileName, onRemove }) => (
    <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold">{label}</label>
        <div className="relative group">
            <div className="p-3 rounded-xl border border-gray-200 bg-white flex justify-between items-center text-gray-400 cursor-pointer">
                <span className="truncate">{fileName || "Upload Doc"}</span>
                {fileName ? (
                    <button
                        type="button"
                        onClick={(e) => { e.preventDefault(); onRemove(); }}
                        className="text-red-500 hover:scale-110 transition-transform z-10"
                    >
                        <Trash2 size={18} />
                    </button>
                ) : (
                    <Upload size={18} />
                )}
            </div>
            {!fileName && (
                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={onChange}/>
            )}
        </div>
    </div>
);
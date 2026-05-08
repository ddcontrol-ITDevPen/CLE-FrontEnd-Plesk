import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../layout/Layout.jsx";
import { motion, AnimatePresence } from "framer-motion";
import { CircleChevronDown, Trash2, Upload } from "lucide-react";
import {toast, Toaster} from "sonner";
import {getCompanies, getCompanyById} from "../../../services/companyService.js";
import {registerBooking} from "../../../services/bookingService.js";
import {registerContainer} from "../../../services/containerService.js";
import {registerContainerAddress} from "../../../services/containerAddressService.js";
import {getUserById} from "../../../services/userService.js";
import {registerBookingDocument} from "../../../services/bookingDocumentService.js";

export function ALEAddROTForm2() {
    const navigate = useNavigate();
    const [prevData, setPrevData] = useState({});
    const [consignees, setConsignees] = useState([]);
    const [isConsigneesLoading, setIsConsigneesLoading] = useState(false);
    const [depots, setDepots] = useState([]);
    const [isDepots, setIsDepotsLoading] = useState(false);
    const [ports, setPorts] = useState([]);
    const [isPorts, setIsPortsLoading] = useState(false);
    const [hauliers, setHauliers] = useState([]);
    const [allCompanies, setAllCompanies] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        containerNo: "",
        containerType: "",
        containerSize: "",
        vgm: "",
        trailerType: "",
        consignee: "",
        depot: "",
        rotDate: "",
        addresses: [""]
    });

    const [containers, setContainers] = useState([formData]);
    const [documents, setDocuments] = useState({
        rotForm: null,
        customForm: null,
        packingList: null,
        otherDoc: null
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        const savedData = JSON.parse(localStorage.getItem("pendingROT") || "{}");
        setPrevData(savedData);
        const initializeData = async () => {
            const qty = parseInt(savedData.containerQuantity) || 1;
            const initialPort = savedData.portLocation || "";

            const initialHaulier = savedData.haulierChoice === "Single" ? savedData.haulier : "";
            const initialDepot = savedData.depotChoice === "Single" ? savedData.depot : "";

            const initialContainerData = {
                containerNo: "",
                containerType: savedData.containerType || "",
                containerSize: savedData.containerSize || "",
                vgm: savedData.vgm || "",
                trailerType: savedData.trailerType || "",
                consignee: savedData.consignee || "",
                depot: initialDepot,
                port: initialPort,
                haulier: initialHaulier,
                rotDate: savedData.rotDate || "",
                addresses: [""]
            };

            const initialContainers = Array.from({ length: qty }, () => ({
                ...initialContainerData,
                addresses: [""]
            }));

            setContainers(initialContainers);
            fetchData();
        };

        const fetchData = async () => {
            setIsConsigneesLoading(true);
            setIsDepotsLoading(true);
            setIsPortsLoading(true);
            try {
                const data = await getCompanies();
                if (Array.isArray(data)) {
                    setAllCompanies(data);
                    const consignee = data.filter(h => h.role === "Consignee").map(h => ({companyName: h.companyName, companyCode: h.companyCode}));
                    const depot = data.filter(h => h.role === "Depot").map(h => ({companyName: h.companyName, companyCode: h.companyCode}));
                    const port = data.filter(h => h.role === "Port").map(h => ({companyName: h.companyName, companyCode: h.companyCode}));
                    const haulier = data.filter(h => h.role === "Haulier").map(h => ({companyName: h.companyName, companyCode: h.companyCode}));
                    const savedData = JSON.parse(localStorage.getItem("pendingROT") || "{}");
                    const mType = savedData.movementType;

                    setConsignees(consignee);
                    setDepots(depot);
                    setPorts(port);
                    setHauliers(haulier);

                    setContainers(prevContainers => prevContainers.map(cont => {
                        const selectedCompany = data.find(c => c.companyCode === cont.consignee);
                        return {
                            ...cont,
                            addresses: selectedCompany ? [selectedCompany.address] : [""]
                        };
                    }));
                }
            } catch (error) {
                console.error("Failed to load information:", error);
                setConsignees([]);
                setDepots([]);
                setHauliers([]);
            } finally {
                setIsConsigneesLoading(false);
                setIsDepotsLoading(false);
            }
        };
        initializeData();
    }, []);

    // const isDepotRequired = (prevData.tripType !== "Pick-up" && prevData.movementType === "Import") ||
    //     (prevData.movementType === "Export" && prevData.tripType !== "Drop-off");

    const addContainer = () => {
        const firstContainer = containers[0];
        const newContainer = {
            ...firstContainer,
            containerNo: "",
            addresses: [...firstContainer.addresses]
        }
        setContainers([...containers, newContainer]);
    };

    const removeContainer = (index) => {
        setContainers(containers.filter((_, i) => i !== index));
    };

    const addAddress = (contIndex) => {
        const newContainers = [...containers];
        newContainers[contIndex].addresses.push("");
        setContainers(newContainers);
    };

    const removeAddress = (contIndex, addrIndex) => {
        const newContainers = [...containers];
        newContainers[contIndex].addresses = newContainers[contIndex].addresses.filter((_, i) => i !== addrIndex);
        setContainers(newContainers);
    };

    const handleInputChange = (contIndex, field, value) => {
        const newContainers = [...containers];
        newContainers[contIndex][field] = value;

        // Auto-fill logic: If "Consignee" changes, update only the first address
        if (field === "consignee") {
            const selectedCompany = allCompanies.find(c => c.companyCode === value);
            if (selectedCompany) {
                newContainers[contIndex].addresses[0] = selectedCompany.address;
            } else {
                newContainers[contIndex].addresses[0] = "";
            }
        }
        setContainers(newContainers);
    };

    const handleAddressChange = (contIndex, addrIndex, value) => {
        const newContainers = [...containers];
        newContainers[contIndex].addresses[addrIndex] = value;
        setContainers(newContainers);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};

        containers.forEach((container, index) => {
            if (!container.containerNo) {
                newErrors[`${index}-containerNo`] = "Container number is required";
            }
            if (container.containerNo.length > 12) {
                newErrors[`${index}-containerNo`] = "Container number cannot be more than 12 characters";
            }
            if (!container.containerType) {
                newErrors[`${index}-containerType`] = "Container type is required";
            }
            if (!container.containerSize) {
                newErrors[`${index}-containerSize`] = "Container size is required";
            }
            if (!container.consignee) {
                newErrors[`${index}-consignee`] = "Consignee name is required";
            }
            if (!container.depot) {
                newErrors[`${index}-depot`] = "Depot name is required";
            }
            if (!container.haulier) {
                newErrors[`${index}-haulier`] = "Haulier name is required";
            }
            if (!container.rotDate)
                newErrors[`${index}-rotDate`] = "ROT Date is required!";
        });


        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            toast.error("Please fill in all required fields");
            return;
        }

        setIsSubmitting(true);
        try {
            const userData = await getUserById(localStorage.getItem("userId"));
            const companyCode = await userData.companyCode;
            const formattedEta = prevData.eta ? new Date(prevData.eta).toISOString().split('T')[0] : null;
            const bookingPayload = {
                rotNumber: prevData.rotNumber,
                blOrBookingNumber: prevData.bookingNumber,
                houseBLNumber: prevData.houseBLNumber, 
                movementType: prevData.movementType,
                tripType: prevData.tripType,
                scn: prevData.scn,
                vesselName: prevData.vesselName,
                portLocation: prevData.portLocation,
                eta: prevData.eta,
                commodity: prevData.commodity,
                specialHandling: prevData.specialHandling,
                sealNumber: prevData.sealNo,
                forwardingRemarks: prevData.forwardingRemarks,
                forwardingId: companyCode,
                shippingAgentId: prevData.shippingAgent,
                billingParty: prevData.billingParty,
                customFormNo: prevData.customFormNo || "",
                customReceiptNo: prevData.customReceiptNo || "",
                dicNumber: prevData.dicNumber || "",
                zbNumber: prevData.zbNumber || "",
                containerQuantity: prevData.containerQuantity || "",
            };
            console.log(bookingPayload);

            const savedBooking = await registerBooking(bookingPayload);
            const rotNumber = savedBooking.rotNumber;

            const docTypes = {
                rotForm: "ROT Form",
                customForm: "Custom Form",
                packingList: "Packing List",
                otherDoc: "Other Document"
            };

            for (const [key, file] of Object.entries(documents)) {
                if (file) {
                    const docFormData = new FormData();
                    docFormData.append("DocumentType", key);
                    docFormData.append("ROTNumber", prevData.rotNumber);
                    docFormData.append("FileName", file.name);
                    docFormData.append("File", file);
                    await registerBookingDocument(docFormData);
                }
            }

            for (const cont of containers) {
                const formattedRotDate = cont.rotDate ? new Date(cont.rotDate).toISOString().split('T')[0] : null;
                const containerPayload = {
                    ContainerNumber: cont.containerNo,
                    ContainerType: cont.containerType,
                    ContainerSize: cont.containerSize,
                    VGM: cont.vgm === "" ? null : cont.vgm,
                    TrailerType: cont.trailerType || null,
                    ConsigneeId: cont.consignee,
                    DepotId: cont.depot || null,
                    PortId: cont.port || null,
                    HaulierId: cont.haulier || null,
                    ROTDate: formattedRotDate,
                    Status: "Assigned",
                    AssignedTime: new Date().toISOString(),
                    ROTNumber: prevData.rotNumber,
                    ToAddress: cont.addresses
                        .filter(addr => addr.trim() !== "")
                        .map(addr => ({ Address: addr }))
                };
                console.log(containerPayload);

                const savedContainer = await registerContainer(containerPayload);

                // if (cont.addresses && cont.addresses.length > 0) {
                //     for (const addr of cont.addresses) {
                //         if (addr.trim() !== "") {
                //             await registerContainerAddress({
                //                 containerId: savedContainer.containerId,
                //                 address: addr
                //             });
                //         }
                //     }
                // }
            }

            toast.success("ROT Booking and all containers saved successfully!");
            localStorage.removeItem("pendingROT");
            setTimeout(() => navigate("/ale/forwarding/rot/history"), 2000);
        } catch (error) {
            console.error("Save failed:", error);
            if (error.response && error.response.data) {
                console.log("Backend Validation Errors:", error.response.data);
            }
            setIsSubmitting(false);
            toast.error(error.response?.data?.message || "Failed to save record. Please check your connection.");
        }
    };

    const handleFileChange = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            setDocuments(prev => ({
                ...prev,
                [type]: file
            }));
        }
    };

    const date = new Date();
    date.setDate(date.getDate() - 1);
    const yesterday = date.toISOString().split('T')[0];

    return (<Layout role="forwarder">
            <Toaster position="top-right" richColors />
            <div className="max-w-6xl">
                <h1 className="text-3xl font-bold text-text-heading mb-8 uppercase">Create New ROT - Forwarding</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <h2 className="text-2xl font-bold">
                        Container Information
                        <span className="text-lg ml-2 font-normal">{`(${prevData.movementType})` }</span>
                    </h2>

                    {containers.map((container, cIdx) => (
                        <div
                            key={cIdx}
                            className={`p-5 rounded-2xl transition-colors ${cIdx % 2 !== 0 ? "bg-gray-100" : "bg-white border border-gray-100"}`}
                        >
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="font-bold text-lg">Container {cIdx + 1}</h3>
                                {cIdx > 0 && (
                                    <button type="button" onClick={() => removeContainer(cIdx)} className="text-red-500 hover:text-red-700">
                                        <Trash2 size={20} />
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                <InputField label="Container No." subLabel="4 alphabets & 7 numbers" required value={container.containerNo} onChange={(e) => handleInputChange(cIdx, "containerNo", e.target.value)} error={errors[`${cIdx}-containerNo`]} />
                                <SelectField label="Container Type" required options={["GP", "RF", "HC"]} value={container.containerType} onChange={(e) => handleInputChange(cIdx, "containerType", e.target.value)} error={errors[`${cIdx}-containerType`]} />
                                <SelectField label="Container Size" required options={["20", "40", "45"]} value={container.containerSize} onChange={(e) => handleInputChange(cIdx, "containerSize", e.target.value)} error={errors[`${cIdx}-containerSize`]} />
                                <InputField label="VGM" value={container.vgm} onChange={(e) => handleInputChange(cIdx, "vgm", e.target.value)} />

                                <SelectField label="Trailer Type" options={["Normal", "Tipper", "Air", "SL"]} value={container.trailerType} onChange={(e) => handleInputChange(cIdx, "trailerType", e.target.value)} />

                                <SelectField
                                    label="Consignee/Shipper"
                                    required
                                    options={consignees.map(t => ({label: t.companyName, value: t.companyCode}))}
                                    value={container.consignee}
                                    onChange={(e) => handleInputChange(cIdx, "consignee", e.target.value)}
                                    error={errors[`${cIdx}-consignee`]}
                                />

                                <SelectField
                                    label="Haulier"
                                    required
                                    options={hauliers.map(t => ({label: t.companyName, value: t.companyCode}))}
                                    value={container.haulier}
                                    onChange={(e) => handleInputChange(cIdx, "haulier", e.target.value)}
                                    error={errors[`${cIdx}-haulier`]}
                                />
                                
                                <SelectField label="Depot" name="depot" value={container.depot} onChange={(e) => handleInputChange(cIdx, "depot", e.target.value)} options={depots.map(d => ({label: d.companyName, value: d.companyCode}))} error={errors[`${cIdx}-depot`]} required />
                                <InputField label="Port" required value={allCompanies.find(c => c.companyCode === container.port)?.companyName || container.port || ""} onChange={(e) => handleInputChange(cIdx, "port", e.target.value)} readOnly/>
                                <InputField label="ROT Date" name="rotDate" type="date" value={container.rotDate} onChange={(e) => handleInputChange(cIdx, "rotDate", e.target.value)} error={errors[`${cIdx}-rotDate`]} required placeholder="(DD/MM/YYYY)" min={yesterday} max="2099-12-31" />
                            </div>

                            <div className="mt-6 space-y-4">
                                {container.addresses.map((addr, aIdx) => (
                                    <div key={aIdx} className="flex items-end gap-4">
                                        <div className="flex-1">
                                            <label className="text-sm font-semibold mb-1 block">Consignee Address</label>
                                            <textarea
                                                className="w-full p-3 rounded-xl border border-gray-200 bg-white min-h-[100px] outline-none focus:ring-2 focus:ring-system-color"
                                                value={addr}
                                                onChange={(e) => handleAddressChange(cIdx, aIdx, e.target.value)}
                                                readOnly={aIdx === 0}
                                            />
                                        </div>
                                        {aIdx > 0 && (
                                            <button type="button" onClick={() => removeAddress(cIdx, aIdx)} className="mb-4 text-red-500">
                                                <Trash2 size={20} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => addAddress(cIdx)}
                                    className="bg-gray-700 text-white px-6 py-2 rounded-lg font-bold text-sm shadow-md"
                                >
                                    Add New Consignee Info.
                                </button>
                            </div>
                        </div>
                    ))}

                    <button
                        type="button"
                        onClick={addContainer}
                        className="bg-gray-700 text-white px-8 py-3 rounded-lg font-bold shadow-lg block"
                    >
                        Add New Container
                    </button>

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
                            {isSubmitting ? "Processing..." : "Submit"}
                        </button>
                    </div>
                </form>
            </div>
        </Layout>
    );
}

const InputField = ({ label, subLabel, required, value, onChange, error, type, readOnly, min, max }) => (
    <div className="flex flex-col gap-1 relative pb-0">
        <div className="h-10 flex flex-col justify-end mb-1">
            <label className="text-sm font-semibold">{label}
                {required && <span className="text-red-500">*</span>}</label>
            {subLabel && (
                <span className="ml-1 text-xs font-normal italic text-gray-400">
                    ({subLabel})
                </span>
            )}
        </div>
        <input type={type} className={`p-3 rounded-xl border border-gray-200 ${readOnly ? "bg-gray-200" : "bg-white"} shadow-sm outline-none focus:ring-2 focus:ring-system-color`} value={value} onChange={onChange} readOnly={readOnly} min={min} max={max} />
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
            <select className="p-3 pr-8 truncate w-full rounded-xl border border-gray-200 bg-white shadow-sm outline-none appearance-none" value={value} onChange={onChange}>
                <option value="">Select...</option>
                {options.map((opt, index) => {
                    const isObj = typeof opt === 'object';
                    const val = isObj ? opt.value : opt;
                    const lab = isObj ? opt.label : opt;
                    return (<option key={index} value={val}>{lab}</option>);})}
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
                        onClick={(e) => {
                            e.preventDefault();
                            onRemove();
                        }}
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


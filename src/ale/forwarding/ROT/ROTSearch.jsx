import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../layout/Layout.jsx";
import { Search, FilePlus, AlertCircle, ArrowRight, FileText, Lock } from "lucide-react";
import { toast, Toaster } from "sonner";
import {getAleBookings} from "../../../services/aleBookingService.js";

export function SearchROT() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [searchStatus, setSearchStatus] = useState(null);
    const [searchFields, setSearchFields] = useState({
        awbNumber: "",
        houseAWBNumber: ""
    });
    const [errors, setErrors] = useState({});

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSearchFields(prev => ({ ...prev, [name]: value.trim() }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
        if (searchStatus) setSearchStatus(null);
    };

    const handleSearchSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};

        if (!searchFields.awbNumber) newErrors.awbNumber = "AWB Number is required to look up records";
        if (!searchFields.houseAWBNumber) newErrors.houseAWBNumber = "House AWB Number is required";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            setIsLoading(true);
            setSearchStatus(null);

            const data = await getAleBookings();
            if (!Array.isArray(data)) {
                setSearchStatus("NOT_FOUND");
                return;
            }

            const baseMatches = data.filter(b =>
                b.awbNumber?.trim().toLowerCase() === searchFields.awbNumber.toLowerCase() &&
                b.houseAWBNumber?.trim().toLowerCase() === searchFields.houseAWBNumber.toLowerCase()
            );
            if (baseMatches.length === 0) {
                setSearchStatus("NOT_FOUND");
                return;
            }
            console.log(baseMatches);

            const pendingRecords = baseMatches.filter(b =>
                (b.terminalLocation === null || b.terminalLocation === "") &&
                b.airlineId === null &&
                (b.eta === null || b.eta === "0001-01-01") &&
                (b.customFormType === null || b.customFormType === "")
            );
            console.log(pendingRecords);

            if (pendingRecords.length > 0) {
                toast.success("Existing reference layout found! Prefilling form...");
                navigate("/ale/forwarding/rot/add/form1", {
                    state: {
                        isPreloadedRecord: true,
                        bookingData: pendingRecords[0]
                    }
                });
            } else {
                setSearchStatus("ALREADY_FILLED");
            }
        } catch (error) {
            console.error(error);
            if (error.response?.status === 404 || error.response?.data?.message?.toLowerCase().includes("not found")) {
                setSearchStatus("NOT_FOUND");
            } else {
                toast.error("An error occurred while cross-checking booking manifests");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateBlankForm = () => {
        navigate("/ale/forwarding/rot/add/form1", {
            state: {
                isPreloadedRecord: false,
                bookingData: {
                    awbNumber: searchFields.awbNumber,
                    houseAWBNumber: searchFields.houseAWBNumber
                }
            }
        });
    };

    return (
        <Layout role="forwarder">
            <Toaster richColors position="top-right" />
            <div className="max-w-2xl mx-auto pt-8">

                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-black text-gray-800 tracking-tight">Initiate ROT Form</h1>
                    <p className="text-gray-500 font-medium mt-2">
                        Enter required details below to check for existing bookings.
                    </p>
                </div>

                <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-100 border border-gray-100 p-8 space-y-6">
                    <form onSubmit={handleSearchSubmit} className="space-y-6">

                        {/* AWB Number Input Field */}
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-bold text-gray-700 tracking-wider flex items-center gap-2">
                                <FileText size={18} className="text-system-color" /> Master AWB Number <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="awbNumber"
                                placeholder="e.g. AWB-9920182"
                                value={searchFields.awbNumber}
                                onChange={handleInputChange}
                                className={`p-4 rounded-xl border bg-gray-50/50 outline-none font-bold uppercase tracking-wider transition-all ${
                                    errors.awbNumber ? 'border-red-500 ring-2 ring-red-100' : 'border-gray-200 hover:border-system-color focus:border-system-color'
                                }`}
                            />
                            {errors.awbNumber && <span className="text-xs text-red-500 font-bold mt-1 ml-1">{errors.awbNumber}</span>}
                        </div>

                        {/* House AWB Number Input Field */}
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-bold text-gray-700 tracking-wider flex items-center gap-2">
                                <FileText size={18} className="text-system-color" /> House AWB Number <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="houseAWBNumber"
                                placeholder="e.g. HAWB-88301"
                                value={searchFields.houseAWBNumber}
                                onChange={handleInputChange}
                                className={`p-4 rounded-xl border bg-gray-50/50 outline-none font-bold uppercase tracking-wider transition-all ${
                                    errors.houseAWBNumber ? 'border-red-500 ring-2 ring-red-100' : 'border-gray-200 hover:border-system-color focus:border-system-color'
                                }`}
                            />
                            {errors.houseAWBNumber && <span className="text-xs text-red-500 font-bold mt-1 ml-1">{errors.houseAWBNumber}</span>}
                        </div>

                        {/* Search Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-3 bg-system-color text-white py-4 rounded-xl font-bold shadow-lg hover:bg-system-color-dark transition-all disabled:opacity-60"
                        >
                            <Search size={20} />
                            {isLoading ? "Validating Booking..." : "Search Booking"}
                        </button>
                    </form>

                    {searchStatus === "NOT_FOUND" && (
                        <div className="mt-4 p-5 rounded-2xl bg-red-50 border border-red-200 text-left space-y-4 animate-fadeIn">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
                                <div>
                                    <h4 className="text-sm font-black text-red-800 uppercase tracking-wide">No Record Found</h4>
                                    <p className="text-xs text-red-600 font-medium mt-1 leading-relaxed">
                                        No active ROT layout exists matching AWB <span className="font-mono font-bold">"{searchFields.awbNumber}"</span> and HAWB <span className="font-mono font-bold">"{searchFields.houseAWBNumber}"</span>. You can establish a fresh profile manually.
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={handleCreateBlankForm}
                                className="w-full flex items-center justify-center gap-2 bg-white border border-red-300 hover:bg-red-100/50 text-red-700 font-bold py-3 px-4 rounded-xl text-xs transition-all shadow-sm"
                            >
                                <FilePlus size={16} /> Create New ROT Form with These Numbers <ArrowRight size={14} />
                            </button>
                        </div>
                    )}

                    {/* Condition 2: Record exists but details are already completed/locked */}
                    {searchStatus === "ALREADY_FILLED" && (
                        <div className="mt-4 p-5 rounded-2xl bg-amber-50 border border-amber-200 text-left space-y-2 animate-fadeIn">
                            <div className="flex items-start gap-3">
                                <Lock className="text-amber-600 shrink-0 mt-0.5" size={20} />
                                <div>
                                    <h4 className="text-sm font-black text-amber-800 uppercase tracking-wide">Record Locked / Already Completed</h4>
                                    <p className="text-xs text-amber-700 font-medium mt-1 leading-relaxed">
                                        A booking record for AWB <span className="font-mono font-bold">"{searchFields.awbNumber}"</span> and HAWB <span className="font-mono font-bold">"{searchFields.houseAWBNumber}"</span> already exists and has been fully processed by the forwarding agent.
                                    </p>
                                    <p className="text-xs text-amber-600/90 font-semibold mt-2 italic">
                                        Note: Existing manifest layouts cannot be re-edited once operational details (Terminal, Airline, ETA) are completely submitted.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
}
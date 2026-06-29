import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { ChartNoAxesCombined, CircleChevronDown } from "lucide-react";

const StatusInfographic = ({ containers }) => {
    const [isOpen, setIsOpen] = useState(false);
    const activeRole = (localStorage.getItem("role") || "").toLowerCase();
    const isPrivilegedRole = activeRole === "akps" || activeRole === "customs" || activeRole === "terminal";

    const maskText = (text) => {
        if (!text) return text;
        if (!isPrivilegedRole) {
            switch (text) {
                case "Examine-Both":
                    return "Approved-Complete";
                case "Examine-AKPS":
                    return "Approved-AKPS";
                case "Examine-Custom":
                    return "Approved-Custom";
                default:
                    return text.replace(/examine/gi, "Approved");
            }
        }
        return text;
    }

    const stats = useMemo(() => {
        const counts = {
            Assigned: 0,
            Enroute: 0,
            "Examine-Custom": 0,
            "Examine-AKPS": 0,
            "Examine-Both": 0,
            "Approved-Custom": 0,
            "Approved-AKPS": 0,
            "Approved-Complete": 0,
            "Rejected-Custom": 0,
            "Rejected-AKPS": 0,
            "Rejected-Both": 0,
            Accepted: 0,
            "Gate-In": 0,
            "Gate-Out": 0,
            Delivered: 0,
            RFC: 0,
            Rejected: 0,
            Deleted: 0,
        };
        containers.forEach(c => {
            const targetedStatus = maskText(c.status);
            if (counts.hasOwnProperty(maskText(targetedStatus))) {
                counts[targetedStatus]++;
            }
        });
        return counts;
    }, [containers, isPrivilegedRole]);

    return (
        <div className="mb-6">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-[#F7EAFF] to-[#ECFEFF] text-system-color-dark rounded-xl shadow-lg transition-all active:scale-[0.99]"
            >
                <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-lg">
                        <ChartNoAxesCombined size={22} />
                    </div>
                    <span className="font-bold text-xl tracking-wider">Container Status Overview</span>
                </div>
                <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
                    <CircleChevronDown size={24} />
                </motion.div>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden bg-white border-x border-b border-gray-100 rounded-b-xl shadow-md"
                    >
                        <div className="p-4">
                            <table className="w-full border-collapse border-gray-100 rounded-lg overflow-hidden">
                                <thead>
                                    <tr className="bg-gray-100 text-gray-600 text-xs uppercase">
                                        <th className="p-3 border">Assigned</th>
                                        <th className="p-3 border">Enroute</th>
                                        <th className="p-3 border">Approved-AKPS</th>
                                        <th className="p-3 border">Approved-Custom</th>
                                        <th className="p-3 border">Approved-Both</th>
                                        <th className="p-3 border">Gate In</th>
                                        <th className="p-3 border">Gate Out</th>
                                        <th className="p-3 border">Delivered</th>
                                        <th className="p-3 border">RFC</th>
                                        <th className="p-3 border">Rejected</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="text-center font-bold text-lg text-system-color">
                                        <td className="p-4 border bg-orange-50/30">{stats.Assigned}</td>
                                        <td className="p-4 border bg-amber-50/30">{stats.Enroute}</td>
                                        <td className="p-4 border bg-amber-50/30">{stats["Approved-AKPS"]}</td>
                                        <td className="p-4 border bg-amber-50/30">{stats["Approved-Custom"]}</td>
                                        <td className="p-4 border bg-amber-50/30">{stats["Approved-Complete"]}</td>
                                        <td className="p-4 border bg-blue-50/30">{stats["Gate-In"]}</td>
                                        <td className="p-4 border bg-indigo-50/30">{stats["Gate-Out"]}</td>
                                        <td className="p-4 border bg-emerald-50/30">{stats.Delivered}</td>
                                        <td className="p-4 border bg-teal-50/30">{stats.RFC}</td>
                                        <td className="p-4 border bg-teal-50/30">{stats.Rejected}</td>

                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default StatusInfographic;
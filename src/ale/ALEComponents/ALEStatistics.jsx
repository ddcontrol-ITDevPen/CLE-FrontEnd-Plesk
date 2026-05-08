import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { ChartNoAxesCombined, CircleChevronDown } from "lucide-react";

const StatusInfographic = ({ containers = [] }) => {
    const [isOpen, setIsOpen] = useState(false);

    const stats = useMemo(() => {
        const base = {
            "Drop-off": { Assigned: 0, EnRoute: 0, Accepted: 0, "Gate-in": 0, Reject: 0 },
            "Pick-up": { Assigned: 0, EnRoute: 0, Accepted: 0, "Gate-in": 0, Reject: 0 },
        };

        containers.forEach(c => {
            const type = c.type || "Drop-off"; // ensure matches your data
            const status = c.status;

            if (base[type] && base[type][status] !== undefined) {
                base[type][status]++;
            }
        });

        return base;
    }, [containers]);

    return (
        <div className="mb-6">
            {/* HEADER */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 bg-gray-100 rounded-xl"
            >
                <div className="flex items-center gap-3">
                    <ChartNoAxesCombined size={20} />
                    <span className="font-semibold text-lg">
                        Pre-Arrival Statistics
                    </span>
                </div>

                <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
                    <CircleChevronDown size={20} />
                </motion.div>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden bg-white border rounded-b-xl"
                    >
                        <div className="p-4">
                            {/* SUB HEADER */}
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-semibold text-gray-700">
                                    Pre-Arrival Analysis
                                </h3>

                                                          </div>

                            {/* TABLE */}
                            <table className="w-full border text-sm">
                                <thead className="bg-gray-100 text-gray-600">
                                <tr>
                                    <th className="p-3 border text-left">Type</th>
                                    <th className="p-3 border">Assigned</th>
                                    <th className="p-3 border">EnRoute</th>
                                    <th className="p-3 border">Accepted</th>
                                    <th className="p-3 border">Gate-in</th>
                                    <th className="p-3 border">Reject</th>
                                </tr>
                                </thead>

                                <tbody className="text-center">
                                <tr>
                                    <td className="p-3 border text-left">Drop-off</td>
                                    <td className="p-3 border text-blue-600 font-medium">{stats["Drop-off"].Assigned}</td>
                                    <td className="p-3 border text-blue-600">{stats["Drop-off"].EnRoute}</td>
                                    <td className="p-3 border text-blue-600">{stats["Drop-off"].Accepted}</td>
                                    <td className="p-3 border text-blue-600">{stats["Drop-off"]["Gate-in"]}</td>
                                    <td className="p-3 border text-blue-600">{stats["Drop-off"].Reject}</td>
                                </tr>

                                <tr>
                                    <td className="p-3 border text-left">Pick-up</td>
                                    <td className="p-3 border text-blue-600 font-medium">{stats["Pick-up"].Assigned}</td>
                                    <td className="p-3 border text-blue-600">{stats["Pick-up"].EnRoute}</td>
                                    <td className="p-3 border text-blue-600">{stats["Pick-up"].Accepted}</td>
                                    <td className="p-3 border text-blue-600">{stats["Pick-up"]["Gate-in"]}</td>
                                    <td className="p-3 border text-blue-600">{stats["Pick-up"].Reject}</td>
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
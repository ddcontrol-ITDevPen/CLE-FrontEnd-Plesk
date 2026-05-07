import React from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../layout/Layout.jsx";
import { motion } from "framer-motion";
import {
    Users,
    Truck,
    ChevronRight,
    Settings2, Caravan
} from "lucide-react";

export function HaulierManagement() {
    const navigate = useNavigate();

    const managementCards = [
        {
            title: "Driver Management",
            description: "Manage driver profiles.",
            icon: Users,
            path: "/haulier/manage/drivers",
            gradient: "from-slate-600 to-indigo-500",
            shadow: "shadow-indigo-200"
        },
        {
            title: "Prime Mover Management",
            description: "Track fleet vehicles/PM.",
            icon: Truck,
            path: "/haulier/manage/prime-movers",
            gradient: "from-slate-600 to-teal-500",
            shadow: "shadow-teal-200"
        },
        {
            title: "Trailer Management",
            description: "Control trailer inventory.",
            icon: Caravan,
            path: "/haulier/manage/trailers",
            gradient: "from-slate-600 to-rose-400",
            shadow: "shadow-rose-200"
        }
    ];

    return (
        <Layout role="haulier">
            <div className="spacy-y-6 mx-auto">
                {/* Header Section */}
                <div className="mb-12 gap-0">
                        {/*<div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">*/}
                        {/*    <Settings2 size={24} />*/}
                        {/*</div>*/}
                        <h1 className="text-2xl font-bold">
                            Asset Management
                        </h1>
                    <p className="text-gray-500 text-sm">
                        Configure and monitor your core resources.
                    </p>
                </div>

                {/* Big Button/Card Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {managementCards.map((card, index) => (
                        <motion.button
                            key={index}
                            whileHover={{ y: -10 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigate(card.path)}
                            className={`relative group text-left h-80 rounded-[2.5rem] overflow-hidden bg-white border border-gray-100 shadow-xl ${card.shadow} transition-all`}
                        >
                            <div className={`h-1/2 w-full bg-gradient-to-br ${card.gradient} p-8 flex items-start justify-between`}>
                                <div className="p-4 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 text-white">
                                    <card.icon size={32} />
                                </div>
                                <div className="bg-white/10 backdrop-blur-sm rounded-full p-2 text-white/80 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ChevronRight size={24} />
                                </div>
                            </div>

                            <div className="p-8 flex flex-col justify-between h-1/2">
                                <div>
                                    <h3 className="text-xl font-black text-gray-800 mb-2 group-hover:text-indigo-600 transition-colors">
                                        {card.title}
                                    </h3>
                                    <p className="text-sm text-gray-500 font-medium leading-relaxed">
                                        {card.description}
                                    </p>
                                </div>

                                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 group-hover:text-gray-600 transition-colors">
                                    Manage Assets <ChevronRight size={14} />
                                </div>
                            </div>

                            <div className="absolute -bottom-6 -right-6 text-gray-50 group-hover:text-gray-100 transition-colors">
                                <card.icon size={120} strokeWidth={1} />
                            </div>
                        </motion.button>
                    ))}
                </div>
            </div>
        </Layout>
    );
}
import React from "react";
import {ClipboardCheck, Truck, LogIn, LogOut, CheckCircle2, PackageCheck, XCircle, Trash2, Check} from "lucide-react";

const ShipmentLog = (data) => {
    // Timeline statuses in reverse order
    const timeline = [
        {label: "Drop-off RFC", time: data.rtRFCTime},
        {label: "Drop-off Delivered", time: data.rtDeliveredTime},
        {label: "Drop-off Gated Out", time: data.rtGatedOutTime},
        {label: "Drop-off Gated In", time: data.rtGatedInTime},
        {label: "Drop-off Accepted", time: data.rtAcceptedTime},
        {label: "Drop-off Enroute", time: data.rtEnrouteTime},
        {label: "Drop-off Assigned", time: data.rtAssignedTime},
        {label: "Rejected", time: data.rejectedTime},
        {label: "Deleted", time: data.deletedTime},
        {label: "RFC", time: data.rfcTime},
        {label: "Delivered", time: data.deliveredTime},
        {label: "Gated Out", time: data.gatedOutTime},
        {label: "Gated In", time: data.gatedInTime},
        {label: "Accepted", time: data.acceptedTime},
        {label: "Enroute", time: data.enrouteTime},
        {label: "Assigned", time: data.assignedTime},
    ].filter(t => t.time);

    const getStatusStyles = (label) => {
        const lowerLabel = label.toLowerCase();

        if (lowerLabel.includes("assigned"))
            return { icon: <ClipboardCheck size={14} />, color: "bg-assigned", text: "text-assigned" };
        if (lowerLabel.includes("enroute"))
            return { icon: <Truck size={14} />, color: "bg-enroute", text: "text-enroute" };
        if (lowerLabel.includes("accepted"))
            return { icon: <Check size={14} />, color: "bg-accepted", text: "text-enroute" };
        if (lowerLabel.includes("gate in"))
            return { icon: <LogIn size={14} />, color: "bg-gate-in-out", text: "gate-in-out" };
        if (lowerLabel.includes("gate out"))
            return { icon: <LogOut size={14} />, color: "bg-gate-in-out", text: "gate-in-out" };
        if (lowerLabel.includes("delivered"))
            return { icon: <CheckCircle2 size={14} />, color: "bg-delivered-rfc", text: "text-delivered-rfc" };
        if (lowerLabel.includes("rfc"))
            return { icon: <PackageCheck size={14} />, color: "bg-delivered-rfc", text: "text-delivered-rfc" };
        if (lowerLabel.includes("rejected"))
            return { icon: <XCircle size={14} />, color: "bg-red-300", text: "text-red-300" };
        if (lowerLabel.includes("deleted"))
            return { icon: <Trash2 size={14} />, color: "bg-red-300", text: "text-red-300" };

        return { icon: <CheckCircle2 size={14} />, color: "bg-blue-400", text: "text-blue-400" };
    };

    return (
        <div className="bg-card-color p-8 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-system-color font-bold mb-8 uppercase tracking-wider">Log of Shipment</h3>
            <div className="relative pl-8 border-l-2 border-blue-100 ml-4 space-y-10">
                {timeline.map((step, idx) => {
                    const styles = getStatusStyles(step.label);
                    return(
                    <div key={idx} className="relative">
                        {/* Icon Container */}
                        <div className={`absolute -left-[50px] top-0 w-8 h-8 rounded-full border-4 border-white shadow-md flex items-center justify-center text-white z-10 
                                ${styles.color} ${idx === 0 ? "ring-3 ring-opacity-10 ring-blue-300" : ""}`}
                        >
                            {styles.icon}
                        </div>
                        
                        <div className="flex flex-col md:flex-row gap-2 md:gap-0">
                            <p className="text-lg font-semibold text-gray-800 w-30">
                                {step.label}
                            </p>
                            <div className="w-25">
                                <p className="text-sm text-gray-500 font-medium">
                                    {new Date(step.time).toLocaleDateString()}
                                </p>
                                <p className="text-xs text-gray-400">
                                    {new Date(step.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                                {data.status === "Deleted" && step.label === "Deleted" && (
                                    <div className="w-fit text-xs text-accent-danger font-bold italic mt-2 bg-red-50 p-2 rounded-lg border border-red-100">
                                        Reason: {data.deletedRemarks}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    );
                })}
                {timeline.length === 0 && <p className="text-gray-400 italic">No movement logs recorded yet.</p>}
            </div>
        </div>
    )
}

export default ShipmentLog;
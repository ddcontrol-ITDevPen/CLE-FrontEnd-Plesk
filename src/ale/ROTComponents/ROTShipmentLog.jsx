import React from "react";
import {
    ClipboardCheck,
    Truck,
    LogIn,
    LogOut,
    CheckCircle2,
    PackageCheck,
    XCircle,
    Trash2,
    Check,
    LucideTruck,
    History,
    User
} from "lucide-react";

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
        {label: "Gate-Out", time: data.gatedOutTime},
        {label: "Gate-In", time: data.gatedInTime},
        {label: "Accepted", time: data.acceptedTime},
        {label: "Rejected-Both", time: data.rejectedBothTime},
        {label: "Rejected-AKPS", time: data.rejectedAKPSTime},
        {label: "Rejected-Custom", time: data.rejectedCustomTime},
        {label: "Approved-Complete", time: data.approvedBothTime},
        {label: "Approved-AKPS", time: data.approvedAKPSTime},
        {label: "Approved-Custom", time: data.approvedCustomTime},
        // {label: "Examine-Both", time: data.examineBothTime},
        // {label: "Examine-AKPS", time: data.examineAKPSTime},
        // {label: "Examine-Custom", time: data.examineCustomTime},
        {label: "Enroute", time: data.enrouteTime},
        {label: "Assigned", time: data.assignedTime},
    ].filter(t => t.time);

    const auditLogs = [...(data.updateHistory || [])].sort((a, b) =>
        new Date(b.updatedTime) - new Date(a.updatedTime)
    );
    
    const getStatusStyles = (label) => {
        const lowerLabel = label.toLowerCase();

        if (lowerLabel.includes("assigned"))
            return { icon: <ClipboardCheck size={16} />, color: "bg-assigned", text: "text-assigned" };
        if (lowerLabel.includes("enroute"))
            return { icon: <Truck size={16} />, color: "bg-enroute", text: "text-enroute" };
        if (lowerLabel.includes("accepted"))
            return { icon: <Check size={16} />, color: "bg-accepted", text: "text-enroute" };
        if (lowerLabel.includes("gate-in"))
            return { icon: <LogIn size={16} />, color: "bg-gate-in-out", text: "gate-in-out" };
        if (lowerLabel.includes("gate-out"))
            return { icon: <LogOut size={16} />, color: "bg-gate-in-out", text: "gate-in-out" };
        if (lowerLabel.includes("delivered"))
            return { icon: <CheckCircle2 size={16} />, color: "bg-delivered-rfc", text: "text-delivered-rfc" };
        if (lowerLabel.includes("rfc"))
            return { icon: <PackageCheck size={16} />, color: "bg-delivered-rfc", text: "text-delivered-rfc" };
        if (lowerLabel.includes("rejected"))
            return { icon: <XCircle size={16} />, color: "bg-red-300", text: "text-red-300" };
        if (lowerLabel.includes("deleted"))
            return { icon: <Trash2 size={16} />, color: "bg-red-300", text: "text-red-300" };

        return { icon: <CheckCircle2 size={16} />, color: "bg-blue-400", text: "text-blue-400" };
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start w-full">
            <div className="bg-card-color p-8 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-system-color font-bold mb-8 uppercase tracking-wider flex items-center gap-2"><History size={18} />Log of Audit</h3>
                <div className="max-h-[600px] min-h-[200px] overflow-y-auto overflow-x-hidden pr-4 scrollbar-thin scrollbar-thumb-slate-200 pl-12 relative">
                    <div className="absolute left-[30px] top-0 bottom-0 w-0.5 bg-blue-100"></div>
                    <div className="space-y-10">
                    {auditLogs.map((log, idx) => (
                        <div key={idx} className="relative">
                            <div className="absolute -left-[33px] top-0 w-8 h-8 rounded-full border-4 border-white shadow-sm flex items-center justify-center text-white z-auto bg-slate-400">
                                <User size={12} />
                            </div>

                            <div className="flex flex-col ml-3">
                                <p className="text-sm font-bold text-slate-700">
                                    {log.updatedBy || "System User"}
                                </p>
                                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                    Modified: <span className="font-medium text-slate-600">{log.action || "Record updated"}</span>
                                </p>
                                <div className="mt-2 flex items-center gap-3">
                                    <span className="text-[11px] px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full border border-slate-200">
                                        {new Date(log.updatedTime).toLocaleDateString()}
                                    </span>
                                    <span className="text-[11px] text-slate-400">
                                        {new Date(log.updatedTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                    </div>
                    {auditLogs.length === 0 && <p className="text-slate-400 italic text-sm">No audit history available.</p>}
                </div>
            </div>
            <div className="bg-card-color p-8 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-system-color font-bold mb-8 uppercase tracking-wider flex items-center gap-2"><LucideTruck size={18} />Log of Shipment</h3>
                <div className="max-h-[600px] min-h-[200px] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-slate-200 pl-12 relative">
                    <div className="absolute left-[30px] top-1 bottom-10 w-0.5 bg-blue-100"></div>
                    <div className="space-y-10">
                    {timeline.map((step, idx) => {
                        const styles = getStatusStyles(step.label);
                        return(
                            <div key={idx} className="relative">
                                {/* Icon Container */}
                                <div className={`absolute -left-[33px] top-1 w-8 h-8 rounded-full border-4 border-white shadow-md flex items-center justify-center text-white z-auto 
                                ${styles.color} ${idx === 0 ? "ring-3 ring-opacity-100 ring-blue-500" : ""}`}
                                >
                                    {styles.icon}
                                </div>

                                <div className="flex flex-col md:flex-row pt-1 gap-2 md:gap-0 ml-3">
                                    <p className="text-lg font-semibold text-gray-800 w-30">
                                        {step.label}
                                    </p>
                                    <div className="w-55">
                                        <p className="text-sm text-gray-500 font-medium">
                                            {new Date(step.time).toLocaleDateString()}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {new Date(step.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                        {data.status === "Deleted" && step.label === "Deleted" && (
                                            <div className="w-fit text-xs text-accent-danger font-bold italic mt-2 bg-red-50 p-2 rounded-lg border border-red-100">
                                                Reason: {data.deletedRemarks || "N/A"}
                                            </div>
                                        )}
                                        {data.status === "Rejected" && step.label === "Rejected" && (
                                            <div className="w-fit text-xs text-accent-danger font-bold italic mt-2 bg-red-50 p-2 rounded-lg border border-red-100">
                                                Reason: {data.rejectedRemarks || "N/A"}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    </div>
                    {timeline.length === 0 && <p className="text-gray-400 italic">No movement logs recorded yet.</p>}
                </div>
            </div>
        </div>
    )
}

export default ShipmentLog;
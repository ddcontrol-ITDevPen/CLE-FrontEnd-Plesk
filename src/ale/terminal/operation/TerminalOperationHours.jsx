import React, { useState, useEffect } from 'react';
import { Trash2, Settings, ShoppingCart, User, LayoutDashboard, History, FilePlus, LogOut } from 'lucide-react';
import { getTerminalScheduleByTerminalId, saveTemplate } from "../../../services/aleTerminalScheduleService.js";
import { getUserById } from "../../../services/userService.js";
import Layout from "../../layout/Layout.jsx";
import { toast, Toaster } from "sonner";

const DAYS_OF_WEEK = [
    { key: 'Mon', label: 'Monday:' },
    { key: 'Tue', label: 'Tuesday:' },
    { key: 'Wed', label: 'Wednesday:' },
    { key: 'Thu', label: 'Thursday:' },
    { key: 'Fri', label: 'Friday:' },
    { key: 'Sat', label: 'Saturday:' },
    { key: 'Sun', label: 'Sunday:' }
];

export function TerminalOperationHours() {
    const [schedule, setSchedule] = useState({
        terminalId: '',
        maximumPickUpSlots: '',
        maximumDropOffSlots: '',
        autoAcceptMinutes: '',
        autoRejectMinutes: '',

        MonStart: '', MonEnd: '', MonBreakStart: '', MonBreakEnd: '',
        TueStart: '', TueEnd: '', TueBreakStart: '', TueBreakEnd: '',
        WedStart: '', WedEnd: '', WedBreakStart: '', WedBreakEnd: '',
        ThuStart: '', ThuEnd: '', ThuBreakStart: '', ThuBreakEnd: '',
        FriStart: '', FriEnd: '', FriBreakStart: '', FriBreakEnd: '',
        SatStart: '', SatEnd: '', SatBreakStart: '', SatBreakEnd: '',
        SunStart: '', SunEnd: '', SunBreakStart: '', SunBreakEnd: ''
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [changeRemarks, setChangeRemarks] = useState('');
    const [isUpdate, setIsUpdate] = useState(false);

    useEffect(() => {
        async function fetchExistingSettings() {
            try {
                const user = await getUserById(localStorage.getItem("userId"));
                const terminalId = user.companyCode;
                setSchedule(prev => ({ ...prev, terminalId: terminalId }));
                const data = await getTerminalScheduleByTerminalId(terminalId)
                if (data) {
                    setIsUpdate(true);
                    const lowerCasedData = Object.keys(data).reduce((acc, originalKey) => {
                        acc[originalKey.toLowerCase()] = data[originalKey];
                        return acc;
                    }, {});
                    const sanitisedData = Object.keys(schedule).reduce((acc, stateKey) => {
                        let value = lowerCasedData[stateKey.toLowerCase()];
                        if (['maximumPickUpSlots', 'maximumDropOffSlots', 'autoAcceptMinutes', 'autoRejectMinutes'].includes(stateKey)) {
                            if (value === 0 || value === '0') {
                                value = '';
                            }
                        }
                        if (value !== undefined) {
                            acc[stateKey] = value ?? '';
                        }
                        return acc;
                    }, {});
                    setSchedule(prev => ({ ...prev, ...sanitisedData }));
                }
            } catch (error) {
                if (error.response && error.response.status === 404) {
                    console.log("No existing settings found for this terminal. Starting fresh.");
                    setIsUpdate(false);
                    return;
                }
                console.error("Error loading terminal schedule metadata:", error);
                toast.error("Failed to load existing terminal schedule configuration.");
            }
        }
        fetchExistingSettings();
    }, []);

    const handleInputChange = (field, value) => {
        setSchedule(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleClearOperatingHours = (dayPrefix) => {
        setSchedule(prev => ({
            ...prev,
            [`${dayPrefix}Start`]: '',
            [`${dayPrefix}End`]: '',
            [`${dayPrefix}BreakStart`]: '',
            [`${dayPrefix}BreakEnd`]: ''
        }));
    };

    const handleClearBreakHours = (dayPrefix) => {
        setSchedule(prev => ({
            ...prev,
            [`${dayPrefix}BreakStart`]: '',
            [`${dayPrefix}BreakEnd`]: ''
        }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        const payload = {
            ...schedule,
            maximumPickUpSlots: parseInt(schedule.maximumPickUpSlots || 0, 10),
            maximumDropOffSlots: parseInt(schedule.maximumDropOffSlots || 0, 10),
            autoAcceptMinutes: parseInt(schedule.autoAcceptMinutes || 0, 10),
            autoRejectMinutes: parseInt(0),
            changeRemarks: changeRemarks
        };

        try {
            await saveTemplate(payload);
            toast.success('Operational rules template updated. Next 30 days of slots initialized successfully!');
        } catch (err) {
            console.error("Save schedule error:", err);
            const backendErrorMsg = err.response?.data?.message || err.message;
            toast.error(backendErrorMsg || 'Network exception error communicating with .NET runtime service.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout role="terminal">
            <Toaster richColors position="top-right" />
            <div className="max-w-5xl w-full mx-auto">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Operational Time</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Manage your operational time for the truckers</p>
                </div>

                {message.text && (
                    <div className={`p-4 rounded-xl mb-6 text-sm font-medium ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-8">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 mb-6 border-b border-slate-100 pb-2">Set Operational Time</h2>
                        <div className="grid grid-cols-12 gap-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-2">
                            <div className="col-span-2">Day</div>
                            <div className="col-span-5 grid grid-cols-2 gap-2">
                                <div>Start Time</div>
                                <div>End Time</div>
                            </div>
                            <div className="col-span-5 grid grid-cols-2 gap-2 pl-4">
                                <div>Break Start Time</div>
                                <div>Break End Time</div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {DAYS_OF_WEEK.map((day) => (
                                <div key={day.key} className="grid grid-cols-12 gap-4 items-center bg-slate-50 hover:bg-slate-100/70 p-2 rounded-xl transition">
                                    <div className="col-span-2 font-semibold text-slate-700 text-sm pl-2">{day.label}</div>

                                    <div className="col-span-5 grid grid-cols-2 gap-2 items-center relative">
                                        <input
                                            type="time"
                                            className="bg-white border border-slate-200 rounded-lg p-2 text-sm focus:outline-none focus:border-blue-500 transition shadow-sm"
                                            value={schedule[`${day.key}Start`]}
                                            onChange={(e) => handleInputChange(`${day.key}Start`, e.target.value)}
                                            required={!!schedule[`${day.key}End`]}
                                        />
                                        <div className="relative flex items-center pr-7">
                                            <input
                                                type="time"
                                                className="w-full bg-white border border-slate-200 rounded-lg p-2 text-sm focus:outline-none focus:border-blue-500 transition shadow-sm"
                                                value={schedule[`${day.key}End`]}
                                                onChange={(e) => handleInputChange(`${day.key}End`, e.target.value)}
                                                required={!!schedule[`${day.key}Start`]}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleClearOperatingHours(day.key)}
                                                className="absolute right-1 p-1 text-slate-400 hover:text-rose-500 rounded transition"
                                                title="Clear entire day operations"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="col-span-5 grid grid-cols-2 gap-2 items-center pl-4 relative">
                                        <input
                                            type="time"
                                            className="bg-white border border-slate-200 rounded-lg p-2 text-sm focus:outline-none focus:border-blue-500 transition shadow-sm disabled:bg-slate-200/50 disabled:cursor-not-allowed"
                                            value={schedule[`${day.key}BreakStart`]}
                                            disabled={!schedule[`${day.key}Start`]}
                                            onChange={(e) => handleInputChange(`${day.key}BreakStart`, e.target.value)}
                                            required={!!schedule[`${day.key}BreakEnd`]}
                                        />
                                        <div className="relative flex items-center pr-7">
                                            <input
                                                type="time"
                                                className="w-full bg-white border border-slate-200 rounded-lg p-2 text-sm focus:outline-none focus:border-blue-500 transition shadow-sm disabled:bg-slate-200/50 disabled:cursor-not-allowed"
                                                value={schedule[`${day.key}BreakEnd`]}
                                                disabled={!schedule[`${day.key}Start`]}
                                                onChange={(e) => handleInputChange(`${day.key}BreakEnd`, e.target.value)}
                                                required={!!schedule[`${day.key}BreakStart`]}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleClearBreakHours(day.key)}
                                                disabled={!schedule[`${day.key}Start`]}
                                                className="absolute right-1 p-1 text-slate-400 hover:text-rose-500 rounded transition disabled:opacity-30"
                                                title="Clear break times"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h2 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">Time Slot Actions</h2>
                        <div className="grid grid-cols-2 gap-6 max-w-3xl">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Maximum Pick-up Slots:</label>
                                <input
                                    type="number"
                                    placeholder="e.g. 5"
                                    className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition shadow-sm"
                                    value={schedule.maximumPickUpSlots}
                                    onChange={(e) => handleInputChange('maximumPickUpSlots', e.target.value)}
                                    required
                                    min="1"
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Maximum Drop-off Slots:</label>
                                <input
                                    type="number"
                                    placeholder="e.g. 5"
                                    className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition shadow-sm"
                                    value={schedule.maximumDropOffSlots}
                                    onChange={(e) => handleInputChange('maximumDropOffSlots', e.target.value)}
                                    required
                                    min="1"
                                />
                            </div>

                            <div className="flex flex-col gap-1.5 relative">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Auto Accept In:</label>
                                <div className="relative flex items-center">
                                    <input
                                        type="number"
                                        placeholder="e.g. 30"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 pr-12 text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition shadow-sm"
                                        value={schedule.autoAcceptMinutes}
                                        onChange={(e) => handleInputChange('autoAcceptMinutes', e.target.value)}
                                        required
                                        min="1"
                                    />
                                    <span className="absolute right-4 text-xs font-bold text-slate-400 pointer-events-none">min</span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5 relative">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Auto Reject In:</label>
                                <div className="relative flex items-center">
                                    <input
                                        type="text"
                                        placeholder="e.g. 60"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 pr-12 text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition shadow-sm"
                                        value="12:00 AM Next Morning"
                                        onChange={(e) => handleInputChange('autoRejectMinutes', e.target.value)}
                                        required
                                        min="1"
                                        readOnly
                                    />
                                    <span className="absolute right-3 top-2.8 bg-red-100 text-red-700 text-xs font-bold px-2.5 py-1 rounded-lg">System Automated</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">Schedule Update Remark</h2>
                        <div className="max-w-3xl flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                Reason for Midway Change (Notifies Affected Truckers):
                                {isUpdate && <span className="text-red-500 ml-1">*</span>}
                            </label>
                            <textarea
                                placeholder="e.g., Terminal closing early on Wednesday for gate maintenance or public holidays."
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition shadow-sm h-24 resize-none"
                                value={changeRemarks}
                                onChange={(e) => setChangeRemarks(e.target.value)}
                                required={isUpdate}
                            />
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-system-color hover:bg-system-color-dark disabled:bg-blue-400 text-white font-bold px-8 py-3 rounded-xl shadow-md transition transform active:scale-95"
                        >
                            {loading ? 'Processing Optimization Rules...' : 'Save Configuration Settings'}
                        </button>
                    </div>
                </form>
            </div>
        </Layout>
    );
}
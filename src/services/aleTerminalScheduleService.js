import api from "./api.js";

const BASE_URL = "/aleTerminalSchedule";

export const getTerminalScheduleByTerminalId = async (id) => {
    const res = await api.get(`${BASE_URL}/${id}`);
    return res.data;
}

export const saveTemplate = async (terminalSchedule) => {
    const res = await api.post(`${BASE_URL}/save`, terminalSchedule);
    return res.data;
}
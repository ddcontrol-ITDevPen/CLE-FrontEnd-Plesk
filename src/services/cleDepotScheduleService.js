import api from "./api.js";

const BASE_URL = "/cleDepotSchedule";

export const getDepotScheduleByDepotId = async (id) => {
    const res = await api.get(`${BASE_URL}/${id}`);
    return res.data;
}

export const saveTemplate = async (depotSchedule) => {
    const res = await api.post(`${BASE_URL}/save`, depotSchedule);
    return res.data;
}
import api from "./api.js";

const BASE_URL = "/timeSlot";

export const getTimeSlots = async () => {
    const res = await api.get(BASE_URL);
    return res.data;
}

export const registerTimeSlot = async (timeSlot) => {
    const res = await api.post(`${BASE_URL}/register`, timeSlot);
    return res.data;
}

export const getTimeSlotById = async (id) => {
    const res = await api.get(`${BASE_URL}/${id}`);
    return res.data;
}

export const updateTimeSlot = async (id, timeSlot) => {
    const res = await api.put(`${BASE_URL}/update/${id}`, timeSlot);
    return res.data;
}

export const deleteTimeSlot = async (id) => {
    const res = await api.delete(`${BASE_URL}/delete/${id}`);
}
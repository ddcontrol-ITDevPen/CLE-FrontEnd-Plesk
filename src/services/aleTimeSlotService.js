import api from "./api.js";

const BASE_URL = "/aleTimeSlot";

export const getAleTimeSlots = async () => {
    const res = await api.get(BASE_URL);
    return res.data;
}

export const registerAleTimeSlot = async (timeSlot) => {
    const res = await api.post(`${BASE_URL}/register`, timeSlot);
    return res.data;
}

export const getAleTimeSlotById = async (id) => {
    const res = await api.get(`${BASE_URL}/${id}`);
    return res.data;
}

export const updateAleTimeSlot = async (id, timeSlot) => {
    const res = await api.put(`${BASE_URL}/update/${id}`, timeSlot);
    return res.data;
}

export const deleteAleTimeSlot = async (id) => {
    const res = await api.delete(`${BASE_URL}/delete/${id}`);
}
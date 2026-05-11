import api from "./api.js";

const BASE_URL = "/aleBooking";

export const getAleBookings = async () => {
    const res = await api.get(BASE_URL);
    return res.data;
}


export const registerAleBooking= async (booking) => {
    const res = await api.post(`${BASE_URL}/register`, booking);
    return res.data;
}

export const getAleBookingById = async (id) => {
    const res = await api.get(`${BASE_URL}/${id}`);
    return res.data;
}

export const updateAleBooking = async (id, booking) => {
    const res = await api.put(`${BASE_URL}/update/${id}`, booking);
    return res.data;
}

export const deleteAleBooking = async (id) => {
    const res = await api.delete(`${BASE_URL}/delete/${id}`);
}

export const getAllAleBookingsByForwarding = async (id) => {
    const res = await api.get(`${BASE_URL}/all/forwarding/${id}`);
    return res.data;
}

export const getAllAleBookingsByHaulier = async (id) => {
    const res = await api.get(`${BASE_URL}/all/haulier/${id}`);
    return res.data;
}
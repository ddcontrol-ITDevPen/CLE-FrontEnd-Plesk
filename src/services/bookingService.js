import api from "./api.js";

const BASE_URL = "/booking";

export const getBookings = async () => {
    const res = await api.get(BASE_URL);
    return res.data;
}

export const registerBooking= async (booking) => {
    const res = await api.post(`${BASE_URL}/register`, booking);
    return res.data;
}

export const getBookingById = async (id) => {
    const res = await api.get(`${BASE_URL}/${id}`);
    return res.data;
}

export const updateBooking = async (id, booking) => {
    const res = await api.put(`${BASE_URL}/update/${id}`, booking);
    return res.data;
}

export const deleteBooking = async (id) => {
    const res = await api.delete(`${BASE_URL}/delete/${id}`);
}

export const getAllBookingsByForwarding = async (id) => {
    const res = await api.get(`${BASE_URL}/all/forwarding/${id}`);
    return res.data;
}
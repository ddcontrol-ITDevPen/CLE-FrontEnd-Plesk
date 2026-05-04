import api from "./api.js";

const BASE_URL = "/driver";

export const getDrivers = async () => {
    const res = await api.get(BASE_URL);
    return res.data;
}

export const registerDriver = async (driver) => {
    const res = await api.post(`${BASE_URL}/register`, driver);
    return res.data;
}

export const getDriverById = async (id) => {
    const res = await api.get(`${BASE_URL}/${id}`);
    return res.data;
}

export const updateDriver = async (id, driver) => {
    const res = await api.put(`${BASE_URL}/update/${id}`, driver);
    return res.data;
}

export const deleteDriver = async (id) => {
    const res = await api.delete(`${BASE_URL}/delete/${id}`);
}
import api from "./api.js";

const BASE_URL = "/primeMover";

export const getPrimeMovers = async () => {
    const res = await api.get(BASE_URL);
    return res.data;
}

export const registerPrimeMover = async (primeMover) => {
    const res = await api.post(`${BASE_URL}/register`, primeMover);
    return res.data;
}

export const getPrimeMoverById = async (id) => {
    const res = await api.get(`${BASE_URL}/${id}`);
    return res.data;
}

export const updatePrimeMover = async (id, primeMover) => {
    const res = await api.put(`${BASE_URL}/update/${id}`, primeMover);
    return res.data;
}

export const deletePrimeMover = async (id) => {
    const res = await api.delete(`${BASE_URL}/delete/${id}`);
}
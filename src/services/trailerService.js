import api from "./api.js";

const BASE_URL = "/trailer";

export const getTrailers = async () => {
    const res = await api.get(BASE_URL);
    return res.data;
}

export const registerTrailer = async (trailer) => {
    const res = await api.post(`${BASE_URL}/register`, trailer);
    return res.data;
}

export const getTrailerById = async (id) => {
    const res = await api.get(`${BASE_URL}/${id}`);
    return res.data;
}

export const updateTrailer = async (id, trailer) => {
    const res = await api.put(`${BASE_URL}/update/${id}`, trailer);
    return res.data;
}

export const deleteTrailer = async (id) => {
    const res = await api.delete(`${BASE_URL}/delete/${id}`);
}
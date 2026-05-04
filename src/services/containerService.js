import api from "./api.js";

const BASE_URL = "/container";

export const getContainers = async () => {
    const res = await api.get(BASE_URL);
    return res.data;
}

export const registerContainer= async (container) => {
    const res = await api.post(`${BASE_URL}/register`, container);
    return res.data;
}

export const getContainerById = async (id) => {
    const res = await api.get(`${BASE_URL}/${id}`);
    return res.data;
}

export const updateContainer = async (id, container) => {
    const res = await api.put(`${BASE_URL}/update/${id}`, container);
    return res.data;
}

export const deleteContainer = async (id) => {
    const res = await api.delete(`${BASE_URL}/delete/${id}`);
}

export const getAllContainersByForwarding = async (id) => {
    const res = await api.get(`${BASE_URL}/all/forwarding/${id}`);
    return res.data;
}

export const getAllContainersByHaulier = async (id) => {
    const res = await api.get(`${BASE_URL}/all/haulier/${id}`);
    return res.data;
}
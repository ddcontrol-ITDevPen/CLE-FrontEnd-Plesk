import api from "./api.js";

const BASE_URL = "/aleAssignedHaulier";

export const getAleAssignedHauliers = async () => {
    const res = await api.get(BASE_URL);
    return res.data;
}

export const registerAleAssignedHaulier = async (assignedHaulier) => {
    const res = await api.post(`${BASE_URL}/register`, assignedHaulier);
    return res.data;
}

export const getAleAssignedHaulierById = async (id) => {
    const res = await api.get(`${BASE_URL}/${id}`);
    return res.data;
}

export const updateAleAssignedHaulier = async (id, assignedHaulier) => {
    const res = await api.put(`${BASE_URL}/update/${id}`, assignedHaulier);
    return res.data;
}

export const deleteAleAssignedHaulier = async (id) => {
    const res = await api.delete(`${BASE_URL}/delete/${id}`);
}

export const getAleAssignedHaulierByContainerId = async (id) => {
    const res = await api.get(`${BASE_URL}/container/${id}`);
    return res.data;
}
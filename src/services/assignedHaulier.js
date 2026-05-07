import api from "./api.js";

const BASE_URL = "/assignedHaulier";

export const getAssignedHauliers = async () => {
    const res = await api.get(BASE_URL);
    return res.data;
}

export const registerAssignedHaulier = async (assignedHaulier) => {
    const res = await api.post(`${BASE_URL}/register`, assignedHaulier);
    return res.data;
}

export const getAssignedHaulierById = async (id) => {
    const res = await api.get(`${BASE_URL}/${id}`);
    return res.data;
}

export const updateAssignedHaulier = async (id, assignedHaulier) => {
    const res = await api.put(`${BASE_URL}/update/${id}`, assignedHaulier);
    return res.data;
}

export const deleteAssignedHaulier = async (id) => {
    const res = await api.delete(`${BASE_URL}/delete/${id}`);
}

export const getAssignedHaulierByContainerId = async (id) => {
    const res = await api.get(`${BASE_URL}/container/${id}`);
    return res.data;
}
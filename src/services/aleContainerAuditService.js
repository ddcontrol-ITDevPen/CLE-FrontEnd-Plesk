import api from "./api.js";

const BASE_URL = "/aleContainerAudit";

export const getAleContainerAudits = async () => {
    const res = await api.get(BASE_URL);
    return res.data;
}

export const registerAleContainerAudit = async (containerAudit) => {
    const res = await api.post(`${BASE_URL}/register`, containerAudit);
    return res.data;
}

export const getAleContainerAuditById = async (id) => {
    const res = await api.get(`${BASE_URL}/${id}`);
    return res.data;
}

export const updateAleContainerAudit = async (id, containerAudit) => {
    const res = await api.put(`${BASE_URL}/update/${id}`, containerAudit);
    return res.data;
}

export const deleteAleContainerAudit = async (id) => {
    const res = await api.delete(`${BASE_URL}/delete/${id}`);
}
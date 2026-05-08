import api from "./api.js";

const BASE_URL = "/containerAudit";

export const getContainerAudits = async () => {
    const res = await api.get(BASE_URL);
    return res.data;
}

export const registerContainerAudit = async (containerAudit) => {
    const res = await api.post(`${BASE_URL}/register`, containerAudit);
    return res.data;
}

export const getContainerAuditById = async (id) => {
    const res = await api.get(`${BASE_URL}/${id}`);
    return res.data;
}

export const updateContainerAudit = async (id, containerAudit) => {
    const res = await api.put(`${BASE_URL}/update/${id}`, containerAudit);
    return res.data;
}

export const deleteContainerAudit = async (id) => {
    const res = await api.delete(`${BASE_URL}/delete/${id}`);
}